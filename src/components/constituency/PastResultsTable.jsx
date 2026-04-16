import { Link } from 'react-router-dom'
import PartyBadge from '../party/PartyBadge'

export default function PastResultsTable({ results }) {
  if (!results || results.length === 0) return null

  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-slate-700 text-sm uppercase tracking-wide">Past Results</h3>
      <div className="overflow-x-auto -mx-4 px-4">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-xs text-slate-400 uppercase border-b border-slate-100">
              <th className="py-2 text-left font-medium">Year</th>
              <th className="py-2 text-left font-medium">Winner</th>
              <th className="py-2 text-left font-medium">Party</th>
              <th className="py-2 text-right font-medium">Margin</th>
              <th className="py-2 text-right font-medium">Turnout</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r) => (
              <tr key={r.election_year} className="border-b border-slate-50 hover:bg-slate-50">
                <td className="py-2 font-bold text-slate-500">{r.election_year}</td>
                <td className="py-2">
                  {r.winning_candidate ? (
                    <Link to={`/candidate/${r.winning_candidate.slug}`} className="text-sky-600 hover:underline">
                      {r.winning_candidate.full_name}
                    </Link>
                  ) : '—'}
                </td>
                <td className="py-2">
                  {r.winning_party && (
                    <PartyBadge abbreviation={r.winning_party.abbreviation} colorHex={r.winning_party.color_hex} size="sm" showLabel />
                  )}
                </td>
                <td className="py-2 text-right text-slate-600">
                  {r.winning_margin != null ? r.winning_margin.toLocaleString() : '—'}
                </td>
                <td className="py-2 text-right text-slate-600">
                  {r.voter_turnout_pct != null ? `${r.voter_turnout_pct}%` : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
