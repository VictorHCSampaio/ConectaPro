import { api } from '@/lib/api'
import type { Materia, NovaMateriaPayload } from '@/types/materia'

export async function listarMaterias(): Promise<Materia[]> {
  const { data } = await api.get<Materia[]>('/materias')
  return data
}

export async function cadastrarMateria(payload: NovaMateriaPayload) {
  const { data } = await api.post<string>('/materias', payload)
  return data
}
