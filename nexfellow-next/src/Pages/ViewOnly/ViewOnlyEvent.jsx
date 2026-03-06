"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import api from "../../lib/axios";
import styles from "./ViewOnlyEvent.module.css";
import BackButton from "../../components/BackButton/BackButton";
import { LuShare2 } from "react-icons/lu";
import { toast } from "sonner";
import MetaTags from "../../components/MetaTags/MetaTags";

// Assets
import calendar from "../Event/assets/Calendar.svg";
import userCircleDashed from "../Event/assets/UserCircleDashed.svg";
import caretRight from "../Event/assets/CaretRight.svg";
import { Calendar, Users, ChevronRight, CalendarClock } from "lucide-react";

const ViewOnlyEvent = () => {
  const router = useRouter();
  const params = useParams();
  const eventId = params?.eventId;

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [countdown, setCountdown] = useState({
    days: "00",
    hours: "00",
    minutes: "00",
    seconds: "00",
  });

  const handleBack = () => {
    router.back();
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast.success("Event link copied to clipboard!");
  };

  const handleLoginPrompt = () => {
    router.push(`/login?returnUrl=${encodeURIComponent(`/community/events/${eventId}`)}`);
  };

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/event/details/${eventId}`);
        setEvent(res.data.event);
        console.log(res.data.event);
      } catch (error) {
        console.error("Error fetching event details:", error);
        setError("Failed to load event details");
      } finally {
        setLoading(false);
      }
    };

    if (eventId) fetchEvent();
  }, [eventId]);

  // Format date range
  const formatDateRange = (startDate, startTime, endTime) => {
    if (!startDate) return "Date TBA";

    const date = new Date(startDate);

    const day = date.toLocaleDateString("en-US", {
      weekday: "short",
      day: "2-digit",
      month: "long",
    });

    const formattedStartTime = startTime
      ? new Date(`${startDate.split("T")[0]}T${startTime}`).toLocaleTimeString(
        "en-US",
        {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }
      )
      : "TBA";

    const formattedEndTime = endTime
      ? new Date(`${startDate.split("T")[0]}T${endTime}`).toLocaleTimeString(
        "en-US",
        {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }
      )
      : "TBA";

    return `${day} ${formattedStartTime} - ${formattedEndTime}`;
  };

  // Calculate countdown
  const calculateCountdown = (targetTime) => {
    const now = new Date().getTime();
    const distance = targetTime - now;

    if (distance <= 0) {
      return {
        days: "00",
        hours: "00",
        minutes: "00",
        seconds: "00",
      };
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    return {
      days: String(days).padStart(2, "0"),
      hours: String(hours).padStart(2, "0"),
      minutes: String(minutes).padStart(2, "0"),
      seconds: String(seconds).padStart(2, "0"),
    };
  };

  useEffect(() => {
    if (!event) return;

    const targetDateTime = new Date(
      `${event.startDate?.split("T")[0]}T${event.startTime}`
    ).getTime();

    const interval = setInterval(() => {
      const newCountdown = calculateCountdown(targetDateTime);
      setCountdown(newCountdown);
    }, 1000);

    return () => clearInterval(interval); // cleanup
  }, [event]);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading event details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <h3>Error Loading Event</h3>
        <p>{error}</p>
        <button onClick={handleBack} className={styles.backButton}>
          Go Back
        </button>
      </div>
    );
  }

  if (!event) {
    return (
      <div className={styles.notFoundContainer}>
        <h3>Event Not Found</h3>
        <p>
          The event you&apos;re looking for doesn&apos;t exist or may have been
          removed.
        </p>
        <button onClick={handleBack} className={styles.backButton}>
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {event && (
        <MetaTags
          title={`${event.title || "Event"} | NexFellow`}
          description={
            event.description || "Join this upcoming event on NexFellow!"
          }
          contentId={eventId}
          contentType="event"
          type="event"
        />
      )}

      <div className={styles.layoutContainer}>
        <div className={styles.mainContentContainer}>
          <div className={styles.mainContent}>
            <div className={styles.cardContainer}>
              <div className={styles.leftPanel}>
                <div className={styles.eventCard}>
                  <div className={styles.backShare}>
                    <BackButton onClick={handleBack} />
                    <div className={styles.rightButtons}>
                      <button
                        className={styles.shareButton}
                        onClick={handleShare}
                      >
                        <LuShare2 />
                        <span>Share</span>
                      </button>
                    </div>
                  </div>

                  <div className={styles.imageCard}>
                    <div className={styles.freeTag}>Free</div>
                    <img
                      src={event.imageUrl || "https://via.placeholder.com/400x400?text=Event"}
                      alt="Event Banner"
                      className={styles.eventImage}
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/400x400?text=Event";
                      }}
                    />
                  </div>

                  <div className={styles.timerContainer}>
                    <p>Event starts in</p>
                    <div className={styles.timerGrid}>
                      <div className={styles.timerBox}>
                        <span>{countdown.days}</span>
                        <label>Days</label>
                      </div>
                      <div className={styles.timerBox}>
                        <span>{countdown.hours}</span>
                        <label>Hours</label>
                      </div>
                      <div className={styles.timerBox}>
                        <span>{countdown.minutes}</span>
                        <label>Min</label>
                      </div>
                      <div className={styles.timerBox}>
                        <span>{countdown.seconds}</span>
                        <label>Sec</label>
                      </div>
                    </div>
                    <button
                      className={styles.loginJoinButton}
                      onClick={handleLoginPrompt}
                    >
                      Login to Join
                    </button>
                  </div>
                </div>
              </div>

              <div className={styles.rightPanel}>
                <div className={styles.previewBanner}>
                  <div className={styles.previewTitle}>
                    <span>Event Preview</span>
                    <p>Login to register and see all details</p>
                  </div>
                  <button
                    className={styles.loginTopButton}
                    onClick={handleLoginPrompt}
                  >
                    Login to Register
                  </button>
                </div>
                <div className={styles.eventDetails}>
                  <h2 className={styles.eventTitle}>{event.title}</h2>

                  <div className={styles.eventInfo}>
                    <div className={styles.hostInfo}>
                      <img
                        src={event.createdBy?.picture}
                        alt="Host"
                        className={styles.hostInfoPic}
                      />
                      <div className={styles.hostData}>
                        <span className={styles.hostDataLabel}>Hosted By</span>
                        <span className={styles.hostDataName}>
                          {event.createdBy?.name}
                        </span>
                      </div>
                    </div>

                    <div className={styles.dateTimeInfo}>
                      <CalendarClock size={44} color="#24B2B4" />
                      <div className={styles.dateTimeData}>
                        <span className={styles.dateTimeDataLabel}>Date</span>
                        <p className={styles.dateTimeDataValue}>
                          {formatDateRange(
                            event.startDate,
                            event.startTime,
                            event.endTime
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className={styles.descriptionBox}>
                    <span className={styles.label}>About this event</span>
                    <p className={styles.description}>{event.description}</p>
                  </div>

                  <div className={styles.features}>
                    <button
                      className={styles.featureButton}
                      onClick={handleLoginPrompt}
                    >
                      <Calendar size={20} color="#24B2B4" />
                      <div className={styles.featureText}>
                        <span>Add to calendar</span>
                      </div>
                      <ChevronRight className={styles.arrow} size={20} />
                    </button>
                    <button
                      className={styles.featureButton}
                      onClick={handleLoginPrompt}
                    >
                      <Users size={20} color="#24B2B4" />
                      <div className={styles.featureText}>
                        <span>See who’s attending</span>
                      </div>
                      <ChevronRight className={styles.arrow} size={20} />
                    </button>
                  </div>

                  <div className={styles.blurredAttendees}>
                    <p>Login to see attendees</p>
                  </div>

                  <div className={styles.authCTA}>
                    <h3>Want to attend this event?</h3>
                    <div className={styles.authButtons}>
                      <button
                        onClick={() => router.push(`/login?returnUrl=${encodeURIComponent(`/community/events/${eventId}`)}`)}
                      >
                        Login
                      </button>
                      <button onClick={() => router.push("/signup")}>
                        Sign Up
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewOnlyEvent;
