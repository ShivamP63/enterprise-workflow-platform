/**
 * Public portfolio preview only: browser-local sample data. Never sent to an API.
 * The real Spring Boot/PostgreSQL backend is exercised in separate GitHub Actions CI.
 */
export const isHostedDemo =
  import.meta.env.VITE_DEMO_MODE === 'true' ||
  (typeof window !== 'undefined' && window.location.hostname.endsWith('.vercel.app'));

type Project = { id: string; name: string; description: string | null; status: 'ACTIVE' | 'ARCHIVED' };
type Task = { id: string; projectId: string; title: string; details: string | null; status: 'TODO' | 'IN_PROGRESS' | 'DONE'; priority: 'LOW' | 'MEDIUM' | 'HIGH' };
type State = { projects: Project[]; tasks: Task[] };
const key = 'portfolio-workflow-demo-v1';
const initial: State = {
  projects: [{ id: 'example-project', name: 'Website launch (sample)', description: 'Example data for the public demo', status: 'ACTIVE' }],
  tasks: [
    { id: 'example-task-1', projectId: 'example-project', title: 'Review requirements (sample)', details: null, status: 'DONE', priority: 'MEDIUM' },
    { id: 'example-task-2', projectId: 'example-project', title: 'Prepare launch checklist (sample)', details: null, status: 'IN_PROGRESS', priority: 'HIGH' },
  ],
};
function read(): State {
  try {
    const value = localStorage.getItem(key);
    if (!value) return structuredClone(initial);
    const parsed = JSON.parse(value) as State;
    return Array.isArray(parsed.projects) && Array.isArray(parsed.tasks) ? parsed : structuredClone(initial);
  } catch { return structuredClone(initial); }
}
function save(value: State) {
  try { localStorage.setItem(key, JSON.stringify(value)); }
  catch { throw new Error('Browser storage is full or disabled; demo changes cannot be saved'); }
}
function bodyOf(options?: RequestInit): Record<string, unknown> {
  return options?.body && typeof options.body === 'string'
    ? JSON.parse(options.body) as Record<string, unknown> : {};
}
function requiredTitle(value: unknown, label: string): string {
  if (typeof value !== 'string' || !value.trim()) throw new Error(label + ' cannot be blank');
  return value.trim();
}
export async function demoRequest<T>(path: string, options?: RequestInit): Promise<T> {
  const state = read(), method = options?.method ?? 'GET', body = bodyOf(options);
  let result: unknown;

  if (path === '/api/projects' && method === 'GET') result = state.projects;
  else if (path === '/api/projects' && method === 'POST') {
    const project: Project = { id: crypto.randomUUID(), name: requiredTitle(body.name, 'Project name'), description: null, status: 'ACTIVE' };
    state.projects.push(project); save(state); result = project;
  } else if (/^\/api\/projects\/[^/]+$/.test(path) && method === 'PATCH') {
    const project = state.projects.find(p => p.id === path.split('/')[3]);
    if (!project) throw new Error('Project not found');
    if (body.name !== undefined) project.name = requiredTitle(body.name, 'Project name');
    save(state); result = project;
  } else if (/^\/api\/projects\/[^/]+\/tasks$/.test(path) && method === 'GET') {
    const projectId = path.split('/')[3];
    result = state.tasks.filter(task => task.projectId === projectId);
  } else if (/^\/api\/projects\/[^/]+\/tasks$/.test(path) && method === 'POST') {
    const projectId = path.split('/')[3];
    if (!state.projects.some(p => p.id === projectId)) throw new Error('Project not found');
    const task: Task = { id: crypto.randomUUID(), projectId, title: requiredTitle(body.title, 'Task title'), details: null,
      status: 'TODO', priority: body.priority === 'HIGH' || body.priority === 'LOW' ? body.priority : 'MEDIUM' };
    state.tasks.push(task); save(state); result = task;
  } else if (/^\/api\/tasks\/[^/]+$/.test(path) && method === 'PATCH') {
    const task = state.tasks.find(t => t.id === path.split('/')[3]);
    if (!task) throw new Error('Task not found');
    if (body.status === 'TODO' || body.status === 'IN_PROGRESS' || body.status === 'DONE') task.status = body.status;
    save(state); result = task;
  } else throw new Error('Unsupported demo operation');
  return result as T;
}
