// ─────────────────────────────────────────────────────────────────────────
// Project Noah — procedural seed generator
//
// Produces a large, varied dataset that *looks* like a live feed:
//   ~1,500 animals across the globe, each with 12–15 distinct thoughts
//   spanning the full emotional range (~20k thought rows).
//
// All data is SIMULATED. The premise is a near-future fiction (see README).
// Coordinates are jittered around real regional anchors so points scatter
// naturally instead of stacking on one pin.
// ─────────────────────────────────────────────────────────────────────────

import { EMOTION_VALUES } from './emotion'

export type SeedThought = { text: string; intensity: number }
export type SeedAnimal = {
  name: string
  species: string
  region: string
  latitude: number
  longitude: number
  mood: string
  emotion: string
  status: string
  thoughts: SeedThought[]
}

// Deterministic PRNG so re-seeds are reproducible (mulberry32).
function makeRng(seed: number) {
  let a = seed >>> 0
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const rng = makeRng(20260604)
const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(rng() * arr.length)]
const jitter = (base: number, spread: number) => base + (rng() - 0.5) * 2 * spread
const intIn = (lo: number, hi: number) => Math.floor(rng() * (hi - lo + 1)) + lo

// ── Animal "archetype" → which thought voice fits ──────────────────────────
type Archetype = 'predator' | 'prey' | 'marine' | 'bird' | 'primate' | 'reptile' | 'companion'

type SpeciesDef = {
  species: string
  region: string
  // anchor lat/lng + spread (degrees) so individuals scatter realistically
  lat: number; lng: number; spread: number
  archetype: Archetype
}

