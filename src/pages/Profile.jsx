import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BadgeCheck, MapPin } from "lucide-react";
import Avatar from "../components/Avatar";
import PostCard from "../components/PostCard";
import { usersApi } from "../api/users";
import { postsApi } from "../api/posts";
import { useAuth } from "../context/AuthContext";

const TABS = ["Posts", "Saved", "About"];

export default function Profile() {
  const { username: routeUsername } = useParams();
  const navigate = useNavigate();
  const { user: viewer } = useAuth();
  const username = routeUsername || viewer?.username;

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [saved, setSaved] = useState([]);
  const [tab, setTab] = useState("Posts");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [followBusy, setFollowBusy] = useState(false);

  const isOwnProfile = viewer?.username === username;

  const load = useCallback(async () => {
    if (!username) return;
    setLoading(true);
    setError("");
    try {
      const profileData = await usersApi.getProfile(username);
      setProfile(profileData);
      const postsData = await postsApi.list({ authorUsername: username, limit: 24 });
      setPosts(postsData.posts);
    } catch (err) {
      setError(err.message || "Couldn't load this profile.");
    } finally {
      setLoading(false);
    }
  }, [username]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (tab === "Saved" && isOwnProfile) {
      usersApi.myBookmarks({ limit: 24 }).then((data) => setSaved(data.posts));
    }
  }, [tab, isOwnProfile]);

  async function toggleFollow() {
    if (!profile || followBusy) return;
    setFollowBusy(true);
    const next = !profile.isFollowedByViewer;
    setProfile((p) => ({
      ...p,
      isFollowedByViewer: next,
      followerCount: p.followerCount + (next ? 1 : -1),
    }));
    try {
      next ? await usersApi.follow(username) : await usersApi.unfollow(username);
    } catch {
      setProfile((p) => ({
        ...p,
        isFollowedByViewer: !next,
        followerCount: p.followerCount + (next ? -1 : 1),
      }));
    } finally {
      setFollowBusy(false);
    }
  }

  if (loading) return <p className="text-center text-ink-muted py-16">Loading profile...</p>;
  if (error || !profile) {
    return <p className="text-center text-ink-muted py-16">{error || "Profile not found."}</p>;
  }

  return (
    <div>
      <div className="h-40 bg-gradient-to-r from-lilac to-beige" />

      <div className="max-w-5xl mx-auto px-8">
        <div className="flex items-end justify-between -mt-12">
          <div className="flex items-end gap-4">
            <Avatar src={profile.avatarUrl} alt={profile.name} size={96} className="ring-4 ring-canvas" />
            <div className="pb-2">
              <div className="flex items-center gap-1.5">
                <h1 className="font-display text-xl font-semibold text-ink">{profile.name}</h1>
                <BadgeCheck size={18} className="text-plum" />
              </div>
              <p className="text-sm text-ink-faint">@{profile.username}</p>
            </div>
          </div>
          {isOwnProfile ? (
            <button onClick={() => navigate("/app/settings")} className="btn-secondary mb-2">
              Edit Profile
            </button>
          ) : (
            <button
              onClick={toggleFollow}
              disabled={followBusy}
              className={profile.isFollowedByViewer ? "btn-secondary mb-2" : "btn-primary mb-2"}
            >
              {profile.isFollowedByViewer ? "Following" : "Follow"}
            </button>
          )}
        </div>

        {profile.bio && <p className="text-sm text-ink-muted max-w-xl mt-4">{profile.bio}</p>}
        {profile.location && (
          <p className="flex items-center gap-1.5 text-xs text-ink-faint mt-2">
            <MapPin size={13} /> {profile.location}
          </p>
        )}

        <div className="flex items-center gap-8 mt-6 pb-6 border-b border-plum-100">
          <Stat value={profile.postCount} label="Posts" />
          <Stat value={profile.followerCount} label="Followers" />
          <Stat value={profile.followingCount} label="Following" />
        </div>

        {profile.isPrivate && !isOwnProfile && !profile.isFollowedByViewer ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 bg-white rounded-3xl border border-plum-100/50 text-center max-w-2xl mx-auto mt-8 shadow-soft">
            <div className="w-12 h-12 rounded-full bg-plum-50 flex items-center justify-center text-plum mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
            <h2 className="font-display font-semibold text-ink text-lg">This profile is private</h2>
            <p className="text-sm text-ink-muted mt-1 max-w-sm">
              Follow this user to see their posts and activity.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 py-4">
              {TABS.filter((t) => t !== "Saved" || isOwnProfile).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors ${
                    tab === t ? "bg-plum text-cream" : "text-ink-muted hover:bg-plum-50"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="pb-12">
              {tab === "Posts" && (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {posts.map((post) => (
                    <PostCard key={post.id} post={post} onChange={load} />
                  ))}
                  {posts.length === 0 && (
                    <p className="text-ink-muted col-span-full py-12 text-center">
                      {isOwnProfile ? "You haven't published anything yet." : "No posts yet."}
                    </p>
                  )}
                </div>
              )}
              {tab === "Saved" && isOwnProfile && (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {saved.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                  {saved.length === 0 && (
                    <p className="text-ink-muted col-span-full py-12 text-center">
                      No saved posts yet. Bookmark something to see it here.
                    </p>
                  )}
                </div>
              )}
              {tab === "About" && (
                <div className="card p-6 max-w-lg">
                  <h3 className="font-display font-semibold text-ink mb-2">About {profile.name.split(" ")[0]}</h3>
                  <p className="text-sm text-ink-muted leading-relaxed">
                    {profile.bio || "This writer hasn't added a bio yet."}
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Stat({ value, label }) {
  return (
    <div>
      <p className="font-display font-semibold text-ink">{value}</p>
      <p className="text-xs text-ink-faint">{label}</p>
    </div>
  );
}
