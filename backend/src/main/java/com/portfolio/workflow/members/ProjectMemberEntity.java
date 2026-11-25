package com.portfolio.workflow.members;

import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import jakarta.persistence.Column;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "project_members")
public class ProjectMemberEntity {
    @EmbeddedId
    private ProjectMemberId id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ProjectRole role;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    public ProjectMemberEntity() {}
    public ProjectMemberEntity(UUID projectId, UUID userId, ProjectRole role) {
        id = new ProjectMemberId(projectId, userId);
        this.role = role;
    }
    @jakarta.persistence.PrePersist
    public void onCreate() { createdAt = Instant.now(); }
    public ProjectMemberId getId() { return id; }
    public ProjectRole getRole() { return role; }
    public void setRole(ProjectRole value) { role = value; }
}
