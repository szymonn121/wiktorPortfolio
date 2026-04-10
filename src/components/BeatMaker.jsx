import { useEffect, useMemo, useRef, useState } from 'react';
import styles from './BeatMaker.module.css';

const STEP_COUNT = 16;
const SECRET_TRACK_INDEX = 4;

const BASE_TRACKS = [
  { key: 'kick', color: '124, 92, 255' },
  { key: 'snare', color: '56, 189, 248' },
  { key: 'clap', color: '251, 146, 60' },
  { key: 'hat', color: '16, 185, 129' },
  { key: 'pipe', color: '148, 163, 184' },
];

const DEFAULT_PATTERN = [
  [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false],
  [false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false],
  [false, false, false, false, false, false, true, false, false, false, false, false, false, false, true, false],
  [true, false, true, false, true, false, true, true, true, false, true, false, true, false, true, true],
  Array(STEP_COUNT).fill(false),
];

function hasUnlockGroove(pattern) {
  const kick = pattern[0] ?? [];
  const snare = pattern[1] ?? [];
  const hat = pattern[3] ?? [];

  const matchesExactSteps = (track, requiredSteps) =>
    Array.from({ length: STEP_COUNT }, (_, index) => index).every(
      (index) => Boolean(track[index]) === requiredSteps.includes(index)
    );

  const kickGroove = matchesExactSteps(kick, [0, 8]);
  const snareGroove = matchesExactSteps(snare, [4, 12]);
  const hatGroove = matchesExactSteps(hat, [0, 2, 4, 6, 8, 10, 12, 14]);

  return kickGroove && snareGroove && hatGroove;
}

function createNoiseBuffer(audioContext, durationInSeconds = 0.25) {
  const length = Math.floor(audioContext.sampleRate * durationInSeconds);
  const buffer = audioContext.createBuffer(1, length, audioContext.sampleRate);
  const data = buffer.getChannelData(0);

  for (let index = 0; index < length; index += 1) {
    data[index] = Math.random() * 2 - 1;
  }

  return buffer;
}

function playKick(audioContext, when) {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(150, when);
  oscillator.frequency.exponentialRampToValueAtTime(48, when + 0.13);

  gainNode.gain.setValueAtTime(0.0001, when);
  gainNode.gain.exponentialRampToValueAtTime(0.95, when + 0.006);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, when + 0.2);

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  oscillator.start(when);
  oscillator.stop(when + 0.22);
}

function playSnare(audioContext, noiseBuffer, when) {
  const noiseSource = audioContext.createBufferSource();
  const noiseFilter = audioContext.createBiquadFilter();
  const noiseGain = audioContext.createGain();

  noiseSource.buffer = noiseBuffer;
  noiseFilter.type = 'highpass';
  noiseFilter.frequency.setValueAtTime(1800, when);

  noiseGain.gain.setValueAtTime(0.0001, when);
  noiseGain.gain.exponentialRampToValueAtTime(0.6, when + 0.002);
  noiseGain.gain.exponentialRampToValueAtTime(0.0001, when + 0.14);

  noiseSource.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(audioContext.destination);

  const bodyOscillator = audioContext.createOscillator();
  const bodyGain = audioContext.createGain();

  bodyOscillator.type = 'triangle';
  bodyOscillator.frequency.setValueAtTime(220, when);
  bodyOscillator.frequency.exponentialRampToValueAtTime(110, when + 0.1);

  bodyGain.gain.setValueAtTime(0.0001, when);
  bodyGain.gain.exponentialRampToValueAtTime(0.3, when + 0.002);
  bodyGain.gain.exponentialRampToValueAtTime(0.0001, when + 0.1);

  bodyOscillator.connect(bodyGain);
  bodyGain.connect(audioContext.destination);

  noiseSource.start(when);
  noiseSource.stop(when + 0.16);
  bodyOscillator.start(when);
  bodyOscillator.stop(when + 0.12);
}

