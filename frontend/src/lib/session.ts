import { getAccessToken } from '@/lib/api'

export function idUsuarioLogado(): string | null {
  const token = getAccessToken()
  if (!token) return null

  const payload = token.split('.')[1]
  if (!payload) return null

  try {
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=')
    const dados = JSON.parse(atob(padded)) as { sub?: string }
    return dados.sub ?? null
  } catch {
    return null
  }
}
