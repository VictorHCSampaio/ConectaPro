import { Ban, BookOpen, CalendarDays, Check, Loader2, MessageCircle, Monitor, Search, Star, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { AvaliacaoDialog } from '@/components/avaliacao/AvaliacaoDialog'
import { SiteFooter } from '@/components/landing/SiteFooter'
import { SiteHeader } from '@/components/landing/SiteHeader'
import { Button } from '@/components/ui/Button'
import { Paginacao } from '@/components/ui/Paginacao'
import { useAuth } from '@/hooks/useAuth'
import { ehContaAdmin } from '@/types/auth'
import { extractErrorMessage } from '@/lib/api'
import {
  aprovarAgendamento,
  cancelarAgendamento,
  listarAgendamentosRecebidos,
  listarMeusAgendamentos,
  recusarAgendamento,
} from '@/lib/agendamentoService'
import { listarAvaliacoesAgendamento } from '@/lib/avaliacaoService'
import { AgendamentoDetailsDialog } from '@/components/booking/AgendamentoDetailsDialog'
import { cn } from '@/lib/cn'
import {
  AGENDAMENTO_STATUS_LABEL,
  formatDataHoraInicio,
  formatModality,
} from '@/lib/formatSlot'
import type { Agendamento, AgendamentoStatus } from '@/types/agendamento'

const PAGE_SHELL =
  'flex min-h-screen flex-col bg-paper-50 transition-colors duration-300 dark:bg-night-900'

const ANTECEDENCIA_CANCELAMENTO_MS = 60 * 60 * 1000
const AVISO_CANCELAMENTO = 'Só é possível cancelar com no mínimo 1 hora de antecedência.'

function podeCancelar(dataHoraInicio?: string | null) {
  if (!dataHoraInicio) return true
  const inicio = new Date(dataHoraInicio).getTime()
  if (Number.isNaN(inicio)) return true
  return inicio - Date.now() >= ANTECEDENCIA_CANCELAMENTO_MS
}

const STATUS_CHIP: Record<AgendamentoStatus, string> = {
  SOLICITADO:
    'border-ocre-600/20 bg-ocre-50 text-ocre-700 dark:border-ocre-400/20 dark:bg-ocre-400/10 dark:text-ocre-300',
  CONFIRMADO:
    'border-sage-600/20 bg-sage-50 text-sage-600 dark:border-emerald-800/50 dark:bg-emerald-900/30 dark:text-emerald-400',
  CANCELADO:
    'border-red-600/20 bg-red-50 text-red-600 dark:border-red-400/20 dark:bg-red-400/10 dark:text-red-400',
}

function StatusChip({ status }: { status: AgendamentoStatus }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium',
        STATUS_CHIP[status],
      )}
    >
      {AGENDAMENTO_STATUS_LABEL[status]}
    </span>
  )
}

function ChatDaAula({ agendamento, nome }: { agendamento: Agendamento; nome: string }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const alvoId =
    user?.role === 'PROFESSOR' && !ehContaAdmin(user)
      ? agendamento.alunoUsuarioId
      : agendamento.professorUsuarioId

  if (!alvoId) return null

  return (
    <Button
      type="button"
      variant="ghost"
      fullWidth={false}
      className="px-3 py-1.5 text-xs"
      icon={<MessageCircle className="size-4" />}
      onClick={() =>
        navigate(`/chat/${alvoId}`, {
          state: { nome, voltarPara: '/aulas' },
        })
      }
    >
      Chat
    </Button>
  )
}

function SlotInfo({ agendamento }: { agendamento: Agendamento }) {
  return (
    <div className="flex flex-col gap-1 text-sm text-ink-600 dark:text-zinc-400">
      <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1">
        <span className="inline-flex items-center gap-1.5">
          <BookOpen className="size-3.5 text-paper-400 dark:text-zinc-500" />
          {agendamento.subject}
        </span>
        <span className="text-paper-400 dark:text-zinc-600">·</span>
        <span className="inline-flex items-center gap-1.5">
          <Monitor className="size-3.5 text-paper-400 dark:text-zinc-500" />
          {formatModality(agendamento.modality)}
        </span>
      </span>
      <span className="inline-flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="inline-flex items-center gap-1.5">
          <CalendarDays className="size-3.5 text-paper-400 dark:text-zinc-500" />
          {formatDataHoraInicio(agendamento.dataHoraInicio)}
        </span>
      </span>
    </div>
  )
}

