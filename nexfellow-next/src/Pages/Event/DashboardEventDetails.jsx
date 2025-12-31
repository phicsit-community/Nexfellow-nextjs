"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import { ClipLoader } from "react-spinners";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./DashboardEventDetails.module.css";
import trophy from "./assets/trophy.svg";
import { BsThreeDotsVertical } from "react-icons/bs";
import { LuShare2 } from "react-icons/lu";
import { GrEdit } from "react-icons/gr";
import { toast } from "sonner";
import BackButton from "../../components/BackButton/BackButton";
import EventModal from "../../components/Event/EventModal";
import { Calendar, Clock, Download, Edit, MapPin, Users } from "lucide-react";
import { Button } from "../../components/ui/button";
import { MdOpenInNew } from "react-icons/md";

// Animation variants
const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.5 },
  },
};

const slideUp = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      damping: 25,
      stiffness: 500,
      staggerChildren: 0.1,
      when: "beforeChildren",
    },
  },
};

const staggerItems = {
  hidden: { y: 15, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

const EventDetails = () => {
  const router = useRouter();
  const params = useParams();
  const eventId = params?.eventId;
  const [event, setEvent] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [backButtonText, setBackButtonText] = useState("Back");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [windowWidth, setWindowWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1024);
  const [imageOverlayOpen, setImageOverlayOpen] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      setIsLoading(true);
      try {
        const res = await axios.get(`/event/details/slug/${eventId}`);
        setEvent(res.data.event);
      } catch (error) {
        console.error("Error fetching event details:", error);
        toast.error("Failed to load event details", {
          style: {
            background: "#ffeded",
            border: "1px solid #f87171",
            color: "#b91c1c",
          },
        });
      } finally {
        setIsLoading(false);
      }
    };
    if (eventId) fetchEvent();
  }, [eventId]);

  const handleBack = () => router.back();

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      setBackButtonText(window.innerWidth <= 768 ? "Back" : "Back");
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDropdown && !event.target.closest(`.${styles.dropdownWrapper}`)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDropdown]);

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/community/events/${eventId}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success("Event link copied to clipboard!", {
      duration: 3000,
      style: {
        background: "#e5f7f7",
        border: "1px solid #24b2b4",
        color: "#24b2b4",
      },
      position: "bottom-right",
      // className: styles.toast,
    });
  };

  const handleDownloadCSV = () => {
    const headers = ["Name", "Email", "Registered", "Status"];
    const rows = filteredAttendees.map((att) => [
      att.name,
      att.email,
      att.registrationDate,
      att.status,
    ]);

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += headers.join(",") + "\n";
    rows.forEach((row) => {
      csvContent += row.join(",") + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${event.title || "event"}_attendees.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setShowDropdown(false); // Close dropdown after download

    toast.success("Attendees list downloaded successfully!", {
      duration: 3000,
      style: {
        background: "#e5f7f7",
        border: "1px solid #24b2b4",
        color: "#24b2b4",
      },
    });
  };

  // Handle closing the image overlay when clicking on the backdrop
  const handleOverlayBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      setImageOverlayOpen(false);
    }
  };

  const attendees =
    event?.participants?.map((participant) => ({
      name: participant.user.name || "Unknown",
      email: participant.user.email || "No email",
      registrationDate: participant.registrationDate
        ? new Date(participant.registrationDate).toLocaleDateString()
        : "N/A",
      status: "Going",
    })) || [];

  const filteredAttendees = attendees.filter(
    (attendee) =>
      attendee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      attendee.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <ClipLoader size={50} color="#24b2b4" loading={true} />
        </motion.div>
      </div>
    );
  }

  if (!event) {
    return (
      <motion.div
        className={styles.container}
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        <div className={styles.layoutContainer}>
          <div className={styles.mainContentContainer}>
            <h2 style={{ color: "#24b2b4", textAlign: "center" }}>
              Event not found
            </h2>
            <motion.button
              onClick={handleBack}
              className={styles.iconButton}
              style={{ margin: "0 auto" }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Go Back
            </motion.button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className={styles.container}
      initial="hidden"
      animate="visible"
      variants={fadeIn}
    >
      <div className={styles.layoutContainer}>
        <div className={styles.mainContentContainer}>
          <motion.div className={styles.mainContent} variants={slideUp}>
            {/* <motion.div className={styles.headerRow} variants={staggerItems}>
            </motion.div> */}

            <div className={styles.detailsGrid}>
              {/* Left section */}
              <motion.div className={styles.eventCard} variants={staggerItems}>
                <div
                  style={{
                    marginBottom: "2rem",
                  }}
                >
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
                </div>

                <div className={` relative ${styles.cardHeader}`}>
                  {/* <motion.span
                    className="absolute top-2 left-2 text-xs cursor-pointer bg-[#0d7172] text-white rounded-full"
                    style={{
                      padding: "0.2rem 0.8rem",
                      zIndex: 10,
                    }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    {event.isFree === true
                        ? "Free"
                        : event.isFree === false
                        ? "Paid"
                        : "Free"}
                    Free
                  </motion.span> */}
                  <motion.img
                    layoutId="event-image"
                    src={event.imageUrl || trophy}
                    alt={event.title || "Event"}
                    className={styles.eventImage}
                    onClick={() => setImageOverlayOpen(true)}
                    onError={(e) => {
                      e.target.src = trophy;
                    }}
                    whileHover={{ cursor: "pointer" }}
                  // transition={{ duration: 0.3 }}
                  />
                  <div className={styles.tagAndTitle}>
                    <motion.h1
                      className={styles.eventTitle}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      {event.title || "Event Name"}
                    </motion.h1>
                  </div>
                </div>
                <motion.div
                  className={styles.cardInfo}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <motion.p
                    variants={staggerItems}
                    className="flex items-center gap-1.5"
                  >
                    <Calendar className="inline text-[#24a3a5]" size={16} />{" "}
                    {new Date(event.startDate).toLocaleDateString()} -{" "}
                    {new Date(event.endDate).toLocaleDateString()}
                  </motion.p>
                  <motion.p
                    variants={staggerItems}
                    className="flex items-center gap-1.5"
                  >
                    <Clock className="inline text-[#24a3a5]" size={16} />{" "}
                    {new Date(event.startDate).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    -{" "}
                    {new Date(event.endDate).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </motion.p>

                  <motion.p
                    variants={staggerItems}
                    className="flex items-center gap-1.5"
                  >
                    <MapPin className="inline text-[#24a3a5]" size={16} />{" "}
                    {event.location || "Unknown"}
                  </motion.p>
                  <motion.p
                    variants={staggerItems}
                    className="flex items-center gap-1.5"
                  >
                    <Users className="inline text-[#24a3a5]" size={16} />{" "}
                    Organizer: {event.createdBy?.name || "Unknown"}
                  </motion.p>

                  <motion.div
                    className={styles.capacitySection}
                    variants={staggerItems}
                  >
                    <div className={styles.capacityHeader}>
                      <span className={styles.capacityLabel}>Capacity</span>
                      <span className={styles.capacityCount}>
                        {event.participants?.length || 0}
                        {event.maxParticipants === 0
                          ? " (No limit)"
                          : `/${event.maxParticipants}`}
                      </span>
                    </div>
                    {event.maxParticipants !== 0 && (
                      <div className={styles.progressBarContainer}>
                        <motion.div
                          className={styles.progressBar}
                          initial={{ width: 0 }}
                          animate={{
                            width: `${Math.min(
                              ((event.participants?.length || 0) /
                                event.maxParticipants) *
                              100,
                              100
                            )}%`,
                          }}
                          transition={{
                            duration: 1,
                            delay: 0.6,
                            ease: "easeOut",
                          }}
                        />
                      </div>
                    )}
                  </motion.div>
                  <motion.div className="grid grid-cols-3 gap-4 mt-4" variants={staggerItems}>
                    <Button
                      onClick={() => setIsModalOpen(true)}
                      // colors only; layout unchanged
                      className="flex items-center gap-2 bg-card hover:bg-accent text-foreground border border-border rounded-lg transition-colors"
                      style={{ padding: '8px 16px' }}
                    >
                      <Edit size={16} />
                      <span>Edit</span>
                    </Button>

                    <Button
                      onClick={handleShare}
                      className="flex items-center gap-2 bg-card hover:bg-accent text-foreground border border-border rounded-lg transition-colors"
                      style={{ padding: '8px 16px' }}
                    >
                      <LuShare2 size={16} />
                      <span>Share</span>
                    </Button>

                    <Button
                      onClick={() => router.push(`/community/events/${event.slug}`)}
                      className="flex items-center gap-2 bg-card hover:bg-accent text-foreground border border-border rounded-lg transition-colors"
                      style={{ padding: '8px 16px' }}
                    >
                      <MdOpenInNew size={16} />
                      <span>View</span>
                    </Button>
                  </motion.div>

                  <motion.p variants={staggerItems}>
                    <strong>Description:</strong>{" "}
                    {event.description || "No description provided."}
                  </motion.p>
                </motion.div>
              </motion.div>

              {/* Right section */}
              <motion.div
                className={styles.attendeesCard}
                variants={staggerItems}
              >
                <motion.h1
                  variants={staggerItems}
                  className=" font-medium"
                  style={{
                    fontSize: "1.5rem",
                  }}
                >
                  Event Details
                </motion.h1>
                <motion.div
                  className={styles.attendeesHeader}
                  variants={staggerItems}
                >
                  <motion.h2
                    variants={staggerItems}
                    className="flex items-center gap-2 "
                    style={{
                      fontSize: "1rem",
                      borderBottom: "2px solid #24b2b4",
                      paddingBottom: "0.5rem",
                      paddingLeft: "0.5rem",
                      paddingRight: "0.5rem",
                    }}
                  >
                    <Users className="inline" size={16} />
                    Attendees ({filteredAttendees.length})
                  </motion.h2>
                  <div className="md:flex grid portrait:grid-cols-1 w-full">
                    <motion.input
                      type="text"
                      placeholder="Search by name or email"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`${styles.searchInput}`}
                      aria-label="Search attendees"
                      initial={{ opacity: 0, width: "80%" }}
                      animate={{ opacity: 1, width: "100%" }}
                      transition={{ delay: 0.4, duration: 0.3 }}
                      whileFocus={{
                        boxShadow: "0 0 0 2px rgba(36, 178, 180, 0.3)",
                      }}
                      style={{
                        flex: 1,
                      }}
                    />
                    <motion.button
                      onClick={handleDownloadCSV}
                      className={
                        "bg-[#24b2b4] hover:bg-cyan-500 text-white rounded-lg flex items-center gap-2 transition-all duration-200"
                      }
                      style={{
                        padding: "0.5rem 1rem",
                        marginLeft: "0.5rem",
                        marginTop: windowWidth <= 768 ? "0.5rem" : "0",
                      }}
                    >
                      <Download size={16} />
                      Export
                    </motion.button>
                  </div>
                </motion.div>

                <motion.div
                  className={styles.attendeesTableWrapper}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.3 }}
                >
                  <div className={styles.tableHeader}>
                    <div>Name</div>
                    <div>Email</div>
                    <div
                      className={windowWidth <= 648 ? styles.hideOnSmall : ""}
                    >
                      Registration Date
                    </div>
                    <div
                      className={windowWidth <= 1100 ? styles.hideOnMedium : ""}
                    >
                      Status
                    </div>
                  </div>

                  <AnimatePresence>
                    {filteredAttendees.length > 0 ? (
                      filteredAttendees.map((attendee, index) => (
                        <motion.div
                          key={index}
                          className={styles.tableRow}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 * index, duration: 0.2 }}
                        // whileHover={{ backgroundColor: "#e5f7f7" }}
                        >
                          <div>{attendee.name}</div>
                          <div>{attendee.email}</div>
                          <div
                            className={
                              windowWidth <= 648 ? styles.hideOnSmall : ""
                            }
                          >
                            {attendee.registrationDate}
                          </div>
                          <div
                            className={
                              windowWidth <= 1100 ? styles.hideOnMedium : ""
                            }
                          >
                            <motion.span
                              className={styles.statusBadge}
                              whileHover={{ scale: 1.05 }}
                            >
                              {attendee.status}
                            </motion.span>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <motion.div
                        className={styles.noResults}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        {searchQuery
                          ? "No attendees found for this search."
                          : "No attendees have registered for this event yet."}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
      <EventModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setIsLoading(true);
          axios
            .get(`/event/details/${eventId}`)
            .then((res) => setEvent(res.data.event))
            .catch((err) =>
              console.error("Error refreshing event after edit:", err)
            )
            .finally(() => setIsLoading(false));
        }}
        eventData={event}
        communityId={event?.communityId}
      />
      <AnimatePresence>
        {imageOverlayOpen && (
          <motion.div
            className={styles.overlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={handleOverlayBackdropClick}
          >
            <motion.div
              className={styles.imageContainer}

            // Removed scale animations to let layoutId handle the transition naturally
            >
              <motion.img
                layoutId="event-image"
                src={event?.imageUrl || trophy}
                alt={event?.title || "Event"}
                className={styles.overlayImage}
                transition={{
                  // type: "spring",
                  // damping: 30,
                  stiffness: 300,
                  mass: 0.8,
                }}
              />
              <motion.button
                className={styles.closeButton}
                onClick={() => setImageOverlayOpen(false)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.8 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.2 }}
                whileHover={{ scale: 1.1, opacity: 1 }}
                whileTap={{ scale: 0.95 }}
              >
                ×
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default EventDetails;
