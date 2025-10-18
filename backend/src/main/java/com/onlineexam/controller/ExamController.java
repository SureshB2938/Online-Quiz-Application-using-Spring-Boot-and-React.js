// ExamController.java
package com.onlineexam.controller;

import com.onlineexam.model.Exam;
import com.onlineexam.model.Question;
import com.onlineexam.repository.ExamRepository;
import com.onlineexam.repository.QuestionRepository;
import com.onlineexam.repository.ExamAttemptRepository;
import com.onlineexam.services.UserStatsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/exams")
@CrossOrigin(origins = "http://localhost:3000")
public class ExamController {

    @Autowired
    private ExamRepository examRepository;

    @Autowired
    private QuestionRepository questionRepository;
    
    @Autowired
    private ExamAttemptRepository examAttemptRepository;
@Autowired
private UserStatsService userStatsService;
    // Get all exams
    // In ExamController.java - temporary fix for testing
@GetMapping
public ResponseEntity<?> getAllExams() {
    try {
        List<Exam> exams = examRepository.findAll();
        
        // Create a simplified response without questions to avoid circular reference
        List<Map<String, Object>> examList = new ArrayList<>();
        for (Exam exam : exams) {
            Map<String, Object> examMap = new HashMap<>();
            examMap.put("id", exam.getId());
            examMap.put("title", exam.getTitle());
            examMap.put("description", exam.getDescription());
            examMap.put("duration", exam.getDuration());
            examMap.put("totalMarks", exam.getTotalMarks());
            examMap.put("passMarks", exam.getPassMarks());
            examMap.put("category", exam.getCategory());
            examMap.put("difficultyLevel", exam.getDifficultyLevel());
            examMap.put("isActive", exam.getIsActive());
            examMap.put("createdAt", exam.getCreatedAt());
            examMap.put("questionCount", exam.getQuestions().size()); // Just count, not the actual questions
            
            examList.add(examMap);
        }
        
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("exams", examList);
        response.put("total", exams.size());
        
        return ResponseEntity.ok(response);
    } catch (Exception e) {
        Map<String, String> errorResponse = new HashMap<>();
        errorResponse.put("message", "Error fetching exams: " + e.getMessage());
        errorResponse.put("status", "error");
        return ResponseEntity.badRequest().body(errorResponse);
    }

}
    @GetMapping("/active")
public ResponseEntity<?> getActiveExams() {
    try {
        List<Exam> exams = examRepository.findByIsActiveTrue();
        
        // Create simplified response without circular references
        List<Map<String, Object>> examList = new ArrayList<>();
        for (Exam exam : exams) {
            Map<String, Object> examMap = new HashMap<>();
            examMap.put("id", exam.getId());
            examMap.put("title", exam.getTitle());
            examMap.put("description", exam.getDescription());
            examMap.put("duration", exam.getDuration());
            examMap.put("totalMarks", exam.getTotalMarks());
            examMap.put("passMarks", exam.getPassMarks());
            examMap.put("category", exam.getCategory());
            examMap.put("difficultyLevel", exam.getDifficultyLevel());
            examMap.put("isActive", exam.getIsActive());
            examMap.put("createdAt", exam.getCreatedAt());
            examMap.put("questionCount", exam.getQuestions().size());
            
            examList.add(examMap);
        }
        
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("exams", examList);
        response.put("total", exams.size());
        
        return ResponseEntity.ok(response);
    } catch (Exception e) {
        Map<String, String> errorResponse = new HashMap<>();
        errorResponse.put("message", "Error fetching active exams: " + e.getMessage());
        errorResponse.put("status", "error");
        return ResponseEntity.badRequest().body(errorResponse);
    }
}
    // Create new exam
    @PostMapping
    public ResponseEntity<?> createExam(@RequestBody Exam exam) {
        try {
            Exam savedExam = examRepository.save(exam);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Exam created successfully");
            response.put("status", "success");
            response.put("exam", savedExam);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", "Error creating exam: " + e.getMessage());
            errorResponse.put("status", "error");
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    // Update exam
    @PutMapping("/{id}")
    public ResponseEntity<?> updateExam(@PathVariable Long id, @RequestBody Exam examDetails) {
        try {
            Exam exam = examRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Exam not found with id: " + id));

            exam.setTitle(examDetails.getTitle());
            exam.setDescription(examDetails.getDescription());
            exam.setDuration(examDetails.getDuration());
            exam.setTotalMarks(examDetails.getTotalMarks());
            exam.setPassMarks(examDetails.getPassMarks());
            exam.setCategory(examDetails.getCategory());
            exam.setDifficultyLevel(examDetails.getDifficultyLevel());
            exam.setIsActive(examDetails.getIsActive());

            Exam updatedExam = examRepository.save(exam);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Exam updated successfully");
            response.put("status", "success");
            response.put("exam", updatedExam);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", "Error updating exam: " + e.getMessage());
            errorResponse.put("status", "error");
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    // Delete exam
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteExam(@PathVariable Long id, @RequestParam(required = false, defaultValue = "false") boolean force) {
        try {
            Exam exam = examRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Exam not found with id: " + id));

            long attemptCount = examAttemptRepository.countByExamId(id);
            if (attemptCount > 0 && !force) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("message", "Cannot delete exam: there are " + attemptCount + " exam attempts referencing this exam. Use ?force=true to remove attempts and delete.");
                errorResponse.put("status", "error");
                errorResponse.put("attempts", attemptCount);
                return ResponseEntity.badRequest().body(errorResponse);
            }

            // If force is true, delete associated attempts first
            if (attemptCount > 0 && force) {
                List<com.onlineexam.model.ExamAttempt> attempts = examAttemptRepository.findByExamId(id);
                examAttemptRepository.deleteAll(attempts);
            }

            examRepository.delete(exam);

            Map<String, String> response = new HashMap<>();
            response.put("message", "Exam deleted successfully");
            response.put("status", "success");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", "Error deleting exam: " + e.getMessage());
            errorResponse.put("status", "error");
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    // Get questions for an exam
    @GetMapping("/{examId}/questions")
    public ResponseEntity<?> getExamQuestions(@PathVariable Long examId) {
        try {
            List<Question> questions = questionRepository.findByExamId(examId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("questions", questions);
            response.put("totalQuestions", questions.size());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", "Error fetching questions: " + e.getMessage());
            errorResponse.put("status", "error");
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    // Add question to exam
    @PostMapping("/{examId}/questions")
    public ResponseEntity<?> addQuestionToExam(@PathVariable Long examId, @RequestBody Question question) {
        try {
            Exam exam = examRepository.findById(examId)
                    .orElseThrow(() -> new RuntimeException("Exam not found with id: " + examId));
            
            question.setExam(exam);
            Question savedQuestion = questionRepository.save(question);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Question added successfully");
            response.put("status", "success");
            response.put("question", savedQuestion);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", "Error adding question: " + e.getMessage());
            errorResponse.put("status", "error");
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    // Update question
    @PutMapping("/questions/{questionId}")
    public ResponseEntity<?> updateQuestion(@PathVariable Long questionId, @RequestBody Question questionDetails) {
        try {
            Question question = questionRepository.findById(questionId)
                    .orElseThrow(() -> new RuntimeException("Question not found with id: " + questionId));
            
            question.setQuestionText(questionDetails.getQuestionText());
            question.setOption1(questionDetails.getOption1());
            question.setOption2(questionDetails.getOption2());
            question.setOption3(questionDetails.getOption3());
            question.setOption4(questionDetails.getOption4());
            question.setCorrectOption(questionDetails.getCorrectOption());
            question.setMarks(questionDetails.getMarks());
            
            Question updatedQuestion = questionRepository.save(question);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Question updated successfully");
            response.put("status", "success");
            response.put("question", updatedQuestion);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", "Error updating question: " + e.getMessage());
            errorResponse.put("status", "error");
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    // Delete question
    @DeleteMapping("/questions/{questionId}")
    public ResponseEntity<?> deleteQuestion(@PathVariable Long questionId) {
        try {
            Question question = questionRepository.findById(questionId)
                    .orElseThrow(() -> new RuntimeException("Question not found with id: " + questionId));
            
            questionRepository.delete(question);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Question deleted successfully");
            response.put("status", "success");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", "Error deleting question: " + e.getMessage());
            errorResponse.put("status", "error");
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    // Add to ExamController.java
// In ExamController.java - Update the getAvailableExams method
@GetMapping("/available/{userId}")
public ResponseEntity<?> getAvailableExams(@PathVariable Long userId) {
    try {
        List<Exam> allActiveExams = examRepository.findByIsActiveTrue();
        
        // If no active exams exist at all, return empty list
        if (allActiveExams.isEmpty()) {
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("exams", new ArrayList<>());
            response.put("total", 0);
            response.put("message", "No active exams available");
            return ResponseEntity.ok(response);
        }
        
        // Filter out exams that user has already attempted
        List<Map<String, Object>> availableExams = new ArrayList<>();
        for (Exam exam : allActiveExams) {
            boolean hasAttempted = userStatsService.hasUserAttemptedExam(userId, exam.getId());
            if (!hasAttempted) {
                Map<String, Object> examMap = new HashMap<>();
                examMap.put("id", exam.getId());
                examMap.put("title", exam.getTitle());
                examMap.put("description", exam.getDescription());
                examMap.put("duration", exam.getDuration());
                examMap.put("totalMarks", exam.getTotalMarks());
                examMap.put("passMarks", exam.getPassMarks());
                examMap.put("category", exam.getCategory());
                examMap.put("difficultyLevel", exam.getDifficultyLevel());
                examMap.put("isActive", exam.getIsActive());
                examMap.put("createdAt", exam.getCreatedAt());
                examMap.put("questionCount", exam.getQuestions().size());
                
                availableExams.add(examMap);
            }
        }
        
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("exams", availableExams);
        response.put("total", availableExams.size());
        response.put("totalActiveExams", allActiveExams.size()); // Add this for frontend
        response.put("attemptedExams", allActiveExams.size() - availableExams.size());
        
        return ResponseEntity.ok(response);
    } catch (Exception e) {
        Map<String, String> errorResponse = new HashMap<>();
        errorResponse.put("message", "Error fetching available exams: " + e.getMessage());
        errorResponse.put("status", "error");
        return ResponseEntity.badRequest().body(errorResponse);
    }
}
}