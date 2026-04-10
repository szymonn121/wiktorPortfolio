import { motion } from 'framer-motion';
import { FaExternalLinkAlt, FaGithub } from 'react-icons/fa';
import styles from './ProjectCard.module.css';

function ProjectCard({ project }) {
  return (
    <motion.article className={styles.card} whileHover={{ y: -6 }} transition={{ type: 'spring', stiffness: 220 }}>
      <div className={styles.cardHeader}>
        <h3>{project.title}</h3>
        <p>{project.description}</p>
      </div>
      <div className={styles.techList}>
        {project.tech.map((tech) => (
          <span key={tech}>{tech}</span>
        ))}
      </div>
      <div className={styles.linkGroup}>
        <a href={project.github} target="_blank" rel="noreferrer"><FaGithub /> GitHub</a>
        <a href={project.live} target="_blank" rel="noreferrer"><FaExternalLinkAlt /> Live Demo</a>
      </div>
    </motion.article>
  );
}

export default ProjectCard;
