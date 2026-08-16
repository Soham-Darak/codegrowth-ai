package com.codegrowth.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "courses")
public class Course {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, length = 30) private String code;
    @Column(nullable = false, length = 160) private String title;
    @Column(length = 2000) private String description;
    @JsonIgnore @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "teacher_id", nullable = false) private AppUser teacher;
    @Column(nullable = false) private Instant createdAt;

    protected Course() {}
    public Course(String code, String title, String description, AppUser teacher) {
        this.code = code; this.title = title; this.description = description; this.teacher = teacher; this.createdAt = Instant.now();
    }
    public Long getId() { return id; }
    public String getCode() { return code; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public AppUser getTeacher() { return teacher; }
    public Instant getCreatedAt() { return createdAt; }
    public void update(String code, String title, String description) { this.code = code; this.title = title; this.description = description; }
}
