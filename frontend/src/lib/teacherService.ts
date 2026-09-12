import { api } from '@/lib/api'
import type { Teacher } from '@/types/teacher'

/** Professores cadastrados que ja configuraram o perfil. */
export async function listarProfessores(): Promise<Teacher[]> {
  const { data } = await api.get<Teacher[]>('/professores')
  return data
}
