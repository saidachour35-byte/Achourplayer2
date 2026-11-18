// Original path: src/components/DashboardLayouts.tsx
import React from 'react';
import { Radio, Film, Clapperboard, ChevronRight, ChevronLeft, Move } from 'lucide-react';
import { Icon3DStyle, getIconGlyphVariant } from '../utils/themeManager';
import { AppSettings, Language } from '../types';
import { isMobileDevice } from '../utils/platform';

export const VALID_DASHBOARD_LAYOUTS = [
  'layout-frameless-icons',
  'layout-pure-icons',
  'layout-glass-hero-dock',
  'layout-vertical-rail',
  'layout-cinema-marquee',
  'layout-asymmetric-bento',
  'layout-dual-cinema-split',
  'layout-floating-console-bar',
  'layout-pyramid-tier',
  'layout-right-command-panel',
  'layout-chamfer-prism-grid',
  'layout-editorial-showcase',
  'layout-orbital-medallions',
  'layout-leanback-lanes',
  'layout-quadrant-hub',
  'layout-arch-gallery',
  'layout-compact-glass-stack',
  'layout-widescreen-ribbon',
  'layout-stepped-skyline',
  'layout-split-header-deck',
  'layout-zen-horizon',
  'layout-obsidian-hex-hive',
  'layout-solid-theater-marquee',
  'layout-carbon-brushed-chassis',
  'layout-duotone-color-blocks',
  'layout-isometric-diamond-deck',
  'layout-matte-card-fan',
  'layout-royal-monolith-dock',
  'layout-split-panel-arcade',
  'layout-horizon-panorama-cards',
  'layout-luxury-satin-frame',
] as const;

export type DashboardViewTarget = 'live' | 'movies' | 'series' | 'add' | 'settings';
export type IconKind = 'live' | 'movies' | 'series' | 'add' | 'settings';

export interface DashboardLayoutsProps {
  layoutId?: string;
  dashboardOrder?: string[];
  active3DStyle: Icon3DStyle;
  iconSize?: AppSettings['iconScale'];
  frameScale?: AppSettings['frameScale'];
  tileSpacing?: AppSettings['tileSpacing'];
  reorderingKind?: IconKind | null;
  language: Language;
  isRtl: boolean;
  t: (key: any) => string;
  onNavigate: (view: DashboardViewTarget) => void;
  onExit?: () => void;
}

/**
 * Distinct AchourPlayer architectural brand glyphs for the 5 functional home sections.
 * Custom-drawn silhouettes representing Live TV channels, Cinema movies, Series episodes,
 * Playlist sources, and System control dial.
 */
export function AchourIconGlyph({
  kind,
  className = 'w-full h-full',
  strokeWidth = 1.7,
  fill = 'none',
  style,
}: {
  kind: IconKind;
  className?: string;
  strokeWidth?: number;
  fill?: string;
  style?: React.CSSProperties;
}) {
  const props = {
    viewBox: '0 0 24 24',
    fill,
    stroke: 'currentColor',
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className,
    style,
  };

  switch (kind) {
    case 'live':
      // Architectural broadcast monitor with dual signal arcs & central beacon
      return (
        <svg {...props}>
          <path d="M7.5 4.2a6.5 6.5 0 0 1 9 0" opacity="0.55" />
          <path d="M9.6 6.2a3.6 3.6 0 0 1 4.8 0" opacity="0.85" />
          <path d="M3.5 9.5a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2v7.2a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z" />
          <circle cx="8.2" cy="13.1" r="1.4" fill="currentColor" stroke="none" />
          <path d="M12.2 11.4l4.2 1.7-4.2 1.7z" fill="currentColor" stroke="none" />
          <path d="M8.5 21h7" />
        </svg>
      );
    case 'movies':
      // Twin-reel cinema aperture with notched film gate
      return (
        <svg {...props}>
          <circle cx="7.5" cy="7" r="2.7" />
          <circle cx="15.5" cy="7" r="2.7" />
          <path d="M3.5 11.2a1.8 1.8 0 0 1 1.8-1.8h12.2a1.8 1.8 0 0 1 1.8 1.8v7.6a1.8 1.8 0 0 1-1.8 1.8H5.3a1.8 1.8 0 0 1-1.8-1.8z" />
          <path d="M19.3 13.3l2.2-1.4v6.2l-2.2-1.4" />
          <path d="M9.6 12.8l4.4 2.2-4.4 2.2z" fill="currentColor" stroke="none" />
        </svg>
      );
    case 'series':
      // Stepped trilogy episode cards with notched episodic spine
      return (
        <svg {...props}>
          <path d="M8.5 3.5h10a2 2 0 0 1 2 2v10" opacity="0.45" />
          <path d="M6 6.2h10.2a2 2 0 0 1 2 2v10.2" opacity="0.72" />
          <rect x="3.5" y="9" width="12" height="11.5" rx="2.2" />
          <path d="M6.8 12.5h5.4M6.8 15.5h3.2" />
          <circle cx="12.2" cy="16.2" r="1.1" fill="currentColor" stroke="none" />
        </svg>
      );
    case 'add':
      // Stream conduit hub feeding a faceted playlist node
      return (
        <svg {...props}>
          <path d="M4 6.5h9.5M4 11.5h7.5M4 16.5h6.5" />
          <circle cx="16.8" cy="15.2" r="4.5" />
          <path d="M16.8 13.1v4.2M14.7 15.2h4.2" />
          <circle cx="17.5" cy="6.5" r="1.6" fill="currentColor" stroke="none" />
        </svg>
      );
    case 'settings':
      // Octagonal precision control chassis with calibration dial (distinct from generic gears)
      return (
        <svg {...props}>
          <polygon points="8.6,3 15.4,3 21,8.6 21,15.4 15.4,21 8.6,21 3,15.4 3,8.6" />
          <line x1="7.5" y1="9.5" x2="16.5" y2="9.5" />
          <circle cx="10.2" cy="9.5" r="1.5" fill="currentColor" stroke="none" />
          <line x1="7.5" y1="14.5" x2="16.5" y2="14.5" />
          <circle cx="14.2" cy="14.5" r="1.5" fill="currentColor" stroke="none" />
        </svg>
      );
  }
}

const Icons = {
  Live: ({ className, strokeWidth = 1.6, fill = 'none', style }: { className?: string; strokeWidth?: number; fill?: string; style?: React.CSSProperties }) => (
    <AchourIconGlyph kind="live" className={className} strokeWidth={strokeWidth} fill={fill} style={style} />
  ),
  Filme: ({ className, strokeWidth = 1.6, fill = 'none', style }: { className?: string; strokeWidth?: number; fill?: string; style?: React.CSSProperties }) => (
    <AchourIconGlyph kind="movies" className={className} strokeWidth={strokeWidth} fill={fill} style={style} />
  ),
  Serie: ({ className, strokeWidth = 1.6, fill = 'none', style }: { className?: string; strokeWidth?: number; fill?: string; style?: React.CSSProperties }) => (
    <AchourIconGlyph kind="series" className={className} strokeWidth={strokeWidth} fill={fill} style={style} />
  ),
  Playlist: ({ className, strokeWidth = 1.6, fill = 'none', style }: { className?: string; strokeWidth?: number; fill?: string; style?: React.CSSProperties }) => (
    <AchourIconGlyph kind="add" className={className} strokeWidth={strokeWidth} fill={fill} style={style} />
  ),
  Settings: ({ className, strokeWidth = 1.6, fill = 'none', style }: { className?: string; strokeWidth?: number; fill?: string; style?: React.CSSProperties }) => (
    <AchourIconGlyph kind="settings" className={className} strokeWidth={strokeWidth} fill={fill} style={style} />
  ),
};

const ICON_SIZE_CLASSES = {
  sm: {
    xs: 'w-6 h-6 p-1',
    sm: 'w-7 h-7 p-1',
    md: 'w-8 h-8 p-1.5',
    lg: 'w-9 h-9 sm:w-10 sm:h-10 p-2',
    xl: 'w-10 h-10 sm:w-11 sm:h-11 p-2',
    '2xl': 'w-11 h-11 sm:w-12 sm:h-12 p-2.5',
    '3xl': 'w-12 h-12 sm:w-14 sm:h-14 p-2.5',
  },
  md: {
    xs: 'w-8 h-8 p-1.5',
    sm: 'w-9 h-9 sm:w-10 sm:h-10 p-2',
    md: 'w-10 h-10 sm:w-11 sm:h-11 p-2',
    lg: 'w-11 h-11 sm:w-13 sm:h-13 p-2.5',
    xl: 'w-12 h-12 sm:w-14 sm:h-14 p-2.5',
    '2xl': 'w-13 h-13 sm:w-15 sm:h-15 p-3',
    '3xl': 'w-15 h-15 sm:w-18 sm:h-18 p-3',
  },
  lg: {
    xs: 'w-10 h-10 sm:w-11 sm:h-11 p-2',
    sm: 'w-11 h-11 sm:w-13 sm:h-13 p-2.5',
    md: 'w-12 h-12 sm:w-14 sm:h-14 p-2.5',
    lg: 'w-14 h-14 sm:w-16 sm:h-16 p-3',
    xl: 'w-15 h-15 sm:w-18 sm:h-18 p-3',
    '2xl': 'w-16 h-16 sm:w-20 sm:h-20 p-3.5',
    '3xl': 'w-18 h-18 sm:w-22 sm:h-22 p-4',
  },
  hero: {
    xs: 'w-12 h-12 sm:w-14 sm:h-14 p-2.5',
    sm: 'w-14 h-14 sm:w-16 sm:h-16 p-3',
    md: 'w-14 h-14 sm:w-16 sm:h-16 p-3',
    lg: 'w-16 h-16 sm:w-20 sm:h-20 p-3.5',
    xl: 'w-18 h-18 sm:w-22 sm:h-22 p-4',
    '2xl': 'w-20 h-20 sm:w-24 sm:h-24 p-4',
    '3xl': 'w-24 h-24 sm:w-28 sm:h-28 p-5',
  },
};

