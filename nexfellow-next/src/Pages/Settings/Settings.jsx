import React, { useState } from "react";
import styles from "./Settings.module.css";
import { IoArrowBack } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import MutedUsers from "../../components/MutedUsers/MutedUsers";
import BlockedUsers from "../../components/BlockedUsers/BlockedUsers";
import HiddenPosts from "../../components/HiddenPosts/HiddenPosts";
import PrivacySettings from "../../components/PrivacySettings/PrivacySettings";
import { IoMdPerson } from "react-icons/io";
import { RiLockPasswordLine } from "react-icons/ri";
import { IoNotificationsOutline } from "react-icons/io5";
import { BiMessageAltX } from "react-icons/bi";
import { IoBanOutline } from "react-icons/io5";
import { FaEyeSlash } from "react-icons/fa";

// Tabs for different settings sections
const TABS = {
  ACCOUNT: "Account",
  PRIVACY: "Privacy",
  NOTIFICATIONS: "Notifications",
  MUTED_USERS: "Muted Users",
  BLOCKED_USERS: "Blocked Users",
  HIDDEN_POSTS: "Hidden Posts",
};

// Icons for each tab
const TAB_ICONS = {
  [TABS.ACCOUNT]: <IoMdPerson />,
  [TABS.PRIVACY]: <RiLockPasswordLine />,
  [TABS.NOTIFICATIONS]: <IoNotificationsOutline />,
  [TABS.MUTED_USERS]: <BiMessageAltX />,
  [TABS.BLOCKED_USERS]: <IoBanOutline />,
  [TABS.HIDDEN_POSTS]: <FaEyeSlash />,
};

const Settings = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(TABS.PRIVACY);

  const handleBackClick = () => {
    navigate(-1);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case TABS.MUTED_USERS:
        return <MutedUsers />;
      case TABS.BLOCKED_USERS:
        return <BlockedUsers />;
      case TABS.HIDDEN_POSTS:
        return <HiddenPosts />;
      case TABS.ACCOUNT:
        return (
          <div className={styles.comingSoonContainer}>
            <h3>Account Settings</h3>
            <p>Account settings will be available soon.</p>
          </div>
        );
      case TABS.PRIVACY:
        return <PrivacySettings />;
      case TABS.NOTIFICATIONS:
        return (
          <div className={styles.comingSoonContainer}>
            <h3>Notification Settings</h3>
            <p>Notification settings will be available soon.</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={styles.settingsPage}>
      <div className={styles.header}>
        <button className={styles.backButton} onClick={handleBackClick}>
          <IoArrowBack />
        </button>
        <h1 className={styles.title}>Settings</h1>
      </div>

      <div className={styles.content}>
        <div className={styles.sidebar}>
          <ul className={styles.tabList}>
            {Object.values(TABS).map((tab) => (
              <li
                key={tab}
                className={`${styles.tabItem} ${
                  activeTab === tab ? styles.active : ""
                }`}
                onClick={() => setActiveTab(tab)}
              >
                <span className={styles.tabIcon}>{TAB_ICONS[tab]}</span>
                <span className={styles.tabText}>{tab}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className={styles.tabContent}>
          <div className={styles.contentCard}>{renderTabContent()}</div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
