package com.codegrowth.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.Instant;

@Entity
@Table(name = "app_users", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"provider", "provider_id"})
})
public class AppUser {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @com.fasterxml.jackson.annotation.JsonIgnore
    @Column(length = 100)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role = Role.STUDENT;

    @Column(nullable = false)
    private boolean enabled = true;

    @Column(length = 20)
    private String provider;

    @Column(name = "provider_id", length = 200)
    private String providerId;

    @Column(length = 500)
    private String avatarUrl;

    @com.fasterxml.jackson.annotation.JsonIgnore
    @Column(length = 255)
    private String githubAccessToken;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    protected AppUser() {
    }

    public AppUser(String name, String email, String password) {
        this(name, email, password, Role.STUDENT);
    }

    public AppUser(String name, String email, String password, Role role) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.role = role == null ? Role.STUDENT : role;
        this.enabled = true;
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    /** OAuth constructor — no password required. */
    public AppUser(String name, String email, String provider, String providerId, String avatarUrl) {
        this.name = name;
        this.email = email;
        this.provider = provider;
        this.providerId = providerId;
        this.avatarUrl = avatarUrl;
        this.role = Role.STUDENT;
        this.enabled = true;
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    public String getPassword() { return password; }
    public Role getRole() { return role == null ? Role.STUDENT : role; }
    public boolean isEnabled() { return enabled; }
    public String getProvider() { return provider; }
    public String getProviderId() { return providerId; }
    public String getAvatarUrl() { return avatarUrl; }
    public String getGithubAccessToken() { return githubAccessToken; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }

    public void setRole(Role role) { this.role = role == null ? Role.STUDENT : role; }
    public void setEnabled(boolean enabled) { this.enabled = enabled; }
    public void setName(String name) { this.name = name; this.updatedAt = Instant.now(); }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; this.updatedAt = Instant.now(); }
    public void setGithubAccessToken(String githubAccessToken) { this.githubAccessToken = githubAccessToken; this.updatedAt = Instant.now(); }
}


