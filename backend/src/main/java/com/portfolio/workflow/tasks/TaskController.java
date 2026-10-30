package com.portfolio.workflow.tasks;

import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
public class TaskController {
    private final TaskService service;
    public TaskController(TaskService service){this.service=service;}
    @GetMapping("/api/projects/{projectId}/tasks")
    public List<TaskDtos.View> list(@PathVariable UUID projectId){return service.listByProject(projectId);}
    @PostMapping("/api/projects/{projectId}/tasks")
    public ResponseEntity<TaskDtos.View> create(@PathVariable UUID projectId,@Valid @RequestBody TaskDtos.Create input) {
        TaskDtos.View result=service.create(projectId,input);
        return ResponseEntity.created(URI.create("/api/tasks/"+result.id())).body(result);
    }
    @PatchMapping("/api/tasks/{id}")
    public TaskDtos.View update(@PathVariable UUID id,@Valid @RequestBody TaskDtos.Update input){return service.update(id,input);}
}
