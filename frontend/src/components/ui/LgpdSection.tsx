import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, Download, Loader2, Trash2, X } from 'lucide-react'
import { useEffect, useId, useState } from 'react'
import { createPortal } from 'react-dom'
import { useAuth } from '@/hooks/useAuth'
import { extractErrorMessage } from '@/lib/api'
import { cn } from '@/lib/cn'
import { excluirMinhaConta, exportarMeusDados } from '@/lib/usuarioService'

const EASE = [0.16, 1, 0.3, 1] as const

function ConfirmDeleteDialog({
  open,
  onClose,
  onConfirmed,
}: {
  open: boolean
  onClose: () => void
  onConfirmed: () => void
}) {
  const titleId = useId()
  const [confirmText, setConfirmText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setConfirmText('')
    setError(null)
    setIsDeleting(false)

    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  async function handleConfirm() {
    if (confirmText !== 'EXCLUIR') return
    setIsDeleting(true)
    setError(null)
    try {
      await excluirMinhaConta()
      onConfirmed()
    } catch (err) {
      setError(extractErrorMessage(err, 'Não foi possível excluir sua conta.'))
      setIsDeleting(false)
    }
  }

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
              'relative w-full max-w-md overflow-hidden rounded-lg',
              'border border-paper-300/70 bg-paper-50/88 backdrop-blur-xl',
              'shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_24px_48px_-20px_rgba(18,38,63,0.45)]',
              'dark:border-white/[0.08] dark:bg-night-800/72',
              'dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_0_0_1px_rgba(255,255,255,0.03),0_32px_64px_-16px_rgba(0,0,0,0.85)]',
            )}
          >
            <header className="flex items-start justify-between gap-4 border-b border-paper-200/80 px-5 py-4 dark:border-white/[0.06]">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-md border border-red-200 bg-red-50 text-red-600 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400">
                  <AlertTriangle className="size-4" />
                </span>
                <div>
                  <h2
                    id={titleId}
                    className="text-lg font-semibold tracking-tight text-ink-900 dark:text-white"
                  >
                    Excluir conta
                  </h2>
                  <p className="mt-0.5 text-xs text-ink-500 dark:text-zinc-500">
                    Esta ação não pode ser desfeita
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Fechar"
                className="flex size-8 shrink-0 items-center justify-center rounded-md text-ink-500 transition-colors hover:bg-paper-200/80 hover:text-ink-900 dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-white"
              >
                <X className="size-4" />
              </button>
            </header>

            <div className="px-5 py-5">
              <p className="text-sm text-ink-700 dark:text-zinc-300">
                Ao excluir sua conta, seus dados pessoais serão anonimizados permanentemente:
              </p>
              <ul className="mt-3 flex flex-col gap-1.5 text-xs text-ink-600 dark:text-zinc-400">
                <li>• Nome, email, biografia e avatar serão removidos</li>
                <li>• Seu endereço será apagado</li>
                <li>• Login e autenticação serão desativados</li>
                <li>• Agendamentos e avaliações serão mantidos de forma anônima</li>
              </ul>

              <div className="mt-5">
                <label className="block text-xs font-medium text-red-700 dark:text-red-300">
                  Digite <span className="font-bold">EXCLUIR</span> para confirmar:
                </label>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="EXCLUIR"
                  className="mt-2 w-full rounded-md border border-red-300 bg-white px-3 py-2 text-sm text-ink-900 placeholder:text-paper-400 focus:border-red-400 focus:outline-none dark:border-red-800 dark:bg-red-950/30 dark:text-white dark:placeholder:text-zinc-600"
                />
              </div>

              {error && (
                <p className="mt-3 text-xs font-medium text-red-600 dark:text-red-400">{error}</p>
              )}
            </div>

            <footer className="flex justify-end gap-3 border-t border-paper-200/80 px-5 py-4 dark:border-white/[0.06]">
              <button
                type="button"
                onClick={onClose}
                className="rounded-md border border-paper-300 px-4 py-2 text-sm font-medium text-ink-700 transition-colors hover:bg-paper-100 dark:border-white/10 dark:text-zinc-300 dark:hover:bg-white/[0.04]"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={confirmText !== 'EXCLUIR' || isDeleting}
                onClick={handleConfirm}
                className="inline-flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50 dark:bg-red-700 dark:hover:bg-red-600"
              >
                {isDeleting ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                {isDeleting ? 'Excluindo…' : 'Excluir minha conta'}
              </button>
            </footer>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}

