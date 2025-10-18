import React from "react";
import { useNavigate } from "react-router-dom";

function AdminDashboard() {
  const navigate = useNavigate();
  const admin = JSON.parse(localStorage.getItem("admin") || "{}");

  const handleLogout = () => {
    localStorage.removeItem("admin");
    localStorage.removeItem("adminToken");
    navigate("/admin");
  };

  const handleProfileClick = () => {
    navigate("/admin/profile");
  };

  return (
    <div style={styles.container}>
      {/* Fixed Admin Header */}
      <header style={styles.adminHeader}>
        <div style={styles.headerContent}>
          <div style={styles.logo}>
            <h2 style={styles.logoText}>Admin Dashboard</h2>
          </div>
          <div style={styles.adminInfo}>
            <span 
              style={styles.welcome}
              onClick={handleProfileClick}
              title="Click to update your profile"
            >
              Welcome, {admin.username || "Admin"}
            </span>
            <button onClick={handleLogout} style={styles.logoutButton}>
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div style={styles.mainContent}>
        <div style={styles.dashboardGrid}>
          {/* Quick Actions */}
          <div style={styles.actionsSection}>
            <h3 style={styles.sectionTitle}>Quick Actions</h3>
            <div style={styles.actionsGrid}>
              <button 
                style={styles.actionButton}
                onClick={() => navigate("/admin/add-exam")}
              >
                <span style={styles.actionIcon}>➕</span>
                <span>Create New Exam</span>
              </button>
              
              <button 
                style={styles.actionButton}
                onClick={() => navigate("/admin/manage-users")}
              >
                <span style={styles.actionIcon}>👥</span>
                <span>Manage Users</span>
              </button>
              
              <button 
                style={styles.actionButton}
                onClick={() => navigate("/admin/exams")}
              >
                <span style={styles.actionIcon}>📝</span>
                <span>Manage Exams</span>
              </button>
              
              <button 
                style={styles.actionButton}
                onClick={handleProfileClick}
              >
                <span style={styles.actionIcon}>👤</span>
                <span>Update Profile</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Styles
const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#f5f7fa",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
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
    maxWidth: "1400px",
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
  welcome: {
    fontSize: "0.85rem",
    cursor: "pointer",
    padding: "6px 12px",
    borderRadius: "4px",
    transition: "0.3s",
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  logoutButton: {
    backgroundColor: "#e74c3c",
    color: "white",
    border: "none",
    padding: "6px 15px",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "0.8rem",
    transition: "0.3s",
    fontWeight: "500",
  },
  mainContent: {
    maxWidth: "1400px",
    margin: "0 auto",
    padding: "60px 25px 30px 25px",
  },
  dashboardGrid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "25px",
  },
  actionsSection: {
    backgroundColor: "white",
    padding: "25px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    border: "1px solid #eaeaea",
  },
  sectionTitle: {
    fontSize: "18px",
    color: "#2c3e50",
    margin: "0 0 20px 0",
    fontWeight: "600",
  },
  actionsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "15px",
  },
  actionButton: {
    backgroundColor: "#34495e",
    color: "white",
    border: "none",
    padding: "18px 15px",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    transition: "all 0.3s",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "10px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  actionIcon: {
    fontSize: "22px",
  },
};

export default AdminDashboard;