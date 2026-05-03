/* eslint-disable react/no-unescaped-entities */
'use client';
import React, { useState } from 'react';
import './launches.css';
import PrivateLayout from '../../layouts/PrivateLayout';

function ProductRow({ rank, icon, iconBg, name, tag, tagType, desc, authorInitial, authorBg, author, launch, rating, feedbacks, cats = [], votes, voted = false }) {
  return (
    <div className="lp-row">
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

export default function LaunchesPage() {
  const [activeTab, setActiveTab] = useState('Today');
  const [launchOpen, setLaunchOpen] = useState(true);

  return (
    <PrivateLayout>
      <div className="lp-wrap">

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

              {/* Today section */}
              <div className="lp-section-label">Today</div>

              <ProductRow rank={1} icon="📋" iconBg="#f0f9d4" name="TaskFlow AI" tag="FEATURED" tagType="featured"
                desc="AI-powered task management that helps your team actually works"
                authorInitial="S" authorBg="#ff8c5a" author="Sarah Chen" launch="3rd launch"
                rating="4.5" feedbacks={12} cats={['Productivity', 'AI']} votes={284} voted />

              <ProductRow rank={2} icon="🎨" iconBg="#f0eeff" name="DesignKit" tag="NEW" tagType="new"
                desc="Figma-to-code design system builder for solo founders and small teams"
                authorInitial="A" authorBg="#ff8c5a" author="Anika Sharma" launch="1st launch"
                rating="4.4" feedbacks={14} cats={['Design', 'Dev Tools']} votes={184} />

              <ProductRow rank={3} icon="⚡" iconBg="#e6f5f2" name="NoCODEM"
                desc="Build complete web apps without writing a single line of code"
                authorInitial="M" authorBg="#6be0ff" author="Mike Rodriguez" launch="2nd launch"
                rating="4.2" feedbacks={22} cats={['No-Code', 'SaaS']} votes={156} />

              <DateSep label="Yesterday" count={2} />

              <ProductRow rank={1} icon="🚢" iconBg="#fff5f0" name="ShipLog"
                desc="Lightweight changelog and release notes for developer tools"
                authorInitial="D" authorBg="#c8f060" author="David Kim" launch="4th launch"
                rating="4.6" feedbacks={8} cats={['Dev Tools', 'API']} votes={142} />

              <ProductRow rank={2} icon="🚢" iconBg="#fff5f0" name="ShipLog"
                desc="Lightweight changelog and release notes for developer tools"
                authorInitial="D" authorBg="#c8f060" author="David Kim" launch="4th launch"
                rating="4.6" feedbacks={8} cats={['Dev Tools', 'API']} votes={130} />

              <DateSep label="May 31, 2026" count={9} />

              <ProductRow rank={1} icon="🚢" iconBg="#fff5f0" name="ShipLog"
                desc="Lightweight changelog and release notes for developer tools"
                authorInitial="D" authorBg="#c8f060" author="David Kim" launch="4th launch"
                rating="4.6" feedbacks={8} cats={['Dev Tools', 'API']} votes={141} />

            </div>{/* /lp-main-col */}

            {/* ══ Right sidebar ══ */}
            <div className="lp-sidebar">

              {/* ── Product of the Day ── */}
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
                <button className="lps-pod-btn">View Product</button>
              </div>

              {/* ── Launch Your Product ── */}
              <div className="lps-launch-card">
                <button
                  className="lps-launch-toggle"
                  onClick={() => setLaunchOpen(o => !o)}
                  aria-label="Toggle launch section"
                >
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

              {/* ── Trending This Week ── */}
              <div className="lps-card">
                <div className="lps-card-title">
                  <span className="lps-card-title-icon">~</span> Trending This Week
                </div>
                <div className="lps-trending-item">
                  <span className="lps-ti-rank">1</span>
                  <div className="lps-ti-icon" style={{ background: '#f0f9d4' }}>📋</div>
                  <span className="lps-ti-name">TaskFlow AI</span>
                  <span className="lps-ti-votes">~ 284</span>
                </div>
                <div className="lps-trending-item">
                  <span className="lps-ti-rank">2</span>
                  <div className="lps-ti-icon" style={{ background: '#f0eeff' }}>🎨</div>
                  <span className="lps-ti-name">DesignKit</span>
                  <span className="lps-ti-votes">~ 184</span>
                </div>
                <div className="lps-trending-item">
                  <span className="lps-ti-rank">3</span>
                  <div className="lps-ti-icon" style={{ background: '#e6f5f2' }}>⚡</div>
                  <span className="lps-ti-name">NoCODEM</span>
                  <span className="lps-ti-votes">~ 156</span>
                </div>
              </div>

              {/* ── Coming Soon ── */}
              <div className="lps-card">
                <div className="lps-card-title">Coming Soon</div>
                <div className="lps-cs-item">
                  <div className="lps-cs-info">
                    <div className="lps-cs-name">Notion AI</div>
                    <div className="lps-cs-desc">AI-first note-taking rebuilt!</div>
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

              {/* ── Daily Launch Digest ── */}
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

        {/* ══ Product Detail Overlay ══ */}
        <div className="detail-page" id="detail-page">
          <div className="dp-topbar">
            <button className="dp-back">← Back to Launches</button>
            <div className="dp-breadcrumb">Launches <span className="dp-sep">/</span> <span id="dp-breadcrumb-name">TaskFlow AI</span></div>
            <div className="dp-top-actions">
              <button className="tb-btn">🔗 Share</button>
              <button className="tb-btn">🚩 Report</button>
            </div>
          </div>
          <div className="dp-scroll">
            <div className="dp-layout">
              <div className="dp-left">
                <div className="dp-hero">
                  <div className="dp-prod-icon" style={{ background: '#f0f9d4' }}>📋</div>
                  <div className="dp-prod-info">
                    <div className="dp-prod-name">TaskFlow AI</div>
                    <div className="dp-prod-tagline">AI-powered project management that learns how your team actually works</div>
                    <div className="dp-cats"><span className="dp-cat">Productivity</span><span className="dp-cat">AI</span><span className="dp-cat">SaaS</span></div>
                  </div>
                </div>
                <div className="dp-action-bar">
                  <button className="dp-vote-big">▲ <span className="dp-vc">316</span></button>
                  <button className="dp-want-big">🌟 Want this</button>
                  <button className="dp-visit">↗ Visit product</button>
                </div>
                <div className="dp-gallery">
                  <div className="dp-section-title">Media</div>
                  <div className="dp-media-main">
                    <div className="dp-video-thumb">
                      <div className="dp-play-btn">▶</div>
                      <div className="dp-video-label">Product Demo — TaskFlow AI v2.1</div>
                      <div className="dp-video-duration">3 min 42 sec</div>
                    </div>
                  </div>
                  <div className="dp-thumbnails">
                    <div className="dp-thumb active" style={{ background: 'linear-gradient(135deg,#1a3a1a,#0f2010)', color: 'rgba(255,255,255,.5)', fontSize: '14px' }}>▶</div>
                    <div className="dp-thumb" style={{ background: 'linear-gradient(135deg,#f0f9d4,#e0f0b0)', fontSize: '24px' }}>📋</div>
                    <div className="dp-thumb" style={{ background: 'linear-gradient(135deg,#e8f5d4,#d4e8a0)', fontSize: '24px' }}>⚡</div>
                    <div className="dp-thumb" style={{ background: 'linear-gradient(135deg,#d4f0e0,#b0e0cc)', fontSize: '24px' }}>📊</div>
                  </div>
                </div>
                <div className="dp-description">
                  <div className="dp-section-title">About this product</div>
                  <div className="dp-desc-text">
                    <p><strong>TaskFlow AI</strong> is a project management tool that learns from how your team actually works.</p>
                    <p>After 14 weeks building in public, Rohan redesigned the onboarding based on community feedback. <strong>Drop rate fell from 68% to 31%</strong>.</p>
                  </div>
                </div>
                <div style={{ marginBottom: '28px' }}>
                  <div className="dp-section-title">Traction on NexFellow</div>
                  <div className="dp-traction">
                    <div className="tr-card"><div className="tr-num tr-g">4.2★</div><div className="tr-lbl">Community rating</div></div>
                    <div className="tr-card"><div className="tr-num tr-p">22</div><div className="tr-lbl">Feedbacks received</div></div>
                    <div className="tr-card"><div className="tr-num tr-t">4</div><div className="tr-lbl">Early adopters</div></div>
                    <div className="tr-card"><div className="tr-num tr-o">316</div><div className="tr-lbl">Upvotes today</div></div>
                  </div>
                </div>
              </div>
              <div className="dp-right">
                <div className="dp-r-card">
                  <div className="dp-r-label">Builder</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '11px', marginBottom: '12px' }}>
                    <div className="dp-builder-av" style={{ background: '#c8f060', color: '#111' }}>R</div>
                    <div className="dp-builder-info"><strong>Rohan Mehta</strong><span>Founder · SaaS · Mumbai</span></div>
                  </div>
                  <div className="dp-builder-stats">
                    <div className="dp-bs"><span className="n" style={{ color: 'var(--G)' }}>124</span><span className="l">credits</span></div>
                    <div className="dp-bs"><span className="n" style={{ color: 'var(--P)' }}>31</span><span className="l">reviews given</span></div>
                    <div className="dp-bs"><span className="n" style={{ color: 'var(--T)' }}>2</span><span className="l">launches</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </PrivateLayout>
  );
}
