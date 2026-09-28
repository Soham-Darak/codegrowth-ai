package com.codegrowth.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "connected_repositories")
public class ConnectedRepository {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "student_id", nullable = false)
    private AppUser student;

    @Column(nullable = false)
    private String repositoryUrl;
    
    private String branch;
    private String name;

    private Instant connectedAt = Instant.now();
    
    private String lastAnalysisStatus; 

    @Column(columnDefinition = "TEXT")
    private String latestAnalysisJson; 

    protected ConnectedRepository() {}

    public ConnectedRepository(AppUser student, String repositoryUrl, String branch, String name) {
        this.student = student;
        this.repositoryUrl = repositoryUrl;
        this.branch = branch;
        this.name = name;
        this.lastAnalysisStatus = "PENDING";
    }

    public Long getId() { return id; }
    public AppUser getStudent() { return student; }

    public String getRepositoryUrl() { return repositoryUrl; }
    public String getBranch() { return branch; }
    public String getName() { return name; }
    public Instant getConnectedAt() { return connectedAt; }
    public String getLastAnalysisStatus() { return lastAnalysisStatus; }
    public String getLatestAnalysisJson() { return latestAnalysisJson; }

    public void setLastAnalysisStatus(String lastAnalysisStatus) { this.lastAnalysisStatus = lastAnalysisStatus; }
    public void setLatestAnalysisJson(String latestAnalysisJson) { this.latestAnalysisJson = latestAnalysisJson; }
}

