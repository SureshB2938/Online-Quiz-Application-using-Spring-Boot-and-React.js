import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function UserProfile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  
  // Profile state
  const [profileData, setProfileData] = useState({
    username: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  
  // Results state
  const [examAttempts, setExamAttempts] = useState([]);
  const [detailedStats, setDetailedStats] = useState(null);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    if (!userData) {
      navigate("/");
      return;
    }
    setUser(userData);
    setProfileData(prev => ({
      ...prev,
      username: userData.username,
      email: userData.email
    }));
    
    // Load initial data based on active tab
    if (activeTab === "results") {
      fetchExamAttempts(userData.id);
    } else if (activeTab === "statistics") {
      fetchDetailedStats(userData.id);
    }
  }, [navigate, activeTab]);

  const fetchExamAttempts = async (userId) => {
    try {
      const response = await fetch(`http://localhost:8080/api/user/${userId}/exam-attempts`);
      const data = await response.json();
      
      if (data.status === "success") {
        setExamAttempts(data.attempts || []);
      }
    } catch (error) {
      console.error("Fetch exam attempts error:", error);
    }
  };

  const fetchDetailedStats = async (userId) => {
    try {
      const response = await fetch(`http://localhost:8080/api/user/${userId}/detailed-stats`);
      const data = await response.json();
      
      if (data.status === "success") {
        setDetailedStats(data);
      }
    } catch (error) {
      console.error("Fetch detailed stats error:", error);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    // Validation
    if (profileData.newPassword && profileData.newPassword !== profileData.confirmPassword) {
      setError("New passwords do not match");
      setLoading(false);
      return;
    }

    if (profileData.newPassword && profileData.newPassword.length < 6) {
      setError("New password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    try {
      const updateData = {
        username: profileData.username,
        email: profileData.email,
        currentPassword: profileData.currentPassword,
        newPassword: profileData.newPassword
      };

      const response = await fetch(`http://localhost:8080/api/user/profile/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (response.ok && data.status === "success") {
        setMessage("Profile updated successfully!");
        
        // Update localStorage with new user data
        localStorage.setItem("user", JSON.stringify(data.user));
        setUser(data.user);
        
        // Clear password fields
        setProfileData(prev => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        }));
      } else {
        setError(data.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Update profile error:", error);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
    setError("");
    setMessage("");
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setMessage("");
    setError("");
  };

  const handleBackToDashboard = () => {
    navigate("/user/dashboard");
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString() + ' ' + new Date(dateString).toLocaleTimeString();
  };

  const formatPercentage = (percentage) => {
    return typeof percentage === 'number' ? percentage.toFixed(2) + '%' : '0%';
  };

  if (!user) {
    return (
      <div style={styles.container}>
        <header style={styles.adminHeader}>
          <div style={styles.headerContent}>
            <div style={styles.headerMain}>
              <h2 style={styles.headerTitle}>👤 User Profile</h2>
            </div>
          </div>
        </header>
        <div style={styles.loading}>
          <div style={styles.loadingSpinner}></div>
          Loading...
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
            <h2 style={styles.headerTitle}>👤 User Profile</h2>
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
            {/* User Info Card */}
            <div style={styles.userInfoCard}>
              <div style={styles.userAvatar}>
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div style={styles.userDetails}>
                <h1 style={styles.userName}>{user.username}</h1>
                <p style={styles.userEmail}>{user.email}</p>
                <p style={styles.userSince}>
                  Member since: {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Tabs */}
            <div style={styles.tabs}>
              <button 
                style={{
                  ...styles.tab,
                  ...(activeTab === "profile" ? styles.activeTab : {})
                }}
                onClick={() => handleTabChange("profile")}
              >
                📝 Edit Profile
              </button>
              <button 
                style={{
                  ...styles.tab,
                  ...(activeTab === "results" ? styles.activeTab : {})
                }}
                onClick={() => handleTabChange("results")}
              >
                📊 Exam Results
              </button>
              <button 
                style={{
                  ...styles.tab,
                  ...(activeTab === "statistics" ? styles.activeTab : {})
                }}
                onClick={() => handleTabChange("statistics")}
              >
                📈 Statistics
              </button>
            </div>

            {/* Tab Content */}
            <div style={styles.tabContent}>
              {message && (
                <div style={styles.success}>
                  <span style={styles.successIcon}>✅</span>
                  {message}
                </div>
              )}
              
              {error && (
                <div style={styles.error}>
                  <span style={styles.errorIcon}>❌</span>
                  {error}
                </div>
              )}

              {/* Profile Tab */}
              {activeTab === "profile" && (
                <div style={styles.profileForm}>
                  <h2 style={styles.sectionTitle}>Update Profile Information</h2>
                  <form onSubmit={handleProfileUpdate}>
                    <div style={styles.formGrid}>
                      <div style={styles.inputGroup}>
                        <label style={styles.label}>Username</label>
                        <input
                          type="text"
                          name="username"
                          value={profileData.username}
                          onChange={handleInputChange}
                          style={styles.input}
                          required
                        />
                      </div>

                      <div style={styles.inputGroup}>
                        <label style={styles.label}>Email</label>
                        <input
                          type="email"
                          name="email"
                          value={profileData.email}
                          onChange={handleInputChange}
                          style={styles.input}
                          required
                        />
                      </div>
                    </div>

                    <div style={styles.passwordSection}>
                      <h3 style={styles.subTitle}>Change Password (Optional)</h3>
                      
                      <div style={styles.formGrid}>
                        <div style={styles.inputGroup}>
                          <label style={styles.label}>Current Password</label>
                          <input
                            type="password"
                            name="currentPassword"
                            value={profileData.currentPassword}
                            onChange={handleInputChange}
                            style={styles.input}
                            placeholder="Enter current password to make changes"
                          />
                        </div>

                        <div style={styles.inputGroup}>
                          <label style={styles.label}>New Password</label>
                          <input
                            type="password"
                            name="newPassword"
                            value={profileData.newPassword}
                            onChange={handleInputChange}
                            style={styles.input}
                            placeholder="Leave blank to keep current password"
                          />
                        </div>

                        <div style={styles.inputGroup}>
                          <label style={styles.label}>Confirm New Password</label>
                          <input
                            type="password"
                            name="confirmPassword"
                            value={profileData.confirmPassword}
                            onChange={handleInputChange}
                            style={styles.input}
                            placeholder="Confirm new password"
                          />
                        </div>
                      </div>
                    </div>

                    <div style={styles.buttonGroup}>
                      <button 
                        type="submit" 
                        style={{
                          ...styles.submitButton,
                          ...(loading ? styles.buttonDisabled : {})
                        }}
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <span style={styles.loadingSpinner}></span>
                            Updating...
                          </>
                        ) : (
                          "Update Profile"
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Results Tab */}
              {activeTab === "results" && (
                <div style={styles.resultsSection}>
                  <div style={styles.sectionHeader}>
                    <h2 style={styles.sectionTitle}>Exam Results</h2>
                    <span style={styles.resultsCount}>({examAttempts.length})</span>
                  </div>
                  
                  {examAttempts.length === 0 ? (
                    <div style={styles.emptyState}>
                      <div style={styles.emptyIcon}>📝</div>
                      <h3>No Exam Results Yet</h3>
                      <p>You haven't attempted any exams yet. Start your first exam from the dashboard!</p>
                      <button onClick={handleBackToDashboard} style={styles.primaryButton}>
                        Go to Dashboard
                      </button>
                    </div>
                  ) : (
                    <div style={styles.resultsGrid}>
                      {examAttempts.map((attempt) => (
                        <div key={attempt.id} style={styles.resultCard}>
                          <div style={styles.resultHeader}>
                            <div style={styles.examTitleSection}>
                              <h3 style={styles.examTitle}>{attempt.examTitle}</h3>
                              <div style={styles.examMeta}>
                                <span style={styles.categoryTag}>{attempt.category}</span>
                                <span style={{
                                  ...styles.statusBadge,
                                  ...(attempt.passed ? styles.passedBadge : styles.failedBadge)
                                }}>
                                  {attempt.passed ? "PASSED" : "FAILED"}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div style={styles.resultDetails}>
                            <div style={styles.detailGrid}>
                              <div style={styles.detailItem}>
                                <span style={styles.detailLabel}>Score:</span>
                                <span style={styles.detailValue}>{attempt.score}/{attempt.totalMarks}</span>
                              </div>
                              <div style={styles.detailItem}>
                                <span style={styles.detailLabel}>Percentage:</span>
                                <span style={styles.detailValue}>{formatPercentage(attempt.percentage)}</span>
                              </div>
                              <div style={styles.detailItem}>
                                <span style={styles.detailLabel}>Time Spent:</span>
                                <span style={styles.detailValue}>{attempt.timeSpent}</span>
                              </div>
                              <div style={styles.detailItem}>
                                <span style={styles.detailLabel}>Attempted:</span>
                                <span style={styles.detailValue}>{formatDate(attempt.attemptedAt)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Statistics Tab */}
              {activeTab === "statistics" && (
                <div style={styles.statsSection}>
                  <div style={styles.sectionHeader}>
                    <h2 style={styles.sectionTitle}>Detailed Statistics</h2>
                  </div>
                  
                  {!detailedStats ? (
                    <div style={styles.loading}>
                      <div style={styles.loadingSpinner}></div>
                      Loading statistics...
                    </div>
                  ) : (
                    <div style={styles.statsGrid}>
                      {/* Overall Stats */}
                      <div style={styles.statsCard}>
                        <h3 style={styles.statsTitle}>📊 Overall Performance</h3>
                        <div style={styles.statsList}>
                          <div style={styles.statItem}>
                            <span style={styles.statLabel}>Exams Taken:</span>
                            <span style={styles.statValue}>{detailedStats.totalExamsTaken}</span>
                          </div>
                          <div style={styles.statItem}>
                            <span style={styles.statLabel}>Average Score:</span>
                            <span style={styles.statValue}>{formatPercentage(detailedStats.averagePercentage)}</span>
                          </div>
                          <div style={styles.statItem}>
                            <span style={styles.statLabel}>Passed Exams:</span>
                            <span style={styles.statValue}>{detailedStats.basicStats?.passedExams || 0}</span>
                          </div>
                          <div style={styles.statItem}>
                            <span style={styles.statLabel}>Total Time Spent:</span>
                            <span style={styles.statValue}>{detailedStats.totalTimeSpent}</span>
                          </div>
                        </div>
                      </div>

                      {/* Category Stats */}
                      <div style={styles.statsCard}>
                        <h3 style={styles.statsTitle}>📚 Category Breakdown</h3>
                        <div style={styles.statsList}>
                          {Object.entries(detailedStats.categoryStats || {}).map(([category, count]) => (
                            <div key={category} style={styles.statItem}>
                              <span style={styles.statLabel}>{category}:</span>
                              <span style={styles.statValue}>{count} exam(s)</span>
                            </div>
                          ))}
                          {Object.keys(detailedStats.categoryStats || {}).length === 0 && (
                            <div style={styles.noData}>No category data available</div>
                          )}
                        </div>
                      </div>

                      {/* Difficulty Stats */}
                      <div style={styles.statsCard}>
                        <h3 style={styles.statsTitle}>🎯 Difficulty Analysis</h3>
                        <div style={styles.statsList}>
                          {Object.entries(detailedStats.difficultyStats || {}).map(([difficulty, count]) => (
                            <div key={difficulty} style={styles.statItem}>
                              <span style={styles.statLabel}>{difficulty}:</span>
                              <span style={styles.statValue}>{count} exam(s)</span>
                            </div>
                          ))}
                          {Object.keys(detailedStats.difficultyStats || {}).length === 0 && (
                            <div style={styles.noData}>No difficulty data available</div>
                          )}
                        </div>
                      </div>

                      {/* Progress Card */}
                      <div style={styles.statsCard}>
                        <h3 style={styles.statsTitle}>🚀 Your Progress</h3>
                        <div style={styles.progressInfo}>
                          <p>Keep up the great work! Your learning journey is showing excellent progress.</p>
                          <div style={styles.tips}>
                            <strong>💡 Tips for improvement:</strong>
                            <ul style={styles.tipsList}>
                              <li>Review exams you didn't pass</li>
                              <li>Focus on weaker categories</li>
                              <li>Practice time management</li>
                              <li>Take breaks between exams</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div style={styles.sidebar}>
            <div style={styles.infoCard}>
              <h3 style={styles.infoTitle}>ℹ️ Profile Info</h3>
              <div style={styles.guidelinesList}>
                <div style={styles.guidelineItem}>
                  <div style={styles.guidelineIcon}>👤</div>
                  <div style={styles.guidelineContent}>
                    <strong>Profile Management</strong>
                    <p>Update your personal information</p>
                  </div>
                </div>
                <div style={styles.guidelineItem}>
                  <div style={styles.guidelineIcon}>🔒</div>
                  <div style={styles.guidelineContent}>
                    <strong>Password Security</strong>
                    <p>Change your password regularly</p>
                  </div>
                </div>
                <div style={styles.guidelineItem}>
                  <div style={styles.guidelineIcon}>📊</div>
                  <div style={styles.guidelineContent}>
                    <strong>Track Progress</strong>
                    <p>Monitor your exam performance</p>
                  </div>
                </div>
                <div style={styles.guidelineItem}>
                  <div style={styles.guidelineIcon}>🎯</div>
                  <div style={styles.guidelineContent}>
                    <strong>Improve Skills</strong>
                    <p>Use statistics to identify areas for improvement</p>
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
  userInfoCard: {
    backgroundColor: "white",
    padding: "30px",
    borderRadius: "16px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
    border: "1px solid #e5e7eb",
    display: "flex",
    alignItems: "center",
    gap: "25px",
    marginBottom: "30px",
  },
  userAvatar: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    backgroundColor: "#1c2640ff",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "2rem",
    fontWeight: "bold",
    flexShrink: 0,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: "2rem",
    color: "#1c2640ff",
    margin: "0 0 8px 0",
    fontWeight: "700",
  },
  userEmail: {
    color: "#64748b",
    margin: "0 0 8px 0",
    fontSize: "1.1rem",
  },
  userSince: {
    color: "#94a3b8",
    margin: 0,
    fontSize: "0.9rem",
  },
  tabs: {
    display: "flex",
    gap: "0",
    marginBottom: "30px",
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    border: "1px solid #e5e7eb",
    overflow: "hidden",
  },
  tab: {
    backgroundColor: "transparent",
    border: "none",
    padding: "16px 24px",
    cursor: "pointer",
    fontSize: "0.95rem",
    fontWeight: "500",
    transition: "all 0.3s ease",
    color: "#64748b",
    flex: 1,
    textAlign: "center",
  },
  activeTab: {
    backgroundColor: "#1c2640ff",
    color: "white",
    fontWeight: "600",
  },
  tabContent: {
    backgroundColor: "white",
    padding: "30px",
    borderRadius: "16px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
    border: "1px solid #e5e7eb",
    minHeight: "500px",
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
  resultsCount: {
    color: "#dc2626",
    fontWeight: "700",
    fontSize: "1rem",
  },
  subTitle: {
    fontSize: "1.2rem",
    color: "#1c2640ff",
    marginBottom: "20px",
    fontWeight: "600",
  },
  profileForm: {
    maxWidth: "100%",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "20px",
    marginBottom: "20px",
  },
  inputGroup: {
    marginBottom: "20px",
  },
  label: {
    display: "block",
    marginBottom: "8px",
    color: "#374151",
    fontWeight: "600",
    fontSize: "0.95rem",
  },
  input: {
    width: "100%",
    padding: "14px 16px",
    borderRadius: "10px",
    border: "2px solid #e2e8f0",
    outline: "none",
    fontSize: "1rem",
    transition: "all 0.3s ease",
    backgroundColor: "white",
  },
  passwordSection: {
    marginTop: "30px",
    padding: "25px",
    backgroundColor: "#fafbfc",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
  },
  buttonGroup: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: "30px",
  },
  submitButton: {
    backgroundColor: "#1c2640ff",
    color: "white",
    border: "none",
    padding: "16px 32px",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: "600",
    transition: "all 0.3s ease",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  buttonDisabled: {
    backgroundColor: "#94a3b8",
    cursor: "not-allowed",
  },
  loadingSpinner: {
    width: "16px",
    height: "16px",
    border: "2px solid transparent",
    borderTop: "2px solid white",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  success: {
    backgroundColor: "#dcfce7",
    color: "#166534",
    padding: "16px 20px",
    borderRadius: "10px",
    marginBottom: "25px",
    fontSize: "0.95rem",
    border: "1px solid #bbf7d0",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  error: {
    backgroundColor: "#fee2e2",
    color: "#dc2626",
    padding: "16px 20px",
    borderRadius: "10px",
    marginBottom: "25px",
    fontSize: "0.95rem",
    border: "1px solid #fecaca",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  successIcon: {
    fontSize: "1.1rem",
  },
  errorIcon: {
    fontSize: "1.1rem",
  },
  resultsSection: {
    // Results section styles
  },
  resultsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))",
    gap: "20px",
  },
  resultCard: {
    backgroundColor: "#fafbfc",
    padding: "25px",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    transition: "all 0.3s ease",
  },
  resultHeader: {
    marginBottom: "20px",
  },
  examTitleSection: {
    flex: 1,
  },
  examTitle: {
    fontSize: "1.2rem",
    color: "#1c2640ff",
    margin: "0 0 12px 0",
    fontWeight: "600",
  },
  examMeta: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
  },
  categoryTag: {
    backgroundColor: "#e2e8f0",
    color: "#475569",
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "0.8rem",
    fontWeight: "500",
  },
  statusBadge: {
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "0.8rem",
    fontWeight: "600",
  },
  passedBadge: {
    backgroundColor: "#dcfce7",
    color: "#166534",
  },
  failedBadge: {
    backgroundColor: "#fee2e2",
    color: "#dc2626",
  },
  resultDetails: {
    // Result details styles
  },
  detailGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
  },
  detailItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px 0",
  },
  detailLabel: {
    color: "#64748b",
    fontSize: "0.9rem",
    fontWeight: "500",
  },
  detailValue: {
    color: "#1c2640ff",
    fontSize: "0.9rem",
    fontWeight: "600",
  },
  statsSection: {
    // Statistics section styles
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "25px",
  },
  statsCard: {
    backgroundColor: "#fafbfc",
    padding: "25px",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
  },
  statsTitle: {
    fontSize: "1.2rem",
    color: "#1c2640ff",
    margin: "0 0 20px 0",
    fontWeight: "600",
    borderBottom: "1px solid #e2e8f0",
    paddingBottom: "10px",
  },
  statsList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  statItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px 0",
  },
  statLabel: {
    color: "#64748b",
    fontSize: "0.9rem",
    fontWeight: "500",
  },
  statValue: {
    color: "#1c2640ff",
    fontSize: "0.9rem",
    fontWeight: "600",
  },
  progressInfo: {
    color: "#475569",
    fontSize: "0.9rem",
    lineHeight: "1.6",
  },
  tips: {
    marginTop: "15px",
  },
  tipsList: {
    margin: "10px 0 0 20px",
    lineHeight: "1.6",
  },
  emptyState: {
    textAlign: "center",
    padding: "60px 40px",
  },
  emptyIcon: {
    fontSize: "80px",
    marginBottom: "25px",
  },
  noData: {
    textAlign: "center",
    color: "#94a3b8",
    fontStyle: "italic",
    padding: "20px",
  },
  primaryButton: {
    backgroundColor: "#1c2640ff",
    color: "white",
    border: "none",
    padding: "12px 24px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "0.95rem",
    fontWeight: "500",
    transition: "all 0.3s ease",
  },
  loading: {
    textAlign: "center",
    padding: "60px 20px",
    fontSize: "18px",
    color: "#64748b",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "15px",
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
  guidelinesList: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  guidelineItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    padding: "15px",
    backgroundColor: "#f8fafc",
    borderRadius: "10px",
    border: "1px solid #e2e8f0",
  },
  guidelineIcon: {
    fontSize: "1.1rem",
    marginTop: "2px",
  },
  guidelineContent: {
    flex: 1,
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
    
    input:focus, textarea:focus, select:focus {
      border-color: #1c2640ff !important;
      box-shadow: 0 0 0 3px rgba(28, 38, 64, 0.1) !important;
    }
    
    .back-button:hover {
      background-color: rgba(255,255,255,0.25) !important;
    }
    
    .tab:hover:not(.active-tab) {
      background-color: #f1f5f9 !important;
      color: #1c2640ff !important;
    }
    
    .submit-button:hover:not(:disabled) {
      background-color: #2d3748 !important;
      transform: translateY(-1px) !important;
    }
    
    .primary-button:hover {
      background-color: #2d3748 !important;
    }
    
    .result-card:hover {
      transform: translateY(-2px) !important;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important;
    }
    
    .stats-card:hover {
      transform: translateY(-2px) !important;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important;
    }
  `;
  document.head.appendChild(style);
}

export default UserProfile;