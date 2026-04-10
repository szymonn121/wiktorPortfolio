import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import BeatMaker from '../components/BeatMaker.jsx';
import styles from './Home.module.css';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

function Home({ texts }) {
  const roles = texts.hero.roles ?? [];
  const [activeRoleIndex, setActiveRoleIndex] = useState(0);

  useEffect(() => {
    if (roles.length <= 1) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setActiveRoleIndex((previousIndex) => (previousIndex + 1) % roles.length);
    }, 3000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [roles.length]);

  const activeRole = roles[activeRoleIndex] ?? '';

  return (
    <motion.main className={styles.home} initial="hidden" animate="visible" exit="hidden" variants={fadeUp} transition={{ duration: 0.8 }}>
      <section className={styles.hero}>
        <div className={styles.heroText}>
          <span className={styles.overline}>Portfolio</span>
          <h1>{texts.hero.greeting}</h1>
          <div className={styles.roleCarousel}>
            <AnimatePresence mode="wait">
              <motion.span
                key={activeRole}
                className={styles.roleCurrent}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -18 }}
                transition={{ duration: 0.55, ease: 'easeInOut' }}
              >
                {activeRole}
              </motion.span>
            </AnimatePresence>
          </div>
          <div className={styles.roleIndicators}>
            {roles.map((role, index) => (
              <span key={role} className={styles.roleDotSlot}>
                <span className={styles.roleDot} />
                {index === activeRoleIndex && (
                  <motion.span
                    layoutId="role-indicator"
                    className={styles.roleDotActive}
                    transition={{ type: 'spring', stiffness: 220, damping: 24, mass: 0.8 }}
                  />
                )}
              </span>
            ))}
          </div>
          <div className={styles.ctaGroup}>
            <Link to="/projects" className={styles.ctaButton}>{texts.hero.buttons.projects}</Link>
            <Link to="/music" className={styles.ctaButtonAlt}>{texts.hero.buttons.music}</Link>
            <Link to="/contact" className={styles.ctaButton}>{texts.hero.buttons.contact}</Link>
          </div>
        </div>
        <div className={styles.heroVisual}>
          <div className={styles.glow} />
        </div>
      </section>

      <section className={styles.beatmakerSection}>
        <BeatMaker texts={texts.homeBeatmaker} />
      </section>
    </motion.main>
  );
}

export default Home;
