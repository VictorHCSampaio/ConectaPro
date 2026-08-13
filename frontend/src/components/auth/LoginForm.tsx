import { Mail } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FormFeedback } from '@/components/auth/FormFeedback'
import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/Checkbox'
import { Input } from '@/components/ui/Input'
import { PasswordInput } from '@/components/ui/PasswordInput'
import { useForm } from '@/hooks/useForm'
import { validateLoginForm } from '@/lib/validation'
import type { LoginFormValues } from '@/types/auth'

const INITIAL_VALUES: LoginFormValues = {
  email: '',
  password: '',
  rememberMe: false,
}

export function LoginForm() {
  const [wasSubmitted, setWasSubmitted] = useState(false)
  const { values, setField, touchField, fieldError, handleSubmit, isSubmitting } = useForm(
    INITIAL_VALUES,
    validateLoginForm,
  )

  const onSubmit = handleSubmit(async (formValues) => {
    await new Promise((resolve) => setTimeout(resolve, 1100))
    console.log('login payload', formValues)
    setWasSubmitted(true)
  })

  return (
    <div className="flex h-full flex-col justify-center gap-6 px-8 py-10 sm:px-10 md:px-12">
      <div className="flex flex-col gap-1.5">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Bem-vindo de volta</h2>
        <p className="text-sm text-slate-500">Entre com seu e-mail e senha para continuar.</p>
      </div>

      {wasSubmitted && <FormFeedback message="Login realizado com sucesso! Redirecionando..." />}

      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
        <Input
          label="E-mail"
          type="email"
          placeholder="voce@exemplo.com"
          icon={<Mail className="size-4" />}
          value={values.email}
          onChange={(event) => setField('email', event.target.value)}
          onBlur={() => touchField('email')}
          error={fieldError('email')}
          autoComplete="email"
        />

        <PasswordInput
          label="Senha"
          placeholder="Sua senha"
          value={values.password}
          onChange={(event) => setField('password', event.target.value)}
          onBlur={() => touchField('password')}
          error={fieldError('password')}
          autoComplete="current-password"
        />

        <div className="flex items-center justify-between">
          <Checkbox
            label="Lembrar-me"
            checked={values.rememberMe}
            onChange={(event) => setField('rememberMe', event.target.checked)}
          />
          <Link to="#" className="text-sm font-medium text-brand-600 hover:text-brand-700">
            Esqueci minha senha
          </Link>
        </div>

        <Button type="submit" isLoading={isSubmitting}>
          Entrar
        </Button>
      </form>
    </div>
  )
}
