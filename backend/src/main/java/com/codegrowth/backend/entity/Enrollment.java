package com.codegrowth.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "enrollments", uniqueConstraints = @UniqueConstraint(columnNames = {"student_id", "course_id"}))
public class Enrollment {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @JsonIgnore @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "student_id", nullable = false) private AppUser student;
    @ManyToOne(fetch = FetchType.EAGER, optional = false) @JoinColumn(name = "course_id", nullable = false) private Course course;
    private int progress;
    @Column(nullable = false) private Instant enrolledAt;

    protected Enrollment() {}
    public Enrollment(AppUser student, Course course) { this.student = student; this.course = course; this.enrolledAt = Instant.now(); }
    public Long getId() { return id; }
    public AppUser getStudent() { return student; }
    public Course getCourse() { return course; }
    public int getProgress() { return progress; }
    public Instant getEnrolledAt() { return enrolledAt; }
    public void setProgress(int progress) { this.progress = Math.max(0, Math.min(100, progress)); }
}
