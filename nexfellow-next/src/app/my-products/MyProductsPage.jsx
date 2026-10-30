'use client';
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
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
  if (status === 'launched')  return { text: 'LIVE',      color: 'teal'   };
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

// ── Submission form helpers ───────────────────────────────────────────────────

const EMPTY_FORM = {
  name: '', tagline: '', description: '', category: '', buildStage: '',
  focusAreas: [], specificQuestion: '', reviewerType: '',
  productUrl: '', demoVideo: '', githubUrl: '', productHuntUrl: '', screenshots: [],
  logo: null, logoPreview: null,
};

// URL inputs render a fixed "https://" prefix, so people often paste it twice.
const stripProtocol = (v) => (v || '').trim().replace(/^https?:\/\//i, '');
const toHttpsUrl    = (v) => (stripProtocol(v) ? `https://${stripProtocol(v)}` : '');

function isValidUrl(v) {
  try {
    return new URL(toHttpsUrl(v)).hostname.includes('.');
  } catch {
    return false;
  }
}

function formFromProduct(p) {
  return {
    ...EMPTY_FORM,
    name:             p.name || '',
    tagline:          p.tagline || '',
    description:      p.description || '',
    category:         p.category || '',
    buildStage:       p.buildStage || '',
    focusAreas:       p.feedbackFocus || [],
    specificQuestion: p.specificQuestion || '',
    productUrl:       stripProtocol(p.productUrl),
    demoVideo:        stripProtocol(p.demoVideo),
    logoPreview:      p.logo || null,
  };
}

// Category/build stage are enums on the backend, so leave them out until picked.
function buildPayload(form) {
  return {
    name:             form.name.trim(),
    tagline:          form.tagline.trim(),
    description:      form.description.trim(),
    ...(form.category   && { category:   form.category }),
    ...(form.buildStage && { buildStage: form.buildStage }),
    feedbackFocus:    form.focusAreas,
    specificQuestion: form.specificQuestion.trim(),
    productUrl:       toHttpsUrl(form.productUrl),
    demoVideo:        toHttpsUrl(form.demoVideo),
  };
}

function validateStep(step, form) {
  const errors = {};
  if (step === 1) {
    if (!form.name.trim())    errors.name       = 'Product name is required.';
    if (!form.tagline.trim()) errors.tagline    = 'Tagline is required.';
    if (!form.category)       errors.category   = 'Choose a category.';
    if (!form.buildStage)     errors.buildStage = 'Choose a build stage.';
  }
  if (step === 2 && form.focusAreas.length === 0) {
    errors.focusAreas = 'Choose at least one focus area.';
  }
  if (step === 3) {
    if (!stripProtocol(form.productUrl))  errors.productUrl = 'Product URL is required.';
    else if (!isValidUrl(form.productUrl)) errors.productUrl = 'Enter a valid URL, like focusdock.app';
    if (stripProtocol(form.demoVideo) && !isValidUrl(form.demoVideo)) {
      errors.demoVideo = 'Enter a valid URL, like loom.com/share/…';
    }
  }
  return errors;
}

function firstInvalidStep(form) {
  return [1, 2, 3].find(s => Object.keys(validateStep(s, form)).length > 0) || null;
}

// Unsent form progress lives in localStorage (one slot per draft, "new" for a
// fresh submission). Logo/screenshot Files can't be serialised, so they're skipped.
const LOCAL_DRAFT_FIELDS = [
  'name', 'tagline', 'description', 'category', 'buildStage',
  'specificQuestion', 'reviewerType', 'productUrl', 'demoVideo',
];
const localDraftKey = (productId) => `mpSubmissionDraft:${productId || 'new'}`;

function hasDraftContent(form) {
  return form.focusAreas.length > 0 || LOCAL_DRAFT_FIELDS.some(k => form[k].trim());
}

function readLocalDraft(productId) {
  try {
    const saved = JSON.parse(localStorage.getItem(localDraftKey(productId)));
    if (!saved?.form) return null;
    const form = {};
    for (const k of LOCAL_DRAFT_FIELDS) {
      if (typeof saved.form[k] === 'string') form[k] = saved.form[k];
    }
    if (Array.isArray(saved.form.focusAreas)) {
      form.focusAreas = saved.form.focusAreas.filter(id => FOCUS_AREAS.some(fa => fa.id === id)).slice(0, 3);
    }
    return { form, savedAt: Number(saved.savedAt) || 0 };
  } catch {
    return null;
  }
}

function writeLocalDraft(productId, form) {
  try {
    const data = { focusAreas: form.focusAreas };
    for (const k of LOCAL_DRAFT_FIELDS) data[k] = form[k];
    localStorage.setItem(localDraftKey(productId), JSON.stringify({ form: data, savedAt: Date.now() }));
    return true;
  } catch {
    return false;
  }
}

function clearLocalDraft(productId) {
  try { localStorage.removeItem(localDraftKey(productId)); } catch {}
}

function FieldError({ msg }) {
  return msg ? <span className="mp-field-error" role="alert">{msg}</span> : null;
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
          <div className="mp-fb-reply-compose-row">
            <div className="mp-fb-reply-me-avatar">ME</div>
            <textarea
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              placeholder="Write a reply..."
              className="mp-fb-reply-textarea"
              rows={3}
            />
          </div>
          <div className="mp-fb-reply-btns">
            <button className="mp-btn-ghost" onClick={() => setReplyOpen(false)}>Cancel</button>
            <button className="mp-btn-primary" onClick={handleReply} disabled={submitting}>
              {submitting ? 'Sending…' : (
                <>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 5 }}>
                    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                  </svg>
                  Send reply
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ProductRow({ product, expanded, onToggle, onProductUpdate, onDeleteRequest, onEditRequest }) {
  const [activeTag,      setActiveTag]      = useState('All');
  const [reviews,        setReviews]        = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsFetched, setReviewsFetched] = useState(false);
  const [actionLoading,  setActionLoading]  = useState(false);
  const [actionError,    setActionError]    = useState('');
  const [menuOpen,       setMenuOpen]       = useState(false);
  const [menuPos,        setMenuPos]        = useState({ top: 0, left: 0 });
  const [showGtmModal,   setShowGtmModal]   = useState(false);
  const menuBtnRef = useRef(null);

  const stageBadge  = getStageBadge(product);
  const statusBadge = getStatusBadge(product.status);
  const rating      = product.avgRating > 0 ? product.avgRating : null;
  const isBoosted   = product.boostedUntil && new Date(product.boostedUntil) > new Date();
  const boostable   = product.status === 'in_review' || product.status === 'launched';

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
    setActionError('');
    try {
      const res = await api.post(`/products/${product._id}/submit`);
      onProductUpdate?.({ ...product, ...res.data.product });
    } catch (err) {
      setActionError(err?.response?.data?.message || 'Submit failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResubmit = async (e) => {
    e.stopPropagation();
    setActionLoading(true);
    setActionError('');
    try {
      const res = await api.post(`/products/${product._id}/submit`);
      onProductUpdate?.({ ...product, ...res.data.product });
    } catch (err) {
      setActionError(err?.response?.data?.message || 'Re-submit failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBoost = async (e) => {
    e.stopPropagation();
    setActionLoading(true);
    setActionError('');
    try {
      const res = await api.post(`/products/${product._id}/boost`);
      onProductUpdate?.({ ...product, ...res.data.product });
    } catch (err) {
      setActionError(err?.response?.data?.message || 'Boost failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReplyAdded = (reviewId, newReplies) => {
    setReviews(prev => prev.map(r => r._id === reviewId ? { ...r, replies: newReplies } : r));
  };

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e) => {
      if (menuBtnRef.current && !menuBtnRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  return (
    <>
      <tr
        className={`mp-product-row ${expanded ? 'mp-product-row--expanded' : ''}`}
        onClick={onToggle}
      >
        <td className="mp-td mp-td-product">
          <div className="mp-prod-name">
            {product.name}
            {isBoosted && <span className="mp-boost-badge" title="Pinned at the top of Launches for 24h">🚀 Boosted</span>}
          </div>
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
              {product.status === 'draft' && (
                <button className="mp-action-edit" onClick={e => { e.stopPropagation(); onEditRequest?.(product); }}>
                  Edit
                </button>
              )}
              {product.status === 'draft' && (
                <button className="mp-action-submit" onClick={handleSubmit} disabled={actionLoading}>
                  {actionLoading ? '…' : 'Submit'}
                </button>
              )}
              {product.status === 'in_review' && (
                <span className="mp-status-label">In Review</span>
              )}
              {product.status === 'launched' && (
                <button className="mp-action-resubmit" onClick={handleResubmit} disabled={actionLoading}>
                  {actionLoading ? '…' : 'Re-submit'}
                </button>
              )}
              {(product.status === 'in_review' || product.status === 'launched') && (
                <button className="mp-action-analysis" onClick={e => { e.stopPropagation(); onToggle(); }}>
                  Analysis
                </button>
              )}
            </div>
            {actionError && <div className="mp-action-error">{actionError}</div>}
            <div className="mp-action-icons">
              <button className="mp-icon-btn" title="Analytics" onClick={e => { e.stopPropagation(); onToggle(); }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="20" x2="18" y2="10" />
                  <line x1="12" y1="20" x2="12" y2="4" />
                  <line x1="6"  y1="20" x2="6"  y2="14" />
                </svg>
              </button>
              <button
                ref={menuBtnRef}
                className="mp-icon-btn"
                title="More options"
                onClick={e => {
                  e.stopPropagation();
                  const btn = menuBtnRef.current;
                  let row = btn;
                  while (row && row.tagName !== 'TR') row = row.parentElement;
                  const rowRect = (row || btn).getBoundingClientRect();
                  const btnRect = btn.getBoundingClientRect();
                  setMenuPos({ top: rowRect.bottom + 2, right: window.innerWidth - btnRect.right });
                  setMenuOpen(v => !v);
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="5"  r="1.5" />
                  <circle cx="12" cy="12" r="1.5" />
                  <circle cx="12" cy="19" r="1.5" />
                </svg>
              </button>
              {menuOpen && createPortal(
                <div
                  className="mp-more-menu"
                  style={{ position: 'fixed', top: menuPos.top, right: menuPos.right, zIndex: 99999 }}
                >
                  {boostable && !isBoosted && (
                    <button
                      className="mp-more-menu-item"
                      onMouseDown={e => { e.stopPropagation(); setMenuOpen(false); handleBoost(e); }}
                    >
                      🚀 Boost (30 credits)
                    </button>
                  )}
                  {boostable && (
                    <button
                      className="mp-more-menu-item"
                      onMouseDown={e => { e.stopPropagation(); setMenuOpen(false); setShowGtmModal(true); }}
                    >
                      📊 GTM report (25 credits)
                    </button>
                  )}
                  <button
                    className="mp-more-menu-item mp-more-menu-item--danger"
                    onMouseDown={e => { e.stopPropagation(); setMenuOpen(false); onDeleteRequest?.(product); }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                      <path d="M10 11v6M14 11v6"/>
                      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                    </svg>
                    Delete
                  </button>
                </div>,
                document.body
              )}
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
                  <div className="mp-feedback-empty-icon-wrap">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                  </div>
                  <p className="mp-feedback-empty-title">No feedback yet</p>
                  <p className="mp-feedback-empty-sub">This product hasn't received any reviews yet. Submit it to get feedback from the community.</p>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}

      {showGtmModal && (
        <GtmReportModal product={product} onClose={() => setShowGtmModal(false)} />
      )}
    </>
  );
}

// ── GTM Report modal (shared by desktop + mobile cards) ────────────────────────

function GtmReportModal({ product, onClose }) {
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [report,  setReport]  = useState(null);

  useEffect(() => {
    let cancelled = false;
    api.get(`/products/${product._id}/gtm-report`)
      .then(res => { if (!cancelled) setReport(res.data); })
      .catch(err => { if (!cancelled) setError(err?.response?.data?.message || 'Failed to load GTM report'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [product._id]);

  return createPortal(
    <div className="mp-modal-overlay" onClick={onClose}>
      <div className="mp-modal mp-gtm-modal" onClick={e => e.stopPropagation()}>
        <div className="mp-modal-header">
          <span className="mp-modal-title">GTM Report — {product.name}</span>
          <button className="mp-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="mp-modal-body">
          {loading && <div className="mp-feedback-empty"><span>Generating report…</span></div>}
          {error && <div className="mp-action-error">{error}</div>}
          {report && (
            <div className="mp-gtm-body">
              <div className="mp-gtm-stats-grid">
                <div className="mp-gtm-stat">
                  <span className="mp-gtm-stat-value">{report.stats.avgRating > 0 ? `${report.stats.avgRating}★` : '—'}</span>
                  <span className="mp-gtm-stat-label">Avg rating</span>
                </div>
                <div className="mp-gtm-stat">
                  <span className="mp-gtm-stat-value">{report.stats.totalReviews}</span>
                  <span className="mp-gtm-stat-label">Reviews</span>
                </div>
                <div className="mp-gtm-stat">
                  <span className="mp-gtm-stat-value">{report.product.upvoteCount}</span>
                  <span className="mp-gtm-stat-label">Upvotes</span>
                </div>
              </div>

              {report.benchmark.sampleSize > 0 && (
                <p className="mp-gtm-benchmark">
                  Category benchmark ({report.product.category}, {report.benchmark.sampleSize} products):{' '}
                  {report.benchmark.avgRating}★ avg rating · {report.benchmark.avgUpvotes} avg upvotes
                </p>
              )}

              {report.insights.length > 0 && (
                <div className="mp-gtm-section">
                  <h4 className="mp-gtm-section-title">Insights</h4>
                  <ul className="mp-gtm-insight-list">
                    {report.insights.map((ins, i) => <li key={i}>{ins}</li>)}
                  </ul>
                </div>
              )}

              {report.tagCounts.length > 0 && (
                <div className="mp-gtm-section">
                  <h4 className="mp-gtm-section-title">Feedback themes</h4>
                  <div className="mp-feedback-tags">
                    {report.tagCounts.map(t => (
                      <span key={t.tag} className="mp-filter-tag active">{t.tag} ({t.count})</span>
                    ))}
                  </div>
                </div>
              )}

              {report.topReview && (
                <div className="mp-gtm-section">
                  <h4 className="mp-gtm-section-title">Most helpful review</h4>
                  <p className="mp-gtm-top-review">
                    &ldquo;{report.topReview.content}&rdquo; — {report.topReview.rating}★, {report.topReview.helpfulCount} helpful votes
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

// ── New Submission Modal steps ────────────────────────────────────────────────

function StepBasics({ form, setForm, errors }) {
  return (
    <div className="mp-step">
      <h3 className="mp-step-title">Tell us about your product</h3>
      <p className="mp-step-sub">Basic info helps us match you with the right reviewers.</p>

      <div className="mp-form-group">
        <label className="mp-label">PRODUCT NAME <span className="mp-req">*</span></label>
        <input
          className={`mp-input${errors.name ? ' mp-input--error' : ''}`}
          placeholder="FocusDock"
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          maxLength={40}
          aria-invalid={!!errors.name}
        />
        <FieldError msg={errors.name} />
        <span className="mp-char-count">{form.name.length} / 40 characters</span>
      </div>

      <div className="mp-form-group">
        <label className="mp-label">TAGLINE <span className="mp-req">*</span></label>
        <input
          className={`mp-input${errors.tagline ? ' mp-input--error' : ''}`}
          placeholder="A distraction-free workspace for solo builders"
          value={form.tagline}
          onChange={e => setForm(f => ({ ...f, tagline: e.target.value }))}
          maxLength={80}
          aria-invalid={!!errors.tagline}
        />
        <FieldError msg={errors.tagline} />
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
        <div className="mp-category-pills">
          {CATEGORIES.map(c => (
            <button
              key={c.id}
              className={`mp-cat-pill ${form.category === c.id ? 'selected' : ''}`}
              onClick={() => setForm(f => ({ ...f, category: c.id }))}
            >
              {c.label}
            </button>
          ))}
        </div>
        <FieldError msg={errors.category} />
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
        <FieldError msg={errors.buildStage} />
        <p className="mp-hint">This helps reviewers calibrate — a beta gets different feedback than a live product.</p>
      </div>
    </div>
  );
}

function StepFocus({ form, setForm, errors }) {
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
        <FieldError msg={errors.focusAreas} />
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

function StepLinks({ form, setForm, errors }) {
  const fileInputRef = React.useRef(null);
  const logoInputRef = React.useRef(null);

  const addFiles = (files) => {
    const valid = Array.from(files).filter(
      f => f.type.startsWith('image/') && f.size <= 5 * 1024 * 1024
    );
    setForm(f => ({ ...f, screenshots: [...f.screenshots, ...valid].slice(0, 5) }));
  };

  const handleLogoFile = (file) => {
    if (!file || !file.type.startsWith('image/') || file.size > 2 * 1024 * 1024) return;
    const url = URL.createObjectURL(file);
    setForm(f => ({ ...f, logo: file, logoPreview: url }));
  };

  const formatSize = (bytes) =>
    bytes < 1024 * 1024
      ? `${Math.round(bytes / 1024)} KB`
      : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

  return (
    <div className="mp-step">
      <h3 className="mp-step-title">Links & media</h3>
      <p className="mp-step-sub">At minimum, add your live URL. A demo video makes feedback 2.4× more specific.</p>

      <div className="mp-form-group">
        <label className="mp-label">PRODUCT LOGO <span className="mp-optional">(optional)</span></label>
        <div className="mp-logo-upload-row">
          <div
            className="mp-logo-dropzone"
            onClick={() => logoInputRef.current?.click()}
            onDrop={e => { e.preventDefault(); handleLogoFile(e.dataTransfer.files[0]); }}
            onDragOver={e => e.preventDefault()}
          >
            {form.logoPreview ? (
              <img src={form.logoPreview} alt="Logo preview" className="mp-logo-preview-img" />
            ) : (
              <div className="mp-logo-placeholder">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="3" ry="3"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
              </div>
            )}
            <input
              ref={logoInputRef}
              type="file"
              accept="image/png,image/jpeg,image/svg+xml,image/webp"
              style={{ display: 'none' }}
              onChange={e => { handleLogoFile(e.target.files[0]); e.target.value = ''; }}
            />
          </div>
          <div className="mp-logo-info">
            <p className="mp-logo-info-text">Upload your product logo</p>
            <p className="mp-logo-info-hint">PNG, JPG, SVG or WebP · Max 2MB · Ideal: 256 × 256</p>
            {form.logo && (
              <div className="mp-logo-file-row">
                <span className="mp-logo-file-name">{form.logo.name}</span>
                <button
                  className="mp-screenshot-remove"
                  onClick={() => setForm(f => ({ ...f, logo: null, logoPreview: null }))}
                >✕</button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mp-links-grid">
        <div className="mp-form-group">
          <label className="mp-label">PRODUCT URL <span className="mp-req">*</span></label>
          <div className={`mp-input-prefix${errors.productUrl ? ' mp-input--error' : ''}`}>
            <span className="mp-prefix">https://</span>
            <input
              className= "mp-input-prefixed"
              placeholder="focusdock.app"
              value={form.productUrl}
              onChange={e => setForm(f => ({ ...f, productUrl: e.target.value }))}
              aria-invalid={!!errors.productUrl}
            />
          </div>
          <FieldError msg={errors.productUrl} />
        </div>
        <div className="mp-form-group">
          <label className="mp-label">DEMO VIDEO <span className="mp-optional">(recommended)</span></label>
          <div className={`mp-input-prefix${errors.demoVideo ? ' mp-input--error' : ''}`}>
            <span className="mp-prefix">https://</span>
            <input
              className="mp-input mp-input-prefixed"
              placeholder="loom.com/share/..."
              value={form.demoVideo}
              onChange={e => setForm(f => ({ ...f, demoVideo: e.target.value }))}
              aria-invalid={!!errors.demoVideo}
            />
          </div>
          <FieldError msg={errors.demoVideo} />
          <span className="mp-hint">Loom, YouTube, or any public link.</span>
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
        {form.logoPreview && (
          <div className="mp-review-field">
            <span className="mp-review-label">LOGO</span>
            <img src={form.logoPreview} alt="Product logo" className="mp-review-logo" />
          </div>
        )}
        <div className="mp-review-field">
          <span className="mp-review-label">PRODUCT URL</span>
          <span className={`mp-review-val ${toHttpsUrl(form.productUrl) ? 'mp-link' : 'mp-not-set'}`}>
            {toHttpsUrl(form.productUrl) || 'Not provided'}
          </span>
        </div>
        <div className="mp-review-field">
          <span className="mp-review-label">DEMO VIDEO</span>
          <span className={`mp-review-val ${toHttpsUrl(form.demoVideo) ? 'mp-link' : 'mp-not-set'}`}>
            {toHttpsUrl(form.demoVideo) || 'Not provided'}
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

function NewSubmissionModal({ product, onClose, onSaved }) {
  const baseForm = () => (product ? formFromProduct(product) : EMPTY_FORM);

  // Restore progress autosaved on this device, unless the server copy is newer.
  const [initial] = useState(() => {
    const local = readLocalDraft(product?._id);
    const serverTime = product ? new Date(product.updatedAt).getTime() : 0;
    if (local && local.savedAt > serverTime) {
      const restoredForm = { ...baseForm(), ...local.form };
      if (hasDraftContent(restoredForm)) return { form: restoredForm, restored: true };
    }
    return { form: baseForm(), restored: false };
  });

  const [step,      setStep]      = useState(1);
  const [productId, setProductId] = useState(product?._id || null);
  const [saving,    setSaving]    = useState(null); // 'draft' | 'submit' | null
  const [error,     setError]     = useState('');
  const [flagged,   setFlagged]   = useState([]);   // fields flagged by the last Continue/Save attempt
  const [autosave,  setAutosave]  = useState(initial.restored ? 'restored' : 'idle');
  const [form,      setForm]      = useState(initial.form);
  const editedRef = useRef(false);
  const bodyRef   = useRef(null);

  const STEPS = ['Basics', 'Focus', 'Links', 'Review'];

  // Flagged fields stay red only until they're fixed.
  const stepErrors = validateStep(step, form);
  const errors = Object.fromEntries(flagged.filter(k => stepErrors[k]).map(k => [k, stepErrors[k]]));

  // Only the user's own edits are autosaved — not the prefill, a restore or a discard.
  const editForm = (updater) => {
    editedRef.current = true;
    setForm(updater);
  };

  useEffect(() => {
    if (!editedRef.current) return;
    if (!hasDraftContent(form)) {
      clearLocalDraft(productId);
      setAutosave('idle');
      return;
    }
    setAutosave(writeLocalDraft(productId, form) ? 'saved' : 'idle');
  }, [form, productId]);

  const scrollToFirstError = () => requestAnimationFrame(() => {
    bodyRef.current?.querySelector('.mp-field-error')?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  });

  const goToStep = (n) => {
    setFlagged([]);
    setStep(n);
  };

  const flagStep = (n) => {
    setStep(n);
    setFlagged(Object.keys(validateStep(n, form)));
    scrollToFirstError();
  };

  const handleContinue = () => {
    if (Object.keys(stepErrors).length > 0) return flagStep(step);
    goToStep(step + 1);
  };

  const handleDiscard = () => {
    clearLocalDraft(productId);
    editedRef.current = false;
    setForm(baseForm());
    setFlagged([]);
    setAutosave('idle');
  };

  const uploadLogoIfPresent = async (id) => {
    if (!form.logo) return null;
    const fd = new FormData();
    fd.append('logo', form.logo);
    try {
      const res = await api.post(`/products/${id}/logo`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data.logo;
    } catch (err) {
      console.error('Logo upload failed', err);
      return null;
    }
  };

  // Creates the draft on first save and updates it after that, so retrying a
  // failed submit never creates a second product.
  const persist = async () => {
    const payload = buildPayload(form);
    const res = productId
      ? await api.put(`/products/${productId}`, payload)
      : await api.post('/products', payload);
    let saved = res.data;
    clearLocalDraft(productId);
    editedRef.current = false;
    setAutosave('idle');
    setProductId(saved._id);
    const logo = await uploadLogoIfPresent(saved._id);
    if (logo) {
      saved = { ...saved, logo };
      setForm(f => ({ ...f, logo: null, logoPreview: logo }));
    }
    return saved;
  };

  const handleSubmitForFeedback = async () => {
    setError('');
    const invalidStep = firstInvalidStep(form);
    if (invalidStep) return flagStep(invalidStep);
    setSaving('submit');
    let saved = null;
    try {
      saved = await persist();
      // Sets status → in_review and launchedAt
      const submitRes = await api.post(`/products/${saved._id}/submit`);
      onSaved?.({ ...saved, ...submitRes.data.product });
      onClose();
    } catch (err) {
      // The save itself went through, so the product exists as a draft now.
      if (saved) onSaved?.(saved);
      const msg = err?.response?.data?.message || 'Submission failed. Please try again.';
      setError(saved ? `${msg} Your submission was saved as a draft.` : msg);
    } finally {
      setSaving(null);
    }
  };

  const handleSaveDraft = async () => {
    setError('');
    if (!form.name.trim()) {
      setStep(1);
      setFlagged(['name']);
      scrollToFirstError();
      return;
    }
    setSaving('draft');
    try {
      onSaved?.(await persist());
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not save your draft. Please try again.');
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="mp-modal-overlay" onClick={onClose}>
      <div className="mp-modal" onClick={e => e.stopPropagation()}>
        <div className="mp-modal-header">
          <span className="mp-modal-title">{product ? 'Edit draft' : 'New submission'}</span>
          <span className="mp-modal-step-info">Step {step} of 4</span>
          <button className="mp-modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="mp-step-bar">
          {STEPS.map((s, i) => (
            <React.Fragment key={s}>
              <div
                className={`mp-step-item ${i + 1 < step ? 'done' : ''} ${i + 1 === step ? 'active' : ''}`}
                onClick={() => i + 1 < step && goToStep(i + 1)}
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

        <div className="mp-modal-body" ref={bodyRef}>
          {step === 1 && <StepBasics form={form} setForm={editForm} errors={errors} />}
          {step === 2 && <StepFocus  form={form} setForm={editForm} errors={errors} />}
          {step === 3 && <StepLinks  form={form} setForm={editForm} errors={errors} />}
          {step === 4 && <StepReview form={form} onEdit={goToStep} />}
        </div>

        {error && <p className="mp-modal-error" role="alert">{error}</p>}

        <div className="mp-modal-footer">
          <span className="mp-autosave">
            {autosave === 'saved' && 'Auto-saved on this device'}
            {autosave === 'restored' && (
              <>
                Restored your unsaved progress ·{' '}
                <button className="mp-autosave-discard" onClick={handleDiscard}>Discard</button>
              </>
            )}
          </span>
          {step > 1 && (
            <button className="mp-btn-ghost" onClick={() => goToStep(step - 1)} disabled={!!saving}>Back</button>
          )}
          <button className="mp-btn-ghost" onClick={handleSaveDraft} disabled={!!saving}>
            {saving === 'draft' ? 'Saving…' : 'Save draft'}
          </button>
          {step < 4 ? (
            <button className="mp-btn-primary" onClick={handleContinue} disabled={!!saving}>Continue</button>
          ) : (
            <button className="mp-btn-submit" onClick={handleSubmitForFeedback} disabled={!!saving}>
              {saving === 'submit' ? 'Submitting…' : 'Submit for feedback'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Mobile Product Card ───────────────────────────────────────────────────────

function MobileProductCard({ product, expanded, onToggle, onProductUpdate, onDeleteRequest, onEditRequest }) {
  const [activeTag,      setActiveTag]      = useState('All');
  const [reviews,        setReviews]        = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsFetched, setReviewsFetched] = useState(false);
  const [actionLoading,  setActionLoading]  = useState(false);
  const [actionError,    setActionError]    = useState('');
  const [menuOpen,       setMenuOpen]       = useState(false);
  const [showGtmModal,   setShowGtmModal]   = useState(false);

  const stageBadge  = getStageBadge(product);
  const statusBadge = getStatusBadge(product.status);
  const rating      = product.avgRating > 0 ? product.avgRating : null;
  const isBoosted   = product.boostedUntil && new Date(product.boostedUntil) > new Date();
  const boostable   = product.status === 'in_review' || product.status === 'launched';
  const imgSrc      = product.logoUrl
    || (typeof product.logo === 'string' ? product.logo : product.logo?.url)
    || null;

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
    } catch {}
    finally { setReviewsLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.stopPropagation();
    setActionLoading(true); setActionError('');
    try {
      const res = await api.post(`/products/${product._id}/submit`);
      onProductUpdate?.({ ...product, ...res.data.product });
    } catch (err) {
      setActionError(err?.response?.data?.message || 'Submit failed');
    } finally { setActionLoading(false); }
  };

  const handleResubmit = async (e) => {
    e.stopPropagation();
    setActionLoading(true); setActionError('');
    try {
      const res = await api.post(`/products/${product._id}/submit`);
      onProductUpdate?.({ ...product, ...res.data.product });
    } catch (err) {
      setActionError(err?.response?.data?.message || 'Re-submit failed');
    } finally { setActionLoading(false); }
  };

  const handleBoost = async (e) => {
    e?.stopPropagation?.();
    setActionLoading(true); setActionError('');
    try {
      const res = await api.post(`/products/${product._id}/boost`);
      onProductUpdate?.({ ...product, ...res.data.product });
    } catch (err) {
      setActionError(err?.response?.data?.message || 'Boost failed');
    } finally { setActionLoading(false); }
  };

  const handleReplyAdded = (reviewId, newReplies) => {
    setReviews(prev => prev.map(r => r._id === reviewId ? { ...r, replies: newReplies } : r));
  };

  const topTheme = React.useMemo(() => {
    if (!reviews.length) return null;
    const counts = {};
    reviews.forEach(r => r.tags?.forEach(t => { counts[t] = (counts[t] || 0) + 1; }));
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
  }, [reviews]);

  const newCount = reviews.filter(r => isRecent(r.createdAt)).length;

  return (
    <div className={`mp-mobile-card${expanded ? ' mp-mobile-card--expanded' : ''}`}>
      {/* Top section: image + info + menu */}
      <div className="mp-mobile-card-main" onClick={onToggle}>
        <div className="mp-mobile-card-img-wrap">
          {imgSrc ? (
            <img src={imgSrc} alt={product.name} className="mp-mobile-card-img" />
          ) : (
            <div className="mp-mobile-card-img-placeholder">
              {product.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="mp-mobile-card-info">
          <div className="mp-mobile-card-title-row">
            <span className="mp-mobile-card-name">{product.name}</span>
            {product.round && (
              <span className="mp-mobile-card-round-badge">Round {product.round}</span>
            )}
            {isBoosted && <span className="mp-boost-badge" title="Pinned at the top of Launches for 24h">🚀 Boosted</span>}
          </div>
          <div className="mp-mobile-card-cat">{product.category}</div>
          <div className="mp-mobile-card-badges">
            <span className={`mp-stage-badge mp-stage-${stageBadge.color}`}>{stageBadge.text}</span>
            {product.status !== 'draft' && product.status !== 'archived' && (
              <span className={`mp-status-badge mp-status-${statusBadge.color}`}>{statusBadge.text}</span>
            )}
            {product.totalReviews > 0 && (
              <span className="mp-mobile-card-count">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                {product.totalReviews}
              </span>
            )}
            {rating && (
              <span className="mp-mobile-card-star-rating">★ {rating.toFixed(1)}</span>
            )}
          </div>
        </div>
        <div className="mp-mobile-card-menu-wrap" onClick={e => e.stopPropagation()}>
          <button
            className="mp-icon-btn"
            onClick={() => setMenuOpen(v => !v)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="5"  r="1.5" />
              <circle cx="12" cy="12" r="1.5" />
              <circle cx="12" cy="19" r="1.5" />
            </svg>
          </button>
          {menuOpen && (
            <div className="mp-mobile-dropdown">
              {boostable && !isBoosted && (
                <button
                  className="mp-more-menu-item"
                  onMouseDown={() => { setMenuOpen(false); handleBoost(); }}
                >
                  🚀 Boost (30 credits)
                </button>
              )}
              {boostable && (
                <button
                  className="mp-more-menu-item"
                  onMouseDown={() => { setMenuOpen(false); setShowGtmModal(true); }}
                >
                  📊 GTM report (25 credits)
                </button>
              )}
              <button
                className="mp-more-menu-item mp-more-menu-item--danger"
                onMouseDown={() => { setMenuOpen(false); onDeleteRequest?.(product); }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                  <path d="M10 11v6M14 11v6"/>
                  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                </svg>
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Action buttons */}
      {(product.status === 'draft' || product.status === 'in_review' || product.status === 'launched') && (
        <div className="mp-mobile-card-actions" onClick={e => e.stopPropagation()}>
          {(product.status === 'in_review' || product.status === 'launched') && (
            <button className="mp-mobile-btn mp-mobile-btn--ghost" onClick={onToggle}>
              Analytics
            </button>
          )}
          {product.status === 'launched' && (
            <button className="mp-mobile-btn mp-mobile-btn--ghost" onClick={handleResubmit} disabled={actionLoading}>
              {actionLoading ? '…' : 'Re-submit'}
            </button>
          )}
          {product.status === 'in_review' && (
            <button className="mp-mobile-btn mp-mobile-btn--ghost" onClick={handleResubmit} disabled={actionLoading}>
              {actionLoading ? '…' : 'Re-submit'}
            </button>
          )}
          {product.status === 'draft' && (
            <button className="mp-mobile-btn mp-mobile-btn--ghost" onClick={() => onEditRequest?.(product)}>
              Edit
            </button>
          )}
          {product.status === 'draft' && (
            <button className="mp-mobile-btn mp-mobile-btn--primary" onClick={handleSubmit} disabled={actionLoading}>
              {actionLoading ? '…' : 'Submit'}
            </button>
          )}
          {actionError && <span className="mp-action-error" style={{ fontSize: '11px' }}>{actionError}</span>}
        </div>
      )}

      {/* Expanded feedback overview */}
      {expanded && (
        <div className="mp-mobile-feedback-panel">
          <div className="mp-mobile-fb-head">
            <span className="mp-mobile-fb-title">Feedback Overview</span>
            {newCount > 0 && <span className="mp-mobile-fb-unread">{newCount} unread</span>}
          </div>

          <div className="mp-mobile-fb-stats-row">
            <div className="mp-mobile-fb-stat">
              <div className="mp-mobile-fb-stat-lbl">TOTAL REVIEWS</div>
              <div className="mp-mobile-fb-stat-val">{product.totalReviews || 0}</div>
            </div>
            <div className="mp-mobile-fb-divider" />
            <div className="mp-mobile-fb-stat">
              <div className="mp-mobile-fb-stat-lbl">AVG RATING</div>
              <div className="mp-mobile-fb-stat-val">
                {product.avgRating > 0
                  ? <>{product.avgRating.toFixed(1)} <span className="mp-mobile-fb-star">★</span></>
                  : '—'}
              </div>
            </div>
            <div className="mp-mobile-fb-divider" />
            <div className="mp-mobile-fb-stat">
              <div className="mp-mobile-fb-stat-lbl">TOP THEME</div>
              <div className="mp-mobile-fb-stat-val">{topTheme || '—'}</div>
            </div>
          </div>

          {reviewsLoading ? (
            <div className="mp-feedback-empty"><span>Loading feedback…</span></div>
          ) : reviews.length > 0 ? (
            <>
              <div className="mp-feedback-tags">
                {FEEDBACK_TAGS.map(t => (
                  <button
                    key={t}
                    className={`mp-filter-tag ${activeTag === t ? 'active' : ''}`}
                    onClick={() => handleTagChange(t)}
                  >{t}</button>
                ))}
              </div>
              <div className="mp-feedback-list" style={{ marginTop: '12px' }}>
                {reviews.map(fb => (
                  <FeedbackCard
                    key={fb._id}
                    fb={fb}
                    productId={product._id}
                    onReplyAdded={handleReplyAdded}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="mp-feedback-empty">
              <div className="mp-feedback-empty-icon-wrap">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
              <p className="mp-feedback-empty-title">No feedback yet</p>
              <p className="mp-feedback-empty-sub">This product hasn't received any reviews yet. Submit it to get feedback from the community.</p>
            </div>
          )}
        </div>
      )}

      {showGtmModal && (
        <GtmReportModal product={product} onClose={() => setShowGtmModal(false)} />
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function MyProductsPage() {
  const [activeTab,   setActiveTab]   = useState('all');
  const [expandedId,  setExpandedId]  = useState(null);
  const [submissionModal, setSubmissionModal] = useState(null); // { product } — null product = new submission
  const [products,    setProducts]    = useState([]);
  const [stats,       setStats]       = useState({
    totalProducts: 0, totalReviews: 0, avgRating: 0,
    productsThisMonth: 0, reviewsThisMonth: 0,
    ratingChange: 0, responseRate: 0, responseRateChange: 0,
    alert: null, // { productName, unreadReviews, topThemeCount, topTheme }
  });
  const [loading,     setLoading]     = useState(true);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

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

  const handleProductSaved = (saved) => {
    if (products.some(p => p._id === saved._id)) {
      handleProductUpdate(saved);
      return;
    }
    setProducts(prev => [saved, ...prev]);
    setStats(prev => ({ ...prev, totalProducts: prev.totalProducts + 1 }));
  };

  const handleProductDelete = (productId) => {
    clearLocalDraft(productId);
    setProducts(prev => prev.filter(p => p._id !== productId));
    setStats(prev => ({ ...prev, totalProducts: Math.max(0, prev.totalProducts - 1) }));
    if (expandedId === productId) setExpandedId(null);
  };

  const handleDeleteConfirm = async () => {
    if (!pendingDelete) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/products/${pendingDelete._id}`);
      handleProductDelete(pendingDelete._id);
      setPendingDelete(null);
    } catch (err) {
      console.error('Delete failed', err);
    } finally {
      setDeleteLoading(false);
    }
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

        <div className="mp-tabs-bar">
          <div className="mp-tabs">
            {tabs.map(t => (
              <button
                key={t.id}
                className={`mp-tab ${activeTab === t.id ? 'active' : ''}`}
                onClick={() => setActiveTab(t.id)}
              >{t.label}</button>
            ))}
          </div>
          <div className="mp-topbar-actions">
            <button className="mp-action-btn-ghost">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
              </svg>
              Filter
            </button>
            {/* <button className="mp-action-btn-ghost">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Export
            </button> */}
            <button className="mp-action-btn-primary" onClick={() => setSubmissionModal({ product: null })}>
              + New<span className="mp-btn-label-full"> submission</span>
            </button>
          </div>
        </div>

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

        <div className="mp-table-section">
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
                    onDeleteRequest={setPendingDelete}
                    onEditRequest={p => setSubmissionModal({ product: p })}
                  />
                ))}
              </tbody>
            </table>
          )}
        </div>
        </div>

        {/* Mobile card list — visible only on small screens */}
        <div className="mp-mobile-list">
          {loading ? (
            <div className="mp-loading">Loading your products…</div>
          ) : filteredProducts.length === 0 ? (
            <div className="mp-feedback-empty" style={{ paddingTop: '20px' }}>
              <span className="mp-feedback-empty-icon">📦</span>
              <span>No products found.</span>
            </div>
          ) : filteredProducts.map(p => (
            <MobileProductCard
              key={p._id}
              product={p}
              expanded={expandedId === p._id}
              onToggle={() => setExpandedId(expandedId === p._id ? null : p._id)}
              onProductUpdate={handleProductUpdate}
              onDeleteRequest={setPendingDelete}
              onEditRequest={p => setSubmissionModal({ product: p })}
            />
          ))}
        </div>

        {submissionModal && (
          <NewSubmissionModal
            key={submissionModal.product?._id || 'new'}
            product={submissionModal.product}
            onClose={() => setSubmissionModal(null)}
            onSaved={handleProductSaved}
          />
        )}

        {pendingDelete && (
          <div className="mp-delete-overlay" onClick={() => setPendingDelete(null)}>
            <div className="mp-delete-dialog" onClick={e => e.stopPropagation()}>
              <div className="mp-delete-dialog-title">Delete product?</div>
              <div className="mp-delete-dialog-body">
                <strong>{pendingDelete.name}</strong> and all its reviews will be permanently removed. This cannot be undone.
              </div>
              <div className="mp-delete-dialog-actions">
                <button className="mp-delete-cancel" onClick={() => setPendingDelete(null)} disabled={deleteLoading}>Cancel</button>
                <button className="mp-delete-confirm" onClick={handleDeleteConfirm} disabled={deleteLoading}>
                  {deleteLoading ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PrivateLayout>
  );
}
