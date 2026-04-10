import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { SiTiktok } from 'react-icons/si';
import styles from './Music.module.css';

const LOOP_COPIES = 5;

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

function Music({ texts }) {
  const sliderRef = useRef(null);
  const isAdjustingRef = useRef(false);
  const [activeRenderIndex, setActiveRenderIndex] = useState(0);
  const [tiktokThumbnails, setTiktokThumbnails] = useState({});
  const baseVideos = texts.music.videos;

  const renderedVideos = useMemo(() => Array.from({ length: LOOP_COPIES }, () => baseVideos).flat(), [baseVideos]);

  const nudgeSlider = (direction) => {
    const slider = sliderRef.current;
    if (!slider) return;

    const firstCard = slider.querySelector(`.${styles.verticalCard}`);
    const gap = parseFloat(getComputedStyle(slider).columnGap || getComputedStyle(slider).gap || '24');
    const step = (firstCard ? firstCard.clientWidth : 272) + gap;

    slider.scrollBy({ left: step * direction, behavior: 'smooth' });
  };

  useEffect(() => {
    const tiktokVideos = baseVideos.filter((video) => video.type === 'tiktok');
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
  }, [baseVideos]);

  useEffect(() => {
    const slider = sliderRef.current;
    const groupSize = baseVideos.length;
    if (!slider || groupSize === 0) return;

    const cards = Array.from(slider.querySelectorAll(`.${styles.verticalCard}`));
    if (!cards.length || cards.length < groupSize * 3) return;

    const getLoopWidth = () => cards[groupSize].offsetLeft - cards[0].offsetLeft;

    const findCenteredCard = () => {
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

      setActiveRenderIndex(closest);
    };

    let animationFrameId = null;
    let currentScroll = slider.scrollLeft;
    let targetScroll = slider.scrollLeft;

    const middleIndex = groupSize * Math.floor(LOOP_COPIES / 2) + Math.floor(groupSize / 2);
    const middleCard = cards[middleIndex];
    if (middleCard) {
      slider.scrollTo({
        left: middleCard.offsetLeft - slider.clientWidth / 2 + middleCard.clientWidth / 2,
        behavior: 'auto',
      });
      currentScroll = slider.scrollLeft;
      targetScroll = slider.scrollLeft;
      setActiveRenderIndex(middleIndex);
    }

    const handleScroll = () => {
      const loopWidth = getLoopWidth();
      if (!loopWidth) return;

      const loopShift = loopWidth * Math.floor(LOOP_COPIES / 2);
      const safeMin = loopWidth;
      const safeMax = loopWidth * (LOOP_COPIES - 2);

      if (!isAdjustingRef.current) {
        if (slider.scrollLeft < safeMin) {
          isAdjustingRef.current = true;
          slider.scrollLeft += loopShift;
          currentScroll = slider.scrollLeft;
          targetScroll = slider.scrollLeft;
          requestAnimationFrame(() => {
            isAdjustingRef.current = false;
            findCenteredCard();
          });
          return;
        }

        if (slider.scrollLeft > safeMax) {
          isAdjustingRef.current = true;
          slider.scrollLeft -= loopShift;
          currentScroll = slider.scrollLeft;
          targetScroll = slider.scrollLeft;
          requestAnimationFrame(() => {
            isAdjustingRef.current = false;
            findCenteredCard();
          });
          return;
        }
      }

      findCenteredCard();
    };

    const animateWheelScroll = () => {
      currentScroll += (targetScroll - currentScroll) * 0.18;
      slider.scrollLeft = currentScroll;

      if (Math.abs(targetScroll - currentScroll) > 0.6) {
        animationFrameId = requestAnimationFrame(animateWheelScroll);
      } else {
        currentScroll = targetScroll;
        slider.scrollLeft = currentScroll;
        animationFrameId = null;
      }
    };

    const handleWheel = (event) => {
      const wheelDelta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      if (Math.abs(wheelDelta) < 1.5) return;

      event.preventDefault();
      targetScroll += wheelDelta * 1.12;

      if (!animationFrameId) {
        animationFrameId = requestAnimationFrame(animateWheelScroll);
      }
    };

    findCenteredCard();
    slider.addEventListener('scroll', handleScroll, { passive: true });
    slider.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('resize', handleScroll);

    return () => {
      slider.removeEventListener('scroll', handleScroll);
      slider.removeEventListener('wheel', handleWheel);
      window.removeEventListener('resize', handleScroll);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [baseVideos, renderedVideos, styles.verticalCard]);

  return (
    <motion.main className={styles.music} initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.7 }}>
      <div className={styles.header}>
        <p className={styles.sectionLabel}>03. {texts.music.heading}</p>
        <h2>{texts.music.heading}</h2>
        <p className={styles.descriptionText}>{texts.music.description}</p>
      </div>

      <div className={styles.sliderContainer}>
        <div className={styles.verticalSlider} ref={sliderRef}>
          {renderedVideos.map((video, index) => {
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
                key={`${video.id}-${index}`}
                className={`${styles.verticalCard} ${activeRenderIndex === index ? styles.activeCard : ''}`}
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
                <div className={styles.cardLabel}>{video.title}</div>
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
