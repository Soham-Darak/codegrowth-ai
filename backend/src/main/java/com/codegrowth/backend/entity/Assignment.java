package com.codegrowth.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "assignments")
public class Assignment {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.EAGER, optional = false) @JoinColumn(name = "course_id", nullable = false) private Course course;
    @JsonIgnore @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "teacher_id", nullable = false) private AppUser teacher;
    @Column(nullable = false, length = 160) private String title;
    @Column(length = 3000) private String description;
    private Instant dueAt;
    @Column(nullable = false) private Instant createdAt;

    protected Assignment() {}
    public Assignment(Course course, AppUser teacher, String title, String description, Instant dueAt) {
        this.course = course; this.teacher = teacher; this.title = title; this.description = description; this.dueAt = dueAt; this.createdAt = Instant.now();
    }
    public Long getId() { return id; }
    public Course getCourse() { return course; }
    public AppUser getTeacher() { return teacher; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public Instant getDueAt() { return dueAt; }
    public Instant getCreatedAt() { return createdAt; }
    public void update(String title, String description, Instant dueAt) { this.title = title; this.description = description; this.dueAt = dueAt; }
}
