import React, { useState } from "react";
import styles from "./Detail.module.css";

const Detail = ({ onClose, onCreate }) => {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    setErrors({
      ...errors,
      [name]: "",
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.username) newErrors.username = "Username is required";
    if (!formData.email) newErrors.email = "Email is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      onCreate(formData);
    }
  };

  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <span className={styles.close} onClick={onClose}>
          &times;
        </span>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your name"
              className={styles.input}
            />
            {errors.name && <span className={styles.error}>{errors.name}</span>}
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter your username"
              className={styles.input}
            />
            {errors.username && (
              <span className={styles.error}>{errors.username}</span>
            )}
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className={styles.input}
            />
            {errors.email && (
              <span className={styles.error}>{errors.email}</span>
            )}
          </div>
          <div className={styles.buttonGroup}>
            <button
              type="button"
              className={`${styles.button} ${styles.cancel}`}
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`${styles.button} ${styles.submit}`}
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Detail;
