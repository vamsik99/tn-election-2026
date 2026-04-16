import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useParty } from '../hooks/useParty'
import PartyBadge from '../components/party/PartyBadge'
import AllianceTag from '../components/party/AllianceTag'
import CandidateCard from '../components/candidate/CandidateCard'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import EmptyState from '../components/ui/EmptyState'

export default function PartyPage() {
  const { slug } = useParams()
  const { data: party, isLoading, isError } = useParty(slug)

  if (isLoading) return <LoadingSpinner label="Loading party…" />
  if (isError || !party) return <EmptyState icon="🏳" title="Party not found" />

  const contests = party.contests ?? []

  return (
    <>
      <Helmet>
        <title>{party.abbreviation} — TN Elections 2026</title>
        <meta name="description" content={`${party.name} candidates in Tamil Nadu 2026 elections.`} />
      </Helmet>

      <Link to="/parties" className="text-xs text-sky-600 hover:underline mb-3 inline-block">
        ← All Parties
      </Link>

      {/* Party header */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-5 flex items-center gap-4">
        <PartyBadge
          abbreviation={party.abbreviation}
          name={party.name}
          colorHex={party.color_hex}
          size="lg"
        />
        <div>
          <h1 className="text-xl font-bold text-slate-800">{party.abbreviation}</h1>
          <p className="text-sm text-slate-500">{party.name}</p>
          <div className="mt-1">
            <AllianceTag alliance={party.alliance} />
          </div>
        </div>
        <div className="ml-auto text-right">
          <p className="text-2xl font-bold text-sky-600">{contests.length}</p>
          <p className="text-xs text-slate-400">candidates</p>
        </div>
      </div>

      {/* Candidates */}
      <h2 className="text-base font-semibold text-slate-700 mb-3">
        Candidates ({contests.length})
      </h2>
      {contests.length === 0 ? (
        <EmptyState icon="👤" title="No candidates yet" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {contests.map((c) => (
            <CandidateCard key={c.id} contest={c} showConstituency />
          ))}
        </div>
      )}
    </>
  )
}
