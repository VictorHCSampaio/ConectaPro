import { Navigate, Route, Routes } from "react-router-dom";
import { AuthPage } from "@/pages/AuthPage";
import { LandingPage } from "@/pages/LandingPage";
import { SearchTeachersPage } from "@/pages/SearchTeachersPage";
import { TeacherProfileConfigPage } from "@/pages/TeacherProfileConfigPage";
import { TeacherProfilePage } from "@/pages/TeacherProfilePage";
import { RequireAuth } from "@/components/auth/RequireAuth";

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
            <TeacherProfileConfigPage />
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
