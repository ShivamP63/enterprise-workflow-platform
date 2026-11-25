import { useEffect, useMemo, useState, type FormEvent } from "react";
import { API_BASE_URL, clearAuthToken, getAuthToken, saveAuthToken } from "./api/client";
import { demoRequest, isHostedDemo } from "./api/demo";

type ProjectStatus = "ACTIVE" | "ARCHIVED";
type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";
type TaskPriority = "LOW" | "MEDIUM" | "HIGH";
type Project = { id: string; name: string; description: string | null; status: ProjectStatus };
type Task = { id: string; title: string; details: string | null; status: TaskStatus; priority: TaskPriority; projectId: string };
type AuthResponse = { token: string; user: { id: string; name: string; email: string } };

const statusLabels: Record<TaskStatus, string> = { TODO: "To do", IN_PROGRESS: "In progress", DONE: "Done" };
const priorityLabels: Record<TaskPriority, string> = { LOW: "Low", MEDIUM: "Medium", HIGH: "High" };

async function api<T>(path: string, options?: RequestInit): Promise<T> {
  if (isHostedDemo) return demoRequest<T>(path, options);
  const token = getAuthToken();
  const headers = new Headers(options?.headers);
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const response = await fetch(API_BASE_URL + path, { ...options, headers });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`API error ${response.status}: ${body.slice(0, 200)}`);
  }
  return response.json() as Promise<T>;
}

function AuthScreen({ onAuthenticated }: { onAuthenticated: (response: AuthResponse) => void }) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mode === "register" ? { name, email, password } : { email, password }),
      });
      if (!response.ok) {
        const body = await response.text();
        throw new Error(body || "Unable to authenticate");
      }
      onAuthenticated(await response.json() as AuthResponse);
    } catch (error) {
      setMessage(String(error).replace(/^Error: /, ""));
    } finally {
      setBusy(false);
    }
  }

  return <main className="auth-shell">
    <section className="auth-visual" aria-hidden="true">
      <div className="visual-grid" />
      <div className="visual-copy">
        <span className="brand-mark large">EW</span>
        <p className="kicker">WORKSTREAM</p>
        <h1>Make every handoff visible.</h1>
        <p>Bring projects, ownership, and the next action into one focused workspace.</p>
        <div className="signal-row"><span /><span /><span /><span /></div>
      </div>
    </section>
    <section className="auth-panel">
      <div className="auth-card">
        <span className="brand-mark">EW</span>
        <p className="kicker">{mode === "login" ? "WELCOME BACK" : "GET STARTED"}</p>
        <h2>{mode === "login" ? "Return to your workspace" : "Create your workspace"}</h2>
        <p className="muted">{mode === "login" ? "Sign in to pick up where your team left off." : "Set up a secure space for projects and delivery work."}</p>
        <form onSubmit={submit} className="form-stack">
          {mode === "register" && <label htmlFor="name">Your name<input id="name" value={name} onChange={event => setName(event.target.value)} maxLength={120} autoComplete="name" required /></label>}
          <label htmlFor="email">Email address<input id="email" type="email" value={email} onChange={event => setEmail(event.target.value)} autoComplete="email" required /></label>
          <label htmlFor="password">Password<input id="password" type="password" value={password} onChange={event => setPassword(event.target.value)} minLength={8} autoComplete={mode === "login" ? "current-password" : "new-password"} required /></label>
          <button type="submit" className="primary-button" disabled={busy}>{busy ? "Working…" : mode === "login" ? "Sign in" : "Create account"}</button>
        </form>
        {message && <div role="status" className="notice error">{message}</div>}
        <button className="text-button" onClick={() => { setMode(mode === "login" ? "register" : "login"); setMessage(""); }}>
          {mode === "login" ? "Need an account? Create one" : "Already registered? Sign in"}
        </button>
      </div>
    </section>
  </main>;
}

function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map(part => part[0]?.toUpperCase()).join("") || "WM";
}

