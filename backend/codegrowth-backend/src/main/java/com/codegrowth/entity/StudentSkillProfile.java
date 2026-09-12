package com.codegrowth.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "student_skill_profiles",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_skill_profile_student_competency",
                        columnNames = {
                                "student_id",
                                "competency_id"
                        }
                )
        }
)
public class StudentSkillProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /*
     * Student whose skill is being tracked.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "student_id",
            nullable = false
    )
    private User student;

    /*
     * Competency being tracked.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "competency_id",
            nullable = false
    )
    private Competency competency;

    /*
     * Latest competency score.
     */
    @Column(nullable = false)
    private Double currentScore = 0.0;

    /*
     * Previous competency score.
     */
    @Column(nullable = false)
    private Double previousScore = 0.0;

    /*
     * Current proficiency level.
     */
    @Enumerated(EnumType.STRING)
    @Column(
            nullable = false,
            length = 20
    )
    private CompetencyLevel currentLevel =
            CompetencyLevel.BEGINNER;

    /*
     * Current growth direction.
     */
    @Enumerated(EnumType.STRING)
    @Column(
            nullable = false,
            length = 30
    )
    private GrowthStatus growthStatus =
            GrowthStatus.INSUFFICIENT_DATA;

    /*
     * Number of competency assessments
     * contributing to this profile.
     */
    @Column(nullable = false)
    private Integer assessmentCount = 0;

    /*
     * Highest score achieved so far.
     */
    @Column(nullable = false)
    private Double highestScore = 0.0;

    /*
     * Lowest score achieved so far.
     */
    @Column(nullable = false)
    private Double lowestScore = 0.0;

    @Column(
            nullable = false,
            updatable = false
    )
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @Column
    private LocalDateTime lastAssessedAt;

    @PrePersist
    protected void onCreate() {

        LocalDateTime now = LocalDateTime.now();

        createdAt = now;
        updatedAt = now;

        if (currentScore == null) {
            currentScore = 0.0;
        }

        if (previousScore == null) {
            previousScore = 0.0;
        }

        if (currentLevel == null) {
            currentLevel = CompetencyLevel.BEGINNER;
        }

        if (growthStatus == null) {
            growthStatus =
                    GrowthStatus.INSUFFICIENT_DATA;
        }

        if (assessmentCount == null) {
            assessmentCount = 0;
        }

        if (highestScore == null) {
            highestScore = 0.0;
        }

        if (lowestScore == null) {
            lowestScore = 0.0;
        }
    }

    @PreUpdate
    protected void onUpdate() {

        updatedAt = LocalDateTime.now();
    }

    public StudentSkillProfile() {
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

    public Double getCurrentScore() {
        return currentScore;
    }

    public void setCurrentScore(
            Double currentScore) {

        this.currentScore = currentScore;
    }

    public Double getPreviousScore() {
        return previousScore;
    }

    public void setPreviousScore(
            Double previousScore) {

        this.previousScore = previousScore;
    }

    public CompetencyLevel getCurrentLevel() {
        return currentLevel;
    }

    public void setCurrentLevel(
            CompetencyLevel currentLevel) {

        this.currentLevel = currentLevel;
    }

    public GrowthStatus getGrowthStatus() {
        return growthStatus;
    }

    public void setGrowthStatus(
            GrowthStatus growthStatus) {

        this.growthStatus = growthStatus;
    }

    public Integer getAssessmentCount() {
        return assessmentCount;
    }

    public void setAssessmentCount(
            Integer assessmentCount) {

        this.assessmentCount = assessmentCount;
    }

    public Double getHighestScore() {
        return highestScore;
    }

    public void setHighestScore(
            Double highestScore) {

        this.highestScore = highestScore;
    }

    public Double getLowestScore() {
        return lowestScore;
    }

    public void setLowestScore(
            Double lowestScore) {

        this.lowestScore = lowestScore;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public LocalDateTime getLastAssessedAt() {
        return lastAssessedAt;
    }

    public void setLastAssessedAt(
            LocalDateTime lastAssessedAt) {

        this.lastAssessedAt = lastAssessedAt;
    }
}