"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Map as MapGL, MapClusterLayer, MapControls } from "@/components/ui/map";
import { MapPin, X, Menu } from "lucide-react";
import api from "@/lib/axios";
import styles from "./BuildersMap.module.css";

// ─── Config ───────────────────────────────────────────────────────────────────

// All internal coords stored as [lat, lng] (matching geocode tables below)
const INDIA_CENTER = [20.5937, 78.9629];
const DEFAULT_ZOOM = 4.5;

const COLORS = [
    "#14B8A6", "#8B5CF6", "#F97316", "#EAB308",
    "#EC4899", "#22C55E", "#3B82F6", "#EF4444",
];

const CITY_COORDS = {
    Mumbai: [19.076, 72.8777], Delhi: [28.6139, 77.209], "New Delhi": [28.6139, 77.209],
    Bangalore: [12.9716, 77.5946], Bengaluru: [12.9716, 77.5946],
    Hyderabad: [17.385, 78.4867], Chennai: [13.0827, 80.2707],
    Kolkata: [22.5726, 88.3639], Pune: [18.5204, 73.8567],
    Ahmedabad: [23.0225, 72.5714], Surat: [21.1702, 72.8311],
    Jaipur: [26.9124, 75.7873], Lucknow: [26.8467, 80.9462],
    Nagpur: [21.1458, 79.0882], Indore: [22.7196, 75.8577],
    Thane: [19.2183, 72.9781], Bhopal: [23.2599, 77.4126],
    Visakhapatnam: [17.6868, 83.2185], Patna: [25.5941, 85.1376],
    Vadodara: [22.3072, 73.1812], Ghaziabad: [28.6692, 77.4538],
    Ludhiana: [30.901, 75.8573], Nashik: [20.0112, 73.7902],
    Faridabad: [28.4089, 77.3178], Rajkot: [22.3039, 70.8022],
    Varanasi: [25.3176, 82.9739], Srinagar: [34.0837, 74.7973],
    Aurangabad: [19.8762, 75.3433], Amritsar: [31.634, 74.8723],
    "Navi Mumbai": [19.0368, 73.0158], Allahabad: [25.4358, 81.8463],
    Prayagraj: [25.4358, 81.8463], Ranchi: [23.3441, 85.3096],
    Howrah: [22.5958, 88.2636], Coimbatore: [11.0168, 76.9558],
    Jabalpur: [23.1815, 79.9864], Gwalior: [26.2183, 78.1828],
    Vijayawada: [16.5062, 80.648], Jodhpur: [26.2389, 73.0243],
    Madurai: [9.9252, 78.1198], Raipur: [21.2514, 81.6296],
    Guwahati: [26.1445, 91.7362], Chandigarh: [30.7333, 76.7794],
    Mysore: [12.2958, 76.6394], Mysuru: [12.2958, 76.6394],
    Gurgaon: [28.4595, 77.0266], Gurugram: [28.4595, 77.0266],
    Noida: [28.5355, 77.391], Kochi: [9.9312, 76.2673],
    Cochin: [9.9312, 76.2673], Thiruvananthapuram: [8.5241, 76.9366],
    Trivandrum: [8.5241, 76.9366], Mangalore: [12.9141, 74.856],
    Mangaluru: [12.9141, 74.856], Bhubaneswar: [20.2961, 85.8245],
    Dehradun: [30.3165, 78.0322], Warangal: [17.9784, 79.5941],
    Jammu: [32.7266, 74.857], Jalandhar: [31.326, 75.5762],
    Goa: [15.2993, 74.124], Panaji: [15.4989, 73.8278],
    Shimla: [31.1048, 77.1734], Salem: [11.6643, 78.146],
    Guntur: [16.3067, 80.4365], Kota: [25.2138, 75.8648],
    Udaipur: [24.5854, 73.7125], Agra: [27.1767, 78.0081],
    Meerut: [28.9845, 77.7064], Bareilly: [28.367, 79.4304],
    Moradabad: [28.8386, 78.7733],
};

