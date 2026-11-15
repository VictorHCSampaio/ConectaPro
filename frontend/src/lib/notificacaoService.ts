import { api } from '@/lib/api'

export type TipoNotificacao = 'CHAT' | 'AULA_NOVA' | 'AULA_LEMBRETE'

export type Notificacao = {
  id: string
  titulo: string
  mensagem: string
  lida: boolean
  dataCriacao: string
  tipo: TipoNotificacao
}

export async function listarNotificacoes(): Promise<Notificacao[]> {
  const { data } = await api.get<Notificacao[]>('/notificacoes')
  return data
}

export async function marcarNotificacaoComoLida(id: string): Promise<Notificacao> {
  const { data } = await api.put<Notificacao>(`/notificacoes/${id}/lida`)
  return data
}
