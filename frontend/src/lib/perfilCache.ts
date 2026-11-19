import { getAccessToken } from '@/lib/api'
import type { EnderecoPayload } from '@/lib/enderecoService'
import type { TeacherProfilePayload } from '@/types/teacher-profile'
import type { PerfilAluno } from '@/lib/usuarioService'

export type CachePerfilAluno = {
  perfil: PerfilAluno
  endereco: EnderecoPayload | null
}

const perfisProfessor = new Map<string, TeacherProfilePayload>()
const perfisAluno = new Map<string, CachePerfilAluno>()

export function chaveUsuarioCache(): string {
  const token = getAccessToken()
  if (!token) {
    return 'anon'
  }
  const id = idDoToken(token)
  return id ?? 'anon'
}

export function lerPerfilProfessor(chave: string): TeacherProfilePayload | null {
  return perfisProfessor.get(chave) ?? null
}

export function gravarPerfilProfessor(chave: string, perfil: TeacherProfilePayload) {
  perfisProfessor.set(chave, perfil)
}

export function lerPerfilAluno(chave: string): CachePerfilAluno | null {
  return perfisAluno.get(chave) ?? null
}

export function gravarPerfilAluno(chave: string, cache: CachePerfilAluno) {
  perfisAluno.set(chave, cache)
}

export function limparCachePerfil() {
  perfisProfessor.clear()
  perfisAluno.clear()
}

function idDoToken(token: string): string | null {
  const parte = token.split('.')[1]
  if (!parte) {
    return null
  }
  try {
    const base64 = parte.replace(/-/g, '+').replace(/_/g, '/')
    const resto = base64.length % 4
    const padded = resto === 0 ? base64 : base64 + '='.repeat(4 - resto)
    const json = JSON.parse(atob(padded)) as { sub?: unknown }
    return typeof json.sub === 'string' && json.sub.length > 0 ? json.sub : null
  } catch {
    return null
  }
}
