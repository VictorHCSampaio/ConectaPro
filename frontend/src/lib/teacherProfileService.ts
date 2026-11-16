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

export async function enviarAvatarProfessor(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  const { data } = await api.post<{ avatarUrl: string }>('/professores/me/avatar', formData)
  return data.avatarUrl
}

export async function removerAvatarProfessor(): Promise<void> {
  await api.delete('/professores/me/avatar')
}
