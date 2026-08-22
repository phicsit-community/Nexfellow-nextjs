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
  'AI/ML tools': { icon: '🤖', bg: '#e6f0ff' },
  'Dev tools': { icon: '💻', bg: '#f0eeff' },
  'Mobile app': { icon: '📱', bg: '#fff5f0' },
  'Health/Wellness': { icon: '💚', bg: '#e6f5f2' },
  'Finance': { icon: '💰', bg: '#fef9e7' },
  'Education': { icon: '🎓', bg: '#f0f9d4' },
  'E-commerce': { icon: '🛒', bg: '#fce4ec' },
  'Other': { icon: '◆', bg: '#f5f5f5' },
};

const ORDINALS = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th'];

const TAB_API = { 'Weekly': 'week', 'All Time': 'alltime' };

const REVIEW_TAG_CLASS = {
  'UX': 'fbt-ux',
  'PRICING': 'fbt-bug',
  'MOBILE': 'fbt-feature',
  'POSITIVE': 'fbt-design',
  'PERFORMANCE': 'fbt-perf',
  'FEATURE REQ': 'fbt-feature',
};

const REVIEW_TAGS = ['UX', 'PRICING', 'MOBILE', 'POSITIVE', 'PERFORMANCE', 'FEATURE REQ'];


function UpvoteIcon({ className, style }) {
  return (
    <svg width="12" height="7" viewBox="0 0 12 7" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
      <path d="M0.328125 4.81641L4.79297 0.316406C5.05078 0.105469 5.33203 0 5.63672 0C5.94141 0 6.21094 0.105469 6.44531 0.316406L10.9102 4.81641C11.2383 5.19141 11.3203 5.60156 11.1562 6.04688C10.9688 6.49219 10.6172 6.72656 10.1016 6.75H1.13672C0.644531 6.72656 0.292969 6.49219 0.0820312 6.04688C-0.0820312 5.60156 0 5.19141 0.328125 4.81641Z" fill="currentColor" />
    </svg>
  );
}

function CommentIcon({ className, style }) {
  return (
    <svg width="14" height="13" viewBox="0 0 14 13" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M7.00322 0C5.69072 0.0182292 4.51494 0.273438 3.47587 0.765625C2.41858 1.27604 1.58004 1.95964 0.960248 2.81641C0.340456 3.67318 0.0214461 4.63021 0.00321691 5.6875C0.0396752 7.01823 0.522748 8.16667 1.45244 9.13281C1.21546 9.69792 0.951134 10.1628 0.659467 10.5273C0.3678 10.9102 0.212852 11.1107 0.194623 11.1289C-0.00589767 11.3477 -0.0514706 11.5846 0.0579044 11.8398C0.185509 12.0951 0.386029 12.2318 0.659467 12.25C1.49801 12.2318 2.23629 12.0951 2.87431 11.8398C3.51233 11.5664 4.04098 11.2839 4.46025 10.9922C5.2441 11.2474 6.09176 11.375 7.00322 11.375C8.29749 11.3568 9.47327 11.1016 10.5306 10.6094C11.5696 10.099 12.399 9.41536 13.0188 8.55859C13.6386 7.70182 13.9576 6.74479 13.9759 5.6875C13.9576 4.63021 13.6386 3.67318 13.0188 2.81641C12.399 1.95964 11.5696 1.27604 10.5306 0.765625C9.47327 0.273438 8.29749 0.0182292 7.00322 0ZM7.00322 10.0625C6.27405 10.0625 5.56311 9.95312 4.8704 9.73438L4.2415 9.54297L3.69462 9.92578C3.31181 10.2174 2.79228 10.4818 2.13603 10.7188C2.33655 10.3724 2.51884 9.9987 2.6829 9.59766L2.95634 8.83203L2.40947 8.23047C2.15426 7.97526 1.90816 7.62891 1.67119 7.19141C1.45244 6.77214 1.33395 6.27083 1.31572 5.6875C1.35218 4.44792 1.90816 3.41797 2.98369 2.59766C4.05921 1.77734 5.39905 1.34896 7.00322 1.3125C8.60738 1.34896 9.94723 1.77734 11.0227 2.59766C12.0983 3.41797 12.6543 4.44792 12.6907 5.6875C12.6543 6.92708 12.0983 7.95703 11.0227 8.77734C9.94723 9.59766 8.60738 10.026 7.00322 10.0625Z" fill="#64748B" />
    </svg>

  );
}

