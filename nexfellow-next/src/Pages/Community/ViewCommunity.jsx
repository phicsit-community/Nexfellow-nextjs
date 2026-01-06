"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import api from "../../lib/axios";
import MetaTags from "../../components/MetaTags/MetaTags";

// styles
import styles from "./ViewCommunity.module.css";

// assets
import CommunityBanner from "./assets/community_image.svg";
import ProfileImage from "./assets/profile_image.svg";
import communityBadge from "./assets/badge3.svg";
import verificationBadge from "./assets/badge2.svg";
import Webicon from "./assets/web.svg";
import Msgicon from "./assets/message.svg";

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
import CommunityBody from "../../components/Community/CommunityBody";
import CommunitySidebar from "../../components/Community/CommunitySidebar";
import ProfileImagePreview from "../../components/Preview/ProfileImagePreview";
import BackButton from "../../components/BackButton/BackButton";
import ViewCommunitySkeleton from "./ViewCommunitySkeleton";
import ReportUserModal from "../../components/ReportUserModal/ReportUserModal";
import MuteUserModal from "../../components/MuteUserModal/MuteUserModal";
import UnmuteUserModal from "../../components/UnmuteUserModal/UnmuteUserModal";
import BlockUserModal from "../../components/BlockUserModal/BlockUserModal";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "../../components/ui/dialog";
import { Share2 } from "lucide-react";
import { UserCircle2 } from "lucide-react";

