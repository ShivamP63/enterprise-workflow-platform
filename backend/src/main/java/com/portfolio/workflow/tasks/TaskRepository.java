package com.portfolio.workflow.tasks;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
public interface TaskRepository extends JpaRepository<TaskEntity,UUID> {
    List<TaskEntity> findByProject_IdOrderByCreatedAtDesc(UUID projectId);
}
