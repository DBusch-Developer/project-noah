import SatelliteMap from '@/components/map/SatelliteMap'
import FilterSidebar from '@/components/sidebar/FilterSidebar'
import MapStatsBar from '@/components/dashboard/MapStatsBar'

export default function Home() {
  return (
    <div className="flex h-screen overflow-hidden bg-[#080c0f] text-zinc-100">
      <FilterSidebar />
      <main className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 relative min-h-0">
          <SatelliteMap />
        </div>
        <MapStatsBar />
      </main>
    </div>
  )
}
