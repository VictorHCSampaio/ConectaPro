import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import type { UserRole } from '@/types/auth'

type RequireRoleProps = {
  role: UserRole
  children: ReactNode
}

export function RequireRole({ role, children }: RequireRoleProps) {
  const { user, isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (user?.role !== role) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
