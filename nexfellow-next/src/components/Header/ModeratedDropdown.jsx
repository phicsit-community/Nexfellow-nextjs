"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ShieldCheck, ChevronDown } from "lucide-react";
import styles from "./ModeratedDropdown.module.css";

function ModeratedDropdown({ moderated, getInitials }) {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef(null);

    const toggleDropdown = () => setIsOpen((prev) => !prev);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    return (
        <div className={styles.moderatedDropdownWrapper} ref={wrapperRef}>
            <button
                onClick={toggleDropdown}
                className={styles.moderatedDropdownButton}
                aria-expanded={isOpen}
                aria-haspopup="true"
                type="button"
            >
                <ShieldCheck className={styles.icon} />
                Moderated Accounts
                <ChevronDown
                    className={`${styles.chevronIcon} ${isOpen ? styles.rotated : ""}`}
                />
            </button>

            <div
                className={`${styles.moderatedDropdownContent} ${isOpen ? styles.open : ""
                    }`}
                role="menu"
            >
                {moderated.length === 0 ? (
                    <div className={styles.emptyMessage}>No moderated communities</div>
                ) : (
                    moderated.map((community) => (
                        <Link
                            href={`/moderators/${community?.username || community.link || community.communityId}`}
                            key={community.communityId}
                            className={styles.moderatedDropdownItem}
                            onClick={() => setIsOpen(false)}
                            role="menuitem"
                            tabIndex={0}
                        >
                            <div className={styles.communityAvatar}>
                                {community.picture ? (
                                    <img
                                        src={community.picture}
                                        alt={community.name || "Community Owner"}
                                        onError={(e) => {
                                            e.currentTarget.onerror = null;
                                            e.currentTarget.src = "/default-avatar.png"; // fallback image path
                                        }}
                                    />
                                ) : (
                                    <div className={styles.avatarInitials}>
                                        {getInitials(community.name)}
                                    </div>
                                )}
                            </div>
                            <div className={styles.communityInfo}>
                                <div className={styles.communityName}>
                                    {community.name || community.owner || "Unnamed"}
                                </div>
                                <div className={styles.communityRole}>
                                    {community.role || "Moderator"}
                                </div>
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
}

export default ModeratedDropdown;
