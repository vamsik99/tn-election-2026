function formatLakh(val) {
  if (val == null) return '—'
  if (val >= 100) return `₹${(val / 100).toFixed(2)} Cr`
  return `₹${Number(val).toFixed(0)} L`
}

function StatCard({ label, value, highlight }) {
  return (
    <div className={`p-3 rounded-xl ${highlight ? 'bg-red-50 border border-red-100' : 'bg-slate-50 border border-slate-100'}`}>
      <p className="text-xs text-slate-500">{label}</p>
      <p className={`font-semibold text-base mt-0.5 ${highlight ? 'text-red-700' : 'text-slate-800'}`}>{value}</p>
    </div>
  )
}

export default function AffidavitSummary({ contest }) {
  const totalAssets = (contest.assets_movable_lakh ?? 0) + (contest.assets_immovable_lakh ?? 0)
  const hasCases = contest.criminal_cases_pending > 0

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-slate-700 text-sm uppercase tracking-wide">Affidavit Disclosure</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <StatCard label="Movable Assets" value={formatLakh(contest.assets_movable_lakh)} />
        <StatCard label="Immovable Assets" value={formatLakh(contest.assets_immovable_lakh)} />
        <StatCard label="Total Assets" value={formatLakh(totalAssets)} />
        <StatCard label="Liabilities" value={formatLakh(contest.liabilities_lakh)} />
        {contest.income_annual_lakh != null && (
          <StatCard label="Annual Income" value={formatLakh(contest.income_annual_lakh)} />
        )}
        <StatCard
          label="Criminal Cases"
          value={hasCases ? `${contest.criminal_cases_pending} Pending` : 'None'}
          highlight={hasCases}
        />
      </div>
      {contest.criminal_cases_detail && (
        <p className="text-xs text-slate-500 bg-red-50 border border-red-100 rounded-xl p-3">
          {contest.criminal_cases_detail}
        </p>
      )}
      {contest.affidavit_url && (
        <a
          href={contest.affidavit_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-sky-600 hover:underline mt-1"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414A1 1 0 0119 9.414V19a2 2 0 01-2 2z" />
          </svg>
          View Official ECI Affidavit (PDF)
        </a>
      )}
    </div>
  )
}
