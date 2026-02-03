import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const { default: prisma } = await import('../../../../lib/prisma')
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { title, items } = await req.json()

    if (!title || !items || items.length === 0) {
      return NextResponse.json({ error: 'Title and at least one item required' }, { status: 400 })
    }

    const userId = session.user.id

    // Create template
    const template = await prisma.routineTemplate.create({
      data: {
        userId,
        title,
        periodType: 'daily',
        createdByAI: false,
        isActive: false,
        items: {
          create: items.map((item: any) => ({
            title: item.title,
            description: item.description || '',
            category: item.category || 'General',
            defaultWeight: item.defaultWeight || 1,
            recommendedTime: item.recommendedTime || '',
            customStartTime: item.startTime || null,
            customEndTime: item.endTime || null,
            orderIndex: item.orderIndex
          }))
        }
      },
      include: { items: true }
    })

    return NextResponse.json({ template })
  } catch (error: any) {
    console.error('Manual template creation error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

