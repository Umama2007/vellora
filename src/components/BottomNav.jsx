import { useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  Compass,
  PenSquare,
  MessageCircle,
  Menu,
  Flame,
  Users,
  Bookmark,
  TrendingUp,
  User,
  Settings,
  LogOut,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function BottomNav({ className = "" }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleLogout() {
    setMenuOpen(false);
    await logout();
    navigate("/login", { replace: true });
  }

  const DRAWER_ITEMS = [
    { to: "/app/profile", label: "Profile", icon: User },
    { to: "/app/trending", label: "Trending", icon: TrendingUp },
    { to: "/app/community", label: "Community", icon: Users },
    { to: "/app/bookmarks", label: "Bookmarks", icon: Bookmark },
    { to: "/app/streaks", label: "Streaks", icon: Flame },
    { to: "/app/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className={`${className}`}>
      {/* Bottom Nav Bar */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-surface border-t border-purple-100/70 flex items-center justify-around z-40 px-2 shadow-sm">
        <NavLink
          to="/app"
          end
          className={({ isActive }) =>
            `flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-colors ${
              isActive ? "text-plum" : "text-ink-muted hover:text-plum"
            }`
          }
        >
          <Home size={22} />
          <span className="text-[10px] font-medium mt-0.5">Home</span>
        </NavLink>

        <NavLink
          to="/app/explore"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-colors ${
              isActive ? "text-plum" : "text-ink-muted hover:text-plum"
            }`
          }
        >
          <Compass size={22} />
          <span className="text-[10px] font-medium mt-0.5">Explore</span>
        </NavLink>

        <NavLink
          to="/app/create"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-colors ${
              isActive ? "text-plum" : "text-ink-muted hover:text-plum"
            }`
          }
        >
          <PenSquare size={22} />
          <span className="text-[10px] font-medium mt-0.5">Create</span>
        </NavLink>

        <NavLink
          to="/app/messages"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-colors ${
              isActive ? "text-plum" : "text-ink-muted hover:text-plum"
            }`
          }
        >
          <MessageCircle size={22} />
          <span className="text-[10px] font-medium mt-0.5">Messages</span>
        </NavLink>

        <button
          onClick={() => setMenuOpen(true)}
          className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-colors ${
            menuOpen ? "text-plum" : "text-ink-muted hover:text-plum"
          }`}
        >
          <Menu size={22} />
          <span className="text-[10px] font-medium mt-0.5">Menu</span>
        </button>
      </nav>

      {/* Menu Drawer Overlay */}
      {menuOpen && (
        <>
          <div
            onClick={() => setMenuOpen(false)}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity"
          />
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl border-t border-purple-100 p-6 z-50 shadow-pop max-h-[80vh] overflow-y-auto transition-transform duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display font-bold text-ink text-lg">Vellora Menu</h3>
              <button
                onClick={() => setMenuOpen(false)}
                className="p-1.5 rounded-xl bg-plum-50 text-ink-muted hover:text-plum"
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {DRAWER_ITEMS.map(({ to, label, icon: Icon }) => (
                <button
                  key={to}
                  onClick={() => {
                    setMenuOpen(false);
                    navigate(to);
                  }}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-medium border transition-all ${
                    location.pathname === to
                      ? "bg-plum text-white border-plum font-semibold shadow-soft"
                      : "bg-[#F4EEFB]/30 border-purple-100 text-ink hover:bg-plum-50"
                  }`}
                >
                  <Icon size={18} />
                  {label}
                </button>
              ))}
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl text-sm font-semibold bg-red-50 text-red-600 hover:bg-red-100/60 transition-colors"
            >
              <LogOut size={18} />
              Log out
            </button>
          </div>
        </>
      )}
    </div>
  );
}
