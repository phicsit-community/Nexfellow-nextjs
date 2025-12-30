import React from "react";
import styles from "./GetGeeky.module.css";
import illustration1 from "./assets/Illustration1.svg";
import illustration2 from "./assets/Illustration2.svg";

const GetGeeky = () => {
    return (
        <section className={styles.getGeeky}>
            <div className={styles.container}>
                <img
                    src={illustration1}
                    alt="Hand Illustration Left"
                    className={styles.illustrationLeft}
                />
                <div className={styles.content}>
                    <h2>Get geeky with people who get you! Discover people, events, and join communities to supercharge your
                        networking.
                    </h2>
                    <div className={styles.features}>
                        <span>✔ Share Knowledge</span>
                        <span>✔ Learn Together</span>
                        <span>✔ Inspire Innovation</span>
                    </div>
                </div>
                <img
                    src={illustration2}
                    alt="Hand Illustration Right"
                    className={styles.illustrationRight}
                />
            </div>
        </section>
    );
};

export default GetGeeky;
