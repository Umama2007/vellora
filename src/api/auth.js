import { api } from "./client";

export const authApi = {
  signup: async (data) => {
    const res = await api.post("/auth/signup", data);
    if (res?.token) api.setToken(res.token);
    return res?.user || res;
  },
  login: async (data) => {
    const res = await api.post("/auth/login", data);
    if (res?.token) api.setToken(res.token);
    return res?.user || res;
  },
  logout: async () => {
    await api.post("/auth/logout");
    api.setToken(null);
  },
  me: async () => {
    const res = await api.get("/auth/me");
    if (res?.token) api.setToken(res.token);
    return res?.user || res;
  },
};
