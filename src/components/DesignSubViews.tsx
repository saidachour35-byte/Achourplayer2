import React, { useMemo, useState, useEffect, useCallback } from 'react';
import {
  Check,
  Eye,
  Frame,
  Grid,
  Layers,
  Maximize2,
  Palette,
  RotateCcw,
  Sliders,
  Sparkles,
  SunMoon,
  Target,
  Type,
  ArrowUpDown,
} from 'lucide-react';
import {
  AppSettings,
  FrameShapeId,
  IconDisplayMode,
  IconPackId,
  WindowSizeScales,
} from '../types';
import {
  DASHBOARD_LAYOUTS,
  FRAME_SHAPES,
  ICON_PACKS,
  ROYAL_THEMES,
  computePaletteFromHex,
  isValidHexColor,
  normalizeDashboardLayoutId,
  normalizeHexColor,
} from '../utils/themeManager';
import { IconKind } from './DashboardLayouts';
import { DashboardSectionIcon, PackIconSvg } from './IconPacks';

export const DEFAULT_DASHBOARD_ORDER: IconKind[] = ['live', 'movies', 'series', 'add', 'settings'];

export type DesignSubViewId =
  | 'background-opacity'
  | 'window-sizes'
  | 'design-display'
  | 'design-icons'
  | 'design-frames'
  | 'design-layouts'
  | 'design-icon-size'
  | 'design-frame-size'
  | 'design-spacing'
  | 'design-alignment'
  | 'design-order'
  | 'design-colors'
  | 'design-custom-color'
  | 'design-glass-opacity'
  | 'design-glass-blur'
  | 'design-focus-mode'
  | 'design-label-color';

