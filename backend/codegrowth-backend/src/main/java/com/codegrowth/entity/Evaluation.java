package com.codegrowth.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "evaluations",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_evaluations_submission",
                        columnNames = "submission_id"
                )
        }
)
public class Evaluation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "submission_id",
            nullable = false
    )
    private Submission submission;

    @Enumerated(EnumType.STRING)
    @Column(
            nullable = false,
            length = 20
    )
    private EvaluationStatus status = EvaluationStatus.PENDING;

    /*
     * Individual evaluation dimensions.
     * Each score is represented on a 0-100 scale.
     */

    @Column
    private Double correctnessScore;

    @Column
    private Double codeQualityScore;

    @Column
    private Double complexityScore;

    @Column
    private Double testingScore;

    @Column
    private Double securityScore;

    @Column
    private Double documentationScore;

    @Column
    private Double overallScore;

    /*
     * AI-generated explanation of the evaluation.
     */

    @Column(length = 10000)
    private String aiFeedback;

    /*
     * Additional AI analysis information.
     */

    @Column(length = 10000)
    private String strengths;

    @Column(length = 10000)
    private String weaknesses;

    @Column(length = 10000)
    private String improvementSuggestions;

    @Column(
            nullable = false,
            updatable = false
    )
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @Column
    private LocalDateTime completedAt;

    @PrePersist
    protected void onCreate() {

        LocalDateTime now = LocalDateTime.now();

        createdAt = now;
        updatedAt = now;

        if (status == null) {
            status = EvaluationStatus.PENDING;
        }
    }

    @PreUpdate
    protected void onUpdate() {

        updatedAt = LocalDateTime.now();
    }

    public Evaluation() {
    }

    public Long getId() {
        return id;
    }

    public Submission getSubmission() {
        return submission;
    }

    public void setSubmission(Submission submission) {
        this.submission = submission;
    }

    public EvaluationStatus getStatus() {
        return status;
    }

    public void setStatus(EvaluationStatus status) {
        this.status = status;
    }

    public Double getCorrectnessScore() {
        return correctnessScore;
    }

    public void setCorrectnessScore(Double correctnessScore) {
        this.correctnessScore = correctnessScore;
    }

    public Double getCodeQualityScore() {
        return codeQualityScore;
    }

    public void setCodeQualityScore(Double codeQualityScore) {
        this.codeQualityScore = codeQualityScore;
    }

    public Double getComplexityScore() {
        return complexityScore;
    }

    public void setComplexityScore(Double complexityScore) {
        this.complexityScore = complexityScore;
    }

    public Double getTestingScore() {
        return testingScore;
    }

    public void setTestingScore(Double testingScore) {
        this.testingScore = testingScore;
    }

    public Double getSecurityScore() {
        return securityScore;
    }

    public void setSecurityScore(Double securityScore) {
        this.securityScore = securityScore;
    }

    public Double getDocumentationScore() {
        return documentationScore;
    }

    public void setDocumentationScore(Double documentationScore) {
        this.documentationScore = documentationScore;
    }

    public Double getOverallScore() {
        return overallScore;
    }

    public void setOverallScore(Double overallScore) {
        this.overallScore = overallScore;
    }

    public String getAiFeedback() {
        return aiFeedback;
    }

    public void setAiFeedback(String aiFeedback) {
        this.aiFeedback = aiFeedback;
    }

    public String getStrengths() {
        return strengths;
    }

    public void setStrengths(String strengths) {
        this.strengths = strengths;
    }

    public String getWeaknesses() {
        return weaknesses;
    }

    public void setWeaknesses(String weaknesses) {
        this.weaknesses = weaknesses;
    }

    public String getImprovementSuggestions() {
        return improvementSuggestions;
    }

    public void setImprovementSuggestions(
            String improvementSuggestions) {

        this.improvementSuggestions = improvementSuggestions;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(
            LocalDateTime completedAt) {

        this.completedAt = completedAt;
    }
}