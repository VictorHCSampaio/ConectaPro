import { Navigate, Route, Routes } from 'react-router-dom'
import { RequireAdmin } from '@/components/auth/RequireAdmin'
import { RequireAuth } from '@/components/auth/RequireAuth'
import { AdminMateriasPage } from '@/pages/AdminMateriasPage'
import { AuthPage } from '@/pages/AuthPage'
import { LandingPage } from '@/pages/LandingPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { SearchTeachersPage } from '@/pages/SearchTeachersPage'
import { TeacherProfilePage } from '@/pages/TeacherProfilePage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/professores" element={<SearchTeachersPage />} />
      <Route path="/professores/:id" element={<TeacherProfilePage />} />
      <Route path="/login" element={<AuthPage />} />
      <Route path="/register" element={<AuthPage />} />
      <Route
        path="/profile/edit"
        element={
          <RequireAuth>
            <ProfilePage />
          </RequireAuth>
        }
      />
      <Route
        path="/admin/materias"
        element={
          <RequireAdmin>
            <AdminMateriasPage />
          </RequireAdmin>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
