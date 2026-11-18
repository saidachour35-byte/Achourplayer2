export type VodProgressMediaType = 'movie' | 'series';

export const CONTINUE_WATCHING_CAT_ID = '__CONTINUE_WATCHING__';

export interface VodMediaSnapshot {
  mediaTitle?: string;
  streamIcon?: string;
  categoryId?: string;
  categoryName?: string;
  mediaUrl?: string;
  containerExtension?: string;
  rating?: string;
  releaseDate?: string;
  durationLabel?: string;
}

export interface VodProgressRecord extends VodMediaSnapshot {
  itemKey: string;
  mediaType: VodProgressMediaType;
  playlistId: string;
  seriesId?: string;
  episodeId?: string;
  seasonNum?: number;
  episodeNum?: number;
  episodeTitle?: string;
  positionSec: number;
  durationSec: number;
  completed: boolean;
  updatedAt: number;
}

export interface SeriesResumePointer extends VodMediaSnapshot {
  playlistId: string;
  seriesId: string;
  episodeId: string;
  seasonNum: number;
  episodeNum: number;
  episodeTitle: string;
  positionSec: number;
  durationSec: number;
  updatedAt: number;
}

interface StoredVodProgressStore {
  byKey: Record<string, VodProgressRecord>;
  seriesLatest: Record<string, SeriesResumePointer>;
}

const PROGRESS_STORAGE_KEY = 'achour_vod_progress_v2';
const MAX_PROGRESS_RECORDS = 500;
export const MIN_RESUME_POSITION_SEC = 8;

let memStoreCache: StoredVodProgressStore | null = null;

const normalizePlaylistId = (playlistId?: string | null): string => {
  const clean = String(playlistId || 'default').trim();
  return clean || 'default';
};

export const cleanVodEntityId = (
  rawId: any,
  playlistId?: string | null,
  seriesId?: string | null
): string => {
  if (rawId === undefined || rawId === null) return '';
  let str = String(rawId).trim();
  if (!str) return '';

  const pid = playlistId ? String(playlistId).trim() : '';
  const sid = seriesId ? String(seriesId).trim() : '';

  if (pid && sid) {
    const compositePrefix = `${pid}_${sid}_`;
    while (str.startsWith(compositePrefix)) {
      str = str.slice(compositePrefix.length);
    }
  }

  if (pid) {
    for (const kind of ['movie', 'series', 'live']) {
      const chPrefix = `${pid}_${kind}_`;
      if (str.startsWith(chPrefix)) {
        str = str.slice(chPrefix.length);
      }
    }
  }

  return str.replace(/\.(mp4|mkv|avi|mov|webm|ts|m3u8)$/i, '').trim();
};

export const buildVodProgressKey = (params: {
  mediaType: VodProgressMediaType;
  playlistId?: string | null;
  streamId?: any;
  seriesId?: any;
  episodeId?: any;
}): string => {
  const pl = normalizePlaylistId(params.playlistId);
  if (params.mediaType === 'series') {
    const sid = cleanVodEntityId(params.seriesId, pl) || 'series';
    const epId = cleanVodEntityId(params.episodeId ?? params.streamId, pl, sid);
    return epId ? `ep:${pl}:${sid}:${epId}` : '';
  }
  const mid = cleanVodEntityId(params.streamId ?? params.episodeId, pl);
  return mid ? `movie:${pl}:${mid}` : '';
};

const readStore = (): StoredVodProgressStore => {
  if (memStoreCache) return memStoreCache;
  try {
    const raw = localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        memStoreCache = {
          byKey: parsed.byKey && typeof parsed.byKey === 'object' ? parsed.byKey : {},
          seriesLatest: parsed.seriesLatest && typeof parsed.seriesLatest === 'object' ? parsed.seriesLatest : {}
        };
        return memStoreCache;
      }
    }
  } catch {
    // ignore corrupted entry
  }
  memStoreCache = { byKey: {}, seriesLatest: {} };
  return memStoreCache;
};

const writeStore = (store: StoredVodProgressStore, notify = true) => {
  const keys = Object.keys(store.byKey);
  if (keys.length > MAX_PROGRESS_RECORDS) {
    keys.sort((a, b) => (store.byKey[b]?.updatedAt || 0) - (store.byKey[a]?.updatedAt || 0));
    const trimmed: Record<string, VodProgressRecord> = {};
    for (let i = 0; i < MAX_PROGRESS_RECORDS; i++) {
      const k = keys[i];
      if (k) trimmed[k] = store.byKey[k];
    }
    store.byKey = trimmed;
  }

  memStoreCache = store;
  try {
    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(store));
  } catch {
    // ignore storage quota errors
  }

  if (notify && typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('achour_vod_progress_changed'));
  }
};

