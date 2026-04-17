import { useState, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useParty } from '../hooks/useParty'
import { supabase } from '../lib/supabase'
import PartyBadge from '../components/party/PartyBadge'
import AllianceTag from '../components/party/AllianceTag'
import CandidateCard from '../components/candidate/CandidateCard'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import EmptyState from '../components/ui/EmptyState'

const PAGE_SIZE = 50

export default function PartyPage() {
  const { slug } = useParams()
  const { data: party, isLoading, isError } = useParty(slug)
  const [extraContests, setExtraContests] = useState([])
  const [loadingMore, setLoadingMore] = useState(false)
  const [currentOffset, setCurrentOffset] = useState(PAGE_SIZE)

  const loadMore = useCallback(async () => {
    if (!party?.id) return
    setLoadingMore(true)
    const { data } = await supabase
      .from('election_contests')
      .select(`
        id, assets_movable_lakh, assets_immovable_lakh,
        liabilities_lakh, criminal_cases_pending,
        candidate:candidates(id, full_name, slug, photo_url),
        constituency:constituencies(name, slug, district:districts(name))
      `)
      .eq('party_id', party.id)
      .eq('is_current_election', true)
      .order('constituency_id')
      .range(currentOffset, currentOffset + PAGE_SIZE - 1)
    setExtraContests(prev => [...prev, ...(data ?? [])])
    setCurrentOffset(o => o + PAGE_SIZE)
    setLoadingMore(false)
  }, [party?.id, currentOffset])

  if (isLoading) return <LoadingSpinner label="Loading party…" />
  if (isError || !party) return <EmptyState icon="🏳" title="Party not found" />

  const allContests = [...(party.contests ?? []), ...extraContests]
  const total = party.total ?? 0
  const hasMore = allContests.length < total

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
          <p className="text-2xl font-bold text-sky-600">{total}</p>
          <p className="text-xs text-slate-400">candidates</p>
        </div>
      </div>

      {/* Candidates */}
      <h2 className="text-base font-semibold text-slate-700 mb-3">
        Candidates {total > 0 && `(${allContests.length}${hasMore ? ` of ${total}` : ''})`}
      </h2>
      {allContests.length === 0 ? (
        <EmptyState icon="👤" title="No candidates yet" />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {allContests.map((c) => (
              <CandidateCard key={c.id} contest={c} showConstituency />
            ))}
          </div>

          {hasMore && (
            <div className="mt-5 text-center">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="px-5 py-2.5 bg-sky-500 text-white text-sm font-medium rounded-xl hover:bg-sky-600 disabled:opacity-50 transition-colors"
              >
                {loadingMore ? 'Loading…' : `Load more (${total - allContests.length} remaining)`}
              </button>
            </div>
          )}
        </>
      )}
    </>
  )
}
