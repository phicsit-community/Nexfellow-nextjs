/* eslint-disable react/no-unescaped-entities */
'use client';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './launches.css';
import PrivateLayout from '../../layouts/PrivateLayout';
import api from '@/lib/axios';
import { useSelector } from 'react-redux';

// ─── Constants ───────────────────────────────────────────────────────────────

const AVATAR_COLORS = ['#ff8c5a', '#6be0ff', '#c8f060', '#f0c040', '#b19cd9', '#82e0aa', '#f1948a'];

const CATEGORY_META = {
  'SaaS/Productivity': { icon: '📊', bg: '#f0f9d4' },
  'AI/ML tools':       { icon: '🤖', bg: '#e6f0ff' },
  'Dev tools':         { icon: '💻', bg: '#f0eeff' },
  'Mobile app':        { icon: '📱', bg: '#fff5f0' },
  'Health/Wellness':   { icon: '💚', bg: '#e6f5f2' },
  'Finance':           { icon: '💰', bg: '#fef9e7' },
  'Education':         { icon: '🎓', bg: '#f0f9d4' },
  'E-commerce':        { icon: '🛒', bg: '#fce4ec' },
  'Other':             { icon: '◆',  bg: '#f5f5f5' },
};

const ORDINALS = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th'];

const TAB_API = { 'Today': 'today', 'This Week': 'week', 'All Time': 'alltime' };

const REVIEW_TAG_CLASS = {
  'UX':          'fbt-ux',
  'PRICING':     'fbt-bug',
  'MOBILE':      'fbt-feature',
  'POSITIVE':    'fbt-design',
  'PERFORMANCE': 'fbt-perf',
  'FEATURE REQ': 'fbt-feature',
};

const REVIEW_TAGS = ['UX', 'PRICING', 'MOBILE', 'POSITIVE', 'PERFORMANCE', 'FEATURE REQ'];


// ─── Helpers ─────────────────────────────────────────────────────────────────

function colorFromStr(str = '') {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function launchLabel(round) {
  return `${ORDINALS[Math.min((round || 1) - 1, ORDINALS.length - 1)]} launch`;
}

function isUrl(str) {
  return str && (str.startsWith('http://') || str.startsWith('https://'));
}

function groupByDate(products) {
  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);

  const order = [];
  const groups = {};

  for (const p of products) {
    const d = new Date(p.launchedAt);
    let key;
    if (d >= todayStart) key = 'Today';
    else if (d >= yesterdayStart) key = 'Yesterday';
    else key = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    if (!groups[key]) { groups[key] = []; order.push(key); }
    groups[key].push(p);
  }

  return order.map(key => ({ label: key, products: groups[key] }));
}

