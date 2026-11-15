import { api } from '@/lib/api'

export const MOTIVOS_DENUNCIA = [
  { value: 'ASSEDIO', label: 'Assédio' },
  { value: 'FRAUDE', label: 'Fraude' },
  { value: 'CONTEUDO_INADEQUADO', label: 'Conteúdo inadequado' },
  { value: 'OUTROS', label: 'Outros' },
] as const

export type MotivoDenuncia = (typeof MOTIVOS_DENUNCIA)[number]['value']

export type StatusDenuncia = 'PENDENTE' | 'EM_ANALISE' | 'RESOLVIDA'

export type DenunciaRegistro = {
  id: string
  denunciante: {
    id: string
    nome: string
    avatarUrl: string | null
  }
  professorId: string
  professorNome: string | null
  professorAvatar: string | null
  motivo: MotivoDenuncia
  descricao: string
  status: StatusDenuncia
  dataCriacao: string
}

export async function registrarDenuncia(
  professorId: string,
  motivo: MotivoDenuncia,
  descricao: string,
) {
  await api.post('/denuncias', { professorId, motivo, descricao })
}

export async function listarDenuncias(): Promise<DenunciaRegistro[]> {
  const { data } = await api.get<DenunciaRegistro[]>('/denuncias')
  return data
}
