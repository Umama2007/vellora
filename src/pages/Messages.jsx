import { useState, useEffect, useCallback, useRef } from "react";
import { Search, Send, MessageCircle, ArrowLeft } from "lucide-react";
import Avatar from "../components/Avatar";
import { conversationsApi } from "../api/conversations";
import { searchApi } from "../api/users";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";

function timeAgo(dateString) {
  if (!dateString) return "";
  const diffMs = Date.now() - new Date(dateString).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

export default function Messages() {
  const { user } = useAuth();
  const { socket, connected, connectionError } = useSocket();

  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [loadingList, setLoadingList] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [mobileView, setMobileView] = useState("list");
  const [showSocketNotice, setShowSocketNotice] = useState(true);
  const [socketTimedOut, setSocketTimedOut] = useState(false);
  const scrollRef = useRef(null);

  const active = conversations.find((c) => c.id === activeId);

  // Fallback timer for socket connection banner (6 seconds)
  useEffect(() => {
    if (connected) {
      setSocketTimedOut(false);
      return;
    }
    const timer = setTimeout(() => {
      setSocketTimedOut(true);
    }, 6000);
    return () => clearTimeout(timer);
  }, [connected]);

  const loadConversations = useCallback(async () => {
    try {
      const data = await conversationsApi.list();
      setConversations(data || []);
      setActiveId((prev) => prev || (data && data.length > 0 ? data[0].id : null));
    } catch (err) {
      console.error("Failed to load conversations:", err);
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    if (!activeId) return;
    setLoadingMessages(true);
    conversationsApi
      .messages(activeId)
      .then((data) => setMessages(data || []))
      .catch((err) => console.error("Failed to load messages:", err))
      .finally(() => setLoadingMessages(false));

    conversationsApi
      .markRead(activeId)
      .then(() => loadConversations())
      .catch(() => {});

    if (socket && connected) {
      socket.emit("conversation:join", activeId);
      return () => socket.emit("conversation:leave", activeId);
    }
  }, [activeId, socket, connected, loadConversations]);

  // Real-time: new messages pushed from the server via Socket.IO land here.
  useEffect(() => {
    if (!socket || !connected) return;
    function handleNewMessage(payload) {
      if (payload.conversationId === activeId) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === payload.id)) return prev;
          return [...prev, { ...payload, fromMe: payload.sender?.id === user?.id }];
        });
      }
      loadConversations();
    }
    socket.on("message:new", handleNewMessage);
    return () => socket.off("message:new", handleNewMessage);
  }, [socket, connected, activeId, user?.id, loadConversations]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  async function sendMessage(e) {
    e.preventDefault();
    if (!draft.trim() || !activeId) return;
    const content = draft.trim();
    setDraft("");
    try {
      const sent = await conversationsApi.send(activeId, content);
      if (sent) {
        setMessages((prev) => [...prev, sent]);
        loadConversations();
      }
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  }

  async function handleUserSearch(e) {
    const q = e.target.value;
    setSearchQuery(q);
    if (q.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    try {
      const data = await searchApi.search(q);
      setSearchResults(data.users.filter((u) => u.id !== user?.id));
    } catch (err) {
      console.error("User search failed:", err);
    }
  }

  async function startConversationWith(username) {
    try {
      const { id } = await conversationsApi.start(username);
      setSearchQuery("");
      setSearchResults([]);
      await loadConversations();
      setActiveId(id);
      setMobileView("chat");
    } catch (err) {
      console.error("Failed to start conversation:", err);
    }
  }

  return (
    <div className="flex h-full flex-col">
      {!connected && showSocketNotice && (
        <div className="bg-beige/60 border-b border-plum-100/60 px-6 py-2 flex items-center justify-between text-xs text-ink-muted">
          <span>
            {socketTimedOut || connectionError
              ? "Real-time updates unavailable — refresh to see new messages"
              : "Connecting to real-time messaging..."}
          </span>
          {(socketTimedOut || connectionError) && (
            <button
              onClick={() => setShowSocketNotice(false)}
              className="text-ink-faint hover:text-ink text-[11px] underline ml-2 shrink-0"
            >
              Dismiss
            </button>
          )}
        </div>
      )}
      <div className="flex flex-1 min-h-0">
        <div className={`w-full md:w-80 shrink-0 border-r border-plum-100/60 flex flex-col bg-surface ${mobileView === "chat" ? "hidden md:flex" : "flex"}`}>
          <div className="p-5">
            <h2 className="font-display font-semibold text-lg text-ink mb-3">Messages</h2>
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
              <input
                value={searchQuery}
                onChange={handleUserSearch}
                placeholder="Search people to message"
                className="input-field pl-9 text-sm"
              />
            </div>
            {searchResults.length > 0 && (
              <div className="mt-2 card p-2 space-y-1">
                {searchResults.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => startConversationWith(u.username)}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-plum-50 text-left"
                  >
                    <Avatar src={u.avatarUrl} alt={u.name} size={28} />
                    <span className="text-sm text-ink">{u.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto">
            {loadingList && <p className="text-sm text-ink-muted text-center py-8">Loading...</p>}

            {!loadingList && conversations.length === 0 && (
              <div className="text-center py-12 px-4">
                <MessageCircle size={28} className="text-plum-200 mx-auto mb-2" />
                <p className="text-sm text-ink-muted">No conversations yet.</p>
                <p className="text-xs text-ink-faint mt-1">Search for someone above to start one.</p>
              </div>
            )}

            {conversations.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  setActiveId(c.id);
                  setMobileView("chat");
                }}
                className={`w-full flex items-center gap-3 px-5 py-3 text-left transition-colors ${
                  activeId === c.id ? "bg-plum-50" : "hover:bg-plum-50/60"
                }`}
              >
                <Avatar src={c.otherUser?.avatarUrl} alt={c.otherUser?.name} size={44} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-ink truncate">{c.otherUser?.name}</p>
                    <span className="text-xs text-ink-faint shrink-0">{timeAgo(c.lastMessage?.createdAt)}</span>
                  </div>
                  <p className="text-xs text-ink-muted truncate">
                    {c.lastMessage ? c.lastMessage.content : "Say hello"}
                  </p>
                </div>
                {c.unreadCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-plum text-cream text-[10px] flex items-center justify-center shrink-0">
                    {c.unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className={`flex-1 flex flex-col ${mobileView === "list" ? "hidden md:flex" : "flex"}`}>
          {!active ? (
            <div className="flex-1 flex items-center justify-center text-ink-faint text-sm">
              Select a conversation, or search for someone to message.
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 px-6 py-4 border-b border-plum-100/60 bg-surface">
                <button
                  onClick={() => setMobileView("list")}
                  className="md:hidden p-1.5 rounded-xl bg-plum-50 text-ink-muted hover:text-plum transition-colors mr-1"
                  aria-label="Back to conversations list"
                >
                  <ArrowLeft size={18} />
                </button>
                <Avatar src={active.otherUser?.avatarUrl} alt={active.otherUser?.name} size={38} />
                <p className="text-sm font-medium text-ink">{active.otherUser?.name}</p>
              </div>

              <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-6 space-y-3">
                {loadingMessages && <p className="text-sm text-ink-muted text-center">Loading messages...</p>}
                {!loadingMessages &&
                  messages.map((m) => (
                    <div key={m.id} className={`flex ${m.fromMe ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-xs px-4 py-2.5 rounded-2xl text-sm ${
                          m.fromMe
                            ? "bg-plum text-cream rounded-br-md"
                            : "bg-white border border-plum-100 text-ink rounded-bl-md"
                        }`}
                      >
                        {m.content}
                      </div>
                    </div>
                  ))}
                {!loadingMessages && messages.length === 0 && (
                  <p className="text-sm text-ink-muted text-center">Say hello to start the conversation.</p>
                )}
              </div>

              <form onSubmit={sendMessage} className="flex items-center gap-2 px-6 py-4 border-t border-plum-100/60 bg-surface">
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Type a message..."
                  className="input-field flex-1"
                />
                <button type="submit" className="btn-primary p-2.5" aria-label="Send message">
                  <Send size={17} />
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
