const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

class ApiRequestError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

async function request(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    ...(options.headers || {}),
  };

  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    ...options,
    headers,
  });

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const body = isJson ? await res.json() : null;

  if (!res.ok) {
    throw new ApiRequestError(body?.error || "Something went wrong. Please try again.", res.status);
  }

  return body?.data;
}

let authToken = null;

export const api = {
  setToken: (token) => { authToken = token; },
  getToken: () => authToken,
  get: (path) => request(path),
  post: (path, data) => request(path, { method: "POST", body: data ? JSON.stringify(data) : undefined }),
  patch: (path, data) => request(path, { method: "PATCH", body: data ? JSON.stringify(data) : undefined }),
  delete: (path) => request(path, { method: "DELETE" }),
  upload: async (path, file, fieldName = "image") => {
    const formData = new FormData();
    formData.append(fieldName, file);
    
    const headers = {};
    if (authToken) headers.Authorization = `Bearer ${authToken}`;

    const res = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      credentials: "include",
      headers,
      body: formData,
    });
    const body = await res.json();
    if (!res.ok) throw new ApiRequestError(body?.error || "Upload failed.", res.status);
    return body.data;
  },
};

export { ApiRequestError };
