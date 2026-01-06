import React, { useEffect, useState, useRef } from "react";
import styles from "./BookmarkList.module.css";
import { FaRegSadTear, FaTrophy, FaUsers } from "react-icons/fa";
import { Icon } from "@iconify/react";
import { MdOutlineArticle } from "react-icons/md";
import { FiSearch, FiChevronDown } from "react-icons/fi";
import { LuArrowDownUp } from "react-icons/lu";
import { ThreeDots } from "react-loader-spinner";
import api from "../../lib/axios";
import BookmarkPostCard from "./BookmarkPostCard";
import BookmarkContestCard from "./BookmarkContestCard";
import BookmarkCommunityCard from "./BookmarkCommunityCard";

const CATEGORY_MAP = {
    posts: {
        label: "Posts",
        endpoint: "/bookmarks/user?itemType=Post",
        path: "post",
        icon: <Icon icon="ri:draft-fill" width={30} height={30} style={{ marginRight: 0 }} />,
        type: "Post"
    },
    contests: {
        label: "Contests",
        endpoint: "/bookmarks/user?itemType=CommunityQuiz",
        path: "dashboard-contest",
        icon: <Icon icon="solar:cup-star-bold" width={30} height={30} style={{ marginRight: 0 }} />,
        type: "CommunityQuiz"
    },
    communities: {
        label: "Communities",
        endpoint: "/bookmarks/user?itemType=Community",
        path: "community",
        icon: <Icon icon="mdi:users-group" width={30} height={30} style={{ marginRight: 0 }} />,
        type: "Community"
    },
};

const CARD_COMPONENTS = {
    Post: BookmarkPostCard,
    CommunityQuiz: BookmarkContestCard,
    Community: BookmarkCommunityCard,
};

const SORT_OPTIONS = [
    { value: "recent", label: "Most Recent" },
    { value: "oldest", label: "Oldest" },
];

