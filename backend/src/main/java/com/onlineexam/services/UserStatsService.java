package com.onlineexam.services;

import com.onlineexam.model.UserStats;
import com.onlineexam.model.ExamAttempt;
import com.onlineexam.model.User;
import com.onlineexam.model.Exam;
import com.onlineexam.repository.UserStatsRepository;
import com.onlineexam.repository.ExamAttemptRepository;
import com.onlineexam.repository.UserRepository;
import com.onlineexam.repository.ExamRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class UserStatsService {

    @Autowired
    private UserStatsRepository userStatsRepository;

    @Autowired
    private ExamAttemptRepository examAttemptRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ExamRepository examRepository;
    
    public UserStats getUserStats(Long userId) {
        return userStatsRepository.findByUserId(userId);
    }

    public UserStats saveUserStats(UserStats userStats) {
        return userStatsRepository.save(userStats);
    }

    @Transactional
public UserStats updateUserStatsAfterExam(Long userId, Double score, Boolean passed, String timeSpent) {
    UserStats stats = getUserStats(userId);
    
    if (stats == null) {
        // Get the User object first, then create UserStats
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        stats = new UserStats(user); // Pass User object, not Long
    }
    
    // ... rest of the method
        // Update statistics
        int newExamsTaken = stats.getExamsTaken() + 1;
        double newAverageScore = (stats.getAverageScore() * stats.getExamsTaken() + score) / newExamsTaken;
        int newPassedExams = stats.getPassedExams() + (passed ? 1 : 0);
        
        stats.setExamsTaken(newExamsTaken);
        stats.setAverageScore(Math.round(newAverageScore * 100.0) / 100.0);
        stats.setPassedExams(newPassedExams);
        stats.setTotalTimeSpent(calculateTotalTime(stats.getTotalTimeSpent(), timeSpent));
        
        return userStatsRepository.save(stats);
    }
    
    private String calculateTotalTime(String currentTime, String newTime) {
        try {
            // Parse current time (format: "Xh Ym")
            String[] currentParts = currentTime.split("h |m");
            int currentHours = Integer.parseInt(currentParts[0]);
            int currentMinutes = Integer.parseInt(currentParts[1]);
            
            // Parse new time
            String[] newParts = newTime.split("h |m");
            int newHours = Integer.parseInt(newParts[0]);
            int newMinutes = Integer.parseInt(newParts[1]);
            
            // Calculate total
            int totalMinutes = (currentHours * 60 + currentMinutes) + (newHours * 60 + newMinutes);
            int totalHours = totalMinutes / 60;
            int remainingMinutes = totalMinutes % 60;
            
            return totalHours + "h " + remainingMinutes + "m";
            
        } catch (Exception e) {
            // If parsing fails, return the new time
            return newTime;
        }
    }
    // Add this method to UserStatsService.java
public List<ExamAttempt> getUserExamAttempts(Long userId) {
    return examAttemptRepository.findByUserId(userId);
}
    // Exam Attempt Methods
    public ExamAttempt saveExamAttempt(ExamAttempt examAttempt) {
        return examAttemptRepository.save(examAttempt);
    }

    public boolean hasUserAttemptedExam(Long userId, Long examId) {
        return examAttemptRepository.existsByUserIdAndExamId(userId, examId);
    }

    public Optional<ExamAttempt> getUserExamAttempt(Long userId, Long examId) {
        return examAttemptRepository.findByUserIdAndExamId(userId, examId);
    }
    

    @Transactional
    public ExamAttempt createExamAttempt(Long userId, Long examId, Double score, Boolean passed, String timeSpent) {
        // Convert timeSpent string to minutes (format: "Xh Ym")
        int minutes = convertTimeToMinutes(timeSpent);
        
        // Create exam attempt
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        Exam exam = examRepository.findById(examId).orElseThrow(() -> new RuntimeException("Exam not found"));
        
        ExamAttempt examAttempt = new ExamAttempt(user, exam, score, exam.getTotalMarks(), passed, minutes);
        ExamAttempt savedAttempt = examAttemptRepository.save(examAttempt);
        
        // Update user stats
        updateUserStatsAfterExam(userId, score, passed, timeSpent);
        
        return savedAttempt;
    }

    private int convertTimeToMinutes(String timeSpent) {
        try {
            String[] parts = timeSpent.split("h |m");
            int hours = Integer.parseInt(parts[0]);
            int minutes = Integer.parseInt(parts[1]);
            return hours * 60 + minutes;
        } catch (Exception e) {
            return 0;
        }
    }
}