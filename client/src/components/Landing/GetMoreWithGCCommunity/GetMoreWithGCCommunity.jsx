import React from "react";
import styles from "./GetMoreWithCommunity.module.css";
import featureData from "./featureData";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const GetMoreWithCommunity = () => {
  return (
    <section className={styles.featuresSection}>
      <h2 className={styles.heading}>
        Get More With NexFellow
        <span className={styles.highlight}> Communities</span>
      </h2>
      <p className={styles.description}>
        Empowering a new generation of creators and professionals to build,
        grow, and lead through collaboration and smart tools.
      </p>

      <div className={styles.featuresGrid}>
        {featureData.map((feature, index) => (
          <div className={styles.featureCard} key={index}>
            <div className={styles.textContent}>
              <div className={styles.featureTag}>{feature.tag}</div>
              <h3 className={styles.featureTitle}>{feature.title}</h3>
              <p className={styles.featureDesc}>{feature.description}</p>
              <ul className={styles.featureList}>
                {feature.points.map((point, i) => (
                  <li key={i}>
                    {/* <div className="h-3 w-3 bg-amber-50 rounded-full" /> */}
                    {point}
                  </li>
                ))}
              </ul>
              <Link to={`/signup`} asChild>
                <button className={styles.getStartedBtn}>
                  Get Started{" "}
                  <span className="flex items-center justify-center aspect-square">
                    <ArrowRight className="h-5 w-5" />
                  </span>
                </button>
              </Link>
            </div>
            <div
              className={`${styles.featureImage} ${
                styles[feature.customClass]
              }`}
            >
              <div className={styles.imageWrapper}>
                <img src={feature.image} alt={feature.tag} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default GetMoreWithCommunity;