const STATE_COORDS = {
    Maharashtra: [19.7515, 75.7139], Karnataka: [15.3173, 75.7139],
    "Tamil Nadu": [11.1271, 78.6569], Delhi: [28.7041, 77.1025],
    "West Bengal": [22.9868, 87.855], "Uttar Pradesh": [26.8467, 80.9462],
    Gujarat: [22.2587, 71.1924], Rajasthan: [27.0238, 74.2179],
    "Andhra Pradesh": [15.9129, 79.74], Telangana: [18.1124, 79.0193],
    Kerala: [10.8505, 76.2711], Punjab: [31.1471, 75.3412],
    Haryana: [29.0588, 76.0856], "Madhya Pradesh": [22.9734, 78.6569],
    Bihar: [25.0961, 85.3131], Odisha: [20.9517, 85.0985],
    Jharkhand: [23.6102, 85.2799], "Himachal Pradesh": [31.1048, 77.1734],
    Uttarakhand: [30.0668, 79.0193], Chhattisgarh: [21.2787, 81.8661],
    Assam: [26.2006, 92.9376], Chandigarh: [30.7333, 76.7794],
    Goa: [15.2993, 74.124], Manipur: [24.6637, 93.9063],
    Meghalaya: [25.467, 91.3662], Sikkim: [27.533, 88.5122],
    Tripura: [23.9408, 91.9882], Mizoram: [23.1645, 92.9376],
    Nagaland: [26.1584, 94.5624],
};

const COUNTRY_COORDS = {
    India: [20.5937, 78.9629], USA: [37.0902, -95.7129],
    "United States": [37.0902, -95.7129], UK: [55.3781, -3.436],
    "United Kingdom": [55.3781, -3.436], Canada: [56.1304, -106.3468],
    Australia: [-25.2744, 133.7751], Germany: [51.1657, 10.4515],
    Singapore: [1.3521, 103.8198], UAE: [23.4241, 53.8478],
    "United Arab Emirates": [23.4241, 53.8478], France: [46.2276, 2.2137],
    Netherlands: [52.1326, 5.2913], Sweden: [60.1282, 18.6435],
};

