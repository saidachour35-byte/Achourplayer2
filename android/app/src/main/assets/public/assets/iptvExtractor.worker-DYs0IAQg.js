(function() {
  "use strict";
  const instanceOfAny = (object, constructors) => constructors.some((c) => object instanceof c);
  let idbProxyableTypes;
  let cursorAdvanceMethods;
  function getIdbProxyableTypes() {
    return idbProxyableTypes || (idbProxyableTypes = [
      IDBIndex,
      IDBObjectStore,
      IDBCursor,
      IDBDatabase,
      IDBTransaction
    ]);
  }
  function getCursorAdvanceMethods() {
    return cursorAdvanceMethods || (cursorAdvanceMethods = ["advance", "continue", "continuePrimaryKey"].map((method) => IDBCursor.prototype[method]));
  }
  const transactionDoneMap = /* @__PURE__ */ new WeakMap();
  const transformCache = /* @__PURE__ */ new WeakMap();
  const reverseTransformCache = /* @__PURE__ */ new WeakMap();
  function promisifyRequest(request) {
    const promise = new Promise((resolve, reject) => {
      const unlisten = () => {
        request.removeEventListener("success", success);
        request.removeEventListener("error", error);
      };
      const success = () => {
        resolve(wrap(request.result));
        unlisten();
      };
      const error = () => {
        reject(request.error);
        unlisten();
      };
      request.addEventListener("success", success);
      request.addEventListener("error", error);
    });
    reverseTransformCache.set(promise, request);
    return promise;
  }
  function cacheDonePromiseForTransaction(tx) {
    if (transactionDoneMap.has(tx))
      return;
    const done = new Promise((resolve, reject) => {
      const unlisten = () => {
        tx.removeEventListener("complete", complete);
        tx.removeEventListener("error", error);
        tx.removeEventListener("abort", error);
      };
      const complete = () => {
        resolve();
        unlisten();
      };
      const error = () => {
        reject(tx.error || new DOMException("AbortError", "AbortError"));
        unlisten();
      };
      tx.addEventListener("complete", complete);
      tx.addEventListener("error", error);
      tx.addEventListener("abort", error);
    });
    transactionDoneMap.set(tx, done);
  }
  let idbProxyTraps = {
    get(target, prop, receiver) {
      if (target instanceof IDBTransaction) {
        if (prop === "done")
          return transactionDoneMap.get(target);
        if (prop === "store") {
          return receiver.objectStoreNames[1] ? void 0 : receiver.objectStore(receiver.objectStoreNames[0]);
        }
      }
      return wrap(target[prop]);
    },
    set(target, prop, value) {
      target[prop] = value;
      return true;
    },
    has(target, prop) {
      if (target instanceof IDBTransaction && (prop === "done" || prop === "store")) {
        return true;
      }
      return prop in target;
    }
  };
  function replaceTraps(callback) {
    idbProxyTraps = callback(idbProxyTraps);
  }
  function wrapFunction(func) {
    if (getCursorAdvanceMethods().includes(func)) {
      return function(...args) {
        func.apply(unwrap(this), args);
        return wrap(this.request);
      };
    }
    return function(...args) {
      return wrap(func.apply(unwrap(this), args));
    };
  }
  function transformCachableValue(value) {
    if (typeof value === "function")
      return wrapFunction(value);
    if (value instanceof IDBTransaction)
      cacheDonePromiseForTransaction(value);
    if (instanceOfAny(value, getIdbProxyableTypes()))
      return new Proxy(value, idbProxyTraps);
    return value;
  }
  function wrap(value) {
    if (value instanceof IDBRequest)
      return promisifyRequest(value);
    if (transformCache.has(value))
      return transformCache.get(value);
    const newValue = transformCachableValue(value);
    if (!Object.is(newValue, value)) {
      transformCache.set(value, newValue);
      reverseTransformCache.set(newValue, value);
    }
    return newValue;
  }
  const unwrap = (value) => reverseTransformCache.get(value);
  function openDB(name, version, { blocked, upgrade, blocking, terminated } = {}) {
    const request = indexedDB.open(name, version);
    const openPromise = wrap(request);
    if (upgrade) {
      request.addEventListener("upgradeneeded", (event) => {
        upgrade(wrap(request.result), event.oldVersion, event.newVersion, wrap(request.transaction), event);
      });
    }
    if (blocked) {
      request.addEventListener("blocked", (event) => blocked(
        // Casting due to https://github.com/microsoft/TypeScript-DOM-lib-generator/pull/1405
        event.oldVersion,
        event.newVersion,
        event
      ));
    }
    openPromise.then((db) => {
      if (terminated)
        db.addEventListener("close", () => terminated());
      if (blocking) {
        db.addEventListener("versionchange", (event) => blocking(event.oldVersion, event.newVersion, event));
      }
    }).catch(() => {
    });
    return openPromise;
  }
  const readMethods = ["get", "getKey", "getAll", "getAllKeys", "count"];
  const writeMethods = ["put", "add", "delete", "clear"];
  const cachedMethods = {};
  function getMethod(target, prop) {
    if (!(target instanceof IDBDatabase && !(prop in target) && typeof prop === "string")) {
      return;
    }
    if (cachedMethods[prop])
      return cachedMethods[prop];
    const targetFuncName = prop.replace(/FromIndex$/, "");
    const useIndex = prop !== targetFuncName;
    const isWrite = writeMethods.includes(targetFuncName);
    if (
      // Bail if the target doesn't exist on the target. Eg, getAll isn't in Edge.
      !(targetFuncName in (useIndex ? IDBIndex : IDBObjectStore).prototype) || !(isWrite || readMethods.includes(targetFuncName))
    ) {
      return;
    }
    const method = async function(storeName, ...args) {
      const tx = this.transaction(storeName, isWrite ? "readwrite" : "readonly");
      let target2 = tx.store;
      if (useIndex)
        target2 = target2.index(args.shift());
      return (await Promise.all([
        target2[targetFuncName](...args),
        isWrite && tx.done
      ]))[0];
    };
    return cachedMethods[prop] = method;
  }
  replaceTraps((oldTraps) => ({
    ...oldTraps,
    get: (target, prop, receiver) => getMethod(target, prop) || oldTraps.get(target, prop, receiver),
    has: (target, prop) => !!getMethod(target, prop) || oldTraps.has(target, prop)
  }));
  const advanceMethodProps = ["advance", "continue", "continuePrimaryKey"];
  const methodMap = {};
  const advanceResults = /* @__PURE__ */ new WeakMap();
  const ittrProxiedCursorToOriginalProxy = /* @__PURE__ */ new WeakMap();
  const cursorIteratorTraps = {
    get(target, prop) {
      if (!advanceMethodProps.includes(prop))
        return target[prop];
      let cachedFunc = methodMap[prop];
      if (!cachedFunc) {
        cachedFunc = methodMap[prop] = function(...args) {
          advanceResults.set(this, ittrProxiedCursorToOriginalProxy.get(this)[prop](...args));
        };
      }
      return cachedFunc;
    }
  };
  async function* iterate(...args) {
    let cursor = this;
    if (!(cursor instanceof IDBCursor)) {
      cursor = await cursor.openCursor(...args);
    }
    if (!cursor)
      return;
    cursor = cursor;
    const proxiedCursor = new Proxy(cursor, cursorIteratorTraps);
    ittrProxiedCursorToOriginalProxy.set(proxiedCursor, cursor);
    reverseTransformCache.set(proxiedCursor, unwrap(cursor));
    while (cursor) {
      yield proxiedCursor;
      cursor = await (advanceResults.get(proxiedCursor) || cursor.continue());
      advanceResults.delete(proxiedCursor);
    }
  }
  function isIteratorProp(target, prop) {
    return prop === Symbol.asyncIterator && instanceOfAny(target, [IDBIndex, IDBObjectStore, IDBCursor]) || prop === "iterate" && instanceOfAny(target, [IDBIndex, IDBObjectStore]);
  }
  replaceTraps((oldTraps) => ({
    ...oldTraps,
    get(target, prop, receiver) {
      if (isIteratorProp(target, prop))
        return iterate;
      return oldTraps.get(target, prop, receiver);
    },
    has(target, prop) {
      return isIteratorProp(target, prop) || oldTraps.has(target, prop);
    }
  }));
  const DB_NAME = "AchourPlayerDB";
  const DB_VERSION = 6;
  const BUCKET_MAX_ITEMS = 2e3;
  const yieldToMain = () => new Promise((resolve) => setTimeout(resolve, 0));
  const sortByOrderIndex = (items, inPlace = false) => {
    var _a;
    if (!items || items.length <= 1) return items || [];
    let hasOrderIndex = false;
    for (let i = 0; i < Math.min(items.length, 20); i++) {
      if (typeof ((_a = items[i]) == null ? void 0 : _a.orderIndex) === "number") {
        hasOrderIndex = true;
        break;
      }
    }
    if (!hasOrderIndex) return items;
    const target = inPlace ? items : items.slice();
    return target.sort((a, b) => {
      const oa = typeof a.orderIndex === "number" ? a.orderIndex : Number.MAX_SAFE_INTEGER;
      const ob = typeof b.orderIndex === "number" ? b.orderIndex : Number.MAX_SAFE_INTEGER;
      return oa - ob;
    });
  };
  const xtreamConfigMemCache = /* @__PURE__ */ new Map();
  const packCompactChannel = (ch, fallbackOrder, type, xtreamCfg) => {
    const rawStreamId = String(ch.stream_id || ch.series_id || ch.id || fallbackOrder);
    const cleanStreamId = rawStreamId.replace(/\.(m3u8|ts|mp4|mkv|avi|flv)$/i, "");
    const orderIdx = typeof ch.orderIndex === "number" ? ch.orderIndex : fallbackOrder;
    const ext = ch.container_extension || (type === "live" ? "m3u8" : type === "movie" ? "mp4" : void 0);
    const defaultExt = type === "live" ? "m3u8" : "mp4";
    const rec = {
      s: cleanStreamId,
      n: typeof ch.name === "string" && ch.name ? ch.name : `${type} ${orderIdx + 1}`,
      o: orderIdx
    };
    const logo = ch.logo || ch.stream_icon || ch.cover;
    if (logo && typeof logo === "string") rec.l = logo;
    if (ext && ext !== defaultExt) rec.e = ext;
    const epgId = ch.epg_channel_id ? String(ch.epg_channel_id) : void 0;
    const tvgId = ch.tvg_id ? String(ch.tvg_id) : void 0;
    if (epgId) rec.g = epgId;
    if (tvgId && tvgId !== epgId) rec.t = tvgId;
    if (ch.num !== void 0 && ch.num !== null && ch.num !== orderIdx + 1) {
      const nVal = Number(ch.num);
      if (!Number.isNaN(nVal)) rec.m = nVal;
    }
    const rawUrl = ch.url || ch.direct_source || ch.stream_url;
    if (rawUrl && typeof rawUrl === "string") {
      if (xtreamCfg && type !== "series" && rawUrl === `${xtreamCfg.cleanHost}/${type}/${xtreamCfg.encodedUser}/${xtreamCfg.encodedPass}/${cleanStreamId}.${ext || defaultExt}`) ;
      else {
        rec.u = rawUrl;
      }
    }
    if (ch.isRadio) rec.r = 1;
    const catName = ch.category || ch.category_name;
    if (catName && catName !== ch.category_id) rec.cn = catName;
    if (ch.plot) rec.pl = ch.plot;
    if (ch.cast) rec.ct = ch.cast;
    if (ch.director) rec.dr = ch.director;
    if (ch.genre) rec.gn = ch.genre;
    if (ch.rating !== void 0 && ch.rating !== null && ch.rating !== "") rec.rt = ch.rating;
    if (ch.releaseDate) rec.rd = String(ch.releaseDate);
    if (ch.duration) rec.du = String(ch.duration);
    return rec;
  };
  let cachedDbPromise = null;
  const initDB = async () => {
    if (cachedDbPromise) {
      try {
        return await cachedDbPromise;
      } catch {
        cachedDbPromise = null;
      }
    }
    const openPromise = (async () => {
      try {
        const db = await openDB(DB_NAME, DB_VERSION, {
          upgrade(db2, oldVersion, _newVersion, transaction) {
            if (!db2.objectStoreNames.contains("channels")) {
              const store = db2.createObjectStore("channels", { keyPath: "id" });
              store.createIndex("category_id", "category_id");
              store.createIndex("type", "type");
              store.createIndex("playlist_id", "playlist_id");
              store.createIndex("playlist_type", ["playlist_id", "type"]);
              store.createIndex("playlist_type_category", ["playlist_id", "type", "category_id"]);
              store.createIndex("stream_id", "stream_id");
            } else if (oldVersion < 5) {
              const store = transaction.objectStore("channels");
              if (!store.indexNames.contains("playlist_type_category")) {
                store.createIndex("playlist_type_category", ["playlist_id", "type", "category_id"]);
              }
              if (!store.indexNames.contains("playlist_type")) {
                store.createIndex("playlist_type", ["playlist_id", "type"]);
              }
            }
            if (!db2.objectStoreNames.contains("channel_buckets")) {
              db2.createObjectStore("channel_buckets", { keyPath: "id" });
            }
            if (!db2.objectStoreNames.contains("categories")) {
              const store = db2.createObjectStore("categories", { keyPath: "id" });
              store.createIndex("type", "type");
              store.createIndex("playlist_id", "playlist_id");
              store.createIndex("playlist_type", ["playlist_id", "type"]);
            }
            if (!db2.objectStoreNames.contains("metadata")) {
              db2.createObjectStore("metadata", { keyPath: "id" });
            }
            if (!db2.objectStoreNames.contains("episodes")) {
              const store = db2.createObjectStore("episodes", { keyPath: "id" });
              store.createIndex("series_id", "series_id");
              store.createIndex("playlist_id", "playlist_id");
              store.createIndex("playlist_series", ["playlist_id", "series_id"]);
            }
          },
          blocked() {
            cachedDbPromise = null;
          },
          terminated() {
            cachedDbPromise = null;
          }
        });
        return db;
      } catch (err) {
        cachedDbPromise = null;
        console.warn("DB init error, attempting safe recovery without clearing user preferences:", err);
        try {
          indexedDB.deleteDatabase(DB_NAME);
        } catch (e) {
        }
        return openDB(DB_NAME, 1, {
          upgrade(db) {
            const cStore = db.createObjectStore("channels", { keyPath: "id" });
            cStore.createIndex("playlist_type", ["playlist_id", "type"]);
            cStore.createIndex("playlist_type_category", ["playlist_id", "type", "category_id"]);
            cStore.createIndex("category_id", "category_id");
            cStore.createIndex("type", "type");
            cStore.createIndex("playlist_id", "playlist_id");
            db.createObjectStore("channel_buckets", { keyPath: "id" });
            const catStore = db.createObjectStore("categories", { keyPath: "id" });
            catStore.createIndex("playlist_type", ["playlist_id", "type"]);
            catStore.createIndex("type", "type");
            catStore.createIndex("playlist_id", "playlist_id");
            db.createObjectStore("metadata", { keyPath: "id" });
            const epStore = db.createObjectStore("episodes", { keyPath: "id" });
            epStore.createIndex("playlist_series", ["playlist_id", "series_id"]);
          }
        });
      }
    })();
    cachedDbPromise = openPromise;
    return openPromise;
  };
  const saveXtreamPlaylistConfig = async (playlistId, config) => {
    const rec = { id: `xtream_cfg_${playlistId}`, ...config };
    xtreamConfigMemCache.set(playlistId, rec);
    try {
      const db = await initDB();
      await db.put("metadata", rec);
    } catch {
    }
  };
  const getXtreamPlaylistConfig = async (playlistId) => {
    if (!playlistId) return null;
    if (xtreamConfigMemCache.has(playlistId)) {
      return xtreamConfigMemCache.get(playlistId) || null;
    }
    try {
      const db = await initDB();
      const rec = await db.get("metadata", `xtream_cfg_${playlistId}`);
      const resolved = rec || null;
      xtreamConfigMemCache.set(playlistId, resolved);
      return resolved;
    } catch {
      return null;
    }
  };
  const setPlaylistExtractionStatus = async (playlistId, status) => {
    try {
      const db = await initDB();
      const existing = await db.get("metadata", `extraction_${playlistId}`);
      await db.put("metadata", {
        ...existing || {},
        ...status,
        id: `extraction_${playlistId}`,
        updatedAt: Date.now()
      });
    } catch (e) {
      console.error("Error saving extraction status:", e);
    }
  };
  let globalBucketSeq = Math.floor(Date.now() % 1e6 * 100);
  const nextBucketShard = (seqRef) => {
    const val = seqRef ? seqRef.current++ : globalBucketSeq++;
    return String(val).padStart(9, "0");
  };
  const saveCategoryBucketsBatch = async (playlistId, type, groupedByCategory, signal, bucketSeqRef) => {
    if (signal == null ? void 0 : signal.aborted) {
      throw new DOMException("Extraction aborted by user", "AbortError");
    }
    if (!groupedByCategory || groupedByCategory.size === 0) return 0;
    const db = await initDB();
    const tx = db.transaction("channel_buckets", "readwrite");
    const store = tx.objectStore("channel_buckets");
    let writtenItems = 0;
    for (const [catId, list] of groupedByCategory.entries()) {
      if (!list || list.length === 0) continue;
      const cleanCat = String(catId || "general");
      for (let i = 0; i < list.length; i += BUCKET_MAX_ITEMS) {
        const slice = i === 0 && list.length <= BUCKET_MAX_ITEMS ? list : list.slice(i, i + BUCKET_MAX_ITEMS);
        const shard = nextBucketShard(bucketSeqRef);
        const bucket = {
          id: `${playlistId}\0${type}\0${cleanCat}\0${shard}`,
          playlist_id: playlistId,
          type,
          category_id: cleanCat,
          items: slice
        };
        store.put(bucket);
        writtenItems += slice.length;
      }
    }
    await tx.done;
    invalidatePlaylistQueryCache(playlistId, type);
    return writtenItems;
  };
  const saveCategories = async (categories, type, playlistId, options) => {
    var _a;
    if (!categories || categories.length === 0) return;
    const BATCH_SIZE = Math.max(200, Math.min(5e3, options == null ? void 0 : options.batchSize));
    const baseOrder = (options == null ? void 0 : options.startOrderIndex) ?? 0;
    try {
      const db = await initDB();
      for (let i = 0; i < categories.length; i += BATCH_SIZE) {
        if ((_a = options == null ? void 0 : options.signal) == null ? void 0 : _a.aborted) {
          throw new DOMException("Extraction aborted by user", "AbortError");
        }
        const end = Math.min(i + BATCH_SIZE, categories.length);
        const tx = db.transaction("categories", "readwrite");
        const store = tx.objectStore("categories");
        for (let j = i; j < end; j++) {
          const cat = categories[j];
          const catId = String(cat.category_id || cat.id || cat.category_name || `${baseOrder + j}`);
          store.put({
            ...cat,
            id: `${playlistId}_${type}_${catId}`,
            category_id: catId,
            playlist_id: playlistId,
            type,
            orderIndex: typeof cat.orderIndex === "number" ? cat.orderIndex : baseOrder + j
          });
        }
        await tx.done;
        if (end < categories.length) {
          await yieldToMain();
        }
      }
    } catch (e) {
      if ((e == null ? void 0 : e.name) !== "AbortError") {
        console.error("Error in saveCategories:", e);
      }
      throw e;
    }
  };
  const saveStreamingBatch = async (playlistId, batch, signal, bucketSeqRef) => {
    if (signal == null ? void 0 : signal.aborted) {
      throw new DOMException("Extraction aborted by user", "AbortError");
    }
    const hasCats = batch.newCategories.length > 0;
    const hasChannels = batch.live.length > 0 || batch.movie.length > 0 || batch.series.length > 0;
    if (!hasCats && !hasChannels) return;
    try {
      const xtreamCfg = await getXtreamPlaylistConfig(playlistId);
      const db = await initDB();
      const stores = [];
      if (hasChannels) stores.push("channel_buckets");
      if (hasCats) stores.push("categories");
      const tx = db.transaction(stores, "readwrite");
      if (hasCats) {
        const catStore = tx.objectStore("categories");
        for (let i = 0; i < batch.newCategories.length; i++) {
          const cat = batch.newCategories[i];
          const catId = String(cat.category_id || cat.category_name || `${i}`);
          catStore.put({
            ...cat,
            id: `${playlistId}_${cat.type}_${catId}`,
            category_id: catId,
            playlist_id: playlistId,
            type: cat.type,
            orderIndex: typeof cat.orderIndex === "number" ? cat.orderIndex : i
          });
        }
      }
      if (hasChannels) {
        const bucketStore = tx.objectStore("channel_buckets");
        const writeGroup = (list, type) => {
          const grouped = /* @__PURE__ */ new Map();
          for (let i = 0; i < list.length; i++) {
            const ch = list[i];
            const catId = String(ch.category_id || ch.category || "general");
            let arr = grouped.get(catId);
            if (!arr) {
              arr = [];
              grouped.set(catId, arr);
            }
            arr.push(packCompactChannel(ch, i, type, xtreamCfg));
          }
          for (const [catId, recs] of grouped.entries()) {
            for (let i = 0; i < recs.length; i += BUCKET_MAX_ITEMS) {
              const slice = i === 0 && recs.length <= BUCKET_MAX_ITEMS ? recs : recs.slice(i, i + BUCKET_MAX_ITEMS);
              bucketStore.put({
                id: `${playlistId}\0${type}\0${catId}\0${nextBucketShard(bucketSeqRef)}`,
                playlist_id: playlistId,
                type,
                category_id: catId,
                items: slice
              });
            }
          }
        };
        if (batch.live.length > 0) writeGroup(batch.live, "live");
        if (batch.movie.length > 0) writeGroup(batch.movie, "movie");
        if (batch.series.length > 0) writeGroup(batch.series, "series");
      }
      await tx.done;
      invalidatePlaylistQueryCache(playlistId);
    } catch (e) {
      if ((e == null ? void 0 : e.name) !== "AbortError") {
        console.error("Error in saveStreamingBatch:", e);
      }
      throw e;
    }
  };
  const channelsCategoryQueryCache = /* @__PURE__ */ new Map();
  let cachedQueryTotalItems = 0;
  const invalidatePlaylistQueryCache = (playlistId, type) => {
    const prefix = type ? `${playlistId}_${type}_` : `${playlistId}_`;
    for (const key of Array.from(channelsCategoryQueryCache.keys())) {
      if (key.startsWith(prefix)) {
        const existing = channelsCategoryQueryCache.get(key);
        if (existing) cachedQueryTotalItems = Math.max(0, cachedQueryTotalItems - existing.length);
        channelsCategoryQueryCache.delete(key);
      }
    }
  };
  const getCategoriesByPlaylistAndType = async (playlistId, type) => {
    if (!playlistId) return [];
    try {
      const db = await initDB();
      const index = db.transaction("categories", "readonly").objectStore("categories").index("playlist_type");
      const items = await index.getAll([playlistId, type]);
      return sortByOrderIndex(items || []);
    } catch (e) {
      console.error("Error in getCategoriesByPlaylistAndType:", e);
      return [];
    }
  };
  const clearPlaylistData = async (playlistId) => {
    try {
      const db = await initDB();
      const legacyRange = IDBKeyRange.bound(`${playlistId}_`, `${playlistId}_￿`);
      const bucketRange = IDBKeyRange.bound(`${playlistId}\0`, `${playlistId}\0￿`);
      const stores = [
        "channels",
        "categories",
        "episodes",
        "metadata"
      ];
      if (db.objectStoreNames.contains("channel_buckets")) {
        stores.unshift("channel_buckets");
      }
      const tx = db.transaction(stores, "readwrite");
      if (db.objectStoreNames.contains("channel_buckets")) {
        await tx.objectStore("channel_buckets").delete(bucketRange);
      }
      await tx.objectStore("channels").delete(legacyRange);
      await tx.objectStore("categories").delete(legacyRange);
      await tx.objectStore("episodes").delete(legacyRange);
      await tx.objectStore("metadata").delete(`extraction_${playlistId}`);
      await tx.objectStore("metadata").delete(`xtream_cfg_${playlistId}`);
      await tx.done;
      xtreamConfigMemCache.delete(playlistId);
      invalidatePlaylistQueryCache(playlistId);
    } catch (e) {
      console.error("Error clearing playlist data:", e);
    }
  };
  const CHAR_LBRACE = 123;
  const CHAR_RBRACE = 125;
  const CHAR_LBRACKET = 91;
  const CHAR_RBRACKET = 93;
  const CHAR_QUOTE = 34;
  const CHAR_BACKSLASH = 92;
  const CHAR_BOM = 65279;
  const CHAR_SPACE = 32;
  const CHAR_TAB = 9;
  const CHAR_LF = 10;
  const CHAR_CR = 13;
  const fastDecodeHtml = (str) => {
    if (!str) return "";
    if (str.indexOf("&") === -1) return str.trim();
    return str.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").trim();
  };
  const findUnquotedCommaIndex = (line) => {
    let inSingle = false;
    let inDouble = false;
    let lastCommaOutsideQuotes = -1;
    for (let i = 0; i < line.length; i++) {
      const ch = line.charCodeAt(i);
      if (ch === CHAR_BACKSLASH && (inSingle || inDouble)) {
        i++;
        continue;
      }
      if (ch === 34 && !inSingle) inDouble = !inDouble;
      else if (ch === 39 && !inDouble) inSingle = !inSingle;
      else if (ch === 44 && !inSingle && !inDouble) {
        lastCommaOutsideQuotes = i;
      }
    }
    return lastCommaOutsideQuotes;
  };
  class FastJsonObjectBatchScanner {
    constructor(batchSize = 600, skipItems = 0) {
      this.buffer = "";
      this.scanIdx = 0;
      this.started = false;
      this.ended = false;
      this.invalidNotArray = false;
      this.objStart = -1;
      this.objDepth = 0;
      this.inString = false;
      this.batchStarts = [];
      this.batchEnds = [];
      this.batchIndices = [];
      this.totalItems = 0;
      this.batchSize = Math.max(50, batchSize);
      this.skipItems = Math.max(0, skipItems);
    }
    flushPendingBatch(onBatch) {
      const count = this.batchStarts.length;
      if (count === 0) return 0;
      const firstStart = this.batchStarts[0];
      const lastEnd = this.batchEnds[count - 1];
      const slice = this.buffer.slice(firstStart, lastEnd + 1);
      const out = [];
      try {
        const arr = JSON.parse("[" + slice + "]");
        if (Array.isArray(arr) && arr.length === count) {
          for (let i = 0; i < count; i++) {
            const item = arr[i];
            if (item && typeof item === "object") {
              out.push({ item, index: this.batchIndices[i] });
            }
          }
        } else if (Array.isArray(arr)) {
          for (let i = 0; i < arr.length; i++) {
            const item = arr[i];
            if (item && typeof item === "object") {
              out.push({ item, index: this.batchIndices[Math.min(i, count - 1)] });
            }
          }
        }
      } catch {
        for (let i = 0; i < count; i++) {
          const objText = this.buffer.slice(this.batchStarts[i], this.batchEnds[i] + 1);
          try {
            const parsed = JSON.parse(objText);
            if (parsed && typeof parsed === "object") {
              out.push({ item: parsed, index: this.batchIndices[i] });
            }
          } catch {
          }
        }
      }
      this.batchStarts.length = 0;
      this.batchEnds.length = 0;
      this.batchIndices.length = 0;
      if (out.length > 0) {
        onBatch(out);
      }
      return lastEnd + 1;
    }
    feedChunk(chunk, onBatch) {
      if (!chunk || this.ended || this.invalidNotArray) return;
      this.buffer = this.buffer.length > 0 ? this.buffer + chunk : chunk;
      const len = this.buffer.length;
      let consumedUntil = 0;
      while (this.scanIdx < len) {
        if (!this.started) {
          const ch2 = this.buffer.charCodeAt(this.scanIdx);
          if (ch2 === CHAR_SPACE || ch2 === CHAR_TAB || ch2 === CHAR_LF || ch2 === CHAR_CR || ch2 === CHAR_BOM) {
            this.scanIdx++;
            continue;
          }
          if (ch2 === CHAR_LBRACKET) {
            this.started = true;
            this.scanIdx++;
            continue;
          }
          this.invalidNotArray = true;
          this.buffer = "";
          this.scanIdx = 0;
          return;
        }
        if (this.objStart === -1) {
          const ch2 = this.buffer.charCodeAt(this.scanIdx);
          if (ch2 === CHAR_LBRACE) {
            this.objStart = this.scanIdx;
            this.objDepth = 1;
            this.inString = false;
            this.scanIdx++;
            continue;
          }
          if (ch2 === CHAR_RBRACKET) {
            this.ended = true;
            this.scanIdx++;
            break;
          }
          this.scanIdx++;
          continue;
        }
        if (this.inString) {
          let searchPos = this.scanIdx;
          let closed = false;
          while (searchPos < len) {
            const quoteIdx = this.buffer.indexOf('"', searchPos);
            if (quoteIdx === -1) {
              this.scanIdx = len;
              break;
            }
            let bs = 0;
            let k = quoteIdx - 1;
            while (k >= this.objStart && this.buffer.charCodeAt(k) === CHAR_BACKSLASH) {
              bs++;
              k--;
            }
            if ((bs & 1) === 0) {
              this.inString = false;
              this.scanIdx = quoteIdx + 1;
              closed = true;
              break;
            }
            searchPos = quoteIdx + 1;
          }
          if (!closed) {
            this.scanIdx = len;
            break;
          }
          continue;
        }
        const ch = this.buffer.charCodeAt(this.scanIdx);
        if (ch === CHAR_QUOTE) {
          this.inString = true;
          this.scanIdx++;
        } else if (ch === CHAR_LBRACE) {
          this.objDepth++;
          this.scanIdx++;
        } else if (ch === CHAR_RBRACE) {
          this.objDepth--;
          if (this.objDepth === 0) {
            const itemIdx = this.totalItems++;
            if (itemIdx >= this.skipItems) {
              this.batchStarts.push(this.objStart);
              this.batchEnds.push(this.scanIdx);
              this.batchIndices.push(itemIdx);
              if (this.batchStarts.length >= this.batchSize) {
                consumedUntil = this.flushPendingBatch(onBatch);
              }
            } else {
              consumedUntil = this.scanIdx + 1;
            }
            this.objStart = -1;
          }
          this.scanIdx++;
        } else {
          this.scanIdx++;
        }
      }
      const keepFrom = this.batchStarts.length > 0 ? this.batchStarts[0] : this.objStart !== -1 ? this.objStart : Math.max(consumedUntil, this.scanIdx);
      if (keepFrom > 0) {
        if (keepFrom >= this.buffer.length) {
          this.buffer = "";
          this.scanIdx = 0;
          if (this.objStart !== -1) this.objStart = 0;
        } else {
          this.buffer = this.buffer.slice(keepFrom);
          this.scanIdx -= keepFrom;
          if (this.objStart !== -1) this.objStart -= keepFrom;
          for (let i = 0; i < this.batchStarts.length; i++) {
            this.batchStarts[i] -= keepFrom;
            this.batchEnds[i] -= keepFrom;
          }
        }
      }
    }
    finish(onBatch) {
      if (this.batchStarts.length > 0) {
        this.flushPendingBatch(onBatch);
      }
      this.buffer = "";
      this.scanIdx = 0;
    }
  }
  const resolveCompactName = (s, fallback) => {
    const raw = (typeof s.name === "string" && s.name.length > 0 ? s.name : null) || (typeof s.stream_display_name === "string" && s.stream_display_name.length > 0 ? s.stream_display_name : null) || (typeof s.title === "string" && s.title.length > 0 ? s.title : null) || (typeof s.tvg_name === "string" && s.tvg_name.length > 0 ? s.tvg_name : null) || (typeof s.channel_name === "string" && s.channel_name.length > 0 ? s.channel_name : null);
    return raw ? fastDecodeHtml(raw) : fallback;
  };
  const mapXtreamItemToCompact = (s, idx, type, cleanHost, encodedUser, encodedPass) => {
    const rawStreamId = String(
      type === "series" ? s.series_id ?? s.id ?? idx : s.stream_id ?? s.id ?? idx
    );
    let cleanStreamId = rawStreamId;
    const dotIdx = rawStreamId.lastIndexOf(".");
    if (dotIdx > 0) {
      const tail = rawStreamId.slice(dotIdx + 1).toLowerCase();
      if (tail === "m3u8" || tail === "ts" || tail === "mp4" || tail === "mkv" || tail === "avi" || tail === "flv") {
        cleanStreamId = rawStreamId.slice(0, dotIdx);
      }
    }
    const categoryId = String(s.category_id || "general");
    const fallbackName = type === "live" ? `Live ${idx + 1}` : type === "movie" ? `Movie ${idx + 1}` : `Series ${idx + 1}`;
    const name = resolveCompactName(s, fallbackName);
    const rec = {
      s: cleanStreamId,
      n: name,
      o: idx
    };
    const logo = s.stream_icon || s.cover || s.logo;
    if (logo && typeof logo === "string") rec.l = logo;
    if (type !== "series") {
      const defaultExt = type === "live" ? "m3u8" : "mp4";
      const ext = s.container_extension || defaultExt;
      if (ext !== defaultExt) rec.e = ext;
      const customUrl = s.url || s.direct_source;
      if (customUrl && typeof customUrl === "string" && customUrl !== `${cleanHost}/${type}/${encodedUser}/${encodedPass}/${cleanStreamId}.${ext}`) {
        rec.u = customUrl;
      }
    }
    const epgRaw = s.epg_channel_id !== void 0 && s.epg_channel_id !== null && s.epg_channel_id !== "" ? String(s.epg_channel_id).trim() : "";
    const tvgRaw = s.tvg_id !== void 0 && s.tvg_id !== null && s.tvg_id !== "" ? String(s.tvg_id).trim() : "";
    if (epgRaw) rec.g = epgRaw;
    else if (tvgRaw) rec.g = tvgRaw;
    if (tvgRaw && tvgRaw !== rec.g) rec.t = tvgRaw;
    if (s.num !== void 0 && s.num !== null && s.num !== idx + 1) {
      const numVal = Number(s.num);
      if (!Number.isNaN(numVal)) rec.m = numVal;
    }
    if (type === "live") {
      if (s.stream_type === "radio_streams" || name.toLowerCase().includes("radio")) {
        rec.r = 1;
      }
    } else {
      const plot = s.plot || s.description || s.overview;
      if (plot) rec.pl = plot;
      const cast = s.cast || s.actors;
      if (cast) rec.ct = cast;
      if (s.director) rec.dr = s.director;
      if (s.genre) rec.gn = s.genre;
      const rating = s.rating || s.rating_5based;
      if (rating !== void 0 && rating !== null && rating !== "") rec.rt = rating;
      const releaseDate = s.releaseDate || s.releasedate || s.year;
      if (releaseDate) rec.rd = String(releaseDate);
      if (type === "movie" && s.duration) rec.du = String(s.duration);
    }
    return { categoryId, record: rec };
  };
  const RE_M3U_SERIES_NAME = /\bs\d{1,2}\s*e\d{1,2}\b/i;
  const RE_M3U_MOVIE_EXT = /\.(mp4|mkv|avi|mov)(\?|$)/i;
  const RE_LOGO_ATTR = /(?:tvg-logo|tvg_logo|logo)=["']([^"']*)["']/i;
  const RE_GROUP_ATTR = /group-title=["']([^"']*)["']/i;
  const RE_ID_ATTR = /tvg-id=["']([^"']*)["']/i;
  const RE_NAME_ATTR = /(?:tvg-name|tvg_name|name)=["']([^"']*)["']/i;
  class StreamingM3UParser {
    constructor(batchSize = 2e3, skipEntries = 0) {
      this.leftover = "";
      this.currentName = "";
      this.currentLogo = "";
      this.currentGroup = "General";
      this.currentTvgId = "";
      this.entryCount = 0;
      this.liveBatch = [];
      this.movieBatch = [];
      this.seriesBatch = [];
      this.seenCategories = {
        live: /* @__PURE__ */ new Map(),
        movie: /* @__PURE__ */ new Map(),
        series: /* @__PURE__ */ new Map()
      };
      this.pendingCategories = [];
      this.counts = { live: 0, movie: 0, series: 0 };
      this.batchSize = Math.max(100, batchSize);
      this.skipEntries = Math.max(0, skipEntries);
    }
    get totalParsedEntries() {
      return this.entryCount;
    }
    extractExtinfMeta(line) {
      const logoMatch = line.indexOf("logo=") !== -1 || line.indexOf("logo =") !== -1 || line.includes("tvg-logo") || line.includes("tvg_logo") ? line.match(RE_LOGO_ATTR) : null;
      const groupMatch = line.includes("group-title") ? line.match(RE_GROUP_ATTR) : null;
      const idMatch = line.includes("tvg-id") ? line.match(RE_ID_ATTR) : null;
      const commaIdx = findUnquotedCommaIndex(line);
      const afterComma = commaIdx !== -1 ? fastDecodeHtml(line.substring(commaIdx + 1)) : "";
      let fallbackTvgName = "";
      if (!afterComma) {
        const tvgNameMatch = line.match(RE_NAME_ATTR);
        fallbackTvgName = tvgNameMatch ? fastDecodeHtml(tvgNameMatch[1]) : "";
      }
      this.currentName = afterComma || fallbackTvgName || "";
      this.currentLogo = logoMatch ? logoMatch[1].trim() : "";
      this.currentGroup = (groupMatch ? fastDecodeHtml(groupMatch[1]) : "") || "General";
      this.currentTvgId = idMatch ? idMatch[1].trim() : "";
    }
    classifyType(category, name, url) {
      const lowerCat = category.toLowerCase();
      const lowerUrl = url.toLowerCase();
      if (lowerCat.includes("series") || lowerCat.includes("serie") || lowerCat.includes("مسلسل") || lowerUrl.includes("/series/") || RE_M3U_SERIES_NAME.test(name)) {
        return "series";
      }
      if (lowerCat.includes("movie") || lowerCat.includes("film") || lowerCat.includes("vod") || lowerCat.includes("أفلام") || lowerCat.includes("افلام") || lowerUrl.includes("/movie/") || RE_M3U_MOVIE_EXT.test(lowerUrl)) {
        return "movie";
      }
      return "live";
    }
    pushLine(rawLine) {
      const line = rawLine.trim();
      if (!line) return;
      if (line.startsWith("#EXTINF:")) {
        this.extractExtinfMeta(line);
        return;
      }
      if (line.startsWith("#EXTGRP:")) {
        const grp = fastDecodeHtml(line.substring(8));
        if (grp) this.currentGroup = grp;
        return;
      }
      if (line.startsWith("#")) return;
      if (line.startsWith("http://") || line.startsWith("https://") || line.startsWith("rtmp://") || line.startsWith("rtsp://")) {
        const idx = this.entryCount++;
        const catName = this.currentGroup || "General";
        const resolvedName = this.currentName || `Channel ${idx + 1}`;
        const entryType = this.classifyType(catName, resolvedName, line);
        const streamId = this.currentTvgId ? `${this.currentTvgId}_${idx}` : `m3u_${idx}`;
        const seenMap = this.seenCategories[entryType];
        if (!seenMap.has(catName)) {
          const orderIndex = seenMap.size;
          seenMap.set(catName, orderIndex);
          if (idx >= this.skipEntries) {
            this.pendingCategories.push({
              category_id: catName,
              category_name: catName,
              type: entryType,
              orderIndex
            });
          }
        }
        const itemOrderIndex = this.counts[entryType];
        this.counts[entryType]++;
        if (idx >= this.skipEntries) {
          const entry = {
            stream_id: streamId,
            name: resolvedName,
            logo: this.currentLogo,
            category: catName,
            category_id: catName,
            category_name: catName,
            type: entryType,
            url: line,
            orderIndex: itemOrderIndex,
            epg_channel_id: this.currentTvgId || void 0,
            tvg_id: this.currentTvgId || void 0
          };
          if (entryType === "live") this.liveBatch.push(entry);
          else if (entryType === "movie") this.movieBatch.push(entry);
          else this.seriesBatch.push(entry);
        }
        this.currentName = "";
        this.currentLogo = "";
        this.currentGroup = "General";
        this.currentTvgId = "";
      }
    }
    drainIfReady(force) {
      const totalPending = this.liveBatch.length + this.movieBatch.length + this.seriesBatch.length;
      if (!force && totalPending < this.batchSize) return null;
      if (totalPending === 0 && this.pendingCategories.length === 0) return null;
      const result = {
        live: this.liveBatch,
        movie: this.movieBatch,
        series: this.seriesBatch,
        newCategories: this.pendingCategories
      };
      this.liveBatch = [];
      this.movieBatch = [];
      this.seriesBatch = [];
      this.pendingCategories = [];
      return result;
    }
    feedChunk(chunk, onBatch) {
      if (!chunk) return;
      const combined = this.leftover ? this.leftover + chunk : chunk;
      let start = 0;
      while (true) {
        const nl = combined.indexOf("\n", start);
        if (nl === -1) break;
        const line = combined.substring(start, nl);
        this.pushLine(line);
        start = nl + 1;
        const maybeBatch = this.drainIfReady(false);
        if (maybeBatch) onBatch(maybeBatch);
      }
      this.leftover = start < combined.length ? combined.substring(start) : "";
    }
    finish(onBatch) {
      if (this.leftover) {
        this.pushLine(this.leftover);
        this.leftover = "";
      }
      const remaining = this.drainIfReady(true);
      if (remaining) onBatch(remaining);
    }
  }
  let activeController = null;
  let cancelledByMsg = false;
  const postProgress = (payload) => {
    self.postMessage({ kind: "progress", ...payload });
  };
  const postTypeReady = (playlistId, readyType, count) => {
    self.postMessage({ kind: "type_ready", playlistId, mediaType: readyType, count });
  };
  const buildTargetUrl = (req, kind, actionOrUrl, extraParams = {}) => {
    if (kind === "m3u") {
      if (req.isNativeApp) {
        if (req.nativeProxyPort && req.nativeProxyPort > 0) {
          return `http://127.0.0.1:${req.nativeProxyPort}/proxy?url=${encodeURIComponent(actionOrUrl)}`;
        }
        return actionOrUrl;
      }
      const q = new URLSearchParams({ url: actionOrUrl, ...extraParams });
      return `${req.origin}/api/proxy/m3u?${q.toString()}`;
    }
    const cleanHost = req.cleanHost || "";
    const search = new URLSearchParams({
      username: req.username || "",
      password: req.password || "",
      action: actionOrUrl,
      ...extraParams
    });
    const directApiUrl = `${cleanHost}/player_api.php?${search.toString()}`;
    if (req.isNativeApp) {
      if (req.nativeProxyPort && req.nativeProxyPort > 0) {
        return `http://127.0.0.1:${req.nativeProxyPort}/proxy?url=${encodeURIComponent(directApiUrl)}`;
      }
      return directApiUrl;
    }
    const proxyParams = new URLSearchParams({
      url: `${cleanHost}/player_api.php`,
      username: req.username || "",
      password: req.password || "",
      action: actionOrUrl,
      ...extraParams
    });
    return `${req.origin}/api/proxy/xtream?${proxyParams.toString()}`;
  };
  const fetchSmallJsonArray = async (url, signal) => {
    try {
      const res = await fetch(url, {
        signal,
        headers: {
          Accept: "application/json, text/plain, */*",
          "User-Agent": "IPTVSmartersPro/3.1.5 (Linux; Android 12)"
        }
      });
      if (!res.ok && res.status !== 884) return [];
      const text = (await res.text()).replace(/^\uFEFF/, "").trim();
      if (!text || text.startsWith("<")) return [];
      const data = JSON.parse(text);
      if (Array.isArray(data)) return data;
      if (data && typeof data === "object") {
        const candidate = data.streams || data.live_streams || data.vod_streams || data.series || data.data;
        if (Array.isArray(candidate)) return candidate;
        const vals = Object.values(data);
        if (vals.length > 0 && typeof vals[0] === "object" && vals[0] !== null) return vals;
      }
      return [];
    } catch (e) {
      if ((e == null ? void 0 : e.name) === "AbortError" || signal.aborted) throw e;
      return [];
    }
  };
  const runXtreamInWorker = async (req, signal) => {
    var _a, _b, _c, _d, _e, _f;
    const playlistId = req.playlistId;
    const cleanHost = req.cleanHost || "";
    const username = req.username || "";
    const password = req.password || "";
    const encodedUser = encodeURIComponent(username);
    const encodedPass = encodeURIComponent(password);
    await saveXtreamPlaylistConfig(playlistId, { cleanHost, encodedUser, encodedPass });
    const existing = !req.force ? req.existingStatus : null;
    const completedSet = new Set((existing == null ? void 0 : existing.completedTypes) || []);
    const completedCatSets = {
      live: new Set(((_a = existing == null ? void 0 : existing.completedCategories) == null ? void 0 : _a.live) || []),
      movie: new Set(((_b = existing == null ? void 0 : existing.completedCategories) == null ? void 0 : _b.movie) || []),
      series: new Set(((_c = existing == null ? void 0 : existing.completedCategories) == null ? void 0 : _c.series) || [])
    };
    const savedOffsetByType = {
      ...(existing == null ? void 0 : existing.savedOffsetByType) || {}
    };
    const counts = {
      live: ((_d = existing == null ? void 0 : existing.counts) == null ? void 0 : _d.live) || 0,
      movie: ((_e = existing == null ? void 0 : existing.counts) == null ? void 0 : _e.movie) || 0,
      series: ((_f = existing == null ? void 0 : existing.counts) == null ? void 0 : _f.series) || 0
    };
    const bucketSeqRef = {
      current: typeof (existing == null ? void 0 : existing.bucketSeq) === "number" && existing.bucketSeq > 0 ? existing.bucketSeq : Math.floor(Date.now() % 1e6 * 100)
    };
    let liveReady = Boolean((existing == null ? void 0 : existing.liveReady) || completedSet.has("live"));
    let movieReady = Boolean((existing == null ? void 0 : existing.movieReady) || completedSet.has("movie"));
    let seriesReady = Boolean((existing == null ? void 0 : existing.seriesReady) || completedSet.has("series"));
    const buildFlags = () => ({
      liveReady,
      movieReady,
      seriesReady,
      categoriesReady: true,
      completedTypes: Array.from(completedSet)
    });
    postProgress({
      stage: "categorizing",
      percent: 6,
      message: "جاري تحميل جميع الأقسام بشكل متوازٍ...",
      counts: { ...counts },
      ...buildFlags(),
      categoriesReady: false
    });
    const typeConfigs = [
      { type: "live", action: "get_live_streams", catAction: "get_live_categories", label: "القنوات المباشرة", startPct: 12, endPct: 36, flushSize: 2500 },
      { type: "movie", action: "get_vod_streams", catAction: "get_vod_categories", label: "الأفلام", startPct: 36, endPct: 76, flushSize: 4e3 },
      { type: "series", action: "get_series", catAction: "get_series_categories", label: "المسلسلات", startPct: 76, endPct: 99, flushSize: 4e3 }
    ];
    const categoriesByType = {
      live: [],
      movie: [],
      series: []
    };
    await Promise.all(
      typeConfigs.map(async (cfg) => {
        if (signal.aborted) return;
        let stored = await getCategoriesByPlaylistAndType(playlistId, cfg.type);
        if (!stored || stored.length === 0) {
          const catUrl = buildTargetUrl(req, "xtream", cfg.catAction);
          const rawCats = await fetchSmallJsonArray(catUrl, signal);
          if (rawCats.length > 0) {
            const mapped = rawCats.map((c, idx) => ({
              category_id: String(c.category_id || c.id || idx),
              category_name: String(c.category_name || c.name || "General"),
              type: cfg.type,
              orderIndex: idx
            }));
            await saveCategories(mapped, cfg.type, playlistId, { batchSize: 2e3, signal });
            stored = mapped;
          } else {
            stored = [];
          }
        }
        categoriesByType[cfg.type] = stored;
      })
    );
    if (signal.aborted) throw new DOMException("Aborted", "AbortError");
    postTypeReady(playlistId, "categories", categoriesByType.live.length + categoriesByType.movie.length + categoriesByType.series.length);
    postProgress({
      stage: "downloading",
      percent: 12,
      message: "تم تجهيز الأقسام، جاري استخراج القنوات المباشرة أولاً...",
      counts: { ...counts },
      ...buildFlags()
    });
    for (const cfg of typeConfigs) {
      if (completedSet.has(cfg.type)) continue;
      if (signal.aborted) throw new DOMException("Aborted", "AbortError");
      const pctSpan = cfg.endPct - cfg.startPct;
      const resumeOffset = (existing == null ? void 0 : existing.stage) === "paused" ? savedOffsetByType[cfg.type] || 0 : 0;
      let lastEmitAt = 0;
      let lastCheckpointItems = resumeOffset;
      const url = buildTargetUrl(req, "xtream", cfg.action);
      const response = await fetch(url, {
        signal,
        headers: {
          Accept: "application/json, text/plain, */*",
          "User-Agent": "IPTVSmartersPro/3.1.5 (Linux; Android 12)"
        }
      });
      if (!response.ok && response.status !== 884) {
        throw new Error(`HTTP ${response.status} on ${cfg.action}`);
      }
      const contentLengthHeader = response.headers.get("content-length");
      const contentLength = contentLengthHeader ? parseInt(contentLengthHeader, 10) || 0 : 0;
      let bytesReceived = 0;
      let handledByStream = false;
      if (response.body) {
        const scanner = new FastJsonObjectBatchScanner(600, resumeOffset);
        const decoder = new TextDecoder("utf-8");
        const reader = response.body.getReader();
        let groupedBuffer = /* @__PURE__ */ new Map();
        let bufferedCount = 0;
        const inFlightWrites = [];
        const enqueueFlush = async (forceWait = false) => {
          if (groupedBuffer.size === 0) {
            if (forceWait && inFlightWrites.length > 0) {
              await Promise.all(inFlightWrites);
              inFlightWrites.length = 0;
            }
            return;
          }
          const snapshot = groupedBuffer;
          const flushedItems = bufferedCount;
          groupedBuffer = /* @__PURE__ */ new Map();
          bufferedCount = 0;
          while (inFlightWrites.length >= 2) {
            await inFlightWrites.shift();
          }
          const totalProcessedSnapshot = scanner.totalItems;
          const p = saveCategoryBucketsBatch(playlistId, cfg.type, snapshot, signal, bucketSeqRef).then(async () => {
            counts[cfg.type] = Math.max(counts[cfg.type], totalProcessedSnapshot);
            savedOffsetByType[cfg.type] = totalProcessedSnapshot;
            const now = Date.now();
            const ratio = contentLength > 0 ? Math.min(0.98, bytesReceived / contentLength) : Math.min(0.95, 1 - Math.exp(-totalProcessedSnapshot / (cfg.type === "live" ? 12e3 : cfg.type === "movie" ? 85e3 : 25e3)));
            const pct = Math.min(cfg.endPct - 1, cfg.startPct + Math.max(1, Math.round(ratio * pctSpan)));
            if (now - lastEmitAt >= 180 || totalProcessedSnapshot - lastCheckpointItems >= 15e3) {
              lastEmitAt = now;
              postProgress({
                stage: "saving",
                percent: pct,
                message: `${cfg.label}: ${counts[cfg.type].toLocaleString()} عنصر`,
                counts: { ...counts },
                savedOffsetByType: { ...savedOffsetByType },
                bucketSeq: bucketSeqRef.current,
                ...buildFlags()
              });
            }
            if (totalProcessedSnapshot - lastCheckpointItems >= 15e3 && flushedItems > 0) {
              lastCheckpointItems = totalProcessedSnapshot;
              await setPlaylistExtractionStatus(playlistId, {
                stage: "saving",
                percent: pct,
                message: `${cfg.label}: ${counts[cfg.type].toLocaleString()} عنصر`,
                counts: { ...counts },
                completedTypes: Array.from(completedSet),
                liveReady,
                movieReady,
                seriesReady,
                categoriesReady: true,
                completedCategories: {
                  live: Array.from(completedCatSets.live),
                  movie: Array.from(completedCatSets.movie),
                  series: Array.from(completedCatSets.series)
                },
                savedOffsetByType: { ...savedOffsetByType },
                bucketSeq: bucketSeqRef.current
              });
            }
          });
          inFlightWrites.push(p);
          if (forceWait) {
            await Promise.all(inFlightWrites);
            inFlightWrites.length = 0;
          }
        };
        const consumeParsedBatch = (items) => {
          for (let i = 0; i < items.length; i++) {
            const entry = items[i];
            const { categoryId, record } = mapXtreamItemToCompact(
              entry.item,
              entry.index,
              cfg.type,
              cleanHost,
              encodedUser,
              encodedPass
            );
            let arr = groupedBuffer.get(categoryId);
            if (!arr) {
              arr = [];
              groupedBuffer.set(categoryId, arr);
            }
            arr.push(record);
            bufferedCount++;
          }
        };
        try {
          while (true) {
            if (signal.aborted) throw new DOMException("Extraction aborted by user", "AbortError");
            const { done, value } = await reader.read();
            if (done) break;
            if (value && value.byteLength > 0) {
              bytesReceived += value.byteLength;
              const textChunk = decoder.decode(value, { stream: true });
              scanner.feedChunk(textChunk, consumeParsedBatch);
              if (scanner.invalidNotArray) {
                try {
                  await reader.cancel();
                } catch {
                }
                break;
              }
              if (bufferedCount >= cfg.flushSize) {
                await enqueueFlush(false);
              }
            }
          }
          if (!scanner.invalidNotArray) {
            const tail = decoder.decode();
            if (tail) scanner.feedChunk(tail, consumeParsedBatch);
            scanner.finish(consumeParsedBatch);
            await enqueueFlush(true);
            if (scanner.totalItems > 0) {
              counts[cfg.type] = scanner.totalItems;
              savedOffsetByType[cfg.type] = scanner.totalItems;
              handledByStream = true;
            }
          }
        } finally {
          try {
            reader.releaseLock();
          } catch {
          }
          if (inFlightWrites.length > 0) {
            await Promise.allSettled(inFlightWrites);
          }
        }
      }
      if (!handledByStream && !signal.aborted) {
        const cats = categoriesByType[cfg.type];
        if (cats.length > 0) {
          const CONCURRENCY = 4;
          const doneSet = completedCatSets[cfg.type];
          let catCursor = 0;
          let activeGrouped = /* @__PURE__ */ new Map();
          let activeBufCount = 0;
          const workerLoop = async () => {
            while (catCursor < cats.length && !signal.aborted) {
              const idx = catCursor++;
              const cat = cats[idx];
              const catId = String(cat.category_id || cat.id || "");
              if (!catId || doneSet.has(catId)) continue;
              const catUrl = buildTargetUrl(req, "xtream", cfg.action, { category_id: catId });
              const items = await fetchSmallJsonArray(catUrl, signal);
              if (items.length > 0) {
                const baseOrder = counts[cfg.type];
                counts[cfg.type] += items.length;
                for (let j = 0; j < items.length; j++) {
                  const { categoryId, record } = mapXtreamItemToCompact(
                    items[j],
                    baseOrder + j,
                    cfg.type,
                    cleanHost,
                    encodedUser,
                    encodedPass
                  );
                  let arr = activeGrouped.get(categoryId);
                  if (!arr) {
                    arr = [];
                    activeGrouped.set(categoryId, arr);
                  }
                  arr.push(record);
                  activeBufCount++;
                }
              }
              doneSet.add(catId);
              if (activeBufCount >= cfg.flushSize) {
                const snap = activeGrouped;
                activeGrouped = /* @__PURE__ */ new Map();
                activeBufCount = 0;
                await saveCategoryBucketsBatch(playlistId, cfg.type, snap, signal, bucketSeqRef);
                const pct = cfg.startPct + Math.round((idx + 1) / cats.length * pctSpan);
                postProgress({
                  stage: "saving",
                  percent: pct,
                  message: `${cfg.label}: ${counts[cfg.type].toLocaleString()} عنصر`,
                  counts: { ...counts },
                  ...buildFlags()
                });
              }
            }
          };
          await Promise.all(Array.from({ length: Math.min(CONCURRENCY, cats.length) }, () => workerLoop()));
          if (activeGrouped.size > 0) {
            await saveCategoryBucketsBatch(playlistId, cfg.type, activeGrouped, signal, bucketSeqRef);
          }
        }
      }
      completedSet.add(cfg.type);
      if (cfg.type === "live") liveReady = true;
      if (cfg.type === "movie") movieReady = true;
      if (cfg.type === "series") seriesReady = true;
      postTypeReady(playlistId, cfg.type, counts[cfg.type]);
      await setPlaylistExtractionStatus(playlistId, {
        stage: "saving",
        percent: cfg.endPct,
        message: `تم حفظ ${cfg.label} (${counts[cfg.type].toLocaleString()})`,
        counts: { ...counts },
        completedTypes: Array.from(completedSet),
        liveReady,
        movieReady,
        seriesReady,
        categoriesReady: true,
        completedCategories: {
          live: Array.from(completedCatSets.live),
          movie: Array.from(completedCatSets.movie),
          series: Array.from(completedCatSets.series)
        },
        savedOffsetByType: { ...savedOffsetByType },
        bucketSeq: bucketSeqRef.current
      });
      postProgress({
        stage: "saving",
        percent: cfg.endPct,
        message: cfg.type === "live" ? `القنوات المباشرة جاهزة للمشاهدة (${counts.live.toLocaleString()})` : `تم حفظ ${cfg.label} (${counts[cfg.type].toLocaleString()})`,
        counts: { ...counts },
        ...buildFlags()
      });
    }
    const finalStatus = {
      stage: "completed",
      percent: 100,
      message: "تم استخراج القائمة بالكامل",
      counts: { ...counts },
      completedTypes: ["live", "movie", "series"],
      liveReady: true,
      movieReady: true,
      seriesReady: true,
      categoriesReady: true,
      completedCategories: {
        live: Array.from(completedCatSets.live),
        movie: Array.from(completedCatSets.movie),
        series: Array.from(completedCatSets.series)
      },
      savedOffsetByType: { ...savedOffsetByType },
      bucketSeq: bucketSeqRef.current
    };
    await setPlaylistExtractionStatus(playlistId, finalStatus);
    self.postMessage({ kind: "done", success: true, status: finalStatus });
  };
  const runM3UInWorker = async (req, signal) => {
    var _a, _b, _c;
    const playlistId = req.playlistId;
    const rawUrl = req.m3uUrl || "";
    if (!rawUrl) throw new Error("رابط القائمة فارغ");
    const existing = !req.force ? req.existingStatus : null;
    const skipEntries = (existing == null ? void 0 : existing.stage) === "paused" ? Math.max(
      existing.m3uSavedEntries || 0,
      (((_a = existing.counts) == null ? void 0 : _a.live) || 0) + (((_b = existing.counts) == null ? void 0 : _b.movie) || 0) + (((_c = existing.counts) == null ? void 0 : _c.series) || 0)
    ) : 0;
    const bucketSeqRef = {
      current: typeof (existing == null ? void 0 : existing.bucketSeq) === "number" && existing.bucketSeq > 0 ? existing.bucketSeq : Math.floor(Date.now() % 1e6 * 100)
    };
    postProgress({
      stage: "downloading",
      percent: Math.max(10, (existing == null ? void 0 : existing.percent) || 10),
      message: "جاري تحميل ومعالجة قائمة M3U...",
      counts: (existing == null ? void 0 : existing.counts) || { live: 0, movie: 0, series: 0 }
    });
    const fetchUrl = buildTargetUrl(req, "m3u", rawUrl);
    const response = await fetch(fetchUrl, { signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const totalBytes = parseInt(response.headers.get("content-length") || "0", 10) || 0;
    let receivedBytes = 0;
    const parser = new StreamingM3UParser(2500, skipEntries);
    const decoder = new TextDecoder("utf-8");
    let lastEmitAt = 0;
    let lastCheckpointCount = skipEntries;
    const flushM3UBatch = async (batch) => {
      await saveStreamingBatch(playlistId, batch, signal, bucketSeqRef);
      const totalItems = parser.counts.live + parser.counts.movie + parser.counts.series;
      const pct = totalBytes > 0 ? Math.min(98, 12 + Math.round(receivedBytes / totalBytes * 85)) : Math.min(96, 15 + Math.round((1 - Math.exp(-totalItems / 35e3)) * 80));
      const now = Date.now();
      if (now - lastEmitAt >= 180) {
        lastEmitAt = now;
        postProgress({
          stage: "saving",
          percent: pct,
          message: `تم حفظ ${totalItems.toLocaleString()} عنصر...`,
          counts: { ...parser.counts },
          m3uSavedEntries: totalItems,
          bucketSeq: bucketSeqRef.current
        });
      }
      if (totalItems - lastCheckpointCount >= 15e3) {
        lastCheckpointCount = totalItems;
        await setPlaylistExtractionStatus(playlistId, {
          stage: "saving",
          percent: pct,
          message: `تم حفظ ${totalItems.toLocaleString()} عنصر...`,
          counts: { ...parser.counts },
          m3uSavedEntries: totalItems,
          bucketSeq: bucketSeqRef.current
        });
      }
    };
    if (response.body) {
      const reader = response.body.getReader();
      const pending = [];
      try {
        while (true) {
          if (signal.aborted) throw new DOMException("Extraction aborted by user", "AbortError");
          const { done, value } = await reader.read();
          if (done) break;
          if (value && value.byteLength > 0) {
            receivedBytes += value.byteLength;
            const chunk = decoder.decode(value, { stream: true });
            parser.feedChunk(chunk, (b) => pending.push(b));
            while (pending.length > 0) {
              await flushM3UBatch(pending.shift());
            }
          }
        }
        const tail = decoder.decode();
        if (tail) parser.feedChunk(tail, (b) => pending.push(b));
        parser.finish((b) => pending.push(b));
        while (pending.length > 0) {
          await flushM3UBatch(pending.shift());
        }
      } finally {
        try {
          reader.releaseLock();
        } catch {
        }
      }
    } else {
      const text = await response.text();
      const pending = [];
      const CHUNK = 1024 * 1024;
      for (let i = 0; i < text.length; i += CHUNK) {
        receivedBytes = Math.min(text.length, i + CHUNK);
        parser.feedChunk(text.slice(i, i + CHUNK), (b) => pending.push(b));
        while (pending.length > 0) {
          await flushM3UBatch(pending.shift());
        }
      }
      parser.finish((b) => pending.push(b));
      while (pending.length > 0) {
        await flushM3UBatch(pending.shift());
      }
    }
    const counts = { ...parser.counts };
    const totalSaved = counts.live + counts.movie + counts.series;
    const finalStatus = {
      stage: "completed",
      percent: 100,
      message: "تم استخراج القائمة بنجاح",
      counts,
      m3uSavedEntries: totalSaved,
      completedTypes: ["live", "movie", "series"],
      liveReady: true,
      movieReady: true,
      seriesReady: true,
      categoriesReady: true,
      bucketSeq: bucketSeqRef.current
    };
    await setPlaylistExtractionStatus(playlistId, finalStatus);
    postTypeReady(playlistId, "live", counts.live);
    postTypeReady(playlistId, "movie", counts.movie);
    postTypeReady(playlistId, "series", counts.series);
    self.postMessage({ kind: "done", success: true, status: finalStatus });
  };
  self.onmessage = async (event) => {
    const req = event.data;
    if (!req) return;
    if (req.type === "cancel") {
      cancelledByMsg = true;
      try {
        activeController == null ? void 0 : activeController.abort();
      } catch {
      }
      return;
    }
    if (req.type === "start") {
      cancelledByMsg = false;
      activeController = new AbortController();
      const signal = activeController.signal;
      try {
        if (req.force) {
          await clearPlaylistData(req.playlistId);
        }
        if (req.mode === "xtream") {
          await runXtreamInWorker(req, signal);
        } else {
          await runM3UInWorker(req, signal);
        }
      } catch (err) {
        if ((err == null ? void 0 : err.name) === "AbortError" || signal.aborted || cancelledByMsg) {
          self.postMessage({ kind: "aborted" });
        } else {
          self.postMessage({
            kind: "error",
            message: (err == null ? void 0 : err.message) || "Worker extraction error"
          });
        }
      } finally {
        activeController = null;
      }
    }
  };
})();
