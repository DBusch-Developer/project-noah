'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Map, {
  Source, Layer, Popup, NavigationControl, Marker,
  type MapRef, type ViewStateChangeEvent, type MapMouseEvent, type LayerProps,
} from 'react-map-gl/mapbox'
import 'mapbox-gl/dist/mapbox-gl.css'
import type { Animal } from '@/components/MapShell'
import ThoughtBubble from '@/components/map/ThoughtBubble'
import AnimalAvatar from '@/components/AnimalAvatar'
import { emotionHex, EMOTION_HEX } from '@/lib/emotion'

type Props = {
  animals: Animal[]
  selected: Animal | null
  onSelect: (a: Animal | null) => void
  // ref handle so the feed can fly the camera to an animal
  flyRef?: React.MutableRefObject<((a: Animal) => void) | null>
}

const CLOSE_ZOOM = 5

// Build a Mapbox "match" expression mapping emotion -> hex, so the GPU layer
// colors every point with zero per-feature React work.
function emotionColorExpression(): any {
  const expr: any[] = ['match', ['get', 'emotion']]
  for (const [emotion, hex] of Object.entries(EMOTION_HEX)) {
    expr.push(emotion, hex)
  }
  expr.push('#4fd1c5') // default
  return expr
}

export default function SatelliteMap({ animals, selected, onSelect, flyRef }: Props) {
  const mapRef = useRef<MapRef | null>(null)
  const [isClose, setIsClose] = useState(false)
  const spinningRef = useRef(true)
  const rafRef = useRef<number | null>(null)
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const selectedRef = useRef<Animal | null>(selected)
  selectedRef.current = selected

  // ── GeoJSON for the GPU point layers (memoized; only rebuilds when data changes)
  const geojson = useMemo(
    () => ({
      type: 'FeatureCollection' as const,
      features: animals.map(a => ({
        type: 'Feature' as const,
        geometry: { type: 'Point' as const, coordinates: [a.longitude, a.latitude] },
        properties: {
          id: a.id,
          emotion: a.emotion,
          intensity: a.thoughts?.[0]?.intensity ?? 5,
        },
      })),
    }),
    [animals],
  )

  const colorExpr = useMemo(emotionColorExpression, [])

  // Glow halo (larger, translucent, sized by intensity)
  const glowLayer: LayerProps = {
    id: 'animal-glow',
    type: 'circle',
    paint: {
      'circle-color': colorExpr,
      'circle-opacity': 0.18,
      'circle-radius': ['interpolate', ['linear'], ['get', 'intensity'], 0, 6, 10, 16],
      'circle-blur': 0.6,
    },
  }
  // Solid core dot
  const dotLayer: LayerProps = {
    id: 'animal-dots',
    type: 'circle',
    paint: {
      'circle-color': colorExpr,
      'circle-radius': ['interpolate', ['linear'], ['get', 'intensity'], 0, 3, 10, 6],
      'circle-stroke-width': 1,
      'circle-stroke-color': 'rgba(232,244,248,0.5)',
    },
  }

  // ── Atmosphere backdrop
  const applyFog = useCallback(() => {
    const map = mapRef.current?.getMap()
    if (!map) return
    map.setFog({
      color: 'rgb(12, 22, 30)',
      'high-color': 'rgb(20, 60, 75)',
      'horizon-blend': 0.04,
      'space-color': 'rgb(4, 8, 12)',
      'star-intensity': ['interpolate', ['linear'], ['zoom'], 1, 0.7, 4, 0.2, 6, 0] as any,
    } as any)
  }, [])

  const handleLoad = useCallback(() => {
    const map = mapRef.current?.getMap()
    if (!map) return
    // 'style.load' is the documented, reliable hook for setFog — it guarantees
    // the style's atmosphere is parsed. Fall back to immediate apply if already loaded.
    if (map.isStyleLoaded()) applyFog()
    map.on('style.load', applyFog)
  }, [applyFog])

  // ── Throttled zoom -> only flip React state when crossing the close threshold
  const handleZoom = useCallback((e: ViewStateChangeEvent) => {
    const close = e.viewState.zoom >= CLOSE_ZOOM
    setIsClose(prev => (prev !== close ? close : prev))
  }, [])

  // ── Auto-spin: single loop, reads live zoom from the map (no re-subscribe)
  useEffect(() => {
    let last = performance.now()
    function frame(now: number) {
      const map = mapRef.current?.getMap()
      const dt = now - last
      last = now
      if (map && spinningRef.current && !selectedRef.current) {
        const z = map.getZoom()
        const degPerMs = 0.004 * Math.max(0.15, 1 - z / 6)
        const c = map.getCenter()
        c.lng = ((c.lng + degPerMs * dt + 180) % 360) - 180
        map.setCenter(c)
      }
      rafRef.current = requestAnimationFrame(frame)
    }
    rafRef.current = requestAnimationFrame(frame)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [])

  const pauseSpin = useCallback(() => {
    spinningRef.current = false
    if (resumeTimer.current) clearTimeout(resumeTimer.current)
    resumeTimer.current = setTimeout(() => { spinningRef.current = true }, 5000)
  }, [])

  // ── Fly to an animal (used by feed clicks + marker clicks)
  const flyTo = useCallback((a: Animal) => {
    const map = mapRef.current?.getMap()
    if (!map) return
    spinningRef.current = false
    if (resumeTimer.current) clearTimeout(resumeTimer.current)
    map.flyTo({
      center: [a.longitude, a.latitude],
      zoom: 6.5,
      duration: 2200,
      essential: true,
    })
  }, [])

  // expose flyTo to parent (feed)
  useEffect(() => {
    if (flyRef) flyRef.current = flyTo
  }, [flyRef, flyTo])

  // ── Cheap "alive" pulse: animate one paint property on the glow layer.
  // This is a single GPU uniform update per frame — not 1,500 DOM animations.
  useEffect(() => {
    let raf = 0
    const start = performance.now()
    function tick(now: number) {
      const map = mapRef.current?.getMap()
      if (map && map.getLayer('animal-glow')) {
        const t = (now - start) / 1000
        const pulse = 0.5 + 0.5 * Math.sin(t * 1.6) // 0..1
        const base = 0.12 + pulse * 0.12             // opacity 0.12..0.24
        map.setPaintProperty('animal-glow', 'circle-opacity', base)
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  // ── Click handling on the GPU layers
  const handleMapClick = useCallback((e: MapMouseEvent) => {
    const feat = e.features?.[0]
    if (feat?.properties?.id) {
      const a = animals.find(x => x.id === feat.properties!.id)
      if (a) { onSelect(a); return }
    }
    onSelect(null)
  }, [animals, onSelect])

  return (
    <Map
      ref={mapRef}
      mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
      mapStyle="mapbox://styles/mapbox/satellite-v9"
      projection={{ name: 'globe' }}
      fog={{
        color: 'rgb(12, 22, 30)',
        'high-color': 'rgb(20, 60, 75)',
        'horizon-blend': 0.04,
        'space-color': 'rgb(4, 8, 12)',
        'star-intensity': ['interpolate', ['linear'], ['zoom'], 1, 0.7, 4, 0.2, 6, 0],
      } as any}
      initialViewState={{ longitude: 0, latitude: 20, zoom: 1.1 }}
      maxZoom={16}
      style={{ width: '100%', height: '100%' }}
      interactiveLayerIds={['animal-dots', 'animal-glow']}
      onLoad={handleLoad}
      onZoom={handleZoom}
      onMouseDown={pauseSpin}
      onTouchStart={pauseSpin}
      onDragStart={pauseSpin}
      onClick={handleMapClick}
    >
      <NavigationControl position="top-right" />

      {/* All points as two GPU layers — scales to thousands smoothly */}
      <Source id="animals" type="geojson" data={geojson}>
        <Layer {...glowLayer} />
        <Layer {...dotLayer} />
      </Source>

      {/* Close-up: render photo avatars only for points in view (few at a time) */}
      {isClose && <CloseUpAvatars animals={animals} mapRef={mapRef} onSelect={onSelect} />}

      {selected && (
        <Popup
          longitude={selected.longitude}
          latitude={selected.latitude}
          anchor="bottom"
          onClose={() => onSelect(null)}
          closeOnClick={false}
          offset={isClose ? 56 : 18}
        >
          <div className="flex flex-col items-center pb-1">
            <div className="mb-2">
              <AnimalAvatar
                photoUrl={selected.photoUrl}
                emotion={selected.emotion}
                size={64}
                alt={selected.species}
              />
            </div>
            <ThoughtBubble animal={selected} showThought />
          </div>
        </Popup>
      )}
    </Map>
  )
}

// Renders avatars only for animals currently within the viewport bounds,
// so even zoomed in we never mount more than a few dozen DOM markers.
function CloseUpAvatars({
  animals, mapRef, onSelect,
}: {
  animals: Animal[]
  mapRef: React.MutableRefObject<MapRef | null>
  onSelect: (a: Animal) => void
}) {
  const [visible, setVisible] = useState<Animal[]>([])

  useEffect(() => {
    const map = mapRef.current?.getMap()
    if (!map) return
    let raf = 0
    function recompute() {
      const m = mapRef.current?.getMap()
      if (!m) return
      const b = m.getBounds()
      if (!b) return
      const inView = animals.filter(a =>
        a.longitude >= b.getWest() && a.longitude <= b.getEast() &&
        a.latitude >= b.getSouth() && a.latitude <= b.getNorth(),
      ).slice(0, 60) // hard cap
      setVisible(inView)
    }
    function onMove() {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(recompute)
    }
    recompute()
    map.on('move', onMove)
    return () => { map.off('move', onMove); cancelAnimationFrame(raf) }
  }, [animals, mapRef])

  return (
    <>
      {visible.map(a => {
        const hex = emotionHex(a.emotion)
        return (
          <Marker
            key={a.id}
            longitude={a.longitude}
            latitude={a.latitude}
            anchor="center"
            onClick={e => { e.originalEvent.stopPropagation(); onSelect(a) }}
          >
            <div className="flex flex-col items-center cursor-pointer select-none" title={a.name}>
              <AnimalAvatar photoUrl={a.photoUrl} emotion={a.emotion} size={42} alt={a.species} />
              <div
                className="mt-1 px-1.5 py-0.5 rounded text-[8px] font-mono tracking-wide whitespace-nowrap"
                style={{ background: 'rgba(6,11,16,0.82)', border: `1px solid ${hex}59`, color: hex }}
              >
                {a.name}
              </div>
            </div>
          </Marker>
        )
      })}
    </>
  )
}
