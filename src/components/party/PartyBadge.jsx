import { getPartyIcon, GenericPartyIcon } from '../../assets/icons/PartyIcons'

/**
 * Circular party badge with icon (if known) or colored dot.
 * sizes: 'sm' (24px) | 'md' (36px) | 'lg' (48px)
 */
export default function PartyBadge({ abbreviation, name, colorHex, size = 'md', showLabel = false }) {
  const sizes = { sm: 24, md: 36, lg: 48 }
  const px = sizes[size] ?? 36
  const IconComponent = getPartyIcon(abbreviation)

  return (
    <div className="flex items-center gap-2">
      <div
        className="rounded-full overflow-hidden flex-shrink-0 shadow-sm"
        style={{ width: px, height: px }}
        title={name || abbreviation}
      >
        {IconComponent ? (
          <IconComponent size={px} />
        ) : (
          <GenericPartyIcon size={px} color={colorHex || '#94a3b8'} />
        )}
      </div>
      {showLabel && (
        <span className="text-sm font-semibold text-slate-700 truncate">
          {abbreviation}
        </span>
      )}
    </div>
  )
}
