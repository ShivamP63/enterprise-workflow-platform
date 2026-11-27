export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');

const tokenKey = 'workflow-auth-token';

export function getAuthToken(): string | null {
  try { return localStorage.getItem(tokenKey); } catch { return null; }
}

export function saveAuthToken(token: string) {
  try { localStorage.setItem(tokenKey, token); } catch { /* storage is optional for local sessions */ }
}

export function clearAuthToken() {
  try { localStorage.removeItem(tokenKey); } catch { /* storage is optional for local sessions */ }
}
