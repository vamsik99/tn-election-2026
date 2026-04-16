export default function EmptyState({ icon = '🔍', title = 'Nothing found', message = '' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-2 text-slate-400">
      <span className="text-4xl">{icon}</span>
      <p className="font-medium text-slate-600">{title}</p>
      {message && <p className="text-sm text-center max-w-xs">{message}</p>}
    </div>
  )
}
