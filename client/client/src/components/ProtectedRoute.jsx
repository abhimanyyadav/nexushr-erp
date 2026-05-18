import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

const ProtectedRoute = ({ children, role }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:8080/api/auth/me", {
      credentials: "include",
    })
      .then(res => res.json())
      .then(data => {
        setUser(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading...</p>;

  // ❌ Not logged in
  if (!user) {
    return <Navigate to="/login" />;
  }

  // ❌ Wrong role
  if (role) {
    if (Array.isArray(role)) {
      if (!role.includes(user.role)) return <Navigate to="/dashboard" />;
    } else {
      if (user.role !== role) return <Navigate to="/dashboard" />;
    }
  }

  return children;
};

export default ProtectedRoute;