const COFOUND_LABEL = {
    "actively-looking": "Open to co-found",
    "open-to-conversations": "Open to conversations",
    "building-solo": "Building solo",
    "advisor-mentor": "Happy to advise",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getColor(userId) {
    let h = 0;
    const s = String(userId || "x");
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return COLORS[h % COLORS.length];
}

function getInitials(b) {
    if (b.firstName && b.lastName)
        return (b.firstName[0] + b.lastName[0]).toUpperCase();
    if (b.name)
        return b.name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "??";
    if (b.username) return b.username.slice(0, 2).toUpperCase();
    return "??";
}

function geocode(city, state, country) {
    const lookup = (table, val) => {
        if (!val || !val.trim()) return null;
        const v = val.trim();
        if (table[v]) return table[v];
        const key = Object.keys(table).find((k) => k.toLowerCase() === v.toLowerCase());
        return key ? table[key] : null;
    };
    const cityCoords = lookup(CITY_COORDS, city);
    if (cityCoords) return { coords: cityCoords, jitter: 0.08 };
    const stateCoords = lookup(STATE_COORDS, state);
    if (stateCoords) return { coords: stateCoords, jitter: 0.6 };
    const countryCoords = lookup(COUNTRY_COORDS, country);
    if (countryCoords) return { coords: countryCoords, jitter: 2.5 };
    if ((city && city.trim()) || (state && state.trim()) || (country && country.trim())) {
        return { coords: INDIA_CENTER, jitter: 3.5 };
    }
    return null;
}

function computeMatch(builder, myProfile) {
    let score = 60;
    if (!myProfile) return score;
    const mySkills = myProfile.skills || [];
    const shared = (builder.skills || []).filter((s) => mySkills.includes(s)).length;
    score += Math.min(shared * 9, 25);
    if (builder.city && myProfile.city && builder.city === myProfile.city) score += 10;
    else if (builder.state && myProfile.state && builder.state === myProfile.state) score += 5;
    if (builder.cofounderAvailability && builder.cofounderAvailability === myProfile.cofounderAvailability) score += 5;
    return Math.min(score, 97);
}

const jitterCache = new Map();
function jittered(userId, coords, range = 0.08) {
    if (!jitterCache.has(userId)) {
        jitterCache.set(userId, [
            coords[0] + (Math.random() - 0.5) * range * 2,
            coords[1] + (Math.random() - 0.5) * range * 2,
        ]);
    }
    return jitterCache.get(userId);
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function BuildersMap() {
    const mapRef = useRef(null);

    const [enriched, setEnriched] = useState([]);
    const [myProfile, setMyProfile] = useState(null);
    const [myUserId, setMyUserId] = useState(null);
    const [myLocation, setMyLocation] = useState(null);
    const [activity, setActivity] = useState([]);
    const [nearby, setNearby] = useState([]);
    const [loading, setLoading] = useState(true);

    const [selectedBuilder, setSelectedBuilder] = useState(null);
    const [builderDetail, setBuilderDetail] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);

    const [activeTab, setActiveTab] = useState("matches");
    const [selectedMatch, setSelectedMatch] = useState(null);
    const [mapTarget, setMapTarget] = useState(null);
    const [mobilePanelOpen, setMobilePanelOpen] = useState(false);

    // ── Data loading ──────────────────────────────────────────────────────────

    useEffect(() => {
        async function load() {
            try {
                const userData =
                    typeof window !== "undefined"
                        ? JSON.parse(localStorage.getItem("user") || "{}")
                        : {};
                const resolvedMyUserId = userData?.id || userData?._id;
                setMyUserId(resolvedMyUserId);

                const [buildersRes, activityRes, nearbyRes] = await Promise.all([
                    api.get("/buildermap/builders", { params: { limit: 100 } }),
                    api.get("/buildermap/activity"),
                    api.get("/buildermap/nearby"),
                ]);

                const rawBuilders = buildersRes.data.builders || [];
                const rawActivity = activityRes.data.activity || [];
                const rawNearby = nearbyRes.data.builders || [];

                let myProf = null;
                if (resolvedMyUserId) {
                    try {
                        const myRes = await api.get(`/buildermap/builders/${resolvedMyUserId}`);
                        myProf = myRes.data.profile;
                    } catch (_) {}
                }

                const enrichedBuilders = rawBuilders.map((b) => {
                    const geo = geocode(b.city, b.state, b.country) ?? { coords: INDIA_CENTER, jitter: 4.5 };
                    return {
                        ...b,
                        coords: jittered(b.userId, geo.coords, geo.jitter), // [lat, lng]
                        color: getColor(b.userId),
                        initials: getInitials(b),
                        match: computeMatch(b, myProf),
                    };
                });

                setEnriched(enrichedBuilders);
                setActivity(rawActivity);
                setNearby(rawNearby);
                setMyLocation(nearbyRes.data.myLocation);
                setMyProfile(myProf);

                const top = [...enrichedBuilders].sort((a, b) => b.match - a.match);
                if (top[0]) setSelectedMatch(top[0]);
            } catch (err) {
                console.error("BuildersMap load error:", err);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    // ── Fly to target when changed ────────────────────────────────────────────

    useEffect(() => {
        if (!mapTarget || !mapRef.current) return;
        // coords are [lat, lng], MapLibre needs [lng, lat]
        mapRef.current.flyTo({
            center: [mapTarget[1], mapTarget[0]],
            zoom: 7,
            speed: 1.2,
        });
    }, [mapTarget]);

    // ── Build GeoJSON from enriched builders ──────────────────────────────────

    const geoJSON = useMemo(() => {
        if (!enriched.length) return null;
        return {
            type: "FeatureCollection",
            features: enriched.map((b) => ({
                type: "Feature",
                geometry: {
                    type: "Point",
                    // GeoJSON / MapLibre uses [lng, lat]
                    coordinates: [b.coords[1], b.coords[0]],
                },
                properties: {
                    userId: b.userId,
                },
            })),
        };
    }, [enriched]);

    // ── Point click ───────────────────────────────────────────────────────────

    const handlePointClick = useCallback(
        async (feature) => {
            const userId = feature.properties.userId;
            const builder = enriched.find((b) => b.userId === userId);
            if (!builder) return;

            if (selectedBuilder?.userId === userId) {
                setSelectedBuilder(null);
                setBuilderDetail(null);
                return;
            }
            setSelectedBuilder(builder);
            setBuilderDetail(null);
            setDetailLoading(true);
            setMapTarget(builder.coords);
            try {
                const res = await api.get(`/buildermap/builders/${userId}`);
                setBuilderDetail(res.data);
            } catch (_) {}
            setDetailLoading(false);
        },
        [selectedBuilder, enriched]
    );

    // ── Derived ───────────────────────────────────────────────────────────────

    const topMatches = [...enriched].sort((a, b) => b.match - a.match).slice(0, 10);

    const cityCounts = nearby.reduce((acc, b) => {
        if (b.city) acc[b.city] = (acc[b.city] || 0) + 1;
        return acc;
    }, {});
    const cityStats = Object.entries(cityCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 4)
        .map(([city, count], i) => ({
            city,
            count,
            color: i === 0 ? "#F97316" : i === 1 ? "#14B8A6" : i === 2 ? "#F97316" : "#A855F7",
        }));

    const tickerFeed = [...activity, ...activity];

    if (loading) {
        return (
            <div className={styles.page}>
                <div className={styles.loadingState}>Loading builders map…</div>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <div className={styles.body}>
                {/* ── Map Area ────────────────────────────────────────────────── */}
                <div className={styles.mapArea}>
                    {/* Badge */}
                    <div className={styles.connBadge}>
                        <div className={styles.avatarStack}>
                            {enriched.slice(0, 3).map((b) => (
                                <span
                                    key={b.userId}
                                    className={styles.stackAvatar}
                                    style={{ background: b.color }}
                                >
                                    {b.initials}
                                </span>
                            ))}
                        </div>
                        <span className={styles.connText}>{enriched.length} builders on map</span>
                    </div>

                    {/* mapcn Map */}
                    <MapGL
                        ref={mapRef}
                        center={[INDIA_CENTER[1], INDIA_CENTER[0]]}
                        zoom={DEFAULT_ZOOM}
                        className={styles.mapCanvas}
                    >
                        {geoJSON && (
                            <MapClusterLayer
                                data={geoJSON}
                                clusterRadius={50}
                                clusterMaxZoom={14}
                                clusterColors={["#14B8A6", "#F97316", "#EC4899"]}
                                pointColor="#14B8A6"
                                onPointClick={handlePointClick}
                            />
                        )}
                        <MapControls
                            position="top-right"
                            showZoom
                            showFullscreen
                            className={styles.mapControls}
                        />
                    </MapGL>

                    {/* Builder popup panel */}
                    {selectedBuilder && (
                        <div className={styles.popup}>
                            {detailLoading || !builderDetail ? (
                                <div className={styles.popupLoading}>Loading…</div>
                            ) : (
                                <BuilderPopup
                                    builder={selectedBuilder}
                                    detail={builderDetail}
                                    myUserId={myUserId}
                                    onClose={() => {
                                        setSelectedBuilder(null);
                                        setBuilderDetail(null);
                                    }}
                                />
                            )}
                        </div>
                    )}

                    {/* FAB — mobile only */}
                    <button
                        className={styles.mobilePanelBtn}
                        onClick={() => setMobilePanelOpen(true)}
                        aria-label="Open matches panel"
                    >
                        <Menu size={18} />
                    </button>
                </div>

                {/* Backdrop — mobile only */}
                {mobilePanelOpen && (
                    <div
                        className={styles.mobileOverlay}
                        onClick={() => setMobilePanelOpen(false)}
                    />
                )}

                {/* ── Right Panel ─────────────────────────────────────────────── */}
                <div className={`${styles.rightPanel} ${mobilePanelOpen ? styles.rightPanelOpen : ""}`}>
                    <div className={styles.panelHdr}>
                        <span className={styles.panelTitle}>Top matches near you</span>
                        <div className={styles.panelHdrRight}>
                            <span className={styles.builderBadge}>{enriched.length} builders</span>
                            <button
                                className={styles.panelCloseBtn}
                                onClick={() => setMobilePanelOpen(false)}
                                aria-label="Close panel"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    </div>

                    <div className={styles.tabBar}>
                        {["matches", "nearby"].map((tab) => (
                            <button
                                key={tab}
                                className={`${styles.tabBtn} ${activeTab === tab ? styles.tabBtnActive : ""}`}
                                onClick={() => setActiveTab(tab)}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                    </div>

                    <div className={styles.tabBody}>
                        {activeTab === "matches" ? (
                            <MatchesPanel
                                topMatches={topMatches}
                                selectedMatch={selectedMatch}
                                myUserId={myUserId}
                                onSelect={(m) => {
                                    setSelectedMatch(m);
                                    setMapTarget(m.coords);
                                }}
                            />
                        ) : (
                            <NearbyPanel
                                myLocation={myLocation}
                                nearbyCount={nearby.length}
                                cityStats={cityStats}
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* ── Live Ticker ─────────────────────────────────────────────────── */}
            {tickerFeed.length > 0 && (
                <div className={styles.ticker}>
                    <div className={styles.tickerLive}>
                        <span className={styles.liveDot} />
                        LIVE
                    </div>
                    <div className={styles.tickerScroll}>
                        <div className={styles.tickerTrack}>
                            {tickerFeed.map((item, i) => (
                                <span key={i} className={styles.tickerItem}>
                                    <span
                                        className={styles.tickerDot}
                                        style={{
                                            background: item.type === "launch" ? "#22C55E" : "#F97316",
                                        }}
                                    />
                                    {item.actor.name}{" "}
                                    {item.type === "launch" ? "just launched" : "submitted"}{" "}
                                    {item.productName}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Builder Popup ────────────────────────────────────────────────────────────

function BuilderPopup({ builder, detail, myUserId, onClose }) {
    const { profile, nowStatus, products } = detail;
    const displayName = profile.name || `${profile.firstName} ${profile.lastName}`;
    const badge = COFOUND_LABEL[profile.cofounderAvailability];
    const location = [profile.city, profile.state].filter(Boolean).join(", ");
    const isSelf = myUserId && profile.userId && String(myUserId) === String(profile.userId);

    const [isConnected, setIsConnected] = useState(false);
    const [connectLoading, setConnectLoading] = useState(false);

    useEffect(() => {
        if (!profile.userId || isSelf) return;
        api.get(`/user/followStatus/${profile.userId}`)
            .then((res) => setIsConnected(res.data.isFollowing))
            .catch(() => {});
    }, [profile.userId]);

    const handleConnect = async () => {
        if (connectLoading || !profile.userId) return;
        setConnectLoading(true);
        try {
            const action = isConnected ? "unfollow" : "follow";
            await api.post(`/user/toggleFollow/${profile.userId}`, { action });
            setIsConnected((prev) => !prev);
        } catch (err) {
            console.error("Connect error:", err);
        } finally {
            setConnectLoading(false);
        }
    };

    return (
        <div className={styles.popupCard}>
            <button className={styles.popupClose} onClick={onClose}>
                <X size={13} />
            </button>
            <div className={styles.popupTop}>
                {profile.picture ? (
                    <img src={profile.picture} alt="" className={styles.popupAvatarImg} />
                ) : (
                    <div className={styles.popupAvatar} style={{ background: builder.color }}>
                        {builder.initials}
                    </div>
                )}
                <div className={styles.popupBody}>
                    <div className={styles.popupName}>{displayName}</div>
                    {location && <div className={styles.popupCity}>{location}</div>}
                    <div className={styles.popupMeta}>
                        <span className={styles.popupMatch}>{builder.match}% match</span>
                        {profile.skills?.[0] && (
                            <>
                                <span className={styles.popupSep}>|</span>
                                <span className={styles.popupCat}>{profile.skills[0]}</span>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {nowStatus && (
                <div className={styles.nowRow}>
                    <span className={styles.nowDot}>•</span>
                    {nowStatus}
                </div>
            )}

            {profile.skills?.length > 0 && (
                <div className={styles.tagsRow}>
                    {profile.skills.slice(0, 3).map((s) => (
                        <span key={s} className={styles.tagChip}>{s}</span>
                    ))}
                </div>
            )}

            {badge && <span className={styles.openBadge}>{badge}</span>}

            {!isSelf && (
                <div className={styles.actionRow}>
                    <button
                        className={styles.connectBtn}
                        onClick={handleConnect}
                        disabled={connectLoading}
                        style={{ opacity: connectLoading ? 0.7 : 1 }}
                    >
                        {isConnected ? "Following" : "Connect"}
                    </button>
                    <button className={styles.messageBtn}>Message</button>
                </div>
            )}
        </div>
    );
}

// ─── Matches Panel ────────────────────────────────────────────────────────────

function MatchesPanel({ topMatches, selectedMatch, myUserId, onSelect }) {
    if (topMatches.length === 0) {
        return (
            <div className={styles.emptyState}>
                No builders with location data yet.
            </div>
        );
    }

    const match = selectedMatch || topMatches[0];
    const isSelf = myUserId && match?.userId && String(myUserId) === String(match.userId);

    const [isConnected, setIsConnected] = useState(false);
    const [connectLoading, setConnectLoading] = useState(false);

    useEffect(() => {
        if (!match?.userId || isSelf) return;
        setIsConnected(false);
        api.get(`/user/followStatus/${match.userId}`)
            .then((res) => setIsConnected(res.data.isFollowing))
            .catch(() => {});
    }, [match?.userId]);

    const handleConnect = async () => {
        if (connectLoading || !match?.userId) return;
        setConnectLoading(true);
        try {
            const action = isConnected ? "unfollow" : "follow";
            await api.post(`/user/toggleFollow/${match.userId}`, { action });
            setIsConnected((prev) => !prev);
        } catch (err) {
            console.error("Connect error:", err);
        } finally {
            setConnectLoading(false);
        }
    };

    return (
        <div className={styles.matchesPanel}>
            {match && (
                <div className={styles.matchCard}>
                    <div className={styles.cardTop}>
                        <div className={styles.avatarWrap}>
                            {match.picture ? (
                                <img src={match.picture} alt="" className={styles.bigAvatarImg} />
                            ) : (
                                <div className={styles.bigAvatar} style={{ background: match.color }}>
                                    {match.initials}
                                </div>
                            )}
                        </div>
                        <div>
                            <div className={styles.cardName}>
                                {match.name || `${match.firstName} ${match.lastName}`}
                                <span className={styles.plusChip}>+</span>
                            </div>
                            <div className={styles.cardRole}>
                                {[
                                    COFOUND_LABEL[match.cofounderAvailability],
                                    match.city,
                                ]
                                    .filter(Boolean)
                                    .join(" · ")}
                            </div>
                        </div>
                    </div>

                    {match.skills?.length > 0 && (
                        <div className={styles.tagsRow}>
                            {match.skills.slice(0, 4).map((s) => (
                                <span key={s} className={styles.tagChip}>{s}</span>
                            ))}
                        </div>
                    )}

                    {match.cofounderAvailability && (
                        <span className={styles.openBadge}>
                            {COFOUND_LABEL[match.cofounderAvailability]}
                        </span>
                    )}

                    {!isSelf && (
                        <div className={styles.actionRow}>
                            <button
                                className={styles.connectBtn}
                                onClick={handleConnect}
                                disabled={connectLoading}
                                style={{ opacity: connectLoading ? 0.7 : 1 }}
                            >
                                {isConnected ? "Following" : "Connect"}
                            </button>
                            <button className={styles.messageBtn}>Message</button>
                        </div>
                    )}
                </div>
            )}

            <div className={styles.matchList}>
                <div className={styles.matchListHdr}>
                    <span className={styles.matchListTitle}>TOP MATCHES</span>
                </div>
                {topMatches.map((m) => (
                    <div
                        key={m.userId}
                        className={`${styles.miniCard} ${m.userId === match?.userId ? styles.miniCardSel : ""}`}
                        onClick={() => onSelect(m)}
                    >
                        <div className={styles.miniAvaWrap}>
                            {m.picture ? (
                                <img src={m.picture} alt="" className={styles.miniAvaImg} />
                            ) : (
                                <div className={styles.miniAva} style={{ background: m.color }}>
                                    {m.initials}
                                </div>
                            )}
                        </div>
                        <div className={styles.miniInfo}>
                            <div className={styles.miniName}>
                                {m.name || `${m.firstName} ${m.lastName}`}
                            </div>
                            <div className={styles.miniRole}>
                                {[m.city, m.state].filter(Boolean).join(", ")}
                            </div>
                            {m.skills?.length > 0 && (
                                <div className={styles.miniTagRow}>
                                    {m.skills.slice(0, 2).map((s) => (
                                        <span key={s} className={styles.miniTag}>{s}</span>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div
                            className={styles.miniScore}
                            style={{ color: m.match >= 85 ? "#22C55E" : "#F97316" }}
                        >
                            {m.match}%
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Nearby Panel ─────────────────────────────────────────────────────────────

function NearbyPanel({ myLocation, nearbyCount, cityStats }) {
    const locationStr = myLocation
        ? [myLocation.city, myLocation.state, myLocation.country].filter(Boolean).join(", ")
        : "Unknown";

    return (
        <div className={styles.nearbyPanel}>
            <div className={styles.locationRow}>
                <MapPin size={13} color="#64748B" />
                <span className={styles.locationText}>{locationStr}</span>
            </div>
            <div className={styles.nearbyCount}>{nearbyCount} builders in your area</div>
            <div className={styles.nearbySubtitle}>Based on your profile location</div>

            {cityStats.length > 0 && (
                <div className={styles.cityGrid}>
                    {cityStats.map((s) => (
                        <div key={s.city} className={styles.cityCard}>
                            <div className={styles.cityName}>{s.city}</div>
                            <div className={styles.cityCount} style={{ color: s.color }}>
                                {s.count}
                            </div>
                            <div className={styles.cityStatLabel} style={{ color: s.color }}>
                                builders
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {cityStats.length === 0 && (
                <div className={styles.emptyState}>No builders found nearby yet.</div>
            )}
        </div>
    );
}
