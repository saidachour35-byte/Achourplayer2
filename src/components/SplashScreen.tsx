import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { isTVOrLowEndDevice, pushBackHandler, BackPriority } from '../utils/tvNavigation';

interface SplashScreenProps {
  onComplete: () => void;
  onFirstPainted?: () => void;
  royalThemeId?: string;
  soundTrack?: string;
  splashStyle?: string;
  backgroundImageUrl?: string | null;
  isPreview?: boolean;
}

const SPLASH_DURATION_MS = 10000;
const EXIT_FADE_MS = 180;
const RING_CIRCUMFERENCE = 251.2;

const NUMBER_COLORS = [
  '#ff4b4b', '#ff8c00', '#ffd700', '#00e676',
  '#00b0ff', '#7c4dff', '#ff4081', '#00e5ff',
  '#69f0ae', '#ffd740', '#ff6e40'
];

const BRAND_LETTERS = [
  { char: 'A', color: '#ff4b4b' },
  { char: 'c', color: '#ff8c00' },
  { char: 'h', color: '#ffd700' },
  { char: 'o', color: '#00e676' },
  { char: 'u', color: '#00b0ff' },
  { char: 'r', color: '#7c4dff' },
  { char: ' ', color: 'transparent' },
  { char: 'P', color: '#ff4081' },
  { char: 'l', color: '#00e5ff' },
  { char: 'a', color: '#69f0ae' },
  { char: 'y', color: '#ffd740' },
  { char: 'e', color: '#ff6e40' },
  { char: 'r', color: '#e040fb' },
];

const PARTICLE_COLORS = ['#ff4b4b', '#ffd700', '#00e676', '#00b0ff', '#7c4dff', '#ff4081', '#00e5ff'];

interface SoundNote {
  freq: number;
  start: number;
  duration: number;
  type: OscillatorType;
  gain: number;
}

function getSoundNotes(soundTrack: string): SoundNote[] {
  switch (soundTrack) {
    case 'imax_bass_rise':
      return [
        { freq: 65.41, start: 0, duration: 3.6, type: 'sawtooth', gain: 0.24 },
        { freq: 98.0, start: 0.4, duration: 3.2, type: 'triangle', gain: 0.22 },
        { freq: 130.81, start: 1.1, duration: 3.0, type: 'sine', gain: 0.26 },
        { freq: 196.0, start: 2.0, duration: 2.6, type: 'triangle', gain: 0.2 },
      ];
    case 'synthwave_arpeggio':
      return [
        { freq: 220.0, start: 0, duration: 0.9, type: 'sawtooth', gain: 0.14 },
        { freq: 277.18, start: 0.35, duration: 0.9, type: 'sawtooth', gain: 0.14 },
        { freq: 329.63, start: 0.7, duration: 0.9, type: 'sawtooth', gain: 0.15 },
        { freq: 440.0, start: 1.05, duration: 1.6, type: 'triangle', gain: 0.18 },
        { freq: 554.37, start: 1.6, duration: 2.2, type: 'sine', gain: 0.18 },
      ];
    case 'crystal_magic_chimes':
      return [
        { freq: 523.25, start: 0, duration: 1.4, type: 'sine', gain: 0.16 },
        { freq: 659.25, start: 0.3, duration: 1.4, type: 'sine', gain: 0.16 },
        { freq: 783.99, start: 0.65, duration: 1.6, type: 'sine', gain: 0.18 },
        { freq: 1046.5, start: 1.05, duration: 2.2, type: 'triangle', gain: 0.15 },
      ];
    case 'cinematic_netflix':
      return [
        { freq: 98.0, start: 0, duration: 1.5, type: 'triangle', gain: 0.24 },
        { freq: 146.83, start: 0.25, duration: 2.4, type: 'sawtooth', gain: 0.16 },
        { freq: 293.66, start: 0.65, duration: 2.8, type: 'sine', gain: 0.22 },
      ];
    case 'epic_royal_fanfare':
    default:
      return [
        { freq: 130.81, start: 0, duration: 2.3, type: 'sawtooth', gain: 0.14 },
        { freq: 196.0, start: 0.28, duration: 2.1, type: 'sawtooth', gain: 0.14 },
        { freq: 261.63, start: 0.56, duration: 2.0, type: 'triangle', gain: 0.19 },
        { freq: 392.0, start: 1.25, duration: 3.1, type: 'sawtooth', gain: 0.22 },
      ];
  }
}

