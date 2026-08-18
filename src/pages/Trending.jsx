import { useEffect, useState } from "react";
import Topbar from "../components/Topbar";
import Avatar from "../components/Avatar";
import { formatCount } from "../components/PostCard";
import { postsApi } from "../api/posts";
import { Link } from "react-router-dom";
import { Heart, MessageCircle, TrendingUp } from "lucide-react";
import { getImageUrl } from "../utils/imageUrl";

export default function Trending() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    postsApi
      .list({ sort: "top", limit: 20 })
      .then((data) => setPosts(data.posts))
      .catch((err) => setError(err.message || "Couldn't load trending posts."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <Topbar title="Trending" subtitle="Ranked by real likes across Vellora" />
      <div className="px-8 pb-12">
        {loading && <p className="text-sm text-ink-muted py-12 text-center">Loading...</p>}
        {!loading && error && <p className="text-sm text-red-600 py-12 text-center">{error}</p>}

        {!loading && !error && (
          <div className="card divide-y divide-plum-100/60">
            {posts.map((post, i) => (
              <Link
                key={post.id}
                to={`/app/post/${post.id}`}
                className="flex items-center gap-4 p-4 hover:bg-plum-50/60 transition-colors"
              >
                <span className="font-display text-xl font-semibold text-plum-200 w-6 shrink-0">{i + 1}</span>
                {post.coverImage ? (
                  <img src={getImageUrl(post.coverImage)} alt="" className="w-16 h-16 rounded-xl object-cover shrink-0" />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-lilac shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-ink truncate">{post.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Avatar src={post.author.avatarUrl} alt={post.author.name} size={18} />
                    <span className="text-xs text-ink-muted">{post.author.name}</span>
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-4 text-ink-faint text-xs shrink-0">
                  <span className="flex items-center gap-1">
                    <Heart size={14} /> {formatCount(post.likeCount)}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle size={14} /> {post.commentCount}
                  </span>
                  <span className="flex items-center gap-1 text-accent-flame">
                    <TrendingUp size={14} />
                  </span>
                </div>
              </Link>
            ))}
            {posts.length === 0 && (
              <p className="text-center text-ink-muted py-12">No published posts yet.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
