package com.portfolio.workflow.projects;

import com.portfolio.workflow.members.ProjectMemberEntity;
import com.portfolio.workflow.members.ProjectMemberRepository;
import com.portfolio.workflow.members.ProjectRole;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ProjectService {
    private final ProjectRepository repository;
    private final ProjectMemberRepository members;

    public ProjectService(ProjectRepository repository, ProjectMemberRepository members) {
        this.repository = repository;
        this.members = members;
    }

    @Transactional(readOnly = true)
    public List<ProjectDtos.View> list(UUID userId) {
        return members.findByIdUserId(userId).stream()
            .map(member -> repository.findById(member.getId().getProjectId()).orElse(null))
            .filter(java.util.Objects::nonNull)
            .sorted(Comparator.comparing(ProjectEntity::getCreatedAt).reversed())
            .map(ProjectDtos.View::from)
            .toList();
    }

    @Transactional(readOnly = true)
    public ProjectDtos.View get(UUID id, UUID userId) {
        requireAccess(id, userId, false);
        return ProjectDtos.View.from(find(id));
    }

    @Transactional
    public ProjectDtos.View create(ProjectDtos.Create input, UUID userId) {
        ProjectEntity project = new ProjectEntity();
        project.setOwnerId(userId);
        project.setName(cleanRequired(input.name()));
        project.setDescription(input.description());
        project = repository.saveAndFlush(project);
        members.saveAndFlush(new ProjectMemberEntity(project.getId(), userId, ProjectRole.OWNER));
        return ProjectDtos.View.from(project);
    }

    @Transactional
    public ProjectDtos.View update(UUID id, ProjectDtos.Update input, UUID userId) {
        ProjectEntity project = requireAccess(id, userId, true);
        if (input.name() != null) project.setName(cleanRequired(input.name()));
        if (input.description() != null) project.setDescription(input.description());
        if (input.status() != null) project.setStatus(input.status());
        return ProjectDtos.View.from(repository.saveAndFlush(project));
    }

    @Transactional(readOnly = true)
    public ProjectEntity requireAccess(UUID id, UUID userId, boolean write) {
        ProjectEntity project = find(id);
        ProjectMemberEntity member = members.findByIdProjectIdAndIdUserId(id, userId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not have access to this project"));
        if (write && member.getRole() == ProjectRole.VIEWER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not have permission to change this project");
        }
        return project;
    }

    public ProjectEntity find(UUID id) {
        return repository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found"));
    }

    private String cleanRequired(String value) {
        if (value == null || value.isBlank()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Name cannot be blank");
        return value.trim();
    }
}
