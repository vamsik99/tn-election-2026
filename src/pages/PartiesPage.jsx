import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useParties } from '../hooks/useParties'
import PartyCard from '../components/party/PartyCard'
import LoadingSpinner from '../components/ui/LoadingSpinner'

const ALLIANCES = ['All', 'INDIA', 'NDA', 'Independent']

export default function PartiesPage() {
  const [alliance, setAlliance] = useState('All')
  const { data: parties = [], isLoading } = useParties()

  const filtered = parties.filter((p) => {
    if (alliance === 'All') return true
    if (alliance === 'Independent') return !p.alliance
    return p.alliance === alliance
  })

  return (
    <>
      <Helmet>
        <title>Parties — TN Elections 2026</title>
      </Helmet>

      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-800 mb-1">Political Parties</h1>
        <p className="text-sm text-slate-500">Contesting in Tamil Nadu 2026</p>
      </div>

      {/* Alliance filter */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {ALLIANCES.map((a) => (
          <button
            key={a}
            onClick={() => setAlliance(a)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
              alliance === a
                ? 'bg-sky-500 text-white border-sky-500 shadow'
                : 'bg-white text-slate-600 border-slate-200 hover:border-sky-300'
            }`}
          >
            {a}
          </button>
        ))}
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map((p) => (
            <PartyCard key={p.slug} party={p} />
          ))}
        </div>
      )}
    </>
  )
}
