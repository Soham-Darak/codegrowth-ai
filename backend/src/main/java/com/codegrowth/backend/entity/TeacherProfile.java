package com.codegrowth.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "teacher_profiles")
public class TeacherProfile {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private AppUser user;

    @Column(length = 120) private String department;
    @Column(length = 120) private String designation;
    @Column(length = 120) private String institution;
    @Column(length = 500) private String bio;

    protected TeacherProfile() {}
    public TeacherProfile(AppUser user) { this.user = user; }
    public Long getId() { return id; }
    public AppUser getUser() { return user; }
    public String getDepartment() { return department; }
    public String getDesignation() { return designation; }
    public String getInstitution() { return institution; }
    public String getBio() { return bio; }
    public void update(String department, String designation, String institution, String bio) {
        this.department = department; this.designation = designation; this.institution = institution; this.bio = bio;
    }
}
