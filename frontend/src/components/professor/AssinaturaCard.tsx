import { useEffect, useState } from 'react'
import { CalendarClock, Undo2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { extractErrorMessage } from '@/lib/api'
import { obterStatusPagamento, solicitarReembolso } from '@/lib/pagamentoService'

type StatusAssinatura = {
  status: string
  assinaturaValidaAte: string | null
  reembolsoDisponivel: boolean
}

export function AssinaturaCard() {
  const [dados, setDados] = useState<StatusAssinatura | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [processando, setProcessando] = useState(false)
  const [feedback, setFeedback] = useState<{ tipo: 'ok' | 'erro'; texto: string } | null>(null)

  useEffect(() => {
    let ativo = true
    obterStatusPagamento()
      .then((d) => {
        if (ativo) setDados(d)
      })
      .catch(() => {
        if (ativo) setDados(null)
      })
      .finally(() => {
        if (ativo) setIsLoading(false)
      })
    return () => {
      ativo = false
    }
  }, [])

  async function handleReembolso() {
    const confirmar = window.confirm(
      'Tem certeza que deseja solicitar o reembolso? Seu acesso de professor será encerrado.',
    )
    if (!confirmar) return

    setProcessando(true)
    setFeedback(null)
    try {
      await solicitarReembolso()
      setFeedback({
        tipo: 'ok',
        texto: 'Reembolso solicitado. Seu acesso foi encerrado; a pagina sera recarregada.',
      })
      setTimeout(() => window.location.reload(), 2000)
    } catch (err) {
      setFeedback({
        tipo: 'erro',
        texto: extractErrorMessage(err, 'Nao foi possivel solicitar o reembolso.'),
      })
      setProcessando(false)
    }
  }

  if (isLoading || !dados) return null

  const validade = dados.assinaturaValidaAte
    ? new Date(dados.assinaturaValidaAte).toLocaleDateString('pt-BR')
    : null

  return (
    <div className="mb-6 rounded-lg border border-paper-200 bg-white p-5 dark:border-white/10 dark:bg-night-700">
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-ocre-100 text-ocre-600 dark:bg-ocre-400/10 dark:text-ocre-400">
          <CalendarClock className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold text-ink-900 dark:text-white">Assinatura</h2>
          <p className="mt-1 text-sm text-ink-600 dark:text-zinc-400">
            {validade
              ? `Seu acesso de professor esta ativo ate ${validade}.`
              : 'Nenhuma assinatura ativa no momento.'}
          </p>

          {feedback && (
            <p
              className={
                feedback.tipo === 'ok'
                  ? 'mt-2 text-sm text-sage-600 dark:text-sage-400'
                  : 'mt-2 text-sm text-red-600 dark:text-red-400'
              }
            >
              {feedback.texto}
            </p>
          )}

          {dados.reembolsoDisponivel && (
            <div className="mt-3">
              <Button
                type="button"
                variant="secondary"
                fullWidth={false}
                icon={<Undo2 className="size-4" />}
                isLoading={processando}
                onClick={handleReembolso}
              >
                Solicitar reembolso
              </Button>
              <p className="mt-2 text-xs text-paper-500 dark:text-zinc-500">
                Disponivel por 7 dias apos o pagamento (direito de arrependimento).
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
