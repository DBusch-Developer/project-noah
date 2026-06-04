import { type NextRequest } from 'next/server'
import { prisma } from '../../../lib/prisma'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl

  const species = searchParams.get('species')
  const mood = searchParams.get('mood')
  const emotion = searchParams.get('emotion')
  const region = searchParams.get('region')
  const search = searchParams.get('search')

  const animals = await prisma.animal.findMany({
    where: {
      ...(species && { species: { equals: species, mode: 'insensitive' } }),
      ...(mood && { mood: { equals: mood, mode: 'insensitive' } }),
      ...(emotion && { emotion: { equals: emotion, mode: 'insensitive' } }),
      ...(region && { region: { contains: region, mode: 'insensitive' } }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { species: { contains: search, mode: 'insensitive' } },
          { region: { contains: search, mode: 'insensitive' } },
        ],
      }),
    },
    include: {
      thoughts: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return Response.json(animals)
}
