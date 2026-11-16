import { api } from '@/lib/api'

export type Avaliacao = {
  id: string
  avaliadorNome: string
  avaliadorAvatarUrl: string | null
  nota: number
  comentario: string | null
  criadoEm: string
}

export type AvaliacaoPayload = {
  avaliadoId: string
  agendamentoId: string
  nota: number
  comentario?: string
}

export async function enviarAvaliacao(payload: AvaliacaoPayload): Promise<Avaliacao> {
  const { data } = await api.post<Avaliacao>('/avaliacoes', payload)
  return data
}

export async function listarAvaliacoes(usuarioId: string): Promise<Avaliacao[]> {
  const { data } = await api.get<Avaliacao[]>(`/avaliacoes/usuario/${usuarioId}`)
  return data
}

export async function listarAvaliacoesAgendamento(agendamentoId: string): Promise<Avaliacao[]> {
  const { data } = await api.get<Avaliacao[]>(`/avaliacoes/agendamento/${agendamentoId}`)
  return data
}
