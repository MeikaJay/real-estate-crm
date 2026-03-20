import { useState } from "react";
import { supabase } from "./supabase";
import { useNavigate, Link } from "react-router-dom";
import "./App.css";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      alert("Invalid login credentials");
      return;
    }

    navigate("/dashboard");
  };

  const handleForgotPassword = async () => {
    if (!email) {
      alert("Enter your email first.");
      return;
    }

    setSendingReset(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "http://localhost:5174/reset-password",
    });

    setSendingReset(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Password reset email sent. Check your inbox.");
  };

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