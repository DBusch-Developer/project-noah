import 'dotenv/config'
import { neon } from '@neondatabase/serverless'
import { randomUUID } from 'crypto'
import { generateAnimals, SPECIES_LIST } from '../lib/generateSeed'

const sql = neon(process.env.DATABASE_URL!)

// ── iNaturalist photo resolver ──────────────────────────────────────────────
// One lookup per *species* (~60 calls), not per animal. Respects their
// ~1 req/sec guidance. Falls back to null (UI shows a silhouette) on failure.
type Photo = { url: string | null; attribution: string | null }

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

const ANIMAL_TAXA = [
  'Mammalia', 'Aves', 'Reptilia', 'Amphibia', 'Actinopterygii',
  'Insecta', 'Arachnida', 'Mollusca', 'Animalia',
]

// Some display names don't match iNaturalist species-level entries.
// Grizzly Bear is a subspecies of Brown Bear; Golden Retriever is a breed.
// Map them to a query that iNaturalist actually resolves.
const SEARCH_OVERRIDE: Record<string, { q: string; rank?: string }> = {
  'Grizzly Bear':    { q: 'Ursus arctos', rank: 'species' },
  'Golden Retriever':{ q: 'Canis lupus familiaris' },         // no rank filter — breed-level
  'Pink River Dolphin': { q: 'Inia geoffrensis', rank: 'species' },
  'Wandering Albatross':{ q: 'Diomedea exulans', rank: 'species' },
}

async function fetchSpeciesPhoto(species: string): Promise<Photo> {
  const override = SEARCH_OVERRIDE[species]
  const params = new URLSearchParams({
    q: override?.q ?? species,
    per_page: '5',
  })
  if (override?.rank !== undefined || !override) params.set('rank', 'species')
  for (const t of ANIMAL_TAXA) params.append('iconic_taxa[]', t)
  const endpoint = `https://api.inaturalist.org/v1/taxa?${params}`
  try {
    const ctrl = new AbortController()
    const t = setTimeout(() => ctrl.abort(), 8000)
    const res = await fetch(endpoint, {
      headers: { Accept: 'application/json', 'User-Agent': 'ProjectNoah/1.0 (portfolio demo)' },
      signal: ctrl.signal,
    })
    clearTimeout(t)
    if (!res.ok) return { url: null, attribution: null }
    const data = await res.json()
    // Pick the first result that is actually an animal (not a plant/fungus).
    const taxon = (data?.results ?? []).find((r: any) =>
      ANIMAL_TAXA.includes(r?.iconic_taxon_name),
    )
    const photo = taxon?.default_photo
    if (!photo?.medium_url) return { url: null, attribution: null }
    return {
      url: photo.medium_url as string,
      attribution: (photo.attribution as string) ?? null,
    }
  } catch {
    return { url: null, attribution: null }
  }
}

async function resolveAllPhotos(): Promise<Record<string, Photo>> {
  const map: Record<string, Photo> = {}
  console.log(`Resolving photos for ${SPECIES_LIST.length} species from iNaturalist...`)
  for (const species of SPECIES_LIST) {
    const p = await fetchSpeciesPhoto(species)
    map[species] = p
    console.log(`  ${p.url ? '✓' : '·'} ${species}`)
    await sleep(1100) // be a good API citizen (~1 req/sec)
  }
  return map
}

// ── Batched insert helpers ──────────────────────────────────────────────────
function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

type AnimalRow = {
  id: string; name: string; species: string; region: string
  latitude: number; longitude: number; mood: string; emotion: string
  status: string; photoUrl: string | null; photoAttribution: string | null
}

async function insertAnimalBatch(batch: AnimalRow[]) {
  const cols = 11
  const placeholders = batch
    .map((_, r) => {
      const base = r * cols
      const p = Array.from({ length: cols }, (_, c) => `$${base + c + 1}`)
      return `(${p.join(',')}, NOW(), NOW())`
    })
    .join(',')
  const params: unknown[] = []
  batch.forEach(a => {
    params.push(a.id, a.name, a.species, a.region, a.latitude, a.longitude, a.mood, a.emotion, a.status, a.photoUrl, a.photoAttribution)
  })
  const query = `INSERT INTO "Animal" ("id","name","species","region","latitude","longitude","mood","emotion","status","photoUrl","photoAttribution","createdAt","updatedAt") VALUES ${placeholders}`
  await sql.query(query, params)
}

async function insertThoughtBatch(
  batch: { id: string; animalId: string; text: string; intensity: number }[],
) {
  const cols = 4
  const placeholders = batch
    .map((_, r) => {
      const base = r * cols
      const p = Array.from({ length: cols }, (_, c) => `$${base + c + 1}`)
      return `(${p.join(',')}, NOW())`
    })
    .join(',')
  const params: unknown[] = []
  batch.forEach(t => params.push(t.id, t.animalId, t.text, t.intensity))
  const query = `INSERT INTO "Thought" ("id","animalId","text","intensity","createdAt") VALUES ${placeholders}`
  await sql.query(query, params)
}

async function main() {
  const skipPhotos = process.argv.includes('--no-photos')

  const animals = generateAnimals({ totalAnimals: 1500, minThoughts: 12, maxThoughts: 15 })
  const totalThoughts = animals.reduce((s, a) => s + a.thoughts.length, 0)
  console.log(`Generated ${animals.length} animals / ${totalThoughts} thoughts.`)

  const photos = skipPhotos ? {} : await resolveAllPhotos()

  console.log('Clearing existing data...')
  await sql`DELETE FROM "Thought"`
  await sql`DELETE FROM "Animal"`

  const animalRows: AnimalRow[] = animals.map(a => {
    const photo = photos[a.species] ?? { url: null, attribution: null }
    return {
      id: randomUUID(),
      name: a.name,
      species: a.species,
      region: a.region,
      latitude: a.latitude,
      longitude: a.longitude,
      mood: a.mood,
      emotion: a.emotion,
      status: a.status,
      photoUrl: photo.url,
      photoAttribution: photo.attribution,
    }
  })

  console.log('Inserting animals...')
  for (const batch of chunk(animalRows, 200)) {
    await insertAnimalBatch(batch)
  }

  console.log('Inserting thoughts...')
  const allThoughts: { id: string; animalId: string; text: string; intensity: number }[] = []
  animalRows.forEach((row, idx) => {
    animals[idx].thoughts.forEach(t => {
      allThoughts.push({ id: randomUUID(), animalId: row.id, text: t.text, intensity: t.intensity })
    })
  })
  for (const batch of chunk(allThoughts, 500)) {
    await insertThoughtBatch(batch)
  }

  console.log(`Done. ${animalRows.length} animals, ${allThoughts.length} thoughts.`)
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})
