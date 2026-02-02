import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import prisma from '../../../../lib/prisma'
import { authOptions } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { templateId } = await req.json()
    if (!templateId) return NextResponse.json({ error: 'templateId required' }, { status: 400 })

    const template = await prisma.routineTemplate.findUnique({ where: { id: templateId } })
    if (!template) return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    
    // Verify template belongs to authenticated user
    if (template.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Deactivate all templates for this user
    await prisma.routineTemplate.updateMany({
      where: { userId: template.userId, isActive: true },
      data: { isActive: false }
    })

    // Activate the selected template
    const updated = await prisma.routineTemplate.update({
      where: { id: templateId },
      data: { isActive: true }
    })

    return NextResponse.json({ success: true, template: updated })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
