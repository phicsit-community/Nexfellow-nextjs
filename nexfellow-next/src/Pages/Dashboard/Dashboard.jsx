"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import api from "../../lib/axios";
import refreshCurrentUser from "../../utils/auth/refreshCurrentUser";
import { hasCustomAvatar, getAvatarInitial } from "../../utils/avatar";

// styles
import styles from "./Dashboard.module.css";

// assets
import CommunityBanner from "./assets/community_image.svg";
import ProfileImage from "./assets/profile_image.svg";
import communityBadge from "./assets/badge3.svg";
import verificationBadge from "./assets/badge2.svg";
import verifyOrangeBadge from "./assets/badge2-orange.svg";
import InviteIcon from "./assets/invite.svg";
import EditIcon from "./assets/edit.svg";

// icons

// components
import DashboardBody from "../../components/Dashboard/DashboardBody";
import DashboardSidebar from "../../components/Dashboard/DashboardSidebar";
import ShareModal from "../../components/ShareModal/ShareModal";
import ProfileImagePreview from "../../components/Preview/ProfileImagePreview";
import FollowListModal from "../../components/FollowList/FollowListModal";
import UserAvatar from "../../components/UserAvatar/UserAvatar";
import BackButton from "../../components/BackButton/BackButton";
import { Settings, UserCircle2 } from "lucide-react";
import DashboardSkeletonLoader from "./DashboardSkeletonLoader";

const Dashboard = () => {
  const router = useRouter();
  const params = useParams();
  const username = params?.username;
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.auth.user);
  const [isOpen, setIsOpen] = useState(false);
  // Which follow list is open: "followers", "following" or null
  const [followList, setFollowList] = useState(null);

  const [userData, setUserData] = useState(null);
  const [communityData, setCommunityData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [id, setId] = useState(null);
  const [isDescriptionTruncated, setIsDescriptionTruncated] = useState(true);

  const handleBackButtonClick = () => {
    router.back();
  };

  // The dashboard always shows the signed-in user's own profile, and the server
  // decides who that is. Re-routing to the cached username first sent a stale
  // cache (another account, an old username) to that person's public profile.
  useEffect(() => {
    if (username) {
      fetchData();
    }
  }, [username]);

  // /dashboard has no username: go to the signed-in user's own dashboard.
  useEffect(() => {
    if (!username && currentUser?.username) {
      router.replace(`/dashboard/${currentUser.username}`);
    }
  }, [username, currentUser?.username, router]);

  // Resync the cached user and move to the real username's dashboard.
  // Returns whether it navigated.
  const goToOwnDashboard = async () => {
    const fresh = await refreshCurrentUser(dispatch, currentUser);
    if (fresh?.username && fresh.username !== username) {
      router.replace(`/dashboard/${fresh.username}`);
      return true;
    }
    return false;
  };

  const fetchData = async () => {
    let redirecting = false;
    try {
      setLoading(true);
      setError(null);

      const userResponse = await api.get(
        `/user/profile/username/${username}`
      );

      if (userResponse.data.redirect) {
        // The server redirects when the URL isn't the signed-in user's username.
        // The dashboard is always your own, so go to yours, not their profile.
        if (await goToOwnDashboard()) {
          redirecting = true;
          return;
        }
        const redirect = userResponse.data.redirect;
        // Only redirect if it's a valid string path
        if (typeof redirect === "string" && redirect.startsWith("/")) {
          redirecting = true;
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
      // A 404 here usually means the cached username is stale (e.g. it was
      // changed during onboarding). Resync and move to the real username.
      if (err.response?.status === 404) {
        try {
          if (await goToOwnDashboard()) {
            redirecting = true;
            return;
          }
        } catch {
          // fall through to the error below
        }
      }
      setError(
        "Failed to load data: " +
          (err.response?.data?.message || err.response?.data?.error || err.message)
      );
    } finally {
      if (!redirecting) setLoading(false);
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
  const followingCount = userData?.following?.length || 0;
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
                    initial={hasCustomAvatar(userData?.picture) ? null : getAvatarInitial(userData)}
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
                    {userData?.planBadge === "orange" ? (
                      <img
                        src={verifyOrangeBadge?.src || verifyOrangeBadge}
                        alt="Founder Badge"
                        className={styles.badge}
                      />
                    ) : userData?.planBadge === "blue" ? (
                      <img
                        src={verificationBadge?.src || verificationBadge}
                        alt="Builder Pro Badge"
                        className={styles.badge}
                      />
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
                  {(communityData?.description || userData?.bio || "").length > 150 && (
                    <>
                      {" "}
                      <button
                        type="button"
                        className={styles.toggleDescriptionButton}
                        onClick={toggleDescription}
                      >
                        {isDescriptionTruncated ? "Show more" : "Show less"}
                      </button>
                    </>
                  )}
                </p>
                <div className={styles.communityActions}>
                  <div className={styles.members}>
                    <div
                      className={styles.memberImages}
                      onClick={() => setFollowList("followers")}
                      style={{ cursor: "pointer" }}
                    >
                      {visibleProfiles?.length > 0 &&
                        userData?.followers?.length > 0 ? (
                        visibleProfiles.map((profile, index) => (
                          <div
                            key={profile._id}
                            className={styles.memberImageWrapper}
                            style={{ zIndex: 3 - index }}
                          >
                            <UserAvatar user={profile} className={styles.memberImage} />
                          </div>
                        ))
                      ) : (
                        <UserCircle2 className="w-5 h-5 text-gray-500" />
                      )}
                    </div>
                    <span className={styles.membersCount}>
                      <button type="button" className={styles.countButton} onClick={() => setFollowList("followers")}>
                        <strong>{totalCount}</strong> {totalCount === 1 ? "Follower" : "Followers"}
                      </button>
                      <span aria-hidden="true">·</span>
                      <button type="button" className={styles.countButton} onClick={() => setFollowList("following")}>
                        <strong>{followingCount}</strong> Following
                      </button>
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
      {followList && (
        <FollowListModal
          initialTab={followList}
          onClose={() => setFollowList(null)}
          userId={userData?.id || userData?._id}
          // Your own Following count moves when you follow or unfollow from a list
          onFollowChange={(person, nowFollowing) =>
            setUserData((prev) => {
              const following = (prev.following || []).filter((id) => String(id) !== String(person._id));
              return { ...prev, following: nowFollowing ? [...following, person._id] : following };
            })
          }
        />
      )}
    </div>
  );
};

export default Dashboard;
