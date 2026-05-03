/* eslint-disable react/no-unescaped-entities */
'use client';
import React, { useState } from 'react';
import './launches.css';
import PrivateLayout from '../../layouts/PrivateLayout';

/* ─── Static product data ─── */
const PRODUCTS = {
  today: [
    {
      id: 1, rank: 1, icon: '📋', iconBg: '#f0f9d4', name: 'TaskFlow AI',
      tag: 'FEATURED', tagType: 'featured',
      desc: 'AI-powered task management that helps your team actually works',
      authorInitial: 'S', authorBg: '#ff8c5a', author: 'Sarah Chen', launch: '3rd launch',
      rating: '4.5', feedbacks: 12, cats: ['Productivity', 'AI'], votes: 284, voted: true,
      about: 'TaskFlow AI is a next-generation task management platform that combines the power of artificial intelligence with intuitive design. Built for modern teams who value both accountability and simplicity, TaskFlow AI learns from your work patterns to make smart suggestions that actually improve productivity. Whether you\'re managing a small startup or coordinating across departments, TaskFlow AI adapts to your workflow.',
    },
    {
      id: 2, rank: 2, icon: '🎨', iconBg: '#f0eeff', name: 'DesignKit',
      tag: 'NEW', tagType: 'new',
      desc: 'Figma-to-code design system builder for solo founders and small teams',
      authorInitial: 'A', authorBg: '#ff8c5a', author: 'Anika Sharma', launch: '1st launch',
      rating: '4.4', feedbacks: 14, cats: ['Design', 'Dev Tools'], votes: 184, voted: false,
      about: 'DesignKit bridges the gap between design and development. It automatically converts your Figma components into production-ready code, saving hours of manual implementation. Built specifically for indie founders and small teams who need to move fast without compromising on quality.',
    },
    {
      id: 3, rank: 3, icon: '⚡', iconBg: '#e6f5f2', name: 'NoCODEM',
      tag: null, tagType: null,
      desc: 'Build complete web apps without writing a single line of code',
      authorInitial: 'M', authorBg: '#6be0ff', author: 'Mike Rodriguez', launch: '2nd launch',
      rating: '4.2', feedbacks: 22, cats: ['No-Code', 'SaaS'], votes: 156, voted: false,
      about: 'NoCODEM empowers anyone to build fully functional web applications without any coding knowledge. With a powerful drag-and-drop builder and AI assistance, you can go from idea to deployed app in hours instead of months.',
    },
  ],
  yesterday: [
    {
      id: 4, rank: 1, icon: '🚢', iconBg: '#fff5f0', name: 'ShipLog',
      tag: null, tagType: null,
      desc: 'Lightweight changelog and release notes for developer tools',
      authorInitial: 'D', authorBg: '#c8f060', author: 'David Kim', launch: '4th launch',
      rating: '4.6', feedbacks: 8, cats: ['Dev Tools', 'API'], votes: 142, voted: false,
      about: 'ShipLog makes it effortless to create beautiful, structured changelogs and release notes. Designed for developer tools and SaaS products, it integrates directly with your GitHub workflow to automatically draft release notes from your commit history.',
    },
    {
      id: 5, rank: 2, icon: '🚢', iconBg: '#fff5f0', name: 'ShipLog',
      tag: null, tagType: null,
      desc: 'Lightweight changelog and release notes for developer tools',
      authorInitial: 'D', authorBg: '#c8f060', author: 'David Kim', launch: '4th launch',
      rating: '4.6', feedbacks: 8, cats: ['Dev Tools', 'API'], votes: 130, voted: false,
      about: 'ShipLog makes it effortless to create beautiful, structured changelogs and release notes.',
    },
  ],
  may31: [
    {
      id: 6, rank: 1, icon: '🚢', iconBg: '#fff5f0', name: 'ShipLog',
      tag: null, tagType: null,
      desc: 'Lightweight changelog and release notes for developer tools',
      authorInitial: 'D', authorBg: '#c8f060', author: 'David Kim', launch: '4th launch',
      rating: '4.6', feedbacks: 8, cats: ['Dev Tools', 'API'], votes: 141, voted: false,
      about: 'ShipLog makes it effortless to create beautiful, structured changelogs and release notes.',
    },
  ],
};

