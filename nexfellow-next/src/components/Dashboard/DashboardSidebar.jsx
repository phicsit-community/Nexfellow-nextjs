"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Hamburger from "hamburger-react";

// styles
import styles from "./Dashboard.module.css";

// icons
import { FaTrophy, FaCalendarAlt, FaPaperPlane, FaCrown } from "react-icons/fa";
import lockIcon from "./assets/lock.svg";
import Skeleton from "../common/Skeleton";
import { motion, AnimatePresence } from "framer-motion";

const DashboardSidebar = ({
  isCommunityAccount,
  verificationBadge,
  communityBadge,
  premiumBadge,
  communityId,
  loading = false,
}) => {
  const [activeTab, setActiveTab] = useState("/create/challenges");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [buttonPosition, setButtonPosition] = useState({ bottom: 0, right: 0 });
  const floatingButtonRef = useRef(null);
  console.log("communityId", communityId);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleTabClick = (path) => {
    setActiveTab(path);
  };

  const isActive = (path) => activeTab === path;

  const isLocked =
    (!communityBadge || verificationBadge) && !isCommunityAccount;

  useEffect(() => {
    if (floatingButtonRef.current) {
      const buttonRect = floatingButtonRef.current.getBoundingClientRect();
      setButtonPosition({
        bottom: window.innerHeight - buttonRect.bottom,
        right: window.innerWidth - buttonRect.right,
      });
    }
  }, []);

  // Render skeleton sidebar item
  const renderSkeletonItem = () => (
    <div className={styles.itemWrapper}>
      <div className={`${styles.item}`}>
        <Skeleton type="analytic-card" className={styles.sidebarItemSkeleton} />
      </div>
    </div>
  );

  // Render skeleton mini sidebar item
  const renderSkeletonMiniItem = () => (
    <div className={styles.miniItem}>
      <Skeleton type="text" className={styles.miniSidebarItemSkeleton} />
    </div>
  );

  const renderSidebarItem = (path, icon, title, description) => (
    <div className={styles.itemWrapper}>
      <Link
        href={isLocked ? "#" : `${path}/${communityId}`}
        className={`${styles.item} ${isActive(`${path}/${communityId}`) ? styles.active : ""
          }`}
        onClick={() => !isLocked && handleTabClick(`${path}/${communityId}`)}
      >
        <div className={styles.icon}>{icon}</div>
        <div>
          <h4 className={styles.title}>{title}</h4>
          <p className={styles.description}>{description}</p>
        </div>
        {isLocked && (
          <div className={styles.lockOverlay}>
            <img src={lockIcon} alt="" className={styles.lockIcon} />
          </div>
        )}
      </Link>
    </div>
  );

  const renderMiniSidebarItem = (path, icon, title) => (
    <Link
      href={isLocked ? "#" : `${path}/${communityId}`}
      className={styles.miniMobileItem}
      onClick={() => !isLocked && handleTabClick(`${path}/${communityId}`)}
    >
      {icon} {title}
      {isLocked && (
        <div className={styles.lockOverlay}>
          <img src={lockIcon} alt="" className={styles.lockIcon} />
        </div>
      )}
    </Link>
  );

  if (loading) {
    return (
      <>
        <div className={`${styles.sidebar} ${styles.desktopSidebar}`}>
          <div className={styles.section}>
            <div className={styles.category}>
              <span
                className={styles.dot}
                style={{ backgroundColor: "#FF6B00" }}
              ></span>
              <h3>Create</h3>
            </div>
            {[...Array(3)].map((_, index) => (
              <div key={index} className={styles.itemWrapper}>
                {renderSkeletonItem()}
              </div>
            ))}
          </div>

          <div className={styles.section}>
            <div className={styles.category}>
              <span
                className={styles.dot}
                style={{ backgroundColor: "#4CAF50" }}
              ></span>
              <h3>Communication</h3>
            </div>
            {renderSkeletonItem()}
          </div>

          <div className={styles.section}>
            <div className={styles.category}>
              <span
                className={styles.dot}
                style={{ backgroundColor: "#1E88E5" }}
              ></span>
              <h3>Other</h3>
            </div>
            {[...Array(2)].map((_, index) => (
              <div key={index} className={styles.itemWrapper}>
                {renderSkeletonItem()}
              </div>
            ))}
          </div>
        </div>

        {/* Floating Mini Sidebar for Mobile View */}
        <div
          className={`${styles.mobileSidebar} ${isSidebarOpen ? styles.open : styles.closed
            }`}
        >
          <div className={styles.section}>
            {[...Array(6)].map((_, index) => (
              <div key={index}>{renderSkeletonMiniItem()}</div>
            ))}
          </div>
        </div>

        {/* Floating Button to Open Sidebar */}
        <div className={styles.floatingButton} onClick={toggleSidebar}>
          <div
            className={`${styles.floatingButtonIcon} ${isSidebarOpen ? styles.open : styles.closed
              }`}
          >
            {/* {isSidebarOpen ? <FaTimes /> : <FaBars />} */}
            <Hamburger onToggle={toggleSidebar} size={20} />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className={`${styles.sidebar} ${styles.desktopSidebar}`}>
        <div className={styles.section}>
          <div className={styles.category}>
            <span
              className={styles.dot}
              style={{ backgroundColor: "#FF6B00" }}
            ></span>
            <h3>Create</h3>
          </div>
          {renderSidebarItem(
            "/create/challenges",
            <FaTrophy />,
            "Challenges",
            "Spark page engagement with Challenges.",
            !isCommunityAccount
          )}
          {renderSidebarItem(
            "/create/contests",
            <FaCrown />,
            "Contests",
            "Start a contest, boost engagement today.",
            !isCommunityAccount
          )}
          {renderSidebarItem(
            "/create/events",
            <FaCalendarAlt />,
            "Events",
            "Connect and grow your page through Events.",
            !isCommunityAccount
          )}
        </div>

        <div className={styles.section}>
          <div className={styles.category}>
            <span
              className={styles.dot}
              style={{ backgroundColor: "#4CAF50" }}
            ></span>
            <h3>Communication</h3>
          </div>
          {renderSidebarItem(
            "/communication/broadcast",
            <FaPaperPlane />,
            "Broadcast",
            "Notify your followers and boost your reach.",
            !isCommunityAccount
          )}
        </div>

        <div className={styles.section}>
          <div className={styles.category}>
            <span
              className={styles.dot}
              style={{ backgroundColor: "#1E88E5" }}
            ></span>
            <h3>Other</h3>
          </div>
          {renderSidebarItem(
            "/other/topmembers",
            <FaCrown />,
            "Top Members",
            "Feature your most active contributors.",
            !isCommunityAccount
          )}
          {renderSidebarItem(
            "/other/moderators",
            <FaCalendarAlt />,
            "Moderators",
            "Add trusted moderators to manage your page.",
            !isCommunityAccount
          )}
        </div>
      </div>

      {/* Floating Mini Sidebar for Mobile View */}
      <div
        className={`${styles.mobileSidebar} ${isSidebarOpen ? styles.open : styles.closed
          }`}
      >
        <div className={styles.mobileSection}>
          {renderMiniSidebarItem(
            "/create/challenges",
            <FaTrophy />,
            "Challenges"
          )}
          {renderMiniSidebarItem("/create/contests", <FaCrown />, "Contests")}
          {renderMiniSidebarItem("/create/events", <FaCalendarAlt />, "Events")}
          {renderMiniSidebarItem(
            "/communication/broadcast",
            <FaPaperPlane />,
            "Broadcast"
          )}
          {renderMiniSidebarItem(
            "/other/topmembers",
            <FaCrown />,
            "Top Members"
          )}
          {renderMiniSidebarItem(
            "/other/moderators",
            <FaCalendarAlt />,
            "Moderators"
          )}
        </div>
      </div>

      {/* Floating Button to Open Sidebar */}
      <div className={styles.floatingButton} onClick={toggleSidebar}>
        <div
          className={`${styles.floatingButtonIcon} ${isSidebarOpen ? styles.open : styles.closed
            }`}
        >
          <Hamburger onToggle={toggleSidebar} size={20} />
        </div>
      </div>

      {/* Overlay background when sidebar is open with animation */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            style={{
              position: "fixed",
              bottom: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background:
                "linear-gradient(to top, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0) 70%)",
              zIndex: 999,
              pointerEvents: "none",
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default DashboardSidebar;
