import { Routes, Route } from "react-router-dom";
import LeadFormPage from "./LeadFormPage";
import DashboardPage from "./DashboardPage";
import LoginPage from "./LoginPage";
import ResetPasswordPage from "./ResetPasswordPage";
import ProtectedRoute from "./ProtectedRoute";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LeadFormPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;