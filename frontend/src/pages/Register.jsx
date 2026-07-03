import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", flatNumber: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function update(field) {
    return (e) => setForm({ ...form, [field]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await register(form);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-card">
      <h1>Resident sign up</h1>
      <p className="muted">Admin accounts are created separately by the society office.</p>
      <form onSubmit={handleSubmit} className="form">
        <label>
          Full name
          <input required value={form.name} onChange={update("name")} />
        </label>
        <label>
          Flat number
          <input placeholder="e.g. B-204" value={form.flatNumber} onChange={update("flatNumber")} />
        </label>
        <label>
          Email
          <input type="email" required value={form.email} onChange={update("email")} />
        </label>
        <label>
          Password
          <input type="password" required value={form.password} onChange={update("password")} />
        </label>
        {error && <div className="error">{error}</div>}
        <button className="btn-primary" type="submit" disabled={busy}>
          {busy ? "Creating account..." : "Create account"}
        </button>
      </form>
      <p className="muted">
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </div>
  );
}