function BookmarkIcon({ filled, className, style }) {
  return (
    <svg width="16" height="21" viewBox="0 0 16 21" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M11.8125 0H1.6875C1.21875 0.0234375 0.820312 0.1875 0.492188 0.492188C0.1875 0.820312 0.0234375 1.21875 0 1.6875V16.875C0.0234375 17.3203 0.210938 17.6484 0.5625 17.8594C0.914062 18.0469 1.28906 18.0469 1.6875 17.8594L6.75 14.9062L11.8125 17.8594C12.2109 18.0469 12.5859 18.0352 12.9375 17.8242C13.2891 17.6367 13.4766 17.3203 13.5 16.875V1.6875C13.4766 1.21875 13.3125 0.820312 13.0078 0.492188C12.6797 0.1875 12.2812 0.0234375 11.8125 0ZM11.8125 15.8906L6.75 12.9375L1.6875 15.8906V1.89844C1.71094 1.75781 1.76953 1.6875 1.86328 1.6875H11.5664C11.7305 1.6875 11.8125 1.75781 11.8125 1.89844V15.8906Z" fill="#94A3B8" />
    </svg>


  );
}

const RANK_BADGE_CROWN = "M14.4996 5.30859L13.0347 2.90625C12.9826 2.80208 12.898 2.75 12.7808 2.75H10.4371C10.3069 2.76302 10.2157 2.82161 10.1636 2.92578C10.1115 3.02995 10.1181 3.13411 10.1832 3.23828L12.3511 6.34375C12.9501 5.79688 13.6662 5.45182 14.4996 5.30859ZM15.1246 5.875C14.148 5.90104 13.3407 6.23958 12.7027 6.89062C12.0516 7.52865 11.7131 8.33594 11.6871 9.3125C11.7131 10.2891 12.0516 11.0964 12.7027 11.7344C13.3407 12.3854 14.148 12.724 15.1246 12.75C16.1011 12.724 16.9084 12.3854 17.5464 11.7344C18.1975 11.0964 18.536 10.2891 18.5621 9.3125C18.536 8.33594 18.1975 7.52865 17.5464 6.89062C16.9084 6.23958 16.1011 5.90104 15.1246 5.875ZM16.941 8.94141L16.1988 9.66406L16.355 10.6992C16.3681 10.7904 16.342 10.862 16.2769 10.9141C16.2118 10.9661 16.1337 10.9727 16.0425 10.9336L15.1246 10.4453L14.2066 10.9336C14.1155 10.9727 14.0373 10.9661 13.9722 10.9141C13.9071 10.862 13.8746 10.7904 13.8746 10.6992L14.0503 9.66406L13.3082 8.94141C13.2431 8.8763 13.23 8.79818 13.2691 8.70703C13.2951 8.62891 13.3537 8.58333 13.4449 8.57031L14.4605 8.41406L14.9293 7.49609C14.9683 7.40495 15.0334 7.35938 15.1246 7.35938C15.2157 7.35938 15.2808 7.40495 15.3199 7.49609L15.7886 8.41406L16.8043 8.57031C16.8954 8.58333 16.954 8.62891 16.98 8.70703C17.0191 8.79818 17.0061 8.8763 16.941 8.94141ZM19.7925 2.75H17.4683C17.3511 2.75 17.26 2.80208 17.1949 2.90625L15.7496 5.28906C16.5829 5.43229 17.299 5.77734 17.898 6.32422L20.066 3.21875C20.1311 3.11458 20.1376 3.01693 20.0855 2.92578C20.0334 2.82161 19.9358 2.76302 19.7925 2.75Z";

