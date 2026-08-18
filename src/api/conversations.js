import { api } from "./client";

export const conversationsApi = {
  list: () => api.get("/conversations"),
  start: (username) => api.post(`/conversations/start/${username}`),
  messages: (conversationId) => api.get(`/conversations/${conversationId}/messages`),
  send: (conversationId, content) => api.post(`/conversations/${conversationId}/messages`, { content }),
  markRead: (conversationId) => api.patch(`/conversations/${conversationId}/read`),
};

export const statsApi = {
  get: () => api.get("/stats"),
};

export const achievementsApi = {
  forUser: (username) => api.get(`/users/${username}/achievements`),
};
