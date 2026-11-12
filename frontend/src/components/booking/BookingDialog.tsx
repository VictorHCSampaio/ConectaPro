import { AnimatePresence, motion } from 'framer-motion'
import { CalendarCheck, CalendarDays, X } from 'lucide-react'
import { useEffect, useId, useState } from 'react'
import { createPortal } from 'react-dom'
import { FormFeedback } from '@/components/auth/FormFeedback'
import { Button } from '@/components/ui/Button'
import { extractErrorMessage } from '@/lib/api'
import { agendarAula, listarHorariosDisponiveis } from '@/lib/agendamentoService'
import { cn } from '@/lib/cn'
import { DAY_ORDER, formatSlotDay, formatSlotTime } from '@/lib/formatSlot'
import type { AvailableSlot } from '@/types/agendamento'

type BookingDialogProps = {
  open: boolean
  onClose: () => void
  teacherId: string
  teacherName: string
  modalities: string[]
  subjects: string[]
}

const EASE = [0.16, 1, 0.3, 1] as const

const MODALITY_LABELS: Record<string, string> = {
  online: 'Online',
  presencial: 'Presencial',
}

function modalityLabel(modality: string) {
  return MODALITY_LABELS[modality.toLowerCase()] ?? modality
}

function slotKey(slot: AvailableSlot) {
  return `${slot.day}|${slot.time}`
}

