import { api } from '@/lib/api'

export type ProfessorPendente = {
  usuarioId: string
  nomeCompleto: string
  email: string
  certificadoEnviado: boolean
  certificadoNome: string | null
  justificativaSemCertificado: string | null
  cadastradoEm: string
}

export async function listarProfessoresPendentes(): Promise<ProfessorPendente[]> {
  const { data } = await api.get<ProfessorPendente[]>('/admin/professores/pendentes')
  return data
}

export async function obterUrlCertificado(usuarioId: string): Promise<string> {
  const { data } = await api.get<{ url: string }>(`/admin/professores/${usuarioId}/certificado`)
  return data.url
}

export async function aprovarProfessor(usuarioId: string): Promise<void> {
  await api.post(`/admin/professores/${usuarioId}/aprovar`)
}

export async function rejeitarProfessor(usuarioId: string, motivo: string): Promise<void> {
  await api.post(`/admin/professores/${usuarioId}/rejeitar`, { motivo })
}
