import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import styles from "./Modal.module.css";

const Modal = ({ options = [], onClose, position }) => {
  const modalRef = useRef();
  const [coords, setCoords] = useState(null);

  // position is in viewport coords: top/left = anchor's bottom/right edge, anchorTop = anchor's top edge.
  // Right-align the menu to the anchor, clamp inside the viewport, and flip above if it would overflow below.
  useLayoutEffect(() => {
    const el = modalRef.current;
    if (!el) return;
    const margin = 8;
    const { width, height } = el.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    let left = Math.min(Math.max(position.left - width, margin), vw - width - margin);
    let top = position.top + 4;
    if (top + height > vh - margin) {
      const above = (position.anchorTop ?? position.top) - height - 4;
      top = above >= margin ? above : Math.max(vh - height - margin, margin);
    }
    setCoords({ top, left });
  }, [position]);

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
          top: coords ? coords.top : 0,
          left: coords ? coords.left : 0,
          visibility: coords ? "visible" : "hidden",
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
