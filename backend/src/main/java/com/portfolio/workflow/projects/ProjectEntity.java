package com.portfolio.workflow.projects;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "projects")
public class ProjectEntity {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @Column(nullable=false, length=120)
    private String name;
    @Column(length=2000)
    private String description;
    @Enumerated(EnumType.STRING)
    @Column(nullable=false, length=20)
    private ProjectStatus status = ProjectStatus.ACTIVE;
    @Column(name="created_at", nullable=false)
    private Instant createdAt;
    @Column(name="updated_at", nullable=false)
    private Instant updatedAt;

    @PrePersist public void onCreate() { createdAt=Instant.now(); updatedAt=createdAt; }
    @PreUpdate public void onUpdate() { updatedAt=Instant.now(); }
    public UUID getId(){ return id; }
    public String getName(){ return name; }
    public String getDescription(){ return description; }
    public ProjectStatus getStatus(){ return status; }
    public Instant getCreatedAt(){ return createdAt; }
    public Instant getUpdatedAt(){ return updatedAt; }
    public void setName(String value){ name=value; }
    public void setDescription(String value){ description=value; }
    public void setStatus(ProjectStatus value){ status=value; }
}
