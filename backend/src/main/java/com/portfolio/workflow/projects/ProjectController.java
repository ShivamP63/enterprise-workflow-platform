package com.portfolio.workflow.projects;

import com.portfolio.workflow.common.CurrentUser;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {
    private final ProjectService service;
    public ProjectController(ProjectService service) { this.service = service; }

    @GetMapping
    public List<ProjectDtos.View> list(Authentication authentication) { return service.list(CurrentUser.id(authentication)); }

    @GetMapping("/{id}")
    public ProjectDtos.View get(@PathVariable UUID id, Authentication authentication) { return service.get(id, CurrentUser.id(authentication)); }

    @PostMapping
    public ResponseEntity<ProjectDtos.View> create(@Valid @RequestBody ProjectDtos.Create input, Authentication authentication) {
        ProjectDtos.View result = service.create(input, CurrentUser.id(authentication));
        return ResponseEntity.created(URI.create("/api/projects/" + result.id())).body(result);
    }

    @PatchMapping("/{id}")
    public ProjectDtos.View update(@PathVariable UUID id, @Valid @RequestBody ProjectDtos.Update input, Authentication authentication) {
        return service.update(id, input, CurrentUser.id(authentication));
    }
}