function playClap(audioContext, noiseBuffer, when) {
  const noiseSource = audioContext.createBufferSource();
  const noiseFilter = audioContext.createBiquadFilter();
  const gainNode = audioContext.createGain();

  noiseSource.buffer = noiseBuffer;
  noiseFilter.type = 'bandpass';
  noiseFilter.frequency.setValueAtTime(1500, when);
  noiseFilter.Q.setValueAtTime(0.8, when);

  gainNode.gain.setValueAtTime(0.0001, when);
  gainNode.gain.exponentialRampToValueAtTime(0.8, when + 0.002);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, when + 0.03);
  gainNode.gain.exponentialRampToValueAtTime(0.5, when + 0.035);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, when + 0.065);
  gainNode.gain.exponentialRampToValueAtTime(0.35, when + 0.07);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, when + 0.12);

  noiseSource.connect(noiseFilter);
  noiseFilter.connect(gainNode);
  gainNode.connect(audioContext.destination);

  noiseSource.start(when);
  noiseSource.stop(when + 0.14);
}

function playHat(audioContext, noiseBuffer, when) {
  const noiseSource = audioContext.createBufferSource();
  const noiseFilter = audioContext.createBiquadFilter();
  const gainNode = audioContext.createGain();

  noiseSource.buffer = noiseBuffer;
  noiseFilter.type = 'highpass';
  noiseFilter.frequency.setValueAtTime(6000, when);

  gainNode.gain.setValueAtTime(0.0001, when);
  gainNode.gain.exponentialRampToValueAtTime(0.38, when + 0.001);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, when + 0.07);

  noiseSource.connect(noiseFilter);
  noiseFilter.connect(gainNode);
  gainNode.connect(audioContext.destination);

  noiseSource.start(when);
  noiseSource.stop(when + 0.08);
}

function playMetalPipe(audioContext, noiseBuffer, when) {
  const strikeNoise = audioContext.createBufferSource();
  const strikeFilter = audioContext.createBiquadFilter();
  const strikeGain = audioContext.createGain();

  strikeNoise.buffer = noiseBuffer;
  strikeFilter.type = 'highpass';
  strikeFilter.frequency.setValueAtTime(2200, when);

  strikeGain.gain.setValueAtTime(0.0001, when);
  strikeGain.gain.exponentialRampToValueAtTime(0.4, when + 0.001);
  strikeGain.gain.exponentialRampToValueAtTime(0.0001, when + 0.09);

  strikeNoise.connect(strikeFilter);
  strikeFilter.connect(strikeGain);
  strikeGain.connect(audioContext.destination);

  const metallicFilter = audioContext.createBiquadFilter();
  const metallicGain = audioContext.createGain();

  metallicFilter.type = 'bandpass';
  metallicFilter.frequency.setValueAtTime(1700, when);
  metallicFilter.Q.setValueAtTime(0.65, when);

  metallicGain.gain.setValueAtTime(0.0001, when);
  metallicGain.gain.exponentialRampToValueAtTime(0.34, when + 0.003);
  metallicGain.gain.exponentialRampToValueAtTime(0.0001, when + 0.92);

  metallicFilter.connect(metallicGain);
  metallicGain.connect(audioContext.destination);

  const frequencies = [510, 805, 1315];
  const oscillators = frequencies.map((frequency, index) => {
    const oscillator = audioContext.createOscillator();
    oscillator.type = index === 0 ? 'triangle' : 'sine';
    oscillator.frequency.setValueAtTime(frequency, when);
    oscillator.detune.setValueAtTime((index - 1) * 7, when);
    oscillator.connect(metallicFilter);
    oscillator.start(when);
    oscillator.stop(when + 0.95);
    return oscillator;
  });

  strikeNoise.start(when);
  strikeNoise.stop(when + 0.1);

  return oscillators;
}

