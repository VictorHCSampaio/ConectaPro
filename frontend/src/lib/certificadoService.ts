import { api } from '@/lib/api'
import type { StatusConta } from '@/types/auth'

export type StatusCadastro = {
  status: StatusConta
  certificadoEnviado: boolean
  certificadoNome: string | null
  justificativaSemCertificado: string | null
  motivoRejeicao: string | null
  solicitarConversaAdmin: boolean
  comprovacaoPendente: boolean
}

export async function enviarCertificado(file: File): Promise<void> {
  const formData = new FormData()
  formData.append('file', file)
  await api.post('/professores/me/certificado', formData)
}

export const enviarCertificadoProfessor = enviarCertificado

export async function enviarJustificativa(justificativa: string): Promise<void> {
  await api.post('/professores/me/justificativa', { justificativa })
}

export function enviarJustificativaSemCertificado(texto: string): Promise<void> {
  return enviarJustificativa(texto)
}

export async function obterStatusCadastro(): Promise<StatusCadastro> {
  const { data } = await api.get<StatusCadastro>('/professores/me/status')
  return data
}

export async function obterCertificadoPublico(professorId: string): Promise<{ url: string; nome: string }> {
  const { data } = await api.get<{ url: string; nome: string }>(`/professores/${professorId}/certificado`)
  return data
}

export async function reenviarParaAnalise(): Promise<void> {
  await api.post('/professores/me/reenviar-analise')
}
