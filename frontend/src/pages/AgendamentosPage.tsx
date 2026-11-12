import { BookOpen, CalendarDays, Check, Clock, Loader2, MessageCircle, Monitor, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SiteFooter } from '@/components/landing/SiteFooter'
import { SiteHeader } from '@/components/landing/SiteHeader'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'
import { extractErrorMessage } from '@/lib/api'
import {
  aprovarAgendamento,
  listarAgendamentosRecebidos,
  listarMeusAgendamentos,
  recusarAgendamento,
} from '@/lib/agendamentoService'
import { AgendamentoDetailsDialog } from '@/components/booking/AgendamentoDetailsDialog'
import { cn } from '@/lib/cn'
import {
  AGENDAMENTO_STATUS_LABEL,
  formatModality,
  formatSlotDay,
  formatSlotTime,
} from '@/lib/formatSlot'
import type { Agendamento, AgendamentoStatus } from '@/types/agendamento'

const PAGE_SHELL =
  'flex min-h-screen flex-col bg-paper-50 transition-colors duration-300 dark:bg-night-900'

const STATUS_CHIP: Record<AgendamentoStatus, string> = {
  SOLICITADO:
    'border-ocre-600/20 bg-ocre-50 text-ocre-700 dark:border-ocre-400/20 dark:bg-ocre-400/10 dark:text-ocre-300',
  CONFIRMADO:
    'border-sage-600/20 bg-sage-50 text-sage-600 dark:border-emerald-800/50 dark:bg-emerald-900/30 dark:text-emerald-400',
  CANCELADO:
    'border-red-600/20 bg-red-50 text-red-600 dark:border-red-400/20 dark:bg-red-400/10 dark:text-red-400',
}

function ChatDaAula({ agendamento, nome }: { agendamento: Agendamento; nome: string }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const alvoId = user?.role === 'PROFESSOR' ? agendamento.alunoUsuarioId : agendamento.professorUsuarioId

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
          {formatSlotDay(agendamento.day)}
        </span>
        <span className="inline-flex items-center gap-1.5 tabular-nums">
          <Clock className="size-3.5 text-paper-400 dark:text-zinc-500" />
          {formatSlotTime(agendamento.time)}
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
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [detalhe, setDetalhe] = useState<Agendamento | null>(null)

  useEffect(() => {
    let isActive = true

    listarMeusAgendamentos()
      .then((dados) => {
        if (isActive) setAgendamentos(dados)
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
  }, [])

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
              <li
                key={agendamento.id}
                className="flex flex-col gap-3 rounded-lg border border-paper-200 bg-white px-4 py-3.5 dark:border-white/10 dark:bg-night-700 sm:flex-row sm:items-center sm:justify-between"
              >
                <button
                  type="button"
                  onClick={() => setDetalhe(agendamento)}
                  className="flex min-w-0 flex-1 flex-col gap-1 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ocre-500"
                >
                  <span className="font-medium text-ink-900 dark:text-white">
                    {agendamento.professorName}
                  </span>
                  <SlotInfo agendamento={agendamento} />
                </button>
                <div className="flex items-center gap-2">
                  <StatusChip status={agendamento.status} />
                  <ChatDaAula agendamento={agendamento} nome={agendamento.professorName} />
                </div>
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
    </>
  )
}

function TeacherBookingsView() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [processingId, setProcessingId] = useState<string | null>(null)

  useEffect(() => {
    let isActive = true

    listarAgendamentosRecebidos()
      .then((dados) => {
        if (isActive) setAgendamentos(dados)
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
  }, [])

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
      {isLoading ? (
        <LoadingState />
      ) : agendamentos.length === 0 ? (
        <EmptyState message="Você ainda não recebeu solicitações de aula." />
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
                  <span className="font-medium text-ink-900 dark:text-white">
                    {agendamento.studentName}
                  </span>
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
                      disabled={processingId !== null}
                    >
                      Recusar
                    </Button>
                    <Button
                      fullWidth={false}
                      icon={<Check className="size-4" />}
                      onClick={() => responder(agendamento.id, 'aprovar')}
                      isLoading={processingId === agendamento.id}
                      disabled={processingId !== null}
                    >
                      Aprovar
                    </Button>
                    <ChatDaAula agendamento={agendamento} nome={agendamento.studentName} />
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <StatusChip status={agendamento.status} />
                    <ChatDaAula agendamento={agendamento} nome={agendamento.studentName} />
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </PageChrome>
  )
}

export function AgendamentosPage() {
  const { user } = useAuth()
  return user?.role === 'PROFESSOR' ? <TeacherBookingsView /> : <StudentBookingsView />
}
