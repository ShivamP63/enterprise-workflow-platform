package com.portfolio.workflow.tasks;

import com.portfolio.workflow.projects.ProjectEntity;
import jakarta.persistence.*;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name="tasks")
public class TaskEntity {
    @Id @GeneratedValue(strategy=GenerationType.UUID) private UUID id;
    @ManyToOne(fetch=FetchType.LAZY,optional=false)
    @JoinColumn(name="project_id",nullable=false) private ProjectEntity project;
    @Column(nullable=false,length=160) private String title;
    @Column(length=4000) private String details;
    @Enumerated(EnumType.STRING) @Column(nullable=false,length=20) private TaskStatus status=TaskStatus.TODO;
    @Enumerated(EnumType.STRING) @Column(nullable=false,length=20) private TaskPriority priority=TaskPriority.MEDIUM;
    @Column(name="due_date") private LocalDate dueDate;
    @Column(name="created_at",nullable=false) private Instant createdAt;
    @Column(name="updated_at",nullable=false) private Instant updatedAt;
    @PrePersist public void onCreate(){ createdAt=Instant.now();updatedAt=createdAt; }
    @PreUpdate public void onUpdate(){ updatedAt=Instant.now(); }
    public UUID getId(){return id;}
    public ProjectEntity getProject(){return project;}
    public String getTitle(){return title;}
    public String getDetails(){return details;}
    public TaskStatus getStatus(){return status;}
    public TaskPriority getPriority(){return priority;}
    public LocalDate getDueDate(){return dueDate;}
    public Instant getCreatedAt(){return createdAt;}
    public Instant getUpdatedAt(){return updatedAt;}
    public void setProject(ProjectEntity value){project=value;}
    public void setTitle(String value){title=value;}
    public void setDetails(String value){details=value;}
    public void setStatus(TaskStatus value){status=value;}
    public void setPriority(TaskPriority value){priority=value;}
    public void setDueDate(LocalDate value){dueDate=value;}
}
