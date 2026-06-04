'use client'

import { useState } from 'react'
import { MOOD_VALUES, EMOTION_VALUES } from '@/lib/seedAnimals'

export type FilterState = {
  search: string
  species: string
  mood: string
  region: string
  emotion: string
}

const EMPTY_FILTERS: FilterState = {
  search: '',
  species: '',
  mood: '',
  region: '',
  emotion: '',
}

const SPECIES_OPTIONS = [
  'African Elephant', 'African Lion', 'American Bison', 'Andean Condor',
  'Asian Elephant', 'Atlantic Puffin', 'Bald Eagle', 'Bengal Tiger',
  'Blue Whale', 'Blue-footed Booby', 'Brown Bear', 'Cheetah',
  'Emperor Penguin', 'Eurasian Lynx', 'Giant Anteater', 'Giant Panda',
  'Giraffe', 'Golden Retriever', 'Gray Wolf', 'Great White Shark',
  'Green Sea Turtle', 'Grizzly Bear', 'Hippopotamus', 'Humpback Whale',
  'Jaguar', 'Japanese Macaque', 'Kiwi', 'Koala', 'Komodo Dragon',
  'Leopard Seal', 'Monarch Butterfly', 'Mountain Gorilla', 'Mountain Lion',
  'Narwhal', 'Nile Crocodile', 'Oceanic Manta Ray', 'Orangutan', 'Orca',
  'Pink River Dolphin', 'Polar Bear', 'Red Fox', 'Red Kangaroo',
  'Sea Otter', 'Siberian Tiger', 'Snow Leopard', 'Snowy Owl',
  'Tasmanian Devil', 'Wandering Albatross', 'Weddell Seal', 'White Stork',
  'Zebra',
]

const REGION_OPTIONS = [
  'Africa', 'Antarctica', 'Arctic', 'Arctic Ocean', 'Asia',
  'Atlantic Ocean', 'Europe', 'Indian Ocean', 'North America',
  'Oceania', 'Pacific Ocean', 'South America',
]

type Props = {
  onFilterChange?: (filters: FilterState) => void
}

