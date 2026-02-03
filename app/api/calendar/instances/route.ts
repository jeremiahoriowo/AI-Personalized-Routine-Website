import prisma from '../../../../lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { calendarDayId, title, weight, activeTemplateId, startTime, endTime } = await req.json()

    if (!calendarDayId || !title) {
      return NextResponse.json({ error: 'calendarDayId and title are required' }, { status: 400 })
    }

    const day = await prisma.calendarDay.findUnique({
      where: { id: calendarDayId },
      include: { instances: true, template: { include: { items: true } } }
    })

    if (!day) {
      return NextResponse.json({ error: 'CalendarDay not found' }, { status: 404 })
    }
    
    // Verify calendar day belongs to authenticated user
    if (day.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    let templateId = day.templateId
    if (!templateId) {
      if (!activeTemplateId) {
        return NextResponse.json({ error: 'No template for this day' }, { status: 400 })
      }
      const updatedDay = await prisma.calendarDay.update({
        where: { id: calendarDayId },
        data: { templateId: activeTemplateId },
        include: { template: { include: { items: true } }, instances: true }
      })
      templateId = updatedDay.templateId
      day.template = updatedDay.template
      day.instances = updatedDay.instances
    }

    const maxTemplateOrder = day.template?.items?.reduce((max, item) => Math.max(max, item.orderIndex), 0) ?? 0
    const maxInstanceOrder = day.instances?.reduce((max, item) => Math.max(max, item.orderIndex), 0) ?? 0

    const templateItem = await prisma.dayRoutineTemplateItem.create({
      data: {
        templateId: templateId!,
        title,
        orderIndex: maxTemplateOrder + 1,
        defaultWeight: typeof weight === 'number' && !Number.isNaN(weight) ? weight : 1
      }
    })

    const instance = await prisma.dayRoutineInstance.create({
      data: {
        calendarDayId,
        routineItemId: templateItem.id,
        customTitle: title,
        customWeight: typeof weight === 'number' && !Number.isNaN(weight) ? weight : 1,
        orderIndex: maxInstanceOrder + 1,
        customStartTime: startTime || null,
        customEndTime: endTime || null
      }
    })

    return NextResponse.json({ instance })
  } catch (error: any) {
    console.error('Add instance error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

