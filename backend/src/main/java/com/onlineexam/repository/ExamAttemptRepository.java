// ExamAttemptRepository.java
package com.onlineexam.repository;

import com.onlineexam.model.ExamAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExamAttemptRepository extends JpaRepository<ExamAttempt, Long> {
    Optional<ExamAttempt> findByUserIdAndExamId(Long userId, Long examId);
    List<ExamAttempt> findByUserId(Long userId);
    List<ExamAttempt> findByExamId(Long examId);
    boolean existsByUserIdAndExamId(Long userId, Long examId);
    long countByExamId(Long examId);
    long countByUserId(Long userId);
}