export function LgpdSection() {
  const { signOut } = useAuth()
  const [isExporting, setIsExporting] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleExportData() {
    setIsExporting(true)
    setError(null)
    setFeedback(null)
    try {
      const blob = await exportarMeusDados()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'meus-dados-conectapro.json'
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      setFeedback('Dados exportados com sucesso!')
    } catch (err) {
      setError(extractErrorMessage(err, 'Não foi possível exportar seus dados.'))
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <>
      <div className="mt-10 border-t border-paper-200 pt-8 dark:border-white/[0.06]">
        <h2 className="text-lg font-semibold text-ink-900 dark:text-white">
          Privacidade e dados (LGPD)
        </h2>
        <p className="mt-1 text-sm text-ink-600 dark:text-zinc-400">
          Você tem o direito de baixar todos os seus dados ou excluir sua conta a qualquer momento.
        </p>

        <div className="mt-5 flex flex-col gap-4">
          <div className="flex items-start gap-4 rounded-lg border border-paper-200 bg-white p-4 dark:border-white/[0.06] dark:bg-white/[0.02]">
            <Download className="mt-0.5 size-5 shrink-0 text-sage-600 dark:text-emerald-400" />
            <div className="flex-1">
              <p className="text-sm font-medium text-ink-900 dark:text-white">Exportar meus dados</p>
              <p className="mt-0.5 text-xs text-ink-500 dark:text-zinc-500">
                Baixa um arquivo JSON com todas as informações associadas à sua conta: perfil, endereço, agendamentos, mensagens, avaliações, denúncias e notificações.
              </p>
              <button
                type="button"
                disabled={isExporting}
                onClick={handleExportData}
                className="mt-3 inline-flex items-center gap-2 rounded-md border border-paper-300 bg-white px-4 py-1.5 text-sm font-medium text-ink-800 transition-colors hover:border-paper-400 hover:bg-paper-50 disabled:opacity-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-200 dark:hover:border-white/20"
              >
                {isExporting ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
                {isExporting ? 'Exportando…' : 'Baixar meus dados'}
              </button>
              {feedback && (
                <p className="mt-2 text-xs font-medium text-sage-600 dark:text-emerald-400">{feedback}</p>
              )}
              {error && (
                <p className="mt-2 text-xs font-medium text-red-600 dark:text-red-400">{error}</p>
              )}
            </div>
          </div>

          <div className="flex items-start gap-4 rounded-lg border border-red-200 bg-red-50/50 p-4 dark:border-red-900/30 dark:bg-red-950/20">
            <Trash2 className="mt-0.5 size-5 shrink-0 text-red-500 dark:text-red-400" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-700 dark:text-red-300">Excluir minha conta</p>
              <p className="mt-0.5 text-xs text-red-600/80 dark:text-red-400/70">
                Ação irreversível. Seus dados pessoais serão anonimizados e o login será desativado.
              </p>
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="mt-3 inline-flex items-center gap-2 rounded-md border border-red-300 bg-white px-4 py-1.5 text-sm font-medium text-red-700 transition-colors hover:bg-red-50 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300 dark:hover:bg-red-950/60"
              >
                <Trash2 className="size-4" />
                Quero excluir minha conta
              </button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDeleteDialog
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirmed={signOut}
      />
    </>
  )
}
