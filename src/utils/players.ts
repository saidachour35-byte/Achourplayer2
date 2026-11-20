export interface ExternalPlayerProfile {
  id: string;
  name: string;
  packageName: string;
  aliases?: string[];
  fallbackPackages?: string[];
  fireTvCompatible: boolean;
  fireTvNoteAr?: string;
  fireTvNoteEn?: string;
  schemeFallback?: (streamUrl: string) => string | null;
  intentExtras?: (title: string, headers: Record<string, string>) => string[];
}

export const EXTERNAL_PLAYER_PROFILES: ExternalPlayerProfile[] = [
  {
    id: 'VLC for Android',
    name: 'VLC for Android',
    packageName: 'org.videolan.vlc',
    aliases: ['VLC Media Player', 'VLC'],
    fireTvCompatible: true,
    schemeFallback: (url) => (url ? `vlc://${url}` : null),
    intentExtras: (title) => [
      `S.title=${encodeURIComponent(title)}`,
      'B.from_start=false',
    ],
  },
  {
    id: 'MX Player Pro',
    name: 'MX Player Pro',
    packageName: 'com.mxtech.videoplayer.pro',
    aliases: ['MX Player Pro'],
    fireTvCompatible: true,
    fireTvNoteAr: 'تطبيق مدفوع؛ تأكد من تثبيته على الجهاز أو Fire TV Stick.',
    fireTvNoteEn: 'Paid app; make sure it is installed on your device or Fire TV Stick.',
    intentExtras: (title) => [
      `S.title=${encodeURIComponent(title)}`,
      'i.decode_mode=2',
      'B.return_result=true',
    ],
  },
  {
    id: 'Just Player',
    name: 'Just Player',
    packageName: 'com.brouken.player',
    aliases: ['Just Player'],
    fireTvCompatible: true,
    intentExtras: (title) => [
      `S.title=${encodeURIComponent(title)}`,
    ],
  },
  {
    id: 'Nova Player',
    name: 'Nova Player',
    packageName: 'com.archos.mediacenter.videofree',
    aliases: ['Nova Video Player', 'Nova Player'],
    fallbackPackages: ['org.courville.nova'],
    fireTvCompatible: true,
    intentExtras: (title) => [
      `S.title=${encodeURIComponent(title)}`,
    ],
  },
  {
    id: 'KMPlayer',
    name: 'KMPlayer',
    packageName: 'com.kmplayer',
    aliases: ['KMPlayer'],
    fireTvCompatible: false,
    fireTvNoteAr: 'غير متوافق بشكل كامل مع Fire TV Stick والريموت كنترول (مُصمم للهواتف اللمسية).',
    fireTvNoteEn: 'Not fully compatible with Fire TV Stick & TV remote (designed for mobile touchscreens).',
    intentExtras: (title) => [
      `S.title=${encodeURIComponent(title)}`,
    ],
  },
];

export const PLAYER_PACKAGES: Record<string, string> = {
  'VLC for Android': 'org.videolan.vlc',
  'VLC Media Player': 'org.videolan.vlc',
  'MX Player Pro': 'com.mxtech.videoplayer.pro',
  'MX Player': 'com.mxtech.videoplayer.ad',
  'MPV Player': 'is.xyz.mpv',
  'Kodi': 'org.xbmc.kodi',
  'Just Player': 'com.brouken.player',
  'Nova Player': 'com.archos.mediacenter.videofree',
  'Nova Video Player': 'com.archos.mediacenter.videofree',
  'IJK Player': 'tv.danmaku.ijk.media.example',
  'PotPlayer': 'com.potplayer.video.player',
  'KMPlayer': 'com.kmplayer',
  'ExoPlayer': 'com.google.android.exoplayer2',
};

