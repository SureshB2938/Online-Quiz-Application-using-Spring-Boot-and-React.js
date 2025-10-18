import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/api/auth/user/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok && data.status === "success") {
        setMessage("Registration successful! Redirecting to login...");
        
        setFormData({
          username: "",
          email: "",
          password: "",
        });

        setTimeout(() => {
          navigate("/");
        }, 2000);
      } else {
        setError(data.message || "Registration failed. Please try again.");
      }
    } catch (error) {
      console.error("Registration error:", error);
      setError("Network error. Please check if the server is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.pageContainer}>
      <div style={styles.formCard}>
        <h1 style={styles.welcomeTitle}>Create Account</h1>
        <h2 style={styles.subtitle}>Register with Email</h2>
        
        {message && (
          <div style={styles.success}>
            {message}
          </div>
        )}
        
        {error && (
          <div style={styles.error}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Username</label>
            <input
              type="text"
              name="username"
              placeholder="Enter your username"
              value={formData.username}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Email id</label>
            <input
              type="email"
              name="email"
              placeholder="this.uk@mail.com"
              value={formData.email}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>

          <button 
            type="submit" 
            style={{
              ...styles.registerButton,
              ...(loading ? styles.buttonDisabled : {})
            }}
            disabled={loading}
          >
            {loading ? "REGISTERING..." : "REGISTER"}
          </button>
        </form>

        <div style={styles.footerLinks}>
          <p style={styles.loginText}>
            Already have an account? <Link to="/" style={styles.link}>Login</Link>
          </p>
          <div style={styles.adminLink}>
            <Link to="/admin" style={styles.adminLinkText}>
              Admin Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  pageContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    backgroundColor: "#f8fafc",
    padding: "80px 20px 60px 20px",
    boxSizing: "border-box",
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  formCard: {
    backgroundColor: "#ffffff",
    padding: "35px",
    borderRadius: "10px",
    boxShadow: "0 6px 20px rgba(0, 0, 0, 0.1)",
    width: "340px",
    textAlign: "center",
    marginTop: "-60px",
  },
  welcomeTitle: {
    marginBottom: "6px",
    color: "#1c2640ff",
    fontSize: "24px",
    fontWeight: "700",
    letterSpacing: "0.5px",
  },
  subtitle: {
    marginBottom: "20px",
    color: "#64748b",
    fontSize: "12px",
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: "1px",
  },
  form: {
    width: "100%",
  },
  inputGroup: {
    marginBottom: "16px",
    textAlign: "left",
  },
  label: {
    display: "block",
    marginBottom: "5px",
    color: "#374151",
    fontWeight: "600",
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "6px",
    border: "1.5px solid #e2e8f0",
    fontSize: "13px",
    outline: "none",
    transition: "all 0.3s ease",
    backgroundColor: "#f8fafc",
  },
  registerButton: {
    width: "100%",
    backgroundColor: "#1c2640ff",
    color: "white",
    padding: "12px",
    border: "none",
    borderRadius: "6px",
    fontWeight: "700",
    cursor: "pointer",
    fontSize: "13px",
    textTransform: "uppercase",
    letterSpacing: "1px",
    transition: "all 0.3s ease",
    marginBottom: "16px",
  },
  buttonDisabled: {
    backgroundColor: "#94a3b8",
    cursor: "not-allowed",
  },
  footerLinks: {
    borderTop: "1px solid #e2e8f0",
    paddingTop: "16px",
  },
  loginText: {
    marginBottom: "10px",
    fontSize: "12px",
    color: "#64748b",
  },
  link: {
    color: "#1c2640ff",
    textDecoration: "none",
    fontWeight: "600",
  },
  adminLink: {
    marginTop: "6px",
  },
  adminLinkText: {
    color: "#64748b",
    textDecoration: "none",
    fontSize: "12px",
    fontWeight: "500",
  },
  error: {
    backgroundColor: "#fee2e2",
    color: "#dc2626",
    padding: "8px",
    borderRadius: "6px",
    marginBottom: "12px",
    fontSize: "12px",
    border: "1px solid #fecaca",
  },
  success: {
    backgroundColor: "#dcfce7",
    color: "#166534",
    padding: "8px",
    borderRadius: "6px",
    marginBottom: "12px",
    fontSize: "12px",
    border: "1px solid #bbf7d0",
  },
};

export default Register;