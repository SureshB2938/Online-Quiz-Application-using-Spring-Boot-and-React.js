package com.onlineexam.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_stats")
public class UserStats {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", unique = true, nullable = false)
    private User user;
    
    @Column(name = "exams_taken")
    private Integer examsTaken = 0;
    
    @Column(name = "average_score")
    private Double averageScore = 0.0;
    
    @Column(name = "passed_exams")
    private Integer passedExams = 0;
    
    @Column(name = "total_time_spent")
    private String totalTimeSpent = "0h 0m";
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Pre-persist and pre-update methods
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Constructors
    public UserStats() {}

    public UserStats(User user) {
        this.user = user;
    }

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    
    public Integer getExamsTaken() { return examsTaken; }
    public void setExamsTaken(Integer examsTaken) { this.examsTaken = examsTaken; }
    
    public Double getAverageScore() { return averageScore; }
    public void setAverageScore(Double averageScore) { this.averageScore = averageScore; }
    
    public Integer getPassedExams() { return passedExams; }
    public void setPassedExams(Integer passedExams) { this.passedExams = passedExams; }
    
    public String getTotalTimeSpent() { return totalTimeSpent; }
    public void setTotalTimeSpent(String totalTimeSpent) { this.totalTimeSpent = totalTimeSpent; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}