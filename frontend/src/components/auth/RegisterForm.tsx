import { Mail, User } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FormFeedback } from '@/components/auth/FormFeedback'
import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/Checkbox'
import { Input } from '@/components/ui/Input'
import { PasswordInput } from '@/components/ui/PasswordInput'
import { useForm } from '@/hooks/useForm'
import { validateRegisterForm } from '@/lib/validation'
import type { RegisterFormValues } from '@/types/auth'

const INITIAL_VALUES: RegisterFormValues = {
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
  acceptTerms: false,
}

export function RegisterForm() {
  const [wasSubmitted, setWasSubmitted] = useState(false)
  const { values, setField, touchField, fieldError, handleSubmit, isSubmitting } = useForm(
    INITIAL_VALUES,
    validateRegisterForm,
  )

  const onSubmit = handleSubmit(async (formValues) => {
    await new Promise((resolve) => setTimeout(resolve, 1100))
    console.log('register payload', formValues)
    setWasSubmitted(true)
  })

  return (
    <div className="flex h-full flex-col justify-center gap-6 px-8 py-10 sm:px-10 md:px-12">
      <div className="flex flex-col gap-1.5">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Crie sua conta</h2>
        <p className="text-sm text-slate-500">Leva menos de um minuto para começar.</p>
      </div>

      {wasSubmitted && (
        <FormFeedback message="Conta criada com sucesso! Verifique seu e-mail para continuar." />
      )}

      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
        <Input
          label="Nome completo"
          placeholder="Como podemos te chamar?"
          icon={<User className="size-4" />}
          value={values.fullName}
          onChange={(event) => setField('fullName', event.target.value)}
          onBlur={() => touchField('fullName')}
          error={fieldError('fullName')}
          autoComplete="name"
        />

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
          placeholder="Crie uma senha"
          value={values.password}
          onChange={(event) => setField('password', event.target.value)}
          onBlur={() => touchField('password')}
          error={fieldError('password')}
          autoComplete="new-password"
        />

        <PasswordInput
          label="Confirmar senha"
          placeholder="Repita a senha"
          value={values.confirmPassword}
          onChange={(event) => setField('confirmPassword', event.target.value)}
          onBlur={() => touchField('confirmPassword')}
          error={fieldError('confirmPassword')}
          autoComplete="new-password"
        />

        <Checkbox
          label={
            <>
              Concordo com os{' '}
              <Link to="#" className="font-semibold text-brand-600 hover:text-brand-700">
                Termos de Uso
              </Link>{' '}
              e a{' '}
              <Link to="#" className="font-semibold text-brand-600 hover:text-brand-700">
                Política de Privacidade
              </Link>
            </>
          }
          checked={values.acceptTerms}
          onChange={(event) => setField('acceptTerms', event.target.checked)}
          error={fieldError('acceptTerms')}
        />

        <Button type="submit" isLoading={isSubmitting}>
          Criar conta
        </Button>
      </form>
    </div>
  )
}
