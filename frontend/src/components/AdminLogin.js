import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function AdminLogin() {
  const [admin, setAdmin] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setAdmin({ ...admin, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:8080/api/auth/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: admin.email,
          password: admin.password,
        }),
      });

      const data = await response.json();

      if (response.ok && data.status === "success") {
        localStorage.setItem("admin", JSON.stringify(data.admin));
        localStorage.setItem("adminToken", "admin-authenticated");
        navigate("/admin/dashboard");
      } else {
        setError(data.message || "Login failed. Please try again.");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Network error. Please check if the server is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.pageContainer}>
      <div style={styles.formCard}>
        <h1 style={styles.welcomeTitle}>Admin Access</h1>
        <h2 style={styles.subtitle}>Login with Email</h2>
        
        {error && (
          <div style={styles.error}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email id</label>
            <input
              type="email"
              name="email"
              placeholder="suresh@gmail.com"
              value={admin.email}
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
              value={admin.password}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>

          <button 
            type="submit" 
            style={{
              ...styles.loginButton,
              ...(loading ? styles.buttonDisabled : {})
            }}
            disabled={loading}
          >
            {loading ? "LOGGING IN..." : "LOGIN"}
          </button>
        </form>

        <div style={styles.demoCredentials}>
          <p style={styles.demoTitle}>Demo Credentials:</p>
          <p style={styles.demoText}>Email: suresh8928@gmail.com</p>
          <p style={styles.demoText}>Password: Suresh@81050</p>
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
    padding: "25px",
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
    padding: "10px 9px",
    borderRadius: "6px",
    border: "1.5px solid #e2e8f0",
    fontSize: "13px",
    outline: "none",
    transition: "all 0.3s ease",
    backgroundColor: "#f8fafc",
  },
  loginButton: {
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
  demoCredentials: {
    marginTop: "16px",
    padding: "12px",
    backgroundColor: "#f8fafc",
    borderRadius: "6px",
    border: "1px solid #e2e8f0",
  },
  demoTitle: {
    fontWeight: "600",
    marginBottom: "8px",
    color: "#374151",
    fontSize: "12px",
  },
  demoText: {
    margin: "4px 0",
    color: "#64748b",
    fontSize: "11px",
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
};

export default AdminLogin;