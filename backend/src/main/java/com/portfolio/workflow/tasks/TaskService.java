package com.portfolio.workflow.tasks;

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
    public TaskService(TaskRepository repository, ProjectService projects){ this.repository=repository;this.projects=projects; }
    @Transactional(readOnly=true)
    public List<TaskDtos.View> listByProject(UUID projectId) {
        projects.find(projectId);
        return repository.findByProject_IdOrderByCreatedAtDesc(projectId).stream().map(TaskDtos.View::from).toList();
    }
    @Transactional
    public TaskDtos.View create(UUID projectId, TaskDtos.Create input) {
        TaskEntity t=new TaskEntity();
        t.setProject(projects.find(projectId));
        t.setTitle(nonBlank(input.title()));
        t.setDetails(input.details());
        if(input.priority()!=null) t.setPriority(input.priority());
        t.setDueDate(input.dueDate());
        return TaskDtos.View.from(repository.saveAndFlush(t));
    }
    @Transactional
    public TaskDtos.View update(UUID id,TaskDtos.Update input){
        TaskEntity t=repository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,"Task not found"));
        if(input.title()!=null) t.setTitle(nonBlank(input.title()));
        if(input.details()!=null) t.setDetails(input.details());
        if(input.status()!=null) t.setStatus(input.status());
        if(input.priority()!=null) t.setPriority(input.priority());
        if(input.dueDate()!=null) t.setDueDate(input.dueDate());
        return TaskDtos.View.from(repository.saveAndFlush(t));
    }
    private String nonBlank(String value){
        if(value==null || value.isBlank()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Task title cannot be blank");
        return value.trim();
    }
}
