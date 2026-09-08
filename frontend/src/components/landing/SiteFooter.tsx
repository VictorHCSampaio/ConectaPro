import { Link } from 'react-router-dom'

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-slate-500 sm:flex-row">
        <p>ConectaPro © {new Date().getFullYear()} — Universidade de Mogi das Cruzes</p>
        <div className="flex items-center gap-6">
          <Link to="#" className="transition-colors hover:text-slate-900">
            Sobre
          </Link>
          <Link to="#" className="transition-colors hover:text-slate-900">
            Termos
          </Link>
          <Link to="#" className="transition-colors hover:text-slate-900">
            Privacidade
          </Link>
        </div>
      </div>
    </footer>
  )
}