export const isPositionNearCompletion = (positionSec: number, durationSec: number): boolean => {
  if (!Number.isFinite(positionSec) || !Number.isFinite(durationSec) || durationSec <= 0) {
    return false;
  }
  if (positionSec <= 0) return false;
  if (durationSec >= 120) {
    return positionSec / durationSec >= 0.95 || (durationSec - positionSec) <= 15;
  }
  if (durationSec >= 30) {
    return positionSec / durationSec >= 0.95;
  }
  return positionSec >= durationSec - 1;
};

const readLegacyProgress = (
  legacyVodId?: any,
  legacyEpIndex?: number,
  cleanEpId?: string
): number => {
  try {
    const idx = typeof legacyEpIndex === 'number' && legacyEpIndex >= 0 ? legacyEpIndex : 0;
    const candidates = new Set<string>();
    if (legacyVodId !== undefined && legacyVodId !== null && String(legacyVodId).trim()) {
      candidates.add(`vod_progress_${String(legacyVodId).trim()}_${idx}`);
      candidates.add(`vod_progress_${String(legacyVodId).trim()}_0`);
    }
    if (cleanEpId) {
      candidates.add(`vod_progress_${cleanEpId}_${idx}`);
      candidates.add(`vod_progress_${cleanEpId}_0`);
    }
    for (const key of candidates) {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const num = parseFloat(raw);
      if (Number.isFinite(num) && num >= MIN_RESUME_POSITION_SEC) {
        return num;
      }
    }
  } catch {
    // ignore storage errors
  }
  return 0;
};

const clearLegacyProgressKeys = (
  legacyVodId?: any,
  legacyEpIndex?: number,
  cleanEpId?: string
) => {
  try {
    const idx = typeof legacyEpIndex === 'number' && legacyEpIndex >= 0 ? legacyEpIndex : 0;
    if (legacyVodId !== undefined && legacyVodId !== null && String(legacyVodId).trim()) {
      localStorage.removeItem(`vod_progress_${String(legacyVodId).trim()}_${idx}`);
      localStorage.removeItem(`vod_progress_${String(legacyVodId).trim()}_0`);
    }
    if (cleanEpId) {
      localStorage.removeItem(`vod_progress_${cleanEpId}_${idx}`);
      localStorage.removeItem(`vod_progress_${cleanEpId}_0`);
    }
  } catch {
    // ignore
  }
};

export const getVodProgress = (params: {
  mediaType: VodProgressMediaType;
  playlistId?: string | null;
  streamId?: any;
  seriesId?: any;
  episodeId?: any;
  legacyEpisodeIndex?: number;
}): VodProgressRecord | null => {
  const pl = normalizePlaylistId(params.playlistId);
  const store = readStore();
  const primaryKey = buildVodProgressKey({
    mediaType: params.mediaType,
    playlistId: pl,
    streamId: params.streamId,
    seriesId: params.seriesId,
    episodeId: params.episodeId
  });

  if (primaryKey && store.byKey[primaryKey]) {
    return store.byKey[primaryKey];
  }

  // Fallback across playlists if same clean stream/episode ID was saved under 'default' or another playlist key
  if (params.mediaType === 'series') {
    const epClean = cleanVodEntityId(params.episodeId ?? params.streamId, pl, params.seriesId);
    if (epClean) {
      const matchingKey = Object.keys(store.byKey).find((k) => {
        const rec = store.byKey[k];
        return rec?.mediaType === 'series' && rec.playlistId === pl && rec.episodeId === epClean;
      });
      if (matchingKey) return store.byKey[matchingKey];
    }
  }

  // Safe read fallback for legacy vod_progress_* keys
  const cleanId = cleanVodEntityId(
    params.mediaType === 'series' ? (params.episodeId ?? params.streamId) : params.streamId,
    pl,
    params.seriesId
  );
  const legacyTime = readLegacyProgress(params.streamId ?? params.episodeId, params.legacyEpisodeIndex, cleanId);
  if (legacyTime >= MIN_RESUME_POSITION_SEC) {
    return {
      itemKey: primaryKey || `legacy_${cleanId}`,
      mediaType: params.mediaType,
      playlistId: pl,
      seriesId: params.seriesId ? cleanVodEntityId(params.seriesId, pl) : undefined,
      episodeId: cleanId || undefined,
      positionSec: Math.floor(legacyTime),
      durationSec: 0,
      completed: false,
      updatedAt: Date.now()
    };
  }

  return null;
};

