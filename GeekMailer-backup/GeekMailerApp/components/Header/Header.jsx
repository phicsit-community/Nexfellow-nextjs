'use client';

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useSelector } from "react-redux";

// styles
import styles from "./Header.module.css";

// icons
import { FaSearch } from "react-icons/fa";
import { AiOutlineBell, AiFillBell } from "react-icons/ai";

function Header() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const user = useSelector((state) => state.user.user);

  const toggleModal = () => setIsModalOpen((prev) => !prev);

  const handleRedirect = () => {
    router.push('/');
  };

  return (
    <div className={styles.header}>
      <div className={styles.navbarLogo}>
        <Link href="/">
          <img
            className={styles.navbarlogo}
            src="/assets/GeekClashLogo.svg"
            alt="GeekClash logo"
          />
        </Link>
      </div>
      <div className={styles.headRight}>
        {(pathname === "/view-emails" || pathname === "/contact") && (
          <div className={styles.searchContainer}>
            <FaSearch className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search"
              className={styles.searchBar}
            />
          </div>
        )}
        <div className={styles.headRightRight}>
          {(pathname === "/view-emails" || pathname === "/contact") && (
            <div onClick={toggleModal} style={{ cursor: "pointer" }}>
              {isModalOpen ? (
                <AiFillBell size={28} color="#24B2B4" />
              ) : (
                <AiOutlineBell size={28} color="#000" />
              )}
            </div>
          )}

          <div
            className={styles.profileLink}
            onClick={handleRedirect}
            style={{ cursor: "pointer" }}
          >
            <img
              className={styles.dp}
              src="https://ui-avatars.com/api/?name=User&background=24B2B4&color=fff&size=40"
              alt="Profile"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Header;