export function renderLayoutDiagram(layoutId: string) {
  switch (layoutId) {
    case 'layout-dock-row':
      return (
        <div className="w-full h-10 grid grid-cols-5 gap-1 items-center px-1">
          {[0, 1, 2, 3, 4].map((i) => (
            <span
              key={i}
              className={`h-5 rounded-md border ${
                i === 0 ? 'bg-gold/30 border-gold' : 'bg-white/10 border-white/20'
              }`}
            />
          ))}
        </div>
      );
    case 'layout-hero-dock':
      return (
        <div className="w-full h-10 flex flex-col gap-1">
          <span className="h-4.5 rounded-md bg-gold/30 border border-gold" />
          <div className="grid grid-cols-4 gap-1 h-4">
            {[0, 1, 2, 3].map((i) => (
              <span key={i} className="rounded bg-white/10 border border-white/20" />
            ))}
          </div>
        </div>
      );
    case 'layout-side-rail':
      return (
        <div className="w-full h-10 grid grid-cols-12 gap-1">
          <div className="col-span-4 flex flex-col gap-1">
            <span className="flex-1 rounded bg-white/10 border border-white/20" />
            <span className="flex-1 rounded bg-white/10 border border-white/20" />
          </div>
          <div className="col-span-8 grid grid-cols-3 gap-1">
            <span className="rounded bg-gold/30 border border-gold" />
            <span className="rounded bg-white/10 border border-white/20" />
            <span className="rounded bg-white/10 border border-white/20" />
          </div>
        </div>
      );
    case 'layout-bento-mosaic':
      return (
        <div className="w-full h-10 grid grid-cols-12 gap-1">
          <span className="col-span-4 rounded bg-gold/30 border border-gold" />
          <div className="col-span-4 grid grid-rows-2 gap-1">
            <span className="rounded bg-white/15 border border-white/20" />
            <span className="rounded bg-white/10 border border-white/20" />
          </div>
          <div className="col-span-4 grid grid-rows-2 gap-1">
            <span className="rounded bg-white/15 border border-white/20" />
            <span className="rounded bg-white/10 border border-white/20" />
          </div>
        </div>
      );
    case 'layout-twin-spotlight':
      return (
        <div className="w-full h-10 flex flex-col gap-1">
          <div className="grid grid-cols-2 gap-1 h-5">
            <span className="rounded bg-gold/30 border border-gold" />
            <span className="rounded bg-gold/15 border border-gold/50" />
          </div>
          <div className="grid grid-cols-3 gap-1 h-4">
            {[0, 1, 2].map((i) => (
              <span key={i} className="rounded bg-white/10 border border-white/20" />
            ))}
          </div>
        </div>
      );
    case 'layout-center-spotlight':
      return (
        <div className="w-full h-10 grid grid-cols-5 gap-1 items-end">
          <span className="h-4 rounded bg-white/10 border border-white/20" />
          <span className="h-6 rounded bg-white/15 border border-gold/45" />
          <span className="h-9 rounded bg-gold/30 border border-gold" />
          <span className="h-6 rounded bg-white/15 border border-gold/45" />
          <span className="h-4 rounded bg-white/10 border border-white/20" />
        </div>
      );
    case 'layout-split-stage':
      return (
        <div className="w-full h-10 grid grid-cols-2 gap-1">
          <span className="rounded bg-gold/30 border border-gold" />
          <div className="grid grid-cols-2 grid-rows-2 gap-1">
            {[0, 1, 2, 3].map((i) => (
              <span key={i} className="rounded bg-white/10 border border-white/20" />
            ))}
          </div>
        </div>
      );
    case 'layout-vertical-list':
      return (
        <div className="w-full h-10 flex flex-col justify-between items-center py-0.5">
          {[0, 1, 2, 3, 4].map((i) => (
            <span
              key={i}
              className={`w-3/4 h-1 rounded-full ${
                i === 0 ? 'bg-gold' : 'bg-white/25'
              }`}
            />
          ))}
        </div>
      );
    case 'layout-orbital-hub':
      return (
        <div className="w-full h-10 relative grid grid-cols-2 grid-rows-2 gap-1">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className="rounded bg-white/10 border border-white/20" />
          ))}
          <span className="absolute inset-0 m-auto w-5 h-5 rounded-full bg-gold/40 border border-gold" />
        </div>
      );
    case 'layout-staircase-cascade':
      return (
        <div className="w-full h-10 flex flex-col items-center justify-center gap-1">
          <div className="grid grid-cols-3 gap-1 w-full h-4.5">
            <span className="rounded bg-white/15 border border-white/20 translate-y-0.5" />
            <span className="rounded bg-gold/30 border border-gold -translate-y-0.5" />
            <span className="rounded bg-white/15 border border-white/20 translate-y-0.5" />
          </div>
          <div className="grid grid-cols-2 gap-1 w-2/3 h-3.5">
            <span className="rounded bg-white/10 border border-white/20" />
            <span className="rounded bg-white/10 border border-white/20" />
          </div>
        </div>
      );
    case 'layout-11':
      return (
        <div className="w-full h-10 flex flex-col gap-1">
          <div className="grid grid-cols-4 gap-1 h-4">
            {[0, 1, 2, 3].map((i) => (
              <span key={i} className="rounded bg-white/10 border border-white/20" />
            ))}
          </div>
          <span className="h-4.5 rounded-md bg-gold/30 border border-gold" />
        </div>
      );
    case 'layout-12':
      return (
        <div className="w-full h-10 grid grid-cols-12 gap-1">
          <div className="col-span-8 grid grid-cols-3 gap-1">
            <span className="rounded bg-gold/30 border border-gold" />
            <span className="rounded bg-white/10 border border-white/20" />
            <span className="rounded bg-white/10 border border-white/20" />
          </div>
          <div className="col-span-4 flex flex-col gap-1">
            <span className="flex-1 rounded bg-white/10 border border-white/20" />
            <span className="flex-1 rounded bg-white/10 border border-white/20" />
          </div>
        </div>
      );
    case 'layout-13':
      return (
        <div className="w-full h-10 flex flex-col gap-1">
          <div className="grid grid-cols-3 gap-1 h-5">
            <span className="rounded bg-gold/30 border border-gold" />
            <span className="rounded bg-white/15 border border-white/20" />
            <span className="rounded bg-white/15 border border-white/20" />
          </div>
          <div className="grid grid-cols-2 gap-1 h-3.5">
            <span className="rounded bg-white/10 border border-white/20" />
            <span className="rounded bg-white/10 border border-white/20" />
          </div>
        </div>
      );
    case 'layout-14':
      return (
        <div className="w-full h-10 flex flex-col gap-1">
          <div className="grid grid-cols-2 gap-1 h-5.5">
            <span className="rounded bg-gold/30 border border-gold" />
            <span className="rounded bg-white/15 border border-white/20" />
          </div>
          <div className="grid grid-cols-3 gap-1 h-3">
            {[0, 1, 2].map((i) => <span key={i} className="rounded bg-white/10 border border-white/20" />)}
          </div>
        </div>
      );
    case 'layout-15':
      return (
        <div className="w-full h-10 grid grid-cols-12 gap-1">
          <div className="col-span-5 flex flex-col gap-0.5">
            {[0, 1, 2].map((i) => <span key={i} className="flex-1 rounded bg-white/10 border border-white/20" />)}
          </div>
          <div className="col-span-7 grid grid-cols-2 gap-1">
            <span className="rounded bg-gold/30 border border-gold" />
            <span className="rounded bg-white/15 border border-white/20" />
          </div>
        </div>
      );
    case 'layout-16':
      return (
        <div className="w-full h-10 grid grid-cols-5 gap-1 items-end px-1">
          {[3, 4, 5, 7, 9].map((h, i) => (
            <span key={i} style={{ height: `${h * 4}px` }} className={`rounded ${i === 4 ? 'bg-gold/30 border border-gold' : 'bg-white/10 border border-white/20'}`} />
          ))}
        </div>
      );
    case 'layout-17':
      return (
        <div className="w-full h-10 grid grid-cols-5 gap-1 items-end px-1">
          {[9, 7, 5, 4, 3].map((h, i) => (
            <span key={i} style={{ height: `${h * 4}px` }} className={`rounded ${i === 0 ? 'bg-gold/30 border border-gold' : 'bg-white/10 border border-white/20'}`} />
          ))}
        </div>
      );
    case 'layout-18':
      return (
        <div className="w-full h-10 grid grid-cols-5 gap-1 items-end px-1">
          {[9, 6, 4, 6, 9].map((h, i) => (
            <span key={i} style={{ height: `${h * 4}px` }} className={`rounded ${i === 0 || i === 4 ? 'bg-gold/30 border border-gold' : 'bg-white/10 border border-white/20'}`} />
          ))}
        </div>
      );
    case 'layout-19':
      return (
        <div className="w-full h-10 grid grid-cols-5 gap-1 items-center px-1">
          {[-4, 4, -4, 4, -4].map((y, i) => (
            <span key={i} style={{ transform: `translateY(${y}px)` }} className={`h-4 rounded ${i === 0 ? 'bg-gold/30 border border-gold' : 'bg-white/10 border border-white/20'}`} />
          ))}
        </div>
      );
    case 'layout-20':
      return (
        <div className="w-full h-10 flex flex-col items-center justify-between py-0.5">
          <span className="w-1/3 h-2 rounded bg-gold/35 border border-gold" />
          <div className="w-full grid grid-cols-3 gap-1 h-3.5">
            <span className="rounded bg-white/10 border border-white/20" />
            <span className="rounded bg-gold/30 border border-gold" />
            <span className="rounded bg-white/10 border border-white/20" />
          </div>
          <span className="w-1/3 h-2 rounded bg-white/15 border border-white/20" />
        </div>
      );
    case 'layout-21':
      return (
        <div className="w-full h-10 flex flex-col items-center justify-between py-0.5">
          <div className="w-full flex justify-between px-1">
            <span className="w-7 h-2 rounded bg-white/15 border border-white/20" />
            <span className="w-7 h-2 rounded bg-white/15 border border-white/20" />
          </div>
          <span className="w-1/2 h-3 rounded bg-gold/30 border border-gold" />
          <div className="w-full flex justify-between px-1">
            <span className="w-7 h-2 rounded bg-white/10 border border-white/20" />
            <span className="w-7 h-2 rounded bg-white/10 border border-white/20" />
          </div>
        </div>
      );
    case 'layout-22':
      return (
        <div className="w-full h-10 flex flex-col gap-1">
          <span className="h-3.5 rounded bg-gold/30 border border-gold" />
          <div className="grid grid-cols-12 gap-1 flex-1">
            <span className="col-span-3 rounded bg-white/15 border border-white/20" />
            <div className="col-span-9 grid grid-cols-3 gap-1">
              {[0, 1, 2].map((i) => <span key={i} className="rounded bg-white/10 border border-white/20" />)}
            </div>
          </div>
        </div>
      );
    case 'layout-23':
      return (
        <div className="w-full h-10 grid grid-cols-12 gap-1">
          <div className="col-span-4 grid grid-rows-2 gap-1">
            <span className="rounded bg-white/10 border border-white/20" />
            <span className="rounded bg-white/10 border border-white/20" />
          </div>
          <span className="col-span-4 rounded bg-gold/30 border border-gold" />
          <div className="col-span-4 grid grid-rows-2 gap-1">
            <span className="rounded bg-white/10 border border-white/20" />
            <span className="rounded bg-white/10 border border-white/20" />
          </div>
        </div>
      );
    case 'layout-24':
      return (
        <div className="w-full h-10 grid grid-cols-12 gap-1">
          <span className="col-span-4 rounded bg-gold/30 border border-gold" />
          <div className="col-span-8 flex flex-col gap-1">
            <span className="flex-1 rounded bg-white/15 border border-white/20" />
            <div className="grid grid-cols-3 gap-1 h-3.5">
              {[0, 1, 2].map((i) => <span key={i} className="rounded bg-white/10 border border-white/20" />)}
            </div>
          </div>
        </div>
      );
    case 'layout-25':
      return (
        <div className="w-full h-10 grid grid-cols-12 gap-1">
          <div className="col-span-8 flex flex-col gap-1">
            <span className="flex-1 rounded bg-white/15 border border-white/20" />
            <div className="grid grid-cols-3 gap-1 h-3.5">
              {[0, 1, 2].map((i) => <span key={i} className="rounded bg-white/10 border border-white/20" />)}
            </div>
          </div>
          <span className="col-span-4 rounded bg-gold/30 border border-gold" />
        </div>
      );
    case 'layout-26':
      return (
        <div className="w-full h-10 grid grid-cols-12 gap-1 py-1">
          <span className="col-span-4 rounded bg-gold/30 border border-gold" />
          {[0, 1, 2, 3].map((i) => <span key={i} className="col-span-2 rounded bg-white/10 border border-white/20" />)}
        </div>
      );
    case 'layout-27':
      return (
        <div className="w-full h-10 grid grid-cols-12 gap-1">
          <div className="col-span-7 flex flex-col gap-1">
            <span className="flex-1 rounded bg-gold/30 border border-gold" />
            <span className="flex-1 rounded bg-white/15 border border-white/20" />
          </div>
          <div className="col-span-5 flex flex-col gap-0.5">
            {[0, 1, 2].map((i) => <span key={i} className="flex-1 rounded bg-white/10 border border-white/20" />)}
          </div>
        </div>
      );
    case 'layout-28':
      return (
        <div className="w-full h-10 flex flex-col gap-1">
          <div className="grid grid-cols-12 gap-1 h-5">
            <span className="col-span-8 rounded bg-gold/30 border border-gold" />
            <span className="col-span-4 rounded bg-white/15 border border-white/20" />
          </div>
          <div className="grid grid-cols-3 gap-1 h-3.5">
            {[0, 1, 2].map((i) => <span key={i} className="rounded bg-white/10 border border-white/20" />)}
          </div>
        </div>
      );
    case 'layout-29':
      return (
        <div className="w-full h-10 flex flex-col justify-between py-0.5">
          {[0, 1, 2, 3, 4].map((i) => (
            <span key={i} className={`w-full h-1.5 rounded ${i === 0 ? 'bg-gold/75' : 'bg-white/20'}`} />
          ))}
        </div>
      );
    case 'layout-30':
      return (
        <div className="w-full h-10 flex flex-col gap-0.5">
          <span className="h-3 rounded bg-gold/30 border border-gold" />
          <div className="grid grid-cols-2 gap-1 h-3">
            <span className="rounded bg-white/15 border border-white/20" />
            <span className="rounded bg-white/15 border border-white/20" />
          </div>
          <div className="grid grid-cols-2 gap-1 h-2.5">
            <span className="rounded bg-white/10 border border-white/20" />
            <span className="rounded bg-white/10 border border-white/20" />
          </div>
        </div>
      );
    case 'layout-31':
      return (
        <div className="w-full h-10 flex flex-col gap-1">
          <div className="grid grid-cols-2 grid-rows-2 gap-0.5 flex-1">
            <span className="rounded bg-gold/30 border border-gold" />
            <span className="rounded bg-white/15 border border-white/20" />
            <span className="rounded bg-white/10 border border-white/20" />
            <span className="rounded bg-white/10 border border-white/20" />
          </div>
          <span className="h-2.5 rounded bg-white/15 border border-white/20" />
        </div>
      );
    case 'layout-32':
      return (
        <div className="w-full h-10 flex flex-col gap-1">
          <span className="h-2.5 rounded bg-white/15 border border-white/20" />
          <div className="grid grid-cols-2 grid-rows-2 gap-0.5 flex-1">
            <span className="rounded bg-gold/30 border border-gold" />
            <span className="rounded bg-white/15 border border-white/20" />
            <span className="rounded bg-white/10 border border-white/20" />
            <span className="rounded bg-white/10 border border-white/20" />
          </div>
        </div>
      );
    case 'layout-33':
      return (
        <div className="w-full h-10 grid grid-cols-12 gap-1">
          <span className="col-span-3 rounded bg-white/15 border border-white/20" />
          <div className="col-span-6 flex flex-col gap-0.5">
            <span className="flex-1 rounded bg-gold/30 border border-gold" />
            <span className="flex-1 rounded bg-white/10 border border-white/20" />
            <span className="flex-1 rounded bg-white/10 border border-white/20" />
          </div>
          <span className="col-span-3 rounded bg-white/15 border border-white/20" />
        </div>
      );
    case 'layout-34':
      return (
        <div className="w-full h-10 grid grid-cols-5 gap-1 items-center px-1">
          {[4, 0, -4, 0, 4].map((y, i) => (
            <span key={i} style={{ transform: `translateY(${y}px)` }} className={`h-4 rounded ${i === 2 ? 'bg-gold/30 border border-gold' : 'bg-white/10 border border-white/20'}`} />
          ))}
        </div>
      );
    case 'layout-35':
      return (
        <div className="w-full h-10 grid grid-cols-5 gap-1 items-center px-1">
          {[-4, 0, 4, 0, -4].map((y, i) => (
            <span key={i} style={{ transform: `translateY(${y}px)` }} className={`h-4 rounded ${i === 2 ? 'bg-gold/30 border border-gold' : 'bg-white/10 border border-white/20'}`} />
          ))}
        </div>
      );
    case 'layout-36':
      return (
        <div className="w-full h-10 flex flex-col items-center gap-0.5">
          <span className="w-1/2 h-3 rounded bg-gold/30 border border-gold" />
          <div className="grid grid-cols-2 gap-1 w-3/4 h-3">
            <span className="rounded bg-white/15 border border-white/20" />
            <span className="rounded bg-white/15 border border-white/20" />
          </div>
          <div className="grid grid-cols-2 gap-1 w-full h-2.5">
            <span className="rounded bg-white/10 border border-white/20" />
            <span className="rounded bg-white/10 border border-white/20" />
          </div>
        </div>
      );
    case 'layout-37':
      return (
        <div className="w-full h-10 grid grid-cols-12 gap-1">
          <div className="col-span-8 grid grid-cols-2 grid-rows-2 gap-0.5">
            <span className="rounded bg-gold/30 border border-gold" />
            <span className="rounded bg-white/15 border border-white/20" />
            <span className="rounded bg-white/10 border border-white/20" />
            <span className="rounded bg-white/10 border border-white/20" />
          </div>
          <span className="col-span-4 rounded bg-white/15 border border-white/20" />
        </div>
      );
    case 'layout-38':
      return (
        <div className="w-full h-10 grid grid-cols-2 gap-1">
          <div className="flex flex-col gap-0.5">
            <span className="flex-[1.5] rounded bg-gold/30 border border-gold" />
            <span className="flex-1 rounded bg-white/10 border border-white/20" />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="flex-1 rounded bg-white/10 border border-white/20" />
            <span className="flex-[1.4] rounded bg-white/15 border border-white/20" />
            <span className="flex-1 rounded bg-white/10 border border-white/20" />
          </div>
        </div>
      );
    case 'layout-39':
      return (
        <div className="w-full h-10 flex flex-col justify-between py-0.5">
          <div className="flex justify-between">
            <span className="w-8 h-2.5 rounded bg-white/15 border border-white/20" />
            <span className="w-8 h-2.5 rounded bg-white/15 border border-white/20" />
          </div>
          <span className="w-3/5 mx-auto h-3 rounded bg-gold/30 border border-gold" />
          <div className="flex justify-between">
            <span className="w-8 h-2.5 rounded bg-white/10 border border-white/20" />
            <span className="w-8 h-2.5 rounded bg-white/10 border border-white/20" />
          </div>
        </div>
      );
    case 'layout-40':
    default:
      return (
        <div className="w-full h-10 flex items-center justify-center gap-1 flex-wrap px-1">
          {[0, 1, 2, 3, 4].map((i) => (
            <span
              key={i}
              className={`h-3.5 px-2.5 rounded-full border ${
                i === 0 ? 'bg-gold/30 border-gold' : 'bg-white/10 border-white/20'
              }`}
            />
          ))}
        </div>
      );
  }
}

