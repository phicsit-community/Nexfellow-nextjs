/* eslint-disable react/no-unescaped-entities */
'use client';
import React, { useState } from 'react';
import './launches.css';

export default function LaunchesPage() {
  const [activeTab, setActiveTab] = useState('today');
  const [activeSort, setActiveSort] = useState('top');
  const [detailId, setDetailId] = useState(null);

  // For now we just render the template statically. If we were fully hooking it up, we would extract the products data here.
  
  return (
    <div className="launches-page-container w-full h-screen overflow-hidden text-[#18170f] font-sans antialiased bg-[#fafaf8]">

<div className="shell">

{/* ══════════ SIDEBAR ══════════ */}
<aside className="sidebar">
  <div className="sb-logo">
    <div className="logo-tri"></div>
    Nex<em>Fellow</em>
  </div>

  <nav className="sb-nav">
    <div className="si" ><div className="si-icon">🏠</div> Home</div>
    <div className="si" ><div className="si-icon">🗺️</div> Builder Map</div>
    <div className="si" ><div className="si-icon">📊</div> Leaderboard</div>
    <div className="si active" ><div className="si-icon">🚀</div> Launches<span className="si-badge sbg">Live</span></div>
    <div className="si" ><div className="si-icon">🤝</div> Community</div>
    <div className="si" >
      <div className="si-icon">💬</div> Inbox
      <span className="si-badge sbp">5</span>
    </div>
    <div className="si" ><div className="si-icon">🔔</div> Notifications<span className="si-badge sbo">2</span></div>

    <div className="sb-lbl">Account</div>
    <div className="si" ><div className="si-icon">👤</div> Profile</div>
    <div className="si" ><div className="si-icon">⚙️</div> Settings</div>
  </nav>

  <div className="sb-launch-cta">
    <strong>🚀 Submit your product</strong>
    <span>8 reviews collected — you're ready</span>
  </div>

  <div className="sb-profile">
    <div className="sb-prow">
      <div className="sb-av">R</div>
      <div className="sb-info">
        <strong>Rohan Mehta</strong>
        <span>Mumbai · Builder</span>
      </div>
      <div className="sb-credits">124 cr</div>
    </div>
  </div>
</aside>

{/* ══════════ MAIN ══════════ */}
<main className="main">
  <div className="topbar">
    <div className="tb-title">Launches</div>
    <div className="tb-tabs">
      <button className="tbtab active" >Today</button>
      <button className="tbtab" >This week</button>
      <button className="tbtab" >All time</button>
    </div>
    <div className="tb-right">
      <button className="tb-btn">🔍 Filter</button>
      <button className="tb-btn pri" >+ Submit product</button>
    </div>
  </div>

  <div className="scroll-area">
    <div className="content-grid">
      <div className="main-col">

        {/* Live strip */}
        <div className="live-strip">
          <div className="ls-head">
            <div className="live-dot"></div>
            <div className="ls-label">Live now</div>
            <div className="ls-sub">3 products launching · feedback flowing in</div>
          </div>
          <div className="live-cards">
            <div className="live-card hot" >
              <div className="lc-top">
                <div className="lc-icon" style={{'background': '#f0f9d4'}}>📋</div>
                <div className="lc-name">TaskFlow AI</div>
                <div className="lc-hot-tag">🔥 Hot</div>
              </div>
              <div className="lc-bar"><div className="lc-bar-fill" style={{'width': '88%'}}></div></div>
              <div className="lc-stats">
                <div className="lc-stat">▲ <strong>316</strong></div>
                <div className="lc-stat">💬 <strong>22</strong></div>
                <div className="lc-stat">⭐ <strong>4.2</strong></div>
              </div>
              <div className="lc-time">Launched 4h ago</div>
            </div>
            <div className="live-card" >
              <div className="lc-top">
                <div className="lc-icon" style={{'background': '#f0eeff'}}>🎨</div>
                <div className="lc-name">DesignKit</div>
              </div>
              <div className="lc-bar"><div className="lc-bar-fill" style={{'width': '62%'}}></div></div>
              <div className="lc-stats">
                <div className="lc-stat">▲ <strong>184</strong></div>
                <div className="lc-stat">💬 <strong>14</strong></div>
                <div className="lc-stat">⭐ <strong>4.4</strong></div>
              </div>
              <div className="lc-time">Launched 6h ago</div>
            </div>
            <div className="live-card" >
              <div className="lc-top">
                <div className="lc-icon" style={{'background': '#e6f5f2'}}>⚡</div>
                <div className="lc-name">NoCodeAPI</div>
              </div>
              <div className="lc-bar"><div className="lc-bar-fill" style={{'width': '44%'}}></div></div>
              <div className="lc-stats">
                <div className="lc-stat">▲ <strong>97</strong></div>
                <div className="lc-stat">💬 <strong>9</strong></div>
                <div className="lc-stat">⭐ <strong>4.6</strong></div>
              </div>
              <div className="lc-time">Launched 2h ago</div>
            </div>
          </div>
        </div>

        {/* Day header */}
        <div className="day-head">
          <div className="dh-date">April 6, 2026</div>
          <div className="sort-btns">
            <button className="sort-btn active" >Top</button>
            <button className="sort-btn" >New</button>
            <button className="sort-btn" >Trending</button>
          </div>
        </div>

        {/* Today's launches */}
        <div className="launch-row featured" >
          <div className="lr-rank r1">1</div>
          <div className="lr-icon" style={{'background': '#f0f9d4'}}>📋</div>
          <div className="lr-info">
            <div className="lr-name-row">
              <div className="lr-name">TaskFlow AI</div>
              <span className="lr-tag tag-featured">✦ Featured</span>
              <span className="lr-tag tag-hot">🔥 Hot</span>
            </div>
            <div className="lr-desc">AI-powered project management that learns how your team actually works</div>
            <div className="lr-meta">
              <div className="lr-builder"><div className="lr-bav" style={{'background': '#c8f060', 'color': '#111'}}>R</div>Rohan Mehta · 2nd launch</div>
              <div className="lr-traction">
                <div className="lr-tr g">⭐ 4.2</div>
                <div className="lr-tr">💬 22 feedbacks</div>
                <div className="lr-tr g">👤 4 adopters</div>
              </div>
              <div className="lr-cats"><span className="lr-cat">Productivity</span><span className="lr-cat">AI</span></div>
            </div>
          </div>
          <div className="lr-actions">
            <button className="want-btn wanted" >🌟 Wanted</button>
            <button className="vote-btn voted" ><div className="vb-arr">▲</div><div className="vb-num">316</div></button>
          </div>
        </div>

        <div className="launch-row" >
          <div className="lr-rank r2">2</div>
          <div className="lr-icon" style={{'background': '#f0eeff'}}>🎨</div>
          <div className="lr-info">
            <div className="lr-name-row"><div className="lr-name">DesignKit</div><span className="lr-tag tag-new">New</span></div>
            <div className="lr-desc">Figma-to-code design system builder for solo founders and small teams</div>
            <div className="lr-meta">
              <div className="lr-builder"><div className="lr-bav" style={{'background': '#ff8c5a', 'color': '#111'}}>A</div>Anika Sharma · 1st launch</div>
              <div className="lr-traction"><div className="lr-tr g">⭐ 4.4</div><div className="lr-tr">💬 14 feedbacks</div><div className="lr-tr">👤 2 adopters</div></div>
              <div className="lr-cats"><span className="lr-cat">Design</span><span className="lr-cat">Dev Tools</span></div>
            </div>
          </div>
          <div className="lr-actions">
            <button className="want-btn" >🌟 Want this</button>
            <button className="vote-btn" ><div className="vb-arr">▲</div><div className="vb-num">184</div></button>
          </div>
        </div>

        <div className="launch-row" >
          <div className="lr-rank r3">3</div>
          <div className="lr-icon" style={{'background': '#e6f5f2'}}>⚡</div>
          <div className="lr-info">
            <div className="lr-name-row"><div className="lr-name">NoCodeAPI</div><span className="lr-tag tag-new">New</span></div>
            <div className="lr-desc">Build and deploy APIs without writing a single line of code</div>
            <div className="lr-meta">
              <div className="lr-builder"><div className="lr-bav" style={{'background': '#6be0ff', 'color': '#111'}}>M</div>Miguel Torres · 1st launch</div>
              <div className="lr-traction"><div className="lr-tr g">⭐ 4.6</div><div className="lr-tr">💬 9 feedbacks</div><div className="lr-tr">👤 3 adopters</div></div>
              <div className="lr-cats"><span className="lr-cat">Dev Tools</span><span className="lr-cat">No-Code</span></div>
            </div>
          </div>
          <div className="lr-actions">
            <button className="want-btn" >🌟 Want this</button>
            <button className="vote-btn" ><div className="vb-arr">▲</div><div className="vb-num">97</div></button>
          </div>
        </div>

        <div className="launch-row">
          <div className="lr-rank">4</div>
          <div className="lr-icon" style={{'background': '#fff5f0'}}>🚢</div>
          <div className="lr-info">
            <div className="lr-name-row"><div className="lr-name">ShipLog</div></div>
            <div className="lr-desc">Beautiful changelogs and release notes for developer tools</div>
            <div className="lr-meta">
              <div className="lr-builder"><div className="lr-bav" style={{'background': '#c8f060', 'color': '#111'}}>R</div>Rohan Mehta</div>
              <div className="lr-traction"><div className="lr-tr g">⭐ 4.7</div><div className="lr-tr">💬 15 feedbacks</div><div className="lr-tr g">👤 6 adopters</div></div>
              <div className="lr-cats"><span className="lr-cat">Dev Tools</span></div>
            </div>
          </div>
          <div className="lr-actions">
            <button className="want-btn" >🌟 Want this</button>
            <button className="vote-btn" ><div className="vb-arr">▲</div><div className="vb-num">88</div></button>
          </div>
        </div>

        <div className="launch-row">
          <div className="lr-rank">5</div>
          <div className="lr-icon" style={{'background': '#e6f5f2'}}>🧘</div>
          <div className="lr-info">
            <div className="lr-name-row"><div className="lr-name">Habitual</div></div>
            <div className="lr-desc">Build habits that actually stick — smart reminders, zero guilt</div>
            <div className="lr-meta">
              <div className="lr-builder"><div className="lr-bav" style={{'background': '#f0c040', 'color': '#111'}}>P</div>Priya Mankar</div>
              <div className="lr-traction"><div className="lr-tr">⭐ 3.9</div><div className="lr-tr">💬 7 feedbacks</div><div className="lr-tr">👤 1 adopter</div></div>
              <div className="lr-cats"><span className="lr-cat">Health</span><span className="lr-cat">Mobile</span></div>
            </div>
          </div>
          <div className="lr-actions">
            <button className="want-btn" >🌟 Want this</button>
            <button className="vote-btn" ><div className="vb-arr">▲</div><div className="vb-num">74</div></button>
          </div>
        </div>

        <div className="launch-row">
          <div className="lr-rank">6</div>
          <div className="lr-icon" style={{'background': '#fdf0e6'}}>💰</div>
          <div className="lr-info">
            <div className="lr-name-row"><div className="lr-name">InvoiceZap</div></div>
            <div className="lr-desc">Send GST invoices in under 30 seconds. Built for Indian freelancers.</div>
            <div className="lr-meta">
              <div className="lr-builder"><div className="lr-bav" style={{'background': '#f0c040', 'color': '#111'}}>K</div>Karan Shah</div>
              <div className="lr-traction"><div className="lr-tr g">⭐ 4.1</div><div className="lr-tr">💬 11 feedbacks</div><div className="lr-tr">👤 2 adopters</div></div>
              <div className="lr-cats"><span className="lr-cat">Fintech</span><span className="lr-cat">B2B</span></div>
            </div>
          </div>
          <div className="lr-actions">
            <button className="want-btn" >🌟 Want this</button>
            <button className="vote-btn" ><div className="vb-arr">▲</div><div className="vb-num">61</div></button>
          </div>
        </div>

        <div className="launch-row">
          <div className="lr-rank">7</div>
          <div className="lr-icon" style={{'background': '#ffeef0'}}>🤖</div>
          <div className="lr-info">
            <div className="lr-name-row"><div className="lr-name">AutoForm</div></div>
            <div className="lr-desc">Turn any data into a working Webflow form in 60 seconds</div>
            <div className="lr-meta">
              <div className="lr-builder"><div className="lr-bav" style={{'background': '#ff5a72', 'color': '#fff'}}>S</div>Sara K.</div>
              <div className="lr-traction"><div className="lr-tr">⭐ 3.8</div><div className="lr-tr">💬 9 feedbacks</div><div className="lr-tr">👤 0 adopters</div></div>
              <div className="lr-cats"><span className="lr-cat">No-Code</span><span className="lr-cat">Automation</span></div>
            </div>
          </div>
          <div className="lr-actions">
            <button className="want-btn" >🌟 Want this</button>
            <button className="vote-btn" ><div className="vb-arr">▲</div><div className="vb-num">48</div></button>
          </div>
        </div>

        {/* Day divider */}
        <div className="day-divider">
          <div className="dd-label">April 5, 2026</div>
          <div className="dd-count">9 launches</div>
        </div>

        <div className="launch-row featured" >
          <div className="lr-rank r1">1</div>
          <div className="lr-icon" style={{'background': '#e6f5f2'}}>🌐</div>
          <div className="lr-info">
            <div className="lr-name-row"><div className="lr-name">CommunityOS</div><span className="lr-tag tag-featured">✦ Featured</span></div>
            <div className="lr-desc">The operating system for builder communities. Challenges, office hours, collab boards built in.</div>
            <div className="lr-meta">
              <div className="lr-builder"><div className="lr-bav" style={{'background': '#00c9a7', 'color': '#111'}}>D</div>Deependra Gaur · 3rd launch</div>
              <div className="lr-traction"><div className="lr-tr g">⭐ 4.8</div><div className="lr-tr">💬 47 feedbacks</div><div className="lr-tr g">👤 12 adopters</div></div>
              <div className="lr-cats"><span className="lr-cat">Community</span><span className="lr-cat">SaaS</span></div>
            </div>
          </div>
          <div className="lr-actions">
            <button className="want-btn wanted" >🌟 Wanted</button>
            <button className="vote-btn voted" ><div className="vb-arr">▲</div><div className="vb-num">428</div></button>
          </div>
        </div>

        <div className="launch-row">
          <div className="lr-rank r2">2</div>
          <div className="lr-icon" style={{'background': '#f7f0ff'}}>🎯</div>
          <div className="lr-info">
            <div className="lr-name-row"><div className="lr-name">FocusTime</div></div>
            <div className="lr-desc">Deep work sessions with accountability partners. Built for remote builders.</div>
            <div className="lr-meta">
              <div className="lr-builder"><div className="lr-bav" style={{'background': '#8b7aff', 'color': '#fff'}}>V</div>Vikram Rao</div>
              <div className="lr-traction"><div className="lr-tr g">⭐ 4.3</div><div className="lr-tr">💬 19 feedbacks</div><div className="lr-tr">👤 5 adopters</div></div>
              <div className="lr-cats"><span className="lr-cat">Productivity</span></div>
            </div>
          </div>
          <div className="lr-actions">
            <button className="want-btn" >🌟 Want this</button>
            <button className="vote-btn" ><div className="vb-arr">▲</div><div className="vb-num">241</div></button>
          </div>
        </div>

      </div>{/* /main-col */}

      {/* Right column */}
      <div className="right-col">

        {/* Today stats */}
        <div className="rc-card">
          <div className="rc-label">Today · Apr 6</div>
          <div className="stat-mini-grid">
            <div className="stat-mini"><div className="sm-n g">7</div><div className="sm-l">launches today</div></div>
            <div className="stat-mini"><div className="sm-n p">868</div><div className="sm-l">total votes</div></div>
            <div className="stat-mini"><div className="sm-n t">87</div><div className="sm-l">feedbacks given</div></div>
            <div className="stat-mini"><div className="sm-n o">18</div><div className="sm-l">early adopters</div></div>
          </div>
        </div>

        {/* Your draft */}
        <div className="rc-card">
          <div className="rc-label">Your drafts</div>
          <div className="draft-card">
            <div className="dc-header"><div className="dc-icon">🎯</div><div className="dc-name">FocusDock</div></div>
            <div className="dc-desc">8/10 reviews collected. Ready to launch.</div>
            <button className="dc-btn">Submit to Launches →</button>
          </div>
        </div>

        {/* Top supporters */}
        <div className="rc-card">
          <div className="rc-label">Top supporters today</div>
          <div className="top-voter">
            <div className="tv-rank r1">1</div>
            <div className="tv-av" style={{'background': '#c8f060', 'color': '#111'}}>R</div>
            <div style={{'flex': '1'}}><div className="tv-name">Rohan M.</div><div className="tv-role">Mumbai</div></div>
            <div className="tv-votes">12 votes</div>
          </div>
          <div className="top-voter">
            <div className="tv-rank r2">2</div>
            <div className="tv-av" style={{'background': '#00c9a7', 'color': '#111'}}>D</div>
            <div style={{'flex': '1'}}><div className="tv-name">Deependra G.</div><div className="tv-role">Bangalore</div></div>
            <div className="tv-votes">9 votes</div>
          </div>
          <div className="top-voter">
            <div className="tv-rank r3">3</div>
            <div className="tv-av" style={{'background': '#ff8c5a', 'color': '#111'}}>A</div>
            <div style={{'flex': '1'}}><div className="tv-name">Anika S.</div><div className="tv-role">Pune</div></div>
            <div className="tv-votes">7 votes</div>
          </div>
          <div className="top-voter">
            <div className="tv-rank">4</div>
            <div className="tv-av" style={{'background': '#8b7aff', 'color': '#fff'}}>V</div>
            <div style={{'flex': '1'}}><div className="tv-name">Vikram R.</div><div className="tv-role">Hyderabad</div></div>
            <div className="tv-votes">6 votes</div>
          </div>
        </div>

        {/* Trending tags */}
        <div className="rc-card">
          <div className="rc-label">Trending categories</div>
          <div className="tag-cloud">
            <div className="tc-tag on" >AI · 3</div>
            <div className="tc-tag" >Dev Tools · 2</div>
            <div className="tc-tag" >No-Code · 2</div>
            <div className="tc-tag" >Productivity</div>
            <div className="tc-tag" >Fintech</div>
            <div className="tc-tag" >Design</div>
          </div>
        </div>

        {/* Just happened */}
        <div className="rc-card" style={{'border': 'none', 'background': 'none', 'padding': '0'}}>
          <div className="rc-label">Just happened</div>
          <div className="activity-item"><div className="act-av" style={{'background': '#c8f060', 'color': '#111'}}>R</div><div className="act-text"><strong>Rohan</strong> got early adopter #4 on TaskFlow AI · 2m ago</div></div>
          <div className="activity-item"><div className="act-av" style={{'background': '#00c9a7', 'color': '#111'}}>D</div><div className="act-text"><strong>Deependra</strong> left feedback on DesignKit · 5m ago</div></div>
          <div className="activity-item"><div className="act-av" style={{'background': '#6be0ff', 'color': '#111'}}>M</div><div className="act-text"><strong>Miguel</strong> hit 100 votes on NoCodeAPI · 12m ago</div></div>
        </div>

      </div>
    </div>
  </div>
</main>
</div>{/* /shell */}

{/* ══════════════════════════════════════════
     PRODUCT DETAIL FULL-SCREEN PAGE
══════════════════════════════════════════ */}
<div className="detail-page" id="detail-page">
  {/* Detail topbar */}
  <div className="dp-topbar">
    <button className="dp-back" >← Back to Launches</button>
    <div className="dp-breadcrumb">Launches <span className="dp-sep">/</span> <span id="dp-breadcrumb-name">TaskFlow AI</span></div>
    <div className="dp-top-actions">
      <button className="tb-btn">🔗 Share</button>
      <button className="tb-btn">🚩 Report</button>
    </div>
  </div>

  <div className="dp-scroll">
    <div className="dp-layout">

      {/* ── Left ── */}
      <div className="dp-left">

        {/* Hero */}
        <div className="dp-hero">
          <div className="dp-prod-icon" id="dp-icon" style={{'background': '#f0f9d4'}}>📋</div>
          <div className="dp-prod-info">
            <div className="dp-prod-name" id="dp-name">TaskFlow AI</div>
            <div className="dp-prod-tagline" id="dp-tagline">AI-powered project management that learns how your team actually works</div>
            <div className="dp-cats" id="dp-cats">
              <span className="dp-cat">Productivity</span>
              <span className="dp-cat">Artificial Intelligence</span>
              <span className="dp-cat">SaaS</span>
            </div>
          </div>
        </div>

        {/* Action bar */}
        <div className="dp-action-bar">
          <button className="dp-vote-big" id="dp-vote-btn" >
            ▲ <span className="dp-vc" id="dp-votes">316</span>
          </button>
          <button className="dp-want-big" >🌟 Want this</button>
          <button className="dp-visit">↗ Visit product</button>
        </div>

        {/* Media gallery */}
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
            <div className="dp-thumb active" style={{'background': 'linear-gradient(135deg,#1a3a1a,#0f2010)', 'color': 'rgba(255,255,255,.5)', 'fontSize': '14px'}}>▶</div>
            <div className="dp-thumb" style={{'background': 'linear-gradient(135deg,#f0f9d4,#e0f0b0)', 'fontSize': '24px'}}>📋</div>
            <div className="dp-thumb" style={{'background': 'linear-gradient(135deg,#e8f5d4,#d4e8a0)', 'fontSize': '24px'}}>⚡</div>
            <div className="dp-thumb" style={{'background': 'linear-gradient(135deg,#d4f0e0,#b0e0cc)', 'fontSize': '24px'}}>📊</div>
            <div className="dp-thumb" style={{'background': 'linear-gradient(135deg,#f4f0ff,#e8e0ff)', 'fontSize': '24px'}}>🤖</div>
          </div>
        </div>

        {/* Description */}
        <div className="dp-description">
          <div className="dp-section-title">About this product</div>
          <div className="dp-desc-text" id="dp-description">
            <p><strong>TaskFlow AI</strong> is a project management tool that learns from how your team actually works — not how project managers think you should work.</p>
            <p>After 14 weeks building in public on NexFellow, Rohan redesigned the onboarding entirely based on community feedback. The result: <strong>drop rate fell from 68% to 31%</strong> in one iteration.</p>
            <p>The AI engine observes task completion patterns, meeting frequency, and communication cadence to surface the right tasks at the right time — without endless configuration.</p>
            <p><strong>What makes it different:</strong> Unlike Asana or Linear, TaskFlow doesn't require you to set up a perfect system. It adapts to your team's natural rhythm over the first 2 weeks.</p>
          </div>
        </div>

        {/* Traction */}
        <div style={{'marginBottom': '28px'}}>
          <div className="dp-section-title">Traction on NexFellow</div>
          <div className="dp-traction">
            <div className="tr-card"><div className="tr-num tr-g" id="dp-rating">4.2★</div><div className="tr-lbl">Community rating</div></div>
            <div className="tr-card"><div className="tr-num tr-p" id="dp-feedbacks">22</div><div className="tr-lbl">Feedbacks received</div></div>
            <div className="tr-card"><div className="tr-num tr-t" id="dp-adopters">4</div><div className="tr-lbl">Early adopters</div></div>
            <div className="tr-card"><div className="tr-num tr-o" id="dp-comments">316</div><div className="tr-lbl">Upvotes today</div></div>
          </div>
        </div>

        {/* Feedback section */}
        <div className="dp-feedback">
          <div className="dp-feedback-head">
            <div className="dp-section-title" style={{'marginBottom': '0'}}>Community Feedback</div>
            <div className="dp-feedback-count" id="dp-fb-count">22 feedbacks · avg 4.2★</div>
          </div>

          {/* Rating summary */}
          <div className="dp-rating-summary">
            <div style={{'textAlign': 'center', 'paddingRight': '12px', 'borderRight': '1px solid var(--b)'}}>
              <div className="dp-rating-big">4.2</div>
              <div className="dp-rating-stars">★★★★☆</div>
              <div className="dp-rating-sub">22 reviews</div>
            </div>
            <div className="dp-rating-bars">
              <div className="dp-rb-row"><div className="dp-rb-lbl">5</div><div className="dp-rb-track"><div className="dp-rb-fill" style={{'width': '55%'}}></div></div><div className="dp-rb-count">12</div></div>
              <div className="dp-rb-row"><div className="dp-rb-lbl">4</div><div className="dp-rb-track"><div className="dp-rb-fill" style={{'width': '25%'}}></div></div><div className="dp-rb-count">6</div></div>
              <div className="dp-rb-row"><div className="dp-rb-lbl">3</div><div className="dp-rb-track"><div className="dp-rb-fill" style={{'width': '9%'}}></div></div><div className="dp-rb-count">2</div></div>
              <div className="dp-rb-row"><div className="dp-rb-lbl">2</div><div className="dp-rb-track"><div className="dp-rb-fill" style={{'width': '5%'}}></div></div><div className="dp-rb-count">1</div></div>
              <div className="dp-rb-row"><div className="dp-rb-lbl">1</div><div className="dp-rb-track"><div className="dp-rb-fill" style={{'width': '5%'}}></div></div><div className="dp-rb-count">1</div></div>
            </div>
          </div>

          {/* Write feedback */}
          <div className="dp-write-feedback">
            <div className="dp-wf-head">
              <div className="dp-wf-av">R</div>
              <div>
                <div className="dp-wf-label">Leave feedback</div>
                <div className="dp-wf-sub">Your review helps the builder improve</div>
              </div>
            </div>
            <div className="dp-star-row" id="star-row">
              <div className="dp-star" >★</div>
              <div className="dp-star" >★</div>
              <div className="dp-star" >★</div>
              <div className="dp-star" >★</div>
              <div className="dp-star" >★</div>
            </div>
            <textarea className="dp-textarea" placeholder="What did you think? What could be improved? Specific feedback is more valuable than general praise." rows="3"></textarea>
            <div className="dp-wf-footer">
              <div className="dp-wf-tags">
                <button className="dp-wf-tag" >UX</button>
                <button className="dp-wf-tag" >Performance</button>
                <button className="dp-wf-tag" >Design</button>
                <button className="dp-wf-tag" >Feature request</button>
                <button className="dp-wf-tag" >Bug report</button>
              </div>
              <button className="dp-submit-btn">Submit feedback</button>
            </div>
          </div>

          {/* Feedback list */}
          <div id="dp-fb-list">
            <div className="dp-fb-card">
              <div className="dp-fb-top">
                <div className="dp-fb-av" style={{'background': '#6be0ff', 'color': '#111'}}>M</div>
                <div>
                  <div className="dp-fb-name">Miguel Torres</div>
                  <div className="dp-fb-role">Full-stack · Bangalore · Verified Builder</div>
                </div>
                <div className="dp-fb-stars" style={{'marginLeft': 'auto'}}>★★★★★</div>
                <div className="dp-fb-time">2h ago</div>
              </div>
              <div className="dp-fb-text">The AI task suggestion is genuinely magic. Cut my morning planning time in half. The way it learns your rhythm over the first week is unlike anything else I've tried. The onboarding is finally smooth — you can tell they iterated a lot on it.</div>
              <div className="dp-fb-tags">
                <span className="dp-fb-tag fbt-ux">UX</span>
                <span className="dp-fb-tag fbt-feature">Feature ✦</span>
              </div>
              <div className="dp-fb-actions">
                <button className="dp-fb-btn" >👍 Helpful</button>
                <button className="dp-fb-btn">💬 Reply</button>
                <div className="dp-helpful">3 found this helpful</div>
              </div>
            </div>

            <div className="dp-fb-card">
              <div className="dp-fb-top">
                <div className="dp-fb-av" style={{'background': '#00c9a7', 'color': '#111'}}>D</div>
                <div>
                  <div className="dp-fb-name">Deependra Gaur</div>
                  <div className="dp-fb-role">Full-stack · Community Builder · Bangalore</div>
                </div>
                <div className="dp-fb-stars" style={{'marginLeft': 'auto'}}>★★★★☆</div>
                <div className="dp-fb-time">4h ago</div>
              </div>
              <div className="dp-fb-text">Dark mode contrast still needs work in the sidebar — some text is hard to read. But the core product is excellent. The AI prediction accuracy improved a lot since the last launch. Would love calendar integration to be prioritized.</div>
              <div className="dp-fb-tags">
                <span className="dp-fb-tag fbt-design">Design</span>
                <span className="dp-fb-tag fbt-feature">Feature request</span>
              </div>
              <div className="dp-fb-actions">
                <button className="dp-fb-btn">👍 Helpful</button>
                <button className="dp-fb-btn">💬 Reply</button>
                <div className="dp-helpful">1 found this helpful</div>
              </div>
            </div>

            <div className="dp-fb-card">
              <div className="dp-fb-top">
                <div className="dp-fb-av" style={{'background': '#ff8c5a', 'color': '#111'}}>A</div>
                <div>
                  <div className="dp-fb-name">Anika Sharma</div>
                  <div className="dp-fb-role">Designer · Indie Hacker · Pune</div>
                </div>
                <div className="dp-fb-stars" style={{'marginLeft': 'auto'}}>★★★★★</div>
                <div className="dp-fb-time">5h ago</div>
              </div>
              <div className="dp-fb-text">Switched from Notion to TaskFlow last week. The setup took 5 minutes compared to hours. I didn't realize how much cognitive load Notion was adding until I felt the difference. Genuinely recommend for solo founders and tiny teams.</div>
              <div className="dp-fb-tags">
                <span className="dp-fb-tag fbt-ux">UX</span>
                <span className="dp-fb-tag fbt-perf">Performance</span>
              </div>
              <div className="dp-fb-actions">
                <button className="dp-fb-btn">👍 Helpful</button>
                <button className="dp-fb-btn">💬 Reply</button>
                <div className="dp-helpful">5 found this helpful</div>
              </div>
            </div>

            <div className="dp-fb-card">
              <div className="dp-fb-top">
                <div className="dp-fb-av" style={{'background': '#f0c040', 'color': '#111'}}>K</div>
                <div>
                  <div className="dp-fb-name">Karan Shah</div>
                  <div className="dp-fb-role">Fintech Builder · Mumbai</div>
                </div>
                <div className="dp-fb-stars" style={{'marginLeft': 'auto'}}>★★★☆☆</div>
                <div className="dp-fb-time">6h ago</div>
              </div>
              <div className="dp-fb-text">Still feels a bit slow when loading for the first time, especially on mobile. The AI predictions are impressive but I wish there was more transparency on how they're generated. The analytics tab is a great addition though.</div>
              <div className="dp-fb-tags">
                <span className="dp-fb-tag fbt-perf">Performance</span>
                <span className="dp-fb-tag fbt-bug">Bug</span>
              </div>
              <div className="dp-fb-actions">
                <button className="dp-fb-btn">👍 Helpful</button>
                <button className="dp-fb-btn">💬 Reply</button>
                <div className="dp-helpful">2 found this helpful</div>
              </div>
            </div>
          </div>
        </div>

      </div>{/* /dp-left */}

      {/* ── Right ── */}
      <div className="dp-right">

        {/* Builder card */}
        <div className="dp-r-card">
          <div className="dp-r-label">Builder</div>
          <div style={{'display': 'flex', 'alignItems': 'center', 'gap': '11px', 'marginBottom': '12px'}}>
            <div className="dp-builder-av" id="dp-builder-av" style={{'background': '#c8f060', 'color': '#111'}}>R</div>
            <div className="dp-builder-info">
              <strong id="dp-builder-name">Rohan Mehta</strong>
              <span id="dp-builder-role">Founder · SaaS · Mumbai</span>
            </div>
          </div>
          <div className="dp-builder-stats">
            <div className="dp-bs"><span className="n" style={{'color': 'var(--G)'}} id="dp-credits">124</span><span className="l">credits</span></div>
            <div className="dp-bs"><span className="n" style={{'color': 'var(--P)'}} id="dp-reviews-given">31</span><span className="l">reviews given</span></div>
            <div className="dp-bs"><span className="n" style={{'color': 'var(--T)'}} id="dp-launches-count">2</span><span className="l">launches</span></div>
          </div>
          <div className="dp-builder-note" id="dp-builder-note">
            Rohan's been building TaskFlow for 14 weeks in public on NexFellow. This is his second launch — the first got 12 feedbacks and led to a full onboarding redesign.
          </div>
        </div>

        {/* Early adopters */}
        <div className="dp-r-card">
          <div className="dp-r-label">Early Adopters <span style={{'fontWeight': '400', 'textTransform': 'none', 'letterSpacing': '0', 'fontSize': '11px', 'color': 'var(--tx3)'}}>4 so far</span></div>
          <div className="dp-adopters">
            <div className="dp-adopter-av" style={{'background': '#c8f060', 'color': '#111'}}>R</div>
            <div className="dp-adopter-av" style={{'background': '#00c9a7', 'color': '#111'}}>D</div>
            <div className="dp-adopter-av" style={{'background': '#ff8c5a', 'color': '#111'}}>A</div>
            <div className="dp-adopter-av" style={{'background': '#6be0ff', 'color': '#111'}}>M</div>
            <div className="dp-adopt-more">+0 adopters</div>
          </div>
          <button className="dp-adopt-cta">Become an early adopter →</button>
        </div>

        {/* Build timeline */}
        <div className="dp-r-card">
          <div className="dp-r-label">Build Timeline</div>
          <div className="dp-timeline">
            <div className="dp-tl-item">
              <div className="dp-tl-dot done">✓</div>
              <div className="dp-tl-info">
                <div className="dp-tl-title">1st launch</div>
                <div className="dp-tl-meta">Mar 10 · 12 feedbacks · redesigned onboarding</div>
              </div>
            </div>
            <div className="dp-tl-item">
              <div className="dp-tl-dot done">✓</div>
              <div className="dp-tl-info">
                <div className="dp-tl-title">Drop rate: 68% → 31%</div>
                <div className="dp-tl-meta">2 weeks after redesign · NexFellow pipeline</div>
              </div>
            </div>
            <div className="dp-tl-item">
              <div className="dp-tl-dot done">✓</div>
              <div className="dp-tl-info">
                <div className="dp-tl-title">2nd launch · today</div>
                <div className="dp-tl-meta">v2.1 · AI engine + team analytics</div>
              </div>
            </div>
            <div className="dp-tl-item">
              <div className="dp-tl-dot">→</div>
              <div className="dp-tl-info">
                <div className="dp-tl-title">Next: calendar integration</div>
                <div className="dp-tl-meta">Most-requested · targeting May 2026</div>
              </div>
            </div>
          </div>
        </div>

        {/* Related launches */}
        <div className="dp-r-card">
          <div className="dp-r-label">Similar launches</div>
          <div className="dp-related-item" >
            <div className="dp-rel-icon" style={{'background': '#f7f0ff'}}>🎯</div>
            <div>
              <div className="dp-rel-name">FocusDock</div>
              <div style={{'fontSize': '11px', 'color': 'var(--tx3)'}}>Productivity · SaaS</div>
            </div>
            <div className="dp-rel-votes">▲ 241</div>
          </div>
          <div className="dp-related-item" >
            <div className="dp-rel-icon" style={{'background': '#e6f5f2'}}>🌐</div>
            <div>
              <div className="dp-rel-name">CommunityOS</div>
              <div style={{'fontSize': '11px', 'color': 'var(--tx3)'}}>Community · SaaS</div>
            </div>
            <div className="dp-rel-votes">▲ 428</div>
          </div>
          <div className="dp-related-item">
            <div className="dp-rel-icon" style={{'background': '#e6f5f2'}}>🧘</div>
            <div>
              <div className="dp-rel-name">Habitual</div>
              <div style={{'fontSize': '11px', 'color': 'var(--tx3)'}}>Health · Mobile</div>
            </div>
            <div className="dp-rel-votes">▲ 74</div>
          </div>
        </div>

      </div>{/* /dp-right */}
    </div>{/* /dp-layout */}
  </div>{/* /dp-scroll */}
</div>{/* /detail-page */}


    </div>
  );
}
