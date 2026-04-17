import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import SearchBar from '../components/ui/SearchBar'
import ConstituencyDropdown from '../components/ui/ConstituencyDropdown'
import PartyFilterStrip from '../components/ui/PartyFilterStrip'
import CandidateCard from '../components/candidate/CandidateCard'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import EmptyState from '../components/ui/EmptyState'
import { supabase } from '../lib/supabase'
import { useQuery } from '@tanstack/react-query'
import { IS_DEMO, DEMO_CONTESTS } from '../lib/demoData'

function useFeaturedContests(partySlug) {
  return useQuery({
    queryKey: ['featured-contests', partySlug],
    queryFn: async () => {
      if (IS_DEMO) {
        let results = DEMO_CONTESTS
        if (partySlug) {
          results = results.filter((c) => c.party?.slug === partySlug)
        }
        return results.slice(0, 12)
      }
      let query = supabase
        .from('election_contests')
        .select(`
          id, assets_movable_lakh, assets_immovable_lakh,
          liabilities_lakh, criminal_cases_pending, nomination_date,
          candidate:candidates(id, full_name, full_name_ta, slug, photo_url),
          party:parties(id, name, abbreviation, color_hex, slug),
          constituency:constituencies(name, slug)
        `)
        .eq('is_current_election', true)
        .order('nomination_date', { ascending: true, nullsFirst: false })
        .limit(12)

      if (partySlug) {
        const { data: party } = await supabase
          .from('parties')
          .select('id')
          .eq('slug', partySlug)
          .single()
        if (party) query = query.eq('party_id', party.id)
      }

      const { data, error } = await query
      if (error) throw error
      return data
    },
    staleTime: 1000 * 60 * 5,
  })
}

export default function HomePage() {
  const [selectedParty, setSelectedParty] = useState(null)
  const navigate = useNavigate()
  const { data: contests = [], isLoading } = useFeaturedContests(selectedParty)

  return (
    <>
      <Helmet>
        <title>TN Elections 2026 — Know Your Candidates</title>
        <meta name="description" content="Browse Tamil Nadu 2026 election candidates by constituency and party. View affidavit data, assets, and criminal records." />
      </Helmet>

      {/* Hero */}
      <div className="bg-gradient-to-br from-sky-600 to-sky-800 rounded-2xl p-6 sm:p-8 mb-6 text-white text-center shadow-lg">
        <h1 className="text-2xl sm:text-3xl font-bold mb-1">Tamil Nadu Elections 2026</h1>
        <p className="text-sky-200 text-sm mb-5">Know your candidates before you vote</p>
        <SearchBar className="max-w-lg mx-auto" />
      </div>

      {/* Quick find by constituency */}
      <section className="mb-6">
        <h2 className="text-base font-semibold text-slate-700 mb-2">Find by Constituency</h2>
        <ConstituencyDropdown
          placeholder="Choose your constituency…"
          onSelect={(slug) => navigate(`/constituency/${slug}`)}
        />
      </section>

      {/* Filter by party */}
      <section className="mb-4">
        <h2 className="text-base font-semibold text-slate-700 mb-2">Filter by Party</h2>
        <PartyFilterStrip selected={selectedParty} onSelect={setSelectedParty} />
      </section>

      {/* Candidates grid */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-slate-700">
            {selectedParty ? 'Candidates' : 'Recent Nominations'}
          </h2>
          {!selectedParty && (
            <a href="/constituencies" className="text-xs text-sky-600 hover:underline">
              All 234 constituencies →
            </a>
          )}
        </div>
        {isLoading ? (
          <LoadingSpinner />
        ) : contests.length === 0 ? (
          <EmptyState icon="🗳" title="No candidates found" message="Try a different filter." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {contests.map((c) => (
              <CandidateCard key={c.id} contest={c} showConstituency />
            ))}
          </div>
        )}
      </section>
    </>
  )
}
