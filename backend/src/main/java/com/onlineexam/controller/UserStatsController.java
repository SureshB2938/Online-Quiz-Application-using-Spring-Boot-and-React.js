package com.onlineexam.controller;

import com.onlineexam.model.UserStats;
import com.onlineexam.services.UserStatsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:3000")
public class UserStatsController {

    @Autowired
    private UserStatsService userStatsService;

    @GetMapping("/{userId}/stats")
    public ResponseEntity<?> getUserStats(@PathVariable Long userId) {
        try {
            UserStats stats = userStatsService.getUserStats(userId);
            
            if (stats == null) {
                // Return default stats if user has no stats yet
                UserStats defaultStats = new UserStats();
                defaultStats.setExamsTaken(0);
                defaultStats.setAverageScore(0.0);
                defaultStats.setPassedExams(0);
                defaultStats.setTotalTimeSpent("0h 0m");
                
                Map<String, Object> response = new HashMap<>();
                response.put("status", "success");
                response.put("data", defaultStats);
                return ResponseEntity.ok().body(response);
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("data", stats);
            return ResponseEntity.ok().body(response);
            
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", "Failed to fetch user statistics");
            return ResponseEntity.status(500).body(response);
        }
    }
}