import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, MessageCircle, Bookmark, Share2 } from "lucide-react";
import Avatar from "./Avatar";
import { postsApi } from "../api/posts";
import { useAuth } from "../context/AuthContext";
import { getImageUrl } from "../utils/imageUrl";

export function formatCount(n) {
  if (n >= 1000) return `${(n / 1000).toFixed(n % 1000 >= 100 ? 1 : 0)}k`;
  return `${n}`;
}

function timeAgo(dateString) {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateString).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function PostCard({ post, compact = false, onChange }) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(post.likedByViewer);
  const [likeCount, setLikeCount] = useState(post.likeCount ?? 0);
  const [bookmarked, setBookmarked] = useState(post.bookmarkedByViewer);
  const [pending, setPending] = useState(false);

  async function toggleLike(e) {
    e.preventDefault();
    if (!user || pending) return;
    setPending(true);
    const next = !liked;
    setLiked(next);
    setLikeCount((c) => c + (next ? 1 : -1));
    try {
      const result = next ? await postsApi.like(post.id) : await postsApi.unlike(post.id);
      setLikeCount(result.likeCount);
      onChange?.();
    } catch {
      setLiked(!next);
      setLikeCount((c) => c + (next ? -1 : 1));
    } finally {
      setPending(false);
    }
  }

  async function toggleBookmark(e) {
    e.preventDefault();
    if (!user || pending) return;
    setPending(true);
    const next = !bookmarked;
    setBookmarked(next);
    try {
      next ? await postsApi.bookmark(post.id) : await postsApi.removeBookmark(post.id);
      onChange?.();
    } catch {
      setBookmarked(!next);
    } finally {
      setPending(false);
    }
  }

  return (
    <article className="card overflow-hidden group">
      <Link to={`/app/post/${post.id}`} className="block">
        <div className="aspect-[16/9] overflow-hidden bg-lilac">
          {post.coverImage ? (
            <img
              src={getImageUrl(post.coverImage)}
              alt=""
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-plum-200 font-display text-lg">
              Vellora
            </div>
          )}
        </div>
      </Link>
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Avatar src={post.author.avatarUrl} alt={post.author.name} size={22} />
          <span className="text-xs text-ink-muted font-medium">{post.author.name}</span>
          <span className="text-xs text-ink-faint">· {timeAgo(post.createdAt)}</span>
          {post.visibility === "PRIVATE" && (
            <span className="text-[10px] bg-plum-50 text-plum font-semibold px-2 py-0.5 rounded-full ml-auto">
              Private
            </span>
          )}
        </div>

        <Link to={`/app/post/${post.id}`}>
          <h3 className="font-display font-semibold text-ink leading-snug hover:text-plum transition-colors">
            {post.title}
          </h3>
        </Link>

        {!compact && <p className="text-sm text-ink-muted line-clamp-2">{post.excerpt}</p>}

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-4 text-ink-faint">
            <span className="flex items-center gap-1 text-xs">
              <Heart size={14} /> {formatCount(likeCount)}
            </span>
            <span className="flex items-center gap-1 text-xs">
              <MessageCircle size={14} /> {post.commentCount ?? 0}
            </span>
          </div>
          <div className="flex items-center gap-2 text-ink-faint">
            <button
              onClick={toggleLike}
              aria-label={liked ? "Unlike post" : "Like post"}
              className={`p-2 rounded-xl hover:bg-plum-50 hover:text-accent-rose transition-all shrink-0 ${liked ? "text-accent-rose bg-red-50/50" : ""}`}
            >
              <Heart size={15} fill={liked ? "currentColor" : "none"} />
            </button>
            <button
              onClick={toggleBookmark}
              aria-label={bookmarked ? "Remove bookmark" : "Save post"}
              className={`p-2 rounded-xl hover:bg-plum-50 hover:text-plum transition-all shrink-0 ${bookmarked ? "text-plum bg-plum-50/50" : ""}`}
            >
              <Bookmark size={15} fill={bookmarked ? "currentColor" : "none"} />
            </button>
            <button aria-label="Share post" className="p-2 rounded-xl hover:bg-plum-50 hover:text-plum transition-all shrink-0">
              <Share2 size={15} />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
