import OpenAI from 'openai'

// Validate API key exists on startup
if (!process.env.OPENAI_API_KEY) {
  console.error('ERROR: OPENAI_API_KEY not set in environment variables')
  console.error('Please copy .env.local.example to .env and add your OpenAI API key')
  console.error('Get one at: https://platform.openai.com/api-keys')
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

// Generate a purpose-driven routine template using OpenAI
export async function generateTemplateFromIntake(intake: any) {
  // Verify API key exists
  if (!process.env.OPENAI_API_KEY) {
    console.error('OPENAI_API_KEY not configured')
    return generateFallbackRoutine(intake)
  }
  const systemPrompt = `You are a calm, thoughtful life coach and routine guide. Your philosophy:
- We don't give motivation. We help users build rhythm.
- No hustle culture, no guilt, no shame.
- Focus on sustainable growth through small, consistent actions.
- Routines should feel peaceful, not overwhelming.

Generate a daily routine based on the user's intake form. Return ONLY valid JSON with this exact structure:
{
  "coreTheme": "Brief inspiring theme (5-10 words)",
  "anchorHabits": ["habit1", "habit2", "habit3"],
  "dailyRoutine": {
    "morning": [{"title": "...", "description": "...", "category": "...", "defaultWeight": 1, "recommendedTime": "15 min", "startTime": "06:00", "endTime": "06:15", "orderIndex": 0}],
    "day": [{"title": "...", "description": "...", "category": "...", "defaultWeight": 1.5, "recommendedTime": "30 min", "startTime": "09:00", "endTime": "09:30", "orderIndex": 0}],
    "evening": [{"title": "...", "description": "...", "category": "...", "defaultWeight": 1, "recommendedTime": "20 min", "startTime": "20:00", "endTime": "20:20", "orderIndex": 0}]
  },
  "weeklyNotes": "Gentle weekly guidance (2-3 sentences)"
}

GUARDRAILS:
- Total routine items: 7-9 max (across morning/day/evening)
- Include at least ONE rest/reflection block
- Use calm, supportive language (no "crush", "grind", "beast mode")
- Weight scale: 0.5 (light), 1 (normal), 1.5 (important)
- Time durations: 5-60 minutes per item (be realistic and achievable)
- Categories: Planning, Learning, Work, Creativity, Health, Rest, Reflection`

  const userPrompt = `User Profile:
PRIMARY FOCUS: ${intake.primaryFocus || 'Personal Growth'}
OTHER IMPORTANT AREAS: ${intake.focusAreas || 'Not specified'}
SKILLS TO BUILD: ${intake.skills || 'Not specified'}

TIME & ENERGY:
- Available daily: ${intake.availableTime || 'Not specified'}
- Peak energy: ${intake.bestTime || 'Morning'}
- Energy pattern: ${intake.energyPattern || 'Steady'}

OBSTACLES:
- Consistency breakers: ${intake.breakers || 'Not specified'}
- Current pattern: ${intake.currentConsistency || 'Inconsistent'}

PREFERENCES:
- Structure: ${intake.structureKind || 'Balanced'}
- Learning style: ${intake.learningPref || 'Short sessions'}

MOTIVATION:
- Why now: ${intake.whyNow || 'Ready for change'}
- 30-day goal: ${intake.commitment || 'Build consistency'}

Create a purposeful routine that WEAVES ALL their development areas into one balanced day:

1. ANCHOR ACTIVITIES (morning + evening): Reflection, intention-setting, wind-down - help them build rhythm
2. PRIMARY FOCUS gets best time: ${intake.primaryFocus} - peak energy slot during ${intake.bestTime}
3. OTHER AREAS also appear in the routine: EACH area in ${intake.focusAreas} must get at least one dedicated time block
   - Don't list them together - give each its own activity with its own time
   - Space them strategically throughout the day
   - Example: if areas are "Leadership, Music, Design" → create separate blocks: "Leadership practice" + "Music practice" + "Design work"
4. Realistic time: Max ${intake.availableTime} means 1-2 focused sessions per area
5. Energy-aware placement: Put demanding work during peak time, lighter activities during fade periods
6. Build in ease: Account for "${intake.breakers}" - add flexibility and buffers

Total items: 7-9 spread across morning/day/evening
Make it feel like a coherent day (not fragmented), calm, and genuinely balanced.`

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' }
    })

    const content = completion.choices[0]?.message?.content
    if (!content) throw new Error('No response from OpenAI')

    let result = JSON.parse(content)
    
    // Validate and ensure proper structure
    if (!result.dailyRoutine || !result.dailyRoutine.morning) {
      throw new Error('Invalid routine structure from AI')
    }

    result = normalizeRoutine(result, intake)

    return result
  } catch (error: any) {
    console.error('OpenAI generation error:', error)
    // Fallback to basic routine on error
    return generateFallbackRoutine(intake)
  }
}

