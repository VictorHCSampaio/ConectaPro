import {
  BookOpen,
  CalendarDays,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageCircle,
  Moon,
  ShieldCheck,
  Sun,
  UserRound,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Brand } from '@/components/Brand'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { NavDropdown } from '@/components/landing/NavDropdown'
import { SininhoNotificacoes } from '@/components/notificacoes/SininhoNotificacoes'
import { useAuth } from '@/hooks/useAuth'
import { ehContaAdmin, type UserRole } from '@/types/auth'
import { useNotificacoes } from '@/hooks/useNotificacoes'
import { useTheme } from '@/contexts/ThemeContext'
import { cn } from '@/lib/cn'

const NAV_LINKS = [
  { to: '/', label: 'Início', end: true },
  { to: '/professores', label: 'Professores', end: false },
]

const PRIMARY_BUTTON_CLASS =
  'rounded-md bg-ink-800 px-4 py-2 text-sm font-semibold text-paper-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_3px_0_var(--color-ink-950),0_10px_18px_-10px_rgba(18,38,63,0.7)] transition-[background-color,transform,box-shadow] duration-150 hover:bg-ink-700 active:translate-y-[3px] active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.35)]'

const NAV_LINK_CLASS =
  'inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm text-ink-600 transition-colors hover:bg-paper-100 hover:text-ink-900 dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-white'

const DROPDOWN_ITEM_CLASS =
  'flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-ink-700 transition-colors hover:bg-paper-100 hover:text-ink-900 dark:text-zinc-300 dark:hover:bg-white/5 dark:hover:text-white'

function rotuloConta(role: UserRole | null | undefined, isAdmin?: boolean) {
  if (ehContaAdmin({ role, isAdmin })) {
    return 'Administrador'
  }
  if (role === 'PROFESSOR') {
    return 'Professor'
  }
  if (role === 'ALUNO') {
    return 'Aluno'
  }
  return null
}

function rotuloAulas(role: UserRole | null | undefined, isAdmin?: boolean) {
  if (role === 'PROFESSOR' && !isAdmin) {
    return 'Aulas recebidas'
  }
  return 'Minhas aulas'
}

