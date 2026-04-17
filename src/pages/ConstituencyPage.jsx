import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useConstituency } from '../hooks/useConstituency'
import CandidateCard from '../components/candidate/CandidateCard'
import PastResultsTable from '../components/constituency/PastResultsTable'
import ConstituencyDropdown from '../components/ui/ConstituencyDropdown'
import PartyFilterStrip from '../components/ui/PartyFilterStrip'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import EmptyState from '../components/ui/EmptyState'

export default function ConstituencyPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [partyFilter, setPartyFilter] = useState(null)
  const { data, isLoading, isError } = useConstituency(slug)

  if (isLoading) return <LoadingSpinner label="Loading constituency…" />
  if (isError || !data) return (
    <EmptyState icon="🏛" title="Constituency not found" message="Check the URL or search above." />
  )

  const allContests = data.contests ?? []

  // Slugs of parties actually contesting in this constituency (for filtered strip)
  const localPartySlugs = new Set(
    allContests.map((c) => c.party?.slug).filter(Boolean)
  )

  const contests = allContests.filter((c) => {
    if (!partyFilter) return true
    return c.party?.slug === partyFilter
  })

  // Last past result (most recent non-2026 election)
  const lastResult = (data.past_results ?? [])
    .filter((r) => r.election_year < 2026)
    .sort((a, b) => b.election_year - a.election_year)[0]

  return (
    <>
      <Helmet>
        <title>{data.name} — TN Elections 2026</title>
        <meta name="description" content={`2026 election candidates for ${data.name}, ${data.district?.name}`} />
      </Helmet>

      {/* Sticky jump dropdown */}
      <div className="sticky top-16 z-30 bg-slate-50 py-2 -mx-4 px-4 border-b border-slate-100 mb-4">
        <ConstituencyDropdown
          value={slug}
          placeholder="Switch constituency…"
          onSelect={(s) => navigate(`/constituency/${s}`)}
        />
      </div>

      {/* Header */}
      <div className="mb-4">
        <Link to="/constituencies" className="text-xs text-sky-600 hover:underline mb-1 inline-block">
          ← All Constituencies
        </Link>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-sky-600">{data.constituency_no}</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">{data.name}</h1>
            <p className="text-sm text-slate-500">
              {data.district?.name}
              {data.reserved_for !== 'general' && (
                <span className="ml-2 px-1.5 py-0.5 bg-amber-50 text-amber-700 text-xs rounded border border-amber-100">
                  {data.reserved_for.toUpperCase()} Reserved
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Previous MLA banner */}
      {lastResult?.winning_candidate && (
        <div className="mb-4 p-3 bg-green-50 border border-green-100 rounded-xl text-sm">
          <span className="text-slate-500">Current MLA (2021): </span>
          <Link to={`/candidate/${lastResult.winning_candidate.slug}`} className="font-semibold text-green-700 hover:underline">
            {lastResult.winning_candidate.full_name}
          </Link>
          {lastResult.winning_party && (
            <span className="ml-2 text-slate-500">({lastResult.winning_party.abbreviation})</span>
          )}
        </div>
      )}

      {/* 2026 Candidates */}
      <section className="mb-6">
        <h2 className="text-base font-semibold text-slate-700 mb-3">
          2026 Candidates{' '}
          {partyFilter
            ? `(${contests.length} of ${allContests.length})`
            : `(${allContests.length})`}
        </h2>
        <div className="mb-3">
          <PartyFilterStrip
            selected={partyFilter}
            onSelect={setPartyFilter}
            limitToSlugs={localPartySlugs}
          />
        </div>
        {contests.length === 0 ? (
          <EmptyState icon="👤" title="No candidates yet" message="Candidate data will appear once nominations are filed." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {contests.map((c) => (
              <CandidateCard key={c.id} contest={c} />
            ))}
          </div>
        )}
      </section>

      {/* Past Results */}
      {data.past_results?.length > 0 && (
        <section className="bg-white rounded-2xl border border-slate-100 p-4">
          <PastResultsTable results={data.past_results} />
        </section>
      )}
    </>
  )
}
