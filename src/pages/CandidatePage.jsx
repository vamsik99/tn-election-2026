import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useCandidate } from '../hooks/useCandidate'
import PartyBadge from '../components/party/PartyBadge'
import AllianceTag from '../components/party/AllianceTag'
import AffidavitSummary from '../components/candidate/AffidavitSummary'
import ElectionHistory from '../components/candidate/ElectionHistory'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import EmptyState from '../components/ui/EmptyState'

function age(dob) {
  if (!dob) return null
  const diff = Date.now() - new Date(dob).getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25))
}

export default function CandidatePage() {
  const { slug } = useParams()
  const { data: candidate, isLoading, isError } = useCandidate(slug)

  if (isLoading) return <LoadingSpinner label="Loading candidate…" />
  if (isError || !candidate) return (
    <EmptyState icon="👤" title="Candidate not found" />
  )

  const currentContest = candidate.contests?.find((c) => c.is_current_election)

  return (
    <>
      <Helmet>
        <title>{candidate.full_name} — TN Elections 2026</title>
        <meta name="description" content={`${candidate.full_name} contesting from ${currentContest?.constituency?.name ?? ''} in Tamil Nadu 2026 elections.`} />
      </Helmet>

      {/* Back link */}
      {currentContest?.constituency && (
        <Link
          to={`/constituency/${currentContest.constituency.slug}`}
          className="text-xs text-sky-600 hover:underline mb-3 inline-block"
        >
          ← {currentContest.constituency.name}
        </Link>
      )}

      {/* Profile header */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-4">
        {/* Full-bleed photo strip */}
        <div className="h-32 sm:h-44 bg-gradient-to-r from-sky-100 to-sky-200 relative">
          {candidate.photo_url && (
            <img
              src={`${candidate.photo_url}?width=400&quality=90`}
              alt={candidate.full_name}
              className="w-full h-full object-cover object-top opacity-80"
            />
          )}
        </div>

        <div className="px-4 pb-4 -mt-8 relative">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-full border-4 border-white bg-slate-100 overflow-hidden shadow mb-2">
            {candidate.photo_url ? (
              <img
                src={`${candidate.photo_url}?width=128&quality=80`}
                alt={candidate.full_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl">👤</div>
            )}
          </div>

          <h1 className="text-xl font-bold text-slate-800">{candidate.full_name}</h1>
          {candidate.full_name_ta && (
            <p className="text-sm text-slate-500">{candidate.full_name_ta}</p>
          )}

          {/* Party + Alliance */}
          {currentContest?.party && (
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <PartyBadge
                abbreviation={currentContest.party.abbreviation}
                name={currentContest.party.name}
                colorHex={currentContest.party.color_hex}
                size="md"
                showLabel
              />
              <AllianceTag alliance={currentContest.party.alliance} />
            </div>
          )}

          {/* Constituency */}
          {currentContest?.constituency && (
            <p className="mt-2 text-sm text-slate-600">
              Contesting from{' '}
              <Link to={`/constituency/${currentContest.constituency.slug}`} className="text-sky-600 font-medium hover:underline">
                {currentContest.constituency.name}
              </Link>
              {currentContest.constituency.district && (
                <span className="text-slate-400">, {currentContest.constituency.district.name}</span>
              )}
            </p>
          )}
        </div>
      </div>

      {/* Personal details */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-4">
        <h3 className="font-semibold text-slate-700 text-sm uppercase tracking-wide mb-3">Personal Details</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
          {age(candidate.date_of_birth) && (
            <div>
              <p className="text-xs text-slate-400">Age</p>
              <p className="font-medium text-slate-700">{age(candidate.date_of_birth)} yrs</p>
            </div>
          )}
          {candidate.gender && (
            <div>
              <p className="text-xs text-slate-400">Gender</p>
              <p className="font-medium text-slate-700 capitalize">{candidate.gender}</p>
            </div>
          )}
          {candidate.education && (
            <div>
              <p className="text-xs text-slate-400">Education</p>
              <p className="font-medium text-slate-700">{candidate.education}</p>
            </div>
          )}
          {candidate.profession && (
            <div>
              <p className="text-xs text-slate-400">Profession</p>
              <p className="font-medium text-slate-700">{candidate.profession}</p>
            </div>
          )}
        </div>
      </div>

      {/* Affidavit summary */}
      {currentContest && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-4">
          <AffidavitSummary contest={currentContest} />
        </div>
      )}

      {/* Election history */}
      {candidate.contests?.some((c) => !c.is_current_election) && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
          <ElectionHistory contests={candidate.contests} />
        </div>
      )}
    </>
  )
}
