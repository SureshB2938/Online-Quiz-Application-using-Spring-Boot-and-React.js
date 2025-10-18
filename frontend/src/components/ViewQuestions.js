import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

function ViewQuestions() {
  const navigate = useNavigate();
  const { examId } = useParams();
  const [questions, setQuestions] = useState([]);
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchExamAndQuestions = async () => {
      try {
        setLoading(true);
        // Fetch exam details
        const examResponse = await fetch(`http://localhost:8080/api/exams/${examId}`);
        const examData = await examResponse.json();
        
        if (examResponse.ok && examData.status === "success") {
          setExam(examData.exam);
        }

        // Fetch questions
        const questionsResponse = await fetch(`http://localhost:8080/api/exams/${examId}/questions`);
        const questionsData = await questionsResponse.json();
        
        if (questionsResponse.ok && questionsData.status === "success") {
          setQuestions(questionsData.questions);
        } else {
          setError("Failed to load questions");
        }
      } catch (error) {
        console.error("Fetch error:", error);
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    if (examId) {
      fetchExamAndQuestions();
    }
  }, [examId]); // Only depend on examId

  // ... rest of the component remains the same
  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm("Are you sure you want to delete this question?")) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/api/exams/${examId}/questions/${questionId}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (response.ok && data.status === "success") {
        setMessage("Question deleted successfully!");
        setQuestions(questions.filter(q => q.id !== questionId));
      } else {
        setError("Failed to delete question");
      }
    } catch (error) {
      console.error("Delete question error:", error);
      setError("Network error while deleting question");
    }
  };

  const handleEditQuestion = (questionId) => {
    navigate(`/admin/exams/${examId}/questions/edit/${questionId}`);
  };

  const handleAddQuestions = () => {
    navigate(`/admin/exams/${examId}/questions`);
  };

  const handleBack = () => {
    navigate("/admin/exams");
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <header style={styles.adminHeader}>
          <div style={styles.headerContent}>
            <h2>📋 View Questions</h2>
          </div>
        </header>
        <div style={styles.loading}>Loading questions...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <header style={styles.adminHeader}>
        <div style={styles.headerContent}>
          <div style={styles.headerMain}>
            <h2>📋 View Questions</h2>
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
        {exam && (
          <div style={styles.examInfo}>
            <h3 style={styles.examTitle}>{exam.title}</h3>
            <div style={styles.examDetails}>
              <span><strong>Category:</strong> {exam.category}</span>
              <span><strong>Questions:</strong> {questions.length}</span>
              <span><strong>Total Marks:</strong> {exam.totalMarks}</span>
            </div>
          </div>
        )}

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

        <div style={styles.headerActions}>
          <button 
            onClick={handleAddQuestions}
            style={styles.addButton}
          >
            ➕ Add More Questions
          </button>
        </div>

        <div style={styles.questionsList}>
          {questions.length === 0 ? (
            <div style={styles.emptyState}>
              <h3>No questions found</h3>
              <p>Add questions to this exam to get started</p>
              <button 
                onClick={handleAddQuestions}
                style={styles.addButton}
              >
                ➕ Add Questions
              </button>
            </div>
          ) : (
            questions.map((question, index) => (
              <div key={question.id} style={styles.questionCard}>
                <div style={styles.questionHeader}>
                  <h4 style={styles.questionNumber}>Question {index + 1}</h4>
                  <div style={styles.questionActions}>
                    <button
                      onClick={() => handleEditQuestion(question.id)}
                      style={styles.editButton}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDeleteQuestion(question.id)}
                      style={styles.deleteButton}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>

                <div style={styles.questionText}>
                  {question.questionText}
                </div>

                <div style={styles.optionsGrid}>
                  {[1, 2, 3, 4].map(optionNum => (
                    <div 
                      key={optionNum} 
                      style={{
                        ...styles.option,
                        ...(question.correctOption === optionNum ? styles.correctOption : {})
                      }}
                    >
                      <strong>Option {optionNum}:</strong> {question[`option${optionNum}`]}
                      {question.correctOption === optionNum && (
                        <span style={styles.correctBadge}> ✓ Correct</span>
                      )}
                    </div>
                  ))}
                </div>

                <div style={styles.questionMeta}>
                  <span><strong>Marks:</strong> {question.marks}</span>
                  <span><strong>Correct Answer:</strong> Option {question.correctOption}</span>
                </div>
              </div>
            ))
          )}
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
    maxWidth: "1000px",
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
    maxWidth: "1000px",
    margin: "0 auto",
    padding: "30px 20px",
  },
  examInfo: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    marginBottom: "25px",
  },
  examTitle: {
    fontSize: "24px",
    color: "#1e293b",
    margin: "0 0 10px 0",
  },
  examDetails: {
    display: "flex",
    gap: "20px",
    color: "#64748b",
  },
  headerActions: {
    display: "flex",
    justifyContent: "flex-end",
    marginBottom: "20px",
  },
  addButton: {
    backgroundColor: "#10b981",
    color: "white",
    border: "none",
    padding: "12px 20px",
    borderRadius: "8px",
    cursor: "pointer",
  },
  questionsList: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  questionCard: {
    backgroundColor: "white",
    padding: "25px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },
  questionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "15px",
  },
  questionNumber: {
    fontSize: "18px",
    color: "#1e293b",
    margin: 0,
  },
  questionActions: {
    display: "flex",
    gap: "10px",
  },
  editButton: {
    backgroundColor: "#3b82f6",
    color: "white",
    border: "none",
    padding: "8px 12px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "12px",
  },
  deleteButton: {
    backgroundColor: "#ef4444",
    color: "white",
    border: "none",
    padding: "8px 12px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "12px",
  },
  questionText: {
    fontSize: "16px",
    color: "#374151",
    marginBottom: "20px",
    lineHeight: "1.5",
  },
  optionsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "15px",
    marginBottom: "15px",
  },
  option: {
    padding: "12px",
    backgroundColor: "#f8fafc",
    borderRadius: "8px",
    border: "1px solid #e5e7eb",
  },
  correctOption: {
    backgroundColor: "#dcfce7",
    borderColor: "#bbf7d0",
  },
  correctBadge: {
    color: "#10b981",
    fontWeight: "600",
    marginLeft: "8px",
  },
  questionMeta: {
    display: "flex",
    gap: "20px",
    color: "#64748b",
    fontSize: "14px",
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
  emptyState: {
    textAlign: "center",
    padding: "60px 20px",
    backgroundColor: "white",
    borderRadius: "12px",
  },
  loading: {
    textAlign: "center",
    padding: "100px 20px",
    fontSize: "18px",
    color: "#64748b",
  },
};

export default ViewQuestions;