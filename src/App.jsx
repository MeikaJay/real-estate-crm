import { Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import LeadFormPage from "./LeadFormPage";
import DashboardPage from "./DashboardPage";
import LoginPage from "./LoginPage";
import ResetPasswordPage from "./ResetPasswordPage";
import ProtectedRoute from "./ProtectedRoute";

function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <Routes>
      <Route path="/" element={<LeadFormPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute session={session}>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;