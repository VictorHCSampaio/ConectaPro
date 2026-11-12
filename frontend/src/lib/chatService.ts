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
  dataEnvio: string
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
