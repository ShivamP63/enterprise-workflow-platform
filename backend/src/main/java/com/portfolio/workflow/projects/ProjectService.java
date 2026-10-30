package com.portfolio.workflow.projects;

import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ProjectService {
    private final ProjectRepository repository;
    public ProjectService(ProjectRepository repository) { this.repository=repository; }
    @Transactional(readOnly=true)
    public List<ProjectDtos.View> list() { return repository.findAll().stream().map(ProjectDtos.View::from).toList(); }
    @Transactional(readOnly=true)
    public ProjectDtos.View get(UUID id) { return ProjectDtos.View.from(find(id)); }
    @Transactional
    public ProjectDtos.View create(ProjectDtos.Create input) {
        ProjectEntity p=new ProjectEntity();
        p.setName(cleanRequired(input.name()));
        p.setDescription(input.description());
        return ProjectDtos.View.from(repository.saveAndFlush(p));
    }
    @Transactional
    public ProjectDtos.View update(UUID id, ProjectDtos.Update input) {
        ProjectEntity p=find(id);
        if(input.name()!=null) p.setName(cleanRequired(input.name()));
        if(input.description()!=null) p.setDescription(input.description());
        if(input.status()!=null) p.setStatus(input.status());
        return ProjectDtos.View.from(repository.saveAndFlush(p));
    }
    public ProjectEntity find(UUID id) {
        return repository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,"Project not found"));
    }
    private String cleanRequired(String value) {
        if(value==null || value.isBlank()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Name cannot be blank");
        return value.trim();
    }
}
