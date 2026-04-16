import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import SearchBar from '../ui/SearchBar'

const navLinks = [
  { to: '/constituencies', label: 'Constituencies' },
  { to: '/parties', label: 'Parties' },
]

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-100 shadow-sm">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center h-14 gap-3">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xl">🗳</span>
            <span className="font-bold text-sky-700 text-base leading-tight">
              TN <span className="text-slate-700">Elections</span>
              <span className="block text-xs font-normal text-slate-400 -mt-0.5">2026</span>
            </span>
          </Link>

          {/* Search — hidden on very small screens, grows on sm+ */}
          <div className="hidden sm:flex flex-1 max-w-md mx-auto">
            <SearchBar className="w-full" />
          </div>

          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-sky-50 text-sky-700'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>

          {/* Hamburger */}
          <button
            className="md:hidden ml-auto p-2 rounded-lg text-slate-500 hover:bg-slate-100"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile search (always visible below header on small) */}
        <div className="sm:hidden pb-3">
          <SearchBar />
        </div>

        {/* Mobile nav dropdown */}
        {menuOpen && (
          <nav className="md:hidden border-t border-slate-100 py-2 flex flex-col gap-1">
            {navLinks.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-medium ${
                    isActive ? 'bg-sky-50 text-sky-700' : 'text-slate-600'
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>
        )}
      </div>
    </header>
  )
}
