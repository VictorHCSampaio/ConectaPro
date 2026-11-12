import { api } from '@/lib/api'

export const MOTIVOS_DENUNCIA = [
  { value: 'ASSEDIO', label: 'Assédio' },
  { value: 'FRAUDE', label: 'Fraude' },
  { value: 'CONTEUDO_INADEQUADO', label: 'Conteúdo inadequado' },
  { value: 'OUTROS', label: 'Outros' },
] as const

export type MotivoDenuncia = (typeof MOTIVOS_DENUNCIA)[number]['value']

export async function registrarDenuncia(
  professorId: string,
  motivo: MotivoDenuncia,
  descricao: string,
) {
  await api.post('/denuncias', { professorId, motivo, descricao })
}
