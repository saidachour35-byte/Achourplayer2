import React, { useEffect, useState } from 'react';
import { AppSettings } from '../types';
import { APP_BACKGROUNDS } from '../utils/themeManager';

interface AnimatedBackgroundProps {
  settings: AppSettings;
}

const DEFAULT_BACKGROUND_ID = 'bg-raouche-rocks-beirut';

export default function AnimatedBackground({ settings }: AnimatedBackgroundProps) {
  const currentBgId = settings.backgroundStyle || DEFAULT_BACKGROUND_ID;
  const customBg = settings.customBackground;

  const bgConfig =
    APP_BACKGROUNDS.find(b => b.id === currentBgId) ||
    APP_BACKGROUNDS.find(b => b.id === DEFAULT_BACKGROUND_ID) ||
    APP_BACKGROUNDS[0];

  const [nativeState, setNativeState] = useState(() => {
    if (typeof document === 'undefined') {
      return { fullscreen: false, hidden: false };
    }
    const root = document.documentElement;
    const isActive = root.classList.contains('native-player-active');
    const isPreview = root.classList.contains('native-player-preview');
    return {
      fullscreen: isActive && !isPreview,
      hidden: document.hidden
    };
  });

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    const syncState = () => {
      const isActive = root.classList.contains('native-player-active');
      const isPreview = root.classList.contains('native-player-preview');
      setNativeState({
        fullscreen: isActive && !isPreview,
        hidden: document.hidden
      });
    };

    const observer = new MutationObserver(syncState);
    observer.observe(root, { attributes: true, attributeFilter: ['class'] });
    document.addEventListener('visibilitychange', syncState);

    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', syncState);
    };
  }, []);

  if (nativeState.fullscreen || nativeState.hidden) {
    return null;
  }

  const customImageUrl =
    typeof customBg === 'string' && customBg.trim()
      ? customBg.trim()
      : typeof customBg === 'object' && customBg?.type === 'image' && customBg.url
      ? customBg.url
      : null;

  const bgOpacityPct =
    typeof settings.backgroundOpacity === 'number' && !Number.isNaN(settings.backgroundOpacity)
      ? Math.max(0, Math.min(100, Math.round(settings.backgroundOpacity)))
      : 62;
  const baseOverlayAlpha = bgOpacityPct / 100;
  const scrimFactor = bgOpacityPct <= 62 ? bgOpacityPct / 62 : 1;

  return (
    <div className="achour-animated-bg fixed inset-0 pointer-events-none z-0 overflow-hidden select-none bg-black">
      {customImageUrl ? (
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${customImageUrl})` }}
        />
      ) : (
        bgConfig?.imageUrl && (
          <img
            key={bgConfig.id}
            src={bgConfig.imageUrl}
            alt={bgConfig.nameEn}
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover"
          />
        )
      )}

      {/* Dynamic Dark Contrast Overlay (0% = original natural colors, 62% = default balanced look, 100% = full dim) */}
      {bgOpacityPct > 0 && (
        <>
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ backgroundColor: `rgba(0, 0, 0, ${baseOverlayAlpha})` }}
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, ${(0.7 * scrimFactor).toFixed(3)}), rgba(0, 0, 0, ${(0.2 * scrimFactor).toFixed(3)}), rgba(0, 0, 0, ${(0.75 * scrimFactor).toFixed(3)}))`,
            }}
          />
        </>
      )}
    </div>
  );
}
