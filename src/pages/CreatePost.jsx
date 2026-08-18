import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Bold,
  Italic,
  List,
  ListOrdered,
  Link2,
  Quote,
  Image as ImageIcon,
  Tag,
} from "lucide-react";
import { postsApi } from "../api/posts";
import { ApiRequestError } from "../api/client";
import { getImageUrl } from "../utils/imageUrl";

export default function CreatePost() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("General");
  const [visibility, setVisibility] = useState("PUBLIC");
  const [coverImage, setCoverImage] = useState("");
  const [uploadingCover, setUploadingCover] = useState(false);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function handleFormat(type) {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selection = text.substring(start, end);

    let insertion = "";
    let selectStart = start;
    let selectEnd = start;

    switch (type) {
      case "bold":
        if (selection) {
          insertion = `**${selection}**`;
          selectStart = start + 2;
          selectEnd = end + 2;
        } else {
          insertion = "**bold text**";
          selectStart = start + 2;
          selectEnd = start + 11;
        }
        break;
      case "italic":
        if (selection) {
          insertion = `*${selection}*`;
          selectStart = start + 1;
          selectEnd = end + 1;
        } else {
          insertion = "*italic text*";
          selectStart = start + 1;
          selectEnd = start + 12;
        }
        break;
      case "list": {
        const prefix = "\n- ";
        if (selection) {
          insertion = prefix + selection;
          selectStart = start + prefix.length;
          selectEnd = end + prefix.length;
        } else {
          insertion = prefix + "list item";
          selectStart = start + prefix.length;
          selectEnd = start + prefix.length + 9;
        }
        break;
      }
      case "list-ordered": {
        const prefix = "\n1. ";
        if (selection) {
          insertion = prefix + selection;
          selectStart = start + prefix.length;
          selectEnd = end + prefix.length;
        } else {
          insertion = prefix + "list item";
          selectStart = start + prefix.length;
          selectEnd = start + prefix.length + 9;
        }
        break;
      }
      case "quote": {
        const prefix = "\n> ";
        if (selection) {
          insertion = prefix + selection;
          selectStart = start + prefix.length;
          selectEnd = end + prefix.length;
        } else {
          insertion = prefix + "quote";
          selectStart = start + prefix.length;
          selectEnd = start + prefix.length + 5;
        }
        break;
      }
      case "link": {
        const url = prompt("Enter URL:");
        if (url === null) return;
        if (selection) {
          insertion = `[${selection}](${url || "https://"})`;
          selectStart = start + 1;
          selectEnd = end + 1;
        } else {
          insertion = `[link text](${url || "https://"})`;
          selectStart = start + 1;
          selectEnd = start + 10;
        }
        break;
      }
      default:
        return;
    }

    const newContent = text.substring(0, start) + insertion + text.substring(end);
    setContent(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(selectStart, selectEnd);
    }, 0);
  }

  function addTag(e) {
    e.preventDefault();
    const value = tagInput.trim();
    if (value && !tags.includes(value)) setTags([...tags, value]);
    setTagInput("");
  }

  function removeTag(tag) {
    setTags(tags.filter((t) => t !== tag));
  }

  async function handleCoverUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    setError("");
    try {
      const result = await postsApi.uploadImage(file);
      setCoverImage(result.url);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Couldn't upload the image.");
    } finally {
      setUploadingCover(false);
    }
  }

  async function savePost(published) {
    if (!title.trim() || !content.trim()) {
      setError("Add a title and some content before saving.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const post = await postsApi.create({ title, content, category, coverImage, tags, published, visibility });
      navigate(published ? `/app/post/${post.id}` : "/app");
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Couldn't save your post.");
    } finally {
      setSaving(false);
    }
  }

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center justify-between px-4 py-4 md:px-8 md:py-5 border-b border-plum-100/60 bg-surface">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-ink-muted hover:text-plum transition-colors"
        >
          <ArrowLeft size={18} /> <span className="hidden sm:inline">Create New Post</span>
        </button>
        <div className="flex items-center gap-2 md:gap-3">
          <button onClick={() => savePost(false)} disabled={saving} className="btn-secondary text-sm px-3 py-1.5 md:px-4 md:py-2">
            {saving ? "Saving..." : "Save Draft"}
          </button>
          <button onClick={() => savePost(true)} disabled={saving} className="btn-primary text-sm px-3 py-1.5 md:px-4 md:py-2">
            {saving ? "Publishing..." : "Publish"}
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8 md:py-8">
        <div className="max-w-3xl mx-auto space-y-6">
          {error && (
            <div className="rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm px-4 py-3">
              {error}
            </div>
          )}

          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Add Title"
            className="w-full font-display text-3xl font-semibold text-ink placeholder:text-ink-faint outline-none bg-transparent"
          />

          <div className="flex items-center gap-4 flex-wrap">
            <div>
              <label htmlFor="category-select" className="text-xs font-semibold text-ink-muted uppercase tracking-wider block mb-1.5">
                Category
              </label>
              <select
                id="category-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="input-field w-48"
              >
                {["General", "Tech", "Design", "Life", "Travel"].map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="visibility-select" className="text-xs font-semibold text-ink-muted uppercase tracking-wider block mb-1.5">
                Who can see this
              </label>
              <select
                id="visibility-select"
                value={visibility}
                onChange={(e) => setVisibility(e.target.value)}
                className="input-field w-48"
              >
                <option value="PUBLIC">Public</option>
                <option value="PRIVATE">Only me</option>
              </select>
            </div>
          </div>

          {coverImage && (
            <img src={getImageUrl(coverImage)} alt="" className="w-full h-56 object-cover rounded-xl" />
          )}

          <div className="flex items-center gap-1 p-2 rounded-xl border border-plum-100 bg-white flex-wrap">
            <ToolbarButton icon={Bold} onClick={() => handleFormat("bold")} />
            <ToolbarButton icon={Italic} onClick={() => handleFormat("italic")} />
            <ToolbarButton icon={List} onClick={() => handleFormat("list")} />
            <ToolbarButton icon={ListOrdered} onClick={() => handleFormat("list-ordered")} />
            <ToolbarButton icon={Quote} onClick={() => handleFormat("quote")} />
            <ToolbarButton icon={Link2} onClick={() => handleFormat("link")} />
            <div className="w-px h-5 bg-plum-100 mx-1" />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleCoverUpload}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingCover}
              className="btn-ghost text-xs flex items-center gap-1.5"
            >
              <ImageIcon size={15} /> {uploadingCover ? "Uploading..." : "Add Cover Image"}
            </button>
          </div>

          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your story..."
            rows={14}
            className="w-full text-ink placeholder:text-ink-faint outline-none bg-transparent resize-none leading-relaxed"
          />

          <div className="flex items-center justify-between text-xs text-ink-faint border-t border-plum-100 pt-4">
            <span>{wordCount} words</span>
          </div>

          <div className="card p-5 space-y-4">
            <form onSubmit={addTag} className="flex items-center gap-2 rounded-xl border border-dashed border-plum-100 px-4 py-3 focus-within:border-plum-300">
              <Tag size={16} className="text-ink-muted shrink-0" />
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Type a tag and press Enter"
                className="flex-1 text-sm bg-transparent outline-none placeholder:text-ink-faint"
              />
            </form>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span key={tag} className="pill bg-plum-50 text-plum">
                    #{tag}
                    <button
                      onClick={() => removeTag(tag)}
                      aria-label={`Remove tag ${tag}`}
                      className="ml-1 text-plum/60 hover:text-plum"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ToolbarButton({ icon: Icon, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="p-2 rounded-lg text-ink-muted hover:bg-plum-50 hover:text-plum transition-colors"
    >
      <Icon size={16} />
    </button>
  );
}
