import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import prisma from '../../../../lib/prisma'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(req.url)
    const userId = session.user.id
    const year = parseInt(url.searchParams.get('year') || new Date().getFullYear().toString())
    const month = parseInt(url.searchParams.get('month') || new Date().getMonth().toString())

    const start = new Date(year, month, 1)
    const end = new Date(year, month + 1, 0, 23, 59, 59)

    const days = await prisma.calendarDay.findMany({
      where: {
        userId,
        date: { gte: start, lte: end }
      },
      include: {
        instances: {
          include: { check: true }
        },
        dailyScore: true
      },
      orderBy: { date: 'asc' }
    })

    return NextResponse.json({ days, year, month })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

