import { CreditCard, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { SiteFooter } from '@/components/landing/SiteFooter'
import { SiteHeader } from '@/components/landing/SiteHeader'
import { Button } from '@/components/ui/Button'
import { FormFeedback } from '@/components/auth/FormFeedback'
import { useAuth } from '@/hooks/useAuth'
import { criarCheckout } from '@/lib/pagamentoService'
import { extractErrorMessage } from '@/lib/api'

export function PagamentoPage() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleCheckout() {
    setError(null)
    setIsLoading(true)
    try {
      const { redirectUrl } = await criarCheckout()
      window.location.href = redirectUrl
    } catch (err) {
      setError(extractErrorMessage(err, 'Erro ao iniciar o pagamento. Tente novamente.'))
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-paper-50 transition-colors duration-300 dark:bg-night-900">
      <SiteHeader />

      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center px-6 py-16">
        <div className="flex flex-col items-center gap-6 rounded-lg border border-paper-200 bg-white p-8 text-center shadow-sm transition-colors duration-300 dark:border-white/10 dark:bg-white/[0.03] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.06)]">
          <div className="flex size-16 items-center justify-center rounded-full bg-ocre-100 dark:bg-ocre-400/10">
            <CreditCard className="size-8 text-ocre-600 dark:text-ocre-400" />
          </div>

          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-ink-900 dark:text-white">
              Bem-vindo, {user?.name?.split(' ')[0]}!
            </h1>
            <p className="text-sm leading-relaxed text-ink-600 dark:text-zinc-400">
              Para ter acesso completo à plataforma como professor — criar seu perfil,
              aparecer para alunos e gerenciar suas aulas — finalize o pagamento abaixo.
            </p>
          </div>

          <div className="w-full rounded-md border border-paper-200 bg-paper-50 px-4 py-3 dark:border-white/10 dark:bg-night-800">
            <div className="flex items-center justify-between text-sm">
              <span className="text-ink-600 dark:text-zinc-400">Assinatura Professor</span>
              <span className="font-semibold text-ink-900 dark:text-white">R$ 29,90</span>
            </div>
          </div>

          {error && <FormFeedback variant="error" message={error} />}

          <Button
            onClick={handleCheckout}
            isLoading={isLoading}
            icon={<Sparkles className="size-4" />}
            className="w-full"
          >
            Clique aqui para ter a experiência completa
          </Button>

          <p className="text-xs text-paper-500 dark:text-zinc-500">
            Pagamento seguro via Mercado Pago
          </p>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
