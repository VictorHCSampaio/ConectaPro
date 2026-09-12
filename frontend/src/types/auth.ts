export type UserRole = 'ALUNO' | 'PROFESSOR'

export type LoginFormValues = {
  email: string
  password: string
  rememberMe: boolean
}

export type RegisterFormValues = {
  role: UserRole | null
  fullName: string
  email: string
  password: string
  confirmPassword: string
  acceptTerms: boolean
}

export type RegisterRequestPayload = {
  nome: string
  email: string
  password: string
  role: UserRole
}

export type TotpSetupResponse = {
  secret: string
  qrUri: string
}

export type LoginRequestPayload = {
  email: string
  senha: string
}

export type UsuarioAutenticadoResponse = {
  id: string
  nomeCompleto: string
  email: string
  tipo: UserRole
}

export type MensagemAutenticacaoResponse = {
  message: string
  usuario: UsuarioAutenticadoResponse
}

export type AuthUser = {
  id: string
  name: string
  email: string
  role: UserRole | null
}
