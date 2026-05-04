/* eslint-disable react/no-unescaped-entities */
'use client';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './launches.css';
import PrivateLayout from '../../layouts/PrivateLayout';
import api from '@/lib/axios';

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

const GALLERY_BG = [
  'linear-gradient(135deg, #1a2e1a 0%, #2d5a2d 50%, #1a3a1a 100%)',
  'linear-gradient(135deg, #0d1f3c 0%, #1a3a6e 50%, #0d2040 100%)',
  'linear-gradient(135deg, #2a1a3e 0%, #4a2a6e 50%, #2a1a4a 100%)',
  'linear-gradient(135deg, #1a2a3a 0%, #2a4a5a 50%, #1a2a3a 100%)',
];

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
  const galleryItems = hasScreenshots ? product.screenshots : GALLERY_BG;

  return (
    <div className="dpv-wrap">
      <div className="dpv-nav">
        <button className="dpv-back" onClick={onBack}>← Back</button>
        <div className="dpv-breadcrumb">
          <span className="dpv-bc-parent">Launches</span>
          <span className="dpv-bc-sep">/</span>
          <span className="dpv-bc-current">{product.name}</span>
        </div>
      </div>

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

            {/* Gallery */}
            <section className="dpv-section">
              <div className="dpv-section-label">PRODUCT GALLERY</div>
              {hasScreenshots ? (
                <>
                  <div className="dpv-gallery-main" style={{ overflow: 'hidden' }}>
                    <img
                      src={galleryItems[activeThumb]}
                      alt="screenshot"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                  <div className="dpv-gallery-thumbs">
                    {galleryItems.map((src, i) => (
                      <div
                        key={i}
                        className={`dpv-thumb${activeThumb === i ? ' active' : ''}`}
                        style={{ backgroundImage: `url(${src})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                        onClick={() => setActiveThumb(i)}
                      />
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <div className="dpv-gallery-main" style={{ background: GALLERY_BG[activeThumb] }}>
                    <div className="dpv-gallery-inner">
                      <div className="dpv-gallery-icon-lg">{catMeta.icon}</div>
                      <div className="dpv-gallery-caption">{product.name} — Product Demo</div>
                    </div>
                  </div>
                  <div className="dpv-gallery-thumbs">
                    {GALLERY_BG.map((bg, i) => (
                      <div
                        key={i}
                        className={`dpv-thumb${activeThumb === i ? ' active' : ''}`}
                        style={{ background: bg }}
                        onClick={() => setActiveThumb(i)}
                      />
                    ))}
                  </div>
                </>
              )}
            </section>

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
          <>
            {/* ── Tab bar ── */}
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

            {/* ── Scrollable body ── */}
            <div className="lp-scroll">
              <div className="lp-grid">

                {/* ══ Main product list ══ */}
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
                      <div style={{ color: 'var(--tx2)', fontSize: 13, padding: '8px 0' }}>
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
                        <div className="lps-launch-desc">Get feedback from builders, makers, and early adopters</div>
                        <button className="lps-submit-btn">Submit to Launches</button>
                      </>
                    )}
                  </div>

                  {/* Trending This Week */}
                  <div className="lps-card">
                    <div className="lps-card-title">
                      <span className="lps-card-title-icon">~</span> Trending This Week
                    </div>
                    {trendingProducts.length === 0 ? (
                      <div style={{ color: 'var(--tx2)', fontSize: 13, padding: '8px 0' }}>
                        No trending launches yet.
                      </div>
                    ) : trendingProducts.map((p, i) => {
                      const catMeta = CATEGORY_META[p.category] || { icon: '⚡', bg: '#e8e8e8' };
                      return (
                        <div
                          key={p._id}
                          className="lps-trending-item"
                          onClick={() => setSelectedProductId(p._id)}
                        >
                          <span className="lps-ti-rank">{i + 1}</span>
                          <div className="lps-ti-icon" style={{ background: catMeta.bg }}>
                            {isUrl(p.logo) ? (
                              <img src={p.logo} alt="" style={{ width: 16, height: 16, objectFit: 'contain', borderRadius: 2 }} />
                            ) : catMeta.icon}
                          </div>
                          <span className="lps-ti-name">{p.name}</span>
                          <span className="lps-ti-votes">▲ {p.upvoteCount ?? 0}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Daily Launch Digest */}
                  <div className="lps-digest-card">
                    <div className="lps-digest-title">Daily Launch Digest</div>
                    <div className="lps-digest-desc">Get the best new products delivered to your Inbox every morning</div>
                    <div className="lps-digest-form">
                      <input className="lps-email-input" type="email" placeholder="your@email.com" />
                      <button className="lps-subscribe-btn">Subscribe</button>
                    </div>
                  </div>

                </div>{/* /lp-sidebar */}
              </div>{/* /lp-grid */}
            </div>{/* /lp-scroll */}
          </>
        )}

      </div>
    </PrivateLayout>
  );
}
