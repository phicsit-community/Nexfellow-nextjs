"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "../../lib/axios";
import MetaTags from "../../components/MetaTags/MetaTags";

// styles
import styles from "./ModeratorsView.module.css";

// assets
import CommunityBanner from "./assets/community_image.svg";
import ProfileImage from "./assets/profile_image.svg";
import communityBadge from "./assets/badge3.svg";
import verificationBadge from "./assets/badge2.svg";
import Webicon from "./assets/web.svg";
import Shareicon from "./assets/share.svg";

// icons
import {
  BsCopy,
  BsThreeDotsVertical,
  BsTwitterX,
  BsWhatsapp,
  BsPersonPlus,
  BsPersonCheck,
} from "react-icons/bs";
import { ImSpinner2 } from "react-icons/im";
import { IoBanOutline, IoLockOpenOutline } from "react-icons/io5";

// components
import ModeratorsViewBody from "../../components/Moderators/ModeratorsViewBody";
import ModeratorsViewSidebar from "../../components/Moderators/ModeratorsViewSidebar";
import ModeratorsSidebar from "../../components/Moderators/ModeratorsSidebar";
import ProfileImagePreview from "../../components/Preview/ProfileImagePreview";
import BackButton from "../../components/BackButton/BackButton";
import ModeratorsViewSkeleton from "./ModeratorsViewSkeleton";
import ReportUserModal from "../../components/ReportUserModal/ReportUserModal";
import MuteUserModal from "../../components/MuteUserModal/MuteUserModal";
import UnmuteUserModal from "../../components/UnmuteUserModal/UnmuteUserModal";
import BlockUserModal from "../../components/BlockUserModal/BlockUserModal";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { Share2 } from "lucide-react";
import { UserCircle2 } from "lucide-react";

