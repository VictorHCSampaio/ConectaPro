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
    heading: 'Ainda não tem cadastro?',
    text: 'Crie uma conta para salvar professores e retomar a busca depois.',
    ctaLabel: 'Criar conta',
    ctaTo: '/register',
  },
  register: {
    heading: 'Já tem cadastro?',
    text: 'Entre com seu e-mail e senha para continuar de onde parou.',
    ctaLabel: 'Entrar',
    ctaTo: '/login',
  },
}

type AccentPanelProps = {
  isRegister: boolean
}

export function AccentPanel({ isRegister }: AccentPanelProps) {
  return (
    <div className="grain relative hidden h-full bg-ink-800 px-10 py-12 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] md:flex md:items-center md:justify-center">
      <div className="relative z-1 grid w-full place-items-center overflow-hidden">
        {(Object.entries(MESSAGES) as [keyof typeof MESSAGES, AccentMessage][]).map(
          ([key, message]) => {
            const isActive = (key === 'register') === isRegister

            return (
              <div
                key={key}
                aria-hidden={!isActive}
                className={cn(
                  '[grid-area:1/1] flex flex-col items-start gap-4 transition-opacity duration-300',
                  isActive ? 'opacity-100' : 'pointer-events-none opacity-0',
                )}
              >
                <span className="block h-px w-10 bg-ocre-400" />

                <h3 className="text-2xl leading-snug font-semibold text-balance text-paper-50">
                  {message.heading}
                </h3>

                <p className="max-w-[30ch] text-sm leading-relaxed text-ink-200">{message.text}</p>

                <Link
                  to={message.ctaTo}
                  className="mt-2 inline-flex items-center justify-center rounded-md border border-white/20 bg-white/5 px-6 py-2.5 text-sm font-semibold text-paper-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_3px_0_rgba(0,0,0,0.35)] transition-[background-color,border-color,transform,box-shadow] duration-150 hover:border-ocre-400/60 hover:bg-white/10 active:translate-y-[3px] active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ocre-400"
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
