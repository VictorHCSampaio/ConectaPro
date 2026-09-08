import { motion } from 'framer-motion'
import { Link, useLocation } from 'react-router-dom'
import { AccentPanel } from '@/components/auth/AccentPanel'
import { LoginForm } from '@/components/auth/LoginForm'
import { RegisterForm } from '@/components/auth/RegisterForm'
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
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-10 sm:px-6">
      <Link to="/login" className="mb-8 flex items-center gap-2.5">
        <div className="flex size-9 items-center justify-center rounded-lg bg-brand-600 font-bold text-white shadow-glow-brand">
          C
        </div>
        <span className="text-lg font-bold tracking-tight text-slate-900">ConectaPro</span>
      </Link>

      <div className="mb-6 inline-flex rounded-full border border-slate-200 bg-white p-1 shadow-sm md:hidden">
        <Link
          to="/login"
          className={cn(
            'rounded-full px-5 py-2 text-sm font-semibold transition-colors duration-200',
            !isRegister ? 'bg-brand-600 text-white' : 'text-slate-500',
          )}
        >
          Entrar
        </Link>
        <Link
          to="/register"
          className={cn(
            'rounded-full px-5 py-2 text-sm font-semibold transition-colors duration-200',
            isRegister ? 'bg-brand-600 text-white' : 'text-slate-500',
          )}
        >
          Cadastrar
        </Link>
      </div>

      <div className="animate-pop-in grid w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-glow-brand-lg md:max-w-4xl md:grid-cols-2">
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
