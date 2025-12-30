import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IoClose, IoArrowBack } from "react-icons/io5";
import { Sparkles, Trophy, Users, Zap, Gift, Calendar } from "lucide-react";
import styles from "./WhatsNewModal.module.css";
import whatsNewLogo from "./assets/Overlay.png";

const WhatsNewModal = ({ closeModal }) => {
  const [selectedItem, setSelectedItem] = useState(null);

  // Hardcoded What's New data
  const whatsNewData = [
    {
      id: 1,
      category: "NEW FEATURE",
      icon: <Sparkles />,
      title: "AI-Powered Matching Engine",
      description:
        "Experience smarter networking with NexFellow’s AI-Powered Matching Engine that connects you with the right people, mentors, and opportunities effortlessly.",
      datetime: "10/15/2025", // Oct 15, 2025
      isNew: true,
      priority: "High Priority",
    },
    {
      id: 2,
      category: "FEATURE",
      icon: <Gift />,
      title: "Introducing Reputation Points",
      description:
        "Build your professional identity with Reputation Points that highlight your skills, engagement, and trust within the network.",
      datetime: "07/10/2025", // July 10, 2025
      isNew: true,
      priority: null,
    },
    {
      id: 3,
      category: "FEATURE",
      icon: <Users />,
      title: "Introducing Inbox",
      description:
        "Stay connected with professionals through the Inbox Feature, built for real and productive conversations.",
      datetime: "07/20/2025", // July 20, 2025
      isNew: true,
      priority: null,
    },
    {
      id: 4,
      category: "UPDATE",
      icon: <Trophy />,
      title: "Launching Challenges",
      description:
        "Challenges motivate members to stay consistent and grow through fun, goal-based streaks.",
      datetime: "11/15/2025", // 15 Nov, 2025
      isNew: true,
      priority: "High Priority",
    },
    {
      id: 5,
      category: "FEATURE",
      icon: <Zap />,
      title: "Introducing Broadcast",
      description:
        "Use Broadcast to make announcements, share ideas, and engage your whole network instantly.",
      datetime: "08/10/2025", // 10 August, 2025
      isNew: true,
      priority: null,
    },
  ];

  // Animation variants
  const modalVariants = {
    hidden: { opacity: 0, x: 30, scale: 0.9 },
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: { duration: 0.3, ease: "easeOut" },
    },
    exit: {
      opacity: 0,
      x: 30,
      scale: 0.9,
      transition: { duration: 0.2, ease: "easeIn" },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const detailsVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.3,
        type: "spring",
        stiffness: 300,
        damping: 24,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.2 },
    },
  };

  const getCategoryColor = (category) => {
    const colors = {
      "NEW FEATURE": "#24b2b4",
      CONTEST: "#f59e0b",
      COMMUNITY: "#8b5cf6",
      UPDATE: "#10b981",
      FEATURE: "#6366f1",
    };
    return colors[category] || "#6b7280";
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const Topbar = () => (
    <header className={styles.modalHeader}>
      {selectedItem ? (
        <div className={styles.detailsHeader}>
          <motion.button
            className={styles.backButton}
            onClick={() => setSelectedItem(null)}
            whileTap={{ scale: 0.9 }}
          >
            <IoArrowBack />
          </motion.button>
          <p>What&apos;s New</p>
        </div>
      ) : (
        <div className={styles.listHeader}>
          <div className={styles.headerLeft}>
            <img src={whatsNewLogo} alt="Logo" className={styles.logo} />
            <div className="flex flex-col">
              <p>What&apos;s New</p>
              <p style={{ fontSize: "12px", color: "#64748B" }}>
                Latest updates & announcements
              </p>
            </div>
          </div>
          <div className={styles.rightActions}>
            <motion.button
              className={styles.closeButton}
              onClick={closeModal}
              whileTap={{ scale: 0.9 }}
            >
              <IoClose />
            </motion.button>
          </div>
        </div>
      )}
    </header>
  );

  const handleItemClick = (item) => {
    setSelectedItem(item);
  };

  const renderWhatsNewList = () => (
    <motion.div
      className={styles.whatsNewContainer}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {whatsNewData.map((item) => (
        <motion.div
          key={item.id}
          variants={itemVariants}
          className={`${styles.whatsNewItem} ${item.isNew ? styles.newItem : styles.readItem
            }`}
          onClick={() => handleItemClick(item)}
        >
          <motion.div
            key={item.id}
            variants={itemVariants}
            className={styles.itemTopPart}
          >
            <div className={styles.itemContent}>
              <div className={styles.itemLeft}>
                <div
                  className={styles.iconContainer}
                  style={{
                    backgroundColor: `${getCategoryColor(item.category)}15`,
                    border: `1px solid ${getCategoryColor(item.category)}30`,
                  }}
                >
                  <div
                    className={styles.icon}
                    style={{ color: getCategoryColor(item.category) }}
                  >
                    {item.icon}
                  </div>
                </div>
                <div className={styles.itemText}>
                  <div className={styles.itemHeader}>
                    <span
                      className={styles.category}
                      style={{
                        color: "#64748B",
                        fontSize: "11px",
                        fontWeight: "semibold",
                      }}
                    >
                      {item.category}
                    </span>
                    {item.isNew && <span className={styles.newBadge}>New</span>}
                  </div>
                </div>
              </div>
            </div>

            <span className={` text-nowrap text-sm ${styles.timestamp}`}>
              <Calendar size={12} />
              {formatDate(item.datetime)}
            </span>
          </motion.div>
          <h3 className={styles.itemTitle}>{item.title}</h3>
          <p className={styles.itemDescription}>{item.description}</p>
          {item.priority && (
            <span className={styles.priorityBadge}>{item.priority}</span>
          )}
        </motion.div>
      ))}
    </motion.div>
  );

  const renderItemDetails = () => (
    <motion.div
      className={styles.detailsModal}
      variants={detailsVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <div className={styles.detailsContent}>
        <div className={styles.detailsTop}>
          <div
            className={styles.detailsIconContainer}
            style={{
              backgroundColor: `${getCategoryColor(selectedItem.category)}15`,
            }}
          >
            <div
              className={styles.detailsIcon}
              style={{ color: getCategoryColor(selectedItem.category) }}
            >
              {selectedItem.icon}
            </div>
          </div>
          <div className={styles.detailsInfo}>
            <div className={styles.detailsHeader}>
              <span
                className={styles.detailsCategory}
                style={{ color: getCategoryColor(selectedItem.category) }}
              >
                {selectedItem.category}
              </span>
              {selectedItem.isNew && (
                <span className={styles.newBadge}>New</span>
              )}
            </div>
            <h2 className={styles.detailsTitle}>{selectedItem.title}</h2>
          </div>
        </div>

        <div className={styles.detailsBody}>
          <p className={styles.detailsDescription}>
            {selectedItem.description}
          </p>
          {selectedItem.priority && (
            <div className={styles.detailsPriority}>
              <span className={styles.priorityBadge}>
                {selectedItem.priority}
              </span>
            </div>
          )}
        </div>

        <div className={styles.detailsFooter}>
          <span className={styles.detailsTimestamp}>
            <Calendar size={14} />
            {formatDate(selectedItem.datetime)}
          </span>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className={styles.modalOverlay} onClick={closeModal}>
      <motion.div
        className={styles.modal}
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={(e) => e.stopPropagation()}
      >
        <Topbar />
        {!selectedItem &&
          whatsNewData.filter((item) => item.isNew).length > 0 && (
            <div
              className={
                "text-[#19AE9F] text-[13px] bg-[#19AE9F]/10 rounded-md border-[#19AE9F]/20 flex items-center border-[1px] mb-2"
              }
              style={{
                padding: "10px 20px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "10px",
                marginTop: "10px",
              }}
            >
              <Sparkles size={13} className="inline" />
              {whatsNewData.filter((item) => item.isNew).length} new updates
            </div>
          )}
        <div className={styles.modalBody}>
          <AnimatePresence mode="wait">
            {selectedItem ? renderItemDetails() : renderWhatsNewList()}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default WhatsNewModal;
