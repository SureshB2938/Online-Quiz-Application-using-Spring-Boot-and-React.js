import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

function UserDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [exams, setExams] = useState([]);
  const [userStats, setUserStats] = useState({
    examsTaken: 0,
    averageScore: 0,
    passedExams: 0,
    totalTimeSpent: "0h 0m"
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [examStats, setExamStats] = useState({
    totalActive: 0,
    attempted: 0,
    available: 0
  });

  // Fetch only available exams (not attempted by user)
  const fetchAvailableExams = useCallback(async (userId) => {
    try {
      const response = await fetch(`http://localhost:8080/api/exams/available/${userId}`);
      const data = await response.json();
      
      if (data.status === "success") {
        setExams(data.exams || []);
        setExamStats({
          totalActive: data.totalActiveExams || 0,
          attempted: data.attemptedExams || 0,
          available: data.total || 0
        });
        
        // If there's a message about no active exams, show it
        if (data.message) {
          setError(data.message);
        } else {
          setError("");
        }
      } else {
        setExams([]);
        setError(data.message || "Failed to load exams");
      }
    } catch (error) {
      console.error("Fetch available exams error:", error);
      setError("Failed to load exams. Please try again.");
      setExams([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUserStats = async (userId) => {
    try {
      const response = await fetch(`http://localhost:8080/api/users/${userId}/stats`);
      const data = await response.json();
      
      if (data.status === "success") {
        setUserStats({
          examsTaken: data.data.examsTaken || 0,
          averageScore: data.data.averageScore || 0,
          passedExams: data.data.passedExams || 0,
          totalTimeSpent: data.data.totalTimeSpent || "0h 0m"
        });
      }
    } catch (error) {
      console.error("Fetch user stats error:", error);
    }
  };

  // Double-check before starting exam (extra security)
  const checkExamAttempt = async (examId) => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const response = await fetch(`http://localhost:8080/api/exam-attempts/check/${user.id}/${examId}`);
      const data = await response.json();
      
      return data.status === "success" && data.hasAttempted;
    } catch (error) {
      console.error("Check exam attempt error:", error);
      return false;
    }
  };

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    if (!userData) {
      navigate("/");
      return;
    }
    setUser(userData);
    fetchAvailableExams(userData.id);
    fetchUserStats(userData.id);
    
    // Set up polling to refresh available exams
    const interval = setInterval(() => {
      fetchAvailableExams(userData.id);
      fetchUserStats(userData.id);
    }, 10000); // Refresh every 10 seconds
    
    return () => clearInterval(interval);
  }, [navigate, fetchAvailableExams]);

  const handleStartExam = async (examId) => {
    // Final check before allowing exam start
    const hasAttempted = await checkExamAttempt(examId);
    
    if (hasAttempted) {
      alert("You have already attempted this exam. You cannot take it again.");
      // Refresh the available exams list
      const userData = JSON.parse(localStorage.getItem("user"));
      fetchAvailableExams(userData.id);
      return;
    }
    
    navigate(`/exam/${examId}`);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("userToken");
    navigate("/");
  };

  const handleViewProfile = () => {
  navigate("/user/profile");
};

  // Format the average score to show percentage
  const formatAverageScore = (score) => {
    return typeof score === 'number' ? `${Math.round(score)}%` : '0%';
  };

  if (!user) {
    return (
      <div style={styles.container}>
        <header style={styles.adminHeader}>
          <div style={styles.headerContent}>
            <div style={styles.headerMain}>
              <h2 style={styles.headerTitle}>🧠 Online Exam Portal</h2>
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
      {/* User Header */}
      <header style={styles.adminHeader}>
        <div style={styles.headerContent}>
          <div style={styles.headerMain}>
            <h2 style={styles.headerTitle}>🧠 Online Exam Portal</h2>
            <div style={styles.headerButtons}>
              <span style={styles.welcomeText}>Welcome, {user.username}</span>
              <button onClick={handleViewProfile} style={styles.profileButton}>
                👤 Profile
              </button>
              <button onClick={handleLogout} style={styles.logoutButton}>
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div style={styles.mainContent}>
        <div style={styles.contentContainer}>
          <div style={styles.mainSection}>
            <div style={styles.welcomeSection}>
              <h1 style={styles.welcomeTitle}>Available Exams</h1>
              <p style={styles.welcomeSubtitle}>
                {examStats.totalActive === 0 
                  ? "No active exams available at the moment. Please check back later."
                  : `You have ${examStats.available} out of ${examStats.totalActive} exams available to attempt.`
                }
              </p>
            </div>

            {error && !error.includes("No active exams") && (
              <div style={styles.error}>
                <span style={styles.errorIcon}>❌</span>
                {error}
              </div>
            )}

            {loading ? (
              <div style={styles.loadingSection}>
                <div style={styles.loading}>
                  <div style={styles.loadingSpinner}></div>
                  Loading available exams...
                </div>
              </div>
            ) : examStats.totalActive === 0 ? (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>📝</div>
                <h3>No Active Exams</h3>
                <p>There are no active exams available at the moment. Please check back later.</p>
                <div style={styles.tips}>
                  <h4>📚 Preparation Tips:</h4>
                  <ul style={styles.tipsList}>
                    <li>Review your study materials</li>
                    <li>Practice with sample questions</li>
                    <li>Ensure you have a quiet environment</li>
                    <li>Check your internet connection</li>
                  </ul>
                </div>
              </div>
            ) : exams.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>🎉</div>
                <h3>All Exams Completed!</h3>
                <p>You have successfully attempted all available exams ({examStats.attempted} out of {examStats.totalActive}).</p>
                <div style={styles.completedInfo}>
                  <h4>✅ Great Job!</h4>
                  <p>You've completed all available exams. Check back later for new exams!</p>
                  <div style={styles.statsSummary}>
                    <div>Exams Taken: <strong>{userStats.examsTaken}</strong></div>
                    <div>Average Score: <strong>{formatAverageScore(userStats.averageScore)}</strong></div>
                    <div>Passed Exams: <strong>{userStats.passedExams}</strong></div>
                  </div>
                </div>
              </div>
            ) : (
              <div style={styles.examsSection}>
                <div style={styles.sectionHeader}>
                  <h2 style={styles.sectionTitle}>Available Tests</h2>
                  <span style={styles.examCount}>({examStats.available})</span>
                </div>
                
                <div style={styles.examsGrid}>
                  {exams.map((exam) => (
                    <div 
                      key={exam.id} 
                      style={styles.examCard}
                    >
                      <div style={styles.examHeader}>
                        <div style={styles.examTitleSection}>
                          <h3 style={styles.examTitle}>{exam.title}</h3>
                          <div style={styles.examMeta}>
                            <span style={styles.categoryTag}>{exam.category}</span>
                            <span style={{
                              ...styles.difficultyBadge,
                              ...(exam.difficultyLevel === 'EASY' ? styles.easyBadge : 
                                  exam.difficultyLevel === 'MEDIUM' ? styles.mediumBadge : 
                                  styles.hardBadge)
                            }}>
                              {exam.difficultyLevel}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div style={styles.examDetails}>
                        <div style={styles.detailGrid}>
                          <div style={styles.detailItem}>
                            <span style={styles.detailLabel}>Duration:</span>
                            <span style={styles.detailValue}>{exam.duration} minutes</span>
                          </div>
                          <div style={styles.detailItem}>
                            <span style={styles.detailLabel}>Total Marks:</span>
                            <span style={styles.detailValue}>{exam.totalMarks}</span>
                          </div>
                          <div style={styles.detailItem}>
                            <span style={styles.detailLabel}>Pass Marks:</span>
                            <span style={styles.detailValue}>{exam.passMarks}</span>
                          </div>
                          <div style={styles.detailItem}>
                            <span style={styles.detailLabel}>Questions:</span>
                            <span style={styles.detailValue}>{exam.questionCount || 0}</span>
                          </div>
                        </div>
                      </div>

                      {exam.description && (
                        <div style={styles.examDescription}>
                          <p>{exam.description}</p>
                        </div>
                      )}

                      <div style={styles.examInstructions}>
                        <h5>📋 Important Instructions:</h5>
                        <ul style={styles.instructionsList}>
                          <li>You have {exam.duration} minutes to complete</li>
                          <li>Test will auto-submit when time expires</li>
                          <li>No switching between questions allowed</li>
                          <li>Ensure stable internet connection</li>
                          <li style={{color: '#dc2626', fontWeight: 'bold'}}>
                            ⚠️ This exam can only be attempted ONCE
                          </li>
                        </ul>
                      </div>

                      <button 
                        onClick={() => handleStartExam(exam.id)}
                        style={styles.startButton}
                      >
                        🚀 Start Exam
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* User Stats Section */}
            <div style={styles.statsSection}>
              <div style={styles.sectionHeader}>
                <h2 style={styles.sectionTitle}>Your Exam Statistics</h2>
              </div>
              <div style={styles.statsGrid}>
                <div style={styles.statCard}>
                  <div style={styles.statIcon}>📊</div>
                  <div style={styles.statNumber}>{userStats.examsTaken}</div>
                  <div style={styles.statLabel}>Exams Taken</div>
                </div>
                <div style={styles.statCard}>
                  <div style={styles.statIcon}>⭐</div>
                  <div style={styles.statNumber}>{formatAverageScore(userStats.averageScore)}</div>
                  <div style={styles.statLabel}>Average Score</div>
                </div>
                <div style={styles.statCard}>
                  <div style={styles.statIcon}>✅</div>
                  <div style={styles.statNumber}>{userStats.passedExams}</div>
                  <div style={styles.statLabel}>Passed Exams</div>
                </div>
                <div style={styles.statCard}>
                  <div style={styles.statIcon}>⏱️</div>
                  <div style={styles.statNumber}>{userStats.totalTimeSpent}</div>
                  <div style={styles.statLabel}>Total Time Spent</div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div style={styles.sidebar}>
            <div style={styles.infoCard}>
              <h3 style={styles.infoTitle}>💡 Exam Guidelines</h3>
              <div style={styles.guidelinesList}>
                <div style={styles.guidelineItem}>
                  <div style={styles.guidelineIcon}>⏰</div>
                  <div style={styles.guidelineContent}>
                    <strong>Time Management</strong>
                    <p>Each exam has a fixed time limit</p>
                  </div>
                </div>
                <div style={styles.guidelineItem}>
                  <div style={styles.guidelineIcon}>🚫</div>
                  <div style={styles.guidelineContent}>
                    <strong>Single Attempt</strong>
                    <p>Exams can only be taken once</p>
                  </div>
                </div>
                <div style={styles.guidelineItem}>
                  <div style={styles.guidelineIcon}>📝</div>
                  <div style={styles.guidelineContent}>
                    <strong>Read Instructions</strong>
                    <p>Carefully review all guidelines</p>
                  </div>
                </div>
                <div style={styles.guidelineItem}>
                  <div style={styles.guidelineIcon}>💻</div>
                  <div style={styles.guidelineContent}>
                    <strong>Stable Connection</strong>
                    <p>Ensure reliable internet access</p>
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
    alignItems: "center",
    gap: "15px",
  },
  welcomeText: {
    fontSize: "0.95rem",
    color: "white",
    fontWeight: "500",
  },
  profileButton: {
    backgroundColor: "rgba(255,255,255,0.15)",
    color: "white",
    border: "none",
    padding: "8px 16px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "0.85rem",
    fontWeight: "500",
    transition: "all 0.3s ease",
  },
  logoutButton: {
    backgroundColor: "#ef4444",
    color: "white",
    border: "none",
    padding: "8px 16px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "0.85rem",
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
  welcomeSection: {
    textAlign: "center",
    marginBottom: "40px",
  },
  welcomeTitle: {
    fontSize: "2.5rem",
    color: "#1c2640ff",
    margin: "0 0 15px 0",
    fontWeight: "700",
  },
  welcomeSubtitle: {
    fontSize: "1.2rem",
    color: "#64748b",
    margin: 0,
    fontWeight: "400",
  },
  error: {
    backgroundColor: "#fee2e2",
    color: "#dc2626",
    padding: "16px 20px",
    borderRadius: "10px",
    marginBottom: "30px",
    fontSize: "0.95rem",
    border: "1px solid #fecaca",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  errorIcon: {
    fontSize: "1.1rem",
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
  loadingSpinner: {
    width: "32px",
    height: "32px",
    border: "3px solid #e2e8f0",
    borderTop: "3px solid #1c2640ff",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  loadingSection: {
    textAlign: "center",
    padding: "80px 20px",
  },
  emptyState: {
    textAlign: "center",
    padding: "60px 40px",
    backgroundColor: "white",
    borderRadius: "16px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
    border: "1px solid #e5e7eb",
    marginBottom: "30px",
  },
  emptyIcon: {
    fontSize: "80px",
    marginBottom: "25px",
  },
  tips: {
    marginTop: "30px",
    padding: "25px",
    backgroundColor: "#f0f9ff",
    borderRadius: "12px",
    textAlign: "left",
    border: "1px solid #e0f2fe",
  },
  tipsList: {
    margin: "15px 0 0 20px",
    color: "#475569",
    lineHeight: "1.6",
  },
  completedInfo: {
    marginTop: "30px",
    padding: "25px",
    backgroundColor: "#f0f9ff",
    borderRadius: "12px",
    textAlign: "center",
    border: "1px solid #e0f2fe",
  },
  statsSummary: {
    display: "flex",
    justifyContent: "center",
    gap: "25px",
    marginTop: "20px",
    fontSize: "0.95rem",
  },
  examsSection: {
    marginBottom: "40px",
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
  examCount: {
    color: "#dc2626",
    fontWeight: "700",
    fontSize: "1rem",
  },
  examsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(450px, 1fr))",
    gap: "25px",
  },
  examCard: {
    backgroundColor: "white",
    padding: "30px",
    borderRadius: "16px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
    border: "1px solid #e5e7eb",
    transition: "all 0.3s ease",
  },
  examHeader: {
    marginBottom: "20px",
  },
  examTitleSection: {
    flex: 1,
  },
  examTitle: {
    fontSize: "1.4rem",
    color: "#1c2640ff",
    margin: "0 0 15px 0",
    fontWeight: "600",
    lineHeight: "1.3",
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
  difficultyBadge: {
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "0.8rem",
    fontWeight: "600",
  },
  easyBadge: {
    backgroundColor: "#dcfce7",
    color: "#166534",
  },
  mediumBadge: {
    backgroundColor: "#fef3c7",
    color: "#92400e",
  },
  hardBadge: {
    backgroundColor: "#fee2e2",
    color: "#dc2626",
  },
  examDetails: {
    marginBottom: "20px",
  },
  detailGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
    marginBottom: "15px",
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
  examDescription: {
    paddingTop: "15px",
    borderTop: "1px solid #e2e8f0",
    marginBottom: "20px",
  },
  examInstructions: {
    backgroundColor: "#fffbeb",
    padding: "20px",
    borderRadius: "12px",
    marginBottom: "25px",
    border: "1px solid #fef3c7",
  },
  instructionsList: {
    margin: "10px 0 0 20px",
    color: "#92400e",
    lineHeight: "1.6",
  },
  startButton: {
    width: "100%",
    backgroundColor: "#1c2640ff",
    color: "white",
    border: "none",
    padding: "16px",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "1.1rem",
    fontWeight: "600",
    transition: "all 0.3s ease",
  },
  statsSection: {
    backgroundColor: "white",
    padding: "30px",
    borderRadius: "16px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
    border: "1px solid #e5e7eb",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px",
    marginTop: "20px",
  },
  statCard: {
    textAlign: "center",
    padding: "25px",
    backgroundColor: "#fafbfc",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
  },
  statIcon: {
    fontSize: "2.5rem",
    marginBottom: "15px",
  },
  statNumber: {
    fontSize: "2rem",
    fontWeight: "700",
    color: "#1c2640ff",
    marginBottom: "8px",
  },
  statLabel: {
    color: "#64748b",
    fontSize: "0.9rem",
    fontWeight: "500",
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
    
    .exam-card:hover {
      transform: translateY(-5px) !important;
      box-shadow: 0 12px 40px rgba(0,0,0,0.15) !important;
    }
    
    .start-button:hover {
      background-color: #2d3748 !important;
      transform: translateY(-2px) !important;
    }
    
    .profile-button:hover {
      background-color: rgba(255,255,255,0.25) !important;
    }
    
    .logout-button:hover {
      background-color: #dc2626 !important;
    }
    
    .stat-card:hover {
      transform: translateY(-2px) !important;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important;
    }
  `;
  document.head.appendChild(style);
}

export default UserDashboard;