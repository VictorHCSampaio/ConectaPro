import { Bell } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import { cn } from '@/lib/cn'
import type { Notificacao } from '@/lib/notificacaoService'

type SininhoNotificacoesProps = {
  notificacoes: Notificacao[]
  marcarComoLida: (id: string) => void
}

export function SininhoNotificacoes({ notificacoes, marcarComoLida }: SininhoNotificacoesProps) {
  const [aberto, setAberto] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const painelId = useId()
  const naoLidas = notificacoes.filter((item) => !item.lida).length

  useEffect(() => {
    if (!aberto) return

    function fecharAoClicarFora(evento: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(evento.target as Node)) {
        setAberto(false)
      }
    }

    function fecharComEscape(evento: KeyboardEvent) {
      if (evento.key === 'Escape') setAberto(false)
    }

    document.addEventListener('mousedown', fecharAoClicarFora)
    document.addEventListener('keydown', fecharComEscape)
    return () => {
      document.removeEventListener('mousedown', fecharAoClicarFora)
      document.removeEventListener('keydown', fecharComEscape)
    }
  }, [aberto])

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label={naoLidas > 0 ? `Notificações, ${naoLidas} não lidas` : 'Notificações'}
        aria-expanded={aberto}
        aria-controls={painelId}
        onClick={() => setAberto((atual) => !atual)}
        className="relative flex size-9 items-center justify-center rounded-md text-ink-600 transition-colors hover:bg-paper-100 hover:text-ink-900 dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-white"
      >
        <Bell className="size-5" />
        {naoLidas > 0 && (
          <span className="absolute top-0.5 right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white">
            {naoLidas > 99 ? '99+' : naoLidas}
          </span>
        )}
      </button>

      {aberto && (
        <div
          id={painelId}
          role="dialog"
          aria-label="Notificações"
          className="fixed inset-x-4 top-16 z-50 mt-2 w-auto overflow-hidden rounded-lg border border-paper-200 bg-paper-50 shadow-[0_16px_40px_-24px_rgba(18,38,63,0.7)] md:absolute md:inset-x-auto md:right-0 md:top-auto md:w-80 dark:border-white/10 dark:bg-night-800"
        >
          <p className="border-b border-paper-200 px-4 py-3 text-sm font-semibold text-ink-900 dark:border-white/10 dark:text-white">
            Notificações
          </p>
          <div className="max-h-96 overflow-y-auto">
            {notificacoes.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-ink-600 dark:text-zinc-400">
                Nenhuma notificação no momento
              </p>
            ) : (
              <ul>
                {notificacoes.map((notificacao) => (
                  <li key={notificacao.id}>
                    <button
                      type="button"
                      onClick={() => {
                        if (!notificacao.lida) marcarComoLida(notificacao.id)
                      }}
                      className={cn(
                        'flex w-full flex-col gap-1 border-b border-paper-200 px-4 py-3 text-left last:border-b-0 dark:border-white/10',
                        notificacao.lida
                          ? 'hover:bg-paper-100 dark:hover:bg-white/5'
                          : 'bg-sky-50 font-semibold hover:bg-sky-100/80 dark:bg-sky-400/10 dark:hover:bg-sky-400/15',
                      )}
                    >
                      <span className="text-sm text-ink-900 dark:text-white">{notificacao.titulo}</span>
                      <span
                        className={cn(
                          'line-clamp-2 text-sm text-ink-600 dark:text-zinc-300',
                          notificacao.lida ? 'font-normal' : 'font-medium',
                        )}
                      >
                        {notificacao.mensagem}
                      </span>
                      <span className="text-xs font-normal text-ink-500 dark:text-zinc-500">
                        {formatarData(notificacao.dataCriacao)}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function formatarData(valor: string) {
  const data = new Date(valor)
  if (Number.isNaN(data.getTime())) return ''
  return data.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
}
