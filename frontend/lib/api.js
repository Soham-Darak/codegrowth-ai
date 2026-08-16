export async function apiFetch(path, options = {}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("codegrowth_token") : null;
  const headers = new Headers(options.headers || {});
  headers.set("Accept", "application/json");
  if (!(options.body instanceof FormData)) headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`/api/backend${path}`, { ...options, headers, cache: "no-store" });
  const text = await response.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text || null;
  }

  if (response.status === 401 || response.status === 403) {
    const error = new Error("Your session is no longer valid.");
    error.status = response.status;
    throw error;
  }

  if (!response.ok) {
    const message = typeof data === "object" && data
      ? data.message || data.detail || data.error || `Request failed with ${response.status}`
      : data || `Request failed with ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  return data;
}

export const apiGet = (path) => apiFetch(path);
export const apiPost = (path, body) => apiFetch(path, { method: "POST", body: JSON.stringify(body) });
export const apiPut = (path, body) => apiFetch(path, { method: "PUT", body: JSON.stringify(body) });
export const apiPatch = (path, body) => apiFetch(path, { method: "PATCH", body: JSON.stringify(body) });
export const apiDelete = (path) => apiFetch(path, { method: "DELETE" });

export function handleAuthError(error, router) {
  if (error?.status === 401 || error?.status === 403) {
    localStorage.removeItem("codegrowth_token");
    localStorage.removeItem("codegrowth_user");
    router.replace("/login");
    return true;
  }
  return false;
}
