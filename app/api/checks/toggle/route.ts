import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import prisma from '../../../../lib/prisma'
import { calculateDailyScore } from '../../../../lib/scoring'
import { authOptions } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { dayRoutineInstanceId, isCompleted } = await req.json()
    if (!dayRoutineInstanceId) return NextResponse.json({ error: 'dayRoutineInstanceId required' }, { status: 400 })

    const instance = await prisma.dayRoutineInstance.findUnique({ where: { id: dayRoutineInstanceId }, include: { calendarDay: true } })
    if (!instance) return NextResponse.json({ error: 'Instance not found' }, { status: 404 })
    
    // Verify instance belongs to authenticated user
    if (instance.calendarDay.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    let check = await prisma.dayRoutineCheck.findUnique({ where: { dayRoutineInstanceId } })
    if (!check) {
      check = await prisma.dayRoutineCheck.create({
        data: { dayRoutineInstanceId, isCompleted: isCompleted ?? true, completedAt: isCompleted ? new Date() : null }
      })
    } else {
      check = await prisma.dayRoutineCheck.update({
        where: { dayRoutineInstanceId },
        data: { isCompleted: isCompleted ?? !check.isCompleted, completedAt: (isCompleted ?? !check.isCompleted) ? new Date() : null }
      })
    }

    // Recalculate daily score
    const score = await calculateDailyScore(instance.calendarDayId)

    return NextResponse.json({ check, score })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
