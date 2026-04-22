import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { signup } from "../utils/api";
import toast from "react-hot-toast";

export default function Signup({ onSwitch }) {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      const res = await signup(form);
      loginUser(res.data.token, res.data.user);
      toast.success(`Welcome, ${res.data.user.name}! Let's build habits 🚀`);
    } catch (err) {
      toast.error(err.response?.data?.error || "Signup failed");
    }
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.box}>
        <div style={styles.logo}>🎯</div>
        <h1 style={styles.title}>Create Account</h1>
        <p style={styles.subtitle}>Start your habit journey today</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Full Name</label>
            <input
              type="text"
              placeholder="Ahmed Khan"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              placeholder="your@email.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              placeholder="Min 6 characters"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Create Account →"}
          </button>
        </form>

        <p style={styles.switchText}>
          Already have an account?{" "}
          <span style={styles.link} onClick={onSwitch}>
            Login
          </span>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #0f0f1a 0%, #1a1a3e 100%)",
    padding: "16px",
  },
  box: {
    background: "#1a1a2e",
    border: "1px solid #2a2a4a",
    borderRadius: "24px",
    padding: "40px",
    width: "100%",
    maxWidth: "420px",
    textAlign: "center",
  },
  logo: { fontSize: "48px", marginBottom: "16px" },
  title: { fontSize: "28px", fontWeight: "700", marginBottom: "8px" },
  subtitle: { color: "#888", marginBottom: "32px" },
  form: { display: "flex", flexDirection: "column", gap: "16px", textAlign: "left" },
  field: { display: "flex", flexDirection: "column", gap: "8px" },
  label: { fontSize: "14px", fontWeight: "600", color: "#aaa" },
  switchText: { marginTop: "24px", color: "#888", fontSize: "14px" },
  link: { color: "#7F77DD", cursor: "pointer", fontWeight: "600" },
};