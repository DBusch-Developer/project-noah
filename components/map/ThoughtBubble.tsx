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
}

type Props = {
  animal: ThoughtBubbleAnimal
  showThought?: boolean
}

const MOOD_COLOR: Record<string, string> = {
  calm:     'text-sky-300    border-sky-400/40    bg-sky-900/30',
  alert:    'text-amber-300  border-amber-400/40  bg-amber-900/30',
  curious:  'text-violet-300 border-violet-400/40 bg-violet-900/30',
  restless: 'text-orange-300 border-orange-400/40 bg-orange-900/30',
  content:  'text-green-300  border-green-400/40  bg-green-900/30',
  anxious:  'text-red-300    border-red-400/40    bg-red-900/30',
  playful:  'text-pink-300   border-pink-400/40   bg-pink-900/30',
}

const EMOTION_COLOR: Record<string, string> = {
  peaceful:    'text-sky-400/80    border-sky-500/30',
  hungry:      'text-orange-400/80 border-orange-500/30',
  lonely:      'text-violet-400/80 border-violet-500/30',
  joyful:      'text-yellow-400/80 border-yellow-500/30',
  protective:  'text-green-400/80  border-green-500/30',
  confused:    'text-rose-400/80   border-rose-500/30',
  determined:  'text-cyan-400/80   border-cyan-500/30',
}

function Badge({ label, colorClass }: { label: string; colorClass: string }) {
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded border font-mono text-[9px] tracking-widest uppercase ${colorClass}`}>
      {label}
    </span>
  )
}

function IntensityBar({ value }: { value: number }) {
  const clamped = Math.min(10, Math.max(0, value))
  const pct = (clamped / 10) * 100
  const color = clamped >= 8 ? 'bg-red-400' : clamped >= 5 ? 'bg-amber-400' : 'bg-green-400'
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1 bg-green-950 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="font-mono text-[9px] text-green-500/60 w-6 text-right">{clamped}/10</span>
    </div>
  )
}

export default function ThoughtBubble({ animal, showThought = false }: Props) {
  const thought = animal.thoughts[0] ?? null
  const moodClass    = MOOD_COLOR[animal.mood]    ?? 'text-green-300 border-green-400/40 bg-green-900/30'
  const emotionClass = EMOTION_COLOR[animal.emotion] ?? 'text-green-400/80 border-green-500/30'

  return (
    <div className="min-w-[230px] max-w-[270px]">

      {/* Species + region header */}
      <p className="font-mono text-[9px] tracking-[0.2em] text-green-400/70 uppercase mb-1.5">
        {animal.species} <span className="text-green-500/40">//</span> {animal.region}
      </p>

      {/* Animal name */}
      <p className="text-white font-semibold text-sm leading-tight mb-2">
        {animal.name}
      </p>

      {/* Mood + emotion badges */}
      <div className="flex flex-wrap gap-1.5 mb-2">
        <Badge label={animal.mood}    colorClass={moodClass} />
        <Badge label={animal.emotion} colorClass={emotionClass} />
      </div>

      {/* Thought transmission */}
      {showThought && thought && (
        <div className="mt-2 border-t border-green-500/20 pt-2">
          <p className="font-mono text-[8px] tracking-[0.2em] text-green-500/50 uppercase mb-1.5">
            ◈ Translated Thought
          </p>
          <p className="text-zinc-200 italic text-[11px] leading-relaxed mb-2">
            &ldquo;{thought.text}&rdquo;
          </p>
          <div>
            <p className="font-mono text-[8px] tracking-[0.15em] text-green-500/40 uppercase mb-1">
              Signal Intensity
            </p>
            <IntensityBar value={thought.intensity} />
          </div>
        </div>
      )}

      {/* Hint when zoomed out */}
      {!showThought && (
        <p className="font-mono text-[8px] tracking-[0.12em] text-green-500/30 uppercase mt-1">
          Zoom in to receive transmission
        </p>
      )}
    </div>
  )
}
