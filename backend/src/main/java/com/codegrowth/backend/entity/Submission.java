package com.codegrowth.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "submissions", uniqueConstraints = @UniqueConstraint(columnNames = {"assignment_id", "student_id"}))
public class Submission {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.EAGER, optional = false) @JoinColumn(name = "assignment_id", nullable = false) private Assignment assignment;
    @JsonIgnore @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "student_id", nullable = false) private AppUser student;
    @Column(nullable = false, columnDefinition = "TEXT") private String content;
    private Double score;
    @Column(length = 3000) private String feedback;
    @Column(nullable = false) private Instant submittedAt;
    private Instant gradedAt;

    protected Submission() {}
    public Submission(Assignment assignment, AppUser student, String content) { this.assignment = assignment; this.student = student; this.content = content; this.submittedAt = Instant.now(); }
    public Long getId() { return id; }
    public Assignment getAssignment() { return assignment; }
    public AppUser getStudent() { return student; }
    public String getContent() { return content; }
    public Double getScore() { return score; }
    public String getFeedback() { return feedback; }
    public Instant getSubmittedAt() { return submittedAt; }
    public Instant getGradedAt() { return gradedAt; }
    public void updateContent(String newContent) { this.content = newContent; this.submittedAt = Instant.now(); }
    public void grade(Double score, String feedback) { this.score = score; this.feedback = feedback; this.gradedAt = Instant.now(); }
}
