import axios from 'axios'

const IGNORED_UNAUTHORIZED_URLS = ['/auth/login', '/auth/logout', '/auth/2fa/verify']

let onUnauthorized: (() => void) | null = null
let accessToken: string | null = null

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api',
})

api.interceptors.request.use((config) => {
  if (accessToken && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      const url = error.config?.url ?? ''
      if (!IGNORED_UNAUTHORIZED_URLS.some((ignored) => url.startsWith(ignored))) {
        onUnauthorized?.()
      }
    }
    return Promise.reject(error)
  },
)

export function setAccessToken(token: string | null) {
  accessToken = token
}

export function getAccessToken(): string | null {
  return accessToken
}

export function setUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler
}

export function extractErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { erro?: string; message?: string; detail?: string }
      | undefined
    if (data?.erro) return data.erro
    if (data?.message) return data.message
    if (data?.detail) return data.detail
  }
  return fallback
}
