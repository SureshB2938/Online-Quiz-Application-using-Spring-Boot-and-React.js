// QuestionRepository.java
package com.onlineexam.repository;

import com.onlineexam.model.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {
    List<Question> findByExamId(Long examId);
    void deleteByExamId(Long examId);
}