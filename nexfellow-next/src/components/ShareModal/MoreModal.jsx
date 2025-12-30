import React, { useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import styles from "./Modal.module.css";

const Modal = ({ options = [], onClose, position }) => {
  const modalRef = useRef();

  useEffect(() => {
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  return ReactDOM.createPortal(
    <div className={styles.overlay}>
      <div
        ref={modalRef}
        className={styles.modal}
        style={{
          position: "fixed",
          top: position.top,
          left: Math.min(position.left, window.innerWidth - 160), // prevents overflow
          transform: window.innerWidth < 480 ? "translateX(-50%)" : "none",
          zIndex: 9999,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {options.map((option, index) => (
          <button
            key={index}
            className={styles.option}
            onClick={() => {
              if (typeof option.action === "function") {
                option.action();
              }
              onClose();
            }}
          >
            {option.icon && <span className={styles.icon}>{option.icon}</span>}
            <span className={styles.label}>{option.label}</span>
          </button>
        ))}
      </div>
    </div>,
    document.body
  );
};

export default Modal;
