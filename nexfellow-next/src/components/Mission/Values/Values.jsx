import styles from './Values.module.css';
import reward from './assets/reward.svg';
import heart from './assets/heart.svg';
import shield from './assets/shield.svg';
import creative from './assets/creative.svg';
import share from './assets/share.svg';
import timer from './assets/timer.svg';

const Values = () => {
  const values = [
    {
      icon: share.src || share,
      title: 'Community First',
      description: `We believe communities are the foundation of meaningful progress. Every feature we build is designed to empower collective growth and collaboration.`
    },
    {
      icon: creative.src || creative,
      title: 'Innovation with Purpose',
      description: `Innovation isn't just about what's new, it's about what's needed. We build with purpose, constantly evolving to meet the real needs of our growing user base.`
    },
    {
      icon: timer.src || timer,
      title: 'Action-Oriented',
      description: `Ideas are only powerful when acted upon. We encourage users to take initiative, launch projects, start discussions, and make real change happen.`
    },
    {
      icon: shield.src || shield,
      title: 'Agility and Adaptability',
      description: `The world is changing fast, and so are we. We're committed to iterating, adapting, and evolving based on the needs of our users and the communities they build.`
    },
    {
      icon: reward.src || reward,
      title: 'Supportive by Default',
      description: `From students to startups, we champion a culture of encouragement, where it's safe to ask for help and brave to offer it.`
    },
    {
      icon: heart.src || heart,
      title: 'Inclusivity & Diversity',
      description: `Great ideas can come from anywhere. We're creating an environment where every voice is heard, every background is respected, and every user has a place to belong.`
    }
  ];

  return (
    <section className={styles.container}>
      <h2 className={styles.title}>Our Values</h2>
      <div className={styles.grid}>
        {values.map((value, index) => (
          <div key={index} className={styles.card}>
            <img src={value.icon} className={styles.icon} />
            <h3 className={styles.cardTitle}>{value.title}</h3>
            <p className={styles.description}>{value.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Values;