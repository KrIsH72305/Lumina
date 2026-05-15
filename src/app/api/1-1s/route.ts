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
    const { date, talkingPoints } = body

    if (!date) {
      return NextResponse.json({ message: 'Date is required' }, { status: 400 })
    }

    // Get the user's manager
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { managerId: true }
    })

    if (!user || !user.managerId) {
      return NextResponse.json({ message: 'You do not have a manager assigned' }, { status: 400 })
    }

    const meeting = await prisma.oneOnOne.create({
      data: {
        employeeId: session.user.id,
        managerId: user.managerId,
        date: new Date(date),
        talkingPoints: talkingPoints || null,
      }
    })

    return NextResponse.json(meeting, { status: 201 })
  } catch (error: any) {
    console.error('Error creating 1:1:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