function renderIconGlyph({
  kind,
  active3DStyle,
  glyphClass,
  strokeWidth = 1.7,
  fill = 'none',
  style,
}: {
  kind: IconKind;
  active3DStyle?: Icon3DStyle;
  glyphClass: string;
  strokeWidth?: number;
  fill?: string;
  style?: React.CSSProperties;
}) {
  if (active3DStyle?.iconImage) {
    return <img src={active3DStyle.iconImage} alt="" style={style} className={`w-full h-full object-contain ${active3DStyle.iconClass}`} />;
  }
  const variant = active3DStyle ? getIconGlyphVariant(active3DStyle) : undefined;
  if (variant) {
    const common = {
      className: glyphClass,
      style,
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth,
      strokeLinecap: 'round' as const,
      strokeLinejoin: 'round' as const,
    };
    if (variant === 'cinema') {
      return <svg {...common}>
        {kind === 'live' ? <><rect x="3" y="7" width="18" height="12" rx="2"/><path d="M8 3l4 4 4-4M10 11l5 2-5 2z" fill="currentColor" stroke="none"/></> :
         kind === 'movies' ? <><path d="M3 7h18v13H3zM3 7l3-4h15l-3 4M8 3l3 4M15 3l3 4"/><path d="M10 11l5 2-5 2z" fill="currentColor" stroke="none"/></> :
         kind === 'series' ? <><rect x="4" y="5" width="15" height="13" rx="2"/><path d="M8 2h12a2 2 0 0 1 2 2v12M10 10l5 2-5 2z" fill="currentColor" stroke="none"/></> :
         kind === 'add' ? <><path d="M4 5h16v14H4zM8 9h8M8 13h5"/><path d="M17 16v5m-2.5-2.5h5"/></> :
         <><polygon points="8.5,3 15.5,3 21,8.5 21,15.5 15.5,21 8.5,21 3,15.5 3,8.5"/><path d="M8 10h8M8 14h8"/><circle cx="10.5" cy="10" r="1.4" fill="currentColor" stroke="none"/><circle cx="14" cy="14" r="1.4" fill="currentColor" stroke="none"/></>}
      </svg>;
    }
    if (variant === 'broadcast') {
      return <svg {...common}>
        {kind === 'live' ? <><path d="M12 13v8M8 21h8M12 13l-4-4m4 4 4-4"/><circle cx="12" cy="12" r="2"/><path d="M5 5a10 10 0 0 0 0 14M19 5a10 10 0 0 1 0 14M8 8a6 6 0 0 0 0 8M16 8a6 6 0 0 1 0 8"/></> :
         kind === 'movies' ? <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M10 9l6 3-6 3z" fill="currentColor" stroke="none"/></> :
         kind === 'series' ? <><rect x="3" y="7" width="15" height="12" rx="2"/><path d="M7 4h14v12M9 11h5M9 15h3"/></> :
         kind === 'add' ? <><path d="M5 5h14M5 10h9M5 15h9M5 20h14"/><path d="M18 11v8m-4-4h8"/></> :
         <><circle cx="12" cy="12" r="8"/><path d="M9 9l6 6M15 9l-6 6"/><circle cx="12" cy="12" r="2.2" fill="currentColor" stroke="none"/></>}
      </svg>;
    }
    if (variant === 'crystal') {
      return <svg {...common}>
        <path d="M12 2 21 8 18 20 6 20 3 8Z" fill="currentColor" fillOpacity=".08"/><path d="M3 8h18M12 2l-3 6 3 12 3-12-3-6" opacity=".7"/>
        {kind === 'live' ? <path d="M9 10l6 2-6 2z" fill="currentColor" stroke="none"/> : kind === 'movies' ? <><circle cx="12" cy="13" r="4"/><path d="M12 9V5M8 13H5M16 13h3"/></> : kind === 'series' ? <><rect x="7" y="8" width="10" height="8" rx="1"/><path d="M10 10l4 2-4 2z" fill="currentColor" stroke="none"/></> : kind === 'add' ? <><path d="M8 9h8M8 13h8M8 17h5"/><path d="M17 4v5m-2.5-2.5h5"/></> : <><circle cx="12" cy="12" r="3"/><path d="M12 5v2m0 10v2M5 12h2m10 0h2"/></>}
      </svg>;
    }
    if (variant === 'neon') {
      return <svg {...common}>
        {kind === 'live' ? <><rect x="3" y="5" width="18" height="14" rx="4"/><path d="M8 2l4 3 4-3M10 10l5 2-5 2z" fill="currentColor" stroke="none"/></> :
         kind === 'movies' ? <><path d="M4 5h16v14H4zM4 5l4 4m3-4 4 4m3-4 2 2"/><path d="M10 11l5 2-5 2z" fill="currentColor" stroke="none"/></> :
         kind === 'series' ? <><rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8 8h8M8 12h8M8 16h4"/></> :
         kind === 'add' ? <><circle cx="12" cy="12" r="9"/><path d="M12 6v12M6 12h12"/></> :
         <><rect x="4" y="4" width="16" height="16" rx="4"/><line x1="8" y1="9.5" x2="16" y2="9.5"/><line x1="8" y1="14.5" x2="16" y2="14.5"/><circle cx="10.5" cy="9.5" r="1.4" fill="currentColor" stroke="none"/><circle cx="14" cy="14.5" r="1.4" fill="currentColor" stroke="none"/></>}
      </svg>;
    }
    return <svg {...common} shapeRendering="crispEdges">
      {kind === 'live' ? <><rect x="3" y="5" width="18" height="13"/><path d="M9 18v3m6-3v3M8 21h8M10 9h4v5h-4z" fill="currentColor" stroke="none"/></> :
       kind === 'movies' ? <><rect x="3" y="5" width="18" height="14"/><path d="M6 5v4m4-4v4m4-4v4m4-4v4M10 11h4v4h-4z" fill="currentColor" stroke="none"/></> :
       kind === 'series' ? <><rect x="3" y="4" width="18" height="16"/><path d="M7 8h3v3H7zM14 8h3v3h-3zM7 14h3v3H7zM14 14h3v3h-3z" fill="currentColor" stroke="none"/></> :
       kind === 'add' ? <><rect x="4" y="4" width="16" height="16"/><path d="M11 7h2v4h4v2h-4v4h-2v-4H7v-2h4z" fill="currentColor" stroke="none"/></> :
       <><rect x="4" y="4" width="16" height="16"/><path d="M7 9h10M7 15h10"/><rect x="9" y="7.5" width="3" height="3" fill="currentColor" stroke="none"/><rect x="13" y="13.5" width="3" height="3" fill="currentColor" stroke="none"/></>}
    </svg>;
  }
  return <AchourIconGlyph kind={kind} className={glyphClass} strokeWidth={strokeWidth} fill={fill} style={style} />;
}

export function StyledAppIcon({
  kind,
  active3DStyle,
  scale = 'md',
  iconSize = 'md',
}: {
  kind: IconKind;
  active3DStyle: Icon3DStyle;
  scale?: 'sm' | 'md' | 'lg' | 'hero';
  iconSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
}) {
  const boxCls = ICON_SIZE_CLASSES[scale][iconSize || 'md'] || ICON_SIZE_CLASSES[scale].md;
  const sizeFactor: Record<string, number> = { xs: 0.78, sm: 0.9, md: 1, lg: 1.15, xl: 1.3, '2xl': 1.45, '3xl': 1.6 };
  const baseSize: Record<string, number> = { sm: 32, md: 40, lg: 48, hero: 56 };
  const actualIconSize = Math.round((baseSize[scale] || 40) * (sizeFactor[iconSize || 'md'] || 1));
  const strokeWidth = active3DStyle.iconProps?.strokeWidth || 1.6;
  const fill = active3DStyle.iconProps?.fill || 'none';
  const glyphClass = `w-full h-full ${active3DStyle.iconClass}`;

  return (
    <div style={{ width: actualIconSize, height: actualIconSize, padding: Math.max(3, Math.round(actualIconSize * 0.14)) }} className={`flex items-center justify-center shrink-0 transition-transform duration-150 group-hover:scale-105 ${boxCls} ${active3DStyle.cardClass}`}>
      {renderIconGlyph({ kind, active3DStyle, glyphClass, strokeWidth, fill })}
    </div>
  );
}

type StudioIconShape =
  | 'hex'
  | 'ticket'
  | 'octagon'
  | 'duotone'
  | 'diamond'
  | 'shield'
  | 'monolith'
  | 'keycap'
  | 'capsule'
  | 'satin';

function StudioLayoutIcon({
  kind,
  shape,
  active3DStyle,
  scale = 'md',
  iconSize = 'md',
  highlight = false,
  inverted = false,
}: {
  kind: IconKind;
  shape: StudioIconShape;
  active3DStyle?: Icon3DStyle;
  scale?: 'sm' | 'md' | 'lg' | 'hero';
  iconSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  highlight?: boolean;
  inverted?: boolean;
}) {
  const boxCls = ICON_SIZE_CLASSES[scale][iconSize || 'md'] || ICON_SIZE_CLASSES[scale].md;
  const sizeFactor: Record<string, number> = { xs: 0.78, sm: 0.9, md: 1, lg: 1.15, xl: 1.3, '2xl': 1.45, '3xl': 1.6 };
  const baseSize: Record<string, number> = { sm: 32, md: 40, lg: 48, hero: 56 };
  const actualIconSize = Math.round((baseSize[scale] || 40) * (sizeFactor[iconSize || 'md'] || 1));
  const glyph = renderIconGlyph({
    kind,
    active3DStyle,
    glyphClass: `w-full h-full relative z-10 ${active3DStyle?.iconClass || ''}`,
    strokeWidth: active3DStyle?.iconProps?.strokeWidth || 1.85,
    fill: active3DStyle?.iconProps?.fill || 'none',
  });

  // All studio icon shapes use genuinely transparent glass fills so app wallpaper shows through
  if (shape === 'hex') {
    return (
      <div
        className={`relative flex items-center justify-center shrink-0 transition-transform duration-150 group-hover:scale-105 ${boxCls}`}
        style={{
          width: actualIconSize,
          height: actualIconSize,
          clipPath: 'polygon(50% 0%, 95% 25%, 95% 75%, 50% 100%, 5% 75%, 5% 25%)',
          background: highlight ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)',
          boxShadow: 'inset 0 0 0 1.5px var(--theme-primary)',
          color: 'var(--theme-primary)',
        }}
      >
        {glyph}
      </div>
    );
  }

  if (shape === 'diamond') {
    return (
      <div className={`relative flex items-center justify-center shrink-0 transition-transform duration-150 group-hover:scale-105 ${boxCls}`} style={{ width: actualIconSize, height: actualIconSize }}>
        <div
          className="w-full h-full rotate-45 rounded-xl flex items-center justify-center border-2"
          style={{
            background: highlight ? 'rgba(255,255,255,0.10)' : 'transparent',
            borderColor: 'var(--theme-primary)',
          }}
        >
          <div className="-rotate-45 w-[68%] h-[68%] flex items-center justify-center" style={{ color: 'var(--theme-primary)' }}>
            {glyph}
          </div>
        </div>
      </div>
    );
  }

  if (shape === 'octagon') {
    return (
      <div
        className={`relative flex items-center justify-center shrink-0 transition-transform duration-150 group-hover:scale-105 ${boxCls}`}
        style={{
          width: actualIconSize,
          height: actualIconSize,
          clipPath: 'polygon(28% 0%, 72% 0%, 100% 28%, 100% 72%, 72% 100%, 28% 100%, 0% 72%, 0% 28%)',
          background: highlight ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)',
          color: 'var(--theme-primary)',
        }}
      >
        {glyph}
      </div>
    );
  }

  if (shape === 'shield') {
    return (
      <div
        className={`relative flex items-center justify-center shrink-0 rounded-t-xl rounded-b-[1.35rem] border-2 transition-transform duration-150 group-hover:scale-105 ${boxCls}`}
        style={{
          width: actualIconSize,
          height: actualIconSize,
          background: highlight ? 'rgba(255,255,255,0.10)' : 'transparent',
          borderColor: highlight ? 'var(--theme-accent)' : 'var(--theme-primary)',
          color: 'var(--theme-primary)',
        }}
      >
        {glyph}
      </div>
    );
  }

  if (shape === 'duotone') {
    return (
      <div
        className={`relative flex items-center justify-center shrink-0 rounded-2xl border-2 transition-transform duration-150 group-hover:scale-105 ${boxCls}`}
        style={{
          width: actualIconSize,
          height: actualIconSize,
          backgroundColor: inverted ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.10)',
          borderColor: inverted ? 'rgba(255,255,255,0.28)' : 'var(--theme-primary)',
          color: 'var(--theme-primary)',
        }}
      >
        {glyph}
      </div>
    );
  }

  if (shape === 'keycap') {
    return (
      <div
        className={`relative flex items-center justify-center shrink-0 rounded-xl border transition-transform duration-150 group-hover:scale-105 ${boxCls}`}
        style={{
          width: actualIconSize,
          height: actualIconSize,
          background: highlight ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.03)',
          borderColor: highlight ? 'var(--theme-primary)' : 'rgba(255,255,255,0.24)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.16)',
          color: 'var(--theme-primary)',
        }}
      >
        {glyph}
      </div>
    );
  }

  if (shape === 'capsule') {
    return (
      <div
        className={`relative flex items-center justify-center shrink-0 rounded-full border-2 transition-transform duration-150 group-hover:scale-105 ${boxCls}`}
        style={{
          width: actualIconSize,
          height: actualIconSize,
          background: highlight ? 'rgba(255,255,255,0.10)' : 'transparent',
          borderColor: 'var(--theme-primary)',
          boxShadow: highlight ? '0 0 18px var(--theme-glow)' : 'none',
          color: 'var(--theme-primary)',
        }}
      >
        {glyph}
      </div>
    );
  }

  if (shape === 'satin') {
    return (
      <div
        className={`relative flex items-center justify-center shrink-0 rounded-full border-2 p-1 transition-transform duration-150 group-hover:scale-105 ${boxCls}`}
        style={{
          width: actualIconSize,
          height: actualIconSize,
          backgroundColor: 'transparent',
          borderColor: 'var(--theme-primary)',
          boxShadow: 'inset 0 0 0 2px rgba(255,255,255,0.22)',
          color: highlight ? 'var(--theme-accent)' : 'var(--theme-primary)',
        }}
      >
        <div className="w-[78%] h-[78%] flex items-center justify-center">
          {glyph}
        </div>
      </div>
    );
  }

  // 'ticket' and 'monolith' transparent plates
  return (
    <div
      className={`relative flex items-center justify-center shrink-0 rounded-tr-2xl rounded-bl-2xl rounded-tl-md rounded-br-md border-2 transition-transform duration-150 group-hover:scale-105 ${boxCls}`}
      style={{
        width: actualIconSize,
        height: actualIconSize,
        background: highlight ? 'rgba(255,255,255,0.09)' : 'transparent',
        borderColor: highlight ? 'var(--theme-accent)' : 'var(--theme-primary)',
        color: 'var(--theme-primary)',
      }}
    >
      {glyph}
    </div>
  );
}

