import { useEffect, useState } from "react";
import Topbar from "../components/Topbar";
import PostCard from "../components/PostCard";
import { usersApi } from "../api/users";
import { Bookmark } from "lucide-react";

export default function Bookmarks() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    usersApi
      .myBookmarks({ limit: 30 })
      .then((data) => setPosts(data.posts))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <Topbar title="Bookmarks" subtitle="Posts you've saved for later" />
      <div className="px-8 pb-12">
        {loading && <p className="text-sm text-ink-muted py-12 text-center">Loading...</p>}

        {!loading && posts.length === 0 && (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-full bg-plum-50 flex items-center justify-center mx-auto mb-4">
              <Bookmark size={26} className="text-plum" />
            </div>
            <p className="font-display font-semibold text-ink">No saved posts yet</p>
            <p className="text-sm text-ink-muted mt-1">Bookmark posts to find them here later.</p>
          </div>
        )}

        {!loading && posts.length > 0 && (
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
