import { useEffect, useState } from "react";
import Topbar from "../components/Topbar";
import { useAuth } from "../context/AuthContext";
import { postsApi } from "../api/posts";
import { achievementsApi } from "../api/conversations";
import { Flame, Feather, BookOpen, Trophy, Users, Heart } from "lucide-react";

const ICONS = { feather: Feather, flame: Flame, book: BookOpen, trophy: Trophy, users: Users, heart: Heart };

export default function Streaks() {
  const { user } = useAuth();
  const [postCount, setPostCount] = useState(0);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      postsApi.list({ authorUsername: user.username, limit: 1 }),
      achievementsApi.forUser(user.username),
    ])
      .then(([postsData, achievementsData]) => {
        setPostCount(postsData.pagination.total);
        setAchievements(achievementsData);
      })
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <div>
      <Topbar title="My Streaks" subtitle="Real activity, tracked from your actual posts and comments" />
      <div className="px-8 pb-12 grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-accent-flame/10 flex items-center justify-center mx-auto mb-3">
            <Flame size={40} className="text-accent-flame" />
          </div>
          <p className="font-display text-4xl font-semibold text-ink">
            {user?.currentStreak ?? 0} Day{(user?.currentStreak ?? 0) === 1 ? "" : "s"} Streak
          </p>
          <p className="text-sm text-ink-muted mt-1">
            Publish a post or leave a comment each day to keep it going
          </p>
          <p className="text-xs text-ink-faint mt-6">
            Longest streak: {user?.longestStreak ?? 0} day{(user?.longestStreak ?? 0) === 1 ? "" : "s"}
          </p>
        </div>

        <div className="card p-6 space-y-4">
          <h2 className="font-display font-semibold text-ink">Stats</h2>
          <StatRow label="Posts published" value={postCount} />
          <StatRow label="Current streak" value={user?.currentStreak ?? 0} />
          <StatRow label="Longest streak" value={user?.longestStreak ?? 0} />
        </div>

        <div className="lg:col-span-3 card p-6">
          <h2 className="font-display font-semibold text-ink mb-1">Achievements</h2>
          <p className="text-xs text-ink-faint mb-5">
            Each badge is calculated live from your real activity — publishing, streaks,
            followers, and likes received — and recorded permanently once earned.
          </p>

          {loading && <p className="text-sm text-ink-muted text-center py-8">Loading...</p>}

          {!loading && (
            <div className="grid sm:grid-cols-4 gap-4">
              {achievements.map((a) => {
                const Icon = ICONS[a.icon] || Trophy;
                return (
                  <div
                    key={a.key}
                    className={`text-center p-5 rounded-xl ${a.earned ? "bg-plum-50/60" : "bg-plum-50/20 opacity-50"}`}
                    title={a.description}
                  >
                    <Icon size={26} className="text-plum mx-auto mb-2" />
                    <p className="text-xs font-medium text-ink">{a.label}</p>
                    <p className="text-[10px] text-ink-faint mt-1">
                      {a.earned ? `Earned ${new Date(a.earnedAt).toLocaleDateString()}` : "Not yet earned"}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatRow({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-ink-muted">{label}</span>
      <span className="text-sm font-semibold text-ink">{value}</span>
    </div>
  );
}