type PageChromeProps = {
  eyebrow: string
  title: string
  subtitle: string
  children: React.ReactNode
}

function PageChrome({ eyebrow, title, subtitle, children }: PageChromeProps) {
  return (
    <div className={PAGE_SHELL}>
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
        <div>
          <p className="label-mono text-paper-600 dark:text-zinc-500">{eyebrow}</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink-900 dark:text-white">
            {title}
          </h1>
          <p className="mt-2 text-sm text-ink-600 dark:text-zinc-400">{subtitle}</p>
        </div>
        <div className="mt-8">{children}</div>
      </main>
      <SiteFooter />
    </div>
  )
}

function LoadingState() {
  return (
    <div className="flex items-center gap-2 text-sm text-paper-600 dark:text-zinc-400">
      <Loader2 className="size-4 animate-spin" />
      Carregando…
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-md border border-paper-200 bg-paper-50 p-6 text-sm text-ink-600 dark:border-white/10 dark:bg-night-800 dark:text-zinc-400">
      {message}
    </div>
  )
}

function StudentBookingsView() {
  const { user } = useAuth()
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [detalhe, setDetalhe] = useState<Agendamento | null>(null)
  const [avaliadosIds, setAvaliadosIds] = useState<Set<string>>(new Set())
  const [avaliacaoAlvo, setAvaliacaoAlvo] = useState<Agendamento | null>(null)
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [toast, setToast] = useState<{ variant: 'success' | 'error'; message: string } | null>(null)

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 4000)
      return () => clearTimeout(t)
    }
  }, [toast])

  async function handleCancelar(id: string) {
    setCancellingId(id)
    try {
      const atualizado = await cancelarAgendamento(id)
      setAgendamentos((prev) => prev.map((a) => (a.id === id ? atualizado : a)))
      setToast({ variant: 'success', message: 'Aula cancelada.' })
    } catch (err) {
      setToast({ variant: 'error', message: extractErrorMessage(err, 'Não foi possível cancelar.') })
    } finally {
      setCancellingId(null)
    }
  }

  useEffect(() => {
    let isActive = true

    listarMeusAgendamentos()
      .then(async (dados) => {
        if (!isActive) return
        setAgendamentos(dados)

        const confirmados = dados.filter((a) => a.status === 'CONFIRMADO')
        if (confirmados.length === 0) return

        const resultados = await Promise.allSettled(
          confirmados.map((a) => listarAvaliacoesAgendamento(a.id)),
        )
        if (!isActive) return

        const jaAvaliados = new Set<string>()
        resultados.forEach((res, i) => {
          if (res.status === 'fulfilled') {
            const minhaAvaliacao = res.value.some(
              (av) => av.avaliadorNome === user?.name,
            )
            if (minhaAvaliacao) jaAvaliados.add(confirmados[i].id)
          }
        })
        setAvaliadosIds(jaAvaliados)
      })
      .catch((err) => {
        if (isActive) setError(extractErrorMessage(err, 'Não foi possível carregar suas aulas.'))
      })
      .finally(() => {
        if (isActive) setIsLoading(false)
      })

    return () => {
      isActive = false
    }
  }, [user?.name])

  return (
    <>
      <PageChrome
        eyebrow="Agendamentos"
        title="Minhas aulas"
        subtitle="Acompanhe as solicitações que você enviou aos professores."
      >
        {isLoading ? (
          <LoadingState />
        ) : error ? (
          <EmptyState message={error} />
        ) : agendamentos.length === 0 ? (
          <EmptyState message="Você ainda não solicitou nenhuma aula. Escolha um professor e reserve um horário." />
        ) : (
          <ul className="flex flex-col gap-3">
            {agendamentos.map((agendamento) => (
              <li key={agendamento.id}>
                <button
                  type="button"
                  onClick={() => setDetalhe(agendamento)}
                  className="flex w-full flex-col gap-2 rounded-lg border border-paper-200 bg-white px-4 py-3.5 text-left transition-colors hover:border-paper-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ocre-500 dark:border-white/10 dark:bg-night-700 dark:hover:border-white/20 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex flex-col gap-1">
                    <span className="font-medium text-ink-900 dark:text-white">
                      {agendamento.professorName}
                    </span>
                    <SlotInfo agendamento={agendamento} />
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusChip status={agendamento.status} />
                    {(agendamento.status === 'SOLICITADO' || agendamento.status === 'CONFIRMADO') && (
                      <Button
                        type="button"
                        variant="ghost"
                        fullWidth={false}
                        className="px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-400/10"
                        icon={<Ban className="size-4" />}
                        isLoading={cancellingId === agendamento.id}
                        disabled={cancellingId !== null || !podeCancelar(agendamento.dataHoraInicio)}
                        title={podeCancelar(agendamento.dataHoraInicio) ? undefined : AVISO_CANCELAMENTO}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleCancelar(agendamento.id)
                        }}
                      >
                        Cancelar
                      </Button>
                    )}
                    {agendamento.status === 'CONFIRMADO' && !avaliadosIds.has(agendamento.id) && (
                      <Button
                        type="button"
                        variant="ghost"
                        fullWidth={false}
                        className="px-3 py-1.5 text-xs"
                        icon={<Star className="size-4" />}
                        onClick={(e) => {
                          e.stopPropagation()
                          setAvaliacaoAlvo(agendamento)
                        }}
                      >
                        Avaliar
                      </Button>
                    )}
                    <ChatDaAula agendamento={agendamento} nome={agendamento.professorName} />
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </PageChrome>

      <AgendamentoDetailsDialog
        open={detalhe !== null}
        onClose={() => setDetalhe(null)}
        agendamento={detalhe}
        counterpartLabel="Professor"
        counterpartName={detalhe?.professorName ?? ''}
      />

      {avaliacaoAlvo && (
        <AvaliacaoDialog
          open
          onClose={() => setAvaliacaoAlvo(null)}
          avaliadoId={avaliacaoAlvo.professorUsuarioId}
          avaliadoNome={avaliacaoAlvo.professorName}
          agendamentoId={avaliacaoAlvo.id}
          onSuccess={() => {
            setAvaliadosIds((prev) => new Set(prev).add(avaliacaoAlvo.id))
            setAvaliacaoAlvo(null)
            setToast({ variant: 'success', message: 'Avaliação enviada com sucesso!' })
          }}
          onError={(msg) => setToast({ variant: 'error', message: msg })}
        />
      )}

      {toast && (
        <div
          className={cn(
            'fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-lg px-5 py-3 text-sm font-medium shadow-lg',
            toast.variant === 'success' ? 'bg-sage-600 text-white' : 'bg-red-600 text-white',
          )}
        >
          {toast.message}
        </div>
      )}
    </>
  )
}

function TeacherBookingsView() {
  const { user } = useAuth()
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [busca, setBusca] = useState('')
  const [buscaAplicada, setBuscaAplicada] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [avaliadosIds, setAvaliadosIds] = useState<Set<string>>(new Set())
  const [avaliacaoAlvo, setAvaliacaoAlvo] = useState<Agendamento | null>(null)
  const [toast, setToast] = useState<{ variant: 'success' | 'error'; message: string } | null>(null)

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 4000)
      return () => clearTimeout(t)
    }
  }, [toast])

  async function handleCancelar(id: string) {
    setCancellingId(id)
    try {
      const atualizado = await cancelarAgendamento(id)
      setAgendamentos((prev) => prev.map((a) => (a.id === id ? atualizado : a)))
      setToast({ variant: 'success', message: 'Aula cancelada.' })
    } catch (err) {
      setToast({ variant: 'error', message: extractErrorMessage(err, 'Não foi possível cancelar.') })
    } finally {
      setCancellingId(null)
    }
  }

  useEffect(() => {
    const t = setTimeout(() => {
      setPage(0)
      setBuscaAplicada(busca)
    }, 400)
    return () => clearTimeout(t)
  }, [busca])

  useEffect(() => {
    let isActive = true
    setIsLoading(true)

    listarAgendamentosRecebidos(page, 5, buscaAplicada)
      .then(async (dados) => {
        if (!isActive) return
        setAgendamentos(dados.content)
        setTotalPages(dados.totalPages)

        const confirmados = dados.content.filter((a) => a.status === 'CONFIRMADO')
        if (confirmados.length === 0) return

        const resultados = await Promise.allSettled(
          confirmados.map((a) => listarAvaliacoesAgendamento(a.id)),
        )
        if (!isActive) return

        const jaAvaliados = new Set<string>()
        resultados.forEach((res, i) => {
          if (res.status === 'fulfilled') {
            const minhaAvaliacao = res.value.some(
              (av) => av.avaliadorNome === user?.name,
            )
            if (minhaAvaliacao) jaAvaliados.add(confirmados[i].id)
          }
        })
        setAvaliadosIds(jaAvaliados)
      })
      .catch((err) => {
        if (isActive)
          setError(extractErrorMessage(err, 'Não foi possível carregar os agendamentos.'))
      })
      .finally(() => {
        if (isActive) setIsLoading(false)
      })

    return () => {
      isActive = false
    }
  }, [user?.name, page, buscaAplicada])

  async function responder(id: string, acao: 'aprovar' | 'recusar') {
    setError(null)
    setProcessingId(id)
    try {
      const atualizado =
        acao === 'aprovar' ? await aprovarAgendamento(id) : await recusarAgendamento(id)
      setAgendamentos((anteriores) =>
        anteriores.map((item) => (item.id === id ? atualizado : item)),
      )
    } catch (err) {
      setError(extractErrorMessage(err, 'Não foi possível atualizar o agendamento.'))
    } finally {
      setProcessingId(null)
    }
  }

  return (
    <PageChrome
      eyebrow="Agendamentos"
      title="Aulas recebidas"
      subtitle="Aprove ou recuse as solicitações de aula dos alunos."
    >
      {(agendamentos.length > 0 || buscaAplicada) && (
        <div className="relative mb-4">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-paper-400 dark:text-zinc-500" />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar pelo nome do aluno"
            className="w-full rounded-md border border-paper-300 bg-white py-2.5 pr-3 pl-9 text-sm text-ink-900 transition-colors placeholder:text-paper-400 focus:border-ocre-400 focus:outline-none dark:border-white/10 dark:bg-night-700 dark:text-white dark:placeholder:text-zinc-500"
          />
        </div>
      )}
      {isLoading ? (
        <LoadingState />
      ) : agendamentos.length === 0 ? (
        <EmptyState
          message={
            buscaAplicada
              ? 'Nenhuma aula encontrada para essa busca.'
              : 'Você ainda não recebeu solicitações de aula.'
          }
        />
      ) : (
        <div className="flex flex-col gap-3">
          {error && (
            <div className="rounded-md border border-red-600/20 bg-red-50 px-4 py-2.5 text-sm text-red-600 dark:border-red-400/20 dark:bg-red-400/10 dark:text-red-400">
              {error}
            </div>
          )}
          <ul className="flex flex-col gap-3">
            {agendamentos.map((agendamento) => (
              <li
                key={agendamento.id}
                className="flex flex-col gap-3 rounded-lg border border-paper-200 bg-white px-4 py-3.5 dark:border-white/10 dark:bg-night-700 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex flex-col gap-1">
                  <Link
                    to={`/alunos/${agendamento.studentId}`}
                    className="font-medium text-ink-900 underline decoration-paper-300 underline-offset-2 transition-colors hover:text-ocre-600 hover:decoration-ocre-400 dark:text-white dark:decoration-white/20 dark:hover:text-ocre-400"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {agendamento.studentName}
                  </Link>
                  <SlotInfo agendamento={agendamento} />
                </div>

                {agendamento.status === 'SOLICITADO' ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      variant="secondary"
                      fullWidth={false}
                      icon={<X className="size-4" />}
                      onClick={() => responder(agendamento.id, 'recusar')}
                      isLoading={processingId === agendamento.id}
                      disabled={processingId !== null || cancellingId !== null}
                    >
                      Recusar
                    </Button>
                    <Button
                      fullWidth={false}
                      icon={<Check className="size-4" />}
                      onClick={() => responder(agendamento.id, 'aprovar')}
                      isLoading={processingId === agendamento.id}
                      disabled={processingId !== null || cancellingId !== null}
                    >
                      Aprovar
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      fullWidth={false}
                      className="px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-400/10"
                      icon={<Ban className="size-4" />}
                      isLoading={cancellingId === agendamento.id}
                      disabled={processingId !== null || cancellingId !== null}
                      onClick={() => handleCancelar(agendamento.id)}
                    >
                      Cancelar
                    </Button>
                    <ChatDaAula agendamento={agendamento} nome={agendamento.studentName} />
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <StatusChip status={agendamento.status} />
                    {agendamento.status === 'CONFIRMADO' && (
                      <Button
                        type="button"
                        variant="ghost"
                        fullWidth={false}
                        className="px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-400/10"
                        icon={<Ban className="size-4" />}
                        isLoading={cancellingId === agendamento.id}
                        disabled={cancellingId !== null}
                        onClick={() => handleCancelar(agendamento.id)}
                      >
                        Cancelar
                      </Button>
                    )}
                    {agendamento.status === 'CONFIRMADO' && !avaliadosIds.has(agendamento.id) && (
                      <Button
                        type="button"
                        variant="ghost"
                        fullWidth={false}
                        className="px-3 py-1.5 text-xs"
                        icon={<Star className="size-4" />}
                        onClick={() => setAvaliacaoAlvo(agendamento)}
                      >
                        Avaliar
                      </Button>
                    )}
                    <ChatDaAula agendamento={agendamento} nome={agendamento.studentName} />
                  </div>
                )}
              </li>
            ))}
          </ul>
          <Paginacao
            page={page}
            totalPages={totalPages}
            onChange={setPage}
            disabled={isLoading}
          />
        </div>
      )}

      {avaliacaoAlvo && (
        <AvaliacaoDialog
          open
          onClose={() => setAvaliacaoAlvo(null)}
          avaliadoId={avaliacaoAlvo.alunoUsuarioId}
          avaliadoNome={avaliacaoAlvo.studentName}
          agendamentoId={avaliacaoAlvo.id}
          onSuccess={() => {
            setAvaliadosIds((prev) => new Set(prev).add(avaliacaoAlvo.id))
            setAvaliacaoAlvo(null)
            setToast({ variant: 'success', message: 'Avaliação enviada com sucesso!' })
          }}
          onError={(msg) => setToast({ variant: 'error', message: msg })}
        />
      )}

      {toast && (
        <div
          className={cn(
            'fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-lg px-5 py-3 text-sm font-medium shadow-lg',
            toast.variant === 'success' ? 'bg-sage-600 text-white' : 'bg-red-600 text-white',
          )}
        >
          {toast.message}
        </div>
      )}
    </PageChrome>
  )
}

export function AgendamentosPage() {
  const { user } = useAuth()
  if (ehContaAdmin(user)) {
    return <Navigate to="/dashboard" replace />
  }
  const ehProfessor = user?.role === 'PROFESSOR'
  return ehProfessor ? <TeacherBookingsView /> : <StudentBookingsView />
}
