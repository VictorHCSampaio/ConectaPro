import { KeyRound, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { FormFeedback } from '@/components/auth/FormFeedback'
import { ativarTotp, loginUsuario } from '@/lib/authService'
import { extractErrorMessage } from '@/lib/api'
import type { TotpSetupResponse } from '@/types/auth'

type TotpSetupStepProps = TotpSetupResponse & {
  email: string
  password: string
}

export function TotpSetupStep({ secret, qrUri, email, password }: TotpSetupStepProps) {
  const navigate = useNavigate()
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleActivate() {
    const parsed = Number(code.trim())
    if (!code.trim() || Number.isNaN(parsed)) {
      setError('Digite o código de 6 dígitos do seu app autenticador.')
      return
    }

    setError(null)
    setIsLoading(true)
    try {
      await loginUsuario({ email, senha: password })
      await ativarTotp({ totpCode: parsed })
      navigate('/login')
    } catch (err) {
      setError(extractErrorMessage(err, 'Não foi possível ativar o 2FA. Tente novamente.'))
    } finally {
      setIsLoading(false)
    }
  }

  function handleSkip() {
    navigate('/login')
  }

  return (
    <div className="flex h-full flex-col justify-center gap-6 px-8 py-10 sm:px-10 md:px-12">
      <div className="flex flex-col items-center gap-1.5 text-center">
        <div className="mb-2 flex size-12 items-center justify-center rounded-full bg-sage-50 dark:bg-emerald-900/30">
          <ShieldCheck className="size-6 text-sage-600 dark:text-emerald-400" />
        </div>
        <h2 className="text-2xl font-semibold tracking-tight text-ink-900 dark:text-white">
          Configure o 2FA
        </h2>
        <p className="text-sm text-ink-600 dark:text-zinc-400">
          Escaneie o QR code com seu app autenticador (Google Authenticator, Authy, etc.)
        </p>
      </div>

      <div className="flex flex-col items-center gap-4">
        <div className="rounded-lg border border-paper-300 bg-white p-3 dark:border-white/10 dark:bg-white">
          <img src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(qrUri)}`} alt="QR Code para autenticador" width={180} height={180} />
        </div>

        <details className="w-full">
          <summary className="cursor-pointer text-xs font-medium text-ink-500 hover:text-ink-700 dark:text-zinc-500 dark:hover:text-zinc-300">
            Não consegue escanear? Use o código manual
          </summary>
          <div className="mt-2 rounded-md border border-paper-200 bg-paper-50 px-3 py-2 dark:border-white/10 dark:bg-white/5">
            <code className="select-all break-all text-xs text-ink-700 dark:text-zinc-300">{secret}</code>
          </div>
        </details>
      </div>

      {error && <FormFeedback variant="error" message={error} />}

      <div className="flex flex-col gap-3">
        <Input
          label="Código de verificação"
          placeholder="000000"
          icon={<KeyRound className="size-4" />}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          inputMode="numeric"
          maxLength={6}
          autoComplete="one-time-code"
        />

        <Button type="button" onClick={handleActivate} isLoading={isLoading}>
          Ativar 2FA e continuar
        </Button>

        <Button type="button" variant="ghost" onClick={handleSkip} disabled={isLoading}>
          Pular por enquanto
        </Button>
      </div>
    </div>
  )
}
