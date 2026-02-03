import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import prisma from '../../../../lib/prisma'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const fetchCache = 'force-no-store'
export const revalidate = 0

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const intake = await req.json()
    const userId = session.user.id

    // Dynamic import to avoid build-time execution
    const { generateTemplateFromIntake } = await import('../../../../lib/ai')
    const aiResult = await generateTemplateFromIntake(intake)

    // deactivate all existing templates for this user
    await prisma.routineTemplate.updateMany({
      where: { userId, isActive: true },
      data: { isActive: false }
    })

    // create RoutineTemplate and its items
    const template = await prisma.routineTemplate.create({
      data: {
        userId,
        title: aiResult.coreTheme || 'AI Generated Routine',
        periodType: 'daily',
        createdByAI: true,
        items: {
          create: flattenDaily(aiResult.dailyRoutine).map((it: any, idx: number) => ({
            title: it.title || `Item ${idx + 1}`,
            description: it.description || '',
            category: it.category || 'Uncategorized',
            defaultWeight: it.defaultWeight ?? 1,
            recommendedTime: it.recommendedTime || null,
            customStartTime: it.startTime || null,
            customEndTime: it.endTime || null,
            isOptional: false,
            orderIndex: it.orderIndex ?? idx
          }))
        }
      },
      include: { items: true }
    })

    // log AI generation
    await prisma.aIGenerationLog.create({ data: { userId, generationType: 'template', promptSummary: JSON.stringify({ intakeSummary: intake }), } })

    return NextResponse.json({ template, aiResult })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

function flattenDaily(daily: any) {
  const out: any[] = []
  for (const section of ['morning', 'day', 'evening']) {
    const items = daily?.[section] || []
    for (const it of items) out.push({ ...it, section })
  }
  return out
}
