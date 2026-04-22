'use client';
import React, { useState, useEffect } from 'react';
import PrivateLayout from '../../layouts/PrivateLayout';
import api from '@/lib/axios';
import './my-products.css';

// ── Constants — IDs match backend enum values exactly ────────────────────────

const CATEGORIES = [
  { id: 'SaaS/Productivity', icon: '📊', label: 'SaaS / Productivity' },
  { id: 'AI/ML tools',       icon: '🤖', label: 'AI / ML tools' },
  { id: 'Dev tools',         icon: '💻', label: 'Dev tools' },
  { id: 'Mobile app',        icon: '📱', label: 'Mobile app' },
  { id: 'Health/Wellness',   icon: '💚', label: 'Health / Wellness' },
  { id: 'Finance',           icon: '💰', label: 'Finance' },
  { id: 'Education',         icon: '🎓', label: 'Education' },
  { id: 'E-commerce',        icon: '🛒', label: 'E-commerce' },
  { id: 'Other',             icon: '◆',  label: 'Other' },
];

const BUILD_STAGES = ['Idea', 'Prototype', 'MVP', 'Beta', 'Launched'];

const FOCUS_AREAS = [
  { id: 'Onboarding & first impression', title: 'Onboarding & first impression', desc: 'Easy to understand and get started with?' },
  { id: 'Pricing & willingness to pay',  title: 'Pricing & willingness to pay',  desc: 'Does the pricing feel fair?' },
  { id: 'UX & design clarity',           title: 'UX & design clarity',           desc: 'Is the interface intuitive?' },
  { id: 'Value proposition & messaging', title: 'Value proposition & messaging', desc: "Is it clear who it's for?" },
  { id: 'Feature completeness',          title: 'Feature completeness',          desc: "What's missing that would make this a must-use?" },
  { id: 'Market fit & competition',      title: 'Market fit & competition',      desc: 'How does it stand out vs alternatives?' },
];

const REVIEWER_TYPES = ['Founders', 'Designers', 'Developers', 'Marketers', 'Any builder'];
const FEEDBACK_TAGS  = ['All', 'UX', 'PRICING', 'MOBILE', 'POSITIVE', 'PERFORMANCE', 'FEATURE REQ'];

// ── Helpers ──────────────────────────────────────────────────────────────────

function getStageBadge(product) {
  if (product.status === 'launched')       return { text: 'LAUNCHED', color: 'green'  };
  if (product.buildStage === 'MVP')        return { text: 'MVP',       color: 'purple' };
  if (product.buildStage === 'Beta')       return { text: 'BETA',      color: 'purple' };
  if (product.buildStage === 'Prototype')  return { text: 'PROTOTYPE', color: 'gray'   };
  if (product.buildStage === 'Idea')       return { text: 'IDEA',      color: 'gray'   };
  if (product.buildStage === 'Launched')   return { text: 'LAUNCHED',  color: 'green'  };
  return { text: 'DRAFT', color: 'gray' };
}

function getStatusBadge(status) {
  if (status === 'in_review') return { text: 'IN REVIEW', color: 'orange' };
  if (status === 'launched')  return { text: 'DONE',      color: 'blue'   };
  if (status === 'draft')     return { text: 'DRAFT',     color: 'gray'   };
  if (status === 'archived')  return { text: 'ARCHIVED',  color: 'gray'   };
  return { text: '—', color: 'gray' };
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function isRecent(dateStr) {
  return Date.now() - new Date(dateStr).getTime() < 24 * 60 * 60 * 1000;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, iconBg, icon }) {
  return (
    <div className="mp-stat-card">
      <div className="mp-stat-body">
        <div className="mp-stat-label">{label}</div>
        <div className="mp-stat-value">{value}</div>
        <div className="mp-stat-sub">{sub}</div>
      </div>
      <div className="mp-stat-icon" style={{ background: iconBg }}>{icon}</div>
    </div>
  );
}

const CubeIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
    <line x1="12" y1="22.08" x2="12" y2="12"/>
  </svg>
);

const DollarIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23"/>
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
  </svg>
);

const StarOutlineIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

const TrendingUpIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
    <polyline points="17 6 23 6 23 12"/>
  </svg>
);

function TagPill({ label }) {
  const colorMap = {
    UX: 'tag-ux', PRICING: 'tag-pricing', MOBILE: 'tag-mobile',
    POSITIVE: 'tag-positive', PERFORMANCE: 'tag-performance', 'FEATURE REQ': 'tag-feature',
  };
  return <span className={`mp-tag-pill ${colorMap[label] || 'tag-default'}`}>{label}</span>;
}

