'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import FilterSidebar, { type FilterState } from '@/components/sidebar/FilterSidebar'
import SatelliteMap from '@/components/map/SatelliteMap'
import MapStatsBar from '@/components/dashboard/MapStatsBar'
import ThoughtFeed from '@/components/feed/ThoughtFeed'
import BootSequence from '@/components/BootSequence'

type Thought = { id: string; text: string; intensity: number }

export type Animal = {
  id: string
  name: string
  species: string
  region: string
  latitude: number
  longitude: number
  mood: string
  emotion: string
  photoUrl?: string | null
  photoAttribution?: string | null
  thoughts: Thought[]
}

const EMPTY_FILTERS: FilterState = {
  search: '',
  species: '',
  mood: '',
  region: '',
  emotion: '',
  distress: false,
}

function buildQuery(filters: FilterState): string {
  const params = new URLSearchParams()
  if (filters.search)  params.set('search', filters.search)
  if (filters.species) params.set('species', filters.species)
  if (filters.mood)    params.set('mood', filters.mood)
  if (filters.region)  params.set('region', filters.region)
  if (filters.emotion) params.set('emotion', filters.emotion)
  if (filters.distress) params.set('distress', '1')
  const qs = params.toString()
  return qs ? `/api/animals?${qs}` : '/api/animals'
}

export default function MapShell() {
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS)
  const [animals, setAnimals] = useState<Animal[]>([])
  const [selected, setSelected] = useState<Animal | null>(null)
  const [booting, setBooting] = useState(true)
  const flyRef = useRef<((a: Animal) => void) | null>(null)

  // Select an animal and fly the camera to it (used by feed + map clicks).
  const selectAndFly = useCallback((a: Animal | null) => {
    setSelected(a)
    if (a) flyRef.current?.(a)
  }, [])

  const handleMapSelect = useCallback((a: Animal | null) => {
    setSelected(a)
  }, [])

  useEffect(() => {
    fetch(buildQuery(filters))
      .then(r => r.json())
      .then(setAnimals)
      .catch(() => setAnimals([]))
  }, [filters])

  return (
    <>
      {booting && <BootSequence onDone={() => setBooting(false)} />}

      <div className="flex h-screen overflow-hidden bg-[var(--background)] text-[var(--foreground)]">
        <FilterSidebar onFilterChange={setFilters} count={animals.length} />

        <main className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 relative min-h-0">
            <SatelliteMap
              animals={animals}
              selected={selected}
              onSelect={handleMapSelect}
              flyRef={flyRef}
            />

            {/* Concept / simulated-data marker */}
            <div className="pointer-events-none absolute top-3 left-1/2 -translate-x-1/2 z-10">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--surface)]/85 border border-[var(--line)] backdrop-blur-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-300/80" />
                <span className="font-mono text-[8px] tracking-[0.22em] uppercase text-[var(--muted)]">
                  Simulated data · concept prototype
                </span>
              </div>
            </div>
          </div>
          <MapStatsBar animals={animals} />
        </main>

        <ThoughtFeed animals={animals} onSelect={selectAndFly} />
      </div>
    </>
  )
}