function optionButtonCn(isSelected: boolean) {
  return cn(
    'rounded-md border px-3 py-1.5 text-sm font-medium transition-colors duration-150',
    'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ocre-500',
    isSelected
      ? 'border-ink-900 bg-ink-900 text-white dark:border-ocre-400 dark:bg-ocre-500'
      : 'border-paper-200 bg-white text-ink-800 hover:border-paper-400 dark:border-white/10 dark:bg-white/[0.06] dark:text-zinc-200 dark:hover:border-white/20',
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="mb-2 text-xs font-medium text-paper-600 dark:text-zinc-400">{children}</p>
}

export function BookingDialog({
  open,
  onClose,
  teacherId,
  teacherName,
  modalities,
  subjects,
}: BookingDialogProps) {
  const titleId = useId()
  const [slots, setSlots] = useState<AvailableSlot[]>([])
  const [selected, setSelected] = useState<AvailableSlot | null>(null)
  const [selectedModality, setSelectedModality] = useState<string | null>(null)
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null)
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDone, setIsDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  useEffect(() => {
    if (!open) return

    let isActive = true
    setSelected(null)
    setSelectedModality(modalities.length === 1 ? modalities[0] : null)
    setSelectedSubject(subjects.length === 1 ? subjects[0] : null)
    setError(null)
    setIsDone(false)
    setIsLoadingSlots(true)

    listarHorariosDisponiveis(teacherId)
      .then((found) => {
        if (isActive) setSlots(found)
      })
      .catch((err) => {
        if (isActive) setError(extractErrorMessage(err, 'Não foi possível carregar os horários.'))
      })
      .finally(() => {
        if (isActive) setIsLoadingSlots(false)
      })

    return () => {
      isActive = false
    }
  }, [open, teacherId, modalities, subjects])

  async function handleConfirm() {
    if (!selected || !selectedModality || !selectedSubject) return

    setError(null)
    setIsSubmitting(true)
    try {
      await agendarAula(teacherId, selected.day, selected.time, selectedModality, selectedSubject)
      setIsDone(true)
    } catch (err) {
      setError(extractErrorMessage(err, 'Não foi possível enviar a solicitação. Tente novamente.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const sortedDays = DAY_ORDER.filter((day) => slots.some((slot) => slot.day === day))
  const hasSlots = slots.length > 0
  const canSubmit = selected != null && selectedModality != null && selectedSubject != null

  return createPortal(
    <AnimatePresence>
      {open && (
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
              'relative flex max-h-[min(40rem,88vh)] w-full max-w-lg flex-col overflow-hidden rounded-lg',
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
                  <p className="label-mono text-paper-500 dark:text-zinc-500">Agendar aula</p>
                  <h2
                    id={titleId}
                    className="mt-1 text-lg font-semibold tracking-tight text-ink-900 dark:text-white"
                  >
                    {teacherName}
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

            {isDone ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-10 text-center">
                <span className="flex size-14 items-center justify-center rounded-full bg-sage-50 text-sage-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                  <CalendarCheck className="size-7" aria-hidden />
                </span>
                <div className="flex flex-col gap-1.5">
                  <h3 className="text-lg font-semibold tracking-tight text-ink-900 dark:text-white">
                    Solicitação enviada!
                  </h3>
                  <p className="text-sm leading-relaxed text-ink-600 dark:text-zinc-400">
                    O professor vai receber seu pedido e confirmar o horário. Você acompanha o
                    status em “Minhas aulas”.
                  </p>
                </div>
                <Button type="button" onClick={onClose}>
                  Fechar
                </Button>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
                  <div className="flex flex-col gap-5">
                    <div>
                      <SectionLabel>Matéria</SectionLabel>
                      {subjects.length === 0 ? (
                        <p className="text-sm text-ink-600 dark:text-zinc-400">
                          Este professor ainda não cadastrou matérias.
                        </p>
                      ) : (
                        <ul className="flex flex-wrap gap-2">
                          {subjects.map((subject) => (
                            <li key={subject}>
                              <button
                                type="button"
                                aria-pressed={selectedSubject === subject}
                                onClick={() => setSelectedSubject(subject)}
                                className={optionButtonCn(selectedSubject === subject)}
                              >
                                {subject}
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div>
                      <SectionLabel>Modalidade</SectionLabel>
                      {modalities.length > 1 ? (
                        <ul className="flex flex-wrap gap-2">
                          {modalities.map((modality) => (
                            <li key={modality}>
                              <button
                                type="button"
                                aria-pressed={selectedModality === modality}
                                onClick={() => setSelectedModality(modality)}
                                className={optionButtonCn(selectedModality === modality)}
                              >
                                {modalityLabel(modality)}
                              </button>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-ink-700 dark:text-zinc-300">
                          {modalities.length === 1 ? modalityLabel(modalities[0]) : '—'}
                        </p>
                      )}
                    </div>

                    <div>
                      <SectionLabel>Horário</SectionLabel>
                      {isLoadingSlots ? (
                        <p className="text-sm text-ink-600 dark:text-zinc-400">
                          Carregando horários…
                        </p>
                      ) : !hasSlots ? (
                        <p className="text-sm text-ink-600 dark:text-zinc-400">
                          Este professor ainda não tem horários disponíveis na grade.
                        </p>
                      ) : (
                        <div className="flex flex-col gap-5">
                          {sortedDays.map((day) => (
                            <div key={day}>
                              <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-paper-600 dark:text-zinc-400">
                                <CalendarDays className="size-3.5 text-paper-400 dark:text-zinc-500" />
                                {formatSlotDay(day)}
                              </p>
                              <ul className="flex flex-wrap gap-2">
                                {slots
                                  .filter((slot) => slot.day === day)
                                  .map((slot) => {
                                    const isSelected =
                                      selected != null && slotKey(selected) === slotKey(slot)
                                    return (
                                      <li key={slotKey(slot)}>
                                        <button
                                          type="button"
                                          disabled={!slot.available}
                                          aria-pressed={isSelected}
                                          onClick={() => setSelected(slot)}
                                          className={cn(
                                            'rounded-md border px-3 py-1.5 text-sm font-medium tabular-nums transition-colors duration-150',
                                            'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ocre-500',
                                            !slot.available &&
                                              'cursor-not-allowed border-paper-200 bg-paper-100 text-paper-400 line-through dark:border-white/5 dark:bg-white/[0.02] dark:text-zinc-600',
                                            slot.available &&
                                              !isSelected &&
                                              'border-paper-200 bg-white text-ink-800 hover:border-paper-400 dark:border-white/10 dark:bg-white/[0.06] dark:text-zinc-200 dark:hover:border-white/20',
                                            slot.available &&
                                              isSelected &&
                                              'border-ink-900 bg-ink-900 text-white dark:border-ocre-400 dark:bg-ocre-500',
                                          )}
                                        >
                                          {formatSlotTime(slot.time)}
                                        </button>
                                      </li>
                                    )
                                  })}
                              </ul>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {error && (
                    <div className="mt-4">
                      <FormFeedback variant="error" message={error} />
                    </div>
                  )}
                </div>

                <footer className="flex flex-col gap-3 border-t border-paper-200/80 px-5 py-4 dark:border-white/[0.06] sm:px-6">
                  <Button
                    type="button"
                    onClick={handleConfirm}
                    isLoading={isSubmitting}
                    disabled={!canSubmit}
                  >
                    {!selectedSubject
                      ? 'Escolha a matéria'
                      : !selectedModality
                        ? 'Escolha a modalidade'
                        : !selected
                          ? 'Escolha um horário'
                          : 'Solicitar agendamento'}
                  </Button>
                  <p className="text-center text-xs text-paper-500 dark:text-zinc-500">
                    O professor confirma a solicitação. O aluno não paga nada.
                  </p>
                </footer>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
