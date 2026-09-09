import { motion } from 'framer-motion'
import { Link, useLocation } from 'react-router-dom'
import { AccentPanel } from '@/components/auth/AccentPanel'
import { LoginForm } from '@/components/auth/LoginForm'
import { RegisterForm } from '@/components/auth/RegisterForm'
import { Brand } from '@/components/Brand'
import { cn } from '@/lib/cn'

const SLOT_TRANSITION = { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const }

export function AuthPage() {
  const { pathname } = useLocation()
  const isRegister = pathname === '/register'

  const formSlot = (
    <motion.div layout="position" transition={SLOT_TRANSITION} key="form" className="h-full bg-white">
      <div className="grid h-full">
        <div className={cn('[grid-area:1/1]', isRegister && 'invisible')}>
          <LoginForm />
        </div>
        <div className={cn('[grid-area:1/1]', !isRegister && 'invisible')}>
          <RegisterForm />
        </div>
      </div>
    </motion.div>
  )

  const accentSlot = (
    <motion.div layout="position" transition={SLOT_TRANSITION} key="accent" className="h-full">
      <AccentPanel isRegister={isRegister} />
    </motion.div>
  )

  return (
    <div className="flex min-h-screen flex-col items-center justify-center grain bg-paper-100 px-4 py-10 sm:px-6">
      <Link to="/" className="relative z-1 mb-8">
        <Brand />
      </Link>

      <div className="relative z-1 mb-5 inline-flex rounded-md border border-paper-300 bg-white p-1 shadow-[inset_0_1px_0_#fff,0_2px_0_var(--color-paper-200)] md:hidden">
        <Link
          to="/login"
          className={cn(
            'rounded-sm px-6 py-2 text-sm font-semibold transition-colors',
            !isRegister ? 'bg-ink-800 text-paper-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]' : 'text-ink-600 hover:text-ink-900',
          )}
        >
          Entrar
        </Link>
        <Link
          to="/register"
          className={cn(
            'rounded-sm px-6 py-2 text-sm font-semibold transition-colors',
            isRegister ? 'bg-ink-800 text-paper-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]' : 'text-ink-600 hover:text-ink-900',
          )}
        >
          Cadastrar
        </Link>
      </div>

      <div className="card-lifted relative z-1 grid w-full max-w-sm overflow-hidden rounded-lg md:max-w-4xl md:grid-cols-2">
        {isRegister ? (
          <>
            {accentSlot}
            {formSlot}
          </>
        ) : (
          <>
            {formSlot}
            {accentSlot}
          </>
        )}
      </div>
    </div>
  )
}