function FramelessGlyph({
  kind,
  active3DStyle,
  iconSize = 'md',
}: {
  kind: IconKind;
  active3DStyle?: Icon3DStyle;
  iconSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
}) {
  const pixelSizes: Record<string, number> = { xs: 32, sm: 40, md: 48, lg: 56, xl: 64, '2xl': 80, '3xl': 96 };
  const iconPx = pixelSizes[iconSize || 'md'] || 48;
  const cls = `${active3DStyle?.iconClass || 'text-[var(--theme-primary)] drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]'} transition-transform duration-150 group-hover:scale-110`;
  const iconStyle = { width: iconPx, height: iconPx };
  return renderIconGlyph({
    kind,
    active3DStyle,
    glyphClass: cls,
    strokeWidth: active3DStyle?.iconProps?.strokeWidth || 1.95,
    fill: active3DStyle?.iconProps?.fill || 'none',
    style: iconStyle,
  });
}

// Transparent frame design tokens — app wallpaper cleanly shows through all frames
const GLASS_CARD =
  'bg-transparent hover:bg-white/[0.04] border border-white/20 hover:border-[var(--theme-primary)]/70 shadow-[0_8px_24px_rgba(0,0,0,0.12)] transition-all duration-200 cursor-pointer group focus:outline-none relative';
const GLASS_HERO =
  'bg-white/[0.02] hover:bg-white/[0.06] border border-[var(--theme-primary)]/50 hover:border-[var(--theme-primary)] shadow-[0_12px_32px_rgba(0,0,0,0.16)] transition-all duration-200 cursor-pointer group focus:outline-none relative';
const CRYSTAL_FRAME =
  'bg-transparent hover:bg-white/[0.04] border border-white/25 hover:border-[var(--theme-primary)]/75 shadow-[0_10px_28px_rgba(0,0,0,0.14)] backdrop-blur-[2px] transition-all duration-200 cursor-pointer group focus:outline-none relative';
const CRYSTAL_HERO_FRAME =
  'bg-white/[0.03] hover:bg-white/[0.06] border border-[var(--theme-primary)]/55 hover:border-[var(--theme-primary)] shadow-[0_14px_36px_rgba(0,0,0,0.18)] backdrop-blur-[2px] transition-all duration-200 cursor-pointer group focus:outline-none relative';

