import { AnimatePresence, motion } from 'framer-motion'
import { CalendarDays, X } from 'lucide-react'
import { useEffect, useId } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/cn'
import {
  AGENDAMENTO_STATUS_LABEL,
  formatModality,
  formatSlotDay,
  formatSlotTime,
} from '@/lib/formatSlot'
import type { Agendamento } from '@/types/agendamento'

type AgendamentoDetailsDialogProps = {
  open: boolean
  onClose: () => void
  agendamento: Agendamento | null
  counterpartLabel: string
  counterpartName: string
}

const EASE = [0.16, 1, 0.3, 1] as const

function formatCreatedAt(value: string) {
  const data = new Date(value)
  if (Number.isNaN(data.getTime())) return value
  return data.toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-paper-200/70 py-3 last:border-0 dark:border-white/[0.06]">
      <dt className="text-sm text-paper-600 dark:text-zinc-400">{label}</dt>
      <dd className="text-right text-sm font-medium text-ink-900 dark:text-white">{value}</dd>
    </div>
  )
}

export function AgendamentoDetailsDialog({
  open,
  onClose,
  agendamento,
  counterpartLabel,
  counterpartName,
}: AgendamentoDetailsDialogProps) {
  const titleId = useId()

  useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, onClose])

  return createPortal(
    <AnimatePresence>
      {open && agendamento && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <motion.div
            aria-hidden
            className="absolute inset-0 bg-ink-950/55 backdrop-blur-md dark:bg-black/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: EASE }}
            onClick={onClose}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            initial={{ opacity: 0, y: 18, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.32, ease: EASE }}
            className={cn(
              'relative flex w-full max-w-md flex-col overflow-hidden rounded-lg',
              'border border-paper-300/70 bg-paper-50/88 backdrop-blur-xl',
              'shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_24px_48px_-20px_rgba(18,38,63,0.45)]',
              'dark:border-white/[0.08] dark:bg-night-800/72',
              'dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_0_0_1px_rgba(255,255,255,0.03),0_32px_64px_-16px_rgba(0,0,0,0.85)]',
            )}
          >
            <header className="flex items-start justify-between gap-4 border-b border-paper-200/80 px-5 py-4 dark:border-white/[0.06] sm:px-6">
              <div className="flex min-w-0 items-start gap-3">
                <span
                  className={cn(
                    'mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-md border',
                    'border-paper-300/80 bg-white/70 text-ink-700',
                    'dark:border-white/10 dark:bg-white/[0.04] dark:text-ocre-400',
                  )}
                >
                  <CalendarDays className="size-4" aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="label-mono text-paper-500 dark:text-zinc-500">Detalhes da aula</p>
                  <h2
                    id={titleId}
                    className="mt-1 text-lg font-semibold tracking-tight text-ink-900 dark:text-white"
                  >
                    {agendamento.subject}
                  </h2>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Fechar"
                className={cn(
                  'flex size-8 shrink-0 items-center justify-center rounded-md',
                  'text-ink-500 transition-colors hover:bg-paper-200/80 hover:text-ink-900',
                  'dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-white',
                  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ocre-500',
                )}
              >
                <X className="size-4" />
              </button>
            </header>

            <dl className="flex flex-col px-5 py-2 sm:px-6">
              <Row label={counterpartLabel} value={counterpartName} />
              <Row label="Matéria" value={agendamento.subject} />
              <Row label="Modalidade" value={formatModality(agendamento.modality)} />
              <Row label="Dia" value={formatSlotDay(agendamento.day)} />
              <Row label="Horário" value={formatSlotTime(agendamento.time)} />
              <Row label="Status" value={AGENDAMENTO_STATUS_LABEL[agendamento.status]} />
              <Row label="Solicitado em" value={formatCreatedAt(agendamento.createdAt)} />
            </dl>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
