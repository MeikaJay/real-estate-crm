import { Routes, Route } from "react-router-dom";
import LeadFormPage from "./LeadFormPage";
import DashboardPage from "./DashboardPage";
import LoginPage from "./LoginPage";
import ResetPasswordPage from "./ResetPasswordPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LeadFormPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
    </Routes>
  );
}

export default App;