interface DesignSubViewProps {
  subView: DesignSubViewId;
  settings: AppSettings;
  onUpdateSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  isRtl: boolean;
  t: (key: any) => string;
}

const ICON_KINDS_PREVIEW: IconKind[] = ['live', 'movies', 'series', 'add', 'settings'];

const MemoIconPackCard = React.memo(({
  pack,
  active,
  isRtl,
  onSelect,
}: {
  pack: (typeof ICON_PACKS)[number];
  active: boolean;
  isRtl: boolean;
  onSelect: (id: IconPackId) => void;
}) => (
  <button
    type="button"
    data-tv-focusable="true"
    tabIndex={0}
    onClick={() => onSelect(pack.id as IconPackId)}
    className={`achour-perf-grid-item p-3.5 rounded-2xl border transition-colors duration-100 flex flex-col gap-2.5 cursor-pointer ${
      active
        ? 'border-gold bg-gold/15 shadow-[0_0_16px_var(--theme-glow)]'
        : 'border-white/10 bg-white/[0.04] hover:border-gold/45'
    } ${isRtl ? 'text-right' : 'text-left'}`}
  >
    <div className="flex items-center justify-between w-full gap-2">
      <span className="text-sm font-bold text-white truncate">
        {isRtl ? pack.nameAr : pack.nameEn}
      </span>
      {active && (
        <span className="p-1 rounded-lg bg-gold text-black shrink-0">
          <Check size={13} />
        </span>
      )}
    </div>
    <div className="flex items-center justify-around py-1.5 rounded-xl bg-black/35 border border-white/10">
      {ICON_KINDS_PREVIEW.map((k) => (
        <PackIconSvg key={k} kind={k} pack={pack.id} sizePx={28} />
      ))}
    </div>
    <p className="text-[11px] text-zinc-300 leading-snug">
      {isRtl ? pack.descriptionAr : pack.descriptionEn}
    </p>
  </button>
));

const MemoFrameShapeCard = React.memo(({
  shape,
  active,
  isRtl,
  iconPack,
  glassOpacity,
  glassBlur,
  onSelect,
}: {
  shape: (typeof FRAME_SHAPES)[number];
  active: boolean;
  isRtl: boolean;
  iconPack: string;
  glassOpacity?: number;
  glassBlur?: number;
  onSelect: (id: FrameShapeId) => void;
}) => (
  <button
    type="button"
    data-tv-focusable="true"
    tabIndex={0}
    onClick={() => onSelect(shape.id as FrameShapeId)}
    className={`achour-perf-grid-item p-3 rounded-2xl border transition-colors duration-100 flex flex-col items-center gap-2 text-center cursor-pointer ${
      active
        ? 'border-gold bg-gold/15 shadow-[0_0_16px_var(--theme-glow)]'
        : 'border-white/10 bg-white/[0.04] hover:border-gold/45'
    }`}
  >
    <div className="flex items-center justify-between w-full">
      <span className="text-xs font-bold text-white truncate">
        {isRtl ? shape.nameAr : shape.nameEn}
      </span>
      {active && (
        <span className="p-0.5 rounded bg-gold text-black shrink-0">
          <Check size={12} />
        </span>
      )}
    </div>
    <div className="py-1">
      <DashboardSectionIcon
        kind="live"
        displayMode="with-frames"
        iconPack={iconPack}
        frameShape={shape.id}
        sizeOverridePx={28}
        frameSizeOverridePx={58}
        glassOpacity={glassOpacity}
        glassBlur={glassBlur}
      />
    </div>
    <p className="text-[10px] text-zinc-400 line-clamp-2 leading-tight">
      {isRtl ? shape.descriptionAr : shape.descriptionEn}
    </p>
  </button>
));

const MemoLayoutCard = React.memo(({
  layout,
  active,
  isRtl,
  onSelect,
}: {
  layout: (typeof DASHBOARD_LAYOUTS)[number];
  active: boolean;
  isRtl: boolean;
  onSelect: (id: string) => void;
}) => (
  <button
    type="button"
    data-tv-focusable="true"
    tabIndex={0}
    onClick={() => onSelect(layout.id)}
    className={`achour-perf-grid-item p-3 rounded-2xl border transition-colors duration-100 flex flex-col gap-2 cursor-pointer ${
      active
        ? 'border-gold bg-gold/15 shadow-[0_0_16px_var(--theme-glow)]'
        : 'border-white/10 bg-white/[0.04] hover:border-gold/45'
    } ${isRtl ? 'text-right' : 'text-left'}`}
  >
    <div className="flex items-center justify-between w-full gap-2">
      <span className="text-xs sm:text-sm font-bold text-white truncate">
        {isRtl ? layout.nameAr : layout.nameEn}
      </span>
      {active && (
        <span className="p-0.5 rounded bg-gold text-black shrink-0">
          <Check size={12} />
        </span>
      )}
    </div>
    <div className="p-1.5 rounded-xl bg-black/40 border border-white/10">
      {renderLayoutDiagram(layout.id)}
    </div>
    <p className="text-[11px] text-zinc-300 truncate">
      {isRtl ? layout.descriptionAr : layout.descriptionEn}
    </p>
  </button>
));

