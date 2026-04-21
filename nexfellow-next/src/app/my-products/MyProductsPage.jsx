'use client';
import React, { useState } from 'react';
import PrivateLayout from '../../layouts/PrivateLayout';
import './my-products.css';

// ── Data ────────────────────────────────────────────────────────────────────

const PRODUCTS = [
  {
    id: 1,
    name: 'TaskFlow AI',
    category: 'Productivity · SaaS',
    stage: 'LAUNCHED',
    stageColor: 'green',
    status: 'DONE',
    statusColor: 'blue',
    reviewsCount: 12,
    reviewsTotal: 12,
    rating: 4.2,
    feedback: [
      {
        id: 1,
        name: 'Arjun S.',
        round: 'Round 2',
        time: '2h ago',
        isNew: true,
        rating: 4.0,
        stars: 4,
        tags: ['UX', 'PRICING', 'MOBILE'],
        text: 'The onboarding is smooth but the pricing page caused confusion — users aren\'t clear on the difference between Starter and Pro. A comparison table would help a lot. Also the CTA button on mobile is hidden below the fold on smaller screens.',
        helpfulCount: 18,
        replies: [
          { avatar: 'ME', time: '1h ago', text: 'Thanks Priya! Dark mode is on our roadmap for Q2. Will keep this in mind.' }
        ]
      },
      {
        id: 2,
        name: 'Priya M.',
        round: 'Round 2',
        time: '5h ago',
        isNew: false,
        rating: 5.0,
        stars: 5,
        tags: ['POSITIVE', 'MOBILE'],
        text: 'Love the AI suggestions — genuinely saved me time in my morning planning. The mobile sidebar overlaps on screens under 375px. Overall really polished product, the onboarding video is a nice touch.',
        helpfulCount: 112,
        replies: []
      },
      {
        id: 3,
        name: 'David L.',
        round: 'Round 1',
        time: '1d ago',
        isNew: false,
        rating: 3.5,
        stars: 3,
        tags: ['PERFORMANCE', 'FEATURE REQ'],
        text: 'Good concept but needs work on performance. Loading times are noticeably slow on the dashboard page. Also, would be great to have keyboard shortcuts for power users.',
        helpfulCount: 9,
        replies: []
      }
    ]
  },
  {
    id: 2,
    name: 'Habitual',
    category: 'Health · Mobile',
    stage: 'MVP',
    stageColor: 'purple',
    status: 'IN REVIEW',
    statusColor: 'orange',
    reviewsCount: 7,
    reviewsTotal: 10,
    rating: null,
    feedback: []
  },
  {
    id: 3,
    name: 'ShipLog',
    category: 'Developer · API',
    stage: 'LAUNCHED',
    stageColor: 'green',
    status: 'DONE',
    statusColor: 'blue',
    reviewsCount: 12,
    reviewsTotal: 12,
    rating: 4.4,
    feedback: []
  },
  {
    id: 4,
    name: 'FocusDock',
    category: 'Productivity · Web',
    stage: 'DRAFT',
    stageColor: 'gray',
    status: 'PAUSE',
    statusColor: 'gray',
    reviewsCount: 0,
    reviewsTotal: 0,
    rating: null,
    feedback: []
  }
];

const CATEGORIES = [
  { id: 'saas', icon: '📊', label: 'SaaS / Productivity' },
  { id: 'ai', icon: '🤖', label: 'AI / ML tools' },
  { id: 'dev', icon: '💻', label: 'Dev tools' },
  { id: 'mobile', icon: '📱', label: 'Mobile app' },
  { id: 'health', icon: '💚', label: 'Health / Wellness' },
  { id: 'finance', icon: '💰', label: 'Finance' },
  { id: 'education', icon: '🎓', label: 'Education' },
  { id: 'ecommerce', icon: '🛒', label: 'E-commerce' },
  { id: 'other', icon: '◆', label: 'Other' },
];

const BUILD_STAGES = ['Idea', 'Prototype', 'MVP', 'Beta', 'Launched'];

