package com.portfolio.workflow.tasks;

import com.portfolio.workflow.projects.ProjectEntity;
import com.portfolio.workflow.projects.ProjectService;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class TaskService {
    private final TaskRepository repository;
    private final ProjectService projects;
    public TaskService(TaskRepository repository, ProjectService projects) { this.repository = repository; this.projects = projects; }

    @Transactional(readOnly = true)
    public List<TaskDtos.View> listByProject(UUID projectId, UUID userId) {
        projects.requireAccess(projectId, userId, false);
        return repository.findByProject_IdOrderByCreatedAtDesc(projectId).stream().map(TaskDtos.View::from).toList();
    }

    @Transactional
    public TaskDtos.View create(UUID projectId, TaskDtos.Create input, UUID userId) {
        ProjectEntity project = projects.requireAccess(projectId, userId, true);
        TaskEntity task = new TaskEntity();
        task.setProject(project);
        task.setTitle(nonBlank(input.title()));
        task.setDetails(input.details());
        if (input.priority() != null) task.setPriority(input.priority());
        task.setDueDate(input.dueDate());
        return TaskDtos.View.from(repository.saveAndFlush(task));
    }

    @Transactional
    public TaskDtos.View update(UUID id, TaskDtos.Update input, UUID userId) {
        TaskEntity task = repository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found"));
        projects.requireAccess(task.getProject().getId(), userId, true);
        if (input.title() != null) task.setTitle(nonBlank(input.title()));
        if (input.details() != null) task.setDetails(input.details());
        if (input.status() != null) task.setStatus(input.status());
        if (input.priority() != null) task.setPriority(input.priority());
        if (input.dueDate() != null) task.setDueDate(input.dueDate());
        return TaskDtos.View.from(repository.saveAndFlush(task));
    }

    private String nonBlank(String value) {
        if (value == null || value.isBlank()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Task title cannot be blank");
        return value.trim();
    }
}
