import { ParsedChannel } from '../components/LivePlayer';

export type WatchHistoryType = 'movie' | 'series' | 'live';
export const WATCH_HISTORY_CAT_ID = '__WATCH_HISTORY__';

export interface WatchHistoryEntry extends ParsedChannel {
  watchedAt: number;
}

export interface LastWatchedChannelRecord {
  playlistId: string;
  channel: ParsedChannel;
  updatedAt: number;
}

const HISTORY_STORAGE_KEYS: Record<WatchHistoryType, string> = {
  movie: 'achour_watch_history_v1_movie',
  series: 'achour_watch_history_v1_series',
  live: 'achour_watch_history_v1_live',
};

const LAST_CHANNEL_KEY = 'achour_last_watched_channel_v1';
const MAX_HISTORY_PER_PLAYLIST = 80;

interface StoredHistoryMap {
  byPlaylist: Record<string, WatchHistoryEntry[]>;
}

const memoryCache: Partial<Record<WatchHistoryType, StoredHistoryMap>> = {};
let lastChannelCache: LastWatchedChannelRecord | null | undefined = undefined;

const normalizePlaylistKey = (playlistId?: string | null): string => {
  const clean = String(playlistId || 'default').trim();
  return clean || 'default';
};

const compactHistoryEntry = (
  item: ParsedChannel,
  type: WatchHistoryType
): WatchHistoryEntry | null => {
  const sid = String(item?.stream_id || (item as any)?.series_id || (item as any)?.id || '').trim();
  if (!sid) return null;

  const entry: WatchHistoryEntry = {
    stream_id: sid,
    name: String(item.name || '').trim() || sid,
    url: String(item.url || ''),
    category_id: String(item.category_id || ''),
    watchedAt: Date.now(),
    type,
  };

  const icon = item.stream_icon || item.logo || item.cover;
  if (icon) {
    entry.stream_icon = icon;
    entry.logo = icon;
    entry.cover = icon;
  }
  if (item.category_name || item.category) {
    entry.category_name = item.category_name || item.category;
    entry.category = entry.category_name;
  }
  if (item.container_extension) entry.container_extension = item.container_extension;
  if (item.rating !== undefined && item.rating !== null && item.rating !== '') entry.rating = item.rating;
  if (item.releaseDate) entry.releaseDate = item.releaseDate;
  if (item.duration) entry.duration = item.duration;
  if (type === 'series') {
    (entry as any).series_id = (item as any).series_id || sid;
  }

  return entry;
};

const readMap = (type: WatchHistoryType): StoredHistoryMap => {
  if (memoryCache[type]) return memoryCache[type]!;
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEYS[type]);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && parsed.byPlaylist && typeof parsed.byPlaylist === 'object') {
        memoryCache[type] = parsed as StoredHistoryMap;
        return memoryCache[type]!;
      }
    }
  } catch {
    // ignore corrupted localStorage entry
  }
  memoryCache[type] = { byPlaylist: {} };
  return memoryCache[type]!;
};

const writeMap = (type: WatchHistoryType, map: StoredHistoryMap) => {
  memoryCache[type] = map;
  try {
    localStorage.setItem(HISTORY_STORAGE_KEYS[type], JSON.stringify(map));
  } catch {
    // ignore quota exceeded
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('achour_watch_history_changed', { detail: { type } }));
  }
};

export const getWatchHistory = (
  type: WatchHistoryType,
  playlistId?: string | null
): WatchHistoryEntry[] => {
  const plKey = normalizePlaylistKey(playlistId);
  const map = readMap(type);
  const list = map.byPlaylist[plKey];
  if (Array.isArray(list) && list.length > 0) {
    return list;
  }
  // Fallback if playlistId is 'default' or missing: check any stored playlist list?
  // Keep playlist isolation clean when explicit playlistId is passed
  return Array.isArray(list) ? list : [];
};

export const getWatchHistoryTotalCount = (
  type: WatchHistoryType,
  playlistId?: string | null
): number => {
  const map = readMap(type);
  if (playlistId) {
    const plKey = normalizePlaylistKey(playlistId);
    return Array.isArray(map.byPlaylist[plKey]) ? map.byPlaylist[plKey].length : 0;
  }
  let total = 0;
  for (const key of Object.keys(map.byPlaylist)) {
    const arr = map.byPlaylist[key];
    if (Array.isArray(arr)) total += arr.length;
  }
  return total;
};

export const addToWatchHistory = (
  type: WatchHistoryType,
  item: ParsedChannel,
  playlistId?: string | null
): void => {
  const compact = compactHistoryEntry(item, type);
  if (!compact) return;

  const plKey = normalizePlaylistKey(playlistId);
  const map = readMap(type);
  const prevList = Array.isArray(map.byPlaylist[plKey]) ? map.byPlaylist[plKey] : [];
  const filtered = prevList.filter((entry) => String(entry.stream_id) !== String(compact.stream_id));
  const nextList = [compact, ...filtered].slice(0, MAX_HISTORY_PER_PLAYLIST);

  writeMap(type, {
    byPlaylist: {
      ...map.byPlaylist,
      [plKey]: nextList,
    },
  });
};

export const clearWatchHistoryByType = (type: WatchHistoryType): void => {
  writeMap(type, { byPlaylist: {} });
};

export const saveLastWatchedChannel = (
  channel: ParsedChannel,
  playlistId?: string | null
): void => {
  const compact = compactHistoryEntry(channel, 'live');
  if (!compact || !compact.url) return;

  const record: LastWatchedChannelRecord = {
    playlistId: normalizePlaylistKey(playlistId),
    channel: compact,
    updatedAt: Date.now(),
  };
  lastChannelCache = record;
  try {
    localStorage.setItem(LAST_CHANNEL_KEY, JSON.stringify(record));
  } catch {
    // ignore storage errors
  }
};

export const getLastWatchedChannel = (
  expectedPlaylistId?: string | null
): LastWatchedChannelRecord | null => {
  if (lastChannelCache === undefined) {
    try {
      const raw = localStorage.getItem(LAST_CHANNEL_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.channel && parsed.channel.stream_id && parsed.channel.url) {
          lastChannelCache = parsed as LastWatchedChannelRecord;
        } else {
          lastChannelCache = null;
        }
      } else {
        lastChannelCache = null;
      }
    } catch {
      lastChannelCache = null;
    }
  }

  if (!lastChannelCache) return null;
  if (expectedPlaylistId) {
    const cleanExpected = normalizePlaylistKey(expectedPlaylistId);
    if (lastChannelCache.playlistId !== cleanExpected) {
      return null;
    }
  }
  return lastChannelCache;
};

export const clearLastWatchedChannel = (): void => {
  lastChannelCache = null;
  try {
    localStorage.removeItem(LAST_CHANNEL_KEY);
  } catch {
    // ignore
  }
};
