import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Search as SearchIcon, Heart, MessageCircle } from "lucide-react";
import { searchApi } from "../api/users";
import { formatCount } from "../components/PostCard";
import Avatar from "../components/Avatar";
import { getImageUrl } from "../utils/imageUrl";

export default function SearchResults() {
  const [params, setParams] = useSearchParams();
  const query = params.get("q") || "";
  const [results, setResults] = useState({ posts: [], users: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query) {
      setResults({ posts: [], users: [] });
      return;
    }
    setLoading(true);
    searchApi
      .search(query, { limit: 20 })
      .then(setResults)
      .finally(() => setLoading(false));
  }, [query]);

  function handleSubmit(e) {
    e.preventDefault();
    const value = e.target.elements.q.value;
    setParams(value ? { q: value } : {});
  }

  return (
    <div className="px-8 py-8 max-w-3xl mx-auto">
      <form onSubmit={handleSubmit} className="relative mb-6">
        <SearchIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-faint" />
        <input
          name="q"
          defaultValue={query}
          placeholder="Search titles, authors, or tags"
          className="input-field pl-11 py-3"
        />
      </form>

      {loading && <p className="text-sm text-ink-muted py-12 text-center">Searching...</p>}

      {!loading && query && (
        <>
          {results.users.length > 0 && (
            <div className="mb-6">
              <p className="text-xs font-semibold text-ink-faint uppercase tracking-wide mb-2">Writers</p>
              <div className="flex flex-wrap gap-3">
                {results.users.map((u) => (
                  <Link
                    key={u.id}
                    to={`/app/profile/${u.username}`}
                    className="flex items-center gap-2 card px-3 py-2 hover:bg-plum-50/60 transition-colors"
                  >
                    <Avatar src={u.avatarUrl} alt={u.name} size={28} />
                    <span className="text-sm font-medium text-ink">{u.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <p className="text-sm text-ink-muted mb-4">
            {results.posts.length} post{results.posts.length !== 1 && "s"} for "{query}"
          </p>

          <div className="space-y-3">
            {results.posts.map((post) => (
              <Link
                key={post.id}
                to={`/app/post/${post.id}`}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-plum-50/60 transition-colors card"
              >
                {post.coverImage ? (
                  <img src={getImageUrl(post.coverImage)} alt="" className="w-16 h-16 rounded-lg object-cover shrink-0" />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-lilac shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-ink truncate">{post.title}</p>
                  <p className="text-xs text-ink-faint">{post.author.name}</p>
                </div>
                <div className="hidden sm:flex items-center gap-3 text-ink-faint text-xs shrink-0">
                  <span className="flex items-center gap-1">
                    <Heart size={13} /> {formatCount(post.likeCount)}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle size={13} /> {post.commentCount}
                  </span>
                </div>
              </Link>
            ))}
            {results.posts.length === 0 && results.users.length === 0 && (
              <p className="text-center text-ink-muted py-16">No results found. Try a different search.</p>
            )}
          </div>
        </>
      )}

      {!query && <p className="text-center text-ink-muted py-16">Search for posts, writers, or tags.</p>}
    </div>
  );
}
