import { ArrowLeft, Send } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import axios from 'axios'
import { SiteFooter } from '@/components/landing/SiteFooter'
import { SiteHeader } from '@/components/landing/SiteHeader'
import { Button } from '@/components/ui/Button'
import { Toast } from '@/components/ui/Toast'
import { useAuth } from '@/hooks/useAuth'
import { extractErrorMessage } from '@/lib/api'
import { enviarMensagem, listarConversa, type MensagemChat } from '@/lib/chatService'
import { cn } from '@/lib/cn'
import { idUsuarioLogado } from '@/lib/session'

type ChatState = {
  nome?: string
  avatarUrl?: string | null
  voltarPara?: string
}

const PAGE_SHELL =
  'flex min-h-screen flex-col bg-paper-50 transition-colors duration-300 dark:bg-night-900'

function iniciais(nome: string) {
  const partes = nome.trim().split(/\s+/).filter(Boolean)
  if (partes.length === 0) return '?'
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase()
  return `${partes[0][0]}${partes[partes.length - 1][0]}`.toUpperCase()
}

function hora(iso: string) {
  const data = new Date(iso)
  if (Number.isNaN(data.getTime())) return ''
  return data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

export function ChatPage() {
  const { usuarioId } = useParams()
  const destinatarioId = usuarioId ?? ''
  const location = useLocation()
  const estado = (location.state ?? {}) as ChatState
  const { user } = useAuth()
  const meuId = idUsuarioLogado()

  const [mensagens, setMensagens] = useState<MensagemChat[]>([])
  const [texto, setTexto] = useState('')
  const [carregando, setCarregando] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [toast, setToast] = useState<{ message: string; variant: 'success' | 'error' } | null>(null)
  const fimRef = useRef<HTMLDivElement>(null)

  const fecharToast = useCallback(() => setToast(null), [])

  const outra = mensagens
    .flatMap((mensagem) => [mensagem.remetente, mensagem.destinatario])
    .find((pessoa) => pessoa.id === destinatarioId)

  const nome = outra?.nome || estado.nome || 'Conversa'
  const avatar = outra?.avatarUrl ?? estado.avatarUrl ?? null

  useEffect(() => {
    fimRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensagens])

  useEffect(() => {
    if (!destinatarioId) return

    let ativo = true
    setCarregando(true)

    listarConversa(destinatarioId)
      .then((historico) => {
        if (ativo) setMensagens(historico)
      })
      .catch((error) => {
        if (!ativo) return
        setMensagens([])
        setToast({
          variant: 'error',
          message: extractErrorMessage(error, 'Não foi possível carregar a conversa.'),
        })
      })
      .finally(() => {
        if (ativo) setCarregando(false)
      })

    return () => {
      ativo = false
    }
  }, [destinatarioId])

  function mostrarErro(mensagem: string) {
    setToast({ variant: 'error', message: mensagem })
  }

  async function handleEnviar(event: FormEvent) {
    event.preventDefault()
    const conteudo = texto.trim()
    if (enviando) return
    if (!conteudo) return
    if (!destinatarioId) {
      mostrarErro('Não encontrei o destinatário nesta conversa.')
      return
    }
    if (!meuId) {
      mostrarErro('Sua sessão expirou. Entre de novo para enviar a mensagem.')
      return
    }

    const temporaria: MensagemChat = {
      id: `local-${crypto.randomUUID()}`,
      remetente: { id: meuId, nome: user?.name ?? 'Você', avatarUrl: null },
      destinatario: { id: destinatarioId, nome, avatarUrl: avatar },
      conteudo,
      lida: false,
      dataEnvio: new Date().toISOString(),
    }

    setMensagens((atual) => [...atual, temporaria])
    setTexto('')
    setEnviando(true)

    try {
      const salva = await enviarMensagem({ destinatarioId, conteudo })
      setMensagens((atual) => atual.map((item) => (item.id === temporaria.id ? salva : item)))
    } catch (error) {
      const resposta = axios.isAxiosError(error) ? error.response?.data : error
      console.error('Erro no envio do chat:', resposta)
      setMensagens((atual) => atual.filter((item) => item.id !== temporaria.id))
      setTexto((atual) => (atual.trim() === '' ? conteudo : atual))
      const status = axios.isAxiosError(error) ? error.response?.status : undefined
      const detalhe = extractErrorMessage(error, 'Não foi possível enviar a mensagem.')
      mostrarErro(status ? `${status}: ${detalhe}` : detalhe)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className={PAGE_SHELL}>
      <SiteHeader />
      {toast && <Toast message={toast.message} variant={toast.variant} onDismiss={fecharToast} />}

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-6 sm:px-6">
        <Link
          to={estado.voltarPara ?? '/professores'}
          className="mb-4 inline-flex w-fit items-center gap-1.5 text-sm text-ink-600 hover:text-ink-900 dark:text-zinc-400 dark:hover:text-white"
        >
          <ArrowLeft className="size-4" />
          Voltar
        </Link>

        <section className="flex h-[calc(100dvh-11rem)] min-h-[28rem] flex-col overflow-hidden rounded-xl border border-paper-200 bg-white dark:border-white/10 dark:bg-white/[0.03]">
          <header className="flex items-center gap-3 border-b border-paper-200 px-4 py-3 dark:border-white/10">
            {avatar ? (
              <img src={avatar} alt="" className="size-10 rounded-full object-cover" />
            ) : (
              <span className="flex size-10 items-center justify-center rounded-full bg-ink-800 text-xs font-semibold text-paper-50">
                {iniciais(nome)}
              </span>
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-ink-900 dark:text-white">{nome}</p>
              <p className="text-xs text-paper-500 dark:text-zinc-500">Conversa direta</p>
            </div>
          </header>

          <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-4">
            {carregando && (
              <p className="text-center text-sm text-paper-500 dark:text-zinc-500">Carregando mensagens...</p>
            )}

            {!carregando && mensagens.length === 0 && (
              <p className="m-auto max-w-xs text-center text-sm text-paper-500 dark:text-zinc-500">
                Nenhuma mensagem ainda. Escreva a primeira para combinar a aula.
              </p>
            )}

            {mensagens.map((mensagem) => {
              const minha = mensagem.remetente.id === meuId
              return (
                <div key={mensagem.id} className={cn('flex', minha ? 'justify-end' : 'justify-start')}>
                  <div
                    className={cn(
                      'max-w-[78%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed',
                      minha
                        ? 'rounded-br-md bg-sky-600 text-white'
                        : 'rounded-bl-md bg-zinc-200 text-ink-800 dark:bg-zinc-700 dark:text-zinc-100',
                    )}
                  >
                    <p className="whitespace-pre-wrap break-words">{mensagem.conteudo}</p>
                    <p className={cn('mt-1 text-[11px]', minha ? 'text-white/75' : 'text-ink-500 dark:text-zinc-400')}>
                      {hora(mensagem.dataEnvio)}
                    </p>
                  </div>
                </div>
              )
            })}
            <div ref={fimRef} />
          </div>

          <form
            onSubmit={handleEnviar}
            className="flex items-center gap-2 border-t border-paper-200 px-3 py-3 dark:border-white/10"
          >
            <input
              value={texto}
              onChange={(event) => setTexto(event.target.value)}
              maxLength={4000}
              placeholder="Escreva uma mensagem"
              aria-label="Mensagem"
              className="inset-well min-w-0 flex-1 rounded-md px-3 py-2.5 text-sm text-ink-900 placeholder:text-paper-400 focus:border-ocre-400 focus:outline-none dark:text-white dark:placeholder:text-zinc-600"
            />
            <Button
              type="submit"
              fullWidth={false}
              isLoading={enviando}
              disabled={!texto.trim()}
              aria-label="Enviar"
              icon={<Send className="size-4" />}
              className="px-3"
            >
              <span className="sr-only">Enviar</span>
            </Button>
          </form>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
