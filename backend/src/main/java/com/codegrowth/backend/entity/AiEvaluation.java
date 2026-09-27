package com.codegrowth.backend.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "ai_evaluations")
public class AiEvaluation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "submission_id", nullable = false, unique = true)
    private Submission submission;

    private Double correctnessScore;
    private Double codeQualityScore;
    private Double complexityScore;
    private Double testingScore;
    private Double securityScore;
    private Double documentationScore;
    private Double overallScore;

    @Column(length = 3000)
    private String feedback;

    @ElementCollection
    @CollectionTable(name = "ai_evaluation_strengths", joinColumns = @JoinColumn(name = "evaluation_id"))
    @Column(name = "strength", length = 500)
    private List<String> strengths = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "ai_evaluation_weaknesses", joinColumns = @JoinColumn(name = "evaluation_id"))
    @Column(name = "weakness", length = 500)
    private List<String> weaknesses = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "ai_evaluation_improvements", joinColumns = @JoinColumn(name = "evaluation_id"))
    @Column(name = "improvement", length = 500)
    private List<String> improvementSuggestions = new ArrayList<>();

    @OneToMany(mappedBy = "evaluation", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RequirementResult> requirementResults = new ArrayList<>();

    @Column(nullable = false)
    private Instant evaluatedAt;

    protected AiEvaluation() {}

    public AiEvaluation(Submission submission, Double correctnessScore, Double codeQualityScore, Double complexityScore, 
                        Double testingScore, Double securityScore, Double documentationScore, Double overallScore, 
                        String feedback, List<String> strengths, List<String> weaknesses, List<String> improvementSuggestions) {
        this.submission = submission;
        this.correctnessScore = correctnessScore;
        this.codeQualityScore = codeQualityScore;
        this.complexityScore = complexityScore;
        this.testingScore = testingScore;
        this.securityScore = securityScore;
        this.documentationScore = documentationScore;
        this.overallScore = overallScore;
        this.feedback = feedback;
        if (strengths != null) this.strengths = strengths;
        if (weaknesses != null) this.weaknesses = weaknesses;
        if (improvementSuggestions != null) this.improvementSuggestions = improvementSuggestions;
        this.evaluatedAt = Instant.now();
    }

    public void addRequirementResult(RequirementResult result) {
        requirementResults.add(result);
        result.setEvaluation(this);
    }

    // Getters
    public Long getId() { return id; }
    public Submission getSubmission() { return submission; }
    public Double getCorrectnessScore() { return correctnessScore; }
    public Double getCodeQualityScore() { return codeQualityScore; }
    public Double getComplexityScore() { return complexityScore; }
    public Double getTestingScore() { return testingScore; }
    public Double getSecurityScore() { return securityScore; }
    public Double getDocumentationScore() { return documentationScore; }
    public Double getOverallScore() { return overallScore; }
    public String getFeedback() { return feedback; }
    public List<String> getStrengths() { return strengths; }
    public List<String> getWeaknesses() { return weaknesses; }
    public List<String> getImprovementSuggestions() { return improvementSuggestions; }
    public List<RequirementResult> getRequirementResults() { return requirementResults; }
    public Instant getEvaluatedAt() { return evaluatedAt; }
}
