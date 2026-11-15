import { Bot, ChevronLeft, MessageCircle, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { FAQ_CATEGORIAS, type FaqItem } from '@/lib/faqConteudo'

type Mensagem = {
  id: number
  autor: 'bot' | 'user'
  texto: string
}

const MENSAGEM_INICIAL: Mensagem = {
  id: 0,
  autor: 'bot',
  texto: 'Oi! 👋 Sou o assistente do ConectaPro. Escolha um assunto abaixo e eu explico.',
}

const CHIP_CLASS =
  'rounded-lg border border-paper-200 bg-paper-50 px-3 py-2 text-left text-sm text-ink-700 transition-colors hover:border-ocre-300 hover:bg-ocre-50 hover:text-ink-900 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300 dark:hover:border-ocre-500/40 dark:hover:bg-ocre-500/10 dark:hover:text-white'

export function ChatbotFaq() {
  const [aberto, setAberto] = useState(false)
  const [mensagens, setMensagens] = useState<Mensagem[]>([MENSAGEM_INICIAL])
  const [categoriaId, setCategoriaId] = useState<string | null>(null)
  const fimRef = useRef<HTMLDivElement>(null)
  const proximoIdRef = useRef(1)

  useEffect(() => {
    if (aberto) fimRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [mensagens, aberto, categoriaId])

  useEffect(() => {
    if (!aberto) return
    function aoPressionar(evento: KeyboardEvent) {
      if (evento.key === 'Escape') setAberto(false)
    }
    document.addEventListener('keydown', aoPressionar)
    return () => document.removeEventListener('keydown', aoPressionar)
  }, [aberto])

  function proximoId() {
    proximoIdRef.current += 1
    return proximoIdRef.current
  }

  function responder(item: FaqItem) {
    setMensagens((atual) => [
      ...atual,
      { id: proximoId(), autor: 'user', texto: item.pergunta },
      { id: proximoId(), autor: 'bot', texto: item.resposta },
    ])
  }

  const categoriaAtiva = FAQ_CATEGORIAS.find((categoria) => categoria.id === categoriaId)

  if (!aberto) {
    return (
      <button
        type="button"
        onClick={() => setAberto(true)}
        aria-label="Abrir dúvidas frequentes"
        className="fixed bottom-4 right-4 z-50 flex size-14 items-center justify-center rounded-full bg-ocre-500 text-white shadow-[0_10px_30px_-10px_rgba(18,38,63,0.6)] transition-transform hover:scale-105 active:scale-95"
      >
        <MessageCircle className="size-6" />
      </button>
    )
  }

  return (
    <div
      role="dialog"
      aria-label="Dúvidas frequentes"
      className="fixed bottom-4 right-4 z-50 flex h-[32rem] max-h-[75vh] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-paper-200 bg-white shadow-[0_24px_60px_-24px_rgba(18,38,63,0.6)] dark:border-white/10 dark:bg-night-900"
    >
      <div className="flex items-center justify-between gap-2 border-b border-paper-200 bg-paper-50 px-4 py-3 dark:border-white/10 dark:bg-night-800">
        <div className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-full bg-ocre-100 text-ocre-600 dark:bg-ocre-500/15">
            <Bot className="size-5" />
          </span>
          <div>
            <p className="text-sm font-semibold text-ink-900 dark:text-white">Dúvidas frequentes</p>
            <p className="text-xs text-ink-500 dark:text-zinc-500">Assistente ConectaPro</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setAberto(false)}
          aria-label="Fechar"
          className="flex size-8 items-center justify-center rounded-md text-ink-500 transition-colors hover:bg-paper-100 hover:text-ink-900 dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-white"
        >
          <X className="size-5" />
        </button>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {mensagens.map((mensagem) =>
          mensagem.autor === 'bot' ? (
            <div key={mensagem.id} className="flex items-end gap-2">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-ocre-100 text-ocre-600 dark:bg-ocre-500/15">
                <Bot className="size-4" />
              </span>
              <div className="max-w-[80%] rounded-2xl rounded-bl-sm bg-paper-100 px-3 py-2 text-sm text-ink-800 dark:bg-white/5 dark:text-zinc-200">
                {mensagem.texto}
              </div>
            </div>
          ) : (
            <div key={mensagem.id} className="flex justify-end">
              <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-ink-800 px-3 py-2 text-sm text-paper-50">
                {mensagem.texto}
              </div>
            </div>
          ),
        )}
        <div ref={fimRef} />
      </div>

      <div className="border-t border-paper-200 p-3 dark:border-white/10">
        {categoriaAtiva ? (
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => setCategoriaId(null)}
              className="inline-flex items-center gap-1 self-start text-xs font-medium text-ink-500 transition-colors hover:text-ink-800 dark:text-zinc-400 dark:hover:text-white"
            >
              <ChevronLeft className="size-3.5" />
              Voltar aos assuntos
            </button>
            <div className="flex max-h-44 flex-col gap-1.5 overflow-y-auto">
              {categoriaAtiva.itens.map((item) => (
                <button
                  key={item.pergunta}
                  type="button"
                  onClick={() => responder(item)}
                  className={CHIP_CLASS}
                >
                  {item.pergunta}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-1.5">
            {FAQ_CATEGORIAS.map((categoria) => (
              <button
                key={categoria.id}
                type="button"
                onClick={() => setCategoriaId(categoria.id)}
                className={`${CHIP_CLASS} text-center`}
              >
                {categoria.titulo}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
