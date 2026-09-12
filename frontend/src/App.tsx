import { Navigate, Route, Routes } from "react-router-dom";
import { RequireAdmin } from "@/components/auth/RequireAdmin";
import { RequireRole } from "@/components/auth/RequireRole";
import { AdminMateriasPage } from "@/pages/AdminMateriasPage";
import { AuthPage } from "@/pages/AuthPage";
import { LandingPage } from "@/pages/LandingPage";
import { SearchTeachersPage } from "@/pages/SearchTeachersPage";
import { TeacherProfileConfigPage } from "@/pages/TeacherProfileConfigPage";
import { TeacherProfilePage } from "@/pages/TeacherProfilePage";

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
          <RequireRole role="PROFESSOR">
            <TeacherProfileConfigPage />
          </RequireRole>
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
  );
}

export default App;