export default function App() {
  const [authenticated, setAuthenticated] = useState(isHostedDemo || Boolean(getAuthToken()));
  const [userName, setUserName] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [selected, setSelected] = useState<string>(() => {
    try { return localStorage.getItem("workflow-selected-project") ?? ""; } catch { return ""; }
  });
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projectName, setProjectName] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskPriority, setTaskPriority] = useState<TaskPriority>("MEDIUM");
  const [editName, setEditName] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const selectedProject = projects.find(project => project.id === selected);
  const counts = useMemo(() => ({
    total: tasks.length,
    active: tasks.filter(task => task.status !== "DONE").length,
    done: tasks.filter(task => task.status === "DONE").length,
  }), [tasks]);

  function handleAuthenticated(response: AuthResponse) {
    saveAuthToken(response.token);
    setUserName(response.user.name);
    setAuthenticated(true);
  }

  function logout() {
    clearAuthToken();
    setAuthenticated(false);
    setProjects([]);
    setTasks([]);
    setSelected("");
    setUserName("");
  }

  async function loadProjects() {
    try {
      const data = await api<Project[]>("/api/projects");
      setProjects(data);
      setSelected(current => data.some(project => project.id === current) ? current : (data[0]?.id ?? ""));
    } catch (error) {
      if (String(error).includes("API error 401")) logout();
      else setMessage(String(error));
    }
  }

  async function loadTasks(projectId: string) {
    try { setTasks(await api<Task[]>(`/api/projects/${projectId}/tasks`)); }
    catch (error) { setMessage(String(error)); }
  }

  useEffect(() => { if (authenticated) void loadProjects(); }, [authenticated]);
  useEffect(() => {
    if (selected) {
      try { localStorage.setItem("workflow-selected-project", selected); } catch { /* optional preference */ }
      setEditName(selectedProject?.name ?? "");
      void loadTasks(selected);
    } else {
      setTasks([]);
      setEditName("");
    }
  }, [selected, selectedProject?.name]);

  async function createProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!projectName.trim()) return;
    setBusy(true);
    try {
      const created = await api<Project>("/api/projects", { method: "POST", body: JSON.stringify({ name: projectName.trim() }) });
      setProjectName("");
      setMessage(`Created ${created.name}`);
      await loadProjects();
      setSelected(created.id);
    } catch (error) { setMessage(String(error)); }
    finally { setBusy(false); }
  }

  async function renameProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected || !editName.trim()) return;
    try {
      await api<Project>(`/api/projects/${selected}`, { method: "PATCH", body: JSON.stringify({ name: editName.trim() }) });
      setMessage("Project name updated");
      await loadProjects();
    } catch (error) { setMessage(String(error)); }
  }

  async function createTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected || !taskTitle.trim()) return;
    setBusy(true);
    try {
      await api<Task>(`/api/projects/${selected}/tasks`, { method: "POST", body: JSON.stringify({ title: taskTitle.trim(), priority: taskPriority }) });
      setTaskTitle("");
      setTaskPriority("MEDIUM");
      setMessage("Task added to the project");
      await loadTasks(selected);
    } catch (error) { setMessage(String(error)); }
    finally { setBusy(false); }
  }

  async function changeStatus(taskId: string, status: TaskStatus) {
    try {
      await api<Task>(`/api/tasks/${taskId}`, { method: "PATCH", body: JSON.stringify({ status }) });
      setMessage("Task saved");
      await loadTasks(selected);
    } catch (error) { setMessage(String(error)); }
  }

  if (!authenticated) return <AuthScreen onAuthenticated={handleAuthenticated} />;

  return <main className="app-shell">
    <header className="topbar">
      <div className="topbar-brand"><span className="brand-mark">EW</span><span>Workstream</span></div>
      <div className="topbar-actions"><span className="connection-status"><i /> {isHostedDemo ? "Preview mode" : "Connected"}</span><span className="avatar">{initials(userName)}</span>{!isHostedDemo && <button className="ghost-button" onClick={logout}>Sign out</button>}</div>
    </header>
    <div className="workspace-layout">
      <aside className="sidebar">
        <div className="sidebar-heading"><div><p className="kicker">WORKSPACE</p><h1>Projects</h1></div><span className="count-badge">{projects.length}</span></div>
        <form onSubmit={createProject} className="project-create">
          <label htmlFor="new-project">New project</label>
          <div className="inline-field"><input id="new-project" value={projectName} maxLength={120} onChange={event => setProjectName(event.target.value)} placeholder="e.g. Client onboarding" required /><button type="submit" aria-label="Create project" disabled={busy}>+</button></div>
        </form>
        <nav aria-label="Projects" className="project-list">
          {projects.map(project => <button key={project.id} className={selected === project.id ? "project-link active" : "project-link"} onClick={() => setSelected(project.id)}><span className="project-dot" /> <span>{project.name}</span><small>{project.status === "ACTIVE" ? "Active" : "Archived"}</small></button>)}
          {projects.length === 0 && <p className="sidebar-empty">Your projects will appear here.</p>}
        </nav>
        <div className="sidebar-note"><span className="note-icon">↗</span><p>Keep the next action clear and the whole team aligned.</p></div>
      </aside>
      <section className="content-area">
        <div className="content-heading"><div><p className="kicker">OPERATIONS WORKSPACE</p><h2>{selectedProject?.name ?? "Your delivery overview"}</h2><p className="muted">{selectedProject ? "Track the work that moves this project forward." : "Create a project to start organising your delivery work."}</p></div>{selectedProject && <form onSubmit={renameProject} className="rename-form"><label htmlFor="edit-project">Project name</label><div className="inline-field"><input id="edit-project" value={editName} maxLength={120} onChange={event => setEditName(event.target.value)} /><button className="secondary-button" type="submit">Save</button></div></form>}</div>
        {message && <div role="status" className="notice">{message}</div>}
        {!selectedProject ? <div className="empty-state"><div className="empty-icon">＋</div><h3>Start with a project</h3><p>Use the project list to create a focused space for your next initiative.</p></div> : <>
          <div className="metrics"><div><span>Open tasks</span><strong>{counts.active}</strong></div><div><span>Completed</span><strong>{counts.done}</strong></div><div><span>Total tasks</span><strong>{counts.total}</strong></div></div>
          <div className="task-panel">
            <div className="panel-heading"><div><p className="kicker">PROJECT BOARD</p><h3>Next actions</h3></div><span className="panel-caption">{counts.total === 1 ? "1 task" : `${counts.total} tasks`}</span></div>
            <form onSubmit={createTask} className="task-create"><label htmlFor="new-task">Add a task</label><div className="task-create-row"><input id="new-task" value={taskTitle} maxLength={160} onChange={event => setTaskTitle(event.target.value)} placeholder="What needs to happen next?" required /><select aria-label="Task priority" value={taskPriority} onChange={event => setTaskPriority(event.target.value as TaskPriority)}><option value="LOW">Low priority</option><option value="MEDIUM">Medium priority</option><option value="HIGH">High priority</option></select><button className="primary-button" type="submit" disabled={busy}>Add task</button></div></form>
            <div className="task-columns">{(["TODO", "IN_PROGRESS", "DONE"] as TaskStatus[]).map(status => <section className="task-column" key={status}><div className="column-heading"><span>{statusLabels[status]}</span><b>{tasks.filter(task => task.status === status).length}</b></div><div className="task-stack">{tasks.filter(task => task.status === status).map(task => <article className="task-card" key={task.id}><div className="task-card-top"><span className={`priority ${task.priority.toLowerCase()}`}>{priorityLabels[task.priority]}</span><span className="task-mark">{status === "DONE" ? "✓" : "·"}</span></div><strong>{task.title}</strong><label className="status-control" htmlFor={`status-${task.id}`}>Status<select id={`status-${task.id}`} aria-label={`Status for ${task.title}`} value={task.status} onChange={event => void changeStatus(task.id, event.target.value as TaskStatus)}><option value="TODO">To do</option><option value="IN_PROGRESS">In progress</option><option value="DONE">Done</option></select></label></article>)}{tasks.filter(task => task.status === status).length === 0 && <div className="column-empty">No tasks here</div>}</div></section>)}</div>
          </div>
        </>}
      </section>
    </div>
    <footer className="app-footer">{isHostedDemo ? "Local preview data is stored in this browser." : "Secure workspace · Changes are saved to the connected service."}</footer>
  </main>;
}
