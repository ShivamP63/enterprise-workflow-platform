package com.portfolio.workflow.tasks;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public final class TaskDtos {
    private TaskDtos() {}
    public record Create(@NotBlank @Size(max=160) String title, @Size(max=4000) String details, TaskPriority priority, LocalDate dueDate) {}
    public record Update(@Size(min=1,max=160) String title, @Size(max=4000) String details, TaskStatus status, TaskPriority priority, LocalDate dueDate) {}
    public record View(UUID id, UUID projectId, String title, String details, TaskStatus status, TaskPriority priority, LocalDate dueDate, Instant createdAt, Instant updatedAt) {
        public static View from(TaskEntity t) {
            return new View(t.getId(),t.getProject().getId(),t.getTitle(),t.getDetails(),t.getStatus(),t.getPriority(),t.getDueDate(),t.getCreatedAt(),t.getUpdatedAt());
        }
    }
}
