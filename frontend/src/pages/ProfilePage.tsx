import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { StudentProfilePage } from '@/pages/StudentProfilePage'
import { TeacherProfileConfigPage } from '@/pages/TeacherProfileConfigPage'

export function ProfilePage() {
  const { user } = useAuth()

  if (user?.role === 'PROFESSOR' && user.statusConta === 'PENDENTE_PAGAMENTO') {
    return <Navigate to="/pagamento" replace />
  }

  return user?.role === 'PROFESSOR' ? <TeacherProfileConfigPage /> : <StudentProfilePage />
}