const RANK_BADGE_CONFIG = {
  1: {
    crownColor: '#EAB308',
    numberPath: 'M16.9727 14.3182V22.5H15.2429V15.9601H15.195L13.3213 17.1347V15.6006L15.3468 14.3182H16.9727Z',
  },
  2: {
    crownColor: '#94A3B8',
    numberPath: 'M12.4132 22.5V21.2536L15.3256 18.5569C15.5732 18.3172 15.781 18.1015 15.9488 17.9097C16.1192 17.718 16.2484 17.5302 16.3363 17.3464C16.4242 17.16 16.4681 16.9589 16.4681 16.7432C16.4681 16.5035 16.4135 16.2971 16.3043 16.1239C16.1951 15.9482 16.046 15.8137 15.8569 15.7204C15.6678 15.6246 15.4534 15.5766 15.2137 15.5766C14.9633 15.5766 14.7449 15.6272 14.5585 15.7284C14.3721 15.8296 14.2282 15.9748 14.127 16.1639C14.0258 16.353 13.9752 16.578 13.9752 16.839H12.3333C12.3333 16.3037 12.4545 15.839 12.6968 15.4448C12.9392 15.0506 13.2788 14.7456 13.7156 14.5299C14.1523 14.3142 14.6557 14.2063 15.2257 14.2063C15.8116 14.2063 16.3216 14.3102 16.7558 14.5179C17.1926 14.723 17.5321 15.008 17.7745 15.3729C18.0169 15.7377 18.1381 16.1559 18.1381 16.6273C18.1381 16.9363 18.0768 17.2412 17.9543 17.5422C17.8344 17.8431 17.62 18.1774 17.3111 18.5449C17.0021 18.9098 16.5667 19.3479 16.0047 19.8593L14.8102 21.0298V21.0858H18.2459V22.5H12.4132Z',
  },
  3: {
    crownColor: '#FB923C',
    numberPath: 'M15.4374 22.6119C14.8408 22.6119 14.3095 22.5093 13.8434 22.3042C13.38 22.0965 13.0138 21.8115 12.7448 21.4493C12.4784 21.0844 12.3413 20.6636 12.3333 20.1869H14.0751C14.0858 20.3866 14.151 20.5624 14.2709 20.7142C14.3934 20.8634 14.5558 20.9792 14.7583 21.0618C14.9607 21.1444 15.1884 21.1856 15.4414 21.1856C15.7051 21.1856 15.9381 21.139 16.1405 21.0458C16.343 20.9526 16.5014 20.8234 16.6159 20.6583C16.7305 20.4932 16.7877 20.3027 16.7877 20.087C16.7877 19.8686 16.7265 19.6755 16.604 19.5077C16.4841 19.3373 16.311 19.2041 16.0846 19.1082C15.8609 19.0123 15.5945 18.9644 15.2856 18.9644H14.5225V17.694H15.2856C15.5466 17.694 15.777 17.6487 15.9767 17.5581C16.1792 17.4676 16.3363 17.3424 16.4482 17.1826C16.56 17.0202 16.6159 16.8311 16.6159 16.6153C16.6159 16.4102 16.5667 16.2305 16.4681 16.076C16.3722 15.9189 16.2364 15.7963 16.0606 15.7085C15.8875 15.6206 15.6851 15.5766 15.4534 15.5766C15.219 15.5766 15.0046 15.6192 14.8102 15.7045C14.6158 15.787 14.46 15.9055 14.3428 16.06C14.2256 16.2145 14.163 16.3956 14.155 16.6033H12.4971C12.5051 16.1319 12.6396 15.7164 12.9006 15.3569C13.1616 14.9973 13.5131 14.7164 13.9553 14.5139C14.4 14.3089 14.9021 14.2063 15.4614 14.2063C16.026 14.2063 16.5201 14.3102 16.9435 14.5179C17.367 14.719 17.6959 15.008 17.9303 15.3449C18.1673 15.6911 18.2845 16.08 18.2819 16.5115C18.2845 16.9695 18.142 17.3517 17.8544 17.658C17.5694 17.9643 17.1979 18.1587 16.7398 18.2413V18.3052C17.3417 18.3825 17.7998 18.5915 18.1141 18.9324C18.431 19.2707 18.5882 19.6942 18.5855 20.2029C18.5882 20.6689 18.4537 21.0831 18.182 21.4453C17.913 21.8075 17.5415 22.0925 17.0674 22.3002C16.5933 22.508 16.05 22.6119 15.4374 22.6119Z',
  },
};

