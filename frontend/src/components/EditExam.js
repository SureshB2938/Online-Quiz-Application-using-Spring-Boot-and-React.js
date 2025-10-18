import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

function EditExam() {
  const navigate = useNavigate();
  const { examId } = useParams();
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    description: "",
    duration: 60,
    totalMarks: 100,
    passingMarks: 40,
    difficultyLevel: "MEDIUM",
    isActive: true
  });

  useEffect(() => {
    const fetchExamDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:8080/api/exams/${examId}`);
        const data = await response.json();
        
        if (response.ok && data.status === "success") {
          setExam(data.exam);
          setFormData({
            title: data.exam.title,
            category: data.exam.category,
            description: data.exam.description || "",
            duration: data.exam.duration,
            totalMarks: data.exam.totalMarks,
            passingMarks: data.exam.passingMarks,
            difficultyLevel: data.exam.difficultyLevel,
            isActive: data.exam.isActive
          });
        } else {
          setError("Failed to load exam details");
        }
      } catch (error) {
        console.error("Fetch exam error:", error);
        setError("Failed to load exam details");
      } finally {
        setLoading(false);
      }
    };

    if (examId) {
      fetchExamDetails();
    }
  }, [examId]); // Only depend on examId

  // ... rest of the component remains the same
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    if (!formData.title.trim() || !formData.category.trim()) {
      setError("Title and Category are required");
      setSaving(false);
      return;
    }

    if (formData.passingMarks > formData.totalMarks) {
      setError("Passing marks cannot be greater than total marks");
      setSaving(false);
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/api/exams/${examId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok && data.status === "success") {
        setMessage("Exam updated successfully!");
        setExam(data.exam);
      } else {
        setError(data.message || "Failed to update exam");
      }
    } catch (error) {
      console.error("Update exam error:", error);
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    navigate("/admin/exams");
  };

  const handleManageQuestions = () => {
    navigate(`/admin/exams/${examId}/questions`);
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <header style={styles.adminHeader}>
          <div style={styles.headerContent}>
            <h2>✏️ Edit Exam</h2>
          </div>
        </header>
        <div style={styles.loading}>Loading exam details...</div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div style={styles.container}>
        <header style={styles.adminHeader}>
          <div style={styles.headerContent}>
            <h2>✏️ Edit Exam</h2>
          </div>
        </header>
        <div style={styles.error}>Exam not found</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <header style={styles.adminHeader}>
        <div style={styles.headerContent}>
          <div style={styles.headerMain}>
            <h2>✏️ Edit Exam</h2>
            <button 
              onClick={handleBack}
              style={styles.backButton}
            >
              ← Back to Exams
            </button>
          </div>
        </div>
      </header>

      <div style={styles.mainContent}>
        <div style={styles.contentGrid}>
          <div style={styles.formCard}>
            <h3 style={styles.formTitle}>Exam Details</h3>
            
            {message && (
              <div style={styles.success}>
                ✅ {message}
              </div>
            )}
            
            {error && (
              <div style={styles.error}>
                ❌ {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={styles.formGrid}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Exam Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    style={styles.input}
                    placeholder="Enter exam title"
                    required
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Category *</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    style={styles.input}
                    placeholder="e.g., Science, Mathematics, General"
                    required
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    style={styles.textarea}
                    placeholder="Enter exam description (optional)"
                    rows="3"
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Duration (minutes) *</label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
                    style={styles.input}
                    min="1"
                    max="300"
                    required
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Total Marks *</label>
                  <input
                    type="number"
                    value={formData.totalMarks}
                    onChange={(e) => handleInputChange('totalMarks', parseInt(e.target.value))}
                    style={styles.input}
                    min="1"
                    max="500"
                    required
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Passing Marks *</label>
                  <input
                    type="number"
                    value={formData.passingMarks}
                    onChange={(e) => handleInputChange('passingMarks', parseInt(e.target.value))}
                    style={styles.input}
                    min="1"
                    max={formData.totalMarks}
                    required
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Difficulty Level *</label>
                  <select
                    value={formData.difficultyLevel}
                    onChange={(e) => handleInputChange('difficultyLevel', e.target.value)}
                    style={styles.select}
                    required
                  >
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                  </select>
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Exam Status</label>
                  <div style={styles.radioGroup}>
                    <label style={styles.radioLabel}>
                      <input
                        type="radio"
                        checked={formData.isActive}
                        onChange={() => handleInputChange('isActive', true)}
                        style={styles.radio}
                      />
                      Active
                    </label>
                    <label style={styles.radioLabel}>
                      <input
                        type="radio"
                        checked={!formData.isActive}
                        onChange={() => handleInputChange('isActive', false)}
                        style={styles.radio}
                      />
                      Inactive
                    </label>
                  </div>
                </div>
              </div>

              <div style={styles.buttonGroup}>
                <button 
                  type="button"
                  onClick={handleBack}
                  style={styles.cancelButton}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  style={{
                    ...styles.submitButton,
                    ...(saving ? styles.buttonDisabled : {})
                  }}
                  disabled={saving}
                >
                  {saving ? "Updating Exam..." : "Update Exam"}
                </button>
              </div>
            </form>
          </div>

          <div style={styles.actionsCard}>
            <h3 style={styles.actionsTitle}>Quick Actions</h3>
            
            <div style={styles.actionButtons}>
              <button
                onClick={handleManageQuestions}
                style={styles.manageQuestionsButton}
              >
                📝 Manage Questions
              </button>
              <button
                onClick={() => navigate(`/admin/exams/${examId}/questions/view`)}
                style={styles.viewQuestionsButton}
              >
                👁️ View Questions
              </button>
            </div>

            <div style={styles.statsSection}>
              <h4 style={styles.statsTitle}>Exam Statistics</h4>
              <div style={styles.statsGrid}>
                <div style={styles.statItem}>
                  <span style={styles.statLabel}>Total Questions</span>
                  <span style={styles.statValue}>{exam.questionCount || 0}</span>
                </div>
                <div style={styles.statItem}>
                  <span style={styles.statLabel}>Duration</span>
                  <span style={styles.statValue}>{exam.duration}m</span>
                </div>
                <div style={styles.statItem}>
                  <span style={styles.statLabel}>Total Marks</span>
                  <span style={styles.statValue}>{exam.totalMarks}</span>
                </div>
                <div style={styles.statItem}>
                  <span style={styles.statLabel}>Passing Marks</span>
                  <span style={styles.statValue}>{exam.passingMarks}</span>
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
  },
  adminHeader: {
    backgroundColor: "#1D4ED8",
    color: "white",
    padding: "20px 0",
    boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
  },
  headerContent: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "0 20px",
  },
  headerMain: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  backButton: {
    backgroundColor: "rgba(255,255,255,0.2)",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "6px",
    cursor: "pointer",
  },
  mainContent: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "30px 20px",
  },
  contentGrid: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr",
    gap: "30px",
  },
  formCard: {
    backgroundColor: "white",
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },
  formTitle: {
    fontSize: "20px",
    color: "#1e293b",
    marginBottom: "25px",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
  },
  inputGroup: {
    marginBottom: "20px",
  },
  label: {
    display: "block",
    marginBottom: "8px",
    color: "#374151",
    fontWeight: "500",
  },
  input: {
    width: "100%",
    padding: "7px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    fontSize: "14px",
  },
  textarea: {
    width: "100%",
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    fontSize: "14px",
    resize: "vertical",
    minHeight: "80px",
  },
  select: {
    width: "100%",
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    fontSize: "14px",
    backgroundColor: "white",
  },
  radioGroup: {
    display: "flex",
    gap: "20px",
    marginTop: "8px",
  },
  radioLabel: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  buttonGroup: {
    display: "flex",
    gap: "15px",
    marginTop: "30px",
  },
  cancelButton: {
    backgroundColor: "#6b7280",
    color: "white",
    border: "none",
    padding: "14px 25px",
    borderRadius: "8px",
    cursor: "pointer",
    flex: 1,
  },
  submitButton: {
    backgroundColor: "#1d4ed8",
    color: "white",
    border: "none",
    padding: "14px 25px",
    borderRadius: "8px",
    cursor: "pointer",
    flex: 2,
  },
  buttonDisabled: {
    backgroundColor: "#93c5fd",
    cursor: "not-allowed",
  },
  actionsCard: {
    backgroundColor: "white",
    padding: "25px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },
  actionsTitle: {
    fontSize: "18px",
    color: "#1e293b",
    marginBottom: "20px",
  },
  actionButtons: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    marginBottom: "25px",
  },
  manageQuestionsButton: {
    backgroundColor: "#10b981",
    color: "white",
    border: "none",
    padding: "12px 15px",
    borderRadius: "8px",
    cursor: "pointer",
  },
  viewQuestionsButton: {
    backgroundColor: "#8b5cf6",
    color: "white",
    border: "none",
    padding: "12px 15px",
    borderRadius: "8px",
    cursor: "pointer",
  },
  statsSection: {
    borderTop: "1px solid #e5e7eb",
    paddingTop: "20px",
  },
  statsTitle: {
    fontSize: "16px",
    color: "#374151",
    marginBottom: "15px",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "15px",
  },
  statItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "12px",
    backgroundColor: "#f8fafc",
    borderRadius: "8px",
  },
  statLabel: {
    fontSize: "12px",
    color: "#64748b",
    marginBottom: "4px",
  },
  statValue: {
    fontSize: "18px",
    color: "#1e293b",
    fontWeight: "600",
  },
  success: {
    backgroundColor: "#dcfce7",
    color: "#166534",
    padding: "15px",
    borderRadius: "8px",
    marginBottom: "20px",
  },
  error: {
    backgroundColor: "#fee2e2",
    color: "#dc2626",
    padding: "15px",
    borderRadius: "8px",
    marginBottom: "20px",
  },
  loading: {
    textAlign: "center",
    padding: "100px 20px",
    fontSize: "18px",
    color: "#64748b",
  },
};

export default EditExam;