import React, { useRef } from "react";
import styles from "./CreatorsWho.module.css";

// images
import twoLines from "./assets/twoLines.webp";
import leftArrow from "./assets/leftArrow.webp";
import rightArrow from "./assets/rightArrow.webp";

import creator1 from "./assets/Ishita Raina.webp";
import creator2 from "./assets/Griffin Clive.webp";
import creator3 from "./assets/Minah Jeon.webp";
import creator4 from "./assets/Harvey Leon.webp";
import creator5 from "./assets/Jessica Wilson.webp";
// components
import CreatorCard from "./CreatorCard";

const CreatorsWho = () => {
  const cardsContainerRef = useRef();

  const scrollLeft = () => {
    if (cardsContainerRef.current) {
      console.log("Scrolling left");
      cardsContainerRef.current.scrollBy({ left: -300, behavior: "smooth" });
    } else {
      console.error("cardsContainerRef is null");
    }
  };

  const scrollRight = () => {
    if (cardsContainerRef.current) {
      console.log("Scrolling right");
      cardsContainerRef.current.scrollBy({ left: 300, behavior: "smooth" });
    } else {
      console.error("cardsContainerRef is null");
    }
  };

  return (
    <div className={styles.container}>
      <div>
        <div className={styles.heading}>
          <span className={styles.creators}>Creators</span>
          <span className={styles.remaining}> Who Inspire</span>
        </div>
        {/* <img src={twoLines} className={styles.twoLineImg} /> */}
      </div>
      <div className={styles.content}>
        Our top creators are the heartbeat of our community, pushing boundaries
        and exploring new ideas.
      </div>
      <div className={styles.cards} ref={cardsContainerRef}>
        <CreatorCard
          img={creator1.src || creator1}
          name="Ishita Raina"
          designation="Web Developer"
        />
        <CreatorCard
          img={creator2.src || creator2}
          name="Griffin Clive"
          designation="Investor"
        />
        <CreatorCard
          img={creator3.src || creator3}
          name="Minah Jeon"
          designation="Data Scientist"
        />
        <CreatorCard
          img={creator4.src || creator4}
          name="Harvey Leon"
          designation="Businessman"
        />
        <CreatorCard
          img={creator5.src || creator5}
          name="Jessica Wilson"
          designation="Content Creator"
        />
      </div>
      <div className={styles.moveLeftRightDiv}>
        <img src={leftArrow.src || leftArrow} onClick={scrollLeft} alt="scroll-left" />
        <img src={rightArrow.src || rightArrow} onClick={scrollRight} alt="scroll-right" />
      </div>
    </div>
  );
};

export default CreatorsWho;