const BookmarkList = () => {
    const [category, setCategory] = useState("posts");
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");
    const [sort, setSort] = useState("recent");
    const [counts, setCounts] = useState({
        posts: 0,
        contests: 0,
        communities: 0,
    });
    const [sortOpen, setSortOpen] = useState(false);
    const sortRef = useRef();

    // Fetch counts for all categories on mount
    useEffect(() => {
        const fetchCounts = async () => {
            try {
                const [postsRes, contestsRes, communitiesRes] = await Promise.all([
                    api.get(CATEGORY_MAP.posts.endpoint, { withCredentials: true }),
                    api.get(CATEGORY_MAP.contests.endpoint, { withCredentials: true }),
                    api.get(CATEGORY_MAP.communities.endpoint, { withCredentials: true }),
                ]);
                setCounts({
                    posts: postsRes.data.bookmarks?.length || 0,
                    contests: contestsRes.data.bookmarks?.length || 0,
                    communities: communitiesRes.data.bookmarks?.length || 0,
                });
            } catch (err) {
                // Optionally handle error
            }
        };
        fetchCounts();
    }, []);

    // Fetch items for active category
    useEffect(() => {
        const fetchBookmarks = async () => {
            setLoading(true);
            setError(null);
            setItems([]);
            try {
                const res = await api.get(CATEGORY_MAP[category].endpoint, {
                    withCredentials: true,
                });
                setItems(res.data.bookmarks || []);
                console.log("Fetched bookmarks:", res.data.bookmarks);
            } catch (err) {
                setError(
                    err?.response?.data?.message ||
                    "Could not load bookmarks. Please try again later."
                );
            } finally {
                setLoading(false);
            }
        };
        fetchBookmarks();
    }, [category]);

    // Filter and sort items
    const filteredItems = items
        .filter((item) => {
            const data = item.bookmarkItem || {};
            const searchText = search.toLowerCase();

            // For posts
            if (item.itemType === "Post") {
                return (
                    (data.title && data.title.toLowerCase().includes(searchText)) ||
                    (data.content && data.content.toLowerCase().includes(searchText)) ||
                    (data.author?.name && data.author.name.toLowerCase().includes(searchText)) ||
                    (data.author?.username && data.author.username.toLowerCase().includes(searchText))
                );
            }

            // For contests
            if (item.itemType === "CommunityQuiz") {
                return (
                    (data.title && data.title.toLowerCase().includes(searchText)) ||
                    (data.description && data.description.toLowerCase().includes(searchText)) ||
                    (data.creatorId?.owner?.name && data.creatorId.owner.name.toLowerCase().includes(searchText)) ||
                    (data.creatorId?.owner?.username && data.creatorId.owner.username.toLowerCase().includes(searchText))
                );
            }

            // For communities
            if (item.itemType === "Community") {
                return (
                    (data.name && data.name.toLowerCase().includes(searchText)) ||
                    (data.shortDescription && data.shortDescription.toLowerCase().includes(searchText)) ||
                    (data.description && data.description.toLowerCase().includes(searchText)) ||
                    (data.owner?.name && data.owner.name.toLowerCase().includes(searchText)) ||
                    (data.owner?.username && data.owner.username.toLowerCase().includes(searchText))
                );
            }

            return true;
        })
        .sort((a, b) =>
            sort === "recent"
                ? new Date(b.createdAt) - new Date(a.createdAt)
                : new Date(a.createdAt) - new Date(b.createdAt)
        );


    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e) => {
            if (sortRef.current && !sortRef.current.contains(e.target)) setSortOpen(false);
        };
        if (sortOpen) {
            document.addEventListener("mousedown", handler);
        }
        return () => document.removeEventListener("mousedown", handler);
    }, [sortOpen]);

    const selectedSort = SORT_OPTIONS.find(opt => opt.value === sort);

    return (
        <>
            <section className={styles.bookmarkContainer}>
                <h2 className={styles.pageTitle}>Saved Items</h2>
                <p className={styles.subTitle}>
                    See your saved {CATEGORY_MAP[category].label}
                </p>

                <div className={styles.tabContainer}>
                    {Object.entries(CATEGORY_MAP).map(([key, val]) => (
                        <button
                            key={key}
                            className={`${styles.tabButton} ${category === key ? styles.activeTab : ""}`}
                            onClick={() => setCategory(key)}
                            type="button"
                        >
                            <span className={styles.tabIcon} style={{ display: "flex", alignItems: "center" }}>
                                {val.icon}
                            </span>
                            <span style={{ display: "flex", alignItems: "flex-start", flexDirection: "column" }}>
                                <div className={styles.tabLabel} style={{ display: "flex", alignItems: "center" }}>
                                    {val.label}
                                </div>
                                <div className={styles.tabCount} style={{ display: "flex", alignItems: "center" }}>

                                    {counts[key] >= 0 && (
                                        <span className={styles.countBadge}>
                                            {counts[key]} items
                                        </span>
                                    )}
                                </div>
                            </span>
                            <span className={styles.itemCount}>
                                {counts[key]}
                            </span>
                        </button>
                    ))}
                </div>

                <div className={styles.filterRow}>
                    <div className={styles.searchWrapper}>
                        <FiSearch className={styles.searchIcon} />
                        <input
                            className={styles.searchInput}
                            placeholder="Search saved items"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className={styles.customSortWrapper} ref={sortRef}>
                        <button
                            className={styles.customSortButton}
                            onClick={() => setSortOpen(v => !v)}
                            type="button"
                            aria-haspopup="listbox"
                            aria-expanded={sortOpen}
                        >
                            <LuArrowDownUp className={styles.sortLeftIcon} />
                            <span className={styles.sortLabel}>{selectedSort.label}</span>
                            <FiChevronDown className={styles.sortChevron} />
                        </button>
                        {sortOpen && (
                            <ul className={styles.sortDropdownList} role="listbox">
                                {SORT_OPTIONS.map(opt => (
                                    <li
                                        key={opt.value}
                                        className={styles.sortDropdownItem}
                                        onClick={() => { setSort(opt.value); setSortOpen(false); }}
                                        role="option"
                                        aria-selected={opt.value === sort}
                                    >
                                        {opt.label}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

            </section>

            {/* Card grid OUTSIDE the bookmarkContainer */}
            {loading ? (
                <div className={styles.loaderBox}>
                    <ThreeDots visible height="48" width="48" color="#24b2b4" />
                </div>
            ) : error ? (
                <div className={styles.errorBox}>
                    <FaRegSadTear className={styles.errorIcon} />
                    <p>{error}</p>
                </div>
            ) : filteredItems.length === 0 ? (
                <div className={styles.emptyBox}>
                    <FaRegSadTear className={styles.emptyIcon} />
                    <p>No bookmarks found in this category.</p>
                </div>
            ) : null}
            {filteredItems.length > 0 && (
                <div
                    className={`${styles.cardsGrid} ${styles[`${category}Grid`]}`}
                >
                    {filteredItems.map((item) => {
                        const data = item.bookmarkItem || {};
                        const CardComponent = CARD_COMPONENTS[item.itemType];
                        if (!CardComponent) return null;
                        return (
                            <CardComponent
                                key={item._id}
                                data={data}
                                bookmark={item}
                                path={CATEGORY_MAP[category].path}
                            />
                        );
                    })}
                </div>
            )}
        </>
    );
};

export default BookmarkList;
