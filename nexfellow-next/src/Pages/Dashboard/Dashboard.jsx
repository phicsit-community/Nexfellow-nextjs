"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "../../lib/axios";

// styles
import styles from "./Dashboard.module.css";

// assets
import CommunityBanner from "./assets/community_image.svg";
import ProfileImage from "./assets/profile_image.svg";
import communityBadge from "./assets/badge3.svg";
import verificationBadge from "./assets/badge2.svg";
import InviteIcon from "./assets/invite.svg";
import EditIcon from "./assets/edit.svg";

// icons

// components
import DashboardBody from "../../components/Dashboard/DashboardBody";
import DashboardSidebar from "../../components/Dashboard/DashboardSidebar";
import ShareModal from "../../components/ShareModal/ShareModal";
import ProfileImagePreview from "../../components/Preview/ProfileImagePreview";
import FollowersModal from "../../components/Dashboard/FollowersModal";
import BackButton from "../../components/BackButton/BackButton";
import { Settings, UserCircle2 } from "lucide-react";
import DashboardSkeletonLoader from "./DashboardSkeletonLoader";

const Dashboard = () => {
  const router = useRouter();
  const params = useParams();
  const username = params?.username;
  const [isOpen, setIsOpen] = useState(false);
  const [isFollowersModalOpen, setIsFollowersModalOpen] = useState(false);

  const [userData, setUserData] = useState(null);
  const [communityData, setCommunityData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [id, setId] = useState(null);
  const [isDescriptionTruncated, setIsDescriptionTruncated] = useState(true);

  const handleBackButtonClick = () => {
    router.back();
  };

  useEffect(() => {
    const storedUser = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user")) || {} : {};

    if (storedUser.username && storedUser.username !== username) {
      router.replace(`/dashboard/${storedUser.username}`);
      return;
    }

    if (username) {
      fetchData();
    }
  }, [username, router]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const userResponse = await api.get(
        `/user/profile/username/${username}`
      );

      if (userResponse.data.redirect) {
        const redirect = userResponse.data.redirect;
        // Only redirect if it's a valid string path
        if (typeof redirect === "string" && redirect.startsWith("/")) {
          router.replace(redirect);
          return;
        }
      }

      const user = userResponse.data;
      setUserData(user);
      setId(user.id);

      if (user.isCommunityAccount && user.createdCommunity) {
        const communityResponse = await api.get(
          `/community/id/${user.createdCommunity._id}`
        );
        setCommunityData(communityResponse.data.community);
      }
    } catch (err) {
      setError(
        "Failed to load data: " + (err.response?.data?.message || err.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const truncateText = (text, length) => {
    return text.length > length ? text.substring(0, length) + "..." : text;
  };

  const toggleDescription = () => {
    setIsDescriptionTruncated(!isDescriptionTruncated);
  };


  if (loading) return <DashboardSkeletonLoader />;
  if (error) return <p>{error}</p>;

  const isCommunityAccount = userData?.isCommunityAccount;
  const totalCount = userData?.followers?.length || 0;
  const visibleProfiles = userData?.followers?.slice(0, 3) || [];
  const othersCount = totalCount > 3 ? totalCount - 3 : totalCount - 1;

  return (
    <div className={styles.pageContainer}>
      <div className={styles.layoutContainer}>
        <div className={styles.mainContentContainer}>
          <div className={styles.mainContent}>
            <div className={styles.backButtonContainer}>
              <div
                className="border rounded-lg hover:bg-accent text-sm w-fit"
                style={{ padding: "3px 10px" }}
              >
                <BackButton
                  onClick={() => router.back()}
                  showText={true}
                  smallText={true}
                />
              </div>
              <button className={styles.moreButton}>
                <Settings
                  className="text-zinc-500"
                  onClick={() => router.push("/settings")}
                />
              </button>
            </div>
            <div className={styles.bannerSection}>
              <div className={styles.bannerImgContainer}>
                <img
                  src={userData.banner || (CommunityBanner?.src || CommunityBanner)}
                  alt="Community Banner"
                  className={styles.bannerImage}
                />
              </div>
              <div className={styles.communityDetails}>
                <div className={styles.profileImageContainer}>
                  <ProfileImagePreview
                    src={userData?.picture || (ProfileImage?.src || ProfileImage)}
                    alt="Profile"
                    className={styles.profileImage}
                  />
                </div>
                <div className={styles.communityHeader}>
                  <div className={styles.communityNameContainer}>
                    <h2
                      className={styles.communityName}
                      title={
                        communityData?.name ||
                        userData?.name ||
                        "Community Name"
                      }
                    >
                      {(communityData?.name || userData?.name || "Community Name").length > 20
                        ? (communityData?.name || userData?.name || "Community Name").slice(0, 20) + "…"
                        : (communityData?.name || userData?.name || "Community Name")}
                    </h2>
                    {userData?.isCommunityAccount &&
                      userData?.createdCommunity ? (
                      userData?.communityBadge ? (
                        <img
                          src={communityBadge?.src || communityBadge}
                          alt="Community Badge"
                          className={styles.badge}
                        />
                      ) : userData?.verificationBadge ? (
                        <img
                          src={verificationBadge?.src || verificationBadge}
                          alt="Verification Badge"
                          className={styles.badge}
                        />
                      ) : null
                    ) : userData?.verificationBadge ? (
                      <img
                        src={verificationBadge?.src || verificationBadge}
                        alt="Verification Badge"
                        className={styles.badge}
                      />
                    ) : null}
                  </div>
                </div>
                <p className={styles.username}>
                  @{userData?.username || "username"}
                </p>
                <p className={styles.description}>
                  {isDescriptionTruncated
                    ? truncateText(
                      communityData?.description ||
                      userData?.bio ||
                      "No description is available at the moment. Please check back later or update your profile/community information to provide more details.",
                      150
                    )
                    : communityData?.description ||
                    userData?.bio ||
                    "No description is available at the moment. Please check back later or update your profile/community information to provide more details."}
                </p>
                <div className={styles.communityActions}>
                  <div
                    className={styles.members}
                    onClick={() => setIsFollowersModalOpen(true)}
                  >
                    <div className={styles.memberImages}>
                      {visibleProfiles?.length > 0 &&
                        userData?.followers?.length > 0 ? (
                        visibleProfiles.map((profile, index) => (
                          <div
                            key={profile._id}
                            className={styles.memberImageWrapper}
                            style={{ zIndex: 3 - index }}
                          >
                            <img
                              src={profile?.picture || (ProfileImage?.src || ProfileImage)}
                              alt={profile?.name || "Member"}
                              className={styles.memberImage}
                            />
                          </div>
                        ))
                      ) : (
                        <UserCircle2 className="w-5 h-5 text-gray-500" />
                      )}
                    </div>
                    <span className={styles.membersCount}>
                      {userData?.followers?.length > 0
                        ? `+${userData.followers.length} Followers`
                        : "No Followers"}
                    </span>
                  </div>
                  <div className={styles.actionButtons}>
                    {/* <WebsiteButton
                      communityData={communityData}
                      isCommunityAccount={userData?.isCommunityAccount}
                      communityId={communityData?._id}
                      userId={userData?.id}
                      fetchCommunityData={fetchData}
                    /> */}
                    <button
                      className={styles.inviteButton}
                      disabled={!isCommunityAccount}
                      onClick={() => setIsOpen(true)}
                    >
                      <img
                        src={InviteIcon?.src || InviteIcon}
                        alt="invite"
                        className={styles.svgIcon}
                      />
                    </button>
                    <ShareModal
                      isOpen={isOpen}
                      onClose={() => setIsOpen(false)}
                      communityUsername={userData?.username}
                    />
                    <button
                      className={styles.editButton}
                      disabled={loading}
                      onClick={() => router.push(`/edit-profile/${username}`)}
                    >
                      <img
                        src={EditIcon?.src || EditIcon}
                        alt="edit"
                        className={styles.svgIcon}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <DashboardBody
            isCommunityAccount={userData?.isCommunityAccount}
            verificationBadge={userData?.verificationBadge}
            premiumBadge={userData?.premiumBadge}
            communityId={communityData?._id}
            userId={userData?.id || userData?._id}
            username={username}
          />
        </div>
        <DashboardSidebar
          isCommunityAccount={userData?.isCommunityAccount}
          verificationBadge={userData?.verificationBadge}
          premiumBadge={userData?.premiumBadge}
          communityBadge={userData?.communityBadge}
          communityId={communityData?._id}
          community={communityData}
        />
      </div>
      <FollowersModal
        isOpen={isFollowersModalOpen}
        onClose={() => setIsFollowersModalOpen(false)}
        communityId={communityData?._id}
        userId={userData?.id || userData?._id}
      />
    </div>
  );
};

export default Dashboard;
