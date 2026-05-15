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
    const { title, description } = body

    if (!title) {
      return NextResponse.json({ message: 'Title is required' }, { status: 400 })
    }

    const growthArea = await prisma.growthArea.create({
      data: {
        employeeId: session.user.id,
        title,
        description: description || null,
        status: 'NOT_STARTED',
      }
    })

    return NextResponse.json(growthArea, { status: 201 })
  } catch (error: any) {
    console.error('Error creating growth area:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
