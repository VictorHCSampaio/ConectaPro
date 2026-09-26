import { api } from '@/lib/api'
import type { EnderecoCep } from '@/types/teacher-profile'

export type EnderecoPayload = {
  cep: string
  street: string
  neighborhood: string
  city: string
  state: string
}

export async function buscarEnderecoPorCep(cep: string): Promise<EnderecoCep> {
  const { data } = await api.get<EnderecoCep>(`/enderecos/${cep}`)
  return data
}

export async function buscarMeuEndereco(): Promise<EnderecoPayload | null> {
  try {
    const { data } = await api.get<EnderecoPayload>('/enderecos/me')
    return data
  } catch {
    return null
  }
}

export async function salvarMeuEndereco(payload: EnderecoPayload): Promise<EnderecoPayload> {
  const { data } = await api.put<EnderecoPayload>('/enderecos/me', payload)
  return data
}
