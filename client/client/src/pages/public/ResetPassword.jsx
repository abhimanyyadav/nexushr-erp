import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"

function ResetPassword() {

  const { token } = useParams()
  const navigate = useNavigate()

  const [password, setPassword] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()

    const res = await fetch((window.API_BASE_URL || (window.API_BASE_URL || "http://localhost:8080")) + `/api/auth/reset-password/${token}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ password })
    })

    const data = await res.json()
    alert(data.message)

    if (res.ok) {
      navigate("/login")
    }
  }

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Reset Password</h2>

        <input
          type="password"
          placeholder="Enter new password"
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit">Update Password</button>
      </form>
    </div>
  )
}

export default ResetPassword