function BeatMaker({ texts }) {
  const [pattern, setPattern] = useState(() => DEFAULT_PATTERN.map((track) => [...track]));
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState(104);
  const [activeStep, setActiveStep] = useState(-1);
  const [isPipeUnlocked, setIsPipeUnlocked] = useState(false);
  const [showUnlockMessage, setShowUnlockMessage] = useState(false);

  const audioContextRef = useRef(null);
  const noiseBufferRef = useRef(null);
  const loopRef = useRef(null);
  const stepRef = useRef(0);
  const patternRef = useRef(pattern);

  const labels = {
    badge: texts?.badge ?? 'Mini game',
    title: texts?.title ?? 'Beatmaker',
    description: texts?.description ?? 'Build your own rhythm pattern and press play.',
    controls: {
      play: texts?.controls?.play ?? 'Play',
      stop: texts?.controls?.stop ?? 'Stop',
      clear: texts?.controls?.clear ?? 'Clear',
      random: texts?.controls?.random ?? 'Randomize',
      bpm: texts?.controls?.bpm ?? 'BPM',
    },
    easter: {
      unlockedMessage: texts?.easter?.unlockedMessage ?? 'Easter egg unlocked: Metal pipe sound.',
    },
    tracks: {
      kick: texts?.tracks?.kick ?? 'Kick',
      snare: texts?.tracks?.snare ?? 'Snare',
      clap: texts?.tracks?.clap ?? 'Clap',
      hat: texts?.tracks?.hat ?? 'Hi-hat',
      pipe: texts?.tracks?.pipe ?? 'Metal pipe',
    },
  };

  const tracks = useMemo(
    () =>
      BASE_TRACKS.map((track) => ({
        ...track,
        label: labels.tracks[track.key],
      })),
    [labels.tracks.clap, labels.tracks.hat, labels.tracks.kick, labels.tracks.pipe, labels.tracks.snare]
  );

  const visibleTracks = isPipeUnlocked ? tracks : tracks.slice(0, SECRET_TRACK_INDEX);

  useEffect(() => {
    patternRef.current = pattern;
  }, [pattern]);

  useEffect(() => {
    if (!showUnlockMessage) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setShowUnlockMessage(false);
    }, 3400);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [showUnlockMessage]);

  const ensureAudioContext = () => {
    if (typeof window === 'undefined') {
      return null;
    }

    const BrowserAudioContext = window.AudioContext || window.webkitAudioContext;
    if (!BrowserAudioContext) {
      return null;
    }

    if (!audioContextRef.current) {
      audioContextRef.current = new BrowserAudioContext();
    }

    if (!noiseBufferRef.current) {
      noiseBufferRef.current = createNoiseBuffer(audioContextRef.current);
    }

    return audioContextRef.current;
  };

  const triggerSound = (trackKey, audioContext, when) => {
    if (!noiseBufferRef.current) {
      return;
    }

    if (trackKey === 'kick') {
      playKick(audioContext, when);
      return;
    }

    if (trackKey === 'snare') {
      playSnare(audioContext, noiseBufferRef.current, when);
      return;
    }

    if (trackKey === 'clap') {
      playClap(audioContext, noiseBufferRef.current, when);
      return;
    }

    if (trackKey === 'pipe') {
      playMetalPipe(audioContext, noiseBufferRef.current, when);
      return;
    }

    playHat(audioContext, noiseBufferRef.current, when);
  };

  useEffect(() => {
    if (!isPlaying) {
      if (loopRef.current) {
        window.clearInterval(loopRef.current);
        loopRef.current = null;
      }
      setActiveStep(-1);
      stepRef.current = 0;
      return undefined;
    }

    const audioContext = ensureAudioContext();
    if (!audioContext) {
      return undefined;
    }

    if (audioContext.state === 'suspended') {
      audioContext.resume().catch(() => {
        setIsPlaying(false);
      });
    }

    const intervalInMilliseconds = ((60 / bpm) / 4) * 1000;

    const tick = () => {
      const currentStep = stepRef.current;
      const when = audioContext.currentTime + 0.01;

      patternRef.current.forEach((trackPattern, trackIndex) => {
        if (trackPattern[currentStep]) {
          triggerSound(tracks[trackIndex].key, audioContext, when);
        }
      });

      setActiveStep(currentStep);
      stepRef.current = (currentStep + 1) % STEP_COUNT;
    };

    tick();
    loopRef.current = window.setInterval(tick, intervalInMilliseconds);

    return () => {
      if (loopRef.current) {
        window.clearInterval(loopRef.current);
        loopRef.current = null;
      }
    };
  }, [bpm, isPlaying, tracks]);

  const toggleStep = (trackIndex, stepIndex) => {
    setPattern((previousPattern) =>
      previousPattern.map((trackPattern, currentTrackIndex) =>
        trackPattern.map((isEnabled, currentStepIndex) => {
          if (currentTrackIndex !== trackIndex || currentStepIndex !== stepIndex) {
            return isEnabled;
          }
          return !isEnabled;
        })
      )
    );
  };

  const handlePlayToggle = async () => {
    if (!isPipeUnlocked && hasUnlockGroove(patternRef.current)) {
      setIsPipeUnlocked(true);
      setShowUnlockMessage(true);
    }

    if (!isPlaying) {
      const audioContext = ensureAudioContext();
      if (audioContext?.state === 'suspended') {
        try {
          await audioContext.resume();
        } catch {
          return;
        }
      }
    }

    setIsPlaying((previousValue) => !previousValue);
  };

  const handleClear = () => {
    setPattern((previousPattern) => previousPattern.map((trackPattern) => trackPattern.map(() => false)));
  };

  const handleRandomize = () => {
    setPattern((previousPattern) =>
      previousPattern.map((trackPattern, trackIndex) =>
        trackPattern.map((_, stepIndex) => {
          if (trackIndex === SECRET_TRACK_INDEX && !isPipeUnlocked) {
            return false;
          }

          const baseChance = trackIndex === 0 ? 0.3 : trackIndex === 3 ? 0.45 : trackIndex === SECRET_TRACK_INDEX ? 0.2 : 0.24;
          const pulseBoost = stepIndex % 4 === 0 ? 0.22 : 0;
          return Math.random() < baseChance + pulseBoost;
        })
      )
    );
  };

  const getStepClassName = (isEnabled, isCurrentStep) => {
    if (isEnabled && isCurrentStep) {
      return `${styles.stepButton} ${styles.stepButtonOn} ${styles.stepButtonCurrent}`;
    }
    if (isEnabled) {
      return `${styles.stepButton} ${styles.stepButtonOn}`;
    }
    if (isCurrentStep) {
      return `${styles.stepButton} ${styles.stepButtonCurrent}`;
    }
    return styles.stepButton;
  };

  return (
    <section className={styles.beatmaker} aria-label={labels.title}>
      <header className={styles.header}>
        <span className={styles.badge}>{labels.badge}</span>
        <h2>{labels.title}</h2>
        <p>{labels.description}</p>
      </header>

      <div className={styles.board}>
        {visibleTracks.map((track, trackIndex) => (
          <div key={track.key} className={styles.trackRow}>
            <div className={styles.trackLabelWrap}>
              <span className={styles.trackDot} style={{ '--step-rgb': track.color }} aria-hidden="true" />
              <span className={styles.trackLabel}>{track.label}</span>
            </div>

            <div className={styles.stepGrid}>
              {pattern[trackIndex].map((isEnabled, stepIndex) => (
                <button
                  key={`${track.key}-${stepIndex}`}
                  type="button"
                  className={getStepClassName(isEnabled, activeStep === stepIndex)}
                  onClick={() => toggleStep(trackIndex, stepIndex)}
                  style={{ '--step-rgb': track.color }}
                  aria-label={`${track.label} step ${stepIndex + 1}`}
                  aria-pressed={isEnabled}
                >
                  <span className={styles.stepNumber}>{stepIndex + 1}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className={styles.controls}>
        <button type="button" className={styles.playButton} onClick={handlePlayToggle}>
          {isPlaying ? labels.controls.stop : labels.controls.play}
        </button>
        <button type="button" className={styles.utilityButton} onClick={handleClear}>
          {labels.controls.clear}
        </button>
        <button type="button" className={styles.utilityButton} onClick={handleRandomize}>
          {labels.controls.random}
        </button>

        <label htmlFor="beatmaker-bpm" className={styles.bpmControl}>
          <span>{labels.controls.bpm}</span>
          <input
            id="beatmaker-bpm"
            className={styles.bpmSlider}
            type="range"
            min="72"
            max="160"
            value={bpm}
            onChange={(event) => setBpm(Number(event.target.value))}
          />
          <output>{bpm}</output>
        </label>
      </div>

      {showUnlockMessage && <p className={styles.unlockMessage}>{labels.easter.unlockedMessage}</p>}
    </section>
  );
}

export default BeatMaker;