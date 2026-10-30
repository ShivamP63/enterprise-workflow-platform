package com.portfolio.workflow.projects;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.util.UUID;

public final class ProjectDtos {
    private ProjectDtos() {}
    public record Create(@NotBlank @Size(max=120) String name, @Size(max=2000) String description) {}
    public record Update(@Size(min=1,max=120) String name, @Size(max=2000) String description, ProjectStatus status) {}
    public record View(UUID id, String name, String description, ProjectStatus status, Instant createdAt, Instant updatedAt) {
        public static View from(ProjectEntity p) { return new View(p.getId(),p.getName(),p.getDescription(),p.getStatus(),p.getCreatedAt(),p.getUpdatedAt()); }
    }
}
