import { emotionHex, emotionBadge, moodBadge } from '@/lib/emotion'

type Thought = {
  id: string
  text: string
  intensity: number
}

export type ThoughtBubbleAnimal = {
  id: string
  name: string
  species: string
  region: string
  mood: string
  emotion: string
  thoughts: Thought[]
  photoAttribution?: string | null
}

type Props = {
  animal: ThoughtBubbleAnimal
  showThought?: boolean
}

function Badge({ label, colorClass }: { label: string; colorClass: string }) {
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded border font-mono text-[9px] tracking-widest uppercase ${colorClass}`}>
      {label}
    </span>
  )
}

function IntensityBar({ value, emotion }: { value: number; emotion: string }) {
  const clamped = Math.min(10, Math.max(0, value))
  const pct = (clamped / 10) * 100
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1 bg-[var(--surface)] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: emotionHex(emotion) }}
        />
      </div>
      <span className="font-mono text-[9px] text-[var(--muted)] w-6 text-right">{clamped}/10</span>
    </div>
  )
}

export default function ThoughtBubble({ animal, showThought = false }: Props) {
  const thought = animal.thoughts[0] ?? null

  return (
    <div className="min-w-[230px] max-w-[270px]">

      {/* Species + region header */}
      <p
        className="font-mono text-[9px] tracking-[0.2em] uppercase mb-1.5"
        style={{ color: emotionHex(animal.emotion) }}
      >
        {animal.species} <span style={{ opacity: 0.5 }}>//</span> {animal.region}
      </p>

      {/* Animal name */}
      <p className="text-white font-semibold text-sm leading-tight mb-2">
        {animal.name}
      </p>

      {/* Mood + emotion badges */}
      <div className="flex flex-wrap gap-1.5 mb-2">
        <Badge label={animal.mood}    colorClass={moodBadge(animal.mood)} />
        <Badge label={animal.emotion} colorClass={emotionBadge(animal.emotion)} />
      </div>

      {/* Thought transmission */}
      {showThought && thought && (
        <div className="mt-2 border-t border-[var(--line)] pt-2">
          <p className="font-mono text-[8px] tracking-[0.2em] text-[var(--muted)] uppercase mb-1.5">
            ◈ Translated Thought
          </p>
          <p className="text-zinc-200 italic text-[11px] leading-relaxed mb-2">
            &ldquo;{thought.text}&rdquo;
          </p>
          <div>
            <p className="font-mono text-[8px] tracking-[0.15em] text-[var(--muted)] uppercase mb-1">
              Signal Intensity
            </p>
            <IntensityBar value={thought.intensity} emotion={animal.emotion} />
          </div>
        </div>
      )}

      {/* Hint when zoomed out */}
      {!showThought && (
        <p className="font-mono text-[8px] tracking-[0.12em] text-[var(--muted)] uppercase mt-1">
          Zoom in to receive transmission
        </p>
      )}

      {/* Photo attribution */}
      {animal.photoAttribution && (
        <p className="font-mono text-[8px] text-[var(--muted)] mt-2 opacity-60">
          {animal.photoAttribution}
        </p>
      )}
    </div>
  )
}
