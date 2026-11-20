// Original path: src/components/SettingsView.tsx
import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  ChevronLeft, ChevronRight, Globe,
  LayoutGrid, EyeOff,
  MonitorPlay, Clock, Check, X, Eye, Search, Trash2,
  Tv, Film, Clapperboard, Palette, Sparkles, Image,
  Upload, RefreshCw, Volume2, VolumeX, Shield, Maximize2,
  ArrowUpDown, Type, AppWindow, Target, Frame, Grid, Layers, Sliders, SunMoon, AlertTriangle
} from 'lucide-react';
import {
  EXTERNAL_PLAYER_PROFILES,
  isFireTVDevice,
  probeExternalPlayerInstalled,
  saveCustomPlayerPackage
} from '../utils/players';
import { AppSettings, Language, TimeFormat, ViewMode, VodSortBy, PosterSize, Playlist, ScreenPosition, LiveBarSize } from '../types';
import { SCREEN_POSITION_CELLS, WindowPositionButton } from './WindowPositionBar';
import { useI18n } from '../utils/i18n';
import { getPlatformUrl } from '../utils/platform';
import DesignSubViewContent, { DesignSubViewId } from './DesignSubViews';
import { xtreamFetch } from '../utils/iptv';
import axios from 'axios';
import { collection, query, where, getDocs, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, sanitizeForFirestore } from '../lib/firebase';
import { ExtractionService } from '../utils/extractionService';
import {
  clearWatchHistoryByType,
  getLastWatchedChannel,
  WatchHistoryType
} from '../utils/watchHistoryService';
import { APP_BACKGROUNDS } from '../utils/themeManager';
import {
  pushBackHandler,
  navigateSpatial,
  parseTVKeyEvent,
  BackPriority,
  ensureInitialFocus,
  getCurrentTVFocus,
  isTextInput
} from '../utils/tvNavigation';

interface SettingsViewProps {
  onBack: () => void;
  settings: AppSettings;
  onUpdateSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  userId: string;
  onTriggerSplash?: () => void;
}

const DESIGN_SUBVIEW_IDS = new Set<string>([
  'background-opacity',
  'window-sizes',
  'design-display',
  'design-icons',
  'design-frames',
  'design-layouts',
  'design-icon-size',
  'design-frame-size',
  'design-spacing',
  'design-alignment',
  'design-order',
  'design-colors',
  'design-custom-color',
  'design-glass-opacity',
  'design-glass-blur',
  'design-focus-mode',
  'design-label-color',
]);

type SettingsSubView =
  | 'main'
  | DesignSubViewId
  | 'language'
  | 'time'
  | 'view'
  | 'last-channel'
  | 'vod-sort'
  | 'poster-size'
  | 'poster-titles'
  | 'window-position'
  | 'players'
  | 'backgrounds'
  | 'categories-live'
  | 'categories-movie'
  | 'categories-series'
  | 'vpn'
  | 'splash-intro'
  | 'screen-zoom'
  | 'settings-scale'
  | 'live-scale'
  | 'vod-scale'
  | 'live-bar-size'
  | 'seek-step';

export const DEFAULT_PLAYERS = [
  'Achour Player (مدمج - Native)',
  'VLC for Android',
  'VLC Media Player',
  'MX Player Pro',
  'ExoPlayer',
  'MPV Player',
  'Nova Player',
  'Nova Video Player',
  'Just Player',
  'IJK Player',
  'PotPlayer',
  'KMPlayer'
];

