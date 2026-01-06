import React, { useState, useEffect } from "react";
import api from "../../lib/axios";
import {
  FiEdit2,
  FiTrash,
  FiCalendar,
  FiClock,
  FiMapPin,
  FiLink,
  FiImage,
} from "react-icons/fi";
import styles from "./EventModal.module.css";
import { DatePicker, TimePicker, Tooltip, message, ConfigProvider } from "antd";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { Users, X } from "lucide-react";
dayjs.extend(customParseFormat);

const EventModal = ({ isOpen, onClose, eventData, communityId }) => {
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [formError, setFormError] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    description: "",
    url: "",
    location: "online",
    maxParticipants: 0,
  });

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 576);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (isOpen) {
      if (eventData) {
        setFormData({
          title: eventData.title || "",
          startDate: eventData.startDate ? eventData.startDate.split("T")[0] : "",
          startTime: eventData.startTime || "",
          endDate: eventData.endDate ? eventData.endDate.split("T")[0] : "",
          endTime: eventData.endTime || "",
          description: eventData.description || "",
          url: eventData.url || "",
          location: eventData.location || "online",
          maxParticipants: eventData.maxParticipants,
        });
        if (eventData.imageUrl) setImage(eventData.imageUrl);
      } else {
        const today = new Date();
        const formattedDate = today.toISOString().split("T")[0];
        const formattedTime = today.toTimeString().split(" ")[0].slice(0, 5);
        setFormData({
          title: "",
          startDate: formattedDate,
          startTime: formattedTime,
          endDate: formattedDate,
          endTime: formattedTime,
          description: "",
          url: "",
          location: "online",
          maxParticipants: 0,
        });
        setImage(null);
        setImageFile(null);
      }
      setFormError("");
    }
  }, [isOpen, eventData]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        message.error("Image size should be less than 3MB");
        return;
      }
      setImage(URL.createObjectURL(file));
      setImageFile(file);
      message.success("Image uploaded successfully!");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((s) => ({ ...s, [name]: value }));
  };

  const handleDateTimeChange = (datetime, fieldType) => {
    if (datetime) {
      if (fieldType === "start") {
        setFormData((s) => ({
          ...s,
          startDate: datetime.format("YYYY-MM-DD"),
          startTime: datetime.format("HH:mm"),
        }));
      } else {
        setFormData((s) => ({
          ...s,
          endDate: datetime.format("YYYY-MM-DD"),
          endTime: datetime.format("HH:mm"),
        }));
      }
    } else {
      if (fieldType === "start") {
        setFormData((s) => ({ ...s, startDate: "", startTime: "" }));
      } else {
        setFormData((s) => ({ ...s, endDate: "", endTime: "" }));
      }
    }
  };

  const handleDateChange = (date, fieldType) => {
    if (date) {
      if (fieldType === "start") {
        setFormData((s) => ({ ...s, startDate: date.format("YYYY-MM-DD") }));
      } else {
        setFormData((s) => ({ ...s, endDate: date.format("YYYY-MM-DD") }));
      }
    }
  };

  const handleTimeChange = (time, fieldType) => {
    if (time) {
      if (fieldType === "start") {
        setFormData((s) => ({ ...s, startTime: time.format("HH:mm") }));
      } else {
        setFormData((s) => ({ ...s, endTime: time.format("HH:mm") }));
      }
    }
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setFormError("Event title is required");
      return false;
    }
    if (!formData.startDate || !formData.startTime) {
      setFormError("Event start date and time are required");
      return false;
    }
    if (!formData.endDate || !formData.endTime) {
      setFormError("Event end date and time are required");
      return false;
    }
    const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
    const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);
    if (endDateTime <= startDateTime) {
      setFormError("End date/time must be after start date/time");
      return false;
    }
    setFormError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    const eventDataToSend = new FormData();
    eventDataToSend.append("title", formData.title);
    eventDataToSend.append("startDate", formData.startDate);
    eventDataToSend.append("startTime", formData.startTime);
    eventDataToSend.append("endDate", formData.endDate);
    eventDataToSend.append("endTime", formData.endTime);
    eventDataToSend.append("description", formData.description);
    eventDataToSend.append("url", formData.url);
    eventDataToSend.append("location", formData.location);
    eventDataToSend.append("maxParticipants", formData.maxParticipants || 0);
    if (imageFile) eventDataToSend.append("image", imageFile);
    if (communityId) eventDataToSend.append("communityId", String(communityId));

    try {
      if (eventData && eventData._id) {
        await api.put(`/event/update/${eventData._id}`, eventDataToSend, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        message.success("Event updated successfully!");
      } else {
        await api.post(`/event/create/${communityId}`, eventDataToSend, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        message.success("Event created successfully!");
      }
      onClose();
    } catch (error) {
      message.error("Failed to save event. Please try again.");
      setFormError(
        error.response?.data?.message || "An error occurred while saving the event"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    document.addEventListener("keydown", handleEscapeKey);
    return () => document.removeEventListener("keydown", handleEscapeKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className={styles.modalOverlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={`flex justify-between items-center ${styles.modalTitle}`}>
          <h2>{eventData ? "Edit Event" : "Create New Event"}</h2>
          <button
            onClick={onClose}
            className={styles.closeButton}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {formError && <div className={styles.formError}>{formError}</div>}

        <form onSubmit={handleSubmit}>
          <div className="flex justify-center items-center">
            <div className={styles.imageUpload}>
              <Tooltip title="Click to upload a 1:1 ratio image">
                <label htmlFor="imageInput" className={styles.imageContainer}>
                  {image ? (
                    <img src={image} alt="Event cover" className={styles.uploadedImage} />
                  ) : (
                    <div className={styles.uploadPlaceholder}>
                      <div className="flex flex-col items-center">
                        <FiImage size={32} className="mb-2" />
                        <span className={styles.uploadTitle}>Upload Cover Image</span>
                        <span
                          className="text-xs mt-2"
                          style={{ color: "var(--color-muted-foreground)" }}
                        >
                          Recommended: 1:1 ratio
                        </span>
                      </div>
                    </div>
                  )}
                  <input
                    type="file"
                    id="imageInput"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: "none" }}
                  />
                </label>
              </Tooltip>

              {!image && (
                <label className={styles.imageEditIcon} htmlFor="imageInput">
                  <FiEdit2 />
                </label>
              )}

              {image && (
                <button
                  type="button"
                  className={styles.removeImageButton}
                  onClick={(e) => {
                    e.preventDefault();
                    setImage(null);
                    setImageFile(null);
                    message.info("Image removed");
                  }}
                  aria-label="Remove image"
                >
                  <FiTrash />
                </button>
              )}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="title">Event Title</label>
            <div className={styles.inputField}>
              <input
                id="title"
                className={styles.titleInput}
                type="text"
                name="title"
                placeholder="Enter event name"
                value={formData.title}
                onChange={handleChange}
                required
                maxLength={100}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>
              <FiCalendar style={{ marginRight: "8px" }} className="inline" /> Event
              Duration
            </label>

            {isMobile ? (
              <>
                <div className={styles.dateTimeRow}>
                  <div className={styles.dateTimeCol}>
                    <span className={styles.dateTimeLabel}>Start Date</span>
                    <ConfigProvider
                      theme={{ components: { DatePicker: { cellWidth: 24, cellHeight: 24, fontSize: 13 } } }}
                    >
                      <DatePicker
                        className={styles.dateInput}
                        format="YYYY-MM-DD"
                        placeholder="Select date"
                        value={formData.startDate ? dayjs(formData.startDate) : null}
                        onChange={(date) => handleDateChange(date, "start")}
                        picker="date"
                        getPopupContainer={(trigger) => trigger.parentElement}
                      />
                    </ConfigProvider>
                  </div>
                  <div className={styles.dateTimeCol}>
                    <span className={styles.dateTimeLabel}>Start Time</span>
                    <ConfigProvider
                      theme={{ components: { TimePicker: { cellWidth: 24, cellHeight: 24, fontSize: 13 } } }}
                    >
                      <TimePicker
                        className={styles.timeInput}
                        format="HH:mm"
                        placeholder="Select time"
                        value={formData.startTime ? dayjs(formData.startTime, "HH:mm") : null}
                        onChange={(time) => handleTimeChange(time, "start")}
                        minuteStep={15}
                        use12Hours={false}
                        getPopupContainer={(trigger) => trigger.parentElement}
                      />
                    </ConfigProvider>
                  </div>
                </div>

                <div className={styles.dateTimeRow} style={{ marginTop: "16px" }}>
                  <div className={styles.dateTimeCol}>
                    <span className={styles.dateTimeLabel}>End Date</span>
                    <ConfigProvider
                      theme={{ components: { DatePicker: { cellWidth: 24, cellHeight: 24, fontSize: 13 } } }}
                    >
                      <DatePicker
                        className={styles.dateInput}
                        format="YYYY-MM-DD"
                        placeholder="Select date"
                        value={formData.endDate ? dayjs(formData.endDate) : null}
                        onChange={(date) => handleDateChange(date, "end")}
                        picker="date"
                        getPopupContainer={(trigger) => trigger.parentElement}
                      />
                    </ConfigProvider>
                  </div>
                  <div className={styles.dateTimeCol}>
                    <span className={styles.dateTimeLabel}>End Time</span>
                    <ConfigProvider
                      theme={{ components: { TimePicker: { cellWidth: 24, cellHeight: 24, fontSize: 13 } } }}
                    >
                      <TimePicker
                        className={styles.timeInput}
                        format="HH:mm"
                        placeholder="Select time"
                        value={formData.endTime ? dayjs(formData.endTime, "HH:mm") : null}
                        onChange={(time) => handleTimeChange(time, "end")}
                        minuteStep={15}
                        use12Hours={false}
                        getPopupContainer={(trigger) => trigger.parentElement}
                      />
                    </ConfigProvider>
                  </div>
                </div>
              </>
            ) : (
              <div className={styles.dateTimeRow}>
                <div className={styles.dateTimeCol}>
                  <span className={styles.dateTimeLabel}>Start</span>
                  <ConfigProvider
                    getPopupContainer={(trigger) => trigger.parentElement}
                    theme={{ components: { DatePicker: { cellWidth: 28, cellHeight: 28, fontSize: 14 } } }}
                  >
                    <DatePicker
                      className={styles.dateTimeInput}
                      showTime={{ format: "HH:mm" }}
                      format="YYYY-MM-DD HH:mm"
                      placeholder="Select start time"
                      onChange={(dt) => handleDateTimeChange(dt, "start")}
                      value={
                        formData.startDate && formData.startTime
                          ? dayjs(`${formData.startDate} ${formData.startTime}`, "YYYY-MM-DD HH:mm")
                          : null
                      }
                      getPopupContainer={(trigger) => trigger.parentElement}
                    />
                  </ConfigProvider>
                </div>
                <div className={styles.dateTimeCol}>
                  <span className={styles.dateTimeLabel}>End</span>
                  <ConfigProvider
                    getPopupContainer={(trigger) => trigger.parentElement}
                    theme={{ components: { DatePicker: { cellWidth: 28, cellHeight: 28, fontSize: 14 } } }}
                  >
                    <DatePicker
                      className={styles.dateTimeInput}
                      showTime={{ format: "HH:mm" }}
                      format="YYYY-MM-DD HH:mm"
                      placeholder="Select end time"
                      onChange={(dt) => handleDateTimeChange(dt, "end")}
                      value={
                        formData.endDate && formData.endTime
                          ? dayjs(`${formData.endDate} ${formData.endTime}`, "YYYY-MM-DD HH:mm")
                          : null
                      }
                      getPopupContainer={(trigger) => trigger.parentElement}
                    />
                  </ConfigProvider>
                </div>
              </div>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              className={styles.descriptionInput}
              name="description"
              placeholder="A short introduction to let members know why they should attend."
              value={formData.description}
              onChange={handleChange}
              rows="4"
              maxLength={1000}
            />
            <div
              className="text-xs text-right"
              style={{ color: "var(--color-muted-foreground)", marginTop: "0.25rem" }}
            >
              {formData.description.length}/1000
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="url">
              <FiLink style={{ marginRight: "8px" }} className="inline" /> Event URL
            </label>
            <input
              id="url"
              className={styles.urlInput}
              type="text"
              name="url"
              placeholder="https://..."
              value={formData.url}
              onChange={handleChange}
            />
          </div>

          <div className={styles.formGroup}>
            <label>
              <FiMapPin style={{ marginRight: "8px" }} className="inline" /> Location
            </label>
            <div className={styles.radioGroup}>
              <label>
                <input
                  type="radio"
                  name="location"
                  value="online"
                  checked={formData.location === "online"}
                  onChange={handleChange}
                />
                Online
              </label>
              <label>
                <input
                  type="radio"
                  name="location"
                  value="offline"
                  checked={formData.location === "offline"}
                  onChange={handleChange}
                />
                Offline
              </label>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="maxParticipants">
              <Users style={{ marginRight: "8px" }} className="inline" size={15} /> Max Participants
            </label>
            <input
              id="maxParticipants"
              className={styles.maxParticipantsInput}
              type="number"
              name="maxParticipants"
              placeholder="Enter max participants (0 for unlimited)"
              value={formData.maxParticipants || ""}
              onChange={(e) =>
                setFormData((s) => ({
                  ...s,
                  maxParticipants: e.target.value ? parseInt(e.target.value, 10) : null,
                }))
              }
              min="0"
              max="10000"
            />
            <div
              className="text-xs"
              style={{ color: "var(--color-muted-foreground)", marginTop: "0.25rem", textAlign: "right" }}
            >
              Set to 0 for unlimited participants
            </div>
          </div>

          <button type="submit" className={styles.createButton} disabled={loading}>
            {loading ? (
              <>
                <div className={styles.spinner}></div> Saving...
              </>
            ) : eventData ? (
              "Update Event"
            ) : (
              "Create Event"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EventModal;
