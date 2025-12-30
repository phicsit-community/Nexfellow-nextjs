import React from "react";
import styles from "./ContactCTA.module.css";
import desktopBG from "./assets/cta-desktop.webp";
import mobileBG from "./assets/cta-mobile.webp";

const ContactCTA = () => {
  return (
    <section className={styles.contactSection}>
      <div
        className={styles.background}
        style={{ backgroundImage: `url(${desktopBG})` }}
      />
      <div
        className={styles.backgroundMobile}
        style={{ backgroundImage: `url(${mobileBG})` }}
      />

      <div className={styles.contentWrapper}>
        <h2 className={styles.title}>
          Just send us your contact email <br />
          and we will contact you.
        </h2>
        <p className={styles.description}>
          Subscribe for exclusive updates and community news.
        </p>
        <div className={styles.inputWrapper}>
          <input
            type="email"
            placeholder="Email"
            className={styles.emailInput}
          />
          <button className={styles.subscribeButton}>Subscribe</button>
        </div>
      </div>
    </section>
  );
};

export default ContactCTA;
