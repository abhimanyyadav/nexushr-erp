import { useState } from "react"
import "./ForgotPassword.css"
function ForgotPassword() {

  const [email, setEmail] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()

    const res = await fetch("http://localhost:8080/api/auth/forgot-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email })
    })

    const data = await res.json()
    alert(data.message)
  }

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Forgot Password</h2>

        <input
          type="email"
          placeholder="Enter your email"
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <button type="submit">Send Reset Link</button>
      </form>
    </div>
  )
}

export default ForgotPassword