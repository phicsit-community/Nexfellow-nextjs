"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AssignedMembersView from "../../components/Moderators/AssignedMembersView";
import CommunityFollowersView from "../../components/Moderators/CommunityFollowersView";
import styles from "./Moderators.module.css";
import BackButton from "../../components/BackButton/BackButton";
import axios from "axios";
import { Users, UserCog, Search, ShieldCheck } from "lucide-react";

const ModeratorsControl = () => {
  const [activeTab, setActiveTab] = useState("assigned");
  const params = useParams();
  const communityId = params?.communityId;
  const router = useRouter();
  const [assignedCount, setAssignedCount] = useState(0);
  const [followerCount, setFollowerCount] = useState(0);

  const fetchCounts = async () => {
    try {
      const communityRes = await axios.get(`/community/id/${communityId}`);
      const community = communityRes.data.community;

      const modCount = (community.moderators || []).length;
      setAssignedCount(modCount + 1); // owner + mods

      const followersRes = await axios.get(`/community/followers/${communityId}`);
      setFollowerCount(followersRes.data.followers.length || 0);
    } catch (err) {
      console.error("Error fetching counts", err);
    }
  };

  useEffect(() => {
    fetchCounts();
  }, [communityId, activeTab]);

  return (
    <div className={styles.container}>
      <div className={styles.back}>
        <div
          className="border rounded-lg hover:bg-accent text-sm w-fit"
          style={{ padding: "3px 10px" }}
        >
          <BackButton
            onClick={() => router.back()}
            showText={true}
            smallText={true}
          />
        </div>      </div>

      <h2 className={styles.title}>
        Moderators Control Panel
      </h2>
      <p className={styles.subtitle}>Manage community members and assign roles</p>

      <div className={styles.searchWrapper}>
        <Search size={18} className={styles.searchIcon} />
        <input
          type="text"
          className={styles.search}
          placeholder="Search members..."
        />
      </div>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === "assigned" ? styles.active : ""}`}
          onClick={() => setActiveTab("assigned")}
        >
          <UserCog size={16} style={{ marginRight: "6px" }} />
          Assigned Members ({assignedCount})
        </button>
        <button
          className={`${styles.tab} ${activeTab === "followers" ? styles.active : ""}`}
          onClick={() => setActiveTab("followers")}
        >
          <Users size={16} style={{ marginRight: "6px" }} />
          Community Followers ({followerCount})
        </button>
      </div>

      <div>
        {activeTab === "assigned" ? (
          <AssignedMembersView communityId={communityId} />
        ) : (
          <CommunityFollowersView communityId={communityId} />
        )}
      </div>
    </div>
  );
};

export default ModeratorsControl;
