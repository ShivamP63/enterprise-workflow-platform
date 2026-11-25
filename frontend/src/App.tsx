import { useEffect, useState, type FormEvent } from "react";
import { API_BASE_URL, clearAuthToken, getAuthToken, saveAuthToken } from "./api/client";
import { isHostedDemo, demoRequest } from "./api/demo";

type ProjectStatus = "ACTIVE" | "ARCHIVED";
type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";
type TaskPriority = "LOW" | "MEDIUM" | "HIGH";
type Project = { id: string; name: string; description: string | null; status: ProjectStatus };
type Task = { id: string; title: string; details: string | null; status: TaskStatus; priority: TaskPriority; projectId: string };
type AuthResponse = { token: string; user: { id: string; name: string; email: string } };

async function api<T>(path: string, options?: RequestInit): Promise<T> {
  if (isHostedDemo) return demoRequest<T>(path, options);
  const token = getAuthToken();
  const headers = new Headers(options?.headers);
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const res = await fetch(API_BASE_URL + path, { ...options, headers });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API error ${res.status}: ${body.slice(0, 200)}`);
  }
  return res.json() as Promise<T>;
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
    } finally { setBusy(false); }
  }

  return <main className="auth-shell">
    <section className="auth-card">
      <p className="eyebrow">ENTERPRISE WORKFLOW</p>
      <h1>{mode === "login" ? "Welcome back" : "Create your workspace"}</h1>
      <p className="muted">Sign in to manage projects and tasks across your account.</p>
      <form onSubmit={submit} className="stack">
        {mode === "register" && <><label htmlFor="name">Name</label><input id="name" value={name} onChange={event => setName(event.target.value)} maxLength={120} required /></>}
        <label htmlFor="email">Email</label><input id="email" type="email" value={email} onChange={event => setEmail(event.target.value)} autoComplete="email" required />
        <label htmlFor="password">Password</label><input id="password" type="password" value={password} onChange={event => setPassword(event.target.value)} minLength={8} autoComplete={mode === "login" ? "current-password" : "new-password"} required />
        <button type="submit" disabled={busy}>{busy ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}</button>
      </form>
      {message && <div role="status" className="notice error">{message}</div>}
      <button className="text-button" onClick={() => { setMode(mode === "login" ? "register" : "login"); setMessage(""); }}>
        {mode === "login" ? "Need an account? Create one" : "Already have an account? Sign in"}
      </button>
    </section>
  </main>;
}

export default function App() {
  const [authenticated, setAuthenticated] = useState(isHostedDemo || Boolean(getAuthToken()));
  const [userName, setUserName] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [selected, setSelected] = useState<string>(() => {
    try { return isHostedDemo ? localStorage.getItem("portfolio-workflow-selected-project") ?? "" : ""; }
    catch { return ""; }
  });
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projectName, setProjectName] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [editName, setEditName] = useState("");
  const [message, setMessage] = useState("");

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
  }

  async function loadProjects() {
    try {
      const data = await api<Project[]>("/api/projects");
      setProjects(data);
      setSelected(current => data.some(p => p.id === current) ? current : (data[0]?.id ?? ""));
    } catch (err) {
      if (String(err).includes("API error 401")) logout();
      else setMessage(String(err));
    }
  }
  async function loadTasks(projectId: string) {
    try { setTasks(await api<Task[]>(`/api/projects/${projectId}/tasks`)); }
    catch (err) { setMessage(String(err)); }
  }

  useEffect(() => { if (authenticated) void loadProjects(); }, [authenticated]);
  useEffect(() => {
    if (isHostedDemo && selected) {
      try { localStorage.setItem("portfolio-workflow-selected-project", selected); } catch { /* optional preference */ }
    }
  }, [selected]);
  useEffect(() => {
    if (selected) {
      const project = projects.find(p => p.id === selected);
      setEditName(project?.name ?? "");
      void loadTasks(selected);
    } else { setTasks([]); setEditName(""); }
  }, [selected, projects]);

  async function createProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!projectName.trim()) return;
    try {
      const created = await api<Project>("/api/projects", { method: "POST", body: JSON.stringify({ name: projectName.trim() }) });
      setProjectName(""); setMessage(`Created project ${created.name}`); await loadProjects(); setSelected(created.id);
    } catch (err) { setMessage(String(err)); }
  }
  async function renameProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected || !editName.trim()) return;
    try { await api<Project>(`/api/projects/${selected}`, { method: "PATCH", body: JSON.stringify({ name: editName.trim() }) }); setMessage("Project updated"); await loadProjects(); }
    catch (err) { setMessage(String(err)); }
  }
  async function createTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected || !taskTitle.trim()) return;
    try { await api<Task>(`/api/projects/${selected}/tasks`, { method: "POST", body: JSON.stringify({ title: taskTitle.trim(), priority: "MEDIUM" }) }); setTaskTitle(""); setMessage("Task created"); await loadTasks(selected); }
    catch (err) { setMessage(String(err)); }
  }
  async function changeStatus(taskId: string, status: TaskStatus) {
    try { await api<Task>(`/api/tasks/${taskId}`, { method: "PATCH", body: JSON.stringify({ status }) }); setMessage("Task saved"); await loadTasks(selected); }
    catch (err) { setMessage(String(err)); }
  }

  if (!authenticated) return <AuthScreen onAuthenticated={handleAuthenticated} />;

  return <main className="container">
    <header className="app-header"><div><p className="eyebrow">ENTERPRISE WORKFLOW</p><h1>Projects and tasks</h1><p>{isHostedDemo ? "Try the workflow in your browser." : "A secured Spring Boot and PostgreSQL workspace."}</p></div>{!isHostedDemo && <button className="secondary compact" onClick={logout}>Sign out{userName ? ` · ${userName}` : ""}</button>}</header>
    {isHostedDemo && <div className="notice"><strong>Interactive browser-only demo.</strong> All changes stay in your browser. The secured Java/Spring Boot + PostgreSQL application is implemented and tested in the linked GitHub repository.</div>}
    {message && <div role="status" className="notice">{message}</div>}
    <div className="columns">
      <section className="card"><h2>Projects</h2><form onSubmit={createProject} className="stack"><label htmlFor="new-project">New project name</label><input id="new-project" value={projectName} maxLength={120} onChange={event => setProjectName(event.target.value)} required placeholder="Customer onboarding" /><button type="submit">Create project</button></form><ul className="items">{projects.map(project => <li key={project.id}><button className={selected === project.id ? "selected item-button" : "item-button"} onClick={() => setSelected(project.id)}>{project.name} <small>{project.status}</small></button></li>)}</ul>{selected && <form onSubmit={renameProject} className="stack"><label htmlFor="edit-project">Rename selected project</label><input id="edit-project" value={editName} maxLength={120} onChange={event => setEditName(event.target.value)} /><button type="submit" className="secondary">Save project name</button></form>}</section>
      <section className="card"><h2>Tasks</h2>{selected ? <><form onSubmit={createTask} className="stack"><label htmlFor="new-task">New task title</label><input id="new-task" value={taskTitle} maxLength={160} onChange={event => setTaskTitle(event.target.value)} placeholder="Review requirements" required /><button type="submit">Add task</button></form><ul className="items">{tasks.map(task => <li className="task" key={task.id}><strong>{task.title}</strong><label>Status<select aria-label={`Status for ${task.title}`} value={task.status} onChange={event => void changeStatus(task.id, event.target.value as TaskStatus)}><option value="TODO">To do</option><option value="IN_PROGRESS">In progress</option><option value="DONE">Done</option></select></label></li>)}</ul>{tasks.length === 0 && <p className="muted">No tasks yet. Add the first one.</p>}</> : <p className="muted">Create or select a project first.</p>}</section>
    </div><footer>{isHostedDemo ? "Public preview: local browser data only" : "Your projects are protected by account-based access control."}</footer>
  </main>;
}
