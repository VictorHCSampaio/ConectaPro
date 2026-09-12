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
}

export type TotpSetupResponse = {
  secret: string
  qrUri: string
}

export type LoginRequestPayload = {
  email: string
  senha: string
}

export type MensagemAutenticacaoResponse = {
  message: string
  isAdmin: boolean
}

export type AuthUser = {
  name: string
  email: string
  role: UserRole | null
  isAdmin: boolean
}