const rebuildSeriesLatestPointer = (
  store: StoredVodProgressStore,
  playlistId: string,
  seriesId: string
) => {
  const seriesPtrKey = `${playlistId}:${seriesId}`;
  let best: VodProgressRecord | null = null;

  for (const key of Object.keys(store.byKey)) {
    const rec = store.byKey[key];
    if (
      rec &&
      rec.mediaType === 'series' &&
      rec.playlistId === playlistId &&
      rec.seriesId === seriesId &&
      !rec.completed &&
      rec.positionSec >= MIN_RESUME_POSITION_SEC
    ) {
      if (!best || rec.updatedAt > best.updatedAt) {
        best = rec;
      }
    }
  }

  if (best && best.episodeId) {
    const prevPtr = store.seriesLatest[seriesPtrKey];
    store.seriesLatest[seriesPtrKey] = {
      playlistId,
      seriesId,
      episodeId: best.episodeId,
      seasonNum: best.seasonNum || 1,
      episodeNum: best.episodeNum || 1,
      episodeTitle: best.episodeTitle || '',
      positionSec: best.positionSec,
      durationSec: best.durationSec,
      updatedAt: best.updatedAt,
      mediaTitle: best.mediaTitle || prevPtr?.mediaTitle,
      streamIcon: best.streamIcon || prevPtr?.streamIcon,
      categoryId: best.categoryId || prevPtr?.categoryId,
      categoryName: best.categoryName || prevPtr?.categoryName,
      mediaUrl: best.mediaUrl || prevPtr?.mediaUrl,
      containerExtension: best.containerExtension || prevPtr?.containerExtension,
      rating: best.rating || prevPtr?.rating,
      releaseDate: best.releaseDate || prevPtr?.releaseDate,
      durationLabel: best.durationLabel || prevPtr?.durationLabel
    };
  } else {
    delete store.seriesLatest[seriesPtrKey];
  }
};

