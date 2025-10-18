import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function AddExam() {
  const navigate = useNavigate();
  const [exam, setExam] = useState({
    title: "",
    description: "",
    duration: 60,
    totalMarks: 100,
    passMarks: 40,
    category: "General",
    difficultyLevel: "MEDIUM",
    isActive: true
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setExam(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setError("");
    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    // Validation
    if (exam.passMarks > exam.totalMarks) {
      setError("Pass marks cannot be greater than total marks");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/api/exams", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(exam),
      });

      const data = await response.json();

      if (response.ok && data.status === "success") {
        setMessage("Exam created successfully!");
        
        // Reset form
        setExam({
          title: "",
          description: "",
          duration: 60,
          totalMarks: 100,
          passMarks: 40,
          category: "General",
          difficultyLevel: "MEDIUM",
          isActive: true
        });

        // Redirect to exams list after 2 seconds
        setTimeout(() => {
          navigate("/admin/exams");
        }, 2000);
      } else {
        setError(data.message || "Failed to create exam");
      }
    } catch (error) {
      console.error("Create exam error:", error);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToDashboard = () => {
    navigate("/admin/dashboard");
  };

  const handleViewExams = () => {
    navigate("/admin/exams");
  };

  return (
    <div style={styles.container}>
      {/* Fixed Header */}
      <header style={styles.adminHeader}>
        <div style={styles.headerContent}>
          <div style={styles.headerMain}>
            <h2 style={styles.headerTitle}>➕ Create New Exam</h2>
            <div style={styles.headerButtons}>
              <button onClick={handleBackToDashboard} style={styles.backButton}>
                ← Dashboard
              </button>
              <button onClick={handleViewExams} style={styles.viewButton}>
                View Exams
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div style={styles.mainContent}>
        <div style={styles.contentContainer}>
          <div style={styles.formCard}>
            <div style={styles.formHeader}>
              <h1 style={styles.formTitle}>Create New Examination</h1>
              <p style={styles.formSubtitle}>Design and configure a comprehensive exam for your students</p>
            </div>
            
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

            <form onSubmit={handleSubmit} style={styles.form}>
              {/* Basic Information Section */}
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Basic Information</h3>
                <div style={styles.formGrid}>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Exam Title *</label>
                    <input
                      type="text"
                      name="title"
                      value={exam.title}
                      onChange={handleChange}
                      style={styles.input}
                      placeholder="Enter a descriptive exam title"
                      required
                    />
                  </div>

                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Category *</label>
                    <select
                      name="category"
                      value={exam.category}
                      onChange={handleChange}
                      style={styles.select}
                      required
                    >
                      <option value="General">General</option>
                      <option value="Mathematics">Mathematics</option>
                      <option value="Science">Science</option>
                      <option value="Programming">Programming</option>
                      <option value="English">English</option>
                      <option value="History">History</option>
                      <option value="Geography">Geography</option>
                      <option value="Current Affairs">Current Affairs</option>
                    </select>
                  </div>
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Description</label>
                  <textarea
                    name="description"
                    value={exam.description}
                    onChange={handleChange}
                    style={styles.textarea}
                    placeholder="Provide a detailed description of the exam, topics covered, and any special instructions..."
                    rows="4"
                  />
                </div>
              </div>

              {/* Exam Configuration Section */}
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Exam Configuration</h3>
                <div style={styles.formGrid}>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Duration (minutes) *</label>
                    <input
                      type="number"
                      name="duration"
                      value={exam.duration}
                      onChange={handleChange}
                      style={styles.input}
                      min="1"
                      max="300"
                      required
                    />
                    <small style={styles.helpText}>Recommended: 30-180 minutes</small>
                  </div>

                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Total Marks *</label>
                    <input
                      type="number"
                      name="totalMarks"
                      value={exam.totalMarks}
                      onChange={handleChange}
                      style={styles.input}
                      min="1"
                      max="500"
                      required
                    />
                  </div>

                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Pass Marks *</label>
                    <input
                      type="number"
                      name="passMarks"
                      value={exam.passMarks}
                      onChange={handleChange}
                      style={styles.input}
                      min="1"
                      max={exam.totalMarks}
                      required
                    />
                    <small style={styles.helpText}>
                      Passing percentage: {exam.totalMarks > 0 ? Math.round((exam.passMarks / exam.totalMarks) * 100) : 0}%
                    </small>
                  </div>

                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Difficulty Level *</label>
                    <select
                      name="difficultyLevel"
                      value={exam.difficultyLevel}
                      onChange={handleChange}
                      style={styles.select}
                      required
                    >
                      <option value="EASY">Easy</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HARD">Hard</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Exam Status Section */}
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Exam Status</h3>
                <div style={styles.radioGroup}>
                  <label style={styles.radioLabel}>
                    <input
                      type="radio"
                      name="isActive"
                      checked={exam.isActive}
                      onChange={() => setExam(prev => ({ ...prev, isActive: true }))}
                      style={styles.radio}
                    />
                    <span style={styles.radioCustom}></span>
                    <div style={styles.radioContent}>
                      <span style={styles.radioTitle}>Active</span>
                      <span style={styles.radioDescription}>Exam will be available to students immediately</span>
                    </div>
                  </label>
                  <label style={styles.radioLabel}>
                    <input
                      type="radio"
                      name="isActive"
                      checked={!exam.isActive}
                      onChange={() => setExam(prev => ({ ...prev, isActive: false }))}
                      style={styles.radio}
                    />
                    <span style={styles.radioCustom}></span>
                    <div style={styles.radioContent}>
                      <span style={styles.radioTitle}>Inactive</span>
                      <span style={styles.radioDescription}>Exam will be hidden from students</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={styles.buttonSection}>
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
                    {loading ? (
                      <>
                        <span style={styles.loadingSpinner}></span>
                        Creating Exam...
                      </>
                    ) : (
                      "Create Exam"
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Guidelines Section */}
          <div style={styles.guidelinesCard}>
            <div style={styles.guidelinesHeader}>
              <h3 style={styles.guidelinesTitle}>📋 Exam Creation Guidelines</h3>
            </div>
            <div style={styles.guidelinesList}>
              <div style={styles.guidelineItem}>
                <div style={styles.guidelineIcon}>🎯</div>
                <div style={styles.guidelineContent}>
                  <strong>Title & Description</strong>
                  <p>Choose a clear, descriptive title and provide comprehensive instructions</p>
                </div>
              </div>
              
              <div style={styles.guidelineItem}>
                <div style={styles.guidelineIcon}>⏱️</div>
                <div style={styles.guidelineContent}>
                  <strong>Duration & Timing</strong>
                  <p>Set reasonable time limits based on question complexity (30-180 minutes)</p>
                </div>
              </div>
              
              <div style={styles.guidelineItem}>
                <div style={styles.guidelineIcon}>📊</div>
                <div style={styles.guidelineContent}>
                  <strong>Marks Distribution</strong>
                  <p>Ensure pass marks are realistic and reflect learning objectives</p>
                </div>
              </div>
              
              <div style={styles.guidelineItem}>
                <div style={styles.guidelineIcon}>🎓</div>
                <div style={styles.guidelineContent}>
                  <strong>Difficulty Level</strong>
                  <p>Match difficulty to your target audience and learning outcomes</p>
                </div>
              </div>
              
              <div style={styles.guidelineItem}>
                <div style={styles.guidelineIcon}>📝</div>
                <div style={styles.guidelineContent}>
                  <strong>Category Selection</strong>
                  <p>Choose the appropriate subject category for better organization</p>
                </div>
              </div>
            </div>
            
            <div style={styles.tipSection}>
              <div style={styles.tipIcon}>💡</div>
              <div style={styles.tipContent}>
                <strong>Pro Tip:</strong> After creating the exam, you can add questions and configure advanced settings from the exams management page.
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
  viewButton: {
    backgroundColor: "#10b981",
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
  formCard: {
    backgroundColor: "white",
    borderRadius: "16px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
    border: "1px solid #e5e7eb",
    overflow: "hidden",
  },
  formHeader: {
    padding: "40px 40px 20px 40px",
    borderBottom: "1px solid #f1f5f9",
    backgroundColor: "#fafbfc",
  },
  formTitle: {
    fontSize: "2rem",
    color: "#1c2640ff",
    margin: "0 0 8px 0",
    fontWeight: "700",
  },
  formSubtitle: {
    fontSize: "1.1rem",
    color: "#64748b",
    margin: 0,
    fontWeight: "400",
  },
  form: {
    padding: "0",
  },
  section: {
    padding: "30px 40px",
    borderBottom: "1px solid #f1f5f9",
  },
  sectionTitle: {
    fontSize: "1.3rem",
    color: "#1c2640ff",
    margin: "0 0 25px 0",
    fontWeight: "600",
  },
 formGrid: {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
  gap: "25px",
  marginBottom: "10px",
  alignItems: "start", // Add this to align items at the top
},
inputGroup: {
  marginBottom: "20px",
  display: "flex",
  flexDirection: "column",
  height: "100%", // Ensure all input groups take full height
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
  minHeight: "52px", // Add consistent minimum height
  boxSizing: "border-box", // Ensure padding is included in height
},

  textarea: {
    width: "100%",
    padding: "14px 16px",
    borderRadius: "10px",
    border: "2px solid #e2e8f0",
    outline: "none",
    fontSize: "1rem",
    resize: "vertical",
    minHeight: "120px",
    fontFamily: "inherit",
    transition: "all 0.3s ease",
  },
  select: {
  width: "100%",
  padding: "14px 16px",
  borderRadius: "10px",
  border: "2px solid #e2e8f0",
  outline: "none",
  fontSize: "1rem",
  backgroundColor: "white",
  transition: "all 0.3s ease",
  minHeight: "52px", // Add consistent minimum height
  boxSizing: "border-box", // Ensure padding is included in height
},

  helpText: {
    color: "#6b7280",
    fontSize: "0.85rem",
    marginTop: "6px",
    display: "block",
  },
  radioGroup: {
    display: "flex",
    gap: "20px",
  },
  radioLabel: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    padding: "20px",
    border: "2px solid #e2e8f0",
    borderRadius: "12px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    flex: 1,
  },
  radio: {
    display: "none",
  },
  radioCustom: {
    width: "20px",
    height: "20px",
    border: "2px solid #d1d5db",
    borderRadius: "50%",
    marginTop: "2px",
    position: "relative",
    transition: "all 0.3s ease",
  },
  radioContent: {
    flex: 1,
  },
  radioTitle: {
    display: "block",
    fontSize: "1rem",
    fontWeight: "600",
    color: "#374151",
    marginBottom: "4px",
  },
  radioDescription: {
    display: "block",
    fontSize: "0.9rem",
    color: "#6b7280",
  },
  buttonSection: {
    padding: "30px 40px",
    backgroundColor: "#fafbfc",
  },
  buttonGroup: {
    display: "flex",
    gap: "20px",
    justifyContent: "flex-end",
  },
  cancelButton: {
    backgroundColor: "#6b7280",
    color: "white",
    border: "none",
    padding: "16px 32px",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: "600",
    transition: "all 0.3s ease",
    minWidth: "120px",
  },
  submitButton: {
    backgroundColor: "#1c2640ff",
    color: "white",
    border: "none",
    padding: "16px 40px",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: "600",
    transition: "all 0.3s ease",
    minWidth: "160px",
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
    margin: "0 40px 20px 40px",
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
    margin: "0 40px 20px 40px",
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
  guidelinesCard: {
    backgroundColor: "white",
    borderRadius: "16px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
    border: "1px solid #e5e7eb",
    height: "fit-content",
    position: "sticky",
    top: "100px",
  },
  guidelinesHeader: {
    padding: "25px 25px 15px 25px",
    borderBottom: "1px solid #f1f5f9",
    backgroundColor: "#fafbfc",
  },
  guidelinesTitle: {
    fontSize: "1.3rem",
    color: "#1c2640ff",
    margin: 0,
    fontWeight: "600",
  },
  guidelinesList: {
    padding: "20px 25px",
  },
  guidelineItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: "15px",
    padding: "15px",
    marginBottom: "15px",
    backgroundColor: "#f8fafc",
    borderRadius: "10px",
    border: "1px solid #e2e8f0",
  },
  guidelineIcon: {
    fontSize: "1.2rem",
    marginTop: "2px",
  },
  guidelineContent: {
    flex: 1,
  },
  tipSection: {
    padding: "20px 25px",
    backgroundColor: "#fef3c7",
    borderTop: "1px solid #fcd34d",
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
  },
  tipIcon: {
    fontSize: "1.1rem",
    marginTop: "2px",
  },
  tipContent: {
    flex: 1,
    fontSize: "0.9rem",
    color: "#92400e",
    lineHeight: "1.5",
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
    
    input[type="radio"]:checked + span {
      border-color: #1c2640ff !important;
      background-color: #1c2640ff !important;
    }
    
    input[type="radio"]:checked + span::after {
      content: '' !important;
      position: absolute !important;
      top: 50% !important;
      left: 50% !important;
      transform: translate(-50%, -50%) !important;
      width: 8px !important;
      height: 8px !important;
      background: white !important;
      border-radius: 50% !important;
    }
    
    .radio-label:hover {
      border-color: #1c2640ff !important;
      background-color: #f8fafc !important;
    }
    
    .back-button:hover {
      background-color: rgba(255,255,255,0.25) !important;
    }
    
    .view-button:hover {
      background-color: #059669 !important;
    }
    
    .cancel-button:hover {
      background-color: #4b5563 !important;
    }
    
    .submit-button:hover:not(:disabled) {
      background-color: #2d3748 !important;
      transform: translateY(-1px) !important;
    }
  `;
  document.head.appendChild(style);
}

export default AddExam;