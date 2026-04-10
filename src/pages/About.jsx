import { motion } from 'framer-motion';
import styles from './About.module.css';

const fadeIn = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

function About({ texts }) {
  return (
    <motion.main className={styles.about} initial="hidden" animate="visible" exit="hidden" variants={fadeIn} transition={{ duration: 0.7 }}>
      <section className={styles.intro}>
        <div>
          <p className={styles.sectionLabel}>01. {texts.about.heading}</p>
          <h2>{texts.about.heading}</h2>
          <p>{texts.about.bio}</p>
          <p>{texts.about.passion}</p>
        </div>
      </section>
      <section className={styles.skillsSection}>
        <div className={styles.card}>
          <h3>{texts.about.storyTitle}</h3>
          <p>{texts.about.story}</p>
        </div>
        <div className={styles.card}> 
          <h3>Skills</h3>
          <div className={styles.skillsGrid}>
            {texts.about.skills.map((skill) => (
              <span key={skill} className={styles.skill}>{skill}</span>
            ))}
          </div>
        </div>
      </section>
    </motion.main>
  );
}

export default About;