export default function SplashScreen({
  onComplete,
  onFirstPainted,
  soundTrack = 'epic_royal_fanfare',
  splashStyle = 'royal_gold_particles',
  backgroundImageUrl = null,
  isPreview = false,
}: SplashScreenProps) {
  const [timeLeft, setTimeLeft] = useState(10);
  const [isExiting, setIsExiting] = useState(false);
  const [logoSrc, setLogoSrc] = useState('./logo-splash.jpg');
  const [logoDecoded, setLogoDecoded] = useState(false);

  const isLowEnd = useMemo(() => isTVOrLowEndDevice(), []);
  const activeStyle = splashStyle || 'royal_gold_particles';

  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const onFirstPaintedRef = useRef(onFirstPainted);
  onFirstPaintedRef.current = onFirstPainted;

  const progressCircleRef = useRef<SVGCircleElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const activeOscsRef = useRef<Set<OscillatorNode>>(new Set());
  const audioStartedRef = useRef(false);
  const isAliveRef = useRef(true);
  const isFinishingRef = useRef(false);
  const exitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Stop & release every Web Audio node immediately so audio never bleeds past Splash
  const stopAllAudio = useCallback(() => {
    const ctx = audioCtxRef.current;
    const masterGain = masterGainRef.current;
    audioCtxRef.current = null;
    masterGainRef.current = null;

    if (masterGain && ctx && ctx.state !== 'closed') {
      try {
        const now = ctx.currentTime;
        masterGain.gain.cancelScheduledValues(now);
        masterGain.gain.setValueAtTime(masterGain.gain.value, now);
        masterGain.gain.linearRampToValueAtTime(0, now + 0.02);
      } catch {}
    }

    activeOscsRef.current.forEach((osc) => {
      try {
        osc.stop();
      } catch {}
      try {
        osc.disconnect();
      } catch {}
    });
    activeOscsRef.current.clear();

    if (ctx && ctx.state !== 'closed') {
      try {
        ctx.close().catch(() => {});
      } catch {}
    }
  }, []);

  const triggerExitToHome = useCallback(() => {
    if (isFinishingRef.current || !isAliveRef.current) return;
    isFinishingRef.current = true;

    // 1. Cut audio immediately BEFORE transition starts so music never lingers onto Home
    stopAllAudio();

    // 2. Pin indicators cleanly to 100%
    if (progressCircleRef.current) {
      progressCircleRef.current.style.strokeDashoffset = '0';
    }
    if (progressBarRef.current) {
      progressBarRef.current.style.transform = 'scaleX(1)';
    }

    // 3. Smooth GPU-only opacity fade over already-mounted Home screen (zero blur/black screen)
    setIsExiting(true);
    exitTimeoutRef.current = setTimeout(() => {
      if (isAliveRef.current) {
        onCompleteRef.current();
      }
    }, EXIT_FADE_MS);
  }, [stopAllAudio]);

  // Precompute static lightweight particle descriptors once
  const particles = useMemo(() => {
    const count = isLowEnd ? 8 : 14;
    return Array.from({ length: count }, (_, i) => {
      const leftPct = 6 + ((i * 73) % 88);
      const topPct = 6 + ((i * 41) % 88);
      const dx = (i % 3 === 0 ? 1 : -1) * (18 + (i % 4) * 14);
      const dy = (i % 2 === 0 ? 1 : -1) * (24 + (i % 5) * 14);
      const dur = 3.2 + (i % 4) * 0.7;
      const delay = -(i * 0.45);
      const color = PARTICLE_COLORS[i % PARTICLE_COLORS.length];
      return { leftPct, topPct, dx, dy, dur, delay, color };
    });
  }, [isLowEnd]);

  // Register Back key guard while Splash is visible
  useEffect(() => {
    const unregister = pushBackHandler(() => {
      if (isPreview) {
        triggerExitToHome();
      }
      // Consume Back on startup splash so underlying Dashboard exit dialog never triggers behind Splash
      return true;
    }, BackPriority.PLAYER + 50);
    return unregister;
  }, [isPreview, triggerExitToHome]);

  // Async preload & decode background image cleanly for zero-black-frame Home reveal
  useEffect(() => {
    if (!backgroundImageUrl) return;
    const bgImg = new Image();
    bgImg.decoding = 'async';
    bgImg.src = backgroundImageUrl;
    if (typeof bgImg.decode === 'function') {
      bgImg.decode().catch(() => {});
    }
    return () => {
      bgImg.onload = null;
      bgImg.onerror = null;
    };
  }, [backgroundImageUrl]);

  // Main synchronized lifecycle: Paint -> Audio + 60fps Progress + Monotonic Countdown -> Clean Exit
  useEffect(() => {
    isAliveRef.current = true;
    isFinishingRef.current = false;
    audioStartedRef.current = false;
    setIsExiting(false);
    setTimeLeft(10);

    let rafId = 0;
    let watchdogId: ReturnType<typeof setInterval> | null = null;
    let startPerfMs = 0;
    let lastSecondShown = 10;
    let unlockListenerAttached = false;

    const ensureAudioContext = (): AudioContext | null => {
      if (soundTrack === 'mute' || !isAliveRef.current || isFinishingRef.current) return null;
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) return null;
        if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
          audioCtxRef.current = new AudioContextClass();
        }
        const ctx = audioCtxRef.current;
        if (!ctx || ctx.state === 'closed') return null;

        if (!masterGainRef.current) {
          const master = ctx.createGain();
          master.gain.setValueAtTime(0.24, ctx.currentTime);
          master.connect(ctx.destination);
          masterGainRef.current = master;
        }
        return ctx;
      } catch {
        return null;
      }
    };

    const scheduleIntroNotes = () => {
      if (audioStartedRef.current || soundTrack === 'mute') return;
      if (!isAliveRef.current || isFinishingRef.current || document.hidden) return;

      const ctx = ensureAudioContext();
      const masterGain = masterGainRef.current;
      if (!ctx || !masterGain || ctx.state === 'closed') return;

      audioStartedRef.current = true;
      const now = ctx.currentTime;
      const notes = getSoundNotes(soundTrack);

      notes.forEach((n) => {
        try {
          if (!ctx || ctx.state === 'closed' || isFinishingRef.current) return;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const filter = ctx.createBiquadFilter();

          osc.type = n.type;
          osc.frequency.setValueAtTime(n.freq, now + n.start);

          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(1400, now + n.start);
          filter.frequency.exponentialRampToValueAtTime(3600, now + n.start + Math.min(0.5, n.duration * 0.5));

          gain.gain.setValueAtTime(0.0001, now + n.start);
          gain.gain.linearRampToValueAtTime(n.gain, now + n.start + 0.18);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + n.start + n.duration);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(masterGain);

          activeOscsRef.current.add(osc);
          osc.onended = () => {
            activeOscsRef.current.delete(osc);
            try {
              osc.disconnect();
              gain.disconnect();
              filter.disconnect();
            } catch {}
          };

          osc.start(now + n.start);
          osc.stop(now + n.start + n.duration);
        } catch {}
      });
    };

    const playClockTick = () => {
      if (soundTrack === 'mute' || !isAliveRef.current || isFinishingRef.current || document.hidden) return;
      const ctx = audioCtxRef.current;
      const masterGain = masterGainRef.current;
      if (!ctx || !masterGain || ctx.state !== 'running') return;

      try {
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1320, now);
        osc.frequency.exponentialRampToValueAtTime(520, now + 0.028);
        gain.gain.setValueAtTime(0.16, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.038);

        osc.connect(gain);
        gain.connect(masterGain);

        activeOscsRef.current.add(osc);
        osc.onended = () => {
          activeOscsRef.current.delete(osc);
          try {
            osc.disconnect();
            gain.disconnect();
          } catch {}
        };

        osc.start(now);
        osc.stop(now + 0.045);
      } catch {}
    };

    const removeUnlockListeners = () => {
      if (!unlockListenerAttached) return;
      unlockListenerAttached = false;
      window.removeEventListener('pointerdown', handleAudioUnlock, true);
      window.removeEventListener('keydown', handleAudioUnlock, true);
    };

    const handleAudioUnlock = () => {
      if (!isAliveRef.current || isFinishingRef.current) {
        removeUnlockListeners();
        return;
      }
      const ctx = audioCtxRef.current;
      if (ctx && ctx.state === 'suspended') {
        ctx.resume().then(() => {
          if (!isAliveRef.current || isFinishingRef.current) {
            stopAllAudio();
            return;
          }
          scheduleIntroNotes();
          removeUnlockListeners();
        }).catch(() => {});
      } else {
        removeUnlockListeners();
      }
    };

    const startSynchronizedAudioAfterPaint = () => {
      if (soundTrack === 'mute' || !isAliveRef.current || isFinishingRef.current || document.hidden) return;
      const ctx = ensureAudioContext();
      if (!ctx) return;

      if (ctx.state === 'running') {
        scheduleIntroNotes();
      } else if (ctx.state === 'suspended') {
        ctx.resume().then(() => {
          // Strict guard: never play audio if splash already finished or unmounted while waiting
          if (!isAliveRef.current || isFinishingRef.current || document.hidden) {
            stopAllAudio();
            return;
          }
          scheduleIntroNotes();
          removeUnlockListeners();
        }).catch(() => {});

        // Fallback if browser requires user interaction to unlock Web Audio
        if (!unlockListenerAttached) {
          unlockListenerAttached = true;
          window.addEventListener('pointerdown', handleAudioUnlock, { capture: true, passive: true });
          window.addEventListener('keydown', handleAudioUnlock, { capture: true, passive: true });
        }
      }
    };

    const updateFrame = () => {
      if (!isAliveRef.current || isFinishingRef.current) return;

      const elapsed = Math.max(0, performance.now() - startPerfMs);
      const ratio = Math.min(1, elapsed / SPLASH_DURATION_MS);
      const remainingMs = Math.max(0, SPLASH_DURATION_MS - elapsed);

      // Update 60fps progress ring & loading bar directly via DOM refs (zero React re-renders!)
      if (progressCircleRef.current) {
        progressCircleRef.current.style.strokeDashoffset = String(RING_CIRCUMFERENCE * (1 - ratio));
      }
      if (progressBarRef.current) {
        progressBarRef.current.style.transform = `scaleX(${ratio.toFixed(4)})`;
      }

      // Gently taper master volume during final 2 seconds so exit is crisp and pop-free
      if (masterGainRef.current && audioCtxRef.current && audioCtxRef.current.state === 'running') {
        const remainingRatio = Math.max(0, remainingMs / SPLASH_DURATION_MS);
        const vol = remainingRatio < 0.2 ? (remainingRatio / 0.2) * 0.24 : 0.24;
        try {
          masterGainRef.current.gain.setValueAtTime(vol, audioCtxRef.current.currentTime);
        } catch {}
      }

      const nextSecond = Math.max(0, Math.ceil(remainingMs / 1000));
      if (nextSecond !== lastSecondShown) {
        lastSecondShown = nextSecond;
        setTimeLeft(nextSecond);
        if (nextSecond > 0) {
          playClockTick();
        }
      }

      if (elapsed >= SPLASH_DURATION_MS || remainingMs <= 0) {
        removeUnlockListeners();
        triggerExitToHome();
        return;
      }

      rafId = requestAnimationFrame(updateFrame);
    };

    const handleVisibilityOrHide = () => {
      if (document.hidden) {
        stopAllAudio();
      }
    };
    window.addEventListener('pagehide', stopAllAudio);
    document.addEventListener('visibilitychange', handleVisibilityOrHide);

    // Paint first visual frame immediately, THEN start audio & timer synchronously in exact visual sync
    rafId = requestAnimationFrame(() => {
      if (!isAliveRef.current || isFinishingRef.current) return;
      startPerfMs = performance.now();

      // Signal App.tsx that SplashScreen first frame is painted so background & Home can warm underneath
      onFirstPaintedRef.current?.();

      // Start audio strictly synced with painted Splash Screen
      startSynchronizedAudioAfterPaint();

      // Kick off smooth 60fps progress loop
      rafId = requestAnimationFrame(updateFrame);

      // Low-overhead watchdog ensures countdown finishes on schedule even if RAF is throttled
      watchdogId = setInterval(() => {
        if (!isAliveRef.current || isFinishingRef.current) return;
        const elapsed = performance.now() - startPerfMs;
        if (elapsed >= SPLASH_DURATION_MS) {
          removeUnlockListeners();
          triggerExitToHome();
          return;
        }
        const sec = Math.max(0, Math.ceil((SPLASH_DURATION_MS - elapsed) / 1000));
        if (sec !== lastSecondShown) {
          lastSecondShown = sec;
          setTimeLeft(sec);
        }
      }, 250);
    });

    return () => {
      isAliveRef.current = false;
      cancelAnimationFrame(rafId);
      if (watchdogId) clearInterval(watchdogId);
      if (exitTimeoutRef.current) clearTimeout(exitTimeoutRef.current);
      removeUnlockListeners();
      window.removeEventListener('pagehide', stopAllAudio);
      document.removeEventListener('visibilitychange', handleVisibilityOrHide);
      stopAllAudio();
    };
  }, [splashStyle, soundTrack, stopAllAudio, triggerExitToHome]);

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#020205] select-none overflow-hidden font-sans"
      style={{
        opacity: isExiting ? 0 : 1,
        transition: `opacity ${EXIT_FADE_MS}ms ease-out`,
        pointerEvents: isExiting ? 'none' : 'auto',
        contain: 'layout style paint',
      }}
    >
      {/* Pure GPU-Composited Style Aura & Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
        {activeStyle === 'royal_gold_particles' && (
          <div
            className="absolute w-[760px] h-[760px] rounded-full achour-splash-pulse"
            style={{ background: 'radial-gradient(circle at center, rgba(255,215,0,0.34) 0%, rgba(124,77,255,0.22) 38%, rgba(255,75,75,0.12) 58%, transparent 74%)' }}
          />
        )}

        {activeStyle === 'holographic_crown' && (
          <div
            className="absolute w-[620px] h-[620px] rounded-full border border-cyan-400/35 opacity-65 achour-splash-spin"
            style={{ background: 'radial-gradient(circle at center, rgba(0,229,255,0.28) 0%, rgba(124,77,255,0.2) 55%, transparent 80%)' }}
          />
        )}

        {activeStyle === 'diamond_beam_pulse' && (
          <div
            className="absolute w-[680px] h-[680px] rounded-full opacity-60 achour-splash-spin-rev"
            style={{ background: 'radial-gradient(circle at center, rgba(255,215,0,0.32) 0%, rgba(0,176,255,0.24) 40%, rgba(124,77,255,0.16) 60%, transparent 76%)' }}
          />
        )}

        {activeStyle === 'cyber_pulsar' && (
          <div
            className="absolute w-[560px] h-[560px] rounded-3xl rotate-45 border-2 border-emerald-400/40 achour-splash-pulse"
            style={{ background: 'radial-gradient(circle at center, rgba(0,230,118,0.25) 0%, rgba(0,176,255,0.2) 60%, transparent 82%)' }}
          />
        )}

        {activeStyle === 'cinematic_epic_zoom' && (
          <div
            className="absolute inset-0 achour-splash-pulse"
            style={{ background: 'radial-gradient(ellipse at center, rgba(147,51,234,0.35) 0%, rgba(219,39,119,0.2) 48%, transparent 78%)' }}
          />
        )}

        {activeStyle === 'fireworks_party' && (
          <div
            className="absolute w-[720px] h-[720px] rounded-full achour-splash-pulse"
            style={{ background: 'radial-gradient(circle at center, rgba(255,64,129,0.35) 0%, rgba(255,213,79,0.28) 45%, transparent 74%)' }}
          />
        )}

        {activeStyle === 'matrix_neon_rain' && (
          <div
            className="absolute inset-0 bg-[radial-gradient(#00e5ff_1px,transparent_1px)] [background-size:24px_24px] opacity-25 achour-splash-pulse"
          />
        )}

        {activeStyle === 'laser_pulse_grid' && (
          <div
            className="absolute w-[760px] h-[760px] rounded-full border border-red-500/35 achour-splash-spin"
            style={{ background: 'radial-gradient(circle at center, rgba(255,75,75,0.24) 0%, rgba(255,140,0,0.12) 48%, transparent 74%)' }}
          />
        )}

        {activeStyle === 'supernova_explosion' && (
          <div
            className="absolute w-[750px] h-[750px] rounded-full achour-splash-pulse"
            style={{ background: 'radial-gradient(circle at center, rgba(255,140,0,0.4) 0%, rgba(124,77,255,0.28) 52%, transparent 76%)' }}
          />
        )}

        {activeStyle === 'golden_fire_phoenix' && (
          <div
            className="absolute w-[720px] h-[720px] rounded-full achour-splash-pulse"
            style={{ background: 'radial-gradient(circle at center, rgba(255,215,0,0.38) 0%, rgba(255,110,64,0.3) 45%, transparent 75%)' }}
          />
        )}

        {particles.map((p, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-full achour-splash-particle"
            style={{
              left: `${p.leftPct}%`,
              top: `${p.topPct}%`,
              backgroundColor: p.color,
              ['--dx' as any]: `${p.dx}px`,
              ['--dy' as any]: `${p.dy}px`,
              ['--dur' as any]: `${p.dur}s`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative flex flex-col items-center justify-center z-10 max-w-[90vw] px-3">
        {/* Official AchourPlayer Brand Logo */}
        <div className="relative mb-3 sm:mb-4 shadow-[0_15px_40px_rgba(0,0,0,0.85)] rounded-[20px] sm:rounded-[24px] p-0.5 sm:p-1 bg-gradient-to-br from-amber-400/55 via-purple-600/40 to-blue-500/55 achour-splash-logo-float">
          <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-36 md:h-36 rounded-[18px] sm:rounded-[22px] overflow-hidden bg-[#0b0d14] flex items-center justify-center relative">
            {/* Instant monogram backing ensures zero black box if image is still decoding */}
            {!logoDecoded && (
              <span className="absolute inset-0 flex items-center justify-center text-3xl sm:text-4xl font-black tracking-tight text-amber-400 bg-gradient-to-br from-amber-500/20 via-[#0d101b] to-purple-600/20">
                AP
              </span>
            )}
            <img
              src={logoSrc}
              onLoad={() => setLogoDecoded(true)}
              onError={() => {
                if (logoSrc === './logo-splash.jpg') {
                  setLogoSrc('./icon-192.png');
                } else if (logoSrc === './icon-192.png') {
                  setLogoSrc('./logo.jpg');
                }
              }}
              alt="Achour Player"
              decoding="async"
              fetchPriority="high"
              className="relative z-10 w-full h-full object-cover"
            />
            <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none z-20 achour-splash-sweep" />
          </div>
        </div>

        {/* Smooth Multi-colored GPU Animated Title */}
        <div dir="ltr" className="flex flex-wrap justify-center mb-4 sm:mb-5">
          {BRAND_LETTERS.map((item, index) => (
            <span
              key={index}
              className={`text-lg sm:text-2xl md:text-3xl font-black tracking-wide sm:tracking-wider mx-[1px] sm:mx-1 inline-block achour-splash-letter ${
                item.char === ' ' ? 'w-2 sm:w-3' : ''
              }`}
              style={{
                color: item.color,
                textShadow: isLowEnd
                  ? `0 0 10px ${item.color}99`
                  : `0 0 16px ${item.color}, 0 0 28px ${item.color}66`,
                animationDelay: `${index * 70}ms`,
              }}
            >
              {item.char}
            </span>
          ))}
        </div>

        {/* Continuous 60fps Progress Ring & Freeze-Free Monotonic Countdown */}
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
          <svg
            className={`absolute inset-0 w-full h-full ${activeStyle === 'laser_pulse_grid' ? 'achour-splash-spin-fast' : 'achour-splash-spin'}`}
            viewBox="0 0 100 100"
          >
            <defs>
              <linearGradient id="rainbowDottedGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ff4b4b" />
                <stop offset="20%" stopColor="#ff8c00" />
                <stop offset="40%" stopColor="#ffd700" />
                <stop offset="60%" stopColor="#00e676" />
                <stop offset="80%" stopColor="#00b0ff" />
                <stop offset="100%" stopColor="#7c4dff" />
              </linearGradient>
            </defs>

            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="rgba(255, 255, 255, 0.14)"
              strokeWidth="5"
              strokeDasharray="4 8"
              strokeLinecap="round"
            />

            <circle
              ref={progressCircleRef}
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="url(#rainbowDottedGrad)"
              strokeWidth="7"
              strokeDasharray={String(RING_CIRCUMFERENCE)}
              strokeDashoffset={String(RING_CIRCUMFERENCE)}
              strokeLinecap="round"
            />
          </svg>

          <div className="flex flex-col items-center justify-center z-10">
            <span
              className="text-xl sm:text-2xl font-black font-mono leading-none"
              style={{
                color: NUMBER_COLORS[timeLeft % NUMBER_COLORS.length],
                textShadow: `0 0 12px ${NUMBER_COLORS[timeLeft % NUMBER_COLORS.length]}`,
              }}
            >
              {timeLeft}
            </span>
            <span className="text-[7px] sm:text-[8px] uppercase tracking-widest text-white/60 font-bold mt-0.5">
              SEC
            </span>
          </div>
        </div>

        {/* Continuous 60fps Loading Progress Bar */}
        <div className="mt-4 w-36 sm:w-44 h-1 rounded-full bg-white/10 overflow-hidden">
          <div
            ref={progressBarRef}
            className="h-full w-full origin-left rounded-full bg-gradient-to-r from-[#ff4b4b] via-[#ffd700] to-[#00e5ff]"
            style={{ transform: 'scaleX(0)', willChange: 'transform' }}
          />
        </div>
      </div>
    </div>
  );
}