function normalizeRoutine(result: any, intake: any) {
  const focusAreas = intake.focusAreas ? intake.focusAreas.split(',').map((s: string) => s.trim()).filter(Boolean) : []
  const skills = intake.skills ? intake.skills.split(',').map((s: string) => s.trim()).filter(Boolean) : []
  const topics = [...focusAreas, ...skills]

  const splitCombined = (items: any[]) => {
    const expanded: any[] = []
    for (const item of items || []) {
      if (item?.title && item.title.includes(',')) {
        const parts = item.title.split(',').map((s: string) => s.trim()).filter(Boolean)
        for (const part of parts) {
          expanded.push({
            ...item,
            title: part
          })
        }
      } else {
        expanded.push(item)
      }
    }
    return expanded
  }

  const addDefaults = (items: any[], targetCount: number, defaults: any[]) => {
    const resultItems = [...items]
    for (const def of defaults) {
      if (resultItems.length >= targetCount) break
      resultItems.push(def)
    }
    return resultItems
  }

  const morning = splitCombined(result.dailyRoutine.morning || [])
  const day = splitCombined(result.dailyRoutine.day || [])
  const evening = splitCombined(result.dailyRoutine.evening || [])

  const morningDefaults = [
    { title: 'Gentle planning', description: 'Set one clear intention', category: 'Planning', defaultWeight: 1, recommendedTime: '10 min', orderIndex: 0 },
    { title: 'Breathing reset', description: '2–3 minutes to settle', category: 'Health', defaultWeight: 0.5, recommendedTime: '5 min', orderIndex: 1 }
  ]

  const dayDefaults = topics.slice(0, 3).map((t, i) => ({
    title: t,
    description: `Practice ${t}`,
    category: 'Work',
    defaultWeight: 1.5,
    recommendedTime: '30 min',
    orderIndex: i
  }))

  const eveningDefaults = [
    { title: 'Evening reflection', description: 'Note one win and one lesson', category: 'Reflection', defaultWeight: 1, recommendedTime: '15 min', orderIndex: 0 },
    { title: 'Light unwind', description: 'Screen-free wind down', category: 'Rest', defaultWeight: 0.5, recommendedTime: '20 min', orderIndex: 1 }
  ]

  const normalizedMorning = addDefaults(morning, 2, morningDefaults)
  const normalizedDay = addDefaults(day, 3, dayDefaults)
  const normalizedEvening = addDefaults(evening, 2, eveningDefaults)

  // Generate start/end times for morning (6:00 AM onwards)
  let morningTime = 360 // 6:00 AM in minutes
  result.dailyRoutine.morning = normalizedMorning.map((it: any, idx: number) => {
    const durationMin = parseDuration(it.recommendedTime)
    const startTime = minutesToTime(morningTime)
    const endTime = minutesToTime(morningTime + durationMin)
    morningTime += durationMin + 5 // 5 min buffer between activities
    return { ...it, orderIndex: idx, startTime, endTime }
  })

  // Generate start/end times for day (9:00 AM onwards)
  let dayTime = 540 // 9:00 AM in minutes
  result.dailyRoutine.day = normalizedDay.map((it: any, idx: number) => {
    const durationMin = parseDuration(it.recommendedTime)
    const startTime = minutesToTime(dayTime)
    const endTime = minutesToTime(dayTime + durationMin)
    dayTime += durationMin + 5 // 5 min buffer
    return { ...it, orderIndex: idx, startTime, endTime }
  })

  // Generate start/end times for evening (8:00 PM onwards)
  let eveningTime = 1200 // 8:00 PM in minutes
  result.dailyRoutine.evening = normalizedEvening.map((it: any, idx: number) => {
    const durationMin = parseDuration(it.recommendedTime)
    const startTime = minutesToTime(eveningTime)
    const endTime = minutesToTime(eveningTime + durationMin)
    eveningTime += durationMin + 5 // 5 min buffer
    return { ...it, orderIndex: idx, startTime, endTime }
  })

  return result
}

