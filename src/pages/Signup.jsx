import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import Logo from "../components/Logo";
import { useAuth } from "../context/AuthContext";
import { ApiRequestError } from "../api/client";

export default function Signup() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: "", username: "", email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setSubmitting(true);
    try {
      await signup(form);
      navigate("/app", { replace: true });
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Couldn't create your account. Please try again.");
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
            Create account
          </h1>
          <p className="text-sm text-ink-muted mt-1.5 font-normal">Join the community on Vellora.</p>

          {error && (
            <div className="mt-4 rounded-2xl bg-red-50 border border-red-100 text-red-700 text-xs px-4 py-3">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="name" className="text-xs font-semibold text-ink-muted uppercase tracking-wider block mb-1.5">
                Full name
              </label>
              <input
                id="name"
                type="text"
                required
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="Umama Sajid"
                className="w-full rounded-2xl border border-purple-100 bg-[#F4EEFB]/50 px-4 py-3 text-sm text-ink placeholder:text-ink-faint focus:bg-white focus:border-plum-300 outline-none transition-all"
              />
            </div>

            <div>
              <label htmlFor="username" className="text-xs font-semibold text-ink-muted uppercase tracking-wider block mb-1.5">
                Username
              </label>
              <input
                id="username"
                type="text"
                required
                value={form.username}
                onChange={(e) => update("username", e.target.value.toLowerCase())}
                placeholder="umama"
                pattern="[a-z0-9_]+"
                title="Letters, numbers, and underscores only"
                className="w-full rounded-2xl border border-purple-100 bg-[#F4EEFB]/50 px-4 py-3 text-sm text-ink placeholder:text-ink-faint focus:bg-white focus:border-plum-300 outline-none transition-all"
              />
            </div>

            <div>
              <label htmlFor="email" className="text-xs font-semibold text-ink-muted uppercase tracking-wider block mb-1.5">
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="hello@bigora.com"
                className="w-full rounded-2xl border border-purple-100 bg-[#F4EEFB]/50 px-4 py-3 text-sm text-ink placeholder:text-ink-faint focus:bg-white focus:border-plum-300 outline-none transition-all"
              />
            </div>

            <div>
              <label htmlFor="password" className="text-xs font-semibold text-ink-muted uppercase tracking-wider block mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                  placeholder="At least 8 characters"
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

            <div>
              <label htmlFor="confirmPassword" className="text-xs font-semibold text-ink-muted uppercase tracking-wider block mb-1.5">
                Confirm password
              </label>
              <input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                required
                value={form.confirmPassword}
                onChange={(e) => update("confirmPassword", e.target.value)}
                placeholder="Re-enter your password"
                className="w-full rounded-2xl border border-purple-100 bg-[#F4EEFB]/50 px-4 py-3 text-sm text-ink placeholder:text-ink-faint focus:bg-white focus:border-plum-300 outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-3 bg-gradient-to-r from-plum-500 via-plum to-purple-800 text-white font-semibold rounded-2xl py-3.5 shadow-md hover:opacity-95 active:scale-[0.99] transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer text-sm"
            >
              {submitting ? "Creating account..." : "Sign up"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-ink-muted mt-6 font-medium">
          Already have an account?{" "}
          <Link to="/login" className="text-plum-400 hover:text-plum font-semibold underline underline-offset-2 ml-1">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}

