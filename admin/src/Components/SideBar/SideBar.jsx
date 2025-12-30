import React from "react";
import styles from "./SideBar.module.css";
import { useDispatch } from "react-redux";
import { useNavigate, NavLink } from "react-router-dom";
import { clearUser } from "../../slices/userSlice";
import NexFellowLogo from "../../assests/SideBar/NexFellowLogo.svg";

// Updated Icons
import {
  FiUsers,
  FiFileText,
  FiBell,
  FiBarChart2,
  FiUserPlus,
  FiGlobe,
  FiCheckCircle,
  FiSend,
  FiLogOut,
  FiBookOpen,
} from "react-icons/fi";

import { MdOutlineCampaign } from "react-icons/md";

const SideBar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(clearUser());
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className={styles.sidebar}>
      <div className={styles.logoDiv}>
        <img className={styles.geekLogo} src={NexFellowLogo} alt="NexFellow Logo" />
      </div>

      <div className={styles.sideContainer}>
        <div className={styles.sidebarUpper}>
          <NavLink
            to="/users"
            className={({ isActive }) =>
              `${styles.navLink} ${isActive ? styles.active : ""}`
            }
          >
            <FiUsers className={styles.sideIcon} />
            <p>Users</p>
          </NavLink>

          <NavLink
            to="/blogs"
            className={({ isActive }) =>
              `${styles.navLink} ${isActive ? styles.active : ""}`
            }
          >
            <FiBookOpen className={styles.sideIcon} />
            <p>Blog</p>
          </NavLink>

          <NavLink
            to="/posts"
            className={({ isActive }) =>
              `${styles.navLink} ${isActive ? styles.active : ""}`
            }
          >
            <FiFileText className={styles.sideIcon} />
            <p>Posts</p>
          </NavLink>

          <NavLink
            to="/notifications"
            className={({ isActive }) =>
              `${styles.navLink} ${isActive ? styles.active : ""}`
            }
          >
            <FiBell className={styles.sideIcon} />
            <p>Notifications</p>
          </NavLink>

          <NavLink
            to="/analytics"
            className={({ isActive }) =>
              `${styles.navLink} ${isActive ? styles.active : ""}`
            }
          >
            <FiBarChart2 className={styles.sideIcon} />
            <p>Analytics</p>
          </NavLink>

          <NavLink
            to="/referrals"
            className={({ isActive }) =>
              `${styles.navLink} ${isActive ? styles.active : ""}`
            }
          >
            <FiUserPlus className={styles.sideIcon} />
            <p>Referrals</p>
          </NavLink>

          <NavLink
            to="/advertisements"
            className={({ isActive }) =>
              `${styles.navLink} ${isActive ? styles.active : ""}`
            }
          >
            <MdOutlineCampaign className={styles.sideIcon} />
            <p>Advertisements</p>
          </NavLink>

          <NavLink
            to="/featured-communities"
            className={({ isActive }) =>
              `${styles.navLink} ${isActive ? styles.active : ""}`
            }
          >
            <FiGlobe className={styles.sideIcon} />
            <p>All Communities</p>
          </NavLink>

          <NavLink
            to="/requests"
            className={({ isActive }) =>
              `${styles.navLink} ${isActive ? styles.active : ""}`
            }
          >
            <FiCheckCircle className={styles.sideIcon} />
            <p>Verifications</p>
          </NavLink>

          <div className={styles.geekMailerDiv}>
            <FiSend className={styles.sideIcon} />
            <a
              href="https://geekmailer-a7do.onrender.com"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.geekMailerTag}
            >
              Geek Mail
            </a>
          </div>
        </div>

        <div className={styles.sidebarLower}>
          <div onClick={handleLogout}>
            <FiLogOut className={styles.sideIcon} />
            <p>Logout</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SideBar;
