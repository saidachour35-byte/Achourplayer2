import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

const STORAGE_KEY_PREFIX = 'achour_favorites_pl_';
const VOD_STORAGE_KEY_PREFIX = 'achour_vod_favorites_';

const dedupeIds = (list: any): string[] => {
  if (!Array.isArray(list)) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (let i = 0; i < list.length; i++) {
    const val = String(list[i] ?? '').trim();
    if (val && !seen.has(val)) {
      seen.add(val);
      out.push(val);
    }
  }
  return out;
};

export const getLocalFavoriteIds = (playlistId?: string): string[] => {
  try {
    const key = playlistId ? `${STORAGE_KEY_PREFIX}${playlistId}` : 'achour_favorites';
    const saved = localStorage.getItem(key);
    if (saved) return dedupeIds(JSON.parse(saved));
    // Backward compatibility fallback for legacy global 'achour_favorites' if playlist-specific key is empty
    if (playlistId) {
      const legacy = localStorage.getItem('achour_favorites');
      if (legacy) return dedupeIds(JSON.parse(legacy));
    }
    return [];
  } catch (e) {
    return [];
  }
};

export const getLocalVodFavoriteIds = (mediaType: 'movie' | 'series', playlistId?: string): string[] => {
  try {
    const key = playlistId ? `${VOD_STORAGE_KEY_PREFIX}${playlistId}_${mediaType}` : `${VOD_STORAGE_KEY_PREFIX}${mediaType}`;
    const saved = localStorage.getItem(key);
    if (saved) return dedupeIds(JSON.parse(saved));
    if (playlistId) {
      const legacy = localStorage.getItem(`${VOD_STORAGE_KEY_PREFIX}${mediaType}`);
      if (legacy) return dedupeIds(JSON.parse(legacy));
    }
    return [];
  } catch (e) {
    return [];
  }
};

export const toggleVodFavorite = (mediaType: 'movie' | 'series', streamId: string, playlistId?: string): string[] => {
  const cleanId = String(streamId || '').trim();
  const current = getLocalVodFavoriteIds(mediaType, playlistId);
  if (!cleanId) return current;
  const isFav = current.includes(cleanId);
  const next = isFav ? current.filter(id => id !== cleanId) : dedupeIds([...current, cleanId]);
  try {
    const key = playlistId ? `${VOD_STORAGE_KEY_PREFIX}${playlistId}_${mediaType}` : `${VOD_STORAGE_KEY_PREFIX}${mediaType}`;
    localStorage.setItem(key, JSON.stringify(next));
  } catch (e) {}
  return next;
};

export const syncFavoritesFromFirestore = async (userId: string, playlistId?: string): Promise<string[]> => {
  if (!userId) return getLocalFavoriteIds(playlistId);
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      const data = userDoc.data();
      const favMap = data.playlistFavorites || {};
      const favs = playlistId && Array.isArray(favMap[playlistId])
        ? dedupeIds(favMap[playlistId])
        : dedupeIds(data.favorites || []);
      const key = playlistId ? `${STORAGE_KEY_PREFIX}${playlistId}` : 'achour_favorites';
      localStorage.setItem(key, JSON.stringify(favs));
      return favs;
    }
  } catch (e) {
    console.warn('Failed to sync favorites from Firestore:', e);
  }
  return getLocalFavoriteIds(playlistId);
};

export const toggleFavorite = async (userId: string, streamId: string, playlistId?: string, metadata?: any): Promise<boolean> => {
  const cleanId = String(streamId || '').trim();
  if (!cleanId) return false;
  const current = getLocalFavoriteIds(playlistId);
  const isFav = current.includes(cleanId);
  const next = isFav ? current.filter(id => id !== cleanId) : dedupeIds([...current, cleanId]);
  
  const key = playlistId ? `${STORAGE_KEY_PREFIX}${playlistId}` : 'achour_favorites';
  localStorage.setItem(key, JSON.stringify(next));
  
  if (userId) {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      const existingData = userSnap.exists() ? userSnap.data() : {};
      const playlistFavorites = existingData.playlistFavorites || {};
      if (playlistId) {
        playlistFavorites[playlistId] = next;
      }
      await setDoc(userRef, { 
        favorites: next,
        playlistFavorites
      }, { merge: true });
    } catch (e) {
      console.error('Failed to update favorites in Firestore:', e);
    }
  }
  
  return !isFav;
};

export const subscribeFavorites = (userId: string | null | undefined, playlistId?: string, callback?: (ids: string[]) => void) => {
  const cb = callback || (() => {});
  if (!userId) {
    const local = getLocalFavoriteIds(playlistId);
    cb(local);
    return () => {};
  }
  return onSnapshot(doc(db, 'users', userId), (doc) => {
    if (doc.exists()) {
      const data = doc.data();
      const favMap = data.playlistFavorites || {};
      const favs = playlistId && Array.isArray(favMap[playlistId])
        ? dedupeIds(favMap[playlistId])
        : dedupeIds(data.favorites || []);
      const key = playlistId ? `${STORAGE_KEY_PREFIX}${playlistId}` : 'achour_favorites';
      localStorage.setItem(key, JSON.stringify(favs));
      cb(favs);
    }
  });
};

