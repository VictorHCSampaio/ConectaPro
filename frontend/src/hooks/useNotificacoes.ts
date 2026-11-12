import { useEffect, useRef, useState } from 'react'
import {
  listarNotificacoes,
  marcarNotificacaoComoLida,
  type Notificacao,
} from '@/lib/notificacaoService'

export function useNotificacoes(ativo: boolean) {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([])
  const notificacoesRef = useRef(notificacoes)
  notificacoesRef.current = notificacoes

  useEffect(() => {
    if (!ativo) {
      setNotificacoes([])
      return
    }

    let cancelado = false
    listarNotificacoes()
      .then((lista) => {
        if (!cancelado) setNotificacoes(lista)
      })
      .catch(() => {
        if (!cancelado) setNotificacoes([])
      })

    return () => {
      cancelado = true
    }
  }, [ativo])

  function marcarComoLida(id: string) {
    const listaAtual = notificacoesRef.current
    const alvo = listaAtual.find((item) => item.id === id)
    if (!alvo || alvo.lida) return

    setNotificacoes(listaAtual.map((item) => (item.id === id ? { ...item, lida: true } : item)))

    marcarNotificacaoComoLida(id).catch(() => {
      setNotificacoes(listaAtual)
    })
  }

  return { notificacoes, marcarComoLida }
}
