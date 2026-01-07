"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import api from "../../lib/axios";
import styles from "./Event.module.css";
import EventModal from "../../components/Event/EventModal";
import BackButton from "../../components/BackButton/BackButton";
import EventCard from "./EventCard";
import Tabs from "./Tabs";
import EmptyState from "./EmptyState";
import Link from "next/link";

const EventsPage = () => {
  const router = useRouter();
  const params = useParams();
  const communityId = params?.communityId;
  const [events, setEvents] = useState({ upcoming: [], past: [] });
  const [activeTab, setActiveTab] = useState("upcoming");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const userData = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user")) : null;
  const [userId, setUserId] = useState(null);
  const isAdmin = userId === communityId ? true : false;
  useEffect(() => {
    if (communityId) {
      fetchEvents();
    }
  }, [communityId]);

  useEffect(() => {
    const fetchCommunity = async () => {
      try {
        const response = await api.get(`/community/id/${communityId}`);
        setUserId(response.data.community.owner?.createdCommunity);
      } catch (error) {
        console.error("Error fetching community data:", error);
      }
    };

    if (communityId) {
      fetchCommunity();
    }
  }, [communityId]);

  const fetchEvents = async () => {
    try {
      const response = await api.get(`/event/community/${communityId}`);
      const upcoming = response.data.filter(
        (event) => new Date(event.startDate) >= new Date()
      );
      const past = response.data.filter(
        (event) => new Date(event.startDate) < new Date()
      );
      setEvents({ upcoming, past });
    } catch (error) {
      // 404 means no events found for this community - that's okay
      if (error.response?.status === 404) {
        setEvents({ upcoming: [], past: [] });
      } else {
        console.error("Error fetching events:", error);
      }
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleCreateEventClick = () => {
    setSelectedEvent(null);
    setIsModalOpen(true);
  };

  const handleEditEvent = (event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
    setOpenDropdown(null);
  };

  const handleDeleteEvent = (eventId) => {
    setEventToDelete(eventId);
    setShowDeleteModal(true);
  };

  const confirmDeleteEvent = async () => {
    try {
      await api.delete(`/event/delete/${eventToDelete}`);
      fetchEvents(); // Refresh events after deletion
    } catch (error) {
      console.error("Error deleting event:", error);
    } finally {
      setShowDeleteModal(false);
      setEventToDelete(null);
    }
  };

  const cancelDeleteEvent = () => {
    setShowDeleteModal(false);
    setEventToDelete(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    fetchEvents(); // Refresh events after modal closes
  };

  return (
    <div className={styles.page}>
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
      <div className={styles.header}>
        <h1 className={styles.title}>Events</h1>
        <button
          className={styles.createEventButton}
          onClick={handleCreateEventClick}
        >
          <span>+</span>
          <span>Event</span>
        </button>
      </div>

      {/* Tabs */}
      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Content */}
      <div className={styles.content}>
        {events[activeTab].length > 0 ? (
          <ul className={styles.eventList}>
            {events[activeTab].map((event) => (
              <EventCard
                key={event._id}
                event={event}
                mode={isAdmin ? "edit" : "view"}
                onEdit={isAdmin ? handleEditEvent : undefined}
                onDelete={isAdmin ? handleDeleteEvent : undefined}
                openDropdown={openDropdown}
                setOpenDropdown={setOpenDropdown}
                onCardClick={() =>
                  router.push(`/create/events/details/${event.slug || event._id}`)
                }
              />
            ))}
          </ul>
        ) : (
          <EmptyState onCreateEvent={handleCreateEventClick} />
        )}
      </div>

      {/* Modal */}
      <EventModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        eventData={selectedEvent}
        communityId={communityId}
      />
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: "32px 24px",
              borderRadius: 10,
              minWidth: 320,
              boxShadow: "0 2px 16px rgba(0,0,0,0.15)",
              textAlign: "center",
            }}
          >
            <h2 style={{ marginBottom: 16 }}>Delete Event?</h2>
            <p style={{ marginBottom: 24 }}>
              Are you sure you want to delete this event?
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: 16 }}>
              <button
                onClick={confirmDeleteEvent}
                style={{
                  background: "#e53935",
                  color: "#fff",
                  border: "none",
                  borderRadius: 5,
                  padding: "8px 20px",
                  cursor: "pointer",
                }}
              >
                Delete
              </button>
              <button
                onClick={cancelDeleteEvent}
                style={{
                  background: "#eee",
                  color: "#333",
                  border: "none",
                  borderRadius: 5,
                  padding: "8px 20px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventsPage;
