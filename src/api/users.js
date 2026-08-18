import { api } from "./client";

function toQuery(params) {
  const clean = Object.fromEntries(
    Object.entries(params || {}).filter(([, v]) => v !== undefined && v !== null && v !== "")
  );
  const qs = new URLSearchParams(clean).toString();
  return qs ? `?${qs}` : "";
}

export const usersApi = {
  getProfile: (username) => api.get(`/users/${username}`),
  updateMe: (data) => api.patch("/users/me", data),
  follow: (username) => api.post(`/users/${username}/follow`),
  unfollow: (username) => api.delete(`/users/${username}/follow`),
  followers: (username) => api.get(`/users/${username}/followers`),
  following: (username) => api.get(`/users/${username}/following`),
  leaderboard: () => api.get("/users/leaderboard"),
  myBookmarks: (params) => api.get(`/users/me/bookmarks${toQuery(params)}`),
};

export const searchApi = {
  search: (q, params) => api.get(`/search${toQuery({ q, ...params })}`),
};

export const notificationsApi = {
  list: (params) => api.get(`/notifications${toQuery(params)}`),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch("/notifications/read-all"),
};
