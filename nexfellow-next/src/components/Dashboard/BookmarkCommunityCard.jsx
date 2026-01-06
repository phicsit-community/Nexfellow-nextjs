import React, { useEffect, useState } from "react";
import styles from "./BookmarkCommunity.module.css";
import { Icon } from "@iconify/react";
import { FaFire } from "react-icons/fa";
import api from "../../lib/axios";

const BookmarkCommunityCard = ({ data, path = "community" }) => {
    const owner = data.owner || {};
    const banner =
        owner.banner ||
        data.headerImage ||
        "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=facearea&w=800&q=80";
    const profilePic =
        owner.picture ||
        data.profilePic ||
        "https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_1280.png";
    const members = owner.followers?.length ? owner.followers.length : 0;
    const username = owner.username || data.username || "unknown";
    const communityName = owner.name || data.name || "Unnamed Community";
    const description =
        data.shortDescription ||
        data.description ||
        "No description available.";
    const tags = data.category || ["Technology"];

    // Reputation score state
    const [reputationScore, setReputationScore] = useState(0);
    const [loadingReputation, setLoadingReputation] = useState(false);

    useEffect(() => {
        if (!data._id) return;
        setLoadingReputation(true);
        axios
            .get(`/analytics/${data._id}/reputation`)
            .then((res) => {
                setReputationScore(res.data.reputationScore || 0);
            })
            .catch((err) => {
                console.error("Failed to fetch reputation for", data._id);
                setReputationScore(0);
            })
            .finally(() => setLoadingReputation(false));
    }, [data._id]);

    return (
        <div className={styles.bookmarkCard}>
            <div className={styles.bannerContainer}>
                <img src={banner} alt="Community Banner" className={styles.banner} />
                <img
                    src={profilePic}
                    alt="Community Avatar"
                    className={styles.profilePic}
                />
            </div>
            <div className={styles.content}>
                <h5 className={styles.title}>{communityName}</h5>
                <p className={styles.description}>{description}</p>
            </div>
            <div className={styles.metaRow}>
                {tags.map((tag, idx) => (
                    <span className={styles.tag} key={idx}>
                        <Icon icon="mdi:tag-outline" />
                        {tag}
                    </span>
                ))}
                <span className={styles.reputation}>
                    <FaFire style={{ marginRight: 4, color: "#ff3030" }} />
                    {loadingReputation ? "..." : Math.round(reputationScore || 0)}
                </span>
                <span className={styles.members}>
                    <Icon icon="mdi:account-group-outline" />
                    {members} Members
                </span>
            </div>
            <a
                href={`/${path}/${username}`}
                className={styles.visitBtn}
                target="_blank"
                rel="noopener noreferrer"
            >
                Visit Community
            </a>
        </div>
    );
};

export default BookmarkCommunityCard;
