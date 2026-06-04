'use client'

import { useEffect, useState } from 'react'
import FilterSidebar, { type FilterState } from '@/components/sidebar/FilterSidebar'
import SatelliteMap from '@/components/map/SatelliteMap'
import MapStatsBar from '@/components/dashboard/MapStatsBar'

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
  thoughts: Thought[]
}

const EMPTY_FILTERS: FilterState = {
  search: '',
  species: '',
  mood: '',
  region: '',
  emotion: '',
}

function buildQuery(filters: FilterState): string {
  const params = new URLSearchParams()
  if (filters.search)  params.set('search', filters.search)
  if (filters.species) params.set('species', filters.species)
  if (filters.mood)    params.set('mood', filters.mood)
  if (filters.region)  params.set('region', filters.region)
  if (filters.emotion) params.set('emotion', filters.emotion)
  const qs = params.toString()
  return qs ? `/api/animals?${qs}` : '/api/animals'
}

export default function MapShell() {
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS)
  const [animals, setAnimals] = useState<Animal[]>([])

  useEffect(() => {
    fetch(buildQuery(filters))
      .then(r => r.json())
      .then(setAnimals)
  }, [filters])

  return (
    <div className="flex h-screen overflow-hidden bg-[#080c0f] text-zinc-100">
      <FilterSidebar onFilterChange={setFilters} />
      <main className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 relative min-h-0">
          <SatelliteMap animals={animals} />
        </div>
        <MapStatsBar animals={animals} />
      </main>
    </div>
  )
}
