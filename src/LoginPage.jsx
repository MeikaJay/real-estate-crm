import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import { useNavigate, Link } from "react-router-dom";
import "./App.css";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error("Error checking session:", error);
      }

      if (!mounted) return;

      if (session) {
        navigate("/dashboard", { replace: true });
        return;
      }

      setCheckingSession(false);
    };

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;

      if (session) {
        navigate("/dashboard", { replace: true });
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      console.error("Login error:", error);
      alert("Invalid login credentials");
      return;
    }

    navigate("/dashboard", { replace: true });
  };

  const handleForgotPassword = async () => {
    if (!email) {
      alert("Enter your email first.");
      return;
    }

    setSendingReset(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setSendingReset(false);

    if (error) {
      console.error("Reset password error:", error);
      alert(error.message);
      return;
    }

    alert("Password reset email sent. Check your inbox.");
  };

  if (checkingSession) {
    return (
      <div className="page">
        <div className="overlay">
          <div className="card">
            <p className="dashboard-message">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="overlay">
        <div className="card">
          <p className="eyebrow">Agent Access</p>
          <h1 style={{ color: "#000" }}>Login to Dashboard</h1>
          <p className="intro">
            Enter your credentials to access your lead dashboard.
          </p>

          <form onSubmit={handleLogin}>
            <div className="field">
              <label>Email</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <div className="field">
              <label>Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>

            <button type="submit" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="agent-login-wrap">
            <button
              type="button"
              className="agent-login-link"
              onClick={handleForgotPassword}
              disabled={sendingReset}
            >
              {sendingReset ? "Sending..." : "Forgot Password?"}
            </button>
          </div>

          <div className="agent-login-wrap">
            <Link to="/" className="agent-login-link">
              Back to Home Search
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;