import { useEffect, useState } from "react";
import Topbar from "../components/Topbar";
import Avatar from "../components/Avatar";
import { usersApi } from "../api/users";

export default function Community() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    usersApi
      .leaderboard()
      .then(setLeaderboard)
      .finally(() => setLoading(false));
  }, []);

  const topContributor = leaderboard[0];

  return (
    <div>
      <Topbar title="Community" subtitle="Ranked by real posts, likes, and comments" />
      <div className="px-8 pb-12 max-w-5xl">
        <div className="card p-8 shadow-card">
          <h2 className="font-display font-semibold text-ink text-xl mb-6">
            Top Contributors
          </h2>

          {loading && (
            <div className="flex justify-center py-16">
              <span className="text-sm text-ink-muted animate-pulse">Loading contributors...</span>
            </div>
          )}

          {!loading && leaderboard.length === 0 && (
            <p className="text-sm text-ink-muted py-12 text-center">
              No published activity yet. Publish something to appear here.
            </p>
          )}

          {!loading && leaderboard.length > 0 && (
            <div className="space-y-8">
              {/* Featured Top Contributor Card */}
              {topContributor && (
                <div className="relative overflow-hidden bg-plum-50/40 border-l-4 border-plum p-6 rounded-2xl flex items-center justify-between gap-6 transition-all duration-300 hover:shadow-soft">
                  <div className="flex items-center gap-5 z-10">
                    <Avatar 
                      src={topContributor.user.avatarUrl} 
                      alt={topContributor.user.name} 
                      size={64} 
                      className="border border-plum-100 shadow-sm"
                    />
                    <div>
                      <h3 className="font-sans font-semibold text-ink text-lg">
                        {topContributor.user.name}
                      </h3>
                      <p className="text-sm font-semibold text-plum mt-1">
                        {topContributor.points.toLocaleString()} pts
                      </p>
                    </div>
                  </div>
                  
                  {/* Elegant "01" background typography accent */}
                  <span className="font-display font-bold text-7xl text-plum-200/20 select-none z-0 pr-2">
                    01
                  </span>
                </div>
              )}

              {/* Subtle divider */}
              <div className="border-t border-plum-100/60" />

              {/* Ranking List */}
              <div className="space-y-1">
                {leaderboard.map((entry) => (
                  <div 
                    key={entry.user.id} 
                    className="flex items-center gap-6 py-3.5 px-4 rounded-xl hover:bg-plum-50/40 transition-all duration-200"
                  >
                    <span className="text-sm font-semibold text-ink-faint w-8">
                      #{entry.rank}
                    </span>
                    <Avatar 
                      src={entry.user.avatarUrl} 
                      alt={entry.user.name} 
                      size={36} 
                    />
                    <span className="text-sm font-medium text-ink flex-1">
                      {entry.user.name}
                    </span>
                    <span className="text-sm font-semibold text-plum min-w-16 text-right">
                      {entry.points.toLocaleString()} pts
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
