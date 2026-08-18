import { NavLink, useNavigate } from "react-router-dom";
import {
  Home,
  Compass,
  TrendingUp,
  PenSquare,
  Users,
  MessageCircle,
  Bookmark,
  Flame,
  User,
  Settings,
  LogOut,
} from "lucide-react";
import Logo from "./Logo";
import { useAuth } from "../context/AuthContext";

const NAV_ITEMS = [
  { to: "/app", label: "Home", icon: Home, end: true },
  { to: "/app/explore", label: "Explore", icon: Compass },
  { to: "/app/trending", label: "Trending", icon: TrendingUp },
  { to: "/app/create", label: "Create Post", icon: PenSquare },
  { to: "/app/community", label: "Community", icon: Users },
  { to: "/app/messages", label: "Messages", icon: MessageCircle },
  { to: "/app/bookmarks", label: "Bookmarks", icon: Bookmark },
  { to: "/app/streaks", label: "Streaks", icon: Flame },
  { to: "/app/profile", label: "Profile", icon: User },
  { to: "/app/settings", label: "Settings", icon: Settings },
];

export default function Sidebar({ className = "" }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  return (
    <aside className={`w-60 shrink-0 bg-surface border-r border-plum-100/60 flex flex-col h-full ${className}`}>
      <div className="px-6 py-6">
        <Logo size="lg" />
      </div>
      <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto pt-2">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-plum text-white shadow-soft font-semibold"
                  : "text-ink-muted hover:bg-plum-50 hover:text-plum"
              }`
            }
          >
            <Icon size={18} strokeWidth={2} />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="px-4 pb-6 pt-2 border-t border-plum-100/40">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-ink-muted hover:bg-plum-50 hover:text-plum transition-colors duration-200"
        >
          <LogOut size={18} strokeWidth={2} />
          Log out
        </button>
      </div>
    </aside>
  );
}
