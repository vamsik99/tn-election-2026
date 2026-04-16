import { Link } from 'react-router-dom'
import PartyBadge from './PartyBadge'
import AllianceTag from './AllianceTag'

export default function PartyCard({ party }) {
  return (
    <Link
      to={`/party/${party.slug}`}
      className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md hover:border-sky-200 transition-all"
    >
      <PartyBadge
        abbreviation={party.abbreviation}
        name={party.name}
        colorHex={party.color_hex}
        size="lg"
      />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-slate-800 truncate">{party.abbreviation}</p>
        <p className="text-xs text-slate-500 truncate">{party.name}</p>
        <AllianceTag alliance={party.alliance} />
      </div>
      <svg className="w-4 h-4 text-slate-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  )
}
