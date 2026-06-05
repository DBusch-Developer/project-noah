'use client'

import { useEffect, useState } from 'react'

const LINES = [
  'ESTABLISHING UPLINK TO ORBITAL ARRAY',
  '4 THOUGHT-TRANSLATION SATELLITES IN RANGE',
  'CALIBRATING NEURAL DECODERS',
  'DECRYPTING LIVE THOUGHTSTREAM',
  'WELCOME TO PROJECT NOAH',
]

type Props = { onDone: () => void }

export default function BootSequence({ onDone }: Props) {
  const [visibleLines, setVisibleLines] = useState(0)
  const [closing, setClosing] = useState(false)

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = []
    LINES.forEach((_, i) => {
      timers.push(setTimeout(() => setVisibleLines(i + 1), 420 * (i + 1)))
    })
    timers.push(setTimeout(() => setClosing(true), 420 * LINES.length + 500))
    timers.push(setTimeout(onDone, 420 * LINES.length + 1100))
    return () => timers.forEach(clearTimeout)
  }, [onDone])

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-500 ${
        closing ? 'opacity-0' : 'opacity-100'
      }`}
      style={{
        background:
          'radial-gradient(130% 90% at 50% -10%, rgba(79,209,197,0.08), transparent 55%), #060b10',
      }}
    >
      <div className="w-[min(90vw,520px)] px-6">
        {/* Sun-cresting logo mark */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative">
            <div
              className="w-16 h-16 rounded-full"
              style={{
                background: 'radial-gradient(circle at 50% 40%, #8fd6e8, #4fd1c5 55%, #1f6b66 95%)',
                boxShadow: '0 0 50px rgba(79,209,197,0.45)',
              }}
            />
            <div className="absolute inset-0 rounded-full border border-teal-300/40 animate-ping" />
          </div>
          <p className="mt-5 font-mono text-[11px] tracking-[0.42em] text-teal-200 uppercase">
            Project&nbsp;Noah
          </p>
          <p className="font-mono text-[8px] tracking-[0.3em] text-[var(--muted)] uppercase mt-1">
            Planetary Animal Intelligence Network
          </p>
        </div>

        {/* Boot log */}
        <div className="space-y-1.5 min-h-[120px]">
          {LINES.map((line, i) => (
            <div
              key={line}
              className={`font-mono text-[10px] tracking-[0.18em] uppercase flex items-center gap-2 transition-opacity duration-300 ${
                i < visibleLines ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <span className="text-emerald-300/80">{i < visibleLines ? '✓' : ' '}</span>
              <span className={i === LINES.length - 1 ? 'text-teal-200' : 'text-[var(--muted)]'}>
                {line}
              </span>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="mt-6 h-px w-full bg-white/5 overflow-hidden rounded-full">
          <div
            className="h-full rounded-full"
            style={{
              background: 'linear-gradient(90deg, #8fd6e8, #4fd1c5)',
              animation: 'boot-bar 2.4s ease-out forwards',
            }}
          />
        </div>
      </div>
    </div>
  )
}