const FOCUS_AREAS = [
  { id: 'onboarding', title: 'Onboarding & first impression', desc: 'Easy to understand and get started with?' },
  { id: 'pricing', title: 'Pricing & willingness to pay', desc: 'Does the pricing feel fair?' },
  { id: 'ux', title: 'UX & design clarity', desc: 'Is the interface intuitive?' },
  { id: 'value', title: 'Value proposition & messaging', desc: "Is it clear who it's for?" },
  { id: 'features', title: 'Feature completeness', desc: "What's missing that would make this a must-use?" },
  { id: 'market', title: 'Market fit & competition', desc: 'How does it stand out vs alternatives?' },
];

const REVIEWER_TYPES = ['Founders', 'Designers', 'Developers', 'Marketers', 'Any builder'];

const FEEDBACK_TAGS = ['All', 'UX', 'PRICING', 'MOBILE', 'POSITIVE', 'PERFORMANCE'];

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({ icon, label, value, sub, color }) {
  return (
    <div className="mp-stat-card">
      <div className="mp-stat-icon" style={{ background: color }}>{icon}</div>
      <div className="mp-stat-body">
        <div className="mp-stat-label">{label}</div>
        <div className="mp-stat-value">{value}</div>
        <div className="mp-stat-sub">{sub}</div>
      </div>
    </div>
  );
}

function RatingStars({ count, rating }) {
  return (
    <div className="mp-stars">
      {[1,2,3,4,5].map(i => (
        <span key={i} className={i <= Math.round(rating) ? 'mp-star filled' : 'mp-star'}>{i <= Math.round(rating) ? '★' : '☆'}</span>
      ))}
      <span className="mp-rating-val">{rating}</span>
    </div>
  );
}

function TagPill({ label }) {
  const colorMap = {
    UX: 'tag-ux', PRICING: 'tag-pricing', MOBILE: 'tag-mobile',
    POSITIVE: 'tag-positive', PERFORMANCE: 'tag-performance', 'FEATURE REQ': 'tag-feature'
  };
  return <span className={`mp-tag-pill ${colorMap[label] || 'tag-default'}`}>{label}</span>;
}

function FeedbackCard({ fb, productId }) {
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState('');

  return (
    <div className="mp-fb-card">
      <div className="mp-fb-header">
        <div className="mp-fb-avatar">{fb.name.charAt(0)}</div>
        <div className="mp-fb-meta">
          <span className="mp-fb-name">{fb.name}</span>
          <span className="mp-fb-round">{fb.round}</span>
          <span className="mp-fb-dot">·</span>
          <span className="mp-fb-time">{fb.time}</span>
          {fb.isNew && <span className="mp-fb-new-badge">NEW</span>}
        </div>
        <div className="mp-fb-stars-row">
          {'★'.repeat(fb.stars)}{'☆'.repeat(5 - fb.stars)}
          <span className="mp-fb-rating-num"> {fb.rating.toFixed(1)}</span>
        </div>
      </div>
      <div className="mp-fb-tags-row">
        {fb.tags.map(t => <TagPill key={t} label={t} />)}
      </div>
      <p className="mp-fb-text">{fb.text}</p>

      {fb.replies.map((r, i) => (
        <div key={i} className="mp-fb-reply">
          <div className="mp-fb-reply-avatar">{r.avatar}</div>
          <div className="mp-fb-reply-body">
            <span className="mp-fb-reply-time">{r.time}</span>
            <p className="mp-fb-reply-text">{r.text}</p>
          </div>
        </div>
      ))}

      <div className="mp-fb-actions-row">
        <button className="mp-fb-action-btn" onClick={() => setReplyOpen(v => !v)}>↩ Reply</button>
        <button className="mp-fb-action-btn">👍 Helpful ({fb.helpfulCount})</button>
        <span className="mp-fb-resolved">Mark resolved</span>
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
            <button className="mp-btn-primary">✈ Send reply</button>
          </div>
        </div>
      )}
    </div>
  );
}