export default function DesignSubViewContent({
  subView,
  settings,
  onUpdateSettings,
  isRtl,
  t,
}: DesignSubViewProps) {
  const updateField = useCallback(<K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    onUpdateSettings((prev) => ({ ...prev, [key]: value }));
  }, [onUpdateSettings]);

  const patchFields = useCallback((patch: Partial<AppSettings>) => {
    onUpdateSettings((prev) => ({ ...prev, ...patch }));
  }, [onUpdateSettings]);

  const handleSelectIconPack = useCallback((id: IconPackId) => {
    updateField('iconPack', id);
  }, [updateField]);

  const handleSelectFrameShape = useCallback((id: FrameShapeId) => {
    patchFields({
      frameShape: id,
      iconDisplayMode: 'with-frames',
    });
  }, [patchFields]);

  const handleSelectLayout = useCallback((id: string) => {
    updateField('dashboardLayout', id);
  }, [updateField]);

  const activePalette = useMemo(() => {
    const validCustom = normalizeHexColor(settings.customThemeColor);
    if (validCustom) return computePaletteFromHex(validCustom);
    const preset = ROYAL_THEMES.find((th) => th.id === (settings.royalThemeColor || 'pure-metallic-gold')) || ROYAL_THEMES[0];
    return computePaletteFromHex(preset.primary);
  }, [settings.customThemeColor, settings.royalThemeColor]);

  const [hexInput, setHexInput] = useState<string>(() => {
    const c = normalizeHexColor(settings.customThemeColor);
    if (c) return c;
    const preset = ROYAL_THEMES.find((th) => th.id === (settings.royalThemeColor || 'pure-metallic-gold'));
    return preset?.primary || '#D4AF37';
  });

  useEffect(() => {
    const c = normalizeHexColor(settings.customThemeColor);
    if (c) {
      setHexInput(c);
    } else {
      const preset = ROYAL_THEMES.find((th) => th.id === (settings.royalThemeColor || 'pure-metallic-gold'));
      if (preset) setHexInput(preset.primary);
    }
  }, [settings.customThemeColor, settings.royalThemeColor]);

  // 1. BACKGROUND OPACITY (0% to 100%, 1% granularity, live applied, D-pad Left/Right +/-1%, Touch +/- buttons)
  if (subView === 'background-opacity') {
    const bgOpacity =
      typeof settings.backgroundOpacity === 'number' && !Number.isNaN(settings.backgroundOpacity)
        ? Math.max(0, Math.min(100, Math.round(settings.backgroundOpacity)))
        : 62;

    const setOpacityClamped = (next: number) => {
      const clamped = Math.max(0, Math.min(100, Math.round(next)));
      updateField('backgroundOpacity', clamped);
    };

    const statusText =
      bgOpacity === 0
        ? isRtl
          ? '0% — الألوان الطبيعية الأصلية للخلفية بدون أي طبقة تعتيم'
          : '0% — Original natural wallpaper colors with zero dimming overlay'
        : bgOpacity === 62
        ? isRtl
          ? '62% — التعتيم الافتراضي المتوازن لوضوح النصوص'
          : '62% — Default balanced dimming for clear text readability'
        : bgOpacity === 100
        ? isRtl
          ? '100% — تعتيم كامل للخلفية'
          : '100% — Full background dimming'
        : isRtl
        ? `تعتيم مخصص بنسبة ${bgOpacity}% — يُطبّق ويُحفظ فوراً`
        : `Custom dimming at ${bgOpacity}% — applied & saved immediately`;

    return (
      <div className="max-w-3xl mx-auto py-4 space-y-5">
        <div className="p-5 sm:p-6 rounded-3xl bg-black/30 border border-white/15 backdrop-blur-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-gold/20 text-gold border border-gold/30">
                <SunMoon size={22} />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-white">
                  Background Opacity
                </h2>
                <p className="text-xs text-zinc-300 mt-0.5">
                  {isRtl
                    ? 'تحكم دقيق بدرجة تعتيم الخلفية من 0% إلى 100% — شاهد الخلفية خلف هذه البطاقة مباشرة'
                    : 'Precise background dimming from 0% to 100% — preview updates live behind this card'}
                </p>
              </div>
            </div>

            <div className="px-5 py-2.5 rounded-2xl bg-black/50 border border-gold/50 text-center min-w-[104px]">
              <span
                data-testid="bg-opacity-value"
                className="text-3xl sm:text-4xl font-mono font-black text-gold tabular-nums"
              >
                {bgOpacity}%
              </span>
            </div>
          </div>

          {/* Precision 0% - 100% Control (LTR layout so Left = -1% and Right = +1% consistently) */}
          <div dir="ltr" className="space-y-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                data-tv-focusable="true"
                tabIndex={0}
                aria-label="Decrease Background Opacity by 1%"
                onClick={() => setOpacityClamped(bgOpacity - 1)}
                disabled={bgOpacity <= 0}
                className="w-12 h-12 rounded-2xl bg-white/10 hover:bg-gold hover:text-black disabled:opacity-35 text-white text-xl font-black border border-white/15 transition-colors cursor-pointer flex items-center justify-center shrink-0"
              >
                −
              </button>

              <div className="flex-1 flex flex-col gap-1.5">
                <input
                  type="range"
                  dir="ltr"
                  min={0}
                  max={100}
                  step={1}
                  data-tv-focusable="true"
                  aria-label="Background Opacity Percentage"
                  value={bgOpacity}
                  onChange={(e) => setOpacityClamped(Number(e.target.value))}
                  className="w-full h-3 accent-[var(--theme-primary)] cursor-pointer"
                />
                <div className="flex items-center justify-between text-[11px] font-mono text-zinc-300 px-0.5">
                  <span>0% ({isRtl ? 'الأصلية' : 'Natural'})</span>
                  <span>62% ({isRtl ? 'الافتراضي' : 'Default'})</span>
                  <span>100% ({isRtl ? 'تعتيم كامل' : 'Full'})</span>
                </div>
              </div>

              <button
                type="button"
                data-tv-focusable="true"
                tabIndex={0}
                aria-label="Increase Background Opacity by 1%"
                onClick={() => setOpacityClamped(bgOpacity + 1)}
                disabled={bgOpacity >= 100}
                className="w-12 h-12 rounded-2xl bg-white/10 hover:bg-gold hover:text-black disabled:opacity-35 text-white text-xl font-black border border-white/15 transition-colors cursor-pointer flex items-center justify-center shrink-0"
              >
                +
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/10">
            <div className="space-y-1">
              <p className="text-xs sm:text-sm font-semibold text-white">{statusText}</p>
              <p className="text-[11px] text-zinc-300">
                {isRtl
                  ? 'الريموت: زر اليمين يزيد 1% (+1%) · زر اليسار ينقص 1% (-1%) — الحفظ فوري وتلقائي'
                  : 'TV Remote: Right increases +1% · Left decreases -1% — saved automatically'}
              </p>
            </div>

            {bgOpacity !== 62 && (
              <button
                type="button"
                data-tv-focusable="true"
                tabIndex={0}
                onClick={() => setOpacityClamped(62)}
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-gold hover:text-black text-zinc-200 text-xs font-bold border border-white/15 flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <RotateCcw size={13} />
                <span>{isRtl ? 'استعادة الافتراضي (62%)' : 'Reset Default (62%)'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 2. ICON DISPLAY MODE (Icons Only vs With Frames)
  if (subView === 'design-display') {
    const currentMode: IconDisplayMode = settings.iconDisplayMode || 'with-frames';
    return (
      <div className="space-y-4 pb-4">
        <div className="flex items-center gap-2.5">
          <Eye size={18} className="text-gold" />
          <div>
            <h3 className="text-sm sm:text-base font-black text-white">
              {isRtl ? 'طريقة عرض الأيقونات' : 'Icon Display Mode'}
            </h3>
            <p className="text-xs text-zinc-400">
              {isRtl
                ? 'اختر عرض الأيقونات وحدها بحرية تامة دون أي إطار، أو داخل إطارات مستقلة — التطبيق فوري.'
                : 'Show pure icons cleanly with zero borders, or enable sculptural frames — applies immediately.'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {(
            [
              {
                mode: 'icons-only' as IconDisplayMode,
                titleAr: 'أيقونات فقط (بدون إطار)',
                titleEn: 'Icons Only (No Frame)',
                descAr: 'عرض الأيقونات مباشرة فوق الخلفية بدون أي إطار أو صندوق أو حدود.',
                descEn: 'Pure borderless SVG icons floating directly over your wallpaper.',
              },
              {
                mode: 'with-frames' as IconDisplayMode,
                titleAr: 'أيقونات مع إطارات',
                titleEn: 'Icons With Frames',
                descAr: 'تشغيل الإطارات الهندسية والزجاجية والمعدنية حول كل قسم مع حرية التخصيص.',
                descEn: 'Enable sculptural frames (circle, hex, glass, metallic, geometric).',
              },
            ] as const
          ).map((opt) => {
            const active = currentMode === opt.mode;
            return (
              <button
                key={opt.mode}
                type="button"
                data-tv-focusable="true"
                tabIndex={0}
                onClick={() => updateField('iconDisplayMode', opt.mode)}
                className={`p-4 rounded-2xl border transition-all flex flex-col gap-3 cursor-pointer ${
                  active
                    ? 'border-gold bg-gold/15 shadow-[0_0_18px_var(--theme-glow)]'
                    : 'border-white/10 bg-white/[0.04] hover:border-gold/45'
                } ${isRtl ? 'text-right' : 'text-left'}`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-sm font-black text-white">
                    {isRtl ? opt.titleAr : opt.titleEn}
                  </span>
                  {active && (
                    <span className="p-1 rounded-lg bg-gold text-black shrink-0">
                      <Check size={14} />
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-center gap-4 py-2">
                  <DashboardSectionIcon
                    kind="live"
                    displayMode={opt.mode}
                    iconPack={settings.iconPack || 'pack-3d'}
                    frameShape={settings.frameShape || 'rounded-square'}
                    sizeOverridePx={32}
                    frameSizeOverridePx={54}
                  />
                  <DashboardSectionIcon
                    kind="movies"
                    displayMode={opt.mode}
                    iconPack={settings.iconPack || 'pack-3d'}
                    frameShape={settings.frameShape || 'rounded-square'}
                    sizeOverridePx={32}
                    frameSizeOverridePx={54}
                  />
                  <DashboardSectionIcon
                    kind="series"
                    displayMode={opt.mode}
                    iconPack={settings.iconPack || 'pack-3d'}
                    frameShape={settings.frameShape || 'rounded-square'}
                    sizeOverridePx={32}
                    frameSizeOverridePx={54}
                  />
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {isRtl ? opt.descAr : opt.descEn}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // 3. 40 ICON PACKS
  if (subView === 'design-icons') {
    const currentPack = settings.iconPack || 'pack-3d';
    return (
      <div className="space-y-3 pb-4">
        <div className="flex items-center gap-2.5">
          <Sparkles size={18} className="text-gold" />
          <div>
            <h3 className="text-sm sm:text-base font-black text-white">
              {isRtl ? `شكل الأيقونات (${ICON_PACKS.length} شكلاً مختلفاً)` : `Icon Styles (${ICON_PACKS.length} Distinct Packs)`}
            </h3>
            <p className="text-xs text-zinc-400">
              {isRtl
                ? '40 حزمة أيقونات مختلفة كلياً لكل قسم — يتم الحفظ والتطبيق فور الاختيار.'
                : '40 distinct vector icon packs — applied and saved immediately on selection.'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {ICON_PACKS.map((pack) => (
            <MemoIconPackCard
              key={pack.id}
              pack={pack}
              active={currentPack === pack.id}
              isRtl={isRtl}
              onSelect={handleSelectIconPack}
            />
          ))}
        </div>
      </div>
    );
  }

  // 4. 40 FRAME SHAPES
  if (subView === 'design-frames') {
    const currentShape = settings.frameShape || 'rounded-square';
    return (
      <div className="space-y-3 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <Frame size={18} className="text-gold" />
            <div>
              <h3 className="text-sm sm:text-base font-black text-white">
                {isRtl
                  ? `شكل الإطارات (${FRAME_SHAPES.length} شكلاً مستقلاً)`
                  : `Frame Shapes (${FRAME_SHAPES.length} Independent Shapes)`}
              </h3>
              <p className="text-xs text-zinc-400">
                {isRtl
                  ? 'اختر أي شكل إطار ليُطبق فوراً حول أيقونات الواجهة الرئيسية.'
                  : 'Select any frame silhouette to apply immediately.'}
              </p>
            </div>
          </div>
          {(settings.iconDisplayMode || 'with-frames') === 'icons-only' && (
            <button
              type="button"
              data-tv-focusable="true"
              tabIndex={0}
              onClick={() => updateField('iconDisplayMode', 'with-frames')}
              className="px-3 py-1.5 rounded-xl bg-gold text-black text-xs font-black cursor-pointer whitespace-nowrap"
            >
              {isRtl ? 'تفعيل عرض الإطارات الآن' : 'Enable Frames Now'}
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {FRAME_SHAPES.map((shape) => (
            <MemoFrameShapeCard
              key={shape.id}
              shape={shape}
              active={currentShape === shape.id}
              isRtl={isRtl}
              iconPack={settings.iconPack || 'pack-3d'}
              glassOpacity={settings.glassOpacity}
              glassBlur={settings.glassBlur}
              onSelect={handleSelectFrameShape}
            />
          ))}
        </div>
      </div>
    );
  }

  // 5. 40 INTERFACE LAYOUTS
  if (subView === 'design-layouts') {
    const activeLayout = normalizeDashboardLayoutId(settings.dashboardLayout);
    return (
      <div className="space-y-3 pb-4">
        <div className="flex items-center gap-2.5">
          <Grid size={18} className="text-gold" />
          <div>
            <h3 className="text-sm sm:text-base font-black text-white">
              {isRtl
                ? `تخطيطات الواجهة (${DASHBOARD_LAYOUTS.length} تصميماً)`
                : `Interface Layouts (${DASHBOARD_LAYOUTS.length} Arrangements)`}
            </h3>
            <p className="text-xs text-zinc-400">
              {isRtl
                ? '40 تصميماً مختلفاً لتوزيع الأقسام الخمسة على الشاشة الرئيسية — التطبيق فوري.'
                : '40 spatial arrangements for the 5 dashboard sections — applies immediately.'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {DASHBOARD_LAYOUTS.map((layout) => (
            <MemoLayoutCard
              key={layout.id}
              layout={layout}
              active={activeLayout === layout.id}
              isRtl={isRtl}
              onSelect={handleSelectLayout}
            />
          ))}
        </div>
      </div>
    );
  }

  // 6. ICON SIZE
  if (subView === 'design-icon-size') {
    const cur = settings.iconScale || 'md';
    return (
      <div className="max-w-3xl mx-auto py-3 space-y-4">
        <div className="p-4 sm:p-5 rounded-3xl bg-white/[0.04] border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Maximize2 size={18} className="text-gold" />
              <span className="text-sm sm:text-base font-black text-white">
                {isRtl ? 'حجم الأيقونات' : 'Icon Size'}
              </span>
            </div>
            <span className="text-sm font-mono font-bold text-gold uppercase">{cur}</span>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
            {(['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'] as const).map((sz) => (
              <button
                key={sz}
                type="button"
                data-tv-focusable="true"
                tabIndex={0}
                onClick={() => updateField('iconScale', sz)}
                className={`py-3 rounded-2xl border text-sm font-mono font-bold uppercase cursor-pointer transition-colors ${
                  cur === sz
                    ? 'bg-gold text-black border-gold'
                    : 'bg-white/[0.04] border-white/10 text-zinc-200 hover:border-gold/50'
                }`}
              >
                {sz}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 7. FRAME SIZE (Independent)
  if (subView === 'design-frame-size') {
    const cur = settings.frameScale || 'md';
    return (
      <div className="max-w-3xl mx-auto py-3 space-y-4">
        <div className="p-4 sm:p-5 rounded-3xl bg-white/[0.04] border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Frame size={18} className="text-gold" />
              <span className="text-sm sm:text-base font-black text-white">
                {isRtl ? 'حجم الإطارات (مستقل)' : 'Frame Size (Independent)'}
              </span>
            </div>
            <span className="text-sm font-mono font-bold text-gold uppercase">{cur}</span>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
            {(['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'] as const).map((sz) => (
              <button
                key={sz}
                type="button"
                data-tv-focusable="true"
                tabIndex={0}
                onClick={() => updateField('frameScale', sz)}
                className={`py-3 rounded-2xl border text-sm font-mono font-bold uppercase cursor-pointer transition-colors ${
                  cur === sz
                    ? 'bg-gold text-black border-gold'
                    : 'bg-white/[0.04] border-white/10 text-zinc-200 hover:border-gold/50'
                }`}
              >
                {sz}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 8. SECTION SPACING
  if (subView === 'design-spacing') {
    const cur = settings.tileSpacing || 'md';
    return (
      <div className="max-w-3xl mx-auto py-3 space-y-4">
        <div className="p-4 sm:p-5 rounded-3xl bg-white/[0.04] border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm sm:text-base font-black text-white">
              {isRtl ? 'المسافة بين الأقسام' : 'Section Spacing'}
            </span>
            <span className="text-sm font-mono font-bold text-gold uppercase">{cur}</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {(
              [
                { id: 'xs', ar: 'متلاصق', en: 'Tight' },
                { id: 'sm', ar: 'قريب', en: 'Compact' },
                { id: 'md', ar: 'متوازن', en: 'Balanced' },
                { id: 'lg', ar: 'واسع', en: 'Wide' },
                { id: 'xl', ar: 'أقصى', en: 'Spacious' },
              ] as const
            ).map((sp) => (
              <button
                key={sp.id}
                type="button"
                data-tv-focusable="true"
                tabIndex={0}
                onClick={() => updateField('tileSpacing', sp.id)}
                className={`py-3 px-2 rounded-2xl border text-xs sm:text-sm font-bold cursor-pointer transition-colors whitespace-nowrap ${
                  cur === sp.id
                    ? 'bg-gold text-black border-gold'
                    : 'bg-white/[0.04] border-white/10 text-zinc-200 hover:border-gold/50'
                }`}
              >
                {isRtl ? sp.ar : sp.en}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 9. SCREEN ALIGNMENT POSITION (9-Zone Grid)
  if (subView === 'design-alignment') {
    const curV = settings.dashboardAlignment || 'center';
    const curH = settings.dashboardHorizontalAlignment || 'center';
    return (
      <div className="max-w-2xl mx-auto py-3 space-y-4">
        <div className="p-4 sm:p-5 rounded-3xl bg-white/[0.04] border border-white/10 space-y-4">
          <div>
            <h3 className="text-sm sm:text-base font-black text-white">
              {isRtl ? 'محاذاة الأقسام على الشاشة' : 'Screen Alignment Position'}
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              {isRtl
                ? 'حدد موضع ظهور أيقونات الشاشة الرئيسية على الشاشة — يتم التحديث فوراً.'
                : 'Choose where the main dashboard sections sit on screen — updates immediately.'}
            </p>
          </div>
          <div dir="ltr" className="grid grid-cols-3 gap-2.5">
            {(
              [
                { v: 'top', h: 'left', ar: 'أعلى يسار', en: 'Top Left' },
                { v: 'top', h: 'center', ar: 'أعلى', en: 'Top' },
                { v: 'top', h: 'right', ar: 'أعلى يمين', en: 'Top Right' },
                { v: 'center', h: 'left', ar: 'يسار', en: 'Left' },
                { v: 'center', h: 'center', ar: 'المنتصف', en: 'Center' },
                { v: 'center', h: 'right', ar: 'يمين', en: 'Right' },
                { v: 'bottom', h: 'left', ar: 'أسفل يسار', en: 'Bottom Left' },
                { v: 'bottom', h: 'center', ar: 'أسفل', en: 'Bottom' },
                { v: 'bottom', h: 'right', ar: 'أسفل يمين', en: 'Bottom Right' },
              ] as const
            ).map((cell) => {
              const active = curV === cell.v && curH === cell.h;
              return (
                <button
                  key={`${cell.v}-${cell.h}`}
                  type="button"
                  data-tv-focusable="true"
                  tabIndex={0}
                  onClick={() =>
                    patchFields({
                      dashboardAlignment: cell.v,
                      dashboardHorizontalAlignment: cell.h,
                    })
                  }
                  className={`py-3 px-2 rounded-2xl border text-xs sm:text-sm font-bold cursor-pointer transition-colors ${
                    active
                      ? 'bg-gold/25 border-gold text-gold shadow-[0_0_16px_var(--theme-glow)]'
                      : 'bg-white/[0.04] border-white/10 text-zinc-300 hover:border-gold/45'
                  }`}
                >
                  {isRtl ? cell.ar : cell.en}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // 10. REORDER 5 SECTIONS
  if (subView === 'design-order') {
    const order = settings.dashboardOrder?.length ? settings.dashboardOrder : DEFAULT_DASHBOARD_ORDER;
    const moveOrderItem = (index: number, delta: -1 | 1) => {
      const cur = [...order];
      const target = index + delta;
      if (target < 0 || target >= cur.length) return;
      [cur[index], cur[target]] = [cur[target], cur[index]];
      updateField('dashboardOrder', cur);
    };
    const nameMap: Record<string, string> = {
      live: t('live'),
      movies: t('movies'),
      series: t('series'),
      add: t('playlist'),
      settings: t('settings'),
    };

    return (
      <div className="max-w-2xl mx-auto py-3 space-y-4">
        <div className="p-4 sm:p-5 rounded-3xl bg-white/[0.04] border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ArrowUpDown size={18} className="text-gold" />
              <h3 className="text-sm sm:text-base font-black text-white">
                {isRtl ? 'ترتيب الأقسام الخمسة' : 'Reorder 5 Sections'}
              </h3>
            </div>
            <button
              type="button"
              data-tv-focusable="true"
              tabIndex={0}
              onClick={() => updateField('dashboardOrder', [...DEFAULT_DASHBOARD_ORDER])}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-gold hover:text-black text-xs font-bold text-zinc-200 cursor-pointer flex items-center gap-1"
            >
              <RotateCcw size={12} />
              <span>{isRtl ? 'افتراضي' : 'Reset'}</span>
            </button>
          </div>
          <div className="space-y-2">
            {order.map((kind, idx) => (
              <div
                key={kind}
                className="flex items-center justify-between px-4 py-2.5 rounded-2xl bg-black/35 border border-white/10"
              >
                <span className="text-sm font-bold text-white">
                  {idx + 1}. {nameMap[kind] || kind}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    data-tv-focusable="true"
                    tabIndex={0}
                    disabled={idx === 0}
                    onClick={() => moveOrderItem(idx, -1)}
                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-gold hover:text-black disabled:opacity-30 text-sm font-black cursor-pointer"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    data-tv-focusable="true"
                    tabIndex={0}
                    disabled={idx === order.length - 1}
                    onClick={() => moveOrderItem(idx, 1)}
                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-gold hover:text-black disabled:opacity-30 text-sm font-black cursor-pointer"
                  >
                    ↓
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 11. THEME COLORS (True 24K Metallic Gold + Preset Swatches)
  if (subView === 'design-colors') {
    return (
      <div className="space-y-4 pb-4">
        <div className="flex items-center gap-2.5">
          <Palette size={18} className="text-gold" />
          <div>
            <h3 className="text-sm sm:text-base font-black text-white">
              {isRtl ? 'ألوان التطبيق والثيم الملكي' : 'App Theme Colors'}
            </h3>
            <p className="text-xs text-zinc-400">
              {isRtl
                ? 'اضغط على أي لون لتطبيقه وحفظه فوراً على كامل التطبيق.'
                : 'Select any theme color to apply and save it across the entire app immediately.'}
            </p>
          </div>
        </div>

        {/* Featured True 24K Metallic Gold Card */}
        <button
          type="button"
          data-tv-focusable="true"
          tabIndex={0}
          onClick={() =>
            patchFields({
              royalThemeColor: 'pure-metallic-gold',
              customThemeColor: '#D4AF37',
            })
          }
          className={`w-full p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
            activePalette.primary === '#D4AF37'
              ? 'border-gold bg-gold/15 shadow-[0_0_20px_var(--theme-glow)]'
              : 'border-white/15 bg-white/[0.04] hover:border-gold'
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-11 h-11 rounded-2xl border border-white/40 shrink-0 shadow-lg"
              style={{
                background:
                  'linear-gradient(135deg, #8C6A1D 0%, #D4AF37 35%, #F5E6A8 58%, #B8860B 100%)',
              }}
            />
            <div className="min-w-0 text-start">
              <span className="block text-sm font-black text-gold truncate">
                {isRtl
                  ? 'الذهب المعدني الحقيقي (#D4AF37) — لكامل التطبيق'
                  : 'True 24K Metallic Gold (#D4AF37) — Full App'}
              </span>
              <span className="block text-[11px] font-mono text-zinc-300 truncate mt-0.5">
                #8C6A1D · #D4AF37 · #F5E6A8 · #B8860B
              </span>
            </div>
          </div>
          {activePalette.primary === '#D4AF37' && (
            <span className="p-1.5 rounded-lg bg-gold text-black shrink-0">
              <Check size={15} />
            </span>
          )}
        </button>

        {/* Preset Swatches */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2.5">
          {ROYAL_THEMES.map((theme) => {
            const isSelected =
              !settings.customThemeColor && settings.royalThemeColor === theme.id;
            return (
              <button
                key={theme.id}
                type="button"
                data-tv-focusable="true"
                tabIndex={0}
                onClick={() =>
                  patchFields({
                    royalThemeColor: theme.id,
                    customThemeColor: null,
                  })
                }
                className={`achour-perf-grid-item p-2.5 rounded-xl border flex flex-col gap-1.5 cursor-pointer transition-colors duration-100 ${
                  isSelected
                    ? 'border-gold bg-white/15 shadow-[0_0_14px_var(--theme-glow)]'
                    : 'border-white/10 bg-white/[0.04] hover:border-white/30'
                } ${isRtl ? 'text-right' : 'text-left'}`}
              >
                <div className="flex items-center justify-between w-full">
                  <span
                    className="w-5 h-5 rounded-full border border-white/25"
                    style={{ backgroundColor: theme.primary }}
                  />
                  <span className="text-[10px] font-mono text-zinc-400">
                    {theme.primary}
                  </span>
                </div>
                <span className="text-xs font-medium text-white truncate w-full">
                  {isRtl ? theme.nameAr : theme.nameEn}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // 12. CUSTOM COLOR (Color Picker + HEX Input)
  if (subView === 'design-custom-color') {
    return (
      <div className="max-w-2xl mx-auto py-3 space-y-4">
        <div className="p-5 rounded-3xl bg-white/[0.04] border border-white/15 space-y-4">
          <div>
            <h3 className="text-sm sm:text-base font-black text-white">
              {isRtl
                ? 'لون مخصص — اختيار اللون يدوياً أو كود HEX'
                : 'Custom Color — Picker & HEX Code'}
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              {isRtl
                ? 'أي لون تختاره أو تكتبه بصيغة HEX يُطبّق ويُحفظ فوراً على كامل التطبيق.'
                : 'Any color you pick or enter in HEX applies and saves immediately across the app.'}
            </p>
          </div>

          <div dir="ltr" className="flex flex-wrap items-center gap-3">
            <label className="relative flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-black/45 border border-white/15 cursor-pointer">
              <input
                type="color"
                value={
                  isValidHexColor(hexInput)
                    ? normalizeHexColor(hexInput)!
                    : activePalette.primary
                }
                onChange={(e) => {
                  const next = e.target.value.toUpperCase();
                  setHexInput(next);
                  updateField('customThemeColor', next);
                }}
                className="w-9 h-9 rounded-lg border-0 bg-transparent cursor-pointer"
              />
              <span className="text-xs font-bold text-zinc-200 whitespace-nowrap">
                {isRtl ? 'منتقي الألوان' : 'Pick Color'}
              </span>
            </label>

            <input
              type="text"
              value={hexInput}
              maxLength={7}
              placeholder="#D4AF37"
              onChange={(e) => {
                const raw = e.target.value.toUpperCase();
                setHexInput(raw);
                const norm = normalizeHexColor(raw);
                if (norm) {
                  updateField('customThemeColor', norm);
                }
              }}
              className="flex-1 min-w-[140px] px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/20 text-sm font-mono font-bold text-gold uppercase"
            />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-white/10">
            <div className="flex items-center gap-2.5">
              <span
                className="w-7 h-7 rounded-full border border-white/30"
                style={{ backgroundColor: activePalette.primary }}
              />
              <span className="text-xs font-mono text-zinc-300">
                {isRtl ? 'اللون الفعلي الحالي:' : 'Active Color:'}{' '}
                <strong className="text-gold">{activePalette.primary}</strong>
              </span>
            </div>
            {settings.customThemeColor && (
              <button
                type="button"
                data-tv-focusable="true"
                tabIndex={0}
                onClick={() => updateField('customThemeColor', null)}
                className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-gold hover:text-black text-xs font-bold text-zinc-200 cursor-pointer"
              >
                {isRtl ? 'إلغاء اللون المخصص' : 'Clear Custom Color'}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 13. GLASS SURFACE OPACITY (Transparent Cards & Frames)
  if (subView === 'design-glass-opacity') {
    const val = typeof settings.glassOpacity === 'number' ? settings.glassOpacity : 16;
    return (
      <div className="max-w-2xl mx-auto py-3 space-y-4">
        <div className="p-5 rounded-3xl bg-white/[0.04] border border-white/15 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm sm:text-base font-bold text-gold flex items-center gap-2">
              <Sliders size={18} />
              <span>{isRtl ? 'شفافية الإطارات والبطاقات' : 'Glass Surface Opacity'}</span>
            </span>
            <span className="text-lg font-mono font-black text-white">{val}%</span>
          </div>
          <div dir="ltr" className="flex items-center gap-3">
            <button
              type="button"
              data-tv-focusable="true"
              tabIndex={0}
              onClick={() => updateField('glassOpacity', Math.max(0, val - 2))}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-gold hover:text-black text-base font-black cursor-pointer"
            >
              −
            </button>
            <input
              type="range"
              dir="ltr"
              min={0}
              max={85}
              step={1}
              value={val}
              onChange={(e) => updateField('glassOpacity', Number(e.target.value))}
              className="flex-1 accent-[var(--theme-primary)] cursor-pointer"
            />
            <button
              type="button"
              data-tv-focusable="true"
              tabIndex={0}
              onClick={() => updateField('glassOpacity', Math.min(85, val + 2))}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-gold hover:text-black text-base font-black cursor-pointer"
            >
              +
            </button>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {[4, 16, 30, 50, 75].map((v) => (
              <button
                key={v}
                type="button"
                data-tv-focusable="true"
                tabIndex={0}
                onClick={() => updateField('glassOpacity', v)}
                className={`py-2 rounded-xl border text-xs font-mono font-bold cursor-pointer ${
                  val === v
                    ? 'bg-gold text-black border-gold'
                    : 'bg-white/[0.04] border-white/10 text-zinc-200 hover:border-gold/50'
                }`}
              >
                {v}%
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 14. FROSTED GLASS BLUR
  if (subView === 'design-glass-blur') {
    const val = typeof settings.glassBlur === 'number' ? settings.glassBlur : 10;
    return (
      <div className="max-w-2xl mx-auto py-3 space-y-4">
        <div className="p-5 rounded-3xl bg-white/[0.04] border border-white/15 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm sm:text-base font-bold text-gold flex items-center gap-2">
              <Layers size={18} />
              <span>{isRtl ? 'التأثير الزجاجي الضبابي (Blur)' : 'Frosted Glass Blur'}</span>
            </span>
            <span className="text-lg font-mono font-black text-white">{val}px</span>
          </div>
          <div dir="ltr" className="flex items-center gap-3">
            <button
              type="button"
              data-tv-focusable="true"
              tabIndex={0}
              onClick={() => updateField('glassBlur', Math.max(0, val - 2))}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-gold hover:text-black text-base font-black cursor-pointer"
            >
              −
            </button>
            <input
              type="range"
              dir="ltr"
              min={0}
              max={24}
              step={1}
              value={val}
              onChange={(e) => updateField('glassBlur', Number(e.target.value))}
              className="flex-1 accent-[var(--theme-primary)] cursor-pointer"
            />
            <button
              type="button"
              data-tv-focusable="true"
              tabIndex={0}
              onClick={() => updateField('glassBlur', Math.min(24, val + 2))}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-gold hover:text-black text-base font-black cursor-pointer"
            >
              +
            </button>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {[0, 6, 10, 16, 24].map((v) => (
              <button
                key={v}
                type="button"
                data-tv-focusable="true"
                tabIndex={0}
                onClick={() => updateField('glassBlur', v)}
                className={`py-2 rounded-xl border text-xs font-mono font-bold cursor-pointer ${
                  val === v
                    ? 'bg-gold text-black border-gold'
                    : 'bg-white/[0.04] border-white/10 text-zinc-200 hover:border-gold/50'
                }`}
              >
                {v}px
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 15. DASHBOARD TV FOCUS MODE
  if (subView === 'design-focus-mode') {
    const mode = settings.dashboardFocusMode || 'frame';
    return (
      <div className="space-y-4 pb-4">
        <div>
          <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
            <Target size={18} className="text-gold" />
            <span>{isRtl ? 'نمط الفوكس على الشاشة الرئيسية' : 'Dashboard TV Focus Target'}</span>
          </h3>
          <p className="text-xs text-zinc-400 mt-1">
            {isRtl
              ? 'حدد أين يظهر مؤشر الفوكس عند التنقل بالريموت — يتم الحفظ والتطبيق فوراً.'
              : 'Choose how TV remote focus is highlighted — applied & saved immediately.'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {(
            [
              {
                id: 'frame' as const,
                titleAr: '🔷 على الإطار بشكله الدقيق (توهج انسيابي)',
                titleEn: '🔷 Exact Frame Shape Contour',
                descAr: 'يتتبع تفاصيل الـ 40 إطاراً بهالة مضيئة متناسقة بدون أي مربع خارجي.',
                descEn: 'Hugs the exact contour of all 40 frames without any square outline.',
              },
              {
                id: 'label' as const,
                titleAr: '🏷️ على الأسماء في الأسفل (شارة فوكس مضيئة)',
                titleEn: '🏷️ Section Name Badge Pill',
                descAr: 'يضيء شارة كبسولية بلون الثيم حول اسم القسم، مثالي للوضع بدون إطار.',
                descEn: 'Lights up an illuminated capsule around the section title text.',
              },
              {
                id: 'both' as const,
                titleAr: '✨ على الإطار والاسم معاً (أعلى وضوح)',
                titleEn: '✨ Both (Frame Contour + Name Badge)',
                descAr: 'يجمع بين توهج محيط الإطار وإضاءة شارة الاسم معاً لرؤية واضحة.',
                descEn: 'Highlights both the frame contour and the name badge.',
              },
              {
                id: 'icon' as const,
                titleAr: '🎯 على الأيقونة مباشرة (توهج الرمز)',
                titleEn: '🎯 Direct Icon Glyph Glow',
                descAr: 'تكبير الأيقونة وإضفاء إشعاع مباشر حول الرمز فقط دون إطارات خارجية.',
                descEn: 'Gently scales the icon glyph with radiant glow, no external boxes.',
              },
            ] as const
          ).map((opt) => {
            const active = mode === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                data-tv-focusable="true"
                tabIndex={0}
                onClick={() => updateField('dashboardFocusMode', opt.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col gap-1.5 ${
                  isRtl ? 'text-right' : 'text-left'
                } ${
                  active
                    ? 'border-gold bg-gold/15 shadow-[0_0_18px_var(--theme-glow,rgba(212,175,55,0.4))]'
                    : 'border-white/10 bg-white/[0.03] hover:border-white/30'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-bold text-xs sm:text-sm text-white">
                    {isRtl ? opt.titleAr : opt.titleEn}
                  </span>
                  {active && (
                    <span className="w-5 h-5 rounded-full bg-gold text-black flex items-center justify-center font-bold text-xs shrink-0">
                      ✓
                    </span>
                  )}
                </div>
                <span className="text-xs text-zinc-400">
                  {isRtl ? opt.descAr : opt.descEn}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // 16. DASHBOARD SECTION LABELS COLOR
  if (subView === 'design-label-color') {
    const colorMode = settings.dashboardLabelColorMode || 'theme';
    return (
      <div className="space-y-4 pb-4">
        <div>
          <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
            <Type size={18} className="text-gold" />
            <span>
              {isRtl
                ? 'لون نصوص الشاشة الرئيسية (الكلام أسفل الأيقونات)'
                : 'Dashboard Section Labels Color'}
            </span>
          </h3>
          <p className="text-xs text-zinc-400 mt-1">
            {isRtl
              ? 'اختر لون نصوص الأقسام الرئيسية — يُطبّق ويُحفظ تلقائياً.'
              : 'Choose section label text color — applied & saved immediately.'}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(
            [
              {
                id: 'theme' as const,
                swatch: 'var(--theme-primary, #D4AF37)',
                titleAr: 'حسب الثيم المختار',
                titleEn: 'Match Theme',
                subAr: 'يتغير مع لون التطبيق',
                subEn: 'Dynamic theme',
              },
              {
                id: 'white' as const,
                swatch: '#FFFFFF',
                titleAr: 'أبيض ناصع',
                titleEn: 'Classic White',
                subAr: 'كما كان سابقاً (#FFF)',
                subEn: 'Classic text',
              },
              {
                id: 'gold' as const,
                swatch: '#D4AF37',
                titleAr: 'ذهب ملكي دائم',
                titleEn: 'Permanent 24K',
                subAr: '#D4AF37',
                subEn: '#D4AF37',
              },
              {
                id: 'custom' as const,
                swatch: settings.dashboardLabelCustomColor || '#FFD700',
                titleAr: 'لون مخصص',
                titleEn: 'Custom HEX',
                subAr: settings.dashboardLabelCustomColor || '#HEX',
                subEn: settings.dashboardLabelCustomColor || '#HEX',
              },
            ] as const
          ).map((opt) => {
            const active = colorMode === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                data-tv-focusable="true"
                tabIndex={0}
                onClick={() => updateField('dashboardLabelColorMode', opt.id)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 text-center ${
                  active
                    ? 'border-gold bg-gold/15 shadow-[0_0_16px_var(--theme-glow,rgba(212,175,55,0.4))]'
                    : 'border-white/10 bg-white/[0.03] hover:border-white/30'
                }`}
              >
                <span
                  className="w-6 h-6 rounded-full border border-white/30"
                  style={{ backgroundColor: opt.swatch }}
                />
                <span className="text-xs sm:text-sm font-bold text-white mt-1">
                  {isRtl ? opt.titleAr : opt.titleEn}
                </span>
                <span className="text-[11px] text-zinc-400">
                  {isRtl ? opt.subAr : opt.subEn}
                </span>
              </button>
            );
          })}
        </div>

        {colorMode === 'custom' && (
          <div dir="ltr" className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 flex flex-wrap items-center gap-3">
            <input
              type="color"
              value={settings.dashboardLabelCustomColor || '#FFD700'}
              onChange={(e) => updateField('dashboardLabelCustomColor', e.target.value.toUpperCase())}
              className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
            />
            <input
              type="text"
              value={settings.dashboardLabelCustomColor || '#FFD700'}
              onChange={(e) => updateField('dashboardLabelCustomColor', e.target.value.toUpperCase())}
              placeholder="#RRGGBB"
              className="px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white font-mono text-xs uppercase w-32"
            />
            <span className="text-xs text-zinc-300">
              {isRtl ? 'اختر اللون المفضل لنصوص الواجهة' : 'Pick label color'}
            </span>
          </div>
        )}
      </div>
    );
  }

  // 17. COMPREHENSIVE WINDOW & MODAL SIZE CONTROL (Global + 5 Independent Categories)
  if (subView === 'window-sizes') {
    const ws: WindowSizeScales = settings.windowScales || {};
    const clampScale = (v: number) => Math.max(60, Math.min(140, Math.round(v)));
    const globalVal = typeof ws.global === 'number' ? clampScale(ws.global) : 100;

    const setWindowScale = (key: keyof WindowSizeScales, nextVal: number) => {
      const clamped = clampScale(nextVal);
      onUpdateSettings((prev) => ({
        ...prev,
        windowScales: {
          global: 100,
          details: 100,
          playerPopups: 100,
          confirm: 100,
          settings: 100,
          playlists: 100,
          ...(prev.windowScales || {}),
          [key]: clamped,
        },
      }));
    };

    const resetAllWindowSizes = () => {
      onUpdateSettings((prev) => ({
        ...prev,
        windowScales: {
          global: 100,
          details: 100,
          playerPopups: 100,
          confirm: 100,
          settings: 100,
          playlists: 100,
        },
      }));
    };

    const categories: Array<{
      key: Exclude<keyof WindowSizeScales, 'global'>;
      titleAr: string;
      titleEn: string;
      descAr: string;
      descEn: string;
    }> = [
      {
        key: 'details',
        titleAr: 'تفاصيل الأفلام والمسلسلات والمواسم والحلقات',
        titleEn: 'Movie & Series Details + Seasons / Episodes',
        descAr: 'نافذة القصة والبوستر وتبويبات المواسم وقوائم الحلقات.',
        descEn: 'Synopsis, poster, season tabs & episode lists modals.',
      },
      {
        key: 'playerPopups',
        titleAr: 'نوافذ مشغل الفيديو والبث المباشر و EPG',
        titleEn: 'Player Popups, Audio/Subtitles & EPG',
        descAr: 'قوائم الصوت والترجمة والجودة والسرعة والأبعاد والحلقات ودليل البرامج.',
        descEn: 'Audio, subtitles, quality, speed, sleep, episodes drawer, EPG & prompts.',
      },
      {
        key: 'confirm',
        titleAr: 'نوافذ التأكيد والتحذيرات والـ PIN',
        titleEn: 'Confirmations, Warnings & PIN Windows',
        descAr: 'تأكيد الخروج، مسح السجل، رمز القفل، واكتشاف القنوات.',
        descEn: 'Exit confirmation, clear history alerts, parental PIN & OCR.',
      },
      {
        key: 'settings',
        titleAr: 'نوافذ الإعدادات وتغيير الموضع والمعاينة',
        titleEn: 'Settings, Reposition & Preview Popups',
        descAr: 'موضع الأيقونات، لصق M3U، ومعاينة شاشة التلفزيون.',
        descEn: 'Reposition modal, paste M3U dialog & TV screen preview.',
      },
      {
        key: 'playlists',
        titleAr: 'نوافذ الاشتراكات والإضافة والفحص والتحميل',
        titleEn: 'Playlists, Add/Inspect & Progress Windows',
        descAr: 'إضافة اشتراك، فحص تفاصيل الاشتراك، وشريط التقدم والرفع.',
        descEn: 'Add playlist, playlist info inspect, extraction progress & upload.',
      },
    ];

    const hasAnyCustom =
      globalVal !== 100 ||
      categories.some((c) => typeof ws[c.key] === 'number' && clampScale(ws[c.key] as number) !== 100);

    return (
      <div className="max-w-4xl mx-auto py-2 space-y-4 pb-6">
        {/* Header & Reset All */}
        <div className="p-4 rounded-3xl bg-white/[0.04] border border-white/15 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm sm:text-base font-black text-white">
              {isRtl ? 'التحكم الشامل بأحجام جميع النوافذ المنبثقة' : 'All Windows & Popups Size Control'}
            </h2>
            <p className="text-xs text-zinc-300 mt-0.5">
              {isRtl
                ? 'تحكم موحد لجميع النوافذ أو تخصيص مستقل لكل نوع — الافتراضي 100% دون تغيير أي حجم تلقائياً.'
                : 'Scale all popup windows together or adjust each category independently (Default: 100%).'}
            </p>
          </div>
          <button
            type="button"
            data-tv-focusable="true"
            tabIndex={0}
            onClick={resetAllWindowSizes}
            disabled={!hasAnyCustom}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
              hasAnyCustom
                ? 'bg-gold text-black hover:brightness-110'
                : 'bg-white/10 text-zinc-400 opacity-60 cursor-default'
            }`}
          >
            <RotateCcw size={13} />
            <span>{isRtl ? 'إرجاع جميع النوافذ للافتراضي (100%)' : 'Reset All to Default (100%)'}</span>
          </button>
        </div>

        {/* Master / Global Window Scale */}
        <div className="p-4 rounded-3xl bg-gold/10 border border-gold/40 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-black text-gold">
                {isRtl ? 'الحجم العام لجميع النوافذ (تحكم مركزي)' : 'Global Scale (All App Windows)'}
              </h3>
              <p className="text-[11px] text-zinc-300">
                {isRtl
                  ? 'يُطبّق كمضاعف عام على جميع النوافذ والحوارات في كامل التطبيق فوراً.'
                  : 'Master multiplier applied immediately across every dialog and popup in the app.'}
              </p>
            </div>
            <span className="text-lg font-mono font-black text-gold px-3 py-1 rounded-xl bg-black/40 border border-gold/30">
              {globalVal}%
            </span>
          </div>

          <div dir="ltr" className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              data-tv-focusable="true"
              tabIndex={0}
              onClick={() => setWindowScale('global', globalVal - 5)}
              className="px-3 py-1.5 rounded-xl bg-black/40 border border-white/15 hover:border-gold text-xs font-mono font-bold text-white cursor-pointer"
            >
              -5%
            </button>
            <button
              type="button"
              data-tv-focusable="true"
              tabIndex={0}
              onClick={() => setWindowScale('global', globalVal - 1)}
              className="px-3 py-1.5 rounded-xl bg-black/40 border border-white/15 hover:border-gold text-xs font-mono font-bold text-white cursor-pointer"
            >
              -1%
            </button>
            <input
              type="range"
              dir="ltr"
              min={60}
              max={140}
              step={1}
              value={globalVal}
              onChange={(e) => setWindowScale('global', Number(e.target.value))}
              className="flex-1 min-w-[120px] accent-[var(--theme-primary)] cursor-pointer"
            />
            <button
              type="button"
              data-tv-focusable="true"
              tabIndex={0}
              onClick={() => setWindowScale('global', globalVal + 1)}
              className="px-3 py-1.5 rounded-xl bg-black/40 border border-white/15 hover:border-gold text-xs font-mono font-bold text-white cursor-pointer"
            >
              +1%
            </button>
            <button
              type="button"
              data-tv-focusable="true"
              tabIndex={0}
              onClick={() => setWindowScale('global', globalVal + 5)}
              className="px-3 py-1.5 rounded-xl bg-black/40 border border-white/15 hover:border-gold text-xs font-mono font-bold text-white cursor-pointer"
            >
              +5%
            </button>
            <button
              type="button"
              data-tv-focusable="true"
              tabIndex={0}
              onClick={() => setWindowScale('global', 100)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold cursor-pointer ${
                globalVal === 100
                  ? 'bg-gold text-black border-gold'
                  : 'bg-black/40 border-white/15 text-zinc-200 hover:border-gold'
              }`}
            >
              100%
            </button>
          </div>
        </div>

        {/* Independent Per-Category Controls */}
        <div className="grid grid-cols-1 gap-3">
          {categories.map((cat) => {
            const val = typeof ws[cat.key] === 'number' ? clampScale(ws[cat.key] as number) : 100;
            const effectivePct = Math.round((globalVal * val) / 100);
            return (
              <div
                key={cat.key}
                className="p-3.5 sm:p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2.5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="min-w-0">
                    <h4 className="text-xs sm:text-sm font-bold text-white">
                      {isRtl ? cat.titleAr : cat.titleEn}
                    </h4>
                    <p className="text-[11px] text-zinc-400 truncate">
                      {isRtl ? cat.descAr : cat.descEn}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-sm font-mono font-black text-gold">{val}%</span>
                    {globalVal !== 100 && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-white/10 text-zinc-300">
                        {isRtl ? `الفعلي ${effectivePct}%` : `Net ${effectivePct}%`}
                      </span>
                    )}
                  </div>
                </div>

                <div dir="ltr" className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    data-tv-focusable="true"
                    tabIndex={0}
                    onClick={() => setWindowScale(cat.key, val - 5)}
                    className="px-2.5 py-1.5 rounded-xl bg-black/40 border border-white/10 hover:border-gold text-xs font-mono font-bold text-white cursor-pointer"
                  >
                    -5%
                  </button>
                  <button
                    type="button"
                    data-tv-focusable="true"
                    tabIndex={0}
                    onClick={() => setWindowScale(cat.key, val - 1)}
                    className="px-2.5 py-1.5 rounded-xl bg-black/40 border border-white/10 hover:border-gold text-xs font-mono font-bold text-white cursor-pointer"
                  >
                    -1%
                  </button>
                  {[80, 90, 100, 110, 120].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      data-tv-focusable="true"
                      tabIndex={0}
                      onClick={() => setWindowScale(cat.key, preset)}
                      className={`px-2.5 py-1.5 rounded-xl border text-xs font-mono font-bold cursor-pointer ${
                        val === preset
                          ? 'bg-gold text-black border-gold'
                          : 'bg-white/[0.04] border-white/10 text-zinc-300 hover:border-gold/50'
                      }`}
                    >
                      {preset}%
                    </button>
                  ))}
                  <button
                    type="button"
                    data-tv-focusable="true"
                    tabIndex={0}
                    onClick={() => setWindowScale(cat.key, val + 1)}
                    className="px-2.5 py-1.5 rounded-xl bg-black/40 border border-white/10 hover:border-gold text-xs font-mono font-bold text-white cursor-pointer"
                  >
                    +1%
                  </button>
                  <button
                    type="button"
                    data-tv-focusable="true"
                    tabIndex={0}
                    onClick={() => setWindowScale(cat.key, val + 5)}
                    className="px-2.5 py-1.5 rounded-xl bg-black/40 border border-white/10 hover:border-gold text-xs font-mono font-bold text-white cursor-pointer"
                  >
                    +5%
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return null;
}
