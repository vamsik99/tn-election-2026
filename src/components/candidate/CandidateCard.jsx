import { Link } from 'react-router-dom'
import PartyBadge from '../party/PartyBadge'

function formatLakh(val) {
  if (val == null) return '—'
  if (val >= 100) return `₹${(val / 100).toFixed(1)} Cr`
  return `₹${val.toFixed(0)} L`
}

export default function CandidateCard({ contest, showConstituency = false }) {
  const { candidate, party } = contest

  return (
    <Link
      to={`/candidate/${candidate.slug}`}
      className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md hover:border-sky-200 transition-all"
    >
      {/* Photo */}
      <div className="w-12 h-12 rounded-full bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200">
        {candidate.photo_url ? (
          <img
            src={`${candidate.photo_url}?width=96&quality=80`}
            alt={candidate.full_name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400 text-xl">
            👤
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-slate-800 text-sm truncate">{candidate.full_name}</p>
        {candidate.full_name_ta && (
          <p className="text-xs text-slate-500 truncate">{candidate.full_name_ta}</p>
        )}
        {showConstituency && contest.constituency && (
          <p className="text-xs text-sky-600 truncate mt-0.5">
            {contest.constituency.name}
          </p>
        )}

        <div className="flex items-center gap-2 mt-1">
          {party && (
            <PartyBadge
              abbreviation={party.abbreviation}
              colorHex={party.color_hex}
              size="sm"
              showLabel
            />
          )}
          {!party && <span className="text-xs text-slate-500">Independent</span>}
        </div>
      </div>

      {/* Affidavit summary */}
      <div className="flex-shrink-0 text-right hidden sm:block">
        <p className="text-xs text-slate-400">Assets</p>
        <p className="text-sm font-medium text-slate-700">
          {formatLakh((contest.assets_movable_lakh ?? 0) + (contest.assets_immovable_lakh ?? 0))}
        </p>
        {contest.criminal_cases_pending > 0 && (
          <span className="inline-block mt-1 px-1.5 py-0.5 bg-red-50 text-red-600 text-xs rounded font-medium">
            {contest.criminal_cases_pending} case{contest.criminal_cases_pending > 1 ? 's' : ''}
          </span>
        )}
      </div>
    </Link>
  )
}