export function SiteHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, isAuthenticated, signOut } = useAuth()
  const { notificacoes, marcarComoLida } = useNotificacoes(isAuthenticated)
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()

  function closeMenu() {
    setIsMenuOpen(false)
  }

  function handleSignOut() {
    closeMenu()
    signOut()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-40 border-b border-paper-200 bg-paper-50/85 backdrop-blur-sm transition-colors duration-300 dark:border-white/10 dark:bg-night-900/80 dark:backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-4 sm:gap-3 sm:px-6">
        <Link to="/" onClick={closeMenu} className="min-w-0 shrink">
          <Brand administrador={ehContaAdmin(user)} />
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
        </nav>

        <div className="hidden items-center gap-1.5 md:flex">
          {isAuthenticated ? (
            <>
              {user?.isAdmin && (
                <NavDropdown
                  label="Menu de administração"
                  triggerClassName={NAV_LINK_CLASS}
                  trigger={
                    <>
                      <ShieldCheck className="size-4" />
                      Admin
                      <ChevronDown className="size-4 opacity-70" />
                    </>
                  }
                >
                  {(close) => (
                    <>
                      <Link to="/dashboard" onClick={close} className={DROPDOWN_ITEM_CLASS}>
                        <LayoutDashboard className="size-4" />
                        Dashboard
                      </Link>
                      <Link to="/admin/materias" onClick={close} className={DROPDOWN_ITEM_CLASS}>
                        <BookOpen className="size-4" />
                        Matérias
                      </Link>
                      <Link to="/admin/professores" onClick={close} className={DROPDOWN_ITEM_CLASS}>
                        <ShieldCheck className="size-4" />
                        Aprovações
                      </Link>
                    </>
                  )}
                </NavDropdown>
              )}

              <Link to="/aulas" className={NAV_LINK_CLASS}>
                <CalendarDays className="size-4" />
                {rotuloAulas(user?.role, user?.isAdmin)}
              </Link>

              <button
                type="button"
                onClick={toggleTheme}
                aria-label={theme === 'light' ? 'Ativar modo escuro' : 'Ativar modo claro'}
                className="flex size-9 items-center justify-center rounded-md text-ink-600 transition-colors hover:bg-paper-100 hover:text-ink-900 dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-white"
              >
                {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
              </button>

              <SininhoNotificacoes notificacoes={notificacoes} marcarComoLida={marcarComoLida} />

              <NavDropdown
                label="Menu da conta"
                triggerClassName="flex items-center gap-1 rounded-full pl-0.5 outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ocre-400"
                trigger={
                  <>
                    <UserAvatar
                      name={user?.name}
                      src={user?.avatarUrl}
                      className="size-9 border border-paper-300 text-xs dark:border-white/15"
                    />
                    <ChevronDown className="size-4 text-ink-500 dark:text-zinc-500" />
                  </>
                }
              >
                {(close) => (
                  <>
                    <div className="border-b border-paper-200 px-3 py-2 dark:border-white/10">
                      <p className="truncate text-sm font-semibold text-ink-900 dark:text-white">
                        {user?.name}
                      </p>
                      {rotuloConta(user?.role, user?.isAdmin) && (
                        <p className="text-xs text-ink-500 dark:text-zinc-500">
                          {rotuloConta(user?.role, user?.isAdmin)}
                        </p>
                      )}
                    </div>
                    <Link to="/perfil" onClick={close} className={DROPDOWN_ITEM_CLASS}>
                      <UserRound className="size-4" />
                      Meu perfil
                    </Link>
                    <Link to="/chat" onClick={close} className={DROPDOWN_ITEM_CLASS}>
                      <MessageCircle className="size-4" />
                      Conversas
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        close()
                        handleSignOut()
                      }}
                      className={cn(DROPDOWN_ITEM_CLASS, 'text-alert-600 dark:text-alert-200')}
                    >
                      <LogOut className="size-4" />
                      Sair
                    </button>
                  </>
                )}
              </NavDropdown>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={toggleTheme}
                aria-label={theme === 'light' ? 'Ativar modo escuro' : 'Ativar modo claro'}
                className="flex size-9 items-center justify-center rounded-md text-ink-600 transition-colors hover:bg-paper-100 hover:text-ink-900 dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-white"
              >
                {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
              </button>
              <Link
                to="/login"
                className="px-3 text-sm text-ink-600 transition-colors hover:text-ink-900 dark:text-zinc-400 dark:hover:text-white"
              >
                Entrar
              </Link>
              <Link to="/register" className={PRIMARY_BUTTON_CLASS}>
                Cadastrar
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-1 md:hidden">
          {isAuthenticated && (
            <SininhoNotificacoes notificacoes={notificacoes} marcarComoLida={marcarComoLida} />
          )}
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
        <nav className="flex flex-col gap-1 border-t border-paper-200 bg-paper-50 px-4 py-3 text-sm transition-colors duration-300 dark:border-white/10 dark:bg-night-900 md:hidden">
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
          <div className="mt-2 flex flex-col gap-2 border-t border-paper-200 pt-3 dark:border-white/10">
            {isAuthenticated ? (
              <>
                {user?.isAdmin && (
                  <Link
                    to="/dashboard"
                    onClick={closeMenu}
                    className="flex items-center justify-center gap-2 rounded-md border border-paper-300 bg-white px-3 py-2.5 text-center text-ink-800 dark:border-white/10 dark:bg-night-700 dark:text-zinc-100"
                  >
                    <LayoutDashboard className="size-4" />
                    Dashboard
                  </Link>
                )}
                {user?.isAdmin && (
                  <Link
                    to="/admin/materias"
                    onClick={closeMenu}
                    className="flex items-center justify-center gap-2 rounded-md border border-paper-300 bg-white dark:border-white/10 dark:bg-night-700 px-3 py-2.5 text-center text-ink-800 dark:text-zinc-100"
                  >
                    <BookOpen className="size-4" />
                    Matérias
                  </Link>
                )}
                {user?.isAdmin && (
                  <Link
                    to="/admin/professores"
                    onClick={closeMenu}
                    className="flex items-center justify-center gap-2 rounded-md border border-paper-300 bg-white dark:border-white/10 dark:bg-night-700 px-3 py-2.5 text-center text-ink-800 dark:text-zinc-100"
                  >
                    <ShieldCheck className="size-4" />
                    Aprovações
                  </Link>
                )}
                <Link
                  to="/aulas"
                  onClick={closeMenu}
                  className="flex items-center justify-center gap-2 rounded-md border border-paper-300 bg-white dark:border-white/10 dark:bg-night-700 px-3 py-2.5 text-center text-ink-800 dark:text-zinc-100"
                >
                  <CalendarDays className="size-4" />
                  {rotuloAulas(user?.role, user?.isAdmin)}
                </Link>
                {isAuthenticated && (
                  <Link
                    to="/perfil"
                    onClick={closeMenu}
                    className="flex items-center justify-center gap-2 rounded-md bg-ink-800 px-3 py-2.5 text-center font-semibold text-paper-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_3px_0_var(--color-ink-950)] active:translate-y-[3px] active:shadow-none"
                  >
                    <UserRound className="size-4" />
                    Meu perfil
                  </Link>
                )}
                <Link
                  to="/chat"
                  onClick={closeMenu}
                  className="flex items-center justify-center gap-2 rounded-md border border-paper-300 bg-white px-3 py-2.5 text-center text-ink-800 dark:border-white/10 dark:bg-night-700 dark:text-zinc-100"
                >
                  <MessageCircle className="size-4" />
                  Conversas
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="flex items-center justify-center gap-1.5 rounded-md border border-paper-300 bg-white dark:border-white/10 dark:bg-night-700 px-3 py-2.5 text-center text-ink-800 dark:text-zinc-100"
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
                  className="rounded-md border border-paper-300 bg-white dark:border-white/10 dark:bg-night-700 px-3 py-2.5 text-center text-ink-800 dark:text-zinc-100 transition-colors duration-300 dark:border-white/10 dark:bg-white/5 dark:text-white"
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
