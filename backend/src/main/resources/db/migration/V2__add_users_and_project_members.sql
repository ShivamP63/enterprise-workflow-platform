CREATE TABLE users (
    id uuid PRIMARY KEY,
    name varchar(120) NOT NULL,
    email varchar(320) NOT NULL,
    password_hash varchar(100) NOT NULL,
    created_at timestamptz NOT NULL,
    CONSTRAINT uq_users_email UNIQUE (email),
    CONSTRAINT ck_users_name CHECK (length(trim(name)) > 0)
);

ALTER TABLE projects ADD COLUMN owner_id uuid REFERENCES users(id);

CREATE TABLE project_members (
    project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role varchar(20) NOT NULL,
    created_at timestamptz NOT NULL,
    PRIMARY KEY (project_id, user_id),
    CONSTRAINT ck_project_members_role CHECK (role IN ('OWNER', 'EDITOR', 'VIEWER'))
);

CREATE INDEX ix_project_members_user_id ON project_members(user_id);
CREATE INDEX ix_projects_owner_id ON projects(owner_id);
