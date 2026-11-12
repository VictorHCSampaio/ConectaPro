import { api, setAccessToken } from '@/lib/api'
import type {
  LoginRequestPayload,
  LoginResponse,
  MensagemAutenticacaoResponse,
  RegisterRequestPayload,
  TotpActivatePayload,
  TotpSetupResponse,
  TotpStatusResponse,
  TotpVerifyPayload,
} from '@/types/auth'

let preAuthToken: string | null = null

export async function registerUsuario(payload: RegisterRequestPayload) {
  const { data } = await api.post<TotpSetupResponse>('/auth/register', payload)
  return data
}

export async function loginUsuario(payload: LoginRequestPayload) {
  const { data } = await api.post<LoginResponse>('/auth/login', payload)

  if (data.status === 'TOTP_REQUIRED' && data.token) {
    preAuthToken = data.token
  } else if (data.status === 'AUTHENTICATED' && data.token) {
    setAccessToken(data.token)
    preAuthToken = null
  }

  return data
}

export async function verificarTotp(payload: TotpVerifyPayload) {
  const { data } = await api.post<LoginResponse>('/auth/2fa/verify', payload, {
    headers: preAuthToken ? { Authorization: `Bearer ${preAuthToken}` } : {},
  })

  if (data.status === 'AUTHENTICATED' && data.token) {
    setAccessToken(data.token)
    preAuthToken = null
  }

  return data
}

export async function obterConfigTotp() {
  const { data } = await api.post<TotpSetupResponse>('/auth/2fa/setup')
  return data
}

export async function ativarTotp(payload: TotpActivatePayload) {
  const { data } = await api.post<{ message: string }>('/auth/2fa/activate', payload)
  return data
}

export async function obterStatusTotp() {
  const { data } = await api.get<TotpStatusResponse>('/auth/2fa/status')
  return data
}

export async function getUsuarioAutenticado() {
  const { data } = await api.get<MensagemAutenticacaoResponse>('/auth/me')
  return data
}

export async function solicitarResetSenha(email: string) {
  const { data } = await api.post<{ message: string }>('/auth/password-reset/request', { email })
  return data
}

export async function confirmarResetSenha(token: string, novaSenha: string) {
  const { data } = await api.post<{ message: string }>('/auth/password-reset/confirm', {
    token,
    novaSenha,
  })
  return data
}

export async function logoutUsuario() {
  await api.post('/auth/logout')
  setAccessToken(null)
}
