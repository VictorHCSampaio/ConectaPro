import { api } from '@/lib/api'
import type { TeacherProfilePayload } from '@/types/teacher-profile'

export async function salvarPerfilProfessor(payload: TeacherProfilePayload) {
  const { data } = await api.put<TeacherProfilePayload>('/professores/me', payload)
  return data
}

export async function buscarPerfilProfessor(): Promise<TeacherProfilePayload | null> {
  try {
    const { data } = await api.get<TeacherProfilePayload>('/professores/me')
    return data
  } catch {
    return null
  }
}
