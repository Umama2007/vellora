import { useEffect, useState, useCallback } from "react";
import Topbar from "../components/Topbar";
import PostCard from "../components/PostCard";
import { postsApi } from "../api/posts";

const CATEGORIES = ["All", "Tech", "Design", "Life", "Travel", "General"];

export default function Explore() {
  const [category, setCategory] = useState("All");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await postsApi.list({ category, sort: "latest", limit: 24 });
      setPosts(data.posts);
    } catch (err) {
      setError(err.message || "Couldn't load posts.");
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      <Topbar title="Explore" subtitle="Discover posts from across Vellora" />
      <div className="px-8 pb-12 space-y-6">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`pill border transition-colors ${
                category === c
                  ? "bg-plum text-cream border-plum"
                  : "bg-white text-ink-muted border-plum-100 hover:border-plum-300"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {loading && <p className="text-sm text-ink-muted py-12 text-center">Loading posts...</p>}
        {!loading && error && <p className="text-sm text-red-600 py-12 text-center">{error}</p>}

        {!loading && !error && (
          <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} onChange={load} />
            ))}
            {posts.length === 0 && (
              <p className="text-ink-muted col-span-full py-12 text-center">
                No posts in this category yet. Check back soon.
              </p>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
