package com.codegrowth.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.time.Instant;

@Entity
@Table(name = "connected_repositories")
public class ConnectedRepository {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
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

    protected ConnectedRepository() {
    }

    public ConnectedRepository(AppUser student, String repositoryUrl, String branch, String name) {
        this.student = student;
        this.repositoryUrl = repositoryUrl;
        this.branch = branch;
        this.name = name;
        this.lastAnalysisStatus = "PENDING";
    }

    public Long getId() {
        return id;
    }

    public AppUser getStudent() {
        return student;
    }

    public void setStudent(AppUser student) {
        this.student = student;
    }

    public String getRepositoryUrl() {
        return repositoryUrl;
    }

    public void setRepositoryUrl(String repositoryUrl) {
        this.repositoryUrl = repositoryUrl;
    }

    public String getBranch() {
        return branch;
    }

    public void setBranch(String branch) {
        this.branch = branch;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Instant getConnectedAt() {
        return connectedAt;
    }

    public void setConnectedAt(Instant connectedAt) {
        this.connectedAt = connectedAt;
    }

    public String getLastAnalysisStatus() {
        return lastAnalysisStatus;
    }

    public void setLastAnalysisStatus(String lastAnalysisStatus) {
        this.lastAnalysisStatus = lastAnalysisStatus;
    }

    public String getLatestAnalysisJson() {
        return latestAnalysisJson;
    }

    public void setLatestAnalysisJson(String latestAnalysisJson) {
        this.latestAnalysisJson = latestAnalysisJson;
    }
}
