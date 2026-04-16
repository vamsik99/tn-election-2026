const ALLIANCE_STYLES = {
  'INDIA': 'bg-blue-100 text-blue-800',
  'NDA': 'bg-orange-100 text-orange-800',
  'Independent': 'bg-slate-100 text-slate-600',
}

export default function AllianceTag({ alliance }) {
  if (!alliance) return null
  const style = ALLIANCE_STYLES[alliance] || 'bg-slate-100 text-slate-600'
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${style}`}>
      {alliance}
    </span>
  )
}
