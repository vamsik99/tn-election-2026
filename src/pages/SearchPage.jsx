import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useSearch } from '../hooks/useSearch'
import SearchBar from '../components/ui/SearchBar'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import EmptyState from '../components/ui/EmptyState'

export default function SearchPage() {
  const [searchParams] = useSearchParams()
  const q = searchParams.get('q') || ''
  const { data: results = [], isLoading, isFetching } = useSearch(q)

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
        <EmptyState icon="🔍" title="Type to search" message="Enter at least 2 characters to search candidates or constituencies." />
      ) : isLoading || isFetching ? (
        <LoadingSpinner />
      ) : results.length === 0 ? (
        <EmptyState icon="🤷" title={`No results for "${q}"`} message="Try different keywords or check spelling." />
      ) : (
        <div className="space-y-2">
          <p className="text-sm text-slate-500 mb-3">{results.length} result{results.length !== 1 ? 's' : ''}</p>
          {results.map((r) => {
            const href = r.entity_type === 'constituency'
              ? `/constituency/${r.slug}`
              : `/candidate/${r.slug}`
            return (
              <Link
                key={`${r.entity_type}-${r.entity_id}`}
                to={href}
                className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md hover:border-sky-200 transition-all"
              >
                <span className="text-2xl flex-shrink-0">
                  {r.entity_type === 'constituency' ? '🏛' : '👤'}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 truncate">{r.label}</p>
                  {r.sub_label && (
                    <p className="text-xs text-slate-500 truncate">{r.sub_label}</p>
                  )}
                </div>
                <span className="text-xs text-slate-400 capitalize flex-shrink-0 bg-slate-50 px-2 py-0.5 rounded">
                  {r.entity_type}
                </span>
              </Link>
            )
          })}
        </div>
      )}
    </>
  )
}
