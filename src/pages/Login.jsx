import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import Logo from "../components/Logo";
import { useAuth } from "../context/AuthContext";
import { ApiRequestError } from "../api/client";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(identifier, password);
      const redirectTo = location.state?.from?.pathname || "/app";
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Couldn't log in. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F4EEFB] flex items-center justify-center px-6 py-12 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-purple-200/60 to-plum-200/40 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-gradient-to-tl from-lavender/50 via-purple-100/40 to-transparent blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="flex justify-center mb-8">
          <Logo size="lg" />
        </div>

        <div className="bg-white rounded-3xl p-8 sm:p-9 shadow-pop border border-purple-100/70">
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink flex items-center gap-2">
            Welcome back
          </h1>
          <p className="text-sm text-ink-muted mt-1.5 font-normal">Login in your account.</p>

          {error && (
            <div className="mt-4 rounded-2xl bg-red-50 border border-red-100 text-red-700 text-xs px-4 py-3">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="identifier" className="text-xs font-semibold text-ink-muted uppercase tracking-wider block mb-1.5">
                Email address or username
              </label>
              <input
                id="identifier"
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="hello@bigora.com"
                className="w-full rounded-2xl border border-purple-100 bg-[#F4EEFB]/50 px-4 py-3 text-sm text-ink placeholder:text-ink-faint focus:bg-white focus:border-plum-300 outline-none transition-all"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="text-xs font-semibold text-ink-muted uppercase tracking-wider block">
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-2xl border border-purple-100 bg-[#F4EEFB]/50 px-4 py-3 text-sm text-ink placeholder:text-ink-faint focus:bg-white focus:border-plum-300 outline-none transition-all pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-faint hover:text-plum transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-3 bg-gradient-to-r from-plum-500 via-plum to-purple-800 text-white font-semibold rounded-2xl py-3.5 shadow-md hover:opacity-95 active:scale-[0.99] transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer text-sm"
            >
              {submitting ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-ink-muted mt-6 font-medium">
          Don't have an account?{" "}
          <Link to="/signup" className="text-plum-400 hover:text-plum font-semibold underline underline-offset-2 ml-1">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

