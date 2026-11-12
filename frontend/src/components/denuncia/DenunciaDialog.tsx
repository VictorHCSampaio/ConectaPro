import { AnimatePresence, motion } from 'framer-motion'
import { Flag, X } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '@/components/ui/Button'
import { extractErrorMessage } from '@/lib/api'
import { cn } from '@/lib/cn'
import { MOTIVOS_DENUNCIA, registrarDenuncia, type MotivoDenuncia } from '@/lib/denunciaService'

type DenunciaDialogProps = {
  open: boolean
  onClose: () => void
  professorId: string
  professorNome: string
  onSuccess: () => void
  onError: (mensagem: string) => void
}

const EASE = [0.16, 1, 0.3, 1] as const

export function DenunciaDialog({
  open,
  onClose,
  professorId,
  professorNome,
  onSuccess,
  onError,
}: DenunciaDialogProps) {
  const titleId = useId()
  const [motivo, setMotivo] = useState<MotivoDenuncia | ''>('')
  const [descricao, setDescricao] = useState('')
  const [enviando, setEnviando] = useState(false)
  const enviandoRef = useRef(false)
  enviandoRef.current = enviando

  useEffect(() => {
    if (!open) return
    setMotivo('')
    setDescricao('')
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
    const texto = descricao.trim()

    if (!motivo) {
      onError('Escolha o motivo da denúncia.')
      return
    }
    if (texto.length < 10) {
      onError('Descreva o ocorrido com pelo menos 10 caracteres.')
      return
    }

    setEnviando(true)
    try {
      await registrarDenuncia(professorId, motivo, texto)
      onSuccess()
      onClose()
    } catch (error) {
      onError(extractErrorMessage(error, 'Não foi possível registrar a denúncia. Tente de novo.'))
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
                <p className="label-mono text-paper-500 dark:text-zinc-500">Canal de denúncia</p>
                <h2 id={titleId} className="mt-1 text-lg font-semibold tracking-tight text-ink-900 dark:text-white">
                  Denunciar {professorNome}
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
              <label className="flex flex-col gap-2 text-sm">
                <span className="text-xs font-medium text-paper-600 dark:text-zinc-400">Motivo</span>
                <select
                  value={motivo}
                  onChange={(event) => setMotivo(event.target.value as MotivoDenuncia | '')}
                  required
                  className="inset-well w-full rounded-md px-3 py-2.5 text-sm text-ink-900 focus:border-ocre-400 focus:outline-none dark:text-white"
                >
                  <option value="">Selecione</option>
                  {MOTIVOS_DENUNCIA.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-2 text-sm">
                <span className="text-xs font-medium text-paper-600 dark:text-zinc-400">Descrição</span>
                <textarea
                  value={descricao}
                  onChange={(event) => setDescricao(event.target.value)}
                  rows={5}
                  maxLength={4000}
                  placeholder="Conte o que aconteceu, com o máximo de contexto que puder."
                  className="inset-well w-full resize-y rounded-md px-3 py-2.5 text-sm text-ink-900 placeholder:text-paper-400 focus:border-ocre-400 focus:outline-none dark:text-white dark:placeholder:text-zinc-600"
                />
              </label>

              <Button type="submit" isLoading={enviando} icon={<Flag className="size-4" />}>
                Enviar Denúncia
              </Button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
