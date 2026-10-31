"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "../../lib/axios";
import { hasCustomAvatar, getAvatarInitial } from "../../utils/avatar";

// styles
import styles from "./ViewUser.module.css";

// assets
import ProfileImage from "./assets/profile_image.svg";
import BannerImage from "./assets/community_image.svg";

import communityBadge from "./assets/badge3.svg";
import verificationBadge from "./assets/badge2.svg";
import verifyOrangeBadge from "./assets/badge2-orange.svg";
import Webicon from "./assets/web.svg";
import Shareicon from "./assets/share.svg";
import Msgicon from "./assets/message.svg";
import { UserCircle2 } from "lucide-react";
import { ImSpinner2 } from "react-icons/im";

// icons
import {
  BsThreeDotsVertical,
  BsPersonPlus,
  BsPersonCheck,
} from "react-icons/bs";

// components
import UserBody from "../../components/Users/UserBody";
import UserSidebar from "../../components/Users/UserSidebar";
import ProfileImagePreview from "../../components/Preview/ProfileImagePreview";
import BackButton from "../../components/BackButton/BackButton";
import { toast } from "sonner";
import UserSkeleton from "./ViewUserSkeleton";
import { isSelf } from "../../utils/currentUser";

const User = () => {
  const params = useParams();
  const username = params?.username;
  const router = useRouter();
  const [userDetails, setUserDetails] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [followStatus, setFollowStatus] = useState(false);
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1024);

  // silent: refresh data in place without swapping the page for the loader
  const fetchUserDetails = async ({ silent = false } = {}) => {
    if (!silent) {
      setLoading(true);
      setError(null);
    }
    try {
      const response = await api.get(`/user/publicprofile/username/${username}`);
      setUserDetails(response.data);
      console.log("User Details:", response);

      if (response.data.userId) {
        const followResponse = await api.get(
          `/user/followStatus/${response.data.userId}`
        );
        setFollowStatus(followResponse.data.isFollowing);
      }
    } catch (err) {
      if (silent) {
        console.error("Silent profile refresh failed:", err);
        return;
      }
      setError("Failed to load user data: " + err.message);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    const userData = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "null") : null;
    setCurrentUserId(userData?.id || userData?._id || null);

    fetchUserDetails();
  }, [username]);

  const toggleFollow = async () => {
    if (!userDetails?._id) {
      setError("Unable to follow user.");
      return;
    }

    if (isButtonLoading) return; // Prevent duplicate requests

    setIsButtonLoading(true);
    setError(null);

    try {
      const action = followStatus ? "unfollow" : "follow";
      const response = await api.post(
        `/user/toggleFollow/${userDetails.userId}`,
        { action }
      );

      if (response.status === 200) {
        setFollowStatus(!followStatus);
        fetchUserDetails({ silent: true });
      }
    } catch (err) {
      console.error("Follow/Unfollow Error:", err);
      toast.error(err.response?.data?.message || "Error toggling follow status.");
    } finally {
      setIsButtonLoading(false);
    }
  };

  const handleMessage = () => {
    if (!userDetails?.userId) return;
    // Same check the backend applies on send; the setting lives on the User doc
    if (userDetails.privacySettings?.allowDirectMessages === false) {
      toast.info("This user is not accepting direct messages.");
      return;
    }
    // Next's router has no history state; Inbox reads the target from query params
    const params = new URLSearchParams({
      userId: userDetails.userId,
      name: userDetails.name || "",
      username: userDetails.username || "",
      picture: userDetails.picture || "",
    });
    router.push(`/inbox?${params.toString()}`);
  };

  const handleBackButtonClick = () => {
    router.back();
  };

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const closeModal = () => {
    setShowModal(false);
  };

  if (loading) {
    return <UserSkeleton />;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  const totalCount = userDetails?.followers?.length || 0;
  const visibleProfiles = userDetails?.followers?.slice(0, 3) || [];
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
                <BsThreeDotsVertical />
              </button>
            </div>
            <div className={styles.bannerSection}>
              <div className={styles.bannerImgContainer}>
                <img
                  src={userDetails?.banner || (BannerImage?.src || BannerImage)}
                  alt="User Banner"
                  className={styles.bannerImage}
                />
              </div>
              <div className={styles.communityDetails}>
                <div className={styles.profileImageContainer}>
                  <ProfileImagePreview
                    src={userDetails?.picture || (ProfileImage?.src || ProfileImage)}
                    initial={hasCustomAvatar(userDetails?.picture) ? null : getAvatarInitial(userDetails)}
                    alt="Profile"
                    className={styles.profileImage}
                  />
                </div>
                <div className={styles.communityHeader}>
                  <div className={styles.communityNameContainer}>
                    <h2 className={styles.communityName}>
                      {userDetails?.name}
                    </h2>
                    {userDetails?.planBadge === "orange" ? (
                      <img
                        src={verifyOrangeBadge?.src || verifyOrangeBadge}
                        alt="Founder Badge"
                        className={styles.badge}
                      />
                    ) : userDetails?.planBadge === "blue" ? (
                      <img
                        src={verificationBadge?.src || verificationBadge}
                        alt="Builder Pro Badge"
                        className={styles.badge}
                      />
                    ) : (
                      userDetails?.verificationBadge && (
                        <img
                          src={verificationBadge?.src || verificationBadge}
                          alt="Verification Badge"
                          className={styles.badge}
                        />
                      )
                    )}
                    {/* {userDetails?.premiumBadge && (
                                            <img
                                                src={premiumBadge}
                                                alt="Badge"
                                                className={styles.badge}
                                            />
                                        )} */}
                  </div>
                </div>
                <p className={styles.username}>
                  @{userDetails?.username || "unknown"}
                </p>
                <p className={styles.description}>
                  {userDetails?.bio || "No bio available."}
                </p>
                <div className={styles.communityActions}>
                  <div className={styles.members}>
                    <div className={styles.memberImages}>
                      {visibleProfiles.length > 0 ? (
                        visibleProfiles.map((profile, index) => (
                          <div
                            key={profile._id}
                            className={styles.memberImageWrapper}
                            style={{ zIndex: 3 - index }}
                          >
                            <img
                              src={profile?.picture || (ProfileImage?.src || ProfileImage)}
                              alt={profile?.name || "Follower"}
                              className={styles.memberImage}
                            />
                          </div>
                        ))
                      ) : (
                        <UserCircle2 className="w-5 h-5 text-gray-500" />
                      )}
                    </div>
                    <span className={styles.membersCount}>
                      {totalCount > 0
                        ? ` +${totalCount} Members`
                        : "No members yet"}
                    </span>
                  </div>
                  <div className={styles.actionButtons}>
                    {!isSelf(userDetails.userId) && (
                    <button
                      className={styles.iconButton}
                      onClick={handleMessage}
                      aria-label="Message"
                      title="Message"
                    >
                      <img
                        src={Msgicon?.src || Msgicon}
                        alt="Message"
                        className={styles.svgIcon}
                      />
                    </button>
                    )}
                    <button
                      className={styles.iconButton}
                      onClick={() => {
                        if (userDetails?.website) {
                          const formattedLink = userDetails.website.startsWith(
                            "http"
                          )
                            ? userDetails.website
                            : `https://${userDetails.website}`;

                          window.open(formattedLink, "_blank");
                        } else {
                          toast.info("This user has not added a website link yet.");
                        }
                      }}
                    >
                      <img
                        src={Webicon?.src || Webicon}
                        alt="Website"
                        className={styles.svgIcon}
                      />
                    </button>
                    <button
                      className={styles.iconButton}
                      onClick={() => {
                        const profileUrl = `${window.location.origin}/user/${username}`;
                        navigator.clipboard.writeText(profileUrl);
                        toast.success("Profile link copied to clipboard!");
                      }}
                    >
                      <img
                        src={Shareicon?.src || Shareicon}
                        alt="Share"
                        className={styles.svgIcon}
                      />
                    </button>
                    {!isSelf(userDetails.userId) && (
                    <button
                      className={styles.followButton}
                      onClick={toggleFollow}
                      disabled={isButtonLoading}
                    >
                      {isButtonLoading ? (
                        windowWidth < 480 ? (
                          <ImSpinner2 className={styles.spinner} />
                        ) : (
                          "Loading..."
                        )
                      ) : windowWidth < 480 ? (
                        followStatus ? <BsPersonCheck /> : <BsPersonPlus />
                      ) : followStatus ? (
                        "Unfollow"
                      ) : (
                        "Follow"
                      )}
                    </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <UserBody
            userId={userDetails.userId}
            otherUserId={currentUserId}
            posts={userDetails.posts}
            members={userDetails.followers}
          />
        </div>
        <UserSidebar userId={userDetails.userId} />
      </div>

      {showModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <p>{error}</p>
            <button onClick={closeModal} className={styles.closeModal}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default User;
