import { motion } from 'framer-motion';
import ProjectCard from '../components/ProjectCard.jsx';
import styles from './Projects.module.css';

function Projects({ texts }) {
  return (
    <motion.main className={styles.projects} initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.7 }}>
      <div className={styles.header}>
        <p className={styles.sectionLabel}>02. {texts.projects.heading}</p>
        <h2>{texts.projects.heading}</h2>
        <p>{texts.projects.description}</p>
      </div>
      <div className={styles.grid}>
        {texts.projects.items.map((project) => (
          <ProjectCard key={project.title} project={project} />
        ))}
      </div>
    </motion.main>
  );
}

export default Projects;
