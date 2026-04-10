import { FaInstagram, FaYoutube } from 'react-icons/fa';
import { SiTiktok } from 'react-icons/si';
import styles from './Footer.module.css';

function Footer() {
  return (
    <footer className={styles.footer}>
      <p className={styles.copy}>© 2026 Wiktor Jaśkiewicz</p>
      <div className={styles.socials}>
        <a
          href="https://www.instagram.com/___viking.__?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
          target="_blank"
          rel="noreferrer noopener"
          aria-label="Instagram"
          title="Instagram"
        >
          <FaInstagram />
        </a>
        <a
          href="https://youtube.com/@wiktor_drums?si=V4x3RhgZ8xv69YHb"
          target="_blank"
          rel="noreferrer noopener"
          aria-label="YouTube"
          title="YouTube"
        >
          <FaYoutube />
        </a>
        <a
          href="https://www.tiktok.com/@fourtheye5?is_from_webapp=1&sender_device=pc"
          target="_blank"
          rel="noreferrer noopener"
          aria-label="TikTok"
          title="TikTok"
        >
          <SiTiktok />
        </a>
      </div>
    </footer>
  );
}

export default Footer;