// Curated catalog — real species, plausible home regions/coordinates.
const SPECIES: SpeciesDef[] = [
  // NORTH AMERICA
  { species: 'Bald Eagle',        region: 'North America', lat: 44, lng: -110, spread: 9, archetype: 'bird' },
  { species: 'Gray Wolf',         region: 'North America', lat: 45, lng: -112, spread: 8, archetype: 'predator' },
  { species: 'Grizzly Bear',      region: 'North America', lat: 48, lng: -114, spread: 7, archetype: 'predator' },
  { species: 'American Bison',    region: 'North America', lat: 44, lng: -103, spread: 6, archetype: 'prey' },
  { species: 'Mountain Lion',     region: 'North America', lat: 39, lng: -111, spread: 9, archetype: 'predator' },
  { species: 'Sea Otter',         region: 'North America', lat: 37, lng: -122, spread: 4, archetype: 'marine' },
  { species: 'Snowy Owl',         region: 'North America', lat: 60, lng: -100, spread: 10, archetype: 'bird' },
  { species: 'Red Fox',           region: 'North America', lat: 46, lng: -95, spread: 11, archetype: 'predator' },
  { species: 'Monarch Butterfly', region: 'North America', lat: 40, lng: -98, spread: 12, archetype: 'prey' },
  { species: 'Golden Retriever',  region: 'North America', lat: 39, lng: -98, spread: 13, archetype: 'companion' },
  // SOUTH AMERICA
  { species: 'Jaguar',            region: 'South America', lat: -3, lng: -62, spread: 8, archetype: 'predator' },
  { species: 'Andean Condor',     region: 'South America', lat: -32, lng: -68, spread: 6, archetype: 'bird' },
  { species: 'Pink River Dolphin',region: 'South America', lat: -3, lng: -60, spread: 5, archetype: 'marine' },
  { species: 'Giant Anteater',    region: 'South America', lat: -15, lng: -56, spread: 8, archetype: 'prey' },
  { species: 'Capybara',          region: 'South America', lat: -16, lng: -58, spread: 9, archetype: 'prey' },
  { species: 'Llama',             region: 'South America', lat: -16, lng: -68, spread: 6, archetype: 'prey' },
  // EUROPE
  { species: 'Brown Bear',        region: 'Europe', lat: 62, lng: 25, spread: 8, archetype: 'predator' },
  { species: 'Atlantic Puffin',   region: 'Europe', lat: 65, lng: -18, spread: 6, archetype: 'bird' },
  { species: 'White Stork',       region: 'Europe', lat: 50, lng: 14, spread: 8, archetype: 'bird' },
  { species: 'Eurasian Lynx',     region: 'Europe', lat: 60, lng: 22, spread: 9, archetype: 'predator' },
  { species: 'Red Deer',          region: 'Europe', lat: 56, lng: 2, spread: 6, archetype: 'prey' },
  { species: 'European Hedgehog', region: 'Europe', lat: 51, lng: 8, spread: 9, archetype: 'prey' },
  // AFRICA
  { species: 'African Elephant',  region: 'Africa', lat: -2, lng: 33, spread: 6, archetype: 'prey' },
  { species: 'African Lion',      region: 'Africa', lat: -2, lng: 35, spread: 8, archetype: 'predator' },
  { species: 'Cheetah',           region: 'Africa', lat: -20, lng: 24, spread: 7, archetype: 'predator' },
  { species: 'Mountain Gorilla',  region: 'Africa', lat: -1, lng: 29, spread: 3, archetype: 'primate' },
  { species: 'Giraffe',           region: 'Africa', lat: -2, lng: 36, spread: 8, archetype: 'prey' },
  { species: 'Nile Crocodile',    region: 'Africa', lat: 0, lng: 32, spread: 9, archetype: 'reptile' },
  { species: 'Zebra',             region: 'Africa', lat: -3, lng: 33, spread: 6, archetype: 'prey' },
  { species: 'Hippopotamus',      region: 'Africa', lat: -1, lng: 34, spread: 7, archetype: 'prey' },
  // ASIA
  { species: 'Giant Panda',       region: 'Asia', lat: 31, lng: 103, spread: 4, archetype: 'prey' },
  { species: 'Snow Leopard',      region: 'Asia', lat: 36, lng: 84, spread: 9, archetype: 'predator' },
  { species: 'Orangutan',         region: 'Asia', lat: 0, lng: 114, spread: 4, archetype: 'primate' },
  { species: 'Bengal Tiger',      region: 'Asia', lat: 23, lng: 88, spread: 7, archetype: 'predator' },
  { species: 'Japanese Macaque',  region: 'Asia', lat: 36, lng: 136, spread: 3, archetype: 'primate' },
  { species: 'Komodo Dragon',     region: 'Asia', lat: -8, lng: 119, spread: 3, archetype: 'reptile' },
  { species: 'Asian Elephant',    region: 'Asia', lat: 10, lng: 78, spread: 8, archetype: 'prey' },
  { species: 'Siberian Tiger',    region: 'Asia', lat: 47, lng: 131, spread: 5, archetype: 'predator' },
  { species: 'Red Panda',         region: 'Asia', lat: 28, lng: 88, spread: 5, archetype: 'prey' },
  // OCEANIA
  { species: 'Red Kangaroo',      region: 'Oceania', lat: -25, lng: 134, spread: 10, archetype: 'prey' },
  { species: 'Koala',             region: 'Oceania', lat: -33, lng: 147, spread: 4, archetype: 'prey' },
  { species: 'Kiwi',              region: 'Oceania', lat: -41, lng: 172, spread: 3, archetype: 'bird' },
  { species: 'Tasmanian Devil',   region: 'Oceania', lat: -42, lng: 147, spread: 3, archetype: 'predator' },
  { species: 'Dingo',             region: 'Oceania', lat: -24, lng: 133, spread: 10, archetype: 'predator' },
  { species: 'Platypus',          region: 'Oceania', lat: -33, lng: 147, spread: 4, archetype: 'marine' },
  // PACIFIC OCEAN
  { species: 'Humpback Whale',    region: 'Pacific Ocean', lat: 20, lng: -155, spread: 14, archetype: 'marine' },
  { species: 'Orca',              region: 'Pacific Ocean', lat: 48, lng: -130, spread: 12, archetype: 'marine' },
  { species: 'Great White Shark', region: 'Pacific Ocean', lat: -35, lng: 150, spread: 12, archetype: 'marine' },
  { species: 'Oceanic Manta Ray', region: 'Pacific Ocean', lat: 0, lng: -140, spread: 14, archetype: 'marine' },
  // ATLANTIC OCEAN
  { species: 'Blue Whale',        region: 'Atlantic Ocean', lat: 35, lng: -40, spread: 14, archetype: 'marine' },
  { species: 'Green Sea Turtle',  region: 'Atlantic Ocean', lat: 20, lng: -60, spread: 12, archetype: 'marine' },
  { species: 'Bottlenose Dolphin',region: 'Atlantic Ocean', lat: 30, lng: -50, spread: 13, archetype: 'marine' },
  // ARCTIC
  { species: 'Polar Bear',        region: 'Arctic', lat: 78, lng: -40, spread: 10, archetype: 'predator' },
  { species: 'Narwhal',           region: 'Arctic', lat: 76, lng: -70, spread: 8, archetype: 'marine' },
  { species: 'Arctic Fox',        region: 'Arctic', lat: 74, lng: -42, spread: 11, archetype: 'predator' },
  { species: 'Walrus',            region: 'Arctic', lat: 72, lng: -55, spread: 9, archetype: 'marine' },
  // ANTARCTICA
  { species: 'Emperor Penguin',   region: 'Antarctica', lat: -75, lng: 0, spread: 12, archetype: 'bird' },
  { species: 'Leopard Seal',      region: 'Antarctica', lat: -67, lng: -60, spread: 12, archetype: 'marine' },
  { species: 'Wandering Albatross',region: 'Antarctica', lat: -55, lng: 30, spread: 14, archetype: 'bird' },
  { species: 'Weddell Seal',      region: 'Antarctica', lat: -72, lng: -20, spread: 12, archetype: 'marine' },
]

