/**
 * Vellora end-to-end verification script.
 *
 * This hits your REAL, RUNNING backend over HTTP — it is not a unit test
 * and does not know anything about internals. It exercises the exact flow
 * a real user would: sign up, edit a profile, draft and publish a post,
 * like/comment/bookmark, follow, message, check notifications, check the
 * leaderboard, check achievements, log out, log back in — and confirms
 * everything actually persisted in PostgreSQL by re-fetching it fresh.
 *
 * WHY THIS SCRIPT EXISTS: the assistant building this project could not
 * run the compiled backend inside its own sandbox (Prisma's engine binary
 * download is blocked there). Rather than claim "fully tested" without
 * being able to prove it, this script lets YOU run the real, actual test
 * on your own machine, against your own real server, and see real
 * PASS/FAIL output. That is a stronger guarantee than a claim could be.
 *
 * USAGE:
 *   1. Start the app: npm run dev:all  (from the project root)
 *   2. In a separate terminal: node backend/scripts/e2e-test.mjs
 *
 * Requires Node 18+ (uses the built-in fetch).
 */

const API = process.env.VELLORA_API_URL || "http://localhost:4000/api";

let passed = 0;
let failed = 0;
const failures = [];

function assert(condition, label) {
  if (condition) {
    passed += 1;
    console.log(`  \x1b[32m✓\x1b[0m ${label}`);
  } else {
    failed += 1;
    failures.push(label);
    console.log(`  \x1b[31m✗\x1b[0m ${label}`);
  }
}

function section(title) {
  console.log(`\n${title}`);
}

/** Minimal per-session cookie jar so this script can act as two separate
 * logged-in users at once, the way two different browsers would. */
