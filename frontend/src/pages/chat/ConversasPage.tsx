import { Mail, MessageCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { SiteFooter } from '@/components/landing/SiteFooter'
import { SiteHeader } from '@/components/landing/SiteHeader'
import { extractErrorMessage } from '@/lib/api'
import { listarConversas, type ConversaResumo } from '@/lib/chatService'
import { cn } from '@/lib/cn'

const PAGE_SHELL =
  'flex min-h-screen flex-col bg-paper-50 transition-colors duration-300 dark:bg-night-900'

function iniciais(nome: string) {
  const partes = nome.trim().split(/\s+/).filter(Boolean)
  if (partes.length === 0) return '?'
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase()
  return `${partes[0][0]}${partes[partes.length - 1][0]}`.toUpperCase()
}

function quando(iso: string) {
  const data = new Date(iso)
  if (Number.isNaN(data.getTime())) return ''
  const agora = new Date()
  const mesmoDia = data.toDateString() === agora.toDateString()
  if (mesmoDia) {
    return data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  }
  return data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

export function ConversasPage() {
  const [conversas, setConversas] = useState<ConversaResumo[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    let ativo = true
    listarConversas()
      .then((lista) => {
        if (ativo) setConversas(lista)
      })
      .catch((error) => {
        if (!ativo) return
        setErro(extractErrorMessage(error, 'Não foi possível carregar as conversas.'))
      })
      .finally(() => {
        if (ativo) setCarregando(false)
      })
    return () => {
      ativo = false
    }
  }, [])

  return (
    <div className={PAGE_SHELL}>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-8 sm:px-6">
        <p className="label-mono text-paper-500 dark:text-zinc-500">Mensagens</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink-900 dark:text-white">
          Conversas
        </h1>
        <p className="mt-1 text-sm text-ink-600 dark:text-zinc-400">
          Todas as conversas com professores e alunos.
        </p>

        <section className="mt-6">
          {carregando && (
            <p className="text-sm text-paper-500 dark:text-zinc-500">Carregando conversas...</p>
          )}

          {!carregando && erro && (
            <p className="rounded-lg border border-red-600/20 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-400/20 dark:bg-red-400/10 dark:text-red-300">
              {erro}
            </p>
          )}

          {!carregando && !erro && conversas.length === 0 && (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-paper-200 bg-white px-6 py-12 text-center dark:border-white/10 dark:bg-white/[0.03]">
              <MessageCircle className="size-8 text-paper-400 dark:text-zinc-500" />
              <p className="max-w-sm text-sm text-paper-500 dark:text-zinc-500">
                Você ainda não tem conversas. Abra o perfil de um professor e toque em Conversar.
              </p>
            </div>
          )}

          {!carregando && !erro && conversas.length > 0 && (
            <ul className="overflow-hidden rounded-xl border border-paper-200 bg-white dark:border-white/10 dark:bg-white/[0.03]">
              {conversas.map((conversa) => {
                const { participante } = conversa
                return (
                  <li key={participante.id} className="border-b border-paper-200 last:border-b-0 dark:border-white/10">
                    <Link
                      to={`/chat/${participante.id}`}
                      state={{
                        nome: participante.nome,
                        avatarUrl: participante.avatarUrl,
                        voltarPara: '/chat',
                      }}
                      className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-paper-100 dark:hover:bg-white/5"
                    >
                      {participante.avatarUrl ? (
                        <img
                          src={participante.avatarUrl}
                          alt=""
                          className="size-11 shrink-0 rounded-full object-cover"
                        />
                      ) : (
                        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-ink-800 text-xs font-semibold text-paper-50">
                          {iniciais(participante.nome)}
                        </span>
                      )}
                      <span className="min-w-0 flex-1">
                        <span className="flex items-baseline justify-between gap-3">
                          <span className="truncate text-sm font-semibold text-ink-900 dark:text-white">
                            {participante.nome}
                          </span>
                          <span className="shrink-0 text-xs text-paper-500 dark:text-zinc-500">
                            {quando(conversa.dataEnvio)}
                          </span>
                        </span>
                        <span className="mt-0.5 flex items-center justify-between gap-3">
                          <span className="truncate text-sm text-ink-600 dark:text-zinc-400">
                            {conversa.enviadaPorMim ? 'Você: ' : ''}
                            {conversa.ultimaMensagem}
                          </span>
                          {conversa.naoLidas > 0 && (
                            <span
                              className={cn(
                                'inline-flex min-w-5 shrink-0 items-center justify-center rounded-full bg-sky-600 px-1.5 text-[11px] font-semibold text-white',
                              )}
                            >
                              {conversa.naoLidas}
                            </span>
                          )}
                        </span>
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </section>

        <section className="mt-6">
          <div
            className="flex items-center gap-3 rounded-xl border border-ocre-200 bg-ocre-50 px-4 py-4 dark:border-ocre-500/20 dark:bg-ocre-500/10"
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-ocre-500 text-white">
              <Mail className="size-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-ink-900 dark:text-white">
                Fale com a administração
              </span>
              <span className="mt-0.5 block text-sm text-ink-600 dark:text-zinc-400">
                conectaprotfc@gmail.com
              </span>
            </span>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
