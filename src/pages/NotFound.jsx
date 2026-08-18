import { Link } from "react-router-dom";
import Logo from "../components/Logo";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-6 text-center">
      <Logo size="lg" className="mb-10" />
      <p className="font-display text-7xl font-semibold text-plum-200">404</p>
      <h1 className="font-display text-2xl font-semibold text-ink mt-2">Page not found</h1>
      <p className="text-ink-muted mt-2 max-w-sm">
        The page you're looking for doesn't exist, or may have moved.
      </p>
      <Link to="/" className="btn-primary mt-6">
        Back to home
      </Link>
    </div>
  );
}
