import prisma from './prisma'

export async function calculateDailyScore(calendarDayId: string) {
  // Fetch instances and their checks
  const instances = await prisma.dayRoutineInstance.findMany({
    where: { calendarDayId },
    include: { check: true },
    orderBy: { orderIndex: 'asc' }
  })

  let totalPossible = 0
  let achieved = 0

  for (const inst of instances) {
    // try to get the template item to read defaultWeight
    const templateItem = await prisma.dayRoutineTemplateItem.findUnique({ where: { id: inst.routineItemId } })
    const weight = inst.customWeight ?? templateItem?.defaultWeight ?? 1
    totalPossible += weight
    if (inst.check && inst.check.isCompleted) achieved += weight
  }

  const achievedScore = achieved
  const totalScore = totalPossible || 1
  const disciplineRating = Math.round((achievedScore / totalScore) * 100)

  // Upsert DailyScore
  const score = await prisma.dailyScore.upsert({
    where: { calendarDayId },
    create: {
      calendarDayId,
      userId: (await prisma.calendarDay.findUniqueOrThrow({ where: { id: calendarDayId } })).userId,
      totalPossibleScore: totalScore,
      achievedScore: achievedScore,
      disciplineRating,
      focusRating: 0
    },
    update: {
      totalPossibleScore: totalScore,
      achievedScore: achievedScore,
      disciplineRating,
      calculatedAt: new Date()
    }
  })

  return score
}
