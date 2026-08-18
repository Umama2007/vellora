import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Logo from "./Logo";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center gap-4">
        <Logo size="lg" />
        <p className="text-sm text-ink-muted">Loading Vellora...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
