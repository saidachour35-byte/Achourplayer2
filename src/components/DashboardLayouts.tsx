// Original path: src/components/DashboardLayouts.tsx
import React from 'react';
import { ChevronRight, ChevronLeft, Move } from 'lucide-react';
import {
  DASHBOARD_LAYOUTS,
  Icon3DStyle,
  normalizeDashboardLayoutId,
  resolveDesignSettings,
} from '../utils/themeManager';
import {
  AppSettings,
  FrameShapeId,
  IconDisplayMode,
  IconPackId,
  Language,
} from '../types';
import {
  DashboardSectionIcon,
  FRAME_PX_MAP,
  ICON_PX_MAP,
} from './IconPacks';

export const VALID_DASHBOARD_LAYOUTS = DASHBOARD_LAYOUTS.map((l) => l.id);

export type DashboardViewTarget = 'live' | 'movies' | 'series' | 'add' | 'settings';
export type IconKind = 'live' | 'movies' | 'series' | 'add' | 'settings';

export interface DashboardLayoutsProps {
  layoutId?: string;
  dashboardOrder?: string[];
  iconDisplayMode?: IconDisplayMode;
  iconPack?: IconPackId;
  frameShape?: FrameShapeId;
  active3DStyle?: Icon3DStyle;
  iconSize?: AppSettings['iconScale'];
  frameScale?: AppSettings['frameScale'];
  tileSpacing?: AppSettings['tileSpacing'];
  glassOpacity?: number;
  glassBlur?: number;
  dashboardAlignment?: AppSettings['dashboardAlignment'];
  dashboardHorizontalAlignment?: AppSettings['dashboardHorizontalAlignment'];
  reorderingKind?: IconKind | null;
  previewMode?: boolean;
  language: Language;
  isRtl: boolean;
  t: (key: any) => string;
  onNavigate: (view: DashboardViewTarget) => void;
  onExit?: () => void;
}

/**
 * Backward-compatible icon wrapper delegating directly to DashboardSectionIcon.
 */
export function StyledAppIcon({
  kind,
  scale = 'md',
  iconSize = 'md',
  frameScale = 'md',
  iconDisplayMode,
  iconPack,
  frameShape,
  active3DStyle,
  glassOpacity,
  glassBlur,
}: {
  kind: IconKind;
  active3DStyle?: Icon3DStyle;
  scale?: 'sm' | 'md' | 'lg' | 'hero';
  iconSize?: AppSettings['iconScale'];
  frameScale?: AppSettings['frameScale'];
  iconDisplayMode?: IconDisplayMode;
  iconPack?: IconPackId;
  frameShape?: FrameShapeId;
  glassOpacity?: number;
  glassBlur?: number;
}) {
  const resolved = resolveDesignSettings({
    iconDisplayMode,
    iconPack,
    frameShape,
    icon3DStyle: active3DStyle?.id,
    glassOpacity,
    glassBlur,
  });

  return (
    <DashboardSectionIcon
      kind={kind}
      displayMode={resolved.iconDisplayMode}
      iconPack={resolved.iconPack}
      frameShape={resolved.frameShape}
      iconScale={iconSize}
      frameScale={frameScale}
      glassOpacity={resolved.glassOpacity}
      glassBlur={resolved.glassBlur}
      isHero={scale === 'hero'}
    />
  );
}

const DEFAULT_ORDER: IconKind[] = ['live', 'movies', 'series', 'add', 'settings'];

const SPACING_PX: Record<NonNullable<AppSettings['tileSpacing']>, number> = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 24,
  xl: 34,
};

interface SectionItem {
  kind: IconKind;
  label: string;
  subtitle: string;
}

