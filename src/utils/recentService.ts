
const STORAGE_KEY = 'achour_recents';
const MAX_RECENTS = 50;

let recentsCache: any[] | null = null;
let flushTimer: ReturnType<typeof setTimeout> | null = null;

const readRecentsFromStorage = (): any[] => {
  if (recentsCache !== null) return recentsCache;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    recentsCache = saved ? JSON.parse(saved) : [];
    if (!Array.isArray(recentsCache)) recentsCache = [];
  } catch {
    recentsCache = [];
  }
  return recentsCache;
};

export const getRecents = (): any[] => {
  return readRecentsFromStorage();
};

export const addToRecents = (item: any) => {
  if (!item || !item.stream_id) return;
  const current = readRecentsFromStorage();
  const compactItem = {
    stream_id: item.stream_id,
    id: item.id || item.stream_id,
    name: item.name,
    stream_icon: item.stream_icon || item.logo || item.cover,
    url: item.url,
    category_id: item.category_id,
    category_name: item.category_name,
    type: item.type,
    container_extension: item.container_extension,
  };
  const filtered = current.filter(i => i.stream_id !== item.stream_id);
  recentsCache = [compactItem, ...filtered].slice(0, MAX_RECENTS);

  if (flushTimer) clearTimeout(flushTimer);
  flushTimer = setTimeout(() => {
    flushTimer = null;
    try {
      if (recentsCache) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(recentsCache));
      }
    } catch {
      // ignore quota errors
    }
  }, 200);
};
