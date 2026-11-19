// Original path: src/App.tsx
import React, { useState, useEffect, useRef } from 'react';
import { getPublicId } from './lib/firebase';
import Dashboard from './components/Dashboard';
import SplashScreen from './components/SplashScreen';
import AnimatedBackground from './components/AnimatedBackground';
import { motion, AnimatePresence } from 'framer-motion';
import { AppSettings, Language } from './types';
import { applyRoyalTheme, APP_BACKGROUNDS, resolveDesignSettings } from './utils/themeManager';
import { DEFAULT_PLAYERS } from './components/SettingsView';
import { runStorageCleanup } from './utils/storageCleanup';
import { parseTVKeyEvent, executeBackHandler, isTextInput, initGlobalFocusSync, isNativeCapacitorApp, isTVOrLowEndDevice } from './utils/tvNavigation';
import { Monitor, Smartphone } from 'lucide-react';
import { isTVDevice } from './utils/platform';
import TvPreviewModal from './components/TvPreviewModal';


const DEFAULT_SETTINGS: AppSettings = {
  language: 'en',
  hiddenCategories: [],
  hiddenLiveCategories: [],
  hiddenMovieCategories: [],
  hiddenSeriesCategories: [],
  timeFormat: '24h',
  viewMode: 'grid',
  autoPlayLastChannel: false,
  vodSortBy: 'newest',
  posterSize: 'medium',
  showPosterTitles: false,
  useExternalPlayer: false,
  externalPlayers: DEFAULT_PLAYERS,
  selectedPlayer: 'Achour Player (مدمج - Native)',
  installedPlayers: ['Achour Player (مدمج - Native)'],
  activePlaylistId: null,
  searchHistory: {
    movies: [],
    series: [],
  },
  royalThemeColor: 'pure-metallic-gold',
  customThemeColor: null,
  icon3DStyle: 'style-gold-3d',
  iconDisplayMode: 'with-frames',
  iconPack: 'pack-3d',
  frameShape: 'rounded-square',
  glassOpacity: 16,
  glassBlur: 10,
  backgroundStyle: 'bg-raouche-rocks-beirut',
  customBackground: null,
  vpnEnabled: true,
  vpnRegion: 'auto',
  vpnMode: 'auto-relay',
  dashboardLayout: 'layout-dock-row',
  splashSoundTrack: 'epic_royal_fanfare',
  splashStyle: 'royal_gold_particles',
  iconScale: 'md',
  frameScale: 'md',
  tileSpacing: 'md',
  dashboardAlignment: 'center',
  dashboardHorizontalAlignment: 'center',
  windowPosition: 'center',
  zoomScale: 85,
  seekStep: 10,
};

import { App as CapacitorApp } from '@capacitor/app';
import { StatusBar } from '@capacitor/status-bar';

import XtreamDebugOverlay from './components/XtreamDebugOverlay';


