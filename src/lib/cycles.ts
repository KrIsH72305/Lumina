import { prisma } from './prisma'

export type CyclePhase = 'GOAL_SETTING' | 'CHECK_IN_Q1' | 'CHECK_IN_Q2' | 'CHECK_IN_Q3' | 'CHECK_IN_Q4'

export async function isWindowOpen(phase: CyclePhase): Promise<boolean> {
  const now = new Date()
  
  const cycle = await prisma.cycle.findFirst({
    where: {
      phase,
      isActive: true,
      windowOpen: { lte: now },
      windowClose: { gte: now },
    }
  })

  return !!cycle
}

export async function getActiveCycle() {
  const now = new Date()
  return prisma.cycle.findFirst({
    where: {
      isActive: true,
      windowOpen: { lte: now },
      windowClose: { gte: now },
    }
  })
}
