package com.codegrowth.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "student_profiles")
public class StudentProfile {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private AppUser user;

    @Column(length = 120) private String university;
    @Column(length = 120) private String branch;
    @Column(length = 40) private String academicYear;
    @Column(length = 120) private String targetRole;
    @Column(length = 500) private String bio;
    private int xp;
    private int streak;

    protected StudentProfile() {}

    public StudentProfile(AppUser user) { this.user = user; }
    public Long getId() { return id; }
    public AppUser getUser() { return user; }
    public String getUniversity() { return university; }
    public String getBranch() { return branch; }
    public String getAcademicYear() { return academicYear; }
    public String getTargetRole() { return targetRole; }
    public String getBio() { return bio; }
    public int getXp() { return xp; }
    public int getStreak() { return streak; }
    public void update(String university, String branch, String academicYear, String targetRole, String bio) {
        this.university = university; this.branch = branch; this.academicYear = academicYear;
        this.targetRole = targetRole; this.bio = bio;
    }
    public void setXp(int xp) { this.xp = xp; }
    public void setStreak(int streak) { this.streak = streak; }
}
