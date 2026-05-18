import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import "./Login.css";

function Login() {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {

    e.preventDefault();

    setLoading(true);
    setError("");

    try {

      const res = await fetch(
        "http://localhost:8080/api/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
          credentials: "include"
        }
      );

      const data = await res.json();

      if (!res.ok) {

        setError(
          data.message || "Invalid Email or Password"
        );

      } else {

        const role = data?.user?.role;

        if (role === "admin") {

          navigate("/admin");

        } else {

          navigate("/dashboard");

        }

      }

    } catch (err) {

      setError(
        "Server down hai! Baad mein try karein."
      );

    } finally {

      setLoading(false);

    }

  };

  return (
    <div className="login-page">
      {/* Glowing Floating Ambient Spheres */}
      <div className="floating-spheres">
        <div className="sphere sphere-1"></div>
        <div className="sphere sphere-2"></div>
        <div className="sphere sphere-3"></div>
      </div>

      <div className="login-card">
        <div className="brand-header">
          <span className="brand-badge">NexusHR ERP</span>
        </div>
        <h2>Welcome Back</h2>

        {/* <p className="subtitle">
          Sign in to NexusLeave ERP to manage your work-life balance.
        </p> */}

        <form onSubmit={handleLogin}>

          {error && (
            <p className="error">
              {error}
            </p>
          )}

          {/* Email */}

          <label>Company Email</label>

          <input
            type="email"
            placeholder="name@company.com"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            required
          />

          {/* Password */}

          <div className="password-row">

            <label>Password</label>

            <span
              className="forgot-link"
              onClick={() =>
                navigate("/forgot-password")
              }
            >
              Forgot password?
            </span>

          </div>

          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            required
          />

          {/* Button */}

          <button
            type="submit"
            disabled={loading}
            className="login-btn"
          >
            {loading
              ? "Signing In..."
              : "Sign In"}
          </button>

        </form>

        <p className="register-link">

          Don’t have an account?

          <Link to="/register">
            Register Now
          </Link>

        </p>

      </div>

    </div>

  );

}

export default Login;