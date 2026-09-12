import { BookOpen, LogOut, Menu, UserRound, X } from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Brand } from '@/components/Brand'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/contexts/ThemeContext'
import { cn } from '@/lib/cn'

const NAV_LINKS = [
  { to: '/', label: 'Início', end: true },
  { to: '/professores', label: 'Professores', end: false },
]

const PRIMARY_BUTTON_CLASS =
  'rounded-md bg-ink-800 px-4 py-2 text-sm font-semibold text-paper-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_3px_0_var(--color-ink-950),0_10px_18px_-10px_rgba(18,38,63,0.7)] transition-[background-color,transform,box-shadow] duration-150 hover:bg-ink-700 active:translate-y-[3px] active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.35)]'

export function SiteHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, isAuthenticated, signOut } = useAuth()
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()

  const isTeacher = user?.role === 'PROFESSOR'

  function closeMenu() {
    setIsMenuOpen(false)
  }

  function handleSignOut() {
    closeMenu()
    signOut()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-40 border-b border-paper-200 bg-paper-50/85 backdrop-blur-sm transition-colors duration-300 dark:border-white/10 dark:bg-[#0a0a0a]/80 dark:backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" onClick={closeMenu}>
          <Brand />
        </Link>

        <nav className="hidden items-center gap-1 text-sm md:flex">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                cn(
                  'relative rounded-sm px-3 py-2 transition-colors duration-200',
                  isActive
                    ? 'text-ink-900 after:absolute after:inset-x-3 after:bottom-1 after:h-0.5 after:rounded-full after:bg-ocre-400 dark:text-white'
                    : 'text-ink-600 hover:bg-paper-100 hover:text-ink-900 dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-white',
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
          {!isTeacher && (
            <Link
              to="#"
              className="rounded-sm px-3 py-2 text-ink-600 transition-colors duration-200 hover:bg-paper-100 hover:text-ink-900"
            >
              Seja professor
            </Link>
          )}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === 'light' ? 'Ativar modo escuro' : 'Ativar modo claro'}
            className="flex size-9 items-center justify-center rounded-md text-ink-600 transition-colors hover:bg-paper-100 hover:text-ink-900 dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-white"
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          {isAuthenticated ? (
            <>
              {user?.isAdmin && (
                <Link
                  to="/admin/materias"
                  className="inline-flex items-center gap-1.5 text-sm text-ink-600 transition-colors hover:text-ink-900"
                >
                  <BookOpen className="size-4" />
                  Matérias
                </Link>
              )}
              {isTeacher && (
                <Link to="/profile/edit" className={cn(PRIMARY_BUTTON_CLASS, 'inline-flex items-center gap-2')}>
                  <UserRound className="size-4" />
                  Meu perfil
                </Link>
              )}
              <button
                type="button"
                onClick={handleSignOut}
                className="inline-flex items-center gap-1.5 text-sm text-ink-600 transition-colors hover:text-ink-900"
              >
                <LogOut className="size-4" />
                Sair
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm text-ink-600 transition-colors hover:text-ink-900 dark:text-zinc-400 dark:hover:text-white">
                Entrar
              </Link>
              <Link to="/register" className={PRIMARY_BUTTON_CLASS}>
                Cadastrar
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-1 md:hidden">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === 'light' ? 'Ativar modo escuro' : 'Ativar modo claro'}
            className="flex size-9 items-center justify-center rounded-md text-ink-700 transition-colors hover:bg-paper-100 dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-white"
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <button
            type="button"
            onClick={() => setIsMenuOpen((previous) => !previous)}
            aria-label={isMenuOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={isMenuOpen}
            className="flex size-9 items-center justify-center rounded-md text-ink-700 transition-colors hover:bg-paper-100 dark:text-zinc-400 dark:hover:bg-white/5"
          >
            {isMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <nav className="flex flex-col gap-1 border-t border-paper-200 bg-paper-50 px-4 py-3 text-sm transition-colors duration-300 dark:border-white/10 dark:bg-[#0a0a0a] md:hidden">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              onClick={closeMenu}
              className={({ isActive }) =>
                cn(
                  'rounded-md px-3 py-2.5 transition-colors',
                  isActive
                    ? 'bg-paper-100 text-ink-900 dark:bg-white/10 dark:text-white'
                    : 'text-ink-600 hover:bg-paper-100 dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-white',
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
          {!isTeacher && (
            <Link
              to="#"
              onClick={closeMenu}
              className="rounded-md px-3 py-2.5 text-ink-600 transition-colors hover:bg-paper-100"
            >
              Seja professor
            </Link>
          )}

          <div className="mt-2 flex flex-col gap-2 border-t border-paper-200 pt-3 dark:border-white/10">
            {isAuthenticated ? (
              <>
                {user?.isAdmin && (
                  <Link
                    to="/admin/materias"
                    onClick={closeMenu}
                    className="flex items-center justify-center gap-2 rounded-md border border-paper-300 bg-white px-3 py-2.5 text-center text-ink-800"
                  >
                    <BookOpen className="size-4" />
                    Matérias
                  </Link>
                )}
                {isTeacher && (
                  <Link
                    to="/profile/edit"
                    onClick={closeMenu}
                    className="flex items-center justify-center gap-2 rounded-md bg-ink-800 px-3 py-2.5 text-center font-semibold text-paper-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_3px_0_var(--color-ink-950)] active:translate-y-[3px] active:shadow-none"
                  >
                    <UserRound className="size-4" />
                    Meu perfil
                  </Link>
                )}
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="flex items-center justify-center gap-1.5 rounded-md border border-paper-300 bg-white px-3 py-2.5 text-center text-ink-800"
                >
                  <LogOut className="size-4" />
                  Sair
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={closeMenu}
                  className="rounded-md border border-paper-300 bg-white px-3 py-2.5 text-center text-ink-800 transition-colors duration-300 dark:border-white/10 dark:bg-white/5 dark:text-white"
                >
                  Entrar
                </Link>
                <Link
                  to="/register"
                  onClick={closeMenu}
                  className="rounded-md bg-ink-800 px-3 py-2.5 text-center font-semibold text-paper-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_3px_0_var(--color-ink-950)] active:translate-y-[3px] active:shadow-none"
                >
                  Cadastrar
                </Link>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  )
}
