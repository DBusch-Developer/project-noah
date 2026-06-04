'use client'

import { useState } from 'react'
import Map, { Marker, Popup, NavigationControl, type ViewStateChangeEvent } from 'react-map-gl/mapbox'
import 'mapbox-gl/dist/mapbox-gl.css'
import type { Animal } from '@/components/MapShell'

const SPECIES_EMOJI: Record<string, string> = {
  'Bald Eagle': '🦅',
  'Gray Wolf': '🐺',
  'Grizzly Bear': '🐻',
  'Sea Otter': '🦦',
  'American Bison': '🦬',
  'Mountain Lion': '🐱',
  'Golden Retriever': '🐕',
  'Monarch Butterfly': '🦋',
  'Humpback Whale': '🐋',
  'Snowy Owl': '🦉',
  'Jaguar': '🐆',
  'Andean Condor': '🦅',
  'Pink River Dolphin': '🐬',
  'Giant Anteater': '🐜',
  'Blue-footed Booby': '🐦',
  'Red Fox': '🦊',
  'Brown Bear': '🐻',
  'Atlantic Puffin': '🐧',
  'White Stork': '🦢',
  'Eurasian Lynx': '🐈',
  'African Elephant': '🐘',
  'African Lion': '🦁',
  'Cheetah': '🐆',
  'Mountain Gorilla': '🦍',
  'Giraffe': '🦒',
  'Nile Crocodile': '🐊',
  'Zebra': '🦓',
  'Hippopotamus': '🦛',
  'Giant Panda': '🐼',
  'Snow Leopard': '🐆',
  'Orangutan': '🦧',
  'Bengal Tiger': '🐯',
  'Japanese Macaque': '🐒',
  'Komodo Dragon': '🦎',
  'Asian Elephant': '🐘',
  'Siberian Tiger': '🐯',
  'Red Kangaroo': '🦘',
  'Koala': '🐨',
  'Kiwi': '🐦',
  'Great White Shark': '🦈',
  'Tasmanian Devil': '🐾',
  'Emperor Penguin': '🐧',
  'Leopard Seal': '🦭',
  'Wandering Albatross': '🕊️',
  'Weddell Seal': '🦭',
  'Blue Whale': '🐋',
  'Green Sea Turtle': '🐢',
  'Oceanic Manta Ray': '🐠',
  'Orca': '🐋',
  'Narwhal': '🐬',
  'Polar Bear': '🐻',
}

function getEmoji(species: string) {
  return SPECIES_EMOJI[species] ?? '🐾'
}

const MOOD_COLOR: Record<string, string> = {
  calm:     'text-blue-300 border-blue-400/40',
  alert:    'text-yellow-300 border-yellow-400/40',
  curious:  'text-purple-300 border-purple-400/40',
  restless: 'text-orange-300 border-orange-400/40',
  content:  'text-green-300 border-green-400/40',
  anxious:  'text-red-300 border-red-400/40',
  playful:  'text-pink-300 border-pink-400/40',
}

export default function SatelliteMap({ animals }: { animals: Animal[] }) {
  const [selected, setSelected] = useState<Animal | null>(null)
  const [zoom, setZoom] = useState(2)

  function handleZoom(e: ViewStateChangeEvent) {
    setZoom(e.viewState.zoom)
  }

  const isClose = zoom >= 5

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
          {isClose ? (
            <div
              className="flex flex-col items-center cursor-pointer select-none"
              style={{ animation: 'npc-float 3s ease-in-out infinite' }}
              title={animal.name}
            >
              <div className="text-3xl drop-shadow-[0_0_8px_rgba(34,197,94,0.9)]">
                {getEmoji(animal.species)}
              </div>
              <div className="mt-0.5 px-1.5 py-0.5 bg-black/70 border border-green-500/40 rounded text-[8px] font-mono text-green-300 tracking-wide whitespace-nowrap">
                {animal.name}
              </div>
            </div>
          ) : (
            <div className="relative cursor-pointer" title={animal.name}>
              <div className="w-3 h-3 rounded-full bg-green-400 border border-green-300 shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
              <div className="absolute inset-0 rounded-full bg-green-400 opacity-60 animate-ping" />
            </div>
          )}
        </Marker>
      ))}

      {selected && (
        <Popup
          longitude={selected.longitude}
          latitude={selected.latitude}
          anchor="bottom"
          onClose={() => setSelected(null)}
          closeOnClick={false}
          offset={isClose ? 60 : 16}
        >
          <div className="min-w-[240px]">

            {/* Character portrait */}
            <div className="flex items-center gap-3 mb-3 pb-3 border-b border-green-500/20">
              <div
                className="text-5xl leading-none drop-shadow-[0_0_12px_rgba(34,197,94,0.8)]"
                style={{ animation: 'npc-float 3s ease-in-out infinite' }}
              >
                {getEmoji(selected.species)}
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-white font-semibold text-sm leading-tight">{selected.name}</p>
                <p className="font-mono text-[9px] tracking-widest text-green-400/80">
                  {selected.species.toUpperCase()}
                </p>
                <p className="font-mono text-[9px] text-green-500/50">{selected.region}</p>
              </div>
            </div>

            {/* Mood + emotion badges */}
            <div className="flex gap-1.5 mb-3">
              <span className={`px-2 py-0.5 rounded border font-mono text-[9px] tracking-wide ${MOOD_COLOR[selected.mood] ?? 'text-green-300 border-green-400/40'}`}>
                {selected.mood.toUpperCase()}
              </span>
              <span className="px-2 py-0.5 rounded border border-green-500/20 font-mono text-[9px] tracking-wide text-green-500/60">
                {selected.emotion.toUpperCase()}
              </span>
            </div>

            {/* Thought */}
            {selected.thoughts[0] && (
              <div className="bg-black/30 border border-green-500/15 rounded p-2">
                <p className="font-mono text-[9px] tracking-widest text-green-500/50 mb-1">◈ TRANSLATED THOUGHT</p>
                <p className="text-zinc-200 italic text-xs leading-relaxed">
                  &ldquo;{selected.thoughts[0].text}&rdquo;
                </p>
              </div>
            )}

          </div>
        </Popup>
      )}
    </Map>
  )
}
