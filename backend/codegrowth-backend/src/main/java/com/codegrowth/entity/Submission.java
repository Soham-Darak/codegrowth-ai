package com.codegrowth.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "submissions",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_submissions_student_assignment",
                        columnNames = {"student_id", "assignment_id"}
                )
        }
)
public class Submission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "student_id",
            nullable = false
    )
    private User student;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "assignment_id",
            nullable = false
    )
    private Assignment assignment;

    @Column(
            length = 10000
    )
    private String submissionContent;

    @Column(
            length = 1000
    )
    private String githubUrl;

    @Enumerated(EnumType.STRING)
    @Column(
            nullable = false,
            length = 20
    )
    private SubmissionStatus status = SubmissionStatus.PENDING;

    @Column(nullable = false)
    private LocalDateTime submittedAt;

    private LocalDateTime evaluatedAt;

    private Double score;

    @Column(length = 10000)
    private String aiFeedback;


    // ==============================
    // Lifecycle Methods
    // ==============================

    @PrePersist
    protected void onCreate() {

        if (submittedAt == null) {
            submittedAt = LocalDateTime.now();
        }

        if (status == null) {
            status = SubmissionStatus.PENDING;
        }
    }


    // ==============================
    // Constructor
    // ==============================

    public Submission() {
    }


    // ==============================
    // Getters and Setters
    // ==============================

    public Long getId() {
        return id;
    }

    public User getStudent() {
        return student;
    }

    public void setStudent(User student) {
        this.student = student;
    }

    public Assignment getAssignment() {
        return assignment;
    }

    public void setAssignment(Assignment assignment) {
        this.assignment = assignment;
    }

    public String getSubmissionContent() {
        return submissionContent;
    }

    public void setSubmissionContent(String submissionContent) {
        this.submissionContent = submissionContent;
    }

    public String getGithubUrl() {
        return githubUrl;
    }

    public void setGithubUrl(String githubUrl) {
        this.githubUrl = githubUrl;
    }

    public SubmissionStatus getStatus() {
        return status;
    }

    public void setStatus(SubmissionStatus status) {
        this.status = status;
    }

    public LocalDateTime getSubmittedAt() {
        return submittedAt;
    }

    public LocalDateTime getEvaluatedAt() {
        return evaluatedAt;
    }

    public void setEvaluatedAt(LocalDateTime evaluatedAt) {
        this.evaluatedAt = evaluatedAt;
    }

    public Double getScore() {
        return score;
    }

    public void setScore(Double score) {
        this.score = score;
    }

    public String getAiFeedback() {
        return aiFeedback;
    }

    public void setAiFeedback(String aiFeedback) {
        this.aiFeedback = aiFeedback;
    }
}