// ── Name bank ───────────────────────────────────────────────────────────────
const NAMES = [
  'Talon','Echo','Sable','Juniper','Atlas','Willow','Koda','Nova','Sage','Bandit',
  'Luna','Cinder','Onyx','Pixel','Ember','Marsh','Indigo','Cleo','Bruno','Hazel',
  'Maple','Rocco','Saffron','Dash','Vesper','Pippin','Tundra','Mango','Slate','Wren',
  'Cosmo','Delta','Fawn','Garnet','Halcyon','Iris','Juno','Kestrel','Lyric','Mica',
  'Nimbus','Opal','Quill','Rune','Sol','Thistle','Umber','Vale','Zephyr','Bay',
  'Aspen','Brook','Cedar','Drift','Fern','Grove','Heath','Ivy','Jet','Kelp',
  'Lark','Moss','North','Pine','Reed','Storm','Tide','Vita','Wisp','Yara',
]
const SUFFIX = ['', '', '', ' II', ' Jr', '-7', '-9', ' Prime', ' VII']

// ── Thought banks by emotion, voiced per archetype where it matters ──────────
// Each emotion has a pool; we shuffle and assign so animals don't repeat.
type Bank = Record<string, string[]>

const THOUGHTS: Bank = {
  scared: [
    'Something large moved in the treeline. I have stopped breathing.',
    'The sky sound came again — the one that scatters us all.',
    'I do not know this scent. I do not know this scent. I do not know this scent.',
    'My young are too far from me. The distance is a wound.',
    'The ground trembles in a rhythm that is not the herd.',
    'I have nowhere left to run that does not smell of the others.',
  ],
  desperate: [
    'Three days now without water that does not burn the throat.',
    'I have searched every old path. The food is simply gone.',
    'If I stop moving I will not start again. So I do not stop.',
    'I call and call across the water and nothing calls back.',
    'The ice that held my weight last season will not hold it now.',
    'I would trade the whole territory for one easy meal.',
  ],
  dying: [
    'I am very tired. The cold has stopped feeling like cold.',
    'Let the others go ahead. I will rest here where the light is.',
    'I remember the warm season. That is enough to remember.',
    'My breathing is slower than the tide now. That is alright.',
    'The pain has gone quiet, which the old ones told me to fear.',
  ],
  grieving: [
    'I returned to the place we slept and the shape of them was still pressed in the grass.',
    'The smallest of mine did not wake. I have carried it since.',
    'I keep listening for a call that I know will not come.',
    'The herd moved on. I stayed one more day. Then one more.',
    'There is a silence beside me where a sound used to live.',
  ],
  sad: [
    'The long migration is starting and I do not want to leave this valley.',
    'The days are shorter and something in me grows shorter with them.',
    'I watched the young ones go. The den feels enormous now.',
    'Even the warm rocks do not warm me the way they once did.',
  ],
  lonely: [
    'I have not heard another of my kind in many sleeps.',
    'I sing the long song anyway, in case the water carries it far.',
    'My own footprints are the only company on this ridge.',
    'I mark the boundary every day and no one ever reads it.',
  ],
  anxious: [
    'Too many scents at once. Which one is the danger? Which one?',
    'I cannot settle. The wind keeps changing its mind.',
    'I check the exits of the den again. And again. And again.',
    'The quiet before a storm is worse than the storm.',
  ],
  exhausted: [
    'I have flown since the moon was full. My wings argue with me.',
    'The current pushed against me all day. I have nothing left for the night.',
    'One more ridge. I have said one more ridge for six ridges.',
    'Sleep pulls at me even as I walk.',
  ],
  angry: [
    'That was MY kill. The scavengers will learn this the hard way.',
    'It crossed the scent line knowing exactly what the line means.',
    'I have warned it twice. There will not be a third warning.',
    'The intruder took the high ground. I am taking it back.',
  ],
  aggressive: [
    'Come closer. I am inviting you to come closer.',
    'I bared everything I have and it still has not run. Good.',
    'This water, this bank, this whole bend of the river is mine.',
    'I do not bluff. The others know I do not bluff.',
  ],
  territorial: [
    'I have walked the entire border before the sun cleared the ridge.',
    'Fresh marking over the old one. Let them smell who returned.',
    'From this rock I can see everything that is mine, which is everything.',
    'A new scent on the eastern edge. It will be gone by dusk.',
  ],
  jealous: [
    'The other was fed first again. I have counted. It is always first.',
    'They groom the favored one and I watch from the cold side of the rock.',
    'My rival has the better perch and the better light. For now.',
    'Why does the warm spot always belong to someone else?',
  ],
  hungry: [
    'I can smell the herd on the far wind. Patience. Patience.',
    'The berries are not ripe and my stomach does not accept reasons.',
    'Tracks, two hours old. Worth following. Almost everything is worth following now.',
    'If the fish do not run soon I will have to go deeper than is safe.',
  ],
  confused: [
    'The stars are in the wrong place. Or I am. One of us has moved.',
    'This path led home a hundred times. It does not lead home today.',
    'The season feels like two seasons fighting inside one sky.',
    'Why is the water warm where it has always, always been cold?',
  ],
  alert: [
    'Movement, bearing low, eleven directions from the sun. Tracking.',
    'Every ear in the herd just turned the same way. So did mine.',
    'The birds went silent. The birds going silent means something.',
    'I have not blinked. I will not blink until I understand the shape.',
  ],
  curious: [
    'A new object on the shore. Shiny. Useless, probably. Still — shiny.',
    'The small humans left something with an interesting smell.',
    'I have never seen this kind of light bloom in the water before.',
    'What happens if I push this with my nose? Let us find out.',
  ],
  peaceful: [
    'The thermal lifts me and asks nothing in return. I ask nothing back.',
    'Warm mud, full belly, no danger on any wind. A complete day.',
    'The whole pod is breathing in the same slow rhythm as the swell.',
    'Sun on the back, grass to the horizon. There is nothing to improve.',
  ],
  content: [
    'The young are fed and sleeping. I can finally close one eye.',
    'This branch holds my weight perfectly. I may never move again.',
    'Good hunt, good rest, good company. The order does not matter.',
    'I found the exact patch of sun I was looking for.',
  ],
  joyful: [
    'The first warm current of the season and I am DIVING into it.',
    'The rains came! The whole plain smells like beginning again.',
    'My young took their first real leap today. I nearly burst.',
    'The flock turned all at once and for a moment we were one bird.',
  ],
  playful: [
    'I stole the stick. I have no plan for the stick. The stick is mine.',
    'If I splash the big one it will chase me. This is the best idea.',
    'Rolling down the slope on purpose is the finest invention of my life.',
    'I pretended not to see them so they would pounce. They pounced.',
  ],
  affectionate: [
    'I groomed the little one until it complained, and then a bit more.',
    'We pressed our sides together against the wind and that was the whole evening.',
    'My mate brought back the good fish. I have decided to keep them forever.',
    'The pup fell asleep on my paw and I will not be moving the paw.',
  ],
  proud: [
    'I led the herd across the river and not one was lost. Not one.',
    'The largest perch in the canyon, and it knows my name now.',
    'My song carried farther tonight than any of the younger ones.',
    'Three seasons holding this territory. Let them remember it.',
  ],
  determined: [
    'The summit pass is closing. I will beat the snow to it or I will not stop trying.',
    'The river is high. I have crossed higher. We go now.',
    'I will find the old feeding ground if it is the last thing these legs do.',
    'They scattered my family. I am gathering it back, one scent at a time.',
  ],
  smug: [
    'They built the fence taller. I found the gap before they finished.',
    'The clever predator went left. I am, of course, on the right.',
    'Everyone fought over the low fruit. I simply climbed.',
    'I have outlasted three rivals and an entire bad winter. Ask me how.',
  ],
}

