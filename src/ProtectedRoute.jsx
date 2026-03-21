import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "./supabase";

function ProtectedRoute({ children }) {
  const [session, setSession] = useState(undefined);

  useEffect(() => {
    let mounted = true;

    const loadSession = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error("Error getting session:", error);
      }

      if (mounted) {
        setSession(session);
      }
    };

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setSession(session);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (session === undefined) {
    return <p style={{ padding: "20px" }}>Loading...</p>;
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;