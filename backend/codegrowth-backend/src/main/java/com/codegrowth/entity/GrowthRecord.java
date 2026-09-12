package com.codegrowth.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "growth_records"
)
public class GrowthRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /*
     * Student whose growth is being recorded.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "student_id",
            nullable = false
    )
    private User student;

    /*
     * Competency associated with this growth record.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "competency_id",
            nullable = false
    )
    private Competency competency;

    /*
     * Assessment that generated this growth record.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "assessment_id",
            nullable = false
    )
    private CompetencyAssessment assessment;

    /*
     * Score before this assessment.
     */
    @Column(nullable = false)
    private Double previousScore;

    /*
     * Score after this assessment.
     */
    @Column(nullable = false)
    private Double newScore;

    /*
     * Difference between new and previous score.
     */
    @Column(nullable = false)
    private Double scoreChange;

    /*
     * Skill level before assessment.
     */
    @Enumerated(EnumType.STRING)
    @Column(
            nullable = false,
            length = 20
    )
    private CompetencyLevel previousLevel;

    /*
     * Skill level after assessment.
     */
    @Enumerated(EnumType.STRING)
    @Column(
            nullable = false,
            length = 20
    )
    private CompetencyLevel newLevel;

    /*
     * Growth direction.
     */
    @Enumerated(EnumType.STRING)
    @Column(
            nullable = false,
            length = 30
    )
    private GrowthStatus growthStatus;

    /*
     * AI explanation of the observed growth.
     */
    @Column(length = 10000)
    private String growthExplanation;

    @Column(
            nullable = false,
            updatable = false
    )
    private LocalDateTime recordedAt;

    @PrePersist
    protected void onCreate() {

        if (recordedAt == null) {
            recordedAt = LocalDateTime.now();
        }
    }

    public GrowthRecord() {
    }

    public Long getId() {
        return id;
    }

    public User getStudent() {
        return student;
    }

    public void setStudent(User student) {
        this.student = student;
    }

    public Competency getCompetency() {
        return competency;
    }

    public void setCompetency(
            Competency competency) {

        this.competency = competency;
    }

    public CompetencyAssessment getAssessment() {
        return assessment;
    }

    public void setAssessment(
            CompetencyAssessment assessment) {

        this.assessment = assessment;
    }

    public Double getPreviousScore() {
        return previousScore;
    }

    public void setPreviousScore(
            Double previousScore) {

        this.previousScore = previousScore;
    }

    public Double getNewScore() {
        return newScore;
    }

    public void setNewScore(
            Double newScore) {

        this.newScore = newScore;
    }

    public Double getScoreChange() {
        return scoreChange;
    }

    public void setScoreChange(
            Double scoreChange) {

        this.scoreChange = scoreChange;
    }

    public CompetencyLevel getPreviousLevel() {
        return previousLevel;
    }

    public void setPreviousLevel(
            CompetencyLevel previousLevel) {

        this.previousLevel = previousLevel;
    }

    public CompetencyLevel getNewLevel() {
        return newLevel;
    }

    public void setNewLevel(
            CompetencyLevel newLevel) {

        this.newLevel = newLevel;
    }

    public GrowthStatus getGrowthStatus() {
        return growthStatus;
    }

    public void setGrowthStatus(
            GrowthStatus growthStatus) {

        this.growthStatus = growthStatus;
    }

    public String getGrowthExplanation() {
        return growthExplanation;
    }

    public void setGrowthExplanation(
            String growthExplanation) {

        this.growthExplanation =
                growthExplanation;
    }

    public LocalDateTime getRecordedAt() {
        return recordedAt;
    }
}