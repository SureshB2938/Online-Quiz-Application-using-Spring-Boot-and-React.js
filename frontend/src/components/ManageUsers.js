import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function ManageUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState({
    totalUsers: 0,
    activeSessions: 0
  });

  // Fetch users from backend
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:8080/api/user/all");
      
      if (response.ok) {
        const data = await response.json();
        if (data.status === "success") {
          setUsers(data.users || []);
          setUserStats({
            totalUsers: data.users?.length || 0,
            activeSessions: 0 // Your system doesn't track sessions yet
          });
        }
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleBackToDashboard = () => {
    navigate("/admin/dashboard");
  };

  // Handle user click to view detailed profile
  const handleUserClick = (userId) => {
    navigate(`/admin/user/${userId}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <header style={styles.adminHeader}>
          <div style={styles.headerContent}>
            <div style={styles.headerMain}>
              <h2 style={styles.headerTitle}>👥 Manage Users</h2>
              <div style={styles.headerButtons}>
                <button onClick={handleBackToDashboard} style={styles.backButton}>
                  ← Dashboard
                </button>
              </div>
            </div>
          </div>
        </header>
        <div style={styles.loading}>
          <div style={styles.loadingSpinner}></div>
          Loading users...
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.adminHeader}>
        <div style={styles.headerContent}>
          <div style={styles.headerMain}>
            <h2 style={styles.headerTitle}>👥 Manage Users</h2>
            <div style={styles.headerButtons}>
              <button onClick={handleBackToDashboard} style={styles.backButton}>
                ← Dashboard
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div style={styles.mainContent}>
        <div style={styles.contentContainer}>
          <div style={styles.mainSection}>
            {/* Stats Cards */}
            <div style={styles.statsContainer}>
              <div style={styles.statCard}>
                <div style={styles.statIcon}>👥</div>
                <h3 style={styles.statNumber}>{userStats.totalUsers}</h3>
                <p style={styles.statLabel}>Total Users</p>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statIcon}>💻</div>
                <h3 style={styles.statNumber}>{userStats.activeSessions}</h3>
                <p style={styles.statLabel}>Active Sessions</p>
              </div>
            </div>

            {/* Users List */}
            <div style={styles.usersSection}>
              <div style={styles.sectionHeader}>
                <h2 style={styles.sectionTitle}>Registered Users</h2>
                <span style={styles.userCount}>({users.length})</span>
              </div>
              
              {users.length === 0 ? (
                <div style={styles.noUsers}>
                  <div style={styles.noUsersIcon}>👥</div>
                  <h3>No Users Found</h3>
                  <p>There are no registered users in the system yet.</p>
                </div>
              ) : (
                <div style={styles.usersList}>
                  {users.map(user => (
                    <div 
                      key={user.id} 
                      style={styles.userCard}
                      onClick={() => handleUserClick(user.id)}
                    >
                      <div style={styles.userInfo}>
                        <div style={styles.userAvatar}>
                          {user.username?.charAt(0).toUpperCase()}
                        </div>
                        <div style={styles.userDetails}>
                          <div style={styles.username}>{user.username}</div>
                          <div style={styles.email}>{user.email}</div>
                          <div style={styles.userMeta}>
                            Joined: {formatDate(user.createdAt)}
                          </div>
                        </div>
                      </div>
                      <div style={styles.userActions}>
                        <div style={styles.userId}>ID: #{user.id}</div>
                        <div style={styles.clickHint}>Click to view details →</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div style={styles.sidebar}>
            <div style={styles.infoCard}>
              <h3 style={styles.infoTitle}>📊 User Management</h3>
              <div style={styles.featuresList}>
                <div style={styles.featureItem}>
                  <div style={styles.featureIcon}>✅</div>
                  <div style={styles.featureContent}>
                    <strong>View Users</strong>
                    <p>See all registered users</p>
                  </div>
                </div>
                <div style={styles.featureItem}>
                  <div style={styles.featureIcon}>✅</div>
                  <div style={styles.featureContent}>
                    <strong>User Statistics</strong>
                    <p>Track total user count</p>
                  </div>
                </div>
                <div style={styles.featureItem}>
                  <div style={styles.featureIcon}>✅</div>
                  <div style={styles.featureContent}>
                    <strong>Detailed Profiles</strong>
                    <p>Click to view user details</p>
                  </div>
                </div>
                <div style={styles.featureItem}>
                  <div style={styles.featureIcon}>🔲</div>
                  <div style={styles.featureContent}>
                    <strong>Session Management</strong>
                    <p>Coming Soon</p>
                  </div>
                </div>
                <div style={styles.featureItem}>
                  <div style={styles.featureIcon}>🔲</div>
                  <div style={styles.featureContent}>
                    <strong>User Actions</strong>
                    <p>Ban/Delete (Coming Soon)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#f8fafc",
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
    padding: "12px 0",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
  },
  headerContent: {
    maxWidth: "1400px",
    margin: "0 auto",
    padding: "0 40px",
  },
  headerMain: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    margin: 0,
    fontSize: "1.4rem",
    fontWeight: "600",
  },
  headerButtons: {
    display: "flex",
    gap: "12px",
  },
  backButton: {
    backgroundColor: "rgba(255,255,255,0.15)",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "0.9rem",
    fontWeight: "500",
    transition: "all 0.3s ease",
  },
  mainContent: {
    paddingTop: "80px",
    minHeight: "calc(100vh - 80px)",
  },
  contentContainer: {
    maxWidth: "1400px",
    margin: "0 auto",
    padding: "30px 40px",
    display: "grid",
    gridTemplateColumns: "2fr 1fr",
    gap: "30px",
  },
  mainSection: {
    minHeight: "400px",
  },
  statsContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "25px",
    marginBottom: "30px",
  },
  statCard: {
    backgroundColor: "white",
    padding: "30px",
    borderRadius: "16px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
    border: "1px solid #e5e7eb",
    textAlign: "center",
    transition: "all 0.3s ease",
  },
  statIcon: {
    fontSize: "48px",
    marginBottom: "20px",
  },
  statNumber: {
    fontSize: "2.5rem",
    color: "#1c2640ff",
    margin: "0 0 10px 0",
    fontWeight: "700",
  },
  statLabel: {
    color: "#64748b",
    margin: 0,
    fontSize: "1rem",
    fontWeight: "500",
  },
  usersSection: {
    backgroundColor: "white",
    padding: "30px",
    borderRadius: "16px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
    border: "1px solid #e5e7eb",
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "25px",
  },
  sectionTitle: {
    fontSize: "1.5rem",
    color: "#1c2640ff",
    margin: 0,
    fontWeight: "600",
  },
  userCount: {
    color: "#dc2626",
    fontWeight: "700",
    fontSize: "1rem",
  },
  usersList: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  userCard: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px",
    backgroundColor: "#fafbfc",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  userInfo: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
  },
  userAvatar: {
    width: "50px",
    height: "50px",
    borderRadius: "50%",
    backgroundColor: "#1c2640ff",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.2rem",
    fontWeight: "bold",
    flexShrink: 0,
  },
  userDetails: {
    flex: 1,
  },
  username: {
    fontSize: "1.1rem",
    fontWeight: "600",
    color: "#1c2640ff",
    marginBottom: "5px",
  },
  email: {
    color: "#64748b",
    fontSize: "0.9rem",
    marginBottom: "5px",
  },
  userMeta: {
    color: "#94a3b8",
    fontSize: "0.8rem",
  },
  userActions: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: "5px",
  },
  userId: {
    color: "#64748b",
    fontSize: "0.8rem",
    fontFamily: "monospace",
  },
  clickHint: {
    color: "#1c2640ff",
    fontSize: "0.75rem",
    fontWeight: "500",
  },
  noUsers: {
    textAlign: "center",
    padding: "60px 40px",
    color: "#64748b",
  },
  noUsersIcon: {
    fontSize: "64px",
    marginBottom: "20px",
  },

  // Sidebar Styles
  sidebar: {
    display: "flex",
    flexDirection: "column",
    gap: "25px",
  },
  infoCard: {
    backgroundColor: "white",
    borderRadius: "16px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
    border: "1px solid #e5e7eb",
    padding: "25px",
  },
  infoTitle: {
    fontSize: "1.2rem",
    color: "#1c2640ff",
    margin: "0 0 20px 0",
    fontWeight: "600",
  },
  featuresList: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  featureItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    padding: "15px",
    backgroundColor: "#f8fafc",
    borderRadius: "10px",
    border: "1px solid #e2e8f0",
  },
  featureIcon: {
    fontSize: "1rem",
    marginTop: "2px",
  },
  featureContent: {
    flex: 1,
  },
  loading: {
    textAlign: "center",
    padding: "100px 20px",
    fontSize: "18px",
    color: "#64748b",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "15px",
  },
  loadingSpinner: {
    width: "32px",
    height: "32px",
    border: "3px solid #e2e8f0",
    borderTop: "3px solid #1c2640ff",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
};

// Add CSS for animations
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    .user-card:hover {
      background-color: #f0f9ff !important;
      border-color: #1c2640ff !important;
      transform: translateY(-2px) !important;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
    }
    
    .stat-card:hover {
      transform: translateY(-2px) !important;
      box-shadow: 0 12px 40px rgba(0,0,0,0.15) !important;
    }
    
    .back-button:hover {
      background-color: rgba(255,255,255,0.25) !important;
    }
  `;
  document.head.appendChild(style);
}

export default ManageUsers;