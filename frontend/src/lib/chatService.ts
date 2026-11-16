import { api } from '@/lib/api'

type EnviarMensagemPayload = {
  destinatarioId: string
  conteudo: string
  idempotencyKey: string
}

export type ParticipanteChat = {
  id: string
  nome: string
  avatarUrl: string | null
}

export type MensagemChat = {
  id: string
  remetente: ParticipanteChat
  destinatario: ParticipanteChat
  conteudo: string
  lida: boolean
  entregue: boolean
  dataEnvio: string
}

export type ConversaResumo = {
  participante: ParticipanteChat
  ultimaMensagem: string
  dataEnvio: string
  enviadaPorMim: boolean
  naoLidas: number
}

export async function listarConversas(): Promise<ConversaResumo[]> {
  const { data } = await api.get<ConversaResumo[]>('/chat/conversas')
  return data
}

export async function listarConversa(outroUsuarioId: string): Promise<MensagemChat[]> {
  const { data } = await api.get<MensagemChat[]>(`/chat/mensagens/${outroUsuarioId}`)
  return data
}

export async function enviarMensagem({
  destinatarioId,
  conteudo,
  idempotencyKey,
}: EnviarMensagemPayload): Promise<MensagemChat> {
  const { data } = await api.post<MensagemChat>('/chat/mensagens', {
    destinatarioId,
    conteudo,
    idempotencyKey,
  })
  return data
}
