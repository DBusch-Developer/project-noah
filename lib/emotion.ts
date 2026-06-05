// Shared emotion + mood visual mapping — "Cryostation" cold palette.
// Expanded emotional range: distress signals (for the conservation angle)
// plus the full warm/social/aggressive spectrum. All kept low-saturation
// so the instrument reads scientific rather than childish.

// ── Distress / negative (the conservation-signal cluster) ──────────────
// ── Positive / social / other ─────────────────────────────────────────
export const EMOTION_VALUES = [
  // distress
  'scared', 'desperate', 'dying', 'grieving', 'sad', 'lonely', 'anxious', 'exhausted',
  // aggression
  'angry', 'aggressive', 'territorial', 'jealous',
  // neutral / searching
  'hungry', 'confused', 'alert', 'curious',
  // positive
  'peaceful', 'content', 'joyful', 'playful', 'affectionate', 'proud', 'determined', 'smug',
] as const

export const MOOD_VALUES = [
  'calm', 'alert', 'curious', 'restless', 'content', 'anxious', 'playful', 'distressed', 'aggressive',
] as const

export type EmotionKey = (typeof EMOTION_VALUES)[number]

// Severity tier — drives sorting/visibility for the "activists find distress" use case.
export const DISTRESS_EMOTIONS = new Set([
  'scared', 'desperate', 'dying', 'grieving', 'sad', 'lonely', 'anxious', 'exhausted',
])
export function isDistress(emotion: string): boolean {
  return DISTRESS_EMOTIONS.has(emotion?.toLowerCase())
}

// Hex for map markers / glows / feed accents.
// Distress -> cold reds/violets; aggression -> steel/amber; positive -> teal/ice/jade.
export const EMOTION_HEX: Record<string, string> = {
  // distress
  scared:       '#c98a9f',
  desperate:    '#cf7d8f',
  dying:        '#b56b7a',
  grieving:     '#9a8ab0',
  sad:          '#8a93c9',
  lonely:       '#8a93c9',
  anxious:      '#b08aa8',
  exhausted:    '#9c8fa6',
  // aggression
  angry:        '#cf8a6f',
  aggressive:   '#c97f5a',
  territorial:  '#c9a26f',
  jealous:      '#a89a6f',
  // neutral / searching
  hungry:       '#c9a26f',
  confused:     '#b08aa8',
  alert:        '#5a9fd1',
  curious:      '#6fb8c9',
  // positive
  peaceful:     '#6fb8c9',
  content:      '#7fc9b0',
  joyful:       '#7fc9b0',
  playful:      '#8fd6e8',
  affectionate: '#7fc9c9',
  proud:        '#5a9fd1',
  determined:   '#5a9fd1',
  smug:         '#8fbfc9',
}

export function emotionHex(emotion: string): string {
  return EMOTION_HEX[emotion?.toLowerCase()] ?? '#4fd1c5'
}

// Tailwind badge classes (text + border), cool and low-saturation.
export const EMOTION_BADGE: Record<string, string> = {
  scared:       'text-rose-200/85    border-rose-300/25',
  desperate:    'text-rose-200/90    border-rose-300/30',
  dying:        'text-rose-300/90    border-rose-400/35',
  grieving:     'text-violet-200/85  border-violet-300/25',
  sad:          'text-indigo-200/85  border-indigo-300/25',
  lonely:       'text-indigo-200/85  border-indigo-300/25',
  anxious:      'text-fuchsia-200/80 border-fuchsia-300/20',
  exhausted:    'text-slate-200/80   border-slate-300/25',
  angry:        'text-orange-200/85  border-orange-300/25',
  aggressive:   'text-orange-200/90  border-orange-300/30',
  territorial:  'text-amber-200/80   border-amber-300/25',
  jealous:      'text-yellow-200/75  border-yellow-300/20',
  hungry:       'text-amber-200/80   border-amber-300/25',
  confused:     'text-fuchsia-200/75 border-fuchsia-300/20',
  alert:        'text-sky-200/90     border-sky-300/30',
  curious:      'text-cyan-200/90    border-cyan-300/30',
  peaceful:     'text-cyan-200/90    border-cyan-300/30',
  content:      'text-teal-200/90    border-teal-300/30',
  joyful:       'text-teal-200/90    border-teal-300/30',
  playful:      'text-cyan-100/90    border-cyan-200/30',
  affectionate: 'text-teal-200/90    border-teal-300/30',
  proud:        'text-sky-200/90     border-sky-300/30',
  determined:   'text-sky-200/90     border-sky-300/30',
  smug:         'text-cyan-200/85    border-cyan-300/25',
}

export const MOOD_BADGE: Record<string, string> = {
  calm:        'text-cyan-200/90    border-cyan-300/30',
  alert:       'text-sky-200/90     border-sky-300/30',
  curious:     'text-indigo-200/85  border-indigo-300/25',
  restless:    'text-sky-200/85     border-sky-300/25',
  content:     'text-teal-200/90    border-teal-300/30',
  anxious:     'text-fuchsia-200/75 border-fuchsia-300/20',
  playful:     'text-cyan-100/90    border-cyan-200/30',
  distressed:  'text-rose-200/85    border-rose-300/25',
  aggressive:  'text-orange-200/85  border-orange-300/25',
}

export function emotionBadge(emotion: string): string {
  return EMOTION_BADGE[emotion?.toLowerCase()] ?? 'text-teal-200/90 border-teal-300/30'
}
export function moodBadge(mood: string): string {
  return MOOD_BADGE[mood?.toLowerCase()] ?? 'text-teal-200/90 border-teal-300/30'
}
