"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Lock, ExternalLink, Plus, X } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import api from "@/lib/axios";

const TEAL = "#14b8a6";
const PURPLE = "#7c3aed";
const AMBER = "#f59e0b";

const LIGHT = {
  bgPage: "#f8fafc",
  bgCard: "#ffffff",
  border: "#e2e8f0",
  borderSubtle: "#f1f5f9",
  textPrimary: "#0f172a",
  textSecondary: "#64748b",
  textMuted: "#94a3b8",
};

const DARK = {
  bgPage: "#0d0d0d",
  bgCard: "#141414",
  border: "#242424",
  borderSubtle: "#181818",
  textPrimary: "#f0f0f0",
  textSecondary: "#888888",
  textMuted: "#4a4a4a",
};

// Mirrors backend/models/resourceModel.js RESOURCE_CATEGORIES for display purposes only.
const CATEGORIES = ["Template", "Guide", "Tool", "Dataset", "Other"];

const STATUS_META = {
  pending: { label: "Pending review", color: AMBER },
  approved: { label: "Approved", color: TEAL },
  rejected: { label: "Rejected", color: "#ef4444" },
};

function SubmitResourceModal({ tk, onClose, onSubmitted }) {
  const [form, setForm] = useState({ title: "", description: "", url: "", category: "Other" });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.description.trim() || !form.url.trim()) {
      toast.error("Title, description, and URL are required.");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/resources", form);
      toast.success("Submitted for review — you'll earn 10 credits once a moderator approves it.");
      onSubmitted();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to submit resource.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 8,
    border: `1px solid ${tk.border}`,
    background: tk.bgPage,
    color: tk.textPrimary,
    fontSize: 13,
    boxSizing: "border-box",
  };

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 1000, display: "flex",
        alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.45)",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: tk.bgCard, border: `1px solid ${tk.border}`, borderRadius: 14,
          padding: 24, width: "90%", maxWidth: 440, boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: tk.textPrimary, margin: 0 }}>Submit a resource</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: tk.textMuted }}>
            <X size={18} />
          </button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input
            style={inputStyle}
            placeholder="Title"
            maxLength={120}
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          />
          <textarea
            style={{ ...inputStyle, minHeight: 70, resize: "vertical", fontFamily: "inherit" }}
            placeholder="Description — what is it, who is it for?"
            maxLength={1000}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
          <input
            style={inputStyle}
            placeholder="https://link-to-your-resource.com"
            value={form.url}
            onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
          />
          <select
            style={inputStyle}
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
          >
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <p style={{ fontSize: 11.5, color: tk.textMuted, margin: 0 }}>
            A moderator reviews every submission before it&apos;s listed. Approved uploads earn you 10 credits (max 2/month).
          </p>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            style={{
              padding: "10px 0", borderRadius: 8, border: "none", background: TEAL, color: "#fff",
              fontSize: 13, fontWeight: 700, cursor: submitting ? "default" : "pointer", opacity: submitting ? 0.7 : 1,
            }}
          >
            {submitting ? "Submitting…" : "Submit for review"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ResourceCard({ resource, tk, onUnlocked }) {
  const [unlocking, setUnlocking] = useState(false);

  const handleUnlock = async () => {
    setUnlocking(true);
    try {
      const { data } = await api.post(`/resources/${resource._id}/unlock`);
      onUnlocked(resource._id, data.url);
      window.open(data.url, "_blank", "noopener,noreferrer");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to unlock resource.");
    } finally {
      setUnlocking(false);
    }
  };

  return (
    <div style={{
      background: tk.bgCard, border: `1px solid ${tk.border}`, borderRadius: 12,
      padding: 18, display: "flex", flexDirection: "column", gap: 10,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: tk.textPrimary, margin: 0 }}>{resource.title}</p>
        <span style={{
          fontSize: 10, fontWeight: 700, color: PURPLE, background: `${PURPLE}14`,
          padding: "2px 8px", borderRadius: 8, whiteSpace: "nowrap",
        }}>
          {resource.category}
        </span>
      </div>
      <p style={{ fontSize: 12.5, color: tk.textSecondary, lineHeight: 1.5, margin: 0, flex: 1 }}>
        {resource.description}
      </p>
      <p style={{ fontSize: 11, color: tk.textMuted, margin: 0 }}>
        by {resource.uploader?.name || resource.uploader?.username || "a builder"}
      </p>
      {resource.unlocked ? (
        <a
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            padding: "9px 0", borderRadius: 8, border: `1px solid ${TEAL}`, color: TEAL,
            fontSize: 12.5, fontWeight: 700, textDecoration: "none",
          }}
        >
          Open resource <ExternalLink size={13} />
        </a>
      ) : (
        <button
          onClick={handleUnlock}
          disabled={unlocking}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            padding: "9px 0", borderRadius: 8, border: "none", background: TEAL, color: "#fff",
            fontSize: 12.5, fontWeight: 700, cursor: unlocking ? "default" : "pointer", opacity: unlocking ? 0.7 : 1,
          }}
        >
          <Lock size={13} /> {unlocking ? "Unlocking…" : "Unlock — 10 credits"}
        </button>
      )}
    </div>
  );
}

