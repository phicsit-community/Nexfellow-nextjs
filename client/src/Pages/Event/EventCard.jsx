// EventCard.jsx
import React, { useRef, useEffect } from "react";
import classNames from "classnames";
import styles from "./Event.module.css";
import { BsThreeDots } from "react-icons/bs";

const EventCard = ({
  event,
  mode = "view",
  onEdit,
  onDelete,
  openDropdown,
  setOpenDropdown,
  onCardClick,
}) => {
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (openDropdown !== event._id) return;

    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenDropdown(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openDropdown, event._id, setOpenDropdown]);

  const handleCardClick = () => {
    if (!(mode === "edit" && openDropdown === event._id)) {
      onCardClick && onCardClick(event);
    }
  };

  const handleMoreOptionsClick = (e) => {
    e.stopPropagation();
    if (mode === "edit") {
      setOpenDropdown(openDropdown === event._id ? null : event._id);
    }
  };

  return (
    <li
      className={classNames(styles.eventCard, {
        [styles.editable]: mode === "edit",
        [styles.static]: mode === "view",
      })}
      onClick={handleCardClick}
      style={{ cursor: "pointer" }}
    >
      {/* Event Image */}
      <div
        className={styles.eventImage}
        style={{ cursor: event.imageUrl ? "pointer" : "default" }}
      >
        {event.imageUrl ? (
          <img
            src={event.imageUrl}
            alt={event.title}
            loading="lazy"
            className={styles.image}
          />
        ) : (
          mode === "edit" && (
            <button
              className={styles.uploadButton}
              onClick={e => e.stopPropagation()}
            >
              Upload Image
            </button>
          )
        )}
      </div>

      {/* Event Details */}
      <div
        className={classNames(styles.eventDetails, {
          [styles.editableDetails]: mode === "edit",
          [styles.staticDetails]: mode === "view",
        })}
      >
        <h3 className={styles.eventTitle}>{event.title}</h3>
        <p className={styles.eventDate}>
          Start Date: {new Date(event.startDate).toLocaleDateString()}
        </p>
        <p className={styles.eventTime}>
          Start Time:{" "}
          {new Date(
            `${event.startDate.split("T")[0]}T${event.startTime}`
          ).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
            timeZoneName: "short",
          })}
        </p>
        <p className={styles.eventDate}>
          End Date: {new Date(event.endDate).toLocaleDateString()}
        </p>
        <p className={styles.eventTime}>
          End Time:{" "}
          {new Date(
            `${event.endDate.split("T")[0]}T${event.endTime}`
          ).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
            timeZoneName: "short",
          })}
        </p>
        <p className={styles.eventMode}>Mode: {event.location}</p>
      </div>

      {/* Dropdown Menu */}
      {mode === "edit" && (
        <div className={styles.moreOptionsContainer}>
          <button
            className={styles.moreOptions}
            onClick={handleMoreOptionsClick}
            tabIndex={0}
            aria-label="More options"
          >
            <BsThreeDots />
          </button>
          {openDropdown === event._id && (
            <div
              className={styles.dropdownMenu}
              ref={dropdownRef}
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={e => {
                  e.stopPropagation();
                  onEdit(event);
                }}
              >
                Edit
              </button>
              <button
                onClick={e => {
                  e.stopPropagation();
                  onDelete(event._id);
                }}
              >
                Delete
              </button>
            </div>
          )}
        </div>
      )}
    </li>
  );
};

export default EventCard;
