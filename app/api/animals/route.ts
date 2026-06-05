import { type NextRequest } from 'next/server'
import { prisma } from '../../../lib/prisma'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl

  const species = searchParams.get('species')
  const mood = searchParams.get('mood')
  const emotion = searchParams.get('emotion')
  const region = searchParams.get('region')
  const search = searchParams.get('search')
  const distress = searchParams.get('distress') === '1'

  const DISTRESS = ['scared', 'desperate', 'dying', 'grieving', 'sad', 'lonely', 'anxious', 'exhausted']

  const animals = await prisma.animal.findMany({
    where: {
      ...(species && { species: { equals: species, mode: 'insensitive' } }),
      ...(mood && { mood: { equals: mood, mode: 'insensitive' } }),
      ...(emotion && { emotion: { equals: emotion, mode: 'insensitive' } }),
      ...(region && { region: { contains: region, mode: 'insensitive' } }),
      ...(distress && { emotion: { in: DISTRESS } }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { species: { contains: search, mode: 'insensitive' } },
          { region: { contains: search, mode: 'insensitive' } },
        ],
      }),
    },
    select: {
      id: true,
      name: true,
      species: true,
      region: true,
      latitude: true,
      longitude: true,
      mood: true,
      emotion: true,
      photoUrl: true,
      photoAttribution: true,
      thoughts: {
        orderBy: { createdAt: 'desc' },
        take: 4,
        select: { id: true, text: true, intensity: true },
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any,
    take: 2000,
  })

  return Response.json(animals)
}
