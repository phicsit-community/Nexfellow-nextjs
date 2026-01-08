import styles from "./TemplateCard.module.css";

const TemplateCard = ({ heading, desc, logo, setIsCreateModalOpen }) => {
  return (
    <div
      onClick={() => setIsCreateModalOpen(true)}
      className={styles.container}
    >
      <div className={styles.logoContainer}>
        <img src={logo} />
      </div>
      <div className={styles.infoContainer}>
        <div className={styles.heading}>{heading}</div>
        <div className={styles.desc}>{desc}</div>
      </div>
    </div>
  );
};

export default TemplateCard;
