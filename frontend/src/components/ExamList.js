import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function ExamList() {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedExam, setSelectedExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [showQuestionsModal, setShowQuestionsModal] = useState(false);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editExamData, setEditExamData] = useState({
    id: "",
    title: "",
    description: "",
    duration: 60,
    totalMarks: 100,
    passMarks: 40,
    category: "General",
    difficultyLevel: "MEDIUM",
    isActive: true
  });

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/exams");
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status === "success" && Array.isArray(data.exams)) {
        setExams(data.exams);
      } else {
        setExams([]);
      }
      
    } catch (error) {
      console.error("Fetch exams error:", error);
      setError(`Failed to fetch exams: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestions = async (examId) => {
    setQuestionsLoading(true);
    try {
      const response = await fetch(`http://localhost:8080/api/exams/${examId}/questions`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status === "success" && Array.isArray(data.questions)) {
        setQuestions(data.questions);
      } else {
        setQuestions([]);
      }
      
    } catch (error) {
      console.error("Fetch questions error:", error);
      setError(`Failed to fetch questions: ${error.message}`);
    } finally {
      setQuestionsLoading(false);
    }
  };

  const handleViewQuestions = async (exam) => {
    setSelectedExam(exam);
    await fetchQuestions(exam.id);
    setShowQuestionsModal(true);
  };

  const closeQuestionsModal = () => {
    setShowQuestionsModal(false);
    setSelectedExam(null);
    setQuestions([]);
  };

  const handleEditExam = (exam) => {
    setEditExamData({
      id: exam.id,
      title: exam.title,
      description: exam.description || "",
      duration: exam.duration,
      totalMarks: exam.totalMarks,
      passMarks: exam.passMarks,
      category: exam.category,
      difficultyLevel: exam.difficultyLevel,
      isActive: exam.isActive
    });
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditExamData({
      id: "",
      title: "",
      description: "",
      duration: 60,
      totalMarks: 100,
      passMarks: 40,
      category: "General",
      difficultyLevel: "MEDIUM",
      isActive: true
    });
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditExamData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleUpdateExam = async (e) => {
    e.preventDefault();
    
    // Validation
    if (editExamData.passMarks > editExamData.totalMarks) {
      setError("Pass marks cannot be greater than total marks");
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/api/exams/${editExamData.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editExamData),
      });

      const data = await response.json();

      if (response.ok && data.status === "success") {
        alert("Exam updated successfully!");
        closeEditModal();
        fetchExams(); // Refresh the list
      } else {
        alert(data.message || "Failed to update exam");
      }
    } catch (error) {
      console.error("Update exam error:", error);
      alert("Network error. Please try again.");
    }
  };

  const handleToggleActive = async (examId, currentStatus, examTitle) => {
    const newStatus = !currentStatus;
    const action = newStatus ? "activate" : "deactivate";
    
    if (!window.confirm(`Are you sure you want to ${action} "${examTitle}"?`)) {
      return;
    }

    try {
      const examToUpdate = exams.find(exam => exam.id === examId);
      const updatedExam = {
        ...examToUpdate,
        isActive: newStatus
      };

      const response = await fetch(`http://localhost:8080/api/exams/${examId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedExam),
      });

      const data = await response.json();

      if (response.ok && data.status === "success") {
        alert(`Exam ${action}d successfully!`);
        fetchExams(); // Refresh the list
      } else {
        alert(data.message || `Failed to ${action} exam`);
      }
    } catch (error) {
      console.error("Toggle active error:", error);
      alert("Network error. Please try again.");
    }
  };

  const handleBackToDashboard = () => {
    navigate("/admin/dashboard");
  };

  const handleCreateNewExam = () => {
    navigate("/admin/add-exam");
  };

  const handleAddQuestions = (examId) => {
    navigate(`/admin/add-questions/${examId}`);
  };

  const handleDeleteExam = async (examId, examTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${examTitle}"? This will also delete all questions.`)) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/api/exams/${examId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok && data.status === "success") {
        alert("Exam deleted successfully!");
        fetchExams(); // Refresh the list
      } else {
        alert(data.message || "Failed to delete exam");
      }
    } catch (error) {
      console.error("Delete exam error:", error);
      alert("Network error. Please try again.");
    }
  };

  const handleDeleteQuestion = async (questionId, questionText) => {
    if (!window.confirm(`Are you sure you want to delete this question?\n\n"${questionText.substring(0, 100)}..."`)) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/api/exams/questions/${questionId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok && data.status === "success") {
        alert("Question deleted successfully!");
        // Refresh questions list
        if (selectedExam) {
          await fetchQuestions(selectedExam.id);
        }
      } else {
        alert(data.message || "Failed to delete question");
      }
    } catch (error) {
      console.error("Delete question error:", error);
      alert("Network error. Please try again.");
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <header style={styles.adminHeader}>
          <div style={styles.headerContent}>
            <div style={styles.headerMain}>
              <h2 style={styles.headerTitle}>📚 Manage Exams</h2>
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
          Loading exams...
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Fixed Admin Header */}
      <header style={styles.adminHeader}>
        <div style={styles.headerContent}>
          <div style={styles.headerMain}>
            <h2 style={styles.headerTitle}>📚 Manage Exams</h2>
            <div style={styles.headerButtons}>
              <button onClick={handleCreateNewExam} style={styles.createButton}>
                + New Exam
              </button>
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
            <div style={styles.headerSection}>
              <h1 style={styles.title}>All Examinations</h1>
              <p style={styles.subtitle}>Manage your examination questions and settings</p>
            </div>

            {error && (
              <div style={styles.error}>
                <span style={styles.errorIcon}>❌</span>
                {error}
              </div>
            )}

            {exams.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>📝</div>
                <h3>No Exams Created Yet</h3>
                <p>Get started by creating your first examination</p>
                <button onClick={handleCreateNewExam} style={styles.primaryButton}>
                  Create Your First Exam
                </button>
              </div>
            ) : (
              <div style={styles.examsGrid}>
                {exams.map((exam) => (
                  <div key={exam.id} style={styles.examCard}>
                    <div style={styles.examHeader}>
                      <div style={styles.examTitleSection}>
                        <h3 style={styles.examTitle}>{exam.title}</h3>
                        <div style={styles.examMeta}>
                          <span style={styles.categoryTag}>{exam.category}</span>
                          <span style={{
                            ...styles.statusBadge,
                            ...(exam.isActive ? styles.activeBadge : styles.inactiveBadge)
                          }}>
                            {exam.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                      <div style={styles.difficultySection}>
                        <span style={{
                          ...styles.difficultyBadge,
                          ...(exam.difficultyLevel === 'EASY' ? styles.easyBadge : 
                              exam.difficultyLevel === 'MEDIUM' ? styles.mediumBadge : styles.hardBadge)
                        }}>
                          {exam.difficultyLevel}
                        </span>
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
                      {exam.description && (
                        <div style={styles.descriptionSection}>
                          <p style={styles.description}>{exam.description}</p>
                        </div>
                      )}
                    </div>

                    <div style={styles.examActions}>
                      <button 
                        onClick={() => handleAddQuestions(exam.id)}
                        style={styles.primaryAction}
                      >
                        ➕ Add Questions
                      </button>
                      <button 
                        onClick={() => handleViewQuestions(exam)}
                        style={styles.secondaryAction}
                      >
                        👁️ View Questions
                      </button>
                      <button 
                        onClick={() => handleEditExam(exam)}
                        style={styles.editAction}
                      >
                        ✏️ Edit
                      </button>
                      <button 
                        onClick={() => handleToggleActive(exam.id, exam.isActive, exam.title)}
                        style={{
                          ...styles.toggleAction,
                          ...(exam.isActive ? styles.deactivateAction : styles.activateAction)
                        }}
                      >
                        {exam.isActive ? '⏸️ Deactivate' : '▶️ Activate'}
                      </button>
                      <button 
                        onClick={() => handleDeleteExam(exam.id, exam.title)}
                        style={styles.dangerAction}
                      >
                        🗑️ Delete
                      </button>
                    </div>

                    <div style={styles.examFooter}>
                      <small>Created: {new Date(exam.createdAt).toLocaleDateString()}</small>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div style={styles.sidebar}>
            <div style={styles.statsCard}>
              <h3 style={styles.statsTitle}>📊 Exam Statistics</h3>
              <div style={styles.statsGrid}>
                <div style={styles.statItem}>
                  <span style={styles.statNumber}>{exams.length}</span>
                  <span style={styles.statLabel}>Total Exams</span>
                </div>
                <div style={styles.statItem}>
                  <span style={styles.statNumber}>
                    {exams.filter(exam => exam.isActive).length}
                  </span>
                  <span style={styles.statLabel}>Active Exams</span>
                </div>
                <div style={styles.statItem}>
                  <span style={styles.statNumber}>
                    {exams.reduce((total, exam) => total + (exam.questionCount || 0), 0)}
                  </span>
                  <span style={styles.statLabel}>Total Questions</span>
                </div>
              </div>
            </div>

            <div style={styles.guidelinesCard}>
              <h3 style={styles.guidelinesTitle}>💡 Quick Actions</h3>
              <div style={styles.guidelinesList}>
                <div style={styles.guidelineItem}>
                  <div style={styles.guidelineIcon}>📝</div>
                  <div style={styles.guidelineContent}>
                    <strong>Create New Exam</strong>
                    <p>Design a comprehensive examination</p>
                  </div>
                </div>
                
                <div style={styles.guidelineItem}>
                  <div style={styles.guidelineIcon}>❓</div>
                  <div style={styles.guidelineContent}>
                    <strong>Add Questions</strong>
                    <p>Populate exams with MCQs</p>
                  </div>
                </div>
                
                <div style={styles.guidelineItem}>
                  <div style={styles.guidelineIcon}>⚙️</div>
                  <div style={styles.guidelineContent}>
                    <strong>Manage Settings</strong>
                    <p>Configure duration, marks & difficulty</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Questions Modal */}
        {showQuestionsModal && selectedExam && (
          <div style={styles.modalOverlay}>
            <div style={styles.modalContent}>
              <div style={styles.modalHeader}>
                <h3>Questions for: {selectedExam.title}</h3>
                <button onClick={closeQuestionsModal} style={styles.closeButton}>
                  ✕
                </button>
              </div>
              
              <div style={styles.modalBody}>
                {questionsLoading ? (
                  <div style={styles.loading}>
                    <div style={styles.loadingSpinner}></div>
                    Loading questions...
                  </div>
                ) : questions.length === 0 ? (
                  <div style={styles.emptyQuestions}>
                    <div style={styles.emptyIcon}>❓</div>
                    <h4>No Questions Added Yet</h4>
                    <p>This exam doesn't have any questions yet.</p>
                    <button 
                      onClick={() => {
                        closeQuestionsModal();
                        handleAddQuestions(selectedExam.id);
                      }}
                      style={styles.primaryButton}
                    >
                      Add Questions
                    </button>
                  </div>
                ) : (
                  <div style={styles.questionsList}>
                    <div style={styles.questionsHeader}>
                      <span>Total Questions: {questions.length}</span>
                      <span>Total Marks: {questions.reduce((sum, q) => sum + q.marks, 0)}</span>
                    </div>
                    
                    {questions.map((question, index) => (
                      <div key={question.id} style={styles.questionItem}>
                        <div style={styles.questionHeader}>
                          <h4 style={styles.questionNumber}>Q{index + 1}. ({question.marks} marks)</h4>
                          <button 
                            onClick={() => handleDeleteQuestion(question.id, question.questionText)}
                            style={styles.smallDangerButton}
                          >
                            Delete
                          </button>
                        </div>
                        
                        <p style={styles.questionText}>{question.questionText}</p>
                        
                        <div style={styles.optionsList}>
                          {[1, 2, 3, 4].map(optNum => (
                            <div 
                              key={optNum}
                              style={{
                                ...styles.optionItem,
                                ...(question.correctOption === optNum ? styles.correctOption : {})
                              }}
                            >
                              <strong>Option {optNum}:</strong> {question[`option${optNum}`]}
                              {question.correctOption === optNum && (
                                <span style={styles.correctIndicator}> ✓ Correct</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div style={styles.modalFooter}>
                <button onClick={closeQuestionsModal} style={styles.cancelButton}>
                  Close
                </button>
                <button 
                  onClick={() => {
                    closeQuestionsModal();
                    handleAddQuestions(selectedExam.id);
                  }}
                  style={styles.primaryButton}
                >
                  Add More Questions
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Exam Modal */}
        {showEditModal && (
          <div style={styles.modalOverlay}>
            <div style={styles.modalContent}>
              <div style={styles.modalHeader}>
                <h3>Edit Exam: {editExamData.title}</h3>
                <button onClick={closeEditModal} style={styles.closeButton}>
                  ✕
                </button>
              </div>
              
              <div style={styles.modalBody}>
                <form onSubmit={handleUpdateExam} style={styles.editForm}>
                  <div style={styles.formGrid}>
                    <div style={styles.inputGroup}>
                      <label style={styles.label}>Exam Title *</label>
                      <input
                        type="text"
                        name="title"
                        value={editExamData.title}
                        onChange={handleEditChange}
                        style={styles.input}
                        required
                      />
                    </div>

                    <div style={styles.inputGroup}>
                      <label style={styles.label}>Category *</label>
                      <select
                        name="category"
                        value={editExamData.category}
                        onChange={handleEditChange}
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

                    <div style={styles.inputGroup}>
                      <label style={styles.label}>Duration (minutes) *</label>
                      <input
                        type="number"
                        name="duration"
                        value={editExamData.duration}
                        onChange={handleEditChange}
                        style={styles.input}
                        min="1"
                        max="300"
                        required
                      />
                    </div>

                    <div style={styles.inputGroup}>
                      <label style={styles.label}>Difficulty Level *</label>
                      <select
                        name="difficultyLevel"
                        value={editExamData.difficultyLevel}
                        onChange={handleEditChange}
                        style={styles.select}
                        required
                      >
                        <option value="EASY">Easy</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HARD">Hard</option>
                      </select>
                    </div>

                    <div style={styles.inputGroup}>
                      <label style={styles.label}>Total Marks *</label>
                      <input
                        type="number"
                        name="totalMarks"
                        value={editExamData.totalMarks}
                        onChange={handleEditChange}
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
                        value={editExamData.passMarks}
                        onChange={handleEditChange}
                        style={styles.input}
                        min="1"
                        max={editExamData.totalMarks}
                        required
                      />
                    </div>
                  </div>

                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Description</label>
                    <textarea
                      name="description"
                      value={editExamData.description}
                      onChange={handleEditChange}
                      style={styles.textarea}
                      placeholder="Enter exam description"
                      rows="4"
                    />
                  </div>

                  <div style={styles.checkboxGroup}>
                    <label style={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        name="isActive"
                        checked={editExamData.isActive}
                        onChange={handleEditChange}
                        style={styles.checkbox}
                      />
                      Active (Exam will be available to users)
                    </label>
                  </div>

                  <div style={styles.modalFooter}>
                    <button 
                      type="button"
                      onClick={closeEditModal}
                      style={styles.cancelButton}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      style={styles.primaryButton}
                    >
                      Update Exam
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
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
  createButton: {
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
  mainSection: {
    minHeight: "400px",
  },
  headerSection: {
    marginBottom: "40px",
  },
  title: {
    fontSize: "2rem",
    color: "#1c2640ff",
    margin: "0 0 8px 0",
    fontWeight: "700",
  },
  subtitle: {
    fontSize: "1.1rem",
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
    fontSize: "16px",
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
  emptyState: {
    textAlign: "center",
    padding: "80px 40px",
    backgroundColor: "white",
    borderRadius: "16px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
    border: "1px solid #e5e7eb",
  },
  emptyIcon: {
    fontSize: "80px",
    marginBottom: "25px",
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
    display: "flex",
    flexDirection: "column",
  },
  examHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "20px",
  },
  examTitleSection: {
    flex: 1,
  },
  examTitle: {
    fontSize: "1.4rem",
    color: "#1c2640ff",
    margin: "0 0 12px 0",
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
  statusBadge: {
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "0.8rem",
    fontWeight: "600",
  },
  activeBadge: {
    backgroundColor: "#dcfce7",
    color: "#166534",
  },
  inactiveBadge: {
    backgroundColor: "#f3f4f6",
    color: "#6b7280",
  },
  difficultySection: {
    flexShrink: 0,
  },
  difficultyBadge: {
    padding: "6px 12px",
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
    marginBottom: "25px",
    flex: 1,
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
  descriptionSection: {
    paddingTop: "15px",
    borderTop: "1px solid #e2e8f0",
  },
  description: {
    margin: 0,
    color: "#64748b",
    fontSize: "0.9rem",
    lineHeight: "1.5",
  },
  examActions: {
    display: "flex",
    gap: "8px",
    marginBottom: "20px",
    flexWrap: "wrap",
  },
  primaryAction: {
    backgroundColor: "#1c2640ff",
    color: "white",
    border: "none",
    padding: "10px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "0.85rem",
    fontWeight: "500",
    flex: "1 1 45%",
    transition: "all 0.3s ease",
  },
  secondaryAction: {
    backgroundColor: "#475569",
    color: "white",
    border: "none",
    padding: "10px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "0.85rem",
    fontWeight: "500",
    flex: "1 1 45%",
    transition: "all 0.3s ease",
  },
  editAction: {
    backgroundColor: "#f59e0b",
    color: "white",
    border: "none",
    padding: "10px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "0.85rem",
    fontWeight: "500",
    flex: "1 1 45%",
    transition: "all 0.3s ease",
  },
  toggleAction: {
    border: "none",
    padding: "10px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "0.85rem",
    fontWeight: "500",
    flex: "1 1 45%",
    transition: "all 0.3s ease",
  },
  activateAction: {
    backgroundColor: "#10b981",
    color: "white",
  },
  deactivateAction: {
    backgroundColor: "#f59e0b",
    color: "white",
  },
  dangerAction: {
    backgroundColor: "#dc2626",
    color: "white",
    border: "none",
    padding: "10px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "0.85rem",
    fontWeight: "500",
    flex: "1 1 45%",
    transition: "all 0.3s ease",
  },
  examFooter: {
    borderTop: "1px solid #e2e8f0",
    paddingTop: "15px",
    textAlign: "center",
    color: "#94a3b8",
    fontSize: "0.8rem",
  },

  // Sidebar Styles
  sidebar: {
    display: "flex",
    flexDirection: "column",
    gap: "25px",
  },
  statsCard: {
    backgroundColor: "white",
    borderRadius: "16px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
    border: "1px solid #e5e7eb",
    padding: "25px",
  },
  statsTitle: {
    fontSize: "1.2rem",
    color: "#1c2640ff",
    margin: "0 0 20px 0",
    fontWeight: "600",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "15px",
  },
  statItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "20px",
    backgroundColor: "#f8fafc",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
  },
  statNumber: {
    fontSize: "2rem",
    color: "#1c2640ff",
    fontWeight: "700",
    marginBottom: "5px",
  },
  statLabel: {
    fontSize: "0.9rem",
    color: "#64748b",
    fontWeight: "500",
  },
  guidelinesCard: {
    backgroundColor: "white",
    borderRadius: "16px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
    border: "1px solid #e5e7eb",
    padding: "25px",
  },
  guidelinesTitle: {
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

  // Modal Styles
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2000,
    padding: "20px",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: "16px",
    width: "90%",
    maxWidth: "800px",
    maxHeight: "90vh",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "25px 30px",
    borderBottom: "1px solid #e2e8f0",
    backgroundColor: "#fafbfc",
  },
  closeButton: {
    backgroundColor: "transparent",
    border: "none",
    fontSize: "20px",
    cursor: "pointer",
    color: "#64748b",
    padding: "5px",
    borderRadius: "5px",
    transition: "all 0.3s ease",
  },
  modalBody: {
    flex: 1,
    padding: "0",
    overflow: "auto",
  },
  modalFooter: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "15px",
    padding: "25px 30px",
    borderTop: "1px solid #e2e8f0",
    backgroundColor: "#fafbfc",
  },
  emptyQuestions: {
    textAlign: "center",
    padding: "60px 40px",
  },
  questionsList: {
    padding: "30px",
  },
  questionsHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "25px",
    padding: "20px",
    backgroundColor: "#f8fafc",
    borderRadius: "12px",
    fontWeight: "600",
    color: "#1c2640ff",
  },
  questionItem: {
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    padding: "25px",
    marginBottom: "20px",
    backgroundColor: "#fafafa",
  },
  questionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "15px",
  },
  questionNumber: {
    margin: 0,
    color: "#1c2640ff",
    fontSize: "1.1rem",
  },
  smallDangerButton: {
    backgroundColor: "#ef4444",
    color: "white",
    border: "none",
    padding: "8px 16px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "0.8rem",
    fontWeight: "500",
    transition: "all 0.3s ease",
  },
  questionText: {
    margin: "0 0 20px 0",
    fontSize: "1rem",
    lineHeight: "1.6",
    color: "#374151",
  },
  optionsList: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  optionItem: {
    padding: "12px 16px",
    borderRadius: "8px",
    backgroundColor: "white",
    border: "1px solid #e2e8f0",
    fontSize: "0.9rem",
  },
  correctOption: {
    backgroundColor: "#dcfce7",
    borderColor: "#bbf7d0",
  },
  correctIndicator: {
    color: "#059669",
    fontWeight: "600",
    marginLeft: "10px",
  },
  cancelButton: {
    backgroundColor: "#6b7280",
    color: "white",
    border: "none",
    padding: "12px 24px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "0.9rem",
    fontWeight: "500",
    transition: "all 0.3s ease",
  },
  primaryButton: {
    backgroundColor: "#1c2640ff",
    color: "white",
    border: "none",
    padding: "12px 24px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "0.9rem",
    fontWeight: "500",
    transition: "all 0.3s ease",
  },

  // Edit Form Styles
  editForm: {
    padding: "30px",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
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
  select: {
    width: "100%",
    padding: "14px 16px",
    borderRadius: "10px",
    border: "2px solid #e2e8f0",
    outline: "none",
    fontSize: "1rem",
    backgroundColor: "white",
    transition: "all 0.3s ease",
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
  checkboxGroup: {
    marginBottom: "25px",
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    color: "#374151",
    fontSize: "0.95rem",
    cursor: "pointer",
    gap: "10px",
  },
  checkbox: {
    width: "18px",
    height: "18px",
    cursor: "pointer",
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
    
    .exam-card:hover {
      transform: translateY(-5px) !important;
      box-shadow: 0 12px 40px rgba(0,0,0,0.15) !important;
    }
    
    .back-button:hover {
      background-color: rgba(255,255,255,0.25) !important;
    }
    
    .create-button:hover {
      background-color: #059669 !important;
    }
    
    .primary-action:hover, .secondary-action:hover, .edit-action:hover, 
    .toggle-action:hover, .danger-action:hover, .primary-button:hover {
      transform: translateY(-1px) !important;
      opacity: 0.9 !important;
    }
    
    .cancel-button:hover {
      background-color: #4b5563 !important;
    }
    
    .close-button:hover {
      background-color: #e2e8f0 !important;
      color: #374151 !important;
    }
    
    .small-danger-button:hover {
      background-color: #dc2626 !important;
    }
  `;
  document.head.appendChild(style);
}

export default ExamList;