import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import prisma from '../../../../lib/prisma'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const id = params.id
    
    const template = await prisma.routineTemplate.findUnique({ where: { id } })
    if (!template) return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    
    // Verify template belongs to authenticated user
    if (template.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get all calendar days using this template
    const calendarDays = await prisma.calendarDay.findMany({
      where: { templateId: id },
      include: { instances: true }
    })

    // Delete related data for these calendar days
    for (const day of calendarDays) {
      // Delete daily scores
      await prisma.dailyScore.deleteMany({ where: { calendarDayId: day.id } })
      
      // Delete checks for instances
      const instanceIds = day.instances.map(i => i.id)
      await prisma.dayRoutineCheck.deleteMany({
        where: { dayRoutineInstanceId: { in: instanceIds } }
      })
      
      // Delete instances
      await prisma.dayRoutineInstance.deleteMany({ where: { calendarDayId: day.id } })
    }

    // Delete the calendar days
    await prisma.calendarDay.deleteMany({ where: { templateId: id } })

    // Delete template items
    await prisma.dayRoutineTemplateItem.deleteMany({ where: { templateId: id } })

    // Delete the template
    await prisma.routineTemplate.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
