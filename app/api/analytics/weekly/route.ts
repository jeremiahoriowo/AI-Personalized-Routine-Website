import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import prisma from '../../../../lib/prisma'
import { authOptions } from '@/lib/auth'

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // Get last 4 weeks of data
    const today = new Date()
    const fourWeeksAgo = new Date(today)
    fourWeeksAgo.setDate(today.getDate() - 28)

    const days = await prisma.calendarDay.findMany({
      where: {
        userId,
        date: { gte: fourWeeksAgo, lte: today }
      },
      include: {
        instances: { include: { check: true } },
        dailyScore: true
      },
      orderBy: { date: 'desc' }
    })

    // Calculate weekly stats
    const weeks: any[] = []
    for (let i = 0; i < 4; i++) {
      const weekStart = new Date(today)
      weekStart.setDate(today.getDate() - (i * 7 + 6))
      const weekEnd = new Date(today)
      weekEnd.setDate(today.getDate() - (i * 7))

      const weekDays = days.filter(d => {
        const date = new Date(d.date)
        return date >= weekStart && date <= weekEnd
      })

      const totalInstances = weekDays.reduce((sum, d) => sum + d.instances.length, 0)
      const completedInstances = weekDays.reduce((sum, d) => 
        sum + d.instances.filter((i: any) => i.check?.isCompleted).length, 0
      )
      const avgDiscipline = weekDays.length > 0
        ? weekDays.reduce((sum, d) => sum + (d.dailyScore?.disciplineRating || 0), 0) / weekDays.length
        : 0

      weeks.push({
        weekNum: i + 1,
        weekStart: weekStart.toISOString(),
        weekEnd: weekEnd.toISOString(),
        daysWithRoutines: weekDays.length,
        completionPercent: totalInstances > 0 ? Math.round((completedInstances / totalInstances) * 100) : 0,
        averageDiscipline: Math.round(avgDiscipline),
        totalInstances,
        completedInstances
      })
    }

    // Overall stats
    const totalDaysWithRoutines = days.length
    const allInstances = days.reduce((sum, d) => sum + d.instances.length, 0)
    const allCompleted = days.reduce((sum, d) => 
      sum + d.instances.filter((i: any) => i.check?.isCompleted).length, 0
    )
    const overallCompletion = allInstances > 0 ? Math.round((allCompleted / allInstances) * 100) : 0
    const overallAvgDiscipline = days.length > 0
      ? Math.round(days.reduce((sum, d) => sum + (d.dailyScore?.disciplineRating || 0), 0) / days.length)
      : 0

    return NextResponse.json({
      weeks: weeks.reverse(),
      overall: {
        daysWithRoutines: totalDaysWithRoutines,
        completionPercent: overallCompletion,
        averageDiscipline: overallAvgDiscipline
      }
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
