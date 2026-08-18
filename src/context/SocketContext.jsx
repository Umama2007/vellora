import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext(null);

const SOCKET_URL = (import.meta.env.VITE_API_URL || "http://localhost:4000/api").replace(/\/api$/, "");

export function SocketProvider({ children }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(false);

  useEffect(() => {
    if (!user) {
      setSocket(null);
      setConnected(false);
      setConnectionError(false);
      return;
    }

    // withCredentials sends the same httpOnly auth cookie the REST API
    // uses — the server verifies it in server.ts's io.use() middleware
    // before allowing the connection. No separate fake socket auth.
    const instance = io(SOCKET_URL, {
      withCredentials: true,
      timeout: 5000,
      reconnectionAttempts: 3,
    });

    instance.on("connect", () => {
      setConnected(true);
      setConnectionError(false);
    });

    instance.on("disconnect", () => {
      setConnected(false);
    });

    instance.on("connect_error", () => {
      setConnected(false);
      setConnectionError(true);
    });

    setSocket(instance);

    return () => {
      instance.disconnect();
    };
  }, [user?.id]);

  return (
    <SocketContext.Provider value={{ socket, connected, connectionError }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error("useSocket must be used within a SocketProvider");
  return ctx;
}