export const saveVodProgress = (params: {
  mediaType: VodProgressMediaType;
  playlistId?: string | null;
  streamId?: any;
  seriesId?: any;
  episodeId?: any;
  seasonNum?: number;
  episodeNum?: number;
  episodeTitle?: string;
  positionSec: number;
  durationSec: number;
  legacyEpisodeIndex?: number;
  notify?: boolean;
  snapshot?: VodMediaSnapshot;
}): void => {
  const pos = Math.floor(params.positionSec || 0);
  const dur = Math.floor(params.durationSec || 0);
  if (pos < 4) return;

  const pl = normalizePlaylistId(params.playlistId);
  const sid = params.mediaType === 'series' ? (cleanVodEntityId(params.seriesId, pl) || 'series') : undefined;
  const epId = params.mediaType === 'series'
    ? cleanVodEntityId(params.episodeId ?? params.streamId, pl, sid)
    : cleanVodEntityId(params.streamId, pl);

  const itemKey = buildVodProgressKey({
    mediaType: params.mediaType,
    playlistId: pl,
    streamId: params.streamId,
    seriesId: sid,
    episodeId: epId
  });
  if (!itemKey) return;

  const store = readStore();
  const prev = store.byKey[itemKey];
  const snap = params.snapshot;
  const mergedMeta: VodMediaSnapshot = {
    mediaTitle: snap?.mediaTitle || prev?.mediaTitle,
    streamIcon: snap?.streamIcon || prev?.streamIcon,
    categoryId: snap?.categoryId || prev?.categoryId,
    categoryName: snap?.categoryName || prev?.categoryName,
    mediaUrl: snap?.mediaUrl || prev?.mediaUrl,
    containerExtension: snap?.containerExtension || prev?.containerExtension,
    rating: snap?.rating || prev?.rating,
    releaseDate: snap?.releaseDate || prev?.releaseDate,
    durationLabel: snap?.durationLabel || prev?.durationLabel
  };
  const nearDone = isPositionNearCompletion(pos, dur);

  if (nearDone) {
    store.byKey[itemKey] = {
      itemKey,
      mediaType: params.mediaType,
      playlistId: pl,
      seriesId: sid,
      episodeId: epId || undefined,
      seasonNum: params.seasonNum,
      episodeNum: params.episodeNum,
      episodeTitle: params.episodeTitle,
      positionSec: 0,
      durationSec: dur,
      completed: true,
      updatedAt: Date.now(),
      ...mergedMeta
    };
    clearLegacyProgressKeys(params.streamId ?? params.episodeId, params.legacyEpisodeIndex, epId);
    if (params.mediaType === 'series' && sid) {
      rebuildSeriesLatestPointer(store, pl, sid);
    }
    writeStore(store, params.notify !== false);
    return;
  }

  const record: VodProgressRecord = {
    itemKey,
    mediaType: params.mediaType,
    playlistId: pl,
    seriesId: sid,
    episodeId: epId || undefined,
    seasonNum: params.seasonNum,
    episodeNum: params.episodeNum,
    episodeTitle: params.episodeTitle,
    positionSec: pos,
    durationSec: dur,
    completed: false,
    updatedAt: Date.now(),
    ...mergedMeta
  };

  store.byKey[itemKey] = record;

  // Keep legacy key synchronized for backward compatibility
  if (pos >= MIN_RESUME_POSITION_SEC && epId) {
    try {
      const idx = typeof params.legacyEpisodeIndex === 'number' && params.legacyEpisodeIndex >= 0 ? params.legacyEpisodeIndex : 0;
      localStorage.setItem(`vod_progress_${epId}_${idx}`, String(pos));
    } catch {
      // ignore
    }
  }

  if (params.mediaType === 'series' && sid && pos >= MIN_RESUME_POSITION_SEC && epId) {
    const prevPtr = store.seriesLatest[`${pl}:${sid}`];
    store.seriesLatest[`${pl}:${sid}`] = {
      playlistId: pl,
      seriesId: sid,
      episodeId: epId,
      seasonNum: params.seasonNum || 1,
      episodeNum: params.episodeNum || 1,
      episodeTitle: params.episodeTitle || '',
      positionSec: pos,
      durationSec: dur,
      updatedAt: record.updatedAt,
      mediaTitle: mergedMeta.mediaTitle || prevPtr?.mediaTitle,
      streamIcon: mergedMeta.streamIcon || prevPtr?.streamIcon,
      categoryId: mergedMeta.categoryId || prevPtr?.categoryId,
      categoryName: mergedMeta.categoryName || prevPtr?.categoryName,
      mediaUrl: mergedMeta.mediaUrl || prevPtr?.mediaUrl,
      containerExtension: mergedMeta.containerExtension || prevPtr?.containerExtension,
      rating: mergedMeta.rating || prevPtr?.rating,
      releaseDate: mergedMeta.releaseDate || prevPtr?.releaseDate,
      durationLabel: mergedMeta.durationLabel || prevPtr?.durationLabel
    };
  }

  writeStore(store, Boolean(params.notify));
};

export const markVodCompleted = (params: {
  mediaType: VodProgressMediaType;
  playlistId?: string | null;
  streamId?: any;
  seriesId?: any;
  episodeId?: any;
  seasonNum?: number;
  episodeNum?: number;
  episodeTitle?: string;
  durationSec?: number;
  legacyEpisodeIndex?: number;
}): void => {
  const pl = normalizePlaylistId(params.playlistId);
  const sid = params.mediaType === 'series' ? (cleanVodEntityId(params.seriesId, pl) || 'series') : undefined;
  const epId = params.mediaType === 'series'
    ? cleanVodEntityId(params.episodeId ?? params.streamId, pl, sid)
    : cleanVodEntityId(params.streamId, pl);

  const itemKey = buildVodProgressKey({
    mediaType: params.mediaType,
    playlistId: pl,
    streamId: params.streamId,
    seriesId: sid,
    episodeId: epId
  });
  if (!itemKey) return;

  const store = readStore();
  const prev = store.byKey[itemKey];
  store.byKey[itemKey] = {
    itemKey,
    mediaType: params.mediaType,
    playlistId: pl,
    seriesId: sid,
    episodeId: epId || undefined,
    seasonNum: params.seasonNum ?? prev?.seasonNum,
    episodeNum: params.episodeNum ?? prev?.episodeNum,
    episodeTitle: params.episodeTitle ?? prev?.episodeTitle,
    positionSec: 0,
    durationSec: Math.floor(params.durationSec || prev?.durationSec || 0),
    completed: true,
    updatedAt: Date.now()
  };

  clearLegacyProgressKeys(params.streamId ?? params.episodeId, params.legacyEpisodeIndex, epId);
  if (params.mediaType === 'series' && sid) {
    rebuildSeriesLatestPointer(store, pl, sid);
  }
  writeStore(store, true);
};

