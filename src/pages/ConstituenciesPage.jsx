import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'
import { useConstituencies } from '../hooks/useConstituencies'
import { useDistricts } from '../hooks/useDistricts'
import ConstituencyCard from '../components/constituency/ConstituencyCard'
import ConstituencyDropdown from '../components/ui/ConstituencyDropdown'
import LoadingSpinner from '../components/ui/LoadingSpinner'

export default function ConstituenciesPage() {
  const [districtFilter, setDistrictFilter] = useState('')
  const navigate = useNavigate()
  const { data: districts = [] } = useDistricts()
  const { data: constituencies = [], isLoading } = useConstituencies()

  // Group by district
  const grouped = districts
    .map((d) => ({
      ...d,
      items: constituencies.filter((c) => c.district?.slug === d.slug),
    }))
    .filter((d) => {
      if (!districtFilter) return d.items.length > 0
      return d.slug === districtFilter && d.items.length > 0
    })

  return (
    <>
      <Helmet>
        <title>All Constituencies — TN Elections 2026</title>
      </Helmet>

      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-800 mb-1">All Constituencies</h1>
        <p className="text-sm text-slate-500">234 assembly segments across 38 districts</p>
      </div>

      {/* Quick jump dropdown */}
      <div className="mb-4">
        <ConstituencyDropdown
          placeholder="Jump to a constituency…"
          onSelect={(slug) => navigate(`/constituency/${slug}`)}
        />
      </div>

      {/* District filter */}
      <div className="mb-5 overflow-x-auto">
        <div className="flex gap-2 pb-1">
          <button
            onClick={() => setDistrictFilter('')}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
              !districtFilter
                ? 'bg-sky-500 text-white border-sky-500 shadow'
                : 'bg-white text-slate-600 border-slate-200 hover:border-sky-300'
            }`}
          >
            All Districts
          </button>
          {districts.map((d) => (
            <button
              key={d.slug}
              onClick={() => setDistrictFilter(d.slug === districtFilter ? '' : d.slug)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                districtFilter === d.slug
                  ? 'bg-sky-500 text-white border-sky-500 shadow'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-sky-300'
              }`}
            >
              {d.name}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="space-y-6">
          {grouped.map((district) => (
            <div key={district.slug}>
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-2">
                <span>🏙</span> {district.name}
                <span className="text-slate-300 font-normal normal-case tracking-normal">({district.items.length})</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {district.items.map((c) => (
                  <ConstituencyCard key={c.slug} constituency={c} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
