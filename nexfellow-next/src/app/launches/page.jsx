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
          <span className="lp-row-fb">💬 {product.totalReviews ?? 0} feedbacks</span>
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

function ProductDetail({ productId, onBack }) {
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

  useEffect(() => {
    setLoading(true);
    setData(null);
    setActiveThumb(0);
    api.get(`/launches/${productId}`)
      .then(res => setData(res.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [productId]);

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
                    <span>{product.upvoteCount ?? 0} upvotes</span>
                  </div>
                </div>
              </div>
              <div className="dpv-hero-right">
                <div className="dpv-vote-badge">
                  <span className="dpv-vote-arr">▲</span>
                  <span className="dpv-vote-count">{product.upvoteCount ?? 0}</span>
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
                          <div className="dpv-review-name">{reviewerName}</div>
                          <div className="dpv-review-email">
                            {r.reviewer?.username ? `@${r.reviewer.username}` : ''}
                          </div>
                        </div>
                        <div className="dpv-review-stars">
                          {'★'.repeat(stars)}{'☆'.repeat(5 - stars)}
                        </div>
                      </div>
                      <div className="dpv-review-text">{r.content}</div>
                      <div className="dpv-review-footer">
                        <div className="dpv-review-tags">
                          {(r.tags || []).map(t => (
                            <span key={t} className={`dpv-review-tag ${REVIEW_TAG_CLASS[t] || 'fbt-ux'}`}>{t}</span>
                          ))}
                        </div>
                        <div className="dpv-review-actions">
                          <button className="dpv-review-btn">👍 Helpful ({r.helpfulCount ?? 0})</button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

          </div>{/* /dpv-main */}

          {/* ══ Right sidebar ══ */}
          <div className="dpv-sidebar">

            {/* CTA card */}
            <div className="dpv-cta-card">
              <div className="dpv-cta-title">Ready to try {product.name}?</div>
              {isUrl(product.productUrl) && (
                <a
                  href={product.productUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="dpv-cta-btn"
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
                  className="dpv-cta-btn"
                  style={{ textAlign: 'center', textDecoration: 'none' }}
                >
                  ▶ Watch Demo
                </a>
              )}
            </div>

            {/* Builder card */}
            <div className="dpv-card">
              <div className="dpv-card-label">BUILDER</div>
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
                  <div className="dpv-builder-bio">{launchLabel(product.reviewRound)} on NexFellow.</div>
                </div>
              </div>
              {isUrl(product.productUrl) && (
                <div className="dpv-builder-links">
                  <div className="dpv-link-row">
                    <span>Visit Website</span>
                    <a
                      href={product.productUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="dpv-link-val"
                    >
                      ↗
                    </a>
                  </div>
                </div>
              )}
              <div className="dpv-launch-date-row">
                <div>
                  <div className="dpv-launch-date-label">Launch date</div>
                  <div className="dpv-launch-date-val">{formatLaunchDate(product.launchedAt)}</div>
                </div>
                <span className="dpv-launching-badge">LAUNCHED</span>
              </div>
            </div>

            {/* Quick actions */}
            <div className="dpv-card dpv-actions-card">
              <div className="dpv-card-label">QUICK ACTIONS</div>
              <button className="dpv-action-btn">🔗 Share Product</button>
              <button className="dpv-action-btn dpv-action-danger">⚑ Report an Issue</button>
            </div>

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

  // Sync vote counts when launches data arrives
  useEffect(() => {
    setVoteCounts(prev => {
      const next = { ...prev };
      for (const p of launches) {
        if (!(p._id in next)) next[p._id] = p.upvoteCount ?? 0;
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
                    {tab}
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
                    rankedGroups.map((group, gi) => (
                      <React.Fragment key={group.label}>
                        {gi === 0 ? (
                          <div className="lp-section-label">{group.label}</div>
                        ) : (
                          <DateSep label={group.label} count={group.products.length} />
                        )}
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
                      </React.Fragment>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* ══ Right sidebar ══ */}
            <div className="lp-sidebar">

              {/* Promoted card 1 — AnalyticsFlow */}
              <div className="lps-promo-card">
                <div className="lps-promo-banner lps-promo-banner-analytics">
                  <span className="lps-promo-badge">PROMOTED</span>
                  <div className="lps-promo-bars">
                    {[38, 55, 44, 70, 50, 82, 65, 90, 75, 60, 85, 95].map((h, i) => (
                      <div key={i} className="lps-promo-bar" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                  <div className="lps-promo-overlay" />
                  <div className="lps-promo-content">
                    <div className="lps-promo-identity">
                      <div className="lps-promo-logo lps-promo-logo-analytics">
                        <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
                          <rect x="1" y="9" width="4" height="8" rx="1" fill="#4285F4"/>
                          <rect x="7" y="5" width="4" height="12" rx="1" fill="#34A853"/>
                          <rect x="13" y="1" width="4" height="16" rx="1" fill="#FBBC05"/>
                        </svg>
                      </div>
                      <span className="lps-promo-name">AnalyticsFlow</span>
                    </div>
                    <div className="lps-promo-desc">Privacy-first web analytics that respects your visitors</div>
                  </div>
                </div>
                <button className="lps-promo-cta">
                  <span>Learn more about analytics</span>
                  <span className="lps-promo-arrow">→</span>
                </button>
              </div>

              {/* Promoted card 2 — TaskMaster Pro */}
              <div className="lps-promo-card">
                <div className="lps-promo-banner lps-promo-banner-task">
                  <span className="lps-promo-badge">PROMOTED</span>
                  <div className="lps-promo-task-visual">
                    {[1, 1, 1, 0, 0].map((done, i) => (
                      <div key={i} className={`lps-promo-task-line${done ? ' done' : ''}`}>
                        <span className="lps-promo-task-check">
                          {done ? (
                            <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                              <path d="M1.5 4.5l2 2 4-4" stroke="#f5a623" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          ) : ''}
                        </span>
                        <span className="lps-promo-task-dash" />
                      </div>
                    ))}
                  </div>
                  <div className="lps-promo-overlay" />
                  <div className="lps-promo-content">
                    <div className="lps-promo-identity">
                      <div className="lps-promo-logo lps-promo-logo-task">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path d="M3 8l3 3 7-7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <span className="lps-promo-name">TaskMaster Pro</span>
                    </div>
                    <div className="lps-promo-desc">The task manager built for high-performance teams</div>
                  </div>
                </div>
                <button className="lps-promo-cta">
                  <span>Start organizing today</span>
                  <span className="lps-promo-arrow">→</span>
                </button>
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

            </div>
          </div>
        )}

      </div>
    </PrivateLayout>
  );
}
