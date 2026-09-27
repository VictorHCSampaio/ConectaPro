import { useAuth } from '@/hooks/useAuth'
import { StudentProfilePage } from '@/pages/StudentProfilePage'
import { TeacherProfileConfigPage } from '@/pages/TeacherProfileConfigPage'

export function ProfilePage() {
  const { user } = useAuth()

  return user?.role === 'PROFESSOR' ? <TeacherProfileConfigPage /> : <StudentProfilePage />
}
