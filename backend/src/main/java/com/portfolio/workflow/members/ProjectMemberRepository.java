package com.portfolio.workflow.members;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProjectMemberRepository extends JpaRepository<ProjectMemberEntity, ProjectMemberId> {
    List<ProjectMemberEntity> findByIdUserId(UUID userId);
    Optional<ProjectMemberEntity> findByIdProjectIdAndIdUserId(UUID projectId, UUID userId);
}
