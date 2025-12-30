import React from 'react';
import styles from './GetMoreWithCommunity.module.css';
import target from './assets/target.svg';
import light from './assets/light.svg';

const GetMoreWithCommunity = () => {
  const sections = [
    {
      title: "Mission",
      description: `In 2025, success isn’t built alone. It begins and grows within communities. NexFellow is on a mission to empower students, startups, and businesses to create, grow, and monetize powerful communities. As the world becomes more digitally connected yet personally distant, we believe meaningful collaboration is the key to unlocking growth. NexFellow provides the tools, network, and guidance to build thriving spaces where ideas flourish, careers accelerate, and innovation comes alive.`,
      isReversed: false
    },
    {
      title: "Vision",
      description: `Our vision is to spark one million vibrant virtual communities that are driven by shared purpose, innovative thinking, and a commitment to progress. These communities will become ecosystems where ideas are nurtured, meaningful connections are made, and opportunities are unlocked for everyone, regardless of background, geography, or experience. NexFellow is introducing a new era of partnership where people do not just network; instead, they build together. This is because the future is not just something that happens; it is built by communities coming together with purpose, passion, and vision.`,
      isReversed: true
    }
  ];

  return (
    <section className={styles.featuresSection}>
      <div className={styles.whyweexist}>
        <h2 className={styles.mainTitle}>Why we exist?</h2>
        <p className={styles.subText}>"Students have incredible potential, but often lack the right resources and connections to succeed. Startups need visibility and support to scale. Our platform bridges this gap — empowering students and startups to grow together."</p>
      </div>
      {sections.map((section, index) => (
        <div className={`${styles.featureCard} ${section.isReversed ? styles.reversed : ''}`} key={index}>
          {!section.isReversed ? (
            <>
              <div className={styles.imageContent}>
                <h2 className={styles.title}>{section.title}</h2>
                <div className={styles.imageWrapper}>
                  <img
                    src={target}
                    alt={`${section.title} icon`}
                    className={styles.featureImage}
                  />
                </div>
              </div>
              <div className={styles.textContent}>
                <p style={{ whiteSpace: 'pre-line' }} className={styles.description}>{section.description}</p>
              </div>
            </>
          ) : (
            <>
              <div className={styles.textContent}>
                <p style={{ whiteSpace: 'pre-line' }} className={styles.description}>{section.description}</p>
              </div>
              <div className={styles.imageContentReverse}>
                <h2 className={styles.titleReverse}>{section.title}</h2>
                <div className={styles.imageWrapper}>
                  <img
                    src={light}
                    alt={`${section.title} icon`}
                    className={styles.featureImage}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      ))}
    </section>
  );
};

export default GetMoreWithCommunity;
