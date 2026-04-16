import { Link } from 'react-router-dom'
import PartyBadge from '../party/PartyBadge'

const RESULT_STYLES = {
  won: 'bg-green-100 text-green-700',
  lost: 'bg-slate-100 text-slate-500',
}

export default function ElectionHistory({ contests }) {
  const past = contests?.filter((c) => !c.is_current_election) ?? []
  if (past.length === 0) return null

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-slate-700 text-sm uppercase tracking-wide">Election History</h3>
      <div className="space-y-2">
        {past.map((c) => (
          <div key={c.id} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100">
            <span className="text-sm font-bold text-slate-500 w-10">{c.election_year}</span>
            {c.party && (
              <PartyBadge abbreviation={c.party.abbreviation} colorHex={c.party.color_hex} size="sm" showLabel />
            )}
            {c.constituency && (
              <Link to={`/constituency/${c.constituency.slug}`} className="flex-1 text-sm text-sky-600 hover:underline truncate">
                {c.constituency.name}
              </Link>
            )}
            {c.result && (
              <span className={`flex-shrink-0 px-2 py-0.5 rounded text-xs font-medium capitalize ${RESULT_STYLES[c.result] || 'bg-slate-100 text-slate-500'}`}>
                {c.result}
              </span>
            )}
            {c.votes_received != null && (
              <span className="text-xs text-slate-400 flex-shrink-0">{c.votes_received.toLocaleString()} votes</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
