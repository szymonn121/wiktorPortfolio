import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { FaBars, FaMoon, FaSun, FaTimes } from 'react-icons/fa';
import styles from './Navbar.module.css';

function Navbar({ isDark, setIsDark, lang, setLang, texts }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const themeLabel = isDark ? texts.theme.light : texts.theme.dark;
  const menuLabel = isMenuOpen ? 'Close menu' : 'Open menu';

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  return (
    <header className={styles.navbar}>
      <button
        type="button"
        className={styles.menuButton}
        aria-label={menuLabel}
        aria-expanded={isMenuOpen}
        aria-controls="main-navigation"
        onClick={() => setIsMenuOpen((current) => !current)}
      >
        {isMenuOpen ? <FaTimes /> : <FaBars />}
      </button>

      <nav id="main-navigation" className={isMenuOpen ? `${styles.navigation} ${styles.navigationOpen}` : styles.navigation}>
        {texts.nav.map((item, index) => {
          const path = ['/', '/about', '/projects', '/music', '/contact'][index];
          return (
            <NavLink
              key={item}
              to={path}
              className={({ isActive }) => (isActive ? styles.active : '')}
              onClick={() => setIsMenuOpen(false)}
            >
              {item}
            </NavLink>
          );
        })}
      </nav>
      <div className={styles.actions}>
        <button
          type="button"
          className={styles.themeButton}
          onClick={() => setIsDark((current) => !current)}
          aria-label={themeLabel}
          title={themeLabel}
        >
          {isDark ? <FaSun /> : <FaMoon />}
        </button>
        <select className={styles.langSelect} value={lang} onChange={(event) => setLang(event.target.value)}>
          <option value="pl">{texts.language.pl}</option>
          <option value="en">{texts.language.en}</option>
        </select>
      </div>
    </header>
  );
}

export default Navbar;
