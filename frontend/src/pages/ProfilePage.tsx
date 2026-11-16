import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { ehContaAdmin } from '@/types/auth'
import { StudentProfilePage } from '@/pages/StudentProfilePage'
import { TeacherProfileConfigPage } from '@/pages/TeacherProfileConfigPage'

export function ProfilePage() {
  const { user } = useAuth()
  const ehAdmin = ehContaAdmin(user)
  const ehProfessor = user?.role === 'PROFESSOR' && !ehAdmin

  if (
    ehProfessor &&
    (user?.statusConta === 'EM_ANALISE' || user?.statusConta === 'REJEITADO')
  ) {
    return <Navigate to="/cadastro-status" replace />
  }

  if (ehProfessor && user?.statusConta === 'PENDENTE_PAGAMENTO') {
    return <Navigate to="/pagamento" replace />
  }

  return ehAdmin || ehProfessor ? <TeacherProfileConfigPage /> : <StudentProfilePage />
}