function FeedbackCard({ fb, productId, onReplyAdded }) {
  const [replyOpen,   setReplyOpen]   = useState(false);
  const [replyText,   setReplyText]   = useState('');
  const [helpfulCount, setHelpfulCount] = useState(fb.helpfulCount);
  const [resolved,    setResolved]    = useState(fb.resolved);
  const [submitting,  setSubmitting]  = useState(false);
  const [replies,     setReplies]     = useState(fb.replies || []);

  const reviewerName    = fb.reviewer?.name || 'Reviewer';
  const reviewerInitial = reviewerName.charAt(0).toUpperCase();
  const stars           = Math.round(fb.rating);

  const handleReply = async () => {
    if (!replyText.trim() || submitting) return;
    setSubmitting(true);
    try {
      const res = await api.post(`/products/${productId}/reviews/${fb._id}/reply`, { content: replyText });
      const newReplies = res.data.replies || [];
      setReplies(newReplies);
      setReplyText('');
      setReplyOpen(false);
      if (onReplyAdded) onReplyAdded(fb._id, newReplies);
    } catch (err) {
      console.error('Reply failed', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleHelpful = async () => {
    try {
      const res = await api.post(`/products/${productId}/reviews/${fb._id}/helpful`);
      setHelpfulCount(res.data.helpfulCount);
    } catch (err) {
      console.error('Helpful failed', err);
    }
  };

  const handleResolve = async () => {
    try {
      const res = await api.put(`/products/${productId}/reviews/${fb._id}/resolve`);
      setResolved(res.data.resolved);
    } catch (err) {
      console.error('Resolve failed', err);
    }
  };

  return (
    <div className={`mp-fb-card${resolved ? ' mp-fb-card--resolved' : ''}`}>
      <div className="mp-fb-header">
        <div className="mp-fb-avatar">{reviewerInitial}</div>
        <div className="mp-fb-meta">
          <span className="mp-fb-name">{reviewerName}</span>
          <span className="mp-fb-round">Round {fb.round}</span>
          <span className="mp-fb-dot">·</span>
          <span className="mp-fb-time">{timeAgo(fb.createdAt)}</span>
          {isRecent(fb.createdAt) && <span className="mp-fb-new-badge">NEW</span>}
        </div>
        <div className="mp-fb-stars-row">
          {'★'.repeat(stars)}{'☆'.repeat(5 - stars)}
          <span className="mp-fb-rating-num"> {fb.rating.toFixed(1)}</span>
        </div>
      </div>

      {fb.tags?.length > 0 && (
        <div className="mp-fb-tags-row">
          {fb.tags.map(t => <TagPill key={t} label={t} />)}
        </div>
      )}

      <p className="mp-fb-text">{fb.content}</p>

      {replies.map((r, i) => (
        <div key={r._id || i} className="mp-fb-reply">
          <div className="mp-fb-reply-avatar">
            {(r.author?.name || 'ME').charAt(0).toUpperCase()}
          </div>
          <div className="mp-fb-reply-body">
            <span className="mp-fb-reply-time">{timeAgo(r.createdAt)}</span>
            <p className="mp-fb-reply-text">{r.content}</p>
          </div>
        </div>
      ))}

      <div className="mp-fb-actions-row">
        <button className="mp-fb-action-btn" onClick={() => setReplyOpen(v => !v)}>↩ Reply</button>
        <button className="mp-fb-action-btn" onClick={handleHelpful}>
          👍 Helpful ({helpfulCount})
        </button>
        <span
          className="mp-fb-resolved"
          style={resolved ? { color: 'var(--mp-green)' } : {}}
          onClick={handleResolve}
        >
          {resolved ? '✓ Resolved' : 'Mark resolved'}
        </span>
      </div>

      {replyOpen && (
        <div className="mp-fb-reply-box">
          <input
            value={replyText}
            onChange={e => setReplyText(e.target.value)}
            placeholder="Write a reply..."
            className="mp-fb-reply-input"
          />
          <div className="mp-fb-reply-btns">
            <button className="mp-btn-ghost" onClick={() => setReplyOpen(false)}>Cancel</button>
            <button className="mp-btn-primary" onClick={handleReply} disabled={submitting}>
              {submitting ? 'Sending…' : '✈ Send reply'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ProductRow({ product, expanded, onToggle, onProductUpdate }) {
  const [activeTag,      setActiveTag]      = useState('All');
  const [reviews,        setReviews]        = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsFetched, setReviewsFetched] = useState(false);
  const [actionLoading,  setActionLoading]  = useState(false);

  const stageBadge  = getStageBadge(product);
  const statusBadge = getStatusBadge(product.status);
  const rating      = product.avgRating > 0 ? product.avgRating : null;

  // Fetch reviews the first time this row is expanded
  useEffect(() => {
    if (!expanded || reviewsFetched) return;
    setReviewsLoading(true);
    api.get(`/products/${product._id}/reviews`)
      .then(res => { setReviews(res.data.reviews || []); setReviewsFetched(true); })
      .catch(() => setReviews([]))
      .finally(() => setReviewsLoading(false));
  }, [expanded, reviewsFetched, product._id]);

  const handleTagChange = async (tag) => {
    setActiveTag(tag);
    setReviewsLoading(true);
    try {
      const qs = tag !== 'All' ? `?tag=${encodeURIComponent(tag)}` : '';
      const res = await api.get(`/products/${product._id}/reviews${qs}`);
      setReviews(res.data.reviews || []);
    } catch {
      // keep existing list on error
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.stopPropagation();
    setActionLoading(true);
    try {
      const res = await api.post(`/products/${product._id}/submit`);
      onProductUpdate?.({ ...product, ...res.data.product });
    } catch (err) {
      console.error('Submit failed', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReplyAdded = (reviewId, newReplies) => {
    setReviews(prev => prev.map(r => r._id === reviewId ? { ...r, replies: newReplies } : r));
  };

  return (
    <>
      <tr
        className={`mp-product-row ${expanded ? 'mp-product-row--expanded' : ''}`}
        onClick={onToggle}
      >
        <td className="mp-td mp-td-product">
          <div className="mp-prod-name">{product.name}</div>
          <div className="mp-prod-cat">{product.category}</div>
        </td>
        <td className="mp-td">
          <span className={`mp-stage-badge mp-stage-${stageBadge.color}`}>{stageBadge.text}</span>
        </td>
        <td className="mp-td">
          <span className={`mp-status-badge mp-status-${statusBadge.color}`}>{statusBadge.text}</span>
        </td>
        <td className="mp-td">
          {product.totalReviews > 0
            ? <span className="mp-reviews-count">{product.totalReviews}</span>
            : <span className="mp-muted">—</span>}
        </td>
        <td className="mp-td">
          {rating
            ? <div className="mp-rating-cell"><span className="mp-rating-star">★</span><span className="mp-rating-num">{rating}</span></div>
            : <span className="mp-muted">—</span>}
        </td>
        <td className="mp-td mp-td-action" onClick={e => e.stopPropagation()}>
          <div className="mp-action-cell">
            <div className="mp-action-btns">
              {(product.status === 'launched' || product.status === 'in_review') && (
                <>
                  <button className="mp-action-resubmit">Re-submit</button>
                  <button className="mp-action-analysis">Analysis</button>
                </>
              )}
              {product.status === 'draft' && (
                <button className="mp-action-submit" onClick={handleSubmit} disabled={actionLoading}>
                  {actionLoading ? '…' : 'Submit'}
                </button>
              )}
            </div>
            <div className="mp-action-icons">
              <button className="mp-icon-btn" title="Analytics">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="20" x2="18" y2="10" />
                  <line x1="12" y1="20" x2="12" y2="4" />
                  <line x1="6"  y1="20" x2="6"  y2="14" />
                </svg>
              </button>
              <button className="mp-icon-btn" title="More options">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="5"  r="1.5" />
                  <circle cx="12" cy="12" r="1.5" />
                  <circle cx="12" cy="19" r="1.5" />
                </svg>
              </button>
            </div>
          </div>
        </td>
      </tr>

      {expanded && (
        <tr className="mp-feedback-row">
          <td colSpan={6} className="mp-feedback-cell">
            <div className="mp-feedback-panel">
              <div className="mp-feedback-panel-header">
                <span className="mp-feedback-count">Feedback ({reviews.length})</span>
                {reviews.length > 0 && (
                  <div className="mp-feedback-tags">
                    {FEEDBACK_TAGS.map(t => (
                      <button
                        key={t}
                        className={`mp-filter-tag ${activeTag === t ? 'active' : ''}`}
                        onClick={() => handleTagChange(t)}
                      >{t}</button>
                    ))}
                  </div>
                )}
              </div>
              {reviewsLoading ? (
                <div className="mp-feedback-empty"><span>Loading feedback…</span></div>
              ) : reviews.length > 0 ? (
                <div className="mp-feedback-list">
                  {reviews.map(fb => (
                    <FeedbackCard
                      key={fb._id}
                      fb={fb}
                      productId={product._id}
                      onReplyAdded={handleReplyAdded}
                    />
                  ))}
                </div>
              ) : (
                <div className="mp-feedback-empty">
                  <span className="mp-feedback-empty-icon">💬</span>
                  <span>No feedback yet for this product.</span>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// ── New Submission Modal steps ────────────────────────────────────────────────

function StepBasics({ form, setForm }) {
  return (
    <div className="mp-step">
      <h3 className="mp-step-title">Tell us about your product</h3>
      <p className="mp-step-sub">Basic info helps us match you with the right reviewers.</p>

      <div className="mp-form-group">
        <label className="mp-label">PRODUCT NAME <span className="mp-req">*</span></label>
        <input
          className="mp-input"
          placeholder="FocusDock"
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          maxLength={40}
        />
        <span className="mp-char-count">{form.name.length} / 40 characters</span>
      </div>

      <div className="mp-form-group">
        <label className="mp-label">TAGLINE <span className="mp-req">*</span></label>
        <input
          className="mp-input"
          placeholder="A distraction-free workspace for solo builders"
          value={form.tagline}
          onChange={e => setForm(f => ({ ...f, tagline: e.target.value }))}
          maxLength={80}
        />
        <span className="mp-char-count">{form.tagline.length} / 80 characters</span>
      </div>

      <div className="mp-form-group">
        <label className="mp-label">DESCRIPTION <span className="mp-optional">(recommended)</span></label>
        <textarea
          className="mp-textarea"
          placeholder="What problem does it solve? Who is it for? What makes it different?"
          rows={4}
          value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
        />
      </div>

      <div className="mp-form-group">
        <label className="mp-label">CATEGORY <span className="mp-req">*</span></label>
        <div className="mp-category-grid">
          {CATEGORIES.map(c => (
            <button
              key={c.id}
              className={`mp-cat-btn ${form.category === c.id ? 'selected' : ''}`}
              onClick={() => setForm(f => ({ ...f, category: c.id }))}
            >
              <span className="mp-cat-icon">{c.icon}</span>
              <span className="mp-cat-label">{c.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mp-form-group">
        <label className="mp-label">BUILD STAGE <span className="mp-req">*</span></label>
        <div className="mp-stage-pills">
          {BUILD_STAGES.map(s => (
            <button
              key={s}
              className={`mp-stage-pill ${form.buildStage === s ? 'selected' : ''}`}
              onClick={() => setForm(f => ({ ...f, buildStage: s }))}
            >{s}</button>
          ))}
        </div>
        <p className="mp-hint">This helps reviewers calibrate — a beta gets different feedback than a live product.</p>
      </div>
    </div>
  );
}

function StepFocus({ form, setForm }) {
  const toggle = (id) => {
    setForm(f => {
      const selected = f.focusAreas.includes(id)
        ? f.focusAreas.filter(x => x !== id)
        : f.focusAreas.length < 3 ? [...f.focusAreas, id] : f.focusAreas;
      return { ...f, focusAreas: selected };
    });
  };

  return (
    <div className="mp-step">
      <h3 className="mp-step-title">What do you want to learn?</h3>
      <p className="mp-step-sub">Choose up to 3 focus areas. More specific = more useful feedback.</p>

      <div className="mp-form-group">
        <label className="mp-label">PRIMARY FEEDBACK FOCUS <span className="mp-req">*</span></label>
        <div className="mp-focus-grid">
          {FOCUS_AREAS.map(fa => (
            <label key={fa.id} className={`mp-focus-card ${form.focusAreas.includes(fa.id) ? 'selected' : ''}`}>
              <input
                type="checkbox"
                className="mp-focus-checkbox"
                checked={form.focusAreas.includes(fa.id)}
                onChange={() => toggle(fa.id)}
              />
              <div className="mp-focus-text">
                <div className="mp-focus-title">{fa.title}</div>
                <div className="mp-focus-desc">{fa.desc}</div>
              </div>
            </label>
          ))}
        </div>
        <p className="mp-char-count">Select up to 3 areas. {form.focusAreas.length} selected</p>
      </div>

      <div className="mp-form-group">
        <label className="mp-label">SPECIFIC QUESTION FOR REVIEWERS <span className="mp-optional">(optional)</span></label>
        <input
          className="mp-input"
          placeholder="e.g. 'Would you switch from Notion to this for daily task tracking?'"
          value={form.specificQuestion}
          onChange={e => setForm(f => ({ ...f, specificQuestion: e.target.value }))}
        />
      </div>

      <div className="mp-form-group">
        <label className="mp-label">TARGET REVIEWER TYPE <span className="mp-optional">(optional)</span></label>
        <div className="mp-reviewer-pills">
          {REVIEWER_TYPES.map(rt => (
            <button
              key={rt}
              className={`mp-reviewer-pill ${form.reviewerType === rt ? 'selected' : ''}`}
              onClick={() => setForm(f => ({ ...f, reviewerType: rt === f.reviewerType ? '' : rt }))}
            >{rt}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

function StepLinks({ form, setForm }) {
  const fileInputRef = React.useRef(null);

  const addFiles = (files) => {
    const valid = Array.from(files).filter(
      f => f.type.startsWith('image/') && f.size <= 5 * 1024 * 1024
    );
    setForm(f => ({ ...f, screenshots: [...f.screenshots, ...valid].slice(0, 5) }));
  };

  const formatSize = (bytes) =>
    bytes < 1024 * 1024
      ? `${Math.round(bytes / 1024)} KB`
      : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

  return (
    <div className="mp-step">
      <h3 className="mp-step-title">Links & media</h3>
      <p className="mp-step-sub">At minimum, add your live URL. A demo video makes feedback 2.4× more specific.</p>

      <div className="mp-links-grid">
        <div className="mp-form-group">
          <label className="mp-label">PRODUCT URL <span className="mp-req">*</span></label>
          <div className="mp-input-prefix">
            <span className="mp-prefix">https://</span>
            <input
              className= "mp-input-prefixed"
              placeholder="focusdock.app"
              value={form.productUrl}
              onChange={e => setForm(f => ({ ...f, productUrl: e.target.value }))}
            />
          </div>
        </div>
        <div className="mp-form-group">
          <label className="mp-label">DEMO VIDEO <span className="mp-optional">(recommended)</span></label>
          <div className="mp-input-prefix">
            <span className="mp-prefix">https://</span>
            <input
              className="mp-input mp-input-prefixed"
              placeholder="loom.com/share/..."
              value={form.demoVideo}
              onChange={e => setForm(f => ({ ...f, demoVideo: e.target.value }))}
            />
          </div>
          <span className="mp-hint">Loom, YouTube, or any public link.</span>
        </div>
        <div className="mp-form-group">
          <label className="mp-label">GITHUB <span className="mp-optional">(optional)</span></label>
          <div className="mp-input-prefix">
            <span className="mp-prefix">github.com/</span>
            <input
              className="mp-input mp-input-prefixed"
              placeholder="username/repo"
              value={form.githubUrl}
              onChange={e => setForm(f => ({ ...f, githubUrl: e.target.value }))}
            />
          </div>
        </div>
        <div className="mp-form-group">
          <label className="mp-label">PRODUCT HUNT <span className="mp-optional">(optional)</span></label>
          <div className="mp-input-prefix">
            <span className="mp-prefix">ph.com/posts/</span>
            <input
              className="mp-input mp-input-prefixed"
              placeholder="your-product"
              value={form.productHuntUrl}
              onChange={e => setForm(f => ({ ...f, productHuntUrl: e.target.value }))}
            />
          </div>
        </div>
      </div>

      <div className="mp-form-group">
        <label className="mp-label">SCREENSHOTS <span className="mp-optional">(up to 5)</span></label>
        <div
          className="mp-upload-zone"
          onClick={() => fileInputRef.current?.click()}
          onDrop={e => { e.preventDefault(); addFiles(e.dataTransfer.files); }}
          onDragOver={e => e.preventDefault()}
        >
          <div className="mp-upload-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>
          <p className="mp-upload-text">Drop screenshots or click to browse</p>
          <p className="mp-upload-hint">PNG, JPG up to 5MB · Ideal: 1280 × 800</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg"
            multiple
            style={{ display: 'none' }}
            onChange={e => { addFiles(e.target.files); e.target.value = ''; }}
          />
        </div>
        {form.screenshots.length > 0 && (
          <div className="mp-screenshot-list">
            {form.screenshots.map((file, i) => (
              <div key={i} className="mp-screenshot-item">
                <span className="mp-screenshot-dot" />
                <div className="mp-screenshot-info">
                  <span className="mp-screenshot-name">{file.name}</span>
                  <span className="mp-screenshot-size">{formatSize(file.size)}</span>
                </div>
                <button
                  className="mp-screenshot-remove"
                  onClick={() => setForm(f => ({ ...f, screenshots: f.screenshots.filter((_, j) => j !== i) }))}
                >✕</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StepReview({ form, onEdit }) {
  const categoryLabel = CATEGORIES.find(c => c.id === form.category)?.label;

  return (
    <div className="mp-step">
      <h3 className="mp-step-title">Review your submission</h3>
      <p className="mp-step-sub">Double-check everything looks good. You can edit any section before submitting.</p>

      <div className="mp-review-section">
        <div className="mp-review-section-header">
          <span className="mp-review-section-name">PRODUCT BASICS</span>
          <button className="mp-review-edit" onClick={() => onEdit(1)}>Edit</button>
        </div>
        <div className="mp-review-field">
          <span className="mp-review-label">PRODUCT NAME</span>
          <span className="mp-review-val">{form.name || <span className="mp-not-set">Not set</span>}</span>
        </div>
        <div className="mp-review-field">
          <span className="mp-review-label">TAGLINE</span>
          <span className="mp-review-val">{form.tagline || <span className="mp-not-set">Not set</span>}</span>
        </div>
        <div className="mp-review-row">
          <div className="mp-review-field">
            <span className="mp-review-label">CATEGORY</span>
            <span className={`mp-review-val ${!categoryLabel ? 'mp-not-set' : ''}`}>
              {categoryLabel || 'Not selected'}
            </span>
          </div>
          <div className="mp-review-field">
            <span className="mp-review-label">BUILD STAGE</span>
            <span className={`mp-review-val ${!form.buildStage ? 'mp-not-set-orange' : ''}`}>
              {form.buildStage || 'NOT SELECTED'}
            </span>
          </div>
        </div>
      </div>

      <div className="mp-review-section">
        <div className="mp-review-section-header">
          <span className="mp-review-section-name">FEEDBACK FOCUS</span>
          <button className="mp-review-edit" onClick={() => onEdit(2)}>Edit</button>
        </div>
        <div className="mp-review-field">
          <span className="mp-review-label">PRIMARY FOCUS AREAS</span>
          <span className={`mp-review-val ${form.focusAreas.length === 0 ? 'mp-not-set' : ''}`}>
            {form.focusAreas.length > 0 ? form.focusAreas.join(', ') : 'No focus areas selected'}
          </span>
        </div>
        <div className="mp-review-tip">
          <span className="mp-tip-icon">💡</span>
          Tip: Reviewers will prioritize these areas when giving feedback. The more specific you are, the more actionable their comments will be.
        </div>
      </div>

      <div className="mp-review-section">
        <div className="mp-review-section-header">
          <span className="mp-review-section-name">LINKS</span>
          <button className="mp-review-edit" onClick={() => onEdit(3)}>Edit</button>
        </div>
        <div className="mp-review-field">
          <span className="mp-review-label">PRODUCT URL</span>
          <span className={`mp-review-val ${form.productUrl ? 'mp-link' : 'mp-not-set'}`}>
            {form.productUrl ? `https://${form.productUrl}` : 'Not provided'}
          </span>
        </div>
        <div className="mp-review-field">
          <span className="mp-review-label">DEMO VIDEO</span>
          <span className={`mp-review-val ${form.demoVideo ? 'mp-link' : 'mp-not-set'}`}>
            {form.demoVideo ? `https://${form.demoVideo}` : 'Not provided'}
          </span>
        </div>
      </div>

      <div className="mp-review-timeline">
        <div className="mp-review-timeline-title">What happens after you submit</div>
        {[
          { label: 'Your product goes into the review queue',           sub: "We'll match you with builders in your category",            time: 'Instant',    icon: '✅' },
          { label: 'Matched to 8–10 reviewers based on your focus areas', sub: "Active builders who've reviewed similar products",          time: '2–4 hours',  icon: '✅' },
          { label: 'First reviews start coming in',                     sub: "You'll get email + dashboard notifications.",               time: '6–12 hours', icon: '✅' },
          { label: 'Full review round completes',                       sub: 'Most products get 8–10 detailed reviews.',                  time: '24–48 hours', icon: '✅' },
        ].map((item, i) => (
          <div key={i} className="mp-timeline-item">
            <span className="mp-timeline-icon">{item.icon}</span>
            <div className="mp-timeline-info">
              <div className="mp-timeline-label">{item.label}</div>
              <div className="mp-timeline-sub">{item.sub}</div>
            </div>
            <span className="mp-timeline-time">{item.time}</span>
          </div>
        ))}
        <p className="mp-pro-tip">Pro tip: Responding to reviews within 24 hours increases your engagement score and helps you get featured on the homepage.</p>
      </div>
    </div>
  );
}

// ── Submission Modal ──────────────────────────────────────────────────────────

function NewSubmissionModal({ onClose, onCreated }) {
  const [step,       setStep]       = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState('');
  const [form,       setForm]       = useState({
    name: '', tagline: '', description: '', category: '', buildStage: '',
    focusAreas: [], specificQuestion: '', reviewerType: '',
    productUrl: '', demoVideo: '', githubUrl: '', productHuntUrl: '', screenshots: [],
  });

  const STEPS = ['Basics', 'Focus', 'Links', 'Review'];

  const handleSubmitForFeedback = async () => {
    setError('');
    if (!form.name || !form.tagline || !form.productUrl) {
      setError('Product name, tagline, and URL are required.');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        name:             form.name,
        tagline:          form.tagline,
        description:      form.description,
        category:         form.category,
        buildStage:       form.buildStage,
        feedbackFocus:    form.focusAreas,
        specificQuestion: form.specificQuestion,
        productUrl:       `https://${form.productUrl}`,
        ...(form.demoVideo && { demoVideo: `https://${form.demoVideo}` }),
        status:           'in_review',
      };
      const res = await api.post('/products', payload);
      onCreated?.(res.data);
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!form.name || !form.tagline || !form.productUrl) return;
    try {
      const payload = {
        name:             form.name,
        tagline:          form.tagline,
        description:      form.description,
        category:         form.category,
        buildStage:       form.buildStage,
        feedbackFocus:    form.focusAreas,
        specificQuestion: form.specificQuestion,
        productUrl:       `https://${form.productUrl}`,
        ...(form.demoVideo && { demoVideo: `https://${form.demoVideo}` }),
        status:           'draft',
      };
      const res = await api.post('/products', payload);
      onCreated?.(res.data);
      onClose();
    } catch (err) {
      console.error('Save draft failed', err);
    }
  };

  return (
    <div className="mp-modal-overlay" onClick={onClose}>
      <div className="mp-modal" onClick={e => e.stopPropagation()}>
        <div className="mp-modal-header">
          <span className="mp-modal-title">New submission</span>
          <span className="mp-modal-step-info">Step {step} of 4</span>
          <button className="mp-modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="mp-step-bar">
          {STEPS.map((s, i) => (
            <React.Fragment key={s}>
              <div
                className={`mp-step-item ${i + 1 < step ? 'done' : ''} ${i + 1 === step ? 'active' : ''}`}
                onClick={() => i + 1 < step && setStep(i + 1)}
              >
                <div className="mp-step-circle">{i + 1 < step ? '✓' : i + 1}</div>
                <span className="mp-step-label">{s}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`mp-step-connector${i + 1 < step ? ' done' : ''}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="mp-modal-body">
          {step === 1 && <StepBasics form={form} setForm={setForm} />}
          {step === 2 && <StepFocus  form={form} setForm={setForm} />}
          {step === 3 && <StepLinks  form={form} setForm={setForm} />}
          {step === 4 && <StepReview form={form} onEdit={setStep} />}
          {error && <p className="mp-submit-error">{error}</p>}
        </div>

        <div className="mp-modal-footer">
          <span className="mp-autosave">Auto-saved</span>
          {step > 1 && (
            <button className="mp-btn-ghost" onClick={() => setStep(s => s - 1)}>Back</button>
          )}
          <button className="mp-btn-ghost" onClick={handleSaveDraft}>Save draft</button>
          {step < 4 ? (
            <button className="mp-btn-primary" onClick={() => setStep(s => s + 1)}>Continue</button>
          ) : (
            <button className="mp-btn-submit" onClick={handleSubmitForFeedback} disabled={submitting}>
              {submitting ? 'Submitting…' : 'Submit for feedback'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function MyProductsPage() {
  const [activeTab,   setActiveTab]   = useState('all');
  const [expandedId,  setExpandedId]  = useState(null);
  const [showModal,   setShowModal]   = useState(false);
  const [products,    setProducts]    = useState([]);
  const [stats,       setStats]       = useState({
    totalProducts: 0, totalReviews: 0, avgRating: 0,
    productsThisMonth: 0, reviewsThisMonth: 0,
    ratingChange: 0, responseRate: 0, responseRateChange: 0,
    alert: null, // { productName, unreadReviews, topThemeCount, topTheme }
  });
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [prodRes, statsRes] = await Promise.all([
          api.get('/products/my'),
          api.get('/products/stats'),
        ]);
        setProducts(prodRes.data  || []);
        setStats(prev => ({ ...prev, ...(statsRes.data || {}) }));
      } catch (err) {
        console.error('Failed to load products', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleProductUpdate = (updated) => {
    setProducts(prev => prev.map(p => p._id === updated._id ? { ...p, ...updated } : p));
  };

  const handleProductCreated = (newProduct) => {
    setProducts(prev => [newProduct, ...prev]);
    setStats(prev => ({ ...prev, totalProducts: prev.totalProducts + 1 }));
  };

  const counts = {
    all:      products.length,
    inreview: products.filter(p => p.status === 'in_review').length,
    launched: products.filter(p => p.status === 'launched').length,
    draft:    products.filter(p => p.status === 'draft').length,
    archived: products.filter(p => p.status === 'archived').length,
  };

  const tabs = [
    { id: 'all',      label: `All (${counts.all})` },
    { id: 'inreview', label: `In review (${counts.inreview})` },
    { id: 'launched', label: `Launched (${counts.launched})` },
    { id: 'draft',    label: `Draft (${counts.draft})` },
    { id: 'archived', label: `Archived (${counts.archived})` },
  ];

  const filteredProducts = products.filter(p => {
    if (activeTab === 'all')      return p.status !== 'archived';
    if (activeTab === 'inreview') return p.status === 'in_review';
    if (activeTab === 'launched') return p.status === 'launched';
    if (activeTab === 'draft')    return p.status === 'draft';
    if (activeTab === 'archived') return p.status === 'archived';
    return true;
  });

  const bannerAlert = stats.alert || null;

  return (
    <PrivateLayout>
      <div className="mp-page">
        <div className="mp-topbar">
          <h1 className="mp-topbar-title">My products</h1>
          <div className="mp-topbar-actions">
            <button className="mp-action-btn-ghost">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
              </svg>
              Filter
            </button>
            <button className="mp-action-btn-ghost">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 16V4m0 0L4 7m3-3l3 3"/><path d="M17 8v12m0 0l3-3m-3 3l-3-3"/>
              </svg>
              Sort
            </button>
            <button className="mp-action-btn-ghost">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Export
            </button>
            <button className="mp-action-btn-primary" onClick={() => setShowModal(true)}>
              + New submission
            </button>
          </div>
        </div>

        {bannerAlert && (
          <div className="mp-alert-banner">
            <span className="mp-alert-dot">•</span>
            <span className="mp-alert-text">
              <strong>{bannerAlert.productName}</strong> has {bannerAlert.unreadReviews} unread review{bannerAlert.unreadReviews !== 1 ? 's' : ''}
              {bannerAlert.topThemeCount && bannerAlert.topTheme
                ? ` — ${bannerAlert.topThemeCount} mention ${bannerAlert.topTheme}`
                : ''
              }. Responding within 24h boosts engagement.
            </span>
            <button className="mp-alert-view">View</button>
          </div>
        )}

        <div className="mp-stats-row">
          <StatCard
            label="TOTAL PRODUCTS"
            value={String(stats.totalProducts)}
            sub={stats.productsThisMonth > 0 ? `+${stats.productsThisMonth} this month` : 'All time'}
            iconBg="#ede9fe"
            icon={<CubeIcon />}
          />
          <StatCard
            label="TOTAL REVIEWS"
            value={String(stats.totalReviews)}
            sub={stats.reviewsThisMonth > 0 ? `+${stats.reviewsThisMonth} this month` : 'Across all products'}
            iconBg="#d1fae5"
            icon={<DollarIcon />}
          />
          <StatCard
            label="AVG. RATING"
            value={stats.avgRating > 0 ? stats.avgRating.toFixed(1) : '—'}
            sub={stats.ratingChange ? `↑${stats.ratingChange} vs last round` : 'Across all products'}
            iconBg="#fef3c7"
            icon={<StarOutlineIcon />}
          />
          <StatCard
            label="RESPONSE RATE"
            value={stats.responseRate > 0 ? `${stats.responseRate}%` : '—'}
            sub={stats.responseRateChange > 0 ? `↑${stats.responseRateChange}% this week` : 'Coming soon'}
            iconBg="#ccfbf1"
            icon={<TrendingUpIcon />}
          />
        </div>

        <div className="mp-tabs">
          {tabs.map(t => (
            <button
              key={t.id}
              className={`mp-tab ${activeTab === t.id ? 'active' : ''}`}
              onClick={() => setActiveTab(t.id)}
            >{t.label}</button>
          ))}
        </div>

        <div className="mp-table-wrap">
          {loading ? (
            <div className="mp-loading">Loading your products…</div>
          ) : (
            <table className="mp-table">
              <colgroup>
                <col /><col /><col /><col /><col /><col />
              </colgroup>
              <thead>
                <tr className="mp-thead-row">
                  <th className="mp-th">PRODUCT</th>
                  <th className="mp-th">STAGE</th>
                  <th className="mp-th">STATUS</th>
                  <th className="mp-th">REVIEWS</th>
                  <th className="mp-th">RATING</th>
                  <th className="mp-th">ACTION</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="mp-empty-row">No products found.</td>
                  </tr>
                ) : filteredProducts.map(p => (
                  <ProductRow
                    key={p._id}
                    product={p}
                    expanded={expandedId === p._id}
                    onToggle={() => setExpandedId(expandedId === p._id ? null : p._id)}
                    onProductUpdate={handleProductUpdate}
                  />
                ))}
              </tbody>
            </table>
          )}
        </div>

        {showModal && (
          <NewSubmissionModal
            onClose={() => setShowModal(false)}
            onCreated={handleProductCreated}
          />
        )}
      </div>
    </PrivateLayout>
  );
}
