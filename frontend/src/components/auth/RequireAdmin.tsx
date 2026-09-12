import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

type RequireAdminProps = {
  children: ReactNode
}

export function RequireAdmin({ children }: RequireAdminProps) {
  const { user, isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (!user?.isAdmin) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
