'use client'

import type { Animal } from '@/components/MapShell'
import { emotionHex } from '@/lib/emotion'

function computeStats(animals: Animal[]) {
  if (animals.length === 0) {
    return { count: 0, dominantEmotion: '—', topSpecies: '—', activeRegions: 0, avgIntensity: 0 }
  }

  const emotionCount: Record<string, number> = {}
  const speciesCount: Record<string, number> = {}
  const regions = new Set<string>()
  let intensitySum = 0
  let intensityN = 0

  for (const a of animals) {
    emotionCount[a.emotion] = (emotionCount[a.emotion] ?? 0) + 1
    speciesCount[a.species] = (speciesCount[a.species] ?? 0) + 1
    regions.add(a.region)
    const i = a.thoughts?.[0]?.intensity
    if (typeof i === 'number') { intensitySum += i; intensityN += 1 }
  }

  const dominantEmotion = Object.entries(emotionCount).sort((a, b) => b[1] - a[1])[0][0]
  const topSpecies = Object.entries(speciesCount).sort((a, b) => b[1] - a[1])[0][0]
  const avgIntensity = intensityN ? Math.round((intensitySum / intensityN) * 10) / 10 : 0

  return { count: animals.length, dominantEmotion, topSpecies, activeRegions: regions.size, avgIntensity }
}

export default function MapStatsBar({ animals }: { animals: Animal[] }) {
  const stats = computeStats(animals)
  const emoHex = stats.dominantEmotion === '—' ? '#4fd1c5' : emotionHex(stats.dominantEmotion)

  return (
    <div className="h-12 flex items-center gap-px bg-[var(--surface)] border-t border-[var(--line)] font-mono text-xs shrink-0">
      <Stat label="SIGNALS DETECTED" value={String(stats.count)} />
      <Stat label="DOMINANT EMOTION" value={stats.dominantEmotion.toUpperCase()} color={emoHex} />
      <Stat label="TOP SPECIES" value={stats.topSpecies.toUpperCase()} />
      <Stat label="AVG INTENSITY" value={stats.avgIntensity ? `${stats.avgIntensity}/10` : '—'} />
      <Stat label="ACTIVE REGIONS" value={String(stats.activeRegions)} />
    </div>
  )
}

function Stat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center h-full border-r border-[var(--line)] last:border-r-0 px-4">
      <span className="text-[var(--muted)]/60 text-[9px] tracking-widest">{label}</span>
      <span className="font-semibold text-sm leading-tight" style={{ color: color ?? 'var(--teal)' }}>{value}</span>
    </div>
  )
}