export default function Resources() {
  const { effectiveTheme } = useTheme();
  const tk = effectiveTheme === "dark" ? DARK : LIGHT;

  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [tab, setTab] = useState("browse"); // browse | mine
  const [mySubmissions, setMySubmissions] = useState([]);
  const [mineLoading, setMineLoading] = useState(false);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/resources", { params: category ? { category } : {} });
      setResources(data.resources || []);
    } catch {
      toast.error("Failed to load resources.");
    } finally {
      setLoading(false);
    }
  };

  const fetchMine = async () => {
    setMineLoading(true);
    try {
      const { data } = await api.get("/resources/mine");
      setMySubmissions(data.resources || []);
    } catch {
      toast.error("Failed to load your submissions.");
    } finally {
      setMineLoading(false);
    }
  };

  useEffect(() => {
    if (tab === "browse") fetchResources();
    else fetchMine();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, category]);

  const handleUnlocked = (id, url) => {
    setResources((prev) => prev.map((r) => (r._id === id ? { ...r, unlocked: true, url } : r)));
  };

  return (
    <div style={{ background: tk.bgPage, minHeight: "100vh", padding: "32px 24px 64px" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: tk.textPrimary, margin: "0 0 6px" }}>Resource Library</h1>
            <p style={{ fontSize: 13.5, color: tk.textSecondary, margin: 0 }}>
              Templates, guides, and tools shared by the community. Unlock any resource for 10 credits, or submit your own to earn 10.
            </p>
          </div>
          <button
            onClick={() => setShowSubmitModal(true)}
            style={{
              display: "flex", alignItems: "center", gap: 6, padding: "10px 16px", borderRadius: 8,
              border: "none", background: PURPLE, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap",
            }}
          >
            <Plus size={15} /> Submit a resource
          </button>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 20, borderBottom: `1px solid ${tk.borderSubtle}` }}>
          {[{ id: "browse", label: "Browse" }, { id: "mine", label: "My submissions" }].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                padding: "10px 4px", marginRight: 16, background: "none", border: "none",
                borderBottom: tab === t.id ? `2px solid ${TEAL}` : "2px solid transparent",
                color: tab === t.id ? tk.textPrimary : tk.textMuted,
                fontSize: 13, fontWeight: 700, cursor: "pointer",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "browse" && (
          <>
            <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
              <button
                onClick={() => setCategory(null)}
                style={{
                  padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: "pointer",
                  border: `1px solid ${!category ? TEAL : tk.border}`,
                  background: !category ? `${TEAL}14` : "transparent",
                  color: !category ? TEAL : tk.textSecondary,
                }}
              >
                All
              </button>
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  style={{
                    padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: "pointer",
                    border: `1px solid ${category === c ? TEAL : tk.border}`,
                    background: category === c ? `${TEAL}14` : "transparent",
                    color: category === c ? TEAL : tk.textSecondary,
                  }}
                >
                  {c}
                </button>
              ))}
            </div>

            {loading ? (
              <p style={{ color: tk.textMuted, fontSize: 13 }}>Loading resources…</p>
            ) : resources.length === 0 ? (
              <p style={{ color: tk.textMuted, fontSize: 13 }}>No resources yet in this category. Be the first to submit one.</p>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
                {resources.map((r) => (
                  <ResourceCard key={r._id} resource={r} tk={tk} onUnlocked={handleUnlocked} />
                ))}
              </div>
            )}
          </>
        )}

        {tab === "mine" && (
          mineLoading ? (
            <p style={{ color: tk.textMuted, fontSize: 13 }}>Loading your submissions…</p>
          ) : mySubmissions.length === 0 ? (
            <p style={{ color: tk.textMuted, fontSize: 13 }}>You haven&apos;t submitted any resources yet.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {mySubmissions.map((r) => {
                const meta = STATUS_META[r.status] || STATUS_META.pending;
                return (
                  <div key={r._id} style={{
                    background: tk.bgCard, border: `1px solid ${tk.border}`, borderRadius: 10,
                    padding: 14, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12,
                  }}>
                    <div>
                      <p style={{ fontSize: 13.5, fontWeight: 700, color: tk.textPrimary, margin: "0 0 4px" }}>{r.title}</p>
                      <p style={{ fontSize: 12, color: tk.textSecondary, margin: 0 }}>{r.category}</p>
                      {r.status === "rejected" && r.rejectionNote && (
                        <p style={{ fontSize: 11.5, color: "#ef4444", margin: "4px 0 0" }}>Reason: {r.rejectionNote}</p>
                      )}
                    </div>
                    <span style={{
                      fontSize: 11, fontWeight: 700, color: meta.color, background: `${meta.color}14`,
                      padding: "4px 10px", borderRadius: 8, whiteSpace: "nowrap",
                    }}>
                      {meta.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )
        )}
      </div>

      {showSubmitModal && (
        <SubmitResourceModal
          tk={tk}
          onClose={() => setShowSubmitModal(false)}
          onSubmitted={() => { if (tab === "mine") fetchMine(); }}
        />
      )}
    </div>
  );
}