export default function App() {
  const [userId, setUserId] = useState<string>(() => getPublicId());
  const [showSplash, setShowSplash] = useState(true);
  const [splashIsPreview, setSplashIsPreview] = useState(false);
  const [splashFirstPainted, setSplashFirstPainted] = useState(false);
  const [isRestricted, setIsRestricted] = useState(false);
  const [tvPreviewMode, setTvPreviewMode] = useState<boolean>(() => {
    if (typeof window === 'undefined' || isNativeCapacitorApp()) return false;
    try {
      return new URLSearchParams(window.location.search).get('tvPreview') === '1';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    // Initialize exclusive TV single-focus synchronization & Fire TV GPU compositor optimization
    const stopFocusSync = initGlobalFocusSync();
    if (isTVOrLowEndDevice()) {
      document.documentElement.classList.add('achour-tv-perf');
    }
    if (isTVDevice()) {
      document.documentElement.classList.add('achour-tv-ui');
    }

    // Hide status bar for immersive full screen on mobile devices
    try {
      StatusBar.hide().catch(() => {});
    } catch (e) {}

    // Allow running on all devices
    setIsRestricted(false);

    return () => {
      stopFocusSync();
    };
  }, []);

  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('achour_settings_v2');
    const langInitialized = localStorage.getItem('achour_lang_initialized_v3');
    const userSelectedLang = localStorage.getItem('achour_user_selected_lang');
    const userSetViewMode = localStorage.getItem('achour_viewmode_user_set');
    if (!saved) {
      localStorage.setItem('achour_lang_initialized_v3', 'true');
      return DEFAULT_SETTINGS;
    }
    try {
      const parsed = JSON.parse(saved);
      let lang = parsed.language;
      if (!langInitialized && !userSelectedLang) {
        lang = 'en';
        localStorage.setItem('achour_lang_initialized_v3', 'true');
      }
      const bgValid = parsed.backgroundStyle && APP_BACKGROUNDS.some(b => b.id === parsed.backgroundStyle);
      const resolvedViewMode = (!userSetViewMode && parsed.viewMode === 'list')
        ? 'grid'
        : (parsed.viewMode || DEFAULT_SETTINGS.viewMode);
      const resolvedDesign = resolveDesignSettings(parsed);
      return {
        ...DEFAULT_SETTINGS,
        ...parsed,
        iconDisplayMode: resolvedDesign.iconDisplayMode,
        iconPack: resolvedDesign.iconPack,
        frameShape: resolvedDesign.frameShape,
        dashboardLayout: resolvedDesign.layoutId,
        glassOpacity: resolvedDesign.glassOpacity,
        glassBlur: resolvedDesign.glassBlur,
        viewMode: resolvedViewMode,
        language: lang || 'en',
        backgroundStyle: bgValid ? parsed.backgroundStyle : DEFAULT_SETTINGS.backgroundStyle,
        searchHistory: {
          ...DEFAULT_SETTINGS.searchHistory,
          ...(parsed.searchHistory || {})
        }
      };
    } catch (e) {
      return DEFAULT_SETTINGS;
    }
  });


  useEffect(() => {
    try {
      const id = getPublicId();
      if (id) setUserId(id);
    } catch (err) {
      console.warn('App initialization notice:', err);
    }

    const runDeferredCleanup = () => {
      try {
        runStorageCleanup();
      } catch (err) {
        console.warn('App initialization storage notice:', err);
      }
    };
    const w = window as any;
    let idleId: any = null;
    let fallbackTimer: ReturnType<typeof setTimeout> | null = null;
    if (typeof w.requestIdleCallback === 'function') {
      idleId = w.requestIdleCallback(runDeferredCleanup, { timeout: 1200 });
    } else {
      fallbackTimer = setTimeout(runDeferredCleanup, 450);
    }

    return () => {
      if (idleId !== null && typeof w.cancelIdleCallback === 'function') {
        w.cancelIdleCallback(idleId);
      }
      if (fallbackTimer) clearTimeout(fallbackTimer);
    };
  }, []);

  useEffect(() => {
    if (!showSplash) return;
    // Safety fallback ensuring background Home mount & completion even if RAF is throttled
    const mountFallbackTimer = setTimeout(() => {
      setSplashFirstPainted(true);
    }, 350);
    const splashTimer = setTimeout(() => {
      setShowSplash(false);
      setSplashIsPreview(false);
    }, 13500);
    return () => {
      clearTimeout(mountFallbackTimer);
      clearTimeout(splashTimer);
    };
  }, [showSplash]);

  const prevPlaylistIdRef = useRef<string | undefined>(settings.activePlaylistId);

  useEffect(() => {
    try {
      localStorage.setItem('achour_settings_v2', JSON.stringify(settings));
    } catch (e) {}
    
    // Clear in-memory global cache when active playlist changes (keep persistent IndexedDB intact!)
    if (settings.activePlaylistId !== prevPlaylistIdRef.current) {
      prevPlaylistIdRef.current = settings.activePlaylistId;
      (async () => {
        const { iptvGlobalCache } = await import('./utils/iptv');
        iptvGlobalCache.clear();
      })();
    }


    document.documentElement.dir = settings.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = settings.language;
    document.documentElement.setAttribute('data-achour-window-pos', settings.windowPosition || 'center');
    const scaleVal = Math.max(0.6, Math.min(1.5, ((settings.zoomScale || 100) * 0.95) / 100));
    document.documentElement.style.setProperty('--achour-zoom-scale', String(scaleVal));
    applyRoyalTheme(
      settings.royalThemeColor || 'pure-metallic-gold',
      settings.customThemeColor,
      settings.glassOpacity,
      settings.glassBlur
    );
  }, [settings]);

  useEffect(() => {
    const handleWindowPosChange = (e: Event) => {
      const nextPos = (e as CustomEvent).detail;
      if (!nextPos) return;
      setSettings((prev) => (prev.windowPosition === nextPos ? prev : { ...prev, windowPosition: nextPos }));
    };
    window.addEventListener('achour-window-pos-change', handleWindowPosChange);
    return () => window.removeEventListener('achour-window-pos-change', handleWindowPosChange);
  }, []);

  // Global Hardware Back Key Interceptor for Android TV, Fire TV & Android Phones
  useEffect(() => {
    // Lock browser history state to block page unloading / navigation on Back
    for (let i = 0; i < 10; i++) {
      window.history.pushState({ page: 'achour_app' }, '', window.location.href);
    }

    const handlePopState = (e: PopStateEvent) => {
      window.history.pushState({ page: 'achour_app' }, '', window.location.href);
      executeBackHandler();
    };
    window.addEventListener('popstate', handlePopState);

    const triggerBack = (): boolean => {
      const handled = executeBackHandler();
      if (handled) return true;

      // Dispatched custom event for child components
      const event = new CustomEvent('app_back_pressed');
      window.dispatchEvent(event);
      return false;
    };

    (window as any).handleAndroidBack = () => {
      triggerBack();
    };

    // Register Capacitor Native Android Hardware Back Button listener
    let capBackListener: any = null;
    try {
      capBackListener = CapacitorApp.addListener('backButton', ({ canGoBack }: any) => {
        triggerBack();
      });
    } catch (e) {}

    const handleGlobalBack = (e: KeyboardEvent) => {
      const action = parseTVKeyEvent(e);
      if (action === 'BACK') {
        if (e.key === 'Backspace' && isTextInput(document.activeElement)) {
          return;
        }

        // Always block default browser / Android back exit behavior!
        e.preventDefault();
        e.stopPropagation();
        triggerBack();
      }
    };

    window.addEventListener('keydown', handleGlobalBack, { capture: true });
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('keydown', handleGlobalBack, { capture: true });
      if (capBackListener && typeof capBackListener.remove === 'function') {
        capBackListener.remove();
      }
      delete (window as any).handleAndroidBack;
    };
  }, []);

  const effectiveScale = Math.max(0.6, Math.min(1.5, ((settings.zoomScale || 100) * 0.95) / 100));
  const isRtl = settings.language === 'ar';
  const activeBgImageUrl = React.useMemo(() => {
    const customBg = settings.customBackground as any;
    if (typeof customBg === 'string' && customBg.trim()) return customBg.trim();
    if (customBg && typeof customBg === 'object' && customBg.type === 'image' && customBg.url) {
      return String(customBg.url);
    }
    const found =
      APP_BACKGROUNDS.find(b => b.id === (settings.backgroundStyle || 'bg-raouche-rocks-beirut')) ||
      APP_BACKGROUNDS[0];
    return found?.imageUrl || null;
  }, [settings.backgroundStyle, settings.customBackground]);
  const homeStageReady = !showSplash || splashFirstPainted;

  return (
    <div
      className={`achour-app-shell h-screen w-screen bg-transparent text-white selection:bg-gold/30 ${isRtl ? 'font-cairo' : 'font-sans'} relative overflow-hidden`}
      style={{ '--achour-zoom-scale': effectiveScale } as React.CSSProperties}
      onScroll={(e) => {
        if (e.currentTarget.scrollTop !== 0) e.currentTarget.scrollTop = 0;
        if (e.currentTarget.scrollLeft !== 0) e.currentTarget.scrollLeft = 0;
      }}
    >
      {/* App Backgrounds (mounted right after Splash first paint so Splash never stutters & Home reveals cleanly) */}
      {homeStageReady && (
        <div className="achour-animated-bg fixed inset-0 pointer-events-none z-0">
          <AnimatedBackground settings={settings} />
        </div>
      )}

      {/* Hidden Debug Overlay */}
      <XtreamDebugOverlay />

      {/* GPU-Composited Logo & Synchronized Intro Music Splash Screen */}
      {showSplash && (
        <SplashScreen
          onFirstPainted={() => setSplashFirstPainted(true)}
          onComplete={() => {
            setShowSplash(false);
            setSplashIsPreview(false);
          }}
          royalThemeId={settings.royalThemeColor || 'pure-metallic-gold'}
          soundTrack={settings.splashSoundTrack || 'epic_royal_fanfare'}
          splashStyle={settings.splashStyle || 'royal_gold_particles'}
          backgroundImageUrl={activeBgImageUrl}
          isPreview={splashIsPreview}
        />
      )}

      {/* Device Restriction Overlay (Fire TV / Android Box Only) */}
      <AnimatePresence>
        {isRestricted && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[100] achour-modal-backdrop flex flex-col items-center justify-center p-8 text-center"
          >
            <div className="w-24 h-24 rounded-full bg-red-500/20 flex items-center justify-center mb-6 border border-red-500/40">
              <Smartphone size={48} className="text-red-500" />
            </div>
            <h1 className="text-2xl font-black uppercase tracking-widest text-white mb-4">
              {settings.language === 'ar' ? 'الجهاز غير مدعوم' : 'Device Not Supported'}
            </h1>
            <div className="max-w-md space-y-4 text-zinc-400 font-bold">
              <p className="text-sm">
                {settings.language === 'ar' 
                  ? 'عذراً، هذا التطبيق مصمم حصرياً للعمل على أجهزة Fire TV و Android Box.' 
                  : 'Sorry, this application is exclusively designed for Fire TV and Android Box devices.'}
              </p>
              <div className="p-4 rounded-2xl achour-glass-modal flex items-center gap-4 text-left rtl:text-right">
                <Monitor className="text-gold shrink-0" size={24} />
                <p className="text-xs">
                  {settings.language === 'ar'
                    ? 'يرجى فتح التطبيق من خلال شاشة التلفاز للحصول على أفضل تجربة.'
                    : 'Please launch the app on your TV screen for the best experience.'}
                </p>
              </div>
            </div>
            <div className="mt-8 text-[10px] font-mono text-zinc-600 uppercase tracking-widest">
              Achour Player • TV Edition Only
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Dashboard & Content — Proportional Width/Height Compensation for 95% Viewport Scale */}
      <div
        className="fixed inset-0 z-10 overflow-hidden bg-transparent"
        onScroll={(e) => {
          if (e.currentTarget.scrollTop !== 0) e.currentTarget.scrollTop = 0;
          if (e.currentTarget.scrollLeft !== 0) e.currentTarget.scrollLeft = 0;
        }}
      >
        <div
          className={`bg-transparent transition-transform duration-200 ${isRestricted ? 'opacity-25 pointer-events-none' : ''}`}
          style={{
            transform: `scale(${effectiveScale})`,
            transformOrigin: isRtl ? 'top right' : 'top left',
            width: `${100 / effectiveScale}%`,
            height: `${100 / effectiveScale}%`,
          }}
        >
          {userId && homeStageReady && (
            <Dashboard 
              userId={userId} 
              settings={settings} 
              onUpdateSettings={setSettings} 
              onTriggerSplash={() => {
                setSplashIsPreview(true);
                setShowSplash(true);
              }}
              startupSplashComplete={!showSplash}
            />
          )}
        </div>
      </div>

      {/* Developer-only 16:9 simulator: strictly accessible via ?tvPreview=1 on web, zero buttons inside user/APK UI */}
      {!isNativeCapacitorApp() && tvPreviewMode && (
        <TvPreviewModal
          isOpen={tvPreviewMode}
          onClose={() => setTvPreviewMode(false)}
          settings={settings}
          userId={userId}
          onUpdateSettings={setSettings}
        />
      )}
    </div>
  );
}

