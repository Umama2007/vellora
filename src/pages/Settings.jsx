import { useState, useEffect } from "react";
import Topbar from "../components/Topbar";
import Avatar from "../components/Avatar";
import { useAuth } from "../context/AuthContext";
import { usersApi } from "../api/users";
import { postsApi } from "../api/posts";
import { Camera } from "lucide-react";

const SECTIONS = ["Profile", "Notifications", "Privacy"];

export default function Settings() {
  const { user, refreshUser } = useAuth();
  const [section, setSection] = useState("Profile");
  const [form, setForm] = useState({ name: "", bio: "", location: "", avatarUrl: "" });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        bio: user.bio || "",
        location: user.location || "",
        avatarUrl: user.avatarUrl || "",
      });
    }
  }, [user]);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    setSaved(false);
  }

  async function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const result = await postsApi.uploadImage(file);
      update("avatarUrl", result.url);
    } catch (err) {
      setError(err.message || "Couldn't upload the image.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await usersApi.updateMe(form);
      await refreshUser();
      setSaved(true);
    } catch (err) {
      setError(err.message || "Couldn't save your changes.");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(field, value) {
    setSaving(true);
    setSaved(false);
    setError("");
    try {
      await usersApi.updateMe({ [field]: value });
      await refreshUser();
      setSaved(true);
      setTimeout(() => setSaved(false), 2050);
    } catch (err) {
      setError(err.message || "Couldn't update settings.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <Topbar title="Settings" subtitle="Manage your profile and preferences" />
      <div className="px-8 pb-12 grid md:grid-cols-4 gap-6 max-w-4xl">
        <nav className="flex md:flex-col overflow-x-auto gap-2 md:gap-1 pb-3 md:pb-0 shrink-0">
          {SECTIONS.map((s) => (
            <button
              key={s}
              onClick={() => setSection(s)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors text-center md:text-left shrink-0 ${
                section === s ? "bg-plum text-cream" : "text-ink-muted bg-plum-50/40 md:bg-transparent hover:bg-plum-50"
              }`}
            >
              {s}
            </button>
          ))}
        </nav>

        <div className="md:col-span-3 card p-6">
          {error && (
            <div className="mb-4 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm px-4 py-3">
              {error}
            </div>
          )}

          {section === "Profile" && (
            <form onSubmit={handleSave} className="space-y-5">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar src={form.avatarUrl} alt={form.name} size={72} />
                  <label className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-plum text-cream flex items-center justify-center border-2 border-surface cursor-pointer">
                    <Camera size={13} />
                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                  </label>
                </div>
                <div>
                  <p className="text-sm font-medium text-ink">Profile picture</p>
                  <p className="text-xs text-ink-faint">{uploading ? "Uploading..." : "JPG or PNG, max 5MB"}</p>
                </div>
              </div>

              <Field label="Full name" value={form.name} onChange={(v) => update("name", v)} />
              <div>
                <label className="text-sm font-medium text-ink block mb-1.5">Bio</label>
                <textarea
                  value={form.bio}
                  onChange={(e) => update("bio", e.target.value)}
                  rows={3}
                  maxLength={300}
                  className="input-field resize-none"
                />
              </div>
              <Field label="Location" value={form.location} onChange={(v) => update("location", v)} />

              <div className="flex items-center gap-3 pt-2">
                <button type="submit" disabled={saving} className="btn-primary">
                  {saving ? "Saving..." : "Save changes"}
                </button>
                {saved && <span className="text-sm text-emerald-600">Saved</span>}
              </div>
            </form>
          )}

          {section === "Notifications" && (
            <div className="space-y-6">
              <div>
                <h3 className="font-display font-semibold text-ink text-lg">Notification Preferences</h3>
                <p className="text-xs text-ink-muted mt-0.5">Control when Vellora sends you updates.</p>
              </div>

              <div className="divide-y divide-plum-100/60 border-t border-b border-plum-100/40">
                <ToggleRow
                  label="Likes"
                  description="Receive notifications when someone likes your posts."
                  checked={user?.notifyOnLike ?? true}
                  onChange={(v) => handleToggle("notifyOnLike", v)}
                  disabled={saving}
                />
                <ToggleRow
                  label="Comments"
                  description="Receive notifications when someone comments on your posts."
                  checked={user?.notifyOnComment ?? true}
                  onChange={(v) => handleToggle("notifyOnComment", v)}
                  disabled={saving}
                />
                <ToggleRow
                  label="New followers"
                  description="Receive notifications when someone follows your profile."
                  checked={user?.notifyOnFollow ?? true}
                  onChange={(v) => handleToggle("notifyOnFollow", v)}
                  disabled={saving}
                />
              </div>

              <div className="flex items-center gap-3 pt-1">
                {saving && <span className="text-sm text-ink-faint">Saving...</span>}
                {!saving && saved && <span className="text-sm text-emerald-600">Saved successfully</span>}
              </div>
            </div>
          )}

          {section === "Privacy" && (
            <div className="space-y-6">
              <div>
                <h3 className="font-display font-semibold text-ink text-lg">Privacy Preferences</h3>
                <p className="text-xs text-ink-muted mt-0.5">Manage your profile visibility on the platform.</p>
              </div>

              <div className="divide-y divide-plum-100/60 border-t border-b border-plum-100/40">
                <ToggleRow
                  label="Private profile"
                  description="When enabled, only accepted followers can view your posts and full profile details."
                  checked={user?.isPrivate ?? false}
                  onChange={(v) => handleToggle("isPrivate", v)}
                  disabled={saving}
                />
              </div>

              <div className="flex items-center gap-3 pt-1">
                {saving && <span className="text-sm text-ink-faint">Saving...</span>}
                {!saving && saved && <span className="text-sm text-emerald-600">Saved successfully</span>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ToggleRow({ label, description, checked, onChange, disabled }) {
  return (
    <div className="flex items-center justify-between py-4 gap-4">
      <div className="flex-1">
        <p className="text-sm font-semibold text-ink">{label}</p>
        <p className="text-xs text-ink-muted mt-0.5">{description}</p>
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        disabled={disabled}
        className={`relative inline-flex h-6.5 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
          checked ? 'bg-plum' : 'bg-plum-100'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5.5 w-5.5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            checked ? 'translate-x-5.5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}

function Field({ label, value, onChange }) {
  return (
    <div>
      <label className="text-sm font-medium text-ink block mb-1.5">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} className="input-field" />
    </div>
  );
}
