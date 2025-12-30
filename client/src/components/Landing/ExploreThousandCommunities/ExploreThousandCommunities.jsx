import React, { useEffect, useState } from "react";
import styles from "./ExploreThousandCommunities.module.css";
import ExploreThousandCard from "./ExploreThousandCard";

// images
import Management from "./assets/Management.webp";
import Business from "./assets/Business.webp";
import Hackathon from "./assets/Hackathon.webp";
import Medical from "./assets/Medical.webp";
import Blockchain from "./assets/Blockchain.webp";
import Trading from "./assets/Trading.webp";
import Startup from "./assets/Startup.webp";
import Art from "./assets/Art.webp";
import Fitness from "./assets/Fitness.webp";
import Job from "./assets/Job.webp";
// import twoLines from "./assets/twoLines.webp";

const ExploreThousandCommunities = () => {
  const cardsRow1 = [
    { category: "Management", img: Management },
    { category: "Business", img: Business },
    { category: "Hackathon", img: Hackathon },
    { category: "Medical", img: Medical },
    { category: "Blockchain", img: Blockchain },
  ];

  const cardsRow2 = [
    { category: "Trading", img: Trading },
    { category: "Startup", img: Startup },
    { category: "Art", img: Art },
    { category: "Fitness", img: Fitness },
    { category: "Job", img: Job },
  ];

  const getRepeatedCards = (cards) => {
    const cardWidth = 220;
    const screenWidth =
      typeof window !== "undefined" ? window.innerWidth : 1920;
    const cardsPerRow = Math.ceil(screenWidth / cardWidth) * 2;
    return Array.from(
      { length: cardsPerRow },
      (_, i) => cards[i % cards.length]
    );
  };

  const [repeatedRow1, setRepeatedRow1] = useState([]);
  const [repeatedRow2, setRepeatedRow2] = useState([]);

  useEffect(() => {
    const updateCards = () => {
      setRepeatedRow1(getRepeatedCards(cardsRow1));
      setRepeatedRow2(getRepeatedCards(cardsRow2));
    };

    updateCards();

    window.addEventListener("resize", updateCards);

    return () => {
      window.removeEventListener("resize", updateCards);
    };
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.heading}>
        <div className={styles.heading1}>Explore Thousand of</div>
        <div className={styles.heading2}>Communities</div>
        {/* <img src={twoLines} alt="decoration" /> */}
      </div>

      <div className={styles.line1}>
        <div className={styles.marqueeContent}>
          {repeatedRow1.map((card, index) => (
            <ExploreThousandCard
              key={`row1-${index}`}
              category={card.category}
              img={card.img}
            />
          ))}
        </div>
      </div>

      <div className={styles.line2}>
        <div className={styles.marqueeContentReverse}>
          {repeatedRow2.map((card, index) => (
            <ExploreThousandCard
              key={`row2-${index}`}
              category={card.category}
              img={card.img}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExploreThousandCommunities;
