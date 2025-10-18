import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function AdminProfile() {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState({
    username: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Load current admin data
  useEffect(() => {
    const currentAdmin = JSON.parse(localStorage.getItem("admin") || "{}");
    setAdmin(prev => ({
      ...prev,
      username: currentAdmin.username || "",
      email: currentAdmin.email || ""
    }));
  }, []);

  const handleChange = (e) => {
    setAdmin({ ...admin, [e.target.name]: e.target.value });
    setError("");
    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    // Validation
    if (admin.newPassword && admin.newPassword !== admin.confirmPassword) {
      setError("New passwords do not match");
      setLoading(false);
      return;
    }

    if (admin.newPassword && admin.newPassword.length < 6) {
      setError("New password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/api/auth/admin/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: admin.username,
          email: admin.email,
          currentPassword: admin.currentPassword,
          newPassword: admin.newPassword
        }),
      });

      const data = await response.json();

      if (response.ok && data.status === "success") {
        setMessage("Profile updated successfully!");
        
        // Update localStorage with new admin data
        localStorage.setItem("admin", JSON.stringify(data.admin));
        
        // Clear password fields
        setAdmin(prev => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        }));
      } else {
        setError(data.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Update error:", error);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToDashboard = () => {
    navigate("/admin/dashboard");
  };

  return (
    <div style={styles.container}>
      {/* Fixed Admin Header - Smaller Size */}
      <header style={styles.adminHeader}>
        <div style={styles.headerContent}>
          <div style={styles.logo}>
            <h2 style={styles.logoText}>Admin Profile</h2>
          </div>
          <div style={styles.adminInfo}>
            <button onClick={handleBackToDashboard} style={styles.backButton}>
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div style={styles.mainContent}>
        <div style={styles.profileCard}>
          <h2 style={styles.title}>Update Profile Details</h2>
          
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

          <form onSubmit={handleSubmit}>
            {/* Username Field */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>Username</label>
              <input
                type="text"
                name="username"
                value={admin.username}
                onChange={handleChange}
                style={styles.input}
                required
              />
            </div>

            {/* Email Field */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>Email</label>
              <input
                type="email"
                name="email"
                value={admin.email}
                onChange={handleChange}
                style={styles.input}
                required
              />
            </div>

            {/* Current Password Field */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>Current Password *</label>
              <input
                type="password"
                name="currentPassword"
                value={admin.currentPassword}
                onChange={handleChange}
                style={styles.input}
                placeholder="Enter current password to make changes"
                required
              />
            </div>

            {/* New Password Field */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>New Password</label>
              <input
                type="password"
                name="newPassword"
                value={admin.newPassword}
                onChange={handleChange}
                style={styles.input}
                placeholder="Leave blank to keep current password"
              />
              <small style={styles.helpText}>
                Minimum 6 characters
              </small>
            </div>

            {/* Confirm New Password Field */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>Confirm New Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={admin.confirmPassword}
                onChange={handleChange}
                style={styles.input}
                placeholder="Confirm new password"
              />
            </div>

            <div style={styles.buttonGroup}>
              <button 
                type="button"
                onClick={handleBackToDashboard}
                style={styles.cancelButton}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                style={{
                  ...styles.submitButton,
                  ...(loading ? styles.buttonDisabled : {})
                }}
                disabled={loading}
              >
                {loading ? "Updating..." : "Update Profile"}
              </button>
            </div>
          </form>
        </div>

        {/* Info Section */}
        <div style={styles.infoCard}>
          <h3 style={styles.infoTitle}>Profile Information</h3>
          <div style={styles.infoItem}>
            <strong>Username:</strong> {admin.username}
          </div>
          <div style={styles.infoItem}>
            <strong>Email:</strong> {admin.email}
          </div>
          <div style={styles.infoItem}>
            <strong>Account Type:</strong> Administrator
          </div>
          <div style={styles.note}>
            <strong>Note:</strong> Current password is required to update any profile information.
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#f5f7fa",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  // Smaller Header with matching color
  adminHeader: {
    backgroundColor: "#1c2640ff",
    color: "white",
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    zIndex: 1000,
    padding: "8px 0",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
    height: "50px",
  },
  headerContent: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "0 25px",
    height: "100%",
  },
  logo: {
    fontWeight: "600",
  },
  logoText: {
    margin: 0,
    fontSize: "1.1rem",
    fontWeight: "600",
  },
  adminInfo: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
  },
  backButton: {
    backgroundColor: "rgba(255,255,255,0.1)",
    color: "white",
    border: "none",
    padding: "6px 15px",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "0.8rem",
    transition: "0.3s",
    fontWeight: "500",
  },
  // Adjusted main content padding for smaller header
  mainContent: {
    maxWidth: "1000px",
    margin: "0 auto",
    padding: "60px 25px 30px 25px",
    display: "grid",
    gridTemplateColumns: "2fr 1fr",
    gap: "25px",
  },
  profileCard: {
    backgroundColor: "white",
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    border: "1px solid #eaeaea",
  },
  title: {
    fontSize: "24px",
    color: "#2c3e50",
    marginBottom: "25px",
    textAlign: "center",
    fontWeight: "600",
  },
  inputGroup: {
    marginBottom: "20px",
  },
  label: {
    display: "block",
    marginBottom: "8px",
    color: "#374151",
    fontWeight: "500",
    fontSize: "14px",
  },
  input: {
    width: "100%",
    padding: "7px",
    borderRadius: "8px",
    border: "1.5px solid #e2e8f0",
    outline: "none",
    fontSize: "14px",
    transition: "all 0.3s ease",
    backgroundColor: "#f8fafc",
  },
  helpText: {
    color: "#6b7280",
    fontSize: "12px",
    marginTop: "5px",
    display: "block",
  },
  buttonGroup: {
    display: "flex",
    gap: "15px",
    marginTop: "25px",
  },
  cancelButton: {
    backgroundColor: "#6b7280",
    color: "white",
    border: "none",
    padding: "12px 25px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    flex: 1,
    transition: "all 0.3s",
    fontWeight: "500",
  },
  submitButton: {
    backgroundColor: "#1c2640ff",
    color: "white",
    border: "none",
    padding: "12px 25px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    flex: 2,
    transition: "all 0.3s",
    fontWeight: "500",
  },
  buttonDisabled: {
    backgroundColor: "#94a3b8",
    cursor: "not-allowed",
  },
  success: {
    backgroundColor: "#dcfce7",
    color: "#166534",
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "20px",
    fontSize: "14px",
    border: "1px solid #bbf7d0",
  },
  error: {
    backgroundColor: "#fee2e2",
    color: "#dc2626",
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "20px",
    fontSize: "14px",
    border: "1px solid #fecaca",
  },
  infoCard: {
    backgroundColor: "white",
    padding: "25px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    border: "1px solid #eaeaea",
    height: "fit-content",
  },
  infoTitle: {
    fontSize: "18px",
    color: "#2c3e50",
    marginBottom: "20px",
    fontWeight: "600",
  },
  infoItem: {
    marginBottom: "15px",
    color: "#374151",
    fontSize: "14px",
    padding: "10px",
    backgroundColor: "#f8fafc",
    borderRadius: "6px",
  },
  note: {
    marginTop: "20px",
    padding: "15px",
    backgroundColor: "#fef3c7",
    color: "#92400e",
    borderRadius: "8px",
    fontSize: "13px",
    border: "1px solid #fcd34d",
    lineHeight: "1.5",
  },
};

export default AdminProfile;