function RankBadge({ rank, className, style }) {
  const config = RANK_BADGE_CONFIG[rank];
  if (!config) return null;
  const filterId = `lp-rank-badge-shadow-${rank}`;
  return (
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
      <g filter={`url(#${filterId})`}>
        <rect x="2.25" y="1.125" width="27" height="27" rx="13.5" fill="white" shapeRendering="crispEdges" />
        <rect x="2.8125" y="1.6875" width="25.875" height="25.875" rx="12.9375" stroke="#F1F5F9" strokeWidth="1.125" shapeRendering="crispEdges" />
        <path d={RANK_BADGE_CROWN} fill={config.crownColor} />
        <path d={config.numberPath} fill="#334155" />
      </g>
      <defs>
        <filter id={filterId} x="0" y="0" width="31.5" height="31.5" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
          <feOffset dy="1.125" />
          <feGaussianBlur stdDeviation="1.125" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.05 0" />
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape" />
        </filter>
      </defs>
    </svg>
  );
}

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
  const isBoosted = product.boostedUntil && new Date(product.boostedUntil) > new Date();
  const tag = isBoosted ? 'BOOSTED' : rank === 1 ? 'FEATURED' : isNew ? 'NEW' : null;
  const tagType = isBoosted ? 'boosted' : rank === 1 ? 'featured' : 'new';
  const [saved, setSaved] = useState(false);

  return (
    <div className="lp-row" onClick={onClick}>
      <div className="lp-row-icon-wrap">
        {isUrl(product.logo) ? (
          <div className="lp-row-icon" style={{ background: catMeta.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src={product.logo} alt="" style={{ width: 36, height: 36, objectFit: 'contain', borderRadius: 6 }} />
          </div>
        ) : (
          <div className="lp-row-icon" style={{ background: catMeta.bg }}>{catMeta.icon}</div>
        )}
        {rank <= 3 ? (
          <RankBadge rank={rank} className="lp-rank-badge" />
        ) : (
          <span className="lp-rank-badge lp-rank-badge-plain">{rank}</span>
        )}
      </div>
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
          <div className="lp-row-cats">
            {product.category && <span className="lp-cat">{product.category}</span>}
          </div>
        </div>
      </div>
      <div className="lp-row-actions">
        <span className="lp-row-fb"><CommentIcon /> {product.totalReviews ?? 0}</span>
        <button
          className={`lp-vote-btn${voted ? ' voted' : ''}`}
          onClick={e => { e.stopPropagation(); onVote(product._id); }}
        >
          <span className="lp-vote-arr"><UpvoteIcon /></span>
          <span className="lp-vote-num">{votes}</span>
        </button>
        <button
          className={`lp-bookmark-btn${saved ? ' saved' : ''}`}
          onClick={e => { e.stopPropagation(); setSaved(s => !s); }}
        >
          <BookmarkIcon filled={saved} />
        </button>
      </div>
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
                  <span className="dpv-vote-arr"><UpvoteIcon /></span>
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
                        {[1, 2, 3, 4, 5].map(n => (
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
                          <svg width="13" height="13" viewBox="0 0 24 24" fill={helpful.marked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z" /><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" /></svg>
                          Helpful ({helpful.count})
                        </button>
                        {isLoggedIn && (
                          <button
                            className="dpv-review-btn"
                            onClick={() => setReplyOpen(m => ({ ...m, [r._id]: !m[r._id] }))}
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
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
                                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
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
                                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
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
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
                    </span>
                    <span className="dpv-link-label">Visit Website</span>
                    <span className="dpv-link-arrow">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
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
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>
                {saved ? 'Saved' : 'Save for Later'}
              </button>
              <button className="dpv-action-btn" onClick={handleShare}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></svg>
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
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /><line x1="4" y1="22" x2="4" y2="15" /></svg>
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
                      {['Spam', 'Misinformation', 'Inappropriate Content', 'Copyright Violation', 'Other'].map(c => (
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
  const [activeTab, setActiveTab] = useState('Weekly');
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
                <div className="lp-tabbar-track">
                  {['Weekly', 'All Time'].map(tab => (
                    <button
                      key={tab}
                      className={`lp-tab${activeTab === tab ? ' active' : ''}`}
                      onClick={() => setActiveTab(tab)}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
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
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><UpvoteIcon /> {podProduct.upvoteCount ?? 0}</span>
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
                  <span className={`lps-launch-chevron${launchOpen ? '' : ' closed'}`}><svg width="12" height="7" viewBox="0 0 12 7" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0.328125 4.81641L4.79297 0.316406C5.05078 0.105469 5.33203 0 5.63672 0C5.94141 0 6.21094 0.105469 6.44531 0.316406L10.9102 4.81641C11.2383 5.19141 11.3203 5.60156 11.1562 6.04688C10.9688 6.49219 10.6172 6.72656 10.1016 6.75H1.13672C0.644531 6.72656 0.292969 6.49219 0.0820312 6.04688C-0.0820312 5.60156 0 5.19141 0.328125 4.81641Z" fill="#0D9488" />
                  </svg>
                  </span>
                </button>
                {launchOpen && (
                  <>
                    <div className="lps-launch-title">Launch Your Product</div>
                    <div className="lps-launch-desc">Get feedback from builders, makers, and adopters</div>
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
                      <span className="lps-ti-votes" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><UpvoteIcon /> {p.upvoteCount ?? 0}</span>
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
