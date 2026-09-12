package com.codegrowth.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "competency_assessments",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_assessment_evaluation_competency",
                        columnNames = {
                                "evaluation_id",
                                "competency_id"
                        }
                )
        }
)
public class CompetencyAssessment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /*
     * Evaluation from which this competency
     * assessment was generated.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "evaluation_id",
            nullable = false
    )
    private Evaluation evaluation;

    /*
     * Competency being assessed.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "competency_id",
            nullable = false
    )
    private Competency competency;

    /*
     * Student whose competency is being measured.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "student_id",
            nullable = false
    )
    private User student;

    @Enumerated(EnumType.STRING)
    @Column(
            nullable = false,
            length = 20
    )
    private CompetencyAssessmentStatus status =
            CompetencyAssessmentStatus.PENDING;

    /*
     * AI-generated competency score.
     * Range: 0-100.
     */
    @Column(nullable = false)
    private Double score;

    /*
     * AI-generated proficiency level.
     */
    @Enumerated(EnumType.STRING)
    @Column(
            nullable = false,
            length = 20
    )
    private CompetencyLevel assessedLevel =
            CompetencyLevel.BEGINNER;

    /*
     * Explanation of why the student received
     * this competency score.
     */
    @Column(length = 10000)
    private String evidence;

    /*
     * AI-generated recommendation specifically
     * related to this competency.
     */
    @Column(length = 10000)
    private String improvementSuggestion;

    @Column(
            nullable = false,
            updatable = false
    )
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @Column
    private LocalDateTime assessedAt;

    @PrePersist
    protected void onCreate() {

        LocalDateTime now = LocalDateTime.now();

        createdAt = now;
        updatedAt = now;

        if (status == null) {
            status = CompetencyAssessmentStatus.PENDING;
        }

        if (assessedLevel == null) {
            assessedLevel = CompetencyLevel.BEGINNER;
        }
    }

    @PreUpdate
    protected void onUpdate() {

        updatedAt = LocalDateTime.now();
    }

    public CompetencyAssessment() {
    }

    public Long getId() {
        return id;
    }

    public Evaluation getEvaluation() {
        return evaluation;
    }

    public void setEvaluation(Evaluation evaluation) {
        this.evaluation = evaluation;
    }

    public Competency getCompetency() {
        return competency;
    }

    public void setCompetency(Competency competency) {
        this.competency = competency;
    }

    public User getStudent() {
        return student;
    }

    public void setStudent(User student) {
        this.student = student;
    }

    public CompetencyAssessmentStatus getStatus() {
        return status;
    }

    public void setStatus(
            CompetencyAssessmentStatus status) {

        this.status = status;
    }

    public Double getScore() {
        return score;
    }

    public void setScore(Double score) {
        this.score = score;
    }

    public CompetencyLevel getAssessedLevel() {
        return assessedLevel;
    }

    public void setAssessedLevel(
            CompetencyLevel assessedLevel) {

        this.assessedLevel = assessedLevel;
    }

    public String getEvidence() {
        return evidence;
    }

    public void setEvidence(String evidence) {
        this.evidence = evidence;
    }

    public String getImprovementSuggestion() {
        return improvementSuggestion;
    }

    public void setImprovementSuggestion(
            String improvementSuggestion) {

        this.improvementSuggestion =
                improvementSuggestion;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public LocalDateTime getAssessedAt() {
        return assessedAt;
    }

    public void setAssessedAt(
            LocalDateTime assessedAt) {

        this.assessedAt = assessedAt;
    }
}