export const getCustomPlayersMap = (): Record<string, string> => {
  try {
    const parsed = JSON.parse(localStorage.getItem('achour_custom_players_map') || '{}');
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
};

export const getPlayerPackage = (playerName: string): string => {
  if (!playerName) return '';
  const profile = EXTERNAL_PLAYER_PROFILES.find(
    (p) => p.id === playerName || p.name === playerName || p.aliases?.includes(playerName)
  );
  if (profile) return profile.packageName;
  if (PLAYER_PACKAGES[playerName]) return PLAYER_PACKAGES[playerName];

  const customMap = getCustomPlayersMap();
  if (customMap[playerName]) return customMap[playerName];

  return '';
};

export const saveCustomPlayerPackage = (playerName: string, packageName: string) => {
  if (!playerName || !packageName) return;
  try {
    const customMap = getCustomPlayersMap();
    customMap[playerName] = packageName;
    localStorage.setItem('achour_custom_players_map', JSON.stringify(customMap));
    PLAYER_PACKAGES[playerName] = packageName;
  } catch {}
};

export const resolveExternalPlayerProfile = (playerName: string): ExternalPlayerProfile => {
  const matched = EXTERNAL_PLAYER_PROFILES.find(
    (p) => p.id === playerName || p.name === playerName || p.aliases?.includes(playerName)
  );
  if (matched) return matched;

  const pkg = getPlayerPackage(playerName);
  return {
    id: playerName || 'External Player',
    name: playerName || 'External Player',
    packageName: pkg,
    fireTvCompatible: true,
    intentExtras: (title) => [`S.title=${encodeURIComponent(title)}`],
  };
};

export const isFireTVDevice = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent.toLowerCase();
  return /\baft[a-z0-9]*\b|fire\s*tv|amazon.*tv|silk.*tv/i.test(ua);
};

export const buildExternalStreamHeaders = (streamUrl: string, item?: any): Record<string, string> => {
  const customHeaders = (item?.headers && typeof item.headers === 'object' ? item.headers : {}) as Record<string, string>;
  const headers: Record<string, string> = {
    'User-Agent':
      customHeaders['User-Agent'] ||
      customHeaders['user-agent'] ||
      item?.userAgent ||
      item?.http_user_agent ||
      'IPTVSmartersPro/3.1.5 (Linux; Android 12)',
    'X-Requested-With': 'com.achourplayer.app',
  };

  let hostname = '';
  try {
    hostname = new URL(streamUrl).hostname.toLowerCase();
  } catch {}

  const explicitReferer =
    customHeaders['Referer'] ||
    customHeaders['referer'] ||
    item?.http_referrer ||
    item?.referer ||
    '';

  if (explicitReferer) {
    headers['Referer'] = explicitReferer;
  } else if (hostname.includes('getaj.net') || hostname.includes('aljazeera.net')) {
    headers['Referer'] = 'https://www.aljazeera.net/';
    headers['Origin'] = 'https://www.aljazeera.net';
  }

  const explicitOrigin = customHeaders['Origin'] || customHeaders['origin'];
  if (explicitOrigin) {
    headers['Origin'] = explicitOrigin;
  }

  return headers;
};

export const buildExternalIntentUri = (
  streamUrl: string,
  profile: ExternalPlayerProfile,
  title: string,
  headers: Record<string, string>,
  packageOverride?: string
): string => {
  const cleanUrl = streamUrl.trim();
  const targetPkg = packageOverride || profile.packageName;
  const schemeMatch = cleanUrl.match(/^([a-zA-Z][a-zA-Z0-9+.-]*):\/\/(.*)$/);

  const extras: string[] = [
    'action=android.intent.action.VIEW',
    'type=video/*',
  ];

  if (targetPkg) {
    extras.push(`package=${targetPkg}`);
  }

  if (profile.intentExtras) {
    extras.push(...profile.intentExtras(title || 'Achour Player', headers));
  } else if (title) {
    extras.push(`S.title=${encodeURIComponent(title)}`);
  }

  if (headers['User-Agent']) {
    extras.push(`S.http-user-agent=${encodeURIComponent(headers['User-Agent'])}`);
  }
  if (headers['Referer']) {
    extras.push(`S.referer=${encodeURIComponent(headers['Referer'])}`);
  }

  if (schemeMatch) {
    const scheme = schemeMatch[1].toLowerCase();
    const hostAndPath = schemeMatch[2];
    return `intent://${hostAndPath}#Intent;scheme=${scheme};${extras.join(';')};end`;
  }

  return `intent:${encodeURI(cleanUrl)}#Intent;${extras.join(';')};end`;
};

const getNativeBridges = (): any[] => {
  if (typeof window === 'undefined') return [];
  const w = window as any;
  return [w.AchourNative, w.Android, w.JSBridge].filter(Boolean);
};

