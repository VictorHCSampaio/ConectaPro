import { Link } from 'react-router-dom'
import { cn } from '@/lib/cn'

type AccentMessage = {
  heading: string
  text: string
  ctaLabel: string
  ctaTo: string
}

const MESSAGES: Record<'login' | 'register', AccentMessage> = {
  login: {
    heading: 'Novo por aqui?',
    text: 'Crie sua conta e comece a divulgar suas aulas ou encontrar o professor ideal.',
    ctaLabel: 'Criar conta',
    ctaTo: '/register',
  },
  register: {
    heading: 'Já tem uma conta?',
    text: 'Entre com seus dados e continue de onde parou.',
    ctaLabel: 'Entrar',
    ctaTo: '/login',
  },
}

type AccentPanelProps = {
  isRegister: boolean
}

export function AccentPanel({ isRegister }: AccentPanelProps) {
  return (
    <div className="relative hidden h-full overflow-hidden bg-gradient-to-br from-brand-600 via-brand-700 to-brand-800 px-10 py-12 text-center text-white md:flex md:items-center md:justify-center">
      <div className="animate-float pointer-events-none absolute -top-16 -right-16 size-64 rounded-full bg-white/10 blur-3xl" />
      <div className="animate-float-reverse pointer-events-none absolute -bottom-20 -left-10 size-64 rounded-full bg-growth-400/20 blur-3xl" />

      <div className="relative grid w-full place-items-center overflow-hidden">
        {(Object.entries(MESSAGES) as [keyof typeof MESSAGES, AccentMessage][]).map(
          ([key, message]) => {
            const isActive = (key === 'register') === isRegister
            const entersFromRight = key === 'register'

            return (
              <div
                key={key}
                aria-hidden={!isActive}
                className={cn(
                  '[grid-area:1/1] flex flex-col items-center gap-4 transition-all duration-500 ease-in-out',
                  isActive
                    ? 'translate-x-0 opacity-100'
                    : cn(
                        'pointer-events-none opacity-0',
                        entersFromRight ? 'translate-x-6' : '-translate-x-6',
                      ),
                )}
              >
                <h3 className="text-2xl font-bold tracking-tight text-balance">
                  {message.heading}
                </h3>
                <p className="max-w-[26ch] text-sm leading-relaxed text-brand-100">
                  {message.text}
                </p>
                <Link
                  to={message.ctaTo}
                  className="mt-2 inline-flex items-center justify-center rounded-xl border-2 border-white px-8 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-white hover:text-brand-700 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-700"
                >
                  {message.ctaLabel}
                </Link>
              </div>
            )
          },
        )}
      </div>
    </div>
  )
}
