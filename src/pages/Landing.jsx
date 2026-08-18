import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, Sparkles, PenLine, Users, MessageCircle } from "lucide-react";
import Logo from "../components/Logo";
import { useAuth } from "../context/AuthContext";
import { ApiRequestError } from "../api/client";
import { statsApi } from "../api/conversations";

export default function Landing() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, signup, user } = useAuth();

  // If already logged in, option to go to dashboard
  useEffect(() => {
    if (user) {
      // Keep session intact if user lands here
    }
  }, [user]);

  const [stats, setStats] = useState(null);
  const [isSignup, setIsSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form states
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  // Extra signup fields
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    statsApi.get().then(setStats).catch(() => setStats(null));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      if (isSignup) {
        if (password !== confirmPassword) {
          setError("Passwords don't match.");
          setSubmitting(false);
          return;
        }
        await signup({ name, username, email: identifier, password, confirmPassword });
      } else {
        await login(identifier, password);
      }
      const redirectTo = location.state?.from?.pathname || "/app";
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(
        err instanceof ApiRequestError
          ? err.message
          : isSignup
          ? "Couldn't create your account. Please try again."
          : "Couldn't log in. Please check your credentials."
      );
    } finally {
      setSubmitting(false);
    }
  }

  function toggleMode() {
    setIsSignup((prev) => !prev);
    setError("");
  }

  return (
    <div className="min-h-screen bg-[#F4EEFB] relative overflow-hidden flex flex-col justify-between selection:bg-plum-200">
      {/* Background glowing ambient elements */}
      <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-purple-200/60 to-plum-200/40 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-gradient-to-tl from-lavender/50 via-purple-100/40 to-transparent blur-[120px] pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 max-w-7xl mx-auto w-full px-6 sm:px-10 py-6 flex-1 flex flex-col justify-between">
        {/* Top Header */}
        <header className="flex items-center justify-between py-4">
          <Logo size="lg" />
          <nav className="flex items-center gap-6">
            <Link to="/about" className="text-sm font-medium text-ink-muted hover:text-plum transition-colors">
              About
            </Link>
            {user ? (
              <Link to="/app" className="btn-primary text-sm shadow-soft">
                Go to App →
              </Link>
            ) : (
              <button
                onClick={toggleMode}
                className="text-sm font-medium text-plum hover:underline cursor-pointer"
              >
                {isSignup ? "Log in" : "Sign up"}
              </button>
            )}
          </nav>
        </header>

        {/* Hero & Auth Grid */}
        <main className="my-auto py-10 grid lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Headline & Floating Avatar Visuals */}
          <div className="lg:col-span-7 relative">
            {/* Headline */}
            <div className="relative z-10 max-w-xl">
              <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-ink leading-[1.08]">
                Share.
                <br />
                <span className="text-plum-400 font-extrabold">Inspire.</span>
                <br />
                Connect.
              </h1>
              <p className="mt-6 text-lg text-ink-muted max-w-md font-normal leading-relaxed">
                Your words can change someone's world. Vellora is where writers publish, readers gather, and good ideas travel further.
              </p>

              {/* Stats badges */}
              {stats && (
                <div className="mt-10 flex items-center gap-8 pt-6 border-t border-purple-200/50">
                  <div className="flex items-center gap-2">
                    <PenLine size={18} className="text-plum-400" />
                    <div>
                      <p className="font-display font-bold text-ink text-base leading-none">{stats.publishedPostCount}</p>
                      <p className="text-xs text-ink-faint mt-0.5">Posts</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={18} className="text-plum-400" />
                    <div>
                      <p className="font-display font-bold text-ink text-base leading-none">{stats.userCount}</p>
                      <p className="text-xs text-ink-faint mt-0.5">Writers</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageCircle size={18} className="text-plum-400" />
                    <div>
                      <p className="font-display font-bold text-ink text-base leading-none">{stats.commentCount}</p>
                      <p className="text-xs text-ink-faint mt-0.5">Comments</p>
                    </div>
                  </div>
                </div>
              )}
            </div>


          </div>

          {/* Right Column: Embedded Authentication Form (Matching Image 2) */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-9 shadow-pop border border-purple-100/70 relative z-20 backdrop-blur-sm">
              <div className="text-left">
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink flex items-center gap-2">
                  {isSignup ? "Create account" : "Welcome back"}
                </h2>
                <p className="text-sm text-ink-muted mt-1.5 font-normal">
                  {isSignup ? "Join the community on Vellora" : "Login in your account."}
                </p>
              </div>

              {error && (
                <div className="mt-4 rounded-2xl bg-red-50 border border-red-100 text-red-700 text-xs px-4 py-3">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                {isSignup && (
                  <>
                    <div>
                      <label htmlFor="name" className="text-xs font-semibold text-ink-muted uppercase tracking-wider block mb-1.5">
                        Full Name
                      </label>
                      <input
                        id="name"
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
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
                        value={username}
                        onChange={(e) => setUsername(e.target.value.toLowerCase())}
                        placeholder="umama"
                        className="w-full rounded-2xl border border-purple-100 bg-[#F4EEFB]/50 px-4 py-3 text-sm text-ink placeholder:text-ink-faint focus:bg-white focus:border-plum-300 outline-none transition-all"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label htmlFor="identifier" className="text-xs font-semibold text-ink-muted uppercase tracking-wider block mb-1.5">
                    {isSignup ? "Email address" : "Email address or username"}
                  </label>
                  <input
                    id="identifier"
                    type={isSignup ? "email" : "text"}
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
                      minLength={isSignup ? 8 : 1}
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

                {isSignup && (
                  <div>
                    <label htmlFor="confirmPassword" className="text-xs font-semibold text-ink-muted uppercase tracking-wider block mb-1.5">
                      Confirm Password
                    </label>
                    <input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-2xl border border-purple-100 bg-[#F4EEFB]/50 px-4 py-3 text-sm text-ink placeholder:text-ink-faint focus:bg-white focus:border-plum-300 outline-none transition-all"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full mt-3 bg-gradient-to-r from-plum-500 via-plum to-purple-800 text-white font-semibold rounded-2xl py-3.5 shadow-md hover:opacity-95 active:scale-[0.99] transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer text-sm"
                >
                  {submitting
                    ? isSignup
                      ? "Creating account..."
                      : "Logging in..."
                    : isSignup
                    ? "Sign up"
                    : "Login"}
                </button>
              </form>

              {/* Switch between Login and Signup */}
              <p className="text-center text-xs text-ink-muted mt-6 font-medium">
                {isSignup ? (
                  <>
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={toggleMode}
                      className="text-plum-400 hover:text-plum font-semibold cursor-pointer underline underline-offset-2 ml-1"
                    >
                      Sign in
                    </button>
                  </>
                ) : (
                  <>
                    Don't have an account?{" "}
                    <button
                      type="button"
                      onClick={toggleMode}
                      className="text-plum-400 hover:text-plum font-semibold cursor-pointer underline underline-offset-2 ml-1"
                    >
                      Sign up
                    </button>
                  </>
                )}
              </p>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="py-4 text-center text-xs text-ink-faint border-t border-purple-200/30">
          © {new Date().getFullYear()} Vellora. All rights reserved.
        </footer>
      </div>
    </div>
  );
}

