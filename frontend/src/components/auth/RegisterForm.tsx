import { Mail, User } from 'lucide-react'
import { useState, type MouseEvent } from 'react'
import { FormFeedback } from '@/components/auth/FormFeedback'
import { LegalTermsModal, type LegalDocumentType } from '@/components/auth/LegalTermsModal'
import { RoleSelector } from '@/components/auth/RoleSelector'
import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/Checkbox'
import { Input } from '@/components/ui/Input'
import { PasswordInput } from '@/components/ui/PasswordInput'
import { useForm } from '@/hooks/useForm'
import { extractErrorMessage } from '@/lib/api'
import { registerUsuario } from '@/lib/authService'
import { validateRegisterForm } from '@/lib/validation'
import type { RegisterFormValues } from '@/types/auth'

const LEGAL_LINK_CLASS =
  'm-0 inline cursor-pointer bg-transparent p-0 font-[inherit] font-medium leading-snug text-ink-800 underline decoration-paper-300 underline-offset-2 transition-colors hover:decoration-ocre-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ocre-500 dark:text-zinc-300 dark:decoration-white/20 dark:hover:decoration-ocre-400'

const INITIAL_VALUES: RegisterFormValues = {
  role: null,
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
  acceptTerms: false,
}

export function RegisterForm() {
  const [wasSubmitted, setWasSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [legalDocument, setLegalDocument] = useState<LegalDocumentType | null>(null)
  const { values, setField, touchField, fieldError, handleSubmit, isSubmitting } = useForm(
    INITIAL_VALUES,
    validateRegisterForm,
  )

  function openLegalDocument(documentType: LegalDocumentType) {
    return (event: MouseEvent<HTMLButtonElement>) => {
      event.preventDefault()
      event.stopPropagation()
      setLegalDocument(documentType)
    }
  }

  const onSubmit = handleSubmit(async (formValues) => {
    setSubmitError(null)
    try {
      await registerUsuario({
        nome: formValues.fullName,
        email: formValues.email,
        password: formValues.password,
        role: formValues.role ?? 'ALUNO',
      })

      setWasSubmitted(true)
    } catch (error) {
      setSubmitError(
        extractErrorMessage(error, 'Não foi possível criar sua conta. Tente novamente.'),
      )
    }
  })

  return (
    <div className="flex h-full flex-col justify-center gap-6 px-8 py-10 sm:px-10 md:px-12">
      <div className="flex flex-col gap-1.5">
        <h2 className="text-2xl font-semibold tracking-tight text-ink-900 dark:text-white">
          Crie sua conta
        </h2>
        <p className="text-sm text-ink-600 dark:text-zinc-400">
          Preencha seus dados para se cadastrar.
        </p>
      </div>

      {wasSubmitted && (
        <FormFeedback message="Conta criada. Verifique seu e-mail para continuar." />
      )}

      {submitError && <FormFeedback variant="error" message={submitError} />}

      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
        <RoleSelector
          value={values.role}
          onChange={(role) => setField('role', role)}
          onBlur={() => touchField('role')}
          error={fieldError('role')}
        />

        <Input
          label="Nome completo"
          placeholder="Seu nome completo"
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
              <button
                type="button"
                className={LEGAL_LINK_CLASS}
                onClick={openLegalDocument('terms')}
              >
                Termos de Uso
              </button>{' '}
              e a{' '}
              <button
                type="button"
                className={LEGAL_LINK_CLASS}
                onClick={openLegalDocument('privacy')}
              >
                Política de Privacidade
              </button>
            </>
          }
          checked={values.acceptTerms}
          onChange={(event) => setField('acceptTerms', event.target.checked)}
          onBlur={() => touchField('acceptTerms')}
          error={fieldError('acceptTerms')}
        />

        <Button type="submit" isLoading={isSubmitting} disabled={!values.acceptTerms}>
          Criar conta
        </Button>
      </form>

      <LegalTermsModal
        open={legalDocument !== null}
        onClose={() => setLegalDocument(null)}
        documentType={legalDocument}
      />
    </div>
  )
}
