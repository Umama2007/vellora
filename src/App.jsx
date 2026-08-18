import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./layouts/AppLayout";

import { lazy, Suspense } from "react";

const Landing = lazy(() => import("./pages/Landing"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const About = lazy(() => import("./pages/About"));
const NotFound = lazy(() => import("./pages/NotFound"));

const Dashboard = lazy(() => import("./pages/Dashboard"));
const Explore = lazy(() => import("./pages/Explore"));
const Trending = lazy(() => import("./pages/Trending"));
const CreatePost = lazy(() => import("./pages/CreatePost"));
const PostDetail = lazy(() => import("./pages/PostDetail"));
const Profile = lazy(() => import("./pages/Profile"));
const Messages = lazy(() => import("./pages/Messages"));
const Community = lazy(() => import("./pages/Community"));
const Streaks = lazy(() => import("./pages/Streaks"));
const Notifications = lazy(() => import("./pages/Notifications"));
const Bookmarks = lazy(() => import("./pages/Bookmarks"));
const SearchResults = lazy(() => import("./pages/SearchResults"));
const Settings = lazy(() => import("./pages/Settings"));

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <Suspense fallback={<div className="flex h-screen w-screen items-center justify-center bg-[#F4EEFB] text-sm text-plum font-semibold animate-pulse">Loading Vellora...</div>}>
            <Routes>
              {/* Public */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/about" element={<About />} />

              {/* App shell (persistent sidebar) — every child route requires a real session */}
              <Route
                path="/app"
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="explore" element={<Explore />} />
                <Route path="trending" element={<Trending />} />
                <Route path="create" element={<CreatePost />} />
                <Route path="post/:id" element={<PostDetail />} />
                <Route path="profile" element={<Profile />} />
                <Route path="profile/:username" element={<Profile />} />
                <Route path="messages" element={<Messages />} />
                <Route path="community" element={<Community />} />
                <Route path="streaks" element={<Streaks />} />
                <Route path="notifications" element={<Notifications />} />
                <Route path="bookmarks" element={<Bookmarks />} />
                <Route path="search" element={<SearchResults />} />
                <Route path="settings" element={<Settings />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