export default function DashboardLayouts({
  layoutId,
  dashboardOrder,
  active3DStyle,
  iconSize = 'md',
  frameScale = 'md',
  tileSpacing = 'md',
  reorderingKind = null,
  language,
  isRtl,
  t,
  onNavigate,
}: DashboardLayoutsProps) {
  const effectiveLayout = VALID_DASHBOARD_LAYOUTS.includes((layoutId || '') as any)
    ? (layoutId as (typeof VALID_DASHBOARD_LAYOUTS)[number])
    : 'layout-frameless-icons';

  const isPhone = isMobileDevice();
  const spacingPxMap: Record<string, number> = { xs: 6, sm: 10, md: 14, lg: 22, xl: 32 };
  const frameScaleFactorMap: Record<string, number> = { xs: 0.78, sm: 0.88, md: 1, lg: 1.12, xl: 1.24, '2xl': 1.36, '3xl': 1.5 };
  const activeGap = !isPhone ? (spacingPxMap[tileSpacing || 'md'] ?? 14) : undefined;
  const activeFrameFactor = !isPhone ? (frameScaleFactorMap[frameScale || 'md'] ?? 1) : 1;

  // Helpers so spacing & frame size remain 100% independent of iconSize and untouched on phone
  const gapStyle = (extra?: React.CSSProperties): React.CSSProperties | undefined =>
    activeGap !== undefined ? { gap: `${activeGap}px`, ...extra } : extra;

  const frameBoxStyle = (basePadPx: number, baseMinHPx?: number, extra?: React.CSSProperties): React.CSSProperties | undefined => {
    if (isPhone) return extra;
    const scaledPad = Math.max(4, Math.round(basePadPx * activeFrameFactor));
    const s: React.CSSProperties = {
      padding: `${scaledPad}px`,
      ...(baseMinHPx ? { minHeight: `${Math.round(baseMinHPx * activeFrameFactor)}px` } : {}),
      ...extra,
    };
    return s;
  };

  const reorderCls = (kind: IconKind) =>
    reorderingKind === kind
      ? 'ring-4 ring-[var(--theme-primary)] bg-white/[0.08] scale-[1.04] z-30 shadow-[0_0_28px_var(--theme-glow)]'
      : '';

  const ReorderBadge = ({ kind }: { kind: IconKind }) =>
    reorderingKind === kind ? (
      <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-md bg-[var(--theme-primary)] text-black text-[10px] font-black flex items-center gap-1 shadow-lg z-30 pointer-events-none">
        <Move size={10} />
      </span>
    ) : null;

  const labels = React.useMemo(() => {
    const subs: Record<Language, Record<IconKind, string>> = {
      ar: {
        live: 'البث والقنوات',
        movies: 'مكتبة السينما',
        series: 'المواسم والحلقات',
        add: 'الاشتراكات والروابط',
        settings: 'المظهر والنظام',
      },
      en: {
        live: 'Channels & TV',
        movies: 'Cinema Library',
        series: 'Seasons & Shows',
        add: 'IPTV Sources',
        settings: 'Look & System',
      },
      de: {
        live: 'TV & Kanäle',
        movies: 'Kino-Bibliothek',
        series: 'Staffeln & Serien',
        add: 'IPTV-Listen',
        settings: 'Design & System',
      },
      fr: {
        live: 'Chaînes & Direct',
        movies: 'Cinéma VOD',
        series: 'Saisons & Épisodes',
        add: 'Sources IPTV',
        settings: 'Style & Système',
      },
    };
    const s = subs[language] || subs.en;
    return {
      live: { kind: 'live' as IconKind, title: t('live'), sub: s.live, action: () => onNavigate('live') },
      movies: { kind: 'movies' as IconKind, title: t('movies'), sub: s.movies, action: () => onNavigate('movies') },
      series: { kind: 'series' as IconKind, title: t('series'), sub: s.series, action: () => onNavigate('series') },
      add: { kind: 'add' as IconKind, title: t('playlist'), sub: s.add, action: () => onNavigate('add') },
      settings: { kind: 'settings' as IconKind, title: t('settings'), sub: s.settings, action: () => onNavigate('settings') },
    };
  }, [language, t, onNavigate]);

  const defaultOrder = ['live', 'movies', 'series', 'add', 'settings'];
  const normalizedOrder = [...(dashboardOrder || []), ...defaultOrder].filter((kind, index, list) => defaultOrder.includes(kind) && list.indexOf(kind) === index);
  const allItems = normalizedOrder.map(kind => labels[kind as IconKind]);
  const [slot0, slot1, slot2, slot3, slot4] = allItems;
  const heroItem = slot0;
  const dockItems = [slot1, slot2, slot3, slot4];
  const ArrowIcon = isRtl ? ChevronLeft : ChevronRight;

  // 1. FRAMELESS PURE ICONS (الخيار الأول دائماً: أيقونات فقط دون إطارات)
  if (effectiveLayout === 'layout-frameless-icons') {
    return (
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 pb-6 w-full max-w-6xl mx-auto overflow-hidden">
        <div
          className="grid grid-cols-2 sm:grid-cols-5 gap-6 sm:gap-10 w-full items-center justify-items-center"
          style={gapStyle()}
        >
          {allItems.map((item) => (
            <button
              key={item.kind}
              data-tv-focusable="true"
              data-dashboard-kind={item.kind}
              tabIndex={0}
              onClick={item.action}
              className={`relative flex flex-col items-center justify-center gap-3 p-3 rounded-2xl bg-transparent border-0 shadow-none transition-transform duration-150 hover:scale-110 cursor-pointer group focus:outline-none w-full max-w-[160px] ${reorderCls(item.kind)}`}
            >
              <ReorderBadge kind={item.kind} />
              <div className="flex items-center justify-center bg-transparent border-0 shadow-none transition-transform duration-150 group-hover:scale-105">
                <FramelessGlyph kind={item.kind} active3DStyle={active3DStyle} iconSize={iconSize} />
              </div>
              <span className="text-sm sm:text-base font-bold tracking-wide truncate max-w-full text-white group-hover:text-gold transition-colors drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                {item.title}
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // 2. PURE APP ICONS SHOWCASE
  if (effectiveLayout === 'layout-pure-icons') {
    return (
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 pb-6 w-full max-w-6xl mx-auto overflow-hidden">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-5 sm:gap-7 w-full items-center justify-items-center" style={gapStyle()}>
          {allItems.map((item) => (
            <button
              key={item.kind}
              data-tv-focusable="true"
              data-dashboard-kind={item.kind}
              tabIndex={0}
              onClick={item.action}
              style={frameBoxStyle(12)}
              className={`relative flex flex-col items-center justify-center gap-3 p-3 rounded-3xl bg-transparent border border-white/15 hover:border-[var(--theme-primary)]/60 transition-colors cursor-pointer group focus:outline-none w-full ${reorderCls(item.kind)}`}
            >
              <ReorderBadge kind={item.kind} />
              <StyledAppIcon kind={item.kind} active3DStyle={active3DStyle} scale="hero" iconSize={iconSize} />
              <span className="text-xs sm:text-sm font-medium tracking-wide truncate max-w-full text-gold group-hover:brightness-125">
                {item.title}
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // 3. GLASS HERO & 4-TILE BOTTOM DOCK
  if (effectiveLayout === 'layout-glass-hero-dock') {
    return (
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center gap-4 px-4 sm:px-8 pb-5 w-full max-w-6xl mx-auto overflow-hidden" style={gapStyle()}>
        <button
          data-tv-focusable="true"
          data-dashboard-kind={heroItem.kind}
          tabIndex={0}
          onClick={heroItem.action}
          style={frameBoxStyle(22)}
          className={`w-full rounded-3xl p-5 sm:p-7 flex items-center justify-between gap-4 ${GLASS_HERO} ${isRtl ? 'text-right' : 'text-left'} ${reorderCls(heroItem.kind)}`}
        >
          <ReorderBadge kind={heroItem.kind} />
          <div className="flex items-center gap-4 sm:gap-6 min-w-0">
            <StyledAppIcon kind={heroItem.kind} active3DStyle={active3DStyle} scale="hero" iconSize={iconSize} />
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-xs text-gold font-mono uppercase tracking-widest mb-1">
                <Radio size={14} className="text-gold" />
                <span>{heroItem.sub}</span>
              </div>
              <h2 className="text-xl sm:text-3xl font-semibold text-white group-hover:text-gold transition-colors truncate">
                {heroItem.title}
              </h2>
            </div>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-gold shrink-0">
            <ArrowIcon size={22} />
          </div>
        </button>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full" style={gapStyle()}>
          {dockItems.map((item) => (
            <button
              key={item.kind}
              data-tv-focusable="true"
              data-dashboard-kind={item.kind}
              tabIndex={0}
              onClick={item.action}
              style={frameBoxStyle(14)}
              className={`rounded-2xl p-3.5 sm:p-4 flex flex-col items-center justify-center gap-2.5 text-center ${GLASS_CARD} ${reorderCls(item.kind)}`}
            >
              <ReorderBadge kind={item.kind} />
              <StyledAppIcon kind={item.kind} active3DStyle={active3DStyle} scale="md" iconSize={iconSize} />
              <div className="w-full min-w-0">
                <div className="text-xs sm:text-sm font-medium text-white group-hover:text-gold truncate">{item.title}</div>
                <div className="text-[10px] sm:text-xs text-zinc-400 truncate mt-0.5">{item.sub}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // 4. LEFT GLASS NAVIGATION RAIL + 3 MEDIA SHOWCASE CARDS
  if (effectiveLayout === 'layout-vertical-rail') {
    const mediaCards = [slot0, slot1, slot2];
    const railItems = [slot3, slot4];
    return (
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-8 pb-5 w-full max-w-6xl mx-auto overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 w-full items-stretch" style={gapStyle()}>
          <div className="md:col-span-4 p-1 flex flex-col justify-center gap-2.5" style={gapStyle()}>
            {railItems.map((item) => (
              <button
                key={item.kind}
                data-tv-focusable="true"
                data-dashboard-kind={item.kind}
                tabIndex={0}
                onClick={item.action}
                style={frameBoxStyle(14)}
                className={`flex-1 rounded-2xl px-3.5 py-3 flex items-center gap-3 ${GLASS_CARD} ${isRtl ? 'text-right' : 'text-left'} ${reorderCls(item.kind)}`}
              >
                <ReorderBadge kind={item.kind} />
                <StyledAppIcon kind={item.kind} active3DStyle={active3DStyle} scale="sm" iconSize={iconSize} />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-gold truncate">{item.title}</div>
                  <div className="text-[11px] text-zinc-400 truncate">{item.sub}</div>
                </div>
                <ArrowIcon size={16} className="text-zinc-500 group-hover:text-gold shrink-0" />
              </button>
            ))}
          </div>

          <div className="md:col-span-8 grid grid-cols-3 gap-3.5" style={gapStyle()}>
            {mediaCards.map((item, i) => (
              <button
                key={item.kind}
                data-tv-focusable="true"
                data-dashboard-kind={item.kind}
                tabIndex={0}
                onClick={item.action}
                style={frameBoxStyle(18, 210)}
                className={`rounded-3xl p-4 sm:p-5 flex flex-col items-center justify-between text-center min-h-[190px] sm:min-h-[240px] ${
                  i === 0 ? GLASS_HERO : GLASS_CARD
                } ${reorderCls(item.kind)}`}
              >
                <ReorderBadge kind={item.kind} />
                <span className="text-[11px] font-mono text-gold/75 tracking-widest">0{i + 1}</span>
                <StyledAppIcon kind={item.kind} active3DStyle={active3DStyle} scale="lg" iconSize={iconSize} />
                <div className="w-full">
                  <div className="text-sm sm:text-lg font-semibold text-white group-hover:text-gold truncate">{item.title}</div>
                  <div className="text-[11px] text-zinc-400 truncate mt-0.5">{item.sub}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 5. VERTICAL CINEMA MARQUEE
  if (effectiveLayout === 'layout-cinema-marquee') {
    return (
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center gap-3 px-4 sm:px-8 pb-4 w-full max-w-6xl mx-auto overflow-hidden">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 w-full" style={gapStyle()}>
          {allItems.map((item, idx) => (
            <button
              key={item.kind}
              data-tv-focusable="true"
              data-dashboard-kind={item.kind}
              tabIndex={0}
              onClick={item.action}
              style={frameBoxStyle(16, 220)}
              className={`rounded-3xl p-4 flex flex-col items-center justify-between text-center h-44 sm:h-64 ${
                idx === 0 ? GLASS_HERO : GLASS_CARD
              } ${reorderCls(item.kind)}`}
            >
              <ReorderBadge kind={item.kind} />
              <StyledAppIcon kind={item.kind} active3DStyle={active3DStyle} scale="lg" iconSize={iconSize} />
              <div className="w-full pt-2">
                <div className="text-sm sm:text-base font-semibold text-gold truncate">{item.title}</div>
                <div className="text-[11px] text-zinc-400 truncate mt-0.5">{item.sub}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // 6. ASYMMETRIC GLASS BENTO
  if (effectiveLayout === 'layout-asymmetric-bento') {
    return (
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-8 pb-5 w-full max-w-6xl mx-auto overflow-hidden">
        <div className="grid grid-cols-2 sm:grid-cols-12 gap-3 w-full" style={gapStyle()}>
          <button
            data-tv-focusable="true"
            data-dashboard-kind={slot0.kind}
            tabIndex={0}
            onClick={slot0.action}
            style={frameBoxStyle(20, 220)}
            className={`col-span-2 sm:col-span-5 rounded-3xl p-5 flex flex-col items-start justify-between min-h-[160px] sm:min-h-[240px] ${GLASS_HERO} ${
              isRtl ? 'text-right items-end' : 'text-left'
            } ${reorderCls(slot0.kind)}`}
          >
            <ReorderBadge kind={slot0.kind} />
            <StyledAppIcon kind={slot0.kind} active3DStyle={active3DStyle} scale="hero" iconSize={iconSize} />
            <div className="w-full">
              <div className="text-xs font-mono text-gold uppercase tracking-wider mb-1">{slot0.sub}</div>
              <div className="text-xl sm:text-2xl font-semibold text-white group-hover:text-gold">{slot0.title}</div>
            </div>
          </button>

          <div className="col-span-2 sm:col-span-4 grid grid-rows-2 gap-3" style={gapStyle()}>
            <button
              data-tv-focusable="true"
              data-dashboard-kind={slot1.kind}
              tabIndex={0}
              onClick={slot1.action}
              style={frameBoxStyle(16)}
              className={`rounded-3xl p-4 flex items-center gap-3.5 ${GLASS_CARD} ${isRtl ? 'text-right' : 'text-left'} ${reorderCls(slot1.kind)}`}
            >
              <ReorderBadge kind={slot1.kind} />
              <StyledAppIcon kind={slot1.kind} active3DStyle={active3DStyle} scale="md" iconSize={iconSize} />
              <div className="min-w-0">
                <div className="text-base sm:text-lg font-semibold text-white group-hover:text-gold truncate">{slot1.title}</div>
                <div className="text-xs text-zinc-400 truncate">{slot1.sub}</div>
              </div>
            </button>
            <button
              data-tv-focusable="true"
              data-dashboard-kind={slot3.kind}
              tabIndex={0}
              onClick={slot3.action}
              style={frameBoxStyle(16)}
              className={`rounded-3xl p-4 flex items-center gap-3.5 ${GLASS_CARD} ${isRtl ? 'text-right' : 'text-left'} ${reorderCls(slot3.kind)}`}
            >
              <ReorderBadge kind={slot3.kind} />
              <StyledAppIcon kind={slot3.kind} active3DStyle={active3DStyle} scale="md" iconSize={iconSize} />
              <div className="min-w-0">
                <div className="text-base font-medium text-gold truncate">{slot3.title}</div>
                <div className="text-xs text-zinc-400 truncate">{slot3.sub}</div>
              </div>
            </button>
          </div>

          <div className="col-span-2 sm:col-span-3 flex flex-col gap-3" style={gapStyle()}>
            <button
              data-tv-focusable="true"
              data-dashboard-kind={slot2.kind}
              tabIndex={0}
              onClick={slot2.action}
              style={frameBoxStyle(16)}
              className={`flex-1 rounded-3xl p-4 flex flex-col items-center justify-center text-center gap-2 ${GLASS_CARD} ${reorderCls(slot2.kind)}`}
            >
              <ReorderBadge kind={slot2.kind} />
              <StyledAppIcon kind={slot2.kind} active3DStyle={active3DStyle} scale="md" iconSize={iconSize} />
              <div className="text-sm sm:text-base font-semibold text-white group-hover:text-gold">{slot2.title}</div>
            </button>
            <button
              data-tv-focusable="true"
              data-dashboard-kind={slot4.kind}
              tabIndex={0}
              onClick={slot4.action}
              style={frameBoxStyle(12)}
              className={`rounded-2xl p-3 flex flex-col items-center justify-center gap-1.5 ${GLASS_CARD} ${reorderCls(slot4.kind)}`}
            >
              <ReorderBadge kind={slot4.kind} />
              <StyledAppIcon kind={slot4.kind} active3DStyle={active3DStyle} scale="sm" iconSize={iconSize} />
              <span className="text-[11px] font-medium text-gold truncate max-w-full">{slot4.title}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 7. DUAL GLASS CINEMA SPLIT
  if (effectiveLayout === 'layout-dual-cinema-split') {
    const quad = [slot1, slot2, slot3, slot4];
    return (
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center gap-3 px-4 sm:px-8 pb-4 w-full max-w-6xl mx-auto overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 w-full" style={gapStyle()}>
          <button
            data-tv-focusable="true"
            data-dashboard-kind={slot0.kind}
            tabIndex={0}
            onClick={slot0.action}
            style={frameBoxStyle(24, 225)}
            className={`rounded-3xl p-6 flex flex-col items-center justify-center text-center gap-4 min-h-[190px] sm:min-h-[245px] ${GLASS_HERO} ${reorderCls(slot0.kind)}`}
          >
            <ReorderBadge kind={slot0.kind} />
            <StyledAppIcon kind={slot0.kind} active3DStyle={active3DStyle} scale="hero" iconSize={iconSize} />
            <div>
              <h2 className="text-2xl sm:text-3xl font-semibold text-white group-hover:text-gold transition-colors">
                {slot0.title}
              </h2>
              <p className="text-xs sm:text-sm text-gold/85 mt-1">{slot0.sub}</p>
            </div>
          </button>

          <div className="grid grid-cols-2 gap-3" style={gapStyle()}>
            {quad.map((item) => (
              <button
                key={item.kind}
                data-tv-focusable="true"
                data-dashboard-kind={item.kind}
                tabIndex={0}
                onClick={item.action}
                style={frameBoxStyle(16)}
                className={`rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-2.5 ${GLASS_CARD} ${reorderCls(item.kind)}`}
              >
                <ReorderBadge kind={item.kind} />
                <StyledAppIcon kind={item.kind} active3DStyle={active3DStyle} scale="md" iconSize={iconSize} />
                <div className="text-sm font-medium text-white group-hover:text-gold truncate w-full">{item.title}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 8. FLOATING GLASS CONSOLE BAR
  if (effectiveLayout === 'layout-floating-console-bar') {
    const ordered = [
      { item: slot1, h: 'h-36 sm:h-44', center: false, minH: 170 },
      { item: slot2, h: 'h-42 sm:h-52', center: false, minH: 200 },
      { item: slot0, h: 'h-52 sm:h-64', center: true, minH: 240 },
      { item: slot3, h: 'h-42 sm:h-52', center: false, minH: 200 },
      { item: slot4, h: 'h-36 sm:h-44', center: false, minH: 170 },
    ];
    return (
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center gap-4 px-4 sm:px-8 pb-4 w-full max-w-6xl mx-auto overflow-hidden">
        <div className="flex flex-wrap sm:flex-nowrap items-center justify-center gap-2.5 sm:gap-3.5 w-full" style={gapStyle()}>
          {ordered.map(({ item, h, center, minH }) => (
            <button
              key={item.kind}
              data-tv-focusable="true"
              data-dashboard-kind={item.kind}
              tabIndex={0}
              onClick={item.action}
              style={frameBoxStyle(14, minH)}
              className={`flex-1 min-w-[100px] ${h} rounded-3xl p-3.5 flex flex-col items-center justify-center text-center gap-3 ${
                center ? GLASS_HERO : GLASS_CARD
              } ${reorderCls(item.kind)}`}
            >
              <ReorderBadge kind={item.kind} />
              <StyledAppIcon kind={item.kind} active3DStyle={active3DStyle} scale={center ? 'hero' : 'md'} iconSize={iconSize} />
              <div className="w-full">
                <div className={`font-semibold truncate ${center ? 'text-base sm:text-xl text-gold' : 'text-xs sm:text-sm text-white group-hover:text-gold'}`}>
                  {item.title}
                </div>
                {center && <div className="text-[11px] text-zinc-300 truncate mt-0.5">{item.sub}</div>}
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // 9. TIERED GLASS PYRAMID
  if (effectiveLayout === 'layout-pyramid-tier') {
    const topTwo = [slot0, slot1];
    const bottomThree = [slot2, slot3, slot4];
    return (
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center gap-3.5 px-4 sm:px-8 pb-5 w-full max-w-5xl mx-auto overflow-hidden" style={gapStyle()}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full" style={gapStyle()}>
          {topTwo.map((item, idx) => (
            <button
              key={item.kind}
              data-tv-focusable="true"
              data-dashboard-kind={item.kind}
              tabIndex={0}
              onClick={item.action}
              style={frameBoxStyle(20, 136)}
              className={`rounded-3xl p-5 flex items-center gap-4 min-h-[120px] sm:min-h-[142px] ${
                idx === 0 ? GLASS_HERO : GLASS_CARD
              } ${isRtl ? 'text-right' : 'text-left'} ${reorderCls(item.kind)}`}
            >
              <ReorderBadge kind={item.kind} />
              <StyledAppIcon kind={item.kind} active3DStyle={active3DStyle} scale="lg" iconSize={iconSize} />
              <div className="min-w-0 flex-1">
                <div className="text-lg sm:text-2xl font-semibold text-white group-hover:text-gold truncate">{item.title}</div>
                <div className="text-xs sm:text-sm text-gold/80 truncate mt-1">{item.sub}</div>
              </div>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-3 w-full" style={gapStyle()}>
          {bottomThree.map((item) => (
            <button
              key={item.kind}
              data-tv-focusable="true"
              data-dashboard-kind={item.kind}
              tabIndex={0}
              onClick={item.action}
              style={frameBoxStyle(16)}
              className={`rounded-2xl p-4 flex flex-col items-center justify-center gap-2 text-center ${GLASS_CARD} ${reorderCls(item.kind)}`}
            >
              <ReorderBadge kind={item.kind} />
              <StyledAppIcon kind={item.kind} active3DStyle={active3DStyle} scale="md" iconSize={iconSize} />
              <span className="text-xs sm:text-sm font-medium truncate w-full text-white group-hover:text-gold">
                {item.title}
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // 10. HORIZONTAL STRIPS & RIGHT UTILITY TOWER
  if (effectiveLayout === 'layout-right-command-panel') {
    const leftStrips = [slot0, slot1, slot2];
    const rightTower = [slot3, slot4];
    return (
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-8 pb-5 w-full max-w-6xl mx-auto overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 w-full" style={gapStyle()}>
          <div className="md:col-span-8 flex flex-col gap-3" style={gapStyle()}>
            {leftStrips.map((item, idx) => (
              <button
                key={item.kind}
                data-tv-focusable="true"
                data-dashboard-kind={item.kind}
                tabIndex={0}
                onClick={item.action}
                style={frameBoxStyle(16)}
                className={`rounded-2xl px-5 py-3.5 flex items-center justify-between gap-4 ${
                  idx === 0 ? GLASS_HERO : GLASS_CARD
                } ${isRtl ? 'text-right' : 'text-left'} ${reorderCls(item.kind)}`}
              >
                <ReorderBadge kind={item.kind} />
                <div className="flex items-center gap-4 min-w-0">
                  <StyledAppIcon kind={item.kind} active3DStyle={active3DStyle} scale="md" iconSize={iconSize} />
                  <div className="min-w-0">
                    <div className="text-base sm:text-xl font-semibold text-white group-hover:text-gold truncate">{item.title}</div>
                    <div className="text-xs text-zinc-400 truncate">{item.sub}</div>
                  </div>
                </div>
                <ArrowIcon size={20} className="text-gold shrink-0" />
              </button>
            ))}
          </div>

          <div className="md:col-span-4 p-1 grid grid-cols-2 md:grid-cols-1 gap-2.5" style={gapStyle()}>
            {rightTower.map((item) => (
              <button
                key={item.kind}
                data-tv-focusable="true"
                data-dashboard-kind={item.kind}
                tabIndex={0}
                onClick={item.action}
                style={frameBoxStyle(14)}
                className={`rounded-2xl p-3 flex flex-col md:flex-row items-center justify-center md:justify-start gap-2.5 ${GLASS_CARD} ${reorderCls(item.kind)}`}
              >
                <ReorderBadge kind={item.kind} />
                <StyledAppIcon kind={item.kind} active3DStyle={active3DStyle} scale="sm" iconSize={iconSize} />
                <span className="text-xs sm:text-sm font-medium truncate text-gold">
                  {item.title}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 11. CHAMFERED GLASS PRISM GRID
  if (effectiveLayout === 'layout-chamfer-prism-grid') {
    return (
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center gap-3.5 px-4 sm:px-8 pb-5 w-full max-w-5xl mx-auto overflow-hidden" style={gapStyle()}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 w-full" style={gapStyle()}>
          {[slot0, slot1, slot2].map((item, idx) => (
            <button
              key={item.kind}
              data-tv-focusable="true"
              data-dashboard-kind={item.kind}
              tabIndex={0}
              onClick={item.action}
              style={frameBoxStyle(18)}
              className={`rounded-tl-3xl rounded-br-3xl rounded-tr-lg rounded-bl-lg p-5 flex items-center gap-3.5 ${
                idx === 0 ? GLASS_HERO : GLASS_CARD
              } ${isRtl ? 'text-right' : 'text-left'} ${reorderCls(item.kind)}`}
            >
              <ReorderBadge kind={item.kind} />
              <StyledAppIcon kind={item.kind} active3DStyle={active3DStyle} scale="md" iconSize={iconSize} />
              <div className="min-w-0">
                <div className="text-base sm:text-lg font-semibold text-white group-hover:text-gold truncate">{item.title}</div>
                <div className="text-[11px] text-gold/80 truncate">{item.sub}</div>
              </div>
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full sm:w-2/3" style={gapStyle()}>
          {[slot3, slot4].map((item) => (
            <button
              key={item.kind}
              data-tv-focusable="true"
              data-dashboard-kind={item.kind}
              tabIndex={0}
              onClick={item.action}
              style={frameBoxStyle(14)}
              className={`rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md p-4 flex items-center justify-center gap-3 ${GLASS_CARD} ${reorderCls(item.kind)}`}
            >
              <ReorderBadge kind={item.kind} />
              <StyledAppIcon kind={item.kind} active3DStyle={active3DStyle} scale="sm" iconSize={iconSize} />
              <span className="text-sm font-medium truncate text-gold">
                {item.title}
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // 12. EDITORIAL GLASS STAGE
  if (effectiveLayout === 'layout-editorial-showcase') {
    return (
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-8 pb-5 w-full max-w-4xl mx-auto overflow-hidden">
        <div className="w-full flex flex-col gap-2" style={gapStyle()}>
          {allItems.map((item, idx) => (
            <button
              key={item.kind}
              data-tv-focusable="true"
              data-dashboard-kind={item.kind}
              tabIndex={0}
              onClick={item.action}
              style={frameBoxStyle(12)}
              className={`w-full rounded-2xl px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-4 ${GLASS_CARD} ${
                isRtl ? 'text-right' : 'text-left'
              } ${reorderCls(item.kind)}`}
            >
              <ReorderBadge kind={item.kind} />
              <div className="flex items-center gap-4 min-w-0">
                <span className="text-xs font-mono text-gold/75 w-6 shrink-0">0{idx + 1}</span>
                <StyledAppIcon kind={item.kind} active3DStyle={active3DStyle} scale="sm" iconSize={iconSize} />
                <span className="text-base sm:text-xl font-medium truncate text-white group-hover:text-gold">
                  {item.title}
                </span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="hidden sm:inline text-xs text-zinc-400">{item.sub}</span>
                <ArrowIcon size={18} className="text-gold/70 group-hover:text-gold" />
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // 13. ORBITAL GLASS MEDALLIONS
  if (effectiveLayout === 'layout-orbital-medallions') {
    const discs = [
      { item: slot4, baseDim: 112, iconScale: 'sm' as const, hero: false },
      { item: slot1, baseDim: 142, iconScale: 'md' as const, hero: false },
      { item: slot0, baseDim: 184, iconScale: 'hero' as const, hero: true },
      { item: slot2, baseDim: 142, iconScale: 'md' as const, hero: false },
      { item: slot3, baseDim: 112, iconScale: 'sm' as const, hero: false },
    ];
    return (
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center gap-4 px-4 pb-4 w-full max-w-6xl mx-auto overflow-hidden">
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5" style={gapStyle()}>
          {discs.map(({ item, baseDim, iconScale, hero }) => {
            const dim = Math.round(baseDim * activeFrameFactor);
            return (
              <button
                key={item.kind}
                data-tv-focusable="true"
                data-dashboard-kind={item.kind}
                tabIndex={0}
                onClick={item.action}
                style={!isPhone ? { width: `${dim}px`, height: `${dim}px`, padding: '8px' } : undefined}
                className={`${isPhone ? (hero ? 'w-32 h-32' : 'w-24 h-24') : ''} rounded-full flex flex-col items-center justify-center text-center p-2 gap-1.5 ${
                  hero ? GLASS_HERO : GLASS_CARD
                } ${reorderCls(item.kind)}`}
              >
                <ReorderBadge kind={item.kind} />
                <StyledAppIcon kind={item.kind} active3DStyle={active3DStyle} scale={iconScale} iconSize={iconSize} />
                <span className={`font-medium truncate max-w-[90%] ${hero ? 'text-sm sm:text-base text-gold' : 'text-[11px] sm:text-xs text-white group-hover:text-gold'}`}>
                  {item.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // 14. SMART TV LEANBACK LANES
  if (effectiveLayout === 'layout-leanback-lanes') {
    return (
      <div className="relative z-10 flex-1 flex flex-col justify-center gap-4 px-4 sm:px-8 pb-5 w-full max-w-6xl mx-auto overflow-hidden" style={gapStyle()}>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 w-full" style={gapStyle()}>
          <button
            data-tv-focusable="true"
            data-dashboard-kind={slot0.kind}
            tabIndex={0}
            onClick={slot0.action}
            style={frameBoxStyle(20, 120)}
            className={`sm:col-span-2 rounded-3xl p-5 flex items-center gap-4 min-h-[120px] ${GLASS_HERO} ${isRtl ? 'text-right' : 'text-left'} ${reorderCls(slot0.kind)}`}
          >
            <ReorderBadge kind={slot0.kind} />
            <StyledAppIcon kind={slot0.kind} active3DStyle={active3DStyle} scale="hero" iconSize={iconSize} />
            <div className="min-w-0">
              <div className="text-xl sm:text-2xl font-semibold text-white group-hover:text-gold truncate">{slot0.title}</div>
              <div className="text-xs text-gold/85 truncate mt-1">{slot0.sub}</div>
            </div>
          </button>
          {[slot1, slot2].map((item) => (
            <button
              key={item.kind}
              data-tv-focusable="true"
              data-dashboard-kind={item.kind}
              tabIndex={0}
              onClick={item.action}
              style={frameBoxStyle(16, 120)}
              className={`rounded-3xl p-4 flex flex-col items-center justify-center text-center gap-2 min-h-[120px] ${GLASS_CARD} ${reorderCls(item.kind)}`}
            >
              <ReorderBadge kind={item.kind} />
              <StyledAppIcon kind={item.kind} active3DStyle={active3DStyle} scale="md" iconSize={iconSize} />
              <div className="text-base font-semibold text-white group-hover:text-gold truncate w-full">{item.title}</div>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 w-full max-w-2xl mx-auto" style={gapStyle()}>
          {[slot3, slot4].map((item) => (
            <button
              key={item.kind}
              data-tv-focusable="true"
              data-dashboard-kind={item.kind}
              tabIndex={0}
              onClick={item.action}
              style={frameBoxStyle(14)}
              className={`rounded-2xl px-4 py-3.5 flex items-center justify-center gap-3 ${GLASS_CARD} ${reorderCls(item.kind)}`}
            >
              <ReorderBadge kind={item.kind} />
              <StyledAppIcon kind={item.kind} active3DStyle={active3DStyle} scale="sm" iconSize={iconSize} />
              <span className="text-xs sm:text-sm font-medium truncate text-gold">
                {item.title}
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // 15. FOUR QUADRANTS & CENTER HUB
  if (effectiveLayout === 'layout-quadrant-hub') {
    const corners = [slot1, slot2, slot3, slot4];
    const centerDim = Math.round(128 * activeFrameFactor);
    return (
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center gap-3 px-4 sm:px-8 pb-4 w-full max-w-5xl mx-auto overflow-hidden">
        <div className="relative w-full grid grid-cols-2 gap-4 sm:gap-6" style={gapStyle()}>
          {corners.map((item, idx) => (
            <button
              key={item.kind}
              data-tv-focusable="true"
              data-dashboard-kind={item.kind}
              tabIndex={0}
              onClick={item.action}
              style={frameBoxStyle(20, 118)}
              className={`rounded-3xl p-4 sm:p-6 min-h-[104px] sm:min-h-[124px] flex items-center gap-3 ${
                idx % 2 === 1 ? 'justify-end text-end' : 'justify-start text-start'
              } ${GLASS_CARD} ${reorderCls(item.kind)}`}
            >
              <ReorderBadge kind={item.kind} />
              <StyledAppIcon kind={item.kind} active3DStyle={active3DStyle} scale="md" iconSize={iconSize} />
              <div className="min-w-0">
                <div className="text-sm sm:text-lg font-semibold text-white group-hover:text-gold truncate">{item.title}</div>
                <div className="hidden sm:block text-xs text-zinc-400 truncate">{item.sub}</div>
              </div>
            </button>
          ))}

          <button
            data-tv-focusable="true"
            data-dashboard-kind={slot0.kind}
            tabIndex={0}
            onClick={slot0.action}
            style={!isPhone ? { width: `${centerDim}px`, height: `${centerDim}px` } : undefined}
            className={`hidden sm:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full flex-col items-center justify-center gap-1.5 z-20 ${GLASS_HERO} ${reorderCls(slot0.kind)}`}
          >
            <ReorderBadge kind={slot0.kind} />
            <StyledAppIcon kind={slot0.kind} active3DStyle={active3DStyle} scale="md" iconSize={iconSize} />
            <span className="text-xs font-semibold text-gold">{slot0.title}</span>
          </button>
        </div>

        <div className="sm:hidden flex items-center gap-3">
          <button
            data-tv-focusable="true"
            data-dashboard-kind={slot0.kind}
            tabIndex={0}
            onClick={slot0.action}
            className={`px-5 py-2 rounded-2xl flex items-center gap-2 text-xs font-semibold text-gold ${GLASS_HERO} ${reorderCls(slot0.kind)}`}
          >
            <Radio size={14} />
            <span>{slot0.title}</span>
          </button>
        </div>
      </div>
    );
  }

  // 16. ARCHED GLASS GALLERY
  if (effectiveLayout === 'layout-arch-gallery') {
    return (
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center gap-3.5 px-4 sm:px-8 pb-4 w-full max-w-6xl mx-auto overflow-hidden">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 w-full items-end" style={gapStyle()}>
          {allItems.map((item, idx) => (
            <button
              key={item.kind}
              data-tv-focusable="true"
              data-dashboard-kind={item.kind}
              tabIndex={0}
              onClick={item.action}
              style={frameBoxStyle(14, 215)}
              className={`rounded-t-full rounded-b-2xl pt-8 pb-4 px-3 flex flex-col items-center justify-between gap-3 h-48 sm:h-60 ${
                idx === 0 ? GLASS_HERO : GLASS_CARD
              } ${reorderCls(item.kind)}`}
            >
              <ReorderBadge kind={item.kind} />
              <StyledAppIcon kind={item.kind} active3DStyle={active3DStyle} scale="lg" iconSize={iconSize} />
              <div className="w-full text-center">
                <div className="text-sm sm:text-base font-semibold text-white group-hover:text-gold truncate">{item.title}</div>
                <div className="text-[11px] text-gold/75 truncate mt-0.5">{item.sub}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // 17. COMPACT VERTICAL GLASS STACK
  if (effectiveLayout === 'layout-compact-glass-stack') {
    return (
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 pb-5 w-full max-w-md mx-auto overflow-hidden">
        <div className="w-full flex flex-col gap-2" style={gapStyle()}>
          {allItems.map((item, idx) => (
            <button
              key={item.kind}
              data-tv-focusable="true"
              data-dashboard-kind={item.kind}
              tabIndex={0}
              onClick={item.action}
              style={frameBoxStyle(12)}
              className={`w-full rounded-2xl px-4 py-2.5 flex items-center justify-between gap-3 ${
                idx === 0 ? GLASS_HERO : GLASS_CARD
              } ${isRtl ? 'text-right' : 'text-left'} ${reorderCls(item.kind)}`}
            >
              <ReorderBadge kind={item.kind} />
              <div className="flex items-center gap-3 min-w-0">
                <StyledAppIcon kind={item.kind} active3DStyle={active3DStyle} scale="sm" iconSize={iconSize} />
                <span className="text-sm sm:text-base font-medium truncate text-white group-hover:text-gold">
                  {item.title}
                </span>
              </div>
              <ArrowIcon size={16} className="text-gold/80 shrink-0" />
            </button>
          ))}
        </div>
      </div>
    );
  }

  // 18. ANAMORPHIC WIDESCREEN RIBBON
  if (effectiveLayout === 'layout-widescreen-ribbon') {
    return (
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center gap-4 px-4 sm:px-8 pb-5 w-full max-w-6xl mx-auto overflow-hidden" style={gapStyle()}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 w-full" style={gapStyle()}>
          {[slot0, slot1, slot2].map((item, idx) => (
            <button
              key={item.kind}
              data-tv-focusable="true"
              data-dashboard-kind={item.kind}
              tabIndex={0}
              onClick={item.action}
              style={frameBoxStyle(20, 175)}
              className={`rounded-3xl p-5 flex flex-col items-center justify-center text-center gap-3 min-h-[155px] sm:min-h-[185px] ${
                idx === 0 ? GLASS_HERO : GLASS_CARD
              } ${reorderCls(item.kind)}`}
            >
              <ReorderBadge kind={item.kind} />
              <StyledAppIcon kind={item.kind} active3DStyle={active3DStyle} scale="lg" iconSize={iconSize} />
              <div className="w-full">
                <div className="text-lg sm:text-xl font-semibold text-white group-hover:text-gold truncate">{item.title}</div>
                <div className="text-xs text-gold/80 truncate mt-0.5">{item.sub}</div>
              </div>
            </button>
          ))}
        </div>

        <div className="w-full max-w-xl grid grid-cols-2 gap-2" style={gapStyle()}>
          {[slot3, slot4].map((item) => (
            <button
              key={item.kind}
              data-tv-focusable="true"
              data-dashboard-kind={item.kind}
              tabIndex={0}
              onClick={item.action}
              style={frameBoxStyle(12)}
              className={`rounded-2xl py-2.5 px-3 flex items-center justify-center gap-2 ${GLASS_CARD} text-gold ${reorderCls(item.kind)}`}
            >
              <ReorderBadge kind={item.kind} />
              <StyledAppIcon kind={item.kind} active3DStyle={active3DStyle} scale="sm" iconSize={iconSize} />
              <span className="text-xs sm:text-sm font-medium truncate">{item.title}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // 19. STEPPED GLASS SKYLINE
  if (effectiveLayout === 'layout-stepped-skyline') {
    const pillars = [
      { item: slot4, minH: 165, center: false },
      { item: slot1, minH: 200, center: false },
      { item: slot0, minH: 245, center: true },
      { item: slot2, minH: 200, center: false },
      { item: slot3, minH: 165, center: false },
    ];
    return (
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center gap-3.5 px-4 sm:px-8 pb-4 w-full max-w-6xl mx-auto overflow-hidden">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 w-full items-end" style={gapStyle()}>
          {pillars.map(({ item, minH, center }) => (
            <button
              key={item.kind}
              data-tv-focusable="true"
              data-dashboard-kind={item.kind}
              tabIndex={0}
              onClick={item.action}
              style={frameBoxStyle(14, minH)}
              className={`rounded-3xl p-3.5 flex flex-col items-center justify-center gap-3 text-center ${
                center ? GLASS_HERO : GLASS_CARD
              } ${reorderCls(item.kind)}`}
            >
              <ReorderBadge kind={item.kind} />
              <StyledAppIcon kind={item.kind} active3DStyle={active3DStyle} scale={center ? 'hero' : 'md'} iconSize={iconSize} />
              <span className={`text-xs sm:text-sm font-semibold truncate w-full ${center ? 'text-gold' : 'text-white group-hover:text-gold'}`}>
                {item.title}
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // 20. SPLIT-HEADER GLASS DECK
  if (effectiveLayout === 'layout-split-header-deck') {
    const decks = [
      { item: slot0, icon: Radio },
      { item: slot1, icon: Film },
      { item: slot2, icon: Clapperboard },
    ];
    return (
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center gap-3.5 px-4 sm:px-8 pb-5 w-full max-w-6xl mx-auto overflow-hidden" style={gapStyle()}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 w-full" style={gapStyle()}>
          {decks.map(({ item, icon: HeaderIcon }, idx) => (
            <button
              key={item.kind}
              data-tv-focusable="true"
              data-dashboard-kind={item.kind}
              tabIndex={0}
              onClick={item.action}
              style={frameBoxStyle(16)}
              className={`rounded-3xl overflow-hidden flex flex-col ${idx === 0 ? GLASS_HERO : GLASS_CARD} ${reorderCls(item.kind)}`}
            >
              <ReorderBadge kind={item.kind} />
              <div className="w-full px-3 py-1.5 bg-transparent flex items-center justify-between text-xs font-mono text-gold border-b border-white/10">
                <span className="truncate">{item.sub}</span>
                <HeaderIcon size={15} />
              </div>
              <div className="p-4 flex items-center gap-4">
                <StyledAppIcon kind={item.kind} active3DStyle={active3DStyle} scale="lg" iconSize={iconSize} />
                <div className="text-lg sm:text-xl font-semibold text-white group-hover:text-gold truncate">
                  {item.title}
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 w-full max-w-2xl" style={gapStyle()}>
          {[slot3, slot4].map((item) => (
            <button
              key={item.kind}
              data-tv-focusable="true"
              data-dashboard-kind={item.kind}
              tabIndex={0}
              onClick={item.action}
              style={frameBoxStyle(12)}
              className={`rounded-2xl px-4 py-3 flex items-center justify-center gap-2.5 ${GLASS_CARD} ${reorderCls(item.kind)}`}
            >
              <ReorderBadge kind={item.kind} />
              <StyledAppIcon kind={item.kind} active3DStyle={active3DStyle} scale="sm" iconSize={iconSize} />
              <span className="text-xs sm:text-sm font-medium truncate text-gold">
                {item.title}
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // 21. ZEN OPEN GLASS HORIZON
  if (effectiveLayout === 'layout-zen-horizon') {
    return (
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-8 pb-5 w-full max-w-6xl mx-auto overflow-hidden">
        <div className="w-full bg-transparent grid grid-cols-2 sm:grid-cols-5 gap-2" style={gapStyle()}>
          {allItems.map((item) => (
            <button
              key={item.kind}
              data-tv-focusable="true"
              data-dashboard-kind={item.kind}
              tabIndex={0}
              onClick={item.action}
              style={frameBoxStyle(18)}
              className={`rounded-2xl px-3 py-5 sm:py-7 flex flex-col items-center justify-center text-center gap-3 ${GLASS_CARD} ${reorderCls(item.kind)}`}
            >
              <ReorderBadge kind={item.kind} />
              <StyledAppIcon kind={item.kind} active3DStyle={active3DStyle} scale="md" iconSize={iconSize} />
              <span className="text-xs sm:text-sm font-medium truncate w-full text-gold">
                {item.title}
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // 22. TRANSPARENT HEX HIVE STUDIO
  if (effectiveLayout === 'layout-obsidian-hex-hive') {
    const topHexRow = [slot1, slot0, slot2];
    const bottomHexRow = [slot3, slot4];
    return (
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center gap-3.5 px-4 sm:px-8 pb-5 w-full max-w-6xl mx-auto overflow-hidden" style={gapStyle()}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 w-full" style={gapStyle()}>
          {topHexRow.map((item, idx) => {
            const isHero = idx === 1;
            return (
              <button
                key={item.kind}
                data-tv-focusable="true"
                data-dashboard-kind={item.kind}
                tabIndex={0}
                onClick={item.action}
                style={frameBoxStyle(18, 180)}
                className={`rounded-3xl p-5 flex flex-col items-center justify-center text-center gap-3 min-h-[168px] sm:min-h-[196px] ${
                  isHero ? CRYSTAL_HERO_FRAME : CRYSTAL_FRAME
                } ${reorderCls(item.kind)}`}
              >
                <ReorderBadge kind={item.kind} />
                <StudioLayoutIcon active3DStyle={active3DStyle} kind={item.kind} shape="hex" scale={isHero ? 'hero' : 'lg'} iconSize={iconSize} highlight={isHero} />
                <div className="w-full min-w-0">
                  <div className={`text-base sm:text-xl font-bold truncate ${isHero ? 'text-gold' : 'text-white group-hover:text-gold'}`}>
                    {item.title}
                  </div>
                  <div className="text-[11px] sm:text-xs text-zinc-300 truncate mt-0.5">{item.sub}</div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-2 gap-3.5 w-full max-w-3xl" style={gapStyle()}>
          {bottomHexRow.map((item) => (
            <button
              key={item.kind}
              data-tv-focusable="true"
              data-dashboard-kind={item.kind}
              tabIndex={0}
              onClick={item.action}
              style={frameBoxStyle(14)}
              className={`rounded-2xl px-5 py-3.5 flex items-center justify-center gap-3.5 ${CRYSTAL_FRAME} ${reorderCls(item.kind)}`}
            >
              <ReorderBadge kind={item.kind} />
              <StudioLayoutIcon active3DStyle={active3DStyle} kind={item.kind} shape="hex" scale="sm" iconSize={iconSize} />
              <div className={`min-w-0 ${isRtl ? 'text-right' : 'text-left'}`}>
                <div className="text-sm sm:text-base font-bold text-gold truncate">{item.title}</div>
                <div className="text-[11px] text-zinc-300 truncate">{item.sub}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // 23. TRANSPARENT THEATER MARQUEE
  if (effectiveLayout === 'layout-solid-theater-marquee') {
    const rightDrawers = [slot2, slot3, slot4];
    return (
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-8 pb-5 w-full max-w-6xl mx-auto overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 w-full items-stretch" style={gapStyle()}>
          <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3.5" style={gapStyle()}>
            {[slot0, slot1].map((item, idx) => {
              const isPrimary = idx === 0;
              return (
                <button
                  key={item.kind}
                  data-tv-focusable="true"
                  data-dashboard-kind={item.kind}
                  tabIndex={0}
                  onClick={item.action}
                  style={frameBoxStyle(20, 225)}
                  className={`rounded-3xl overflow-hidden p-5 flex flex-col justify-between min-h-[190px] sm:min-h-[250px] ${
                    isPrimary ? CRYSTAL_HERO_FRAME : CRYSTAL_FRAME
                  } ${isRtl ? 'text-right' : 'text-left'} ${reorderCls(item.kind)}`}
                >
                  <ReorderBadge kind={item.kind} />
                  <div className="w-full flex items-center justify-between gap-2 pb-2">
                    <span className="text-gold text-[10px] font-mono font-bold uppercase tracking-wider">
                      0{idx + 1}
                    </span>
                    <ArrowIcon size={18} className="text-gold shrink-0" />
                  </div>
                  <div className="my-auto py-3 flex justify-center">
                    <StudioLayoutIcon active3DStyle={active3DStyle} kind={item.kind} shape="ticket" scale="hero" iconSize={iconSize} highlight={isPrimary} />
                  </div>
                  <div className="w-full pt-2">
                    <div className="text-lg sm:text-xl font-bold text-white group-hover:text-gold truncate">{item.title}</div>
                    <div className="text-xs text-gold/80 truncate mt-0.5">{item.sub}</div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="md:col-span-5 flex flex-col gap-3 justify-between" style={gapStyle()}>
            {rightDrawers.map((item) => (
              <button
                key={item.kind}
                data-tv-focusable="true"
                data-dashboard-kind={item.kind}
                tabIndex={0}
                onClick={item.action}
                style={frameBoxStyle(14)}
                className={`flex-1 rounded-2xl px-4 py-3 flex items-center justify-between gap-3 ${CRYSTAL_FRAME} ${
                  isRtl ? 'text-right' : 'text-left'
                } ${reorderCls(item.kind)}`}
              >
                <ReorderBadge kind={item.kind} />
                <div className="flex items-center gap-3.5 min-w-0">
                  <StudioLayoutIcon active3DStyle={active3DStyle} kind={item.kind} shape="ticket" scale="md" iconSize={iconSize} />
                  <div className="min-w-0">
                    <div className="text-sm sm:text-base font-bold text-white group-hover:text-gold truncate">{item.title}</div>
                    <div className="text-[11px] text-zinc-300 truncate">{item.sub}</div>
                  </div>
                </div>
                <ArrowIcon size={16} className="text-gold/80 shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 24. TRANSPARENT CRYSTAL CHASSIS
  if (effectiveLayout === 'layout-carbon-brushed-chassis') {
    return (
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-8 pb-5 w-full max-w-6xl mx-auto overflow-hidden">
        <div className="w-full bg-transparent border border-white/20 rounded-3xl p-3 sm:p-4 flex flex-col gap-3" style={gapStyle()}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3" style={gapStyle()}>
            {[slot0, slot1, slot2].map((item, idx) => {
              const isMain = idx === 0;
              return (
                <button
                  key={item.kind}
                  data-tv-focusable="true"
                  data-dashboard-kind={item.kind}
                  tabIndex={0}
                  onClick={item.action}
                  style={frameBoxStyle(18, 170)}
                  className={`rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-between text-center gap-3 min-h-[152px] sm:min-h-[184px] ${
                    isMain ? CRYSTAL_HERO_FRAME : CRYSTAL_FRAME
                  } ${reorderCls(item.kind)}`}
                >
                  <ReorderBadge kind={item.kind} />
                  <StudioLayoutIcon active3DStyle={active3DStyle} kind={item.kind} shape="octagon" scale="lg" iconSize={iconSize} highlight={isMain} />
                  <div className="w-full">
                    <div className={`text-base sm:text-lg font-bold truncate ${isMain ? 'text-gold' : 'text-white group-hover:text-gold'}`}>
                      {item.title}
                    </div>
                    <div className="text-[11px] text-zinc-300 truncate mt-0.5">{item.sub}</div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-2 gap-3" style={gapStyle()}>
            {[slot3, slot4].map((item) => (
              <button
                key={item.kind}
                data-tv-focusable="true"
                data-dashboard-kind={item.kind}
                tabIndex={0}
                onClick={item.action}
                style={frameBoxStyle(14)}
                className={`rounded-xl px-4 py-3 flex items-center justify-center gap-3 ${CRYSTAL_FRAME} ${reorderCls(item.kind)}`}
              >
                <ReorderBadge kind={item.kind} />
                <StudioLayoutIcon active3DStyle={active3DStyle} kind={item.kind} shape="octagon" scale="sm" iconSize={iconSize} />
                <span className="text-xs sm:text-sm font-bold text-gold truncate">{item.title}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 25. TRANSPARENT DUOTONE RIM BLOCKS
  if (effectiveLayout === 'layout-duotone-color-blocks') {
    return (
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center gap-3.5 px-4 sm:px-8 pb-5 w-full max-w-6xl mx-auto overflow-hidden" style={gapStyle()}>
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 w-full items-stretch" style={gapStyle()}>
          <button
            data-tv-focusable="true"
            data-dashboard-kind={slot1.kind}
            tabIndex={0}
            onClick={slot1.action}
            style={frameBoxStyle(16, 195)}
            className={`sm:col-span-3 rounded-3xl p-4 flex flex-col items-center justify-center text-center gap-3 min-h-[140px] sm:min-h-[210px] ${CRYSTAL_FRAME} ${reorderCls(slot1.kind)}`}
          >
            <ReorderBadge kind={slot1.kind} />
            <StudioLayoutIcon active3DStyle={active3DStyle} kind={slot1.kind} shape="duotone" scale="lg" iconSize={iconSize} />
            <div className="w-full min-w-0">
              <div className="text-base sm:text-lg font-bold text-gold truncate">{slot1.title}</div>
              <div className="text-[11px] text-zinc-300 truncate mt-0.5">{slot1.sub}</div>
            </div>
          </button>

          <button
            data-tv-focusable="true"
            data-dashboard-kind={slot0.kind}
            tabIndex={0}
            onClick={slot0.action}
            style={frameBoxStyle(22, 195)}
            className={`sm:col-span-6 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-4 min-h-[170px] sm:min-h-[210px] ${CRYSTAL_HERO_FRAME} ${reorderCls(slot0.kind)}`}
          >
            <ReorderBadge kind={slot0.kind} />
            <div className={`flex flex-col items-center ${isRtl ? 'sm:items-start sm:text-right' : 'sm:items-start sm:text-left'} text-center min-w-0`}>
              <span className="text-gold text-[11px] font-bold uppercase tracking-wider mb-1">
                {slot0.sub}
              </span>
              <div className="text-2xl sm:text-3xl font-black text-white group-hover:text-gold drop-shadow-sm truncate max-w-full">
                {slot0.title}
              </div>
            </div>
            <StudioLayoutIcon active3DStyle={active3DStyle} kind={slot0.kind} shape="duotone" scale="hero" iconSize={iconSize} />
          </button>

          <button
            data-tv-focusable="true"
            data-dashboard-kind={slot2.kind}
            tabIndex={0}
            onClick={slot2.action}
            style={frameBoxStyle(16, 195)}
            className={`sm:col-span-3 rounded-3xl p-4 flex flex-col items-center justify-center text-center gap-3 min-h-[140px] sm:min-h-[210px] ${CRYSTAL_FRAME} ${reorderCls(slot2.kind)}`}
          >
            <ReorderBadge kind={slot2.kind} />
            <StudioLayoutIcon active3DStyle={active3DStyle} kind={slot2.kind} shape="duotone" scale="lg" iconSize={iconSize} />
            <div className="w-full min-w-0">
              <div className="text-base sm:text-lg font-bold text-gold truncate">{slot2.title}</div>
              <div className="text-[11px] text-zinc-300 truncate mt-0.5">{slot2.sub}</div>
            </div>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3.5 w-full max-w-4xl" style={gapStyle()}>
          {[slot3, slot4].map((item) => (
            <button
              key={item.kind}
              data-tv-focusable="true"
              data-dashboard-kind={item.kind}
              tabIndex={0}
              onClick={item.action}
              style={frameBoxStyle(14)}
              className={`rounded-2xl px-5 py-3 flex items-center justify-center gap-3 ${CRYSTAL_FRAME} ${reorderCls(item.kind)}`}
            >
              <ReorderBadge kind={item.kind} />
              <StudioLayoutIcon active3DStyle={active3DStyle} kind={item.kind} shape="duotone" scale="sm" iconSize={iconSize} />
              <span className="text-xs sm:text-sm font-bold text-white group-hover:text-gold truncate">{item.title}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // 26. TRANSPARENT DIAMOND CREST
  if (effectiveLayout === 'layout-isometric-diamond-deck') {
    const arcCards = [
      { item: slot1, lift: 'sm:translate-y-2', hero: false },
      { item: slot0, lift: 'sm:-translate-y-2', hero: true },
      { item: slot2, lift: 'sm:translate-y-2', hero: false },
    ];
    return (
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center gap-5 px-4 sm:px-8 pb-5 w-full max-w-6xl mx-auto overflow-hidden" style={gapStyle()}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full items-center pt-3" style={gapStyle()}>
          {arcCards.map(({ item, lift, hero }) => (
            <button
              key={item.kind}
              data-tv-focusable="true"
              data-dashboard-kind={item.kind}
              tabIndex={0}
              onClick={item.action}
              style={frameBoxStyle(20, 195)}
              className={`${lift} rounded-3xl p-5 flex flex-col items-center justify-center text-center gap-4 min-h-[175px] sm:min-h-[205px] ${
                hero ? CRYSTAL_HERO_FRAME : CRYSTAL_FRAME
              } ${reorderCls(item.kind)}`}
            >
              <ReorderBadge kind={item.kind} />
              <StudioLayoutIcon active3DStyle={active3DStyle} kind={item.kind} shape="diamond" scale={hero ? 'hero' : 'lg'} iconSize={iconSize} highlight={hero} />
              <div className="w-full pt-1">
                <div className={`text-base sm:text-xl font-bold truncate ${hero ? 'text-gold' : 'text-white group-hover:text-gold'}`}>
                  {item.title}
                </div>
                <div className="text-xs text-zinc-300 truncate mt-0.5">{item.sub}</div>
              </div>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4 w-full max-w-2xl" style={gapStyle()}>
          {[slot3, slot4].map((item) => (
            <button
              key={item.kind}
              data-tv-focusable="true"
              data-dashboard-kind={item.kind}
              tabIndex={0}
              onClick={item.action}
              style={frameBoxStyle(14)}
              className={`rounded-2xl px-4 py-3 flex items-center justify-center gap-4 ${CRYSTAL_FRAME} ${reorderCls(item.kind)}`}
            >
              <ReorderBadge kind={item.kind} />
              <StudioLayoutIcon active3DStyle={active3DStyle} kind={item.kind} shape="diamond" scale="sm" iconSize={iconSize} />
              <span className="text-xs sm:text-sm font-bold text-gold truncate">{item.title}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // 27. TRANSPARENT COLLECTOR FAN
  if (effectiveLayout === 'layout-matte-card-fan') {
    const shelfCards = [slot1, slot2, slot3, slot4];
    return (
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-8 pb-5 w-full max-w-6xl mx-auto overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 w-full items-stretch" style={gapStyle()}>
          <button
            data-tv-focusable="true"
            data-dashboard-kind={slot0.kind}
            tabIndex={0}
            onClick={slot0.action}
            style={frameBoxStyle(20, 240)}
            className={`md:col-span-4 rounded-3xl overflow-hidden flex flex-col justify-center min-h-[210px] sm:min-h-[260px] ${CRYSTAL_HERO_FRAME} ${
              isRtl ? 'text-right' : 'text-left'
            } ${reorderCls(slot0.kind)}`}
          >
            <ReorderBadge kind={slot0.kind} />
            <div className="flex-1 p-5 flex flex-col items-center justify-center text-center gap-3">
              <StudioLayoutIcon active3DStyle={active3DStyle} kind={slot0.kind} shape="shield" scale="hero" iconSize={iconSize} highlight />
              <div>
                <div className="text-xl sm:text-2xl font-black text-white group-hover:text-gold">{slot0.title}</div>
                <div className="text-xs text-gold/85 mt-1">{slot0.sub}</div>
              </div>
            </div>
          </button>

          <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-3" style={gapStyle()}>
            {shelfCards.map((item) => (
              <button
                key={item.kind}
                data-tv-focusable="true"
                data-dashboard-kind={item.kind}
                tabIndex={0}
                onClick={item.action}
                style={frameBoxStyle(14, 220)}
                className={`rounded-3xl overflow-hidden flex flex-col justify-center min-h-[170px] sm:min-h-[260px] ${CRYSTAL_FRAME} ${reorderCls(item.kind)}`}
              >
                <ReorderBadge kind={item.kind} />
                <div className="flex-1 px-3 py-4 flex flex-col items-center justify-center text-center gap-3">
                  <StudioLayoutIcon active3DStyle={active3DStyle} kind={item.kind} shape="shield" scale="md" iconSize={iconSize} />
                  <div className="w-full">
                    <div className="text-sm sm:text-base font-bold text-white group-hover:text-gold truncate">{item.title}</div>
                    <div className="text-[10px] text-zinc-300 truncate mt-0.5">{item.sub}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 28. TRANSPARENT MONOLITH WINGS
  if (effectiveLayout === 'layout-royal-monolith-dock') {
    const pillars = [
      { item: slot1, minH: 215, center: false },
      { item: slot3, minH: 185, center: false },
      { item: slot0, minH: 260, center: true },
      { item: slot4, minH: 185, center: false },
      { item: slot2, minH: 215, center: false },
    ];
    return (
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-8 pb-5 w-full max-w-6xl mx-auto overflow-hidden">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 w-full items-center" style={gapStyle()}>
          {pillars.map(({ item, minH, center }) => (
            <button
              key={item.kind}
              data-tv-focusable="true"
              data-dashboard-kind={item.kind}
              tabIndex={0}
              onClick={item.action}
              style={frameBoxStyle(14, minH)}
              className={`${center ? 'col-span-2 sm:col-span-1' : ''} rounded-2xl p-3.5 flex flex-col items-center justify-center gap-3 text-center ${
                center ? CRYSTAL_HERO_FRAME : CRYSTAL_FRAME
              } ${reorderCls(item.kind)}`}
            >
              <ReorderBadge kind={item.kind} />
              <StudioLayoutIcon active3DStyle={active3DStyle} kind={item.kind} shape="monolith" scale={center ? 'hero' : 'md'} iconSize={iconSize} highlight={center} />
              <div className="w-full pb-1">
                <div className={`font-bold truncate ${center ? 'text-base sm:text-lg text-gold' : 'text-xs sm:text-sm text-white group-hover:text-gold'}`}>
                  {item.title}
                </div>
                <div className="text-[10px] text-zinc-300 truncate mt-0.5">{item.sub}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // 29. TRANSPARENT UTILITY CONSOLE & PADS
  if (effectiveLayout === 'layout-split-panel-arcade') {
    const mediaPads = [slot0, slot1, slot2];
    return (
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center gap-3.5 px-4 sm:px-8 pb-5 w-full max-w-6xl mx-auto overflow-hidden" style={gapStyle()}>
        <div className="grid grid-cols-2 gap-3 w-full max-w-3xl" style={gapStyle()}>
          {[slot3, slot4].map((item) => (
            <button
              key={item.kind}
              data-tv-focusable="true"
              data-dashboard-kind={item.kind}
              tabIndex={0}
              onClick={item.action}
              style={frameBoxStyle(14)}
              className={`rounded-2xl px-4 py-3 flex items-center justify-center gap-3 ${CRYSTAL_FRAME} ${reorderCls(item.kind)}`}
            >
              <ReorderBadge kind={item.kind} />
              <div className="flex items-center gap-3 min-w-0">
                <StudioLayoutIcon active3DStyle={active3DStyle} kind={item.kind} shape="keycap" scale="sm" iconSize={iconSize} />
                <div className={`min-w-0 ${isRtl ? 'text-right' : 'text-left'}`}>
                  <div className="text-xs sm:text-sm font-bold text-gold truncate">{item.title}</div>
                  <div className="text-[10px] text-zinc-300 truncate">{item.sub}</div>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 w-full" style={gapStyle()}>
          {mediaPads.map((item, idx) => {
            const isHero = idx === 0;
            return (
              <button
                key={item.kind}
                data-tv-focusable="true"
                data-dashboard-kind={item.kind}
                tabIndex={0}
                onClick={item.action}
                style={frameBoxStyle(20, 195)}
                className={`rounded-3xl p-5 flex flex-col items-center justify-center text-center gap-4 min-h-[175px] sm:min-h-[210px] ${
                  isHero ? CRYSTAL_HERO_FRAME : CRYSTAL_FRAME
                } ${reorderCls(item.kind)}`}
              >
                <ReorderBadge kind={item.kind} />
                <StudioLayoutIcon active3DStyle={active3DStyle} kind={item.kind} shape="keycap" scale="hero" iconSize={iconSize} highlight={isHero} />
                <div className="w-full">
                  <div className={`text-lg sm:text-xl font-bold truncate ${isHero ? 'text-gold' : 'text-white group-hover:text-gold'}`}>
                    {item.title}
                  </div>
                  <div className="text-xs text-zinc-300 truncate mt-0.5">{item.sub}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // 30. TRANSPARENT PANORAMA CAPSULES
  if (effectiveLayout === 'layout-horizon-panorama-cards') {
    return (
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-8 pb-5 w-full max-w-6xl mx-auto overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 w-full items-stretch" style={gapStyle()}>
          <div className="md:col-span-4 flex flex-col gap-3" style={gapStyle()}>
            {[slot1, slot2].map((item) => (
              <button
                key={item.kind}
                data-tv-focusable="true"
                data-dashboard-kind={item.kind}
                tabIndex={0}
                onClick={item.action}
                style={frameBoxStyle(16)}
                className={`flex-1 rounded-3xl p-4 flex items-center gap-3.5 ${CRYSTAL_FRAME} ${
                  isRtl ? 'text-right' : 'text-left'
                } ${reorderCls(item.kind)}`}
              >
                <ReorderBadge kind={item.kind} />
                <StudioLayoutIcon active3DStyle={active3DStyle} kind={item.kind} shape="capsule" scale="md" iconSize={iconSize} />
                <div className="min-w-0 flex-1">
                  <div className="text-base sm:text-lg font-bold text-white group-hover:text-gold truncate">{item.title}</div>
                  <div className="text-xs text-gold/80 truncate">{item.sub}</div>
                </div>
              </button>
            ))}
          </div>

          <button
            data-tv-focusable="true"
            data-dashboard-kind={slot0.kind}
            tabIndex={0}
            onClick={slot0.action}
            style={frameBoxStyle(20, 235)}
            className={`md:col-span-4 rounded-3xl overflow-hidden p-5 flex flex-col items-center justify-center text-center gap-4 min-h-[190px] sm:min-h-[250px] ${CRYSTAL_HERO_FRAME} ${reorderCls(slot0.kind)}`}
          >
            <ReorderBadge kind={slot0.kind} />
            <StudioLayoutIcon active3DStyle={active3DStyle} kind={slot0.kind} shape="capsule" scale="hero" iconSize={iconSize} highlight />
            <div className="w-full">
              <div className="text-xl sm:text-2xl font-black text-gold truncate">{slot0.title}</div>
              <div className="text-xs sm:text-sm text-zinc-200 truncate mt-1">{slot0.sub}</div>
            </div>
          </button>

          <div className="md:col-span-4 flex flex-col gap-3" style={gapStyle()}>
            {[slot3, slot4].map((item) => (
              <button
                key={item.kind}
                data-tv-focusable="true"
                data-dashboard-kind={item.kind}
                tabIndex={0}
                onClick={item.action}
                style={frameBoxStyle(16)}
                className={`flex-1 rounded-3xl p-4 flex items-center gap-3.5 ${CRYSTAL_FRAME} ${
                  isRtl ? 'text-right' : 'text-left'
                } ${reorderCls(item.kind)}`}
              >
                <ReorderBadge kind={item.kind} />
                <StudioLayoutIcon active3DStyle={active3DStyle} kind={item.kind} shape="capsule" scale="md" iconSize={iconSize} />
                <div className="min-w-0 flex-1">
                  <div className="text-base sm:text-lg font-bold text-white group-hover:text-gold truncate">{item.title}</div>
                  <div className="text-xs text-gold/80 truncate">{item.sub}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 31. TRANSPARENT DOUBLE-BEZEL FRAME
  return (
    <div className="relative z-10 flex-1 flex flex-col items-center justify-center gap-3.5 px-4 sm:px-8 pb-5 w-full max-w-6xl mx-auto overflow-hidden" style={gapStyle()}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full" style={gapStyle()}>
        {[slot0, slot1].map((item, idx) => {
          const isPrimary = idx === 0;
          return (
            <button
              key={item.kind}
              data-tv-focusable="true"
              data-dashboard-kind={item.kind}
              tabIndex={0}
              onClick={item.action}
              style={frameBoxStyle(20)}
              className={`rounded-3xl px-5 py-4 sm:py-5 flex items-center justify-between gap-4 border-2 ${
                isPrimary ? CRYSTAL_HERO_FRAME : CRYSTAL_FRAME
              } ${isRtl ? 'text-right' : 'text-left'} ${reorderCls(item.kind)}`}
            >
              <ReorderBadge kind={item.kind} />
              <div className="flex items-center gap-4 min-w-0">
                <StudioLayoutIcon active3DStyle={active3DStyle} kind={item.kind} shape="satin" scale="hero" iconSize={iconSize} highlight={isPrimary} />
                <div className="min-w-0">
                  <div className={`text-lg sm:text-2xl font-bold truncate ${isPrimary ? 'text-gold' : 'text-white group-hover:text-gold'}`}>
                    {item.title}
                  </div>
                  <div className="text-xs text-zinc-300 truncate mt-0.5">{item.sub}</div>
                </div>
              </div>
              <ArrowIcon size={20} className="text-gold shrink-0" />
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-3 gap-3 w-full" style={gapStyle()}>
        {[slot2, slot3, slot4].map((item) => (
          <button
            key={item.kind}
            data-tv-focusable="true"
            data-dashboard-kind={item.kind}
            tabIndex={0}
            onClick={item.action}
            style={frameBoxStyle(14)}
            className={`rounded-2xl px-3 py-3.5 flex flex-col sm:flex-row items-center justify-center gap-2.5 ${CRYSTAL_FRAME} ${reorderCls(item.kind)}`}
          >
            <ReorderBadge kind={item.kind} />
            <StudioLayoutIcon active3DStyle={active3DStyle} kind={item.kind} shape="satin" scale="sm" iconSize={iconSize} />
            <span className="text-xs sm:text-sm font-bold text-white group-hover:text-gold truncate max-w-full">
              {item.title}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