export const clearVodProgress = (params: {
  mediaType: VodProgressMediaType;
  playlistId?: string | null;
  streamId?: any;
  seriesId?: any;
  episodeId?: any;
  legacyEpisodeIndex?: number;
}): void => {
  const pl = normalizePlaylistId(params.playlistId);
  const sid = params.mediaType === 'series' ? (cleanVodEntityId(params.seriesId, pl) || 'series') : undefined;
  const epId = params.mediaType === 'series'
    ? cleanVodEntityId(params.episodeId ?? params.streamId, pl, sid)
    : cleanVodEntityId(params.streamId, pl);

  const itemKey = buildVodProgressKey({
    mediaType: params.mediaType,
    playlistId: pl,
    streamId: params.streamId,
    seriesId: sid,
    episodeId: epId
  });

  const store = readStore();
  if (itemKey && store.byKey[itemKey]) {
    delete store.byKey[itemKey];
  }
  clearLegacyProgressKeys(params.streamId ?? params.episodeId, params.legacyEpisodeIndex, epId);
  if (params.mediaType === 'series' && sid) {
    rebuildSeriesLatestPointer(store, pl, sid);
  }
  writeStore(store, true);
};

export const getSeriesLastUnfinishedEpisode = (
  playlistId?: string | null,
  seriesId?: any
): SeriesResumePointer | null => {
  const pl = normalizePlaylistId(playlistId);
  const sid = cleanVodEntityId(seriesId, pl);
  if (!sid) return null;

  const store = readStore();
  const ptr = store.seriesLatest[`${pl}:${sid}`];
  if (ptr && ptr.positionSec >= MIN_RESUME_POSITION_SEC) {
    const rec = store.byKey[`ep:${pl}:${sid}:${ptr.episodeId}`];
    if (!rec || (!rec.completed && rec.positionSec >= MIN_RESUME_POSITION_SEC)) {
      return ptr;
    }
  }
  return null;
};

export const getSeriesEpisodesProgressMap = (
  playlistId?: string | null,
  seriesId?: any
): Record<string, VodProgressRecord> => {
  const pl = normalizePlaylistId(playlistId);
  const sid = cleanVodEntityId(seriesId, pl);
  if (!sid) return {};

  const store = readStore();
  const prefix = `ep:${pl}:${sid}:`;
  const map: Record<string, VodProgressRecord> = {};
  for (const key of Object.keys(store.byKey)) {
    if (key.startsWith(prefix)) {
      const rec = store.byKey[key];
      if (rec?.episodeId) {
        map[rec.episodeId] = rec;
      }
    }
  }
  return map;
};

