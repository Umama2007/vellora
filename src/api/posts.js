import { api } from "./client";

function toQuery(params) {
  const clean = Object.fromEntries(
    Object.entries(params || {}).filter(([, v]) => v !== undefined && v !== null && v !== "")
  );
  const qs = new URLSearchParams(clean).toString();
  return qs ? `?${qs}` : "";
}

export const postsApi = {
  list: (params) => api.get(`/posts${toQuery(params)}`),
  get: (id) => api.get(`/posts/${id}`),
  create: (data) => api.post("/posts", data),
  update: (id, data) => api.patch(`/posts/${id}`, data),
  remove: (id) => api.delete(`/posts/${id}`),

  like: (id) => api.post(`/posts/${id}/like`),
  unlike: (id) => api.delete(`/posts/${id}/like`),

  bookmark: (id) => api.post(`/posts/${id}/bookmark`),
  removeBookmark: (id) => api.delete(`/posts/${id}/bookmark`),

  comments: (id, params) => api.get(`/posts/${id}/comments${toQuery(params)}`),
  addComment: (id, content) => api.post(`/posts/${id}/comments`, { content }),
  deleteComment: (commentId) => api.delete(`/comments/${commentId}`),

  uploadImage: (file) => api.upload("/uploads", file),
};
