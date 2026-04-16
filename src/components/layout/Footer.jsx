export default function Footer() {
  return (
    <footer className="border-t border-slate-100 bg-white mt-12 py-8">
      <div className="max-w-5xl mx-auto px-4 text-center">
        <p className="text-sm text-slate-500">
          Data sourced from{' '}
          <a href="https://affidavit.eci.gov.in" target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:underline">
            ECI Affidavit Portal
          </a>{' '}
          &amp;{' '}
          <a href="https://www.myneta.info" target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:underline">
            MyNeta.info
          </a>
        </p>
        <p className="text-xs text-slate-400 mt-1">
          This is a non-partisan voter awareness resource. TN Elections 2026.
        </p>
      </div>
    </footer>
  )
}
