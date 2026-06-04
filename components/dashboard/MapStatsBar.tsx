'use client'

import { useEffect, useState } from 'react'

type Animal = {
  id: string
  species: string
  mood: string
  region: string
}

type Stats = {
  count: number
  dominantMood: string
  topSpecies: string
  activeRegions: number
}

function computeStats(animals: Animal[]): Stats {
  if (animals.length === 0) {
    return { count: 0, dominantMood: '—', topSpecies: '—', activeRegions: 0 }
  }

  const moodCount: Record<string, number> = {}
  const speciesCount: Record<string, number> = {}
  const regions = new Set<string>()

  for (const a of animals) {
    moodCount[a.mood] = (moodCount[a.mood] ?? 0) + 1
    speciesCount[a.species] = (speciesCount[a.species] ?? 0) + 1
    regions.add(a.region)
  }

  const dominantMood = Object.entries(moodCount).sort((a, b) => b[1] - a[1])[0][0]
  const topSpecies = Object.entries(speciesCount).sort((a, b) => b[1] - a[1])[0][0]

  return { count: animals.length, dominantMood, topSpecies, activeRegions: regions.size }
}

export default function MapStatsBar() {
  const [stats, setStats] = useState<Stats>({ count: 0, dominantMood: '—', topSpecies: '—', activeRegions: 0 })

  useEffect(() => {
    fetch('/api/animals')
      .then(r => r.json())
      .then((animals: Animal[]) => setStats(computeStats(animals)))
  }, [])

  return (
    <div className="h-12 flex items-center gap-px bg-[#050c08] border-t border-green-500/20 font-mono text-xs shrink-0">
      <Stat label="SIGNALS DETECTED" value={String(stats.count)} />
      <Stat label="DOMINANT MOOD" value={stats.dominantMood.toUpperCase()} />
      <Stat label="TOP SPECIES" value={stats.topSpecies.toUpperCase()} />
      <Stat label="ACTIVE REGIONS" value={String(stats.activeRegions)} />
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center h-full border-r border-green-500/10 last:border-r-0 px-4">
      <span className="text-green-500/50 text-[9px] tracking-widest">{label}</span>
      <span className="text-green-400 font-semibold text-sm leading-tight">{value}</span>
    </div>
  )
}
