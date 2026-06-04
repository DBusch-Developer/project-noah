'use client'

import { useEffect, useState } from 'react'
import Map, { Marker, Popup, NavigationControl, type ViewStateChangeEvent } from 'react-map-gl/mapbox'
import 'mapbox-gl/dist/mapbox-gl.css'

type Thought = { id: string; text: string; intensity: number }

type Animal = {
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

export default function SatelliteMap() {
  const [animals, setAnimals] = useState<Animal[]>([])
  const [selected, setSelected] = useState<Animal | null>(null)
  const [zoom, setZoom] = useState(2)

  useEffect(() => {
    fetch('/api/animals')
      .then(r => r.json())
      .then(setAnimals)
  }, [])

  function handleZoom(e: ViewStateChangeEvent) {
    setZoom(e.viewState.zoom)
  }

  return (
    <Map
      mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
      mapStyle="mapbox://styles/mapbox/satellite-v9"
      initialViewState={{ longitude: 0, latitude: 20, zoom: 2 }}
      style={{ width: '100%', height: '100%' }}
      onZoom={handleZoom}
      onClick={() => setSelected(null)}
    >
      <NavigationControl position="top-right" />

      {animals.map(animal => (
        <Marker
          key={animal.id}
          longitude={animal.longitude}
          latitude={animal.latitude}
          anchor="center"
          onClick={e => {
            e.originalEvent.stopPropagation()
            setSelected(animal)
          }}
        >
          <div className="relative cursor-pointer" title={animal.name}>
            <div className="w-3 h-3 rounded-full bg-green-400 border border-green-300 shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
            <div className="absolute inset-0 rounded-full bg-green-400 opacity-60 animate-ping" />
          </div>
        </Marker>
      ))}

      {selected && (
        <Popup
          longitude={selected.longitude}
          latitude={selected.latitude}
          anchor="bottom"
          onClose={() => setSelected(null)}
          closeOnClick={false}
          offset={16}
        >
          <div className="min-w-[220px]">
            <p className="font-mono text-[10px] tracking-widest text-green-400 mb-1">
              {selected.species.toUpperCase()} // {selected.region.toUpperCase()}
            </p>
            <p className="text-white font-semibold text-sm">{selected.name}</p>
            <p className="text-green-300/70 text-xs mt-0.5">
              {selected.mood} · {selected.emotion}
            </p>
            {zoom >= 5 && selected.thoughts[0] && (
              <p className="mt-2 text-zinc-300 italic text-xs border-t border-green-500/20 pt-2 leading-relaxed">
                &ldquo;{selected.thoughts[0].text}&rdquo;
              </p>
            )}
          </div>
        </Popup>
      )}
    </Map>
  )
}