function ProductRow({ product, expanded, onToggle }) {
  const [activeTag, setActiveTag] = useState('All');

  const filteredFeedback = activeTag === 'All'
    ? product.feedback
    : product.feedback.filter(f => f.tags.includes(activeTag));

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
          <span className={`mp-stage-badge mp-stage-${product.stageColor}`}>{product.stage}</span>
        </td>
        <td className="mp-td">
          <span className={`mp-status-badge mp-status-${product.statusColor}`}>{product.status}</span>
        </td>
        <td className="mp-td">
          {product.reviewsTotal > 0
            ? <span className="mp-reviews-count">{product.reviewsCount}/{product.reviewsTotal}</span>
            : <span className="mp-muted">—</span>}
        </td>
        <td className="mp-td">
          {product.rating ? (
            <div className="mp-rating-cell">
              <span className="mp-rating-star">★</span>
              <span className="mp-rating-num">{product.rating}</span>
            </div>
          ) : <span className="mp-muted">—</span>}
        </td>
        <td className="mp-td mp-td-action" onClick={e => e.stopPropagation()}>
          <div className="mp-action-cell">
            <div className="mp-action-btns">
              {(product.stage === 'LAUNCHED' || product.stage === 'MVP') && (
                <>
                  <button className="mp-action-resubmit">Re-submit</button>
                  <button className="mp-action-analysis">Analysis</button>
                </>
              )}
              {product.stage === 'DRAFT' && (
                <button className="mp-action-submit">Submit</button>
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
                <span className="mp-feedback-count">Feedback ({product.feedback.length})</span>
                {product.feedback.length > 0 && (
                  <div className="mp-feedback-tags">
                    {FEEDBACK_TAGS.map(t => (
                      <button
                        key={t}
                        className={`mp-filter-tag ${activeTag === t ? 'active' : ''}`}
                        onClick={() => setActiveTag(t)}
                      >{t}</button>
                    ))}
                  </div>
                )}
              </div>
              {product.feedback.length > 0 ? (
                <div className="mp-feedback-list">
                  {filteredFeedback.map(fb => <FeedbackCard key={fb.id} fb={fb} />)}
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
          placeholder="What problem does it solve? Who is it for? What makes it different?&#10;&#10;Be specific — reviewers give better feedback when they understand your target user."
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
  const [screenshots, setScreenshots] = useState(form.screenshots || [
    { name: 'dashboard-main.png', size: '1.2 MB' },
    { name: 'onboarding-flow.png', size: '640 kb' },
  ]);

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
              className="mp-input mp-input-prefixed"
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
        </div>
        <div className="mp-form-group">
          <label className="mp-label">GITHUB <span className="mp-optional">(optional)</span></label>
          <div className="mp-input-prefix">
            <span className="mp-prefix">github.com/</span>
            <input
              className="mp-input mp-input-prefixed"
              placeholder="username/repo"
              value={form.github}
              onChange={e => setForm(f => ({ ...f, github: e.target.value }))}
            />
          </div>
        </div>
        <div className="mp-form-group">
          <label className="mp-label">PRODUCT HUNT <span className="mp-optional">(optional)</span></label>
          <div className="mp-input-prefix">
            <span className="mp-prefix">ph.co/posts/</span>
            <input
              className="mp-input mp-input-prefixed"
              placeholder="your-product"
              value={form.productHunt}
              onChange={e => setForm(f => ({ ...f, productHunt: e.target.value }))}
            />
          </div>
        </div>
      </div>

      <div className="mp-form-group">
        <label className="mp-label">SCREENSHOTS <span className="mp-optional">(up to 5)</span></label>
        <div className="mp-upload-zone">
          <div className="mp-upload-icon">⬆</div>
          <p className="mp-upload-text">Drop screenshots or click to browse</p>
          <p className="mp-upload-hint">PNG, JPG up to 5MB · ideal: 1280 × 800</p>
        </div>
        <div className="mp-screenshot-list">
          {screenshots.map((s, i) => (
            <div key={i} className="mp-screenshot-item">
              <div className="mp-screenshot-thumb">🖼</div>
              <div className="mp-screenshot-info">
                <span className="mp-screenshot-name">{s.name}</span>
                <span className="mp-screenshot-size">{s.size}</span>
              </div>
              <button className="mp-screenshot-remove" onClick={() => setScreenshots(ss => ss.filter((_, j) => j !== i))}>✕</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StepReview({ form, onEdit }) {
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
          <span className="mp-review-val">{form.name || 'FocusDock'}</span>
        </div>
        <div className="mp-review-field">
          <span className="mp-review-label">TAGLINE</span>
          <span className="mp-review-val">{form.tagline || 'A distraction-free workspace for solo builders'}</span>
        </div>
        <div className="mp-review-row">
          <div className="mp-review-field">
            <span className="mp-review-label">CATEGORY</span>
            <span className="mp-review-val mp-not-set">{form.category ? CATEGORIES.find(c=>c.id===form.category)?.label : 'Not selected'}</span>
          </div>
          <div className="mp-review-field">
            <span className="mp-review-label">BUILD STAGE</span>
            <span className={`mp-review-val ${!form.buildStage ? 'mp-not-set-orange' : ''}`}>{form.buildStage || 'NOT SELECTED'}</span>
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
          <span className="mp-review-val mp-not-set">
            {form.focusAreas.length > 0
              ? form.focusAreas.map(id => FOCUS_AREAS.find(f => f.id === id)?.title).join(', ')
              : 'No focus areas selected'}
          </span>
        </div>
        <div className="mp-review-tip">
          <span className="mp-tip-icon">💡</span>
          Tip: Reviewers will prioritize these areas when giving feedback. The more specific you are, the more actionable their comments will be.
        </div>
      </div>

      <div className="mp-review-section">
        <div className="mp-review-section-header">
          <span className="mp-review-section-name">LINKS & MEDIA</span>
          <button className="mp-review-edit" onClick={() => onEdit(3)}>Edit</button>
        </div>
        <div className="mp-review-row">
          <div className="mp-review-field">
            <span className="mp-review-label">PRODUCT URL</span>
            <span className="mp-review-val mp-link">{form.productUrl ? `https://${form.productUrl}` : 'https://focusdock.app'}</span>
          </div>
          <div className="mp-review-field">
            <span className="mp-review-label">DEMO VIDEO</span>
            <span className="mp-review-val mp-not-set">Not provided</span>
          </div>
        </div>
        <div className="mp-review-field">
          <span className="mp-review-label">SCREENSHOTS</span>
          <div className="mp-review-screenshots">
            {['dashboard-main.png · 1.2 MB', 'onboarding-flow.png · 640 kb'].map((s, i) => (
              <div key={i} className="mp-review-screenshot-item">
                <span className="mp-review-screenshot-dot">🟢</span>
                <span>{s}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mp-review-timeline">
        <div className="mp-review-timeline-title">What happens after you submit</div>
        {[
          { label: 'Your product goes into the review queue', sub: "We'll match you with builders in your category", time: 'Instant', icon: '✅' },
          { label: 'Matched to 8–10 reviewers based on your focus areas', sub: "Active builders who've reviewed similar products", time: '2–4 hours', icon: '✅' },
          { label: 'First reviews start coming in', sub: "You'll get email + dashboard notifications.", time: '6–12 hours', icon: '✅' },
          { label: 'Full review round completes', sub: 'Most products get 8–10 detailed reviews.', time: '24–48 hours', icon: '✅' },
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

function NewSubmissionModal({ onClose }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '', tagline: '', description: '', category: '', buildStage: '',
    focusAreas: [], specificQuestion: '', reviewerType: '',
    productUrl: '', demoVideo: '', github: '', productHunt: '',
    screenshots: []
  });

  const STEPS = ['Basics', 'Focus', 'Links', 'Review'];

  return (
    <div className="mp-modal-overlay" onClick={onClose}>
      <div className="mp-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="mp-modal-header">
          <span className="mp-modal-title">New submission</span>
          <span className="mp-modal-step-info">Step {step} of 4</span>
          <button className="mp-modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Step progress */}
        <div className="mp-step-bar">
          {STEPS.map((s, i) => (
            <div
              key={s}
              className={`mp-step-item ${i + 1 < step ? 'done' : ''} ${i + 1 === step ? 'active' : ''}`}
              onClick={() => i + 1 < step && setStep(i + 1)}
            >
              <div className="mp-step-circle">
                {i + 1 < step ? '✓' : i + 1}
              </div>
              <span className="mp-step-label">{s}</span>
            </div>
          ))}
          {/* connector lines */}
        </div>

        {/* Body */}
        <div className="mp-modal-body">
          {step === 1 && <StepBasics form={form} setForm={setForm} />}
          {step === 2 && <StepFocus form={form} setForm={setForm} />}
          {step === 3 && <StepLinks form={form} setForm={setForm} />}
          {step === 4 && <StepReview form={form} onEdit={setStep} />}
        </div>

        {/* Footer */}
        <div className="mp-modal-footer">
          <span className="mp-autosave">Auto-saved</span>
          {step > 1 && (
            <button className="mp-btn-ghost" onClick={() => setStep(s => s - 1)}>Back</button>
          )}
          <button className="mp-btn-ghost">Save draft</button>
          {step < 4 ? (
            <button className="mp-btn-primary" onClick={() => setStep(s => s + 1)}>Continue</button>
          ) : (
            <button className="mp-btn-submit" onClick={onClose}>Submit for feedback</button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function MyProductsPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [expandedId, setExpandedId] = useState(1);
  const [showModal, setShowModal] = useState(false);

  const tabs = [
    { id: 'all', label: 'All (4)' },
    { id: 'inreview', label: 'In review (2)' },
    { id: 'launched', label: 'Launched (1)' },
    { id: 'draft', label: 'Draft (1)' },
    { id: 'archived', label: 'Archived (0)' },
  ];

  const filteredProducts = PRODUCTS.filter(p => {
    if (activeTab === 'all') return true;
    if (activeTab === 'inreview') return p.status === 'IN REVIEW';
    if (activeTab === 'launched') return p.stage === 'LAUNCHED';
    if (activeTab === 'draft') return p.stage === 'DRAFT';
    if (activeTab === 'archived') return false;
    return true;
  });

  return (
    <PrivateLayout>
      <div className="mp-page">
        {/* Top actions bar */}
        <div className="mp-topbar">
          <h1 className="mp-topbar-title">My products</h1>
          <div className="mp-topbar-actions">
            <button className="mp-action-btn-ghost">
              <span>⚡</span> Filter
            </button>
            <button className="mp-action-btn-ghost">
              <span>↕</span> Sort
            </button>
            <button className="mp-action-btn-ghost">
              <span>↗</span> Export
            </button>
            <button className="mp-action-btn-primary" onClick={() => setShowModal(true)}>
              + New submission
            </button>
          </div>
        </div>

        {/* Alert banner */}
        <div className="mp-alert-banner">
          <span className="mp-alert-arrow">←</span>
          <span className="mp-alert-text">
            <strong>TaskFlow AI</strong> has 5 unread reviews — 3 mention onboarding friction. Responding within 24h boosts engagement.
          </span>
          <button className="mp-alert-view">View</button>
        </div>

        {/* Stats row */}
        <div className="mp-stats-row">
          <StatCard
            icon="📦"
            label="TOTAL PRODUCTS"
            value="4"
            sub="+2 this month"
            color="#e8f4e8"
          />
          <StatCard
            icon="💬"
            label="TOTAL REVIEWS"
            value="62"
            sub="+14 this month"
            color="#e8f0fe"
          />
          <StatCard
            icon="💵"
            label="AVG. RATING"
            value="4.1"
            sub="↑0.3 vs last round"
            color="#e8f8f0"
          />
          <StatCard
            icon="⭐"
            label="RESPONSE RATE"
            value="94%"
            sub="↑8% this week"
            color="#fff8e8"
          />
        </div>

        {/* Filter tabs */}
        <div className="mp-tabs">
          {tabs.map(t => (
            <button
              key={t.id}
              className={`mp-tab ${activeTab === t.id ? 'active' : ''}`}
              onClick={() => setActiveTab(t.id)}
            >{t.label}</button>
          ))}
        </div>

        {/* Product table */}
        <div className="mp-table-wrap">
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
              {filteredProducts.map(p => (
                <ProductRow
                  key={p.id}
                  product={p}
                  expanded={expandedId === p.id}
                  onToggle={() => setExpandedId(expandedId === p.id ? null : p.id)}
                />
              ))}
            </tbody>
          </table>
        </div>

        {/* New Submission Modal */}
        {showModal && <NewSubmissionModal onClose={() => setShowModal(false)} />}
      </div>
    </PrivateLayout>
  );
}
