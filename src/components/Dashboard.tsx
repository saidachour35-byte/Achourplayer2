// Original path: src/components/Dashboard.tsx
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, RefreshCcw, LogOut, Plus, Tv, AlertCircle, CheckCircle2, 
  Clock, Upload, FolderPlus, Copy, Eye, Globe, Server, FileText, Check, X, Star,
  Film, Clapperboard, Calendar, ShieldCheck, AlertTriangle, Sparkles, ArrowUpDown
} from 'lucide-react';
import PlaylistManager from './PlaylistManager';
import LivePlayer from './LivePlayer';
import SettingsView from './SettingsView';
import AddPlaylistModal from './AddPlaylistModal';
import { AppSettings, Channel, Playlist } from '../types';
import { useI18n, formatExtractionProgressMessage } from '../utils/i18n';
import { collection, query, where, getDocs, doc, getDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { ICON_3D_STYLES } from '../utils/themeManager';
import { syncFavoritesFromFirestore } from '../utils/favoritesService';
import { ExtractionService, ExtractionProgress } from '../utils/extractionService';
import { initDB, getPlaylistExtractionStatus } from '../lib/db';
import { parseExpiryDate, fetchLiveSubscriptionExpiry } from '../utils/subscription';
import { navigateSpatial, parseTVKeyEvent, ensureInitialFocus, pushBackHandler, BackPriority, getCurrentTVFocus } from '../utils/tvNavigation';
import { getLastWatchedChannel } from '../utils/watchHistoryService';
import ExitConfirmModal from './ExitConfirmModal';
import ExtractionProgressModal from './ExtractionProgressModal';
import DashboardLayouts, { IconKind } from './DashboardLayouts';
import { isMobileDevice } from '../utils/platform';
import { setTVFocus } from '../utils/tvNavigation';

interface DashboardProps {
  userId: string;
  settings: AppSettings;
  onUpdateSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  onTriggerSplash?: () => void;
  startupSplashComplete?: boolean;
}

type View = 'home' | 'live' | 'movies' | 'series' | 'sports' | 'settings' | 'add';



// Separate Clock component to prevent full Dashboard re-renders every second
const ClockDisplay = React.memo(({ settings, isRtl }: { settings: AppSettings, isRtl: boolean }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedClock = React.useMemo(() => {
    const options: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      hour12: settings.timeFormat === '12h',
    };
    return currentTime.toLocaleTimeString(settings.language === 'ar' ? 'ar-EG' : settings.language, options);
  }, [currentTime, settings.timeFormat, settings.language]);

  const formattedDate = React.useMemo(() => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    return currentTime.toLocaleDateString(settings.language === 'ar' ? 'ar-EG' : settings.language, options);
  }, [currentTime, settings.language]);

  return (
    <div className="flex flex-col items-end text-right min-w-0">
      <span className="text-lg sm:text-3xl md:text-4xl font-black text-gold font-mono tracking-wider leading-none drop-shadow-md">
        {formattedClock}
      </span>
      <span className="text-[10px] sm:text-sm font-bold text-gold opacity-85 capitalize mt-1 tracking-tight max-w-full truncate">
        {formattedDate}
      </span>
    </div>
  );
});




