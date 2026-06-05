'use client'

import { useState } from 'react'
import { MOOD_VALUES, EMOTION_VALUES } from '@/lib/seedAnimals'
import { SPECIES_LIST } from '@/lib/generateSeed'

export type FilterState = {
  search: string
  species: string
  mood: string
  region: string
  emotion: string
  distress: boolean
}

const EMPTY_FILTERS: FilterState = {
  search: '',
  species: '',
  mood: '',
  region: '',
  emotion: '',
  distress: false,
}

const REGION_OPTIONS = [
  'Africa', 'Antarctica', 'Arctic', 'Arctic Ocean', 'Asia',
  'Atlantic Ocean', 'Europe', 'Indian Ocean', 'North America',
  'Oceania', 'Pacific Ocean', 'South America',
]

type Props = {
  onFilterChange?: (filters: FilterState) => void
  count?: number
}

export default function FilterSidebar({ onFilterChange, count }: Props) {
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS)

  function update<K extends keyof FilterState>(key: K, value: FilterState[K]) {
    const next = { ...filters, [key]: value }
    setFilters(next)
    onFilterChange?.(next)
  }

  function clearAll() {
    setFilters(EMPTY_FILTERS)
    onFilterChange?.(EMPTY_FILTERS)
  }

  const isActive = filters.distress || Object.entries(filters).some(
    ([k, v]) => k !== 'distress' && v !== ''
  )

  return (
    <aside className="w-64 flex-shrink-0 flex flex-col bg-[var(--surface)] border-r border-[var(--line)] overflow-y-auto">

      {/* Header */}
      <div className="px-4 pt-5 pb-4 border-b border-[var(--line)]">
        <div className="flex items-center gap-2 mb-1">
          <div
            className="w-2 h-2 rounded-full"
            style={{
              background: 'radial-gradient(circle at 50% 40%, #8fd6e8, #4fd1c5 60%, #1f6b66)',
              boxShadow: '0 0 10px rgba(79,209,197,0.6)',
            }}
          />
          <span className="font-mono text-[10px] tracking-[0.2em] text-teal-200 uppercase">
            Project Noah
          </span>
        </div>
        <p className="font-mono text-[9px] tracking-[0.15em] text-[var(--muted)] uppercase pl-4">
          Satellite Intel Network
        </p>
      </div>

      {/* Scan label */}
      <div className="px-4 pt-4 pb-2">
        <p className="font-mono text-[9px] tracking-[0.2em] text-[var(--muted)] uppercase">
          ◈ Scan Parameters
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 px-4 pb-4">

        {/* Search */}
        <div className="flex flex-col gap-1.5">
          <label className="font-mono text-[9px] tracking-[0.18em] text-teal-200/70 uppercase">
            Search
          </label>
          <input
            type="text"
            value={filters.search}
            onChange={e => update('search', e.target.value)}
            placeholder="name, species, region..."
            className="w-full bg-[var(--surface-2)] border border-[var(--line)] rounded px-3 py-2 text-xs text-[var(--foreground)] placeholder-[var(--muted)]/40 font-mono focus:outline-none focus:border-teal-300/60 focus:shadow-[0_0_10px_rgba(79,209,197,0.18)] transition-all"
          />
        </div>

        {/* Species */}
        <div className="flex flex-col gap-1.5">
          <label className="font-mono text-[9px] tracking-[0.18em] text-teal-200/70 uppercase">
            Species
          </label>
          <select
            value={filters.species}
            onChange={e => update('species', e.target.value)}
            className="w-full bg-[var(--surface-2)] border border-[var(--line)] rounded px-3 py-2 text-xs text-[var(--foreground)] font-mono focus:outline-none focus:border-teal-300/60 focus:shadow-[0_0_10px_rgba(79,209,197,0.18)] transition-all appearance-none cursor-pointer"
          >
            <option value="">All Species</option>
            {SPECIES_LIST.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Region */}
        <div className="flex flex-col gap-1.5">
          <label className="font-mono text-[9px] tracking-[0.18em] text-teal-200/70 uppercase">
            Region
          </label>
          <select
            value={filters.region}
            onChange={e => update('region', e.target.value)}
            className="w-full bg-[var(--surface-2)] border border-[var(--line)] rounded px-3 py-2 text-xs text-[var(--foreground)] font-mono focus:outline-none focus:border-teal-300/60 focus:shadow-[0_0_10px_rgba(79,209,197,0.18)] transition-all appearance-none cursor-pointer"
          >
            <option value="">All Regions</option>
            {REGION_OPTIONS.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        {/* Mood */}
        <div className="flex flex-col gap-1.5">
          <label className="font-mono text-[9px] tracking-[0.18em] text-teal-200/70 uppercase">
            Mood
          </label>
          <select
            value={filters.mood}
            onChange={e => update('mood', e.target.value)}
            className="w-full bg-[var(--surface-2)] border border-[var(--line)] rounded px-3 py-2 text-xs text-[var(--foreground)] font-mono focus:outline-none focus:border-teal-300/60 focus:shadow-[0_0_10px_rgba(79,209,197,0.18)] transition-all appearance-none cursor-pointer"
          >
            <option value="">All Moods</option>
            {MOOD_VALUES.map(m => (
              <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>
            ))}
          </select>
        </div>

        {/* Emotion */}
        <div className="flex flex-col gap-1.5">
          <label className="font-mono text-[9px] tracking-[0.18em] text-teal-200/70 uppercase">
            Emotion
          </label>
          <select
            value={filters.emotion}
            onChange={e => update('emotion', e.target.value)}
            className="w-full bg-[var(--surface-2)] border border-[var(--line)] rounded px-3 py-2 text-xs text-[var(--foreground)] font-mono focus:outline-none focus:border-teal-300/60 focus:shadow-[0_0_10px_rgba(79,209,197,0.18)] transition-all appearance-none cursor-pointer"
          >
            <option value="">All Emotions</option>
            {EMOTION_VALUES.map(e => (
              <option key={e} value={e}>{e.charAt(0).toUpperCase() + e.slice(1)}</option>
            ))}
          </select>
        </div>

        {/* Distress toggle */}
        <button
          onClick={() => update('distress', !filters.distress)}
          className={`w-full py-2 px-3 font-mono text-[10px] tracking-[0.18em] uppercase rounded border transition-all
            ${filters.distress
              ? 'border-rose-400/60 text-rose-300 bg-rose-500/10 shadow-[0_0_8px_rgba(251,113,133,0.15)]'
              : 'border-rose-500/30 text-rose-400/60 hover:border-rose-400/50 hover:text-rose-300 hover:bg-rose-500/5'
            }`}
        >
          {filters.distress ? '▲ Distress Signals Only' : '◈ Distress Signals Only'}
        </button>

        {/* Clear button */}
        <button
          onClick={clearAll}
          disabled={!isActive}
          className="w-full py-2 px-3 font-mono text-[10px] tracking-[0.18em] uppercase rounded border transition-all
            disabled:opacity-25 disabled:cursor-not-allowed
            border-[var(--line)] text-teal-200/70 hover:border-teal-200/60 hover:text-teal-300 hover:bg-teal-500/5
            disabled:hover:border-[var(--line)] disabled:hover:text-teal-200/70 disabled:hover:bg-transparent"
        >
          ✕ Clear Filters
        </button>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Status footer */}
      <div className="px-4 py-4 border-t border-[var(--line)]">
        <p className="font-mono text-[9px] tracking-[0.15em] text-[var(--muted)] uppercase mb-2">
          Signal Status
        </p>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_5px_rgba(94,224,160,0.8)]" />
          <span className="font-mono text-[10px] text-emerald-300/90">Online</span>
          {count !== undefined && (
            <span className="font-mono text-[10px] text-[var(--muted)]/50 ml-auto">{count} subjects</span>
          )}
        </div>
        <div className="mt-2 h-px bg-gradient-to-r from-teal-400/30 via-cyan-400/12 to-transparent" />
        <p className="font-mono text-[8px] tracking-[0.1em] text-[var(--muted)] uppercase mt-2">
          Thought-translation satellites: nominal
        </p>
      </div>
    </aside>
  )
}
