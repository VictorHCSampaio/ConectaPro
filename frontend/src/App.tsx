import { Navigate, Route, Routes } from 'react-router-dom'
import { RequireAdmin } from '@/components/auth/RequireAdmin'
import { RequireAuth } from '@/components/auth/RequireAuth'
import { AdminMateriasPage } from '@/pages/AdminMateriasPage'
import { AuthPage } from '@/pages/AuthPage'
import { Dashboard } from '@/pages/Dashboard'
import { LandingPage } from '@/pages/LandingPage'
import { PagamentoPage } from '@/pages/PagamentoPage'
import { PagamentoResultadoPage } from '@/pages/PagamentoResultadoPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { ProfileViewPage } from '@/pages/ProfileViewPage'
import { SearchTeachersPage } from '@/pages/SearchTeachersPage'
import { TeacherProfilePage } from '@/pages/TeacherProfilePage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/dashboard"
        element={
          <RequireAdmin>
            <Dashboard />
          </RequireAdmin>
        }
      />
      <Route
        path="/professores"
        element={
          <RequireAuth>
            <SearchTeachersPage />
          </RequireAuth>
        }
      />
      <Route
        path="/professores/:id"
        element={
          <RequireAuth>
            <TeacherProfilePage />
          </RequireAuth>
        }
      />
      <Route path="/login" element={<AuthPage />} />
      <Route path="/register" element={<AuthPage />} />
      <Route
        path="/pagamento"
        element={
          <RequireAuth>
            <PagamentoPage />
          </RequireAuth>
        }
      />
      <Route path="/pagamento/sucesso" element={<PagamentoResultadoPage variante="sucesso" />} />
      <Route path="/pagamento/falha" element={<PagamentoResultadoPage variante="falha" />} />
      <Route path="/pagamento/pendente" element={<PagamentoResultadoPage variante="pendente" />} />
      <Route
        path="/perfil"
        element={
          <RequireAuth>
            <ProfileViewPage />
          </RequireAuth>
        }
      />
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