export default function Dashboard({ userId, settings, onUpdateSettings, onTriggerSplash, startupSplashComplete = true }: DashboardProps) {
  const [currentView, setCurrentView] = useState<View>('home');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [showRepositionModal, setShowRepositionModal] = useState(false);
  const [reorderingKind, setReorderingKind] = useState<IconKind | null>(null);
  const reorderBackupRef = useRef<{
    dashboardOrder?: string[];
    dashboardAlignment?: AppSettings['dashboardAlignment'];
    dashboardHorizontalAlignment?: AppSettings['dashboardHorizontalAlignment'];
  } | null>(null);
  const selectHoldTimerRef = useRef<NodeJS.Timeout | null>(null);
  const selectHoldTriggeredRef = useRef(false);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [activePlaylistData, setActivePlaylistData] = useState<Playlist | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshToast, setRefreshToast] = useState(false);
  const [activePlaylistName, setActivePlaylistName] = useState<string>('');
  const [autoStartChannel, setAutoStartChannel] = useState<any>(null);
  const startupAutoOpenCheckedRef = useRef(false);
  
  // Extraction State
  const [extractionProgress, setExtractionProgress] = useState<ExtractionProgress | null>(null);
  const [pausedExtraction, setPausedExtraction] = useState<ExtractionProgress | null>(null);
  const [showExtractionModal, setShowExtractionModal] = useState(false);
  const dismissedExtractionRef = useRef<Set<string>>(new Set());

  const active3DStyle = React.useMemo(() => {
    return ICON_3D_STYLES.find(s => s.id === (settings.icon3DStyle || 'style-gold-3d')) || ICON_3D_STYLES[0];
  }, [settings.icon3DStyle]);

  const { t, isRtl } = useI18n(settings.language);

  useEffect(() => {
    if (!startupSplashComplete || startupAutoOpenCheckedRef.current) return;
    startupAutoOpenCheckedRef.current = true;
    if (!settings.autoPlayLastChannel || currentView !== 'home') return;

    const savedRecord = getLastWatchedChannel(settings.activePlaylistId || activePlaylistData?.id);
    if (savedRecord?.channel?.stream_id && savedRecord.channel.url) {
      setAutoStartChannel(savedRecord.channel);
      setCurrentView('live');
    }
  }, [startupSplashComplete, settings.autoPlayLastChannel, settings.activePlaylistId, activePlaylistData?.id, currentView]);

  // Check if extraction was already started by SplashScreen preload
  useEffect(() => {
    const existingProgress = (window as any).__ACHOUR_EXTRACTION_PROGRESS__;
    if (
      existingProgress &&
      existingProgress.stage !== 'completed' &&
      existingProgress.stage !== 'idle' &&
      existingProgress.stage !== 'paused' &&
      (!activePlaylistData || !dismissedExtractionRef.current.has(activePlaylistData.id))
    ) {
      setExtractionProgress(existingProgress);
      setShowExtractionModal(true);
    }

    const handleProgressEvent = (e: any) => {
      if (e.detail) {
        if (e.detail.stage === 'completed') {
          setPausedExtraction(null);
          (window as any).__ACHOUR_EXTRACTION_PROGRESS__ = null;
          setShowExtractionModal(false);
          setExtractionProgress(null);
          return;
        }
        if (e.detail.stage === 'paused') {
          setPausedExtraction(e.detail);
        } else {
          setPausedExtraction(null);
        }
        setExtractionProgress(e.detail);
        if (activePlaylistData && dismissedExtractionRef.current.has(activePlaylistData.id)) {
          return;
        }
        if (e.detail.stage !== 'paused') {
          setShowExtractionModal(true);
        }
      }
    };

    const handleNavigateView = (e: any) => {
      const target = e?.detail as View | undefined;
      if (target) setCurrentView(target);
    };

    window.addEventListener('achour_extraction_progress', handleProgressEvent);
    window.addEventListener('achour_navigate_view', handleNavigateView);
    return () => {
      window.removeEventListener('achour_extraction_progress', handleProgressEvent);
      window.removeEventListener('achour_navigate_view', handleNavigateView);
    };
  }, [activePlaylistData?.id]);

  // Check if extraction is needed (or paused & awaiting user resume) once splash completes and active playlist is determined
  useEffect(() => {
    if (!startupSplashComplete) return;
    if (activePlaylistData) {
      dismissedExtractionRef.current.delete(activePlaylistData.id);
      const checkAndExtract = async () => {
        const status = await getPlaylistExtractionStatus(activePlaylistData.id);
        if (status?.stage === 'paused') {
          setPausedExtraction(status);
          return;
        }
        if (status?.stage === 'completed') {
          setPausedExtraction(null);
          setShowExtractionModal(false);
          setExtractionProgress(null);
          return;
        }
        if (dismissedExtractionRef.current.has(activePlaylistData.id)) return;
        const existing =
          ExtractionService.getLatestProgress(activePlaylistData.id) ||
          (window as any).__ACHOUR_EXTRACTION_PROGRESS__;
        if (existing && existing.stage !== 'completed' && existing.stage !== 'error' && existing.stage !== 'paused') {
          setExtractionProgress(existing);
          setShowExtractionModal(true);
        }
        setPausedExtraction(null);
        if (!existing) {
          setShowExtractionModal(true);
        }
        await ExtractionService.extract(activePlaylistData, (progress) => {
          if (progress.stage === 'completed') {
            setPausedExtraction(null);
            (window as any).__ACHOUR_EXTRACTION_PROGRESS__ = null;
            setShowExtractionModal(false);
            setExtractionProgress(null);
            return;
          }
          if (progress.stage === 'paused') {
            setPausedExtraction(progress);
          }
          setExtractionProgress(progress);
        });
      };
      checkAndExtract();
    } else {
      setPausedExtraction(null);
      setExtractionProgress(null);
    }
  }, [activePlaylistData?.id, startupSplashComplete]);


  const fetchActivePlaylist = async () => {
    try {
      // 1. Check local playlists first if active
      const localSaved = localStorage.getItem('achour_local_playlists');
      const localList: Playlist[] = localSaved ? JSON.parse(localSaved) : [];

      if (settings.activePlaylistId) {
        const localFound = localList.find(p => p.id === settings.activePlaylistId);
        if (localFound) {
          setActivePlaylistName(localFound.name || 'IPTV');
          setActivePlaylistData(localFound);
          return;
        }

        try {
          const snap = await getDoc(doc(db, 'playlists', settings.activePlaylistId));
          if (snap.exists()) {
            const data = { id: snap.id, ...snap.data() } as Playlist;
            setActivePlaylistName(data.name || 'IPTV');
            setActivePlaylistData(data);
            return;
          }
        } catch (e) {
          console.warn('Firestore getDoc fallback warning:', e);
        }
      }

      // Check Firestore list
      const playlistsPath = 'playlists';
      try {
        const q = query(collection(db, playlistsPath), where('userId', '==', userId));
        const res = await getDocs(q);
        if (!res.empty) {
          const first = { id: res.docs[0].id, ...res.docs[0].data() } as Playlist;
          setActivePlaylistName(first.name || 'IPTV');
          setActivePlaylistData(first);
          onUpdateSettings(prev => ({ ...prev, activePlaylistId: first.id }));
          return;
        }
      } catch (err) {
        console.warn('Firestore playlist fetch note (offline cache fallback active):', err);
      }

      // Check local list fallback
      if (localList.length > 0) {
        setActivePlaylistName(localList[0].name || 'IPTV');
        setActivePlaylistData(localList[0]);
        onUpdateSettings(prev => ({ ...prev, activePlaylistId: localList[0].id }));
        return;
      }

      setActivePlaylistName('');
      setActivePlaylistData(null);
    } catch (err) {
      console.warn('Could not fetch active playlist name', err);
    }
  };

  useEffect(() => {
    setPausedExtraction(null);
    setExtractionProgress(null);
    if (settings.activePlaylistId) {
      dismissedExtractionRef.current.delete(settings.activePlaylistId);
    }
    fetchActivePlaylist();
  }, [userId, settings.activePlaylistId]);


  // Compute real subscription info strictly extracted from the active link
  const parsedSubscription = React.useMemo(() => {
    if (!activePlaylistData || !activePlaylistData.expDate) return null;
    const parsed = parseExpiryDate(activePlaylistData.expDate, settings.language);
    if (!parsed || !parsed.hasDate) return null;
    return parsed;
  }, [activePlaylistData?.expDate, settings.language]);



  // Background fetch/sync of live subscription expiration if not already present
  useEffect(() => {
    if (activePlaylistData && (activePlaylistData.expDate === undefined || activePlaylistData.expDate === null)) {
      fetchLiveSubscriptionExpiry(activePlaylistData).then(exp => {
        if (exp !== null && exp !== undefined) {
          setActivePlaylistData(prev => prev ? ({ ...prev, expDate: exp }) : null);
          try {
            const rawLocal = localStorage.getItem('achour_local_playlists');
            if (rawLocal) {
              const list: Playlist[] = JSON.parse(rawLocal);
              const updated = list.map(p => p.id === activePlaylistData.id ? ({ ...p, expDate: exp }) : p);
              localStorage.setItem('achour_local_playlists', JSON.stringify(updated));
            }
          } catch (e) {}
        }
      }).catch(() => {});
    }
  }, [activePlaylistData?.id, activePlaylistData?.url]);

  // Auto-Initial Focus for TV Remote Navigation once Splash finishes
  useEffect(() => {
    if (startupSplashComplete && currentView === 'home' && !showExtractionModal && !showExitModal && !showAddModal) {
      const timer = setTimeout(() => {
        if (!getCurrentTVFocus()) {
          ensureInitialFocus();
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [startupSplashComplete, currentView, showExtractionModal, showExitModal, showAddModal]);

  // Cancel reorder mode cleanly on Back button (at MODAL priority so it intercepts before exit confirmation)
  useEffect(() => {
    if (!reorderingKind) return;
    const unregister = pushBackHandler(() => {
      const backup = reorderBackupRef.current;
      if (backup) {
        onUpdateSettings(prev => ({
          ...prev,
          dashboardOrder: backup.dashboardOrder,
          dashboardAlignment: backup.dashboardAlignment,
          dashboardHorizontalAlignment: backup.dashboardHorizontalAlignment,
        }));
      }
      reorderBackupRef.current = null;
      const targetKind = reorderingKind;
      setReorderingKind(null);
      setTimeout(() => {
        const el = document.querySelector<HTMLElement>(`[data-dashboard-kind="${targetKind}"]`);
        if (el) setTVFocus(el, { scroll: false });
      }, 30);
      return true;
    }, BackPriority.MODAL);
    return unregister;
  }, [reorderingKind, onUpdateSettings]);

  // Register comprehensive back handlers for modals, subviews, and home dashboard
  useEffect(() => {
    const unregister = pushBackHandler(() => {
      if (showExtractionModal) {
        if (activePlaylistData) {
          dismissedExtractionRef.current.add(activePlaylistData.id);
        }
        setShowExtractionModal(false);
        return true;
      }
      if (showAddModal) {
        setShowAddModal(false);
        return true;
      }
      if (showRepositionModal) {
        setShowRepositionModal(false);
        return true;
      }
      if (showExitModal) {
        setShowExitModal(false);
        return true;
      }

      if (currentView !== 'home') {
        setCurrentView('home');
        return true;
      }

      setShowExitModal(true);
      return true;
    }, BackPriority.DASHBOARD);

    return unregister;
  }, [showExtractionModal, showAddModal, showExitModal, showRepositionModal, currentView, activePlaylistData?.id]);

  // Helper: move/swap active item in TV reorder mode along D-pad direction (or align on screen at boundaries)
  const handleTVReorderStep = React.useCallback((kind: IconKind, direction: 'up' | 'down' | 'left' | 'right') => {
    const tiles = Array.from(document.querySelectorAll<HTMLElement>('[data-dashboard-kind]'));
    const curEl = tiles.find(el => el.getAttribute('data-dashboard-kind') === kind);

    let neighborKind: IconKind | null = null;
    if (curEl) {
      const curRect = curEl.getBoundingClientRect();
      const cx = curRect.left + curRect.width / 2;
      const cy = curRect.top + curRect.height / 2;
      let bestScore = Infinity;

      for (const cand of tiles) {
        const candKind = cand.getAttribute('data-dashboard-kind') as IconKind | null;
        if (!candKind || candKind === kind) continue;
        const r = cand.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) continue;
        const tx = r.left + r.width / 2;
        const ty = r.top + r.height / 2;
        const dx = tx - cx;
        const dy = ty - cy;

        if (direction === 'up' && dy >= -10) continue;
        if (direction === 'down' && dy <= 10) continue;
        if (direction === 'left' && dx >= -10) continue;
        if (direction === 'right' && dx <= 10) continue;

        const score =
          direction === 'up' || direction === 'down'
            ? Math.abs(dy) + Math.abs(dx) * 1.4
            : Math.abs(dx) + Math.abs(dy) * 1.4;
        if (score < bestScore) {
          bestScore = score;
          neighborKind = candKind;
        }
      }
    }

    if (neighborKind) {
      onUpdateSettings(prev => {
        const base = ['live', 'movies', 'series', 'add', 'settings'];
        const order = [...(prev.dashboardOrder || []), ...base].filter(
          (value, index, list) => base.includes(value) && list.indexOf(value) === index
        );
        const fromIdx = order.indexOf(kind);
        const toIdx = order.indexOf(neighborKind!);
        if (fromIdx === -1 || toIdx === -1 || fromIdx === toIdx) return prev;
        const nextOrder = [...order];
        [nextOrder[fromIdx], nextOrder[toIdx]] = [nextOrder[toIdx], nextOrder[fromIdx]];
        return { ...prev, dashboardOrder: nextOrder };
      });
    } else if (direction === 'up' || direction === 'down') {
      onUpdateSettings(prev => {
        const curAlign = prev.dashboardAlignment || 'center';
        const nextAlign =
          direction === 'up'
            ? curAlign === 'bottom' ? 'center' : 'top'
            : curAlign === 'top' ? 'center' : 'bottom';
        return curAlign === nextAlign ? prev : { ...prev, dashboardAlignment: nextAlign };
      });
    } else {
      onUpdateSettings(prev => {
        const curH = prev.dashboardHorizontalAlignment || 'center';
        const nextH =
          direction === 'left'
            ? curH === 'right' ? 'center' : 'left'
            : curH === 'left' ? 'center' : 'right';
        return curH === nextH ? prev : { ...prev, dashboardHorizontalAlignment: nextH };
      });
    }

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const updatedEl = document.querySelector<HTMLElement>(`[data-dashboard-kind="${kind}"]`);
        if (updatedEl) setTVFocus(updatedEl, { scroll: false });
      });
    });
  }, [onUpdateSettings]);

  // Universal Keyboard & Remote D-Pad Navigation for Dashboard (capture phase prevents duplicate bubbling)
  useEffect(() => {
    if (currentView !== 'home') return;

    const isPhone = isMobileDevice();

    const enterReorderMode = (kind: IconKind) => {
      reorderBackupRef.current = {
        dashboardOrder: settings.dashboardOrder ? [...settings.dashboardOrder] : undefined,
        dashboardAlignment: settings.dashboardAlignment,
        dashboardHorizontalAlignment: settings.dashboardHorizontalAlignment,
      };
      setReorderingKind(kind);
    };

    const commitReorderMode = () => {
      reorderBackupRef.current = null;
      const targetKind = reorderingKind;
      setReorderingKind(null);
      try {
        localStorage.setItem('achour_settings', JSON.stringify(settings));
      } catch (err) {}
      if (targetKind) {
        setTimeout(() => {
          const el = document.querySelector<HTMLElement>(`[data-dashboard-kind="${targetKind}"]`);
          if (el) setTVFocus(el, { scroll: false });
        }, 25);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (showAddModal || showExitModal || showExtractionModal || showRepositionModal) return;
      const action = parseTVKeyEvent(e);

      if (action === 'UP' || action === 'DOWN' || action === 'LEFT' || action === 'RIGHT') {
        e.preventDefault();
        e.stopPropagation();
        const dir = action.toLowerCase() as 'up' | 'down' | 'left' | 'right';
        if (reorderingKind) {
          handleTVReorderStep(reorderingKind, dir);
        } else {
          navigateSpatial(dir, document.body, null);
        }
        return;
      }

      if (action === 'SELECT') {
        e.preventDefault();
        e.stopPropagation();

        if (reorderingKind) {
          if (!e.repeat) {
            commitReorderMode();
          }
          return;
        }

        const active = getCurrentTVFocus();
        const focusedKind = active?.getAttribute('data-dashboard-kind') as IconKind | null;

        // On TV / Desktop (!isPhone): Long press OK enters direct on-screen reorder mode
        if (!isPhone && focusedKind) {
          if (e.repeat) {
            if (selectHoldTimerRef.current) {
              clearTimeout(selectHoldTimerRef.current);
              selectHoldTimerRef.current = null;
            }
            if (!selectHoldTriggeredRef.current) {
              selectHoldTriggeredRef.current = true;
              enterReorderMode(focusedKind);
            }
            return;
          }

          if (!selectHoldTimerRef.current) {
            selectHoldTriggeredRef.current = false;
            selectHoldTimerRef.current = setTimeout(() => {
              selectHoldTimerRef.current = null;
              selectHoldTriggeredRef.current = true;
              enterReorderMode(focusedKind);
            }, 460);
          }
          return;
        }

        if (!e.repeat && active && typeof active.click === 'function') {
          active.click();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (currentView !== 'home' || showAddModal || showExitModal || showExtractionModal || showRepositionModal) return;
      const action = parseTVKeyEvent(e);
      if (action !== 'SELECT') return;

      if (selectHoldTimerRef.current) {
        clearTimeout(selectHoldTimerRef.current);
        selectHoldTimerRef.current = null;
      }

      if (selectHoldTriggeredRef.current) {
        e.preventDefault();
        e.stopPropagation();
        selectHoldTriggeredRef.current = false;
        return;
      }

      if (!isPhone && !reorderingKind) {
        const active = getCurrentTVFocus();
        if (active?.hasAttribute('data-dashboard-kind') && typeof active.click === 'function') {
          e.preventDefault();
          e.stopPropagation();
          active.click();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    window.addEventListener('keyup', handleKeyUp, { capture: true });
    return () => {
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
      window.removeEventListener('keyup', handleKeyUp, { capture: true });
      if (selectHoldTimerRef.current) {
        clearTimeout(selectHoldTimerRef.current);
        selectHoldTimerRef.current = null;
      }
    };
  }, [currentView, isRtl, showAddModal, showExitModal, showExtractionModal, showRepositionModal, reorderingKind, settings, handleTVReorderStep]);


  const moveDashboardTile = (kind: string, direction: 'left' | 'right' | 'up' | 'down') => {
    const base = ['live', 'movies', 'series', 'add', 'settings'];
    const order = [...(settings.dashboardOrder || []), ...base].filter((value, index, list) => base.includes(value) && list.indexOf(value) === index);
    const from = order.indexOf(kind);
    if (from < 0) return;
    const delta = direction === 'left' ? -1 : direction === 'right' ? 1 : direction === 'up' ? -2 : 2;
    const to = Math.max(0, Math.min(order.length - 1, from + delta));
    if (to === from) return;
    const next = [...order];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onUpdateSettings(prev => ({ ...prev, dashboardOrder: next }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleExitApp = () => {
    setShowExitModal(false);
    
    // Try Capacitor
    try {
      const capApp = (window as any).Capacitor?.Plugins?.App;
      if (capApp && typeof capApp.exitApp === 'function') {
        capApp.exitApp();
        return;
      }
    } catch (e) {}

    // Try Native JSBridge
    const native = (window as any).AchourNative || (window as any).Android || (window as any).JSBridge;
    if (native && typeof native.exitApp === 'function') {
      native.exitApp();
      return;
    }

    // Try Cordova
    if ((navigator as any).app && typeof (navigator as any).app.exitApp === 'function') {
      (navigator as any).app.exitApp();
      return;
    }
    
    // Try Tizen
    try { (window as any).tizen?.application?.getCurrentApplication()?.exit(); return; } catch(e){}
    
    // Try webOS
    try { (window as any).webOS?.window?.close(); return; } catch(e){}

    // Fallback for Web
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.close();
      window.location.href = 'about:blank';
    }
  };

  if (currentView === 'live') return (
    <LivePlayer
      onBack={() => {
        setAutoStartChannel(null);
        setCurrentView('home');
      }}
      settings={settings}
      onUpdateSettings={onUpdateSettings}
      userId={userId}
      initialChannelToPlay={autoStartChannel}
      onAutoPlayFallback={() => {
        setAutoStartChannel(null);
        setCurrentView('home');
      }}
    />
  );
  if (currentView === 'movies') return <LivePlayer onBack={() => setCurrentView('home')} settings={settings} onUpdateSettings={onUpdateSettings} userId={userId} initialType="movie" />;
  if (currentView === 'series') return <LivePlayer onBack={() => setCurrentView('home')} settings={settings} onUpdateSettings={onUpdateSettings} userId={userId} initialType="series" />;
  
  if (currentView === 'add') return <PlaylistManager onBack={() => setCurrentView('home')} userId={userId} settings={settings} onUpdateSettings={onUpdateSettings} />;
if (currentView === 'settings') return (
  <div
    className="h-full w-full overflow-hidden"
    style={{
      transform: `scale(${(settings.settingsScale ?? 90) / 100})`,
      transformOrigin: isRtl ? 'top right' : 'top left',
      width: `${10000 / (settings.settingsScale ?? 90)}%`,
      height: `${10000 / (settings.settingsScale ?? 90)}%`,
    }}
  >
    <SettingsView
      onBack={() => setCurrentView('home')}
      settings={settings}
      onUpdateSettings={onUpdateSettings}
      userId={userId}
      onTriggerSplash={onTriggerSplash}
    />
  </div>
);
  
  return (
    <>
      <div className={`relative h-full w-full bg-transparent flex flex-col select-none overflow-hidden ${isRtl ? 'text-right font-cairo' : 'text-left font-sans'}`}>


      {/* Top Header Bar - Single Top-Aligned Row: Left (Subscription Expiry), Center (App Name & Slightly Enlarged Logo), Right (Clock & Date) */}
      <div 
        dir="ltr"
        className="relative z-20 grid grid-cols-3 items-start justify-between gap-2 sm:gap-3 px-3 sm:px-5 pt-3 mb-2 shrink-0 w-full max-w-7xl mx-auto"
      >
        {/* 1. Left Side: Subscription Expiry (No Border/Frame, Theme-colored Active label) */}
        <div className="flex items-start justify-start min-w-0">
          {activePlaylistData ? (
            <div 
              dir={isRtl ? 'rtl' : 'ltr'}
              className={`py-1 flex items-center gap-2 sm:gap-2.5 max-w-full transition-colors ${
                parsedSubscription?.isExpired ? 'text-red-200' : 'text-gold'
              }`}
            >
              <div className={`hidden sm:flex shrink-0 ${
                parsedSubscription?.isExpired ? 'text-red-400' : 'text-gold'
              }`}
              style={!parsedSubscription?.isExpired ? { color: 'var(--theme-primary)' } : undefined}>
                <Calendar size={18} />
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-[11px] sm:text-sm font-medium truncate max-w-[90px] sm:max-w-[180px] ${
                      parsedSubscription?.isExpired ? 'text-red-200' : 'text-gold'
                    }`}
                    style={!parsedSubscription?.isExpired ? { color: 'var(--theme-primary)' } : undefined}
                  >
                    {activePlaylistData?.name || t('active_subscription')}
                  </span>
                  {parsedSubscription && (
                    <span
                      className={`text-[9px] sm:text-[10px] font-bold font-mono shrink-0 ${
                        parsedSubscription.isExpired ? 'text-red-300' : 'text-gold'
                      }`}
                      style={!parsedSubscription.isExpired ? { color: 'var(--theme-primary)' } : undefined}
                    >
                      {parsedSubscription.isExpired ? t('expired') : t('active')}
                    </span>
                  )}
                </div>
                <div
                  className={`flex items-center gap-1 text-[10px] sm:text-xs font-mono truncate ${
                    parsedSubscription?.isExpired ? 'text-red-300' : 'text-gold/90'
                  }`}
                >
                  <span
                    className={parsedSubscription?.isExpired ? 'text-red-300' : 'text-gold'}
                    style={!parsedSubscription?.isExpired ? { color: 'var(--theme-primary)' } : undefined}
                  >
                    {t('expire_short')}:
                  </span>
                  <strong
                    className={`${parsedSubscription?.isExpired ? 'text-red-200' : 'text-gold'} font-medium truncate`}
                    style={!parsedSubscription?.isExpired ? { color: 'var(--theme-primary)' } : undefined}
                  >
                    {parsedSubscription ? parsedSubscription.formattedDate : t('per_link_lifetime')}
                  </strong>
                  {parsedSubscription && !parsedSubscription.isExpired && parsedSubscription.daysRemaining !== null && parsedSubscription.daysRemaining < 999 && (
                    <span
                      className="text-gold/90 font-medium text-[10px] sm:text-[11px] shrink-0"
                      style={{ color: 'var(--theme-primary)' }}
                    >
                      {parsedSubscription.daysRemaining} {t('day_short')}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="w-8" />
          )}
        </div>

        {/* App name only: the brand artwork is reserved for the splash screen */}
        <div dir="ltr" className="flex items-center justify-center min-w-0 pt-0.5">
          <h1 className="text-sm sm:text-xl md:text-2xl font-semibold text-gold tracking-tight uppercase leading-none drop-shadow-md whitespace-nowrap">
            ACHOUR PLAYER
          </h1>
        </div>

        {/* 3. Right Side: Clock & Date */}
        <div className="flex items-start justify-end min-w-0">
          <ClockDisplay settings={settings} isRtl={isRtl} />
          {/* Hidden focus buffer */}
          <div className="opacity-0 w-0 h-0 pointer-events-none" data-tv-header-end="true" />
        </div>
      </div>

      {/* Active Background Extraction Banner (visible when minimized to background) */}
      {extractionProgress &&
        extractionProgress.stage !== 'completed' &&
        extractionProgress.stage !== 'paused' &&
        extractionProgress.stage !== 'error' &&
        activePlaylistData &&
        !showExtractionModal && (
        <div className="relative z-20 w-full max-w-3xl mx-auto px-4 mb-2 shrink-0">
          <div className="flex items-center justify-between gap-3 px-4 py-2 rounded-2xl bg-transparent">
            <div className="flex items-center gap-3 min-w-0">
              <RefreshCcw className="w-4 h-4 text-gold animate-spin shrink-0" />
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-bold text-white truncate">
                  {formatExtractionProgressMessage(extractionProgress.message, settings.language, extractionProgress.stage)} ({Math.round(extractionProgress.percent)}%)
                </p>
                {extractionProgress.counts && (
                  <p className="text-[11px] text-zinc-400 font-mono truncate">
                    {t('live')}: {extractionProgress.counts.live.toLocaleString()} · {t('movies')}: {extractionProgress.counts.movie.toLocaleString()} · {t('series')}: {extractionProgress.counts.series.toLocaleString()}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {extractionProgress.liveReady && (
                <button
                  data-tv-focusable="true"
                  tabIndex={0}
                  onClick={() => setCurrentView('live')}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500 text-black font-bold text-xs hover:bg-emerald-400 transition-colors cursor-pointer"
                >
                  {t('watch_live')}
                </button>
              )}
              <button
                data-tv-focusable="true"
                tabIndex={0}
                onClick={() => {
                  dismissedExtractionRef.current.delete(activePlaylistData.id);
                  setShowExtractionModal(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-transparent text-gold font-bold text-xs hover:text-white transition-colors cursor-pointer"
              >
                {t('details')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resumable Paused Extraction Bar (visible on Home when user paused extraction or reopened app) */}
      {pausedExtraction && pausedExtraction.stage === 'paused' && activePlaylistData && !showExtractionModal && (
        <div className="relative z-20 w-full max-w-3xl mx-auto px-4 mb-2 shrink-0">
          <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-2xl bg-transparent">
            <div className="flex items-center gap-3 min-w-0">
              <Clock className="w-5 h-5 text-amber-300 shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {t('extraction_paused_at')} {pausedExtraction.percent || 0}%
                </p>
                <p className="text-xs text-zinc-400 truncate">
                  {formatExtractionProgressMessage(pausedExtraction.message, settings.language, pausedExtraction.stage)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                data-tv-focusable="true"
                tabIndex={0}
                onClick={async () => {
                  dismissedExtractionRef.current.delete(activePlaylistData.id);
                  setShowExtractionModal(true);
                  await ExtractionService.extract(activePlaylistData, (p) => {
                    if (p.stage === 'completed') setPausedExtraction(null);
                    setExtractionProgress(p);
                  }, false);
                }}
                className="px-4 py-2 rounded-xl bg-gold text-black font-medium text-sm hover:brightness-110 transition-colors cursor-pointer"
              >
                {t('resume_extraction')}
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Main Content Area */}

        {/* TV Reorder Mode Live Hint Bar */}
        <AnimatePresence>
          {reorderingKind && (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="relative z-30 mx-auto mb-1 px-4 py-1.5 rounded-xl bg-black/80 border border-[var(--theme-primary)] text-gold text-xs font-bold flex items-center gap-3 shadow-lg shrink-0"
            >
              <span>
                {isRtl
                  ? 'وضع الترتيب: استخدم الأسهم لتحريك العنصر • OK للتثبيت والحفظ • Back للإلغاء'
                  : 'Reorder Mode: Use Arrows to move • OK to lock & save • Back to cancel'}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <motion.div
            key={`hub-layout-${settings.dashboardLayout || "layout-frameless-icons"}`}
            initial={{ opacity: 0, scale: 0.985 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.985 }}
            transition={{ duration: 0.18 }}
            onContextMenu={(e) => {
              if (isMobileDevice()) {
                e.preventDefault();
                setShowRepositionModal(true);
              }
            }}
            onPointerDown={() => {
              if (!isMobileDevice()) return;
              if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
              longPressTimerRef.current = setTimeout(() => {
                setShowRepositionModal(true);
              }, 650);
            }}
            onPointerUp={() => {
              if (longPressTimerRef.current) {
                clearTimeout(longPressTimerRef.current);
                longPressTimerRef.current = null;
              }
            }}
            onPointerCancel={() => {
              if (longPressTimerRef.current) {
                clearTimeout(longPressTimerRef.current);
                longPressTimerRef.current = null;
              }
            }}
            className={`flex-1 min-h-0 flex flex-col ${
              settings.dashboardAlignment === 'top'
                ? 'justify-start pt-6 sm:pt-10'
                : settings.dashboardAlignment === 'bottom'
                ? 'justify-end pb-8 sm:pb-12'
                : 'justify-center my-auto'
            } ${
              settings.dashboardHorizontalAlignment === 'left'
                ? 'items-start'
                : settings.dashboardHorizontalAlignment === 'right'
                ? 'items-end'
                : 'items-center'
            } w-full overflow-y-auto no-scrollbar px-2 sm:px-4`}
          >
            <DashboardLayouts
              layoutId={settings.dashboardLayout}
              dashboardOrder={settings.dashboardOrder}
              active3DStyle={active3DStyle}
              iconSize={settings.iconScale || "md"}
              frameScale={settings.frameScale || "md"}
              tileSpacing={settings.tileSpacing || "md"}
              reorderingKind={reorderingKind}
              language={settings.language}
              isRtl={isRtl}
              t={t}
              onNavigate={(view) => {
                if (!reorderingKind) setCurrentView(view);
              }}
              onExit={() => setShowExitModal(true)}
            />
          </motion.div>
        </AnimatePresence>

        {/* Extraction Progress Modal */}
        <AnimatePresence>
          {showExtractionModal && extractionProgress && (
            <ExtractionProgressModal
              progress={extractionProgress}
              playlistName={activePlaylistName}
              language={settings.language}
              onMinimize={() => {
                if (activePlaylistData) {
                  dismissedExtractionRef.current.add(activePlaylistData.id);
                }
                setShowExtractionModal(false);
              }}
              onWatchLive={() => {
                if (activePlaylistData) {
                  dismissedExtractionRef.current.add(activePlaylistData.id);
                }
                setShowExtractionModal(false);
                setCurrentView('live');
              }}
              onPause={() => {
                if (activePlaylistData && ExtractionService.isExtracting(activePlaylistData.id)) {
                  ExtractionService.cancel(activePlaylistData.id);
                }
              }}
              onClose={() => {
                if (activePlaylistData && ExtractionService.isExtracting(activePlaylistData.id)) {
                  dismissedExtractionRef.current.add(activePlaylistData.id);
                } else {
                  (window as any).__ACHOUR_EXTRACTION_PROGRESS__ = null;
                  setExtractionProgress(null);
                }
                setShowExtractionModal(false);
              }}
              onResume={async () => {
                if (activePlaylistData) {
                  dismissedExtractionRef.current.delete(activePlaylistData.id);
                  setShowExtractionModal(true);
                  await ExtractionService.extract(activePlaylistData, (progress) => {
                    if (progress.stage === 'completed') {
                      setPausedExtraction(null);
                      (window as any).__ACHOUR_EXTRACTION_PROGRESS__ = null;
                      setShowExtractionModal(false);
                      setExtractionProgress(null);
                      return;
                    }
                    setExtractionProgress(progress);
                  }, false);
                }
              }}
              onRetry={async () => {
                if (activePlaylistData) {
                  dismissedExtractionRef.current.delete(activePlaylistData.id);
                  setShowExtractionModal(true);
                  await ExtractionService.extract(activePlaylistData, (progress) => {
                    if (progress.stage === 'completed') {
                      setPausedExtraction(null);
                      (window as any).__ACHOUR_EXTRACTION_PROGRESS__ = null;
                      setShowExtractionModal(false);
                      setExtractionProgress(null);
                      return;
                    }
                    setExtractionProgress(progress);
                  }, true);
                }
              }}
            />
          )}
        </AnimatePresence>

        {/* Exit Confirmation Modal */}
        <ExitConfirmModal
          isOpen={showExitModal}
          onConfirmExit={handleExitApp}
          onCancel={() => setShowExitModal(false)}
          language={settings.language}
        />

        {/* Dashboard Icons Reposition Modal */}
        <AnimatePresence>
          {showRepositionModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-lg rounded-3xl p-6 bg-[#0e121d] border border-gold/40 shadow-2xl flex flex-col gap-5 text-white"
                dir={isRtl ? 'rtl' : 'ltr'}
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2.5">
                    <ArrowUpDown className="w-5 h-5 text-gold" />
                    <h3 className="text-lg font-bold text-gold">
                      {isRtl ? 'موضع الأيقونات على الشاشة' : 'Dashboard Icons Screen Position'}
                    </h3>
                  </div>
                  <button
                    data-tv-focusable="true"
                    tabIndex={0}
                    onClick={() => setShowRepositionModal(false)}
                    className="p-1.5 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>

                <p className="text-xs text-zinc-300">
                  {isRtl
                    ? 'اختر الموضع المناسب لعرض أيقونات التطبيق الرئيسية على شاشتك:'
                    : 'Choose where you want the main app icons positioned on your screen:'}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'top' as const, label: isRtl ? 'أعلى الشاشة' : 'Top', desc: isRtl ? 'رفع نحو الأعلى' : 'Upper area' },
                    { id: 'center' as const, label: isRtl ? 'منتصف الشاشة' : 'Center', desc: isRtl ? 'الوضع الافتراضي' : 'Balanced center' },
                    { id: 'bottom' as const, label: isRtl ? 'أسفل الشاشة' : 'Bottom', desc: isRtl ? 'تنزيل نحو الأسفل' : 'Lower dock' }
                  ].map((opt) => {
                    const active = (settings.dashboardAlignment || 'center') === opt.id;
                    return (
                      <button
                        key={opt.id}
                        data-tv-focusable="true"
                        tabIndex={0}
                        onClick={() => {
                          const updated = { ...settings, dashboardAlignment: opt.id };
                          onUpdateSettings(updated);
                          localStorage.setItem('achour_settings', JSON.stringify(updated));
                          setShowRepositionModal(false);
                        }}
                        className={`flex flex-col items-center justify-center p-4 rounded-2xl border text-center transition-all cursor-pointer ${
                          active
                            ? 'bg-gold/20 border-gold shadow-[0_0_15px_var(--theme-glow)] scale-[1.02]'
                            : 'bg-white/[0.04] border-white/10 hover:border-gold/50 hover:bg-white/[0.08]'
                        }`}
                      >
                        <span className="text-sm font-bold text-white mb-1">{opt.label}</span>
                        <span className="text-[11px] text-zinc-400">{opt.desc}</span>
                        {active && (
                          <span className="mt-2 text-gold">
                            <Check size={16} />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="border-t border-white/10 pt-3 space-y-2">
                  <div className="text-xs font-bold text-gold">{isRtl ? 'ترتيب إطارات لوحة التحكم' : 'Reorder Dashboard Tiles'}</div>
                  <p className="text-[11px] text-zinc-400">{isRtl ? 'استخدم الأسهم لتحريك الإطار. يتم حفظ الترتيب تلقائياً.' : 'Use the arrows to move a tile. The order is saved automatically.'}</p>
                  {(() => {
                    const base = ['live', 'movies', 'series', 'add', 'settings'];
                    const order = [...(settings.dashboardOrder || []), ...base].filter((value, index, list) => base.includes(value) && list.indexOf(value) === index);
                    const names: Record<string, string> = { live: isRtl ? 'المباشر' : 'Live', movies: isRtl ? 'الأفلام' : 'Movies', series: isRtl ? 'المسلسلات' : 'Series', add: isRtl ? 'إضافة قائمة' : 'Add Playlist', settings: isRtl ? 'الإعدادات' : 'Settings' };
                    return order.map((kind, index) => (
                      <div key={kind} className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl bg-white/[0.04] border border-white/10">
                        <span className="text-xs font-semibold text-white">{index + 1}. {names[kind]}</span>
                        <div className="flex items-center gap-1">
                          {(['left', 'up', 'down', 'right'] as const).map(direction => (
                            <button key={direction} data-tv-focusable="true" tabIndex={0}
                              onClick={() => moveDashboardTile(kind, direction)}
                              title={direction}
                              className="w-7 h-7 rounded-lg bg-white/10 hover:bg-gold hover:text-black text-zinc-200 text-sm font-black transition-colors">
                              {direction === 'left' ? '←' : direction === 'right' ? '→' : direction === 'up' ? '↑' : '↓'}
                            </button>
                          ))}
                        </div>
                      </div>
                    ));
                  })()}
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    data-tv-focusable="true"
                    tabIndex={0}
                    onClick={() => setShowRepositionModal(false)}
                    className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-sm font-medium text-white transition-colors cursor-pointer"
                  >
                    {isRtl ? 'إغلاق' : 'Close'}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Toast Notification */}
        <AnimatePresence>
          {refreshToast && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2 achour-glass-modal border-gold/40 text-gold rounded-2xl text-[11px] font-bold"
            >
              <CheckCircle2 size={14} className="text-emerald-400" />
              <span>{t('data_refreshed')}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

