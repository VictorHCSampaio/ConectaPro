import { api } from '@/lib/api'
import type { Teacher } from '@/types/teacher'

/** Professores cadastrados que ja configuraram o perfil. */
export async function listarProfessores(): Promise<Teacher[]> {
  const { data } = await api.get<Teacher[]>('/professores')
  return data
}

/** Perfil publico de um professor. */
export async function buscarProfessor(id: string): Promise<Teacher> {
  const { data } = await api.get<Teacher>(`/professores/${id}`)
  return data
}