function buildReplyTree(replies) {
  const map = {};
  const roots = [];
  replies.forEach(rep => { map[String(rep._id)] = { ...rep, children: [] }; });
  replies.forEach(rep => {
    const pid = String(rep.parentReplyId || '');
    // 1. Prefer explicit parentReplyId
    if (pid && map[pid]) {
      map[pid].children.push(map[String(rep._id)]);
      return;
    }
    // 2. Fallback: detect @mention at start of content for old flat replies
    const m = typeof rep.content === 'string' && rep.content.match(/^@(\S+)\s/);
    if (m) {
      const mentioned = m[1].toLowerCase();
      const parent = replies.find(other =>
        String(other._id) !== String(rep._id) &&
        !other.parentReplyId &&
        (
          (other.author?.username || '').toLowerCase() === mentioned ||
          (other.author?.name || '').toLowerCase().replace(/\s+/g, '') === mentioned
        )
      );
      if (parent && map[String(parent._id)]) {
        map[String(parent._id)].children.push(map[String(rep._id)]);
        return;
      }
    }
    roots.push(map[String(rep._id)]);
  });
  return roots;
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

function formatLaunchDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

// ─── Product Row ──────────────────────────────────────────────────────────────

function ProductRow({ product, rank, voted, votes, onVote, onClick }) {
  const catMeta = CATEGORY_META[product.category] || { icon: '⚡', bg: '#e8e8e8' };
  const ownerName = product.owner?.name || 'Builder';
  const isNew = new Date(product.launchedAt) > new Date(Date.now() - 24 * 3600000);
  const tag = rank === 1 ? 'FEATURED' : isNew ? 'NEW' : null;
  const tagType = rank === 1 ? 'featured' : 'new';

  return (
    <div className="lp-row" onClick={onClick}>
      <div className="lp-row-rank">{rank}</div>
      {isUrl(product.logo) ? (
        <div className="lp-row-icon" style={{ background: catMeta.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img src={product.logo} alt="" style={{ width: 28, height: 28, objectFit: 'contain', borderRadius: 4 }} />
        </div>
      ) : (
        <div className="lp-row-icon" style={{ background: catMeta.bg }}>{catMeta.icon}</div>
      )}
      <div className="lp-row-info">
        <div className="lp-row-name-row">
          <span className="lp-row-name">{product.name}</span>
          {tag && <span className={`lp-tag lp-tag-${tagType}`}>{tag}</span>}
        </div>
        <div className="lp-row-desc">{product.tagline}</div>
        <div className="lp-row-meta">
          <div className="lp-row-author">
            <div className="lp-row-av" style={{ background: colorFromStr(ownerName) }}>
              {ownerName.charAt(0).toUpperCase()}
            </div>
            <span>{ownerName} · {launchLabel(product.reviewRound)}</span>
          </div>
          <span className="lp-row-rating">★ {product.avgRating?.toFixed(1) ?? '0.0'}</span>
          <span className="lp-row-fb">💬 {product.totalReviews ?? 0}</span>
          <div className="lp-row-cats">
            {product.category && <span className="lp-cat">{product.category}</span>}
          </div>
        </div>
      </div>
      <button
        className={`lp-vote-btn${voted ? ' voted' : ''}`}
        onClick={e => { e.stopPropagation(); onVote(product._id); }}
      >
        <span className="lp-vote-arr">▲</span>
        <span className="lp-vote-num">{votes}</span>
      </button>
    </div>
  );
}

function DateSep({ label, count }) {
  return (
    <div className="lp-date-sep">
      <span className="lp-date-sep-label">{label}</span>
      <span className="lp-date-sep-count">{count} launches</span>
    </div>
  );
}

// ─── Product Detail ───────────────────────────────────────────────────────────

function ProductDetail({ productId, onBack, onVote, voted, votes, onVoteInit }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeThumb, setActiveThumb] = useState(0);

  // Review form state
  const currentUser = useSelector((state) => state.auth.user);
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewHover, setReviewHover] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [reviewTags, setReviewTags] = useState([]);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // Sidebar action state
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [shareMsg, setShareMsg] = useState('');
  const [reportOpen, setReportOpen] = useState(false);
  const [reportCategory, setReportCategory] = useState('');
  const [reportDesc, setReportDesc] = useState('');
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportDone, setReportDone] = useState(false);
  const [reportError, setReportError] = useState('');

  // Per-review interaction state
  const [helpfulMap, setHelpfulMap] = useState({});
  const [replyOpen, setReplyOpen] = useState({});
  const [replyText, setReplyText] = useState({});
  const [replySubmitting, setReplySubmitting] = useState({});
  const [repliesMap, setRepliesMap] = useState({});
  // Reply-to-reply state (keyed by reply._id)
  const [subReplyOpen, setSubReplyOpen] = useState({});
  const [subReplyText, setSubReplyText] = useState({});
  const [subReplySubmitting, setSubReplySubmitting] = useState({});
  // 3-dot menu state
  const [reviewMenuOpen, setReviewMenuOpen] = useState({});
  const [replyMenuOpen, setReplyMenuOpen] = useState({});

  useEffect(() => {
    const close = (e) => {
      if (!e.target.closest?.('.dpv-more-wrap')) {
        setReviewMenuOpen({});
        setReplyMenuOpen({});
      }
    };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  useEffect(() => {
    setLoading(true);
    setData(null);
    setActiveThumb(0);
    setIsFollowing(false);
    setReportOpen(false);
    setReportDone(false);
    api.get(`/launches/${productId}`)
      .then(async res => {
        setData(res.data);
        if (onVoteInit && res.data?.product) {
          onVoteInit(productId, res.data.product.userHasVoted, res.data.product.upvoteCount);
        }
        // Check follow status for the maker
        const ownerId = res.data?.product?.owner?._id;
        if (ownerId) {
          try {
            const fRes = await api.get(`/user/followStatus/${ownerId}`);
            setIsFollowing(fRes.data?.isFollowing ?? false);
          } catch { /* non-critical */ }
        }
      })
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [productId]);

  // Initialize per-review state when reviews load
  useEffect(() => {
    if (!data?.reviews) return;
    const userId = currentUser?._id || currentUser?.id;
    const hMap = {};
    const rMap = {};
    data.reviews.forEach(r => {
      hMap[r._id] = {
        count: r.helpfulCount ?? 0,
        marked: userId
          ? (r.helpfulBy || []).some(id => (id?._id || id)?.toString() === userId?.toString())
          : false,
      };
      rMap[r._id] = r.replies || [];
    });
    setHelpfulMap(hMap);
    setRepliesMap(rMap);
  }, [data, currentUser]);


  const handleFollowMaker = async () => {
    if (!isLoggedIn || followLoading) return;
    const ownerId = data?.product?.owner?._id;
    if (!ownerId) return;
    setFollowLoading(true);
    const prevFollowing = isFollowing;
    const action = prevFollowing ? 'unfollow' : 'follow';
    setIsFollowing(!prevFollowing);
    try {
      await api.post(`/user/toggleFollow/${ownerId}`, { action });
    } catch (err) {
      const msg = err?.response?.data?.message || '';
      // "Already following" means the follow IS in the DB — keep state as following
      if (msg.toLowerCase().includes('already following')) {
        setIsFollowing(true);
      } else {
        setIsFollowing(prevFollowing);
      }
    } finally {
      setFollowLoading(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: data?.product?.name, url }); } catch { /* dismissed */ }
    } else {
      await navigator.clipboard.writeText(url);
      setShareMsg('Link copied!');
      setTimeout(() => setShareMsg(''), 2000);
    }
  };

  const handleHelpful = async (reviewId) => {
    if (!isLoggedIn) return;
    const prev = helpfulMap[reviewId] || { count: 0, marked: false };
    setHelpfulMap(m => ({
      ...m,
      [reviewId]: { count: prev.marked ? prev.count - 1 : prev.count + 1, marked: !prev.marked },
    }));
    try {
      const res = await api.post(`/products/${data.product._id}/reviews/${reviewId}/helpful`);
      setHelpfulMap(m => ({ ...m, [reviewId]: { count: res.data.helpfulCount, marked: res.data.marked } }));
    } catch {
      setHelpfulMap(m => ({ ...m, [reviewId]: prev }));
    }
  };

  const handleReplySubmit = async (reviewId) => {
    const content = (replyText[reviewId] || '').trim();
    if (!content) return;
    setReplySubmitting(m => ({ ...m, [reviewId]: true }));
    try {
      const res = await api.post(`/products/${data.product._id}/reviews/${reviewId}/reply`, { content });
      setRepliesMap(m => ({ ...m, [reviewId]: res.data.replies || [] }));
      setReplyText(m => ({ ...m, [reviewId]: '' }));
      setReplyOpen(m => ({ ...m, [reviewId]: false }));
    } catch { /* silently ignore */ }
    finally {
      setReplySubmitting(m => ({ ...m, [reviewId]: false }));
    }
  };

  const handleSubReplySubmit = async (reviewId, parentReplyId) => {
    const content = (subReplyText[parentReplyId] || '').trim();
    if (!content) return;
    setSubReplySubmitting(m => ({ ...m, [parentReplyId]: true }));
    try {
      const res = await api.post(`/products/${data.product._id}/reviews/${reviewId}/reply`, { content, parentReplyId });
      setRepliesMap(m => ({ ...m, [reviewId]: res.data.replies || [] }));
      setSubReplyText(m => ({ ...m, [parentReplyId]: '' }));
      setSubReplyOpen(m => ({ ...m, [parentReplyId]: false }));
    } catch { /* silently ignore */ }
    finally {
      setSubReplySubmitting(m => ({ ...m, [parentReplyId]: false }));
    }
  };

  const handleDeleteReview = async (reviewId) => {
    setReviewMenuOpen(m => ({ ...m, [reviewId]: false }));
    try {
      await api.delete(`/products/${data.product._id}/reviews/${reviewId}`);
      setRepliesMap(m => { const n = { ...m }; delete n[reviewId]; return n; });
      setData(prev => ({
        ...prev,
        reviews: prev.reviews.filter(r => r._id !== reviewId),
        totalReviews: Math.max(0, (prev.totalReviews ?? prev.reviews.length) - 1),
      }));
    } catch { /* silently ignore */ }
  };

  const handleDeleteReply = async (reviewId, replyId) => {
    setReplyMenuOpen(m => ({ ...m, [replyId]: false }));
    try {
      const res = await api.delete(`/products/${data.product._id}/reviews/${reviewId}/replies/${replyId}`);
      setRepliesMap(m => ({ ...m, [reviewId]: res.data.replies || [] }));
    } catch { /* silently ignore */ }
  };

  const handleSubmitReport = async () => {
    if (!reportCategory) { setReportError('Please select a category.'); return; }
    const ownerId = data?.product?.owner?._id;
    if (!ownerId) return;
    setReportError('');
    setReportSubmitting(true);
    try {
      await api.post('/reports/create', {
        authorId: ownerId,
        type: 'Account',
        category: reportCategory,
        description: reportDesc.trim() || undefined,
      });
      setReportDone(true);
    } catch (err) {
      setReportError(err.response?.data?.message || 'Failed to submit report.');
    } finally {
      setReportSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="dpv-wrap">
        <div className="dpv-nav">
          <button className="dpv-back" onClick={onBack}>← Back</button>
        </div>
        <div style={{ padding: 48, textAlign: 'center', color: 'var(--tx2)' }}>Loading…</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="dpv-wrap">
        <div className="dpv-nav">
          <button className="dpv-back" onClick={onBack}>← Back</button>
        </div>
        <div style={{ padding: 48, textAlign: 'center', color: 'var(--tx2)' }}>Product not found.</div>
      </div>
    );
  }

  const { product, reviews, totalReviews, ratingStats } = data;
  const catMeta = CATEGORY_META[product.category] || { icon: '⚡', bg: '#e8e8e8' };
  const ownerName = product.owner?.name || 'Builder';
  const hasScreenshots = product.screenshots?.length > 0;

  const isOwner = currentUser && (product.owner?._id === currentUser._id || product.owner?._id === currentUser.id);
  const alreadyReviewed = reviewSuccess || (currentUser && reviews.some(
    r => r.reviewer?._id === currentUser._id || r.reviewer?._id === currentUser.id
  ));

  const toggleTag = (tag) => setReviewTags(prev =>
    prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
  );

  const handleSubmitReview = async () => {
    if (reviewRating === 0) { setReviewError('Please select a star rating.'); return; }
    if (reviewText.trim().length < 10) { setReviewError('Review must be at least 10 characters.'); return; }
    setReviewError('');
    setReviewSubmitting(true);
    try {
      await api.post(`/products/${product._id}/reviews`, {
        rating: reviewRating,
        content: reviewText.trim(),
        tags: reviewTags,
      });
      setReviewSuccess(true);
      setReviewText('');
      setReviewRating(0);
      setReviewTags([]);
      // Refresh data to show the new review
      const res = await api.get(`/launches/${productId}`);
      setData(res.data);
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  return (
    <div className="dpv-wrap">
      <div className="dpv-scroll">
        <div className="dpv-layout">

          {/* ══ Left main ══ */}
          <div className="dpv-main">

            {/* Hero card */}
            <div className="dpv-hero-section">
              <div className="dpv-hero-left">
                {isUrl(product.logo) ? (
                  <div className="dpv-hero-icon" style={{ background: catMeta.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img src={product.logo} alt="" style={{ width: 40, height: 40, objectFit: 'contain', borderRadius: 6 }} />
                  </div>
                ) : (
                  <div className="dpv-hero-icon" style={{ background: catMeta.bg }}>{catMeta.icon}</div>
                )}
                <div className="dpv-hero-info">
                  <div className="dpv-hero-name">{product.name}</div>
                  <div className="dpv-hero-tagline">{product.tagline}</div>
                  <div className="dpv-hero-tags">
                    {product.category && <span className="dpv-hero-tag">{product.category}</span>}
                    {product.buildStage && <span className="dpv-hero-tag">{product.buildStage}</span>}
                  </div>
                  <div className="dpv-hero-meta">
                    <span className="dpv-meta-star">★ {ratingStats.avgRating?.toFixed(1) ?? '0.0'}</span>
                    <span className="dpv-meta-dot">·</span>
                    <span>{totalReviews} reviews</span>
                    <span className="dpv-meta-dot">·</span>
                    <span>{votes ?? product.upvoteCount ?? 0} upvotes</span>
                  </div>
                </div>
              </div>
              <div className="dpv-hero-right">
                <div
                  className={`dpv-vote-badge${voted ? ' voted' : ''}`}
                  onClick={() => onVote && onVote(product._id)}
                >
                  <span className="dpv-vote-arr">▲</span>
                  <span className="dpv-vote-count">{votes ?? product.upvoteCount ?? 0}</span>
                  <span className="dpv-vote-label">Hot Product</span>
                </div>
                {isUrl(product.productUrl) && (
                  <a href={product.productUrl} target="_blank" rel="noopener noreferrer" className="dpv-visit-btn">
                    ↗ Visit Product
                  </a>
                )}
              </div>
            </div>

            {/* Gallery — only shown when the product has uploaded screenshots */}
            {hasScreenshots && (
              <section className="dpv-section">
                <div className="dpv-section-label">PRODUCT GALLERY</div>
                <div className="dpv-gallery-main" style={{ overflow: 'hidden' }}>
                  <img
                    src={product.screenshots[activeThumb]}
                    alt="screenshot"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div className="dpv-gallery-thumbs">
                  {product.screenshots.map((src, i) => (
                    <div
                      key={i}
                      className={`dpv-thumb${activeThumb === i ? ' active' : ''}`}
                      style={{ backgroundImage: `url(${src})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                      onClick={() => setActiveThumb(i)}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Stats */}
            <section className="dpv-section">
              <div className="dpv-section-label">PRODUCT STATS</div>
              <div className="dpv-stats-grid">
                <div className="dpv-stat-card">
                  <div className="dpv-stat-n">{product.upvoteCount ?? 0}</div>
                  <div className="dpv-stat-l">Upvotes</div>
                </div>
                <div className="dpv-stat-card">
                  <div className="dpv-stat-n">{ratingStats.avgRating?.toFixed(1) ?? '0.0'}</div>
                  <div className="dpv-stat-l">Rating</div>
                </div>
                <div className="dpv-stat-card">
                  <div className="dpv-stat-n">{totalReviews}</div>
                  <div className="dpv-stat-l">Reviews</div>
                </div>
                <div className="dpv-stat-card">
                  <div className="dpv-stat-n">{product.reviewRound ?? 1}</div>
                  <div className="dpv-stat-l">Launch #</div>
                </div>
              </div>
            </section>

            {/* About */}
            {product.description && (
              <section className="dpv-section">
                <div className="dpv-section-label">ABOUT</div>
                <p className="dpv-about">{product.description}</p>
              </section>
            )}

            {/* Write a Review */}
            {isLoggedIn && !isOwner && (
              <section className="dpv-section">
                <div className="dpv-section-label">WRITE A REVIEW</div>
                {alreadyReviewed ? (
                  <div className="dpv-review-done">✅ You have already reviewed this product. Thanks for your feedback!</div>
                ) : (
                  <div className="dpv-write-review">
                    {/* Star picker */}
                    <div className="dpv-star-row">
                      <span className="dpv-star-label">Your rating</span>
                      <div className="dpv-stars-input">
                        {[1,2,3,4,5].map(n => (
                          <button
                            key={n}
                            type="button"
                            className={`dpv-star-btn${(reviewHover || reviewRating) >= n ? ' active' : ''}`}
                            onMouseEnter={() => setReviewHover(n)}
                            onMouseLeave={() => setReviewHover(0)}
                            onClick={() => setReviewRating(n)}
                          >★</button>
                        ))}
                      </div>
                    </div>

                    {/* Text */}
                    <textarea
                      className="dpv-review-textarea"
                      placeholder="Share your experience — what works well, what could be improved? (min 10 chars)"
                      value={reviewText}
                      onChange={e => setReviewText(e.target.value)}
                      rows={4}
                    />

                    {/* Tags */}
                    <div className="dpv-tag-row">
                      <span className="dpv-star-label">Tags (optional)</span>
                      <div className="dpv-tag-picker">
                        {REVIEW_TAGS.map(tag => (
                          <button
                            key={tag}
                            type="button"
                            className={`dpv-tag-pick${reviewTags.includes(tag) ? ' selected' : ''} ${REVIEW_TAG_CLASS[tag] || 'fbt-ux'}`}
                            onClick={() => toggleTag(tag)}
                          >{tag}</button>
                        ))}
                      </div>
                    </div>

                    {reviewError && <div className="dpv-review-error">{reviewError}</div>}

                    <button
                      className="dpv-submit-review-btn"
                      onClick={handleSubmitReview}
                      disabled={reviewSubmitting}
                    >
                      {reviewSubmitting ? 'Submitting…' : 'Submit Review'}
                    </button>
                  </div>
                )}
              </section>
            )}

            {/* Reviews */}
            <section className="dpv-section">
              <div className="dpv-reviews-hdr">
                <div className="dpv-section-label" style={{ margin: 0 }}>REVIEWS ({totalReviews})</div>
                <div className="dpv-reviews-hdr-right">
                  <span className="dpv-avg-badge">★ {ratingStats.avgRating?.toFixed(1) ?? '0.0'} average</span>
                </div>
              </div>
              <div className="dpv-reviews-list">
                {reviews.length === 0 ? (
                  <div style={{ padding: '24px 0', color: 'var(--tx2)', textAlign: 'center' }}>No reviews yet.</div>
                ) : reviews.map(r => {
                  const reviewerName = r.reviewer?.name || 'Reviewer';
                  const initials = reviewerName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
                  const stars = Math.round(r.rating);
                  const helpful = helpfulMap[r._id] || { count: r.helpfulCount ?? 0, marked: false };
                  const replies = repliesMap[r._id] || [];
                  const isReplyOpen = replyOpen[r._id] || false;
                  const currentUserId = currentUser?._id || currentUser?.id;
                  const isOwnReview = currentUserId && r.reviewer?._id?.toString() === currentUserId?.toString();
                  const isProductOwner = currentUserId && data?.product?.owner?._id?.toString() === currentUserId?.toString();
                  const canDeleteReview = isLoggedIn && (isOwnReview || isProductOwner);
                  return (
                    <div key={r._id} className="dpv-review-card">
                      <div className="dpv-review-top">
                        {isUrl(r.reviewer?.picture) ? (
                          <img
                            src={r.reviewer.picture}
                            alt=""
                            className="dpv-review-av"
                            style={{ objectFit: 'cover', borderRadius: '50%' }}
                          />
                        ) : (
                          <div className="dpv-review-av" style={{ background: colorFromStr(reviewerName) }}>
                            {initials}
                          </div>
                        )}
                        <div className="dpv-review-user">
                          <div className="dpv-review-name">
                            {reviewerName}
                            {r.reviewer?.username && (
                              <span className="dpv-review-meta"> · {timeAgo(r.createdAt)}</span>
                            )}
                          </div>
                          <div className="dpv-review-email">
                            {r.reviewer?.username ? `@${r.reviewer.username}` : ''}
                          </div>
                        </div>
                        <div className="dpv-review-stars">
                          {'★'.repeat(stars)}{'☆'.repeat(5 - stars)}
                        </div>
                        {canDeleteReview && (
                          <div className="dpv-more-wrap">
                            <button
                              className="dpv-more-btn"
                              onClick={() => setReviewMenuOpen(m => ({ ...m, [r._id]: !m[r._id] }))}
                            >⋯</button>
                            {reviewMenuOpen[r._id] && (
                              <div className="dpv-more-menu">
                                <button
                                  className="dpv-more-menu-item dpv-more-delete"
                                  onClick={() => handleDeleteReview(r._id)}
                                >Delete</button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="dpv-review-text">{r.content}</div>
                      {(r.tags || []).length > 0 && (
                        <div className="dpv-review-tags" style={{ marginBottom: 10 }}>
                          {(r.tags || []).map(t => (
                            <span key={t} className={`dpv-review-tag ${REVIEW_TAG_CLASS[t] || 'fbt-ux'}`}>{t}</span>
                          ))}
                        </div>
                      )}
                      <div className="dpv-review-actions">
                        <button
                          className={`dpv-review-btn${helpful.marked ? ' marked' : ''}`}
                          onClick={() => handleHelpful(r._id)}
                          disabled={!isLoggedIn || isOwnReview}
                          title={isOwnReview ? "Can't mark your own review helpful" : ''}
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill={helpful.marked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
                          Helpful ({helpful.count})
                        </button>
                        {isLoggedIn && (
                          <button
                            className="dpv-review-btn"
                            onClick={() => setReplyOpen(m => ({ ...m, [r._id]: !m[r._id] }))}
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                            Reply
                          </button>
                        )}
                      </div>

                      {/* Replies tree */}
                      {replies.length > 0 && (
                        <div className="dpv-replies-list">
                          {buildReplyTree(replies).map(rootRep => {
                            const rootName = rootRep.author?.name || 'User';
                            const rootInitials = rootName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
                            const isThreadOpen = subReplyOpen[rootRep._id] || false;
                            return (
                              <div key={rootRep._id} className="dpv-reply-thread">
                                {/* Root reply */}
                                <div className="dpv-reply-item">
                                  {isUrl(rootRep.author?.picture) ? (
                                    <img src={rootRep.author.picture} alt="" className="dpv-reply-av" style={{ objectFit: 'cover', borderRadius: '50%' }} />
                                  ) : (
                                    <div className="dpv-reply-av" style={{ background: colorFromStr(rootName) }}>{rootInitials}</div>
                                  )}
                                  <div className="dpv-reply-body">
                                    <div className="dpv-reply-name">
                                      {rootName}
                                      <span className="dpv-review-meta"> · {timeAgo(rootRep.createdAt)}</span>
                                    </div>
                                    <div className="dpv-reply-text">{rootRep.content}</div>
                                    {isLoggedIn && (
                                      <button
                                        className="dpv-sub-reply-btn"
                                        onClick={() => setSubReplyOpen(m => ({ ...m, [rootRep._id]: !m[rootRep._id] }))}
                                      >
                                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                                        Reply
                                      </button>
                                    )}
                                  </div>
                                  {isLoggedIn && (rootRep.author?._id?.toString() === currentUserId?.toString() || isProductOwner) && (
                                    <div className="dpv-more-wrap">
                                      <button
                                        className="dpv-more-btn"
                                        onClick={() => setReplyMenuOpen(m => ({ ...m, [rootRep._id]: !m[rootRep._id] }))}
                                      >⋯</button>
                                      {replyMenuOpen[rootRep._id] && (
                                        <div className="dpv-more-menu">
                                          <button
                                            className="dpv-more-menu-item dpv-more-delete"
                                            onClick={() => handleDeleteReply(r._id, rootRep._id)}
                                          >Delete</button>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>

                                {/* Child replies */}
                                {rootRep.children.length > 0 && (
                                  <div className="dpv-reply-children">
                                    {rootRep.children.map(child => {
                                      const childName = child.author?.name || 'User';
                                      const childInitials = childName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
                                      return (
                                        <div key={child._id} className="dpv-reply-item dpv-reply-child">
                                          {isUrl(child.author?.picture) ? (
                                            <img src={child.author.picture} alt="" className="dpv-reply-av dpv-reply-av-sm" style={{ objectFit: 'cover', borderRadius: '50%' }} />
                                          ) : (
                                            <div className="dpv-reply-av dpv-reply-av-sm" style={{ background: colorFromStr(childName) }}>{childInitials}</div>
                                          )}
                                          <div className="dpv-reply-body">
                                            <div className="dpv-reply-name">
                                              {childName}
                                              <span className="dpv-review-meta"> · {timeAgo(child.createdAt)}</span>
                                            </div>
                                            <div className="dpv-reply-text">{child.content}</div>
                                            {isLoggedIn && (
                                              <button
                                                className="dpv-sub-reply-btn"
                                                onClick={() => {
                                                  setSubReplyOpen(m => ({ ...m, [rootRep._id]: true }));
                                                  setSubReplyText(m => ({ ...m, [rootRep._id]: `@${childName} ` }));
                                                }}
                                              >
                                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                                                Reply
                                              </button>
                                            )}
                                          </div>
                                          {isLoggedIn && (child.author?._id?.toString() === currentUserId?.toString() || isProductOwner) && (
                                            <div className="dpv-more-wrap">
                                              <button
                                                className="dpv-more-btn"
                                                onClick={() => setReplyMenuOpen(m => ({ ...m, [child._id]: !m[child._id] }))}
                                              >⋯</button>
                                              {replyMenuOpen[child._id] && (
                                                <div className="dpv-more-menu">
                                                  <button
                                                    className="dpv-more-menu-item dpv-more-delete"
                                                    onClick={() => handleDeleteReply(r._id, child._id)}
                                                  >Delete</button>
                                                </div>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}

                                {/* Thread reply form */}
                                {isThreadOpen && (
                                  <div className="dpv-sub-reply-form">
                                    <textarea
                                      className="dpv-reply-textarea"
                                      placeholder={`Reply in thread…`}
                                      rows={2}
                                      value={subReplyText[rootRep._id] || ''}
                                      onChange={e => setSubReplyText(m => ({ ...m, [rootRep._id]: e.target.value }))}
                                      autoFocus
                                    />
                                    <div className="dpv-reply-form-actions">
                                      <button
                                        className="dpv-reply-cancel-btn"
                                        onClick={() => setSubReplyOpen(m => ({ ...m, [rootRep._id]: false }))}
                                      >Cancel</button>
                                      <button
                                        className="dpv-reply-submit-btn"
                                        onClick={() => handleSubReplySubmit(r._id, rootRep._id)}
                                        disabled={subReplySubmitting[rootRep._id] || !(subReplyText[rootRep._id] || '').trim()}
                                      >
                                        {subReplySubmitting[rootRep._id] ? 'Posting…' : 'Post Reply'}
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Reply input */}
                      {isReplyOpen && (
                        <div className="dpv-reply-form">
                          <textarea
                            className="dpv-reply-textarea"
                            placeholder="Write a reply…"
                            rows={2}
                            value={replyText[r._id] || ''}
                            onChange={e => setReplyText(m => ({ ...m, [r._id]: e.target.value }))}
                          />
                          <div className="dpv-reply-form-actions">
                            <button
                              className="dpv-reply-cancel-btn"
                              onClick={() => setReplyOpen(m => ({ ...m, [r._id]: false }))}
                            >Cancel</button>
                            <button
                              className="dpv-reply-submit-btn"
                              onClick={() => handleReplySubmit(r._id)}
                              disabled={replySubmitting[r._id] || !(replyText[r._id] || '').trim()}
                            >
                              {replySubmitting[r._id] ? 'Posting…' : 'Post Reply'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

          </div>{/* /dpv-main */}

          {/* ══ Right sidebar ══ */}
          <div className="dpv-sidebar">

            {/* Box 1 — CTA card */}
            <div className="dpv-cta-card">
              <div className="dpv-cta-title">Ready to try {product.name}?</div>
              {isUrl(product.productUrl) && (
                <a
                  href={product.productUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="dpv-cta-btn dpv-cta-btn-primary"
                  style={{ textAlign: 'center', textDecoration: 'none' }}
                >
                  ↗ Get Started
                </a>
              )}
              {isUrl(product.demoVideo) && (
                <a
                  href={product.demoVideo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="dpv-cta-btn dpv-cta-btn-secondary"
                  style={{ textAlign: 'center', textDecoration: 'none' }}
                >
                  ▶ Watch Demo
                </a>
              )}
            </div>

            {/* Box 2 — Maker card */}
            <div className="dpv-card">
              <div className="dpv-card-label">MAKER</div>
              <div className="dpv-builder-row">
                {isUrl(product.owner?.picture) ? (
                  <img
                    src={product.owner.picture}
                    alt=""
                    className="dpv-builder-av"
                    style={{ objectFit: 'cover', borderRadius: '50%' }}
                  />
                ) : (
                  <div className="dpv-builder-av" style={{ background: colorFromStr(ownerName) }}>
                    {ownerName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="dpv-builder-info">
                  <div className="dpv-builder-name">{ownerName}</div>
                  <div className="dpv-builder-bio">
                    {product.owner?.bio || `${launchLabel(product.reviewRound)} founder on NexFellow.`}
                  </div>
                </div>
              </div>
              {isLoggedIn && !isOwner && (
                <button
                  className={`dpv-follow-btn${isFollowing ? ' following' : ''}`}
                  onClick={handleFollowMaker}
                  disabled={followLoading}
                >
                  {isFollowing ? 'Following' : 'Follow Maker'}
                </button>
              )}
            </div>

            {/* Box 3 — Links card */}
            <div className="dpv-card">
              <div className="dpv-card-label">LINKS</div>
              <div className="dpv-links-list">
                {isUrl(product.productUrl) ? (
                  <a
                    href={product.productUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="dpv-link-row"
                  >
                    <span className="dpv-link-icon">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                    </span>
                    <span className="dpv-link-label">Visit Website</span>
                    <span className="dpv-link-arrow">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                    </span>
                  </a>
                ) : (
                  <div style={{ color: 'var(--tx3)', fontSize: 12, padding: '4px 0' }}>No links provided.</div>
                )}
              </div>
            </div>

            {/* Box 4 — Product Info card */}
            <div className="dpv-card">
              <div className="dpv-card-label">PRODUCT INFO</div>
              <div className="dpv-info-row">
                <div className="dpv-info-label">Build stage</div>
                <div className="dpv-info-val">{product.buildStage || '—'}</div>
              </div>
              <div className="dpv-launch-date-row">
                <div>
                  <div className="dpv-launch-date-label">Launch from</div>
                  <div className="dpv-launch-date-val">{formatLaunchDate(product.launchedAt)}</div>
                </div>
                <span className="dpv-launching-badge">LAUNCHED</span>
              </div>
            </div>

            {/* Box 5 — Quick actions card */}
            <div className="dpv-card dpv-actions-card">
              <div className="dpv-card-label">QUICK ACTIONS</div>
              <button
                className={`dpv-action-btn${saved ? ' saved' : ''}`}
                onClick={() => setSaved(s => !s)}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
                {saved ? 'Saved' : 'Save for Later'}
              </button>
              <button className="dpv-action-btn" onClick={handleShare}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                {shareMsg || 'Share Product'}
              </button>
            </div>

            {/* Report an Issue — outside the card */}
            {isLoggedIn && !isOwner && (
              <div className="dpv-report-outer">
                <button
                  className="dpv-report-link-btn"
                  onClick={() => { setReportOpen(o => !o); setReportError(''); }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
                  Report an Issue
                </button>
                {reportOpen && !reportDone && (
                  <div className="dpv-report-form">
                    <select
                      className="dpv-report-select"
                      value={reportCategory}
                      onChange={e => setReportCategory(e.target.value)}
                    >
                      <option value="">Select category…</option>
                      {['Spam','Misinformation','Inappropriate Content','Copyright Violation','Other'].map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <textarea
                      className="dpv-report-textarea"
                      placeholder="Additional details (optional)"
                      rows={2}
                      value={reportDesc}
                      onChange={e => setReportDesc(e.target.value)}
                    />
                    {reportError && <div className="dpv-review-error">{reportError}</div>}
                    <button
                      className="dpv-submit-report-btn"
                      onClick={handleSubmitReport}
                      disabled={reportSubmitting}
                    >
                      {reportSubmitting ? 'Submitting…' : 'Submit Report'}
                    </button>
                  </div>
                )}
                {reportDone && (
                  <div className="dpv-report-done">✅ Report submitted. Thank you.</div>
                )}
              </div>
            )}

          </div>{/* /dpv-sidebar */}
        </div>{/* /dpv-layout */}
      </div>{/* /dpv-scroll */}
    </div>
  );
}

// ─── Main launches page ───────────────────────────────────────────────────────

export default function LaunchesPage() {
  const [activeTab, setActiveTab] = useState('Today');
  const [launchOpen, setLaunchOpen] = useState(true);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [launches, setLaunches] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [podProduct, setPodProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [upvotedIds, setUpvotedIds] = useState(new Set());
  const [voteCounts, setVoteCounts] = useState({});

  const fetchLaunches = useCallback(async (tab) => {
    setLoading(true);
    try {
      const res = await api.get(`/launches?tab=${TAB_API[tab]}&sort=top&limit=20`);
      setLaunches(res.data.launches || []);
    } catch {
      setLaunches([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSidebar = useCallback(async () => {
    try {
      const [podRes, trendRes] = await Promise.all([
        api.get('/launches?tab=today&sort=top&limit=1'),
        api.get('/launches/live'),
      ]);
      const pod = podRes.data.launches?.[0];
      if (pod) setPodProduct(pod);
      setTrendingProducts(trendRes.data.live || []);
    } catch { /* sidebar is non-critical */ }
  }, []);

  useEffect(() => {
    fetchLaunches(activeTab);
  }, [activeTab, fetchLaunches]);

  useEffect(() => {
    fetchSidebar();
  }, [fetchSidebar]);

  // Sync vote counts and voted state when launches data arrives
  useEffect(() => {
    setVoteCounts(prev => {
      const next = { ...prev };
      for (const p of launches) {
        if (!(p._id in next)) next[p._id] = p.upvoteCount ?? 0;
      }
      return next;
    });
    setUpvotedIds(prev => {
      const next = new Set(prev);
      for (const p of launches) {
        if (p.userHasVoted) next.add(p._id);
      }
      return next;
    });
  }, [launches]);

  const handleVote = async (productId) => {
    const wasVoted = upvotedIds.has(productId);

    // Optimistic update
    setUpvotedIds(prev => {
      const next = new Set(prev);
      wasVoted ? next.delete(productId) : next.add(productId);
      return next;
    });
    setVoteCounts(prev => ({
      ...prev,
      [productId]: Math.max(0, (prev[productId] ?? 0) + (wasVoted ? -1 : 1)),
    }));

    try {
      const res = await api.post(`/launches/${productId}/upvote`);
      setUpvotedIds(prev => {
        const next = new Set(prev);
        res.data.upvoted ? next.add(productId) : next.delete(productId);
        return next;
      });
      setVoteCounts(prev => ({ ...prev, [productId]: res.data.upvoteCount }));
    } catch {
      // Revert on error
      setUpvotedIds(prev => {
        const next = new Set(prev);
        wasVoted ? next.add(productId) : next.delete(productId);
        return next;
      });
      setVoteCounts(prev => ({
        ...prev,
        [productId]: Math.max(0, (prev[productId] ?? 0) + (wasVoted ? 1 : -1)),
      }));
    }
  };

  const rankedGroups = useMemo(() => {
    let rank = 0;
    return groupByDate(launches).map(group => ({
      label: group.label,
      products: group.products.map(p => ({ ...p, _rank: ++rank })),
    }));
  }, [launches]);

  return (
    <PrivateLayout>
      <div className="lp-wrap">

        {selectedProductId ? (
          <ProductDetail
            productId={selectedProductId}
            onBack={() => setSelectedProductId(null)}
            onVote={handleVote}
            voted={upvotedIds.has(selectedProductId)}
            votes={voteCounts[selectedProductId]}
            onVoteInit={(id, hasVoted, count) => {
              setUpvotedIds(prev => { const n = new Set(prev); hasVoted ? n.add(id) : n.delete(id); return n; });
              setVoteCounts(prev => ({ ...prev, [id]: count ?? prev[id] ?? 0 }));
            }}
          />
        ) : (
          <div className="lp-outer-grid">

            {/* ── Left: tab bar + scrollable list ── */}
            <div className="lp-main-area">
              <div className="lp-tabbar">
                {['Today', 'This Week', 'All Time'].map(tab => (
                  <button
                    key={tab}
                    className={`lp-tab${activeTab === tab ? ' active' : ''}`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab === 'This Week' ? (
                      <>
                        <span className="lp-tab-desktop-label">This Week</span>
                        <span className="lp-tab-mobile-label">Week</span>
                      </>
                    ) : tab}
                  </button>
                ))}
              </div>

              <div className="lp-scroll">
                <div className="lp-main-col">
                  {loading ? (
                    <div style={{ padding: '48px 0', textAlign: 'center', color: 'var(--tx2)' }}>
                      Loading launches…
                    </div>
                  ) : launches.length === 0 ? (
                    <div style={{ padding: '48px 0', textAlign: 'center', color: 'var(--tx2)' }}>
                      No launches yet.
                    </div>
                  ) : (
                    rankedGroups.map((group) => (
                      <React.Fragment key={group.label}>
                        <div className="lp-section-label">{group.label}</div>
                        <div className="lp-group-card">
                          {group.products.map(product => (
                            <ProductRow
                              key={product._id}
                              product={product}
                              rank={product._rank}
                              voted={upvotedIds.has(product._id)}
                              votes={voteCounts[product._id] ?? product.upvoteCount ?? 0}
                              onVote={handleVote}
                              onClick={() => setSelectedProductId(product._id)}
                            />
                          ))}
                        </div>
                      </React.Fragment>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* ══ Right sidebar ══ */}
            <div className="lp-sidebar">

              {/* Product of the Day */}
              <div className="lps-pod">
                <div className="lps-pod-eyebrow">PRODUCT OF THE DAY</div>
                {podProduct ? (
                  <>
                    <div className="lps-pod-product">
                      <div className="lps-pod-icon">
                        {isUrl(podProduct.logo) ? (
                          <img
                            src={podProduct.logo}
                            alt=""
                            style={{ width: 32, height: 32, objectFit: 'contain', borderRadius: 4 }}
                          />
                        ) : (
                          CATEGORY_META[podProduct.category]?.icon || '⚡'
                        )}
                      </div>
                      <div>
                        <div className="lps-pod-name">{podProduct.name}</div>
                        <div className="lps-pod-tagline">{podProduct.tagline}</div>
                      </div>
                    </div>
                    <div className="lps-pod-stats">
                      <span>▲ {podProduct.upvoteCount ?? 0}</span>
                      <span>★ {podProduct.avgRating?.toFixed(1) ?? '0.0'}</span>
                      <span>💬 {podProduct.totalReviews ?? 0}</span>
                    </div>
                    <button
                      className="lps-pod-btn"
                      onClick={() => setSelectedProductId(podProduct._id)}
                    >
                      View Product
                    </button>
                  </>
                ) : (
                  <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, padding: '8px 0' }}>
                    No launches today yet.
                  </div>
                )}
              </div>

              {/* Launch Your Product */}
              <div className="lps-launch-card">
                <button className="lps-launch-toggle" onClick={() => setLaunchOpen(o => !o)}>
                  <span className={`lps-launch-chevron${launchOpen ? '' : ' closed'}`}>∧</span>
                </button>
                {launchOpen && (
                  <>
                    <div className="lps-launch-title">Launch Your Product</div>
                    <div className="lps-launch-desc">Get feedback from builders, makers, and early <br /> adopters</div>
                    <button className="lps-submit-btn">Submit to Launches</button>
                  </>
                )}
              </div>

              {/* Trending This Week */}
              <div className="lps-card">
                <div className="lps-card-title">
                  <span className="lps-card-title-icon">↑</span> Trending This Week
                </div>
                {trendingProducts.length === 0 ? (
                  <div style={{ color: 'var(--tx2)', fontSize: 13, padding: '8px 0' }}>
                    No trending launches yet.
                  </div>
                ) : trendingProducts.map((p, i) => (
                  <div
                    key={p._id}
                    className="lps-trending-item"
                    onClick={() => setSelectedProductId(p._id)}
                  >
                    <span className="lps-ti-rank">{i + 1}</span>
                    <div className="lps-ti-info">
                      <span className="lps-ti-name">{p.name}</span>
                      <span className="lps-ti-votes">▲ {p.upvoteCount ?? 0}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Coming Soon */}
              <div className="lps-card">
                <div className="lps-card-title">Coming Soon</div>
                <div className="lps-cs-item">
                  <div className="lps-cs-info">
                    <div className="lps-cs-name">Notion AI</div>
                    <div className="lps-cs-desc">AI-first note-taking rebuilt</div>
                  </div>
                  <span className="lps-cs-badge lps-cs-green">In 2 days</span>
                </div>
                <div className="lps-cs-item">
                  <div className="lps-cs-info">
                    <div className="lps-cs-name">Mealer</div>
                    <div className="lps-cs-desc">Meal planning for busy founders</div>
                  </div>
                  <span className="lps-cs-badge lps-cs-orange">In 3 days</span>
                </div>
                <div className="lps-cs-item">
                  <div className="lps-cs-info">
                    <div className="lps-cs-name">Digest</div>
                    <div className="lps-cs-desc">Daily blog digest in 5 minutes</div>
                  </div>
                  <span className="lps-cs-badge lps-cs-purple">In 5 days</span>
                </div>
              </div>

              {/* Daily Launch Digest */}
              <div className="lps-digest-card">
                <div className="lps-digest-title">Daily Launch Digest</div>
                <div className="lps-digest-desc">Get the best new products delivered to your inbox every morning</div>
                <div className="lps-digest-form">
                  <input className="lps-email-input" type="email" placeholder="your@email.com" />
                  <button className="lps-subscribe-btn">Subscribe</button>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </PrivateLayout>
  );
}
