import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
      <span className="text-6xl">🗳</span>
      <h1 className="text-2xl font-bold text-slate-800">Page not found</h1>
      <p className="text-slate-500 max-w-xs">The page you are looking for does not exist.</p>
      <Link
        to="/"
        className="mt-2 px-5 py-2.5 bg-sky-500 text-white rounded-xl font-medium hover:bg-sky-600 transition-colors"
      >
        Go to Home
      </Link>
    </div>
  )
}