export const probeExternalPlayerInstalled = async (
  packageName: string,
  fallbackPackages?: string[]
): Promise<{ installed: boolean | 'unknown'; resolvedPackage: string }> => {
  if (!packageName) {
    return { installed: 'unknown', resolvedPackage: '' };
  }

  const candidates = [packageName, ...(fallbackPackages || [])].filter(Boolean);
  const bridges = getNativeBridges();
  let probed = false;

  for (const pkg of candidates) {
    for (const bridge of bridges) {
      const fnNames = [
        'isPackageInstalled',
        'isAppInstalled',
        'canOpenPackage',
        'checkPackageInstalled',
        'hasPackage',
      ];
      for (const fn of fnNames) {
        if (typeof bridge[fn] === 'function') {
          probed = true;
          try {
            const res = await Promise.resolve(bridge[fn](pkg));
            if (res === true || res === 'true' || res === 1) {
              return { installed: true, resolvedPackage: pkg };
            }
          } catch {}
        }
      }

      if (typeof bridge.getInstalledPackages === 'function') {
        probed = true;
        try {
          const raw = await Promise.resolve(bridge.getInstalledPackages());
          const list = typeof raw === 'string' ? JSON.parse(raw) : raw;
          if (Array.isArray(list) && list.includes(pkg)) {
            return { installed: true, resolvedPackage: pkg };
          }
        } catch {}
      }
    }
  }

  if (probed) {
    return { installed: false, resolvedPackage: packageName };
  }

  try {
    const capAppLauncher = (window as any)?.Capacitor?.Plugins?.AppLauncher;
    if (capAppLauncher && typeof capAppLauncher.canOpenUrl === 'function') {
      for (const pkg of candidates) {
        try {
          const res = await capAppLauncher.canOpenUrl({ url: `package:${pkg}` });
          if (res?.value === true) {
            return { installed: true, resolvedPackage: pkg };
          }
        } catch {}
      }
    }
  } catch {}

  return { installed: 'unknown', resolvedPackage: packageName };
};

export interface ExternalLaunchParams {
  streamUrl: string;
  playerName: string;
  title: string;
  logo?: string;
  streamId?: string;
  mediaType: 'live' | 'movie' | 'series';
  isFavorite?: boolean;
  isAndroidEnv: boolean;
  headers?: Record<string, string>;
  userAgent?: string;
  referer?: string;
}

export interface ExternalLaunchResult {
  ok: boolean;
  reason?: 'not_installed' | 'firetv_incompatible' | 'unsupported_platform' | 'launch_failed' | 'missing_url';
  profile: ExternalPlayerProfile;
  resolvedPackage: string;
  intentUri?: string;
  headers: Record<string, string>;
}

const waitForAppBackgroundVerification = (timeoutMs = 1750): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof document === 'undefined' || typeof window === 'undefined') {
      resolve(true);
      return;
    }

    let settled = false;
    const finish = (opened: boolean) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('pagehide', onHide);
      resolve(opened);
    };

    const onVis = () => {
      if (document.hidden || document.visibilityState === 'hidden') {
        finish(true);
      }
    };
    const onBlur = () => finish(true);
    const onHide = () => finish(true);

    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('blur', onBlur);
    window.addEventListener('pagehide', onHide);

    const timer = setTimeout(() => {
      const opened = Boolean(document.hidden || document.visibilityState === 'hidden' || !document.hasFocus());
      finish(opened);
    }, timeoutMs);
  });
};