// Isolated clock preview so main Settings never re-renders every 1 second
const SettingsTimePreview = React.memo(({
  language,
  timeFormat,
  onSelect,
  isRtl
}: {
  language: Language;
  timeFormat: TimeFormat;
  onSelect: (fmt: TimeFormat) => void;
  isRtl: boolean;
}) => {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const preview12 = useMemo(() => {
    return now.toLocaleTimeString(language === 'ar' ? 'ar-EG' : language, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }, [now, language]);

  const preview24 = useMemo(() => {
    return now.toLocaleTimeString(language === 'ar' ? 'ar-EG' : language, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  }, [now, language]);

  const items: Array<{ format: TimeFormat; label: string; preview: string }> = [
    { format: '12h', label: isRtl ? 'نظام 12 ساعة (AM / PM)' : '12-Hour Format (AM/PM)', preview: preview12 },
    { format: '24h', label: isRtl ? 'نظام 24 ساعة (00:00 - 23:59)' : '24-Hour Military Format', preview: preview24 },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {items.map((item) => {
        const active = timeFormat === item.format;
        return (
          <button
            key={item.format}
            data-tv-focusable="true"
            tabIndex={0}
            onClick={() => onSelect(item.format)}
            className={`sm:col-span-1 lg:col-span-2 flex flex-col justify-between p-4 rounded-2xl border transition-colors cursor-pointer min-h-[92px] ${
              active
                ? 'border-gold bg-gold/15'
                : 'border-white/10 bg-white/[0.04] hover:border-gold/40 hover:bg-white/[0.09]'
            } ${isRtl ? 'text-right' : 'text-left'}`}
          >
            <div className="flex items-center justify-between gap-2 w-full">
              <span className="text-base font-medium text-white">{item.label}</span>
              {active && (
                <span className="p-1.5 rounded-lg bg-gold text-black shrink-0">
                  <Check size={16} />
                </span>
              )}
            </div>
            <span className="text-lg font-mono text-gold mt-3 block">
              {isRtl ? 'المعاينة:' : 'Live:'} {item.preview}
            </span>
          </button>
        );
      })}
    </div>
  );
});




export default function SettingsView({ onBack, settings, onUpdateSettings, userId, onTriggerSplash }: SettingsViewProps) {
  const [subView, setSubView] = useState<SettingsSubView>('main');
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerPackage, setNewPlayerPackage] = useState('');
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<{ category_id: string; category_name: string }[]>([]);
  const [catLoading, setCatLoading] = useState(false);
  const [catSearch, setCatSearch] = useState('');
  const [catFilterTab, setCatFilterTab] = useState<'all' | 'visible' | 'hidden'>('all');
  const [playersTab, setPlayersTab] = useState<'internal' | 'external' | 'custom'>(() => {
    if (!settings.useExternalPlayer) return 'internal';
    const isBuiltInExternal = EXTERNAL_PLAYER_PROFILES.some(
      (p) => p.id === settings.selectedPlayer || p.aliases?.includes(settings.selectedPlayer)
    );
    return isBuiltInExternal ? 'external' : 'custom';
  });
  const [externalInstallMap, setExternalInstallMap] = useState<Record<string, boolean | 'unknown'>>({});
  const [splashTab, setSplashTab] = useState<'style' | 'sound'>('style');
  const [historyClearSuccess, setHistoryClearSuccess] = useState<string | null>(null);
  const [confirmClearType, setConfirmClearType] = useState<WatchHistoryType | null>(null);
  const [historyTick, setHistoryTick] = useState(0);
  const [syncInProgress] = useState(false);
  const [syncNotification, setSyncNotification] = useState<string | null>(null);
  const [showUploadPasteModal, setShowUploadPasteModal] = useState(false);

  const channelFileInputRef = useRef<HTMLInputElement | null>(null);
  const { t, isRtl } = useI18n(settings.language);

  useEffect(() => {
    if (subView !== 'players' || playersTab !== 'external') return;
    let cancelled = false;
    Promise.all(
      EXTERNAL_PLAYER_PROFILES.map(async (p) => {
        const res = await probeExternalPlayerInstalled(p.packageName, p.fallbackPackages);
        return [p.id, res.installed] as const;
      })
    ).then((entries) => {
      if (cancelled) return;
      const next: Record<string, boolean | 'unknown'> = {};
      entries.forEach(([id, status]) => {
        next[id] = status;
      });
      setExternalInstallMap(next);
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [subView, playersTab]);

  // Reset error cleanly whenever switching subviews or inner filter tabs
  useEffect(() => {
    setError('');
  }, [subView, catFilterTab, catSearch, playersTab, splashTab]);

  // Register pushBackHandler for SettingsView
  useEffect(() => {
    const priority = confirmClearType || showUploadPasteModal
      ? BackPriority.MODAL
      : subView !== 'main'
      ? BackPriority.SUBVIEW
      : BackPriority.VIEW;
    const unregister = pushBackHandler(() => {
      if (confirmClearType) {
        setConfirmClearType(null);
        return true;
      }
      if (showUploadPasteModal) {
        setShowUploadPasteModal(false);
        return true;
      }
      if (subView !== 'main') {
        setSubView('main');
        return true;
      }
      onBack();
      return true;
    }, priority);
    return unregister;
  }, [subView, confirmClearType, showUploadPasteModal, onBack]);

  // Auto-focus first valid control when entering main settings, subview, or confirmation dialog
  useEffect(() => {
    const tmr = setTimeout(() => {
      ensureInitialFocus();
    }, 60);
    return () => clearTimeout(tmr);
  }, [subView, playersTab, splashTab, confirmClearType]);

  // TV Remote D-Pad Navigation for SettingsView (capture phase avoids double-handling)
  useEffect(() => {

    const handleKeyDown = (e: KeyboardEvent) => {
      const action = parseTVKeyEvent(e);
      const activeEl = document.activeElement;

      // In Background Opacity view, Left ALWAYS decreases by 1% and Right ALWAYS increases by 1%
      if (subView === 'background-opacity') {
        if (action === 'RIGHT') {
          e.preventDefault();
          e.stopPropagation();
          onUpdateSettings((prev) => {
            const cur =
              typeof prev.backgroundOpacity === 'number' && !Number.isNaN(prev.backgroundOpacity)
                ? Math.round(prev.backgroundOpacity)
                : 62;
            return { ...prev, backgroundOpacity: Math.min(100, cur + 1) };
          });
          return;
        }
        if (action === 'LEFT') {
          e.preventDefault();
          e.stopPropagation();
          onUpdateSettings((prev) => {
            const cur =
              typeof prev.backgroundOpacity === 'number' && !Number.isNaN(prev.backgroundOpacity)
                ? Math.round(prev.backgroundOpacity)
                : 62;
            return { ...prev, backgroundOpacity: Math.max(0, cur - 1) };
          });
          return;
        }
      }

      if (isTextInput(activeEl)) {
        if (action === 'UP') {
          e.preventDefault(); e.stopPropagation(); navigateSpatial('up', document.body);
        } else if (action === 'DOWN') {
          e.preventDefault(); e.stopPropagation(); navigateSpatial('down', document.body);
        }
        return;
      }

      if (action === 'UP') {
        e.preventDefault(); e.stopPropagation(); navigateSpatial('up', document.body, null);
      } else if (action === 'DOWN') {
        e.preventDefault(); e.stopPropagation(); navigateSpatial('down', document.body, null);
      } else if (action === 'LEFT') {
        e.preventDefault(); e.stopPropagation(); navigateSpatial('left', document.body, null);
      } else if (action === 'RIGHT') {
        e.preventDefault(); e.stopPropagation(); navigateSpatial('right', document.body, null);
      } else if (action === 'SELECT') {
        const cur = getCurrentTVFocus();
        if (cur && typeof cur.click === 'function') {
          e.preventDefault();
          e.stopPropagation();
          cur.click();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => window.removeEventListener('keydown', handleKeyDown, { capture: true });
  }, [subView, onBack, onUpdateSettings]);

  const [pastedM3uText, setPastedM3uText] = useState('');
  const [pastedM3uName, setPastedM3uName] = useState('');

  const saveAndActivateM3uContent = async (fileName: string, content: string) => {
    if (!content.trim()) return;

    const lines = content.split('\n');
    let channelCount = 0;
    for (const l of lines) {
      if (l.startsWith('#EXTINF:')) channelCount++;
    }

    const playlistName = fileName.replace(/\.[^/.]+$/, '').trim() || 'ملف قنوات M3U';
    const k1 = 'achour_m3u_file_' + playlistName;
    const k2 = 'achour_m3u_file_' + fileName;

    // 1. Wipe old extracted storage before activating the new M3U source
    await ExtractionService.purgeStorageForSwitch([k1, k2]);

    try {
      localStorage.setItem(k1, content);
      localStorage.setItem(k2, content);
    } catch (err) {
      console.warn('LocalStorage error', err);
    }

    const newDocRef = doc(collection(db, 'playlists'));
    const canonicalId = newDocRef.id;
    const localItem = {
      id: canonicalId,
      name: playlistName,
      type: 'm3u' as const,
      url: 'local_file://' + fileName,
      portal: 'local_file://' + fileName,
      m3uContent: content,
      userId,
      createdAt: new Date().toISOString()
    };

    try {
      const rawLocal = localStorage.getItem('achour_local_playlists');
      const list = rawLocal ? JSON.parse(rawLocal) : [];
      localStorage.setItem('achour_local_playlists', JSON.stringify([localItem, ...list.filter((p: any) => p.id !== canonicalId)]));
    } catch (e) {
      console.warn(e);
    }

    try {
      await setDoc(newDocRef, sanitizeForFirestore({
        name: playlistName,
        type: 'm3u',
        url: 'local_file://' + fileName,
        portal: 'local_file://' + fileName,
        userId,
        createdAt: serverTimestamp()
      }));
    } catch (e) {
      console.warn('Firestore fallback to local:', e);
    }

    onUpdateSettings(prev => ({ ...prev, activePlaylistId: canonicalId }));
    setSyncNotification(
      isRtl
        ? `✓ تم حفظ وتفعيل ملف القنوات بنجاح: "${playlistName}" (${channelCount} قناة)`
        : `✓ Playlist content saved and activated: "${playlistName}" (${channelCount} channels)`
    );
    setShowUploadPasteModal(false);
    setPastedM3uText('');
    setPastedM3uName('');
    setTimeout(() => setSyncNotification(null), 5000);
  };

  const handleChannelFileUploadInSettings = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      if (content) {
        await saveAndActivateM3uContent(file.name, content);
      }
    };
    reader.readAsText(file);
  };

  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    onUpdateSettings(prev => ({ ...prev, [key]: value }));
  };

  const allPlayers = useMemo(() => {
    const list = [...DEFAULT_PLAYERS];
    (settings.externalPlayers || []).forEach(p => {
      if (!list.includes(p)) list.push(p);
    });
    return list;
  }, [settings.externalPlayers]);

  const fetchCategories = async (type: 'live' | 'movie' | 'series') => {
    setCatLoading(true);
    setCategories([]);
    try {
      let p: any = null;
      if (settings.activePlaylistId) {
        try {
          const docSnap = await getDoc(doc(db, 'playlists', settings.activePlaylistId));
          if (docSnap.exists()) {
            p = { id: docSnap.id, ...docSnap.data() };
          }
        } catch (e) {
          console.warn('Could not fetch active playlist doc', e);
        }
      }

      if (!p) {
        try {
          const rawLocal = localStorage.getItem('achour_local_playlists');
          const localList: Playlist[] = rawLocal ? JSON.parse(rawLocal) : [];
          const found = localList.find(pl => pl.id === settings.activePlaylistId);
          if (found) {
            p = found;
          } else {
            const q = query(collection(db, 'playlists'), where('userId', '==', userId));
            const snapshot = await getDocs(q);
            if (!snapshot.empty) {
              p = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
            }
          }
        } catch (e) {
          console.warn('Could not query playlists', e);
        }
      }

      if (p) {
        let xHost = p.url || '';
        let xUser = p.username || '';
        let xPass = p.password || '';
        if (p.url && (!xUser || !xPass)) {
          try {
            const u = new URL(p.url.startsWith('http') ? p.url : 'http://' + p.url);
            const userParam = u.searchParams.get('username');
            const passParam = u.searchParams.get('password');
            if (userParam && passParam) {
              xUser = userParam;
              xPass = passParam;
              xHost = u.origin;
            }
          } catch (e) {}
        }

        if (p.type === 'xtream' || (xUser && xPass)) {
          const host = xHost.trim().replace(/\/+$/, '').replace(/\/(player_api|get|index)\.php.*$/i, '').replace(/\/c\/?$/i, '').replace(/\?.*$/, '');
          let action = 'get_live_categories';
          if (type === 'movie') action = 'get_vod_categories';
          if (type === 'series') action = 'get_series_categories';

          const res = await xtreamFetch(host, xUser, xPass, action);
          if (res.ok && res.rawList && res.rawList.length > 0) {
            setCategories(res.rawList.map((c: any) => ({
              category_id: String(c.category_id || c.id || c.name || Math.random()),
              category_name: String(c.category_name || c.name || 'Unnamed Category')
            })));
            return;
          }
        }

        let rawContent = p.m3uContent || '';
        if (!rawContent && p.url?.startsWith('local_file://')) {
          const fileName = p.url.replace('local_file://', '');
          rawContent = localStorage.getItem('achour_m3u_file_' + fileName) || localStorage.getItem('achour_m3u_file_' + p.name) || '';
        } else if (!rawContent && p.url) {
          try {
            const fetchUrl = getPlatformUrl('m3u', p.url);
            const res = await axios.get(fetchUrl);
            rawContent = typeof res.data === 'string' ? res.data : '';
          } catch (err) {
            try {
              const fetchUrl2 = getPlatformUrl('get', p.url);
              const res2 = await axios.get(fetchUrl2);
              rawContent = typeof res2.data === 'string' ? res2.data : '';
            } catch (e) {}
          }
        }

        if (rawContent) {
          const groupTitleMatches = rawContent.match(/group-title="([^"]+)"/g) || [];
          const extGrpMatches = rawContent.match(/#EXTGRP:(.+)/g) || [];

          const titles = [
            ...groupTitleMatches.map((m: string) => m.replace(/group-title="|"/g, '').trim()),
            ...extGrpMatches.map((m: string) => m.replace('#EXTGRP:', '').trim())
          ].filter(Boolean);

          if (titles.length > 0) {
            const uniqueGroups = Array.from(new Set(titles));
            const filteredGroups = uniqueGroups.filter(g => {
              const lower = g.toLowerCase();
              if (type === 'movie') {
                return lower.includes('movie') || lower.includes('film') || lower.includes('vod') || lower.includes('cinema') || g.includes('أفلام') || g.includes('افلام') || g.includes('فيلم');
              } else if (type === 'series') {
                return lower.includes('serie') || lower.includes('show') || lower.includes('season') || g.includes('مسلسل') || g.includes('مسلسلات') || g.includes('دراما');
              } else {
                return !lower.includes('vod') && !lower.includes('film') && !lower.includes('movie') && !lower.includes('serie') && !g.includes('أفلام') && !g.includes('مسلسلات');
              }
            });

            const targetList = filteredGroups.length > 0 ? filteredGroups : uniqueGroups;
            setCategories(targetList.map(name => ({ category_id: name, category_name: name })));
            return;
          }
        }
      }

      setCategories([]);
    } catch (err) {
      console.error('Error fetching categories in SettingsView:', err);
      setCategories([]);
    } finally {
      setCatLoading(false);
    }
  };

  useEffect(() => {
    if (subView === 'categories-live') fetchCategories('live');
    if (subView === 'categories-movie') fetchCategories('movie');
    if (subView === 'categories-series') fetchCategories('series');
    setCatSearch('');
    setCatFilterTab('all');
  }, [subView]);

  const handleLanguageSelect = (lang: Language) => {
    try {
      localStorage.setItem('achour_user_selected_lang', 'true');
      localStorage.setItem('achour_lang_initialized_v3', 'true');
    } catch {}
    updateSetting('language', lang);
    setSubView('main');
  };

  const handleTimeFormatSelect = (format: TimeFormat) => {
    updateSetting('timeFormat', format);
    setSubView('main');
  };

  const handleViewModeSelect = (mode: ViewMode) => {
    try {
      localStorage.setItem('achour_viewmode_user_set', 'true');
    } catch {}
    updateSetting('viewMode', mode);
    setSubView('main');
  };

  const handlePlayerSelect = (player: string) => {
    updateSetting('selectedPlayer', player);
    setSubView('main');
  };

  const handleAddPlayer = () => {
    const name = newPlayerName.trim();
    const pkg = newPlayerPackage.trim();
    if (!name) return;
    if (allPlayers.includes(name)) {
      setError(isRtl ? 'هذا المشغل مضاف بالفعل' : 'Player already exists');
      return;
    }
    if (pkg) {
      saveCustomPlayerPackage(name, pkg);
    }
    const updatedPlayers = [...(settings.externalPlayers || []), name];
    updateSetting('externalPlayers', updatedPlayers);
    updateSetting('useExternalPlayer', true);
    updateSetting('selectedPlayer', name);
    setNewPlayerName('');
    setNewPlayerPackage('');
    setError('');
  };

  const handleDeletePlayer = (e: React.MouseEvent, playerName: string) => {
    e.stopPropagation();
    const updated = allPlayers.filter(p => p !== playerName);
    updateSetting('externalPlayers', updated);
    if (settings.selectedPlayer === playerName) {
      updateSetting('selectedPlayer', updated[0] || DEFAULT_PLAYERS[0]);
      updateSetting('useExternalPlayer', false);
    }
  };

  const handleSelectBackground = (bgId: string) => {
    updateSetting('backgroundStyle', bgId);
    updateSetting('customBackground', null);
  };

  const toggleCategoryVisibility = (catId: string) => {
    const cat = categories.find(c => c.category_id === catId);
    const idsToToggle = cat ? Array.from(new Set([cat.category_id, cat.category_name].filter(Boolean))) : [catId];

    if (subView === 'categories-movie') {
      const list = settings.hiddenMovieCategories || [];
      const isHidden = list.includes(catId) || (cat && list.includes(cat.category_name));
      const newHidden = isHidden
        ? list.filter(id => !idsToToggle.includes(id))
        : Array.from(new Set([...list, ...idsToToggle]));
      updateSetting('hiddenMovieCategories', newHidden);
    } else if (subView === 'categories-series') {
      const list = settings.hiddenSeriesCategories || [];
      const isHidden = list.includes(catId) || (cat && list.includes(cat.category_name));
      const newHidden = isHidden
        ? list.filter(id => !idsToToggle.includes(id))
        : Array.from(new Set([...list, ...idsToToggle]));
      updateSetting('hiddenSeriesCategories', newHidden);
    } else {
      const list = settings.hiddenLiveCategories || [];
      const isHidden = list.includes(catId) || (cat && list.includes(cat.category_name));
      const newHidden = isHidden
        ? list.filter(id => !idsToToggle.includes(id))
        : Array.from(new Set([...list, ...idsToToggle]));
      updateSetting('hiddenLiveCategories', newHidden);
    }
  };

  const showAllVisibleCategories = () => {
    const categoryIdentifiers = categories.flatMap(c => [c.category_id, c.category_name]).filter(Boolean);
    if (subView === 'categories-movie') {
      updateSetting('hiddenMovieCategories', (settings.hiddenMovieCategories || []).filter(id => !categoryIdentifiers.includes(id)));
    } else if (subView === 'categories-series') {
      updateSetting('hiddenSeriesCategories', (settings.hiddenSeriesCategories || []).filter(id => !categoryIdentifiers.includes(id)));
    } else {
      updateSetting('hiddenLiveCategories', (settings.hiddenLiveCategories || []).filter(id => !categoryIdentifiers.includes(id)));
    }
  };

  const hideAllVisibleCategories = () => {
    const categoryIdentifiers = categories.flatMap(c => [c.category_id, c.category_name]).filter(Boolean);
    if (subView === 'categories-movie') {
      updateSetting('hiddenMovieCategories', Array.from(new Set([...(settings.hiddenMovieCategories || []), ...categoryIdentifiers])));
    } else if (subView === 'categories-series') {
      updateSetting('hiddenSeriesCategories', Array.from(new Set([...(settings.hiddenSeriesCategories || []), ...categoryIdentifiers])));
    } else {
      updateSetting('hiddenLiveCategories', Array.from(new Set([...(settings.hiddenLiveCategories || []), ...categoryIdentifiers])));
    }
  };

  const handleConfirmClearWatchHistory = () => {
    if (!confirmClearType) return;
    clearWatchHistoryByType(confirmClearType);
    const clearedKind = confirmClearType;
    setConfirmClearType(null);
    setHistoryTick(n => n + 1);
    setHistoryClearSuccess(clearedKind);
    setTimeout(() => setHistoryClearSuccess(null), 2600);
  };

  const filteredCategories = useMemo(() => {
    let list = categories;
    let hiddenList = settings.hiddenLiveCategories || [];
    if (subView === 'categories-movie') hiddenList = settings.hiddenMovieCategories || [];
    if (subView === 'categories-series') hiddenList = settings.hiddenSeriesCategories || [];

    if (catFilterTab === 'visible') {
      list = list.filter(c => !hiddenList.includes(c.category_id) && !hiddenList.includes(c.category_name));
    } else if (catFilterTab === 'hidden') {
      list = list.filter(c => hiddenList.includes(c.category_id) || hiddenList.includes(c.category_name));
    }
    if (!catSearch.trim()) return list;
    const q = catSearch.toLowerCase();
    return list.filter(c => c.category_name.toLowerCase().includes(q));
  }, [categories, catSearch, catFilterTab, subView, settings.hiddenLiveCategories, settings.hiddenMovieCategories, settings.hiddenSeriesCategories]);

  const currentBgOpacity =
    typeof settings.backgroundOpacity === 'number' && !Number.isNaN(settings.backgroundOpacity)
      ? Math.max(0, Math.min(100, Math.round(settings.backgroundOpacity)))
      : 62;

  // Grouped settings for structured display (each customization option has its own independent tile)
  const settingsGroups: Array<{
    title: string;
    items: Array<{
      icon: React.ComponentType<any>;
      label: string;
      subLabel?: string;
      action: () => void;
    }>;
  }> = [
    {
      title: isRtl ? 'المظهر وتصميم الواجهة' : 'Appearance & UI Design',
      items: [
        {
          icon: SunMoon,
          label: 'Background Opacity',
          subLabel: isRtl ? `تعتيم الخلفية · ${currentBgOpacity}%` : `${currentBgOpacity}%`,
          action: () => setSubView('background-opacity'),
        },
        { icon: Palette, label: isRtl ? 'ألوان التطبيق' : 'App Theme Colors', action: () => setSubView('design-colors') },
        { icon: Sparkles, label: isRtl ? 'لون مخصص (HEX)' : 'Custom Color (HEX)', action: () => setSubView('design-custom-color') },
        { icon: Eye, label: isRtl ? 'طريقة عرض الأيقونات' : 'Icon Display Mode', action: () => setSubView('design-display') },
        { icon: Sparkles, label: isRtl ? 'شكل الأيقونات (40)' : 'Icon Styles (40)', action: () => setSubView('design-icons') },
        { icon: Frame, label: isRtl ? 'شكل الإطارات (40)' : 'Frame Shapes (40)', action: () => setSubView('design-frames') },
        { icon: Grid, label: isRtl ? 'تخطيطات الواجهة (40)' : 'Interface Layouts (40)', action: () => setSubView('design-layouts') },
        { icon: Maximize2, label: isRtl ? 'حجم الأيقونات' : 'Icon Size', action: () => setSubView('design-icon-size') },
        { icon: Frame, label: isRtl ? 'حجم الإطارات' : 'Frame Size', action: () => setSubView('design-frame-size') },
        { icon: Sliders, label: isRtl ? 'المسافة بين الأقسام' : 'Section Spacing', action: () => setSubView('design-spacing') },
        { icon: AppWindow, label: isRtl ? 'محاذاة الأقسام' : 'Screen Alignment', action: () => setSubView('design-alignment') },
        { icon: ArrowUpDown, label: isRtl ? 'ترتيب الأقسام الخمسة' : 'Reorder Sections', action: () => setSubView('design-order') },
        { icon: Sliders, label: isRtl ? 'شفافية البطاقات' : 'Glass Opacity', action: () => setSubView('design-glass-opacity') },
        { icon: Layers, label: isRtl ? 'التأثير الضبابي (Blur)' : 'Frosted Glass Blur', action: () => setSubView('design-glass-blur') },
        { icon: Target, label: isRtl ? 'نمط الفوكس' : 'TV Focus Mode', action: () => setSubView('design-focus-mode') },
        { icon: Type, label: isRtl ? 'لون نصوص الواجهة' : 'Section Label Colors', action: () => setSubView('design-label-color') },
        { icon: AppWindow, label: t('window_position'), action: () => setSubView('window-position') },
        { icon: Image, label: t('app_backgrounds'), action: () => setSubView('backgrounds') },
        { icon: Volume2, label: t('splash_intro'), action: () => setSubView('splash-intro') },
        { icon: Shield, label: t('anti_block_vpn'), action: () => setSubView('vpn') },
      ]
    },
    {
      title: isRtl ? 'الأحجام' : 'Sizes & Scaling',
      items: [
        { icon: AppWindow, label: isRtl ? 'أحجام جميع النوافذ' : 'Window & Popup Sizes', subLabel: `${settings.windowScales?.global ?? 100}%`, action: () => setSubView('window-sizes') },
        { icon: Maximize2, label: t('screen_zoom'), action: () => setSubView('screen-zoom') },
        { icon: Maximize2, label: isRtl ? 'تكبير صفحة الإعدادات' : 'Settings Page Size', action: () => setSubView('settings-scale') },
        { icon: Tv, label: isRtl ? 'تكبير صفحة المباشر' : 'Live Page Size', action: () => setSubView('live-scale') },
        {
          icon: Tv,
          label: isRtl ? 'حجم شريط البث المباشر' : 'Live Bar Size',
          subLabel:
            (settings.liveBarSize || 'default') === 'full'
              ? (isRtl ? 'ملء عرض الشاشة' : 'Full Screen Width')
              : (settings.liveBarSize || 'default') === 'compact'
              ? (isRtl ? 'حجم أصغر' : 'Smaller Size')
              : (isRtl ? 'الحجم الحالي' : 'Current Size'),
          action: () => setSubView('live-bar-size')
        },
        { icon: Film, label: isRtl ? 'تكبير الأفلام والمسلسلات' : 'Movies & Series Page Size', action: () => setSubView('vod-scale') },
        { icon: Clock, label: t('seek_step'), action: () => setSubView('seek-step') },
      ]
    },
    {
      title: isRtl ? 'نسب العرض إلى الارتفاع والتشغيل' : 'Aspect Ratios & Playback',
      items: [
        { icon: LayoutGrid, label: t('view_mode'), action: () => setSubView('view') },
        {
          icon: MonitorPlay,
          label: t('players_title'),
          subLabel: `${settings.useExternalPlayer ? (isRtl ? 'خارجي' : 'External') : (isRtl ? 'مدمج' : 'Internal')} · ${settings.selectedPlayer || 'Achour Player'}`,
          action: () => setSubView('players')
        },
        { icon: ArrowUpDown, label: t('sort_by'), action: () => setSubView('vod-sort') },
        { icon: Film, label: t('poster_size'), action: () => setSubView('poster-size') },
        { icon: Type, label: t('poster_titles'), action: () => setSubView('poster-titles') },
      ]
    },
    {
      title: isRtl ? 'اللغة والاتجاه والنظام' : 'Language & System',
      items: [
        { icon: Globe, label: t('language'), action: () => setSubView('language') },
        { icon: Clock, label: t('time_format'), action: () => setSubView('time') },
        { icon: Tv, label: t('auto_open_last_channel'), action: () => setSubView('last-channel') },
        { icon: Trash2, label: t('clear_movie_history'), action: () => setConfirmClearType('movie') },
        { icon: Trash2, label: t('clear_series_history'), action: () => setConfirmClearType('series') },
        { icon: Trash2, label: t('clear_channel_history'), action: () => setConfirmClearType('live') },
      ]
    }
  ];

  // SUBVIEW: LANGUAGE
  if (subView === 'language') {
    return (
      <SubViewContainer title={t('language')} onBack={() => setSubView('main')} isRtl={isRtl}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          {[
            { code: 'en', label: 'English', name: 'English (Default)', flag: '🇬🇧' },
            { code: 'ar', label: 'العربية', name: 'Arabic', flag: '🇸🇦' },
            { code: 'fr', label: 'Français', name: 'French', flag: '🇫🇷' },
            { code: 'de', label: 'Deutsch', name: 'German', flag: '🇩🇪' },
          ].map((lang) => (
            <TileOptionButton
              key={lang.code}
              title={`${lang.flag} ${lang.label}`}
              subtitle={lang.name}
              active={settings.language === lang.code}
              onClick={() => handleLanguageSelect(lang.code as Language)}
              isRtl={isRtl}
            />
          ))}
        </div>
      </SubViewContainer>
    );
  }

  // SUBVIEW: TIME FORMAT
  if (subView === 'time') {
    return (
      <SubViewContainer title={t('time_format')} onBack={() => setSubView('main')} isRtl={isRtl}>
        <SettingsTimePreview
          language={settings.language}
          timeFormat={settings.timeFormat}
          onSelect={handleTimeFormatSelect}
          isRtl={isRtl}
        />
      </SubViewContainer>
    );
  }

  // SUBVIEW: SEEK STEP (10s / 20s / 30s)
  if (subView === 'seek-step') {
    const currentStep = settings.seekStep || 10;
    const stepOptions: Array<{ val: 10 | 20 | 30; label: string; desc: string }> = [
      { val: 10, label: isRtl ? '10 ثوانٍ' : '10 Seconds', desc: isRtl ? 'الافتراضي — خطوة دقيقة' : 'Default step' },
      { val: 20, label: isRtl ? '20 ثانية' : '20 Seconds', desc: isRtl ? 'خطوة متوسطة' : 'Balanced step' },
      { val: 30, label: isRtl ? '30 ثانية' : '30 Seconds', desc: isRtl ? 'تقديم وترجيع سريع' : 'Fast step' },
    ];
    return (
      <SubViewContainer title={t('seek_step')} onBack={() => setSubView('main')} isRtl={isRtl}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {stepOptions.map((opt) => (
            <TileOptionButton
              key={opt.val}
              title={opt.label}
              subtitle={opt.desc}
              active={currentStep === opt.val}
              onClick={() => {
                updateSetting('seekStep', opt.val);
                setSubView('main');
              }}
              isRtl={isRtl}
            />
          ))}
        </div>
      </SubViewContainer>
    );
  }

  // SUBVIEW: VIEW MODE
  if (subView === 'view') {
    const activeViewMode = settings.viewMode || 'grid';
    return (
      <SubViewContainer title={t('view_mode')} onBack={() => setSubView('main')} isRtl={isRtl}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {(['list', 'grid'] as ViewMode[]).map((mode) => (
            <TileOptionButton
              key={mode}
              title={t(mode)}
              subtitle={mode === 'list' ? t('view_list_desc') : t('view_grid_desc')}
              active={activeViewMode === mode}
              onClick={() => handleViewModeSelect(mode)}
              isRtl={isRtl}
            />
          ))}
        </div>
      </SubViewContainer>
    );
  }

  // SUBVIEW: AUTO OPEN LAST WATCHED CHANNEL
  if (subView === 'last-channel') {
    const savedLast = getLastWatchedChannel(settings.activePlaylistId);
    const savedChannelName = savedLast?.channel?.name;
    const enabled = Boolean(settings.autoPlayLastChannel);
    return (
      <SubViewContainer title={t('auto_open_last_channel')} onBack={() => setSubView('main')} isRtl={isRtl}>
        <div className="space-y-3">
          <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 text-xs sm:text-sm text-zinc-300 flex items-center justify-between gap-2">
            <span>{t('auto_open_last_channel_desc')}</span>
            {savedChannelName && (
              <span className="px-2.5 py-1 rounded-xl bg-gold/15 border border-gold/35 text-gold text-xs font-medium shrink-0">
                {savedChannelName}
              </span>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <TileOptionButton
              title={t('enabled')}
              subtitle={savedChannelName || undefined}
              active={enabled}
              onClick={() => {
                updateSetting('autoPlayLastChannel', true);
                setSubView('main');
              }}
              isRtl={isRtl}
            />
            <TileOptionButton
              title={t('disabled')}
              active={!enabled}
              onClick={() => {
                updateSetting('autoPlayLastChannel', false);
                setSubView('main');
              }}
              isRtl={isRtl}
            />
          </div>
        </div>
      </SubViewContainer>
    );
  }

  // SUBVIEW: MOVIES & SERIES SORT ORDER
  if (subView === 'vod-sort') {
    const currentSort = settings.vodSortBy || 'newest';
    const sortOptions: Array<{ id: VodSortBy; label: string }> = [
      { id: 'newest', label: t('sort_newest') },
      { id: 'oldest', label: t('sort_oldest') },
      { id: 'alpha', label: t('sort_alpha') },
      { id: 'rating', label: t('sort_rating') },
    ];
    return (
      <SubViewContainer title={t('sort_by')} onBack={() => setSubView('main')} isRtl={isRtl}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {sortOptions.map((opt) => (
            <TileOptionButton
              key={opt.id}
              title={opt.label}
              active={currentSort === opt.id}
              onClick={() => {
                updateSetting('vodSortBy', opt.id);
                setSubView('main');
              }}
              isRtl={isRtl}
            />
          ))}
        </div>
      </SubViewContainer>
    );
  }

  // SUBVIEW: POSTER SIZE (Small / Medium / Large)
  if (subView === 'poster-size') {
    const currentSize = settings.posterSize || 'medium';
    const sizeOptions: Array<{ id: PosterSize; label: string; desc: string }> = [
      { id: 'small', label: t('small'), desc: isRtl ? '5 بوسترات في الصف' : '5 posters per row' },
      { id: 'medium', label: t('medium'), desc: isRtl ? '4 بوسترات في الصف (الافتراضي)' : '4 posters per row (Default)' },
      { id: 'large', label: t('large'), desc: isRtl ? '3 بوسترات كبيرة في الصف' : '3 large posters per row' },
    ];
    return (
      <SubViewContainer title={t('poster_size')} onBack={() => setSubView('main')} isRtl={isRtl}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {sizeOptions.map((opt) => (
            <TileOptionButton
              key={opt.id}
              title={opt.label}
              subtitle={opt.desc}
              active={currentSize === opt.id}
              onClick={() => {
                updateSetting('posterSize', opt.id);
                setSubView('main');
              }}
              isRtl={isRtl}
            />
          ))}
        </div>
      </SubViewContainer>
    );
  }

  // SUBVIEW: POSTER TITLES (Show / Hide)
  if (subView === 'poster-titles') {
    const showing = Boolean(settings.showPosterTitles);
    return (
      <SubViewContainer title={t('poster_titles')} onBack={() => setSubView('main')} isRtl={isRtl}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <TileOptionButton
            title={t('show')}
            subtitle={isRtl ? 'إظهار الاسم أسفل كل بوستر' : 'Show title below each poster'}
            active={showing}
            onClick={() => {
              updateSetting('showPosterTitles', true);
              setSubView('main');
            }}
            isRtl={isRtl}
          />
          <TileOptionButton
            title={t('hide')}
            subtitle={isRtl ? 'عرض البوستر فقط دون نص' : 'Show posters only without text'}
            active={!showing}
            onClick={() => {
              updateSetting('showPosterTitles', false);
              setSubView('main');
            }}
            isRtl={isRtl}
          />
        </div>
      </SubViewContainer>
    );
  }

  // SUBVIEWS: BACKGROUND OPACITY & SEPARATED UI DESIGN OPTIONS (instant auto-save)
  if (DESIGN_SUBVIEW_IDS.has(subView)) {
    return (
      <SubViewContainer
        title={subView === 'background-opacity' ? 'Background Opacity' : ''}
        onBack={() => setSubView('main')}
        isRtl={isRtl}
      >
        <DesignSubViewContent
          subView={subView as DesignSubViewId}
          settings={settings}
          onUpdateSettings={onUpdateSettings}
          isRtl={isRtl}
          t={t}
        />
      </SubViewContainer>
    );
  }

  // SUBVIEW: APP WINDOWS / DIALOGS SCREEN POSITION
  if (subView === 'window-position') {
    const curPos: ScreenPosition = settings.windowPosition || 'center';

    const alignFlexFor = (id: ScreenPosition) => {
      const v = id.startsWith('top') ? 'items-start' : id.startsWith('bottom') ? 'items-end' : 'items-center';
      const h = id.endsWith('left') ? 'justify-start' : id.endsWith('right') ? 'justify-end' : 'justify-center';
      return `${v} ${h}`;
    };

    return (
      <SubViewContainer title={t('window_position')} onBack={() => setSubView('main')} isRtl={isRtl}>
        <div className="space-y-4">
          <p className="text-xs sm:text-sm text-zinc-300">
            {isRtl
              ? 'اختر مكان ظهور النوافذ المنبثقة وتفاصيل الأفلام والمسلسلات على الشاشة (أو انقل أي نافذة مباشرة عبر زر التحريك داخلها):'
              : 'Choose where app windows and details dialogs appear on screen (or move any window directly from its header):'}
          </p>

          <div dir="ltr" className="grid grid-cols-3 gap-2.5 sm:gap-3.5 max-w-2xl mx-auto">
            {SCREEN_POSITION_CELLS.map((cell) => {
              const isActive = curPos === cell.id;
              return (
                <button
                  key={cell.id}
                  data-tv-focusable="true"
                  tabIndex={0}
                  onClick={() => updateSetting('windowPosition', cell.id)}
                  className={`p-3 sm:p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-colors cursor-pointer ${
                    isActive
                      ? 'border-gold bg-gold/20 shadow-[0_0_16px_var(--theme-glow)]'
                      : 'border-white/10 bg-white/[0.04] hover:border-gold/50 hover:bg-white/[0.08]'
                  }`}
                >
                  <div className={`w-14 h-9 rounded-lg border border-white/15 bg-black/50 p-1 flex ${alignFlexFor(cell.id)}`}>
                    <div className={`w-5 h-3 rounded-sm border ${isActive ? 'bg-gold border-gold' : 'bg-gold/60 border-gold/60'}`} />
                  </div>
                  <span className={`text-xs sm:text-sm font-semibold ${isActive ? 'text-gold' : 'text-white'}`}>
                    {isRtl ? cell.ar : cell.en}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </SubViewContainer>
    );
  }

  // SUBVIEW: INDEPENDENT PAGE SCALING (each control affects only its own section)
  if (subView === 'settings-scale' || subView === 'live-scale' || subView === 'vod-scale') {
    const scaleConfig = subView === 'settings-scale'
      ? { key: 'settingsScale' as const, current: settings.settingsScale ?? 90, title: isRtl ? 'حجم صفحة الإعدادات' : 'Settings Page Size', hint: isRtl ? 'يؤثر على الإعدادات فقط' : 'Affects Settings only' }
      : subView === 'live-scale'
      ? { key: 'livePageScale' as const, current: settings.livePageScale ?? 100, title: isRtl ? 'حجم صفحة البث المباشر' : 'Live Page Size', hint: isRtl ? 'يؤثر على صفحة المباشر فقط' : 'Affects Live only' }
      : { key: 'vodPageScale' as const, current: settings.vodPageScale ?? 100, title: isRtl ? 'حجم صفحات الأفلام والمسلسلات' : 'Movies & Series Page Size', hint: isRtl ? 'يؤثر على الأفلام والمسلسلات فقط' : 'Affects Movies & Series only' };
    const scaleValues = [70, 80, 90, 100, 110, 120];
    return (
      <SubViewContainer title={scaleConfig.title} onBack={() => setSubView('main')} isRtl={isRtl}>
        <div className="space-y-3">
          <p className="text-xs sm:text-sm text-zinc-300">{scaleConfig.hint}</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {scaleValues.map(value => (
              <button key={value} data-tv-focusable="true" tabIndex={0}
                onClick={() => updateSetting(scaleConfig.key, value)}
                className={`min-h-[72px] rounded-2xl border flex flex-col items-center justify-center gap-1 transition-colors ${scaleConfig.current === value ? 'border-gold bg-gold/15' : 'border-white/10 bg-white/[0.04] hover:border-gold/40'}`}>
                <span className="text-lg font-mono font-bold text-gold">{value}%</span>
                {scaleConfig.current === value && <Check size={14} className="text-gold" />}
              </button>
            ))}
          </div>
        </div>
      </SubViewContainer>
    );
  }

  // SUBVIEW: LIVE FULLSCREEN BAR SIZE (Current / Full Width / Smaller)
  if (subView === 'live-bar-size') {
    const currentBarSize: LiveBarSize = settings.liveBarSize || 'default';
    const barSizeOptions: Array<{ id: LiveBarSize; label: string; desc: string }> = [
      {
        id: 'default',
        label: isRtl ? 'الحجم الحالي' : 'Current Size',
        desc: isRtl ? 'يبقى الشريط في منتصف الشاشة وبحجمه الحالي' : 'Centered at current default size',
      },
      {
        id: 'full',
        label: isRtl ? 'ملء عرض الشاشة' : 'Full Screen Width',
        desc: isRtl ? 'تكبير الشريط ليصبح بعرض الشاشة بالكامل' : 'Expand bar to full screen width',
      },
      {
        id: 'compact',
        label: isRtl ? 'حجم أصغر' : 'Smaller Size',
        desc: isRtl ? 'تصغير الشريط عن حجمه الحالي' : 'Smaller compact bar size',
      },
    ];
    return (
      <SubViewContainer title={isRtl ? 'حجم شريط البث المباشر (Live)' : 'Live Bar Size'} onBack={() => setSubView('main')} isRtl={isRtl}>
        <div className="space-y-3">
          <p className="text-xs sm:text-sm text-zinc-300">
            {isRtl
              ? 'يتحكم في حجم شريط القنوات المباشرة (Live) فقط في وضع ملء الشاشة:'
              : 'Controls the Live TV fullscreen control bar size only:'}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {barSizeOptions.map((opt) => (
              <TileOptionButton
                key={opt.id}
                title={opt.label}
                subtitle={opt.desc}
                active={currentBarSize === opt.id}
                onClick={() => {
                  updateSetting('liveBarSize', opt.id);
                  setSubView('main');
                }}
                isRtl={isRtl}
              />
            ))}
          </div>
        </div>
      </SubViewContainer>
    );
  }

  // SUBVIEW: SCREEN ZOOM (8 tiles in 4x2 grid + fine tune)
  if (subView === 'screen-zoom') {
    const currentZoom = settings.zoomScale || 100;
    const zoomPresets = [80, 85, 90, 95, 98, 100, 105, 110];

    return (
      <SubViewContainer title={`${t('screen_zoom')} (${currentZoom}%)`} onBack={() => setSubView('main')} isRtl={isRtl}>
        <div className="space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {zoomPresets.map((val) => {
              const isActive = currentZoom === val;
              return (
                <button
                  key={val}
                  data-tv-focusable="true"
                  tabIndex={0}
                  onClick={() => updateSetting('zoomScale', val)}
                  className={`p-3 rounded-2xl border transition-colors flex flex-col items-center justify-center gap-1 min-h-[76px] cursor-pointer ${
                    isActive ? 'border-gold bg-gold/15' : 'border-white/10 bg-white/[0.04] hover:border-gold/40 hover:bg-white/[0.09]'
                  }`}
                >
                  <span className="text-lg font-mono font-medium text-gold">{val}%</span>
                  <span className="text-xs sm:text-sm font-normal text-zinc-200">
                    {val === 100 ? (isRtl ? 'الافتراضي (95%)' : 'Default (95%)') : val === 98 ? (isRtl ? 'مناسب للتلفزيون' : 'TV Fit') : `${val}%`}
                  </span>
                  {isActive && <Check className="text-gold mt-0.5" size={14} />}
                </button>
              );
            })}
          </div>

          <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 flex flex-wrap items-center justify-between gap-2.5">
            <span className="text-sm font-medium text-zinc-200">
              {isRtl ? 'ضبط دقيق:' : 'Fine Tuning:'}
            </span>
            <div className="flex items-center gap-2.5">
              <button
                data-tv-focusable="true"
                tabIndex={0}
                onClick={() => updateSetting('zoomScale', Math.max(70, currentZoom - 1))}
                className="px-4 py-2 bg-white/10 hover:bg-gold hover:text-black text-white rounded-xl text-sm font-medium transition-colors cursor-pointer"
              >
                - 1%
              </button>
              <span className="text-base font-mono font-medium text-gold px-2">{currentZoom}%</span>
              <button
                data-tv-focusable="true"
                tabIndex={0}
                onClick={() => updateSetting('zoomScale', Math.min(150, currentZoom + 1))}
                className="px-4 py-2 bg-white/10 hover:bg-gold hover:text-black text-white rounded-xl text-sm font-medium transition-colors cursor-pointer"
              >
                + 1%
              </button>
              <button
                data-tv-focusable="true"
                tabIndex={0}
                onClick={() => setSubView('main')}
                className="px-5 py-2 bg-gold text-black rounded-xl text-sm font-medium cursor-pointer"
              >
                {isRtl ? 'تم' : 'Done'}
              </button>
            </div>
          </div>
        </div>
      </SubViewContainer>
    );
  }

  // SUBVIEW: PLAYERS (Clean sub-tabs so all fit on 1 TV screen in 4-5 tiles/row)
  if (subView === 'players') {
    const internalEngines = [
      { id: 'Achour Player (مدمج - Native)', name: 'Achour 4K Native', desc: isRtl ? 'محرك Media3 المدمج مع شريط التلفزيون' : 'Built-in Media3 4K Engine' },
      { id: 'ExoPlayer', name: 'ExoPlayer / Media3', desc: isRtl ? 'محرك بث تكيفي مستقر' : 'Adaptive ExoPlayer engine' },
      { id: 'VLC Media Player', name: 'LibVLC Engine', desc: isRtl ? 'مسارات صوت وترجمة متعددة' : 'Multi-audio & subtitles' },
      { id: 'IJK Player', name: 'FFmpeg / IJK', desc: isRtl ? 'استجابة سريعة للبث المباشر' : 'Low-latency live decoder' },
      { id: 'MPV Player', name: 'MPV Bitrate', desc: isRtl ? 'معالجة عالية الجودة للأفلام' : 'High bitrate movie decoder' },
    ];
    const externalApps = EXTERNAL_PLAYER_PROFILES;
    const customList = (settings.externalPlayers || []).filter(p => !DEFAULT_PLAYERS.includes(p));
    const onFireTv = isFireTVDevice();

    return (
      <SubViewContainer title={t('players_title')} onBack={() => setSubView('main')} isRtl={isRtl}>
        <div className="space-y-3">
          <div className={`flex items-center gap-2 bg-white/[0.04] p-1 rounded-2xl border border-white/10 ${isRtl ? 'flex-row-reverse' : ''}`}>
            {[
              { id: 'internal', label: isRtl ? 'محركات مدمجة (5)' : 'Internal Engines (5)' },
              { id: 'external', label: isRtl ? 'تطبيقات خارجية (5)' : 'External Apps (5)' },
              { id: 'custom', label: isRtl ? `مشغلات مخصصة (${customList.length})` : `Custom (${customList.length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                data-tv-focusable="true"
                tabIndex={0}
                onClick={() => setPlayersTab(tab.id as any)}
                className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                  playersTab === tab.id ? 'bg-gold text-black' : 'text-zinc-300 hover:bg-white/5'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {playersTab === 'internal' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
              {internalEngines.map((p) => {
                const isActive = !settings.useExternalPlayer && settings.selectedPlayer === p.id;
                return (
                  <button
                    key={p.id}
                    data-tv-focusable="true"
                    tabIndex={0}
                    onClick={() => {
                      onUpdateSettings(prev => ({ ...prev, useExternalPlayer: false, selectedPlayer: p.id }));
                      setSubView('main');
                    }}
                    className={`p-3.5 rounded-2xl border transition-colors flex flex-col justify-between min-h-[96px] cursor-pointer ${
                      isActive ? 'border-gold bg-gold/15' : 'border-white/10 bg-white/[0.04] hover:border-gold/40 hover:bg-white/[0.09]'
                    } ${isRtl ? 'text-right' : 'text-left'}`}
                  >
                    <div className="flex items-start justify-between gap-2 w-full">
                      <span className="text-sm sm:text-base font-medium text-white leading-snug">{p.name}</span>
                      {isActive && <Check className="text-gold shrink-0" size={16} />}
                    </div>
                    <p className="text-xs text-zinc-400 font-normal mt-1.5 line-clamp-2">{p.desc}</p>
                  </button>
                );
              })}
            </div>
          )}

          {playersTab === 'external' && (
            <div className="space-y-2.5">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                {externalApps.map((p) => {
                  const isActive =
                    settings.useExternalPlayer &&
                    (settings.selectedPlayer === p.id || Boolean(p.aliases?.includes(settings.selectedPlayer)));
                  const installStatus = externalInstallMap[p.id];
                  const showFireTvWarn = !p.fireTvCompatible;
                  return (
                    <button
                      key={p.id}
                      data-tv-focusable="true"
                      tabIndex={0}
                      onClick={() => {
                        onUpdateSettings(prev => ({ ...prev, useExternalPlayer: true, selectedPlayer: p.id }));
                        setSubView('main');
                      }}
                      className={`p-3.5 rounded-2xl border transition-colors flex flex-col justify-between min-h-[112px] cursor-pointer ${
                        isActive ? 'border-gold bg-gold/15' : 'border-white/10 bg-white/[0.04] hover:border-gold/40 hover:bg-white/[0.09]'
                      } ${isRtl ? 'text-right' : 'text-left'}`}
                    >
                      <div className="flex items-start justify-between gap-2 w-full">
                        <span className="text-sm sm:text-base font-medium text-white leading-snug">{p.name}</span>
                        {isActive && <Check className="text-gold shrink-0" size={16} />}
                      </div>
                      <div className="mt-1.5 space-y-1">
                        <span className="text-[11px] font-mono text-zinc-400 truncate block">{p.packageName}</span>
                        <div className="flex flex-wrap items-center gap-1">
                          {installStatus === true && (
                            <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold">
                              {isRtl ? 'مثبّت' : 'Installed'}
                            </span>
                          )}
                          {installStatus === false && (
                            <span className="px-1.5 py-0.5 rounded bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[10px] font-bold">
                              {isRtl ? 'غير مثبّت' : 'Not installed'}
                            </span>
                          )}
                          {showFireTvWarn && (
                            <span className={`px-1.5 py-0.5 rounded border text-[10px] font-bold flex items-center gap-1 ${
                              onFireTv
                                ? 'bg-amber-500/25 border-amber-400/60 text-amber-200'
                                : 'bg-amber-500/15 border-amber-500/35 text-amber-300'
                            }`}>
                              <AlertTriangle size={10} />
                              {isRtl ? 'للهاتف (غير متوافق مع Fire TV)' : 'Phone only (No Fire TV)'}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-zinc-400 px-1">
                {isRtl
                  ? 'عند اختيار مشغّل خارجي سيتم فتح القنوات والأفلام والمسلسلات عبره تلقائياً مع تمرير ترويسات HTTP المطلوبة، وفي حال عدم تثبيته على الجهاز يمكنك الرجوع فوراً للمشغّل الداخلي.'
                  : 'Selecting an external app launches Live, Movies, and Series directly with required HTTP headers, with instant fallback to the internal player if not installed.'}
              </p>
            </div>
          )}

          {playersTab === 'custom' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-white/[0.04] p-3.5 rounded-2xl border border-white/10">
                <input
                  type="text"
                  value={newPlayerName}
                  onChange={(e) => setNewPlayerName(e.target.value)}
                  placeholder={isRtl ? 'اسم المشغل (مثال: Kodi)' : 'Player Name (e.g. Kodi)'}
                  className="bg-white/[0.05] border border-white/15 rounded-xl px-3.5 py-2 text-sm text-white"
                />
                <input
                  type="text"
                  value={newPlayerPackage}
                  onChange={(e) => setNewPlayerPackage(e.target.value)}
                  placeholder={isRtl ? 'اسم الحزمة (مثال: org.xbmc.kodi)' : 'Package ID (optional)'}
                  className="bg-white/[0.05] border border-white/15 rounded-xl px-3.5 py-2 text-sm font-mono text-white"
                />
                <button
                  data-tv-focusable="true"
                  tabIndex={0}
                  onClick={handleAddPlayer}
                  className="px-4 py-2 bg-gold text-black rounded-xl text-sm font-medium cursor-pointer"
                >
                  {isRtl ? 'إضافة مشغل' : 'Add Player'}
                </button>
              </div>
              {error && <p className="text-sm text-red-400">{error}</p>}
              {customList.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2.5">
                  {customList.map((name) => {
                    const isActive = settings.useExternalPlayer && settings.selectedPlayer === name;
                    return (
                      <div key={name} className="flex flex-col gap-1.5">
                        <button
                          data-tv-focusable="true"
                          tabIndex={0}
                          onClick={() => {
                            updateSetting('useExternalPlayer', true);
                            handlePlayerSelect(name);
                          }}
                          className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer ${
                            isActive ? 'border-gold bg-gold/15' : 'border-white/10 bg-white/[0.04] hover:bg-white/[0.09]'
                          }`}
                        >
                          <span className="text-sm font-medium text-white truncate">{name}</span>
                          {isActive && <Check className="text-gold shrink-0" size={16} />}
                        </button>
                        <button
                          data-tv-focusable="true"
                          tabIndex={0}
                          onClick={(e) => handleDeletePlayer(e, name)}
                          className="py-1.5 rounded-xl bg-red-500/15 text-red-300 text-xs font-medium cursor-pointer"
                        >
                          {isRtl ? 'حذف' : 'Delete'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </SubViewContainer>
    );
  }



  // SUBVIEW: APP BACKGROUNDS (40 Static Natural Wallpapers)
  if (subView === 'backgrounds') {
    return (
      <SubViewContainer title={`${t('app_backgrounds')} (${APP_BACKGROUNDS.length})`} onBack={() => setSubView('main')} isRtl={isRtl}>
        <div className="flex flex-col gap-3 pb-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2.5">
            {APP_BACKGROUNDS.map((bg) => {
              const isActive = !settings.customBackground && (settings.backgroundStyle || 'bg-raouche-rocks-beirut') === bg.id;
              return (
                <button
                  key={bg.id}
                  data-tv-focusable="true"
                  tabIndex={0}
                  onClick={() => handleSelectBackground(bg.id)}
                  className={`achour-perf-grid-item p-2.5 rounded-2xl border transition-colors duration-100 flex flex-col justify-between cursor-pointer ${
                    isActive ? 'border-gold bg-gold/15' : 'border-white/10 bg-white/[0.04] hover:border-gold/40 hover:bg-white/[0.09]'
                  } ${isRtl ? 'text-right' : 'text-left'}`}
                >
                  <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-white/20 bg-black">
                    {bg.imageUrl && (
                      <img
                        src={bg.imageUrl}
                        alt={bg.nameEn}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover"
                        style={{ background: bg.previewGradient || bg.previewColor }}
                      />
                    )}
                    <div className="absolute inset-0 bg-black/30 pointer-events-none" />
                    {isActive && (
                      <span className="absolute top-1.5 right-1.5 p-1 rounded-full bg-gold text-black shadow">
                        <Check size={12} />
                      </span>
                    )}
                  </div>
                  <h3 className="text-xs sm:text-sm font-medium text-white truncate mt-2">
                    {settings.language === 'ar' ? bg.nameAr : bg.nameEn}
                  </h3>
                </button>
              );
            })}
          </div>
        </div>
      </SubViewContainer>
    );
  }



  // SUBVIEWS: CATEGORY MANAGEMENT (Continuous long scrollable list)
  if (subView.startsWith('categories-')) {
    const type = subView.split('-')[1] as 'live' | 'movie' | 'series';
    const titleKey = type === 'live' ? 'hide_live_categories' : type === 'movie' ? 'hide_movie_categories' : 'hide_series_categories';
    let hiddenList = settings.hiddenLiveCategories || [];
    if (type === 'movie') hiddenList = settings.hiddenMovieCategories || [];
    if (type === 'series') hiddenList = settings.hiddenSeriesCategories || [];
    const hiddenCountInThisView = categories.filter(c => hiddenList.includes(c.category_id) || hiddenList.includes(c.category_name)).length;
    const visibleCountInThisView = categories.length - hiddenCountInThisView;

    return (
      <SubViewContainer title={t(titleKey)} onBack={() => setSubView('main')} isRtl={isRtl}>
        <div className="flex flex-col gap-3 pb-4">
          <div className={`flex flex-wrap items-center justify-between gap-2 bg-white/[0.04] p-2 rounded-2xl border border-white/10 shrink-0 ${isRtl ? 'flex-row-reverse' : ''}`}>
            <div className="relative flex-1 min-w-[160px]">
              <Search className={`absolute top-1/2 -translate-y-1/2 text-zinc-400 ${isRtl ? 'right-3' : 'left-3'}`} size={15} />
              <input
                type="text"
                value={catSearch}
                onChange={(e) => setCatSearch(e.target.value)}
                placeholder={t('search_categories')}
                className={`w-full bg-white/[0.05] border border-white/15 rounded-xl py-1.5 text-sm text-white ${isRtl ? 'pr-9 pl-3 text-right' : 'pl-9 pr-3 text-left'}`}
              />
            </div>

            <div className={`flex items-center gap-1.5 ${isRtl ? 'flex-row-reverse' : ''}`}>
              <button
                data-tv-focusable="true"
                tabIndex={0}
                onClick={() => setCatFilterTab('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer ${catFilterTab === 'all' ? 'bg-gold text-black' : 'bg-white/5 text-zinc-300'}`}
              >
                {isRtl ? `الكل (${categories.length})` : `All (${categories.length})`}
              </button>
              <button
                data-tv-focusable="true"
                tabIndex={0}
                onClick={() => setCatFilterTab('visible')}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer ${catFilterTab === 'visible' ? 'bg-emerald-500 text-white' : 'bg-white/5 text-zinc-300'}`}
              >
                {isRtl ? `معروض (${visibleCountInThisView})` : `Visible (${visibleCountInThisView})`}
              </button>
              <button
                data-tv-focusable="true"
                tabIndex={0}
                onClick={() => setCatFilterTab('hidden')}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer ${catFilterTab === 'hidden' ? 'bg-red-500 text-white' : 'bg-white/5 text-zinc-300'}`}
              >
                {isRtl ? `مخفي (${hiddenCountInThisView})` : `Hidden (${hiddenCountInThisView})`}
              </button>
            </div>

            <div className={`flex items-center gap-1.5 ${isRtl ? 'flex-row-reverse' : ''}`}>
              <button
                data-tv-focusable="true"
                tabIndex={0}
                onClick={showAllVisibleCategories}
                className="px-3 py-1.5 bg-white/10 hover:bg-gold hover:text-black text-white text-xs font-medium rounded-xl cursor-pointer"
              >
                {t('show_all')}
              </button>
              <button
                data-tv-focusable="true"
                tabIndex={0}
                onClick={hideAllVisibleCategories}
                className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500 text-red-200 text-xs font-medium rounded-xl cursor-pointer"
              >
                {t('hide_all')}
              </button>
              <button
                data-tv-focusable="true"
                tabIndex={0}
                onClick={() => {
                  if (type === 'movie') updateSetting('hiddenMovieCategories', []);
                  else if (type === 'series') updateSetting('hiddenSeriesCategories', []);
                  else updateSetting('hiddenLiveCategories', []);
                }}
                className="px-3 py-1.5 bg-white/5 hover:bg-white/15 text-zinc-300 text-xs font-medium rounded-xl cursor-pointer"
              >
                {isRtl ? 'ضبط' : 'Reset'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {catLoading ? (
              <div className="col-span-full py-10 flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                <span className="text-zinc-300 text-sm">{t('loading')}</span>
              </div>
            ) : filteredCategories.length === 0 ? (
              <div className="col-span-full py-10 text-center rounded-2xl border border-white/10 bg-white/[0.04]">
                <EyeOff className="mx-auto text-zinc-600 mb-2" size={28} />
                <p className="text-zinc-300 text-sm">{t('no_channels')}</p>
              </div>
            ) : (
              filteredCategories.map((cat, idx) => {
                const isHidden = hiddenList.includes(cat.category_id) || hiddenList.includes(cat.category_name);
                return (
                  <button
                    key={`${cat.category_id}-${idx}`}
                    data-tv-focusable="true"
                    tabIndex={0}
                    onClick={() => toggleCategoryVisibility(cat.category_id)}
                    className={`achour-perf-grid-item flex items-center justify-between p-2.5 rounded-2xl transition-colors duration-100 border min-h-[60px] cursor-pointer ${
                      isHidden
                        ? 'border-red-500/45 bg-red-950/30'
                        : 'border-white/10 bg-white/[0.04] hover:border-gold/40 hover:bg-white/[0.09]'
                    } ${isRtl ? 'flex-row-reverse text-right' : 'text-left'}`}
                  >
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className={`text-xs sm:text-sm font-medium truncate ${isHidden ? 'text-zinc-400 line-through' : 'text-white'}`}>
                        {cat.category_name}
                      </span>
                      <span className={`text-[11px] mt-0.5 ${isHidden ? 'text-red-400' : 'text-emerald-400'}`}>
                        {isHidden ? (isRtl ? 'مخفي' : 'Hidden') : (isRtl ? 'معروض' : 'Visible')}
                      </span>
                    </div>
                    <div className={`p-1.5 rounded-xl shrink-0 ${isHidden ? 'bg-red-500/20 text-red-400' : 'bg-gold/15 text-gold'}`}>
                      {isHidden ? <EyeOff size={15} /> : <Eye size={15} />}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </SubViewContainer>
    );
  }

  // SUBVIEW: VPN (5 nodes per row + mode tiles fitting cleanly in 1 TV view)
  if (subView === 'vpn') {
    const nodes = [
      { id: 'auto', flag: '⚡', nameAr: 'تلقائي', nameEn: 'Auto Relay' },
      { id: 'de', flag: '🇩🇪', nameAr: 'فرانكفورت', nameEn: 'Frankfurt' },
      { id: 'nl', flag: '🇳🇱', nameAr: 'أمستردام', nameEn: 'Amsterdam' },
      { id: 'uk', flag: '🇬🇧', nameAr: 'لندن', nameEn: 'London' },
      { id: 'ae', flag: '🇦🇪', nameAr: 'دبي', nameEn: 'Dubai' },
      { id: 'us', flag: '🇺🇸', nameAr: 'نيويورك', nameEn: 'New York' },
    ];

    return (
      <SubViewContainer title={t('anti_block_vpn')} onBack={() => setSubView('main')} isRtl={isRtl}>
        <div className="space-y-2.5">
          <div className={`p-3 rounded-2xl border flex items-center justify-between gap-4 ${settings.vpnEnabled ? 'border-gold/50 bg-gold/10' : 'border-white/10 bg-white/[0.04]'}`}>
            <div className="flex items-center gap-3 min-w-0">
              <div className={`p-2.5 rounded-xl ${settings.vpnEnabled ? 'bg-gold text-black' : 'bg-white/10 text-zinc-300'}`}>
                <Shield size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {settings.vpnEnabled ? (isRtl ? 'الحماية وتخطي الحجب: مُفعّل ويعمل تلقائياً' : 'Protection Status: Enabled & Active') : (isRtl ? 'الحماية: متوقف حالياً' : 'Protection Status: Disabled')}
                </p>
              </div>
            </div>
            <button
              data-tv-focusable="true"
              tabIndex={0}
              onClick={() => updateSetting('vpnEnabled', !settings.vpnEnabled)}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium shrink-0 cursor-pointer ${
                settings.vpnEnabled ? 'bg-gold text-black' : 'bg-white/10 text-white'
              }`}
            >
              {settings.vpnEnabled ? (isRtl ? 'إيقاف VPN' : 'Disable') : (isRtl ? 'تفعيل VPN' : 'Enable')}
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {nodes.slice(0, 5).map((node) => {
              const isActive = (settings.vpnRegion || 'auto') === node.id;
              return (
                <button
                  key={node.id}
                  data-tv-focusable="true"
                  tabIndex={0}
                  onClick={() => updateSetting('vpnRegion', node.id as any)}
                  className={`p-3 rounded-2xl border flex flex-col justify-between min-h-[78px] cursor-pointer ${
                    isActive ? 'border-gold bg-gold/15' : 'border-white/10 bg-white/[0.04] hover:bg-white/[0.09]'
                  } ${isRtl ? 'text-right' : 'text-left'}`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xl">{node.flag}</span>
                    {isActive && <Check className="text-gold" size={16} />}
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-white mt-1.5">
                    {isRtl ? node.nameAr : node.nameEn}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {[
              { id: 'auto-relay', labelAr: 'تلقائي ذكي', labelEn: 'Auto Smart Relay' },
              { id: 'force-proxy', labelAr: 'إجبار الوكيل', labelEn: 'Force Proxy' },
              { id: 'direct', labelAr: 'اتصال مباشر', labelEn: 'Direct Stream' },
            ].map((mode) => {
              const isActive = (settings.vpnMode || 'auto-relay') === mode.id;
              return (
                <TileOptionButton
                  key={mode.id}
                  title={isRtl ? mode.labelAr : mode.labelEn}
                  active={isActive}
                  onClick={() => updateSetting('vpnMode', mode.id as any)}
                  isRtl={isRtl}
                />
              );
            })}
          </div>
        </div>
      </SubViewContainer>
    );
  }

  // SUBVIEW: SPLASH INTRO & MUSIC (Split into clean tabs of 5 tiles per row)
  if (subView === 'splash-intro') {
    const animationStyles = [
      { id: 'royal_gold_particles', nameAr: 'هالة الذهب الملكي', nameEn: 'Royal Gold Halo', badge: isRtl ? 'ملكي' : 'Royal' },
      { id: 'holographic_crown', nameAr: 'نيون هولوجرامي', nameEn: 'Holographic Orbit', badge: '3D' },
      { id: 'diamond_beam_pulse', nameAr: 'أشعة الألماس', nameEn: 'Diamond Beams', badge: isRtl ? 'سينمائي' : 'Cinema' },
      { id: 'cyber_pulsar', nameAr: 'درع السايبر', nameEn: 'Cyber Shield', badge: 'Cyber' },
      { id: 'cinematic_epic_zoom', nameAr: 'زوبعة النجوم', nameEn: 'Space Warp', badge: isRtl ? 'فضائي' : 'Space' },
      { id: 'fireworks_party', nameAr: 'مفرقعات احتفالية', nameEn: 'Fireworks Sparkle', badge: isRtl ? 'مفرقعات' : 'Fireworks' },
      { id: 'matrix_neon_rain', nameAr: 'أمطار النيون', nameEn: 'Matrix Neon Rain', badge: 'Matrix' },
      { id: 'laser_pulse_grid', nameAr: 'شبكة الليزر', nameEn: 'Laser Grid', badge: isRtl ? 'ليزر' : 'Laser' },
      { id: 'supernova_explosion', nameAr: 'انفجار السوبرنوفا', nameEn: 'Supernova Blast', badge: isRtl ? 'انفجار' : 'Supernova' },
      { id: 'golden_fire_phoenix', nameAr: 'نار العنقاء الذهبية', nameEn: 'Golden Phoenix', badge: isRtl ? 'عنقاء' : 'Phoenix' },
    ];

    const soundOptions = [
      { id: 'epic_royal_fanfare', nameAr: 'أوركسترا ملكية', nameEn: 'Royal Fanfare' },
      { id: 'imax_bass_rise', nameAr: 'باس سينمائي', nameEn: 'IMAX Bass' },
      { id: 'synthwave_arpeggio', nameAr: 'سنث مستقبلي', nameEn: 'Synthwave' },
      { id: 'crystal_magic_chimes', nameAr: 'رنين بلوري', nameEn: 'Crystal Chimes' },
      { id: 'cinematic_netflix', nameAr: 'استوديو عميق', nameEn: 'Studio Boom' },
      { id: 'mute', nameAr: 'صامت تماماً', nameEn: 'Mute' },
    ];

    const currentStyle = settings.splashStyle || 'royal_gold_particles';

    return (
      <SubViewContainer title={t('splash_intro')} onBack={() => setSubView('main')} isRtl={isRtl}>
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2.5 bg-white/[0.04] p-1.5 rounded-2xl border border-white/10">
            <div className="flex items-center gap-2 flex-1">
              <button
                data-tv-focusable="true"
                tabIndex={0}
                onClick={() => setSplashTab('style')}
                className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium cursor-pointer ${splashTab === 'style' ? 'bg-gold text-black' : 'text-zinc-300'}`}
              >
                {isRtl ? 'حركة البداية (5)' : 'Animation (5)'}
              </button>
              <button
                data-tv-focusable="true"
                tabIndex={0}
                onClick={() => setSplashTab('sound')}
                className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium cursor-pointer ${splashTab === 'sound' ? 'bg-gold text-black' : 'text-zinc-300'}`}
              >
                {isRtl ? 'الصوت والموسيقى (6)' : 'Intro Sound (6)'}
              </button>
            </div>
            <button
              data-tv-focusable="true"
              tabIndex={0}
              onClick={() => onTriggerSplash?.()}
              className="px-4 py-2 bg-gold text-black rounded-xl text-sm font-medium flex items-center gap-2 cursor-pointer"
            >
              <Sparkles size={16} />
              <span>{isRtl ? 'معاينة' : 'Preview'}</span>
            </button>
          </div>

          {splashTab === 'style' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
              {animationStyles.map((item) => {
                const isSelected = currentStyle === item.id;
                return (
                  <TileOptionButton
                    key={item.id}
                    title={isRtl ? item.nameAr : item.nameEn}
                    subtitle={item.badge}
                    active={isSelected}
                    onClick={() => updateSetting('splashStyle', item.id as any)}
                    isRtl={isRtl}
                  />
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
              {soundOptions.map((opt) => {
                const isSelected = (settings.splashSoundTrack || 'epic_royal_fanfare') === opt.id;
                return (
                  <button
                    key={opt.id}
                    data-tv-focusable="true"
                    tabIndex={0}
                    onClick={() => updateSetting('splashSoundTrack', opt.id as any)}
                    className={`p-3 rounded-2xl border flex items-center justify-between min-h-[78px] cursor-pointer ${
                      isSelected ? 'border-gold bg-gold/15' : 'border-white/10 bg-white/[0.04] hover:bg-white/[0.09]'
                    } ${isRtl ? 'flex-row-reverse text-right' : 'text-left'}`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`p-2 rounded-xl shrink-0 ${isSelected ? 'bg-gold text-black' : 'bg-white/10 text-zinc-300'}`}>
                        {opt.id === 'mute' ? <VolumeX size={16} /> : <Volume2 size={16} />}
                      </div>
                      <span className="text-xs sm:text-sm font-medium text-white truncate">
                        {isRtl ? opt.nameAr : opt.nameEn}
                      </span>
                    </div>
                    {isSelected && <Check className="text-gold shrink-0" size={16} />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </SubViewContainer>
    );
  }

  // MAIN SETTINGS VIEW — Clean 5-tiles-per-row TV Grid fitting single screen comfortably
  return (
    <div className={`h-full w-full bg-transparent flex flex-col items-center p-2.5 sm:p-4 select-none overflow-hidden relative z-10 ${isRtl ? 'font-cairo' : 'font-sans'}`}>
      <input
        type="file"
        ref={channelFileInputRef}
        className="hidden"
        accept=".m3u,.m3u8,.txt"
        onChange={handleChannelFileUploadInSettings}
      />

      {/* Compact Header */}
      <header className="w-full max-w-6xl flex items-center justify-between mb-2.5 bg-transparent px-3 py-2 border-b border-white/10 shrink-0">
        <button
          data-tv-focusable="false"
          data-tv-back-btn="true"
          tabIndex={-1}
          onClick={onBack}
          className="p-2 bg-white/10 hover:bg-gold hover:text-black rounded-xl text-white transition-colors cursor-pointer flex items-center justify-center"
          title={isRtl ? 'رجوع' : 'Back'}
        >
          <ChevronLeft size={20} className={isRtl ? 'rotate-180' : ''} />
        </button>
        <div className="flex flex-col items-center">
          <h1 className="text-base sm:text-lg font-medium text-gold leading-tight">{t('settings')}</h1>
          <span className="text-xs text-zinc-400 font-normal">{t('settings_subtitle')}</span>
        </div>
        <div className="w-10" />
      </header>

      {/* Main Content Fitting Cleanly Inside Single TV Viewport */}
      <div className="w-full max-w-6xl flex-1 flex flex-col justify-between overflow-y-auto no-scrollbar">
        <div className="space-y-2.5">
          {historyClearSuccess && (
            <div className="px-4 py-1.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 rounded-xl text-sm font-medium">
              {t('history_cleared_success')}
            </div>
          )}

          {syncNotification && (
            <div className="px-4 py-1.5 bg-white/[0.05] border border-gold/40 text-gold rounded-xl text-sm font-medium flex items-center gap-2">
              <RefreshCw size={16} className={syncInProgress ? 'animate-spin' : ''} />
              <span>{syncNotification}</span>
            </div>
          )}

          {/* Top Category Management Strip ONLY (Series, Movies, Live) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {[
              { view: 'categories-series' as const, icon: Clapperboard, title: t('hide_series_categories') },
              { view: 'categories-movie' as const, icon: Film, title: t('hide_movie_categories') },
              { view: 'categories-live' as const, icon: EyeOff, title: t('hide_live_categories') },
            ].map((catCard) => {
              const Icon = catCard.icon;
              return (
                <button
                  key={catCard.view}
                  data-tv-focusable="true"
                  tabIndex={0}
                  onClick={() => setSubView(catCard.view)}
                  className={`px-3.5 py-2.5 bg-white/[0.04] hover:bg-white/[0.09] rounded-2xl border border-white/10 hover:border-gold/50 flex items-center justify-between transition-colors duration-100 cursor-pointer ${isRtl ? 'flex-row-reverse text-right' : 'text-left'}`}
                >
                  <div className={`flex items-center gap-2.5 min-w-0 ${isRtl ? 'flex-row-reverse' : ''}`}>
                    <div className="p-1.5 rounded-xl bg-gold/15 text-gold shrink-0">
                      <Icon size={17} />
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-white truncate">{catCard.title}</span>
                  </div>
                  <ChevronLeft size={16} className={`${isRtl ? '' : 'rotate-180'} text-gold shrink-0`} />
                </button>
              );
            })}
          </div>

          {/* Grouped Settings Sections */}
          <div className="space-y-4 pb-3">
            {settingsGroups.map((group, gIdx) => (
              <div key={gIdx} className="space-y-2">
                <h3 className="text-xs sm:text-sm font-black text-gold uppercase tracking-wider px-1">
                  {group.title}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2">
                  {group.items.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={idx}
                        data-tv-focusable="true"
                        tabIndex={0}
                        onClick={item.action}
                        className="flex flex-col items-center justify-center p-3 bg-white/[0.04] hover:bg-white/[0.09] rounded-2xl border border-white/10 hover:border-gold/50 transition-colors duration-100 group h-[84px] sm:h-[90px] text-center cursor-pointer gap-2"
                      >
                        <div className="p-1.5 rounded-xl bg-gold/15 text-gold group-hover:bg-gold group-hover:text-black transition-colors shrink-0">
                          <Icon size={17} />
                        </div>
                        <div className="w-full min-w-0">
                          <span className="text-xs sm:text-sm font-medium text-white group-hover:text-gold truncate w-full leading-snug block">
                            {item.label}
                          </span>
                          {item.subLabel && (
                            <span className="text-[10px] text-zinc-400 truncate w-full leading-none block mt-0.5">
                              {item.subLabel}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Minimal Device Footer */}
        <footer className="pt-1.5 pb-1 flex items-center justify-center gap-6 text-xs font-mono text-zinc-400 shrink-0">
          <span>MAC: <strong className="text-zinc-200 font-normal">6A:CD:C2:93:2F:D5</strong></span>
          <span>Device Key: <strong className="text-gold font-normal">411480</strong></span>
        </footer>
      </div>

      {/* In-App Confirmation Dialog for Clearing Individual Watch History */}
      {confirmClearType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 achour-modal-backdrop select-none">
          <div
            role="dialog"
            aria-modal="true"
            data-tv-modal="confirm-clear"
            data-achour-window-cat="confirm"
            style={{ transform: 'scale(var(--achour-zoom-scale, 0.95))', transformOrigin: 'center center' }}
            className={`w-full max-w-md achour-glass-modal border border-gold/45 rounded-3xl p-5 flex flex-col gap-4 ${isRtl ? 'font-cairo text-right' : 'text-left'}`}
          >
            <div className={`flex items-center justify-between pb-3 border-b border-white/10 ${isRtl ? 'flex-row-reverse' : ''}`}>
              <div className={`flex items-center gap-2.5 ${isRtl ? 'flex-row-reverse' : ''}`}>
                <div className="p-2 rounded-xl bg-red-500/20 text-red-400">
                  <Trash2 size={18} />
                </div>
                <h3 className="text-base font-semibold text-white">
                  {t('clear_history_confirm_title')}
                </h3>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <WindowPositionButton isRtl={isRtl} tvModalTag="confirm-clear" />
                <button
                  data-tv-focusable="true"
                  data-tv-modal="confirm-clear"
                  tabIndex={0}
                  onClick={() => setConfirmClearType(null)}
                  className="p-1.5 text-zinc-300 hover:text-white rounded-full cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <p className="text-sm text-zinc-200 leading-relaxed">
              {confirmClearType === 'movie'
                ? t('clear_movie_history_confirm')
                : confirmClearType === 'series'
                ? t('clear_series_history_confirm')
                : t('clear_channel_history_confirm')}
            </p>

            <div className={`flex items-center justify-end gap-2.5 pt-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
              <button
                data-tv-focusable="true"
                data-tv-modal="confirm-clear"
                tabIndex={0}
                onClick={() => setConfirmClearType(null)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-medium cursor-pointer"
              >
                {t('cancel')}
              </button>
              <button
                data-tv-focusable="true"
                data-tv-modal="confirm-clear"
                tabIndex={0}
                onClick={handleConfirmClearWatchHistory}
                className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-sm font-semibold cursor-pointer"
              >
                {t('confirm_clear')}
              </button>
            </div>
          </div>
        </div>
      )}

      {showUploadPasteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 achour-modal-backdrop select-none">
          <div
            data-achour-window-cat="settings"
            style={{ transform: 'scale(var(--achour-zoom-scale, 0.95))', transformOrigin: 'center center' }}
            className={`w-full max-w-lg achour-glass-modal border-gold/45 rounded-3xl p-5 flex flex-col gap-3 ${isRtl ? 'font-cairo text-right' : 'text-left'}`}
          >
            <div className={`flex items-center justify-between pb-3 border-b border-white/10 ${isRtl ? 'flex-row-reverse' : ''}`}>
              <h3 className="text-base font-medium text-white">
                {isRtl ? 'رفع أو لصق محتوى M3U' : 'Upload or Paste M3U'}
              </h3>
              <div className="flex items-center gap-1 shrink-0">
                <WindowPositionButton isRtl={isRtl} />
                <button data-tv-focusable="true" tabIndex={0} onClick={() => setShowUploadPasteModal(false)} className="p-2 text-zinc-300 hover:text-white rounded-full">
                  <X size={18} />
                </button>
              </div>
            </div>
            <input
              type="text"
              value={pastedM3uName}
              onChange={(e) => setPastedM3uName(e.target.value)}
              placeholder={isRtl ? 'اسم القائمة (اختياري)' : 'Playlist Name'}
              className="w-full bg-white/5 border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white"
            />
            <textarea
              value={pastedM3uText}
              onChange={(e) => setPastedM3uText(e.target.value)}
              rows={4}
              className="w-full bg-white/[0.05] border border-white/15 rounded-2xl p-3 text-sm font-mono text-gold"
            />
            <div className="flex items-center justify-end gap-2">
              <button data-tv-focusable="true" tabIndex={0} onClick={() => setShowUploadPasteModal(false)} className="px-4 py-2 bg-white/10 text-white rounded-xl text-sm font-medium">
                {isRtl ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                data-tv-focusable="true"
                tabIndex={0}
                onClick={() => saveAndActivateM3uContent(pastedM3uName.trim() || 'ملف_قنوات_مباشر.m3u', pastedM3uText)}
                disabled={!pastedM3uText.trim()}
                className="px-5 py-2 bg-gold text-black rounded-xl text-sm font-medium disabled:opacity-40"
              >
                {isRtl ? 'حفظ وتفعيل' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SubViewContainer({ title: _title, onBack, children, isRtl }: { title: string; onBack: () => void; children: React.ReactNode; isRtl: boolean }) {
  return (
    <div className={`h-full w-full bg-transparent px-3 py-2 flex flex-col items-center select-none overflow-hidden relative z-10 ${isRtl ? 'font-cairo' : 'font-sans'}`}>
      <header className="w-full max-w-6xl flex items-center justify-between mb-2 shrink-0 bg-transparent px-3 py-1.5 border-b border-white/10">
        <button
          data-tv-focusable="false"
          tabIndex={-1}
          onClick={onBack}
          className="p-2 bg-white/10 hover:bg-gold hover:text-black rounded-lg text-white transition-colors cursor-pointer flex items-center justify-center"
          title={isRtl ? 'رجوع' : 'Back'}
        >
          <ChevronLeft size={18} className={isRtl ? 'rotate-180' : ''} />
        </button>
        <div className="w-8" />
      </header>
      <div className="w-full max-w-6xl flex-1 min-h-0 overflow-y-auto no-scrollbar pb-1">
        {children}
      </div>
    </div>
  );
}

function TileOptionButton({
  title,
  subtitle,
  active,
  onClick,
  isRtl
}: {
  title: string;
  subtitle?: string;
  active: boolean;
  onClick: () => void;
  isRtl: boolean;
}) {
  return (
    <button
      data-tv-focusable="true"
      tabIndex={0}
      onClick={onClick}
      className={`w-full flex flex-col justify-between p-3 rounded-2xl transition-colors border min-h-[82px] cursor-pointer ${
        active
          ? 'border-gold bg-gold/15'
          : 'border-white/10 bg-white/[0.04] hover:border-gold/40 hover:bg-white/[0.09]'
      } ${isRtl ? 'text-right' : 'text-left'}`}
    >
      <div className="flex items-start justify-between gap-2 w-full">
        <span className="text-xs sm:text-sm font-medium text-white leading-snug">{title}</span>
        {active && (
          <span className="p-1 rounded-lg bg-gold text-black shrink-0">
            <Check size={14} />
          </span>
        )}
      </div>
      {subtitle && (
        <span className="text-xs font-normal text-zinc-400 mt-1.5 block truncate w-full">
          {subtitle}
        </span>
      )}
    </button>
  );
}
