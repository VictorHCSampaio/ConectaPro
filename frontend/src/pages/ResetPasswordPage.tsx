import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { FormFeedback } from '@/components/auth/FormFeedback'
import { Brand } from '@/components/Brand'
import { Button } from '@/components/ui/Button'
import { PasswordInput } from '@/components/ui/PasswordInput'
import { extractErrorMessage } from '@/lib/api'
import { confirmarResetSenha } from '@/lib/authService'

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState<string | undefined>()
  const [confirmError, setConfirmError] = useState<string | undefined>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  function validate(): boolean {
    let valid = true
    if (!password || password.length < 8) {
      setPasswordError('A senha precisa ter no mínimo 8 caracteres')
      valid = false
    } else {
      setPasswordError(undefined)
    }
    if (password !== confirmPassword) {
      setConfirmError('As senhas não conferem')
      valid = false
    } else {
      setConfirmError(undefined)
    }
    return valid
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setSubmitError(null)
    setIsSubmitting(true)

    try {
      await confirmarResetSenha(token!, password)
      setSuccess(true)
    } catch (err) {
      setSubmitError(extractErrorMessage(err, 'Não foi possível redefinir a senha. O link pode ter expirado.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!token) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center grain bg-paper-100 px-4 py-10 transition-colors duration-300 dark:bg-night-900 sm:px-6">
        <Link to="/" className="relative z-1 mb-8">
          <Brand />
        </Link>
        <div className="card-lifted relative z-1 w-full max-w-sm overflow-hidden rounded-lg p-8 text-center dark:border-white/10 dark:bg-white/[0.03] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_32px_64px_-16px_rgba(0,0,0,0.8)] dark:backdrop-blur-xl sm:p-10">
          <FormFeedback variant="error" message="Link inválido. Solicite um novo link de recuperação." />
          <div className="mt-6">
            <Link
              to="/forgot-password"
              className="text-sm text-ink-600 transition-colors hover:text-ink-900 dark:text-zinc-400 dark:hover:text-white"
            >
              Solicitar novo link
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center grain bg-paper-100 px-4 py-10 transition-colors duration-300 dark:bg-night-900 sm:px-6">
      <Link to="/" className="relative z-1 mb-8">
        <Brand />
      </Link>

      <div className="card-lifted relative z-1 w-full max-w-sm overflow-hidden rounded-lg p-8 transition-all duration-300 dark:border-white/10 dark:bg-white/[0.03] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_32px_64px_-16px_rgba(0,0,0,0.8)] dark:backdrop-blur-xl sm:p-10">
        <div className="flex flex-col gap-1.5 mb-6">
          <h2 className="text-2xl font-semibold tracking-tight text-ink-900 dark:text-white">
            Redefinir senha
          </h2>
          <p className="text-sm text-ink-600 dark:text-zinc-400">
            Digite sua nova senha abaixo.
          </p>
        </div>

        {success && (
          <>
            <FormFeedback message="Senha redefinida com sucesso!" />
            <div className="mt-6 text-center">
              <Link
                to="/login"
                className="inline-block rounded-md bg-ink-800 px-6 py-2.5 text-sm font-semibold text-paper-50 transition-colors hover:bg-ink-700 dark:bg-white dark:text-ink-900 dark:hover:bg-zinc-200"
              >
                Fazer login
              </Link>
            </div>
          </>
        )}

        {submitError && <FormFeedback variant="error" message={submitError} />}

        {!success && (
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
            <PasswordInput
              label="Nova senha"
              placeholder="Mínimo 8 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => {
                if (password && password.length < 8) setPasswordError('A senha precisa ter no mínimo 8 caracteres')
                else setPasswordError(undefined)
              }}
              error={passwordError}
              autoComplete="new-password"
            />

            <PasswordInput
              label="Confirmar nova senha"
              placeholder="Repita a nova senha"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onBlur={() => {
                if (confirmPassword && password !== confirmPassword) setConfirmError('As senhas não conferem')
                else setConfirmError(undefined)
              }}
              error={confirmError}
              autoComplete="new-password"
            />

            <Button type="submit" isLoading={isSubmitting}>
              Redefinir senha
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}