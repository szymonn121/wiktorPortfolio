import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import About from './pages/About.jsx';
import Projects from './pages/Projects.jsx';
import Music from './pages/Music.jsx';
import Contact from './pages/Contact.jsx';
import content from './data/content.js';
import styles from './App.module.css';

function App() {
  const [isDark, setIsDark] = useState(true);
  const [lang, setLang] = useState('pl');
  const location = useLocation();

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const savedLang = localStorage.getItem('lang');
    if (savedTheme === 'dark' || savedTheme === 'light') {
      setIsDark(savedTheme === 'dark');
    }
    if (savedLang && content[savedLang]) {
      setLang(savedLang);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    localStorage.setItem('lang', lang);
    document.documentElement.dataset.theme = isDark ? 'dark' : 'light';
  }, [isDark, lang]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  const texts = useMemo(() => content[lang] ?? content.pl, [lang]);

  return (
    <div className={styles.app}>
      <Navbar isDark={isDark} setIsDark={setIsDark} lang={lang} setLang={setLang} texts={texts} />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home texts={texts} />} />
          <Route path="/about" element={<About texts={texts} />} />
          <Route path="/projects" element={<Projects texts={texts} />} />
          <Route path="/music" element={<Music texts={texts} />} />
          <Route path="/contact" element={<Contact texts={texts} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
      <Footer />
    </div>
  );
}

export default App;
