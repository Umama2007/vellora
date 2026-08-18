import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import Topbar from "../components/Topbar";
import PostCard from "../components/PostCard";
import { postsApi } from "../api/posts";
import { useAuth } from "../context/AuthContext";
import { PenSquare } from "lucide-react";

const TABS = ["For You", "Following"];

export default function Dashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState("For You");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await postsApi.list({
        following: tab === "Following" ? true : undefined,
        sort: "latest",
        limit: 12,
      });
      setPosts(data.posts);
    } catch (err) {
      setError(err.message || "Couldn't load your feed.");
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      <Topbar title={`Good to see you, ${user?.name?.split(" ")[0] || "there"}`} subtitle="What's on your mind today?" />

      <div className="px-8 pb-12 space-y-6">
        <div className="flex items-center gap-2 border-b border-plum-100">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                tab === t ? "border-plum text-plum" : "border-transparent text-ink-muted hover:text-plum"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {loading && <p className="text-sm text-ink-muted py-12 text-center">Loading posts...</p>}

        {!loading && error && (
          <div className="text-center py-12">
            <p className="text-sm text-red-600">{error}</p>
            <button onClick={load} className="btn-secondary mt-3 text-sm">
              Try again
            </button>
          </div>
        )}

        {!loading && !error && posts.length === 0 && (
          <div className="text-center py-16">
            <p className="font-display font-semibold text-ink">
              {tab === "Following" ? "No posts from people you follow yet" : "No posts yet"}
            </p>
            <p className="text-sm text-ink-muted mt-1">
              {tab === "Following"
                ? "Follow a few writers to see their posts here."
                : "Be the first to publish something on Vellora."}
            </p>
            <Link to="/app/create" className="btn-primary inline-flex items-center gap-2 mt-4">
              <PenSquare size={16} /> Create your first post
            </Link>
          </div>
        )}

        {!loading && !error && posts.length > 0 && (
          <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} onChange={load} />
            ))}
          </section>
        )}
      </div>
    </div>
  );
}
