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

    const { calendarDayId } = await req.json()
    if (!calendarDayId) return NextResponse.json({ error: 'calendarDayId required' }, { status: 400 })
    
    const calendarDay = await prisma.calendarDay.findUnique({ where: { id: calendarDayId } })
    if (!calendarDay) return NextResponse.json({ error: 'Calendar day not found' }, { status: 404 })
    
    // Verify calendar day belongs to authenticated user
    if (calendarDay.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const score = await calculateDailyScore(calendarDayId)
    return NextResponse.json(score)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
