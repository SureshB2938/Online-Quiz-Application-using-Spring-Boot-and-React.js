import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";

function UserProfileDetails() {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [examAttempts, setExamAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");
  const [showModal, setShowModal] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    title: "",
    message: "",
    onConfirm: null,
    actionType: ""
  });

  // Fetch user details - wrapped in useCallback
  const fetchUserDetails = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch user profile
      const userResponse = await fetch(`http://localhost:8080/api/user/profile/${userId}`);
      const userData = await userResponse.json();
      
      if (userResponse.ok && userData.status === "success") {
        setUser(userData.user);
      } else {
        throw new Error(userData.message || "Failed to fetch user details");
      }

      // Fetch user stats
      const statsResponse = await fetch(`http://localhost:8080/api/user/${userId}/detailed-stats`);
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        if (statsData.status === "success") {
          setUserStats(statsData);
        }
      }

      // Fetch exam attempts
      const attemptsResponse = await fetch(`http://localhost:8080/api/user/${userId}/exam-attempts`);
      if (attemptsResponse.ok) {
        const attemptsData = await attemptsResponse.json();
        if (attemptsData.status === "success") {
          setExamAttempts(attemptsData.attempts || []);
        }
      }

    } catch (error) {
      console.error("Error fetching user details:", error);
    } finally {
      setLoading(false);
    }
  }, [userId]); // Add userId as dependency

  useEffect(() => {
    if (userId) {
      fetchUserDetails();
    }
  }, [userId, fetchUserDetails]); // Now includes fetchUserDetails in dependencies

  // ... rest of the component remains exactly the same ...
  const showConfirmationModal = (title, message, onConfirm, actionType = "") => {
    setModalConfig({
      title,
      message,
      onConfirm,
      actionType
    });
    setShowModal(true);
  };

  const handleModalConfirm = () => {
    if (modalConfig.onConfirm) {
      modalConfig.onConfirm();
    }
    setShowModal(false);
  };

  const handleModalCancel = () => {
    setShowModal(false);
  };

  // Delete user
  const deleteUser = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/user/${userId}`, {
        method: "DELETE",
      });

      const data = await response.json();
      
      if (response.ok && data.status === "success") {
        showConfirmationModal(
          "Success",
          "User deleted successfully!",
          () => navigate("/admin/manage-users"),
          "success"
        );
      } else {
        throw new Error(data.message || "Failed to delete user");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      showConfirmationModal(
        "Error",
        error.message || "Error deleting user",
        null,
        "error"
      );
    }
  };

  function handleDeleteUser() {
    showConfirmationModal(
      "Delete User",
      `Are you sure you want to delete ${user?.username}? This action cannot be undone and all their data will be permanently removed.`,
      deleteUser,
      "danger"
    );
  }

  const handleResetPassword = () => {
    showConfirmationModal(
      "Reset Password",
      `Are you sure you want to reset password for ${user?.username}? A temporary password will be generated and sent to their email.`,
      () => {
        // Implement password reset logic here
        console.log("Reset password for user:", userId);
      },
      "warning"
    );
  };

  const handleBackToUsers = () => {
    navigate("/admin/manage-users");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleString();
  };

  const formatPercentage = (percentage) => {
    return typeof percentage === 'number' ? percentage.toFixed(2) + '%' : '0%';
  };

  const getModalStyles = () => {
    const baseStyle = {
      ...styles.modal,
      ...styles.modalShow
    };

    switch (modalConfig.actionType) {
      case "danger":
        return {
          ...baseStyle,
          borderLeft: "4px solid #dc2626"
        };
      case "warning":
        return {
          ...baseStyle,
          borderLeft: "4px solid #d97706"
        };
      case "success":
        return {
          ...baseStyle,
          borderLeft: "4px solid #059669"
        };
      case "error":
        return {
          ...baseStyle,
          borderLeft: "4px solid #dc2626"
        };
      case "info":
        return {
          ...baseStyle,
          borderLeft: "4px solid #1d4ed8"
        };
      default:
        return baseStyle;
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <header style={styles.adminHeader}>
          <div style={styles.headerContent}>
            <h2>👤 User Details</h2>
          </div>
        </header>
        <div style={styles.loading}>Loading user details...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={styles.container}>
        <header style={styles.adminHeader}>
          <div style={styles.headerContent}>
            <h2>👤 User Details</h2>
          </div>
        </header>
        <div style={styles.error}>
          <h3>User Not Found</h3>
          <p>The requested user could not be found.</p>
          <button onClick={handleBackToUsers} style={styles.button}>
            Back to Users
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Confirmation Modal */}
      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={getModalStyles()}>
            <h3 style={styles.modalTitle}>{modalConfig.title}</h3>
            <p style={styles.modalMessage}>{modalConfig.message}</p>
            <div style={styles.modalActions}>
              {modalConfig.onConfirm ? (
                <>
                  <button 
                    onClick={handleModalCancel}
                    style={styles.modalCancel}
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleModalConfirm}
                    style={
                      modalConfig.actionType === "danger" 
                        ? styles.modalConfirmDanger 
                        : styles.modalConfirm
                    }
                  >
                    Confirm
                  </button>
                </>
              ) : (
                <button 
                  onClick={handleModalCancel}
                  style={styles.modalOk}
                >
                  OK
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header style={styles.adminHeader}>
        <div style={styles.headerContent}>
          <div style={styles.logo}>
            <h2>👤 User Details</h2>
          </div>
          <div style={styles.adminInfo}>
            <button onClick={handleBackToUsers} style={styles.backButton}>
              ← Back to Users
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div style={styles.mainContent}>
        {/* User Header */}
        <div style={styles.userHeader}>
          <div style={styles.userAvatar}>
            {user.username?.charAt(0).toUpperCase()}
          </div>
          <div style={styles.userMainInfo}>
            <h1 style={styles.userName}>{user.username}</h1>
            <p style={styles.userEmail}>{user.email}</p>
            <p style={styles.userId}>User ID: #{user.id}</p>
          </div>
          <div style={styles.userActions}>
            <button 
              onClick={handleResetPassword}
              style={styles.resetPasswordButton}
            >
              🔑 Reset Password
            </button>
            <button 
              onClick={handleDeleteUser}
              style={styles.deleteUserButton}
            >
              🗑️ Delete User
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={styles.tabs}>
          <button 
            style={{
              ...styles.tab,
              ...(activeTab === "profile" ? styles.activeTab : {})
            }}
            onClick={() => setActiveTab("profile")}
          >
            📝 Profile
          </button>
          <button 
            style={{
              ...styles.tab,
              ...(activeTab === "statistics" ? styles.activeTab : {})
            }}
            onClick={() => setActiveTab("statistics")}
          >
            📊 Statistics
          </button>
          <button 
            style={{
              ...styles.tab,
              ...(activeTab === "examHistory" ? styles.activeTab : {})
            }}
            onClick={() => setActiveTab("examHistory")}
          >
            📚 Exam History
          </button>
        </div>

        {/* Tab Content */}
        <div style={styles.tabContent}>
          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div style={styles.profileSection}>
              <h3 style={styles.sectionTitle}>Profile Information</h3>
              <div style={styles.profileGrid}>
                <div style={styles.infoCard}>
                  <h4>Basic Information</h4>
                  <div style={styles.infoList}>
                    <div style={styles.infoItem}>
                      <strong>Username:</strong> {user.username}
                    </div>
                    <div style={styles.infoItem}>
                      <strong>Email:</strong> {user.email}
                    </div>
                    <div style={styles.infoItem}>
                      <strong>User ID:</strong> #{user.id}
                    </div>
                    <div style={styles.infoItem}>
                      <strong>Joined Date:</strong> {formatDate(user.createdAt)}
                    </div>
                    <div style={styles.infoItem}>
                      <strong>Last Login:</strong> {formatDate(user.lastLogin) || "Never"}
                    </div>
                  </div>
                </div>

                <div style={styles.infoCard}>
                  <h4>Account Status</h4>
                  <div style={styles.statusList}>
                    <div style={styles.statusItem}>
                      <span style={styles.statusLabel}>Status:</span>
                      <span style={styles.activeStatus}>Active</span>
                    </div>
                    <div style={styles.statusItem}>
                      <span style={styles.statusLabel}>Email Verified:</span>
                      <span style={styles.pendingStatus}>Not Verified</span>
                    </div>
                    <div style={styles.statusItem}>
                      <span style={styles.statusLabel}>Account Type:</span>
                      <span style={styles.typeStatus}>Regular User</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Statistics Tab */}
          {activeTab === "statistics" && (
            <div style={styles.statsSection}>
              <h3 style={styles.sectionTitle}>Performance Statistics</h3>
              {userStats ? (
                <div style={styles.statsGrid}>
                  <div style={styles.statCard}>
                    <div style={styles.statIcon}>📊</div>
                    <div style={styles.statNumber}>
                      {userStats.totalExamsTaken || 0}
                    </div>
                    <div style={styles.statLabel}>Exams Taken</div>
                  </div>
                  <div style={styles.statCard}>
                    <div style={styles.statIcon}>⭐</div>
                    <div style={styles.statNumber}>
                      {formatPercentage(userStats.averagePercentage || 0)}
                    </div>
                    <div style={styles.statLabel}>Average Score</div>
                  </div>
                  <div style={styles.statCard}>
                    <div style={styles.statIcon}>⏱️</div>
                    <div style={styles.statNumber}>
                      {userStats.totalTimeSpent || "0h 0m"}
                    </div>
                    <div style={styles.statLabel}>Total Time Spent</div>
                  </div>
                  <div style={styles.statCard}>
                    <div style={styles.statIcon}>✅</div>
                    <div style={styles.statNumber}>
                      {userStats.basicStats?.passedExams || 0}
                    </div>
                    <div style={styles.statLabel}>Passed Exams</div>
                  </div>
                </div>
              ) : (
                <div style={styles.noData}>
                  <p>No statistics available for this user.</p>
                </div>
              )}
            </div>
          )}

          {/* Exam History Tab */}
          {activeTab === "examHistory" && (
            <div style={styles.examHistorySection}>
              <h3 style={styles.sectionTitle}>Exam Attempts ({examAttempts.length})</h3>
              {examAttempts.length === 0 ? (
                <div style={styles.noData}>
                  <p>No exam attempts found for this user.</p>
                </div>
              ) : (
                <div style={styles.examList}>
                  {examAttempts.map(attempt => (
                    <div key={attempt.id} style={styles.examCard}>
                      <div style={styles.examHeader}>
                        <h4 style={styles.examTitle}>{attempt.examTitle}</h4>
                        <span style={{
                          ...styles.examStatus,
                          ...(attempt.passed ? styles.passedStatus : styles.failedStatus)
                        }}>
                          {attempt.passed ? "PASSED" : "FAILED"}
                        </span>
                      </div>
                      <div style={styles.examDetails}>
                        <div style={styles.examDetail}>
                          <strong>Score:</strong> {attempt.score}/{attempt.totalMarks}
                        </div>
                        <div style={styles.examDetail}>
                          <strong>Percentage:</strong> {formatPercentage(attempt.percentage)}
                        </div>
                        <div style={styles.examDetail}>
                          <strong>Time Spent:</strong> {attempt.timeSpent}
                        </div>
                        <div style={styles.examDetail}>
                          <strong>Attempted:</strong> {formatDate(attempt.attemptedAt)}
                        </div>
                        <div style={styles.examDetail}>
                          <strong>Category:</strong> {attempt.category}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ... (keep all the styles exactly the same as before)

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#f8fafc",
    position: "relative",
  },
  adminHeader: {
    backgroundColor: "#1D4ED8",
    color: "white",
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    zIndex: 1000,
    padding: "10px 0",
    boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
  },
  headerContent: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "0 20px",
  },
  logo: {
    fontWeight: "bold",
    fontSize: "1.4rem",
  },
  adminInfo: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
  },
  backButton: {
    backgroundColor: "rgba(255,255,255,0.2)",
    color: "white",
    border: "none",
    padding: "8px 16px",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "0.9rem",
  },
  mainContent: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "80px 20px 30px 20px",
  },
  userHeader: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
    backgroundColor: "white",
    padding: "30px",
    borderRadius: "10px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
    marginBottom: "20px",
  },
  userAvatar: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    backgroundColor: "#1D4ED8",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "2rem",
    fontWeight: "bold",
  },
  userMainInfo: {
    flex: 1,
  },
  userName: {
    fontSize: "2rem",
    color: "#1e293b",
    margin: "0 0 5px 0",
  },
  userEmail: {
    color: "#64748b",
    fontSize: "1.1rem",
    margin: "0 0 5px 0",
  },
  userId: {
    color: "#94a3b8",
    fontSize: "0.9rem",
    margin: 0,
  },
  userActions: {
    display: "flex",
    gap: "10px",
  },
  resetPasswordButton: {
    backgroundColor: "#f59e0b",
    color: "white",
    border: "none",
    padding: "10px 15px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
  },
  deleteUserButton: {
    backgroundColor: "#dc2626",
    color: "white",
    border: "none",
    padding: "10px 15px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
  },
  tabs: {
    display: "flex",
    gap: "10px",
    marginBottom: "20px",
    borderBottom: "1px solid #e2e8f0",
  },
  tab: {
    backgroundColor: "transparent",
    border: "none",
    padding: "12px 24px",
    cursor: "pointer",
    fontSize: "1rem",
    borderRadius: "8px 8px 0 0",
    color: "#64748b",
  },
  activeTab: {
    backgroundColor: "white",
    color: "#1D4ED8",
    fontWeight: "bold",
    borderBottom: "3px solid #1D4ED8",
  },
  tabContent: {
    backgroundColor: "white",
    padding: "30px",
    borderRadius: "10px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
    minHeight: "400px",
  },
  sectionTitle: {
    fontSize: "1.5rem",
    color: "#1e293b",
    marginBottom: "25px",
    borderBottom: "2px solid #e2e8f0",
    paddingBottom: "10px",
  },
  profileSection: {
    // Profile section styles
  },
  profileGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
  },
  infoCard: {
    backgroundColor: "#f8fafc",
    padding: "20px",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
  },
  infoList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  infoItem: {
    display: "flex",
    justifyContent: "space-between",
    padding: "8px 0",
    borderBottom: "1px solid #e2e8f0",
  },
  statusList: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  statusItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusLabel: {
    color: "#64748b",
  },
  activeStatus: {
    backgroundColor: "#dcfce7",
    color: "#166534",
    padding: "4px 8px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "600",
  },
  pendingStatus: {
    backgroundColor: "#fef3c7",
    color: "#92400e",
    padding: "4px 8px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "600",
  },
  typeStatus: {
    backgroundColor: "#dbeafe",
    color: "#1d4ed8",
    padding: "4px 8px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "600",
  },
  statsSection: {
    // Statistics section styles
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px",
  },
  statCard: {
    backgroundColor: "#f8fafc",
    padding: "25px",
    borderRadius: "10px",
    textAlign: "center",
    border: "1px solid #e2e8f0",
  },
  statIcon: {
    fontSize: "2rem",
    marginBottom: "10px",
  },
  statNumber: {
    fontSize: "1.8rem",
    color: "#1e293b",
    fontWeight: "bold",
    marginBottom: "5px",
  },
  statLabel: {
    color: "#64748b",
    fontSize: "14px",
  },
  examHistorySection: {
    // Exam history section styles
  },
  examList: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  examCard: {
    backgroundColor: "#f8fafc",
    padding: "20px",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
  },
  examHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "15px",
  },
  examTitle: {
    fontSize: "1.1rem",
    color: "#1e293b",
    margin: "0 10px 0 0",
    flex: 1,
  },
  examStatus: {
    padding: "4px 8px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "bold",
  },
  passedStatus: {
    backgroundColor: "#dcfce7",
    color: "#166534",
  },
  failedStatus: {
    backgroundColor: "#fee2e2",
    color: "#dc2626",
  },
  examDetails: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "10px",
  },
  examDetail: {
    color: "#374151",
    fontSize: "14px",
  },
  noData: {
    textAlign: "center",
    padding: "40px 20px",
    color: "#64748b",
  },
  loading: {
    textAlign: "center",
    padding: "100px 20px",
    fontSize: "18px",
    color: "#64748b",
  },
  error: {
    textAlign: "center",
    padding: "100px 20px",
    maxWidth: "500px",
    margin: "0 auto",
  },
  button: {
    backgroundColor: "#1d4ed8",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "6px",
    cursor: "pointer",
    marginTop: "15px",
  },
  // Modal styles (same as before)
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2000,
  },
  modal: {
    backgroundColor: "white",
    padding: "30px",
    borderRadius: "10px",
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
    maxWidth: "400px",
    width: "90%",
  },
  modalShow: {
    animation: "modalAppear 0.3s ease-out",
  },
  modalTitle: {
    fontSize: "20px",
    color: "#1e293b",
    margin: "0 0 15px 0",
    fontWeight: "600",
  },
  modalMessage: {
    color: "#64748b",
    margin: "0 0 25px 0",
    lineHeight: "1.5",
  },
  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
  },
  modalCancel: {
    backgroundColor: "#6b7280",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
  },
  modalConfirm: {
    backgroundColor: "#1d4ed8",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
  },
  modalConfirmDanger: {
    backgroundColor: "#dc2626",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
  },
  modalOk: {
    backgroundColor: "#1d4ed8",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
  },
};

export default UserProfileDetails;