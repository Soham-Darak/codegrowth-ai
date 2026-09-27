package com.codegrowth.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "learning_goals")
public class LearningGoal {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @JsonIgnore @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "student_id", nullable = false) private AppUser student;
    @Column(nullable = false, length = 160) private String title;
    @Column(length = 1000) private String description;
    private Instant targetDate;
    private int progress;
    @Column(length = 30) private String status;
    @Column(nullable = false) private Instant createdAt;

    protected LearningGoal() {}
    public LearningGoal(AppUser student, String title, String description, Instant targetDate) {
        this.student = student; this.title = title; this.description = description; this.targetDate = targetDate; this.progress = 0; this.status = "ACTIVE"; this.createdAt = Instant.now();
    }
    public Long getId() { return id; }
    public AppUser getStudent() { return student; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public Instant getTargetDate() { return targetDate; }
    public int getProgress() { return progress; }
    public String getStatus() { return status; }
    public Instant getCreatedAt() { return createdAt; }
    public void update(String title, String description, Instant targetDate, int progress, String status) {
        this.title = title; this.description = description; this.targetDate = targetDate;
        this.progress = Math.max(0, Math.min(100, progress)); this.status = status == null ? "ACTIVE" : status;
    }
}