// Emotions an archetype is *more* likely to express (weights the random pick).
const ARCHETYPE_BIAS: Record<Archetype, string[]> = {
  predator:  ['territorial', 'aggressive', 'alert', 'hungry', 'angry', 'proud', 'determined'],
  prey:      ['scared', 'alert', 'anxious', 'exhausted', 'content', 'peaceful', 'grieving'],
  marine:    ['peaceful', 'lonely', 'joyful', 'curious', 'desperate', 'confused', 'determined'],
  bird:      ['exhausted', 'determined', 'curious', 'peaceful', 'alert', 'joyful', 'lonely'],
  primate:   ['affectionate', 'jealous', 'curious', 'playful', 'grieving', 'smug', 'content'],
  reptile:   ['territorial', 'alert', 'hungry', 'aggressive', 'content', 'smug'],
  companion: ['playful', 'affectionate', 'curious', 'joyful', 'content', 'confused'],
}

const MOOD_FOR_EMOTION: Record<string, string> = {
  scared: 'distressed', desperate: 'distressed', dying: 'distressed', grieving: 'distressed',
  sad: 'distressed', lonely: 'distressed', anxious: 'anxious', exhausted: 'restless',
  angry: 'aggressive', aggressive: 'aggressive', territorial: 'aggressive', jealous: 'restless',
  hungry: 'restless', confused: 'anxious', alert: 'alert', curious: 'curious',
  peaceful: 'calm', content: 'content', joyful: 'playful', playful: 'playful',
  affectionate: 'content', proud: 'alert', determined: 'alert', smug: 'content',
}

