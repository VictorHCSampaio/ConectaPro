import { AlertTriangle, Clock, FileCheck2, Loader2, MessageSquareText, Upload } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { FormFeedback } from '@/components/auth/FormFeedback'
import { SiteFooter } from '@/components/landing/SiteFooter'
import { SiteHeader } from '@/components/landing/SiteHeader'
import { Button } from '@/components/ui/Button'
import { extractErrorMessage } from '@/lib/api'
import {
  enviarCertificado,
  enviarJustificativa,
  obterStatusCadastro,
  reenviarParaAnalise,
  type StatusCadastro,
} from '@/lib/certificadoService'

export function CadastroStatusPage() {
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<StatusCadastro | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [semCertificado, setSemCertificado] = useState(false)
  const [justificativa, setJustificativa] = useState('')

  function carregar() {
    setIsLoading(true)
    obterStatusCadastro()
      .then((dados) => {
        if (dados.status === 'PENDENTE_PAGAMENTO') {
          navigate('/pagamento', { replace: true })
          return
        }
        if (dados.status === 'ATIVO') {
          navigate('/profile/edit', { replace: true })
          return
        }
        setStatus(dados)
        if (dados.justificativaSemCertificado) {
          setSemCertificado(true)
          setJustificativa(dados.justificativaSemCertificado)
        }
      })
      .catch(() => setError('Não foi possível carregar o status do seu cadastro.'))
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    carregar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleSelecionar(event: React.ChangeEvent<HTMLInputElement>) {
    setError(null)
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (!['image/png', 'image/jpeg'].includes(file.type)) {
      setError('Formato inválido. Use PNG ou JPG.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Arquivo muito grande. Máx. 5 MB.')
      return
    }

    setEnviando(true)
    try {
      await enviarCertificado(file)
      carregar()
    } catch (err) {
      setError(extractErrorMessage(err, 'Não foi possível enviar o certificado.'))
    } finally {
      setEnviando(false)
    }
  }

  async function handleEnviarJustificativa() {
    setError(null)
    if (justificativa.trim().length < 10) {
      setError('A justificativa deve ter no mínimo 10 caracteres.')
      return
    }
    setEnviando(true)
    try {
      await enviarJustificativa(justificativa.trim())
      carregar()
    } catch (err) {
      setError(extractErrorMessage(err, 'Não foi possível enviar a justificativa.'))
    } finally {
      setEnviando(false)
    }
  }

  async function handleReenviar() {
    setError(null)
    setEnviando(true)
    try {
      await reenviarParaAnalise()
      carregar()
    } catch (err) {
      setError(extractErrorMessage(err, 'Não foi possível reenviar o cadastro.'))
    } finally {
      setEnviando(false)
    }
  }

  const rejeitado = status?.status === 'REJEITADO'

  return (
    <div className="flex min-h-screen flex-col bg-paper-50 dark:bg-night-900">
      <SiteHeader />

      <main className="mx-auto w-full max-w-xl flex-1 px-4 py-12 sm:px-6">
        {isLoading ? (
          <p className="inline-flex items-center gap-2 text-sm text-paper-500 dark:text-zinc-500">
            <Loader2 className="size-4 animate-spin" />
            Carregando…
          </p>
        ) : (
          status && (
            <div className="rounded-xl border border-paper-200 bg-white p-8 dark:border-white/10 dark:bg-white/[0.03]">
              <div className="flex flex-col items-center gap-3 text-center">
                <div
                  className={
                    rejeitado
                      ? 'flex size-14 items-center justify-center rounded-full bg-alert-50 dark:bg-alert-200/10'
                      : 'flex size-14 items-center justify-center rounded-full bg-ocre-100 dark:bg-ocre-500/15'
                  }
                >
                  {rejeitado ? (
                    <AlertTriangle className="size-7 text-alert-600 dark:text-alert-200" />
                  ) : (
                    <Clock className="size-7 text-ocre-500" />
                  )}
                </div>
                <h1 className="text-2xl font-semibold tracking-tight text-ink-900 dark:text-white">
                  {rejeitado ? 'Cadastro não aprovado' : 'Cadastro em análise'}
                </h1>
                <p className="text-sm text-ink-600 dark:text-zinc-400">
                  {rejeitado
                    ? 'Um administrador revisou seu cadastro e pediu ajustes. Corrija e reenvie para nova análise.'
                    : 'Seu cadastro está sendo analisado por um administrador. Você será liberado para o pagamento assim que for aprovado.'}
                </p>
              </div>

              {rejeitado && status.motivoRejeicao && (
                <div className="mt-5 rounded-lg border border-alert-200 bg-alert-50 p-4 dark:border-alert-200/30 dark:bg-alert-200/5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-alert-600 dark:text-alert-200">
                    Motivo
                  </p>
                  <p className="mt-1 text-sm text-ink-800 dark:text-zinc-200">
                    {status.motivoRejeicao}
                  </p>
                </div>
              )}

              {error && (
                <div className="mt-5">
                  <FormFeedback variant="error" message={error} />
                </div>
              )}

              <div className="mt-6 flex flex-col gap-3">
                <div className="flex items-center justify-between rounded-lg border border-paper-200 bg-paper-50 px-4 py-3 dark:border-white/10 dark:bg-white/5">
                  <span className="inline-flex items-center gap-2 text-sm text-ink-700 dark:text-zinc-300">
                    <FileCheck2
                      className={
                        status.certificadoEnviado
                          ? 'size-4 text-sage-600 dark:text-emerald-400'
                          : 'size-4 text-paper-400 dark:text-zinc-600'
                      }
                    />
                    {status.certificadoEnviado
                      ? `Certificado enviado${status.certificadoNome ? `: ${status.certificadoNome}` : ''}`
                      : 'Nenhum certificado enviado'}
                  </span>
                </div>

                <p className="text-xs text-ink-600 dark:text-zinc-400">
                  O envio do certificado é obrigatório. Caso não possua um, marque a opção
                  abaixo e explique o motivo. O administrador também analisará sua justificativa.
                </p>

                <label className="inline-flex items-center gap-2 text-sm text-ink-700 dark:text-zinc-300">
                  <input
                    type="checkbox"
                    checked={semCertificado}
                    onChange={(event) => {
                      setSemCertificado(event.target.checked)
                      setError(null)
                    }}
                    className="size-4 rounded border-paper-300 text-ocre-500 focus:ring-ocre-400 dark:border-white/20 dark:bg-night-800"
                  />
                  Não tenho certificado
                </label>

                {semCertificado ? (
                  <>
                    <textarea
                      value={justificativa}
                      onChange={(event) => setJustificativa(event.target.value)}
                      rows={4}
                      placeholder="Descreva sua experiência e o motivo de não possuir um certificado…"
                      className="w-full rounded-md border border-paper-300 bg-white px-3 py-2 text-sm text-ink-900 outline-none focus:border-ocre-400 dark:border-white/10 dark:bg-night-800 dark:text-zinc-100"
                    />
                    {status.justificativaSemCertificado && (
                      <p className="inline-flex items-center gap-2 text-xs text-sage-600 dark:text-emerald-400">
                        <MessageSquareText className="size-3.5" />
                        Justificativa enviada para análise.
                      </p>
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={handleEnviarJustificativa}
                      isLoading={enviando}
                    >
                      <MessageSquareText className="size-4" />
                      {status.justificativaSemCertificado
                        ? 'Atualizar justificativa'
                        : 'Enviar justificativa'}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => inputRef.current?.click()}
                      isLoading={enviando}
                    >
                      <Upload className="size-4" />
                      {status.certificadoEnviado ? 'Trocar certificado' : 'Enviar certificado'}
                    </Button>
                    <input
                      ref={inputRef}
                      type="file"
                      accept="image/png,image/jpeg"
                      className="hidden"
                      onChange={handleSelecionar}
                    />
                  </>
                )}

                {rejeitado && (
                  <Button type="button" onClick={handleReenviar} isLoading={enviando}>
                    Reenviar para análise
                  </Button>
                )}
              </div>
            </div>
          )
        )}
      </main>

      <SiteFooter />
    </div>
  )
}
