import { api } from '@/lib/api'

export const MOTIVOS_DENUNCIA = [
  { value: 'ASSEDIO', label: 'Assédio' },
  { value: 'FRAUDE', label: 'Fraude' },
  { value: 'CONTEUDO_INADEQUADO', label: 'Conteúdo inadequado' },
  { value: 'OUTROS', label: 'Outros' },
] as const

export type MotivoDenuncia = (typeof MOTIVOS_DENUNCIA)[number]['value']

export type StatusDenuncia =
  | 'PENDENTE'
  | 'EM_ANALISE'
  | 'RESOLVIDA'
  | 'ARQUIVADA'
  | 'ENCAMINHADA'

export type PapelUsuario = 'ALUNO' | 'PROFESSOR'

export type DenunciaRegistro = {
  id: string
  denunciante: {
    id: string
    nome: string
    avatarUrl: string | null
  }
  denunciadoId: string
  denunciadoNome: string | null
  denunciadoAvatar: string | null
  motivo: MotivoDenuncia
  descricao: string
  status: StatusDenuncia
  dataCriacao: string
  denunciadoTipo?: PapelUsuario | null
  notasModeracao?: string | null
}

export const TEXTO_RECOMENDACAO_BO =
  'Devido às circunstâncias, recomendamos que você abra um Boletim de Ocorrência. Cooperaremos fornecendo os dados do usuário acusado; após isso, não está mais em nossa alçada.'

export const TIMEOUTS = [
  { horas: 24, label: '24 horas' },
  { horas: 168, label: '7 dias' },
  { horas: 720, label: '30 dias' },
] as const

export async function registrarDenuncia(
  denunciadoId: string,
  motivo: MotivoDenuncia,
  descricao: string,
) {
  await api.post('/denuncias', { denunciadoId, motivo, descricao })
}

export async function listarDenuncias(): Promise<DenunciaRegistro[]> {
  const { data } = await api.get<DenunciaRegistro[]>('/denuncias')
  return data
}

export async function listarDenunciasProfessores(): Promise<DenunciaRegistro[]> {
  const { data } = await api.get<DenunciaRegistro[]>('/denuncias/professores')
  return data
}

export async function listarDenunciasAlunos(): Promise<DenunciaRegistro[]> {
  const { data } = await api.get<DenunciaRegistro[]>('/denuncias/alunos')
  return data
}

export async function banirUsuario(usuarioId: string, motivo: string) {
  await api.post(`/admin/usuarios/${usuarioId}/ban`, { motivo })
}

export async function desbanirUsuario(usuarioId: string) {
  await api.post(`/admin/usuarios/${usuarioId}/unban`)
}

export async function aplicarTimeout(usuarioId: string, horas: number) {
  await api.post(`/admin/usuarios/${usuarioId}/timeout`, { horas })
}

export async function recomendarBoletim(denunciaId: string): Promise<DenunciaRegistro> {
  const { data } = await api.post<DenunciaRegistro>(`/admin/denuncias/${denunciaId}/recomendar-bo`)
  return data
}

export async function atualizarStatusDenuncia(
  denunciaId: string,
  status: StatusDenuncia,
  notasModeracao: string,
): Promise<DenunciaRegistro> {
  const { data } = await api.patch<DenunciaRegistro>(`/admin/denuncias/${denunciaId}/status`, {
    status,
    notasModeracao,
  })
  return data
}
