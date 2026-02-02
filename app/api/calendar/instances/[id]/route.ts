import prisma from '../../../../../lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { customTitle, customWeight, customStartTime, customEndTime } = await req.json()
    const instanceId = params.id

    const instance = await prisma.dayRoutineInstance.findUnique({ where: { id: instanceId }, include: { calendarDay: true } })
    if (!instance) return NextResponse.json({ error: 'Instance not found' }, { status: 404 })
    
    // Verify instance belongs to authenticated user
    if (instance.calendarDay.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const updated = await prisma.dayRoutineInstance.update({
      where: { id: instanceId },
      data: {
        customTitle: customTitle || undefined,
        customWeight: customWeight || undefined,
        customStartTime: customStartTime !== undefined ? customStartTime : undefined,
        customEndTime: customEndTime !== undefined ? customEndTime : undefined
      }
    })

    return NextResponse.json(updated)
  } catch (error: any) {
    console.error('Update instance error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const instanceId = params.id

    const instance = await prisma.dayRoutineInstance.findUnique({ where: { id: instanceId }, include: { calendarDay: true } })
    if (!instance) return NextResponse.json({ error: 'Instance not found' }, { status: 404 })
    
    // Verify instance belongs to authenticated user
    if (instance.calendarDay.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.dayRoutineCheck.deleteMany({
      where: { dayRoutineInstanceId: instanceId }
    })

    const deleted = await prisma.dayRoutineInstance.delete({
      where: { id: instanceId }
    })

    return NextResponse.json(deleted)
  } catch (error: any) {
    console.error('Delete instance error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
