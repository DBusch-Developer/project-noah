import { type NextRequest } from 'next/server'
import { prisma } from '../../../lib/prisma'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl

  const animalId = searchParams.get('animalId')

  if (!animalId) {
    return Response.json({ error: 'animalId is required' }, { status: 400 })
  }

  const thoughts = await prisma.thought.findMany({
    where: { animalId },
    orderBy: { createdAt: 'desc' },
  })

  return Response.json(thoughts)
}
