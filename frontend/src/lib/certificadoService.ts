import { api } from '@/lib/api'
import type { StatusConta } from '@/types/auth'

export type StatusCadastro = {
  status: StatusConta
  certificadoEnviado: boolean
  certificadoNome: string | null
  justificativaSemCertificado: string | null
  motivoRejeicao: string | null
}

export async function enviarCertificado(file: File): Promise<void> {
  const formData = new FormData()
  formData.append('file', file)
  await api.post('/professores/me/certificado', formData)
}

export async function enviarJustificativa(justificativa: string): Promise<void> {
  await api.post('/professores/me/justificativa', { justificativa })
}

export async function obterStatusCadastro(): Promise<StatusCadastro> {
  const { data } = await api.get<StatusCadastro>('/professores/me/status')
  return data
}

export async function reenviarParaAnalise(): Promise<void> {
  await api.post('/professores/me/reenviar-analise')
}