/* ─── Product row tile ─── */
function ProductRow({ product, onClick }) {
  const { rank, icon, iconBg, name, tag, tagType, desc, authorInitial, authorBg, author, launch, rating, feedbacks, cats, votes, voted } = product;
  return (
    <div className="lp-row" onClick={onClick}>
      <div className="lp-row-rank">{rank}</div>
      <div className="lp-row-icon" style={{ background: iconBg }}>{icon}</div>
      <div className="lp-row-info">
        <div className="lp-row-name-row">
          <span className="lp-row-name">{name}</span>
          {tag && <span className={`lp-tag lp-tag-${tagType}`}>{tag}</span>}
        </div>
        <div className="lp-row-desc">{desc}</div>
        <div className="lp-row-meta">
          <div className="lp-row-author">
            <div className="lp-row-av" style={{ background: authorBg }}>{authorInitial}</div>
            <span>{author} · {launch}</span>
          </div>
          <span className="lp-row-rating">★ {rating}</span>
          <span className="lp-row-fb">💬 {feedbacks} feedbacks</span>
          <div className="lp-row-cats">
            {cats.map(cat => <span key={cat} className="lp-cat">{cat}</span>)}
          </div>
        </div>
      </div>
      <button className={`lp-vote-btn${voted ? ' voted' : ''}`}>
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

const REVIEW_TAG_CLASS = {
  'UX/UI': 'fbt-ux',
  'Bug Report': 'fbt-bug',
  'Integration Request': 'fbt-feature',
  'Performance': 'fbt-perf',
  'Design': 'fbt-design',
};

/* ─── Product detail page ─── */
const FEATURES = [
  { icon: '🤖', title: 'AI-Powered Suggestions', desc: 'Smart task predictions that learn from your workflow and habits.' },
  { icon: '👥', title: 'Real-time Collaboration', desc: 'Work together with your team seamlessly in real time.' },
  { icon: '📊', title: 'Advanced Analytics', desc: 'Track productivity metrics and team performance over time.' },
  { icon: '🔗', title: 'Deep Integrations', desc: 'Connects with Slack, GitHub, Notion, and 50+ other tools.' },
];

const GALLERY_BG = [
  'linear-gradient(135deg, #1a2e1a 0%, #2d5a2d 50%, #1a3a1a 100%)',
  'linear-gradient(135deg, #0d1f3c 0%, #1a3a6e 50%, #0d2040 100%)',
  'linear-gradient(135deg, #2a1a3e 0%, #4a2a6e 50%, #2a1a4a 100%)',
  'linear-gradient(135deg, #1a2a3a 0%, #2a4a5a 50%, #1a2a3a 100%)',
];

const REVIEWS = [
  {
    initials: 'PM', bg: '#f0c040', name: 'Priya Mathur', email: 'priya.mathur@gmail.com',
    stars: 5,
    text: "The AI suggestions are exactly what we needed. The suggestions are surprisingly accurate and have saved us hours of planning time. The task automation is incredibly powerful.",
    tags: ['UX/UI'], helpful: 14,
  },
  {
    initials: 'MJ', bg: '#6be0ff', name: 'Marcus Johnson', email: 'marcus.johnson@gmail.com',
    stars: 4,
    text: "The automation is powerful, but the mobile app needs some work. Overall experience is seamless though — tracking experience is solid and the team dashboard is excellent.",
    tags: ['Bug Report'], helpful: 8,
  },
  {
    initials: 'LA', bg: '#ff8c5a', name: 'Lisa Anderson', email: 'lisa.anderson@gmail.com',
    stars: 4,
    text: "Absolutely love it and haven't looked back. The AI makes decisions about task priorities incredibly clear. Our team's output improved significantly within the first week.",
    tags: ['Integration Request'], helpful: 11,
  },
];

function ProductDetail({ product, onBack }) {
  const [activeThumb, setActiveThumb] = useState(0);

  return (
    <div className="dpv-wrap">

      {/* ── Nav bar ── */}
      <div className="dpv-nav">
        <button className="dpv-back" onClick={onBack}>← Back</button>
        <div className="dpv-breadcrumb">
          <span className="dpv-bc-parent">Launches</span>
          <span className="dpv-bc-sep">/</span>
          <span className="dpv-bc-current">{product.name}</span>
        </div>
      </div>

      {/* ── Scrollable content ── */}
      <div className="dpv-scroll">
        <div className="dpv-layout">

          {/* ══ Left main ══ */}
          <div className="dpv-main">

            {/* Hero card (inside left column, scrolls with content) */}
            <div className="dpv-hero-section">
              <div className="dpv-hero-left">
                <div className="dpv-hero-icon" style={{ background: product.iconBg }}>{product.icon}</div>
                <div className="dpv-hero-info">
                  <div className="dpv-hero-name">{product.name}</div>
                  <div className="dpv-hero-tagline">{product.desc}</div>
                  <div className="dpv-hero-tags">
                    {product.cats.map(cat => <span key={cat} className="dpv-hero-tag">{cat}</span>)}
                    <span className="dpv-hero-tag">Team Collaboration</span>
                  </div>
                  <div className="dpv-hero-meta">
                    <span className="dpv-meta-star">★ {product.rating}</span>
                    <span className="dpv-meta-dot">·</span>
                    <span>{product.feedbacks} reviews</span>
                    <span className="dpv-meta-dot">·</span>
                    <span>2847 views</span>
                  </div>
                </div>
              </div>
              <div className="dpv-hero-right">
                <div className={`dpv-vote-badge${product.voted ? ' voted' : ''}`}>
                  <span className="dpv-vote-arr">▲</span>
                  <span className="dpv-vote-count">{product.votes}</span>
                  <span className="dpv-vote-label">Hot Product</span>
                </div>
                <button className="dpv-visit-btn">↗ Visit Product</button>
              </div>
            </div>

            {/* Gallery */}
            <section className="dpv-section">
              <div className="dpv-section-label">PRODUCT GALLERY</div>
              <div className="dpv-gallery-main" style={{ background: GALLERY_BG[activeThumb] }}>
                <div className="dpv-gallery-inner">
                  <div className="dpv-gallery-icon-lg">{product.icon}</div>
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
            </section>

            {/* Stats */}
            <section className="dpv-section">
              <div className="dpv-section-label">PRODUCT STATS</div>
              <div className="dpv-stats-grid">
                <div className="dpv-stat-card">
                  <div className="dpv-stat-n">{product.votes}</div>
                  <div className="dpv-stat-l">Upvotes</div>
                </div>
                <div className="dpv-stat-card">
                  <div className="dpv-stat-n">{product.rating}</div>
                  <div className="dpv-stat-l">Rating</div>
                </div>
                <div className="dpv-stat-card">
                  <div className="dpv-stat-n">{product.feedbacks}</div>
                  <div className="dpv-stat-l">Reviews</div>
                </div>
                <div className="dpv-stat-card">
                  <div className="dpv-stat-n">2847</div>
                  <div className="dpv-stat-l">Views</div>
                </div>
              </div>
            </section>

            {/* About */}
            <section className="dpv-section">
              <div className="dpv-section-label">ABOUT</div>
              <p className="dpv-about">{product.about}</p>
            </section>

            {/* Key Features */}
            <section className="dpv-section">
              <div className="dpv-section-label">KEY FEATURES</div>
              <div className="dpv-features-grid">
                {FEATURES.map((f, i) => (
                  <div key={i} className="dpv-feature-card">
                    <div className="dpv-feature-icon">{f.icon}</div>
                    <div className="dpv-feature-title">{f.title}</div>
                    <div className="dpv-feature-desc">{f.desc}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* Reviews */}
            <section className="dpv-section">
              <div className="dpv-reviews-hdr">
                <div className="dpv-section-label" style={{ margin: 0 }}>REVIEWS ({REVIEWS.length})</div>
                <div className="dpv-reviews-hdr-right">
                  <span className="dpv-avg-badge">★ {product.rating} average</span>
                  <button className="dpv-add-review-btn">+ Add feedback</button>
                </div>
              </div>
              <div className="dpv-reviews-list">
                {REVIEWS.map((r, i) => (
                  <div key={i} className="dpv-review-card">
                    <div className="dpv-review-top">
                      <div className="dpv-review-av" style={{ background: r.bg }}>{r.initials}</div>
                      <div className="dpv-review-user">
                        <div className="dpv-review-name">{r.name}</div>
                        <div className="dpv-review-email">{r.email}</div>
                      </div>
                      <div className="dpv-review-stars">
                        {'★'.repeat(r.stars)}{'☆'.repeat(5 - r.stars)}
                      </div>
                    </div>
                    <div className="dpv-review-text">{r.text}</div>
                    <div className="dpv-review-footer">
                      <div className="dpv-review-tags">
                        {r.tags.map(t => <span key={t} className={`dpv-review-tag ${REVIEW_TAG_CLASS[t] || 'fbt-ux'}`}>{t}</span>)}
                      </div>
                      <div className="dpv-review-actions">
                        <button className="dpv-review-btn">👍 Helpful ({r.helpful})</button>
                        <button className="dpv-review-btn">💬 Reply</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

          </div>{/* /dpv-main */}

          {/* ══ Right sidebar ══ */}
          <div className="dpv-sidebar">

            {/* CTA card */}
            <div className="dpv-cta-card">
              <div className="dpv-cta-title">Ready to try {product.name}?</div>
              <button className="dpv-cta-btn">↗ Get Started</button>
              <button className="dpv-cta-btn">▶ Watch Demo</button>
            </div>

            {/* Builder card */}
            <div className="dpv-card">
              <div className="dpv-card-label">BUILDER</div>
              <div className="dpv-builder-row">
                <div className="dpv-builder-av" style={{ background: product.authorBg }}>{product.authorInitial}</div>
                <div className="dpv-builder-info">
                  <div className="dpv-builder-name">{product.author}</div>
                  <div className="dpv-builder-bio">Indie builder. {product.launch} on NexFellow. Previously at Design &amp; Growth.</div>
                </div>
              </div>
              <button className="dpv-follow-btn">Follow Builder</button>
              <div className="dpv-builder-links">
                <div className="dpv-link-row"><span>Visit Website</span><span className="dpv-link-val">0</span></div>
                <div className="dpv-link-row"><span>GitHub</span><span className="dpv-link-val">0</span></div>
                <div className="dpv-link-row"><span>Twitter</span><span className="dpv-link-val">0</span></div>
              </div>
              <div className="dpv-launch-date-row">
                <div>
                  <div className="dpv-launch-date-label">First launch date</div>
                  <div className="dpv-launch-date-val">May 5, 2025</div>
                </div>
                <span className="dpv-launching-badge">LAUNCHED</span>
              </div>
            </div>

            {/* Quick actions */}
            <div className="dpv-card dpv-actions-card">
              <div className="dpv-card-label">QUICK ACTIONS</div>
              <button className="dpv-action-btn">🔖 Save for Later</button>
              <button className="dpv-action-btn">🔗 Share Product</button>
              <button className="dpv-action-btn dpv-action-danger">⚑ Report on Issue</button>
            </div>

          </div>{/* /dpv-sidebar */}
        </div>{/* /dpv-layout */}
      </div>{/* /dpv-scroll */}
    </div>
  );
}

/* ─── Main launches page ─── */
export default function LaunchesPage() {
  const [activeTab, setActiveTab] = useState('Today');
  const [launchOpen, setLaunchOpen] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const allProducts = [...PRODUCTS.today, ...PRODUCTS.yesterday, ...PRODUCTS.may31];

  return (
    <PrivateLayout>
      <div className="lp-wrap">

        {selectedProduct ? (
          <ProductDetail product={selectedProduct} onBack={() => setSelectedProduct(null)} />
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
                  <div className="lp-section-label">Today</div>
                  {PRODUCTS.today.map(p => (
                    <ProductRow key={p.id} product={p} onClick={() => setSelectedProduct(p)} />
                  ))}
                  <DateSep label="Yesterday" count={2} />
                  {PRODUCTS.yesterday.map(p => (
                    <ProductRow key={p.id} product={p} onClick={() => setSelectedProduct(p)} />
                  ))}
                  <DateSep label="May 31, 2026" count={9} />
                  {PRODUCTS.may31.map(p => (
                    <ProductRow key={p.id} product={p} onClick={() => setSelectedProduct(p)} />
                  ))}
                </div>

                {/* ══ Right sidebar ══ */}
                <div className="lp-sidebar">

                  {/* Product of the Day */}
                  <div className="lps-pod">
                    <div className="lps-pod-eyebrow">PRODUCT OF THE DAY</div>
                    <div className="lps-pod-product">
                      <div className="lps-pod-icon">🎨</div>
                      <div>
                        <div className="lps-pod-name">DesignKit</div>
                        <div className="lps-pod-tagline">Figma-to-code design system builder</div>
                      </div>
                    </div>
                    <div className="lps-pod-stats">
                      <span>▲ 184</span>
                      <span>★ 4.4</span>
                      <span>💬 14</span>
                    </div>
                    <button className="lps-pod-btn" onClick={() => setSelectedProduct(PRODUCTS.today[1])}>View Product</button>
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
                    {PRODUCTS.today.map((p, i) => (
                      <div key={p.id} className="lps-trending-item" onClick={() => setSelectedProduct(p)}>
                        <span className="lps-ti-rank">{i + 1}</span>
                        <div className="lps-ti-icon" style={{ background: p.iconBg }}>{p.icon}</div>
                        <span className="lps-ti-name">{p.name}</span>
                        <span className="lps-ti-votes">~ {p.votes}</span>
                      </div>
                    ))}
                  </div>

                  {/* Coming Soon */}
                  <div className="lps-card">
                    <div className="lps-card-title">Coming Soon</div>
                    <div className="lps-cs-item">
                      <div className="lps-cs-info"><div className="lps-cs-name">Notion AI</div><div className="lps-cs-desc">AI-first note-taking rebuilt!</div></div>
                      <span className="lps-cs-badge lps-cs-green">In 2 days</span>
                    </div>
                    <div className="lps-cs-item">
                      <div className="lps-cs-info"><div className="lps-cs-name">Mealer</div><div className="lps-cs-desc">Meal planning for busy founders</div></div>
                      <span className="lps-cs-badge lps-cs-orange">In 3 days</span>
                    </div>
                    <div className="lps-cs-item">
                      <div className="lps-cs-info"><div className="lps-cs-name">Digest</div><div className="lps-cs-desc">Daily blog digest in 5 minutes</div></div>
                      <span className="lps-cs-badge lps-cs-purple">In 5 days</span>
                    </div>
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
