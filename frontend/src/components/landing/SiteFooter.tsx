import { Link } from 'react-router-dom'
import { Brand } from '@/components/Brand'

const FOOTER_LINKS = [
  { to: '#', label: 'Sobre o projeto' },
  { to: '#', label: 'Termos de uso' },
  { to: '#', label: 'Privacidade' },
]

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-paper-200 bg-paper-100 transition-colors duration-300 dark:border-white/10 dark:bg-[#0a0a0a]">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          <Brand />
          <p className="max-w-xs text-sm leading-relaxed text-paper-600 dark:text-zinc-500">
            Trabalho de conclusão de curso da Universidade de Mogi das Cruzes,{' '}
            {new Date().getFullYear()}.
          </p>
        </div>

        <nav className="flex flex-col gap-2 text-sm">
          {FOOTER_LINKS.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className="text-ink-600 transition-colors hover:text-ink-900 dark:text-zinc-400 dark:hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  )
}
