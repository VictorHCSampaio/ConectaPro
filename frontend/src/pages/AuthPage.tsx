import { Link, useLocation } from 'react-router-dom'
import { AccentPanel } from '@/components/auth/AccentPanel'
import { LoginForm } from '@/components/auth/LoginForm'
import { RegisterForm } from '@/components/auth/RegisterForm'
import { cn } from '@/lib/cn'

export function AuthPage() {
  const { pathname } = useLocation()
  const isRegister = pathname === '/register'

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-10 sm:px-6">
      <Link to="/login" className="mb-8 flex items-center gap-2.5">
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

      <div className="w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-2xl shadow-slate-200/60 md:max-w-4xl">
        <div
          className="flex w-[200%] transition-transform duration-700 ease-in-out"
          style={{ transform: isRegister ? 'translateX(-50%)' : 'translateX(0%)' }}
        >
          <div className="flex w-1/2 shrink-0 flex-col md:flex-row [&>*]:flex-1">
            <LoginForm />
            <AccentPanel
              heading="Novo por aqui?"
              text="Crie sua conta e comece a divulgar suas aulas ou encontrar o professor ideal."
              ctaLabel="Criar conta"
              ctaTo="/register"
            />
          </div>

          <div className="flex w-1/2 shrink-0 flex-col md:flex-row [&>*]:flex-1">
            <AccentPanel
              heading="Já tem uma conta?"
              text="Entre com seus dados e continue de onde parou."
              ctaLabel="Entrar"
              ctaTo="/login"
            />
            <RegisterForm />
          </div>
        </div>
      </div>
    </div>
  )
}
