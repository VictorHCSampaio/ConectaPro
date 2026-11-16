import { api } from '@/lib/api'

export type PerfilAluno = {
  id: string
  nomeCompleto: string
  email: string
  tipo: string
  biografia: string | null
  avatarUrl: string | null
  cidade: string | null
  bairro: string | null
  membroDesde: string
  totalAulasAgendadas: number
  rating: number
  totalAvaliacoes: number
}

export type PerfilAlunoPayload = {
  biografia?: string
  avatarUrl?: string
}

export async function buscarPerfilAluno(id: string): Promise<PerfilAluno> {
  const { data } = await api.get<PerfilAluno>(`/usuarios/${id}/perfil`)
  return data
}

export async function buscarMeuPerfilAluno(): Promise<PerfilAluno> {
  const { data } = await api.get<PerfilAluno>('/usuarios/me/perfil')
  return data
}

export async function salvarMeuPerfilAluno(payload: PerfilAlunoPayload): Promise<PerfilAluno> {
  const { data } = await api.put<PerfilAluno>('/usuarios/me/perfil', payload)
  return data
}
