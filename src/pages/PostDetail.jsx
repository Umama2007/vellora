import { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Heart, MessageCircle, Bookmark, Share2, Trash2 } from "lucide-react";
import Avatar from "../components/Avatar";
import { formatCount } from "../components/PostCard";
import { postsApi } from "../api/posts";
import { useAuth } from "../context/AuthContext";
import { getImageUrl } from "../utils/imageUrl";

function timeAgo(dateString) {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const hours = Math.floor(diffMs / 3600000);
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateString).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [commentText, setCommentText] = useState("");
  const [posting, setPosting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [postData, commentData] = await Promise.all([
        postsApi.get(id),
        postsApi.comments(id, { limit: 50 }),
      ]);
      setPost(postData);
      setComments(commentData.comments);
    } catch (err) {
      setError(err.message || "This post couldn't be loaded.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function toggleLike() {
    if (!user || !post) return;
    const next = !post.likedByViewer;
    setPost((p) => ({ ...p, likedByViewer: next, likeCount: p.likeCount + (next ? 1 : -1) }));
    try {
      const result = next ? await postsApi.like(post.id) : await postsApi.unlike(post.id);
      setPost((p) => ({ ...p, likeCount: result.likeCount }));
    } catch {
      setPost((p) => ({ ...p, likedByViewer: !next, likeCount: p.likeCount + (next ? -1 : 1) }));
    }
  }

  async function toggleBookmark() {
    if (!user || !post) return;
    const next = !post.bookmarkedByViewer;
    setPost((p) => ({ ...p, bookmarkedByViewer: next }));
    try {
      next ? await postsApi.bookmark(post.id) : await postsApi.removeBookmark(post.id);
    } catch {
      setPost((p) => ({ ...p, bookmarkedByViewer: !next }));
    }
  }

  async function submitComment(e) {
    e.preventDefault();
    if (!commentText.trim() || posting) return;
    setPosting(true);
    try {
      const comment = await postsApi.addComment(post.id, commentText.trim());
      setComments((c) => [comment, ...c]);
      setPost((p) => ({ ...p, commentCount: p.commentCount + 1 }));
      setCommentText("");
    } catch (err) {
      setError(err.message || "Couldn't post your comment.");
    } finally {
      setPosting(false);
    }
  }

  async function handleDeleteComment(commentId) {
    try {
      await postsApi.deleteComment(commentId);
      setComments((c) => c.filter((cm) => cm.id !== commentId));
      setPost((p) => ({ ...p, commentCount: Math.max(0, p.commentCount - 1) }));
    } catch {
      // leave comment in place if delete failed
    }
  }

  if (loading) {
    return <p className="text-center text-ink-muted py-16">Loading post...</p>;
  }

  if (error || !post) {
    return (
      <div className="text-center py-16">
        <p className="text-ink-muted">{error || "Post not found."}</p>
        <button onClick={() => navigate(-1)} className="btn-secondary mt-4">
          Go back
        </button>
      </div>
    );
  }

  const isOwner = user?.id === post.author.id;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 md:px-8 md:py-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-ink-muted hover:text-plum transition-colors mb-6"
      >
        <ArrowLeft size={18} /> Back
      </button>

      {post.coverImage && (
        <img src={getImageUrl(post.coverImage)} alt="" className="w-full h-48 md:h-72 object-cover rounded-2xl mb-6" />
      )}

      <span className="pill bg-plum-50 text-plum mb-4">{post.category}</span>
      <h1 className="font-display text-2xl md:text-3xl font-semibold text-ink leading-tight mt-3">{post.title}</h1>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-5 pb-5 border-b border-plum-100">
        <Link to={`/app/profile/${post.author.username}`} className="flex items-center gap-3">
          <Avatar src={post.author.avatarUrl} alt={post.author.name} size={40} />
          <div>
            <p className="text-sm font-medium text-ink">{post.author.name}</p>
            <p className="text-xs text-ink-faint">
              {timeAgo(post.publishedAt || post.createdAt)} · {post.readTimeMin} min read
            </p>
          </div>
        </Link>
        <span className="text-xs text-ink-muted">
          {formatCount(post.likeCount)} likes · {post.commentCount} comments
        </span>
      </div>

      <div className="prose-content py-8 text-ink leading-relaxed whitespace-pre-wrap">{post.content}</div>

      {post.tags?.length > 0 && (
        <div className="flex flex-wrap gap-2 pb-6">
          {post.tags.map((tag) => (
            <span key={tag} className="pill bg-plum-50 text-plum">
              #{tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 py-5 border-y border-plum-100 overflow-x-auto">
        <ActionButton icon={Heart} active={post.likedByViewer} onClick={toggleLike} label={formatCount(post.likeCount)} />
        <ActionButton icon={MessageCircle} label={`${post.commentCount}`} onClick={() => {}} />
        <ActionButton icon={Bookmark} active={post.bookmarkedByViewer} onClick={toggleBookmark} label="Save" />
        <ActionButton icon={Share2} label="Share" onClick={() => {}} />
      </div>

      <section className="py-8">
        <h2 className="font-display font-semibold text-lg text-ink mb-4">Comments ({comments.length})</h2>

        {user ? (
          <form onSubmit={submitComment} className="flex items-start gap-3 mb-6">
            <Avatar src={user.avatarUrl} alt={user.name} size={36} />
            <div className="flex-1 flex gap-2">
              <input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                className="input-field flex-1"
              />
              <button type="submit" disabled={posting} className="btn-primary text-sm shrink-0">
                {posting ? "Posting..." : "Post"}
              </button>
            </div>
          </form>
        ) : (
          <p className="text-sm text-ink-muted mb-6">
            <Link to="/login" className="text-plum font-medium hover:underline">
              Log in
            </Link>{" "}
            to join the conversation.
          </p>
        )}

        <div className="space-y-5">
          {comments.map((c) => (
            <div key={c.id} className="flex items-start gap-3">
              <Avatar src={c.author.avatarUrl} alt={c.author.name} size={36} />
              <div className="flex-1">
                <div className="bg-white rounded-xl px-4 py-3 border border-plum-100/60">
                  <p className="text-sm font-medium text-ink">{c.author.name}</p>
                  <p className="text-sm text-ink-muted mt-0.5">{c.content}</p>
                </div>
                <div className="flex items-center gap-4 mt-1.5 pl-1">
                  <span className="text-xs text-ink-faint">{timeAgo(c.createdAt)}</span>
                  {user?.id === c.author.id && (
                    <button
                      onClick={() => handleDeleteComment(c.id)}
                      className="text-xs text-ink-faint hover:text-red-600 flex items-center gap-1"
                    >
                      <Trash2 size={12} /> Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {comments.length === 0 && (
            <p className="text-sm text-ink-muted">No comments yet. Be the first to say something.</p>
          )}
        </div>
      </section>
    </div>
  );
}

function ActionButton({ icon: Icon, label, active, onClick }) {
  const isNumber = /^\d+$/.test(label);
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors shrink-0 ${
        active ? "bg-plum text-cream" : "bg-plum-50 text-ink-muted hover:text-plum"
      }`}
    >
      <Icon size={15} fill={active ? "currentColor" : "none"} />
      <span className="hidden sm:inline">{label}</span>
      {isNumber && <span className="sm:hidden">{label}</span>}
    </button>
  );
}
