package com.portfolio.workflow.projects;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
public interface ProjectRepository extends JpaRepository<ProjectEntity,UUID> {}