const ModeratorsView = () => {
  const params = useParams();
  const username = params?.username;
  const router = useRouter();
  const [community, setCommunity] = useState(null);
  const [communityOwnerId, setCommunityOwnerId] = useState(null);
  const [communityId, setCommunityId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [followStatus, setFollowStatus] = useState(false);
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [isUnblocking, setIsUnblocking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1024);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);

  // Modal states
  const [showReportModal, setShowReportModal] = useState(false);
  const [showMuteModal, setShowMuteModal] = useState(false);
  const [showUnmuteModal, setShowUnmuteModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);

  const dropdownRef = useRef(null);
  const [showSidebarMobile, setShowSidebarMobile] = useState(false);

  const toggleSidebarMobile = () => {
    setShowSidebarMobile((prev) => !prev);
  };

  const currentUserId = useMemo(() => {
    if (typeof window === "undefined") return null;
    const user = JSON.parse(localStorage.getItem("user"));
    return user?.id || null;
  }, []);

  const userRole = useMemo(() => {
    if (!community || !community.moderators || !currentUserId) return null;
    const entry = community.moderators.find(mod => {
      const modUserId = mod.user?._id ? String(mod.user._id) : String(mod.user);
      return modUserId === currentUserId;
    });
    return entry?.role || null;
  }, [community, currentUserId]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchCommunity = async () => {
    setLoading(true);
    setError(null);
    try {
      const userData = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user")) : null;
      const currentUserId = userData?.id;

      if (!currentUserId) {
        throw new Error("User ID is missing");
      }

      const response = await api.get(`/community/username/${username}`);
      const fetchedCommunity = response.data;
      setCommunity(fetchedCommunity);
      setCommunityOwnerId(fetchedCommunity.owner?._id);
      setCommunityId(fetchedCommunity._id);

      // Check if this community is blocked
      const blockedResponse = await api.get("/user/blocked-users");
      const blockedUsers = blockedResponse.data.blockedUsers || [];
      const isOwnerBlocked = blockedUsers.some(
        (user) => user._id === fetchedCommunity.owner?._id
      );
      setIsBlocked(isOwnerBlocked);

      // Check if this community is muted
      const mutedResponse = await api.get("/user/muted-users");
      const mutedUsers = mutedResponse.data.mutedUsers || [];
      const isOwnerMuted = mutedUsers.some(
        (user) => user._id === fetchedCommunity.owner?._id
      );
      setIsMuted(isOwnerMuted);

      // Check follow status
      if (fetchedCommunity.owner?._id && currentUserId) {
        const followResponse = await api.get(
          `/user/followStatus/${fetchedCommunity.owner._id}`
        );
        setFollowStatus(followResponse.data.isFollowing);
      }
    } catch (err) {
      setError("Failed to load community data: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Run fetchCommunity when component mounts
  useEffect(() => {
    fetchCommunity();
  }, [username]);

  // Toggle dropdown menu
  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  // Handle modal closures with refresh when needed
  const handleReportModalClose = (success) => {
    setShowReportModal(false);
    if (success) {
      // No need to refresh anything
    }
  };

  const handleMuteModalClose = (success) => {
    setShowMuteModal(false);
    if (success) {
      setIsMuted(true);
      fetchCommunity(); // Refresh data
    }
  };

  const handleUnmuteModalClose = (success) => {
    setShowUnmuteModal(false);
    if (success) {
      setIsMuted(false);
      fetchCommunity(); // Refresh data
    }
  };

  const handleBlockModalClose = (success) => {
    setShowBlockModal(false);
    if (success) {
      setIsBlocked(true);
      fetchCommunity(); // Refresh data
    }
  };

  const toggleFollow = async () => {
    if (!communityOwnerId) {
      setError("Community Owner ID is missing.");
      return;
    }

    if (isButtonLoading) return; // Prevents duplicate requests

    setIsButtonLoading(true);
    setError(null);

    try {
      const action = followStatus ? "unfollow" : "follow";
      const response = await api.post(
        `/user/toggleFollow/${communityOwnerId}`,
        { action }
      );

      if (response.status === 200) {
        setFollowStatus(!followStatus);

        fetchCommunity();
      }
    } catch (err) {
      console.error("Follow/Unfollow Error:", err);
      setError(err.response?.data?.message || "Error toggling follow status.");
      setShowModal(true);
    } finally {
      setIsButtonLoading(false);
    }
  };

  const handleUnblock = async () => {
    if (!communityOwnerId) return;

    setIsUnblocking(true);
    try {
      await api.post(`/user/unblock/${communityOwnerId}`);
      setIsBlocked(false);
      toast.success(`${community.owner?.name} has been unblocked`);
    } catch (error) {
      console.error("Failed to unblock community:", error);
      toast.error("Failed to unblock community");
    } finally {
      setIsUnblocking(false);
    }
  };

  // Fetch bookmark status when communityId changes
  useEffect(() => {
    if (!communityId) return;
    const fetchBookmark = async () => {
      try {
        const res = await api.get(`/bookmarks/check/Community/${communityId}`);
        setIsBookmarked(res.data.isBookmarked || false);
      } catch (err) {
        setIsBookmarked(false);
      }
    };
    fetchBookmark();
  }, [communityId]);

  const handleBookmarkToggle = async () => {
    if (!communityId || bookmarkLoading) return;
    setBookmarkLoading(true);
    try {
      if (!isBookmarked) {
        await api.post(`/bookmarks/Community/${communityId}`);
        setIsBookmarked(true);
        toast.success("Community bookmarked!");
      } else {
        await api.delete(`/bookmarks/Community/${communityId}`);
        setIsBookmarked(false);
        toast.info("Bookmark removed!");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Something went wrong. Please try again."
      );
    } finally {
      setBookmarkLoading(false);
    }
  };

  const truncateText = (text, length) => {
    return text.length > length ? text.substring(0, length) + "..." : text;
  };

  const handleBackButtonClick = () => {
    router.back();
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const totalCount = community?.owner?.followers.length || 0;
  const visibleProfiles = community?.owner?.followers.slice(0, 3) || [];

  const shareViaNavigator = () => {
    if (navigator.share) {
      navigator.share({
        title: "Check out this community",
        text: "Join this amazing community!",
        url: window.location.href,
      });
    } else {
      toast.error("Sharing is not supported in this browser.");
    }
  };

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (loading) {
    return <ModeratorsViewSkeleton />;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }
  console.log({ community });
  return (
    <div className={styles.pageContainer}>
      {community && (
        <MetaTags
          title={`${community.owner?.name || "Community"} | NexFellow`}
          description={
            community.description ||
            `Join ${community.owner?.name} on NexFellow`
          }
          contentId={communityId}
          contentType="community"
          type="profile"
        />
      )}

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
              <div className={styles.moreButtonContainer} ref={dropdownRef}>
                <button className={styles.moreButton} onClick={toggleDropdown}>
                  <BsThreeDotsVertical />
                </button>

                {showDropdown && (
                  <div className={styles.dropdownMenu}>
                    <button
                      className={styles.dropdownItem}
                      onClick={handleBookmarkToggle}
                      disabled={bookmarkLoading}
                    >
                      {isBookmarked ? (
                        <>
                          Remove Bookmark
                        </>
                      ) : (
                        <>
                          Bookmark
                        </>
                      )}
                    </button>
                    <button
                      className={styles.dropdownItem}
                      onClick={() => {
                        setShowDropdown(false);
                        setShowReportModal(true);
                      }}
                    >
                      Report
                    </button>
                    <button
                      className={styles.dropdownItem}
                      onClick={() => {
                        setShowDropdown(false);
                        if (isMuted) {
                          setShowUnmuteModal(true);
                        } else {
                          setShowMuteModal(true);
                        }
                      }}
                    >
                      {isMuted ? "Unmute" : "Mute"}
                    </button>
                    <button
                      className={styles.dropdownItem}
                      onClick={() => {
                        setShowDropdown(false);
                        setShowBlockModal(true);
                      }}
                      disabled={isBlocked}
                    >
                      Block
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className={styles.bannerSection}>
              <div className={styles.bannerImgContainer}>
                <img
                  src={community.owner?.banner || CommunityBanner}
                  alt="Community Banner"
                  className={styles.bannerImage}
                />
              </div>
              <div className={styles.communityDetails}>
                <div className={styles.profileImageContainer}>
                  <ProfileImagePreview
                    src={community.owner?.picture || ProfileImage}
                    alt="Profile"
                    className={styles.profileImage}
                  />
                </div>
                <div className={styles.communityHeader}>
                  <div className={styles.communityNameContainer}>
                    <h2
                      className={styles.communityName}
                      title={community.owner?.name}
                    >
                      {community.owner?.name.length > 20
                        ? community.owner?.name.slice(0, 20) + "…"
                        : community.owner?.name}
                    </h2>
                    {community.owner?.isCommunityAccount &&
                      community.owner?.createdCommunity ? (
                      community.owner?.communityBadge ? (
                        <img
                          src={communityBadge?.src || communityBadge}
                          alt="Community Badge"
                          className={styles.badge}
                        />
                      ) : community.owner?.verificationBadge ? (
                        <img
                          src={verificationBadge?.src || verificationBadge}
                          alt="Verification Badge"
                          className={styles.badge}
                        />
                      ) : null
                    ) : community.owner?.verificationBadge ? (
                      <img
                        src={verificationBadge?.src || verificationBadge}
                        alt="Verification Badge"
                        className={styles.badge}
                      />
                    ) : null}
                  </div>
                </div>
                <p className={styles.username}>
                  @{community.owner?.username || "unknown"}
                </p>
                <p className={styles.description}>
                  {community.description
                    ? truncateText(community.description, 150)
                    : "No description available."}
                </p>
                <div className={styles.communityActions}>
                  <div className={styles.members}>
                    <div className={styles.memberImages}>
                      {visibleProfiles?.length > 0 ? (
                        visibleProfiles.map((profile, index) => (
                          <div
                            key={profile._id}
                            className={styles.memberImageWrapper}
                            style={{ zIndex: 3 - index }}
                          >
                            <img
                              src={profile?.picture || ProfileImage}
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
                      {totalCount > 0
                        ? ` +${totalCount} Members`
                        : "No members yet"}
                    </span>
                  </div>
                  <div className={styles.actionButtons}>
                    <button
                      className={styles.iconButton}
                      onClick={() => {
                        if (community?.link) {
                          const formattedLink = community.link.startsWith(
                            "http"
                          )
                            ? community.link
                            : `https://${community.link}`;

                          window.open(formattedLink, "_blank");
                        } else {
                          toast.error("Owner has not added website yet.");
                        }
                      }}
                    >
                      <img
                        src={Webicon?.src || Webicon}
                        alt="Website"
                        className={styles.svgIcon}
                      />
                    </button>
                    <Dialog
                      open={showShareModal}
                      onOpenChange={setShowShareModal}
                    >
                      <DialogTrigger className={styles.iconButton}>
                        <img
                          src={Shareicon?.src || Shareicon}
                          alt="invite"
                          className={styles.svgIcon}
                        />
                      </DialogTrigger>
                      <DialogContent
                        style={{
                          padding: "1rem",
                        }}
                      >
                        <DialogTitle>Share this Community</DialogTitle>
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(4, 1fr)",
                            gap: "15px",
                            margin: "20px 0",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              cursor: "pointer",
                            }}
                            onClick={() => {
                              const url = `https://wa.me/?text=Check out this community: ${window.location.href}`;
                              window.open(url, "_blank");
                            }}
                          >
                            <div
                              style={{
                                width: "40px",
                                height: "40px",
                                borderRadius: "50%",
                                background: "#25D366",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "white",
                                fontSize: "20px",
                              }}
                            >
                              <BsWhatsapp />
                            </div>
                            <span style={{ marginTop: "5px" }}>WhatsApp</span>
                          </div>

                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              cursor: "pointer",
                            }}
                            onClick={() => {
                              const url = `https://twitter.com/intent/tweet?text=Check out this community&url=${window.location.href}`;
                              window.open(url, "_blank");
                            }}
                          >
                            <div
                              style={{
                                width: "40px",
                                height: "40px",
                                borderRadius: "50%",
                                background: "#000",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "white",
                                fontSize: "20px",
                              }}
                            >
                              <BsTwitterX />
                            </div>
                            <span style={{ marginTop: "5px" }}>Twitter</span>
                          </div>

                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              cursor: "pointer",
                            }}
                            onClick={() => {
                              navigator.clipboard.writeText(
                                window.location.href
                              );
                              toast.success("Link copied to clipboard!");
                            }}
                          >
                            <div
                              style={{
                                width: "40px",
                                height: "40px",
                                borderRadius: "50%",
                                background: "#6c757d",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "white",
                                fontSize: "20px",
                              }}
                            >
                              <BsCopy />
                            </div>
                            <span style={{ marginTop: "5px" }}>Copy Link</span>
                          </div>

                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              cursor: "pointer",
                            }}
                            onClick={shareViaNavigator}
                          >
                            <div
                              style={{
                                width: "40px",
                                height: "40px",
                                borderRadius: "50%",
                                background: "#6c757d",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "white",
                                fontSize: "20px",
                              }}
                            >
                              <Share2 />
                            </div>
                            <span style={{ marginTop: "5px" }}>Other</span>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
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
                      ) : community.isPrivate ? (
                        "Request to Join"
                      ) : (
                        "Follow"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <ModeratorsViewBody
            communityId={communityId}
            posts={community.posts}
            members={community.members}
          />
        </div>
        {windowWidth > 768 ? (
          userRole === "event-admin" ? (
            <ModeratorsSidebar communityId={communityId} />
          ) : (
            <ModeratorsViewSidebar communityId={communityId} />
          )
        ) : (
          <>
            {!showSidebarMobile && (
              <div className={styles.sidePanelTrigger} onClick={toggleSidebarMobile}>
                <div className={styles.burgerIcon}>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            <div className={`${styles.sidebarMobileOverlay} ${showSidebarMobile ? styles.show : ""}`}>
              {userRole === "event-admin" ? (
                <ModeratorsSidebar communityId={communityId} />
              ) : (
                <ModeratorsViewSidebar communityId={communityId} />
              )}
            </div>
            {showSidebarMobile && (
              <div className={styles.overlayBackdrop} onClick={() => setShowSidebarMobile(false)} />
            )}
          </>
        )}
      </div>

      {/* Custom modals */}
      <ReportUserModal
        isOpen={showReportModal}
        onClose={handleReportModalClose}
        user={community?.owner}
      />

      <MuteUserModal
        isOpen={showMuteModal}
        onClose={handleMuteModalClose}
        user={community?.owner}
      />

      <UnmuteUserModal
        isOpen={showUnmuteModal}
        onClose={handleUnmuteModalClose}
        user={community?.owner}
      />

      <BlockUserModal
        isOpen={showBlockModal}
        onClose={handleBlockModalClose}
        user={community?.owner}
      />

      {isBlocked && (
        <div className={styles.blockedCommunityOverlay}>
          <div className={styles.blockedContent}>
            <IoBanOutline size={42} />
            <h2>You&apos;ve blocked this community</h2>
            <p>
              You won&apos;t see posts from this community in your feed until
              you unblock it.
            </p>
            <button
              className={styles.unblockButton}
              onClick={handleUnblock}
              disabled={isUnblocking}
            >
              <IoLockOpenOutline size={18} />
              {isUnblocking ? "Unblocking..." : "Unblock this community"}
            </button>
          </div>
        </div>
      )}

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

export default ModeratorsView;
