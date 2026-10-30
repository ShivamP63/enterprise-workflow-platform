package com.portfolio.workflow.projects;

import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ProjectServiceTest {
    @Test void missingProjectGivesNotFound(){
        ProjectRepository repo=mock(ProjectRepository.class);
        UUID id=UUID.randomUUID();
        when(repo.findById(id)).thenReturn(Optional.empty());
        ResponseStatusException ex=assertThrows(ResponseStatusException.class,()->new ProjectService(repo).get(id));
        assertEquals(404,ex.getStatusCode().value()); 
    }
}
