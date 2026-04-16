import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSearch } from '../../hooks/useSearch'

export default function SearchBar({ initialValue = '', className = '' }) {
  const [query, setQuery] = useState(initialValue)
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const { data: results = [], isFetching } = useSearch(query)
  const containerRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleSubmit(e) {
    e.preventDefault()
    if (query.trim()) {
      setOpen(false)
      navigate(`/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  function handleSelect(result) {
    setOpen(false)
    setQuery('')
    const path = result.entity_type === 'constituency'
      ? `/constituency/${result.slug}`
      : `/candidate/${result.slug}`
    navigate(path)
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <form onSubmit={handleSubmit}>
        <div className="flex items-center bg-white border border-slate-200 rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-sky-400 focus-within:border-sky-400 transition-all">
          <svg className="w-5 h-5 text-slate-400 ml-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
            onFocus={() => query.length >= 2 && setOpen(true)}
            placeholder="Search candidate or constituency…"
            className="flex-1 bg-transparent px-3 py-3 text-sm text-slate-700 placeholder-slate-400 focus:outline-none"
          />
          {isFetching && (
            <div className="mr-3 w-4 h-4 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
          )}
        </div>
      </form>

      {/* Dropdown */}
      {open && results.length > 0 && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
          {results.map((r) => (
            <button
              key={`${r.entity_type}-${r.entity_id}`}
              onClick={() => handleSelect(r)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-sky-50 text-left transition-colors"
            >
              <span className="text-lg">
                {r.entity_type === 'constituency' ? '🏛' : '👤'}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">{r.label}</p>
                {r.sub_label && (
                  <p className="text-xs text-slate-500 truncate">{r.sub_label}</p>
                )}
              </div>
              <span className="text-xs text-slate-400 capitalize flex-shrink-0">{r.entity_type}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
