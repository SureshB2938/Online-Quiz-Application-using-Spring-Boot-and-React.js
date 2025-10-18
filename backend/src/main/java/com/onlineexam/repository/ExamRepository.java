// ExamRepository.java
package com.onlineexam.repository;

import com.onlineexam.model.Exam;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExamRepository extends JpaRepository<Exam, Long> {
    List<Exam> findByIsActiveTrue();
    List<Exam> findByCategory(String category);
    List<Exam> findByDifficultyLevel(String difficultyLevel);
}