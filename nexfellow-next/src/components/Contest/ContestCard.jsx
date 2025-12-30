import trophy from './assets/trophy.svg';
import styles from './ContestCard.module.css';


const ContestCard = () => {
  return (
    <div className={styles.contestCard}>
                <div className={styles.freeTag}>Free</div>
                <img src={trophy} alt="Trophy" className={styles.trophyImage} />
              </div>
  );
};

export default ContestCard;