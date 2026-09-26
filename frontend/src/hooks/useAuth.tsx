import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { isSessionExpired, setUnauthorizedHandler } from '@/lib/api'
import { getSessaoUsuario, logoutUsuario } from '@/lib/authService'
import type { AuthUser } from '@/types/auth'

const STORAGE_KEY = 'conectapro:user'
const SESSION_CHECK_INTERVAL_MS = 5000

type AuthContextValue = {
  user: AuthUser | null
  isAuthenticated: boolean
  signIn: (user: AuthUser) => void
  signOut: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function readStoredUser(): AuthUser | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as AuthUser) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() =>
    isSessionExpired() ? null : readStoredUser(),
  )
  const initialUser = useRef(user)

  useEffect(() => {
    if (initialUser.current) {
      getSessaoUsuario().catch(() => undefined)
    }
  }, [])

  useEffect(() => {
    setUnauthorizedHandler(() => setUser(null))
    return () => setUnauthorizedHandler(null)
  }, [])

  useEffect(() => {
    if (!user) return
    const interval = window.setInterval(() => {
      if (isSessionExpired()) {
        setUser(null)
      }
    }, SESSION_CHECK_INTERVAL_MS)
    return () => window.clearInterval(interval)
  }, [user])

  useEffect(() => {
    try {
      if (user) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
      } else {
        window.localStorage.removeItem(STORAGE_KEY)
      }
    } catch {
      return
    }
  }, [user])

  const signIn = useCallback((nextUser: AuthUser) => {
    setUser(nextUser)
  }, [])

  const signOut = useCallback(() => {
    setUser(null)
    logoutUsuario().catch(() => undefined)
  }, [])

  const value = useMemo(
    () => ({ user, isAuthenticated: user !== null, signIn, signOut }),
    [user, signIn, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth precisa ser usado dentro de AuthProvider')
  }
  return context
}
