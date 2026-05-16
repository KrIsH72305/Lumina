import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { userId, title, description, startDate, endDate } = await req.json()

    if (!userId || !title || !startDate || !endDate) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 })
    }

    // Only managers or admins can create PIPs
    if (session.user.role !== 'MANAGER' && session.user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
    }

    const pip = await prisma.pip.create({
      data: {
        userId,
        title,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        status: 'ACTIVE'
      }
    })

    return NextResponse.json(pip)
  } catch (error) {
    console.error('Error creating PIP:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
