'use client';

import { useEffect, useState } from 'react';
import { IoIosSearch } from 'react-icons/io';
import { BsStar, BsStarFill } from 'react-icons/bs';
import styles from './FeaturedCommunities.module.css';

interface Community {
    _id: string;
    name?: string;
    profile?: string;
    shortDescription?: string;
    description?: string;
    owner?: {
        name?: string;
    };
}

export function FeaturedCommunitiesClient() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const [allCommunities, setAllCommunities] = useState<Community[]>([]);
    const [featured, setFeatured] = useState<Community[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        const fetchCommunities = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                const [allRes, featuredRes] = await Promise.all([
                    fetch(`${apiUrl}/admin/featured-communities`, {
                        headers: { Authorization: `Bearer ${token}` },
                        credentials: 'include',
                    }),
                    fetch(`${apiUrl}/explore/all-communities`, {
                        credentials: 'include',
                    }),
                ]);

                if (!allRes.ok || !featuredRes.ok) throw new Error();

                const allData = await allRes.json();
                const featuredData = await featuredRes.json();

                setAllCommunities(Array.isArray(allData) ? allData : []);
                setFeatured(Array.isArray(featuredData) ? featuredData : []);
            } catch {
                setErrorMsg('Failed to load community data.');
            } finally {
                setLoading(false);
            }
        };

        fetchCommunities();
    }, [apiUrl]);

    const getCommunityName = (c: Community) => {
        return (
            c?.owner?.name ||
            c?.name ||
            c?.profile ||
            c?.shortDescription ||
            (typeof c?.description === 'string' ? c.description.slice(0, 30) : '') ||
            'Unnamed'
        );
    };

    const handleAdd = (comm: Community) => {
        if (!featured.some((f) => f._id === comm._id)) {
            setFeatured([...featured, comm]);
        }
    };

    const handleRemove = (id: string) => {
        setFeatured(featured.filter((c) => c._id !== id));
    };

    const handleMoveUp = (index: number) => {
        if (index === 0) return;
        const items = [...featured];
        [items[index - 1], items[index]] = [items[index], items[index - 1]];
        setFeatured(items);
    };

    const handleMoveDown = (index: number) => {
        if (index === featured.length - 1) return;
        const items = [...featured];
        [items[index], items[index + 1]] = [items[index + 1], items[index]];
        setFeatured(items);
    };

    const handleSave = async () => {
        setSaving(true);
        setSuccessMsg('');
        setErrorMsg('');

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${apiUrl}/admin/all-communities`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ communityIds: featured.map((c) => c._id) }),
                credentials: 'include',
            });
            if (!res.ok) throw new Error();
            setSuccessMsg('Featured communities updated!');
        } catch {
            setErrorMsg('Failed to save featured communities.');
        } finally {
            setSaving(false);
            setTimeout(() => setSuccessMsg(''), 2000);
        }
    };

    const availableCommunities = allCommunities.filter(
        (c) =>
            !featured.some((f) => f._id === c._id) &&
            getCommunityName(c).toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.panelContainer}>
                <div className={styles.header}>
                    <p className={styles.mainTitle}>All Communities</p>
                    <p className={styles.subTitle}>
                        Manage and feature your communities
                    </p>
                </div>

                <div className={styles.summarySection}>
                    <div className={styles.summaryCard}>
                        <div>
                            <p className={styles.summaryLabel}>Total Communities</p>
                            <p className={styles.summaryValue}>{allCommunities.length}</p>
                        </div>
                    </div>
                    <div className={styles.summaryCard}>
                        <div>
                            <p className={styles.summaryLabel}>Featured</p>
                            <p className={styles.summaryValue}>{featured.length}</p>
                        </div>
                    </div>
                </div>

                <div className={styles.communitySectionMain}>
                    <div className={styles.communitySection}>
                        <div className={styles.communityHeader}>
                            <p className={styles.communityTitle}>All Communities</p>
                            <p className={styles.communityCount}>
                                {availableCommunities.length} communities
                            </p>
                        </div>
                        <div className={styles.searchContainer}>
                            <IoIosSearch className={styles.searchIcon} />
                            <input
                                type="text"
                                placeholder="Search communities..."
                                className={styles.searchInput}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        <div className={styles.communityList}>
                            {loading ? (
                                <p>Loading...</p>
                            ) : availableCommunities.length === 0 ? (
                                <p>No communities found</p>
                            ) : (
                                availableCommunities.map((comm) => (
                                    <div key={comm._id} className={styles.communityCard}>
                                        <div className={styles.communityInfo}>
                                            <p className={styles.communityName}>
                                                {getCommunityName(comm)}
                                            </p>
                                            <p className={styles.communityDesc}>
                                                {comm.shortDescription || 'No description'}
                                            </p>
                                        </div>
                                        <button
                                            className={styles.featureButton}
                                            onClick={() => handleAdd(comm)}
                                        >
                                            <BsStar /> Feature
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className={styles.panel}>
                        <div className={styles.communityHeader}>
                            <div className={styles.communityTitleWrapper}>
                                <BsStarFill color="#fbbf24" />
                                <h3>Featured Communities</h3>
                            </div>
                            <span className={styles.communityCount}>
                                {featured.length} communities
                            </span>
                        </div>

                        <div className={styles.featuredList}>
                            {featured.map((comm, index) => (
                                <div key={comm._id} className={styles.featuredItem}>
                                    <div className={styles.communityCard}>
                                        <div className={styles.orderControls}>
                                            <button
                                                onClick={() => handleMoveUp(index)}
                                                disabled={index === 0}
                                                className={styles.orderBtn}
                                            >
                                                ↑
                                            </button>
                                            <button
                                                onClick={() => handleMoveDown(index)}
                                                disabled={index === featured.length - 1}
                                                className={styles.orderBtn}
                                            >
                                                ↓
                                            </button>
                                        </div>
                                        <div className={styles.communityInfo}>
                                            <p className={styles.communityName}>
                                                {getCommunityName(comm)}
                                            </p>
                                            <p className={styles.communityDesc}>
                                                {comm.shortDescription || 'No description'}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleRemove(comm._id)}
                                            className={styles.removeBtn}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className={styles.actions}>
                            <button
                                onClick={handleSave}
                                disabled={saving || loading}
                                className={styles.saveBtn}
                            >
                                {saving ? 'Saving...' : 'Save Featured Order'}
                            </button>
                            {successMsg && (
                                <span className={styles.successMsg}>{successMsg}</span>
                            )}
                            {errorMsg && (
                                <span className={styles.errorMsg}>{errorMsg}</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