const Community = () => {
  const params = useParams();
  const username = params?.username;
  const searchParams = useSearchParams();
  const messageIdToScroll = searchParams?.get("messageId");
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

  const toggleSidebarMobile = () => setShowSidebarMobile((prev) => !prev);

  const getAuthHeaders = () => ({
    headers: { Authorization: `Bearer ${typeof window !== "undefined" ? localStorage.getItem("authToken") : null}` },
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchCommunity = async () => {
    setLoading(true);
    setError(null);
    try {
      const userData = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user")) : null;
      const currentUserId = userData?.id;
      if (!currentUserId) throw new Error("User ID is missing");
      const response = await api.get(`/community/username/${username}`);
      const fetchedCommunity = response.data;
      setCommunity(fetchedCommunity);
      setCommunityOwnerId(fetchedCommunity.owner?._id);
      setCommunityId(fetchedCommunity._id);

      const blockedResponse = await api.get("/user/blocked-users", getAuthHeaders());
      const blockedUsers = blockedResponse.data.blockedUsers || [];
      const isOwnerBlocked = blockedUsers.some(
        (user) => user._id === fetchedCommunity.owner?._id
      );
      setIsBlocked(isOwnerBlocked);

      const mutedResponse = await api.get("/user/muted-users", getAuthHeaders());
      const mutedUsers = mutedResponse.data.mutedUsers || [];
      const isOwnerMuted = mutedUsers.some(
        (user) => user._id === fetchedCommunity.owner?._id
      );
      setIsMuted(isOwnerMuted);

      if (fetchedCommunity._id) {
        try {
          const res = await api.get(
            `/bookmarks/check/Community/${fetchedCommunity._id}`,
            getAuthHeaders()
          );
          setIsBookmarked(res.data.isBookmarked || false);
        } catch {
          setIsBookmarked(false);
        }
      }

      if (fetchedCommunity.owner?._id && currentUserId) {
        const followResponse = await api.get(
          `/user/followStatus/${fetchedCommunity.owner._id}`,
          getAuthHeaders()
        );
        setFollowStatus(followResponse.data.isFollowing);
      }
    } catch (err) {
      setError("Failed to load community data: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunity();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]);

  const toggleDropdown = () => setShowDropdown(!showDropdown);

  const handleReportModalClose = () => setShowReportModal(false);
  const handleMuteModalClose = (success) => {
    setShowMuteModal(false);
    if (success) {
      setIsMuted(true);
      fetchCommunity();
    }
  };
  const handleUnmuteModalClose = (success) => {
    setShowUnmuteModal(false);
    if (success) {
      setIsMuted(false);
      fetchCommunity();
    }
  };
  const handleBlockModalClose = (success) => {
    setShowBlockModal(false);
    if (success) {
      setIsBlocked(true);
      fetchCommunity();
    }
  };

  const toggleFollow = async () => {
    if (!communityOwnerId) {
      setError("Community Owner ID is missing.");
      return;
    }
    if (isButtonLoading) return;

    setIsButtonLoading(true);
    setError(null);
    try {
      const action = followStatus ? "unfollow" : "follow";
      const response = await api.post(
        `/user/toggleFollow/${communityOwnerId}`,
        { action },
        getAuthHeaders()
      );
      if (response.status === 200) {
        setFollowStatus(!followStatus);
        fetchCommunity();
      }
    } catch (err) {
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
      await api.post(`/user/unblock/${communityOwnerId}`, {}, getAuthHeaders());
      setIsBlocked(false);
      toast.success(`${community.owner?.name} has been unblocked`);
    } catch {
      toast.error("Failed to unblock community");
    } finally {
      setIsUnblocking(false);
    }
  };

  const handleBookmarkToggle = async () => {
    if (!communityId || bookmarkLoading) return;
    setBookmarkLoading(true);
    try {
      if (!isBookmarked) {
        await api.post(`/bookmarks/Community/${communityId}`, {}, getAuthHeaders());
        setIsBookmarked(true);
        toast.success("Community bookmarked!");
      } else {
        await api.delete(`/bookmarks/Community/${communityId}`, getAuthHeaders());
        setIsBookmarked(false);
        toast.info("Bookmark removed!");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setBookmarkLoading(false);
    }
  };

  const truncateText = (text, length) =>
    text.length > length ? text.substring(0, length) + "..." : text;

  const totalCount = community?.owner?.followers.length || 0;
  const visibleProfiles = community?.owner?.followers.slice(0, 3) || [];

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (loading) return <ViewCommunitySkeleton />;

  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.pageContainer}>
      {community && (
        <MetaTags
          title={`${community.owner?.name || "Community"} | NexFellow`}
          description={
            community.description || `Join ${community.owner?.name} on NexFellow`
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
                      onClick={() => {
                        setShowDropdown(false);
                        setShowShareModal(true); // open share dialog from 3-dots
                      }}
                    >
                      Share
                    </button>
                    <button
                      className={styles.dropdownItem}
                      onClick={handleBookmarkToggle}
                      disabled={bookmarkLoading}
                    >
                      {isBookmarked ? "Remove Bookmark" : "Bookmark"}
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
                        if (isMuted) setShowUnmuteModal(true);
                        else setShowMuteModal(true);
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
                          src={communityBadge}
                          alt="Community Badge"
                          className={styles.badge}
                        />
                      ) : community.owner?.verificationBadge ? (
                        <img
                          src={verificationBadge}
                          alt="Verification Badge"
                          className={styles.badge}
                        />
                      ) : null
                    ) : community.owner?.verificationBadge ? (
                      <img
                        src={verificationBadge}
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
                      {totalCount > 0 ? ` +${totalCount} Members` : "No members yet"}
                    </span>
                  </div>

                  <div className={styles.actionButtons}>
                    <button
                      className={styles.iconButton}
                      onClick={() => {
                        const owner = community?.owner;
                        if (!owner?._id) return;
                        router.push("/inbox", {
                          state: {
                            dmTarget: {
                              _id: owner._id,
                              name: owner.name,
                              username: owner.username,
                              picture: owner.picture,
                            },
                          },
                        });
                      }}
                      aria-label="Message owner"
                    >
                      <img src={Msgicon?.src || Msgicon} alt="Message" className={styles.svgIcon} />
                    </button>

                    <button
                      className={styles.iconButton}
                      onClick={() => {
                        if (community?.link) {
                          const formattedLink = community.link.startsWith("http")
                            ? community.link
                            : `https://${community.link}`;
                          window.open(formattedLink, "_blank");
                        } else {
                          toast.error("Owner has not added website yet.");
                        }
                      }}
                    >
                      <img src={Webicon?.src || Webicon} alt="Website" className={styles.svgIcon} />
                    </button>

                    {/* Share icon removed from here; Share is now in 3-dots menu */}
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
                      ) : community?.isPrivate ? (
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

          <CommunityBody
            communityId={communityId}
            posts={community?.posts}
            members={community?.members}
            messageIdToScroll={messageIdToScroll}
          />
        </div>

        {windowWidth > 768 ? (
          <CommunitySidebar communityId={communityId} />
        ) : (
          <>
            {/* mobile sidebar trigger/overlay unchanged */}
          </>
        )}
      </div>

      {/* Share Dialog controlled by showShareModal; can be opened from dropdown */}
      <Dialog open={showShareModal} onOpenChange={setShowShareModal}>
        <DialogContent style={{ padding: "1rem" }}>
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
              style={{ display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer" }}
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
              style={{ display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer" }}
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
              style={{ display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer" }}
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
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
              style={{ display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer" }}
              onClick={() => {
                if (navigator.share) {
                  navigator
                    .share({
                      title: "Check out this community",
                      text: "Join this amazing community!",
                      url: window.location.href,
                    })
                    .catch(() => { });
                } else {
                  toast.error("Sharing is not supported in this browser.");
                }
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
                <Share2 />
              </div>
              <span style={{ marginTop: "5px" }}>Other</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
            <p>You won&apos;t see posts from this community in your feed until you unblock it.</p>
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
            <button onClick={() => setShowModal(false)} className={styles.closeModal}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Community;
