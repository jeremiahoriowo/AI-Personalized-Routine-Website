import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import prisma from '../../../lib/prisma'
import { authOptions } from '@/lib/auth'

export async function GET() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const templates = await prisma.routineTemplate.findMany({
    where: { userId: session.user.id },
    take: 50
  })
  return NextResponse.json(templates)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const userId = session.user.id

  const created = await prisma.routineTemplate.create({
    data: {
      userId,
      title: body.title || 'Untitled',
      periodType: body.periodType || 'daily',
      createdByAI: !!body.createdByAI
    }
  })
  return NextResponse.json(created)
}
