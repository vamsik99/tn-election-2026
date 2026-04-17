import { useSearchParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useQuery } from '@tanstack/react-query'
import { useSearch } from '../hooks/useSearch'
import { supabase } from '../lib/supabase'
import { IS_DEMO } from '../lib/demoData'
import PartyBadge from '../components/party/PartyBadge'
import SearchBar from '../components/ui/SearchBar'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import EmptyState from '../components/ui/EmptyState'

/**
 * Secondary query: given candidate UUIDs from search_index, fetch their
 * current election contest (party + constituency).
 */
function useCandidateEnrichment(results) {
  const candidateIds = results
    .filter((r) => r.entity_type === 'candidate')
    .map((r) => r.entity_id)

  return useQuery({
    queryKey: ['candidate-enrichment', candidateIds.join(',')],
    queryFn: async () => {
      if (IS_DEMO || candidateIds.length === 0) return {}
      const { data } = await supabase
        .from('election_contests')
        .select(`
          candidate_id,
          constituency:constituencies(name, slug),
          party:parties(abbreviation, color_hex, name, slug)
        `)
        .in('candidate_id', candidateIds)
        .eq('is_current_election', true)
      // Return a map: candidateId → { constituency, party }
      const map = {}
      for (const row of data ?? []) {
        map[row.candidate_id] = { constituency: row.constituency, party: row.party }
      }
      return map
    },
    enabled: candidateIds.length > 0,
    staleTime: 1000 * 60 * 5,
  })
}

export default function SearchPage() {
  const [searchParams] = useSearchParams()
  const q = searchParams.get('q') || ''
  const { data: results = [], isLoading, isFetching } = useSearch(q)
  const { data: enrichment = {} } = useCandidateEnrichment(results)

  return (
    <>
      <Helmet>
        <title>{q ? `"${q}" — Search` : 'Search'} — TN Elections 2026</title>
      </Helmet>

      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-800 mb-3">Search</h1>
        <SearchBar initialValue={q} />
      </div>

      {q.length < 2 ? (
        <EmptyState
          icon="🔍"
          title="Type to search"
          message="Enter at least 2 characters to search candidates or constituencies."
        />
      ) : isLoading || isFetching ? (
        <LoadingSpinner />
      ) : results.length === 0 ? (
        <EmptyState
          icon="🤷"
          title={`No results for "${q}"`}
          message="Try different keywords or check spelling."
        />
      ) : (
        <div className="space-y-2">
          <p className="text-sm text-slate-500 mb-3">
            {results.length} result{results.length !== 1 ? 's' : ''}
          </p>
          {results.map((r) => {
            const isCandidate = r.entity_type === 'candidate'
            const href = isCandidate
              ? `/candidate/${r.slug}`
              : `/constituency/${r.slug}`
            const extra = isCandidate ? enrichment[r.entity_id] : null

            return (
              <Link
                key={`${r.entity_type}-${r.entity_id}`}
                to={href}
                className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md hover:border-sky-200 transition-all"
              >
                {/* Icon / photo placeholder */}
                <span className="text-2xl flex-shrink-0">
                  {isCandidate ? '👤' : '🏛'}
                </span>

                {/* Main info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 truncate">{r.label}</p>

                  {/* Constituency: district name for constituency results */}
                  {!isCandidate && r.sub_label && (
                    <p className="text-xs text-slate-500 truncate">{r.sub_label}</p>
                  )}

                  {/* Candidate: constituency from search_index sub_label + party from enrichment */}
                  {isCandidate && (
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      {/* sub_label has constituency name (updated search_index) */}
                      {r.sub_label && (
                        <span className="text-xs text-sky-600 truncate">{r.sub_label}</span>
                      )}
                      {/* Party badge from secondary enrichment query */}
                      {extra?.party && (
                        <PartyBadge
                          abbreviation={extra.party.abbreviation}
                          name={extra.party.name}
                          colorHex={extra.party.color_hex}
                          size="sm"
                          showLabel
                        />
                      )}
                      {extra && !extra.party && (
                        <span className="text-xs text-slate-400">Independent</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Type chip */}
                <span className="text-xs text-slate-400 capitalize flex-shrink-0 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                  {isCandidate ? 'Candidate' : 'Constituency'}
                </span>
              </Link>
            )
          })}
        </div>
      )}
    </>
  )
}
