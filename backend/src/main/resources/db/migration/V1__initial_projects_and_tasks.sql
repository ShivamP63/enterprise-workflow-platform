-- v0.1: intentionally no users/roles until authentication milestone.
CREATE TABLE projects (
    id uuid PRIMARY KEY,
    name varchar(120) NOT NULL,
    description varchar(2000),
    status varchar(20) NOT NULL DEFAULT 'ACTIVE',
    created_at timestamptz NOT NULL,
    updated_at timestamptz NOT NULL,
    CONSTRAINT ck_projects_status CHECK (status IN ('ACTIVE', 'ARCHIVED')),
    CONSTRAINT ck_projects_name CHECK (length(trim(name)) > 0)
);
CREATE TABLE tasks (
    id uuid PRIMARY KEY,
    project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title varchar(160) NOT NULL,
    details varchar(4000),
    status varchar(20) NOT NULL DEFAULT 'TODO',
    priority varchar(20) NOT NULL DEFAULT 'MEDIUM',
    due_date date,
    created_at timestamptz NOT NULL,
    updated_at timestamptz NOT NULL,
    CONSTRAINT ck_tasks_status CHECK (status IN ('TODO','IN_PROGRESS','DONE')),
    CONSTRAINT ck_tasks_priority CHECK (priority IN ('LOW','MEDIUM','HIGH')),
    CONSTRAINT ck_tasks_title CHECK (length(trim(title)) > 0)
);
CREATE INDEX ix_tasks_project_id ON tasks(project_id);
CREATE INDEX ix_tasks_project_status ON tasks(project_id,status);
