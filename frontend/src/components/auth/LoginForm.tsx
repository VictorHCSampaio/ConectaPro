import { Mail } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FormFeedback } from '@/components/auth/FormFeedback'
import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/Checkbox'
import { Input } from '@/components/ui/Input'
import { PasswordInput } from '@/components/ui/PasswordInput'
import { useAuth } from '@/hooks/useAuth'
import { useForm } from '@/hooks/useForm'
import { extractErrorMessage } from '@/lib/api'
import { loginUsuario } from '@/lib/authService'
import { validateLoginForm } from '@/lib/validation'
import type { LoginFormValues } from '@/types/auth'

const INITIAL_VALUES: LoginFormValues = {
  email: '',
  password: '',
  rememberMe: false,
}

export function LoginForm() {
  const navigate = useNavigate()
  const [wasSubmitted, setWasSubmitted] = useState(false)
<<<<<<< HEAD
  const { signIn } = useAuth()
  const navigate = useNavigate()
=======
  const [submitError, setSubmitError] = useState<string | null>(null)
>>>>>>> origin/main
  const { values, setField, touchField, fieldError, handleSubmit, isSubmitting } = useForm(
    INITIAL_VALUES,
    validateLoginForm,
  )

  const onSubmit = handleSubmit(async (formValues) => {
<<<<<<< HEAD
    await new Promise((resolve) => setTimeout(resolve, 1100))
    signIn({
      name: formValues.email.split('@')[0],
      email: formValues.email,
      role: null,
    })
    setWasSubmitted(true)
    navigate('/')
=======
    setSubmitError(null)
    try {
      await loginUsuario({ email: formValues.email, senha: formValues.password })
      setWasSubmitted(true)
      setTimeout(() => navigate('/'), 900)
    } catch (error) {
      setSubmitError(extractErrorMessage(error, 'Não foi possível entrar. Tente novamente.'))
    }
>>>>>>> origin/main
  })

  return (
    <div className="flex h-full flex-col justify-center gap-6 px-8 py-10 sm:px-10 md:px-12">
      <div className="flex flex-col gap-1.5">
        <h2 className="text-2xl font-semibold tracking-tight text-ink-900">Acesse sua conta</h2>
        <p className="text-sm text-ink-600">Entre com seu e-mail e senha para continuar.</p>
      </div>

      {wasSubmitted && <FormFeedback message="Login realizado. Redirecionando." />}

      {submitError && <FormFeedback variant="error" message={submitError} />}

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
          <Link to="#" className="border-b border-paper-300 text-sm text-ink-700 transition-colors hover:border-ocre-400 hover:text-ink-900">
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
