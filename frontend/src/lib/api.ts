import axios from 'axios'

const LAST_REQUEST_KEY = 'conectapro:lastRequest'
const SESSION_TIMEOUT_MS = Number(import.meta.env.VITE_SESSION_TIMEOUT_MS ?? 5 * 60 * 1000)
const IGNORED_UNAUTHORIZED_URLS = ['/auth/login', '/auth/logout']

let onUnauthorized: (() => void) | null = null

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api',
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  try {
    window.localStorage.setItem(LAST_REQUEST_KEY, String(Date.now()))
  } catch {
    return config
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

export function setUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler
}

export function isSessionExpired() {
  try {
    const raw = window.localStorage.getItem(LAST_REQUEST_KEY)
    return raw !== null && Date.now() - Number(raw) >= SESSION_TIMEOUT_MS
  } catch {
    return false
  }
}

export function extractErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string; detail?: string } | undefined
    if (data?.message) return data.message
    if (data?.detail) return data.detail
  }
  return fallback
}