export const getContinueWatchingItems = (
  mediaType: VodProgressMediaType,
  playlistId?: string | null,
  fallbackItems?: any[]
): any[] => {
  const pl = normalizePlaylistId(playlistId);
  const store = readStore();

  const fallbackById = new Map<string, any>();
  if (Array.isArray(fallbackItems)) {
    for (const item of fallbackItems) {
      const fid = cleanVodEntityId(
        mediaType === 'series' ? (item?.series_id || item?.stream_id || item?.id) : (item?.stream_id || item?.id),
        pl
      );
      if (fid && !fallbackById.has(fid)) {
        fallbackById.set(fid, item);
      }
    }
  }

  if (mediaType === 'movie') {
    const records: VodProgressRecord[] = [];
    for (const key of Object.keys(store.byKey)) {
      const rec = store.byKey[key];
      if (
        rec &&
        rec.mediaType === 'movie' &&
        rec.playlistId === pl &&
        !rec.completed &&
        rec.positionSec >= MIN_RESUME_POSITION_SEC
      ) {
        records.push(rec);
      }
    }
    records.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));

    return records
      .map((rec) => {
        const cleanId = cleanVodEntityId(rec.episodeId || rec.itemKey.split(':').slice(2).join(':'), pl);
        const fb = fallbackById.get(cleanId);
        const name = rec.mediaTitle || fb?.name || rec.episodeTitle || cleanId;
        const icon = rec.streamIcon || fb?.stream_icon || fb?.cover || fb?.logo;
        const url = rec.mediaUrl || fb?.url || '';
        if (!cleanId || (!name && !url)) return null;
        return {
          ...(fb || {}),
          stream_id: cleanId,
          name,
          stream_icon: icon,
          cover: icon,
          logo: icon,
          url,
          category_id: rec.categoryId || fb?.category_id || '',
          category_name: rec.categoryName || fb?.category_name || '',
          container_extension: rec.containerExtension || fb?.container_extension || 'mp4',
          rating: rec.rating || fb?.rating,
          releaseDate: rec.releaseDate || fb?.releaseDate,
          duration: rec.durationLabel || fb?.duration,
          type: 'movie' as const,
          progressPositionSec: rec.positionSec,
          progressDurationSec: rec.durationSec,
          progressUpdatedAt: rec.updatedAt
        };
      })
      .filter(Boolean);
  }

  // Series: show one entry per series pointing to its latest unfinished episode
  const latestBySeries = new Map<string, SeriesResumePointer>();
  for (const key of Object.keys(store.byKey)) {
    const rec = store.byKey[key];
    if (
      rec &&
      rec.mediaType === 'series' &&
      rec.playlistId === pl &&
      rec.seriesId &&
      rec.seriesId !== 'series' &&
      !rec.completed &&
      rec.positionSec >= MIN_RESUME_POSITION_SEC
    ) {
      const existing = latestBySeries.get(rec.seriesId);
      const storedPtr = store.seriesLatest[`${pl}:${rec.seriesId}`];
      const matchesStoredPtr = Boolean(storedPtr && storedPtr.episodeId === (rec.episodeId || ''));
      const existingMatchesStored = Boolean(existing && storedPtr && storedPtr.episodeId === (existing.episodeId || ''));
      if (
        !existing ||
        rec.updatedAt > existing.updatedAt ||
        (rec.updatedAt === existing.updatedAt && !existingMatchesStored && (matchesStoredPtr || true))
      ) {
        latestBySeries.set(rec.seriesId, {
          playlistId: pl,
          seriesId: rec.seriesId,
          episodeId: rec.episodeId || '',
          seasonNum: rec.seasonNum || 1,
          episodeNum: rec.episodeNum || 1,
          episodeTitle: rec.episodeTitle || '',
          positionSec: rec.positionSec,
          durationSec: rec.durationSec,
          updatedAt: rec.updatedAt,
          mediaTitle: rec.mediaTitle,
          streamIcon: rec.streamIcon,
          categoryId: rec.categoryId,
          categoryName: rec.categoryName,
          mediaUrl: rec.mediaUrl,
          containerExtension: rec.containerExtension,
          rating: rec.rating,
          releaseDate: rec.releaseDate,
          durationLabel: rec.durationLabel
        });
      }
    }
  }

  const ptrs = Array.from(latestBySeries.values()).sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  return ptrs
    .map((ptr) => {
      const cleanSid = cleanVodEntityId(ptr.seriesId, pl);
      const fb = fallbackById.get(cleanSid);
      const storedPtr = store.seriesLatest[`${pl}:${cleanSid}`];
      const name = ptr.mediaTitle || storedPtr?.mediaTitle || fb?.name || cleanSid;
      const icon = ptr.streamIcon || storedPtr?.streamIcon || fb?.stream_icon || fb?.cover || fb?.logo;
      const url = ptr.mediaUrl || storedPtr?.mediaUrl || fb?.url || '';
      if (!cleanSid) return null;
      return {
        ...(fb || {}),
        stream_id: cleanSid,
        series_id: cleanSid,
        name,
        stream_icon: icon,
        cover: icon,
        logo: icon,
        url,
        category_id: ptr.categoryId || storedPtr?.categoryId || fb?.category_id || '',
        category_name: ptr.categoryName || storedPtr?.categoryName || fb?.category_name || '',
        container_extension: ptr.containerExtension || storedPtr?.containerExtension || fb?.container_extension || 'mp4',
        rating: ptr.rating || storedPtr?.rating || fb?.rating,
        releaseDate: ptr.releaseDate || storedPtr?.releaseDate || fb?.releaseDate,
        duration: ptr.durationLabel || storedPtr?.durationLabel || fb?.duration,
        type: 'series' as const,
        progressPositionSec: ptr.positionSec,
        progressDurationSec: ptr.durationSec,
        progressSeasonNum: ptr.seasonNum,
        progressEpisodeNum: ptr.episodeNum,
        progressUpdatedAt: ptr.updatedAt
      };
    })
    .filter(Boolean);
};

export const formatPlaybackClock = (seconds: number): string => {
  if (!Number.isFinite(seconds) || seconds < 0) return '00:00';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const pad = (n: number) => String(n).padStart(2, '0');
  if (hrs > 0) return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
  return `${pad(mins)}:${pad(secs)}`;
};
