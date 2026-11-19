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

      {/* Balanced Dark Contrast Overlay (preserves natural scenery while ensuring crisp text readability) */}
      <div className="absolute inset-0 bg-black/62 pointer-events-none" />

      {/* Top and Bottom Ambient Gradient Scrim (protects header, clock, channel lists & settings) */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/20 to-black/75 pointer-events-none" />
    </div>
  );
}
