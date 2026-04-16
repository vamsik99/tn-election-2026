import { Link } from 'react-router-dom'

const RESERVED_LABELS = {
  sc: 'SC',
  st: 'ST',
}

export default function ConstituencyCard({ constituency }) {
  const reserved = RESERVED_LABELS[constituency.reserved_for]

  return (
    <Link
      to={`/constituency/${constituency.slug}`}
      className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md hover:border-sky-200 transition-all"
    >
      <div className="w-9 h-9 rounded-lg bg-sky-50 flex items-center justify-center flex-shrink-0">
        <span className="text-xs font-bold text-sky-600">{constituency.constituency_no}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-slate-800 text-sm truncate">{constituency.name}</p>
        {constituency.district && (
          <p className="text-xs text-slate-500 truncate">{constituency.district.name}</p>
        )}
      </div>
      {reserved && (
        <span className="flex-shrink-0 px-2 py-0.5 bg-amber-50 text-amber-700 text-xs rounded font-medium border border-amber-100">
          {reserved}
        </span>
      )}
      <svg className="w-4 h-4 text-slate-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  )
}
