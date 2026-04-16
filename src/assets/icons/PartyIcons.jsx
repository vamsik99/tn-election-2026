/**
 * SVG icons for major Tamil Nadu political parties.
 * Each returns a square SVG meant to be used inside a circular badge.
 */

// DMK — Rising Sun with rays
export function DMKIcon({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="16" fill="#E63946" />
      {/* Sun circle */}
      <circle cx="16" cy="17" r="5" fill="#FFD700" />
      {/* Rays */}
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle) => {
        const rad = (angle * Math.PI) / 180
        const x1 = 16 + 7 * Math.cos(rad)
        const y1 = 17 + 7 * Math.sin(rad)
        const x2 = 16 + 10 * Math.cos(rad)
        const y2 = 17 + 10 * Math.sin(rad)
        return <line key={angle} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#FFD700" strokeWidth="1.5" strokeLinecap="round" />
      })}
      {/* Horizon line */}
      <line x1="6" y1="22" x2="26" y2="22" stroke="#FFD700" strokeWidth="1.5" />
    </svg>
  )
}

// AIADMK — Two Leaves
export function AIADMKIcon({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="16" fill="#006400" />
      {/* Left leaf */}
      <path d="M16 8 Q8 12 10 22 Q13 18 16 16 Z" fill="#90EE90" />
      {/* Right leaf */}
      <path d="M16 8 Q24 12 22 22 Q19 18 16 16 Z" fill="#ADFF2F" />
      {/* Stem */}
      <line x1="16" y1="16" x2="16" y2="26" stroke="#90EE90" strokeWidth="1.5" />
    </svg>
  )
}

// BJP — Lotus
export function BJPIcon({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="16" fill="#FF6600" />
      {/* Center petal */}
      <path d="M16 8 Q13 14 16 20 Q19 14 16 8Z" fill="#FFFFFF" />
      {/* Left petal */}
      <path d="M8 14 Q12 14 16 20 Q11 22 8 14Z" fill="#FFFFFF" />
      {/* Right petal */}
      <path d="M24 14 Q20 14 16 20 Q21 22 24 14Z" fill="#FFFFFF" />
      {/* Far left petal */}
      <path d="M7 20 Q11 18 16 20 Q12 26 7 20Z" fill="#FFFFFF" opacity="0.7" />
      {/* Far right petal */}
      <path d="M25 20 Q21 18 16 20 Q20 26 25 20Z" fill="#FFFFFF" opacity="0.7" />
      {/* Water line */}
      <line x1="7" y1="24" x2="25" y2="24" stroke="#FFFFFF" strokeWidth="1.2" opacity="0.8" />
    </svg>
  )
}

// INC — Hand / Congress Hand
export function INCIcon({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="16" fill="#138808" />
      {/* Open palm */}
      <rect x="13" y="10" width="2" height="8" rx="1" fill="#FFFFFF" />
      <rect x="16" y="9" width="2" height="9" rx="1" fill="#FFFFFF" />
      <rect x="19" y="10" width="2" height="8" rx="1" fill="#FFFFFF" />
      <rect x="10" y="12" width="2" height="6" rx="1" fill="#FFFFFF" />
      {/* Palm base */}
      <rect x="10" y="18" width="12" height="5" rx="2" fill="#FFFFFF" />
    </svg>
  )
}

// PMK — Green with symbol
export function PMKIcon({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="16" fill="#1a7a1a" />
      {/* Mango leaf */}
      <path d="M8 20 Q12 8 20 10 Q22 18 16 22 Q12 24 8 20Z" fill="#90EE90" />
      <line x1="12" y1="18" x2="20" y2="12" stroke="#1a7a1a" strokeWidth="1" />
    </svg>
  )
}

// VCK — Blue with star
export function VCKIcon({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="16" fill="#1a3a8c" />
      {/* 5-point star */}
      <polygon
        points="16,7 17.9,13 24,13 19,17 21,23 16,19 11,23 13,17 8,13 14.1,13"
        fill="#FFD700"
      />
    </svg>
  )
}

// TVK — Thalaimai Seithigal / new party (teal/green)
export function TVKIcon({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="16" fill="#0d9488" />
      {/* Rising wave */}
      <path d="M6 22 Q10 16 16 18 Q22 20 26 14" stroke="#FFFFFF" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M6 18 Q10 12 16 14 Q22 16 26 10" stroke="#FFFFFF" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.6" />
    </svg>
  )
}

// MDMK — Red with torch
export function MDMKIcon({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="16" fill="#cc0000" />
      {/* Torch handle */}
      <rect x="15" y="18" width="2" height="8" rx="1" fill="#FFFFFF" />
      {/* Torch head */}
      <path d="M12 10 Q16 6 20 10 Q18 18 16 18 Q14 18 12 10Z" fill="#FFD700" />
      {/* Flame */}
      <path d="M14 12 Q16 8 18 12 Q17 16 16 14 Q15 16 14 12Z" fill="#FF6600" />
    </svg>
  )
}

// Generic fallback icon for unknown parties
export function GenericPartyIcon({ size = 32, color = '#64748b' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="16" fill={color} />
      <circle cx="16" cy="16" r="6" fill="white" opacity="0.8" />
    </svg>
  )
}

// Map from party abbreviation (uppercase) to icon component
export const PARTY_ICONS = {
  DMK: DMKIcon,
  AIADMK: AIADMKIcon,
  BJP: BJPIcon,
  INC: INCIcon,
  PMK: PMKIcon,
  VCK: VCKIcon,
  TVK: TVKIcon,
  MDMK: MDMKIcon,
}

export function getPartyIcon(abbreviation) {
  return PARTY_ICONS[abbreviation?.toUpperCase()] ?? null
}
