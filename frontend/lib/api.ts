export async function apiFetch(path: string, options: any = {}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("codegrowth_token") : null;
  const headers = new Headers(options.headers || {});
  headers.set("Accept", "application/json");
  if (!(options.body instanceof FormData)) headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`/api/backend${path}`, { ...options, headers, cache: "no-store" });
  const text = await response.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text || null; }

  if (!response.ok) {
    const message = typeof data === "object" && data
      ? data.message || data.detail || data.error || `Request failed with ${response.status}`
      : data || `Request failed with ${response.status}`;
    const error: any = new Error(message);
    error.status = response.status;
    throw error;
  }
  return data;
}

export const apiGet = (path: string) => apiFetch(path);
export const apiPost = (path: string, body: any) => apiFetch(path, { method: "POST", body: JSON.stringify(body) });
export const apiPut = (path: string, body: any) => apiFetch(path, { method: "PUT", body: JSON.stringify(body) });
export const apiPatch = (path: string, body: any) => apiFetch(path, { method: "PATCH", body: JSON.stringify(body) });
export const apiDelete = (path: string) => apiFetch(path, { method: "DELETE" });

export function handleAuthError(error: any) {
  if (error?.status === 401 || error?.status === 403) {
    if (typeof window !== "undefined") {
      localStorage.removeItem("codegrowth_token");
      localStorage.removeItem("codegrowth_user");
      window.location.assign("/login");
    }
    return true;
  }
  return false;
}