export default function DashboardLayouts({
  layoutId = 'layout-dock-row',
  dashboardOrder,
  iconDisplayMode,
  iconPack,
  frameShape,
  active3DStyle,
  iconSize = 'md',
  frameScale = 'md',
  tileSpacing = 'md',
  glassOpacity = 16,
  glassBlur = 10,
  reorderingKind = null,
  previewMode = false,
  language,
  isRtl,
  t,
  onNavigate,
}: DashboardLayoutsProps) {
  const activeLayoutId = normalizeDashboardLayoutId(layoutId);
  const resolved = resolveDesignSettings({
    iconDisplayMode,
    iconPack,
    frameShape,
    dashboardLayout: activeLayoutId,
    icon3DStyle: active3DStyle?.id,
    glassOpacity,
    glassBlur,
  });

  const itemMap: Record<IconKind, SectionItem> = {
    live: {
      kind: 'live',
      label: t('live'),
      subtitle: language === 'ar' ? 'القنوات المباشرة' : 'Live TV Channels',
    },
    movies: {
      kind: 'movies',
      label: t('movies'),
      subtitle: language === 'ar' ? 'أفلام سينمائية' : 'Cinema & VOD',
    },
    series: {
      kind: 'series',
      label: t('series'),
      subtitle: language === 'ar' ? 'مسلسلات وحلقات' : 'TV Series & Shows',
    },
    add: {
      kind: 'add',
      label: t('playlist'),
      subtitle: language === 'ar' ? 'قوائم التشغيل' : 'Xtream & M3U Lists',
    },
    settings: {
      kind: 'settings',
      label: t('settings'),
      subtitle: language === 'ar' ? 'التخصيص والنظام' : 'App Preferences',
    },
  };

  const validOrder: IconKind[] = [
    ...(dashboardOrder || []),
    ...DEFAULT_ORDER,
  ].filter(
    (value, index, list): value is IconKind =>
      DEFAULT_ORDER.includes(value as IconKind) && list.indexOf(value) === index
  );

  const slots = validOrder.map((k) => itemMap[k]);
  const [slot0, slot1, slot2, slot3, slot4] = slots;

  const rawGap = SPACING_PX[tileSpacing || 'md'] ?? 16;
  const gapPx = previewMode ? Math.max(4, Math.round(rawGap * 0.56)) : rawGap;

  const baseIconPx = ICON_PX_MAP[iconSize || 'md'] || 40;
  const baseFramePx = FRAME_PX_MAP[frameScale || 'md'] || 72;
  const previewScale = previewMode ? 0.56 : 1;

  const surfaceAlpha = Math.max(0.02, Math.min(0.85, (resolved.glassOpacity ?? 16) / 100));
  const surfaceBlur = Math.max(0, Math.min(24, resolved.glassBlur ?? 10));

  const getGlassCardStyle = (emphasized = false): React.CSSProperties => {
    if (resolved.iconDisplayMode === 'icons-only') {
      return {
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        boxShadow: 'none',
        backdropFilter: 'none',
        WebkitBackdropFilter: 'none',
      };
    }
    return {
      backgroundColor: emphasized
        ? `rgba(14, 18, 28, ${Math.min(0.88, surfaceAlpha + 0.08)})`
        : `rgba(12, 16, 26, ${surfaceAlpha})`,
      backdropFilter: surfaceBlur > 0 ? `blur(${surfaceBlur}px)` : undefined,
      WebkitBackdropFilter: surfaceBlur > 0 ? `blur(${surfaceBlur}px)` : undefined,
      borderColor: emphasized ? 'var(--theme-primary, #D4AF37)' : 'rgba(255,255,255,0.16)',
    };
  };

  type TileMode = 'open' | 'card' | 'wide' | 'row' | 'pill';

  const renderSectionTile = (
    item: SectionItem,
    {
      mode = 'open',
      isHero = false,
      extraClass = '',
    }: {
      mode?: TileMode;
      isHero?: boolean;
      extraClass?: string;
    } = {}
  ) => {
    const isReorderingThis = !previewMode && reorderingKind === item.kind;
    const isIconsOnly = resolved.iconDisplayMode === 'icons-only';
    const iconMultiplier = isHero ? 1.15 : mode === 'row' || mode === 'pill' ? 0.82 : 1;
    const computedIconPx = Math.max(15, Math.round(baseIconPx * previewScale * iconMultiplier));
    const computedFramePx = Math.max(
      computedIconPx + 10,
      Math.round(baseFramePx * previewScale * (isHero ? 1.12 : mode === 'row' || mode === 'pill' ? 0.8 : 1))
    );

    const commonProps = previewMode
      ? {
          type: 'button' as const,
          tabIndex: -1,
          onClick: () => onNavigate(item.kind),
        }
      : {
          type: 'button' as const,
          'data-tv-focusable': 'true',
          'data-dashboard-kind': item.kind,
          tabIndex: 0,
          onClick: () => onNavigate(item.kind),
        };

    const reorderRing = isReorderingThis
      ? 'ring-2 ring-emerald-400 bg-emerald-500/15 animate-pulse'
      : '';

    const iconNode = (
      <DashboardSectionIcon
        kind={item.kind}
        displayMode={resolved.iconDisplayMode}
        iconPack={resolved.iconPack}
        frameShape={resolved.frameShape}
        iconScale={iconSize}
        frameScale={frameScale}
        glassOpacity={resolved.glassOpacity}
        glassBlur={resolved.glassBlur}
        sizeOverridePx={computedIconPx}
        frameSizeOverridePx={computedFramePx}
        isHero={isHero}
      />
    );

    if (mode === 'pill') {
      return (
        <button
          key={item.kind}
          {...commonProps}
          style={getGlassCardStyle(isHero)}
          className={`group relative flex items-center justify-center gap-2 transition-all duration-150 cursor-pointer select-none ${
            isIconsOnly
              ? 'bg-transparent border-0 shadow-none rounded-full hover:scale-105'
              : 'rounded-full border shadow-[0_8px_22px_rgba(0,0,0,0.35)] hover:border-[var(--theme-primary)]'
          } ${previewMode ? 'px-2.5 py-1.5' : 'px-4 py-2 sm:px-5 sm:py-2.5'} ${reorderRing} ${extraClass}`}
        >
          {iconNode}
          <span
            className={`font-bold text-white group-hover:text-gold transition-colors truncate ${
              previewMode ? 'text-[10px]' : 'text-xs sm:text-sm'
            }`}
          >
            {item.label}
          </span>
        </button>
      );
    }

    if (mode === 'row' || mode === 'wide') {
      const paddingClass = previewMode
        ? 'px-2.5 py-1.5'
        : mode === 'wide'
        ? 'px-4 py-3.5 sm:px-6 sm:py-5'
        : 'px-3.5 py-2.5 sm:px-5 sm:py-3.5';

      return (
        <button
          key={item.kind}
          {...commonProps}
          style={getGlassCardStyle(isHero)}
          className={`group relative flex items-center justify-between gap-3 w-full transition-all duration-150 cursor-pointer select-none ${
            isIconsOnly
              ? 'bg-transparent border-0 shadow-none rounded-2xl hover:scale-[1.02]'
              : 'rounded-2xl border shadow-[0_10px_28px_rgba(0,0,0,0.34)] hover:border-[var(--theme-primary)]'
          } ${paddingClass} ${reorderRing} ${extraClass}`}
        >
          {isReorderingThis && (
            <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 z-30 px-2 py-0.5 rounded-full bg-emerald-400 text-black text-[9px] font-black flex items-center gap-1 shadow whitespace-nowrap">
              <Move size={10} />
              <span>{isRtl ? 'حرّك بالأسهم' : 'Move'}</span>
            </span>
          )}
          <div className="flex items-center gap-3 min-w-0">
            {iconNode}
            <div className={`min-w-0 ${isRtl ? 'text-right' : 'text-left'}`}>
              <span
                className={`block font-bold tracking-wide text-white group-hover:text-gold transition-colors truncate ${
                  previewMode
                    ? 'text-[11px]'
                    : isHero
                    ? 'text-base sm:text-xl'
                    : 'text-sm sm:text-base'
                }`}
              >
                {item.label}
              </span>
              {!previewMode && (
                <span className="block text-[11px] sm:text-xs text-zinc-300/80 truncate mt-0.5">
                  {item.subtitle}
                </span>
              )}
            </div>
          </div>
          {!previewMode &&
            (isRtl ? (
              <ChevronLeft size={16} className="text-gold/75 group-hover:text-gold shrink-0" />
            ) : (
              <ChevronRight size={16} className="text-gold/75 group-hover:text-gold shrink-0" />
            ))}
        </button>
      );
    }

    const useCardChrome = mode === 'card' && !isIconsOnly;

    return (
      <button
        key={item.kind}
        {...commonProps}
        style={useCardChrome ? getGlassCardStyle(isHero) : undefined}
        className={`group relative flex flex-col items-center justify-center transition-all duration-150 cursor-pointer select-none ${
          useCardChrome
            ? `rounded-2xl border shadow-[0_10px_26px_rgba(0,0,0,0.34)] hover:border-[var(--theme-primary)] ${
                previewMode ? 'p-2 gap-1.5' : 'p-3 sm:p-4 gap-2 sm:gap-2.5'
              }`
            : `bg-transparent border-0 shadow-none rounded-2xl hover:scale-105 ${
                previewMode ? 'p-1.5 gap-1' : 'p-2 sm:p-3 gap-2'
              }`
        } ${reorderRing} ${extraClass}`}
      >
        {isReorderingThis && (
          <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 z-30 px-2 py-0.5 rounded-full bg-emerald-400 text-black text-[9px] font-black flex items-center gap-1 shadow whitespace-nowrap">
            <Move size={10} />
            <span>{isRtl ? 'حرّك بالأسهم' : 'Move'}</span>
          </span>
        )}
        {iconNode}
        <div className="flex flex-col items-center text-center min-w-0 max-w-full">
          <span
            className={`font-bold tracking-wide text-white group-hover:text-gold transition-colors truncate max-w-full drop-shadow-[0_2px_6px_rgba(0,0,0,0.85)] ${
              previewMode
                ? 'text-[10px] leading-tight'
                : isHero
                ? 'text-sm sm:text-base'
                : 'text-xs sm:text-sm'
            }`}
          >
            {item.label}
          </span>
          {mode === 'card' && !previewMode && !isIconsOnly && (
            <span className="hidden sm:block text-[10px] text-zinc-300/75 truncate max-w-[140px] mt-0.5">
              {item.subtitle}
            </span>
          )}
        </div>
      </button>
    );
  };

  const containerMax = previewMode ? 'w-full' : 'w-full max-w-6xl mx-auto py-1 sm:py-2';

  switch (activeLayoutId) {
    // 1. BALANCED DOCK ROW (5 columns)
    case 'layout-dock-row':
      return (
        <div className={`${containerMax} grid grid-cols-5 items-center justify-items-center`} style={{ gap: `${gapPx}px` }}>
          {slots.map((item) => renderSectionTile(item, { mode: 'open', extraClass: 'w-full' }))}
        </div>
      );

    // 2. HERO SHOWCASE + 4-TILE BOTTOM DOCK
    case 'layout-hero-dock':
      return (
        <div className={`${containerMax} flex flex-col`} style={{ gap: `${gapPx}px` }}>
          {renderSectionTile(slot0, {
            mode: 'wide',
            isHero: true,
            extraClass: previewMode ? 'min-h-[42px]' : 'min-h-[82px] sm:min-h-[104px]',
          })}
          <div className="grid grid-cols-2 sm:grid-cols-4" style={{ gap: `${gapPx}px` }}>
            {[slot1, slot2, slot3, slot4].map((item) =>
              renderSectionTile(item, {
                mode: 'card',
                extraClass: previewMode ? 'min-h-[50px]' : 'min-h-[96px] sm:min-h-[116px]',
              })
            )}
          </div>
        </div>
      );

    // 3. LEFT COMMAND RAIL + 3 STAGE CARDS
    case 'layout-side-rail':
      return (
        <div className={`${containerMax} grid grid-cols-1 md:grid-cols-12 items-stretch`} style={{ gap: `${gapPx}px` }}>
          <div className="md:col-span-4 flex flex-col justify-center" style={{ gap: `${gapPx}px` }}>
            {renderSectionTile(slot3, { mode: 'row', extraClass: 'flex-1' })}
            {renderSectionTile(slot4, { mode: 'row', extraClass: 'flex-1' })}
          </div>
          <div className="md:col-span-8 grid grid-cols-3 items-stretch" style={{ gap: `${gapPx}px` }}>
            {[slot0, slot1, slot2].map((item, idx) =>
              renderSectionTile(item, {
                mode: 'card',
                isHero: idx === 0,
                extraClass: previewMode ? 'min-h-[74px]' : 'min-h-[132px] sm:min-h-[168px]',
              })
            )}
          </div>
        </div>
      );

    // 4. ASYMMETRIC BENTO MOSAIC
    case 'layout-bento-mosaic':
      return (
        <div className={`${containerMax} grid grid-cols-1 md:grid-cols-12 items-stretch`} style={{ gap: `${gapPx}px` }}>
          <div className="md:col-span-4 flex">
            {renderSectionTile(slot0, {
              mode: 'card',
              isHero: true,
              extraClass: `w-full ${previewMode ? 'min-h-[88px]' : 'min-h-[140px] sm:min-h-[210px]'}`,
            })}
          </div>
          <div className="md:col-span-4 grid grid-rows-2" style={{ gap: `${gapPx}px` }}>
            {renderSectionTile(slot1, { mode: 'card', extraClass: 'w-full h-full' })}
            {renderSectionTile(slot3, { mode: 'row', extraClass: 'w-full h-full' })}
          </div>
          <div className="md:col-span-4 grid grid-rows-2" style={{ gap: `${gapPx}px` }}>
            {renderSectionTile(slot2, { mode: 'card', extraClass: 'w-full h-full' })}
            {renderSectionTile(slot4, { mode: 'row', extraClass: 'w-full h-full' })}
          </div>
        </div>
      );

    // 5. TWIN SPOTLIGHT PYRAMID (2+3)
    case 'layout-twin-spotlight':
      return (
        <div className={`${containerMax} flex flex-col`} style={{ gap: `${gapPx}px` }}>
          <div className="grid grid-cols-2" style={{ gap: `${gapPx}px` }}>
            {[slot0, slot1].map((item, idx) =>
              renderSectionTile(item, {
                mode: 'wide',
                isHero: idx === 0,
                extraClass: previewMode ? 'min-h-[44px]' : 'min-h-[86px] sm:min-h-[112px]',
              })
            )}
          </div>
          <div className="grid grid-cols-3" style={{ gap: `${gapPx}px` }}>
            {[slot2, slot3, slot4].map((item) =>
              renderSectionTile(item, {
                mode: 'card',
                extraClass: previewMode ? 'min-h-[48px]' : 'min-h-[88px] sm:min-h-[106px]',
              })
            )}
          </div>
        </div>
      );

    // 6. ELEVATED CENTER PODIUM
    case 'layout-center-spotlight': {
      const podium = [
        { item: slot4, offset: 'translate-y-2 sm:translate-y-4', isHero: false },
        { item: slot1, offset: 'translate-y-1 sm:translate-y-2', isHero: false },
        { item: slot0, offset: '-translate-y-1 sm:-translate-y-2', isHero: true },
        { item: slot2, offset: 'translate-y-1 sm:translate-y-2', isHero: false },
        { item: slot3, offset: 'translate-y-2 sm:translate-y-4', isHero: false },
      ];
      return (
        <div className={`${containerMax} grid grid-cols-5 items-center justify-items-center`} style={{ gap: `${gapPx}px` }}>
          {podium.map((entry) =>
            renderSectionTile(entry.item, {
              mode: 'open',
              isHero: entry.isHero,
              extraClass: `w-full ${entry.offset}`,
            })
          )}
        </div>
      );
    }

    // 7. SPLIT CINEMA STAGE (1+4)
    case 'layout-split-stage':
      return (
        <div className={`${containerMax} grid grid-cols-1 md:grid-cols-2 items-stretch`} style={{ gap: `${gapPx}px` }}>
          {renderSectionTile(slot0, {
            mode: 'card',
            isHero: true,
            extraClass: previewMode ? 'min-h-[92px]' : 'min-h-[150px] sm:min-h-[210px]',
          })}
          <div className="grid grid-cols-2 grid-rows-2" style={{ gap: `${gapPx}px` }}>
            {[slot1, slot2, slot3, slot4].map((item) =>
              renderSectionTile(item, {
                mode: 'card',
                extraClass: previewMode ? 'min-h-[42px]' : 'min-h-[88px] sm:min-h-[100px]',
              })
            )}
          </div>
        </div>
      );

    // 8. CENTERED VERTICAL LIST
    case 'layout-vertical-list':
      return (
        <div
          className={`${previewMode ? 'w-full max-w-[340px]' : 'w-full max-w-2xl'} mx-auto flex flex-col`}
          style={{ gap: `${Math.max(4, Math.round(gapPx * 0.65))}px` }}
        >
          {slots.map((item, idx) => renderSectionTile(item, { mode: 'row', isHero: idx === 0 }))}
        </div>
      );

    // 9. ORBITAL HUB & FOUR CORNER WINGS
    case 'layout-orbital-hub':
      return (
        <div className={`${containerMax} relative flex flex-col items-center`}>
          <div
            className="w-full grid grid-cols-2 items-center"
            style={{
              gap: `${gapPx}px`,
              rowGap: `${Math.max(gapPx, previewMode ? 10 : 24)}px`,
            }}
          >
            <div className="flex justify-start sm:pr-12">{renderSectionTile(slot1, { mode: 'open' })}</div>
            <div className="flex justify-end sm:pl-12">{renderSectionTile(slot2, { mode: 'open' })}</div>
            <div className="col-span-2 flex justify-center sm:hidden">
              {renderSectionTile(slot0, { mode: 'open', isHero: true })}
            </div>
            <div className="flex justify-start sm:pr-12">{renderSectionTile(slot3, { mode: 'open' })}</div>
            <div className="flex justify-end sm:pl-12">{renderSectionTile(slot4, { mode: 'open' })}</div>
          </div>
          <div className="hidden sm:flex absolute inset-0 items-center justify-center pointer-events-none">
            <div className="pointer-events-auto">{renderSectionTile(slot0, { mode: 'open', isHero: true })}</div>
          </div>
        </div>
      );

    // 10. STAGGERED WAVE (3+2)
    case 'layout-staircase-cascade':
      return (
        <div className={`${containerMax} flex flex-col items-center`} style={{ gap: `${gapPx}px` }}>
          <div className="w-full grid grid-cols-3 items-center justify-items-center" style={{ gap: `${gapPx}px` }}>
            {renderSectionTile(slot1, { mode: 'open', extraClass: 'w-full translate-y-1 sm:translate-y-3' })}
            {renderSectionTile(slot0, { mode: 'open', isHero: true, extraClass: 'w-full -translate-y-1 sm:-translate-y-2' })}
            {renderSectionTile(slot2, { mode: 'open', extraClass: 'w-full translate-y-1 sm:translate-y-3' })}
          </div>
          <div className="w-full max-w-2xl grid grid-cols-2 items-center justify-items-center" style={{ gap: `${gapPx}px` }}>
            {renderSectionTile(slot3, { mode: 'open', extraClass: 'w-full' })}
            {renderSectionTile(slot4, { mode: 'open', extraClass: 'w-full' })}
          </div>
        </div>
      );

    // 11. REVERSE DOCK + BOTTOM HERO
    case 'layout-11':
      return (
        <div className={`${containerMax} flex flex-col`} style={{ gap: `${gapPx}px` }}>
          <div className="grid grid-cols-2 sm:grid-cols-4" style={{ gap: `${gapPx}px` }}>
            {[slot1, slot2, slot3, slot4].map((item) =>
              renderSectionTile(item, { mode: 'card', extraClass: previewMode ? 'min-h-[48px]' : 'min-h-[92px]' })
            )}
          </div>
          {renderSectionTile(slot0, { mode: 'wide', isHero: true, extraClass: previewMode ? 'min-h-[42px]' : 'min-h-[94px]' })}
        </div>
      );

    // 12. STAGE LEFT & RIGHT RAIL (3+2)
    case 'layout-12':
      return (
        <div className={`${containerMax} grid grid-cols-1 md:grid-cols-12 items-stretch`} style={{ gap: `${gapPx}px` }}>
          <div className="md:col-span-8 grid grid-cols-3 items-stretch" style={{ gap: `${gapPx}px` }}>
            {[slot0, slot1, slot2].map((item, idx) =>
              renderSectionTile(item, { mode: 'card', isHero: idx === 0, extraClass: previewMode ? 'min-h-[74px]' : 'min-h-[150px]' })
            )}
          </div>
          <div className="md:col-span-4 flex flex-col justify-center" style={{ gap: `${gapPx}px` }}>
            {renderSectionTile(slot3, { mode: 'row', extraClass: 'flex-1' })}
            {renderSectionTile(slot4, { mode: 'row', extraClass: 'flex-1' })}
          </div>
        </div>
      );

    // 13. TRIO TOP + TWIN ROWS
    case 'layout-13':
      return (
        <div className={`${containerMax} flex flex-col`} style={{ gap: `${gapPx}px` }}>
          <div className="grid grid-cols-3" style={{ gap: `${gapPx}px` }}>
            {[slot0, slot1, slot2].map((item, idx) =>
              renderSectionTile(item, { mode: 'card', isHero: idx === 0, extraClass: previewMode ? 'min-h-[54px]' : 'min-h-[110px]' })
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: `${gapPx}px` }}>
            {renderSectionTile(slot3, { mode: 'row' })}
            {renderSectionTile(slot4, { mode: 'row' })}
          </div>
        </div>
      );

    // 14. 2 TALL TOP + 3 COMPACT STRIP
    case 'layout-14':
      return (
        <div className={`${containerMax} flex flex-col`} style={{ gap: `${gapPx}px` }}>
          <div className="grid grid-cols-2" style={{ gap: `${gapPx}px` }}>
            {renderSectionTile(slot0, { mode: 'card', isHero: true, extraClass: previewMode ? 'min-h-[60px]' : 'min-h-[124px]' })}
            {renderSectionTile(slot1, { mode: 'card', extraClass: previewMode ? 'min-h-[60px]' : 'min-h-[124px]' })}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3" style={{ gap: `${gapPx}px` }}>
            {[slot2, slot3, slot4].map((item) => renderSectionTile(item, { mode: 'row' }))}
          </div>
        </div>
      );

    // 15. 3 STACKED ROWS LEFT + 2 TALL HEROES RIGHT
    case 'layout-15':
      return (
        <div className={`${containerMax} grid grid-cols-1 md:grid-cols-12 items-stretch`} style={{ gap: `${gapPx}px` }}>
          <div className="md:col-span-5 flex flex-col justify-between" style={{ gap: `${Math.max(4, gapPx * 0.7)}px` }}>
            {[slot2, slot3, slot4].map((item) => renderSectionTile(item, { mode: 'row', extraClass: 'flex-1' }))}
          </div>
          <div className="md:col-span-7 grid grid-cols-2 items-stretch" style={{ gap: `${gapPx}px` }}>
            {renderSectionTile(slot0, { mode: 'card', isHero: true, extraClass: previewMode ? 'min-h-[82px]' : 'min-h-[175px]' })}
            {renderSectionTile(slot1, { mode: 'card', extraClass: previewMode ? 'min-h-[82px]' : 'min-h-[175px]' })}
          </div>
        </div>
      );

    // 16. ASCENDING STAIRCASE
    case 'layout-16': {
      const steps = ['translate-y-4 sm:translate-y-8', 'translate-y-2 sm:translate-y-4', 'translate-y-0', '-translate-y-2 sm:-translate-y-4', '-translate-y-4 sm:-translate-y-8'];
      return (
        <div className={`${containerMax} grid grid-cols-5 items-center justify-items-center py-4`} style={{ gap: `${gapPx}px` }}>
          {slots.map((item, idx) => renderSectionTile(item, { mode: 'open', isHero: idx === 4, extraClass: `w-full ${steps[idx]}` }))}
        </div>
      );
    }

    // 17. DESCENDING STAIRCASE
    case 'layout-17': {
      const steps = ['-translate-y-4 sm:-translate-y-8', '-translate-y-2 sm:-translate-y-4', 'translate-y-0', 'translate-y-2 sm:translate-y-4', 'translate-y-4 sm:translate-y-8'];
      return (
        <div className={`${containerMax} grid grid-cols-5 items-center justify-items-center py-4`} style={{ gap: `${gapPx}px` }}>
          {slots.map((item, idx) => renderSectionTile(item, { mode: 'open', isHero: idx === 0, extraClass: `w-full ${steps[idx]}` }))}
        </div>
      );
    }

    // 18. INVERTED U-VALLEY PODIUM
    case 'layout-18': {
      const valley = ['-translate-y-3 sm:-translate-y-6', 'translate-y-0', 'translate-y-3 sm:translate-y-6', 'translate-y-0', '-translate-y-3 sm:-translate-y-6'];
      return (
        <div className={`${containerMax} grid grid-cols-5 items-center justify-items-center py-3`} style={{ gap: `${gapPx}px` }}>
          {slots.map((item, idx) => renderSectionTile(item, { mode: 'card', isHero: idx === 0 || idx === 4, extraClass: `w-full ${valley[idx]}` }))}
        </div>
      );
    }

    // 19. ALTERNATING ZIGZAG WAVE
    case 'layout-19': {
      const wave = ['-translate-y-2 sm:-translate-y-4', 'translate-y-2 sm:translate-y-4', '-translate-y-2 sm:-translate-y-4', 'translate-y-2 sm:translate-y-4', '-translate-y-2 sm:-translate-y-4'];
      return (
        <div className={`${containerMax} grid grid-cols-5 items-center justify-items-center py-3`} style={{ gap: `${gapPx}px` }}>
          {slots.map((item, idx) => renderSectionTile(item, { mode: 'open', isHero: idx === 0, extraClass: `w-full ${wave[idx]}` }))}
        </div>
      );
    }

    // 20. ARCHITECTURAL PLUS CROSS (+)
    case 'layout-20':
      return (
        <div className={`${containerMax} flex flex-col items-center`} style={{ gap: `${gapPx}px` }}>
          <div className={previewMode ? 'w-1/2' : 'w-full max-w-sm'}>
            {renderSectionTile(slot0, { mode: 'row', isHero: true })}
          </div>
          <div className="w-full grid grid-cols-3" style={{ gap: `${gapPx}px` }}>
            {renderSectionTile(slot1, { mode: 'card' })}
            {renderSectionTile(slot2, { mode: 'card', isHero: true })}
            {renderSectionTile(slot3, { mode: 'card' })}
          </div>
          <div className={previewMode ? 'w-1/2' : 'w-full max-w-sm'}>
            {renderSectionTile(slot4, { mode: 'row' })}
          </div>
        </div>
      );

    // 21. DIAMOND X-PENTAD
    case 'layout-21':
      return (
        <div className={`${containerMax} flex flex-col items-center`} style={{ gap: `${Math.max(4, gapPx * 0.7)}px` }}>
          <div className="w-full flex items-center justify-between gap-4">
            <div className="w-[40%]">{renderSectionTile(slot1, { mode: 'row' })}</div>
            <div className="w-[40%]">{renderSectionTile(slot2, { mode: 'row' })}</div>
          </div>
          <div className={previewMode ? 'w-1/2' : 'w-full max-w-md'}>
            {renderSectionTile(slot0, { mode: 'wide', isHero: true })}
          </div>
          <div className="w-full flex items-center justify-between gap-4">
            <div className="w-[40%]">{renderSectionTile(slot3, { mode: 'row' })}</div>
            <div className="w-[40%]">{renderSectionTile(slot4, { mode: 'row' })}</div>
          </div>
        </div>
      );

    // 22. TOP STRIP + INNER SIDE TILE + 3 STAGE
    case 'layout-22':
      return (
        <div className={`${containerMax} flex flex-col`} style={{ gap: `${gapPx}px` }}>
          {renderSectionTile(slot0, { mode: 'wide', isHero: true })}
          <div className="grid grid-cols-1 md:grid-cols-12 items-stretch" style={{ gap: `${gapPx}px` }}>
            <div className="md:col-span-3 flex">{renderSectionTile(slot4, { mode: 'card', extraClass: 'w-full' })}</div>
            <div className="md:col-span-9 grid grid-cols-3" style={{ gap: `${gapPx}px` }}>
              {[slot1, slot2, slot3].map((item) => renderSectionTile(item, { mode: 'card' }))}
            </div>
          </div>
        </div>
      );

    // 23. CENTER CITADEL (2 | 1 | 2)
    case 'layout-23':
      return (
        <div className={`${containerMax} grid grid-cols-1 md:grid-cols-12 items-stretch`} style={{ gap: `${gapPx}px` }}>
          <div className="md:col-span-4 grid grid-rows-2" style={{ gap: `${gapPx}px` }}>
            {renderSectionTile(slot1, { mode: 'row', extraClass: 'h-full' })}
            {renderSectionTile(slot3, { mode: 'row', extraClass: 'h-full' })}
          </div>
          <div className="md:col-span-4 flex">
            {renderSectionTile(slot0, { mode: 'card', isHero: true, extraClass: `w-full ${previewMode ? 'min-h-[86px]' : 'min-h-[190px]'}` })}
          </div>
          <div className="md:col-span-4 grid grid-rows-2" style={{ gap: `${gapPx}px` }}>
            {renderSectionTile(slot2, { mode: 'row', extraClass: 'h-full' })}
            {renderSectionTile(slot4, { mode: 'row', extraClass: 'h-full' })}
          </div>
        </div>
      );

    // 24. L-DOCK LEFT ANCHOR
    case 'layout-24':
      return (
        <div className={`${containerMax} grid grid-cols-1 md:grid-cols-12 items-stretch`} style={{ gap: `${gapPx}px` }}>
          <div className="md:col-span-4 flex">
            {renderSectionTile(slot0, { mode: 'card', isHero: true, extraClass: `w-full ${previewMode ? 'min-h-[90px]' : 'min-h-[195px]'}` })}
          </div>
          <div className="md:col-span-8 flex flex-col" style={{ gap: `${gapPx}px` }}>
            {renderSectionTile(slot1, { mode: 'wide', extraClass: 'flex-1' })}
            <div className="grid grid-cols-3" style={{ gap: `${gapPx}px` }}>
              {[slot2, slot3, slot4].map((item) => renderSectionTile(item, { mode: 'card' }))}
            </div>
          </div>
        </div>
      );

    // 25. L-DOCK RIGHT ANCHOR
    case 'layout-25':
      return (
        <div className={`${containerMax} grid grid-cols-1 md:grid-cols-12 items-stretch`} style={{ gap: `${gapPx}px` }}>
          <div className="md:col-span-8 flex flex-col" style={{ gap: `${gapPx}px` }}>
            {renderSectionTile(slot1, { mode: 'wide', extraClass: 'flex-1' })}
            <div className="grid grid-cols-3" style={{ gap: `${gapPx}px` }}>
              {[slot2, slot3, slot4].map((item) => renderSectionTile(item, { mode: 'card' }))}
            </div>
          </div>
          <div className="md:col-span-4 flex">
            {renderSectionTile(slot0, { mode: 'card', isHero: true, extraClass: `w-full ${previewMode ? 'min-h-[90px]' : 'min-h-[195px]'}` })}
          </div>
        </div>
      );

    // 26. SPOTLIGHT CAROUSEL STRIP (Lead 4 cols + four 2 cols)
    case 'layout-26':
      return (
        <div className={`${containerMax} grid grid-cols-12 items-stretch`} style={{ gap: `${gapPx}px` }}>
          <div className="col-span-4 flex">
            {renderSectionTile(slot0, { mode: 'card', isHero: true, extraClass: `w-full ${previewMode ? 'min-h-[78px]' : 'min-h-[150px]'}` })}
          </div>
          {[slot1, slot2, slot3, slot4].map((item) => (
            <div key={item.kind} className="col-span-2 flex">
              {renderSectionTile(item, { mode: 'card', extraClass: 'w-full' })}
            </div>
          ))}
        </div>
      );

    // 27. 70/30 EDITORIAL COLUMNS
    case 'layout-27':
      return (
        <div className={`${containerMax} grid grid-cols-1 md:grid-cols-12 items-stretch`} style={{ gap: `${gapPx}px` }}>
          <div className="md:col-span-7 flex flex-col" style={{ gap: `${gapPx}px` }}>
            {renderSectionTile(slot0, { mode: 'wide', isHero: true, extraClass: 'flex-1' })}
            {renderSectionTile(slot1, { mode: 'wide', extraClass: 'flex-1' })}
          </div>
          <div className="md:col-span-5 flex flex-col" style={{ gap: `${gapPx}px` }}>
            {[slot2, slot3, slot4].map((item) => renderSectionTile(item, { mode: 'row', extraClass: 'flex-1' }))}
          </div>
        </div>
      );

    // 28. MAGAZINE COVER GRID
    case 'layout-28':
      return (
        <div className={`${containerMax} flex flex-col`} style={{ gap: `${gapPx}px` }}>
          <div className="grid grid-cols-12 items-stretch" style={{ gap: `${gapPx}px` }}>
            <div className="col-span-8 flex">
              {renderSectionTile(slot0, { mode: 'wide', isHero: true, extraClass: previewMode ? 'min-h-[48px]' : 'min-h-[112px]' })}
            </div>
            <div className="col-span-4 flex">
              {renderSectionTile(slot1, { mode: 'card', extraClass: 'w-full' })}
            </div>
          </div>
          <div className="grid grid-cols-3" style={{ gap: `${gapPx}px` }}>
            {[slot2, slot3, slot4].map((item) => renderSectionTile(item, { mode: 'card' }))}
          </div>
        </div>
      );

    // 29. FULL-WIDTH CINEMA MARQUEE BANNERS
    case 'layout-29':
      return (
        <div className={`${containerMax} flex flex-col`} style={{ gap: `${Math.max(4, Math.round(gapPx * 0.6))}px` }}>
          {slots.map((item, idx) =>
            renderSectionTile(item, {
              mode: 'wide',
              isHero: idx === 0,
              extraClass: previewMode ? 'min-h-[28px]' : 'min-h-[60px]',
            })
          )}
        </div>
      );

    // 30. TRIPLE TIER (1 + 2 + 2)
    case 'layout-30':
      return (
        <div className={`${containerMax} flex flex-col`} style={{ gap: `${gapPx}px` }}>
          {renderSectionTile(slot0, { mode: 'wide', isHero: true })}
          <div className="grid grid-cols-2" style={{ gap: `${gapPx}px` }}>
            {renderSectionTile(slot1, { mode: 'card' })}
            {renderSectionTile(slot2, { mode: 'card' })}
          </div>
          <div className="grid grid-cols-2" style={{ gap: `${gapPx}px` }}>
            {renderSectionTile(slot3, { mode: 'row' })}
            {renderSectionTile(slot4, { mode: 'row' })}
          </div>
        </div>
      );

    // 31. QUAD 2x2 GRID + FOOTER BAR
    case 'layout-31':
      return (
        <div className={`${containerMax} flex flex-col`} style={{ gap: `${gapPx}px` }}>
          <div className="grid grid-cols-2" style={{ gap: `${gapPx}px` }}>
            {[slot0, slot1, slot2, slot3].map((item, idx) =>
              renderSectionTile(item, { mode: 'card', isHero: idx === 0 })
            )}
          </div>
          {renderSectionTile(slot4, { mode: 'wide' })}
        </div>
      );

    // 32. SLIM TOP BAR + 2x2 QUAD
    case 'layout-32':
      return (
        <div className={`${containerMax} flex flex-col`} style={{ gap: `${gapPx}px` }}>
          {renderSectionTile(slot4, { mode: 'row' })}
          <div className="grid grid-cols-2" style={{ gap: `${gapPx}px` }}>
            {[slot0, slot1, slot2, slot3].map((item, idx) =>
              renderSectionTile(item, { mode: 'card', isHero: idx === 0 })
            )}
          </div>
        </div>
      );

    // 33. WING-FOCUS-WING SANDWICH
    case 'layout-33':
      return (
        <div className={`${containerMax} grid grid-cols-1 md:grid-cols-12 items-stretch`} style={{ gap: `${gapPx}px` }}>
          <div className="md:col-span-3 flex">
            {renderSectionTile(slot1, { mode: 'card', extraClass: 'w-full' })}
          </div>
          <div className="md:col-span-6 flex flex-col justify-between" style={{ gap: `${Math.max(4, gapPx * 0.7)}px` }}>
            {renderSectionTile(slot0, { mode: 'wide', isHero: true, extraClass: 'flex-1' })}
            {renderSectionTile(slot3, { mode: 'row', extraClass: 'flex-1' })}
            {renderSectionTile(slot4, { mode: 'row', extraClass: 'flex-1' })}
          </div>
          <div className="md:col-span-3 flex">
            {renderSectionTile(slot2, { mode: 'card', extraClass: 'w-full' })}
          </div>
        </div>
      );

    // 34. RAINBOW CROWN ARCH
    case 'layout-34': {
      const arch = ['translate-y-4 sm:translate-y-8', 'translate-y-1 sm:translate-y-2', '-translate-y-3 sm:-translate-y-6', 'translate-y-1 sm:translate-y-2', 'translate-y-4 sm:translate-y-8'];
      const order = [slot3, slot1, slot0, slot2, slot4];
      return (
        <div className={`${containerMax} grid grid-cols-5 items-center justify-items-center py-4`} style={{ gap: `${gapPx}px` }}>
          {order.map((item, idx) =>
            renderSectionTile(item, { mode: 'open', isHero: idx === 2, extraClass: `w-full ${arch[idx]}` })
          )}
        </div>
      );
    }

    // 35. DEEP CRADLE CURVE
    case 'layout-35': {
      const cradle = ['-translate-y-4 sm:-translate-y-7', '-translate-y-1 sm:-translate-y-2', 'translate-y-3 sm:translate-y-6', '-translate-y-1 sm:-translate-y-2', '-translate-y-4 sm:-translate-y-7'];
      const order = [slot3, slot1, slot0, slot2, slot4];
      return (
        <div className={`${containerMax} grid grid-cols-5 items-center justify-items-center py-4`} style={{ gap: `${gapPx}px` }}>
          {order.map((item, idx) =>
            renderSectionTile(item, { mode: 'open', isHero: idx === 2, extraClass: `w-full ${cradle[idx]}` })
          )}
        </div>
      );
    }

    // 36. CENTERED TIERED TRIAD (1 + 2 + 2)
    case 'layout-36':
      return (
        <div className={`${containerMax} flex flex-col items-center`} style={{ gap: `${gapPx}px` }}>
          <div className={previewMode ? 'w-3/5' : 'w-full max-w-md'}>
            {renderSectionTile(slot0, { mode: 'wide', isHero: true })}
          </div>
          <div className="w-full max-w-3xl grid grid-cols-2" style={{ gap: `${gapPx}px` }}>
            {renderSectionTile(slot1, { mode: 'card' })}
            {renderSectionTile(slot2, { mode: 'card' })}
          </div>
          <div className="w-full grid grid-cols-2" style={{ gap: `${gapPx}px` }}>
            {renderSectionTile(slot3, { mode: 'row' })}
            {renderSectionTile(slot4, { mode: 'row' })}
          </div>
        </div>
      );

    // 37. CORNER ANCHOR 2x2 + SPINE
    case 'layout-37':
      return (
        <div className={`${containerMax} grid grid-cols-1 md:grid-cols-12 items-stretch`} style={{ gap: `${gapPx}px` }}>
          <div className="md:col-span-8 grid grid-cols-2 grid-rows-2" style={{ gap: `${gapPx}px` }}>
            {[slot0, slot1, slot2, slot3].map((item, idx) =>
              renderSectionTile(item, { mode: 'card', isHero: idx === 0 })
            )}
          </div>
          <div className="md:col-span-4 flex">
            {renderSectionTile(slot4, { mode: 'card', extraClass: `w-full ${previewMode ? 'min-h-[86px]' : 'min-h-[190px]'}` })}
          </div>
        </div>
      );

    // 38. ASYMMETRIC TWIN MASONRY
    case 'layout-38':
      return (
        <div className={`${containerMax} grid grid-cols-1 sm:grid-cols-2 items-stretch`} style={{ gap: `${gapPx}px` }}>
          <div className="flex flex-col" style={{ gap: `${gapPx}px` }}>
            {renderSectionTile(slot0, { mode: 'card', isHero: true, extraClass: 'flex-[1.4]' })}
            {renderSectionTile(slot3, { mode: 'row', extraClass: 'flex-1' })}
          </div>
          <div className="flex flex-col" style={{ gap: `${gapPx}px` }}>
            {renderSectionTile(slot1, { mode: 'row', extraClass: 'flex-1' })}
            {renderSectionTile(slot2, { mode: 'card', extraClass: 'flex-[1.3]' })}
            {renderSectionTile(slot4, { mode: 'row', extraClass: 'flex-1' })}
          </div>
        </div>
      );

    // 39. PINNED FOUR CORNERS + CORE BRIDGE
    case 'layout-39':
      return (
        <div className={`${containerMax} flex flex-col`} style={{ gap: `${Math.max(4, gapPx * 0.75)}px` }}>
          <div className="grid grid-cols-2" style={{ gap: `${previewMode ? 18 : 48}px` }}>
            {renderSectionTile(slot1, { mode: 'card' })}
            {renderSectionTile(slot2, { mode: 'card' })}
          </div>
          <div className="mx-auto w-full max-w-xl">
            {renderSectionTile(slot0, { mode: 'wide', isHero: true })}
          </div>
          <div className="grid grid-cols-2" style={{ gap: `${previewMode ? 18 : 48}px` }}>
            {renderSectionTile(slot3, { mode: 'card' })}
            {renderSectionTile(slot4, { mode: 'card' })}
          </div>
        </div>
      );

    // 40. COMPACT PILL CAPSULES
    case 'layout-40':
    default:
      return (
        <div className={`${containerMax} flex flex-wrap items-center justify-center`} style={{ gap: `${gapPx}px` }}>
          {slots.map((item, idx) => renderSectionTile(item, { mode: 'pill', isHero: idx === 0 }))}
        </div>
      );
  }
}
