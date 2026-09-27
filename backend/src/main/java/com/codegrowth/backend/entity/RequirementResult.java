package com.codegrowth.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "ai_requirement_results")
public class RequirementResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "evaluation_id", nullable = false)
    private AiEvaluation evaluation;

    @Column(nullable = false, length = 500)
    private String requirement;

    @Column(nullable = false, length = 50)
    private String status;

    private Double score;

    @Column(length = 3000)
    private String feedback;

    @ElementCollection
    @CollectionTable(name = "ai_requirement_evidence", joinColumns = @JoinColumn(name = "requirement_result_id"))
    @Column(name = "evidence", length = 1000)
    private List<String> evidence = new ArrayList<>();

    protected RequirementResult() {}

    public RequirementResult(String requirement, String status, Double score, String feedback, List<String> evidence) {
        this.requirement = requirement;
        this.status = status;
        this.score = score;
        this.feedback = feedback;
        if (evidence != null) this.evidence = evidence;
    }

    public Long getId() { return id; }
    public AiEvaluation getEvaluation() { return evaluation; }
    public void setEvaluation(AiEvaluation evaluation) { this.evaluation = evaluation; }
    public String getRequirement() { return requirement; }
    public String getStatus() { return status; }
    public Double getScore() { return score; }
    public String getFeedback() { return feedback; }
    public List<String> getEvidence() { return evidence; }
}
