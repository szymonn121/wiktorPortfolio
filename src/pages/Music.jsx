import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { SiTiktok } from 'react-icons/si';
import styles from './Music.module.css';

const AUTO_SCROLL_INTERVAL = 5200;
const AUTO_RESUME_DELAY = 2800;

const instagramImages = {
  DVrOg9kjuFu: '/assets/images/change.png',
  'DRP-4FDjic6': '/assets/images/parabola.png',
  DVWaLELDEMG: '/assets/images/everlong.png',
};

const youtubeImages = {
  'poiQgdyh-OY': 'https://img.youtube.com/vi/poiQgdyh-OY/hqdefault.jpg',
  zqhT7LVwZaY: 'https://img.youtube.com/vi/zqhT7LVwZaY/hqdefault.jpg',
  'O09qlpH-ooU': 'https://img.youtube.com/vi/O09qlpH-ooU/hqdefault.jpg',
};

function wrapIndex(index, length) {
  if (!length) return 0;
  return ((index % length) + length) % length;
}

function Music({ texts }) {
  const sliderRef = useRef(null);
  const autoIntervalRef = useRef(null);
  const resumeTimeoutRef = useRef(null);
  const scrollTimeoutRef = useRef(null);
  const activeIndexRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [tiktokThumbnails, setTiktokThumbnails] = useState({});
  const videos = texts.music.videos ?? [];

  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  const alignToIndex = useCallback(
    (index, behavior = 'smooth') => {
      const slider = sliderRef.current;
      if (!slider || videos.length === 0) return;

      const normalized = wrapIndex(index, videos.length);
      const cards = slider.querySelectorAll(`.${styles.verticalCard}`);
      const targetCard = cards[normalized];
      if (!targetCard) return;

      const targetLeft = targetCard.offsetLeft - (slider.clientWidth - targetCard.clientWidth) / 2;
      slider.scrollTo({ left: Math.max(0, targetLeft), behavior });

      activeIndexRef.current = normalized;
      setActiveIndex(normalized);
    },
    [styles.verticalCard, videos.length]
  );

  const stopAutoScroll = useCallback(() => {
    if (autoIntervalRef.current) {
      window.clearInterval(autoIntervalRef.current);
      autoIntervalRef.current = null;
    }
  }, []);

  const startAutoScroll = useCallback(() => {
    stopAutoScroll();
    if (videos.length <= 1) return;

    autoIntervalRef.current = window.setInterval(() => {
      const current = activeIndexRef.current;
      const next = current + 1 >= videos.length ? 0 : current + 1;
      alignToIndex(next, next === 0 ? 'auto' : 'smooth');
    }, AUTO_SCROLL_INTERVAL);
  }, [alignToIndex, stopAutoScroll, videos.length]);

  const postponeAutoScroll = useCallback(() => {
    stopAutoScroll();
    if (resumeTimeoutRef.current) {
      window.clearTimeout(resumeTimeoutRef.current);
    }
    if (videos.length <= 1) return;

    resumeTimeoutRef.current = window.setTimeout(() => {
      startAutoScroll();
    }, AUTO_RESUME_DELAY);
  }, [startAutoScroll, stopAutoScroll, videos.length]);

  const nudgeSlider = (direction) => {
    if (!videos.length) return;
    postponeAutoScroll();

    const current = activeIndexRef.current;
    const next = wrapIndex(current + direction, videos.length);
    const wrapsForward = direction > 0 && current === videos.length - 1;
    const wrapsBackward = direction < 0 && current === 0;

    alignToIndex(next, wrapsForward || wrapsBackward ? 'auto' : 'smooth');
  };

  useEffect(() => {
    const tiktokVideos = videos.filter((video) => video.type === 'tiktok');
    if (!tiktokVideos.length) return;

    let isCancelled = false;

    const fetchThumbnails = async () => {
      const results = await Promise.all(
        tiktokVideos.map(async (video) => {
          try {
            const tiktokUrl = `https://www.tiktok.com/@fourtheye5/video/${video.id}`;
            const oembedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(tiktokUrl)}`;
            const response = await fetch(oembedUrl);
            if (!response.ok) return [video.id, null];
            const data = await response.json();
            return [video.id, data.thumbnail_url || null];
          } catch {
            return [video.id, null];
          }
        })
      );

      if (isCancelled) return;

      setTiktokThumbnails((previous) => {
        const next = { ...previous };
        results.forEach(([id, thumbnail]) => {
          if (thumbnail) next[id] = thumbnail;
        });
        return next;
      });
    };

    fetchThumbnails();

    return () => {
      isCancelled = true;
    };
  }, [videos]);

  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider || videos.length === 0) return;

    const findCenteredCard = () => {
      const cards = Array.from(slider.querySelectorAll(`.${styles.verticalCard}`));
      if (!cards.length) return;

      const sliderRect = slider.getBoundingClientRect();
      const sliderCenter = sliderRect.left + sliderRect.width / 2;

      let closest = 0;
      let minDistance = Number.POSITIVE_INFINITY;

      cards.forEach((card, index) => {
        const rect = card.getBoundingClientRect();
        const cardCenter = rect.left + rect.width / 2;
        const distance = Math.abs(cardCenter - sliderCenter);

        if (distance < minDistance) {
          minDistance = distance;
          closest = index;
        }
      });

      activeIndexRef.current = closest;
      setActiveIndex(closest);
    };

    const handleScroll = () => {
      if (scrollTimeoutRef.current) {
        window.clearTimeout(scrollTimeoutRef.current);
      }

      scrollTimeoutRef.current = window.setTimeout(findCenteredCard, 80);
    };

    const handlePointerDown = () => {
      postponeAutoScroll();
    };

    const handlePointerUp = () => {
      postponeAutoScroll();
    };

    const handleMouseEnter = () => {
      stopAutoScroll();
    };

    const handleMouseLeave = () => {
      startAutoScroll();
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopAutoScroll();
        return;
      }
      startAutoScroll();
    };

    const rafId = window.requestAnimationFrame(() => {
      alignToIndex(activeIndexRef.current, 'auto');
      findCenteredCard();
    });

    slider.addEventListener('scroll', handleScroll, { passive: true });
    slider.addEventListener('pointerdown', handlePointerDown, { passive: true });
    slider.addEventListener('pointerup', handlePointerUp, { passive: true });
    slider.addEventListener('mouseenter', handleMouseEnter);
    slider.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('resize', findCenteredCard);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    startAutoScroll();

    return () => {
      slider.removeEventListener('scroll', handleScroll);
      slider.removeEventListener('pointerdown', handlePointerDown);
      slider.removeEventListener('pointerup', handlePointerUp);
      slider.removeEventListener('mouseenter', handleMouseEnter);
      slider.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', findCenteredCard);
      document.removeEventListener('visibilitychange', handleVisibilityChange);

      window.cancelAnimationFrame(rafId);
      if (scrollTimeoutRef.current) {
        window.clearTimeout(scrollTimeoutRef.current);
      }
      if (resumeTimeoutRef.current) {
        window.clearTimeout(resumeTimeoutRef.current);
      }
      stopAutoScroll();
    };
  }, [alignToIndex, postponeAutoScroll, startAutoScroll, stopAutoScroll, videos.length]);

  return (
    <motion.main className={styles.music} initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.7 }}>
      <div className={styles.header}>
        <p className={styles.sectionLabel}>03. {texts.music.heading}</p>
        <h2>{texts.music.heading}</h2>
        <p className={styles.descriptionText}>{texts.music.description}</p>
      </div>

      <div className={styles.sliderContainer}>
        <div className={styles.verticalSlider} ref={sliderRef}>
          {videos.map((video, index) => {
            let href = '';
            let imageUrl = null;

            if (video.type === 'instagram') {
              href = `https://www.instagram.com/reel/${video.id}/`;
              imageUrl = instagramImages[video.id] || null;
            } else if (video.type === 'tiktok') {
              href = `https://www.tiktok.com/@fourtheye5/video/${video.id}`;
              imageUrl = tiktokThumbnails[video.id] || null;
            } else {
              href = `https://youtube.com/watch?v=${video.id}`;
              imageUrl = youtubeImages[video.id] || null;
            }

            return (
              <motion.a
                key={video.id}
                className={`${styles.verticalCard} ${activeIndex === index ? styles.activeCard : ''}`}
                href={href}
                target="_blank"
                rel="noreferrer noopener"
                transition={{ type: 'spring', stiffness: 280, damping: 24 }}
              >
                {imageUrl ? (
                  <img className={styles.thumbnail} src={imageUrl} alt={video.title} />
                ) : (
                  <div className={styles.tiktokPlaceholder}>
                    <SiTiktok />
                    <span>TikTok</span>
                  </div>
                )}
              </motion.a>
            );
          })}
        </div>

        <div className={styles.swipeControls}>
          <button type="button" className={styles.swipeButton} onClick={() => nudgeSlider(-1)} aria-label="Previous video">
            <FaChevronLeft />
          </button>
          <button type="button" className={styles.swipeButton} onClick={() => nudgeSlider(1)} aria-label="Next video">
            <FaChevronRight />
          </button>
        </div>
      </div>
    </motion.main>
  );
}

export default Music;
