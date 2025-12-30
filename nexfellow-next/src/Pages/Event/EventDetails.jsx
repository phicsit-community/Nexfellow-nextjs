import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import styles from "./EventDetails.module.css";
import BackButton from "../../components/BackButton/BackButton";
import { LuShare2 } from "react-icons/lu";
import calendar from "./assets/Calendar.svg";
import userCircleDashed from "./assets/UserCircleDashed.svg";
import caretRight from "./assets/CaretRight.svg";
import defaultEventImage from "./assets/default-event-image.png";
import { toast } from "sonner";
import MetaTags from "../../components/MetaTags/MetaTags";

const EventDetails = () => {
  const navigate = useNavigate();
  const { eventId } = useParams();

  const [event, setEvent] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [loadingRegister, setLoadingRegister] = useState(false);
  const [countdown, setCountdown] = useState({
    days: "00",
    hours: "00",
    minutes: "00",
    seconds: "00",
  });

  const handleBack = () => {
    navigate(-1);
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast.success("Event link copied to clipboard!");
  };

  const handleRegister = async () => {
    if (!eventId) return;

    try {
      setLoadingRegister(true);
      if (isRegistered) {
        await axios.post(
          `/event/unregister/${eventId}`,
          {},
          { withCredentials: true }
        );
        toast.success("You have unregistered from the event!");
      } else {
        await axios.post(
          `/event/register/${eventId}`,
          {},
          { withCredentials: true }
        );
        toast.success("You have registered for the event!");
      }
      setIsRegistered(!isRegistered);
    } catch (error) {
      console.error("Error during registration:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoadingRegister(false);
    }
  };

  const handleCancelAttendance = async () => {
    if (!eventId || !isRegistered) return;

    try {
      await axios.post(
        `/event/unregister/${eventId}`,
        {},
        { withCredentials: true }
      );
      toast.success("Attendance cancelled.");
      setIsRegistered(false);
    } catch (error) {
      console.error("Error cancelling attendance:", error);
      toast.error("Something went wrong. Please try again.");
    }
  };

  const handleAddToCalendar = () => {
    const startDate = new Date(
      `${event.startDate.split("T")[0]}T${event.startTime}`
    );
    const endDate = new Date(
      `${event.startDate.split("T")[0]}T${event.endTime}`
    );

    const formatDate = (date) => {
      return date.toISOString().replace(/-|:|\.\d\d\d/g, "");
    };

    const calendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      event.title
    )}&dates=${formatDate(startDate)}/${formatDate(
      endDate
    )}&details=${encodeURIComponent(
      event.description
    )}&location=${encodeURIComponent("Online")}&sf=true&output=xml`;

    window.open(calendarUrl, "_blank");
  };

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await axios.get(`/event/details/${eventId}`, {
          withCredentials: true,
        });
        setEvent(res.data.event);
        console.log(res.data);
        const userId = localStorage.getItem("userId");
        setIsRegistered(res.data.isRegistered);
      } catch (error) {
        console.error("Error fetching event details:", error);
      }
    };

    if (eventId) fetchEvent();
  }, [eventId]);

  const formatDateRange = (startDate, startTime, endTime) => {
    const date = new Date(startDate);

    const day = date.toLocaleDateString("en-US", {
      weekday: "short",
      day: "2-digit",
      month: "long",
    });

    const formattedStartTime = new Date(
      `${startDate.split("T")[0]}T${startTime}`
    ).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    const formattedEndTime = new Date(
      `${startDate.split("T")[0]}T${endTime}`
    ).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    return `${day} ${formattedStartTime} - ${formattedEndTime}`;
  };

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
      `${event.startDate.split("T")[0]}T${event.startTime}`
    ).getTime();

    const interval = setInterval(() => {
      const newCountdown = calculateCountdown(targetDateTime);
      setCountdown(newCountdown);
    }, 1000);

    return () => clearInterval(interval);
  }, [event]);

  if (!event) return <div className={styles.loading}>Loading...</div>;

  return (
    <div className={styles.container}>
      {event && (
        <MetaTags
          title={`${event.title || "Event"} | GeeksClash`}
          description={
            event.description || "Join this upcoming event on GeeksClash!"
          }
          contentId={eventId}
          contentType="event"
          type="event"
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
                  onClick={() => navigate(-1)}
                  showText={true}
                  smallText={true}
                />
              </div>
              <div className={styles.moreButton}>
                <button className={styles.shareButton} onClick={handleShare}>
                  <LuShare2 /> <span className={styles.shareText}>Share</span>
                </button>
                <button
                  className={styles.registerButton}
                  onClick={handleRegister}
                  disabled={loadingRegister}
                >
                  {loadingRegister
                    ? "Loading..."
                    : isRegistered
                      ? "Unregister"
                      : "Register"}
                </button>
              </div>
            </div>
            <div className={styles.content}>
              <div className={styles.parent}>
                <div className={styles.contestCard}>
                  <div className={styles.freeTag}>Free</div>
                  <img
                    src={event.imageUrl || defaultEventImage}
                    alt="Trophy"
                    className={styles.trophyImage}
                  />
                </div>
                <div className={styles.contestCardInfo}>
                  <div className={styles.contestCardInfoText}>
                    <h3>{event.title}</h3>
                  </div>
                  <div className={styles.hostProfile}>
                    <span className={styles.contestHeading}>Hosted By:</span>
                    <div className={styles.hostAvatar}>
                      <img src={event.createdBy.picture} />
                    </div>
                    <span className={styles.hostName}>
                      {event.createdBy.name}
                    </span>
                  </div>

                  <div className={styles.dateTimeContainer}>
                    <div className={styles.dateTime}>
                      <span className={styles.contestHeading}>Date:</span>
                      <span className={styles.time}>
                        {formatDateRange(
                          event.startDate,
                          event.startTime,
                          event.endTime
                        )}
                      </span>
                    </div>
                  </div>
                  <div className={styles.textContainer}>
                    <div className={styles.dateTime}>
                      <span className={styles.contestHeading}>
                        Description:
                      </span>
                      <p className={styles.description}>{event.description}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.contestInfo}>
                <div className={styles.eventTimer}>
                  <h3>Event starts in</h3>
                  <div className={styles.timerGrid}>
                    <div className={styles.timerBox}>
                      <span className={styles.number}>{countdown.days}</span>
                      <span className={styles.unit}>Days</span>
                    </div>
                    <div className={styles.timerBox}>
                      <span className={styles.number}>{countdown.hours}</span>
                      <span className={styles.unit}>Hours</span>
                    </div>
                    <div className={styles.timerBox}>
                      <span className={styles.number}>{countdown.minutes}</span>
                      <span className={styles.unit}>Min</span>
                    </div>
                    <div className={styles.timerBox}>
                      <span className={styles.number}>{countdown.seconds}</span>
                      <span className={styles.unit}>sec</span>
                    </div>
                  </div>
                </div>

                <div className={styles.seeYouAtTheEvent}>
                  <div className={styles.seeYouAtTheEventContainer}>
                    <h3>
                      Hey, <br /> See you at the event
                    </h3>
                    <div className={styles.seeYouAtTheEventAvatar}>
                      <img src={event.createdBy.picture} />
                    </div>
                  </div>
                  <hr className={styles.hr} />
                </div>

                <div className={styles.actions}>
                  <button
                    className={styles.calendarButton}
                    onClick={handleAddToCalendar}
                  >
                    <div className={styles.calendarButtonContainer}>
                      <img src={calendar} alt="calendar" />
                      <span>Add to calendar</span>
                    </div>
                    <img
                      src={caretRight}
                      className={styles.arrow}
                      alt="caretRight"
                    />
                  </button>
                  {isRegistered && (
                    <button
                      className={styles.cancelButton}
                      onClick={handleCancelAttendance}
                    >
                      <div className={styles.calendarButtonContainer}>
                        <img src={userCircleDashed} alt="userCircleDashed" />
                        <span>Cancel attendance</span>
                      </div>
                      <img
                        src={caretRight}
                        className={styles.arrow}
                        alt="caretRight"
                      />
                    </button>
                  )}
                </div>

                <div className={styles.attendees}>
                  <div className={styles.avatarGroup}>
                    {event.participants.slice(0, 3).map((p) => (
                      <div key={p.user._id} className={styles.avatar}>
                        {p.user.picture ? (
                          <img
                            src={p.user.picture}
                            alt={p.user.name}
                            className={styles.avatarImage}
                          />
                        ) : (
                          p.user.name?.charAt(0) || "U"
                        )}
                      </div>
                    ))}
                  </div>
                  <span className={styles.attendeeCount}>
                    +{event.participants.length} attendees
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
