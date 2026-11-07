import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { getAccessToken, setAccessToken, setUnauthorizedHandler } from '@/lib/api'
import { getUsuarioAutenticado, logoutUsuario } from '@/lib/authService'
import type { AuthUser } from '@/types/auth'

type AuthContextValue = {
  user: AuthUser | null
  isAuthenticated: boolean
  signIn: (user: AuthUser) => void
  signOut: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)

  useEffect(() => {
    if (getAccessToken()) {
      getUsuarioAutenticado()
        .then((data) =>
          setUser({
            name: data.nomeCompleto,
            email: '',
            role: data.tipo,
            isAdmin: data.isAdmin,
          }),
        )
        .catch(() => {
          setAccessToken(null)
          setUser(null)
        })
    }
  }, [])

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setAccessToken(null)
      setUser(null)
    })
    return () => setUnauthorizedHandler(null)
  }, [])

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
