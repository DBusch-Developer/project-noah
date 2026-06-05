'use client'

import { memo, useEffect, useRef, useState } from 'react'
import type { Animal } from '@/components/MapShell'
import { emotionHex, isDistress } from '@/lib/emotion'
import AnimalAvatar from '@/components/AnimalAvatar'

type FeedItem = {
  key: string
  animal: Animal
  text: string
  intensity: number
}

function buildItem(animal: Animal): FeedItem | null {
  if (!animal.thoughts || animal.thoughts.length === 0) return null
  const t = animal.thoughts[Math.floor(Math.random() * animal.thoughts.length)]
  return {
    key: `${animal.id}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    animal,
    text: t.text,
    intensity: t.intensity,
  }
}

type Props = {
  animals: Animal[]
  onSelect?: (animal: Animal) => void
}

function ThoughtFeed({ animals, onSelect }: Props) {
  const [items, setItems] = useState<FeedItem[]>([])
  const [paused, setPaused] = useState(false)
  const animalsRef = useRef(animals)
  animalsRef.current = animals

  // Seed a few on load / when the filtered set changes.
  useEffect(() => {
    const seed = animals
      .map(buildItem)
      .filter(Boolean)
      .slice(0, 6) as FeedItem[]
    setItems(seed)
  }, [animals])

  // Stream new thoughts in on an interval.
  useEffect(() => {
    if (paused) return
    const id = setInterval(() => {
      const pool = animalsRef.current
      if (pool.length === 0) return
      const pick = pool[Math.floor(Math.random() * pool.length)]
      const item = buildItem(pick)
      if (!item) return
      setItems(prev => [item, ...prev].slice(0, 40))
    }, 2600)
    return () => clearInterval(id)
  }, [paused])

  return (
    <aside className="w-80 flex-shrink-0 flex flex-col bg-[var(--surface)] border-l border-[var(--line)]">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-[var(--line)]">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-70 animate-ping" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-teal-400" />
          </span>
          <span className="font-mono text-[10px] tracking-[0.24em] text-teal-200 uppercase">
            Live Thoughtstream
          </span>
          <button
            onClick={() => setPaused(p => !p)}
            className="ml-auto font-mono text-[8px] tracking-[0.15em] uppercase px-2 py-1 rounded border border-[var(--line)] text-[var(--muted)] hover:text-teal-200 hover:border-teal-300/40 transition-colors"
          >
            {paused ? '▶ Resume' : '❚❚ Pause'}
          </button>
        </div>
        <p className="font-mono text-[8px] tracking-[0.2em] text-[var(--muted)] uppercase mt-1.5">
          Decoded transmissions · real time
        </p>
      </div>

      {/* Stream */}
      <div className="flex-1 overflow-y-auto noah-scroll px-3 py-3 space-y-2">
        {items.length === 0 && (
          <p className="font-mono text-[9px] tracking-[0.15em] text-[var(--muted)]/50 uppercase text-center mt-8">
            No signals in range. Adjust scan parameters.
          </p>
        )}
        {items.map((item, idx) => {
          const hex = emotionHex(item.animal.emotion)
          return (
            <button
              key={item.key}
              onClick={() => onSelect?.(item.animal)}
              className="w-full text-left rounded-lg border border-[var(--line)] bg-[var(--surface-2)]/60 hover:bg-[var(--surface-2)] hover:border-teal-300/30 transition-colors p-3 group"
              style={idx === 0 ? { animation: 'feed-in 0.4s ease-out' } : undefined}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <AnimalAvatar
                  photoUrl={item.animal.photoUrl}
                  emotion={item.animal.emotion}
                  size={28}
                  alt={item.animal.species}
                  glow={false}
                />
                <span className="font-semibold text-[12px] text-[var(--foreground)] truncate">
                  {item.animal.name}
                </span>
                {isDistress(item.animal.emotion) && (
                  <span className="font-mono text-[7px] tracking-[0.14em] uppercase px-1 py-0.5 rounded border border-rose-300/30 text-rose-200/80">
                    distress
                  </span>
                )}
                <span
                  className="ml-auto inline-flex items-center gap-1 font-mono text-[8px] tracking-[0.12em] uppercase"
                  style={{ color: hex }}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: hex }} />
                  {item.animal.emotion}
                </span>
              </div>
              <p
                className="text-[11px] leading-relaxed italic text-[var(--foreground)]/85 mb-2 border-l-2 pl-2"
                style={{ borderColor: hex }}
              >
                &ldquo;{item.text}&rdquo;
              </p>
              <div className="flex items-center justify-between font-mono text-[8px] tracking-[0.12em] uppercase text-[var(--muted)]/60">
                <span>{item.animal.species} · {item.animal.region}</span>
                <span>SIG {item.intensity}/10</span>
              </div>
            </button>
          )
        })}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-[var(--line)]">
        <div className="h-px bg-gradient-to-r from-teal-400/30 via-cyan-400/12 to-transparent mb-2" />
        <p className="font-mono text-[8px] tracking-[0.12em] text-[var(--muted)]/40 uppercase">
          {animals.length} subjects broadcasting · array nominal
        </p>
      </div>
    </aside>
  )
}

export default memo(ThoughtFeed)
