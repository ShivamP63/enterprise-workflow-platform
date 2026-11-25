package com.portfolio.workflow.members;

import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.UUID;

@Embeddable
public class ProjectMemberId implements Serializable {
    private UUID projectId;
    private UUID userId;

    public ProjectMemberId() {}
    public ProjectMemberId(UUID projectId, UUID userId) { this.projectId = projectId; this.userId = userId; }
    public UUID getProjectId() { return projectId; }
    public UUID getUserId() { return userId; }
    @Override public boolean equals(Object other) { if (this == other) return true; if (!(other instanceof ProjectMemberId id)) return false; return java.util.Objects.equals(projectId, id.projectId) && java.util.Objects.equals(userId, id.userId); }
    @Override public int hashCode() { return java.util.Objects.hash(projectId, userId); }
}