export const launchExternalPlayerSession = async (
  params: ExternalLaunchParams
): Promise<ExternalLaunchResult> => {
  const profile = resolveExternalPlayerProfile(params.playerName);
  const directUrl = (params.streamUrl || '').trim();
  const headers = buildExternalStreamHeaders(directUrl, params);

  if (!directUrl) {
    return {
      ok: false,
      reason: 'missing_url',
      profile,
      resolvedPackage: profile.packageName,
      headers,
    };
  }

  if (!params.isAndroidEnv) {
    return {
      ok: false,
      reason: 'unsupported_platform',
      profile,
      resolvedPackage: profile.packageName,
      headers,
    };
  }

  const probe = await probeExternalPlayerInstalled(profile.packageName, profile.fallbackPackages);
  const resolvedPkg = probe.resolvedPackage || profile.packageName;
  const intentUri = buildExternalIntentUri(directUrl, profile, params.title, headers, resolvedPkg);

  if (probe.installed === false) {
    return {
      ok: false,
      reason: isFireTVDevice() && !profile.fireTvCompatible ? 'firetv_incompatible' : 'not_installed',
      profile,
      resolvedPackage: resolvedPkg,
      intentUri,
      headers,
    };
  }

  const headerArray: string[] = [];
  Object.entries(headers).forEach(([k, v]) => {
    if (v) headerArray.push(k, v);
  });

  const payload = {
    title: params.title || 'Achour Player',
    logo: params.logo || '',
    stream_id: params.streamId || '',
    type: params.mediaType,
    isLive: params.mediaType === 'live',
    isFavorite: Boolean(params.isFavorite),
    external: true,
    forceExternal: true,
    packageName: resolvedPkg || undefined,
    fallbackPackages: profile.fallbackPackages || undefined,
    mimeType: 'video/*',
    intentUri,
    headers,
    headerArray,
  };

  const bridges = getNativeBridges();

  for (const bridge of bridges) {
    // 1. Prefer explicit external player launch methods if available on the native APK bridge
    const dedicatedMethods = ['openExternalPlayer', 'launchExternalPlayer', 'startExternalPlayer'];
    for (const method of dedicatedMethods) {
      if (typeof bridge[method] === 'function') {
        try {
          const result = await Promise.resolve(bridge[method](directUrl, resolvedPkg, JSON.stringify(payload)));
          if (result === false || result === 'false' || result === 'NOT_INSTALLED') {
            return {
              ok: false,
              reason: isFireTVDevice() && !profile.fireTvCompatible ? 'firetv_incompatible' : 'not_installed',
              profile,
              resolvedPackage: resolvedPkg,
              intentUri,
              headers,
            };
          }
          if (result && typeof result === 'object' && result.ok === false) {
            return {
              ok: false,
              reason: result.installed === false ? 'not_installed' : 'launch_failed',
              profile,
              resolvedPackage: resolvedPkg,
              intentUri,
              headers,
            };
          }
          return {
            ok: true,
            profile,
            resolvedPackage: resolvedPkg,
            intentUri,
            headers,
          };
        } catch {}
      }
    }

    // 2. Native generic intent URI launcher
    for (const uriMethod of ['openExternalUri', 'launchIntent']) {
      if (typeof bridge[uriMethod] === 'function') {
        try {
          const result = await Promise.resolve(bridge[uriMethod](intentUri));
          if (result === false || result === 'false') {
            return {
              ok: false,
              reason: isFireTVDevice() && !profile.fireTvCompatible ? 'firetv_incompatible' : 'not_installed',
              profile,
              resolvedPackage: resolvedPkg,
              intentUri,
              headers,
            };
          }
          return {
            ok: true,
            profile,
            resolvedPackage: resolvedPkg,
            intentUri,
            headers,
          };
        } catch {}
      }
    }

    // 3. Fallback to playMedia bridge with external package & headers payload
    if (typeof bridge.playMedia === 'function') {
      try {
        const bgCheck = waitForAppBackgroundVerification(1750);
        const result = bridge.playMedia(directUrl, JSON.stringify(payload));
        if (result === false || result === 'false' || result === 'NOT_INSTALLED') {
          return {
            ok: false,
            reason: isFireTVDevice() && !profile.fireTvCompatible ? 'firetv_incompatible' : 'not_installed',
            profile,
            resolvedPackage: resolvedPkg,
            intentUri,
            headers,
          };
        }
        const wentToExternal = await bgCheck;
        if (wentToExternal || result === true || result === 'true') {
          return {
            ok: true,
            profile,
            resolvedPackage: resolvedPkg,
            intentUri,
            headers,
          };
        }
      } catch {}
    }
  }

  // 4. Standard Android Browser / WebView Intent URI launch with background verification
  try {
    const bgCheck = waitForAppBackgroundVerification(1750);
    const link = document.createElement('a');
    link.href = intentUri;
    link.rel = 'noopener noreferrer';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    const wentToExternal = await bgCheck;
    if (wentToExternal) {
      return {
        ok: true,
        profile,
        resolvedPackage: resolvedPkg,
        intentUri,
        headers,
      };
    }

    // VLC direct scheme retry if intent:// stayed in mobile browser
    const altScheme = profile.schemeFallback?.(directUrl);
    if (altScheme) {
      const bgRetry = waitForAppBackgroundVerification(1400);
      const vlcLink = document.createElement('a');
      vlcLink.href = altScheme;
      vlcLink.rel = 'noopener noreferrer';
      vlcLink.style.display = 'none';
      document.body.appendChild(vlcLink);
      vlcLink.click();
      document.body.removeChild(vlcLink);
      const retryOpened = await bgRetry;
      if (retryOpened) {
        return {
          ok: true,
          profile,
          resolvedPackage: resolvedPkg,
          intentUri: altScheme,
          headers,
        };
      }
    }
  } catch {}

  return {
    ok: false,
    reason: isFireTVDevice() && !profile.fireTvCompatible ? 'firetv_incompatible' : 'not_installed',
    profile,
    resolvedPackage: resolvedPkg,
    intentUri,
    headers,
  };
};
