'use client';

import styles from './TemplateCard.module.css';
import Image from 'next/image';

interface TemplateCardProps {
  heading: string;
  desc: string;
  logo: string;
  onClick: () => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({
  heading,
  desc,
  logo,
  onClick,
}) => {
  return (
    <div onClick={onClick} className={styles.container}>
      <div className={styles.logoContainer}>
        <Image src={logo} alt={heading} width={50} height={50} />
      </div>
      <div className={styles.infoContainer}>
        <div className={styles.heading}>{heading}</div>
        <div className={styles.desc}>{desc}</div>
      </div>
    </div>
  );
};

export default TemplateCard;
