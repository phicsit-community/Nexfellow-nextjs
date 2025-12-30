import styles from "./Modal.module.css";

function Modal({ children, onClose }) {
  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        {children}
        <button onClick={onClose} className={styles.close}>
          &times;
        </button>
      </div>
    </div>
  );
}

export default Modal;