export default function FilterSidebar({ onFilterChange }: Props) {
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS)

  function update(key: keyof FilterState, value: string) {
    const next = { ...filters, [key]: value }
    setFilters(next)
    onFilterChange?.(next)
  }

  function clearAll() {
    setFilters(EMPTY_FILTERS)
    onFilterChange?.(EMPTY_FILTERS)
  }

  const isActive = Object.values(filters).some(v => v !== '')

  return (
    <aside className="w-64 flex-shrink-0 flex flex-col bg-[#080c0f] border-r border-green-500/20 overflow-y-auto">

      {/* Header */}
      <div className="px-4 pt-5 pb-4 border-b border-green-500/20">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_6px_rgba(34,197,94,0.9)] animate-pulse" />
          <span className="font-mono text-[10px] tracking-[0.2em] text-green-400 uppercase">
            Project Noah
          </span>
        </div>
        <p className="font-mono text-[9px] tracking-[0.15em] text-green-500/50 uppercase pl-4">
          Satellite Intel Network
        </p>
      </div>

      {/* Scan label */}
      <div className="px-4 pt-4 pb-2">
        <p className="font-mono text-[9px] tracking-[0.2em] text-green-500/60 uppercase">
          ◈ Scan Parameters
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 px-4 pb-4">

        {/* Search */}
        <div className="flex flex-col gap-1.5">
          <label className="font-mono text-[9px] tracking-[0.18em] text-green-400/70 uppercase">
            Search
          </label>
          <input
            type="text"
            value={filters.search}
            onChange={e => update('search', e.target.value)}
            placeholder="name, species, region..."
            className="w-full bg-[#0a1410] border border-green-500/25 rounded px-3 py-2 text-xs text-green-100 placeholder-green-500/30 font-mono focus:outline-none focus:border-green-400/60 focus:shadow-[0_0_8px_rgba(34,197,94,0.15)] transition-all"
          />
        </div>

        {/* Species */}
        <div className="flex flex-col gap-1.5">
          <label className="font-mono text-[9px] tracking-[0.18em] text-green-400/70 uppercase">
            Species
          </label>
          <select
            value={filters.species}
            onChange={e => update('species', e.target.value)}
            className="w-full bg-[#0a1410] border border-green-500/25 rounded px-3 py-2 text-xs text-green-100 font-mono focus:outline-none focus:border-green-400/60 focus:shadow-[0_0_8px_rgba(34,197,94,0.15)] transition-all appearance-none cursor-pointer"
          >
            <option value="">All Species</option>
            {SPECIES_OPTIONS.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Region */}
        <div className="flex flex-col gap-1.5">
          <label className="font-mono text-[9px] tracking-[0.18em] text-green-400/70 uppercase">
            Region
          </label>
          <select
            value={filters.region}
            onChange={e => update('region', e.target.value)}
            className="w-full bg-[#0a1410] border border-green-500/25 rounded px-3 py-2 text-xs text-green-100 font-mono focus:outline-none focus:border-green-400/60 focus:shadow-[0_0_8px_rgba(34,197,94,0.15)] transition-all appearance-none cursor-pointer"
          >
            <option value="">All Regions</option>
            {REGION_OPTIONS.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        {/* Mood */}
        <div className="flex flex-col gap-1.5">
          <label className="font-mono text-[9px] tracking-[0.18em] text-green-400/70 uppercase">
            Mood
          </label>
          <select
            value={filters.mood}
            onChange={e => update('mood', e.target.value)}
            className="w-full bg-[#0a1410] border border-green-500/25 rounded px-3 py-2 text-xs text-green-100 font-mono focus:outline-none focus:border-green-400/60 focus:shadow-[0_0_8px_rgba(34,197,94,0.15)] transition-all appearance-none cursor-pointer"
          >
            <option value="">All Moods</option>
            {MOOD_VALUES.map(m => (
              <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>
            ))}
          </select>
        </div>

        {/* Emotion */}
        <div className="flex flex-col gap-1.5">
          <label className="font-mono text-[9px] tracking-[0.18em] text-green-400/70 uppercase">
            Emotion
          </label>
          <select
            value={filters.emotion}
            onChange={e => update('emotion', e.target.value)}
            className="w-full bg-[#0a1410] border border-green-500/25 rounded px-3 py-2 text-xs text-green-100 font-mono focus:outline-none focus:border-green-400/60 focus:shadow-[0_0_8px_rgba(34,197,94,0.15)] transition-all appearance-none cursor-pointer"
          >
            <option value="">All Emotions</option>
            {EMOTION_VALUES.map(e => (
              <option key={e} value={e}>{e.charAt(0).toUpperCase() + e.slice(1)}</option>
            ))}
          </select>
        </div>

        {/* Clear button */}
        <button
          onClick={clearAll}
          disabled={!isActive}
          className="w-full mt-1 py-2 px-3 font-mono text-[10px] tracking-[0.18em] uppercase rounded border transition-all
            disabled:opacity-25 disabled:cursor-not-allowed
            border-green-500/30 text-green-400/70 hover:border-green-400/60 hover:text-green-300 hover:bg-green-500/5
            disabled:hover:border-green-500/30 disabled:hover:text-green-400/70 disabled:hover:bg-transparent"
        >
          ✕ Clear Filters
        </button>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Status footer */}
      <div className="px-4 py-4 border-t border-green-500/20">
        <p className="font-mono text-[9px] tracking-[0.15em] text-green-500/50 uppercase mb-2">
          Signal Status
        </p>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_4px_rgba(34,197,94,0.8)]" />
          <span className="font-mono text-[10px] text-green-400/80">Online</span>
          <span className="font-mono text-[10px] text-green-500/40 ml-auto">52 subjects</span>
        </div>
        <div className="mt-2 h-px bg-gradient-to-r from-green-500/30 via-green-400/10 to-transparent" />
        <p className="font-mono text-[8px] tracking-[0.1em] text-green-500/30 uppercase mt-2">
          Thought-translation satellites: nominal
        </p>
      </div>
    </aside>
  )
}
