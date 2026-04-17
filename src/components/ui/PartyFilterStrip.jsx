import PartyBadge from '../party/PartyBadge'
import { useParties } from '../../hooks/useParties'

// Show only parties with a curated color (major/known parties).
// Unknown small parties fall back to gray (#94a3b8) and are hidden from the strip.
const GENERIC_COLOR = '#94a3b8'

/**
 * Horizontal scrollable strip of party icon chips.
 * Highlights the active party and calls onSelect(slug) on tap.
 *
 * @param {string|null}  selected       - currently-selected party slug (or null = All)
 * @param {function}     onSelect       - called with party slug or null
 * @param {Set<string>}  [limitToSlugs] - optional: only show parties whose slug is in this set
 */
export default function PartyFilterStrip({ selected, onSelect, limitToSlugs }) {
  const { data: allParties = [], isLoading } = useParties()

  // Only show major parties with a distinctive color
  let parties = allParties.filter(p => p.color_hex && p.color_hex !== GENERIC_COLOR)

  // If the caller restricts to specific slugs (e.g. parties actually in a constituency),
  // filter further — but always keep the selected party visible even if it has no match
  if (limitToSlugs && limitToSlugs.size > 0) {
    parties = parties.filter(p => limitToSlugs.has(p.slug) || p.slug === selected)
  }

  if (isLoading) {
    return (
      <div className="flex gap-2 overflow-x-auto pb-1">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex-shrink-0 w-16 h-16 bg-slate-100 rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  // If only one known party (or none) contesting, no point showing the strip
  if (parties.length <= 1) return null

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {/* "All" chip */}
      <button
        onClick={() => onSelect(null)}
        className={`flex-shrink-0 flex flex-col items-center gap-1 px-3 py-2 rounded-xl border transition-all text-xs font-semibold ${
          !selected
            ? 'bg-sky-500 border-sky-500 text-white shadow'
            : 'bg-white border-slate-200 text-slate-600 hover:border-sky-300'
        }`}
      >
        <span className="text-base">🗳</span>
        All
      </button>

      {parties.map((party) => (
        <button
          key={party.slug}
          onClick={() => onSelect(party.slug === selected ? null : party.slug)}
          className={`flex-shrink-0 flex flex-col items-center gap-1 px-3 py-2 rounded-xl border transition-all text-xs font-semibold ${
            selected === party.slug
              ? 'border-sky-500 bg-sky-50 text-sky-700 shadow'
              : 'bg-white border-slate-200 text-slate-600 hover:border-sky-300'
          }`}
        >
          <PartyBadge
            abbreviation={party.abbreviation}
            colorHex={party.color_hex}
            size="sm"
          />
          {party.abbreviation}
        </button>
      ))}
    </div>
  )
}
