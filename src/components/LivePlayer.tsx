// Original path: src/components/LivePlayer.tsx
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Hls from 'hls.js';
import { PLAYER_PACKAGES, getPlayerPackage } from '../utils/players';
import { 
  Search, Zap, LayoutGrid, List, ArrowUpDown, Trash2, Clock, 
  Play, Pause, EyeOff, MonitorPlay, Plus, X, History, Database, 
  Maximize, Minimize, Eye, RotateCcw, AlertTriangle, ShieldCheck, ChevronLeft, ChevronRight,
  Star, Volume2, VolumeX, Sun, Tv, HelpCircle, Filter, Sparkles, Radio,
  Film, Clapperboard, Check, Sliders, Monitor, ChevronUp, ChevronDown, Layers, Info, ArrowUp, ArrowDown, Move, Copy, Mic, MicOff, Calendar, ChevronsUp
} from 'lucide-react';
import AIOcrModal from './AIOcrModal';
import PinUnlockModal from './PinUnlockModal';
import VodPlayerModal from './VodPlayerModal';
import EPGGrid from './EPGGrid';
import VirtualizedChannelList, { VirtualizedChannelListHandle } from './VirtualizedChannelList';
import PositionEditModal from './PositionEditModal';
import { collection, query, where, getDocs, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import axios from 'axios';
import { AppSettings, Channel, Language, Playlist } from '../types';
import { fetchChannels, fetchChannelsForType, iptvGlobalCache, parseM3U } from '../utils/iptv';
import { useI18n } from '../utils/i18n';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  getLocalFavoriteIds, 
  getLocalVodFavoriteIds,
  toggleVodFavorite,
  syncFavoritesFromFirestore, 
  toggleFavorite as toggleFavoriteService, 
  subscribeFavorites 
} from '../utils/favoritesService';
import { xtreamFetch } from '../utils/iptv';
import { getRecents, addToRecents } from '../utils/recentService';
import {
  WATCH_HISTORY_CAT_ID,
  getWatchHistory,
  addToWatchHistory,
  saveLastWatchedChannel
} from '../utils/watchHistoryService';
import { getPlatformUrl, isAndroid, isNativeApp } from '../utils/platform';
import { formatLanguageLabel } from '../utils/mediaTracks';
import { pushBackHandler, BackPriority, setTVFocus, getCurrentTVFocus, isTVOrLowEndDevice } from '../utils/tvNavigation';
import { parseExpiryDate } from '../utils/subscription';
import { 
  initDB, 
  saveChannels, 
  saveCategories,
  getChannelsByType, 
  getCategoriesByType, 
  getChannelsByCategory,
  getChannelsByCategoryWindowed,
  searchChannelsInCategory,
  getChannelsByIds,
  getChannelsByPlaylistAndType,
  getCategoriesByPlaylistAndType,
  getPlaylistExtractionStatus,
  trimDbMemoryCaches,
  getEpisodesBySeriesId,
  saveEpisodes,
  getSeriesDetails,
  saveSeriesDetails,
  getVodDetails,
  saveVodDetails
} from '../lib/db';
import {
  CONTINUE_WATCHING_CAT_ID,
  cleanVodEntityId,
  getContinueWatchingItems,
  getVodProgress,
  clearVodProgress,
  getSeriesLastUnfinishedEpisode,
  getSeriesEpisodesProgressMap,
  formatPlaybackClock,
  MIN_RESUME_POSITION_SEC
} from '../utils/vodProgressService';
import { ExtractionService } from '../utils/extractionService';
import { processInChunks } from '../utils/performance';

// Helper for long press detection with touch-movement cancellation
const useLongPress = (callback: () => void, ms = 500, enabled = true) => {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPress = useRef(false);
  const startPos = useRef<{ x: number; y: number } | null>(null);

  const start = useCallback((clientX?: number, clientY?: number) => {
    if (!enabled) return;
    isLongPress.current = false;
    if (clientX !== undefined && clientY !== undefined) {
      startPos.current = { x: clientX, y: clientY };
    }
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      isLongPress.current = true;
      callback();
    }, ms);
  }, [callback, ms, enabled]);

  const stop = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    startPos.current = null;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!startPos.current || e.touches.length === 0) return;
    const touch = e.touches[0];
    const dx = Math.abs(touch.clientX - startPos.current.x);
    const dy = Math.abs(touch.clientY - startPos.current.y);
    if (dx > 6 || dy > 6) {
      stop();
    }
  }, [stop]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!startPos.current) return;
    const dx = Math.abs(e.clientX - startPos.current.x);
    const dy = Math.abs(e.clientY - startPos.current.y);
    if (dx > 8 || dy > 8) {
      stop();
    }
  }, [stop]);

  const onClick = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (isLongPress.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, []);

  const onKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!enabled) return;
    const isOkKey = e.key === 'Enter' || e.key === 'Select' || e.key === 'Ok' || e.key === 'OK' || e.keyCode === 13 || e.keyCode === 23;
    if (isOkKey) {
      if (!timerRef.current && !isLongPress.current) {
        start();
      }
    }
  }, [start, enabled]);

  const onKeyUp = useCallback((e: React.KeyboardEvent) => {
    if (!enabled) return;
    const isOkKey = e.key === 'Enter' || e.key === 'Select' || e.key === 'Ok' || e.key === 'OK' || e.keyCode === 13 || e.keyCode === 23;
    if (isOkKey) {
      stop();
    }
  }, [stop, enabled]);

  return {
    onMouseDown: (e: React.MouseEvent) => start(e.clientX, e.clientY),
    onMouseMove: handleMouseMove,
    onMouseUp: stop,
    onMouseLeave: stop,
    onTouchStart: (e: React.TouchEvent) => {
      if (e.touches.length > 0) {
        start(e.touches[0].clientX, e.touches[0].clientY);
      }
    },
    onTouchMove: handleTouchMove,
    onTouchEnd: stop,
    onTouchCancel: stop,
    onKeyDown,
    onKeyUp,
    onContextMenu: (e: React.MouseEvent) => {
      if (enabled) {
        e.preventDefault();
        e.stopPropagation();
        callback();
      }
    },
    onClick
  };
};

const CategoryButton = React.memo(({ cat, catIdx, isSelected, onSelect, onFocusIdx, onReorder, categories, showNumber }: any) => {
  const canReorder = Boolean(onReorder) && cat?.category_id !== WATCH_HISTORY_CAT_ID && cat?.category_id !== CONTINUE_WATCHING_CAT_ID && cat?.category_id !== 'favorites';
  const longPress = useLongPress(() => {
    if (canReorder && onReorder) {
      const realIdx = categories.findIndex((c: any) => c.category_id === cat.category_id);
      onReorder({ type: 'category', id: cat.category_id, index: realIdx !== -1 ? realIdx : catIdx, name: cat.category_name });
    }
  }, 450, canReorder);

  return (
    <div
      role="button"
      tabIndex={0}
      data-tv-focusable="true"
      data-tv-focus-inset="true"
      data-tv-pane="categories"
      data-index={catIdx + 1}
      data-cat-index={catIdx}
      {...(canReorder ? longPress : {})}
      onFocus={() => onFocusIdx?.(catIdx)}
      onClick={() => {
        onFocusIdx?.(catIdx);
        onSelect(cat.category_id);
      }}
      className={`w-full h-[44px] flex items-center justify-between px-3.5 rounded-xl text-xs sm:text-sm md:text-base font-medium cursor-pointer outline-none relative bg-transparent transition-colors ${
        isSelected
          ? 'text-gold font-bold'
          : 'text-zinc-300 hover:text-white'
      }`}
    >
      <div className="flex items-center gap-2 min-w-0 flex-1 pr-1">
        {isSelected && <span className="w-1.5 h-4 rounded-full bg-gold shrink-0" />}
        {showNumber && (
          <span className="text-[11px] font-mono font-bold text-gold/80 shrink-0 min-w-[1.5rem] text-center select-none">
            {catIdx + 1}
          </span>
        )}
        <span className="truncate text-xs sm:text-sm md:text-base font-medium leading-snug">{cat.category_name}</span>
      </div>
      {cat.count > 0 && (
        <span className="text-[10px] sm:text-xs font-mono font-bold text-zinc-400 shrink-0">{cat.count}</span>
      )}
    </div>
  );
});

const CAT_ROW_HEIGHT = 44;
const CAT_TOP_INSET = 4;
const CAT_BOTTOM_BUFFER = 4;

interface VirtualizedCategoryListHandle {
  focusIndex: (idx: number) => void;
}

const VirtualizedCategoryList = React.forwardRef<VirtualizedCategoryListHandle, {
  categories: ParsedCategory[];
  realLiveCats: ParsedCategory[];
  selectedCategory: string;
  onSelect: (id: string) => void;
  onFocusIdx: (idx: number) => void;
  onReorder?: (item: any) => void;
  showNumber?: boolean;
}>(({ categories, realLiveCats, selectedCategory, onSelect, onFocusIdx, onReorder, showNumber = false }, ref) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportH, setViewportH] = useState(560);
  const lastScrollTopRef = useRef(0);
  const activeFocusIdxRef = useRef<number>(0);
  const pendingFocusRef = useRef<number | null>(null);

  const getVisibleViewportMetrics = useCallback((el: HTMLDivElement) => {
    const rect = el.getBoundingClientRect();
    const winH = typeof window !== 'undefined' && window.innerHeight > 0 ? window.innerHeight : 0;
    const rawH = el.clientHeight > 40 ? el.clientHeight : viewportH;
    const zoomFactor = rect.height > 0 && rawH > 0 ? rect.height / rawH : 1;
    if (winH > 0 && rect.height > 0) {
      const clampedBottom = Math.min(rect.bottom, winH);
      const visibleFromWindow = Math.floor((clampedBottom - Math.max(0, rect.top)) / zoomFactor);
      const effectiveH = Math.max(120, Math.min(rawH, visibleFromWindow));
      return { effectiveH, visibleTop: Math.max(0, rect.top), visibleBottom: clampedBottom, zoomFactor };
    }
    return {
      effectiveH: Math.max(120, rawH),
      visibleTop: rect.top,
      visibleBottom: rect.top + rawH,
      zoomFactor: 1
    };
  }, [viewportH]);

  React.useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const updateH = () => {
      const { effectiveH } = getVisibleViewportMetrics(el);
      if (effectiveH > 0) setViewportH(prev => (prev === effectiveH ? prev : effectiveH));
    };
    updateH();
    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(updateH);
      ro.observe(el);
    }
    window.addEventListener('resize', updateH);
    return () => {
      ro?.disconnect();
      window.removeEventListener('resize', updateH);
    };
  }, [getVisibleViewportMetrics]);

  const total = categories.length;
  const overscan = 8;
  const effectiveScrollTop = Math.max(0, scrollTop - CAT_TOP_INSET);
  let startIdx = Math.max(0, Math.floor(effectiveScrollTop / CAT_ROW_HEIGHT) - overscan);
  const visibleCount = Math.ceil(viewportH / CAT_ROW_HEIGHT) + overscan * 2;
  let endIdx = Math.min(total - 1, startIdx + visibleCount);

  // Guarantee the active focused category row is always mounted in DOM even during rapid D-pad repeats
  const curFocusIdx = activeFocusIdxRef.current;
  if (total > 0 && curFocusIdx >= 0 && curFocusIdx < total) {
    if (curFocusIdx < startIdx) startIdx = Math.max(0, curFocusIdx - 2);
    if (curFocusIdx > endIdx) endIdx = Math.min(total - 1, curFocusIdx + 2);
  }

  const ensureTargetRectVisible = useCallback((el: HTMLDivElement, target: HTMLElement) => {
    const { effectiveH, visibleTop, visibleBottom, zoomFactor } = getVisibleViewportMetrics(el);
    const safePad = Math.max(64, Math.min(104, Math.round(effectiveH * 0.12))) * zoomFactor;
    const targetRect = target.getBoundingClientRect();
    if (targetRect.height <= 0) return;

    if (targetRect.top < visibleTop + safePad) {
      const delta = ((visibleTop + safePad) - targetRect.top) / zoomFactor;
      const nextTop = Math.max(0, el.scrollTop - delta);
      if (Math.abs(nextTop - el.scrollTop) > 1) {
        el.scrollTop = nextTop;
        const clampedTop = el.scrollTop;
        lastScrollTopRef.current = clampedTop;
        setScrollTop(clampedTop);
      }
    } else if (targetRect.bottom > visibleBottom - safePad) {
      const delta = (targetRect.bottom - (visibleBottom - safePad)) / zoomFactor;
      const maxScroll = Math.max(0, el.scrollHeight - el.clientHeight);
      const nextTop = Math.min(maxScroll, el.scrollTop + delta);
      if (Math.abs(nextTop - el.scrollTop) > 1) {
        el.scrollTop = nextTop;
        const clampedTop = el.scrollTop;
        lastScrollTopRef.current = clampedTop;
        setScrollTop(clampedTop);
      }
    }
  }, [getVisibleViewportMetrics]);

  const focusDomCategoryByIndex = useCallback((safeIdx: number): boolean => {
    const el = scrollRef.current;
    if (!el) return false;
    const target = el.querySelector<HTMLElement>(
      `[data-tv-pane="categories"][data-cat-index="${safeIdx}"]`
    );
    if (!target) return false;
    setTVFocus(target, { scroll: false });
    ensureTargetRectVisible(el, target);
    return true;
  }, [ensureTargetRectVisible]);

  React.useImperativeHandle(ref, () => ({
    focusIndex: (idx: number) => {
      if (total === 0) return;
      const safeIdx = Math.max(0, Math.min(total - 1, idx));
      activeFocusIdxRef.current = safeIdx;
      const el = scrollRef.current;
      if (el) {
        const { effectiveH } = getVisibleViewportMetrics(el);
        const safePad = Math.max(64, Math.min(104, Math.round(effectiveH * 0.12)));
        const rowTop = CAT_TOP_INSET + safeIdx * CAT_ROW_HEIGHT;
        const rowBottom = rowTop + CAT_ROW_HEIGHT;
        const curTop = el.scrollTop;
        const expectedTotalH = CAT_TOP_INSET + total * CAT_ROW_HEIGHT + CAT_BOTTOM_BUFFER;
        const maxScroll = Math.max(0, Math.max(el.scrollHeight, expectedTotalH) - el.clientHeight);

        if (rowTop - safePad < curTop) {
          const nextTop = Math.max(0, rowTop - safePad);
          if (Math.abs(nextTop - curTop) > 1) {
            el.scrollTop = nextTop;
            const clampedTop = el.scrollTop;
            lastScrollTopRef.current = clampedTop;
            setScrollTop(clampedTop);
          }
        } else if (rowBottom + safePad > curTop + effectiveH) {
          const nextTop = Math.min(maxScroll, Math.max(0, rowBottom + safePad - effectiveH));
          if (Math.abs(nextTop - curTop) > 1) {
            el.scrollTop = nextTop;
            const clampedTop = el.scrollTop;
            lastScrollTopRef.current = clampedTop;
            setScrollTop(clampedTop);
          }
        }
      }

      if (focusDomCategoryByIndex(safeIdx)) {
        pendingFocusRef.current = null;
      } else {
        pendingFocusRef.current = safeIdx;
      }
    }
  }), [total, getVisibleViewportMetrics, focusDomCategoryByIndex]);

  React.useLayoutEffect(() => {
    const idx = pendingFocusRef.current;
    if (idx === null) return;
    if (focusDomCategoryByIndex(idx)) {
      pendingFocusRef.current = null;
    } else {
      const raf = requestAnimationFrame(() => {
        if (pendingFocusRef.current !== null && focusDomCategoryByIndex(pendingFocusRef.current)) {
          pendingFocusRef.current = null;
        }
      });
      return () => cancelAnimationFrame(raf);
    }
  }, [startIdx, endIdx, categories.length, focusDomCategoryByIndex]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const nextTop = e.currentTarget.scrollTop;
    if (Math.abs(nextTop - lastScrollTopRef.current) < 1) return;
    lastScrollTopRef.current = nextTop;
    setScrollTop(nextTop);
  }, []);

  const visibleSlice: React.ReactNode[] = [];
  for (let i = startIdx; i <= endIdx; i++) {
    const cat = categories[i];
    if (!cat) continue;
    visibleSlice.push(
      <div
        key={`${cat.category_id}-${i}`}
        style={{
          position: 'absolute',
          top: `${CAT_TOP_INSET + i * CAT_ROW_HEIGHT}px`,
          left: 0,
          right: 0,
          height: `${CAT_ROW_HEIGHT}px`
        }}
      >
        <CategoryButton
          cat={cat}
          catIdx={i}
          categories={realLiveCats}
          isSelected={selectedCategory === cat.category_id}
          onSelect={onSelect}
          onFocusIdx={onFocusIdx}
          onReorder={onReorder}
          showNumber={showNumber}
        />
      </div>
    );
  }

  const adaptiveBottomBuf = CAT_BOTTOM_BUFFER;

  return (
    <div
      ref={scrollRef}
      onScroll={handleScroll}
      onFocusCapture={(e) => {
        const target = (e.target as HTMLElement | null)?.closest<HTMLElement>('[data-tv-pane="categories"]');
        if (target && scrollRef.current) {
          const parsedIdx = parseInt(target.getAttribute('data-cat-index') || '', 10);
          if (!isNaN(parsedIdx) && parsedIdx >= 0 && parsedIdx < total) {
            activeFocusIdxRef.current = parsedIdx;
          }
          ensureTargetRectVisible(scrollRef.current, target);
        }
      }}
      className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden no-scrollbar px-2"
      style={{
        contain: 'layout style',
        scrollPaddingTop: '64px',
        scrollPaddingBottom: `${adaptiveBottomBuf}px`
      }}
    >
      <div
        style={{
          height: `${CAT_TOP_INSET + total * CAT_ROW_HEIGHT + adaptiveBottomBuf}px`,
          position: 'relative',
          width: '100%'
        }}
      >
        {visibleSlice}
      </div>
    </div>
  );
});

const LiveHeaderClock: React.FC<{ language?: string; timeFormat?: string }> = React.memo(({ language, timeFormat }) => {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 10000);
    return () => clearInterval(t);
  }, []);
  const loc = language === 'ar' ? 'ar-EG' : language;
  return (
    <div className="flex flex-col items-end shrink-0">
      <span className="text-xs sm:text-sm font-black font-mono text-gold leading-none">
        {now.toLocaleTimeString(loc, {
          hour: '2-digit',
          minute: '2-digit',
          hour12: timeFormat === '12h'
        })}
      </span>
      <span className="text-[10px] font-medium text-zinc-400 font-sans mt-0.5 whitespace-nowrap">
        {now.toLocaleDateString(loc, {
          weekday: 'short',
          day: 'numeric',
          month: 'short'
        })}
      </span>
    </div>
  );
});


