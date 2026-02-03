import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(req: Request) {
  const { default: prisma } = await import('../../../../lib/prisma')
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    const today = new Date()
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const end = new Date(start)
    end.setDate(end.getDate() + 1)

    const day = await prisma.calendarDay.findFirst({
      where: { userId, date: { gte: start, lt: end } },
      include: { instances: { include: { check: true } } }
    })

    if (!day) return NextResponse.json({ found: false })
    return NextResponse.json({ found: true, day })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

