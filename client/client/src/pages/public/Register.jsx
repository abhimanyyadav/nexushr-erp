import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Register.css";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [profilePic, setProfilePic] = useState(null);

  const [preview, setPreview] = useState(null);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /* Handle Image Upload */
  const handleImage = (e) => {
    const file = e.target.files[0];

    if (file) {
      setProfilePic(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  /* Submit */
  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      // ✅ IMPORTANT: Use FormData for file upload
      const formData = new FormData();

      formData.append("name", name);
      formData.append("email", email);
      formData.append("password", password);

      if (profilePic) {
        formData.append("profilePic", profilePic);
      }

      const res = await fetch(
        (window.API_BASE_URL || (window.API_BASE_URL || "http://localhost:8080")) + "/api/auth/register",
        {
          method: "POST",
          body: formData, // ❌ DO NOT use JSON here
          credentials: "include",
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Something went wrong");
        setLoading(false);
      } else {
        alert("Registration Successful! Now please login.");
        navigate("/login");
      }
    } catch (err) {
      setError(
        "Server is not responding. Please check your connection."
      );
      setLoading(false);
    }

    setLoading(false);
  };

  return (
    <div className="register-page">
      {/* Glowing Floating Ambient Spheres */}
      <div className="floating-spheres">
        <div className="sphere sphere-1"></div>
        <div className="sphere sphere-2"></div>
        <div className="sphere sphere-3"></div>
      </div>

      {/* Back */}
      <Link to="/" className="back-home">
        ← Back to Home
      </Link>

      {/* Card */}
      <div className="register-card">
        {/* Logo */}
        <div className="register-logo">
          <h2>NexusHR ERP</h2>
        </div>

        <h3>Create an account</h3>

        {/* Profile Upload */}
        <div className="profile-upload">
          <label htmlFor="profilePic">
            <div className="profile-circle">
              {preview ? (
                <img src={preview} alt="preview" />
              ) : (
                <span>👤</span>
              )}
            </div>
          </label>

          <input
            type="file"
            id="profilePic"
            accept="image/*"
            onChange={handleImage}
            hidden
          />

          <p>Upload profile picture</p>
        </div>

        {/* Form */}
        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <p className="error">{error}</p>}

          <label>Full Name</label>
          <input
            type="text"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <label>Work Email</label>
          <input
            type="email"
            placeholder="name@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <small>
            Must be at least 8 characters long with a mix of letters and numbers.
          </small>

          <button
            type="submit"
            disabled={loading}
            className="register-btn"
          >
            {loading ? "Registering..." : "Create Account"}
          </button>
        </form>

        <p className="login-link">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;