// Helper: Convert "30 min" or "1 hour" to minutes
function parseDuration(timeStr: string): number {
  if (!timeStr) return 20
  const match = timeStr.match(/(\d+)\s*(min|hour|h)/)
  if (!match) return 20
  const num = parseInt(match[1])
  const unit = match[2]
  return unit === 'hour' || unit === 'h' ? num * 60 : num
}

// Helper: Convert minutes since midnight to HH:MM format
function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60) % 24
  const mins = minutes % 60
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`
}

// Fallback routine when AI fails
function generateFallbackRoutine(intake: any) {
  const primaryFocus = intake.primaryFocus || 'Personal Growth'
  const focusAreas = intake.focusAreas ? intake.focusAreas.split(',').map((s: string) => s.trim()).filter(Boolean) : []
  
  // Build day activities that include all focus areas
  const dayActivities = []
  
  // Add primary focus as main work block
  dayActivities.push({
    title: `Focus on ${primaryFocus}`,
    description: 'Deep work session',
    category: 'Work',
    defaultWeight: 1.5,
    recommendedTime: '45 min',
    startTime: '09:00',
    endTime: '09:45',
    orderIndex: 0
  })
  
  // Add other focus areas as separate practice blocks
  focusAreas.slice(0, 2).forEach((area, idx) => {
    dayActivities.push({
      title: `${area} practice`,
      description: `Develop your skills in ${area}`,
      category: 'Learning',
      defaultWeight: 1,
      recommendedTime: '25 min',
      startTime: idx === 0 ? '10:00' : '10:30',
      endTime: idx === 0 ? '10:25' : '10:55',
      orderIndex: idx + 1
    })
  })
  
  // Add a break after activities
  dayActivities.push({
    title: 'Active break',
    description: 'Stretch or short walk',
    category: 'Health',
    defaultWeight: 0.5,
    recommendedTime: '15 min',
    startTime: '11:00',
    endTime: '11:15',
    orderIndex: dayActivities.length
  })
  
  return {
    coreTheme: `Building ${primaryFocus}${focusAreas.length > 0 ? ', ' + focusAreas.join(', ') : ''}`,
    anchorHabits: [primaryFocus, ...focusAreas.slice(0, 2), 'Reflection', 'Rest'],
    dailyRoutine: {
      morning: [
        { title: 'Morning reflection', description: 'Start your day with intention', category: 'Planning', defaultWeight: 1, recommendedTime: '10 min', startTime: '06:00', endTime: '06:10', orderIndex: 0 },
        { title: 'Gentle planning', description: 'Pick one priority for today', category: 'Planning', defaultWeight: 1, recommendedTime: '10 min', startTime: '06:15', endTime: '06:25', orderIndex: 1 }
      ],
      day: dayActivities,
      evening: [
        { title: 'Evening reflection', description: 'Review and rest', category: 'Reflection', defaultWeight: 1, recommendedTime: '15 min', startTime: '20:00', endTime: '20:15', orderIndex: 0 },
        { title: 'Light unwind', description: 'Screen-free wind down', category: 'Rest', defaultWeight: 0.5, recommendedTime: '20 min', startTime: '20:20', endTime: '20:40', orderIndex: 1 }
      ]
    },
    weeklyNotes: 'Start small. Build rhythm. Adjust as you grow.',
    scoringLogic: {}
  }
}
