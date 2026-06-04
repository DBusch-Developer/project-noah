import 'dotenv/config'
import { neon } from '@neondatabase/serverless'
import { randomUUID } from 'crypto'
import { seedAnimals } from '../lib/seedAnimals'

const sql = neon(process.env.DATABASE_URL!)

async function main() {
  console.log(`Seeding ${seedAnimals.length} animals...`)

  for (const animal of seedAnimals) {
    const { thoughts, ...animalData } = animal
    const animalId = randomUUID()

    await sql`
      INSERT INTO "Animal" ("id","name","species","region","latitude","longitude","mood","emotion","status","createdAt","updatedAt")
      VALUES (${animalId}, ${animalData.name}, ${animalData.species}, ${animalData.region},
              ${animalData.latitude}, ${animalData.longitude}, ${animalData.mood},
              ${animalData.emotion}, ${animalData.status}, NOW(), NOW())
    `

    for (const thought of thoughts) {
      await sql`
        INSERT INTO "Thought" ("id","animalId","text","intensity","createdAt")
        VALUES (${randomUUID()}, ${animalId}, ${thought.text}, ${thought.intensity}, NOW())
      `
    }
  }

  console.log('Done.')
}

main().catch(console.error)
