import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";

function ExamInterface() {
  const navigate = useNavigate();
  const { examId } = useParams();
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [examStarted, setExamStarted] = useState(false);
  const [examFinished, setExamFinished] = useState(false);

  // Check if user has already attempted this exam
  const checkExamAttempt = useCallback(async () => {
    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      if (!userData) return false;

      const response = await fetch(`http://localhost:8080/api/exam-attempts/check/${userData.id}/${examId}`);
      const data = await response.json();
      
      return data.status === "success" && data.hasAttempted;
    } catch (error) {
      console.error("Check exam attempt error:", error);
      return false;
    }
  }, [examId]);

  // Submit exam attempt to backend - wrapped in useCallback
  const submitExamAttempt = useCallback(async (results) => {
    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      const timeSpentMinutes = exam.duration - Math.ceil(timeLeft / 60);
      const timeSpent = `${Math.floor(timeSpentMinutes / 60)}h ${timeSpentMinutes % 60}m`;

      const response = await fetch("http://localhost:8080/api/exam-attempts/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userData.id,
          examId: parseInt(examId),
          score: results.score,
          passed: results.passed,
          timeSpent: timeSpent
        }),
      });

      const data = await response.json();
      if (data.status === "success") {
        console.log("Exam attempt recorded successfully in database");
      }
    } catch (error) {
      console.error("Submit exam attempt error:", error);
    }
  }, [exam, examId, timeLeft]);

  const fetchExamData = useCallback(async () => {
    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      if (!userData) {
        navigate("/");
        return;
      }

      // Check if user already attempted this exam
      const hasAttempted = await checkExamAttempt();
      if (hasAttempted) {
        setError("You have already attempted this exam. You cannot take it again.");
        setLoading(false);
        return;
      }

      // Fetch exam details
      const examResponse = await fetch(`http://localhost:8080/api/exams`);
      const examData = await examResponse.json();
      
      if (examResponse.ok && examData.status === "success") {
        const currentExam = examData.exams.find(e => e.id === parseInt(examId));
        if (!currentExam) {
          setError("Exam not found");
          setLoading(false);
          return;
        }
        setExam(currentExam);
        setTimeLeft(currentExam.duration * 60); // Convert minutes to seconds
        
        // Fetch questions
        const questionsResponse = await fetch(`http://localhost:8080/api/exams/${examId}/questions`);
        const questionsData = await questionsResponse.json();
        
        if (questionsResponse.ok && questionsData.status === "success") {
          setQuestions(questionsData.questions);
        } else {
          setError("Failed to load questions");
        }
      } else {
        setError("Exam not found");
      }
    } catch (error) {
      console.error("Fetch exam data error:", error);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [examId, navigate, checkExamAttempt]);

  useEffect(() => {
    fetchExamData();
  }, [fetchExamData]);

  // EXTRA SECURITY: Check access whenever exam data is loaded
  useEffect(() => {
    const checkAccess = async () => {
      const hasAttempted = await checkExamAttempt();
      if (hasAttempted) {
        setError("You have already attempted this exam. Redirecting to dashboard...");
        setTimeout(() => {
          navigate("/user/dashboard");
        }, 3000);
      }
    };
    
    if (exam) {
      checkAccess();
    }
  }, [exam, checkExamAttempt, navigate]);

  const calculateResults = useCallback(() => {
    let score = 0;
    let correctAnswers = 0;
    
    questions.forEach((question, index) => {
      if (answers[index] === question.correctOption) {
        score += question.marks;
        correctAnswers++;
      }
    });

    const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);
    const percentage = totalMarks > 0 ? (score / totalMarks) * 100 : 0;
    const passed = percentage >= (exam.passMarks / exam.totalMarks) * 100;

    const results = {
      score,
      totalMarks,
      percentage: percentage.toFixed(2),
      correctAnswers,
      totalQuestions: questions.length,
      passed,
      examId: exam.id,
      examTitle: exam.title,
      submittedAt: new Date().toISOString()
    };

    // Submit to backend
    submitExamAttempt(results);
    
    // Store locally for quick access
    localStorage.setItem(`exam_results_${examId}`, JSON.stringify(results));
    
    return results;
  }, [questions, answers, exam, examId, submitExamAttempt]);

  const handleAutoSubmit = useCallback(() => {
    if (examFinished) return;
    
    setExamFinished(true);
    const results = calculateResults();
    console.log("Exam auto-submitted with results:", results);
  }, [examFinished, calculateResults]);

  // Timer effect
  useEffect(() => {
    let timer;
    if (examStarted && timeLeft > 0 && !examFinished) {
      timer = setInterval(() => {
        setTimeLeft(time => {
          if (time <= 1) {
            handleAutoSubmit();
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [examStarted, timeLeft, examFinished, handleAutoSubmit]);

  const startExam = () => {
    setExamStarted(true);
  };

  const handleAnswerSelect = (questionIndex, selectedOption) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: selectedOption
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleManualSubmit = () => {
    if (window.confirm("Are you sure you want to submit? You cannot change answers after submission.")) {
      setExamFinished(true);
      calculateResults();
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getResults = () => {
    const results = localStorage.getItem(`exam_results_${examId}`);
    return results ? JSON.parse(results) : null;
  };

  const handleBackToDashboard = () => {
    navigate("/user/dashboard");
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <header style={styles.adminHeader}>
          <div style={styles.headerContent}>
            <div style={styles.headerMain}>
              <h2 style={styles.headerTitle}>📝 Exam Interface</h2>
            </div>
          </div>
        </header>
        <div style={styles.loading}>
          <div style={styles.loadingSpinner}></div>
          Loading exam...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <header style={styles.adminHeader}>
          <div style={styles.headerContent}>
            <div style={styles.headerMain}>
              <h2 style={styles.headerTitle}>📝 Exam Interface</h2>
              <div style={styles.headerButtons}>
                <button onClick={handleBackToDashboard} style={styles.backButton}>
                  ← Dashboard
                </button>
              </div>
            </div>
          </div>
        </header>
        <div style={styles.errorContainer}>
          <div style={styles.errorCard}>
            <h3 style={styles.errorTitle}>Access Denied</h3>
            <p style={styles.errorMessage}>{error}</p>
            {error.includes("Redirecting") ? (
              <div style={styles.redirecting}>
                <p>Redirecting in 3 seconds...</p>
              </div>
            ) : (
              <button onClick={handleBackToDashboard} style={styles.primaryButton}>
                Back to Dashboard
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (examFinished) {
    const results = getResults();
    return (
      <div style={styles.container}>
        <header style={styles.adminHeader}>
          <div style={styles.headerContent}>
            <div style={styles.headerMain}>
              <h2 style={styles.headerTitle}>📝 Exam Results</h2>
              <div style={styles.headerButtons}>
                <button onClick={handleBackToDashboard} style={styles.backButton}>
                  ← Dashboard
                </button>
              </div>
            </div>
          </div>
        </header>
        <div style={styles.mainContent}>
          <div style={styles.resultsContainer}>
            <div style={styles.resultsCard}>
              <h2 style={styles.resultsTitle}>🎉 Exam Completed!</h2>
              <p style={styles.resultsSubtitle}>Your results have been saved. You cannot retake this exam.</p>
              
              <div style={styles.resultsGrid}>
                <div style={styles.resultItem}>
                  <span style={styles.resultLabel}>Score:</span>
                  <span style={styles.resultValue}>{results.score}/{results.totalMarks}</span>
                </div>
                <div style={styles.resultItem}>
                  <span style={styles.resultLabel}>Percentage:</span>
                  <span style={styles.resultValue}>{results.percentage}%</span>
                </div>
                <div style={styles.resultItem}>
                  <span style={styles.resultLabel}>Correct Answers:</span>
                  <span style={styles.resultValue}>{results.correctAnswers}/{results.totalQuestions}</span>
                </div>
                <div style={styles.resultItem}>
                  <span style={styles.resultLabel}>Status:</span>
                  <span style={{
                    ...styles.resultValue,
                    ...(results.passed ? styles.passed : styles.failed)
                  }}>
                    {results.passed ? "PASSED ✅" : "FAILED ❌"}
                  </span>
                </div>
              </div>
              
              <div style={styles.note}>
                <strong>Note:</strong> This exam attempt has been recorded. You cannot retake this exam.
              </div>
              
              <div style={styles.buttonGroup}>
                <button onClick={handleBackToDashboard} style={styles.primaryButton}>
                  Back to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!examStarted) {
    return (
      <div style={styles.container}>
        <header style={styles.adminHeader}>
          <div style={styles.headerContent}>
            <div style={styles.headerMain}>
              <h2 style={styles.headerTitle}>📝 Exam Interface</h2>
              <div style={styles.headerButtons}>
                <button onClick={handleBackToDashboard} style={styles.backButton}>
                  ← Dashboard
                </button>
              </div>
            </div>
          </div>
        </header>
        <div style={styles.mainContent}>
          <div style={styles.instructionsContainer}>
            <div style={styles.instructionsCard}>
              <h1 style={styles.examTitle}>{exam.title}</h1>
              
              <div style={styles.instructions}>
                <h3 style={styles.instructionsTitle}>📋 Exam Instructions</h3>
                <div style={styles.instructionsList}>
                  <div style={styles.instructionItem}>
                    <strong>Total Questions:</strong> {questions.length}
                  </div>
                  <div style={styles.instructionItem}>
                    <strong>Total Marks:</strong> {exam.totalMarks}
                  </div>
                  <div style={styles.instructionItem}>
                    <strong>Duration:</strong> {exam.duration} minutes
                  </div>
                  <div style={styles.instructionItem}>
                    <strong>Passing Marks:</strong> {exam.passMarks}
                  </div>
                  <div style={styles.instructionItem}>
                    <strong>All questions are mandatory</strong>
                  </div>
                  <div style={styles.instructionItem}>
                    <strong>Timer will start when you begin the exam</strong>
                  </div>
                  <div style={styles.instructionItem}>
                    <strong>You cannot pause the exam once started</strong>
                  </div>
                  <div style={styles.instructionItem}>
                    <strong>Exam will auto-submit when time expires</strong>
                  </div>
                  <div style={{...styles.instructionItem, ...styles.warningItem}}>
                    <strong>⚠️ You can only attempt this exam ONCE</strong>
                  </div>
                </div>
              </div>

              <div style={styles.warningBox}>
                <strong>⚠️ Important:</strong> Do not refresh the page or navigate away during the exam, 
                or you may lose your progress. You can only attempt this exam once.
              </div>

              <div style={styles.buttonGroup}>
                <button onClick={startExam} style={styles.startButton}>
                  🚀 Start Exam
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div style={styles.container}>
      {/* Exam Header */}
      <header style={styles.examHeader}>
        <div style={styles.headerContent}>
          <div style={styles.headerMain}>
            <div style={styles.examInfo}>
              <h2 style={styles.examTitle}>{exam.title}</h2>
              <span style={styles.questionCounter}>Question {currentQuestion + 1} of {questions.length}</span>
            </div>
            <div style={styles.timerSection}>
              <div style={styles.timerDisplay}>
                ⏱️ {formatTime(timeLeft)}
              </div>
              <div style={styles.timeWarning}>
                {timeLeft <= 300 && "⏰ Hurry! Time running out"}
              </div>
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div style={styles.progressBar}>
          <div 
            style={{
              ...styles.progressFill,
              width: `${progress}%`
            }}
          />
        </div>
      </header>

      {/* Main Content */}
      <div style={styles.mainContent}>
        <div style={styles.questionContainer}>
          <div style={styles.questionCard}>
            <div style={styles.questionHeader}>
              <h3 style={styles.questionNumber}>
                Q{currentQuestion + 1}. ({currentQ.marks} marks)
              </h3>
              <div style={styles.answeredStatus}>
                {answers[currentQuestion] ? "✓ Answered" : "⏳ Unanswered"}
              </div>
            </div>
            
            <p style={styles.questionText}>{currentQ.questionText}</p>
            
            <div style={styles.optionsSection}>
              {[1, 2, 3, 4].map(optionNum => (
                <div 
                  key={optionNum}
                  style={{
                    ...styles.option,
                    ...(answers[currentQuestion] === optionNum ? styles.selectedOption : {})
                  }}
                  onClick={() => handleAnswerSelect(currentQuestion, optionNum)}
                >
                  <div style={styles.optionRadio}>
                    {answers[currentQuestion] === optionNum && "●"}
                  </div>
                  <div style={styles.optionText}>
                    <strong>Option {optionNum}:</strong> {currentQ[`option${optionNum}`]}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div style={styles.navigation}>
            <button 
              onClick={handlePrevQuestion}
              disabled={currentQuestion === 0}
              style={{
                ...styles.navButton,
                ...(currentQuestion === 0 ? styles.disabledButton : {})
              }}
            >
              ← Previous
            </button>
            
            <div style={styles.questionIndicator}>
              {currentQuestion + 1} / {questions.length}
            </div>

            {currentQuestion === questions.length - 1 ? (
              <button 
                onClick={handleManualSubmit}
                style={styles.submitButton}
              >
                Submit Exam ✅
              </button>
            ) : (
              <button 
                onClick={handleNextQuestion}
                style={styles.navButton}
              >
                Next →
              </button>
            )}
          </div>

          {/* Quick Navigation */}
          <div style={styles.quickNav}>
            <h4 style={styles.quickNavTitle}>Quick Navigation:</h4>
            <div style={styles.questionDots}>
              {questions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentQuestion(index)}
                  style={{
                    ...styles.dot,
                    ...(index === currentQuestion ? styles.activeDot : {}),
                    ...(answers[index] ? styles.answeredDot : styles.unansweredDot)
                  }}
                  title={`Question ${index + 1} ${answers[index] ? '(Answered)' : '(Unanswered)'}`}
                >
                  {index + 1}
                </button>
              ))}
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
  errorContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "calc(100vh - 80px)",
    padding: "40px",
  },
  errorCard: {
    backgroundColor: "white",
    padding: "40px",
    borderRadius: "16px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
    border: "1px solid #e5e7eb",
    textAlign: "center",
    maxWidth: "500px",
    width: "100%",
  },
  errorTitle: {
    fontSize: "1.5rem",
    color: "#dc2626",
    marginBottom: "15px",
    fontWeight: "600",
  },
  errorMessage: {
    color: "#64748b",
    marginBottom: "25px",
    lineHeight: "1.6",
  },
  redirecting: {
    marginTop: "20px",
    padding: "15px",
    backgroundColor: "#fef3c7",
    borderRadius: "8px",
    color: "#92400e",
  },
  instructionsContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "calc(100vh - 80px)",
    padding: "40px",
  },
  instructionsCard: {
    backgroundColor: "white",
    padding: "40px",
    borderRadius: "16px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
    border: "1px solid #e5e7eb",
    textAlign: "center",
    maxWidth: "600px",
    width: "100%",
  },
  examTitle: {
    fontSize: "2rem",
    color: "#1c2640ff",
    marginBottom: "30px",
    fontWeight: "700",
  },
  instructions: {
    textAlign: "left",
    marginBottom: "25px",
  },
  instructionsTitle: {
    fontSize: "1.3rem",
    color: "#1c2640ff",
    marginBottom: "20px",
    fontWeight: "600",
  },
  instructionsList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  instructionItem: {
    padding: "12px 16px",
    backgroundColor: "#f8fafc",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
    color: "#374151",
  },
  warningItem: {
    backgroundColor: "#fef3c7",
    borderColor: "#fcd34d",
    color: "#92400e",
  },
  warningBox: {
    backgroundColor: "#fef3c7",
    color: "#92400e",
    padding: "20px",
    borderRadius: "12px",
    marginBottom: "30px",
    border: "1px solid #fcd34d",
    textAlign: "left",
  },
  buttonGroup: {
    display: "flex",
    justifyContent: "center",
  },
  startButton: {
    backgroundColor: "#1c2640ff",
    color: "white",
    border: "none",
    padding: "16px 40px",
    borderRadius: "10px",
    fontSize: "1.2rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  primaryButton: {
    backgroundColor: "#1c2640ff",
    color: "white",
    border: "none",
    padding: "12px 24px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: "500",
    transition: "all 0.3s ease",
  },
  examHeader: {
    backgroundColor: "white",
    padding: "20px 0",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  examInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  questionCounter: {
    color: "#64748b",
    fontSize: "0.9rem",
    fontWeight: "500",
  },
  timerSection: {
    textAlign: "center",
  },
  timerDisplay: {
    fontSize: "1.5rem",
    fontWeight: "700",
    color: "#1c2640ff",
  },
  timeWarning: {
    color: "#dc2626",
    fontSize: "0.9rem",
    fontWeight: "600",
  },
  progressBar: {
    height: "4px",
    backgroundColor: "#e5e7eb",
    marginTop: "15px",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#1c2640ff",
    transition: "width 0.3s",
  },
  questionContainer: {
    maxWidth: "800px",
    margin: "0 auto",
    padding: "40px 20px",
  },
  questionCard: {
    backgroundColor: "white",
    padding: "30px",
    borderRadius: "16px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
    border: "1px solid #e5e7eb",
    marginBottom: "30px",
  },
  questionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "25px",
  },
  questionNumber: {
    color: "#1c2640ff",
    margin: 0,
    fontSize: "1.2rem",
    fontWeight: "600",
  },
  answeredStatus: {
    color: "#059669",
    fontWeight: "600",
    fontSize: "0.9rem",
  },
  questionText: {
    fontSize: "1.1rem",
    lineHeight: "1.6",
    color: "#374151",
    marginBottom: "25px",
  },
  optionsSection: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  option: {
    display: "flex",
    alignItems: "flex-start",
    padding: "16px",
    border: "2px solid #e2e8f0",
    borderRadius: "10px",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  selectedOption: {
    borderColor: "#1c2640ff",
    backgroundColor: "#f0f9ff",
  },
  optionRadio: {
    width: "20px",
    height: "20px",
    border: "2px solid #d1d5db",
    borderRadius: "50%",
    marginRight: "15px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    color: "#1c2640ff",
    flexShrink: 0,
  },
  optionText: {
    flex: 1,
    lineHeight: "1.5",
  },
  navigation: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
  },
  navButton: {
    backgroundColor: "#1c2640ff",
    color: "white",
    border: "none",
    padding: "12px 24px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: "500",
    transition: "all 0.3s ease",
  },
  disabledButton: {
    backgroundColor: "#94a3b8",
    cursor: "not-allowed",
  },
  submitButton: {
    backgroundColor: "#10b981",
    color: "white",
    border: "none",
    padding: "12px 24px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: "600",
    transition: "all 0.3s ease",
  },
  questionIndicator: {
    color: "#64748b",
    fontWeight: "500",
  },
  quickNav: {
    backgroundColor: "white",
    padding: "25px",
    borderRadius: "16px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
    border: "1px solid #e5e7eb",
  },
  quickNavTitle: {
    fontSize: "1.1rem",
    color: "#1c2640ff",
    marginBottom: "15px",
    fontWeight: "600",
  },
  questionDots: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
  },
  dot: {
    width: "40px",
    height: "40px",
    border: "2px solid #e2e8f0",
    borderRadius: "8px",
    backgroundColor: "white",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.9rem",
    fontWeight: "500",
    transition: "all 0.3s ease",
  },
  activeDot: {
    borderColor: "#1c2640ff",
    backgroundColor: "#1c2640ff",
    color: "white",
  },
  answeredDot: {
    borderColor: "#10b981",
    backgroundColor: "#10b981",
    color: "white",
  },
  unansweredDot: {
    borderColor: "#e2e8f0",
    backgroundColor: "white",
    color: "#374151",
  },
  resultsContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "calc(100vh - 80px)",
    padding: "40px",
  },
  resultsCard: {
    backgroundColor: "white",
    padding: "40px",
    borderRadius: "16px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
    border: "1px solid #e5e7eb",
    textAlign: "center",
    maxWidth: "500px",
    width: "100%",
  },
  resultsTitle: {
    fontSize: "2rem",
    color: "#1c2640ff",
    marginBottom: "15px",
    fontWeight: "700",
  },
  resultsSubtitle: {
    color: "#64748b",
    marginBottom: "30px",
    fontSize: "1.1rem",
  },
  resultsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
    marginBottom: "30px",
  },
  resultItem: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  resultLabel: {
    color: "#64748b",
    fontSize: "0.9rem",
    fontWeight: "500",
  },
  resultValue: {
    color: "#1c2640ff",
    fontSize: "1.2rem",
    fontWeight: "700",
  },
  passed: {
    color: "#059669",
  },
  failed: {
    color: "#dc2626",
  },
  note: {
    backgroundColor: "#f0f9ff",
    color: "#0369a1",
    padding: "16px",
    borderRadius: "10px",
    marginBottom: "25px",
    fontSize: "0.9rem",
    border: "1px solid #e0f2fe",
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
    
    .back-button:hover {
      background-color: rgba(255,255,255,0.25) !important;
    }
    
    .start-button:hover {
      background-color: #2d3748 !important;
      transform: translateY(-2px) !important;
    }
    
    .primary-button:hover {
      background-color: #2d3748 !important;
    }
    
    .nav-button:hover:not(.disabled-button) {
      background-color: #2d3748 !important;
      transform: translateY(-1px) !important;
    }
    
    .submit-button:hover {
      background-color: #059669 !important;
      transform: translateY(-1px) !important;
    }
    
    .option:hover {
      border-color: #93c5fd !important;
      background-color: #f8fafc !important;
    }
    
    .dot:hover {
      transform: scale(1.1) !important;
    }
  `;
  document.head.appendChild(style);
}

export default ExamInterface;