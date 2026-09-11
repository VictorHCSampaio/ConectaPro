import { api } from '@/lib/api'
import type {
  LoginRequestPayload,
  MensagemAutenticacaoResponse,
  RegisterRequestPayload,
  TotpSetupResponse,
} from '@/types/auth'

export async function registerUsuario(payload: RegisterRequestPayload) {
  const { data } = await api.post<TotpSetupResponse>('/auth/register', payload)
  return data
}

export async function loginUsuario(payload: LoginRequestPayload) {
  const { data } = await api.post<MensagemAutenticacaoResponse>('/auth/login', payload)
  return data
}
