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
