package com.onlineexam.model;

import jakarta.persistence.*;

import com.fasterxml.jackson.annotation.JsonBackReference;

@Entity
@Table(name="questions")
public class Question {

    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;

    @Column(nullable=false, length=1000)
    private String questionText;

    @Column(nullable=false)
    private String option1;

    @Column(nullable=false)
    private String option2;

    @Column(nullable=false)
    private String option3;

    @Column(nullable=false)
    private String option4;

    @Column(nullable=false)
    private Integer correctOption; // 1, 2, 3, or 4

    @Column(nullable=false)
    private Integer marks;

    @ManyToOne(fetch=FetchType.LAZY)
    @JoinColumn(name="exam_id", nullable=false)
    @JsonBackReference
    private Exam exam;

    // Constructors, Getters and Setters
    public Question() {}

    public Question(String questionText, String option1, String option2, 
                   String option3, String option4, Integer correctOption, Integer marks) {
        this.questionText = questionText;
        this.option1 = option1;
        this.option2 = option2;
        this.option3 = option3;
        this.option4 = option4;
        this.correctOption = correctOption;
        this.marks = marks;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getQuestionText() { return questionText; }
    public void setQuestionText(String questionText) { this.questionText = questionText; }

    public String getOption1() { return option1; }
    public void setOption1(String option1) { this.option1 = option1; }

    public String getOption2() { return option2; }
    public void setOption2(String option2) { this.option2 = option2; }

    public String getOption3() { return option3; }
    public void setOption3(String option3) { this.option3 = option3; }

    public String getOption4() { return option4; }
    public void setOption4(String option4) { this.option4 = option4; }

    public Integer getCorrectOption() { return correctOption; }
    public void setCorrectOption(Integer correctOption) { this.correctOption = correctOption; }

    public Integer getMarks() { return marks; }
    public void setMarks(Integer marks) { this.marks = marks; }

    public Exam getExam() { return exam; }
    public void setExam(Exam exam) { this.exam = exam; }
}