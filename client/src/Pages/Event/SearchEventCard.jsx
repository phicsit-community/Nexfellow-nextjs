import React from 'react';
import classNames from 'classnames'; // Import classnames library
import styles from './Event.module.css';

const EventCard = ({ 
  event, 
  mode = 'view', // Default mode is 'view' (static)
  onEdit, 
  onDelete, 
  openDropdown, 
  setOpenDropdown 
}) => {
  const handleMoreOptionsClick = (e) => {
    e.stopPropagation();
    if (mode === 'edit') {
      setOpenDropdown(openDropdown === event._id ? null : event._id);
    }
  };

  return (
    <li className={classNames(styles.searchEventCard, {
      [styles.editable]: mode === 'edit',
      [styles.static]: mode === 'view'
    })}>
      {/* Event Image */}
      <div className={styles.eventImage}>
        {event.imageUrl ? (
          <img src={event.imageUrl} alt={event.title} loading="lazy" className={styles.image} />
        ) : (
          mode === 'edit' && (
            <button className={styles.uploadButton}>Upload Image</button>
          )
        )}
      </div>

      {/* Event Details */}
      <div className={classNames(styles.eventDetails, {
        [styles.editableDetails]: mode === 'edit',
        [styles.staticDetails]: mode === 'view'
      })}>
        <h3 className={styles.eventTitle}>{event.title}</h3>
        <p className={styles.eventDate}>
          Start Date: {new Date(event.startDate).toLocaleDateString()}
        </p>
        <p className={styles.eventTime}>
          Start Time: {new Date(`${event.startDate.split('T')[0]}T${event.startTime}`).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
            timeZoneName: 'short',
          })}
        </p>
        <p className={styles.eventDate}>
          End Date: {new Date(event.endDate).toLocaleDateString()}
        </p>
        <p className={styles.eventTime}>
          End Time: {new Date(`${event.endDate.split('T')[0]}T${event.endTime}`).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
            timeZoneName: 'short',
          })}
        </p>
        <p className={styles.eventMode}>Mode: {event.location}</p>
      </div>

      {/* Dropdown Menu (Only visible in 'edit' mode) */}
      {mode === 'edit' && (
        <div className={styles.moreOptionsContainer}>
          <button className={styles.moreOptions} onClick={handleMoreOptionsClick}>
            ...
          </button>
          {openDropdown === event._id && (
            <div className={styles.dropdownMenu} onClick={(e) => e.stopPropagation()}>
              <button onClick={() => onEdit(event)}>Edit</button>
              <button onClick={() => onDelete(event._id)}>Delete</button>
            </div>
          )}
        </div>
      )}
    </li>
  );
};

export default EventCard;