import { api } from '@/lib/api'
import type { Materia, NovaMateriaPayload } from '@/types/materia'

export async function listarMaterias(): Promise<Materia[]> {
  const { data } = await api.get<Materia[]>('/materia/listall')
  return data
}

export async function cadastrarMateria(payload: NovaMateriaPayload) {
  const { data } = await api.post<string>('/materia/add', payload)
  return data
}
