import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import prisma from '../../../../lib/prisma'
import { authOptions } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const body = await req.json().catch(() => ({}))
    const forceRecreate = body.forceRecreate || false

    // find active template for user
    const template = await prisma.routineTemplate.findFirst({ where: { userId, isActive: true }, include: { items: true } })
    console.log('Found template:', template?.id, 'with', template?.items.length, 'items')
    if (!template) return NextResponse.json({ error: 'No active template' }, { status: 404 })

    const today = new Date()
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate())

    // check if calendar day already exists for today
    let calendarDay = await prisma.calendarDay.findFirst({
      where: { userId, date: start },
      include: { instances: true }
    })

    // if forceRecreate, delete existing instances first
    if (calendarDay && forceRecreate) {
      await prisma.dayRoutineInstance.deleteMany({ where: { calendarDayId: calendarDay.id } })
    }

    // if not, create it
    if (!calendarDay) {
      calendarDay = await prisma.calendarDay.create({ data: { userId, date: start, templateId: template.id } })
    }

    // get existing instances for this day
    const existingInstances = await prisma.dayRoutineInstance.findMany({
      where: { calendarDayId: calendarDay.id }
    })

    // create instances from template items if they don't exist
    const instances = await Promise.all(template.items.sort((a,b)=>a.orderIndex-b.orderIndex).map(async (it) => {
      const exists = existingInstances.find(ei => ei.routineItemId === it.id)
      if (exists) {
        const needsStart = !exists.customStartTime && it.customStartTime
        const needsEnd = !exists.customEndTime && it.customEndTime
        if (needsStart || needsEnd) {
          return prisma.dayRoutineInstance.update({
            where: { id: exists.id },
            data: {
              customStartTime: exists.customStartTime || it.customStartTime,
              customEndTime: exists.customEndTime || it.customEndTime
            }
          })
        }
        return exists
      }
      
      return prisma.dayRoutineInstance.create({ data: { calendarDayId: calendarDay.id, routineItemId: it.id, customTitle: it.title, customWeight: it.defaultWeight, customRecommendedTime: it.recommendedTime, customStartTime: it.customStartTime, customEndTime: it.customEndTime, orderIndex: it.orderIndex } })
    }))

    // re-fetch calendar day with instances
    const updatedDay = await prisma.calendarDay.findUnique({
      where: { id: calendarDay.id },
      include: { instances: { include: { check: true } } }
    })

    console.log('Created/updated day:', updatedDay?.id, 'with', updatedDay?.instances.length, 'instances')
    console.log('Instances:', updatedDay?.instances.map(i => i.customTitle))

    return NextResponse.json({ calendarDay: updatedDay, instances })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
