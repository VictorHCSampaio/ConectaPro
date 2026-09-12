import { api } from '@/lib/api'
import type { TeacherProfilePayload } from '@/types/teacher-profile'

/** Salva (cria ou atualiza) o perfil do professor logado. */
export async function salvarPerfilProfessor(payload: TeacherProfilePayload) {
  const { data } = await api.put<TeacherProfilePayload>('/professores/me', payload)
  return data
}

/** Busca o perfil ja salvo. Retorna null quando o professor ainda nao configurou. */
export async function buscarPerfilProfessor(): Promise<TeacherProfilePayload | null> {
  try {
    const { data } = await api.get<TeacherProfilePayload>('/professores/me')
    return data
  } catch {
    return null
  }
}
