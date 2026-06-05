'use client'

import { useState } from 'react'
import { emotionHex } from '@/lib/emotion'

type Props = {
  photoUrl?: string | null
  emotion: string
  size?: number
  alt?: string
  /** show a soft glow ring in the emotion color */
  glow?: boolean
}

// Circular species photo with an emotion-colored ring.
// Falls back to a paw silhouette when no photo is available or the image errors.
export default function AnimalAvatar({ photoUrl, emotion, size = 36, alt = '', glow = true }: Props) {
  const [errored, setErrored] = useState(false)
  const hex = emotionHex(emotion)
  const showPhoto = photoUrl && !errored

  return (
    <div
      className="relative rounded-full overflow-hidden flex items-center justify-center shrink-0"
      style={{
        width: size,
        height: size,
        border: `2px solid ${hex}`,
        background: 'var(--surface-2)',
        boxShadow: glow ? `0 0 ${Math.round(size / 3)}px ${hex}55` : undefined,
      }}
    >
      {showPhoto ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photoUrl as string}
          alt={alt}
          loading="lazy"
          onError={() => setErrored(true)}
          className="w-full h-full object-cover"
        />
      ) : (
        <svg viewBox="0 0 24 24" width={size * 0.55} height={size * 0.55} fill={hex} opacity={0.8}>
          <path d="M12 14c-3 0-5 2-5 4 0 1.5 2 2 5 2s5-.5 5-2c0-2-2-4-5-4z" />
          <circle cx="6.5" cy="9.5" r="2" />
          <circle cx="17.5" cy="9.5" r="2" />
          <circle cx="9.5" cy="6" r="1.8" />
          <circle cx="14.5" cy="6" r="1.8" />
        </svg>
      )}
    </div>
  )
}