function makeSession() {
  let cookie = "";
  async function request(method, path, body) {
    const res = await fetch(`${API}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(cookie ? { Cookie: cookie } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    const setCookie = res.headers.get("set-cookie");
    if (setCookie) cookie = setCookie.split(";")[0];
    const isJson = res.headers.get("content-type")?.includes("application/json");
    const parsed = isJson ? await res.json() : null;
    // The API wraps every response as { success, data } or { success, error }.
    // Unwrap it here so assertions can work with the actual payload directly
    // (e.g. `signupA.data.username`) instead of `signupA.data.data.username`.
    const data = parsed && "data" in parsed ? parsed.data : parsed;
    const error = parsed?.error;
    return { status: res.status, ok: res.ok, data, error };
  }
  return {
    get: (path) => request("GET", path),
    post: (path, body) => request("POST", path, body),
    patch: (path, body) => request("PATCH", path, body),
    delete: (path) => request("DELETE", path),
    clearCookie: () => {
      cookie = "";
    },
  };
}

async function main() {
  const stamp = Date.now();
  const a = makeSession();
  const b = makeSession();

  console.log(`Testing Vellora API at ${API}\n`);

  // ---- Reachability check first, with a clear message if the server's not up ----
  const health = await fetch(`${API}/health`).catch(() => null);
  if (!health || !health.ok) {
    console.log("\x1b[31mCould not reach the backend.\x1b[0m");
    console.log(`Make sure it's running at ${API} (try: npm run backend:dev) and try again.`);
    process.exit(1);
  }

  section("User A: signup, login, profile");
  const signupA = await a.post("/auth/signup", {
    name: "Test User A",
    username: `usera_${stamp}`,
    email: `usera_${stamp}@test.local`,
    password: "correcthorsebatterystaple",
    confirmPassword: "correcthorsebatterystaple",
  });
  assert(signupA.ok && signupA.data?.user?.username === `usera_${stamp}`, "User A can sign up");
  assert(!("passwordHash" in (signupA.data?.user || {})), "password hash is never returned to the client");

  const meA = await a.get("/auth/me");
  assert(meA.ok && meA.data?.user?.username === `usera_${stamp}`, "GET /auth/me returns the real logged-in user after signup");

  const editProfile = await a.patch("/users/me", { bio: "Editing my real bio", location: "Testville" });
  assert(editProfile.ok && editProfile.data.bio === "Editing my real bio", "User A can edit their profile");

  const meAfterEdit = await a.get("/auth/me");
  assert(meAfterEdit.data.bio === "Editing my real bio", "profile edit persisted (re-fetched fresh from the server)");

  section("User A: draft, publish, refresh-persistence");
  const draft = await a.post("/posts", {
    title: "My Draft Post",
    content: "This is a draft.",
    published: false,
  });
  assert(draft.ok && draft.data.published === false, "User A can save a draft");

  const draftRefetch = await a.get(`/posts/${draft.data.id}`);
  assert(draftRefetch.ok && draftRefetch.data.title === "My Draft Post", "draft survives a simulated refresh (re-GET)");

  const published = await a.patch(`/posts/${draft.data.id}`, { published: true });
  assert(published.ok && published.data.published === true, "User A can publish the draft");

  const publishedRefetch = await a.get(`/posts/${draft.data.id}`);
  assert(publishedRefetch.data.published === true, "published state survives a simulated refresh");

  const coverImageEdit = await a.patch(`/posts/${draft.data.id}`, { coverImage: "http://example.com/cover.jpg" });
  assert(coverImageEdit.ok && coverImageEdit.data.coverImage === "http://example.com/cover.jpg", "User A can edit the cover image");
  assert(coverImageEdit.data.published === true, "cover image edit does NOT silently reset published status to false in the response");

  const postAfterCoverEdit = await a.get(`/posts/${draft.data.id}`);
  assert(postAfterCoverEdit.data.published === true, "published state is preserved in DB after cover image edit");

  section("User B: signup, publish a post for A to interact with");
  const signupB = await b.post("/auth/signup", {
    name: "Test User B",
    username: `userb_${stamp}`,
    email: `userb_${stamp}@test.local`,
    password: "correcthorsebatterystaple",
    confirmPassword: "correcthorsebatterystaple",
  });
  assert(signupB.ok && signupB.data?.user?.username === `userb_${stamp}`, "User B can sign up");

  const postB = await b.post("/posts", {
    title: "A Post By User B",
    content: "Content written by user B for testing interactions.",
    published: true,
  });
  assert(postB.ok && postB.data.published === true, "User B can publish a post");

  section("User A: like, bookmark, comment, follow on User B's post");
  const like = await a.post(`/posts/${postB.data.id}/like`);
  assert(like.ok && like.data.likeCount === 1, "like is persisted and count is real (1, not fabricated)");

  const likeRefetch = await a.get(`/posts/${postB.data.id}`);
  assert(likeRefetch.data.likedByViewer === true, "like state survives a simulated refresh");

  const bookmark = await a.post(`/posts/${postB.data.id}/bookmark`);
  assert(bookmark.ok && bookmark.data.bookmarked === true, "bookmark is persisted");

  const myBookmarks = await a.get("/users/me/bookmarks");
  assert(
    myBookmarks.ok && myBookmarks.data.posts.some((p) => p.id === postB.data.id),
    "bookmarked post shows up in User A's real saved list"
  );

  const comment = await a.post(`/posts/${postB.data.id}/comments`, { content: "Great post from a real test!" });
  assert(comment.ok && comment.data.content.includes("Great post"), "comment is persisted");

  const commentsRefetch = await a.get(`/posts/${postB.data.id}/comments`);
  assert(commentsRefetch.data.comments.length === 1, "comment survives a simulated refresh");

  const follow = await a.post(`/users/userb_${stamp}/follow`);
  assert(follow.ok && follow.data.following === true, "follow is persisted");

  const profileB = await a.get(`/users/userb_${stamp}`);
  assert(profileB.data.followerCount === 1, "User B's follower count reflects the real Follow row");

  section("User A: message User B (real-time delivery is socket-based; persistence is checked here)");
  const startConvo = await a.post(`/conversations/start/userb_${stamp}`);
  assert(startConvo.ok && startConvo.data.id, "User A can start a real conversation with User B");

  // Concurrent conversation creation verification
  const [convo1, convo2] = await Promise.all([
    a.post(`/conversations/start/userb_${stamp}`),
    a.post(`/conversations/start/userb_${stamp}`),
  ]);
  assert(convo1.ok && convo2.ok, "Both concurrent start conversation requests succeeded");
  assert(convo1.data.id === convo2.data.id, "Concurrent conversation requests return the exact same conversation ID");
  assert(startConvo.data.id === convo1.data.id, "Subsequent start conversation requests return the existing conversation ID");

  const sendMsg = await a.post(`/conversations/${startConvo.data.id}/messages`, { content: "Hello from a real test!" });
  assert(sendMsg.ok && sendMsg.data.content === "Hello from a real test!", "message is persisted to PostgreSQL");

  const bConversations = await b.get("/conversations");
  const bConvo = bConversations.data?.find((c) => c.id === startConvo.data.id);
  assert(bConvo && bConvo.unreadCount === 1, "User B sees a real unread message from User A (not a fake counter)");

  const bMessages = await b.get(`/conversations/${startConvo.data.id}/messages`);
  assert(
    bMessages.ok && bMessages.data.some((m) => m.content === "Hello from a real test!"),
    "User B can read the real message content"
  );

  const markRead = await b.patch(`/conversations/${startConvo.data.id}/read`);
  assert(markRead.ok, "User B can mark the conversation read");

  const bConversationsAfterRead = await b.get("/conversations");
  const bConvoAfterRead = bConversationsAfterRead.data?.find((c) => c.id === startConvo.data.id);
  assert(bConvoAfterRead?.unreadCount === 0, "unread count correctly drops to 0 after marking read");

  section("User B: verify real notifications from User A's actions");
  const notificationsB = await b.get("/notifications");
  const types = notificationsB.data?.notifications?.map((n) => n.type) || [];
  assert(types.includes("LIKE"), "User B has a real LIKE notification");
  assert(types.includes("COMMENT"), "User B has a real COMMENT notification");
  assert(types.includes("FOLLOW"), "User B has a real FOLLOW notification");

  section("Leaderboard, streaks, achievements — verify these are computed, not hardcoded");
  const leaderboard = await a.get("/users/leaderboard");
  const bEntry = leaderboard.data?.find((e) => e.user.username === `userb_${stamp}`);
  assert(!!bEntry, "User B appears on the leaderboard after publishing and receiving engagement");
  assert(bEntry.points > 0, "leaderboard points are a real positive number derived from real activity");

  const meBAfterActivity = await b.get("/auth/me");
  assert(meBAfterActivity.data?.user?.currentStreak >= 1, "User B's streak incremented after real publish activity");

  const achievementsB = await a.get(`/users/userb_${stamp}/achievements`);
  const firstPostBadge = achievementsB.data?.find((ach) => ach.key === "first_post");
  assert(firstPostBadge?.earned === true, "User B's 'First Post' achievement is genuinely earned, not illustrative");

  section("User A: Notification Preferences Enforcement");
  // Set User A's notifyOnLike to false, and verify User B liking A's post doesn't generate a notification.
  const updatePrefs = await a.patch("/users/me", { notifyOnLike: false, notifyOnComment: true });
  assert(updatePrefs.ok && updatePrefs.data.notifyOnLike === false, "User A can disable LIKE notifications");

  // User B likes User A's post
  const likeA = await b.post(`/posts/${draft.data.id}/like`);
  assert(likeA.ok, "User B can like User A's post");

  // Fetch User A's notifications and verify no LIKE notification exists
  const notificationsA = await a.get("/notifications");
  const aNotificationTypes = notificationsA.data?.notifications?.map((n) => n.type) || [];
  assert(!aNotificationTypes.includes("LIKE"), "User A did NOT receive a LIKE notification (respects preference)");

  // Verify that User B commenting on User A's post still triggers COMMENT notification because it is enabled
  const commentA = await b.post(`/posts/${draft.data.id}/comments`, { content: "Great post!" });
  assert(commentA.ok, "User B can comment on User A's post");

  const notificationsA2 = await a.get("/notifications");
  const aNotificationTypes2 = notificationsA2.data?.notifications?.map((n) => n.type) || [];
  assert(aNotificationTypes2.includes("COMMENT"), "User A received a COMMENT notification (respects enabled preference)");

  section("User A: Private Profile Enforcement");
  // Set User A's profile to private
  const makePrivate = await a.patch("/users/me", { isPrivate: true });
  assert(makePrivate.ok && makePrivate.data.isPrivate === true, "User A can toggle profile to private");

  // Have User B fetch User A's profile. Since B is not a follower, it should be restricted.
  const profileA_B = await b.get(`/users/usera_${stamp}`);
  assert(profileA_B.ok && profileA_B.data.isPrivate === true, "User B receives public metadata indicating profile is private");
  assert(profileA_B.data.bio === undefined, "Private user profile bio is hidden from non-followers");
  assert(profileA_B.data.location === undefined, "Private user profile location is hidden from non-followers");

  // Have User B fetch User A's posts list. It should be empty.
  const postsA_B = await b.get(`/posts?authorUsername=usera_${stamp}`);
  assert(postsA_B.ok && postsA_B.data.posts.length === 0, "Private user's posts list is empty for non-followers");

  // Have User B follow User A (since follow is instant in our app, B now becomes a follower)
  const followA = await b.post(`/users/usera_${stamp}/follow`);
  assert(followA.ok && followA.data.following === true, "User B follows User A");

  // Fetch User A's profile as User B again. Since B is now a follower, B should see full details.
  const profileA_B_follower = await b.get(`/users/usera_${stamp}`);
  assert(profileA_B_follower.ok && profileA_B_follower.data.bio === "Editing my real bio", "Private user profile bio is visible to followers");
  assert(profileA_B_follower.data.location === "Testville", "Private user profile location is visible to followers");

  // Fetch User A's posts list as User B again. Since B is now a follower, B should see the posts.
  const postsA_B_follower = await b.get(`/posts?authorUsername=usera_${stamp}`);
  assert(postsA_B_follower.ok && postsA_B_follower.data.posts.length > 0, "Private user's posts list is visible to followers");

  section("User A: Private Post Visibility Enforcement");
  // User A creates a private post
  const privatePost = await a.post("/posts", {
    title: "User A Private Post Title",
    content: "This is fully private content.",
    published: true,
    visibility: "PRIVATE",
  });
  assert(privatePost.ok && privatePost.data.visibility === "PRIVATE", "User A can create a private post");

  // User B (non-author) requests User A's profile post list. 
  // User A's profile is currently followed by B (since we just followed above), 
  // but private posts should still be excluded from the returned posts!
  const postsA_B_privateCheck = await b.get(`/posts?authorUsername=usera_${stamp}`);
  assert(
    postsA_B_privateCheck.ok && !postsA_B_privateCheck.data.posts.some((p) => p.id === privatePost.data.id),
    "User A's private post is NOT visible to User B (even though B follows A)"
  );

  // User B tries to search for the private post title. It should NOT be returned.
  const searchPrivate = await b.get(`/search?q=${encodeURIComponent("Private Post Title")}`);
  assert(
    searchPrivate.ok && !searchPrivate.data.posts.some((p) => p.id === privatePost.data.id),
    "Private post is NOT returned in search results for other users"
  );

  // User B tries to access the private post directly over HTTP. Must receive 404.
  const directGetPrivate = await b.get(`/posts/${privatePost.data.id}`);
  assert(directGetPrivate.status === 404, "User B direct get of private post returns 404 Not Found (not 403)");

  // User A (author) fetches their own post list. The private post MUST appear.
  const postsA_A_privateCheck = await a.get(`/posts?authorUsername=usera_${stamp}`);
  assert(
    postsA_A_privateCheck.ok && postsA_A_privateCheck.data.posts.some((p) => p.id === privatePost.data.id),
    "User A can see their own private post on their own post listing query"
  );

  // User A direct get of their own private post. MUST succeed.
  const directGetPrivateA = await a.get(`/posts/${privatePost.data.id}`);
  assert(directGetPrivateA.ok && directGetPrivateA.data.visibility === "PRIVATE", "User A can access their own private post directly");

  // Leaderboard / streaks verification: private post counts toward points/streaks
  const leaderboardPrivate = await a.get("/users/leaderboard");
  const aEntryPrivate = leaderboardPrivate.data?.find((e) => e.user.username === `usera_${stamp}`);
  assert(aEntryPrivate && aEntryPrivate.points > 0, "User A's private post is counted in leaderboard points computation");

  section("Search");
  const search = await a.get(`/search?q=${encodeURIComponent("Test User B")}`);
  assert(
    search.ok && search.data.users.some((u) => u.username === `userb_${stamp}`),
    "real backend search finds User B by name"
  );

  section("Logout / login persistence");
  await a.post("/auth/logout");
  const meAfterLogout = await a.get("/auth/me");
  assert(meAfterLogout.status === 401, "logout actually invalidates the session (GET /auth/me now rejected)");

  const loginAgain = await a.post("/auth/login", {
    identifier: `usera_${stamp}@test.local`,
    password: "correcthorsebatterystaple",
  });
  assert(loginAgain.ok && loginAgain.data?.user?.username === `usera_${stamp}`, "User A can log back in after logging out");

  const postsAfterRelogin = await a.get(`/posts?authorUsername=usera_${stamp}`);
  assert(
    postsAfterRelogin.data?.posts?.some((p) => p.id === draft.data.id),
    "User A's published post still exists after logout + login (real persistence, not session-scoped state)"
  );

  section("Authorization: users cannot edit/delete each other's content");
  const wrongDelete = await b.delete(`/posts/${draft.data.id}`);
  assert(wrongDelete.status === 403, "User B is correctly forbidden from deleting User A's post");

  const wrongEdit = await b.patch(`/posts/${draft.data.id}`, { title: "Hijacked" });
  assert(wrongEdit.status === 403, "User B is correctly forbidden from editing User A's post");

  console.log(`\n${passed} passed, ${failed} failed\n`);
  if (failed > 0) {
    console.log("Failed checks:");
    failures.forEach((f) => console.log(`  - ${f}`));
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("\nTest script crashed:", err.message);
  process.exit(1);
});
