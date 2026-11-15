import { BadgeCheck, FileText, Loader2, MessageSquareText, ShieldCheck, X } from 'lucide-react'
import { useEffect, useState } from 'react'

import { FormFeedback } from '@/components/auth/FormFeedback'
import { SiteFooter } from '@/components/landing/SiteFooter'
import { SiteHeader } from '@/components/landing/SiteHeader'
import { Button } from '@/components/ui/Button'
import { extractErrorMessage } from '@/lib/api'
import {
  aprovarProfessor,
  listarProfessoresPendentes,
  obterUrlCertificado,
  rejeitarProfessor,
  type ProfessorPendente,
} from '@/lib/adminProfessorService'

export function AdminProfessoresPage() {
  const [pendentes, setPendentes] = useState<ProfessorPendente[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [processando, setProcessando] = useState<string | null>(null)
  const [rejeitandoId, setRejeitandoId] = useState<string | null>(null)
  const [motivo, setMotivo] = useState('')

  function carregar() {
    setIsLoading(true)
    setLoadError(null)
    listarProfessoresPendentes()
      .then(setPendentes)
      .catch(() => setLoadError('Não foi possível carregar os cadastros pendentes.'))
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    carregar()
  }, [])

  async function handleVerCertificado(usuarioId: string) {
    setActionError(null)
    try {
      const url = await obterUrlCertificado(usuarioId)
      window.open(url, '_blank', 'noopener,noreferrer')
    } catch (error) {
      setActionError(extractErrorMessage(error, 'Não foi possível abrir o certificado.'))
    }
  }

  async function handleAprovar(usuarioId: string) {
    setActionError(null)
    setProcessando(usuarioId)
    try {
      await aprovarProfessor(usuarioId)
      setPendentes((atual) => atual.filter((p) => p.usuarioId !== usuarioId))
    } catch (error) {
      setActionError(extractErrorMessage(error, 'Não foi possível aprovar o cadastro.'))
    } finally {
      setProcessando(null)
    }
  }

  async function handleConfirmarRejeicao(usuarioId: string) {
    if (motivo.trim().length < 5) {
      setActionError('Informe um motivo com ao menos 5 caracteres.')
      return
    }
    setActionError(null)
    setProcessando(usuarioId)
    try {
      await rejeitarProfessor(usuarioId, motivo.trim())
      setPendentes((atual) => atual.filter((p) => p.usuarioId !== usuarioId))
      setRejeitandoId(null)
      setMotivo('')
    } catch (error) {
      setActionError(extractErrorMessage(error, 'Não foi possível rejeitar o cadastro.'))
    } finally {
      setProcessando(null)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-paper-50 dark:bg-night-900">
      <SiteHeader />

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6">
        <div className="mb-8">
          <p className="label-mono text-paper-600 dark:text-zinc-400">Administração</p>
          <h1 className="mt-2 flex items-center gap-2 text-3xl font-semibold tracking-tight text-ink-900 dark:text-white">
            <ShieldCheck className="size-7 text-ocre-500" />
            Aprovação de professores
          </h1>
          <p className="mt-1 text-sm text-ink-600 dark:text-zinc-400">
            Analise os cadastros em análise, veja o certificado e aprove ou rejeite.
          </p>
        </div>

        {actionError && (
          <div className="mb-4">
            <FormFeedback variant="error" message={actionError} />
          </div>
        )}

        {isLoading && (
          <p className="inline-flex items-center gap-2 text-sm text-paper-500 dark:text-zinc-500">
            <Loader2 className="size-4 animate-spin" />
            Carregando…
          </p>
        )}

        {loadError && <FormFeedback variant="error" message={loadError} />}

        {!isLoading && !loadError && pendentes.length === 0 && (
          <div className="rounded-lg border border-paper-200 bg-white p-8 text-center dark:border-white/10 dark:bg-white/[0.03]">
            <p className="text-sm text-ink-600 dark:text-zinc-400">
              Nenhum cadastro aguardando aprovação no momento.
            </p>
          </div>
        )}

        <div className="flex flex-col gap-4">
          {pendentes.map((professor) => (
            <div
              key={professor.usuarioId}
              className="rounded-lg border border-paper-200 bg-white p-5 dark:border-white/10 dark:bg-white/[0.03]"
            >
              <div className="flex flex-col gap-1">
                <h2 className="font-semibold text-ink-900 dark:text-white">
                  {professor.nomeCompleto}
                </h2>
                <p className="text-sm text-ink-600 dark:text-zinc-400">{professor.email}</p>
                <p className="mt-1 text-xs text-paper-500 dark:text-zinc-500">
                  {professor.certificadoEnviado ? (
                    <span className="inline-flex items-center gap-1 text-sage-600 dark:text-emerald-400">
                      <BadgeCheck className="size-3.5" />
                      Certificado enviado
                    </span>
                  ) : professor.justificativaSemCertificado ? (
                    <span className="inline-flex items-center gap-1 text-ocre-600 dark:text-ocre-300">
                      <MessageSquareText className="size-3.5" />
                      Sem certificado, justificativa enviada
                    </span>
                  ) : (
                    'Sem certificado e sem justificativa'
                  )}
                </p>
              </div>

              {professor.justificativaSemCertificado && (
                <div className="mt-3 rounded-md border border-ocre-200 bg-ocre-50 p-3 dark:border-ocre-500/20 dark:bg-ocre-500/5">
                  <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ocre-600 dark:text-ocre-300">
                    <MessageSquareText className="size-3.5" />
                    Justificativa (sem certificado)
                  </p>
                  <p className="mt-1 whitespace-pre-line text-sm text-ink-800 dark:text-zinc-200">
                    {professor.justificativaSemCertificado}
                  </p>
                </div>
              )}

              <div className="mt-4 flex flex-wrap gap-2">
                {professor.certificadoEnviado && (
                  <button
                    type="button"
                    onClick={() => handleVerCertificado(professor.usuarioId)}
                    className="inline-flex items-center gap-1.5 rounded-md border border-paper-300 bg-white px-3 py-1.5 text-xs font-semibold text-ink-800 transition-colors hover:border-paper-400 dark:border-white/10 dark:bg-night-700 dark:text-zinc-100"
                  >
                    <FileText className="size-3.5" />
                    Ver certificado
                  </button>
                )}
                <Button
                  type="button"
                  onClick={() => handleAprovar(professor.usuarioId)}
                  isLoading={processando === professor.usuarioId && rejeitandoId !== professor.usuarioId}
                  disabled={processando !== null}
                  className="!w-auto !px-4 !py-1.5 text-xs"
                >
                  Aprovar
                </Button>
                <button
                  type="button"
                  onClick={() => {
                    setRejeitandoId(
                      rejeitandoId === professor.usuarioId ? null : professor.usuarioId,
                    )
                    setMotivo('')
                    setActionError(null)
                  }}
                  disabled={processando !== null}
                  className="inline-flex items-center gap-1.5 rounded-md border border-alert-200 bg-white px-3 py-1.5 text-xs font-semibold text-alert-600 transition-colors hover:bg-alert-50 disabled:opacity-50 dark:border-alert-200/30 dark:bg-night-700 dark:text-alert-200"
                >
                  <X className="size-3.5" />
                  Rejeitar
                </button>
              </div>

              {rejeitandoId === professor.usuarioId && (
                <div className="mt-4 flex flex-col gap-2 rounded-md border border-paper-200 bg-paper-50 p-3 dark:border-white/10 dark:bg-white/5">
                  <label className="text-xs font-semibold text-ink-800 dark:text-zinc-100">
                    Motivo da rejeição
                  </label>
                  <textarea
                    value={motivo}
                    onChange={(event) => setMotivo(event.target.value)}
                    rows={3}
                    placeholder="Explique ao professor o que precisa ser ajustado…"
                    className="w-full rounded-md border border-paper-300 bg-white px-3 py-2 text-sm text-ink-900 outline-none focus:border-ocre-400 dark:border-white/10 dark:bg-night-800 dark:text-zinc-100"
                  />
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      onClick={() => handleConfirmarRejeicao(professor.usuarioId)}
                      isLoading={processando === professor.usuarioId}
                      disabled={processando !== null}
                      className="!w-auto !px-4 !py-1.5 text-xs"
                    >
                      Confirmar rejeição
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
