"use client";

import React from "react";
import { useEffect, useState, useRef } from "react";
import { IoArrowBack } from "react-icons/io5";
import { BsThreeDotsVertical } from "react-icons/bs";
import { useRouter, usePathname } from "next/navigation";
import CommunitySidebar from "../../components/Community/CommunitySidebar";
import styles from "./AllCommunities.module.css";
import CommunityBanner from "./assets/community_image.svg";
import ProfileImage from "./assets/profile_image.svg";
import BackButton from "../../components/BackButton/BackButton";
import { Button } from "../../components/ui/button";
import { ArrowLeft } from "lucide-react";

const AllCommunitiesPage = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [windowWidth, setWindowWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1024);

  // Note: In Next.js App Router, state cannot be passed via router.push
  // This component will need to receive data differently (e.g., via context or API call)
  const [communityData, setCommunityData] = useState([]);

  const truncateText = (text, length) => {
    return text.length > length ? text.substring(0, length) + "..." : text;
  };

  const handleBackClick = () => {
    router.back();
  };

  const handleCardClick = (community) => {
    if (community.owner?.username) {
      router.push(`/community/${community.owner.username}`);
    }
  };

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className={styles.pageContainer}>
      <div className={styles.layoutContainer}>
        <div className={styles.mainContent}>
          <div className={styles.AllCommunitiesContent}>
            <div className={styles.header}>
              <div
                className="border rounded-lg hover:bg-accent text-sm w-fit"
                style={{ display: "flex", gap: "4%", padding: "3px 10px" }}
              >
                <BackButton
                  onClick={() => router.back()}
                  showText={false}
                  smallText={false}
                />
                Communities
              </div>
              <button className={styles.moreButton}>
                <BsThreeDotsVertical />
              </button>
            </div>
            <div className={styles.communityListHeader}>
              <h1>All Communities</h1>
            </div>
            <div className={styles.communityList}>
              {communityData.length > 0 ? (
                communityData.map((item, index) => {
                  const community = item.community || {};
                  return (
                    <div
                      className={styles.communityCard}
                      key={`${community._id || "fallback"}-${index}`}
                      onClick={() => handleCardClick(community)}
                      style={{ cursor: "pointer" }}
                    >
                      <div className={styles.communityImageContainer}>
                        <img
                          src={community.owner?.banner || CommunityBanner}
                          alt={`${community.owner?.name || "Community"} banner`}
                          className={styles.communityImage}
                        />
                      </div>
                      <div className={styles.communityDetails}>
                        <h2>{community.owner?.name || "Unnamed Community"}</h2>
                        <p>@{community.owner?.username || "Unknown Owner"}</p>
                        <p className={styles.description}>
                          {community.description
                            ? truncateText(community.description, 40)
                            : "No description available."}
                        </p>
                      </div>
                      <button className={styles.moreButton}>
                        <BsThreeDotsVertical />
                      </button>
                    </div>
                  );
                })
              ) : (
                <p>No communities found.</p>
              )}
            </div>
          </div>
        </div>

        {/* Community Sidebar */}
        {windowWidth > 768 && <CommunitySidebar />}

      </div>
    </div>
  );
};

export default AllCommunitiesPage;
