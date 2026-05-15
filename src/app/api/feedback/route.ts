import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { toUserId, content, visibility } = body

    if (!toUserId || !content) {
      return NextResponse.json({ message: 'Recipient and content are required' }, { status: 400 })
    }

    const feedback = await prisma.feedback.create({
      data: {
        fromUserId: session.user.id,
        toUserId,
        content,
        visibility: visibility || 'PUBLIC',
      }
    })

    return NextResponse.json(feedback, { status: 201 })
  } catch (error: any) {
    console.error('Error creating feedback:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