const LiveMiniEpgCard: React.FC<{
  selectedChannel: ParsedChannel | null;
  findProgramsForChannel: (ch: ParsedChannel | null) => any[] | null;
  language?: string;
  timeFormat?: string;
  isRtl: boolean;
}> = React.memo(({ selectedChannel, findProgramsForChannel, language, timeFormat, isRtl }) => {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 15000);
    return () => clearInterval(t);
  }, []);

  const programs = findProgramsForChannel(selectedChannel);
  const curProg = programs ? (programs.find(p => p.start <= now && p.stop >= now) || null) : null;
  const nextProg = programs ? (programs.find(p => p.start > now) || null) : null;

  let curProgressPct = 0;
  let remainingMins: number | null = null;
  if (curProg && curProg.start && curProg.stop) {
    const sMs = new Date(curProg.start).getTime();
    const eMs = new Date(curProg.stop).getTime();
    const nMs = now.getTime();
    if (eMs > sMs) {
      curProgressPct = Math.min(100, Math.max(0, ((nMs - sMs) / (eMs - sMs)) * 100));
      remainingMins = Math.max(0, Math.ceil((eMs - nMs) / 60000));
    }
  }
  const fmtTime = (dt: any) => {
    if (!dt) return '';
    const d = new Date(dt);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleTimeString(language === 'ar' ? 'ar-EG' : language, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: timeFormat === '12h'
    });
  };

  if (!selectedChannel) {
    return (
      <div className="h-full flex items-center justify-center text-[10px] font-medium text-zinc-500">
        {isRtl ? 'اختر قناة لعرض دليل البرامج الحالي والتالي' : 'Select a channel to view program guide'}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2 pb-1.5">
        <div className="flex items-center gap-2 min-w-0">
          {selectedChannel.stream_icon && (
            <img
              src={selectedChannel.stream_icon}
              alt=""
              referrerPolicy="no-referrer"
              className="w-6 h-6 rounded-lg object-contain bg-transparent shrink-0"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          )}
          <span className="text-xs font-bold text-white truncate">{selectedChannel.name}</span>
        </div>
        <span className="text-[9px] font-medium text-gold/90 shrink-0">
          {isRtl ? 'دليل البرامج' : 'Program Guide'}
        </span>
      </div>

      {curProg ? (
        <div className="rounded-xl bg-transparent p-2 space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[9px] font-bold text-gold uppercase">
              {isRtl ? 'البرنامج الحالي' : 'Now Playing'}
            </span>
            <span className="text-[9px] font-mono font-bold text-zinc-300" dir="ltr">
              {fmtTime(curProg.start)} - {fmtTime(curProg.stop)}
            </span>
          </div>
          <p className="text-xs font-medium text-white leading-snug line-clamp-2">
            {curProg.title}
          </p>
          <div className="w-full h-1 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full bg-gold rounded-full transition-all duration-500"
              style={{ width: `${curProgressPct}%` }}
            />
          </div>
          {remainingMins !== null && (
            <div className="text-[9px] font-medium text-zinc-400">
              {isRtl ? `متبقي ${remainingMins} دقيقة` : `${remainingMins} min remaining`}
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-xl bg-transparent p-2 text-[10px] font-medium text-zinc-400">
          {isRtl ? 'لا تتوفر بيانات البرنامج الحالي لهذه القناة' : 'No current program guide available for this channel'}
        </div>
      )}

      {nextProg && (
        <div className="rounded-xl bg-transparent px-2 py-1.5 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <span className="block text-[9px] font-bold text-zinc-400 uppercase mb-0.5">
              {isRtl ? 'البرنامج التالي' : 'Up Next'}
            </span>
            <p className="text-[10px] font-medium text-zinc-200 truncate">
              {nextProg.title}
            </p>
          </div>
          <span className="text-[10px] font-mono font-bold text-gold shrink-0" dir="ltr">
            {fmtTime(nextProg.start)}
          </span>
        </div>
      )}
    </div>
  );
});




const getAspectRatioClass = (ratio: string) => {
  if (ratio === '16:9') return 'w-full h-full object-contain aspect-video bg-black mx-auto';
  if (ratio === '4:3') return 'w-[82%] h-full object-contain aspect-[4/3] bg-black mx-auto';
  if (ratio === 'fill') return 'w-full h-full object-cover bg-black';
  return 'w-full h-full object-contain bg-black';
};




interface LivePlayerProps {
  onBack: () => void;
  settings: AppSettings;
  onUpdateSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  userId: string;
  initialType?: 'live' | 'movie' | 'series' | 'favorites';
  initialChannelToPlay?: ParsedChannel | null;
  onAutoPlayFallback?: () => void;
}

export interface ParsedChannel {
  stream_id: string;
  name: string;
  stream_icon?: string;
  logo?: string;
  cover?: string;
  url: string;
  category_id: string;
  category_name?: string;
  category?: string;
  container_extension?: string;
  season?: number;
  episode?: number;
  type?: 'live' | 'movie' | 'series';
  rating?: string;
  releaseDate?: string;
  added?: string | number;
  year?: string;
  duration?: string;
  plot?: string;
  orderIndex?: number;
}


export interface ParsedCategory {
  category_id: string;
  category_name: string;
  count?: number;
}

export function isFavCategory(c: ParsedCategory | { category_id?: string; category_name?: string; name?: string; id?: string }): boolean {
  if (!c) return false;
  const normName = String(c.category_name || (c as any).name || '').trim().toLowerCase();
  const normId = String(c.category_id || (c as any).id || '').trim().toLowerCase();
  return (
    normId === 'favorites' ||
    normId === 'favourites' ||
    normId === 'fav' ||
    normId === 'favorites_internal' ||
    /\bfav(s|orite|orites|ourite|ourites)?\b/i.test(normName) ||
    normName.includes('مفضل') ||
    normName.includes('favorite') ||
    normName.includes('favourite') ||
    normName.includes('favoriten') ||
    normName.includes('favoris') ||
    normName.includes('⭐') ||
    normName.includes('★')
  );
}

export function detectGenre(channelName: string, categoryName: string = ''): string {
  const text = (channelName + ' ' + categoryName).toLowerCase();
  if (/sport|bein|ssc|kora|foot|espn|eurosport|رياض/i.test(text)) return 'sports';
  if (/news|jazeera|arabiya|bbc|cnn|sky news|أخبار|الجزيرة|العربية/i.test(text)) return 'news';
  if (/movie|cinema|film|action|hbo|mbc2|mbc max|أفلام|سينما|أكشن/i.test(text)) return 'movies';
  if (/series|drama|mbc drama|مسلسل|دراما/i.test(text)) return 'series';
  if (/kid|cartoon|disney|spacetoon|cn|أطفال|كرتون|سبيستون/i.test(text)) return 'kids';
  if (/quran|sunnah|islam|قرآن|سنة|إسلام/i.test(text)) return 'religious';
  if (/music|rotana|mtv|موسيقى|اغاني/i.test(text)) return 'music';
  if (/doc|nat geo|discovery|history|وثائقي/i.test(text)) return 'documentary';
  return 'general';
}

export function isMovieItem(name: string, group: string = '', url: string = ''): boolean {
  const text = (name + ' ' + group + ' ' + url).toLowerCase();
  return text.includes('.mp4') || text.includes('.mkv') || text.includes('.avi') || text.includes('.mov') || text.includes('.m4v') ||
         text.includes('movie') || text.includes('film') || text.includes('vod') || text.includes('cinema') ||
         text.includes('netflix') || text.includes('shahed') || text.includes('osn') || text.includes('boxoffice') ||
         text.includes('أفلام') || text.includes('افلام') || text.includes('الأفلام') || text.includes('الافلام') ||
         text.includes('سينما') || text.includes('السينما') || text.includes('فيلم') || text.includes('الفيلم') ||
         text.includes('مترجم') || text.includes('مدبلج') || text.includes('شاهد') || text.includes('نتفليكس');
}

export function isSeriesItem(name: string, group: string = '', url: string = ''): boolean {
  const text = (name + ' ' + group + ' ' + url).toLowerCase();
  return text.includes('series') || text.includes('serie') || text.includes('مسلسل') || text.includes('المسلسل') ||
         text.includes('مسلسلات') || text.includes('المسلسلات') || text.includes('دراما') || text.includes('drama') ||
         text.includes('s0') || text.includes('s1') || text.includes('s2') || text.includes('s3') || text.includes('s4') || text.includes('s5') ||
         text.includes('season') || text.includes('episode') || text.includes('حلقة') || text.includes('حلقات') ||
         text.includes('موسم') || text.includes('مواسم') || text.includes('انمي') || text.includes('anime');
}





// Budgeted LRU in-memory session caches to stay well within 1.5 GB Fire TV RAM
const sessionCategoriesCache = new Map<string, ParsedCategory[]>();
const sessionChannelsCache = new Map<string, ParsedChannel[]>();
const sessionSeriesDetailsCache = new Map<string, any>();
const sessionVodDetailsCache = new Map<string, any>();
const inFlightDetailsCache = new Map<string, Promise<any>>();
let sessionChannelsTotalItems = 0;

const setBoundedDetailCache = (cache: Map<string, any>, key: string, value: any, maxEntries: number) => {
  if (!key || !value) return;
  if (cache.has(key)) cache.delete(key);
  while (cache.size >= maxEntries) {
    const oldest = cache.keys().next().value;
    if (oldest === undefined) break;
    cache.delete(oldest);
  }
  cache.set(key, value);
};

const setSessionChannelsCache = (key: string, items: ParsedChannel[]) => {
  const lowMem = isTVOrLowEndDevice();
  const maxEntries = lowMem ? 3 : 8;
  const maxTotalItems = lowMem ? 6000 : 25000;
  const maxSingleItems = lowMem ? 3500 : 12000;

  if (!items || items.length === 0 || items.length > maxSingleItems) return;

  const existing = sessionChannelsCache.get(key);
  if (existing) {
    sessionChannelsTotalItems = Math.max(0, sessionChannelsTotalItems - existing.length);
    sessionChannelsCache.delete(key);
  }

  while (
    sessionChannelsCache.size > 0 &&
    (sessionChannelsCache.size >= maxEntries || sessionChannelsTotalItems + items.length > maxTotalItems)
  ) {
    const oldestKey = sessionChannelsCache.keys().next().value;
    if (oldestKey === undefined) break;
    const evicted = sessionChannelsCache.get(oldestKey);
    if (evicted) sessionChannelsTotalItems = Math.max(0, sessionChannelsTotalItems - evicted.length);
    sessionChannelsCache.delete(oldestKey);
  }

  sessionChannelsCache.set(key, items);
  sessionChannelsTotalItems += items.length;
};

export const clearLivePlayerSessionCache = () => {
  sessionCategoriesCache.clear();
  sessionChannelsCache.clear();
  sessionSeriesDetailsCache.clear();
  sessionVodDetailsCache.clear();
  inFlightDetailsCache.clear();
  sessionChannelsTotalItems = 0;
  trimDbMemoryCaches();
};
if (typeof window !== 'undefined') {
  window.addEventListener('achour_clear_session_cache', clearLivePlayerSessionCache);
  window.addEventListener('achour_trim_memory', () => {
    sessionChannelsCache.clear();
    sessionSeriesDetailsCache.clear();
    sessionVodDetailsCache.clear();
    sessionChannelsTotalItems = 0;
    trimDbMemoryCaches();
  });
}

// Keep WebView wallpaper cutout polygon & native transparency classes synced across all active MultiView ExoPlayer slots
const syncMultiViewNativeOverlay = (isFullscreenSlot: boolean) => {
  if (typeof document === 'undefined' || typeof window === 'undefined') return;
  const native = (window as any).AchourNative;
  if (!isNativeApp() || !native?.showMultiSlot) return;

  const docEl = document.documentElement;
  const bodyEl = document.body;

  if (isFullscreenSlot) {
    docEl.classList.add('native-player-active');
    bodyEl.classList.add('native-player-active');
    docEl.classList.remove('native-player-preview');
    bodyEl.classList.remove('native-player-preview');
    docEl.style.removeProperty('--native-preview-clip');
    return;
  }

  const holeEls = Array.from(document.querySelectorAll<HTMLElement>('[data-multiview-native-hole="true"]'));
  const holes: string[] = [];
  for (const el of holeEls) {
    const r = el.getBoundingClientRect();
    if (r.width > 10 && r.height > 10) {
      const x = Math.max(0, Math.round(r.left));
      const y = Math.max(0, Math.round(r.top));
      const w = Math.max(0, Math.round(r.width));
      const h = Math.max(0, Math.round(r.height));
      holes.push(`${x}px ${y}px, ${x}px ${y + h}px, ${x + w}px ${y + h}px, ${x + w}px ${y}px, ${x}px ${y}px, 0px 0px`);
    }
  }

  if (holes.length > 0) {
    docEl.classList.add('native-player-active', 'native-player-preview');
    bodyEl.classList.add('native-player-active', 'native-player-preview');
    docEl.style.setProperty(
      '--native-preview-clip',
      `polygon(evenodd, 0px 0px, 100% 0px, 100% 100%, 0px 100%, 0px 0px, ${holes.join(', ')})`
    );
  } else {
    docEl.classList.remove('native-player-active', 'native-player-preview');
    bodyEl.classList.remove('native-player-active', 'native-player-preview');
    docEl.style.removeProperty('--native-preview-clip');
  }
};

// High-performance, lightweight video player dedicated for each active Multi-View slot (ExoPlayer on APK, Hls.js on Web)
const MultiViewSlotPlayer: React.FC<{
  channel: ParsedChannel;
  isActive: boolean;
  isMuted: boolean;
  isFullscreenSlot?: boolean;
  settings: AppSettings;
  onSelectSlot: () => void;
  onToggleMute: (e: React.MouseEvent) => void;
  onOpenFullscreen: () => void;
  onRemove: (e: React.MouseEvent) => void;
  slotIndex: number;
  isRtl: boolean;
}> = ({
  channel,
  isActive,
  isMuted,
  isFullscreenSlot = false,
  settings,
  onSelectSlot,
  onToggleMute,
  onOpenFullscreen,
  onRemove,
  slotIndex,
  isRtl,
}) => {
  const slotRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const isMutedRef = useRef(isMuted);
  isMutedRef.current = isMuted;
  const isFullscreenRef = useRef(isFullscreenSlot);
  isFullscreenRef.current = isFullscreenSlot;

  const native = typeof window !== 'undefined' ? (window as any).AchourNative : null;
  const isNativeActive = isNativeApp() && !!native?.showMultiSlot;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Sync audio mute/unmute instantly on native ExoPlayer slot
  useEffect(() => {
    if (!isNativeActive) return;
    try {
      native.setMultiSlotVolume?.(slotIndex, isMuted ? 0 : 1);
    } catch {}
  }, [isNativeActive, isMuted, slotIndex]);

  // Keep native ExoPlayer slot bounds & WebView transparency cutout synced on split <-> fullscreen <-> resize
  useEffect(() => {
    if (!isNativeActive) return;

    let lastKey = '';
    const syncSlotBounds = () => {
      syncMultiViewNativeOverlay(Boolean(isFullscreenRef.current));
      let b = { x: 0, y: 0, width: 0, height: 0 };
      if (!isFullscreenRef.current) {
        const rect = slotRef.current?.getBoundingClientRect();
        if (rect && rect.width > 10 && rect.height > 10) {
          b = {
            x: Math.round(rect.left),
            y: Math.round(rect.top),
            width: Math.round(rect.width),
            height: Math.round(rect.height),
          };
        } else {
          return;
        }
      }
      const key = `${b.x},${b.y},${b.width},${b.height}`;
      if (key === lastKey) return;
      lastKey = key;
      try {
        native.updateMultiSlotBounds?.(slotIndex, b.x, b.y, b.width, b.height);
      } catch {}
    };

    const rafId = requestAnimationFrame(syncSlotBounds);
    const settleTimer = setTimeout(syncSlotBounds, 90);
    window.addEventListener('resize', syncSlotBounds);

    let ro: ResizeObserver | null = null;
    if (slotRef.current && typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(syncSlotBounds);
      ro.observe(slotRef.current);
    }

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(settleTimer);
      ro?.disconnect();
      window.removeEventListener('resize', syncSlotBounds);
    };
  }, [isNativeActive, isFullscreenSlot, slotIndex, channel?.stream_id, channel?.url]);

  // Start stream playback (AndroidX Media3 ExoPlayer on APK, Hls.js on Web preview)
  useEffect(() => {
    if (!channel) return;

    let destroyed = false;
    setLoading(true);
    setError(false);

    let playUrl = channel.url || (channel as any).stream_url || '';
    if (!isNativeActive && playUrl && ((playUrl.includes('/live/') && playUrl.endsWith('.ts')) || playUrl.endsWith('.ts'))) {
      playUrl = playUrl.replace(/\.ts$/, '.m3u8');
    }

    const activeStreamUrl = (playUrl && (playUrl.startsWith('http://') || playUrl.startsWith('https://')) && !playUrl.includes('/api/proxy/stream'))
      ? getPlatformUrl('stream', playUrl, { vpnRegion: settings?.vpnRegion || 'auto' })
      : playUrl;

    if (!activeStreamUrl) {
      setError(true);
      setLoading(false);
      return;
    }

    if (isNativeActive && native?.showMultiSlot) {
      let b = { x: 0, y: 0, width: 0, height: 0 };
      if (!isFullscreenRef.current) {
        const rect = slotRef.current?.getBoundingClientRect();
        if (rect && rect.width > 10 && rect.height > 10) {
          b = {
            x: Math.round(rect.left),
            y: Math.round(rect.top),
            width: Math.round(rect.width),
            height: Math.round(rect.height),
          };
        }
      }
      syncMultiViewNativeOverlay(Boolean(isFullscreenRef.current));

      try {
        native.showMultiSlot(
          slotIndex,
          activeStreamUrl,
          JSON.stringify({
            title: channel.name || 'Achour TV',
            isLive: true,
            autoPlay: true,
            muted: isMutedRef.current,
            volume: isMutedRef.current ? 0 : 1,
            headers: {
              'User-Agent': 'Android/Media3/1.4.1',
              'X-Requested-With': 'com.achourplayer.app'
            }
          }),
          b.x,
          b.y,
          b.width,
          b.height
        );
      } catch (e) {
        console.warn('AchourNative showMultiSlot failed:', e);
        setError(true);
        setLoading(false);
      }

      const startedAt = Date.now();
      const pollTimer = setInterval(() => {
        if (destroyed) return;
        try {
          const playing = Boolean(native.isMultiSlotPlaying?.(slotIndex));
          const hasErr = Boolean(native.hasMultiSlotError?.(slotIndex));
          if (playing) {
            setLoading(false);
            setError(false);
          } else if (hasErr) {
            setLoading(false);
            setError(true);
          } else if (Date.now() - startedAt > 12000) {
            setLoading(false);
          }
        } catch {}
      }, 300);

      return () => {
        destroyed = true;
        clearInterval(pollTimer);
        try {
          native.hideMultiSlot?.(slotIndex);
        } catch {}
        requestAnimationFrame(() => syncMultiViewNativeOverlay(false));
      };
    }

    const video = videoRef.current;
    if (!video) return;

    if (Hls.isSupported()) {
      const hls = new Hls({
        maxBufferLength: 8,
        maxMaxBufferLength: 15,
        enableWorker: true,
        capLevelToPlayerSize: true,
      });
      hlsRef.current = hls;

      hls.loadSource(activeStreamUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (destroyed) return;
        setLoading(false);
        video.play().catch(() => {});
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              setError(true);
              setLoading(false);
              hls.destroy();
              break;
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = activeStreamUrl;
      video.addEventListener('loadedmetadata', () => {
        if (destroyed) return;
        setLoading(false);
        video.play().catch(() => {});
      });
      video.addEventListener('error', () => {
        if (destroyed) return;
        setError(true);
        setLoading(false);
      });
    } else {
      video.src = activeStreamUrl;
      video.play().catch(() => {});
    }

    return () => {
      destroyed = true;
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      if (video) {
        video.removeAttribute('src');
        video.load();
      }
    };
  }, [channel?.stream_id, channel?.url, settings?.vpnRegion, isNativeActive, slotIndex]);

  return (
    <div
      ref={slotRef}
      id={`multiview-slot-${slotIndex}`}
      data-tv-focusable="true"
      data-multiview-slot="true"
      data-multiview-native-hole={isNativeActive ? 'true' : undefined}
      data-slot-index={slotIndex}
      tabIndex={0}
      onClick={onSelectSlot}
      onDoubleClick={onOpenFullscreen}
      className={`group relative w-full h-full rounded-2xl overflow-hidden ${isNativeActive ? 'bg-transparent' : 'bg-black'} border transition-all cursor-pointer ${
        isActive
          ? 'border-gold shadow-[0_0_15px_var(--theme-glow)] ring-2 ring-gold/40'
          : 'border-white/15 hover:border-gold/50'
      }`}
    >
      {!isNativeActive && (
        <video
          ref={videoRef}
          playsInline
          autoPlay
          muted={isMuted}
          className="w-full h-full object-contain pointer-events-none"
        />
      )}

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 pointer-events-none z-10">
          <div className="w-7 h-7 border-2 border-gold border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/80 text-zinc-400 p-2 text-center pointer-events-none z-10">
          <AlertTriangle size={20} className="text-amber-400" />
          <span className="text-[11px] font-bold">{isRtl ? 'تعذر تشغيل البث' : 'Playback error'}</span>
        </div>
      )}

      {/* Top Bar Overlay */}
      <div className="absolute top-2 inset-x-2 flex items-center justify-between gap-1.5 z-20 pointer-events-auto">
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-black/75 backdrop-blur-sm border border-white/10 text-white min-w-0 max-w-[70%]">
          <span className="text-[10px] font-mono font-black text-gold">#{slotIndex + 1}</span>
          <span className="text-xs font-bold truncate">{channel.name}</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onToggleMute}
            data-tv-focusable="true" tabIndex={0}
            title={isMuted ? (isRtl ? 'تشغيل الصوت' : 'Unmute') : (isRtl ? 'كتم الصوت' : 'Mute')}
            className={`p-1.5 rounded-lg backdrop-blur-sm transition-colors cursor-pointer ${
              !isMuted ? 'bg-gold text-black' : 'bg-black/70 text-white hover:bg-white/20'
            }`}
          >
            {!isMuted ? <Volume2 size={13} /> : <VolumeX size={13} />}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenFullscreen();
            }}
            data-tv-focusable="true" tabIndex={0}
            title={isRtl ? 'ملء الشاشة' : 'Fullscreen'}
            className="p-1.5 rounded-lg bg-black/70 hover:bg-gold hover:text-black text-white backdrop-blur-sm transition-colors cursor-pointer"
          >
            <Maximize size={13} />
          </button>
          <button
            onClick={onRemove}
            data-tv-focusable="true" tabIndex={0}
            title={isRtl ? 'إزالة القناة' : 'Remove channel'}
            className="p-1.5 rounded-lg bg-black/70 hover:bg-rose-500 hover:text-white text-zinc-400 backdrop-blur-sm transition-colors cursor-pointer"
          >
            <X size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default function LivePlayer({ onBack, settings, onUpdateSettings, userId, initialType = 'live', initialChannelToPlay = null, onAutoPlayFallback }: LivePlayerProps) {

  const { t, isRtl } = useI18n(settings.language);
  const playlistId = settings.activePlaylistId || 'default';
  const [historyRevision, setHistoryRevision] = useState(0);
  const [progressRevision, setProgressRevision] = useState(0);
  const [vodResumeOverride, setVodResumeOverride] = useState<{
    mode: 'prompt' | 'resume' | 'restart';
    positionSec?: number;
  }>({ mode: 'prompt' });
  const activeSeriesParentRef = useRef<ParsedChannel | null>(null);
  const returningEpisodeIdRef = useRef<string | null>(null);
  const autoSeasonSelectedRef = useRef<string | null>(null);
  const autoPlayAttemptRef = useRef<ParsedChannel | null>(initialChannelToPlay || null);
  const autoPlayTriggeredRef = useRef(false);
  const autoPlayFallbackCalledRef = useRef(false);

  useEffect(() => {
    const onHistChanged = () => setHistoryRevision(r => r + 1);
    const onProgChanged = () => setProgressRevision(r => r + 1);
    window.addEventListener('achour_watch_history_changed', onHistChanged);
    window.addEventListener('achour_vod_progress_changed', onProgChanged);
    return () => {
      window.removeEventListener('achour_watch_history_changed', onHistChanged);
      window.removeEventListener('achour_vod_progress_changed', onProgChanged);
    };
  }, []);

  useEffect(() => {
    autoPlayAttemptRef.current = initialChannelToPlay || null;
    if (!initialChannelToPlay) {
      autoPlayTriggeredRef.current = false;
      autoPlayFallbackCalledRef.current = false;
    }
  }, [initialChannelToPlay?.stream_id]);

  const launchExternalPlayer = (url: string, overrideChannel?: ParsedChannel, playbackType?: 'live' | 'movie' | 'series') => {
    const targetItem = overrideChannel || selectedChannel;
    const effPlId = activePlaylist?.id || settings.activePlaylistId || 'default';
    const resolvedType = playbackType || (mediaType === 'series' ? 'series' : mediaType === 'movie' ? 'movie' : 'live');
    if (targetItem) {
      if (resolvedType === 'series') {
        addToWatchHistory('series', activeSeriesParentRef.current || targetItem, effPlId);
      } else if (resolvedType === 'movie') {
        addToWatchHistory('movie', targetItem, effPlId);
      } else {
        addToWatchHistory('live', targetItem, effPlId);
        saveLastWatchedChannel(targetItem, effPlId);
      }
    }

    const player = settings.selectedPlayer || '';
    const packageName = getPlayerPackage(player);
    
    // Resolve stream URL appropriately for Native APK vs Web Preview
    let finalUrl = getPlatformUrl('stream', url, { vpnRegion: settings.vpnRegion || 'auto' });
    if (finalUrl.startsWith('/')) {
      finalUrl = window.location.origin + finalUrl;
    }

    // MEDIA3 NATIVE BRIDGE INTEGRATION (Android APK Wrapper)
    const native = (window as any).AchourNative;
    if (native && typeof native.playMedia === 'function') {
      try {
        const isFav = favorites.includes(targetItem?.stream_id || '');
        native.playMedia(finalUrl, JSON.stringify({
          title: targetItem?.name || 'Achour TV',
          logo: targetItem?.stream_icon || '',
          stream_id: targetItem?.stream_id || '',
          type: mediaType,
          isFavorite: isFav,
          packageName: packageName || undefined,
          headers: {
            'User-Agent': 'Android/Media3/1.1.1',
            'X-Requested-With': 'com.nathnetwork.iptvsmarters'
          }
        }));
        return;
      } catch (e) {
        console.warn('Media3 Bridge Call Failed, falling back to Intent:', e);
      }
    }

    // Safe Android Intent launch
    try {
      const intentUrl = packageName
        ? `intent:${encodeURI(finalUrl)}#Intent;action=android.intent.action.VIEW;type=video/*;package=${packageName};end`
        : `intent:${encodeURI(finalUrl)}#Intent;action=android.intent.action.VIEW;type=video/*;end`;
        
      window.location.href = intentUrl;
    } catch (e) {
      console.error('External player launch failed:', e);
      setStreamError(isRtl ? 'تعذر تشغيل المشغل الخارجي. يرجى استخدام المشغل الداخلي.' : 'Could not launch external player. Please use the internal player.');
    }
  };




  const [mediaType, setMediaType] = useState<'live' | 'movie' | 'series' | 'favorites'>(initialType as any);
  const [categories, setCategories] = useState<ParsedCategory[]>([]);
  const [channels, setChannels] = useState<ParsedChannel[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedChannel, setSelectedChannel] = useState<ParsedChannel | null>(null);
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState<'none' | 'az'>('none');
  const [loading, setLoading] = useState(true);
  const [activePlaylist, setActivePlaylist] = useState<Playlist | null>(null);
  const [favorites, setFavorites] = useState<string[]>(() => getLocalFavoriteIds());
  const [vodFavorites, setVodFavorites] = useState<string[]>(() =>
    initialType === 'movie' || initialType === 'series' ? getLocalVodFavoriteIds(initialType) : []
  );
  const favoritesRef = useRef<string[]>(favorites);
  favoritesRef.current = favorites;
  const sortCategoriesBySavedOrderRef = useRef<(cats: ParsedCategory[]) => ParsedCategory[]>((c) => c);

  useEffect(() => {
    if (mediaType === 'movie' || mediaType === 'series') {
      setVodFavorites(getLocalVodFavoriteIds(mediaType));
    }
  }, [mediaType]);

  // Reset stale playback/EPG/detail states whenever active playlist changes
  useEffect(() => {
    sessionCategoriesCache.clear();
    sessionChannelsCache.clear();
    sessionSeriesDetailsCache.clear();
    sessionVodDetailsCache.clear();
    sessionChannelsTotalItems = 0;
    trimDbMemoryCaches();
    setSelectedChannel(null);
    setStreamError(null);
    setEpgData([]);
    setXmltvData({});
    setShortEpgCache({});
    setMediaDetailInfo(null);
    setMovieDetailsModal(null);
    shortEpgFetchedRef.current.clear();
  }, [settings.activePlaylistId]);

  // Load categories lazily from IndexedDB (with 0ms in-memory session cache)
  useEffect(() => {
    let cancelled = false;
    const loadCategories = async () => {
      setSelectedCategory('');
      setChannels([]);
      const typeToLoad = mediaType === 'favorites' ? 'live' : mediaType;

      try {
        const activeP = await fetchActivePlaylist();
        if (cancelled) return;

        const effectivePlaylistId = activeP?.id || settings.activePlaylistId || 'default';
        const sessionKey = `${effectivePlaylistId}_${typeToLoad}`;

        // 1. Instant 0ms return from in-memory session cache if already visited
        const inMemCats = sessionCategoriesCache.get(sessionKey);
        if (inMemCats && inMemCats.length > 0) {
          setCategories(inMemCats);
          const firstReal = inMemCats.find(c => c.category_id !== 'favorites');
          if (firstReal) {
            setSelectedCategory(firstReal.category_id);
          } else if (typeToLoad === 'live' && favoritesRef.current.length > 0) {
            setSelectedCategory('favorites');
          }
          setLoading(false);
          return;
        }

        setLoading(true);

        let formattedCats: ParsedCategory[] = [];
        const cachedCats = await getCategoriesByPlaylistAndType(effectivePlaylistId, typeToLoad as any);
        if (cachedCats.length > 0) {
          formattedCats = cachedCats.map((c: any) => ({
            category_id: String(c.category_id || c.id || ''),
            category_name: String(c.category_name || c.name || ''),
            count: c.count || 0
          }));
        } else if (activeP && !ExtractionService.isExtracting(effectivePlaylistId)) {
          // Check if extraction status already exists
          const extStatus = await getPlaylistExtractionStatus(effectivePlaylistId);
          if (!extStatus || extStatus.stage === 'idle') {
            const { categories: fetchedCats, channels: fetchedChs } = await fetchChannelsForType(activeP, typeToLoad as any, [], false);
            if (fetchedCats.length > 0) {
              formattedCats = fetchedCats.map((c: any) => ({
                category_id: String(c.category_id || c.id || ''),
                category_name: String(c.category_name || c.name || ''),
                count: c.count || 0
              }));
              await saveCategories(formattedCats.map((c, idx) => ({ ...c, orderIndex: idx })), typeToLoad as any, effectivePlaylistId).catch(() => {});
            }
            if (fetchedChs.length > 0) {
              await saveChannels(fetchedChs, typeToLoad as any, effectivePlaylistId, { batchSize: 500 }).catch(() => {});
              if (formattedCats.length === 0) {
                const catMap = new Map<string, ParsedCategory>();
                fetchedChs.forEach((ch: any) => {
                  const catName = String(ch.category_name || ch.category || 'General');
                  const cid = String(ch.category_id || catName);
                  if (!catMap.has(cid)) {
                    catMap.set(cid, { category_id: cid, category_name: catName, count: 0 });
                  }
                  catMap.get(cid)!.count!++;
                });
                formattedCats = Array.from(catMap.values());
              }
            }
          }
        }

        if (cancelled) return;

        // Clean, deduplicate & sort real categories (never inject synthetic 'favorites' into raw categories state)
        const seenCatIds = new Set<string>();
        const dedupedCats: ParsedCategory[] = [];
        for (const c of formattedCats) {
          if (!c || !c.category_id || isFavCategory(c)) continue;
          if (seenCatIds.has(c.category_id)) continue;
          seenCatIds.add(c.category_id);
          dedupedCats.push(c);
        }
        const cleanCats = sortCategoriesBySavedOrderRef.current(dedupedCats);
        sessionCategoriesCache.set(sessionKey, cleanCats);

        setCategories(cleanCats);
        if (cleanCats.length > 0) {
          setSelectedCategory(cleanCats[0].category_id);
        } else if (typeToLoad === 'live' && favoritesRef.current.length > 0) {
          setSelectedCategory('favorites');
        }
      } catch (e) {
        console.error('Failed to load categories:', e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    loadCategories();

    const onTypeReady = (e: any) => {
      const detail = e?.detail;
      const typeToLoad = mediaType === 'favorites' ? 'live' : mediaType;
      const effId = settings.activePlaylistId || 'default';
      if (!detail || detail.playlistId !== effId) return;
      if (detail.mediaType === 'categories' || detail.mediaType === typeToLoad) {
        sessionCategoriesCache.delete(`${effId}_${typeToLoad}`);
        loadCategories();
      }
    };
    window.addEventListener('achour_type_ready', onTypeReady);
    return () => {
      cancelled = true;
      window.removeEventListener('achour_type_ready', onTypeReady);
    };
  }, [mediaType, settings.activePlaylistId, userId]);

  const dbLookupSettledKeyRef = useRef<string>('');
  const [dbRefreshNonce, setDbRefreshNonce] = useState(0);
  const [categoryHasMore, setCategoryHasMore] = useState(false);
  const [categoryNextBucketOffset, setCategoryNextBucketOffset] = useState(0);
  const [categoryResolvedId, setCategoryResolvedId] = useState('');
  const [categorySearchMatches, setCategorySearchMatches] = useState<ParsedChannel[] | null>(null);
  const loadingMoreRef = useRef(false);

  useEffect(() => {
    const onTypeReady = (e: any) => {
      const detail = e?.detail;
      const typeToLoad = mediaType === 'favorites' ? 'live' : mediaType;
      const effId = activePlaylist?.id || settings.activePlaylistId || 'default';
      if (!detail || detail.playlistId !== effId) return;
      if (detail.mediaType === typeToLoad) {
        for (const k of Array.from(sessionChannelsCache.keys())) {
          if (k.startsWith(`${effId}_${typeToLoad}_`)) {
            const evicted = sessionChannelsCache.get(k);
            if (evicted) sessionChannelsTotalItems = Math.max(0, sessionChannelsTotalItems - evicted.length);
            sessionChannelsCache.delete(k);
          }
        }
        setDbRefreshNonce(n => n + 1);
      }
    };
    window.addEventListener('achour_type_ready', onTypeReady);
    return () => window.removeEventListener('achour_type_ready', onTypeReady);
  }, [mediaType, activePlaylist?.id, settings.activePlaylistId]);

  // Lazy load channels for the selected category ONLY using windowed bucket pagination (0 RAM explosion on 1M+ libraries)
  useEffect(() => {
    if (!selectedCategory) return;

    let isMounted = true;
    loadingMoreRef.current = false;
    setCategoryHasMore(false);
    setCategoryNextBucketOffset(0);
    setCategoryResolvedId('');
    setCategorySearchMatches(null);

    const loadChannels = async () => {
      const effectivePlId = activePlaylist?.id || settings.activePlaylistId || 'default';
      const typeToLoad = mediaType === 'favorites' ? 'live' : mediaType;
      const channelCacheKey = `${effectivePlId}_${typeToLoad}_${selectedCategory}`;
      dbLookupSettledKeyRef.current = '';

      try {
        if (selectedCategory === WATCH_HISTORY_CAT_ID) {
          if (!isMounted) return;
          dbLookupSettledKeyRef.current = channelCacheKey;
          const histType = (typeToLoad === 'movie' || typeToLoad === 'series') ? typeToLoad : 'live';
          setChannels(getWatchHistory(histType, effectivePlId));
          return;
        }

        if (selectedCategory === CONTINUE_WATCHING_CAT_ID) {
          if (!isMounted) return;
          dbLookupSettledKeyRef.current = channelCacheKey;
          const vodType: 'movie' | 'series' = typeToLoad === 'series' ? 'series' : 'movie';
          setChannels(getContinueWatchingItems(vodType, effectivePlId, getWatchHistory(vodType, effectivePlId)));
          return;
        }

        if (selectedCategory === 'favorites' || mediaType === 'favorites') {
          if (mediaType === 'movie' || mediaType === 'series') {
            if (!isMounted) return;
            setChannels([]);
            return;
          }
          const favItems = await getChannelsByIds(effectivePlId, 'live', favoritesRef.current);
          if (!isMounted) return;
          dbLookupSettledKeyRef.current = channelCacheKey;
          setChannels(favItems);
          return;
        }

        // 1. Check budgeted session LRU cache
        const cachedChs = sessionChannelsCache.get(channelCacheKey);
        if (cachedChs && cachedChs.length > 0) {
          if (!isMounted) return;
          dbLookupSettledKeyRef.current = channelCacheKey;
          setChannels(cachedChs);
          return;
        }

        const win = await getChannelsByCategoryWindowed(typeToLoad, selectedCategory, effectivePlId, {
          bucketOffset: 0,
          maxItems: isTVOrLowEndDevice() ? 1000 : 4000
        });
        if (!isMounted) return;
        dbLookupSettledKeyRef.current = channelCacheKey;

        const loadedItems = win.items || [];
        setCategoryHasMore(win.hasMore);
        setCategoryNextBucketOffset(win.nextBucketOffset);
        setCategoryResolvedId(win.resolvedCategoryId);

        if (loadedItems.length > 0 && !win.hasMore) {
          setSessionChannelsCache(channelCacheKey, loadedItems);
        }
        setChannels(loadedItems);
      } catch (e) {
        dbLookupSettledKeyRef.current = channelCacheKey;
        console.error('Failed to load category channels:', e);
      }
    };
    loadChannels();
    return () => { isMounted = false; };
  }, [selectedCategory, mediaType, activePlaylist?.id, settings.activePlaylistId, dbRefreshNonce]);

  useEffect(() => {
    if (selectedCategory === WATCH_HISTORY_CAT_ID) {
      const effectivePlId = activePlaylist?.id || settings.activePlaylistId || 'default';
      const typeToLoad = mediaType === 'favorites' ? 'live' : mediaType;
      const histType = (typeToLoad === 'movie' || typeToLoad === 'series') ? typeToLoad : 'live';
      setChannels(getWatchHistory(histType, effectivePlId));
      return;
    }
    if (selectedCategory === CONTINUE_WATCHING_CAT_ID) {
      const effectivePlId = activePlaylist?.id || settings.activePlaylistId || 'default';
      const vodType: 'movie' | 'series' = mediaType === 'series' ? 'series' : 'movie';
      setChannels(getContinueWatchingItems(vodType, effectivePlId, getWatchHistory(vodType, effectivePlId)));
    }
  }, [historyRevision, progressRevision, selectedCategory, mediaType, activePlaylist?.id, settings.activePlaylistId]);

  const handleLoadMoreCategoryChannels = useCallback(async () => {
    if (!categoryHasMore || loadingMoreRef.current) return;
    if (channels.length >= (isTVOrLowEndDevice() ? 12000 : 50000)) return;
    const effectivePlId = activePlaylist?.id || settings.activePlaylistId || 'default';
    const typeToLoad = mediaType === 'favorites' ? 'live' : mediaType;
    const catKey = categoryResolvedId || selectedCategory;
    if (!catKey || catKey === 'favorites' || catKey === 'recent') return;

    loadingMoreRef.current = true;
    try {
      const nextWin = await getChannelsByCategoryWindowed(typeToLoad, catKey, effectivePlId, {
        bucketOffset: categoryNextBucketOffset,
        maxItems: isTVOrLowEndDevice() ? 1500 : 4000
      });
      if (nextWin.items.length > 0) {
        setChannels(prev => prev.concat(nextWin.items));
      }
      setCategoryHasMore(nextWin.hasMore);
      setCategoryNextBucketOffset(nextWin.nextBucketOffset);
    } catch {
      setCategoryHasMore(false);
    } finally {
      loadingMoreRef.current = false;
    }
  }, [categoryHasMore, categoryNextBucketOffset, categoryResolvedId, selectedCategory, activePlaylist?.id, settings.activePlaylistId, mediaType, channels.length]);

  // Streaming IndexedDB search when searching inside a huge partially-loaded category
  useEffect(() => {
    const cleanQ = search.trim();
    if (!cleanQ || !categoryHasMore) {
      setCategorySearchMatches(null);
      return;
    }
    let cancelled = false;
    const effectivePlId = activePlaylist?.id || settings.activePlaylistId || 'default';
    const typeToLoad = mediaType === 'favorites' ? 'live' : mediaType;
    const catKey = categoryResolvedId || selectedCategory;

    const timer = setTimeout(async () => {
      const hits = await searchChannelsInCategory(effectivePlId, typeToLoad as any, catKey, cleanQ, 250);
      if (!cancelled) {
        setCategorySearchMatches(hits);
      }
    }, 180);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [search, categoryHasMore, activePlaylist?.id, settings.activePlaylistId, mediaType, categoryResolvedId, selectedCategory]);

  // Refresh channels ONLY when viewing Live TV favorites and favorite list changes
  useEffect(() => {
    if (mediaType === 'movie' || mediaType === 'series') return;
    if (selectedCategory !== 'favorites' && mediaType !== 'favorites') return;
    let isMounted = true;
    const effectivePlId = activePlaylist?.id || settings.activePlaylistId || 'default';
    getChannelsByIds(effectivePlId, 'live', favorites).then((favList) => {
      if (!isMounted) return;
      setChannels(favList);
    }).catch(() => {});
    return () => { isMounted = false; };
  }, [favorites, selectedCategory, mediaType, activePlaylist?.id, settings.activePlaylistId]);

  const [streamingHost, setStreamingHost] = useState<string>('');
  const [showOcr, setShowOcr] = useState(false);
  const [showRemoteHelp, setShowRemoteHelp] = useState(false);
  const [showOverlayChannelDrawer, setShowOverlayChannelDrawer] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [streamError, setStreamError] = useState<string | null>(null);
  const [activeVodPlayer, setActiveVodPlayer] = useState<ParsedChannel | null>(null);
  const [showEpgGrid, setShowEpgGrid] = useState(false);
  
  const [itemsToShow, setItemsToShow] = useState(100);
  const [movieDetailsModal, setMovieDetailsModal] = useState<ParsedChannel | null>(null);
  const listContainerRef = useRef<HTMLDivElement>(null);
  const detailsSeasonsScrollRef = useRef<HTMLDivElement>(null);
  const detailsEpisodesScrollRef = useRef<HTMLDivElement>(null);
  const autoFocusedSeriesIdRef = useRef<string | null>(null);

  // Multi-View State (Live TV only)
  const [multiViewMode, setMultiViewMode] = useState<1 | 2 | 4>(1);
  const [showMultiViewMenu, setShowMultiViewMenu] = useState(false);
  const [multiViewActive, setMultiViewActive] = useState(false);
  const [multiViewPickingSlot, setMultiViewPickingSlot] = useState<number | null>(null);
  const [multiViewFullscreenSlot, setMultiViewFullscreenSlot] = useState<number | null>(null);
  const [multiViewSlots, setMultiViewSlots] = useState<(ParsedChannel | null)[]>([null, null, null, null]);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number>(0);
  const [audioSlotIndex, setAudioSlotIndex] = useState<number>(0);
  const preMultiViewChannelRef = useRef<ParsedChannel | null>(null);

  // Sync WebView transparency cutouts & guarantee native MultiView ExoPlayer cleanup on exit/unmount
  useEffect(() => {
    const native = typeof window !== 'undefined' ? (window as any).AchourNative : null;
    if (!isNativeApp() || !native?.showMultiSlot) return;

    if (!multiViewActive) {
      try {
        native.hideAllMultiSlots?.();
      } catch {}
      if (!selectedChannel && !activeVodPlayer) {
        document.documentElement.classList.remove('native-player-active', 'native-player-preview');
        document.body.classList.remove('native-player-active', 'native-player-preview');
        document.documentElement.style.removeProperty('--native-preview-clip');
      }
      return;
    }

    const rafId = requestAnimationFrame(() => {
      syncMultiViewNativeOverlay(multiViewFullscreenSlot !== null);
    });
    return () => cancelAnimationFrame(rafId);
  }, [multiViewActive, multiViewMode, multiViewFullscreenSlot, multiViewSlots, selectedChannel?.stream_id, activeVodPlayer]);

  useEffect(() => {
    return () => {
      const native = typeof window !== 'undefined' ? (window as any).AchourNative : null;
      if (isNativeApp() && native?.hideAllMultiSlots) {
        try {
          native.hideAllMultiSlots();
        } catch {}
      }
    };
  }, []);

  // D-Pad TV Remote Control Navigation States & Preview Refs
  const tvFocusedPane = useRef<'categories' | 'channels' | 'header' | 'player' | 'player-controls' | 'multiview'>('categories');
  const tvFocusedCatIndex = useRef<number>(0);
  const tvFocusedChannelIndex = useRef<number>(0);
  const tvFocusedControlIndex = useRef<number>(0);

  const previewDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const categoryNavDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const detailsPrefetchTimerRef = useRef<NodeJS.Timeout | null>(null);
  const currentHighlightedChannelRef = useRef<string | null>(null);
  const filteredChannelsRef = useRef<ParsedChannel[]>([]);
  const visibleCategoriesRef = useRef<ParsedCategory[]>([]);
  const handleHighlightChannelRef = useRef<(ch: ParsedChannel) => void>(() => {});
  const handleOpenFullscreenRef = useRef<(ch: ParsedChannel) => void>(() => {});
  const handleChannelClickRef = useRef<(ch: ParsedChannel) => void>(() => {});
  const toggleFullscreenRef = useRef<() => void>(() => {});
  const virtualListRef = useRef<VirtualizedChannelListHandle | null>(null);
  const categoryListRef = useRef<VirtualizedCategoryListHandle | null>(null);
  const gridColumnCountRef = useRef<number>(4);

  const focusCategoryAtIdx = useCallback((nextIdx: number) => {
    const catsList = visibleCategoriesRef.current || [];
    if (catsList.length === 0) return;
    const safeIdx = Math.max(0, Math.min(catsList.length - 1, nextIdx));
    tvFocusedCatIndex.current = safeIdx;
    if (categoryListRef.current) {
      categoryListRef.current.focusIndex(safeIdx);
      return;
    }
    const targetEl = document.querySelector<HTMLElement>(
      `[data-tv-pane="categories"][data-cat-index="${safeIdx}"]`
    );
    if (targetEl) setTVFocus(targetEl, { scroll: true });
  }, []);

  const focusChannelAtIdx = useCallback((nextIdx: number) => {
    const channelsList = filteredChannelsRef.current || [];
    if (channelsList.length === 0) return;
    const safeIdx = Math.max(0, Math.min(channelsList.length - 1, nextIdx));
    tvFocusedChannelIndex.current = safeIdx;

    if (virtualListRef.current) {
      virtualListRef.current.focusIndex(safeIdx);
      return;
    }

    const targetEl = document.querySelector<HTMLElement>(
      `[data-tv-pane="channels"][data-index="${safeIdx}"]`
    );
    if (targetEl) setTVFocus(targetEl, { scroll: true });
  }, []);

  useEffect(() => {
    return () => {
      if (previewDebounceRef.current) {
        clearTimeout(previewDebounceRef.current);
      }
      if (categoryNavDebounceRef.current) {
        clearTimeout(categoryNavDebounceRef.current);
      }
      if (detailsPrefetchTimerRef.current) {
        clearTimeout(detailsPrefetchTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const restoreLastChannel = async () => {
      // Do not auto-select or auto-play channel on Live TV initial load so user can browse categories/channels first
      if (mediaType !== 'live' && channels.length > 0 && !selectedChannel) {
        try {
          const lastId = localStorage.getItem('achour_last_stream_id');
          if (lastId) {
            const lastCh = channels.find(c => c.stream_id === lastId);
            if (lastCh) {
              setSelectedChannel(lastCh);
            }
          }
        } catch (e) {}
      }
    };
    if (!loading) restoreLastChannel();
  }, [loading, channels, selectedChannel, mediaType]);

  // Register pushBackHandler in LivePlayer so remote & phone Back button navigates back cleanly


  useEffect(() => {
    setItemsToShow(100);
    tvFocusedChannelIndex.current = 0;
    virtualListRef.current?.resetToIndex(0);
  }, [selectedCategory, search, mediaType]);

  const scrollModalItemIntoContainer = useCallback(
    (container: HTMLElement | null, child: HTMLElement | null, axis: 'x' | 'y') => {
      if (!container || !child) return;

      // Compute offset coordinates relative to container (100% immune to parent CSS transform: scale)
      let offsetY = 0;
      let offsetX = 0;
      let node: HTMLElement | null = child;
      while (node && node !== container) {
        offsetY += node.offsetTop;
        offsetX += node.offsetLeft;
        node = node.offsetParent as HTMLElement | null;
      }
      // Fallback if offsetParent chain skipped container
      if (node !== container) {
        offsetY = child.offsetTop;
        offsetX = child.offsetLeft;
      }

      if (axis === 'y') {
        const pad = 10;
        const itemTop = offsetY;
        const itemBottom = offsetY + child.offsetHeight;
        const viewTop = container.scrollTop;
        const viewBottom = viewTop + container.clientHeight;
        if (itemTop - pad < viewTop) {
          container.scrollTop = Math.max(0, itemTop - pad);
        } else if (itemBottom + pad > viewBottom) {
          container.scrollTop = Math.max(0, itemBottom + pad - container.clientHeight);
        }
      } else {
        const pad = 12;
        const itemLeft = offsetX;
        const itemRight = offsetX + child.offsetWidth;
        const viewLeft = container.scrollLeft;
        const viewRight = viewLeft + container.clientWidth;
        if (itemLeft - pad < viewLeft) {
          container.scrollLeft = Math.max(0, itemLeft - pad);
        } else if (itemRight + pad > viewRight) {
          container.scrollLeft = Math.max(0, itemRight + pad - container.clientWidth);
        }
      }
    },
    []
  );

  // Auto-focus inside Movie/Series details modal when it opens (restoring last-played episode on Back!)
  useEffect(() => {
    if (!movieDetailsModal) {
      autoFocusedSeriesIdRef.current = null;
      return;
    }
    const timer = setTimeout(() => {
      const dialog = document.querySelector<HTMLElement>('[data-tv-details-dialog="true"]');
      if (!dialog) return;
      let initialTarget: HTMLElement | null = null;
      if (returningEpisodeIdRef.current) {
        const retId = returningEpisodeIdRef.current;
        returningEpisodeIdRef.current = null;
        initialTarget = dialog.querySelector<HTMLElement>(`[data-episode-item="true"][data-episode-id="${retId}"]`);
      }
      if (!initialTarget) {
        initialTarget =
          dialog.querySelector<HTMLElement>('[data-tv-play-now="true"]') ||
          dialog.querySelector<HTMLElement>('[data-episode-item="true"][data-episode-resume="true"]') ||
          dialog.querySelector<HTMLElement>('[data-season-tab="true"][data-season-active="true"]') ||
          dialog.querySelector<HTMLElement>('[data-season-tab="true"]') ||
          dialog.querySelector<HTMLElement>('[data-episode-item="true"]') ||
          dialog.querySelector<HTMLElement>('[data-modal-role="favorite"]') ||
          dialog.querySelector<HTMLElement>('[data-tv-modal="details"]');
      }
      if (initialTarget) {
        setTVFocus(initialTarget, { scroll: true });
      }
    }, 35);
    return () => clearTimeout(timer);
  }, [movieDetailsModal]);



  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight + 100) {
      setItemsToShow(prev => prev + 100);
    }
  }, []);

  const [mediaDetailInfo, setMediaDetailInfo] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [activePlayingMovie, setActivePlayingMovie] = useState<ParsedChannel | null>(null);
  const [selectedSeasonNum, setSelectedSeasonNum] = useState<number>(1);

  const seriesSeasonsData = useMemo(() => {
    const targetMedia = movieDetailsModal || activeSeriesParentRef.current || activeVodPlayer;
    if (mediaType !== 'series' || !targetMedia) return [];

    const effectivePlId = activePlaylist?.id || settings.activePlaylistId || 'default';
    const seriesIdClean = cleanVodEntityId(
      (targetMedia as any).series_id || targetMedia.stream_id || (targetMedia as any).id,
      effectivePlId
    );
    const parentSeriesTitle = activeSeriesParentRef.current?.name || targetMedia.name;

    const epBuckets = new Map<number, { seasonNum: number; rawTitle?: string; episodes: any[] }>();
    const pushToBucket = (sNum: number, list: any[], rawTitle?: string) => {
      if (!Array.isArray(list) || list.length === 0) return;
      const existing = epBuckets.get(sNum);
      if (existing) {
        existing.episodes.push(...list);
        if (!existing.rawTitle && rawTitle) existing.rawTitle = rawTitle;
      } else {
        epBuckets.set(sNum, { seasonNum: sNum, rawTitle, episodes: [...list] });
      }
    };

    const parseSeasonNumber = (val: any, fallback: number): number => {
      if (typeof val === 'number' && Number.isFinite(val) && val > 0) return val;
      const match = String(val ?? '').match(/\d+/);
      if (match) {
        const parsed = parseInt(match[0], 10);
        if (!isNaN(parsed) && parsed > 0) return parsed;
      }
      return fallback;
    };

    if (mediaDetailInfo?.episodes) {
      if (Array.isArray(mediaDetailInfo.episodes)) {
        mediaDetailInfo.episodes.forEach((ep: any) => {
          const sNum = parseSeasonNumber(ep?.season ?? ep?.season_num ?? ep?.season_number, 1);
          pushToBucket(sNum, [ep]);
        });
      } else if (typeof mediaDetailInfo.episodes === 'object') {
        Object.entries(mediaDetailInfo.episodes).forEach(([rawKey, val], idx) => {
          if (Array.isArray(val)) {
            const sNum = parseSeasonNumber(rawKey, idx + 1);
            pushToBucket(sNum, val);
          } else if (val && typeof val === 'object') {
            const innerList = Array.isArray((val as any).episodes) ? (val as any).episodes : Object.values(val);
            const sNum = parseSeasonNumber((val as any).season_number ?? rawKey, idx + 1);
            pushToBucket(sNum, innerList, (val as any).name);
          }
        });
      }
    } else if (Array.isArray(mediaDetailInfo?.seasons)) {
      mediaDetailInfo.seasons.forEach((s: any, idx: number) => {
        if (Array.isArray(s?.episodes) && s.episodes.length > 0) {
          const sNum = parseSeasonNumber(s.season_number ?? s.season ?? s.name, idx + 1);
          pushToBucket(sNum, s.episodes, s.name);
        }
      });
    }

    const sortedBuckets = Array.from(epBuckets.values()).sort((a, b) => a.seasonNum - b.seasonNum);
    if (sortedBuckets.length > 0) {
      return sortedBuckets.map((bucket) => {
        const seasonNum = bucket.seasonNum;
        const sortedRawEps = [...bucket.episodes].sort((a, b) => {
          const aNum = parseInt(String(a?.episode_num ?? a?.episode ?? 0), 10) || 0;
          const bNum = parseInt(String(b?.episode_num ?? b?.episode ?? 0), 10) || 0;
          return aNum - bNum;
        });

        const episodesList = sortedRawEps.map((ep: any, idx: number) => {
          const epNum = parseInt(String(ep.episode_num ?? ep.episode ?? idx + 1), 10) || (idx + 1);
          const trueEpId = cleanVodEntityId(
            ep.xtream_id ?? ep.original_id ?? ep.stream_id ?? ep.id,
            effectivePlId,
            seriesIdClean
          );
          const rawStreamId = trueEpId || String(ep.stream_id || ep.id || `${seriesIdClean || targetMedia.stream_id}-s${seasonNum}-e${epNum}`);
          const cleanStreamId = rawStreamId.replace(/\.(mp4|mkv|avi|mov|webm|ts|m3u8)$/i, '');
          const ext = ep.container_extension || targetMedia.container_extension || 'mp4';
          const directSourceClean = typeof ep.direct_source === 'string' ? ep.direct_source.trim() : '';

          let epDirectUrl = ep.stream_url || directSourceClean || ep.url || targetMedia.url;
          if (activePlaylist?.type === 'xtream' && activePlaylist.username && activePlaylist.password && !directSourceClean) {
            let baseHost = streamingHost || (activePlaylist.url || '').trim().replace(/\/+$/, '').replace(/\/(player_api|get|index)\.php.*$/i, '').replace(/\/c\/?$/i, '').replace(/\?.*$/, '');
            if (baseHost && !baseHost.startsWith('http://') && !baseHost.startsWith('https://')) {
              baseHost = `http://${baseHost}`;
            }
            epDirectUrl = `${baseHost}/series/${encodeURIComponent(activePlaylist.username)}/${encodeURIComponent(activePlaylist.password)}/${cleanStreamId}.${ext}`;
          }

          return {
            stream_id: cleanStreamId,
            xtream_id: cleanStreamId,
            series_id: seriesIdClean || String(targetMedia.stream_id || ''),
            series_name: parentSeriesTitle,
            type: 'series' as const,
            name: `${parentSeriesTitle} - S${seasonNum} E${epNum}: ${ep.title || ep.name || (isRtl ? `الحلقة ${epNum}` : `Episode ${epNum}`)}`,
            stream_icon: ep.info?.movie_image || ep.info?.cover_big || targetMedia.stream_icon,
            url: epDirectUrl,
            category_id: targetMedia.category_id,
            category_name: targetMedia.category_name,
            container_extension: ext,
            duration: ep.info?.duration || ep.duration,
            season: seasonNum,
            season_num: seasonNum,
            episode: epNum,
            episode_num: epNum
          };
        });

        return {
          seasonNumber: seasonNum,
          title: bucket.rawTitle || (isRtl ? `الموسم ${seasonNum}` : `Season ${seasonNum}`),
          episodes: episodesList
        };
      });
    }

    return [];
  }, [mediaType, movieDetailsModal, activeVodPlayer, mediaDetailInfo, activePlaylist, streamingHost, isRtl, settings.activePlaylistId]);

  useEffect(() => {
    if (!movieDetailsModal || mediaType !== 'series' || seriesSeasonsData.length === 0) return;
    const modalSid = String((movieDetailsModal as any).series_id || movieDetailsModal.stream_id || '');
    if (autoSeasonSelectedRef.current !== modalSid) {
      autoSeasonSelectedRef.current = modalSid;
      const plId = activePlaylist?.id || settings.activePlaylistId || 'default';
      const unfinished = getSeriesLastUnfinishedEpisode(plId, modalSid);
      if (unfinished && seriesSeasonsData.some(s => s.seasonNumber === unfinished.seasonNum)) {
        setSelectedSeasonNum(unfinished.seasonNum);
        return;
      }
    }
    if (!seriesSeasonsData.some(s => s.seasonNumber === selectedSeasonNum)) {
      setSelectedSeasonNum(seriesSeasonsData[0].seasonNumber);
    }
  }, [seriesSeasonsData, selectedSeasonNum, movieDetailsModal, mediaType, activePlaylist?.id, settings.activePlaylistId]);

  useEffect(() => {
    if (detailsEpisodesScrollRef.current && !returningEpisodeIdRef.current) {
      detailsEpisodesScrollRef.current.scrollTop = 0;
    }
  }, [selectedSeasonNum, movieDetailsModal]);

  // Once series seasons/episodes load asynchronously, place initial focus on quick-resume / active season tab if user is still on header/footer
  useEffect(() => {
    if (!movieDetailsModal || seriesSeasonsData.length === 0) return;
    if (autoFocusedSeriesIdRef.current === movieDetailsModal.stream_id) return;
    autoFocusedSeriesIdRef.current = movieDetailsModal.stream_id;

    const timer = setTimeout(() => {
      const dialog = document.querySelector<HTMLElement>('[data-tv-details-dialog="true"]');
      if (!dialog) return;
      const cur = getCurrentTVFocus();
      const role = cur?.getAttribute('data-modal-role');
      if (!cur || !dialog.contains(cur) || role === 'close' || role === 'favorite') {
        const preferred =
          dialog.querySelector<HTMLElement>('[data-tv-play-now="true"]') ||
          dialog.querySelector<HTMLElement>('[data-season-tab="true"][data-season-active="true"]') ||
          dialog.querySelector<HTMLElement>('[data-season-tab="true"]');
        if (preferred) {
          setTVFocus(preferred, { scroll: false });
        }
      }
    }, 35);
    return () => clearTimeout(timer);
  }, [movieDetailsModal, seriesSeasonsData.length]);

  const parsedSubscription = useMemo(() => {
    if (!activePlaylist || !activePlaylist.expDate) return null;
    return parseExpiryDate(activePlaylist.expDate, isRtl);
  }, [activePlaylist?.expDate, isRtl]);

  const [volume, setVolume] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [brightness, setBrightness] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [selectedQuality, setSelectedQuality] = useState<string>('4K Ultra HD');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '4:3' | 'fill' | 'fit'>('16:9');
  
  const [showAudioMenu, setShowAudioMenu] = useState(false);
  const [showSubMenu, setShowSubMenu] = useState(false);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [selectedAudioTrack, setSelectedAudioTrack] = useState('Audio 1 (الأساسي - Primary)');
  const [selectedSubtitleTrack, setSelectedSubtitleTrack] = useState('Off (مغلق)');
  const [subtitleActive, setSubtitleActive] = useState<boolean>(false);





  const handleNextChannel = useCallback(() => {
    if (!channels || channels.length === 0) return;
    const curIndex = channels.findIndex(c => c.stream_id === selectedChannel?.stream_id);
    const nextIndex = curIndex >= 0 ? (curIndex + 1) % channels.length : 0;
    const nextCh = channels[nextIndex];
    setSelectedChannel(nextCh);
    setActivePlayingMovie(nextCh);
    addToRecents(nextCh);
  }, [channels, selectedChannel]);

  const handlePrevChannel = useCallback(() => {
    if (!channels || channels.length === 0) return;
    const curIndex = channels.findIndex(c => c.stream_id === selectedChannel?.stream_id);
    const prevIndex = curIndex > 0 ? curIndex - 1 : channels.length - 1;
    const prevCh = channels[prevIndex];
    setSelectedChannel(prevCh);
    setActivePlayingMovie(prevCh);
    addToRecents(prevCh);
  }, [channels, selectedChannel]);



  const [showControls, setShowControls] = useState<boolean>(false);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const triggerControlsVisibility = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (!showAudioMenu && !showSubMenu && !showQualityMenu && !movieDetailsModal) {
        setShowControls(false);
      }
    }, isFullscreen ? 8000 : 5000);
  }, [showAudioMenu, showSubMenu, showQualityMenu, movieDetailsModal, isFullscreen]);

  const toggleControlsVisibility = useCallback(() => {
    setShowControls(prev => {
      const next = !prev;
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
      if (next) {
        controlsTimeoutRef.current = setTimeout(() => {
          if (!showAudioMenu && !showSubMenu && !showQualityMenu && !movieDetailsModal) {
            setShowControls(false);
          }
        }, isFullscreen ? 8000 : 5000);
      }
      return next;
    });
  }, [showAudioMenu, showSubMenu, showQualityMenu, movieDetailsModal, isFullscreen]);

  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (showAudioMenu || showSubMenu || showQualityMenu) {
      setShowControls(true);
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    }
  }, [showAudioMenu, showSubMenu, showQualityMenu]);

  const [showEpgTimeline, setShowEpgTimeline] = useState(false);
  const [reorderTarget, setReorderTarget] = useState<{ type: 'category' | 'channel', id: string, index: number, name: string } | null>(null);
  const prevReorderTargetIdRef = useRef<string | null>(null);

  useEffect(() => {
    const hasActiveModal = !!(showOcr || showPinModal || showRemoteHelp || showOverlayChannelDrawer || movieDetailsModal || reorderTarget || showEpgGrid || showEpgTimeline || showAudioMenu || showSubMenu || showQualityMenu || isFullscreen);
    const priority = hasActiveModal ? BackPriority.MODAL : BackPriority.VIEW;

    const unregister = pushBackHandler(() => {
      if (showOcr) { setShowOcr(false); return true; }
      if (showPinModal) { setShowPinModal(false); return true; }
      if (showRemoteHelp) { setShowRemoteHelp(false); return true; }
      if (showOverlayChannelDrawer) { setShowOverlayChannelDrawer(false); return true; }
      if (reorderTarget) { setReorderTarget(null); return true; }
      if (showMultiViewMenu) { setShowMultiViewMenu(false); return true; }
      if (multiViewFullscreenSlot !== null) {
        const slot = multiViewFullscreenSlot;
        setMultiViewFullscreenSlot(null);
        tvFocusedPane.current = 'multiview';
        setTimeout(() => { const el = document.getElementById(`multiview-slot-${slot}`); if (el) setTVFocus(el); }, 40);
        return true;
      }
      if (multiViewPickingSlot !== null) {
        setMultiViewPickingSlot(null);
        tvFocusedPane.current = 'multiview';
        setTimeout(() => { const el = document.getElementById(`multiview-slot-${selectedSlotIndex}`); if (el) setTVFocus(el); }, 40);
        return true;
      }
      if (movieDetailsModal) {
        setMovieDetailsModal(null);
        setTimeout(() => {
          tvFocusedPane.current = 'channels';
          focusChannelAtIdx(tvFocusedChannelIndex.current);
        }, 30);
        return true;
      }
      if (showEpgGrid) { setShowEpgGrid(false); return true; }
      if (showEpgTimeline) { setShowEpgTimeline(false); return true; }
      if (showAudioMenu || showSubMenu || showQualityMenu) {
        setShowAudioMenu(false); setShowSubMenu(false); setShowQualityMenu(false);
        return true;
      }

      if (isFullscreen) {
        setIsFullscreen(false);
        setActiveVodPlayer(null);
        if (toggleFullscreenRef.current) toggleFullscreenRef.current();
        setTimeout(() => {
          tvFocusedPane.current = 'channels';
          focusChannelAtIdx(tvFocusedChannelIndex.current);
        }, 30);
        return true;
      }

      if (activeVodPlayer) {
        const currentSeries = activeSeriesParentRef.current || activeVodPlayer;
        setActiveVodPlayer(null);
        if (currentSeries && mediaType === 'series') {
          setMovieDetailsModal(currentSeries);
        } else {
          setTimeout(() => {
            tvFocusedPane.current = 'channels';
            focusChannelAtIdx(tvFocusedChannelIndex.current);
          }, 30);
        }
        return true;
      }

      if (tvFocusedPane.current === 'multiview') {
        tvFocusedPane.current = 'channels';
        focusChannelAtIdx(tvFocusedChannelIndex.current >= 0 ? tvFocusedChannelIndex.current : 0);
        return true;
      }

      if (tvFocusedPane.current === 'channels' || tvFocusedPane.current === 'player') {
        tvFocusedPane.current = 'categories';
        focusCategoryAtIdx(tvFocusedCatIndex.current);
        return true;
      }

      onBack();
      return true;
    }, priority);

    return unregister;
  }, [
    showOcr, showPinModal, showRemoteHelp, showOverlayChannelDrawer, reorderTarget,
    showMultiViewMenu, multiViewFullscreenSlot, multiViewPickingSlot, selectedSlotIndex, movieDetailsModal, showEpgGrid, showEpgTimeline, showAudioMenu,
    showSubMenu, showQualityMenu, isFullscreen, activeVodPlayer, mediaType, onBack
  ]);

  const [epgData, setEpgData] = useState<any[]>([]);
  const [epgLoading, setEpgLoading] = useState(false);
  const [xmltvData, setXmltvData] = useState<Record<string, any[]>>({});
  const [shortEpgCache, setShortEpgCache] = useState<Record<string, any[]>>({});
  const shortEpgFetchedRef = useRef<Set<string>>(new Set());

  const decodeEpgText = (val: any): string => {
    if (!val || typeof val !== 'string') return '';
    let trimmed = val.trim();
    if (!trimmed) return '';
    // Decode UTF-8 base64 strings commonly returned by Xtream get_short_epg
    if (/^[A-Za-z0-9+/=]+$/.test(trimmed) && trimmed.length >= 4 && trimmed.length % 4 === 0 && !trimmed.includes(' ')) {
      try {
        const binary = atob(trimmed);
        const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
        const decoded = new TextDecoder('utf-8', { fatal: false }).decode(bytes);
        if (decoded && !/\uFFFD/.test(decoded)) {
          trimmed = decoded.trim();
        }
      } catch (e) {}
    }
    return trimmed
      .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;|&apos;/g, "'")
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .trim();
  };

  const parseXmlTvTimestamp = (timeStr: string): Date | null => {
    if (!timeStr) return null;
    const m = timeStr.trim().match(/^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})?(?:\s*([+-])(\d{2}):?(\d{2})|Z)?/);
    if (!m) {
      const parsed = new Date(timeStr);
      return isNaN(parsed.getTime()) ? null : parsed;
    }
    const y = parseInt(m[1], 10);
    const mo = parseInt(m[2], 10) - 1;
    const d = parseInt(m[3], 10);
    const h = parseInt(m[4], 10);
    const min = parseInt(m[5], 10);
    const s = m[6] ? parseInt(m[6], 10) : 0;

    if (m[7]) {
      const sign = m[7] === '-' ? -1 : 1;
      const offsetMins = sign * (parseInt(m[8], 10) * 60 + parseInt(m[9], 10));
      const utcMs = Date.UTC(y, mo, d, h, min, s) - offsetMins * 60000;
      return new Date(utcMs);
    }
    if (timeStr.trim().endsWith('Z')) {
      return new Date(Date.UTC(y, mo, d, h, min, s));
    }
    return new Date(y, mo, d, h, min, s);
  };

  const normalizeEpgKey = (val: string): string =>
    String(val || '').replace(/\|AR\||\|EN\||HD|FHD|4K|RAW|SD|HEVC|\+|:-/gi, '').trim().toLowerCase();

  const parseXMLTV = async (xmlText: string, isCancelled?: () => boolean) => {
    try {
      if (!xmlText || typeof xmlText !== 'string') return;
      const lowMem = isTVOrLowEndDevice();
      const nowMs = Date.now();
      const windowStart = nowMs - (lowMem ? 3 : 8) * 3600 * 1000;
      const windowEnd = nowMs + (lowMem ? 12 : 36) * 3600 * 1000;
      const maxPrograms = lowMem ? 8000 : 30000;

      // 1) Index <channel id="..."> <display-name> aliases cleanly without heavy DOMParser allocation
      const channelAliasMap = new Map<string, string[]>();
      const chRegex = /<channel\b[^>]*\bid=["']([^"']+)["'][^>]*>([\s\S]*?)<\/channel>/gi;
      let chMatch: RegExpExecArray | null;
      let iter = 0;
      while ((chMatch = chRegex.exec(xmlText)) !== null) {
        if (++iter % 600 === 0) {
          await new Promise(r => setTimeout(r, 0));
          if (isCancelled?.()) return;
        }
        const cid = chMatch[1].trim();
        const body = chMatch[2];
        const names: string[] = [];
        const dnRegex = /<display-name[^>]*>([\s\S]*?)<\/display-name>/gi;
        let dnMatch: RegExpExecArray | null;
        while ((dnMatch = dnRegex.exec(body)) !== null) {
          const decodedName = decodeEpgText(dnMatch[1].replace(/<[^>]+>/g, ''));
          if (decodedName) names.push(decodedName);
        }
        if (names.length > 0) {
          channelAliasMap.set(cid, names);
        }
      }

      // 2) Chunk-yielded scan of <programme ...> tags keeping only active tight window & capped entries
      const epgMap: Record<string, any[]> = {};
      const progRegex = /<programme\b([^>]*)>([\s\S]*?)<\/programme>/gi;
      let pMatch: RegExpExecArray | null;
      let keptCount = 0;
      iter = 0;
      while ((pMatch = progRegex.exec(xmlText)) !== null) {
        if (++iter % 600 === 0) {
          await new Promise(r => setTimeout(r, 0));
          if (isCancelled?.()) return;
        }
        const attrs = pMatch[1];
        const body = pMatch[2];

        const startAttr = attrs.match(/\bstart=["']([^"']+)["']/i)?.[1];
        const stopAttr = attrs.match(/\bstop=["']([^"']+)["']/i)?.[1];
        const channelId = attrs.match(/\bchannel=["']([^"']+)["']/i)?.[1]?.trim();
        if (!channelId || !startAttr || !stopAttr) continue;

        const startTime = parseXmlTvTimestamp(startAttr);
        const stopTime = parseXmlTvTimestamp(stopAttr);
        if (!startTime || !stopTime) continue;

        if (stopTime.getTime() < windowStart || startTime.getTime() > windowEnd) continue;

        const rawTitle = body.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1] || '';
        const rawDesc = body.match(/<desc\b[^>]*>([\s\S]*?)<\/desc>/i)?.[1] || '';
        const title = decodeEpgText(rawTitle.replace(/<[^>]+>/g, '')) || (isRtl ? 'بدون عنوان' : 'No Title');
        const desc = decodeEpgText(rawDesc.replace(/<[^>]+>/g, ''));

        const entry = {
          title,
          description: desc,
          start: startTime,
          stop: stopTime,
          timeRange: `${String(startTime.getHours()).padStart(2, '0')}:${String(startTime.getMinutes()).padStart(2, '0')} - ${String(stopTime.getHours()).padStart(2, '0')}:${String(stopTime.getMinutes()).padStart(2, '0')}`
        };

        if (!epgMap[channelId]) epgMap[channelId] = [];
        epgMap[channelId].push(entry);

        const lowerId = channelId.toLowerCase();
        if (lowerId !== channelId && !epgMap[lowerId]) {
          epgMap[lowerId] = epgMap[channelId];
        }

        if (++keptCount >= maxPrograms) break;
      }

      if (isCancelled?.()) return;

      // Sort unique buckets and attach normalized display-name pointers (shared array reference = 0 extra memory)
      const sortedArrays = new Set<any[]>();
      Object.keys(epgMap).forEach(cid => {
        const list = epgMap[cid];
        if (!sortedArrays.has(list)) {
          sortedArrays.add(list);
          list.sort((a, b) => a.start.getTime() - b.start.getTime());
        }
        const aliases = channelAliasMap.get(cid);
        if (aliases) {
          for (const alias of aliases) {
            if (!epgMap[alias]) epgMap[alias] = list;
            const normAlias = normalizeEpgKey(alias);
            if (normAlias && !epgMap[normAlias]) epgMap[normAlias] = list;
          }
        }
      });

      setXmltvData(epgMap);
    } catch (err) {
      console.warn('parseXMLTV error:', err);
    }
  };

  const parseXtreamEpgTimestamp = (tsVal: any, dateStrVal: any): Date | null => {
    if (tsVal !== undefined && tsVal !== null && String(tsVal).trim() !== '') {
      const n = Number(tsVal);
      if (!isNaN(n) && n > 0) {
        return new Date(n < 1e12 ? n * 1000 : n);
      }
    }
    if (dateStrVal && typeof dateStrVal === 'string') {
      const cleaned = dateStrVal.trim();
      const isoAttempt = cleaned.includes('T') ? cleaned : cleaned.replace(' ', 'T');
      const d = new Date(isoAttempt);
      if (!isNaN(d.getTime())) return d;
    }
    return null;
  };

  const fetchEPG = async (streamId: string) => {
    if (activePlaylist?.type !== 'xtream') return;
    setEpgLoading(true);
    try {
      const host = (activePlaylist.url || '').trim().replace(/\/+$/, '').replace(/\/(player_api|get|index)\.php.*$/i, '').replace(/\/c\/?$/i, '').replace(/\?.*$/, '');
      const res = await xtreamFetch(host, activePlaylist.username || '', activePlaylist.password || '', 'get_short_epg', { stream_id: streamId, limit: '10' });
      const listings = res.data?.epg_listings || res.data?.listings || (Array.isArray(res.data) ? res.data : []);
      if (res.ok && Array.isArray(listings)) setEpgData(listings);
      else setEpgData([]);
    } catch (e) {
      setEpgData([]);
    } finally {
      setEpgLoading(false);
    }
  };

  useEffect(() => {
    shortEpgFetchedRef.current.clear();
    setShortEpgCache({});

    // Never auto-download multi-MB XMLTV in VOD/Series mode, or on low-RAM Fire TV unless full EPG Grid is explicitly opened
    // (Per-channel get_short_epg handles Live mini & fullscreen infobar guides in <3KB with zero memory spikes)
    if ((mediaType !== 'live' && mediaType !== 'favorites') || (isTVOrLowEndDevice() && !showEpgGrid)) {
      return;
    }

    let cancelled = false;
    let started = false;
    let activeAbort: AbortController | null = null;

    const loadGlobalEPG = async () => {
      if (cancelled || started) return;
      if (ExtractionService.isAnyExtracting()) return;
      started = true;

      let epgUrlToUse = activePlaylist?.epgUrl;
      if (!epgUrlToUse && activePlaylist?.type === 'xtream') {
        const rawHost = activePlaylist.url || activePlaylist.portal || '';
        let cleanHost = rawHost.trim().replace(/\/+$/, '').replace(/\/(player_api|get|index)\.php.*$/i, '').replace(/\/c\/?$/i, '').replace(/\?.*$/, '').replace(/\/+$/, '');
        if (cleanHost && !cleanHost.startsWith('http')) cleanHost = 'http://' + cleanHost;
        if (cleanHost && activePlaylist.username && activePlaylist.password) {
          epgUrlToUse = `${cleanHost}/xmltv.php?username=${encodeURIComponent(activePlaylist.username)}&password=${encodeURIComponent(activePlaylist.password)}`;
        }
      }

      if (!epgUrlToUse) {
        setXmltvData({});
        return;
      }

      const maxBytes = isTVOrLowEndDevice() ? 8 * 1024 * 1024 : 35 * 1024 * 1024;
      activeAbort = new AbortController();
      const timeoutId = setTimeout(() => activeAbort?.abort(), 30000);

      try {
        const fetchUrl = getPlatformUrl('epg', epgUrlToUse);
        const resp = await fetch(fetchUrl, { signal: activeAbort.signal });
        if (!resp.ok || cancelled) return;

        const contentLenHeader = resp.headers.get('content-length');
        const declaredLen = contentLenHeader ? parseInt(contentLenHeader, 10) : 0;
        if (declaredLen > maxBytes) {
          activeAbort.abort();
          return;
        }

        let xmlText = '';
        if (resp.body && typeof resp.body.getReader === 'function') {
          const reader = resp.body.getReader();
          const decoder = new TextDecoder('utf-8', { fatal: false });
          let totalBytes = 0;
          const chunks: string[] = [];
          while (true) {
            const { done, value } = await reader.read();
            if (done || cancelled) break;
            if (value) {
              totalBytes += value.byteLength;
              if (totalBytes > maxBytes) {
                activeAbort.abort();
                return;
              }
              chunks.push(decoder.decode(value, { stream: true }));
            }
          }
          chunks.push(decoder.decode());
          xmlText = chunks.join('');
        } else {
          xmlText = await resp.text();
          if (xmlText.length > maxBytes) return;
        }

        if (!cancelled && xmlText && xmlText.includes('<')) {
          await parseXMLTV(xmlText, () => cancelled);
        }
      } catch (err) {
        if ((err as any)?.name !== 'AbortError') {
          console.warn('Global EPG fetch error:', err);
        }
      } finally {
        clearTimeout(timeoutId);
      }
    };

    const onExtractionProgress = (e: any) => {
      const stage = e?.detail?.stage;
      if (stage === 'completed' || stage === 'paused' || stage === 'error') {
        setTimeout(() => { if (!cancelled) loadGlobalEPG(); }, 600);
      }
    };

    window.addEventListener('achour_extraction_progress', onExtractionProgress);
    const initTimer = setTimeout(loadGlobalEPG, 450);
    return () => {
      cancelled = true;
      clearTimeout(initTimer);
      activeAbort?.abort();
      window.removeEventListener('achour_extraction_progress', onExtractionProgress);
    };
  }, [activePlaylist, mediaType, showEpgGrid]);

  // Fetch per-channel short program guide from Xtream after channel settles so zapping stays fast
  useEffect(() => {
    if ((mediaType !== 'live' && mediaType !== 'favorites') || !selectedChannel || activePlaylist?.type !== 'xtream') return;
    const cid = String(selectedChannel.stream_id || '');
    if (!cid) return;

    const existingPrograms = findProgramsForChannel(selectedChannel);
    if (existingPrograms && existingPrograms.length > 0) return;
    if (shortEpgFetchedRef.current.has(cid)) return;

    let cancelled = false;
    const delayMs = isFullscreen ? 650 : 250;
    const timer = setTimeout(() => {
      if (cancelled) return;
      if (shortEpgFetchedRef.current.size > 200) shortEpgFetchedRef.current.clear();
      shortEpgFetchedRef.current.add(cid);
      const host = (activePlaylist.url || '').trim().replace(/\/+$/, '').replace(/\/(player_api|get|index)\.php.*$/i, '').replace(/\/c\/?$/i, '').replace(/\?.*$/, '');
      xtreamFetch(host, activePlaylist.username || '', activePlaylist.password || '', 'get_short_epg', { stream_id: cid, limit: '10' }, 1)
        .then((res) => {
          if (cancelled) return;
          const listings = res.data?.epg_listings || res.data?.listings || (Array.isArray(res.data) ? res.data : []);
          if (res.ok && Array.isArray(listings) && listings.length > 0) {
            const normalized = listings
              .map((item: any) => {
                const startDate = parseXtreamEpgTimestamp(item.start_timestamp, item.start);
                const stopDate = parseXtreamEpgTimestamp(item.stop_timestamp, item.end || item.stop);
                if (!startDate || !stopDate) return null;
                return {
                  title: decodeEpgText(item.title),
                  description: decodeEpgText(item.description),
                  start: startDate,
                  stop: stopDate
                };
              })
              .filter((p: any) => p && p.title && !isNaN(p.start.getTime()) && !isNaN(p.stop.getTime()))
              .sort((a: any, b: any) => a.start.getTime() - b.start.getTime());

            if (normalized.length > 0) {
              setShortEpgCache(prev => {
                const keys = Object.keys(prev);
                if (keys.length >= 40) {
                  const trimmed: Record<string, any[]> = {};
                  for (let i = keys.length - 30; i < keys.length; i++) {
                    trimmed[keys[i]] = prev[keys[i]];
                  }
                  trimmed[cid] = normalized;
                  return trimmed;
                }
                return { ...prev, [cid]: normalized };
              });
            }
          }
        })
        .catch(() => {});
    }, delayMs);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [selectedChannel?.stream_id, mediaType, activePlaylist, xmltvData, isFullscreen]);

  useEffect(() => {
    if (showEpgTimeline && selectedChannel) {
      const foundInXml = findProgramsForChannel(selectedChannel);
      if (foundInXml && foundInXml.length > 0) {
        setEpgData(foundInXml.map(p => ({
          title: p.title,
          start: p.start.toISOString(),
          end: p.stop.toISOString(),
          description: p.description
        })));
      } else {
        fetchEPG(selectedChannel.stream_id);
      }
    }
  }, [showEpgTimeline, selectedChannel, xmltvData]);

  // Pass ONLY the active channel's matched EPG bucket (avoids cloning 50k XMLTV keys on every zap)
  const mergedEpgForModal = useMemo(() => {
    if (!selectedChannel) return shortEpgCache;
    const programs = findProgramsForChannel(selectedChannel);
    if (!programs || programs.length === 0) return {};
    const cid = String(selectedChannel.stream_id || (selectedChannel as any).id || '');
    return cid ? { [cid]: programs } : {};
  }, [selectedChannel, xmltvData, shortEpgCache]);

  function findProgramsForChannel(channel: ParsedChannel | null) {
    if (!channel) return null;
    const cid = String(channel.stream_id || '');
    const epgId = String((channel as any).epg_channel_id || '');
    const tvgId = String((channel as any).tvg_id || '');
    const chName = String(channel.name || '');
    const cleanName = chName ? chName.replace(/\|AR\||\|EN\||HD|FHD|4K|RAW|SD|HEVC|\+|:-/gi, '').trim() : '';

    const keys = [
      cid,
      epgId,
      epgId.toLowerCase(),
      tvgId,
      tvgId.toLowerCase(),
      chName,
      chName.toLowerCase(),
      cleanName,
      cleanName.toLowerCase()
    ].filter(Boolean);

    for (const k of keys) {
      if (shortEpgCache[k]?.length) return shortEpgCache[k];
      if (xmltvData[k]?.length) return xmltvData[k];
    }
    return null;
  }

  const getCurrentProgram = (channel: ParsedChannel | null) => {
    const programs = findProgramsForChannel(channel);
    if (!programs) return null;
    const now = new Date();
    return programs.find(p => p.start <= now && p.stop >= now) || null;
  };

  const getNextProgram = (channel: ParsedChannel | null) => {
    const programs = findProgramsForChannel(channel);
    if (!programs) return null;
    const now = new Date();
    return programs.find(p => p.start > now) || null;
  };

  // Auto-focus move-up button when Reorder / Context Action modal opens (only when opening a new modal)
  useEffect(() => {
    if (reorderTarget) {
      if (prevReorderTargetIdRef.current !== reorderTarget.id) {
        prevReorderTargetIdRef.current = reorderTarget.id;
        const timer = setTimeout(() => {
          const firstMoveUpBtn = document.querySelector<HTMLElement>('[data-tv-modal="reorder"][data-tv-move-up="true"]') ||
                                 document.querySelector<HTMLElement>('[data-tv-modal="reorder"]');
          if (firstMoveUpBtn) {
            setTVFocus(firstMoveUpBtn, { scroll: false });
          }
        }, 60);
        return () => clearTimeout(timer);
      }
    } else {
      prevReorderTargetIdRef.current = null;
    }
  }, [reorderTarget]);

 

  // TV Remote OK Button Long-Press Detection Refs
  const okPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const okLongPressFiredRef = useRef<boolean>(false);
  const okPressedChannelRef = useRef<ParsedChannel | null>(null);
  const okPressedIndexRef = useRef<number>(0);
  const okCatPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const okCatLongPressFiredRef = useRef<boolean>(false);
  const okPressedCatIndexRef = useRef<number>(0);
  const lastDpadKeyTimeRef = useRef<number>(0);

  // 2-Pane D-Pad TV Remote Control Navigation Listener (Capture-Phase + Unified Single-Focus Engine)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key;
      const code = e.keyCode;

      const isBackKey = key === 'Escape' || key === 'Backspace' || key === 'GoBack' || key === 'Back' ||
                        code === 4 || code === 10009 || code === 461 || code === 27 || code === 8;

      if (document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA')) {
        const isTrueEscape = key === 'Escape' || key === 'GoBack' || code === 10009 || code === 461 || code === 27;
        const isNavKey = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key) || (code >= 19 && code <= 22) || (code >= 37 && code <= 40);

        if (isTrueEscape) {
          (document.activeElement as HTMLElement).blur();
          e.preventDefault();
          e.stopPropagation();
          return;
        }

        if (!isNavKey) {
          return;
        }
      }

      if (isBackKey) {
        return;
      }

      // Remove artificial repeat throttling on VOD grid so held D-pad keys move smoothly without delay
      const now = Date.now();
      const isVodGridView = mediaType === 'movie' || mediaType === 'series';
      if (!isVodGridView && e.repeat && now - lastDpadKeyTimeRef.current < 24) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      lastDpadKeyTimeRef.current = now;

      const isReorderShortcut = key === 'F3' || key === 'Yellow' || code === 114 || code === 405 ||
                                key === 'm' || key === 'M' || key === 'r' || key === 'Menu' || code === 82 ||
                                key === 'ContextMenu' || key === 'Guide' || code === 457;
      if (isReorderShortcut && !reorderTarget && !movieDetailsModal && !isFullscreen && !activeVodPlayer) {
        const activeEl = getCurrentTVFocus();
        if (activeEl) {
          const isCat = activeEl.getAttribute('data-tv-pane') === 'categories';
          const isCh = activeEl.getAttribute('data-tv-pane') === 'channels';
          if (isCat && mediaType === 'live') {
            e.preventDefault();
            e.stopPropagation();
            const curCats = visibleCategoriesRef.current;
            const catItem = curCats[tvFocusedCatIndex.current];
            if (catItem && catItem.category_id !== 'favorites') {
              const realCats = curCats.filter(c => c.category_id !== 'favorites');
              const realIdx = Math.max(0, realCats.findIndex(c => c.category_id === catItem.category_id));
              setReorderTarget({ type: 'category', id: catItem.category_id, index: realIdx, name: catItem.category_name || 'Category' });
              return;
            }
          } else if (isCh && mediaType === 'live') {
            e.preventDefault();
            e.stopPropagation();
            const curList = filteredChannelsRef.current;
            const ch = curList[tvFocusedChannelIndex.current];
            if (ch) {
              setReorderTarget({ type: 'channel', id: ch.stream_id, index: tvFocusedChannelIndex.current, name: ch.name });
              return;
            }
          }
        }
      }

      // If Movie/Series Details Modal is open, keep focus strictly trapped inside and scroll ONLY seasons/episodes
      if (movieDetailsModal) {
        const dialog = document.querySelector<HTMLElement>('[data-tv-details-dialog="true"]');
        const modalFocusables = Array.from(
          (dialog || document).querySelectorAll<HTMLElement>('[data-tv-modal="details"]')
        );
        if (modalFocusables.length > 0) {
          const currentEl = getCurrentTVFocus() || (document.activeElement as HTMLElement);
          const isInsideDialog = !!(currentEl && modalFocusables.includes(currentEl));

          const closeBtn = modalFocusables.find(el => el.getAttribute('data-modal-role') === 'close') || null;
          const seasonTabs = modalFocusables.filter(el => el.hasAttribute('data-season-tab'));
          const activeSeason =
            seasonTabs.find(el => el.getAttribute('data-season-active') === 'true') ||
            seasonTabs[0] ||
            null;
          const episodeItems = modalFocusables.filter(el => el.hasAttribute('data-episode-item'));
          const footerBtns = modalFocusables.filter(el => {
            const role = el.getAttribute('data-modal-role');
            return role === 'play' || role === 'favorite';
          });

          const isCloseBtn = currentEl === closeBtn;
          const isSeasonTab = !!currentEl?.hasAttribute('data-season-tab');
          const isEpisodeItem = !!currentEl?.hasAttribute('data-episode-item');
          const isFooterBtn = !!(currentEl && footerBtns.includes(currentEl));

          if (!isInsideDialog) {
            const fallback = footerBtns[0] || activeSeason || episodeItems[0] || closeBtn || modalFocusables[0];
            if (fallback) setTVFocus(fallback, { scroll: false });
            e.preventDefault();
            e.stopPropagation();
            return;
          }

          if (key === 'ArrowDown' || code === 40 || code === 20) {
            e.preventDefault();
            e.stopPropagation();
            if (isCloseBtn) {
              const target = activeSeason || episodeItems[0] || footerBtns[0];
              if (target) {
                setTVFocus(target, { scroll: false });
                if (target.hasAttribute('data-season-tab')) {
                  scrollModalItemIntoContainer(detailsSeasonsScrollRef.current, target, 'x');
                }
              }
            } else if (isSeasonTab) {
              const target = episodeItems[0] || footerBtns[0];
              if (target) {
                setTVFocus(target, { scroll: false });
                if (target.hasAttribute('data-episode-item')) {
                  if (detailsEpisodesScrollRef.current) detailsEpisodesScrollRef.current.scrollTop = 0;
                  scrollModalItemIntoContainer(detailsEpisodesScrollRef.current, target, 'y');
                }
              }
            } else if (isEpisodeItem) {
              const epIdx = episodeItems.indexOf(currentEl);
              if (epIdx >= 0 && epIdx < episodeItems.length - 1) {
                const nextEp = episodeItems[epIdx + 1];
                setTVFocus(nextEp, { scroll: false });
                scrollModalItemIntoContainer(detailsEpisodesScrollRef.current, nextEp, 'y');
              } else if (footerBtns.length > 0) {
                setTVFocus(footerBtns[0], { scroll: false });
              }
            }
          } else if (key === 'ArrowUp' || code === 38 || code === 19) {
            e.preventDefault();
            e.stopPropagation();
            if (isFooterBtn) {
              if (episodeItems.length > 0) {
                const lastEp = episodeItems[episodeItems.length - 1];
                setTVFocus(lastEp, { scroll: false });
                scrollModalItemIntoContainer(detailsEpisodesScrollRef.current, lastEp, 'y');
              } else if (activeSeason) {
                setTVFocus(activeSeason, { scroll: false });
                scrollModalItemIntoContainer(detailsSeasonsScrollRef.current, activeSeason, 'x');
              } else if (closeBtn) {
                setTVFocus(closeBtn, { scroll: false });
              }
            } else if (isEpisodeItem) {
              const epIdx = episodeItems.indexOf(currentEl);
              if (epIdx > 0) {
                const prevEp = episodeItems[epIdx - 1];
                setTVFocus(prevEp, { scroll: false });
                scrollModalItemIntoContainer(detailsEpisodesScrollRef.current, prevEp, 'y');
              } else if (activeSeason) {
                setTVFocus(activeSeason, { scroll: false });
                scrollModalItemIntoContainer(detailsSeasonsScrollRef.current, activeSeason, 'x');
              } else if (closeBtn) {
                setTVFocus(closeBtn, { scroll: false });
              }
            } else if (isSeasonTab && closeBtn) {
              setTVFocus(closeBtn, { scroll: false });
            }
          } else if (key === 'ArrowRight' || code === 39 || code === 22) {
            e.preventDefault();
            e.stopPropagation();
            if (isSeasonTab && seasonTabs.length > 0) {
              const sIdx = seasonTabs.indexOf(currentEl);
              const nextSIdx = isRtl ? Math.max(0, sIdx - 1) : Math.min(seasonTabs.length - 1, sIdx + 1);
              const nextTab = seasonTabs[nextSIdx];
              if (nextTab) {
                setTVFocus(nextTab, { scroll: false });
                scrollModalItemIntoContainer(detailsSeasonsScrollRef.current, nextTab, 'x');
                nextTab.click();
              }
            } else if (isFooterBtn && footerBtns.length > 1) {
              const fIdx = footerBtns.indexOf(currentEl);
              const nextFIdx = isRtl ? Math.max(0, fIdx - 1) : Math.min(footerBtns.length - 1, fIdx + 1);
              setTVFocus(footerBtns[nextFIdx], { scroll: false });
            }
          } else if (key === 'ArrowLeft' || code === 37 || code === 21) {
            e.preventDefault();
            e.stopPropagation();
            if (isSeasonTab && seasonTabs.length > 0) {
              const sIdx = seasonTabs.indexOf(currentEl);
              const prevSIdx = isRtl ? Math.min(seasonTabs.length - 1, sIdx + 1) : Math.max(0, sIdx - 1);
              const prevTab = seasonTabs[prevSIdx];
              if (prevTab) {
                setTVFocus(prevTab, { scroll: false });
                scrollModalItemIntoContainer(detailsSeasonsScrollRef.current, prevTab, 'x');
                prevTab.click();
              }
            } else if (isFooterBtn && footerBtns.length > 1) {
              const fIdx = footerBtns.indexOf(currentEl);
              const prevFIdx = isRtl ? Math.min(footerBtns.length - 1, fIdx + 1) : Math.max(0, fIdx - 1);
              setTVFocus(footerBtns[prevFIdx], { scroll: false });
            }
          } else if (key === 'Enter' || code === 13 || key === 'Select' || code === 23) {
            e.preventDefault();
            e.stopPropagation();
            currentEl?.click();
          }
        }
        return;
      }

      // If Position Reorder Modal is open, handle D-Pad button traversal only (PositionEditModal owns digits/input/Enter)
      if (reorderTarget) {
        const isInputActive = document.activeElement && document.activeElement.tagName === 'INPUT';
        const modalBtns = Array.from(document.querySelectorAll<HTMLElement>('[data-tv-modal="reorder"]'));
        if (modalBtns.length > 0) {
          const currentEl = getCurrentTVFocus() || (document.activeElement as HTMLElement);
          const activeIdx = modalBtns.indexOf(currentEl);
          const cur = activeIdx >= 0 ? activeIdx : 0;

          if (key === 'ArrowDown' || code === 40 || code === 20) {
            e.preventDefault();
            e.stopPropagation();
            setTVFocus(modalBtns[Math.min(modalBtns.length - 1, cur + 1)], { scroll: true });
          } else if (key === 'ArrowUp' || code === 38 || code === 19) {
            e.preventDefault();
            e.stopPropagation();
            setTVFocus(modalBtns[Math.max(0, cur - 1)], { scroll: true });
          } else if (key === 'ArrowRight' || code === 39 || code === 22) {
            e.preventDefault();
            e.stopPropagation();
            const next = isRtl ? Math.max(0, cur - 1) : Math.min(modalBtns.length - 1, cur + 1);
            setTVFocus(modalBtns[next], { scroll: true });
          } else if (key === 'ArrowLeft' || code === 37 || code === 21) {
            e.preventDefault();
            e.stopPropagation();
            const next = isRtl ? Math.min(modalBtns.length - 1, cur + 1) : Math.max(0, cur - 1);
            setTVFocus(modalBtns[next], { scroll: true });
          } else if (!isInputActive && (key === 'Enter' || code === 13 || key === 'Select' || code === 23)) {
            e.preventDefault();
            e.stopPropagation();
            modalBtns[cur]?.click();
          }
        }
        return;
      }

      if (isFullscreen || activeVodPlayer) {
        return;
      }

      if (tvFocusedPane.current === 'header') {
        const headerTabs = document.querySelectorAll<HTMLElement>('[data-tv-pane="header"]');
        if (headerTabs.length > 0) {
          const currentActive = getCurrentTVFocus() || (document.activeElement as HTMLElement);
          let cur = -1;
          for (let i = 0; i < headerTabs.length; i++) {
            if (headerTabs[i] === currentActive) { cur = i; break; }
          }
          if (cur === -1) cur = 0;

          if (key === 'ArrowDown' || code === 40 || code === 20) {
            e.preventDefault();
            e.stopPropagation();
            const channelsList = filteredChannelsRef.current || [];
            if (channelsList.length > 0) {
              tvFocusedPane.current = 'channels';
              focusChannelAtIdx(0);
            } else {
              tvFocusedPane.current = 'categories';
              focusCategoryAtIdx(0);
            }
          } else if (key === 'ArrowRight' || code === 39 || code === 22) {
            e.preventDefault();
            e.stopPropagation();
            const next = isRtl ? Math.max(0, cur - 1) : Math.min(headerTabs.length - 1, cur + 1);
            setTVFocus(headerTabs[next], { scroll: true });
          } else if (key === 'ArrowLeft' || code === 37 || code === 21) {
            e.preventDefault();
            e.stopPropagation();
            const next = isRtl ? Math.min(headerTabs.length - 1, cur + 1) : Math.max(0, cur - 1);
            setTVFocus(headerTabs[next], { scroll: true });
          } else if (key === 'Enter' || code === 13 || key === 'Select' || code === 23) {
            e.preventDefault();
            e.stopPropagation();
            headerTabs[cur]?.click();
          }
        }
        return;
      }

      if (tvFocusedPane.current === 'multiview') {
        const container = document.querySelector<HTMLElement>('[data-multiview-container="true"]');
        const focusables = container
          ? Array.from(container.querySelectorAll<HTMLElement>('[data-tv-focusable="true"]'))
          : [];
        const currentEl = getCurrentTVFocus() || (document.activeElement as HTMLElement);
        const curRect = currentEl?.getBoundingClientRect();

        const isUp = key === 'ArrowUp' || code === 38 || code === 19;
        const isDown = key === 'ArrowDown' || code === 40 || code === 20;
        const isRight = key === 'ArrowRight' || code === 39 || code === 22;
        const isLeft = key === 'ArrowLeft' || code === 37 || code === 21;

        if (isUp || isDown || isRight || isLeft) {
          e.preventDefault();
          e.stopPropagation();

          let bestEl: HTMLElement | null = null;
          let bestScore = Infinity;

          if (curRect && focusables.length > 0) {
            const cx = curRect.left + curRect.width / 2;
            const cy = curRect.top + curRect.height / 2;

            for (const cand of focusables) {
              if (cand === currentEl) continue;
              const r = cand.getBoundingClientRect();
              if (r.width === 0 || r.height === 0) continue;
              const tx = r.left + r.width / 2;
              const ty = r.top + r.height / 2;
              const dx = tx - cx;
              const dy = ty - cy;

              if (isUp && dy >= -6) continue;
              if (isDown && dy <= 6) continue;
              if (isLeft && dx >= -6) continue;
              if (isRight && dx <= 6) continue;

              // Prefer slot-level navigation slightly less noisy than tiny button overlaps
              const dist = isUp || isDown
                ? Math.abs(dy) + Math.abs(dx) * 1.4
                : Math.abs(dx) + Math.abs(dy) * 1.4;
              if (dist < bestScore) {
                bestScore = dist;
                bestEl = cand;
              }
            }
          }

          if (bestEl) {
            setTVFocus(bestEl, { scroll: false });
          } else if (isUp) {
            tvFocusedPane.current = 'header';
            const headerTabs = document.querySelectorAll<HTMLElement>('[data-tv-pane="header"]');
            if (headerTabs.length > 0) setTVFocus(headerTabs[0], { scroll: true });
          } else if ((isLeft && !isRtl) || (isRight && isRtl)) {
            tvFocusedPane.current = 'channels';
            focusChannelAtIdx(tvFocusedChannelIndex.current >= 0 ? tvFocusedChannelIndex.current : 0);
          }
        } else if (key === 'Enter' || code === 13 || key === 'Select' || code === 23) {
          e.preventDefault();
          e.stopPropagation();
          if (currentEl && container?.contains(currentEl)) {
            currentEl.click();
          }
        }
        return;
      }

      if (tvFocusedPane.current === 'categories') {
        const curCats = visibleCategoriesRef.current;
        if (curCats.length === 0) return;

        let cur = tvFocusedCatIndex.current;
        if (cur < 0 || cur >= curCats.length) cur = 0;

        if (key === 'ArrowDown' || code === 40 || code === 20) {
          e.preventDefault();
          e.stopPropagation();
          const next = mediaType === 'live' && cur === curCats.length - 1 ? 0 : Math.min(curCats.length - 1, cur + 1);
          focusCategoryAtIdx(next);
        } else if (key === 'ArrowUp' || code === 38 || code === 19) {
          e.preventDefault();
          e.stopPropagation();
          if (cur === 0) {
            if (mediaType === 'live') {
              focusCategoryAtIdx(curCats.length - 1);
            } else {
              tvFocusedPane.current = 'header';
              const headerTabs = document.querySelectorAll<HTMLElement>('[data-tv-pane="header"]');
              if (headerTabs.length > 0) setTVFocus(headerTabs[0], { scroll: true });
            }
          } else {
            focusCategoryAtIdx(cur - 1);
          }
        } else if (key === 'Enter' || code === 13 || key === 'Select' || code === 23) {
          e.preventDefault();
          e.stopPropagation();
          if (mediaType === 'live') {
            if (!e.repeat) {
              okCatLongPressFiredRef.current = false;
              okPressedCatIndexRef.current = cur;
              const catItem = curCats[cur];
              if (okCatPressTimerRef.current) clearTimeout(okCatPressTimerRef.current);
              if (
                catItem &&
                catItem.category_id !== 'favorites' &&
                catItem.category_id !== WATCH_HISTORY_CAT_ID &&
                catItem.category_id !== CONTINUE_WATCHING_CAT_ID
              ) {
                okCatPressTimerRef.current = setTimeout(() => {
                  okCatLongPressFiredRef.current = true;
                  const realCats = curCats.filter(
                    c => c.category_id !== 'favorites' && c.category_id !== WATCH_HISTORY_CAT_ID && c.category_id !== CONTINUE_WATCHING_CAT_ID
                  );
                  const realIdx = Math.max(0, realCats.findIndex(c => c.category_id === catItem.category_id));
                  setReorderTarget({
                    type: 'category',
                    id: catItem.category_id,
                    index: realIdx,
                    name: catItem.category_name || 'Category'
                  });
                }, 420);
              }
            }
          } else {
            const catItem = curCats[cur];
            if (catItem) setSelectedCategory(catItem.category_id);
          }
        } else if (((key === 'ArrowRight' || code === 39 || code === 22) && !isRtl) || ((key === 'ArrowLeft' || code === 37 || code === 21) && isRtl)) {
          e.preventDefault();
          e.stopPropagation();
          const channelsList = filteredChannelsRef.current || [];
          if (channelsList.length > 0) {
            tvFocusedPane.current = 'channels';
            const targetIdx = (tvFocusedChannelIndex.current >= 0 && tvFocusedChannelIndex.current < channelsList.length)
              ? tvFocusedChannelIndex.current
              : 0;
            focusChannelAtIdx(targetIdx);
          }
        }
      } else if (tvFocusedPane.current === 'channels') {
        const channelsList = filteredChannelsRef.current;
        if (!channelsList || channelsList.length === 0) {
          tvFocusedPane.current = 'categories';
          return;
        }

        const listContainer = document.querySelector<HTMLElement>('[data-channel-list-container="true"]');
        const domCols = listContainer ? parseInt(listContainer.getAttribute('data-column-count') || '', 10) : NaN;
        const isGrid =
          (mediaType === 'movie' || mediaType === 'series') &&
          (settings.viewMode || 'grid') !== 'list' &&
          (isNaN(domCols) || domCols > 1);
        const cols = isGrid ? (!isNaN(domCols) && domCols > 0 ? domCols : gridColumnCountRef.current || 4) : 1;

        const activeEl = getCurrentTVFocus() || (document.activeElement as HTMLElement);
        let curIdx = tvFocusedChannelIndex.current;

        if (curIdx < 0 || curIdx >= channelsList.length) {
          const parsed = parseInt(activeEl?.getAttribute('data-index') || '', 10);
          curIdx = !isNaN(parsed) && parsed >= 0 && parsed < channelsList.length ? parsed : 0;
        }

        curIdx = Math.max(0, Math.min(channelsList.length - 1, curIdx));

        if (key === 'ArrowDown' || code === 40 || code === 20) {
          e.preventDefault();
          e.stopPropagation();
          if (isGrid) {
            const nextIdx = curIdx + cols;
            if (nextIdx < channelsList.length) {
              focusChannelAtIdx(nextIdx);
            } else {
              const lastIdx = channelsList.length - 1;
              const currentRow = Math.floor(curIdx / cols);
              const lastRow = Math.floor(lastIdx / cols);
              if (currentRow < lastRow) {
                focusChannelAtIdx(lastIdx);
              }
            }
          } else {
            // Live TV (unchanged)
            focusChannelAtIdx(Math.min(channelsList.length - 1, curIdx + 1));
          }
        } else if (key === 'ArrowUp' || code === 38 || code === 19) {
          e.preventDefault();
          e.stopPropagation();
          if (isGrid) {
            if (curIdx < cols) {
              tvFocusedPane.current = 'header';
              const headerTabs = document.querySelectorAll<HTMLElement>('[data-tv-pane="header"]');
              if (headerTabs.length > 0) setTVFocus(headerTabs[0], { scroll: true });
            } else {
              focusChannelAtIdx(curIdx - cols);
            }
          } else {
            // Live TV (unchanged)
            if (curIdx === 0) {
              tvFocusedPane.current = 'header';
              const headerTabs = document.querySelectorAll<HTMLElement>('[data-tv-pane="header"]');
              if (headerTabs.length > 0) setTVFocus(headerTabs[0], { scroll: true });
            } else {
              focusChannelAtIdx(Math.max(0, curIdx - 1));
            }
          }
        } else if (key === 'ArrowRight' || code === 39 || code === 22) {
          e.preventDefault();
          e.stopPropagation();
          if (isGrid) {
            const col = curIdx % cols;
            if (isRtl) {
              // RTL: Moving RIGHT moves towards col 0 (adjacent to Categories sidebar)
              if (col === 0) {
                tvFocusedPane.current = 'categories';
                focusCategoryAtIdx(tvFocusedCatIndex.current);
              } else {
                focusChannelAtIdx(curIdx - 1);
              }
            } else {
              // LTR: Moving RIGHT moves towards rightmost column (does NOT wrap to next row)
              if (col < cols - 1 && curIdx + 1 < channelsList.length) {
                focusChannelAtIdx(curIdx + 1);
              }
            }
          } else {
            // Live TV
            if (isRtl) {
              tvFocusedPane.current = 'categories';
              focusCategoryAtIdx(tvFocusedCatIndex.current);
            } else if (document.querySelector('[data-multiview-container="true"]')) {
              const firstSlot = document.getElementById('multiview-slot-0');
              if (firstSlot) {
                tvFocusedPane.current = 'multiview';
                setTVFocus(firstSlot, { scroll: false });
              }
            }
          }
        } else if (key === 'ArrowLeft' || code === 37 || code === 21) {
          e.preventDefault();
          e.stopPropagation();
          if (isGrid) {
            const col = curIdx % cols;
            if (!isRtl) {
              // LTR: Moving LEFT moves towards col 0 (adjacent to Categories sidebar)
              if (col === 0) {
                tvFocusedPane.current = 'categories';
                focusCategoryAtIdx(tvFocusedCatIndex.current);
              } else {
                focusChannelAtIdx(curIdx - 1);
              }
            } else {
              // RTL: Moving LEFT moves towards leftmost column (does NOT wrap to next row)
              if (col < cols - 1 && curIdx + 1 < channelsList.length) {
                focusChannelAtIdx(curIdx + 1);
              }
            }
          } else {
            // Live TV
            if (!isRtl) {
              tvFocusedPane.current = 'categories';
              focusCategoryAtIdx(tvFocusedCatIndex.current);
            } else if (document.querySelector('[data-multiview-container="true"]')) {
              const firstSlot = document.getElementById('multiview-slot-0');
              if (firstSlot) {
                tvFocusedPane.current = 'multiview';
                setTVFocus(firstSlot, { scroll: false });
              }
            }
          }
        } else if (key === 'Enter' || code === 13 || key === 'Select' || code === 23) {
          e.preventDefault();
          e.stopPropagation();
          if (!e.repeat) {
            okLongPressFiredRef.current = false;
            const targetCh = channelsList[curIdx];
            okPressedChannelRef.current = targetCh || null;
            okPressedIndexRef.current = curIdx;

            if (okPressTimerRef.current) clearTimeout(okPressTimerRef.current);
            if (mediaType === 'live') {
              okPressTimerRef.current = setTimeout(() => {
                okLongPressFiredRef.current = true;
                if (targetCh) {
                  setReorderTarget({
                    type: 'channel',
                    id: targetCh.stream_id,
                    index: curIdx,
                    name: targetCh.name
                  });
                }
              }, 420);
            }
          }
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key;
      const code = e.keyCode;
      const isOkKey = key === 'Enter' || code === 13 || key === 'Select' || code === 23;

      if (isOkKey && tvFocusedPane.current === 'categories' && mediaType === 'live' && !isFullscreen && !activeVodPlayer && !reorderTarget && !movieDetailsModal) {
        e.stopPropagation();
        if (okCatPressTimerRef.current) {
          clearTimeout(okCatPressTimerRef.current);
          okCatPressTimerRef.current = null;
        }
        if (!okCatLongPressFiredRef.current) {
          const catItem = visibleCategoriesRef.current[okPressedCatIndexRef.current];
          if (catItem) {
            setSelectedCategory(catItem.category_id);
          }
        }
        okCatLongPressFiredRef.current = false;
        return;
      }

      if (isOkKey && tvFocusedPane.current === 'channels' && !isFullscreen && !activeVodPlayer && !reorderTarget && !movieDetailsModal) {
        e.stopPropagation();
        if (okPressTimerRef.current) {
          clearTimeout(okPressTimerRef.current);
          okPressTimerRef.current = null;
        }

        if (!okLongPressFiredRef.current) {
          const chToSelect = okPressedChannelRef.current;
          if (chToSelect) {
            handleChannelClickRef.current(chToSelect);
          }
        }

        okLongPressFiredRef.current = false;
        okPressedChannelRef.current = null;
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('keyup', handleKeyUp, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('keyup', handleKeyUp, true);
      if (okPressTimerRef.current) {
        clearTimeout(okPressTimerRef.current);
        okPressTimerRef.current = null;
      }
      if (okCatPressTimerRef.current) {
        clearTimeout(okCatPressTimerRef.current);
        okCatPressTimerRef.current = null;
      }
    };
  }, [isRtl, mediaType, settings.viewMode, onBack, showPinModal, showEpgGrid, showEpgTimeline, showAudioMenu, showSubMenu, showQualityMenu, reorderTarget, activeVodPlayer, movieDetailsModal, isFullscreen, showControls, toggleControlsVisibility]);

  const effectivePlaylistId = activePlaylist?.id || playlistId;

  const triggerAutoPlayFallback = useCallback(() => {
    if (autoPlayFallbackCalledRef.current) return;
    autoPlayFallbackCalledRef.current = true;
    autoPlayAttemptRef.current = null;
    setIsFullscreen(false);
    setSelectedChannel(null);
    setActiveVodPlayer(null);
    onAutoPlayFallback?.();
  }, [onAutoPlayFallback]);

  useEffect(() => {
    if (mediaType !== 'live' || !initialChannelToPlay || loading || autoPlayTriggeredRef.current) return;
    let cancelled = false;
    const effPlId = activePlaylist?.id || settings.activePlaylistId || 'default';

    const verifyAndPlayLastChannel = async () => {
      if (categories.length === 0) {
        autoPlayTriggeredRef.current = true;
        triggerAutoPlayFallback();
        return;
      }
      autoPlayTriggeredRef.current = true;
      try {
        const matches = await getChannelsByIds(effPlId, 'live', [initialChannelToPlay.stream_id]);
        if (cancelled) return;
        const verified = matches && matches.length > 0 ? matches[0] : null;
        if (!verified) {
          triggerAutoPlayFallback();
          return;
        }
        autoPlayAttemptRef.current = verified;
        setSelectedChannel(verified);
        setActivePlayingMovie(verified);
        if (settings.useExternalPlayer) {
          launchExternalPlayer(verified.url, verified, 'live');
          autoPlayAttemptRef.current = null;
        } else {
          setIsFullscreen(true);
          setActiveVodPlayer(verified);
        }
      } catch {
        if (!cancelled) triggerAutoPlayFallback();
      }
    };

    verifyAndPlayLastChannel();
    return () => {
      cancelled = true;
    };
  }, [mediaType, initialChannelToPlay, loading, categories.length, activePlaylist?.id, settings.activePlaylistId, settings.useExternalPlayer, triggerAutoPlayFallback]);

  useEffect(() => {
    if (!autoPlayAttemptRef.current) return;
    const timer = setTimeout(() => {
      if (autoPlayAttemptRef.current) {
        triggerAutoPlayFallback();
      }
    }, 12000);
    return () => clearTimeout(timer);
  }, [initialChannelToPlay?.stream_id, triggerAutoPlayFallback]);

  useEffect(() => {
    const plId = activePlaylist?.id || settings.activePlaylistId || undefined;
    setFavorites(getLocalFavoriteIds(plId));
    if (mediaType === 'movie' || mediaType === 'series') {
      setVodFavorites(getLocalVodFavoriteIds(mediaType, plId));
    }
  }, [activePlaylist?.id, settings.activePlaylistId, mediaType]);

  useEffect(() => {
    const plId = activePlaylist?.id || settings.activePlaylistId || undefined;
    return subscribeFavorites(userId, plId, (next: string[]) => setFavorites(next));
  }, [userId, activePlaylist?.id, settings.activePlaylistId]);

  const toggleFavorite = (streamId: string) => {
    const cleanId = String(streamId || '').trim();
    if (!cleanId) return;
    const plId = activePlaylist?.id || settings.activePlaylistId || undefined;
    if (mediaType === 'movie' || mediaType === 'series') {
      const nextVodFavs = toggleVodFavorite(mediaType, cleanId, plId);
      setVodFavorites(nextVodFavs);
      return;
    }
    const ch = channels.find(c => c.stream_id === cleanId);
    setFavorites(prev => (prev.includes(cleanId) ? prev.filter(id => id !== cleanId) : [...prev, cleanId]));
    toggleFavoriteService(userId, cleanId, plId, ch ? {
      name: ch.name,
      logo: ch.stream_icon,
      url: ch.url,
      category: ch.category_name,
      category_id: ch.category_id,
      type: 'live'
    } : undefined);
  };
  const toggleFavoriteRef = useRef(toggleFavorite);
  toggleFavoriteRef.current = toggleFavorite;

  const moveChannel = (streamId: string, direction: 'up' | 'down', e: React.MouseEvent) => {
    e.stopPropagation();
    const curList = filteredChannelsRef.current && filteredChannelsRef.current.length > 0 ? filteredChannelsRef.current : filteredChannels;
    const filteredIdx = curList.findIndex(c => c.stream_id === streamId);
    if (filteredIdx === -1) return;
    const targetFilteredIdx = direction === 'up' ? filteredIdx - 1 : filteredIdx + 1;
    if (targetFilteredIdx < 0 || targetFilteredIdx >= curList.length) return;

    moveItemToPosition('channel', streamId, targetFilteredIdx + 1, false);
  };

  const moveItemToPosition = (type: 'category' | 'channel', id: string, toPosNum: number, closeModal = true) => {
    if (type === 'category') {
      setCategories(prev => {
        const favEntries = prev.filter(c => c.category_id === 'favorites');
        const realCats = prev.filter(
          c => c.category_id !== 'favorites' && c.category_id !== WATCH_HISTORY_CAT_ID && c.category_id !== CONTINUE_WATCHING_CAT_ID
        );
        const fromIdx = realCats.findIndex(c => c.category_id === id);
        if (fromIdx === -1) return prev;
        const toIdx = Math.max(0, Math.min(realCats.length - 1, toPosNum - 1));
        if (fromIdx === toIdx) return prev;
        const copy = [...realCats];
        const [item] = copy.splice(fromIdx, 1);
        copy.splice(toIdx, 0, item);
        const newOrderIds = copy.map(c => c.category_id);
        onUpdateSettings(st => ({
          ...st,
          categoryOrders: { ...(st.categoryOrders || {}), [mediaType]: newOrderIds }
        }));
        try {
          localStorage.setItem(`achour_category_orders_${mediaType}`, JSON.stringify(newOrderIds));
        } catch (e) {}
        setTimeout(() => {
          const visIdx = visibleCategoriesRef.current.findIndex(c => c.category_id === id);
          if (visIdx !== -1) focusCategoryAtIdx(visIdx);
        }, 40);
        return [...favEntries, ...copy];
      });
    } else {
      const curList = filteredChannelsRef.current && filteredChannelsRef.current.length > 0
        ? filteredChannelsRef.current
        : filteredChannels;
      
      const fromCurIdx = curList.findIndex(c => c.stream_id === id);
      const toCurIdx = Math.max(0, Math.min(curList.length - 1, toPosNum - 1));

      if (fromCurIdx !== -1 && fromCurIdx !== toCurIdx) {
        const reorderedCurList = [...curList];
        const [movedItem] = reorderedCurList.splice(fromCurIdx, 1);
        reorderedCurList.splice(toCurIdx, 0, movedItem);

        setChannels(prevMaster => {
          const curListIds = new Set(curList.map(c => c.stream_id));
          const masterIndices: number[] = [];
          for (let i = 0; i < prevMaster.length; i++) {
            if (curListIds.has(prevMaster[i].stream_id)) {
              masterIndices.push(i);
            }
          }

          const nextMaster = [...prevMaster];
          if (masterIndices.length === reorderedCurList.length) {
            for (let k = 0; k < reorderedCurList.length; k++) {
              nextMaster[masterIndices[k]] = reorderedCurList[k];
            }
          } else {
            const fromMasterIdx = nextMaster.findIndex(c => c.stream_id === id);
            if (fromMasterIdx !== -1) {
              const [item] = nextMaster.splice(fromMasterIdx, 1);
              const targetNeighbor = reorderedCurList[toCurIdx === 0 ? 1 : toCurIdx - 1];
              const targetNeighborIdx = targetNeighbor ? nextMaster.findIndex(c => c.stream_id === targetNeighbor.stream_id) : -1;
              if (targetNeighborIdx !== -1) {
                const insertIdx = toCurIdx === 0 ? targetNeighborIdx : targetNeighborIdx + 1;
                nextMaster.splice(insertIdx, 0, item);
              } else {
                nextMaster.splice(Math.max(0, Math.min(nextMaster.length, toCurIdx)), 0, item);
              }
            }
          }

          const newOrderIds = nextMaster.map(c => c.stream_id);
          onUpdateSettings(st => ({
            ...st,
            channelOrders: { ...(st.channelOrders || {}), [mediaType]: newOrderIds }
          }));
          try {
            localStorage.setItem(`achour_channel_orders_${mediaType}`, JSON.stringify(newOrderIds));
          } catch (e) {}

          return nextMaster;
        });
      }
    }

    if (closeModal) {
      setReorderTarget(null);
    } else {
      setReorderTarget(prev => prev ? { ...prev, index: toPosNum - 1 } : null);
    }
  };

  const fullscreenContainerRef = useRef<HTMLDivElement>(null);
  const playerVideoElements = useRef<(HTMLVideoElement | null)[]>([null, null, null, null]);
  const hlsInstances = useRef<(Hls | null)[]>([null, null, null, null]);



  const sortCategoriesBySavedOrder = useCallback((incomingCats: ParsedCategory[]): ParsedCategory[] => {
    let savedOrder = settings.categoryOrders?.[mediaType];
    if (!savedOrder || !Array.isArray(savedOrder) || savedOrder.length === 0) {
      try {
        const raw = localStorage.getItem(`achour_category_orders_${mediaType}`);
        if (raw) savedOrder = JSON.parse(raw);
      } catch (e) {}
    }
    if (!savedOrder || !Array.isArray(savedOrder) || savedOrder.length === 0) {
      return incomingCats;
    }
    const orderMap = new Map<string, number>();
    savedOrder.forEach((id, idx) => orderMap.set(id, idx));
    return [...incomingCats].sort((a, b) => {
      const idxA = orderMap.has(a.category_id) ? (orderMap.get(a.category_id) as number) : 99999;
      const idxB = orderMap.has(b.category_id) ? (orderMap.get(b.category_id) as number) : 99999;
      return idxA - idxB;
    });
  }, [settings.categoryOrders, mediaType]);
  sortCategoriesBySavedOrderRef.current = sortCategoriesBySavedOrder;

  const sortChannelsBySavedOrder = useCallback((incomingChs: ParsedChannel[]): ParsedChannel[] => {
    let savedOrder = settings.channelOrders?.[mediaType];
    if (!savedOrder || !Array.isArray(savedOrder) || savedOrder.length === 0) {
      try {
        const raw = localStorage.getItem(`achour_channel_orders_${mediaType}`);
        if (raw) savedOrder = JSON.parse(raw);
      } catch (e) {}
    }
    if (!savedOrder || !Array.isArray(savedOrder) || savedOrder.length === 0) {
      return incomingChs;
    }
    const orderMap = new Map<string, number>();
    savedOrder.forEach((id, idx) => orderMap.set(id, idx));
    return incomingChs.slice().sort((a, b) => {
      const idxA = orderMap.has(a.stream_id) ? (orderMap.get(a.stream_id) as number) : 999999;
      const idxB = orderMap.has(b.stream_id) ? (orderMap.get(b.stream_id) as number) : 999999;
      if (idxA === idxB) return 0;
      return idxA - idxB;
    });
  }, [settings.channelOrders, mediaType]);

  const fetchActivePlaylist = async (): Promise<Playlist | null> => {
    try {
      const rawLocal = localStorage.getItem('achour_local_playlists');
      const localList: Playlist[] = rawLocal ? JSON.parse(rawLocal) : [];

      // 1. If explicit active playlist selected in local cache, return instantly
      if (settings.activePlaylistId) {
        const localFound = localList.find(p => p.id === settings.activePlaylistId);
        if (localFound) {
          setActivePlaylist(localFound);
          if (localFound.isProtected && localFound.pin && !isUnlocked) setShowPinModal(true);
          return localFound;
        }
      }

      // 2. Prioritize first available local playlist
      if (localList.length > 0) {
        const first = localList[0];
        setActivePlaylist(first);
        if (settings.activePlaylistId !== first.id) {
          onUpdateSettings(prev => ({ ...prev, activePlaylistId: first.id }));
        }
        if (first.isProtected && first.pin && !isUnlocked) setShowPinModal(true);
        return first;
      }

      // 3. Fallback / background fetch from Firestore if local is empty
      if (settings.activePlaylistId) {
        try {
          const docRef = doc(db, 'playlists', settings.activePlaylistId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = { id: docSnap.id, ...docSnap.data() } as Playlist;
            setActivePlaylist(data);
            if (data.isProtected && data.pin && !isUnlocked) setShowPinModal(true);
            return data;
          }
        } catch (e) {}
      }

      try {
        const q = query(collection(db, 'playlists'), where('userId', '==', userId));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const first = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Playlist;
          setActivePlaylist(first);
          if (settings.activePlaylistId !== first.id) {
            onUpdateSettings(prev => ({ ...prev, activePlaylistId: first.id }));
          }
          if (first.isProtected && first.pin && !isUnlocked) setShowPinModal(true);
          return first;
        }
      } catch (e) {}

      return localList[0] || null;
    } catch (err) {
      console.warn('fetchActivePlaylist error:', err);
      return null;
    }
  };

  const parseM3U = (rawContent: string, baseUrl?: string): ParsedChannel[] => {
    if (!rawContent) return [];
    let content = rawContent.replace(/^\uFEFF/, '').trim();
    if (!content) return [];

    // Reject HTML content (e.g. when fetching a GitHub web page instead of raw M3U)
    if (content.startsWith('<!DOCTYPE') || content.startsWith('<html') || content.startsWith('<div')) {
      console.warn('Received HTML response instead of valid M3U text file');
      return [];
    }

    if (content.startsWith('{') || content.startsWith('[')) {
      try {
        const json = JSON.parse(content);
        let list = Array.isArray(json) ? json : (json.available_channels || json.channels || json.streams || json.live_streams || json.vod_streams || json.series || json.vod_data || json.data || []);
        if ((!Array.isArray(list) || list.length === 0) && typeof json === 'object' && json !== null) {
          const vals = Object.values(json);
          if (vals.length > 0 && typeof vals[0] === 'object' && vals[0] !== null) {
            list = vals;
          }
        }
        if (Array.isArray(list) && list.length > 0) {
          return list.map((ch: any, idx: number) => ({
            stream_id: String(ch.stream_id || ch.id || `${Date.now()}-${idx}`),
            name: String(ch.name || ch.title || `Channel ${idx + 1}`),
            stream_icon: ch.stream_icon || ch.logo || ch.cover || undefined,
            url: ch.url || (ch.stream_id ? `${baseUrl || ''}/live/${ch.stream_id}.ts` : ''),
            category_id: String(ch.category_id || ch.group || 'عام (General)'),
            category_name: String(ch.category_name || ch.group || 'عام (General)'),
          }));
        }
      } catch (e) {}
    }

    const lines = content.split(/\r?\n/);
    const result: ParsedChannel[] = [];
    let curName = '';
    let curLogo = '';
    let curGroup = 'عام (General)';
    let curId = '';

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i].trim();
      if (!line) continue;


      if (line.startsWith('#EXTINF:')) {
        const logoMatch = line.match(/tvg-logo=["']([^"']*)["']/i) || line.match(/tvg-logo=([^\s,]+)/i);
        const groupMatch = line.match(/group-title=["']([^"']*)["']/i) || line.match(/group-title=([^\s,]+)/i);
        const idMatch = line.match(/tvg-id=["']([^"']*)["']/i) || line.match(/tvg-id=([^\s,]+)/i);
        const tvgNameMatch = line.match(/tvg-name=["']([^"']*)["']/i) || line.match(/tvg-name=([^\s,]+)/i);

        let inQuotes = false;
        let quoteChar = '';
        let commaPos = -1;
        for (let cIdx = 0; cIdx < line.length; cIdx++) {
          const char = line[cIdx];
          if (char === '"' || char === "'") {
            if (!inQuotes) { inQuotes = true; quoteChar = char; }
            else if (char === quoteChar) { inQuotes = false; }
          } else if (char === ',' && !inQuotes) {
            commaPos = cIdx;
            break;
          }
        }

        let extractedName = '';
        if (commaPos !== -1) extractedName = line.substring(commaPos + 1).trim();
        else if (tvgNameMatch && tvgNameMatch[1]) extractedName = tvgNameMatch[1].trim();

        curName = extractedName;
        curLogo = logoMatch ? logoMatch[1].trim() : '';
        curGroup = groupMatch ? groupMatch[1].trim() : 'عام (General)';
        curId = idMatch ? idMatch[1].trim() : '';
      } else if (line.startsWith('#EXTGRP:')) {
        curGroup = line.replace('#EXTGRP:', '').trim();
      } else if (!line.startsWith('#')) {
        let streamUrl = line.replace(/&amp;/g, '&');
        // Filter out non-media assets
        if (streamUrl.endsWith('.js') || streamUrl.endsWith('.css') || streamUrl.includes('githubassets.com')) {
          continue;
        }
        if (!streamUrl.startsWith('http://') && !streamUrl.startsWith('https://')) {
          if (baseUrl) {
            try {
              const base = new URL(baseUrl);
              streamUrl = new URL(streamUrl, base.origin).toString();
            } catch (e) {}
          }
        }

        // Generate safe stable ID if missing, avoiding unescape/btoa crashes
        const finalId = curId || ('ch_' + Math.abs((curName + streamUrl).split('').reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0)).toString(36) + '_' + result.length);

        result.push({
          stream_id: finalId,
          name: curName || `Channel ${result.length + 1}`,
          stream_icon: curLogo || undefined,
          url: streamUrl,
          category_id: curGroup || 'عام (General)',
          category_name: curGroup || 'عام (General)'
        });
        curName = '';
        curLogo = '';
        curGroup = 'عام (General)';
        curId = '';
      }
    }
    return result;
  };

  // We use the global cache from iptv.ts now to persist across Live/Movies/Series
  const isFetchingRef = useRef(false);
  const lastFetchKeyRef = useRef<string>('');

  const fetchIPTVData = useCallback(async (forceRefresh = false) => {
    const curPlaylistId = settings.activePlaylistId || 'default';
    const typeToLoad = mediaType === 'favorites' ? 'live' : mediaType;
    const fetchKey = `${userId}_${mediaType}_${curPlaylistId}`;

    if (!forceRefresh && isFetchingRef.current && lastFetchKeyRef.current === fetchKey) {
      return;
    }

    isFetchingRef.current = true;
    lastFetchKeyRef.current = fetchKey;
    setLoading(true);
    setStreamError(null);

    const playlist = await fetchActivePlaylist();
    if (!playlist) {
      setChannels([]);
      setCategories([]);
      setLoading(false);
      isFetchingRef.current = false;
      return;
    }

    try {
      const { categories: fetchedCats, channels: fetchedChannels } = await fetchChannelsForType(playlist, typeToLoad as any, [], forceRefresh);

      if (fetchedCats.length > 0 || fetchedChannels.length > 0) {
        if (fetchedCats.length > 0) {
          await saveCategories(fetchedCats.map((c: any, idx: number) => ({ ...c, orderIndex: idx })), typeToLoad as any, curPlaylistId).catch(() => {});
        }
        if (fetchedChannels.length > 0) {
          await saveChannels(fetchedChannels, typeToLoad as any, curPlaylistId, { batchSize: 300 }).catch(() => {});
        }
        const sortedCats = sortCategoriesBySavedOrder(fetchedCats);
        setCategories(sortedCats);
        const firstCatId = selectedCategory || sortedCats[0]?.category_id || '';
        if (firstCatId) {
          setSelectedCategory(firstCatId);
          const win = await getChannelsByCategoryWindowed(typeToLoad, firstCatId, curPlaylistId, {
            bucketOffset: 0,
            maxItems: isTVOrLowEndDevice() ? 1000 : 4000
          });
          setChannels(win.items || []);
          setCategoryHasMore(win.hasMore);
          setCategoryNextBucketOffset(win.nextBucketOffset);
          setCategoryResolvedId(win.resolvedCategoryId);
        }
      } else {
        setStreamError(isRtl ? 'لم يتم العثور على قنوات أو محتوى في هذا السيرفر.' : 'No channels or content found on this server.');
      }
    } catch (e: any) {
      console.error('Fetch failed', e);
      setStreamError(isRtl ? `فشل الاتصال بالسيرفر: ${e?.message || 'تعذر الاتصال'}` : `Connection failed: ${e?.message || 'Network error'}`);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [userId, mediaType, settings.activePlaylistId, selectedCategory, sortCategoriesBySavedOrder, isRtl]);

  const fetchXtreamStreams = async (catId: string, p: Playlist, actionName?: string, sHost?: string, passedCats?: ParsedCategory[]) => {
    if (catId === 'ALL_CATEGORIES' || !catId || catId === 'FAVORITES_INTERNAL') return;
    if (catId === 'أفلام تجريبية (Test Movies)' || catId === 'مسلسلات تجريبية (Test Series)') return;

    let action = actionName || 'get_live_streams';
    if (!actionName) {
      if (mediaType === 'movie') action = 'get_vod_streams';
      if (mediaType === 'series') action = 'get_series';
    }

    try {
      const host = (p.url || '').trim().replace(/\/+$/, '').replace(/\/(player_api|get|index)\.php.*$/i, '').replace(/\/c\/?$/i, '').replace(/\?.*$/, '');
      const extraParams: any = {};
      if (catId && catId !== 'All' && catId !== 'all' && catId !== 'ALL_CATEGORIES') extraParams.category_id = catId;

      // Never fall back to uncapped full-catalog fetch (200MB+) on the main thread
      const res = await xtreamFetch(host, p.username || '', p.password || '', action, extraParams);

      if (res.ok && res.rawList.length > 0) {
        const baseStreamUrl = sHost || streamingHost || host;
        let rawList = res.rawList;

        if (catId && catId !== 'All' && catId !== 'all' && catId !== 'ALL_CATEGORIES') {
          const cleanTarget = String(catId).trim().toLowerCase();
          const filtered = rawList.filter((ch: any) => {
            const cid = String(ch.category_id || '').trim().toLowerCase();
            const cname = String(ch.category_name || ch.category || '').trim().toLowerCase();
            return cid === cleanTarget || cname === cleanTarget;
          });
          if (filtered.length > 0) rawList = filtered;
        }

        const catsToUse = (passedCats && passedCats.length > 0) ? passedCats : categories;

        const mapped: ParsedChannel[] = rawList.map((ch: any, idx: number) => {
          const rawStreamId = String(ch.stream_id || ch.series_id || ch.id || `${catId}-${idx}`);
          const cleanStreamId = rawStreamId.replace(/\.(m3u8|ts|mp4|mkv|avi|flv)$/i, '');
          const ext = ch.container_extension || (mediaType === 'live' ? 'm3u8' : 'mp4');
          
          let directUrl = ch.stream_url || ch.direct_source || ch.url || '';
          if (!directUrl) {
            if (mediaType === 'live') directUrl = `${baseStreamUrl}/live/${p.username}/${p.password}/${cleanStreamId}.${ext}`;
            else if (mediaType === 'movie') directUrl = `${baseStreamUrl}/movie/${p.username}/${p.password}/${cleanStreamId}.${ext}`;
            else directUrl = `${baseStreamUrl}/series/${p.username}/${p.password}/${cleanStreamId}.${ext}`;
          }

          const rawCatId = String(ch.category_id || catId || 'general');
          const matchedCat = catsToUse.find(c => String(c.category_id) === rawCatId);
          const resolvedCatName = String(ch.category_name || (matchedCat ? matchedCat.category_name : '') || rawCatId || 'عام (General)');

          return {
            stream_id: cleanStreamId,
            name: String(ch.name || ch.title || 'Channel ' + (idx + 1)),
            stream_icon: ch.stream_icon || ch.cover || ch.logo || undefined,
            url: directUrl,
            category_id: rawCatId,
            category_name: resolvedCatName,
            container_extension: ext
          };
        });

        saveChannels(mapped, (mediaType === 'favorites' ? 'live' : mediaType) as 'live' | 'movie' | 'series', settings.activePlaylistId || 'default');

        setChannels(prev => {
          const existingIds = new Set(prev.map(c => c.stream_id));
          const newStreams = mapped.filter(c => !existingIds.has(c.stream_id));
          return sortChannelsBySavedOrder(prev.concat(newStreams));
        });

      }
    } catch (err) {}
  };

  const fetchStalkerStreams = async (catId: string, p: Playlist) => {
    try {
      const fetchUrl = getPlatformUrl('stalker', p.url || p.portal || '', {
        action: 'get_ordered_list',
        type: 'itv',
        category: catId,
        mac: p.macAddress || ''
      });
      const chRes = await axios.get(fetchUrl);
      const rawData = chRes.data?.js?.data || chRes.data?.js || chRes.data?.data;
      if (Array.isArray(rawData)) {
        const cleanHost = (p.url || p.portal || '').replace(/\/+$/, '');
        const mapped: ParsedChannel[] = rawData.map((ch: any, idx: number) => ({
          stream_id: String(ch.id || ch.cmd || idx),
          name: String(ch.name || 'Channel ' + (idx + 1)),
          stream_icon: ch.logo,
          url: ch.cmd || `${cleanHost}/play/${ch.id}`,
          category_id: catId
        }));
        setChannels(prev => {
          const existingIds = new Set(prev.map(c => c.stream_id));
          const newStreams = mapped.filter(c => !existingIds.has(c.stream_id));
          return sortChannelsBySavedOrder(prev.concat(newStreams));
        });

      }
    } catch (err) {}
  };

  // Initial focus setup for categories pane when LivePlayer mounts cleanly (or restore channel focus on fullscreen exit)
  useEffect(() => {
    if (!loading && categories.length > 0 && !isFullscreen && !activeVodPlayer && !movieDetailsModal && !reorderTarget) {
      const timer = setTimeout(() => {
        if (!getCurrentTVFocus()) {
          if (tvFocusedPane.current === 'channels' || tvFocusedPane.current === 'player') {
            tvFocusedPane.current = 'channels';
            focusChannelAtIdx(tvFocusedChannelIndex.current);
          } else {
            tvFocusedPane.current = 'categories';
            focusCategoryAtIdx(tvFocusedCatIndex.current || 0);
          }
        }
      }, 60);
      return () => clearTimeout(timer);
    }
  }, [loading, categories.length, isFullscreen, activeVodPlayer, movieDetailsModal, reorderTarget, focusCategoryAtIdx, focusChannelAtIdx]);

  useEffect(() => {
    const update = async () => {
      if (!selectedCategory || !activePlaylist) return;
      if (
        selectedCategory === 'ALL_CATEGORIES' ||
        selectedCategory === 'All' ||
        selectedCategory === 'all' ||
        selectedCategory === 'FAVORITES_INTERNAL' ||
        selectedCategory === 'favorites' ||
        selectedCategory === 'recent' ||
        selectedCategory === WATCH_HISTORY_CAT_ID ||
        selectedCategory === CONTINUE_WATCHING_CAT_ID
      ) return;
      
      // Skip network fallback whenever IndexedDB already returned items for this category
      if (channels.length > 0) return;

      // Only trigger lightweight per-category Xtream fetch AFTER IndexedDB lookup for this category has settled
      const typeToLoad = mediaType === 'favorites' ? 'live' : mediaType;
      const expectedKey = `${activePlaylist.id}_${typeToLoad}_${selectedCategory}`;
      if (dbLookupSettledKeyRef.current !== expectedKey) return;

      if (activePlaylist.type === 'xtream') {
        await fetchXtreamStreams(selectedCategory, activePlaylist);
      } else if (activePlaylist.type === 'stalker') {
        await fetchStalkerStreams(selectedCategory, activePlaylist);
      }
    };
    update();
  }, [selectedCategory, activePlaylist, channels.length, mediaType]);

  const getTargetVideoElement = (slotIdx: number = 0): HTMLVideoElement | null => {
    return playerVideoElements.current[slotIdx] || null;
  };

  const hiddenList = useMemo(() => {
    if (mediaType === 'movie') return settings.hiddenMovieCategories || settings.hiddenCategories || [];
    if (mediaType === 'series') return settings.hiddenSeriesCategories || settings.hiddenCategories || [];
    return settings.hiddenLiveCategories || settings.hiddenCategories || [];
  }, [mediaType, settings.hiddenLiveCategories, settings.hiddenMovieCategories, settings.hiddenSeriesCategories, settings.hiddenCategories]);

  const hiddenSet = useMemo(() => new Set(hiddenList), [hiddenList]);
  const favSet = useMemo(() => new Set(favorites), [favorites]);

  const watchHistoryCount = useMemo(() => {
    const tType = mediaType === 'favorites' ? 'live' : mediaType;
    return getWatchHistory(tType as 'live' | 'movie' | 'series', effectivePlaylistId).length;
  }, [mediaType, effectivePlaylistId, historyRevision]);

  const continueWatchingCount = useMemo(() => {
    if (mediaType !== 'movie' && mediaType !== 'series') return 0;
    return getContinueWatchingItems(mediaType, effectivePlaylistId, getWatchHistory(mediaType, effectivePlaylistId)).length;
  }, [mediaType, effectivePlaylistId, progressRevision, historyRevision]);

  const visibleCategories = useMemo(() => {
    const seen = new Set<string>();
    const cleanCats = categories.filter(cat => {
      if (!cat || !cat.category_id || !cat.category_name || !cat.category_name.trim()) return false;
      if (hiddenSet.has(cat.category_id) || hiddenSet.has(cat.category_name)) return false;
      if (
        cat.category_name === 'جميع المجموعات' ||
        cat.category_name === 'All Groups' ||
        cat.category_name === 'ALL' ||
        cat.category_name === 'All'
      ) return false;
      if (isFavCategory(cat)) return false;
      if (seen.has(cat.category_id)) return false;
      seen.add(cat.category_id);
      return true;
    });

    if (mediaType === 'favorites') {
      if (favorites.length > 0) {
        return [{
          category_id: 'favorites',
          category_name: `⭐ ${t('favorites')}`,
          count: favorites.length
        }, ...cleanCats];
      }
      return cleanCats;
    }

    const historyCat: ParsedCategory = {
      category_id: WATCH_HISTORY_CAT_ID,
      category_name: t('watch_history'),
      count: watchHistoryCount
    };

    if (mediaType === 'movie' || mediaType === 'series') {
      return watchHistoryCount > 0 ? [historyCat, ...cleanCats] : cleanCats;
    }

    // Live TV Favorites group is strictly shown in Live TV section ONLY
    if (mediaType === 'live' && favorites.length > 0) {
      const favLabel = t('favorites');
      const favCat: ParsedCategory = {
        category_id: 'favorites',
        category_name: `⭐ ${favLabel}`,
        count: favorites.length
      };
      return [historyCat, favCat, ...cleanCats];
    }

    return [historyCat, ...cleanCats];
  }, [categories, hiddenSet, favorites.length, mediaType, settings.language, watchHistoryCount, continueWatchingCount]);

  visibleCategoriesRef.current = visibleCategories;

  const filteredChannels = useMemo(() => {
    if (categorySearchMatches !== null && search.trim()) {
      return categorySearchMatches;
    }

    const query = search.trim().toLowerCase();
    const targetCategory = (selectedCategory && selectedCategory !== 'ALL_CATEGORIES' && selectedCategory !== 'All' && selectedCategory !== 'all') ? String(selectedCategory) : null;

    let result: ParsedChannel[] = [];
    
    if (selectedCategory === WATCH_HISTORY_CAT_ID || selectedCategory === CONTINUE_WATCHING_CAT_ID) {
      result = channels;
    } else if (selectedCategory === 'favorites' || selectedCategory === 'FAVORITES_INTERNAL' || mediaType === 'favorites') {
      if (mediaType === 'movie' || mediaType === 'series') {
        return [];
      }
      const seenFavStreamIds = new Set<string>();
      for (let i = 0; i < channels.length; i++) {
        const ch = channels[i];
        if (ch.type && ch.type !== 'live') continue;
        const sid = String(ch.stream_id || (ch as any).id || '');
        if (!sid || seenFavStreamIds.has(sid)) continue;
        if (favSet.has(sid)) {
          seenFavStreamIds.add(sid);
          result.push(ch);
        }
      }
    } else if (targetCategory) {
      const cleanTarget = targetCategory.trim().toLowerCase();
      const resolvedTarget = categoryResolvedId ? categoryResolvedId.trim().toLowerCase() : cleanTarget;
      // Fast path: if channels was loaded scoped to this category, check once if all belong to it
      let allMatch = channels.length > 0;
      for (let i = 0; i < channels.length; i++) {
        const ch = channels[i];
        const cid = String(ch.category_id || '').trim().toLowerCase();
        if (cid !== cleanTarget && cid !== resolvedTarget) {
          allMatch = false;
          break;
        }
      }
      if (allMatch) {
        result = channels;
      } else {
        result = channels.filter(ch => {
          const cid = String(ch.category_id || '').trim().toLowerCase();
          const cname = String(ch.category_name || ch.category || '').trim().toLowerCase();
          return cid === cleanTarget || cid === resolvedTarget || cname === cleanTarget;
        });
      }
    } else {
      if (hiddenSet.size === 0) {
        result = channels;
      } else {
        for (let i = 0; i < channels.length; i++) {
          const ch = channels[i];
          if (hiddenSet.has(ch.category_id) || hiddenSet.has(ch.category_name || '')) continue;
          result.push(ch);
        }
      }
    }

    if (query) {
      result = result.filter(ch => (ch.name || '').toLowerCase().includes(query));
    }

    if (result.length === 0 && !query && mediaType !== 'favorites' && selectedCategory !== 'FAVORITES_INTERNAL' && !targetCategory && selectedCategory !== WATCH_HISTORY_CAT_ID && selectedCategory !== CONTINUE_WATCHING_CAT_ID) {
      if (channels.length > 0) {
        result = channels;
      }
    }

    if (selectedCategory === WATCH_HISTORY_CAT_ID || selectedCategory === CONTINUE_WATCHING_CAT_ID) {
      return result;
    }

    if (sortOrder === 'az') {
      result = result.slice().sort((a, b) => (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' }));
    } else if (mediaType === 'movie' || mediaType === 'series') {
      const vodSort = settings.vodSortBy || 'newest';
      const getAddedScore = (item: ParsedChannel): number => {
        const rawAdded = Number(item.added);
        if (rawAdded > 0) return rawAdded;
        if (item.releaseDate) {
          const ts = Date.parse(String(item.releaseDate));
          if (!isNaN(ts)) return ts;
          const yr = parseInt(String(item.releaseDate), 10);
          if (!isNaN(yr) && yr > 1900) return yr;
        }
        const sidNum = parseInt(String(item.stream_id || ''), 10);
        return !isNaN(sidNum) && sidNum > 0 ? sidNum : (item.orderIndex || 0);
      };

      if (vodSort === 'alpha') {
        result = result.slice().sort((a, b) => (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' }));
      } else if (vodSort === 'rating') {
        result = result.slice().sort((a, b) => {
          const ra = parseFloat(String(a.rating || '0')) || 0;
          const rb = parseFloat(String(b.rating || '0')) || 0;
          return rb - ra;
        });
      } else if (vodSort === 'oldest') {
        result = result.slice().sort((a, b) => getAddedScore(a) - getAddedScore(b));
      } else {
        result = result.slice().sort((a, b) => getAddedScore(b) - getAddedScore(a));
      }
    } else {
      result = sortChannelsBySavedOrder(result);
    }

    return result;
  }, [channels, categorySearchMatches, search, sortOrder, selectedCategory, categoryResolvedId, hiddenSet, favSet, mediaType, settings.vodSortBy, sortChannelsBySavedOrder]);

  useEffect(() => {
    filteredChannelsRef.current = selectedCategory === 'recent'
      ? getRecents().map((r: any) => ({ ...r, stream_id: r.id }))
      : filteredChannels;
  }, [filteredChannels, selectedCategory]);

  const scheduleVodDetailsPrefetch = useCallback((ch?: ParsedChannel | null) => {
    if (!ch || (mediaType !== 'movie' && mediaType !== 'series')) return;
    const effPlId = activePlaylist?.id || settings.activePlaylistId || 'default';
    const resolvedId = cleanVodEntityId((ch as any).series_id || ch.stream_id || (ch as any).id || '', effPlId)
      || String((ch as any).series_id || ch.stream_id || (ch as any).id || '').trim();
    if (!resolvedId) return;
    const memKey = `${effPlId}_${resolvedId}`;
    const alreadyMem = mediaType === 'series'
      ? sessionSeriesDetailsCache.has(memKey)
      : sessionVodDetailsCache.has(memKey);
    if (alreadyMem) return;

    if (detailsPrefetchTimerRef.current) {
      clearTimeout(detailsPrefetchTimerRef.current);
    }
    detailsPrefetchTimerRef.current = setTimeout(() => {
      fetchMediaDetails(resolvedId, mediaType, activePlaylist).catch(() => {});
    }, 100);
  }, [mediaType, activePlaylist, settings.activePlaylistId]);

  const handleHighlightChannel = useCallback((ch: ParsedChannel) => {
    if (!ch || !ch.stream_id) return;
    currentHighlightedChannelRef.current = ch.stream_id;
    scheduleVodDetailsPrefetch(ch);
  }, [scheduleVodDetailsPrefetch]);

  const handleOpenFullscreen = useCallback((ch: ParsedChannel) => {
    if (!ch) return;
    if (previewDebounceRef.current) {
      clearTimeout(previewDebounceRef.current);
      previewDebounceRef.current = null;
    }
    if (detailsPrefetchTimerRef.current) {
      clearTimeout(detailsPrefetchTimerRef.current);
      detailsPrefetchTimerRef.current = null;
    }
    currentHighlightedChannelRef.current = ch.stream_id;
    addToRecents(ch);
    setSelectedChannel(ch);
    setActivePlayingMovie(ch);

    if (mediaType === 'movie' || mediaType === 'series') {
      const effPlId = activePlaylist?.id || settings.activePlaylistId || 'default';
      const resolvedId = cleanVodEntityId((ch as any).series_id || ch.stream_id || (ch as any).id || '', effPlId)
        || String((ch as any).series_id || ch.stream_id || (ch as any).id || '').trim();
      if (mediaType === 'series') {
        activeSeriesParentRef.current = { ...ch, stream_id: resolvedId, series_id: resolvedId } as any;
        autoSeasonSelectedRef.current = null;
      }
      returningEpisodeIdRef.current = null;
      setMovieDetailsModal(ch);

      const memHit = mediaType === 'series'
        ? sessionSeriesDetailsCache.get(`${effPlId}_${resolvedId}`)
        : sessionVodDetailsCache.get(`${effPlId}_${resolvedId}`);
      if (memHit) {
        setMediaDetailInfo(memHit);
        setDetailLoading(false);
        return;
      }

      const initialPlot = String((ch as any).plot || (ch as any).description || '');
      const seededInfo = initialPlot || (ch as any).cast || (ch as any).director || (ch as any).genre || (ch as any).rating || (ch as any).releaseDate || (ch as any).duration
        ? {
            info: {
              plot: initialPlot,
              cast: (ch as any).cast || '',
              director: (ch as any).director || '',
              genre: (ch as any).genre || '',
              rating: (ch as any).rating || '',
              releaseDate: (ch as any).releaseDate || '',
              duration: (ch as any).duration || '',
              cover_big: ch.cover || ch.stream_icon || ch.logo
            }
          }
        : null;

      setMediaDetailInfo(seededInfo);
      setDetailLoading(true);
      fetchMediaDetails(resolvedId, mediaType, activePlaylist).then(info => {
        if (info) {
          setMediaDetailInfo(info);
        }
        setDetailLoading(false);
      }).catch(() => {
        setDetailLoading(false);
      });
      return;
    }

    if (settings.useExternalPlayer) {
      launchExternalPlayer(ch.url, ch, 'live');
    } else {
      setIsFullscreen(true);
      setActiveVodPlayer(ch);
    }
  }, [mediaType, settings.useExternalPlayer, settings.activePlaylistId, activePlaylist]);


  const handleChannelClick = useCallback((ch: ParsedChannel) => {
    if (!ch) return;

    if (multiViewActive && multiViewPickingSlot !== null && (mediaType === 'live' || mediaType === 'favorites')) {
      const targetSlot = multiViewPickingSlot;
      setMultiViewSlots(prev => {
        const next = [...prev];
        next[targetSlot] = ch;
        return next;
      });
      setSelectedSlotIndex(targetSlot);
      setMultiViewPickingSlot(null);
      addToRecents(ch);
      tvFocusedPane.current = 'multiview';
      setTimeout(() => { const el = document.getElementById(`multiview-slot-${targetSlot}`); if (el) setTVFocus(el); }, 50);
      return;
    }

    if (mediaType === 'movie' || mediaType === 'series') {
      handleOpenFullscreen(ch);
      return;
    }

    // For Live channels:
    // First click: plays in small preview screen
    // Second click on the same selected channel: opens in FULLSCREEN!
    if (selectedChannel?.stream_id === ch.stream_id && !activeVodPlayer) {
      handleOpenFullscreen(ch);
    } else {
      setSelectedChannel(ch);
      setActivePlayingMovie(ch);
      addToRecents(ch);
    }
  }, [mediaType, selectedChannel?.stream_id, activeVodPlayer, handleOpenFullscreen, multiViewActive, multiViewPickingSlot]);

  useEffect(() => {
    handleHighlightChannelRef.current = handleHighlightChannel;
  }, [handleHighlightChannel]);

  useEffect(() => {
    handleOpenFullscreenRef.current = handleOpenFullscreen;
  }, [handleOpenFullscreen]);

  useEffect(() => {
    handleChannelClickRef.current = handleChannelClick;
  }, [handleChannelClick]);

  const switchChannelByOffset = useCallback((offset: number) => {
    if (filteredChannels.length === 0) return;
    const currentCh = selectedChannel;
    const currentIndex = currentCh ? filteredChannels.findIndex(c => c.stream_id === currentCh.stream_id) : 0;
    const safeCurrentIndex = currentIndex >= 0 ? currentIndex : 0;
    const nextIndex = (safeCurrentIndex + offset + filteredChannels.length) % filteredChannels.length;
    const nextCh = filteredChannels[nextIndex];
    if (!nextCh) return;

    setSelectedChannel(nextCh);
    setActivePlayingMovie(nextCh);
    addToRecents(nextCh);
  }, [filteredChannels, selectedChannel]);

  const touchStartY = useRef<number | null>(null);
  const touchStartX = useRef<number | null>(null);
  const touchStartTime = useRef<number>(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    // Gestures disabled per user request
    triggerControlsVisibility();
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    // Gestures disabled per user request
    touchStartY.current = null;
    touchStartX.current = null;
  };

  const handleSelectAudioTrack = (trackId: number, trackName: string) => {
    setSelectedAudioTrack(trackName);
    const hls = hlsInstances.current[0];
    if (hls && hls.audioTracks && hls.audioTracks.length > 0) hls.audioTrack = trackId;
    setShowAudioMenu(false);
    triggerControlsVisibility();
  };

  const handleSelectSubtitleTrack = (trackId: number, trackName: string) => {
    setSelectedSubtitleTrack(trackName);
    const hls = hlsInstances.current[0];
    if (hls) hls.subtitleTrack = trackId;
    setSubtitleActive(trackId >= 0);
    setShowSubMenu(false);
    triggerControlsVisibility();
  };

  const handleSelectQuality = (levelId: number, qualityLabel: string) => {
    setSelectedQuality(qualityLabel);
    const hls = hlsInstances.current[0];
    if (hls) hls.currentLevel = levelId;
    setShowQualityMenu(false);
    triggerControlsVisibility();
  };

  const toggleFullscreen = useCallback(() => {
    const container = fullscreenContainerRef.current;
    const currentIsFs = isFullscreen;
    
    setShowControls(true);
    setIsFullscreen(!currentIsFs);

    // Force aspect ratio to 'fill' or '16:9' when going fullscreen if it was 'fit'
    if (!currentIsFs && aspectRatio === 'fit') {
      setAspectRatio('16:9');
    }

    if (currentIsFs) {
      setTimeout(() => {
        tvFocusedPane.current = 'channels';
        focusChannelAtIdx(tvFocusedChannelIndex.current);
      }, 40);
    }

    if (container) {
      const requestFs = container.requestFullscreen || (container as any).webkitRequestFullscreen || (container as any).mozRequestFullScreen || (container as any).msRequestFullscreen;
      const isFs = !!(document.fullscreenElement || (document as any).webkitFullscreenElement || (document as any).mozFullScreenElement || (document as any).msFullscreenElement);
      
      if (!isFs) {
        if (requestFs) {
          requestFs.call(container).catch(() => {
            // Native fallback for mobile webviews
            const vid = getTargetVideoElement(0);
            if (vid) {
              const vidRequestFs = vid.requestFullscreen || (vid as any).webkitRequestFullscreen;
              if (vidRequestFs) vidRequestFs.call(vid).catch(() => {});
            }
          });
        }
      } else {
        const exitFs = document.exitFullscreen || (document as any).webkitExitFullscreen || (document as any).mozCancelFullScreen || (document as any).msExitFullscreen;
        if (exitFs) {
          exitFs.call(document).catch(() => {});
        }
      }
    }
  }, [isFullscreen, aspectRatio]);

  useEffect(() => {
    toggleFullscreenRef.current = toggleFullscreen;
  }, [toggleFullscreen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;
      if (isFullscreen) return;
      const key = e.key.toLowerCase();

      if (key === 'r' || e.code === 'F1') {
        e.preventDefault();
        fetchIPTVData(true);
      } else if (key === 'g' || e.code === 'F2') {
        e.preventDefault();
        setShowRemoteHelp(prev => !prev);
      } else if (key === 'y' || e.code === 'F3') {
        e.preventDefault();
        const searchInput = document.getElementById('channel-search-input');
        if (searchInput) setTVFocus(searchInput, { scroll: false });
      } else if (key === 'b' || e.code === 'F4') {
        e.preventDefault();
        if (selectedChannel) toggleFavorite(selectedChannel.stream_id);
      } else if (key === 'f') {
        e.preventDefault();
        toggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedChannel, isFullscreen, toggleFullscreen]);

  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(!!(document.fullscreenElement || (document as any).webkitFullscreenElement));
    };
    document.addEventListener('fullscreenchange', onFsChange);
    document.addEventListener('webkitfullscreenchange', onFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', onFsChange);
      document.removeEventListener('webkitfullscreenchange', onFsChange);
    };
  }, []);

  const resolveLocalPlaylistSync = (): Playlist | null => {
    if (activePlaylist) return activePlaylist;
    try {
      const rawLocal = localStorage.getItem('achour_local_playlists');
      if (!rawLocal) return null;
      const list: Playlist[] = JSON.parse(rawLocal);
      if (settings.activePlaylistId) {
        const hit = list.find(item => item.id === settings.activePlaylistId);
        if (hit) return hit;
      }
      return list[0] || null;
    } catch {
      return null;
    }
  };

  const fetchMediaDetails = async (rawId: string, type: 'movie' | 'series', p?: Playlist | null) => {
    const syncPl = p || resolveLocalPlaylistSync();
    const resolvedPlaylist = syncPl || await fetchActivePlaylist();
    if (!rawId || !resolvedPlaylist) return null;
    const playlistId = resolvedPlaylist.id;
    const id = cleanVodEntityId(rawId, playlistId) || String(rawId).trim();
    const memKey = `${playlistId}_${id}`;
    const cacheMap = type === 'series' ? sessionSeriesDetailsCache : sessionVodDetailsCache;

    const memHit = cacheMap.get(memKey);
    if (memHit) return memHit;

    const inflightKey = `${playlistId}_${type}_${id}`;
    const existingFlight = inFlightDetailsCache.get(inflightKey);
    if (existingFlight) return existingFlight;

    const loaderPromise = (async () => {
      try {
        let cachedEps: any[] = [];
        let cachedDetails: any = null;

        if (type === 'series') {
          cachedDetails = await getSeriesDetails(playlistId, id);
          if (cachedDetails) {
            const epVal = cachedDetails.episodes;
            const hasEpisodes = Array.isArray(epVal)
              ? epVal.length > 0
              : Boolean(epVal && typeof epVal === 'object' && Object.keys(epVal).length > 0);
            if (hasEpisodes) {
              const result = {
                info: cachedDetails.info || {},
                seasons: cachedDetails.seasons || [],
                episodes: cachedDetails.episodes
              };
              setBoundedDetailCache(sessionSeriesDetailsCache, memKey, result, 30);
              return result;
            }
          }
        } else {
          cachedDetails = await getVodDetails(playlistId, id);
          if (cachedDetails?.info && (cachedDetails.info.plot || cachedDetails.info.cast || cachedDetails.info.genre || Object.keys(cachedDetails.info).length > 0)) {
            setBoundedDetailCache(sessionVodDetailsCache, memKey, cachedDetails, 40);
            return cachedDetails;
          }
        }

        const action = type === 'movie' ? 'get_vod_info' : 'get_series_info';
        const rawHost = resolvedPlaylist?.url || streamingHost || '';
        const host = rawHost.trim().replace(/\/+$/, '').replace(/\/(player_api|get|index)\.php.*$/i, '').replace(/\/c\/?$/i, '').replace(/\?.*$/, '');

        let data: any = null;
        if (host && resolvedPlaylist?.username && resolvedPlaylist?.password) {
          const xtRes = await xtreamFetch(host, resolvedPlaylist.username, resolvedPlaylist.password, action, {
            [type === 'movie' ? 'vod_id' : 'series_id']: id
          }, 1);
          if (xtRes.ok && xtRes.data) {
            data = xtRes.data;
          }
        }

        if (data && typeof data === 'object') {
          if (type === 'series') {
            let epList: any[] = [];
            if (data.episodes) {
              if (Array.isArray(data.episodes)) {
                epList = data.episodes;
              } else if (typeof data.episodes === 'object') {
                Object.entries(data.episodes).forEach(([sKey, arr]) => {
                  const sNumMatch = String(sKey).match(/\d+/);
                  const sNum = sNumMatch ? parseInt(sNumMatch[0], 10) : 1;
                  if (Array.isArray(arr)) {
                    arr.forEach((ep: any) => epList.push({ ...ep, season: ep.season ?? ep.season_num ?? sNum }));
                  }
                });
              }
            }
            if (epList.length > 0) {
              saveEpisodes(playlistId, id, epList).catch(() => {});
            }
            saveSeriesDetails(playlistId, id, {
              info: data.info || {},
              seasons: data.seasons || [],
              episodes: data.episodes || epList
            }).catch(() => {});
            setBoundedDetailCache(sessionSeriesDetailsCache, memKey, data, 30);
            return data;
          }

          const normalizedVod = {
            info: { ...(data.movie_data || {}), ...(data.info || {}) },
            movie_data: data.movie_data || {}
          };
          saveVodDetails(playlistId, id, normalizedVod).catch(() => {});
          setBoundedDetailCache(sessionVodDetailsCache, memKey, normalizedVod, 40);
          return normalizedVod;
        }

        if (type === 'series' && cachedEps.length > 0) {
          const fallback = { info: cachedDetails?.info || {}, seasons: cachedDetails?.seasons || [], episodes: cachedEps };
          setBoundedDetailCache(sessionSeriesDetailsCache, memKey, fallback, 30);
          return fallback;
        }
        return cachedDetails || null;
      } catch {
        return null;
      } finally {
        inFlightDetailsCache.delete(inflightKey);
      }
    })();

    inFlightDetailsCache.set(inflightKey, loaderPromise);
    return loaderPromise;
  };


  const isViewingFullscreen = (isFullscreen && (mediaType === 'live' || mediaType === 'favorites')) || Boolean(activeVodPlayer && (mediaType === 'movie' || mediaType === 'series'));

  // Release heavy IndexedDB transient read caches without wiping active category channels (keeps Back <50ms)
  useEffect(() => {
    if (isViewingFullscreen) {
      trimDbMemoryCaches();
    }
  }, [isViewingFullscreen]);

  const handleColumnCountChange = useCallback((cols: number) => {
    gridColumnCountRef.current = cols;
  }, []);

  const handleFocusChannel = useCallback((idx: number) => {
    tvFocusedChannelIndex.current = idx;
    tvFocusedPane.current = 'channels';
    const focusedItem = filteredChannelsRef.current?.[idx];
    if (focusedItem) {
      scheduleVodDetailsPrefetch(focusedItem);
    }
  }, [scheduleVodDetailsPrefetch]);

  const handleReorderChannel = useCallback((item: any) => {
    setReorderTarget({
      type: 'channel',
      id: item.stream_id,
      index: item.realIdx,
      name: item.name
    });
  }, []);

  const recentChannelItems = useMemo(() => {
    if (selectedCategory !== 'recent') return null;
    return getRecents().map((r: any) => ({ ...r, stream_id: r.id }));
  }, [selectedCategory]);

  const isLiveMode = mediaType === 'live' || mediaType === 'favorites';
  const isVodGridMode = mediaType === 'movie' || mediaType === 'series';

  const realLiveCats = useMemo(
    () => visibleCategories.filter(c => c.category_id !== 'favorites' && c.category_id !== WATCH_HISTORY_CAT_ID && c.category_id !== CONTINUE_WATCHING_CAT_ID),
    [visibleCategories]
  );

  const handleFocusCatIdx = useCallback((idx: number) => {
    tvFocusedPane.current = 'categories';
    tvFocusedCatIndex.current = idx;
  }, []);

  const handleReorderCategory = useCallback((item: any) => {
    const targetId = item.id || item.category_id;
    if (targetId === WATCH_HISTORY_CAT_ID || targetId === CONTINUE_WATCHING_CAT_ID || targetId === 'favorites') return;
    const realIdx = Math.max(0, realLiveCats.findIndex(c => c.category_id === targetId));
    const targetName = item.name || item.category_name || 'Category';
    setReorderTarget({
      type: 'category',
      id: targetId,
      index: realIdx,
      name: targetName
    });
  }, [realLiveCats]);

  const handleLiveModalClose = useCallback(() => {
    autoPlayAttemptRef.current = null;
    if (isFullscreen) {
      setIsFullscreen(false);
      setActiveVodPlayer(null);
      setTimeout(() => {
        tvFocusedPane.current = 'channels';
        focusChannelAtIdx(tvFocusedChannelIndex.current);
      }, 40);
    } else {
      setSelectedChannel(null);
      setActiveVodPlayer(null);
    }
  }, [isFullscreen, focusChannelAtIdx]);

  const handleLiveSelectMedia = useCallback((next: any) => {
    setSelectedChannel(next);
    setActivePlayingMovie(next);
  }, []);

  const handleModalToggleFavorite = useCallback((item: any) => {
    const sid = item?.stream_id || item?.id;
    if (sid) toggleFavoriteRef.current(sid);
  }, []);

  const handleVodModalClose = useCallback(() => {
    const playedEpId = activeVodPlayer
      ? cleanVodEntityId(
          (activeVodPlayer as any).xtream_id || activeVodPlayer.stream_id || (activeVodPlayer as any).id,
          effectivePlaylistId,
          activeSeriesParentRef.current?.stream_id
        )
      : null;
    const currentSeries = activeSeriesParentRef.current || activeVodPlayer;
    setActiveVodPlayer(null);
    if (currentSeries && mediaType === 'series') {
      returningEpisodeIdRef.current = playedEpId || null;
      setMovieDetailsModal(currentSeries);
      return;
    }
    setTimeout(() => {
      tvFocusedPane.current = 'channels';
      focusChannelAtIdx(tvFocusedChannelIndex.current);
    }, 35);
  }, [activeVodPlayer, mediaType, effectivePlaylistId, focusChannelAtIdx]);

  const handleVodSelectMedia = useCallback((next: any) => {
    setActiveVodPlayer(next);
    setSelectedChannel(next);
    setActivePlayingMovie(next);
  }, []);

  const handleLivePlaybackStarted = useCallback((playedMedia: any) => {
    autoPlayAttemptRef.current = null;
    const target = playedMedia || selectedChannel;
    if (!target || !target.stream_id) return;
    addToWatchHistory('live', target, effectivePlaylistId);
    saveLastWatchedChannel(target, effectivePlaylistId);
  }, [selectedChannel, effectivePlaylistId]);

  const handleLivePlaybackFailed = useCallback((_failedMedia: any) => {
    if (autoPlayAttemptRef.current) {
      triggerAutoPlayFallback();
    }
  }, [triggerAutoPlayFallback]);

  const handleVodPlaybackStarted = useCallback((playedMedia: any) => {
    if (mediaType === 'series') {
      const seriesTarget = activeSeriesParentRef.current || playedMedia || activeVodPlayer;
      if (seriesTarget?.stream_id) {
        addToWatchHistory('series', seriesTarget, effectivePlaylistId);
      }
    } else {
      const movieTarget = playedMedia || activeVodPlayer;
      if (movieTarget?.stream_id) {
        addToWatchHistory('movie', movieTarget, effectivePlaylistId);
      }
    }
  }, [mediaType, activeVodPlayer, effectivePlaylistId]);

  const pageScale = (mediaType === 'live' || mediaType === 'favorites' ? (settings.livePageScale ?? 100) : (settings.vodPageScale ?? 100)) / 100;

  return (
    <div 
      className={`flex flex-col h-full bg-transparent text-white overflow-hidden select-none ${isRtl ? 'font-cairo' : ''}`}
      dir={isRtl ? 'rtl' : 'ltr'}
      style={
        pageScale !== 1
          ? ({ zoom: pageScale, width: `${100 / pageScale}%`, height: `${100 / pageScale}%` } as React.CSSProperties)
          : undefined
      }
    >
      {/* Requirement 2: Top Header - Search Field | Application Logo | Clock (kept hidden in fullscreen for <50ms exit) */}
      <header className={`${isViewingFullscreen ? 'hidden' : 'flex'} relative z-30 h-16 items-center justify-between px-6 bg-transparent shrink-0`}>
        <div className="grid grid-cols-3 items-center w-full gap-4">
          {/* Left Column: App name only (logo is splash-screen-only) */}
          <div dir="ltr" className="flex items-center justify-start min-w-0">
            <h1 className="text-sm sm:text-base font-black text-gold tracking-tighter uppercase italic leading-none drop-shadow-md whitespace-nowrap">ACHOUR PLAYER</h1>
          </div>

          {/* Center Column: Multi View 1 2 4 */}
          <div className="flex items-center justify-center min-w-0 gap-3">
            {(mediaType === 'live' || mediaType === 'favorites') && (
              <div className="flex items-center gap-3 text-xs sm:text-sm font-bold text-zinc-200">
                <span className="select-none text-zinc-300 font-bold">Multi View</span>
                <div className="flex items-center gap-2">
                  {([1, 2, 4] as const).map((modeNum, idx) => (
                    <button
                      key={modeNum}
                      data-tv-focusable="true"
                      data-tv-pane="header"
                      data-header-index={idx}
                      tabIndex={0}
                      onClick={() => {
                        if (multiViewActive && multiViewMode === modeNum) {
                          setMultiViewActive(false);
                          setMultiViewSlots([null, null, null, null]);
                          setMultiViewPickingSlot(null);
                          setMultiViewFullscreenSlot(null);
                          if (preMultiViewChannelRef.current) {
                            setSelectedChannel(preMultiViewChannelRef.current);
                            setActivePlayingMovie(preMultiViewChannelRef.current);
                          }
                          tvFocusedPane.current = 'channels';
                          setTimeout(() => focusChannelAtIdx(tvFocusedChannelIndex.current >= 0 ? tvFocusedChannelIndex.current : 0), 40);
                          return;
                        }
                        preMultiViewChannelRef.current = selectedChannel;
                        setSelectedChannel(null); setActivePlayingMovie(null);
                        setMultiViewSlots([null, null, null, null]); setMultiViewMode(modeNum);
                        setSelectedSlotIndex(0); setAudioSlotIndex(0); setMultiViewPickingSlot(null);
                        setMultiViewFullscreenSlot(null); setMultiViewActive(true);
                        tvFocusedPane.current = 'multiview';
                        setTimeout(() => {
                          const el = document.getElementById('multiview-slot-0');
                          if (el) setTVFocus(el, { scroll: false });
                        }, 50);
                      }}
                      className={`px-2.5 py-1 rounded-md bg-transparent flex items-center justify-center font-mono font-black text-sm sm:text-base transition-colors cursor-pointer outline-none ${
                        multiViewActive && multiViewMode === modeNum
                          ? 'text-gold'
                          : 'text-white/80 hover:text-gold'
                      }`}
                    >
                      {modeNum}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Clock & Date */}
          <div className="flex items-center justify-end gap-4 min-w-0">
            <LiveHeaderClock language={settings.language} timeFormat={settings.timeFormat} />
          </div>
        </div>
      </header>
      {/* Main Content Area (kept mounted & CSS-hidden during fullscreen so Back to Details/Grid is instant) */}
      <div className={`${isViewingFullscreen ? 'hidden' : 'flex'} flex-1 min-h-0 overflow-hidden relative z-10`}>
        
        {/* Column 1: Virtualized Categories Sidebar */}
        <aside className="w-44 sm:w-56 md:w-64 lg:w-72 bg-transparent flex flex-col h-full min-h-0 shrink-0 overflow-hidden pb-0">
          <div className="px-3 py-2 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2 text-gold text-xs sm:text-sm font-black uppercase">
              {mediaType === 'movie' ? <Film size={16} /> : mediaType === 'series' ? <Clapperboard size={16} /> : <Tv size={16} />}
              <span>{isRtl ? (mediaType === 'movie' ? 'أقسام الأفلام' : mediaType === 'series' ? 'أقسام المسلسلات' : 'المجموعات') : t('categories')}</span>
            </div>
            <span className="text-xs font-mono text-zinc-400 font-bold px-2 py-0.5">{visibleCategories.length}</span>
          </div>

          {loading && visibleCategories.length === 0 ? (
            <div className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar py-1">
              <div className="p-3 space-y-2">
                <div className="flex items-center gap-2 mb-3 text-gold text-xs font-bold">
                  <div className="w-3.5 h-3.5 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                  <span></span>
                </div>
                {[1, 2, 3, 4, 5, 6, 7].map(n => (
                  <div key={n} className="h-9" />
                ))}
              </div>
            </div>
          ) : (
            <VirtualizedCategoryList
              ref={categoryListRef}
              categories={visibleCategories}
              realLiveCats={realLiveCats}
              selectedCategory={selectedCategory}
              onSelect={setSelectedCategory}
              onFocusIdx={handleFocusCatIdx}
              onReorder={mediaType === 'live' ? handleReorderCategory : undefined}
              showNumber={mediaType === 'live'}
            />
          )}
        </aside>

        {/* Column 2: Channel List / Posters Grid */}
        <section className={`${
          mediaType === 'movie' || mediaType === 'series'
            ? 'flex-1 bg-transparent'
            : 'w-64 sm:w-72 md:w-80 lg:w-96 bg-transparent'
        } flex flex-col h-full min-h-0 shrink-0 pb-0`}>
          
          <div className="px-2.5 py-1.5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-1.5 text-gold text-[11px] font-black uppercase">
              {mediaType === 'movie' ? <Film size={14} /> : mediaType === 'series' ? <Clapperboard size={14} /> : <Tv size={14} />}
              <span>
                {mediaType === 'movie'
                  ? t('movies')
                  : mediaType === 'series'
                  ? t('series')
                  : t('channels')}
              </span>
            </div>
            <span className="text-[10px] font-mono text-zinc-500 font-bold">
              {loading && filteredChannels.length === 0 ? '...' : (recentChannelItems ? recentChannelItems.length : `${filteredChannels.length}${categoryHasMore ? '+' : ''}`)}
            </span>
          </div>

          <div className="flex-1 min-h-0 overflow-hidden px-1.5 sm:px-2 pt-0 pb-0 outline-none ring-0 border-0">
            {loading && filteredChannels.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center gap-3 text-gold p-4 text-center">
                <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin shadow-lg shadow-gold/20" />
                <span className="text-xs font-bold text-zinc-300">
                </span>
              </div>
            ) : (
            <VirtualizedChannelList
              ref={virtualListRef}
              items={recentChannelItems || filteredChannels}
              selectedChannelId={selectedChannel?.stream_id}
              activePlayingMovieId={activePlayingMovie?.stream_id}
              favorites={favorites}
              isRtl={isRtl}
              mediaType={mediaType}
              viewMode={settings.viewMode || 'grid'}
              posterSize={settings.posterSize || 'medium'}
              showPosterTitles={Boolean(settings.showPosterTitles)}
              emptyMessage={
                selectedCategory === WATCH_HISTORY_CAT_ID
                  ? t('watch_history_empty')
                  : selectedCategory === CONTINUE_WATCHING_CAT_ID
                    ? t('continue_watching_empty')
                    : undefined
              }
              hasMore={selectedCategory !== WATCH_HISTORY_CAT_ID && selectedCategory !== CONTINUE_WATCHING_CAT_ID && !recentChannelItems && !search.trim() && categoryHasMore}
              onLoadMore={handleLoadMoreCategoryChannels}
              onColumnCountChange={handleColumnCountChange}
              onFocusChannel={handleFocusChannel}
              onHighlightChannel={handleHighlightChannel}
              onSelectChannel={handleChannelClick}
              onDoubleClickChannel={handleOpenFullscreen}
              onToggleFavorite={toggleFavorite}
              onReorderChannel={mediaType === 'live' && selectedCategory !== WATCH_HISTORY_CAT_ID && selectedCategory !== CONTINUE_WATCHING_CAT_ID ? handleReorderChannel : undefined}
              isFullscreen={isViewingFullscreen}
            />
            )}
          </div>
        </section>

        {/* Column 3: Small Player Area + Program Guide Under Mini Player (Only for Live & Favorites) */}
        {(mediaType === 'live' || mediaType === 'favorites') && (
          <main className="flex-1 flex flex-col gap-3 bg-transparent relative min-w-0 h-full overflow-hidden p-2 sm:p-3">
            {multiViewActive ? (
              <div data-multiview-container="true" className={`${multiViewFullscreenSlot !== null ? `fixed inset-0 z-[90] ${isNativeApp() && (window as any).AchourNative?.showMultiSlot ? 'bg-transparent' : 'bg-black'} p-1 grid-cols-1 grid-rows-1` : 'flex-1 min-h-0'} grid gap-2 ${multiViewFullscreenSlot === null ? (multiViewMode === 1 ? 'grid-cols-1 grid-rows-1' : multiViewMode === 2 ? 'grid-cols-2 grid-rows-1' : 'grid-cols-2 grid-rows-2') : ''}`}>
                {Array.from({ length: multiViewFullscreenSlot !== null ? 1 : multiViewMode }, (_, visibleIndex) => {
                  const slotIndex = multiViewFullscreenSlot !== null ? multiViewFullscreenSlot : visibleIndex;
                  const slotChannel = multiViewSlots[slotIndex];
                  return slotChannel ? (
                    <MultiViewSlotPlayer key={`multiview-${slotIndex}-${slotChannel.stream_id}`} channel={slotChannel}
                      slotIndex={slotIndex} isActive={selectedSlotIndex === slotIndex} isMuted={audioSlotIndex !== slotIndex}
                      isFullscreenSlot={multiViewFullscreenSlot === slotIndex}
                      settings={settings} isRtl={isRtl}
                      onSelectSlot={() => { setSelectedSlotIndex(slotIndex); setAudioSlotIndex(slotIndex); tvFocusedPane.current = 'multiview'; }}
                      onToggleMute={(e) => { e.stopPropagation(); setAudioSlotIndex(current => current === slotIndex ? -1 : slotIndex); }}
                      onOpenFullscreen={() => { setSelectedSlotIndex(slotIndex); setMultiViewFullscreenSlot(slotIndex); }}
                      onRemove={(e) => { e.stopPropagation(); setMultiViewSlots(prev => { const next = [...prev]; next[slotIndex] = null; return next; }); }} />
                  ) : (
                    <button key={`multiview-empty-${slotIndex}`} id={`multiview-slot-${slotIndex}`} data-tv-focusable="true" data-multiview-slot="true" data-slot-index={slotIndex} tabIndex={0}
                      onClick={() => { setSelectedSlotIndex(slotIndex); setMultiViewPickingSlot(slotIndex); tvFocusedPane.current = 'channels'; focusChannelAtIdx(0); }}
                      className="w-full h-full min-h-0 rounded-2xl border-2 border-dashed border-white/20 bg-black/35 flex flex-col items-center justify-center gap-2 text-zinc-300 hover:border-gold/70 hover:text-gold transition-colors">
                      <Plus size={28} /><span className="text-xs font-bold">{isRtl ? `اختر قناة للخانة ${slotIndex + 1}` : `Select channel for slot ${slotIndex + 1}`}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <>
            {/* Top Player Section - Small Video Player (Unfocusable by D-Pad) */}
            <div
              className={`w-full aspect-video shrink-0 ${!selectedChannel ? 'bg-transparent' : isNativeApp() ? 'bg-transparent' : 'bg-black'} rounded-2xl overflow-hidden relative group cursor-pointer`}
              onClick={() => !isFullscreen && selectedChannel && handleOpenFullscreen(selectedChannel)}
              onDoubleClick={() => !isFullscreen && selectedChannel && handleOpenFullscreen(selectedChannel)}
            >
              <div id="live-preview-container" className="w-full h-full"></div>

              {!selectedChannel && (
                <div className="absolute inset-0 flex items-center justify-center text-zinc-600 flex-col gap-2">
                  <Play size={48} className="opacity-20" />
                  <span className="text-xs font-medium uppercase tracking-widest opacity-40">
                    {isRtl ? 'اختر قناة للمعاينة' : 'Select a channel to preview'}
                  </span>
                </div>
              )}
            </div>

            {/* Program Guide Directly Under Mini Player */}
<div className="flex-1 min-h-0 p-3 sm:p-4 flex flex-col justify-between overflow-y-auto no-scrollbar">
  <LiveMiniEpgCard
    selectedChannel={selectedChannel}
    findProgramsForChannel={findProgramsForChannel}
    language={settings.language}
    timeFormat={settings.timeFormat}
    isRtl={isRtl}
  />
</div>
              </>
            )}
</main>
)}
</div>

      {/* Unified Live Player (Preview & Fullscreen) */}
      {(mediaType === 'live' || mediaType === 'favorites') && selectedChannel && (
        <VodPlayerModal
          key="live-player"
          media={selectedChannel}
          mediaType="live"
          isPreview={!isFullscreen}
          containerId={isFullscreen ? undefined : "live-preview-container"}
          settings={settings}
          isRtl={isRtl}
          onClose={handleLiveModalClose}
          itemsList={filteredChannels}
          epgData={mergedEpgForModal}
          onSelectMedia={handleLiveSelectMedia}
          onToggleFavorite={handleModalToggleFavorite}
          onPlaybackStarted={handleLivePlaybackStarted}
          onPlaybackFailed={handleLivePlaybackFailed}
          isFavorite={selectedChannel?.stream_id ? favorites.includes(selectedChannel.stream_id) : false}
        />
      )}

      {/* Rich Movie / Series Details Modal */}
      <AnimatePresence>
        {movieDetailsModal && (() => {
          const infoObj = mediaDetailInfo?.info || {};
          const resolvedPlot =
            infoObj.plot ||
            infoObj.description ||
            infoObj.overview ||
            infoObj.storyline ||
            infoObj.notes ||
            infoObj.plot_ar ||
            mediaDetailInfo?.movie_data?.plot ||
            (movieDetailsModal as any)?.plot ||
            '';
          const resolvedCast = infoObj.cast || infoObj.actors || (movieDetailsModal as any)?.cast || '';
          const resolvedDirector = infoObj.director || (movieDetailsModal as any)?.director || '';
          const resolvedGenre = infoObj.genre || (movieDetailsModal as any)?.genre || '';
          const resolvedRating = infoObj.rating || infoObj.rating_5based || (movieDetailsModal as any)?.rating || '';
          const resolvedRelease = infoObj.releaseDate || infoObj.releasedate || infoObj.year || (movieDetailsModal as any)?.releaseDate || '';
          const resolvedDuration = infoObj.duration || infoObj.episode_run_time || (movieDetailsModal as any)?.duration || '';
          const hasSeasonsSection = mediaType === 'series' || seriesSeasonsData.length > 0;
          const activeEpisodes =
            seriesSeasonsData.find(s => s.seasonNumber === selectedSeasonNum)?.episodes ||
            seriesSeasonsData[0]?.episodes ||
            [];

          const movieCleanId = cleanVodEntityId(movieDetailsModal.stream_id, effectivePlaylistId);
          const movieProgress = (mediaType === 'movie' && progressRevision >= 0)
            ? getVodProgress({
                mediaType: 'movie',
                playlistId: effectivePlaylistId,
                streamId: movieCleanId
              })
            : null;
          const hasMovieResume = Boolean(
            movieProgress &&
            !movieProgress.completed &&
            movieProgress.positionSec >= MIN_RESUME_POSITION_SEC
          );

          const seriesKeyId = cleanVodEntityId(
            (movieDetailsModal as any)?.series_id || movieDetailsModal.stream_id,
            effectivePlaylistId
          );
          const epProgressMap = (hasSeasonsSection && progressRevision >= 0)
            ? getSeriesEpisodesProgressMap(effectivePlaylistId, seriesKeyId)
            : {};
          const lastUnfinishedEp = (hasSeasonsSection && progressRevision >= 0)
            ? getSeriesLastUnfinishedEpisode(effectivePlaylistId, seriesKeyId)
            : null;
          const unfinishedEpisodeObj = lastUnfinishedEp
            ? seriesSeasonsData
                .flatMap(s => s.episodes)
                .find((ep: any) =>
                  cleanVodEntityId(ep.xtream_id || ep.stream_id, effectivePlaylistId, seriesKeyId) === lastUnfinishedEp.episodeId
                ) || null
            : null;

          return (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.04 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 achour-modal-backdrop select-none"
            >
              <motion.div
                role="dialog"
                aria-modal="true"
                data-tv-modal="true"
                data-tv-details-dialog="true"
                initial={{ scale: 0.98, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.98, opacity: 0 }}
                transition={{ duration: 0.04 }}
                className={`achour-tv-details-popup w-[82%] max-w-3xl ${hasSeasonsSection ? 'h-[82%] max-h-[82%]' : 'max-h-[80%]'} achour-glass-modal rounded-2xl p-3 sm:p-4 flex flex-col overflow-hidden ${isRtl ? 'font-cairo text-right' : 'text-left'}`}
              >
                {/* 1. Sticky Modal Title Bar */}
                <div className={`flex items-center justify-between pb-2.5 border-b border-white/10 shrink-0 ${isRtl ? 'flex-row-reverse' : ''}`}>
                  <div className={`flex items-center gap-2.5 min-w-0 ${isRtl ? 'flex-row-reverse' : ''}`}>
                    <div className="p-1.5 sm:p-2 rounded-xl bg-gold/20 text-gold shrink-0">
                      {mediaType === 'movie' ? <Film size={16} /> : <Clapperboard size={16} />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="text-sm sm:text-base font-black text-white uppercase tracking-wider truncate">
                        {movieDetailsModal.name}
                      </h2>
                      <p className="text-[10px] sm:text-xs text-gold/85 font-bold uppercase truncate mt-0.5">
                        {movieDetailsModal?.category_name || (mediaType === 'movie' ? (isRtl ? 'فيلم سينمائي' : 'Movie') : (isRtl ? 'مسلسل تلفزيوني' : 'TV Series'))}
                      </p>
                    </div>
                  </div>
                  <button
                    data-tv-focusable="true"
                    data-tv-modal="details"
                    data-modal-role="close"
                    tabIndex={0}
                    onClick={() => setMovieDetailsModal(null)}
                    className="p-1.5 text-zinc-400 hover:text-white focus:text-gold rounded-full transition-colors outline-none shrink-0"
                    title={isRtl ? 'إغلاق (Esc)' : 'Close (Esc)'}
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* 2. Fixed Sticky Poster + Movie/Series Info & Synopsis (NEVER scrolls when browsing episodes) */}
                <div className={`py-2 flex flex-row gap-3 sm:gap-4 items-start shrink-0 ${isRtl ? 'flex-row-reverse' : ''}`}>
                  {/* Fixed Poster */}
                  <div className={`${hasSeasonsSection ? 'w-16 sm:w-20 md:w-22' : 'w-20 sm:w-24 md:w-28'} aspect-[2/3] rounded-xl overflow-hidden border border-gold/30 shrink-0 bg-white/[0.04]`}>
                    <img 
                      src={mediaDetailInfo?.info?.cover_big || mediaDetailInfo?.info?.movie_image || movieDetailsModal.stream_icon || movieDetailsModal.cover || movieDetailsModal.logo} 
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover" 
                      onError={e => { e.currentTarget.style.display = 'none'; }} 
                      alt="" 
                    />
                  </div>

                  {/* Fixed Details & Story Column */}
                  <div className="flex-1 flex flex-col gap-1.5 sm:gap-2 min-w-0">
                    {(resolvedRating || resolvedRelease || resolvedGenre || resolvedDuration) && (
                      <div className="flex items-center flex-wrap gap-1.5 text-[11px] sm:text-xs font-bold">
                        {resolvedRating && (
                          <span className="px-2 py-0.5 rounded-md bg-gold/20 text-gold border border-gold/30">
                            ★ {resolvedRating}
                          </span>
                        )}
                        {resolvedRelease && (
                          <span className="px-2 py-0.5 rounded-md bg-white/10 text-zinc-200 border border-white/10">
                            {resolvedRelease}
                          </span>
                        )}
                        {resolvedDuration && (
                          <span className="px-2 py-0.5 rounded-md bg-white/10 text-zinc-200 border border-white/10">
                            {resolvedDuration}
                          </span>
                        )}
                        {resolvedGenre && (
                          <span className="px-2 py-0.5 rounded-md bg-white/10 text-zinc-300 border border-white/10 truncate max-w-[260px]">
                            {resolvedGenre}
                          </span>
                        )}
                      </div>
                    )}

                    <div>
                      <h3 className="text-[11px] sm:text-xs font-black uppercase text-gold tracking-widest mb-0.5">
                        {isRtl ? 'قصة العمل' : 'Synopsis & Plot'}
                      </h3>
                      {detailLoading && !resolvedPlot ? (
                        <div className="flex items-center gap-2 py-1.5 text-gold text-xs font-bold">
                          <div className="w-4 h-4 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                          <span>{isRtl ? 'جاري تحميل التفاصيل...' : 'Loading details...'}</span>
                        </div>
                      ) : (
                        <p className={`text-xs sm:text-sm text-zinc-200 leading-snug font-medium ${hasSeasonsSection ? 'line-clamp-2' : 'max-h-36 overflow-y-auto no-scrollbar'}`}>
                          {resolvedPlot || (isRtl ? 'لا تتوفر قصة لهذا العمل في بيانات الاشتراك.' : 'No synopsis provided by the playlist.')}
                        </p>
                      )}
                    </div>

                    {(resolvedCast || resolvedDirector) && (
                      <div className="space-y-0.5 text-xs">
                        {resolvedCast && (
                          <p className={hasSeasonsSection ? 'truncate text-zinc-300' : 'line-clamp-2 text-zinc-300'}>
                            <span className="font-black uppercase text-gold tracking-wider">
                              {isRtl ? 'طاقم التمثيل: ' : 'Cast: '}
                            </span>
                            {resolvedCast}
                          </p>
                        )}
                        {resolvedDirector && (
                          <p className="truncate text-zinc-300">
                            <span className="font-black uppercase text-gold tracking-wider">
                              {isRtl ? 'الإخراج: ' : 'Director: '}
                            </span>
                            {resolvedDirector}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Subtitles & Audio Languages Badges extracted from subscription */}
                    {Boolean(
                      (mediaDetailInfo?.info?.subtitles && (mediaDetailInfo.info.subtitles.length > 0 || Object.keys(mediaDetailInfo.info.subtitles).length > 0)) ||
                      (mediaDetailInfo?.movie_data?.subtitles && mediaDetailInfo.movie_data.subtitles.length > 0) ||
                      mediaDetailInfo?.info?.audio ||
                      mediaDetailInfo?.info?.audio_streams
                    ) && (
                      <div className="p-2 rounded-xl bg-white/[0.05] border border-white/10 flex flex-col gap-1.5">
                        {Boolean((mediaDetailInfo?.info?.subtitles && (Array.isArray(mediaDetailInfo.info.subtitles) ? mediaDetailInfo.info.subtitles.length > 0 : Object.keys(mediaDetailInfo.info.subtitles).length > 0)) || (mediaDetailInfo?.movie_data?.subtitles && mediaDetailInfo.movie_data.subtitles.length > 0)) && (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] sm:text-xs text-emerald-400 font-bold flex items-center gap-1 shrink-0">
                              <Layers size={13} />
                              {isRtl ? 'الترجمة المتوفرة:' : 'Subtitles:'}
                            </span>
                            {(Array.isArray(mediaDetailInfo?.info?.subtitles)
                              ? mediaDetailInfo.info.subtitles
                              : Object.values(mediaDetailInfo?.info?.subtitles || mediaDetailInfo?.movie_data?.subtitles || {})
                            ).slice(0, 6).map((sub: any, sIdx: number) => {
                              const code = typeof sub === 'string' ? sub : (sub.language || sub.lang || sub.container || 'ar');
                              return (
                                <span key={sIdx} className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                                  {formatLanguageLabel(code, sIdx, 'subtitle')}
                                </span>
                              );
                            })}
                          </div>
                        )}

                        {Boolean(mediaDetailInfo?.info?.audio || mediaDetailInfo?.info?.audio_streams) && (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] sm:text-xs text-red-400 font-bold flex items-center gap-1 shrink-0">
                              <Volume2 size={13} />
                              {isRtl ? 'لغات الصوت:' : 'Audio:'}
                            </span>
                            {(Array.isArray(mediaDetailInfo?.info?.audio || mediaDetailInfo?.info?.audio_streams)
                              ? (mediaDetailInfo?.info?.audio || mediaDetailInfo?.info?.audio_streams)
                              : [mediaDetailInfo?.info?.audio || mediaDetailInfo?.info?.audio_streams]
                            ).slice(0, 6).map((aud: any, aIdx: number) => {
                              const code = typeof aud === 'string' ? aud : (aud.language || aud.lang || 'Stereo');
                              return (
                                <span key={aIdx} className="px-2 py-0.5 rounded-md bg-red-500/20 text-red-300 border border-red-500/30 text-[10px] font-bold">
                                  {formatLanguageLabel(code, aIdx, 'audio')}
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. Independently Scrollable Seasons & Episodes Area (Series Only) */}
                {hasSeasonsSection && (
                  <div className="flex-1 min-h-0 flex flex-col border-t border-white/10 pt-2 overflow-hidden">
                    {/* Fixed Seasons Header & Tabs */}
                    <div className="shrink-0 space-y-1 pb-1.5">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs sm:text-sm font-black uppercase text-gold tracking-widest">
                          {isRtl ? 'المواسم والحلقات' : 'Seasons & Episodes'}
                        </h3>
                        <span className="text-[11px] sm:text-xs text-zinc-400 font-bold">
                          {seriesSeasonsData.length} {isRtl ? 'مواسم' : 'Seasons'}
                        </span>
                      </div>

                      <div
                        ref={detailsSeasonsScrollRef}
                        className="relative flex items-center gap-2.5 overflow-x-auto no-scrollbar px-1.5 py-1.5"
                      >
                        {seriesSeasonsData.map((s, sIdx) => {
                          const isSelected = selectedSeasonNum === s.seasonNumber;
                          return (
                            <button
                              key={`${s.seasonNumber}-${sIdx}`}
                              data-tv-focusable="true"
                              data-tv-modal="details"
                              data-season-tab="true"
                              data-season-active={isSelected ? 'true' : 'false'}
                              tabIndex={0}
                              onClick={() => setSelectedSeasonNum(s.seasonNumber)}
                              className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-colors border outline-none shrink-0 ${
                                isSelected
                                  ? 'bg-gold text-black border-gold'
                                  : 'bg-white/[0.06] border-white/15 text-zinc-200 hover:text-white hover:border-gold/50'
                              }`}
                            >
                              {s.title}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* ONLY Scrollable Episodes List (generous padding ensures focus rings never clip) */}
                    <div
                      ref={detailsEpisodesScrollRef}
                      className="relative flex-1 min-h-[100px] overflow-y-auto no-scrollbar space-y-2 py-2 px-1.5"
                    >
                      {activeEpisodes.length === 0 ? (
                        <div className="py-6 text-center text-xs sm:text-sm text-zinc-400 font-medium">
                          {detailLoading
                            ? (isRtl ? 'جاري تحميل الحلقات...' : 'Loading episodes...')
                            : (isRtl ? 'لا توجد حلقات متاحة لهذا الموسم.' : 'No episodes available for this season.')}
                        </div>
                      ) : (
                        activeEpisodes.map((ep: ParsedChannel, epIdx: number) => {
                          const epCleanId = cleanVodEntityId(
                            (ep as any).xtream_id || ep.stream_id,
                            effectivePlaylistId,
                            seriesKeyId
                          );
                          const epProg =
                            epProgressMap[epCleanId] ||
                            getVodProgress({
                              mediaType: 'series',
                              playlistId: effectivePlaylistId,
                              seriesId: seriesKeyId,
                              streamId: epCleanId,
                              episodeId: epCleanId,
                              legacyEpisodeIndex: epIdx
                            });
                          const isEpCompleted = Boolean(epProg?.completed);
                          const hasEpResume = Boolean(
                            epProg &&
                            !epProg.completed &&
                            epProg.positionSec >= MIN_RESUME_POSITION_SEC
                          );
                          const epPct =
                            hasEpResume && epProg && epProg.durationSec > 0
                              ? Math.min(100, Math.max(3, Math.round((epProg.positionSec / epProg.durationSec) * 100)))
                              : 0;

                          return (
                            <div
                              key={`${ep.stream_id}-${epIdx}`}
                              data-tv-focusable="true"
                              data-tv-modal="details"
                              data-episode-item="true"
                              data-episode-id={epCleanId}
                              data-episode-resume={hasEpResume ? 'true' : 'false'}
                              tabIndex={0}
                              onClick={() => {
                                if (!activeSeriesParentRef.current && movieDetailsModal) {
                                  activeSeriesParentRef.current = movieDetailsModal;
                                }
                                setSelectedChannel(ep);
                                setActivePlayingMovie(ep);
                                if (settings.useExternalPlayer) {
                                  launchExternalPlayer(ep.url, ep, 'series');
                                  setMovieDetailsModal(null);
                                } else {
                                  setVodResumeOverride({ mode: 'prompt' });
                                  setActiveVodPlayer(ep);
                                  setMovieDetailsModal(null);
                                }
                              }}
                              className={`flex items-center justify-between p-2.5 rounded-xl border transition-colors group cursor-pointer outline-none ${
                                hasEpResume
                                  ? 'bg-gold/[0.08] border-gold/45 hover:border-gold hover:bg-gold/15'
                                  : 'bg-white/[0.05] border-white/15 hover:border-gold/60 hover:bg-gold/15'
                              }`}
                            >
                              <div className="w-8 h-8 rounded-lg bg-gold/20 flex items-center justify-center text-gold font-mono font-bold text-xs sm:text-sm shrink-0">
                                {ep.episode || epIdx + 1}
                              </div>
                              <div className={`min-w-0 flex-1 ${isRtl ? 'mr-3' : 'ml-3'}`}>
                                <div className="flex items-center gap-2 min-w-0">
                                  <p className="text-xs sm:text-sm font-bold text-white group-hover:text-gold transition-colors whitespace-normal break-words leading-snug flex-1">
                                    {ep.name}
                                  </p>
                                  {isEpCompleted && (
                                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold shrink-0 flex items-center gap-1">
                                      <Check size={10} />
                                      {isRtl ? 'تمت المشاهدة' : 'Watched'}
                                    </span>
                                  )}
                                  {hasEpResume && epProg && (
                                    <span className="px-2 py-0.5 rounded-md bg-gold/20 border border-gold/40 text-gold text-[10px] font-mono font-bold shrink-0">
                                      {isRtl
                                        ? `توقفت عند ${formatPlaybackClock(epProg.positionSec)}`
                                        : `Paused ${formatPlaybackClock(epProg.positionSec)}`}
                                    </span>
                                  )}
                                </div>
                                {epPct > 0 && (
                                  <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mt-1.5">
                                    <div className="h-full bg-gold rounded-full" style={{ width: `${epPct}%` }} />
                                  </div>
                                )}
                              </div>
                              <Play size={14} className="text-gold/80 shrink-0 opacity-75 group-hover:opacity-100 ml-2" />
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}

                {/* 4. Sticky Action Buttons Footer (Movies only — omitted on Series to maximize Seasons & Episodes area) */}
                {mediaType !== 'series' && (
                <div className="pt-2.5 mt-1 border-t border-white/10 flex flex-wrap items-center justify-between gap-2.5 shrink-0">
                  {mediaType === 'movie' && hasMovieResume && movieProgress ? (
                    <button
                      data-tv-focusable="true"
                      data-tv-modal="details"
                      data-tv-play-now="true"
                      data-modal-role="play"
                      tabIndex={0}
                      onClick={() => {
                        setSelectedChannel(movieDetailsModal);
                        setActivePlayingMovie(movieDetailsModal);
                        if (settings.useExternalPlayer) {
                          launchExternalPlayer(movieDetailsModal.url, movieDetailsModal, 'movie');
                          setMovieDetailsModal(null);
                        } else {
                          setVodResumeOverride({ mode: 'prompt' });
                          setActiveVodPlayer(movieDetailsModal);
                          setMovieDetailsModal(null);
                        }
                      }}
                      className="px-4 py-1.5 bg-gold hover:bg-gold/90 text-black rounded-lg text-xs sm:text-sm font-black flex items-center justify-center gap-1.5 focus:outline-none transition-colors"
                    >
                      <Play size={14} className="fill-black" />
                      <span>{isRtl ? 'تشغيل' : 'Play'}</span>
                    </button>
                  ) : mediaType === 'movie' ? (
                    <button
                      data-tv-focusable="true"
                      data-tv-modal="details"
                      data-tv-play-now="true"
                      data-modal-role="play"
                      tabIndex={0}
                      onClick={() => {
                        setSelectedChannel(movieDetailsModal);
                        setActivePlayingMovie(movieDetailsModal);
                        if (settings.useExternalPlayer) {
                          launchExternalPlayer(movieDetailsModal.url, movieDetailsModal, 'movie');
                          setMovieDetailsModal(null);
                        } else {
                          setVodResumeOverride({ mode: 'prompt' });
                          setActiveVodPlayer(movieDetailsModal);
                          setMovieDetailsModal(null);
                        }
                      }}
                      className="px-4 py-1.5 bg-gold hover:bg-gold/90 text-black rounded-lg text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 focus:outline-none transition-colors"
                    >
                      <Play size={14} className="fill-black" />
                      <span>{isRtl ? 'تشغيل' : 'Play'}</span>
                    </button>
                  ) : (
                    <div />
                  )}
                  <button
                    data-tv-focusable="true"
                    data-tv-modal="details"
                    data-modal-role="favorite"
                    tabIndex={0}
                    onClick={() => toggleFavorite(movieDetailsModal.stream_id)}
                    className={`px-3 py-1.5 rounded-lg border transition-colors outline-none focus:outline-none flex items-center justify-center gap-1.5 text-xs sm:text-sm font-bold ${
                      vodFavorites.includes(movieDetailsModal.stream_id) ? 'bg-gold text-black border-gold' : 'bg-white/[0.06] border-white/15 text-zinc-200 hover:border-gold'
                    }`}
                    title={t('favorites')}
                  >
                    <Star size={14} className={vodFavorites.includes(movieDetailsModal.stream_id) ? 'fill-black' : ''} />
                    {hasSeasonsSection && (
                      <span>{vodFavorites.includes(movieDetailsModal.stream_id) ? (isRtl ? 'في المفضلة' : 'Favorited') : (isRtl ? 'المفضلة' : 'Favorite')}</span>
                    )}
                  </button>
                </div>
                )}
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* Position Reorder & Channel Actions Strip Modal */}
      <AnimatePresence>
        {reorderTarget && (
          <PositionEditModal
            type={reorderTarget.type}
            id={reorderTarget.id}
            name={reorderTarget.name}
            currentIndex={reorderTarget.index}
            maxPosition={
              reorderTarget.type === 'category'
                ? visibleCategories.filter(c => c.category_id !== 'favorites' && c.category_id !== WATCH_HISTORY_CAT_ID && c.category_id !== CONTINUE_WATCHING_CAT_ID).length
                : (filteredChannelsRef.current?.length || filteredChannels.length)
            }
            language={settings.language}
            onClose={() => setReorderTarget(null)}
            onSave={(newPos) => moveItemToPosition(reorderTarget.type, reorderTarget.id, newPos, true)}
            onToggleFavorite={reorderTarget.type === 'channel' ? () => toggleFavorite(reorderTarget.id) : undefined}
            isFavorite={favorites.includes(reorderTarget.id)}
          />
        )}
      </AnimatePresence>

      {/* Dedicated Player Modal for Movies & Series (Only non-live) */}
      {activeVodPlayer && (mediaType === 'movie' || mediaType === 'series') && (() => {
        const seriesEpisodes = mediaType === 'series'
          ? (seriesSeasonsData.find(s => s.seasonNumber === selectedSeasonNum)?.episodes || seriesSeasonsData.flatMap(s => s.episodes))
          : undefined;
        const seriesIdClean = mediaType === 'series'
          ? cleanVodEntityId(
              (activeSeriesParentRef.current as any)?.series_id || activeSeriesParentRef.current?.stream_id || (activeVodPlayer as any)?.series_id,
              effectivePlaylistId
            )
          : undefined;
        const matchedEpIdx = seriesEpisodes
          ? Math.max(0, seriesEpisodes.findIndex(e => String(e.stream_id) === String(activeVodPlayer.stream_id)))
          : 0;
        let fallbackMovieUrl = activeVodPlayer.url || '';
        if (mediaType === 'movie' && !fallbackMovieUrl && activePlaylist?.type === 'xtream' && activePlaylist.username && activePlaylist.password) {
          let baseHost = streamingHost || (activePlaylist.url || '').trim().replace(/\/+$/, '').replace(/\/(player_api|get|index)\.php.*$/i, '').replace(/\/c\/?$/i, '').replace(/\?.*$/, '');
          if (baseHost && !baseHost.startsWith('http://') && !baseHost.startsWith('https://')) {
            baseHost = `http://${baseHost}`;
          }
          const cleanMovieId = cleanVodEntityId(activeVodPlayer.stream_id, effectivePlaylistId) || String(activeVodPlayer.stream_id || '').trim();
          const ext = activeVodPlayer.container_extension || mediaDetailInfo?.movie_data?.container_extension || 'mp4';
          if (baseHost && cleanMovieId) {
            fallbackMovieUrl = `${baseHost}/movie/${encodeURIComponent(activePlaylist.username)}/${encodeURIComponent(activePlaylist.password)}/${cleanMovieId}.${ext}`;
          }
        }
        const enrichedMedia = {
          ...activeVodPlayer,
          url: fallbackMovieUrl,
          series_id: seriesIdClean || (activeVodPlayer as any).series_id,
          series_name: (activeVodPlayer as any).series_name || activeSeriesParentRef.current?.name || activeVodPlayer.name,
          series_poster:
            activeSeriesParentRef.current?.stream_icon ||
            activeSeriesParentRef.current?.cover ||
            activeSeriesParentRef.current?.logo ||
            mediaDetailInfo?.info?.cover_big ||
            mediaDetailInfo?.info?.movie_image ||
            activeVodPlayer.stream_icon,
          subtitles: (activeVodPlayer as any).subtitles || mediaDetailInfo?.info?.subtitles || mediaDetailInfo?.movie_data?.subtitles
        };
        return (
          <VodPlayerModal
            media={enrichedMedia}
            mediaType={activeVodPlayer.type || (mediaType === 'series' ? 'series' : 'movie')}
            seriesId={seriesIdClean}
            playlistId={effectivePlaylistId}
            initialResumeMode={vodResumeOverride.mode}
            initialResumePositionSec={vodResumeOverride.positionSec}
            activePlaylist={activePlaylist}
            settings={settings}
            isRtl={isRtl}
            onClose={handleVodModalClose}
            episodesList={seriesEpisodes}
            currentEpisodeIndex={matchedEpIdx}
            itemsList={filteredChannels}
            epgData={mergedEpgForModal}
            onSelectEpisode={(idx) => {
              const ep = seriesEpisodes?.[idx];
              if (ep) {
                setVodResumeOverride({ mode: 'prompt' });
                handleVodSelectMedia(ep);
              }
            }}
            onSelectMedia={(next) => {
              setVodResumeOverride({ mode: 'prompt' });
              handleVodSelectMedia(next);
            }}
            onToggleFavorite={handleModalToggleFavorite}
            onPlaybackStarted={handleVodPlaybackStarted}
            isFavorite={activeVodPlayer?.stream_id ? vodFavorites.includes(activeVodPlayer.stream_id) : false}
          />
        );
      })()}


      {/* Parental PIN Modal */}
      {showPinModal && activePlaylist?.pin && (
        <PinUnlockModal
          isOpen={showPinModal}
          onClose={onBack}
          onSuccess={() => {
            setIsUnlocked(true);
            setShowPinModal(false);
          }}
          correctPin={activePlaylist.pin}
          playlistName={activePlaylist.name}
          language={settings.language}
        />
      )}
      {showEpgGrid && (
        <EPGGrid
          isOpen={showEpgGrid}
          onClose={() => setShowEpgGrid(false)}
          channels={channels.filter(c => !isMovieItem(c.name) && !isSeriesItem(c.name)).map((c: any) => ({
            id: c.stream_id || c.id || String(Math.random()),
            name: c.name,
            logo: c.logo || c.stream_icon,
            url: c.url || '',
            category: c.category || c.category_id || 'عام',
            category_id: c.category_id || c.category || 'general',
            type: 'live' as const,
            stream_id: c.stream_id
          }))}
          epgData={xmltvData}
          onSelectChannel={(ch) => {
            const found = channels.find((c: any) => (c.stream_id === ch.stream_id) || (c.id === ch.id) || (c.name === ch.name));
            if (found) setSelectedChannel(found);
            setShowEpgGrid(false);
          }}
          settings={settings}
        />
      )}
      {showOcr && (
        <AIOcrModal 
          onClose={() => setShowOcr(false)} 
          onSelectChannel={(name) => {
            setSearch(name);
            setShowOcr(false);
          }} 
          language={settings.language}
        />
      )}
    </div>
  );
}
