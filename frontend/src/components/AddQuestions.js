import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

function AddQuestions() {
  const navigate = useNavigate();
  const { examId } = useParams();
  
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([
    {
      questionText: "",
      option1: "",
      option2: "",
      option3: "",
      option4: "",
      correctOption: 1,
      marks: 1
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);

  // Fetch exam details
  useEffect(() => {
    const fetchExamDetails = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/exams`);
        const data = await response.json();
        
        if (response.ok && data.status === "success") {
          const currentExam = data.exams.find(e => e.id === parseInt(examId));
          setExam(currentExam);
        }
      } catch (error) {
        console.error("Fetch exam error:", error);
        setError("Failed to load exam details");
      }
    };

    if (examId) {
      fetchExamDetails();
    }
  }, [examId]);

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index][field] = value;
    setQuestions(updatedQuestions);
  };

  const addNewQuestion = () => {
    const newQuestions = [
      ...questions,
      {
        questionText: "",
        option1: "",
        option2: "",
        option3: "",
        option4: "",
        correctOption: 1,
        marks: 1
      }
    ];
    setQuestions(newQuestions);
    setActiveQuestionIndex(newQuestions.length - 1);
  };

  const removeQuestion = (index) => {
    if (questions.length > 1) {
      const updatedQuestions = questions.filter((_, i) => i !== index);
      setQuestions(updatedQuestions);
      
      // Adjust active index if needed
      if (activeQuestionIndex >= updatedQuestions.length) {
        setActiveQuestionIndex(updatedQuestions.length - 1);
      } else if (activeQuestionIndex === index) {
        setActiveQuestionIndex(Math.max(0, index - 1));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    // Validate all questions
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionText.trim() || !q.option1.trim() || !q.option2.trim() || 
          !q.option3.trim() || !q.option4.trim()) {
        setError(`Please fill all fields for Question ${i + 1}`);
        setActiveQuestionIndex(i);
        setLoading(false);
        return;
      }
    }

    try {
      // Add questions one by one
      let successCount = 0;
      
      for (const question of questions) {
        const response = await fetch(`http://localhost:8080/api/exams/${examId}/questions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(question),
        });

        const data = await response.json();
        if (response.ok && data.status === "success") {
          successCount++;
        }
      }

      setMessage(`Successfully added ${successCount} out of ${questions.length} questions!`);
      
      // Clear form but keep one empty question
      setQuestions([
        {
          questionText: "",
          option1: "",
          option2: "",
          option3: "",
          option4: "",
          correctOption: 1,
          marks: 1
        }
      ]);
      setActiveQuestionIndex(0);

    } catch (error) {
      console.error("Add questions error:", error);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToExams = () => {
    navigate("/admin/exams");
  };

  const toggleExamStatus = async () => {
    if (!exam) return;
    
    try {
      const response = await fetch(`http://localhost:8080/api/exams/${examId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isActive: !exam.isActive
        }),
      });

      const data = await response.json();
      if (response.ok && data.status === "success") {
        setExam({ ...exam, isActive: !exam.isActive });
        setMessage(`Exam ${exam.isActive ? 'deactivated' : 'activated'} successfully!`);
      }
    } catch (error) {
      console.error("Toggle exam status error:", error);
      setError("Failed to update exam status");
    }
  };

  const navigateQuestion = (direction) => {
    if (direction === 'prev' && activeQuestionIndex > 0) {
      setActiveQuestionIndex(activeQuestionIndex - 1);
    } else if (direction === 'next' && activeQuestionIndex < questions.length - 1) {
      setActiveQuestionIndex(activeQuestionIndex + 1);
    }
  };

  if (!exam) {
    return (
      <div style={styles.container}>
        <header style={styles.adminHeader}>
          <div style={styles.headerContent}>
            <div style={styles.headerMain}>
              <h2 style={styles.headerTitle}>❓ Add Questions</h2>
              <div style={styles.headerButtons}>
                <button onClick={handleBackToExams} style={styles.backButton}>
                  ← Back to Exams
                </button>
              </div>
            </div>
          </div>
        </header>
        <div style={styles.loading}>
          <div style={styles.loadingSpinner}></div>
          Loading exam details...
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
            <h2 style={styles.headerTitle}>❓ Add Questions</h2>
            <div style={styles.headerButtons}>
              <button onClick={handleBackToExams} style={styles.backButton}>
                ← Back to Exams
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div style={styles.mainContent}>
        <div style={styles.contentContainer}>
          <div style={styles.mainSection}>
            {/* Exam Info */}
            <div style={styles.examInfoCard}>
              <div style={styles.examHeader}>
                <div style={styles.examTitleSection}>
                  <h1 style={styles.examTitle}>{exam.title}</h1>
                  <div style={styles.examMeta}>
                    <span style={styles.categoryTag}>{exam.category}</span>
                    <span style={styles.difficultyBadge}>{exam.difficultyLevel}</span>
                    <span style={{
                      ...styles.statusBadge,
                      ...(exam.isActive ? styles.activeBadge : styles.inactiveBadge)
                    }}>
                      {exam.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                
              </div>
              <div style={styles.examDetails}>
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
              </div>
            </div>

            <div style={styles.contentGrid}>
              {/* Questions List Sidebar */}
              <div style={styles.questionsSidebar}>
                <div style={styles.sidebarHeader}>
                  <h3 style={styles.sidebarTitle}>Questions ({questions.length})</h3>
                  <button 
  onClick={addNewQuestion}
  style={styles.addQuestionButton}
>
  + Add New
</button>
                </div>
                <div style={styles.questionsList}>
                  {questions.map((question, index) => (
                    <div
                      key={index}
                      style={{
                        ...styles.questionItem,
                        ...(index === activeQuestionIndex ? styles.activeQuestionItem : {})
                      }}
                      onClick={() => setActiveQuestionIndex(index)}
                    >
                      <span style={styles.questionItemNumber}>Q{index + 1}</span>
                      <span style={styles.questionItemText}>
                        {question.questionText || "New Question"}
                      </span>
                      {questions.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeQuestion(index);
                          }}
                          style={styles.removeItemButton}
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Question Form */}
              <div style={styles.questionForm}>
                <div style={styles.formHeader}>
                  <h2 style={styles.formTitle}>
                    Question {activeQuestionIndex + 1} of {questions.length}
                  </h2>
                  <div style={styles.navigationButtons}>
                    <button
                      type="button"
                      onClick={() => navigateQuestion('prev')}
                      disabled={activeQuestionIndex === 0}
                      style={{
                        ...styles.navButton,
                        ...(activeQuestionIndex === 0 ? styles.navButtonDisabled : {})
                      }}
                    >
                      ← Previous
                    </button>
                    <button
                      type="button"
                      onClick={() => navigateQuestion('next')}
                      disabled={activeQuestionIndex === questions.length - 1}
                      style={{
                        ...styles.navButton,
                        ...(activeQuestionIndex === questions.length - 1 ? styles.navButtonDisabled : {})
                      }}
                    >
                      Next →
                    </button>
                  </div>
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

                <form onSubmit={handleSubmit}>
                  <div style={styles.questionCard}>
                    {/* Question Text */}
                    <div style={styles.inputGroup}>
                      <label style={styles.label}>Question Text *</label>
                      <textarea
                        value={questions[activeQuestionIndex].questionText}
                        onChange={(e) => handleQuestionChange(activeQuestionIndex, 'questionText', e.target.value)}
                        style={styles.textarea}
                        placeholder="Enter your question here..."
                        rows="3"
                        required
                      />
                    </div>

                    {/* Options Grid */}
                    <div style={styles.optionsGrid}>
                      {[1, 2, 3, 4].map(optionNum => (
                        <div key={optionNum} style={styles.optionGroup}>
                          <label style={styles.label}>
                            Option {optionNum} *
                            {questions[activeQuestionIndex].correctOption === optionNum && (
                              <span style={styles.correctBadge}> ✓ Correct</span>
                            )}
                          </label>
                          <input
                            type="text"
                            value={questions[activeQuestionIndex][`option${optionNum}`]}
                            onChange={(e) => handleQuestionChange(activeQuestionIndex, `option${optionNum}`, e.target.value)}
                            style={styles.input}
                            placeholder={`Enter option ${optionNum}`}
                            required
                          />
                        </div>
                      ))}
                    </div>

                    {/* Correct Answer and Marks */}
                    <div style={styles.settingsGrid}>
                      <div style={styles.inputGroup}>
                        <label style={styles.label}>Correct Answer *</label>
                        <select
                          value={questions[activeQuestionIndex].correctOption}
                          onChange={(e) => handleQuestionChange(activeQuestionIndex, 'correctOption', parseInt(e.target.value))}
                          style={styles.select}
                          required
                        >
                          <option value={1}>Option 1</option>
                          <option value={2}>Option 2</option>
                          <option value={3}>Option 3</option>
                          <option value={4}>Option 4</option>
                        </select>
                      </div>

                      <div style={styles.inputGroup}>
                        <label style={styles.label}>Marks *</label>
                        <input
                          type="number"
                          value={questions[activeQuestionIndex].marks}
                          onChange={(e) => handleQuestionChange(activeQuestionIndex, 'marks', parseInt(e.target.value))}
                          style={styles.input}
                          min="1"
                          max="10"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div style={styles.buttonGroup}>
                    <button 
                      type="button"
                      onClick={handleBackToExams}
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
                          Adding Questions...
                        </>
                      ) : (
                        `Add All Questions (${questions.length})`
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Guidelines Sidebar */}
          <div style={styles.sidebar}>
            <div style={styles.guidelinesCard}>
              <h3 style={styles.guidelinesTitle}>📝 Question Guidelines</h3>
              <div style={styles.guidelinesList}>
                <div style={styles.guidelineItem}>
                  <div style={styles.guidelineIcon}>🎯</div>
                  <div style={styles.guidelineContent}>
                    <strong>Question Text</strong>
                    <p>Make it clear and unambiguous</p>
                  </div>
                </div>
                
                <div style={styles.guidelineItem}>
                  <div style={styles.guidelineIcon}>🔠</div>
                  <div style={styles.guidelineContent}>
                    <strong>Options</strong>
                    <p>All options should be plausible</p>
                  </div>
                </div>
                
                <div style={styles.guidelineItem}>
                  <div style={styles.guidelineIcon}>✅</div>
                  <div style={styles.guidelineContent}>
                    <strong>Correct Answer</strong>
                    <p>Select the right option carefully</p>
                  </div>
                </div>
                
                <div style={styles.guidelineItem}>
                  <div style={styles.guidelineIcon}>📊</div>
                  <div style={styles.guidelineContent}>
                    <strong>Marks</strong>
                    <p>Typically 1-5 marks per question</p>
                  </div>
                </div>
              </div>
              
              <div style={styles.tipSection}>
                <div style={styles.tipIcon}>💡</div>
                <div style={styles.tipContent}>
                  <strong>Navigation Tip:</strong> Use Previous/Next buttons or click on questions in the sidebar to navigate between questions.
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
  examInfoCard: {
    backgroundColor: "white",
    padding: "30px",
    borderRadius: "16px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
    border: "1px solid #e5e7eb",
    marginBottom: "30px",
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
    fontSize: "2rem",
    color: "#1c2640ff",
    margin: "0 0 15px 0",
    fontWeight: "700",
  },
  examMeta: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
    flexWrap: "wrap",
  },
  categoryTag: {
    backgroundColor: "#e2e8f0",
    color: "#475569",
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "0.8rem",
    fontWeight: "500",
  },
  difficultyBadge: {
    backgroundColor: "#fef3c7",
    color: "#92400e",
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "0.8rem",
    fontWeight: "600",
  },
  statusBadge: {
    padding: "6px 12px",
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
  examDetails: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "15px",
    paddingTop: "15px",
    borderTop: "1px solid #e2e8f0",
  },
  detailItem: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  },
  detailLabel: {
    color: "#64748b",
    fontSize: "0.8rem",
    fontWeight: "500",
  },
  detailValue: {
    color: "#1c2640ff",
    fontSize: "1rem",
    fontWeight: "600",
  },
  activateButton: {
    backgroundColor: "#10b981",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "0.9rem",
    fontWeight: "500",
    transition: "all 0.3s ease",
    whiteSpace: "nowrap",
  },
  deactivateButton: {
    backgroundColor: "#ef4444",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "0.9rem",
    fontWeight: "500",
    transition: "all 0.3s ease",
    whiteSpace: "nowrap",
  },
  contentGrid: {
    display: "grid",
    gridTemplateColumns: "300px 1fr",
    gap: "25px",
  },
  questionsSidebar: {
    backgroundColor: "white",
    borderRadius: "16px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
    border: "1px solid #e5e7eb",
    overflow: "hidden",
  },
 sidebarHeader: {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "12px 15px",
  borderBottom: "1px solid #e2e8f0",
  backgroundColor: "#fafbfc",
},
sidebarTitle: {
  fontSize: "0.85rem",
  color: "#1c2640ff",
  margin: 0,
  fontWeight: "600",
  display: "flex",
  alignItems: "center",
  gap: "4px",
},
questionCount: {
  color: "#dc2626", // Red color
  fontWeight: "700",
  fontSize: "0.8rem",
},
 
 addQuestionButton: {
    backgroundColor: "#fdfdfdff",
    color: "#000000ff",
    border: "none",
    padding: "0px", // No padding at all
    borderRadius: "0px",
    cursor: "pointer",
    fontSize: "0.9rem",
    fontWeight: "500",
    transition: "all 0.3s ease",
    height: "auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    whiteSpace: "nowrap",
  },

  questionsList: {
    maxHeight: "500px",
    overflowY: "auto",
  },
  questionItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "15px 20px",
    borderBottom: "1px solid #f1f5f9",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  activeQuestionItem: {
    backgroundColor: "#dbeafe",
    borderLeft: "4px solid #1c2640ff",
  },
  questionItemNumber: {
    backgroundColor: "#e2e8f0",
    color: "#475569",
    fontSize: "0.7rem",
    fontWeight: "600",
    padding: "4px 8px",
    borderRadius: "4px",
    minWidth: "30px",
    textAlign: "center",
  },
  questionItemText: {
    flex: 1,
    fontSize: "0.85rem",
    color: "#374151",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  removeItemButton: {
    backgroundColor: "transparent",
    color: "#ef4444",
    border: "none",
    fontSize: "1.2rem",
    cursor: "pointer",
    padding: "0",
    width: "24px",
    height: "24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "50%",
    transition: "all 0.3s ease",
  },
  questionForm: {
    backgroundColor: "white",
    padding: "30px",
    borderRadius: "16px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
    border: "1px solid #e5e7eb",
  },
  formHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
  },
  formTitle: {
    fontSize: "1.5rem",
    color: "#1c2640ff",
    margin: 0,
    fontWeight: "600",
  },
  navigationButtons: {
    display: "flex",
    gap: "12px",
  },
  navButton: {
    backgroundColor: "#f1f5f9",
    color: "#475569",
    border: "1px solid #e2e8f0",
    padding: "10px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "0.85rem",
    fontWeight: "500",
    transition: "all 0.3s ease",
  },
  navButtonDisabled: {
    backgroundColor: "#f8fafc",
    color: "#cbd5e1",
    cursor: "not-allowed",
    borderColor: "#e2e8f0",
  },
  questionCard: {
    padding: "0",
  },
  inputGroup: {
    marginBottom: "25px",
  },
  label: {
    display: "block",
    marginBottom: "8px",
    color: "#374151",
    fontWeight: "600",
    fontSize: "0.95rem",
  },
  textarea: {
    width: "100%",
    padding: "14px 10px",
    borderRadius: "10px",
    border: "2px solid #e2e8f0",
    outline: "none",
    fontSize: "1rem",
    resize: "vertical",
    fontFamily: "inherit",
    transition: "all 0.3s ease",
    backgroundColor: "white",
  },
 optionsGrid: {
    display: "flex",
    flexDirection: "column",
    gap: "20px", // Vertical gap between options
    marginBottom: "25px",
  },
  optionGroup: {
    marginBottom: "0", // Remove bottom margin since we're using gap
    padding: "20px", // More padding for better spacing
    backgroundColor: "#fafbfc",
    borderRadius: "12px", // Slightly more rounded
    border: "1px solid #f1f5f9",
  },
  input: {
    width: "100%",
    padding: "14px 7px",
    borderRadius: "10px",
    border: "2px solid #e2e8f0",
    outline: "none",
    fontSize: "1rem",
    transition: "all 0.3s ease",
    backgroundColor: "white",
    marginTop: "10px", // More space between label and input
  },
   correctBadge: {
    color: "#10b981",
    fontSize: "0.8rem",
    fontWeight: "600",
    marginLeft: "8px",
  },
  settingsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
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
  buttonGroup: {
    display: "flex",
    gap: "20px",
    marginTop: "30px",
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
    flex: 1,
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
    flex: 2,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
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

  // Sidebar Styles
  sidebar: {
    display: "flex",
    flexDirection: "column",
    gap: "25px",
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
    marginBottom: "20px",
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
  tipSection: {
    padding: "20px",
    backgroundColor: "#fef3c7",
    border: "1px solid #fcd34d",
    borderRadius: "10px",
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
    
    .add-question-button:hover {
      background-color: #2d3748 !important;
    }
    
    .activate-button:hover {
      background-color: #059669 !important;
    }
    
    .deactivate-button:hover {
      background-color: #dc2626 !important;
    }
    
    .cancel-button:hover {
      background-color: #4b5563 !important;
    }
    
    .submit-button:hover:not(:disabled) {
      background-color: #2d3748 !important;
      transform: translateY(-1px) !important;
    }
    
    .nav-button:hover:not(:disabled) {
      background-color: #e2e8f0 !important;
      border-color: #cbd5e1 !important;
    }
    
    .question-item:hover {
      background-color: #f1f5f9 !important;
    }
    
    .remove-item-button:hover {
      background-color: #fee2e2 !important;
    }
  `;
  document.head.appendChild(style);
}

export default AddQuestions;