"use client";

import { useState } from "react";
import { useMediaQuery } from "react-responsive";

// styles
import styles from "./Header.module.css";

import announcementIconStatic from "./animated/announcement.png";
import announcementAnimated from "./animated/announcement.gif";

import PlayOnce from "../animatedIcon/PlayOnce";

// components
import {
  SearchCommandMobile,
} from "../SearchBar/search-command";
import WhatsNewModal from "../WhatsNew/WhatsNewModal";

function Header() {
  const [isWhatsNewOpen, setIsWhatsNewOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState();

  const isMobile = useMediaQuery({ maxWidth: 640 });
  const toggleWhatsNew = () => setIsWhatsNewOpen((prev) => !prev);

  return (
    <div className={styles.header}>
      {isMobile && <SearchCommandMobile />}
      <div
        onClick={toggleWhatsNew}
        style={{ cursor: "pointer", position: "relative" }}
        onMouseEnter={() => setHoveredIndex(1)}
        onMouseLeave={() => setHoveredIndex(null)}
        className={styles.whatsNewIcon}
      >
        <PlayOnce
          icon={announcementAnimated}
          play={hoveredIndex === 1}
          size={25}
          style={{ width: 25, height: 25 }}
          staticIcon={announcementIconStatic.src || announcementIconStatic}
        />
      </div>
      {isWhatsNewOpen && <WhatsNewModal closeModal={toggleWhatsNew} />}
    </div>
  );
}

export default Header;
