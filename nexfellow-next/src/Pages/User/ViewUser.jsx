"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";

// styles
import styles from "./ViewUser.module.css";

// assets
import ProfileImage from "./assets/profile_image.svg";
import BannerImage from "./assets/community_image.svg";

import communityBadge from "./assets/badge3.svg";
import verificationBadge from "./assets/badge2.svg";
import Webicon from "./assets/web.svg";
import Shareicon from "./assets/share.svg";
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

  const fetchUserDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`/user/publicprofile/username/${username}`);
      setUserDetails(response.data);
      console.log("User Details:", response);

      if (response.data.userId) {
        const followResponse = await axios.get(
          `/user/followStatus/${response.data.userId}`
        );
        setFollowStatus(followResponse.data.isFollowing);
      }
    } catch (err) {
      setError("Failed to load user data: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const userData = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user")) : null;
    setCurrentUserId(userData?.id || null);

    fetchUserDetails();
  }, [username]);

  const toggleFollow = async () => {
    if (!userDetails?._id) {
      setError("User ID is missing.");
      return;
    }

    if (isButtonLoading) return; // Prevent duplicate requests

    setIsButtonLoading(true);
    setError(null);

    try {
      const action = followStatus ? "unfollow" : "follow";
      const response = await axios.post(
        `/user/toggleFollow/${userDetails.userId}`,
        { action }
      );

      if (response.status === 200) {
        setFollowStatus(!followStatus);
        fetchUserDetails();
      }
    } catch (err) {
      console.error("Follow/Unfollow Error:", err);
      setError(err.response?.data?.message || "Error toggling follow status.");
      setShowModal(true);
    } finally {
      setIsButtonLoading(false);
    }
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
                  src={userDetails?.banner || BannerImage}
                  alt="User Banner"
                  className={styles.bannerImage}
                />
              </div>
              <div className={styles.communityDetails}>
                <div className={styles.profileImageContainer}>
                  <ProfileImagePreview
                    src={userDetails?.picture || ProfileImage}
                    alt="Profile"
                    className={styles.profileImage}
                  />
                </div>
                <div className={styles.communityHeader}>
                  <div className={styles.communityNameContainer}>
                    <h2 className={styles.communityName}>
                      {userDetails?.name}
                    </h2>
                    {userDetails?.isCommunityAccount &&
                      userDetails?.createdCommunity ? (
                      userDetails?.accountType === "Organization" ? (
                        <img
                          src={communityBadge}
                          alt="Community Badge"
                          className={styles.badge}
                        />
                      ) : (
                        <img
                          src={verificationBadge}
                          alt="Verification Badge"
                          className={styles.badge}
                        />
                      )
                    ) : (
                      userDetails?.verificationBadge && (
                        <img
                          src={verificationBadge}
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
                              src={profile?.picture || ProfileImage}
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
                        src={Webicon}
                        alt="Website"
                        className={styles.svgIcon}
                      />
                    </button>
                    <button className={styles.iconButton}>
                      <img
                        src={Shareicon}
                        alt="Share"
                        className={styles.svgIcon}
                      />
                    </button>
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
