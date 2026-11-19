import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { getAccessToken, setAccessToken, setUnauthorizedHandler } from '@/lib/api'
import { getUsuarioAutenticado, logoutUsuario } from '@/lib/authService'
import { limparCacheDashboard } from '@/lib/dashboardService'
import { limparCachePerfil } from '@/lib/perfilCache'
import { normalizarAuthUser, type AuthUser } from '@/types/auth'

type AuthContextValue = {
  user: AuthUser | null
  isAuthenticated: boolean
  signIn: (user: AuthUser) => void
  updateUser: (patch: Partial<AuthUser>) => void
  signOut: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)

  useEffect(() => {
    if (getAccessToken()) {
      getUsuarioAutenticado()
        .then((data) =>
          setUser(
            normalizarAuthUser({
              name: data.nomeCompleto,
              email: '',
              role: data.tipo,
              isAdmin: data.isAdmin,
              statusConta: data.statusConta,
              avatarUrl: data.avatarUrl ?? null,
            }),
          ),
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
      limparCachePerfil()
      limparCacheDashboard()
    })
    return () => setUnauthorizedHandler(null)
  }, [])

  const signIn = useCallback((nextUser: AuthUser) => {
    setUser(normalizarAuthUser(nextUser))
  }, [])

  const updateUser = useCallback((patch: Partial<AuthUser>) => {
    setUser((atual) => (atual ? normalizarAuthUser({ ...atual, ...patch }) : atual))
  }, [])

  const signOut = useCallback(() => {
    setUser(null)
    limparCachePerfil()
    limparCacheDashboard()
    logoutUsuario().catch(() => undefined)
  }, [])

  const value = useMemo(
    () => ({ user, isAuthenticated: user !== null, signIn, updateUser, signOut }),
    [user, signIn, updateUser, signOut],
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
