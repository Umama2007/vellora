import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { authApi } from "../api/auth";
import { ApiRequestError } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount, ask the backend who's actually logged in via the auth
  // cookie. This is what makes refresh keep you logged in for real,
  // instead of an `isLoggedIn = true` flag that resets on reload.
  useEffect(() => {
    authApi
      .me()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (identifier, password) => {
    const loggedInUser = await authApi.login({ identifier, password });
    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  const signup = useCallback(async (data) => {
    const newUser = await authApi.signup(data);
    setUser(newUser);
    return newUser;
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout();
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const fresh = await authApi.me();
      setUser(fresh);
    } catch {
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}

export { ApiRequestError };
