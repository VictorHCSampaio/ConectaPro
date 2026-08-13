import type { LoginFormValues, RegisterFormValues } from '@/types/auth'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateEmail(email: string) {
  if (!email.trim()) return 'Informe seu e-mail'
  if (!EMAIL_PATTERN.test(email)) return 'Informe um e-mail válido'
  return undefined
}

export function validatePassword(password: string) {
  if (!password) return 'Informe sua senha'
  if (password.length < 8) return 'A senha precisa ter no mínimo 8 caracteres'
  return undefined
}

export function validateLoginForm(values: LoginFormValues) {
  const errors: Partial<Record<keyof LoginFormValues, string>> = {}
  const emailError = validateEmail(values.email)
  if (emailError) errors.email = emailError
  if (!values.password) errors.password = 'Informe sua senha'
  return errors
}

export function validateRegisterForm(values: RegisterFormValues) {
  const errors: Partial<Record<keyof RegisterFormValues, string>> = {}

  if (!values.fullName.trim()) {
    errors.fullName = 'Informe seu nome completo'
  } else if (values.fullName.trim().length < 3) {
    errors.fullName = 'O nome precisa ter no mínimo 3 caracteres'
  }

  const emailError = validateEmail(values.email)
  if (emailError) errors.email = emailError

  const passwordError = validatePassword(values.password)
  if (passwordError) errors.password = passwordError

  if (!values.confirmPassword) {
    errors.confirmPassword = 'Confirme sua senha'
  } else if (values.confirmPassword !== values.password) {
    errors.confirmPassword = 'As senhas não coincidem'
  }

  if (!values.acceptTerms) {
    errors.acceptTerms = 'Você precisa aceitar os termos para continuar'
  }

  return errors
}
