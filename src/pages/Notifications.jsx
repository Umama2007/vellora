import { useEffect, useState } from "react";
import Topbar from "../components/Topbar";
import Avatar from "../components/Avatar";
import { notificationsApi } from "../api/users";
import { Heart, MessageCircle, UserPlus } from "lucide-react";
import { Link } from "react-router-dom";

const ICONS = { LIKE: Heart, COMMENT: MessageCircle, FOLLOW: UserPlus };
const COLORS = { LIKE: "text-accent-rose", COMMENT: "text-plum", FOLLOW: "text-plum" };
const TEXT = { LIKE: "liked your post", COMMENT: "commented on your post", FOLLOW: "started following you" };

function timeAgo(dateString) {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    notificationsApi
      .list({ limit: 30 })
      .then((data) => setNotifications(data.notifications))
      .finally(() => setLoading(false));

    notificationsApi.markAllRead().catch(() => {});
  }, []);

  return (
    <div>
      <Topbar title="Notifications" subtitle="Stay updated with what matters" />
      <div className="px-8 pb-12">
        {loading && <p className="text-sm text-ink-muted py-12 text-center">Loading...</p>}

        {!loading && notifications.length === 0 && <EmptyNotifications />}

        {!loading && notifications.length > 0 && (
          <div className="card divide-y divide-plum-100/60">
            {notifications.map((n) => {
              const Icon = ICONS[n.type];
              const content = (
                <div className="flex items-center gap-4 p-4 hover:bg-plum-50/60 transition-colors">
                  <div className="relative shrink-0">
                    <Avatar src={n.actor.avatarUrl} alt={n.actor.name} size={40} />
                    <span
                      className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-surface border border-plum-100 flex items-center justify-center ${COLORS[n.type]}`}
                    >
                      <Icon size={11} />
                    </span>
                  </div>
                  <p className="text-sm text-ink flex-1">
                    <span className="font-medium">{n.actor.name}</span> {TEXT[n.type]}
                  </p>
                  <span className="text-xs text-ink-faint shrink-0">{timeAgo(n.createdAt)}</span>
                </div>
              );
              return n.postId ? (
                <Link key={n.id} to={`/app/post/${n.postId}`}>
                  {content}
                </Link>
              ) : (
                <div key={n.id}>{content}</div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyNotifications() {
  return (
    <div className="text-center py-20">
      <div className="w-16 h-16 rounded-full bg-plum-50 flex items-center justify-center mx-auto mb-4">
        <Heart size={26} className="text-plum" />
      </div>
      <p className="font-display font-semibold text-ink">Stay updated with what matters</p>
      <p className="text-sm text-ink-muted mt-1">Engage with posts to see activity here.</p>
    </div>
  );
}
