import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { cn } from '@/lib/cn'

const NAV_LINKS = [
  { to: '/', label: 'Início', end: true },
  { to: '/professores', label: 'Buscar professores', end: false },
]

export function SiteHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  function closeMenu() {
    setIsMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" onClick={closeMenu} className="group flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white shadow-sm transition-transform duration-300 ease-out group-hover:-rotate-6 group-hover:scale-110">
            C
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900">ConectaPro</span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium md:flex">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                cn(
                  'transition-colors',
                  isActive ? 'text-brand-600' : 'text-slate-500 hover:text-slate-900',
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
          <Link to="#" className="text-slate-500 transition-colors hover:text-slate-900">
            Seja professor
          </Link>
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          <Link
            to="/login"
            className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
          >
            Entrar
          </Link>
          <Link
            to="/register"
            className="shadow-glow-brand hover:shadow-glow-brand-lg rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 px-4 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:from-brand-500 hover:to-brand-600"
          >
            Cadastrar
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setIsMenuOpen((previous) => !previous)}
          aria-label={isMenuOpen ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={isMenuOpen}
          className="flex size-9 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100 md:hidden"
        >
          {isMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {isMenuOpen && (
        <nav className="animate-fade-in flex flex-col gap-1 border-t border-slate-200 bg-white px-4 py-3 text-sm font-medium md:hidden">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              onClick={closeMenu}
              className={({ isActive }) =>
                cn(
                  'rounded-lg px-3 py-2.5 transition-colors',
                  isActive ? 'bg-brand-50 text-brand-600' : 'text-slate-600 hover:bg-slate-50',
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
          <Link
            to="#"
            onClick={closeMenu}
            className="rounded-lg px-3 py-2.5 text-slate-600 transition-colors hover:bg-slate-50"
          >
            Seja professor
          </Link>

          <div className="mt-2 flex flex-col gap-2 border-t border-slate-100 pt-3">
            <Link
              to="/login"
              onClick={closeMenu}
              className="rounded-lg px-3 py-2.5 text-center text-slate-600 transition-colors hover:bg-slate-50"
            >
              Entrar
            </Link>
            <Link
              to="/register"
              onClick={closeMenu}
              className="shadow-glow-brand rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 px-3 py-2.5 text-center font-semibold text-white transition-all hover:from-brand-500 hover:to-brand-600"
            >
              Cadastrar
            </Link>
          </div>
        </nav>
      )}
    </header>
  )
}
