import { useNavigate } from 'react-router-dom'
import { useConstituencies } from '../../hooks/useConstituencies'
import { useDistricts } from '../../hooks/useDistricts'

/**
 * A `<select>` dropdown grouped by district.
 * On mobile it uses the native select; wrapping with a custom styled container.
 * onChange navigates to /constituency/:slug, or calls onSelect(slug) if provided.
 */
export default function ConstituencyDropdown({ value = '', onSelect, placeholder = 'Select constituency…', className = '' }) {
  const navigate = useNavigate()
  const { data: constituencies = [], isLoading: loadingC } = useConstituencies()
  const { data: districts = [], isLoading: loadingD } = useDistricts()

  // Group constituencies by district
  const grouped = districts.map((d) => ({
    ...d,
    constituencies: constituencies.filter((c) => c.district?.id === d.id || c.district?.slug === d.slug),
  })).filter((d) => d.constituencies.length > 0)

  function handleChange(e) {
    const slug = e.target.value
    if (!slug) return
    if (onSelect) {
      onSelect(slug)
    } else {
      navigate(`/constituency/${slug}`)
    }
  }

  return (
    <div className={`relative ${className}`}>
      <select
        value={value}
        onChange={handleChange}
        disabled={loadingC || loadingD}
        className="w-full appearance-none bg-white border border-slate-200 rounded-xl px-4 py-3 pr-10 text-slate-700 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 disabled:opacity-50 cursor-pointer"
      >
        <option value="">{loadingC ? 'Loading…' : placeholder}</option>
        {grouped.map((district) => (
          <optgroup key={district.id} label={district.name}>
            {district.constituencies.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.constituency_no}. {c.name}
                {c.reserved_for !== 'general' ? ` (${c.reserved_for.toUpperCase()})` : ''}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
      {/* Custom chevron */}
      <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
        <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  )
}
