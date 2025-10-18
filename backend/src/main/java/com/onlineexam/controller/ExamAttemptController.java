// ExamAttemptController.java
package com.onlineexam.controller;

import com.onlineexam.model.ExamAttempt;
import com.onlineexam.services.UserStatsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/exam-attempts")
@CrossOrigin(origins = "http://localhost:3000")
public class ExamAttemptController {

    @Autowired
    private UserStatsService userStatsService;

    @GetMapping("/check/{userId}/{examId}")
    public ResponseEntity<?> checkExamAttempt(@PathVariable Long userId, @PathVariable Long examId) {
        try {
            boolean hasAttempted = userStatsService.hasUserAttemptedExam(userId, examId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("hasAttempted", hasAttempted);
            
            if (hasAttempted) {
                ExamAttempt attempt = userStatsService.getUserExamAttempt(userId, examId).orElse(null);
                response.put("attempt", attempt);
            }
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("status", "error");
            errorResponse.put("message", "Error checking exam attempt: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @PostMapping("/submit")
    public ResponseEntity<?> submitExamAttempt(@RequestBody Map<String, Object> attemptData) {
        try {
            Long userId = Long.valueOf(attemptData.get("userId").toString());
            Long examId = Long.valueOf(attemptData.get("examId").toString());
            Double score = Double.valueOf(attemptData.get("score").toString());
            Boolean passed = Boolean.valueOf(attemptData.get("passed").toString());
            String timeSpent = attemptData.get("timeSpent").toString();

            ExamAttempt attempt = userStatsService.createExamAttempt(userId, examId, score, passed, timeSpent);
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Exam attempt recorded successfully");
            response.put("attempt", attempt);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("status", "error");
            errorResponse.put("message", "Error submitting exam attempt: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
}