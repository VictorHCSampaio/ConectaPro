import { Mail } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FormFeedback } from '@/components/auth/FormFeedback'
import { Brand } from '@/components/Brand'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { extractErrorMessage } from '@/lib/api'
import { solicitarResetSenha } from '@/lib/authService'
import { validateEmail } from '@/lib/validation'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState<string | undefined>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const error = validateEmail(email)
    if (error) {
      setEmailError(error)
      return
    }
    setEmailError(undefined)
    setSubmitError(null)
    setIsSubmitting(true)

    try {
      await solicitarResetSenha(email.trim())
      setSuccess(true)
    } catch (err) {
      setSubmitError(extractErrorMessage(err, 'Não foi possível processar a solicitação. Tente novamente.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center grain bg-paper-100 px-4 py-10 transition-colors duration-300 dark:bg-night-900 sm:px-6">
      <Link to="/" className="relative z-1 mb-8">
        <Brand />
      </Link>

      <div className="card-lifted relative z-1 w-full max-w-sm overflow-hidden rounded-lg p-8 transition-all duration-300 dark:border-white/10 dark:bg-white/[0.03] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_32px_64px_-16px_rgba(0,0,0,0.8)] dark:backdrop-blur-xl sm:p-10">
        <div className="flex flex-col gap-1.5 mb-6">
          <h2 className="text-2xl font-semibold tracking-tight text-ink-900 dark:text-white">
            Esqueci minha senha
          </h2>
          <p className="text-sm text-ink-600 dark:text-zinc-400">
            Informe seu e-mail e enviaremos instruções para redefinir sua senha.
          </p>
        </div>

        {success && (
          <FormFeedback message="Se o e-mail estiver cadastrado, você receberá instruções em instantes. Verifique também a pasta de spam." />
        )}

        {submitError && <FormFeedback variant="error" message={submitError} />}

        {!success && (
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
            <Input
              label="E-mail"
              type="email"
              placeholder="voce@exemplo.com"
              icon={<Mail className="size-4" />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setEmailError(validateEmail(email))}
              error={emailError}
              autoComplete="email"
            />

            <Button type="submit" isLoading={isSubmitting}>
              Enviar instruções
            </Button>
          </form>
        )}

        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="text-sm text-ink-600 transition-colors hover:text-ink-900 dark:text-zinc-400 dark:hover:text-white"
          >
            Voltar ao login
          </Link>
        </div>
      </div>
    </div>
  )
}