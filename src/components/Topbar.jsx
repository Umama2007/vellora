import { useNavigate } from "react-router-dom";
import { Search, Bell, MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import Avatar from "./Avatar";
import { useAuth } from "../context/AuthContext";
import { notificationsApi } from "../api/users";

export default function Topbar({ title, subtitle }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    notificationsApi
      .list({ limit: 1 })
      .then((data) => setUnreadCount(data.unreadCount))
      .catch(() => {});
  }, []);

  function handleSearch(e) {
    e.preventDefault();
    const q = e.target.elements.q.value.trim();
    if (q) navigate(`/app/search?q=${encodeURIComponent(q)}`);
  }

  return (
    <header className="flex items-center justify-between gap-4 px-8 py-6">
      <div>
        {title && <h1 className="font-display text-2xl font-semibold text-ink">{title}</h1>}
        {subtitle && <p className="text-sm text-ink-muted mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        <form onSubmit={handleSearch} className="relative hidden md:block">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint" />
          <input
            name="q"
            type="text"
            placeholder="Search Vellora"
            className="input-field pl-10 w-64"
          />
        </form>

        <button
          onClick={() => navigate("/app/messages")}
          aria-label="Messages"
          className="relative p-2.5 rounded-xl text-ink-muted hover:bg-plum-50 hover:text-plum transition-colors"
        >
          <MessageCircle size={20} />
        </button>

        <button
          onClick={() => navigate("/app/notifications")}
          aria-label="Notifications"
          className="relative p-2.5 rounded-xl text-ink-muted hover:bg-plum-50 hover:text-plum transition-colors"
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent-rose" />
          )}
        </button>

        <button onClick={() => navigate("/app/profile")} aria-label="Your profile">
          <Avatar src={user?.avatarUrl} alt={user?.name} size={38} />
        </button>
      </div>
    </header>
  );
}
