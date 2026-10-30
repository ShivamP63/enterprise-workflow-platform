import { useEffect, useState, type FormEvent } from "react";
import { API_BASE_URL } from "./api/client";

type ProjectStatus = "ACTIVE" | "ARCHIVED";
type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";
type TaskPriority = "LOW" | "MEDIUM" | "HIGH";
type Project = { id: string; name: string; description: string | null; status: ProjectStatus };
type Task = { id: string; title: string; details: string | null; status: TaskStatus; priority: TaskPriority; projectId: string };

async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(API_BASE_URL + path, { headers: { "Content-Type": "application/json" }, ...options });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API error ${res.status}: ${body.slice(0, 200)}`);
  }
  return res.json() as Promise<T>;
}

export default function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projectName, setProjectName] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [editName, setEditName] = useState("");
  const [message, setMessage] = useState("");

  async function loadProjects() {
    try {
      const data = await api<Project[]>("/api/projects");
      setProjects(data);
      setSelected(current => data.some(p => p.id === current) ? current : (data[0]?.id ?? ""));
    } catch (err) { setMessage(String(err)); }
  }
  async function loadTasks(projectId: string) {
    try {
      setTasks(await api<Task[]>(`/api/projects/${projectId}/tasks`));
    } catch (err) { setMessage(String(err)); }
  }
  useEffect(() => { void loadProjects(); }, []);
  useEffect(() => {
    if (selected) {
      const p = projects.find(p => p.id === selected);
      setEditName(p?.name ?? "");
      void loadTasks(selected);
    } else { setTasks([]); setEditName(""); }
  }, [selected, projects]);

  async function createProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!projectName.trim()) return;
    try {
      const created = await api<Project>("/api/projects", { method: "POST", body: JSON.stringify({ name: projectName.trim() }) });
      setProjectName("");
      setMessage(`Created project ${created.name}`);
      await loadProjects();
      setSelected(created.id);
    } catch (err) { setMessage(String(err)); }
  }
  async function renameProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected || !editName.trim()) return;
    try {
      await api<Project>(`/api/projects/${selected}`, { method: "PATCH", body: JSON.stringify({ name: editName.trim() }) });
      setMessage("Project updated");
      await loadProjects();
    } catch (err) { setMessage(String(err)); }
  }
  async function createTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected || !taskTitle.trim()) return;
    try {
      await api<Task>(`/api/projects/${selected}/tasks`, { method: "POST", body: JSON.stringify({ title: taskTitle.trim(), priority: "MEDIUM" }) });
      setTaskTitle("");
      setMessage("Task created");
      await loadTasks(selected);
    } catch (err) { setMessage(String(err)); }
  }
  async function changeStatus(taskId: string, status: TaskStatus) {
    try {
      await api<Task>(`/api/tasks/${taskId}`, { method: "PATCH", body: JSON.stringify({ status }) });
      setMessage("Task saved to PostgreSQL");
      await loadTasks(selected);
    } catch (err) { setMessage(String(err)); }
  }

  return <main className="container">
    <header><p className="eyebrow">PORTFOLIO · SPRINT 1</p><h1>Enterprise Workflow</h1><p>Manage projects and track tasks with a Spring Boot API and PostgreSQL.</p></header>
    {message && <div role="status" className="notice">{message}</div>}
    <div className="columns">
      <section className="card"><h2>Projects</h2>
        <form onSubmit={createProject} className="stack">
          <label htmlFor="new-project">New project name</label>
          <input id="new-project" value={projectName} maxLength={120} onChange={e => setProjectName(e.target.value)} required placeholder="Customer onboarding" />
          <button type="submit">Create project</button>
        </form>
        <ul className="items">{projects.map(p => <li key={p.id}><button className={selected === p.id ? "selected item-button" : "item-button"} onClick={() => setSelected(p.id)}>{p.name} <small>{p.status}</small></button></li>)}</ul>
        {selected && <form onSubmit={renameProject} className="stack"><label htmlFor="edit-project">Rename selected project</label><input id="edit-project" value={editName} maxLength={120} onChange={e => setEditName(e.target.value)} /><button type="submit" className="secondary">Save project name</button></form>}
      </section>
      <section className="card"><h2>Tasks</h2>
        {selected ? <>
          <form onSubmit={createTask} className="stack">
            <label htmlFor="new-task">New task title</label><input id="new-task" value={taskTitle} maxLength={160} onChange={e => setTaskTitle(e.target.value)} placeholder="Review requirements" required />
            <button type="submit">Add task</button>
          </form>
          <ul className="items">{tasks.map(t => <li className="task" key={t.id}><strong>{t.title}</strong><label>Status<select aria-label={`Status for ${t.title}`} value={t.status} onChange={e => void changeStatus(t.id, e.target.value as TaskStatus)}><option value="TODO">To do</option><option value="IN_PROGRESS">In progress</option><option value="DONE">Done</option></select></label></li>)}</ul>
          {tasks.length === 0 && <p className="muted">No tasks yet. Add the first one.</p>}
        </> : <p className="muted">Create or select a project first.</p>}
      </section>
    </div>
    <footer>Local development demo only · Authentication and roles are planned for Sprint 2.</footer>
  </main>;
}
