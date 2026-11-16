import { AnimatePresence, motion } from 'framer-motion'
import { Star, X } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '@/components/ui/Button'
import { StarRatingInput } from '@/components/ui/StarRatingInput'
import { extractErrorMessage } from '@/lib/api'
import { cn } from '@/lib/cn'
import { enviarAvaliacao } from '@/lib/avaliacaoService'

type AvaliacaoDialogProps = {
  open: boolean
  onClose: () => void
  avaliadoId: string
  avaliadoNome: string
  agendamentoId: string
  onSuccess: () => void
  onError: (mensagem: string) => void
}

const EASE = [0.16, 1, 0.3, 1] as const

export function AvaliacaoDialog({
  open,
  onClose,
  avaliadoId,
  avaliadoNome,
  agendamentoId,
  onSuccess,
  onError,
}: AvaliacaoDialogProps) {
  const titleId = useId()
  const [nota, setNota] = useState(0)
  const [comentario, setComentario] = useState('')
  const [enviando, setEnviando] = useState(false)
  const enviandoRef = useRef(false)
  enviandoRef.current = enviando

  useEffect(() => {
    if (!open) return
    setNota(0)
    setComentario('')
    setEnviando(false)
  }, [open])

  useEffect(() => {
    if (!open) return

    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape' && !enviandoRef.current) onClose()
    }

    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = overflow
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()

    if (nota === 0) {
      onError('Selecione uma nota de 1 a 5 estrelas.')
      return
    }

    setEnviando(true)
    try {
      await enviarAvaliacao({
        avaliadoId,
        agendamentoId,
        nota,
        comentario: comentario.trim() || undefined,
      })
      onSuccess()
      onClose()
    } catch (error) {
      onError(extractErrorMessage(error, 'Não foi possível enviar a avaliação. Tente de novo.'))
    } finally {
      setEnviando(false)
    }
  }

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
            onClick={() => {
              if (!enviando) onClose()
            }}
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
              'relative w-full max-w-lg overflow-hidden rounded-lg',
              'border border-paper-300/70 bg-paper-50/92 backdrop-blur-xl',
              'shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_24px_48px_-20px_rgba(18,38,63,0.45)]',
              'dark:border-white/[0.08] dark:bg-night-800/80',
            )}
          >
            <header className="flex items-start justify-between gap-4 border-b border-paper-200/80 px-5 py-4 dark:border-white/[0.06] sm:px-6">
              <div>
                <p className="label-mono text-paper-500 dark:text-zinc-500">Avaliação</p>
                <h2
                  id={titleId}
                  className="mt-1 text-lg font-semibold tracking-tight text-ink-900 dark:text-white"
                >
                  Avaliar {avaliadoNome}
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                disabled={enviando}
                aria-label="Fechar"
                className="flex size-8 items-center justify-center rounded-md text-ink-500 hover:bg-paper-200/80 hover:text-ink-900 disabled:opacity-40 dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-white"
              >
                <X className="size-4" />
              </button>
            </header>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-5 py-5 sm:px-6">
              <div className="flex flex-col gap-2">
                <span className="text-xs font-medium text-paper-600 dark:text-zinc-400">Nota</span>
                <StarRatingInput value={nota} onChange={setNota} />
              </div>

              <label className="flex flex-col gap-2 text-sm">
                <span className="text-xs font-medium text-paper-600 dark:text-zinc-400">
                  Comentário{' '}
                  <span className="font-normal text-paper-400 dark:text-zinc-600">(opcional)</span>
                </span>
                <textarea
                  value={comentario}
                  onChange={(event) => setComentario(event.target.value)}
                  rows={4}
                  maxLength={1000}
                  placeholder="Conte como foi a experiência."
                  className="inset-well w-full resize-y rounded-md px-3 py-2.5 text-sm text-ink-900 placeholder:text-paper-400 focus:border-ocre-400 focus:outline-none dark:text-white dark:placeholder:text-zinc-600"
                />
                <span className="self-end text-xs tabular-nums text-paper-400 dark:text-zinc-600">
                  {comentario.length}/1000
                </span>
              </label>

              <Button type="submit" isLoading={enviando} icon={<Star className="size-4" />}>
                Enviar Avaliação
              </Button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