function intensityFor(emotion: string): number {
  const high = ['dying', 'desperate', 'scared', 'aggressive', 'angry', 'determined']
  const low = ['peaceful', 'content', 'smug', 'affectionate', 'curious']
  if (high.includes(emotion)) return intIn(7, 10)
  if (low.includes(emotion)) return intIn(2, 5)
  return intIn(4, 8)
}

// Build the thought list for one animal: a weighted spread of emotions,
// no repeated lines, primary emotion first.
function buildThoughts(archetype: Archetype, primary: string, n: number): SeedThought[] {
  const bias = ARCHETYPE_BIAS[archetype]
  const used = new Set<string>()
  const out: SeedThought[] = []

  function addFrom(emotion: string) {
    const pool = THOUGHTS[emotion]
    if (!pool) return
    for (let tries = 0; tries < 6; tries++) {
      const line = pick(pool)
      if (!used.has(line)) {
        used.add(line)
        out.push({ text: line, intensity: intensityFor(emotion) })
        return
      }
    }
  }

  addFrom(primary)
  while (out.length < n) {
    const emotion = rng() < 0.6 ? pick(bias) : pick(EMOTION_VALUES)
    addFrom(emotion)
    if (used.size > 40) break
  }
  return out
}

export type GenerateOptions = {
  totalAnimals?: number
  minThoughts?: number
  maxThoughts?: number
}

export function generateAnimals(opts: GenerateOptions = {}): SeedAnimal[] {
  const total = opts.totalAnimals ?? 1500
  const minT = opts.minThoughts ?? 12
  const maxT = opts.maxThoughts ?? 15

  const animals: SeedAnimal[] = []
  let i = 0
  while (animals.length < total) {
    const def = SPECIES[i % SPECIES.length]
    i++

    const primary = pick(ARCHETYPE_BIAS[def.archetype])
    const n = intIn(minT, maxT)
    const thoughts = buildThoughts(def.archetype, primary, n)

    animals.push({
      name: pick(NAMES) + pick(SUFFIX),
      species: def.species,
      region: def.region,
      latitude: Number(jitter(def.lat, def.spread).toFixed(4)),
      longitude: Number(jitter(def.lng, def.spread).toFixed(4)),
      mood: MOOD_FOR_EMOTION[primary] ?? 'calm',
      emotion: primary,
      status: 'active',
      thoughts,
    })
  }
  return animals
}

// Distinct species list (used by the seed photo-resolver and FilterSidebar).
export const SPECIES_LIST = SPECIES.map(s => s.species)

// Fallback species photos (CC-licensed iNaturalist medium URLs).
// Used if the live API lookup fails during seeding.
export const PHOTO_FALLBACK: Record<string, string> = {}
