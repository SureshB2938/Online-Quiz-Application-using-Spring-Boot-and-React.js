package com.onlineexam.controller;

import com.onlineexam.model.User;
import com.onlineexam.model.ExamAttempt;
import com.onlineexam.model.UserStats;
import com.onlineexam.repository.UserRepository;
import com.onlineexam.services.UserStatsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import com.onlineexam.repository.ExamAttemptRepository;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "http://localhost:3000")
public class UserProfileController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserStatsService userStatsService;

    private BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Autowired
    private ExamAttemptRepository examAttemptRepository;

    // Get all users for admin
    @GetMapping("/all")
    public ResponseEntity<?> getAllUsers() {
        try {
            List<User> users = userRepository.findAll();
            
            // Remove passwords from response
            users.forEach(user -> user.setPassword(null));
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("users", users);
            response.put("total", users.size());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", "Error fetching users: " + e.getMessage());
            errorResponse.put("status", "error");
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    // Delete user
    @DeleteMapping("/{userId}")
    public ResponseEntity<?> deleteUser(@PathVariable Long userId) {
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

            // Cascade will automatically delete exam attempts and user stats
            userRepository.delete(user);

            Map<String, String> response = new HashMap<>();
            response.put("message", "User and all associated data deleted successfully");
            response.put("status", "success");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", "Error deleting user: " + e.getMessage());
            errorResponse.put("status", "error");
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    // Get user profile
    @GetMapping("/profile/{userId}")
    public ResponseEntity<?> getUserProfile(@PathVariable Long userId) {
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Remove password from response
            user.setPassword(null);
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("user", user);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", "Error fetching user profile: " + e.getMessage());
            errorResponse.put("status", "error");
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    // Update user profile
    @PutMapping("/profile/{userId}")
    public ResponseEntity<?> updateUserProfile(@PathVariable Long userId, @RequestBody Map<String, String> updateRequest) {
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            String username = updateRequest.get("username");
            String email = updateRequest.get("email");
            String currentPassword = updateRequest.get("currentPassword");
            String newPassword = updateRequest.get("newPassword");

            // Verify current password if changing password
            if ((newPassword != null && !newPassword.trim().isEmpty()) && 
                !passwordEncoder.matches(currentPassword, user.getPassword())) {
                Map<String, String> response = new HashMap<>();
                response.put("message", "Current password is incorrect");
                response.put("status", "error");
                return ResponseEntity.badRequest().body(response);
            }

            // Update fields
            if (username != null && !username.trim().isEmpty()) {
                // Check if username already exists (excluding current user)
                Optional<User> existingUser = userRepository.findByUsername(username);
                if (existingUser.isPresent() && !existingUser.get().getId().equals(userId)) {
                    Map<String, String> response = new HashMap<>();
                    response.put("message", "Username already exists");
                    response.put("status", "error");
                    return ResponseEntity.badRequest().body(response);
                }
                user.setUsername(username);
            }

            if (email != null && !email.trim().isEmpty()) {
                // Check if email already exists (excluding current user)
                Optional<User> existingUser = userRepository.findByEmail(email);
                if (existingUser.isPresent() && !existingUser.get().getId().equals(userId)) {
                    Map<String, String> response = new HashMap<>();
                    response.put("message", "Email already exists");
                    response.put("status", "error");
                    return ResponseEntity.badRequest().body(response);
                }
                user.setEmail(email);
            }

            // Update password if provided
            if (newPassword != null && !newPassword.trim().isEmpty()) {
                user.setPassword(passwordEncoder.encode(newPassword));
            }

            User updatedUser = userRepository.save(user);
            updatedUser.setPassword(null); // Remove password from response

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Profile updated successfully");
            response.put("status", "success");
            response.put("user", updatedUser);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", "Error updating profile: " + e.getMessage());
            errorResponse.put("status", "error");
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    // Get user's exam attempts (results)
    @GetMapping("/{userId}/exam-attempts")
    public ResponseEntity<?> getUserExamAttempts(@PathVariable Long userId) {
        try {
            List<ExamAttempt> attempts = userStatsService.getUserExamAttempts(userId);
            
            // Convert to response format
            List<Map<String, Object>> attemptList = new ArrayList<>();
            for (ExamAttempt attempt : attempts) {
                Map<String, Object> attemptMap = new HashMap<>();
                attemptMap.put("id", attempt.getId());
                
                // FIX 2: Add null check for exam
                if (attempt.getExam() != null) {
                    attemptMap.put("examId", attempt.getExam().getId());
                    attemptMap.put("examTitle", attempt.getExam().getTitle());
                    attemptMap.put("category", attempt.getExam().getCategory());
                } else {
                    attemptMap.put("examId", null);
                    attemptMap.put("examTitle", "Unknown Exam");
                    attemptMap.put("category", "Unknown");
                }
                
                attemptMap.put("score", attempt.getScore());
                attemptMap.put("totalMarks", attempt.getTotalMarks());
                
                // FIX 3: Prevent division by zero
                double percentage = 0.0;
                if (attempt.getTotalMarks() > 0) {
                    percentage = (attempt.getScore() / attempt.getTotalMarks()) * 100;
                }
                attemptMap.put("percentage", Math.round(percentage * 100.0) / 100.0);
                
                attemptMap.put("passed", attempt.getPassed());
                attemptMap.put("timeSpent", attempt.getTimeSpent() + " minutes");
                attemptMap.put("attemptedAt", attempt.getAttemptedAt());
                
                attemptList.add(attemptMap);
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("attempts", attemptList);
            response.put("totalAttempts", attemptList.size());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", "Error fetching exam attempts: " + e.getMessage());
            errorResponse.put("status", "error");
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    // Get detailed user statistics
    @GetMapping("/{userId}/detailed-stats")
    public ResponseEntity<?> getUserDetailedStats(@PathVariable Long userId) {
        try {
            UserStats stats = userStatsService.getUserStats(userId);
            List<ExamAttempt> attempts = userStatsService.getUserExamAttempts(userId);
            
            // Calculate additional statistics
            double averagePercentage = 0;
            int totalTimeSpentMinutes = 0;
            Map<String, Integer> categoryStats = new HashMap<>();
            Map<String, Integer> difficultyStats = new HashMap<>();
            
            if (stats != null && stats.getExamsTaken() > 0) {
                averagePercentage = stats.getAverageScore();
                
                for (ExamAttempt attempt : attempts) {
                    totalTimeSpentMinutes += attempt.getTimeSpent();
                    
                    // FIX 2: Add null check for exam
                    if (attempt.getExam() != null) {
                        // Category statistics
                        String category = attempt.getExam().getCategory();
                        categoryStats.put(category, categoryStats.getOrDefault(category, 0) + 1);
                        
                        // Difficulty statistics
                        String difficulty = attempt.getExam().getDifficultyLevel();
                        difficultyStats.put(difficulty, difficultyStats.getOrDefault(difficulty, 0) + 1);
                    }
                }
            }
            
            // Convert total time to readable format
            int hours = totalTimeSpentMinutes / 60;
            int minutes = totalTimeSpentMinutes % 60;
            String totalTimeSpent = hours + "h " + minutes + "m";
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("basicStats", stats != null ? stats : new UserStats(userRepository.findById(userId).orElse(null)));
            response.put("averagePercentage", Math.round(averagePercentage * 100.0) / 100.0);
            response.put("totalTimeSpent", totalTimeSpent);
            response.put("categoryStats", categoryStats);
            response.put("difficultyStats", difficultyStats);
            response.put("totalExamsTaken", attempts.size());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", "Error fetching detailed statistics: " + e.getMessage());
            errorResponse.put("status", "error");
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
}