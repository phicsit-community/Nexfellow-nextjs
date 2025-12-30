import { useNavigate } from "react-router-dom";

// styles
import styles from "./BackButton.module.css";

// assets
import backBtn from "./assets/ArrowLeft.svg";

const BackButton = ({ text = "Back", showText = true, smallText = false }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <button
      className={`${styles.backButton} ${smallText ? styles.smallText : ""}`}
      onClick={handleBack}
    >
      <img src={backBtn} alt="Back" />
      {showText && <p className={styles.text}>{text}</p>}
    </button>
  );
};

export default BackButton;
