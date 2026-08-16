package com.codegrowth.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "announcements")
public class Announcement {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.EAGER, optional = false) @JoinColumn(name = "course_id", nullable = false) private Course course;
    @JsonIgnore @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "teacher_id", nullable = false) private AppUser teacher;
    @Column(nullable = false, length = 160) private String title;
    @Column(nullable = false, length = 3000) private String message;
    @Column(nullable = false) private Instant createdAt;

    protected Announcement() {}
    public Announcement(Course course, AppUser teacher, String title, String message) {
        this.course = course; this.teacher = teacher; this.title = title; this.message = message; this.createdAt = Instant.now();
    }
    public Long getId() { return id; }
    public Course getCourse() { return course; }
    public AppUser getTeacher() { return teacher; }
    public String getTitle() { return title; }
    public String getMessage() { return message; }
    public Instant getCreatedAt() { return createdAt; }
}
