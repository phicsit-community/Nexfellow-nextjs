"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../lib/axios';
import styles from './Onboarding.module.css';

const STEPS_CONFIG = [
  { name: "Welcome",        desc: "Get started",              icon: "🏠" },
  { name: "Account type",   desc: "Individual or community",  icon: "👤" },
  { name: "Your profile",   desc: "Name, bio, location",      icon: "📝" },
  { name: "Skills & stage", desc: "What you bring",           icon: "⚡" },
  { name: "Co-founder",     desc: "Availability & match",     icon: "🤝" },
  { name: "Credits",        desc: "Economy & interests",      icon: "💎" },
  { name: "Connect",        desc: "Social & profile review",  icon: "🔗" },
  { name: "All done!",      desc: "You're a builder",         icon: "🚀" },
];

// Map display strings to backend enum values
const AVAIL_MAP = {
  "Yes — actively looking":        "actively-looking",
  "Maybe — open to conversations": "open-to-conversations",
  "No — building solo":            "building-solo",
  "Advisor / mentor":              "advisor-mentor",
};

export default function Onboarding() {
  const router = useRouter();

  const [currentScreen, setCurrentScreen] = useState(0);
  const [accountType, setAccountType]     = useState('individual');
  const [stage, setStage]                 = useState('MVP built');
  const [availability, setAvailability]   = useState('Yes — actively looking');
  const [skills, setSkills]               = useState([]);
  const [cofounder, setCofounder]         = useState(['Design co-founder', 'AI / ML expertise']);
  const [interests, setInterests]         = useState(['SaaS / web apps', 'Mobile apps', 'Edtech']);
  const [socialState, setSocialState]     = useState({ twitter: false, github: true, linkedin: false, portfolio: false });
  const [profile, setProfile]             = useState({ fname: '', lname: '', handle: '', email: '', location: '', bio: '' });

  // Username availability check
  const [usernameAvailable, setUsernameAvailable] = useState(null); // null = unchecked
  const [usernameChecking, setUsernameChecking]   = useState(false);

  // Submit state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError]   = useState('');
  const [screenError, setScreenError]   = useState('');

  // TODO: re-enable redirect after design review
  useEffect(() => {
    const checkOnboarded = async () => {
      try {
        const { data } = await api.get('/api/onboarding');
        if (data.isOnboardingComplete) {
          router.replace('/feed');
        }
      } catch {
        // Not onboarded or not logged in — stay on page
      }
    };
    checkOnboarded();
  }, [router]);

  // Debounced username availability check
  useEffect(() => {
    const raw = profile.handle.replace(/^@/, '').trim();
    if (!raw || raw.length < 3) {
      setUsernameAvailable(null);
      return;
    }
    setUsernameChecking(true);
    const timer = setTimeout(async () => {
      try {
        const { data } = await api.get(`/api/onboarding/check-username/${encodeURIComponent(raw)}`);
        setUsernameAvailable(data.available);
      } catch {
        setUsernameAvailable(null);
      } finally {
        setUsernameChecking(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [profile.handle]);

  const goTo = (n) => {
    setScreenError('');
    setCurrentScreen(n);
    if (typeof document !== 'undefined') {
      const rightContainer = document.querySelector(`.${styles.right}`);
      if (rightContainer) rightContainer.scrollTop = 0;
    }
  };

  // Screen 2 validation — called instead of goTo(3)
  const continueFromProfile = () => {
    const { fname, lname, handle, email } = profile;
    const clean = handle.replace(/^@/, '').trim();
    if (!fname.trim())           return setScreenError('First name is required.');
    if (!lname.trim())           return setScreenError('Last name is required.');
    if (!clean)                  return setScreenError('Username is required.');
    if (usernameAvailable === false) return setScreenError('That username is already taken — choose another.');
    if (!email.trim())           return setScreenError('Email address is required.');
    if (!/\S+@\S+\.\S+/.test(email)) return setScreenError('Please enter a valid email address.');
    goTo(3);
  };

  const selectType   = (type)       => setAccountType(type);
  const selectRadio  = (group, val) => { if (group === 'stage') setStage(val); };
  const selectAvail  = (color, val) => setAvailability(val);
  const toggleChip   = (group, val) => {
    const toggle = (arr) => arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val];
    if (group === 'skills')    setSkills(toggle(skills));
    if (group === 'cofounder') setCofounder(toggle(cofounder));
    if (group === 'interests') setInterests(toggle(interests));
  };
  const toggleSocial = (platform) => setSocialState(prev => ({ ...prev, [platform]: !prev[platform] }));

  const getProgressWidth = () =>
    Math.round((currentScreen / (STEPS_CONFIG.length - 1)) * 100) + '%';

  const isTypeSelected  = (type) => accountType  === type  ? styles['selected'] : '';
  const isStageSelected = (val)  => stage         === val   ? styles['selected'] : '';
  const isAvailSelected = (val)  => availability  === val   ? styles['selected'] : '';
  const isChipSelected  = (group, val) => {
    if (group === 'skills')    return skills.includes(val)    ? styles['selected'] : '';
    if (group === 'cofounder') return cofounder.includes(val) ? styles['selected'] : '';
    if (group === 'interests') return interests.includes(val) ? styles['selected'] : '';
    return '';
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError('');
    try {
      await api.post('/api/onboarding', {
        accountType,
        firstName:  profile.fname,
        lastName:   profile.lname,
        username:   profile.handle.replace(/^@/, ''),
        email:      profile.email,
        location:   profile.location,
        bio:        profile.bio,
        skills,
        productStage:           stage,
        cofounderAvailability:  AVAIL_MAP[availability] || 'open-to-conversations',
        cofounderLookingFor:    cofounder,
        reviewInterests:        interests,
        socialLinks: {
          twitter:   socialState.twitter   ? profile.handle.replace(/^@/, '') : '',
          github:    socialState.github    ? profile.handle.replace(/^@/, '') : '',
          linkedin:  socialState.linkedin  ? profile.handle.replace(/^@/, '') : '',
          portfolio: socialState.portfolio ? profile.handle.replace(/^@/, '') : '',
        },
      });
      // Immediately update cookie so routing guards don't need a reload
      document.cookie = `isOnboarded=true; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`;
      goTo(7);
    } catch (err) {
      const msg = err.response?.data?.message || 'Something went wrong. Please try again.';
      setSubmitError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.onboardingWrapper}>
      <div className={styles["shell"]}>

        {/* ══════════ LEFT SIDEBAR ══════════ */}
        <div className={styles["left"]}>
          <div className={styles["left-deco"]}></div>
          <div className={styles["left-deco2"]}></div>

          <div className={styles["logo"]}>
            <img src="/NexFellowLogo.svg" alt="NexFellow" className={styles["logo-img"]} />
          </div>

          <div className={styles["steps"]} id="steps-nav">
            {STEPS_CONFIG.map((s, i) => {
              let cls = i < currentScreen ? 'done' : i === currentScreen ? 'active' : 'upcoming';
              return (
                <div key={i} className={`${styles["step-item"]} ${styles[cls]}`}>
                  <div className={styles["step-dot"]}>
                    {i < currentScreen ? (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    ) : i === 0 ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><polyline points="9,22 9,12 15,12 15,22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    ) : i === STEPS_CONFIG.length - 1 ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    ) : `${i}`}
                  </div>
                  <div className={styles["step-label"]}>
                    <div className={styles["step-name"]}>{s.name}</div>
                    <div className={styles["step-desc"]}>{s.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className={styles["left-card"]}>
            <div className={styles["lc-quote"]}>"The feedback I got in 6 hours completely changed how I think about my pricing. Nothing else has done that."</div>
            <div className={styles["lc-author"]}>
              <div className={styles["lc-av"]}>RK</div>
              <div>
                <div className={styles["lc-name"]}>Rahul K.</div>
                <div className={styles["lc-role"]}>Founder, TaskFlow AI</div>
              </div>
            </div>
          </div>
        </div>

        {/* ══════════ RIGHT CONTENT ══════════ */}
        <div className={styles["right"]}>
          {/* Mobile-only sticky header (logo + step indicator) */}
          <div className={styles["mobile-header"]}>
            <img src="/NexFellowLogo.svg" alt="NexFellow" className={styles["mobile-header-logo"]} />
            {currentScreen > 0 && currentScreen < STEPS_CONFIG.length - 1 && (
              <span className={styles["mobile-step-badge"]}>
                {currentScreen} / {STEPS_CONFIG.length - 2}
              </span>
            )}
          </div>

          <div className={styles["progress-top"]}>
            <div className={styles["progress-fill"]} style={{ width: getProgressWidth() }}></div>
          </div>
          <div className={styles["right-inner"]}>

            {/* ─── SCREEN 0: WELCOME ─── */}
            <div className={`${styles["screen"]} ${currentScreen === 0 ? styles["active"] : ""}`}>
              <div className={styles["screen-step"]}>Welcome to NexFellow</div>
              <div className={styles["screen-title"]}>Build something people<br />actually want</div>
              <div className={styles["screen-sub"]}>Join 500+ builders getting real feedback, finding co-founders, and growing their early user base — all in one place.</div>
              <div className={styles["welcome-hero"]}>
                <div className={styles["wh-icon"]}>
                  <img src="/android-chrome-192x192.png" alt="NexFellow mascot" />
                </div>
                <div className={styles["wh-title"]}>You're in the right place</div>
                <div className={styles["wh-sub"]}>Set up your builder profile in 5 minutes.<br />We'll match you with reviewers based on your product category.</div>
              </div>
              <div className={styles["welcome-stats"]}>
                <div className={styles["ws-card"]}><div className={styles["ws-val"]}>500+</div><div className={styles["ws-lbl"]}>Builders</div></div>
                <div className={styles["ws-card"]}><div className={styles["ws-val"]}>4.3★</div><div className={styles["ws-lbl"]}>Avg Feedback</div></div>
                <div className={styles["ws-card"]}><div className={styles["ws-val"]}>24hr</div><div className={styles["ws-lbl"]}>Response Time</div></div>
              </div>
              <div className={styles["btn-row"]}>
                <button className={`${styles["btn"]} ${styles["btn-primary"]} ${styles["btn-lg"]}`} onClick={() => goTo(1)}>
                  Start setup
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              </div>
            </div>

            {/* ─── SCREEN 1: ACCOUNT TYPE ─── */}
            <div className={`${styles["screen"]} ${currentScreen === 1 ? styles["active"] : ""}`}>
              <div className={styles["screen-step"]}>Step 1 of 6 — Account type</div>
              <div className={styles["screen-title"]}>How will you use<br />NexFellow?</div>
              <div className={styles["screen-sub"]}>This shapes your profile, dashboard, and the features available to you.</div>
              <div className={styles["type-cards"]}>
                <div className={`${styles["type-card"]} ${styles["blue"]} ${isTypeSelected("individual")}`} onClick={() => selectType("individual")}>
                  <div className={styles["tc-badge"]}>
                    {accountType === "individual" ? (
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    ) : null}
                  </div>
                  <span className={styles["tc-icon"]}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
                    </svg>
                  </span>
                  <div className={styles["tc-title"]}>Individual builder</div>
                  <div className={styles["tc-desc"]}>Solo founder, indie hacker, or developer building your own product.</div>
                </div>
                <div className={`${styles["type-card"]} ${styles["orange"]} ${isTypeSelected("community")}`} onClick={() => selectType("community")}>
                  <div className={styles["tc-badge"]}>
                    {accountType === "community" ? (
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    ) : null}
                  </div>
                  <span className={styles["tc-icon"]}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/><line x1="12" y1="12" x2="12" y2="17"/><line x1="9" y1="14.5" x2="15" y2="14.5"/>
                    </svg>
                  </span>
                  <div className={styles["tc-title"]}>Community / org</div>
                  <div className={styles["tc-desc"]}>Running a startup community, accelerator, college e-cell, or org page.</div>
                </div>
              </div>
              <div className={styles["btn-row"]}>
                <button className={`${styles["btn"]} ${styles["btn-ghost"]}`} onClick={() => goTo(0)}>Back</button>
                <button className={`${styles["btn"]} ${styles["btn-primary"]}`} onClick={() => goTo(2)} style={{ flex: "1" }}>
                  Continue
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M3 7.5h9M8 3.5l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              </div>
            </div>

            {/* ─── SCREEN 2: BASIC PROFILE ─── */}
            <div className={`${styles["screen"]} ${currentScreen === 2 ? styles["active"] : ""}`}>
              <div className={styles["screen-step"]}>Step 2 of 6 — Your profile</div>
              <div className={styles["screen-title"]}>Let's set up your<br />builder identity.</div>
              <div className={styles["screen-sub"]}>This is your public profile — other builders will see this on BuilderMap and in feedback threads.</div>
              <div className={`${styles["field"]} ${styles["field-row"]}`}>
                <div>
                  <label>First name</label>
                  <input type="text" placeholder="Rahul" value={profile.fname} onChange={e => setProfile({...profile, fname: e.target.value})} />
                </div>
                <div>
                  <label>Last name</label>
                  <input type="text" placeholder="Kumar" value={profile.lname} onChange={e => setProfile({...profile, lname: e.target.value})} />
                </div>
              </div>
              <div className={styles["field"]}>
                <label>
                  Username / handle
                  {usernameChecking && <span style={{ color: 'var(--t4)', fontWeight: 400, marginLeft: 8 }}>checking…</span>}
                  {!usernameChecking && usernameAvailable === true  && <span style={{ color: 'var(--green)', fontWeight: 400, marginLeft: 8 }}>✓ available</span>}
                  {!usernameChecking && usernameAvailable === false && <span style={{ color: 'var(--coral)', fontWeight: 400, marginLeft: 8 }}>✗ taken</span>}
                </label>
                <input
                  type="text"
                  placeholder="@rahulkumar"
                  value={profile.handle}
                  onChange={e => setProfile({...profile, handle: e.target.value})}
                />
              </div>
              <div className={styles["field"]}>
                <label>Email address</label>
                <input type="email" placeholder="rahul@nexfellow.com" value={profile.email} onChange={e => setProfile({...profile, email: e.target.value})} />
              </div>
              <div className={styles["field"]}>
                <label>City &amp; country</label>
                <input type="text" placeholder="Mumbai, India" value={profile.location} onChange={e => setProfile({...profile, location: e.target.value})} />
              </div>
              <div className={styles["field"]}>
                <label>Short bio <span style={{ color: "var(--t4)", fontWeight: "400", textTransform: "none", letterSpacing: "0" }}>(what are you building?)</span></label>
                <textarea placeholder="Building at the intersection of productivity and AI..." value={profile.bio} onChange={e => setProfile({...profile, bio: e.target.value})}></textarea>
              </div>
              {screenError && (
                <div style={{ color: 'var(--coral)', fontSize: '13px', marginBottom: '12px', padding: '10px 14px', background: 'rgba(225,112,85,0.08)', borderRadius: '8px', border: '1px solid rgba(225,112,85,0.2)' }}>
                  {screenError}
                </div>
              )}
              <div className={styles["btn-row"]}>
                <button className={`${styles["btn"]} ${styles["btn-ghost"]}`} onClick={() => goTo(1)}>Back</button>
                <button className={`${styles["btn"]} ${styles["btn-primary"]}`} onClick={continueFromProfile} style={{ flex: "1" }}>
                  Continue
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M3 7.5h9M8 3.5l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              </div>
            </div>

            {/* ─── SCREEN 3: SKILLS & STAGE ─── */}
            <div className={`${styles["screen"]} ${currentScreen === 3 ? styles["active"] : ""}`}>
              <div className={styles["screen-step"]}>Step 3 of 6 — Skills &amp; stage</div>
              <div className={styles["screen-title"]}>What do you bring<br />to the table?</div>
              <div className={styles["screen-sub"]}>This helps us match you with the right reviewers and surface you to compatible co-founders on BuilderMap.</div>

              <div className={styles["field"]}>
                <label>Your skills <span style={{ color: "var(--t4)", fontWeight: "400", textTransform: "none", letterSpacing: "0" }}>select all that apply</span></label>
                <div className={styles["chip-grid"]}>
                  {["Full-stack dev","Frontend dev","Backend dev","Mobile dev","Product design","UI/UX","Product strategy","Growth hacking","Marketing","Sales","AI / ML","No-code / low-code","Fundraising","Operations"].map(val => (
                    <div key={val} className={`${styles["chip"]} ${isChipSelected('skills', val)}`} onClick={() => toggleChip('skills', val)}>{val}</div>
                  ))}
                </div>
              </div>

              <hr className={styles["section-divider"]} />

              <div className={styles["field"]}>
                <div style={{ fontSize:"11px", fontWeight:"700", color:"var(--t2)", textTransform:"uppercase", letterSpacing:".08em", marginBottom:"10px" }}>Product Stage</div>
                <div className={styles["radio-cards"]}>
                  {[
                    {
                      val: "Idea stage", desc: "Validating the concept, no product yet",
                      bg: "rgba(108,92,231,0.10)", color: "#6c5ce7",
                      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18h6M10 22h4M12 2a7 7 0 017 7c0 2.5-1.3 4.7-3.3 6L15 18H9l-.7-3C6.3 13.7 5 11.5 5 9a7 7 0 017-7z"/></svg>
                    },
                    {
                      val: "MVP built", desc: "Have a working product, need feedback",
                      bg: "rgba(36,178,180,0.10)", color: "#24b2b4",
                      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 16.5c-1.5 1.5-2 5-2 5s3.5-.5 5-2l11.5-11.5a5.5 5.5 0 00-3-3L4.5 16.5z"/><path d="M15 5c2 0 4 2 4 4"/><path d="M5 19l3-3"/></svg>
                    },
                    {
                      val: "Launched", desc: "Live with users, growing and iterating",
                      bg: "rgba(245,158,11,0.10)", color: "#f59e0b",
                      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
                    },
                    {
                      val: "Pivoting", desc: "Changing direction, need fresh eyes",
                      bg: "rgba(239,68,68,0.10)", color: "#ef4444",
                      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><polyline points="23 20 23 14 17 14"/><path d="M20.49 9A9 9 0 005.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 013.51 15"/></svg>
                    },
                  ].map(({ val, icon, bg, color, desc }) => (
                    <div key={val} className={`${styles["radio-card"]} ${isStageSelected(val)}`} onClick={() => selectRadio('stage', val)}>
                      <div className={styles["rc-icon"]} style={{ background: bg, color }}>{icon}</div>
                      <div><div className={styles["rc-label"]}>{val}</div><div className={styles["rc-desc"]}>{desc}</div></div>
                      <div className={styles["rc-check"]}>{stage === val && <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1.5 4l2 2 3-3" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles["btn-row"]}>
                <button className={`${styles["btn"]} ${styles["btn-ghost"]}`} onClick={() => goTo(2)}>Back</button>
                <button className={`${styles["btn"]} ${styles["btn-primary"]}`} onClick={() => goTo(4)} style={{ flex: "1" }}>
                  Continue
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M3 7.5h9M8 3.5l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              </div>
            </div>

            {/* ─── SCREEN 4: CO-FOUNDER STATUS ─── */}
            <div className={`${styles["screen"]} ${currentScreen === 4 ? styles["active"] : ""}`}>
              <div className={styles["screen-step"]}>Step 4 of 6 — Co-founder status</div>
              <div className={styles["screen-title"]}>Are you open to<br />finding a co-founder?</div>
              <div className={styles["screen-sub"]}>This shows on your BuilderMap profile so other builders can find you. You can change this any time.</div>

              <div className={styles["avail-cards"]} style={{ marginBottom: "24px" }}>
                {[
                  { color: "green", val: "Yes — actively looking",        dot: "#10b981", desc: "I'm open to meeting potential co-founders right now." },
                  { color: "amber", val: "Maybe — open to conversations",  dot: "#f59e0b", desc: "Not actively searching, but happy to connect if there's a fit." },
                  { color: "gray",  val: "No — building solo",             dot: "#6b7280", desc: "I'm heads-down on my own product. Don't show me as available." },
                  { color: "green", val: "Advisor / mentor",               dot: "#24b2b4", desc: "I want to advise early-stage builders, not co-found." },
                ].map(({ color, val, dot, desc }) => (
                  <div key={val} className={`${styles["avail-card"]} ${styles[color]} ${isAvailSelected(val)}`} onClick={() => selectAvail(color, val)}>
                    <div className={styles["avail-dot"]} style={{ background: dot }}></div>
                    <div><div className={styles["avail-title"]}>{val}</div><div className={styles["avail-desc"]}>{desc}</div></div>
                    <div className={`${styles["rc-check"]} ${styles["avail-check"]}`} style={{ marginLeft: "auto" }}>
                      {isAvailSelected(val) && <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1.5 4l2 2 3-3" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>}
                    </div>
                  </div>
                ))}
              </div>

              <hr className={styles["section-divider"]} />

              <div className={styles["field"]}>
                <label>What kind of co-founder are you looking for? <span style={{ color: "var(--t4)", fontWeight: "400", textTransform: "none", letterSpacing: "0" }}>optional</span></label>
                <div className={styles["chip-grid"]}>
                  {["Technical co-founder","Design co-founder","Growth / marketing","Sales co-founder","Business co-founder","AI / ML expertise"].map(val => (
                    <div key={val} className={`${styles["chip"]} ${styles["green"]} ${isChipSelected('cofounder', val)}`} onClick={() => toggleChip('cofounder', val)}>{val}</div>
                  ))}
                </div>
              </div>

              <div className={styles["btn-row"]}>
                <button className={`${styles["btn"]} ${styles["btn-ghost"]}`} onClick={() => goTo(3)}>Back</button>
                <button className={`${styles["btn"]} ${styles["btn-primary"]}`} onClick={() => goTo(5)} style={{ flex: "1" }}>
                  Continue
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M3 7.5h9M8 3.5l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              </div>
            </div>

            {/* ─── SCREEN 5: CREDITS & INTERESTS ─── */}
            <div className={`${styles["screen"]} ${currentScreen === 5 ? styles["active"] : ""}`}>
              <div className={styles["screen-step"]}>Step 5 of 6 — Credits &amp; interests</div>
              <div className={styles["screen-title"]}>Here's how credits<br />work for you</div>
              <div className={styles["screen-sub"]}>NexFellow runs on a credit economy — you earn by giving feedback and spend to receive it. You start with 30 free credits.</div>

              <div className={styles["credit-cards"]}>
                <div className={styles["credit-card"]}>
                  <div className={styles["cc-icon"]} style={{ background: "var(--asoft)" }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>
                  </div>
                  <div className={styles["cc-title"]}>Earn credits</div>
                  <div className={styles["cc-desc"]}>Give feedback on products, refer builders, complete your profile.</div>
                  <div className={styles["cc-val"]} style={{ color: "var(--accent)" }}>+8 cr / review</div>
                </div>
                <div className={styles["credit-card"]}>
                  <div className={styles["cc-icon"]} style={{ background: "var(--asoft)" }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>
                  </div>
                  <div className={styles["cc-title"]}>Spend credits</div>
                  <div className={styles["cc-desc"]}>Submit products for feedback, boost listings, connect on BuilderMap.</div>
                  <div className={styles["cc-val"]} style={{ color: "var(--accent)" }}>20 cr / round</div>
                </div>
                <div className={styles["credit-card"]}>
                  <div className={styles["cc-icon"]} style={{ background: "rgba(245,158,11,0.10)" }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="8"/><path d="M12 8v4l2 2"/></svg>
                  </div>
                  <div className={styles["cc-title"]}>Buy credits</div>
                  <div className={styles["cc-desc"]}>Top up any time. Bought credits never expire. Packs from ₹149.</div>
                  <div className={styles["cc-val"]} style={{ color: "#f59e0b" }}>₹149 → 50 cr</div>
                </div>
                <div className={styles["credit-card"]}>
                  <div className={styles["cc-icon"]} style={{ background: "rgba(245,158,11,0.10)" }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  </div>
                  <div className={styles["cc-title"]}>Bonus credits</div>
                  <div className={styles["cc-desc"]}>Complete profile +20, 7-day streak +15, refer a builder +25.</div>
                  <div className={styles["cc-val"]} style={{ color: "#f59e0b" }}>Up to +175 cr</div>
                </div>
              </div>

              <div className={styles["credit-bar"]}>
                <div className={styles["cb-top"]}>
                  <span className={styles["cb-label"]}>Your starting balance</span>
                  <span className={styles["cb-val"]}>30 credits</span>
                </div>
                <div className={styles["cb-track"]}><div className={styles["cb-fill"]} style={{ width: "15%" }}></div></div>
              </div>

              <div className={styles["field"]}>
                <label>What type of products do you want to review? <span style={{ color: "var(--t4)", fontWeight: "400", textTransform: "none", letterSpacing: "0" }}>earn more relevant credits</span></label>
                <div className={styles["chip-grid"]}>
                  {["SaaS / web apps","Mobile apps","AI tools","Dev tools","E-commerce","Fintech","Edtech","Health / wellness","No-code tools","Hardware / IoT"].map(val => (
                    <div key={val} className={`${styles["chip"]} ${styles["gold"]} ${isChipSelected('interests', val)}`} onClick={() => toggleChip('interests', val)}>{val}</div>
                  ))}
                </div>
              </div>

              <div className={styles["btn-row"]}>
                <button className={`${styles["btn"]} ${styles["btn-ghost"]}`} onClick={() => goTo(4)}>Back</button>
                <button className={`${styles["btn"]} ${styles["btn-primary"]}`} onClick={() => goTo(6)} style={{ flex: "1" }}>
                  Continue
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M3 7.5h9M8 3.5l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              </div>
            </div>

            {/* ─── SCREEN 6: CONNECT & REVIEW ─── */}
            <div className={`${styles["screen"]} ${currentScreen === 6 ? styles["active"] : ""}`}>
              <div className={styles["screen-step"]}>Step 6 of 6 — Connect &amp; review</div>
              <div className={styles["screen-title"]}>Almost there!<br />Connect your accounts</div>
              <div className={styles["screen-sub"]}>Link your social profiles to strengthen your builder identity. This boosts your Fellow Score and helps others trust your reviews.</div>

              <div className={styles["social-row"]} style={{ marginBottom: "24px" }}>
                <div className={`${styles["social-item"]} ${socialState.twitter ? styles["connected"] : ""}`} onClick={() => toggleSocial("twitter")}>
                  <div className={styles["si-icon"]} style={{ background: "#111827", borderRadius: "10px" }}>
                    <svg width="16" height="16" viewBox="0 0 18 18" fill="none"><path d="M2 3h4l3 4.5L13 3h3L11 9.5 16 16h-4l-3.5-5L4 16H1l5.5-7L2 3z" fill="#ffffff"/></svg>
                  </div>
                  <div><div className={styles["si-name"]}>Twitter / X</div><div className={styles["si-handle"]}>{socialState.twitter ? `@${profile.handle.replace(/^@/, '')}` : "Not connected"}</div></div>
                  <button className={`${styles["si-btn"]} ${socialState.twitter ? styles["done"] : styles["connect"]}`}>{socialState.twitter ? "Connected ✓" : "Connect"}</button>
                </div>
                <div className={`${styles["social-item"]} ${socialState.github ? styles["connected"] : ""}`} onClick={() => toggleSocial("github")}>
                  <div className={styles["si-icon"]} style={{ background: "#24292e", borderRadius: "10px" }}>
                    <svg width="16" height="16" viewBox="0 0 18 18" fill="none"><path d="M9 2a7 7 0 00-2.21 13.64c.35.06.48-.15.48-.34v-1.2c-1.94.42-2.35-.94-2.35-.94-.32-.81-.78-1.02-.78-1.02-.64-.43.05-.43.05-.43.7.05 1.07.72 1.07.72.63 1.07 1.64.76 2.04.58.06-.45.24-.76.44-.94-1.55-.18-3.18-.78-3.18-3.46 0-.76.27-1.39.72-1.87-.07-.18-.31-.89.07-1.85 0 0 .59-.19 1.92.72a6.7 6.7 0 013.5 0c1.33-.91 1.92-.72 1.92-.72.38.96.14 1.67.07 1.85.45.48.72 1.11.72 1.87 0 2.69-1.64 3.28-3.2 3.45.25.22.48.65.48 1.3v1.94c0 .19.13.4.48.34A7 7 0 009 2z" fill="#ffffff"/></svg>
                  </div>
                  <div><div className={styles["si-name"]}>GitHub</div><div className={styles["si-handle"]}>{socialState.github ? `@${profile.handle.replace(/^@/, '') || 'rahulkumar'}` : "Not connected"}</div></div>
                  <button className={`${styles["si-btn"]} ${socialState.github ? styles["done"] : styles["connect"]}`}>{socialState.github ? "Connected ✓" : "Connect"}</button>
                </div>
                <div className={`${styles["social-item"]} ${socialState.linkedin ? styles["connected"] : ""}`} onClick={() => toggleSocial("linkedin")}>
                  <div className={styles["si-icon"]} style={{ background: "#0a66c2", borderRadius: "10px" }}>
                    <svg width="16" height="16" viewBox="0 0 18 18" fill="none"><rect x="2" y="6" width="2.5" height="9" fill="#fff"/><circle cx="3.25" cy="3.5" r="1.5" fill="#fff"/><path d="M8 6v9M8 9.5a3 3 0 016 0V15" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>
                  </div>
                  <div><div className={styles["si-name"]}>LinkedIn</div><div className={styles["si-handle"]}>{socialState.linkedin ? `@${profile.handle.replace(/^@/, '')}` : "Not connected"}</div></div>
                  <button className={`${styles["si-btn"]} ${socialState.linkedin ? styles["done"] : styles["connect"]}`}>{socialState.linkedin ? "Connected ✓" : "Connect"}</button>
                </div>
                <div className={`${styles["social-item"]} ${socialState.portfolio ? styles["connected"] : ""}`} onClick={() => toggleSocial("portfolio")}>
                  <div className={styles["si-icon"]} style={{ background: "#374151", borderRadius: "10px" }}>
                    <svg width="16" height="16" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="6.5" stroke="#fff" strokeWidth="1.3"/><path d="M9 2.5C7 5 6 7 6 9s1 4 3 6.5M9 2.5C11 5 12 7 12 9s-1 4-3 6.5M2.5 9h13" stroke="#fff" strokeWidth="1.3"/></svg>
                  </div>
                  <div><div className={styles["si-name"]}>Portfolio / website</div><div className={styles["si-handle"]}>{socialState.portfolio ? "Added" : "Not added"}</div></div>
                  <button className={`${styles["si-btn"]} ${socialState.portfolio ? styles["done"] : styles["connect"]}`}>{socialState.portfolio ? "Connected ✓" : "Add"}</button>
                </div>
              </div>

              <hr className={styles["section-divider"]} />

              <div style={{ marginBottom: "8px" }}>
                <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--t2)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: "12px" }}>Your Profile Preview</div>
                <div className={styles["profile-preview"]}>
                  <div className={styles["pp-cover"]}><div className={styles["pp-cover-pattern"]}></div></div>
                  <div className={styles["pp-av-wrap"]}>
                    <div className={styles["pp-av"]}>
                      {profile.fname ? profile.fname[0].toUpperCase() : "U"}{profile.lname ? profile.lname[0].toUpperCase() : ""}
                    </div>
                  </div>
                  <div className={styles["pp-name"]}>{profile.fname || profile.lname ? `${profile.fname} ${profile.lname}` : "Your Name"}</div>
                  <div className={styles["pp-handle"]}>{profile.handle ? `@${profile.handle.replace(/^@/, '')}` : "@username"} · {profile.location || "City, Country"}</div>
                  <div className={styles["pp-bio"]}>{profile.bio || "Your short bio describing what you are building."}</div>
                  <div className={styles["pp-chips"]}>
                    {skills.slice(0, 3).map(skill => <div key={skill} className={styles["pp-chip"]}>{skill}</div>)}
                  </div>
                </div>
              </div>

              {submitError && (
                <div style={{ color: 'var(--coral)', fontSize: '13px', marginBottom: '12px', padding: '10px 14px', background: 'rgba(225,112,85,0.08)', borderRadius: '8px', border: '1px solid rgba(225,112,85,0.2)' }}>
                  {submitError}
                </div>
              )}

              <div className={styles["btn-row"]}>
                <button className={`${styles["btn"]} ${styles["btn-ghost"]}`} onClick={() => goTo(5)}>Back</button>
                <button
                  className={`${styles["btn"]} ${styles["btn-primary"]}`}
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  style={{ flex: "1", opacity: isSubmitting ? 0.7 : 1 }}
                >
                  {isSubmitting ? "Saving…" : "Complete setup"}
                  {!isSubmitting && <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M2.5 7.5l4 4 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </button>
              </div>
            </div>

            {/* ─── SCREEN 7: DONE ─── */}
            <div className={`${styles["screen"]} ${currentScreen === 7 ? styles["active"] : ""}`}>
              <div className={styles["done-hero"]}>
                <img src="/android-chrome-192x192.png" alt="NexFellow" style={{ width: "72px", height: "72px", objectFit: "contain", margin: "0 auto 20px", display: "block" }} />
                <div className={styles["screen-title"]} style={{ textAlign: "center", marginBottom: "10px" }}>You're in, builder.</div>
                <div className={styles["screen-sub"]} style={{ textAlign: "center", marginBottom: "0" }}>Your profile is live. 30 free credits are in your wallet.<br />Here's what to do first.</div>
              </div>

              <div style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)", borderRadius: "var(--rl)", padding: "14px 16px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "12px" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                <div style={{ fontSize: "13px", color: "var(--t2)" }}>Your balance: <strong style={{ color: "var(--text)" }}>30 credits</strong> · Complete your profile to unlock <strong style={{ color: "#f59e0b" }}>+20 bonus credits</strong></div>
              </div>

              <div className={styles["next-steps"]}>
                <div className={styles["ns-item"]}>
                  <div className={styles["ns-icon"]} style={{ background: "var(--asoft)" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
                  </div>
                  <div>
                    <div className={styles["ns-title"]}>Submit your first product</div>
                    <div className={styles["ns-desc"]}>Get up to 10 reviews within 24 hours · costs 20 credits</div>
                  </div>
                  <span className={styles["ns-arrow"]}>›</span>
                </div>
                <div className={styles["ns-item"]}>
                  <div className={styles["ns-icon"]} style={{ background: "var(--asoft)" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
                  </div>
                  <div>
                    <div className={styles["ns-title"]}>Give feedback · earn 8 credits</div>
                    <div className={styles["ns-desc"]}>Browse products waiting for reviews on the feedback board</div>
                  </div>
                  <span className={styles["ns-arrow"]}>›</span>
                </div>
                <div className={styles["ns-item"]}>
                  <div className={styles["ns-icon"]} style={{ background: "var(--asoft)" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>
                  </div>
                  <div>
                    <div className={styles["ns-title"]}>Explore BuilderMap</div>
                    <div className={styles["ns-desc"]}>Discover co-founders matched to your skills and stage</div>
                  </div>
                  <span className={styles["ns-arrow"]}>›</span>
                </div>
                <div className={styles["ns-item"]}>
                  <div className={styles["ns-icon"]} style={{ background: "rgba(245,158,11,0.10)" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>
                  </div>
                  <div>
                    <div className={styles["ns-title"]}>Check the leaderboard</div>
                    <div className={styles["ns-desc"]}>See top reviewers this week · climb the ranks · win badges</div>
                  </div>
                  <span className={styles["ns-arrow"]}>›</span>
                </div>
              </div>

              <div className={styles["btn-row"]} style={{ marginTop: "24px" }}>
                <button
                  className={`${styles["btn"]} ${styles["btn-primary"]} ${styles["btn-lg"]}`}
                  onClick={() => router.push('/feed')}
                >
                  Go to my dashboard
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              </div>
            </div>

          </div>{/* /right-inner */}

          {/* ── MOBILE STICKY BOTTOM NAV ── */}
          <div className={styles["mobile-bottom-nav"]}>
            {/* Step-progress dashes */}
            {currentScreen !== 7 && (
              <div className={styles["mobile-step-dots"]}>
                {STEPS_CONFIG.map((_, i) => (
                  <div
                    key={i}
                    className={`${styles["msd-item"]} ${
                      i < currentScreen ? styles["msd-done"] :
                      i === currentScreen ? styles["msd-active"] : styles["msd-pending"]
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Action buttons */}
            <div className={styles["mobile-btns"]}>
              {/* Back — screens 1-6 */}
              {currentScreen > 0 && currentScreen < 7 && (
                <button className={`${styles["btn"]} ${styles["btn-ghost"]}`} onClick={() => goTo(currentScreen - 1)}>Back</button>
              )}

              {/* Screen 0: Start setup */}
              {currentScreen === 0 && (
                <button className={`${styles["btn"]} ${styles["btn-primary"]}`} onClick={() => goTo(1)}>
                  Start setup&nbsp;
                  <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              )}

              {/* Screens 1, 3, 4, 5: simple Continue */}
              {[1, 3, 4, 5].includes(currentScreen) && (
                <button className={`${styles["btn"]} ${styles["btn-primary"]}`} onClick={() => goTo(currentScreen + 1)}>
                  Continue&nbsp;
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M3 7.5h9M8 3.5l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              )}

              {/* Screen 2: profile validation */}
              {currentScreen === 2 && (
                <button className={`${styles["btn"]} ${styles["btn-primary"]}`} onClick={continueFromProfile}>
                  Continue&nbsp;
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M3 7.5h9M8 3.5l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              )}

              {/* Screen 6: submit */}
              {currentScreen === 6 && (
                <button
                  className={`${styles["btn"]} ${styles["btn-primary"]}`}
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  style={{ opacity: isSubmitting ? 0.7 : 1 }}
                >
                  {isSubmitting ? "Saving…" : <>Complete setup&nbsp;<svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M2.5 7.5l4 4 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg></>}
                </button>
              )}

              {/* Screen 7: done */}
              {currentScreen === 7 && (
                <button className={`${styles["btn"]} ${styles["btn-primary"]}`} onClick={() => router.push('/feed')}>
                  Go to my dashboard&nbsp;
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              )}
            </div>
          </div>

        </div>{/* /right */}
      </div>{/* /shell */}
    </div>
  );
}
