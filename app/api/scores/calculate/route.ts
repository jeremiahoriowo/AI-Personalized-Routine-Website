import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { calculateDailyScore } from '../../../../lib/scoring'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(req: Request) {
  const { default: prisma } = await import('../../../../lib/prisma')
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

