// Original path: src/components/DashboardDesignStudio.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Check,
  ChevronLeft,
  Eye,
  Frame,
  Grid,
  Layers,
  Maximize2,
  Palette,
  RotateCcw,
  Sliders,
  Sparkles,
  X,
} from 'lucide-react';
import {
  AppSettings,
  FrameShapeId,
  IconDisplayMode,
  IconPackId,
} from '../types';
import {
  APP_BACKGROUNDS,
  DASHBOARD_LAYOUTS,
  FRAME_SHAPES,
  ICON_PACKS,
  ROYAL_THEMES,
  applyRoyalTheme,
  computePaletteFromHex,
  isValidHexColor,
  normalizeDashboardLayoutId,
  normalizeHexColor,
  resolveDesignSettings,
} from '../utils/themeManager';
import DashboardLayouts, { IconKind } from './DashboardLayouts';
import { DashboardSectionIcon, PackIconSvg } from './IconPacks';

export type StudioTabId =
  | 'display'
  | 'icons'
  | 'frames'
  | 'layouts'
  | 'sizing'
  | 'colors'
  | 'glass';

interface DashboardDesignStudioProps {
  settings: AppSettings;
  initialTab?: StudioTabId;
  isRtl: boolean;
  t: (key: any) => string;
  onCommit: (nextDesign: Partial<AppSettings>) => void;
  onBack: () => void;
}

const DEFAULT_ORDER: IconKind[] = ['live', 'movies', 'series', 'add', 'settings'];

export default function DashboardDesignStudio({
  settings,
  initialTab = 'display',
  isRtl,
  t,
  onCommit,
  onBack,
}: DashboardDesignStudioProps) {
  const makeDraftFromSettings = (src: AppSettings): AppSettings => {
    const r = resolveDesignSettings(src);
    return {
      ...src,
      iconDisplayMode: r.iconDisplayMode,
      iconPack: r.iconPack,
      frameShape: r.frameShape,
      dashboardLayout: r.layoutId,
      iconScale: src.iconScale || 'md',
      frameScale: src.frameScale || 'md',
      tileSpacing: src.tileSpacing || 'md',
      dashboardAlignment: src.dashboardAlignment || 'center',
      dashboardHorizontalAlignment: src.dashboardHorizontalAlignment || 'center',
      dashboardOrder: src.dashboardOrder?.length ? [...src.dashboardOrder] : [...DEFAULT_ORDER],
      royalThemeColor: src.royalThemeColor || 'pure-metallic-gold',
      customThemeColor: src.customThemeColor ?? null,
      glassOpacity: typeof src.glassOpacity === 'number' ? src.glassOpacity : 16,
      glassBlur: typeof src.glassBlur === 'number' ? src.glassBlur : 10,
    };
  };

  const [draft, setDraft] = useState<AppSettings>(() => makeDraftFromSettings(settings));
  const [activeTab, setActiveTab] = useState<StudioTabId>(initialTab);
  const [hexInput, setHexInput] = useState<string>(() => {
    const c = normalizeHexColor(settings.customThemeColor);
    if (c) return c;
    const preset = ROYAL_THEMES.find((th) => th.id === (settings.royalThemeColor || 'pure-metallic-gold'));
    return preset?.primary || '#D4AF37';
  });
  const [justApplied, setJustApplied] = useState(false);

  // Track latest committed settings so unmount cleanly restores saved theme if unconfirmed
  const committedSettingsRef = useRef(settings);
  committedSettingsRef.current = settings;

  // Live-apply draft colors & glass opacity/blur while inspecting in studio
  useEffect(() => {
    applyRoyalTheme(
      draft.royalThemeColor || 'pure-metallic-gold',
      draft.customThemeColor,
      draft.glassOpacity,
      draft.glassBlur
    );
  }, [draft.royalThemeColor, draft.customThemeColor, draft.glassOpacity, draft.glassBlur]);

  // Restore committed theme on unmount if uncommitted changes exist
  useEffect(() => {
    return () => {
      const s = committedSettingsRef.current;
      applyRoyalTheme(
        s.royalThemeColor || 'pure-metallic-gold',
        s.customThemeColor,
        s.glassOpacity,
        s.glassBlur
      );
    };
  }, []);

  const hasUnsavedChanges = useMemo(() => {
    const base = makeDraftFromSettings(settings);
    return (
      draft.iconDisplayMode !== base.iconDisplayMode ||
      draft.iconPack !== base.iconPack ||
      draft.frameShape !== base.frameShape ||
      draft.dashboardLayout !== base.dashboardLayout ||
      draft.iconScale !== base.iconScale ||
      draft.frameScale !== base.frameScale ||
      draft.tileSpacing !== base.tileSpacing ||
      draft.dashboardAlignment !== base.dashboardAlignment ||
      draft.dashboardHorizontalAlignment !== base.dashboardHorizontalAlignment ||
      JSON.stringify(draft.dashboardOrder) !== JSON.stringify(base.dashboardOrder) ||
      draft.royalThemeColor !== base.royalThemeColor ||
      (draft.customThemeColor || null) !== (base.customThemeColor || null) ||
      (draft.glassOpacity ?? 16) !== (base.glassOpacity ?? 16) ||
      (draft.glassBlur ?? 10) !== (base.glassBlur ?? 10)
    );
  }, [draft, settings]);

  const updateDraft = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setJustApplied(false);
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const handleApplyConfirm = () => {
    onCommit({
      iconDisplayMode: draft.iconDisplayMode,
      iconPack: draft.iconPack,
      frameShape: draft.frameShape,
      dashboardLayout: draft.dashboardLayout,
      iconScale: draft.iconScale,
      frameScale: draft.frameScale,
      tileSpacing: draft.tileSpacing,
      dashboardAlignment: draft.dashboardAlignment,
      dashboardHorizontalAlignment: draft.dashboardHorizontalAlignment,
      dashboardOrder: draft.dashboardOrder,
      royalThemeColor: draft.royalThemeColor,
      customThemeColor: draft.customThemeColor ?? null,
      glassOpacity: draft.glassOpacity,
      glassBlur: draft.glassBlur,
    });
    setJustApplied(true);
    setTimeout(() => setJustApplied(false), 2400);
  };

  const handleCancelDiscard = () => {
    const s = committedSettingsRef.current;
    applyRoyalTheme(
      s.royalThemeColor || 'pure-metallic-gold',
      s.customThemeColor,
      s.glassOpacity,
      s.glassBlur
    );
    onBack();
  };

  const handleResetDefaults = () => {
    setJustApplied(false);
    setDraft((prev) => ({
      ...prev,
      iconDisplayMode: 'with-frames',
      iconPack: 'pack-3d',
      frameShape: 'rounded-square',
      dashboardLayout: 'layout-dock-row',
      iconScale: 'md',
      frameScale: 'md',
      tileSpacing: 'md',
      dashboardAlignment: 'center',
      dashboardHorizontalAlignment: 'center',
      dashboardOrder: [...DEFAULT_ORDER],
      royalThemeColor: 'pure-metallic-gold',
      customThemeColor: '#D4AF37',
      glassOpacity: 16,
      glassBlur: 10,
    }));
    setHexInput('#D4AF37');
  };

  const bgConfig = useMemo(() => {
    const id = settings.backgroundStyle || 'bg-raouche-rocks-beirut';
    return APP_BACKGROUNDS.find((b) => b.id === id) || APP_BACKGROUNDS[0];
  }, [settings.backgroundStyle]);

  const customBgUrl =
    typeof settings.customBackground === 'string' && settings.customBackground.trim()
      ? settings.customBackground.trim()
      : typeof settings.customBackground === 'object' && settings.customBackground?.url
      ? settings.customBackground.url
      : null;

  const activePalette = useMemo(() => {
    const validCustom = normalizeHexColor(draft.customThemeColor);
    if (validCustom) return computePaletteFromHex(validCustom);
    const preset = ROYAL_THEMES.find((th) => th.id === draft.royalThemeColor) || ROYAL_THEMES[0];
    return computePaletteFromHex(preset.primary);
  }, [draft.customThemeColor, draft.royalThemeColor]);

  const tabs: Array<{ id: StudioTabId; icon: React.ComponentType<any>; labelAr: string; labelEn: string }> = [
    { id: 'display', icon: Eye, labelAr: 'العرض', labelEn: 'Display' },
    { id: 'icons', icon: Sparkles, labelAr: 'الأيقونات', labelEn: 'Icons' },
    { id: 'frames', icon: Frame, labelAr: 'الإطارات', labelEn: 'Frames' },
    { id: 'layouts', icon: Grid, labelAr: 'الواجهة', labelEn: 'Layouts' },
    { id: 'sizing', icon: Maximize2, labelAr: 'الأحجام', labelEn: 'Sizing' },
    { id: 'colors', icon: Palette, labelAr: 'الألوان', labelEn: 'Colors' },
    { id: 'glass', icon: Layers, labelAr: 'الشفافية', labelEn: 'Glass' },
  ];

  const moveOrderItem = (index: number, delta: -1 | 1) => {
    const cur = [...(draft.dashboardOrder || DEFAULT_ORDER)];
    const target = index + delta;
    if (target < 0 || target >= cur.length) return;
    [cur[index], cur[target]] = [cur[target], cur[index]];
    updateDraft('dashboardOrder', cur);
  };

  const previewAlignV =
    draft.dashboardAlignment === 'top'
      ? 'justify-start pt-2'
      : draft.dashboardAlignment === 'bottom'
      ? 'justify-end pb-2'
      : 'justify-center';

  const previewAlignH =
    draft.dashboardHorizontalAlignment === 'left'
      ? 'items-start'
      : draft.dashboardHorizontalAlignment === 'right'
      ? 'items-end'
      : 'items-center';

  const renderLayoutDiagram = (layoutId: string) => {
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
  };

  return (
    <div
      className={`h-full w-full flex flex-col px-3 sm:px-5 py-2.5 overflow-hidden select-none ${
        isRtl ? 'font-cairo text-right' : 'font-sans text-left'
      }`}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Top Studio Header Bar */}
      <header className="w-full max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            type="button"
            data-tv-focusable="true"
            tabIndex={0}
            onClick={handleCancelDiscard}
            className="p-2 rounded-xl bg-white/10 hover:bg-gold hover:text-black text-white transition-colors cursor-pointer shrink-0"
            title={isRtl ? 'رجوع' : 'Back'}
          >
            <ChevronLeft size={18} className={isRtl ? 'rotate-180' : ''} />
          </button>
          <div className="min-w-0">
            <h2 className="text-sm sm:text-lg font-black text-gold truncate">
              {isRtl ? 'استوديو تصميم واجهة Achour Player' : 'Achour Player UI Design Studio'}
            </h2>
            <p className="text-[11px] text-zinc-300 truncate">
              {isRtl
                ? 'خصص الأيقونات والإطارات والتوزيع والألوان مع معاينة فورية قبل الاعتماد'
                : 'Mix & match icons, frames, layouts, gold tones & glass with live preview'}
            </p>
          </div>
        </div>

        {/* Apply / Confirm + Reset + Cancel */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            data-tv-focusable="true"
            tabIndex={0}
            onClick={handleResetDefaults}
            className="px-3 py-2 rounded-xl bg-white/[0.06] hover:bg-white/15 border border-white/15 text-zinc-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
          >
            <RotateCcw size={14} />
            <span>{isRtl ? 'افتراضي' : 'Reset'}</span>
          </button>

          <button
            type="button"
            data-tv-focusable="true"
            tabIndex={0}
            onClick={handleCancelDiscard}
            className="px-3 py-2 rounded-xl bg-white/[0.06] hover:bg-red-500/20 border border-white/15 hover:border-red-400/50 text-zinc-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
          >
            <X size={14} />
            <span>{isRtl ? 'إلغاء' : 'Cancel'}</span>
          </button>

          <button
            type="button"
            data-tv-focusable="true"
            tabIndex={0}
            onClick={handleApplyConfirm}
            style={{
              background:
                justApplied
                  ? '#10B981'
                  : 'var(--theme-metallic-grad, linear-gradient(135deg, #8C6A1D 0%, #D4AF37 40%, #F5E6A8 65%, #B8860B 100%))',
            }}
            className="px-4 py-2 rounded-xl text-[#090b10] text-xs sm:text-sm font-black flex items-center gap-1.5 shadow-[0_6px_20px_var(--theme-glow)] hover:brightness-110 transition-all cursor-pointer whitespace-nowrap"
          >
            <Check size={16} strokeWidth={3} />
            <span>
              {justApplied
                ? isRtl
                  ? 'تم الحفظ والتطبيق!'
                  : 'Applied & Saved!'
                : isRtl
                ? 'تطبيق وتأكيد'
                : 'Apply / Confirm'}
            </span>
          </button>
        </div>
      </header>

      {/* Main Split Studio Stage: Live Preview (Left/Top) + Customization Controls (Right/Bottom) */}
      <div className="w-full max-w-7xl mx-auto flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-3.5 overflow-hidden">
        {/* LIVE PREVIEW PANEL */}
        <section className="lg:col-span-5 flex flex-col gap-2 min-h-[210px] sm:min-h-[245px] lg:min-h-0">
          <div className="flex items-center justify-between px-1 shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold text-white">
                {isRtl ? 'معاينة مباشرة فورية' : 'Live Interactive Preview'}
              </span>
            </div>
            {hasUnsavedChanges && (
              <span className="px-2 py-0.5 rounded-lg bg-gold/20 border border-gold/50 text-gold text-[10px] font-bold">
                {isRtl ? 'تعديلات غير محفوظة' : 'Draft Active'}
              </span>
            )}
          </div>

          {/* Miniature Achour Player Screen Canvas */}
          <div className="relative flex-1 min-h-[180px] rounded-3xl border border-gold/40 overflow-hidden shadow-2xl bg-black flex flex-col">
            {customBgUrl ? (
              <div
                className="absolute inset-0 bg-cover bg-center pointer-events-none"
                style={{ backgroundImage: `url(${customBgUrl})` }}
              />
            ) : (
              bgConfig?.imageUrl && (
                <img
                  src={bgConfig.imageUrl}
                  alt={bgConfig.nameEn}
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                />
              )
            )}
            <div className="absolute inset-0 bg-black/50 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/65 pointer-events-none" />

            {/* Preview Top Brand Bar (Strictly no mini video player) */}
            <div
              dir="ltr"
              className="relative z-10 flex items-center justify-between px-4 pt-2.5 pb-1 shrink-0"
            >
              <span className="text-[10px] font-mono text-gold/90 font-semibold">
                {isRtl ? 'اشتراك نشط' : 'ACTIVE'}
              </span>
              <span className="text-xs font-black tracking-widest text-gold uppercase">
                ACHOUR PLAYER
              </span>
              <span className="text-[10px] font-mono text-gold font-bold">21:45</span>
            </div>

            {/* Live Rendered 5 Sections */}
            <div
              className={`relative z-10 flex-1 min-h-0 flex flex-col px-3.5 py-2 overflow-hidden ${previewAlignV} ${previewAlignH}`}
            >
              <div
                className={
                  draft.dashboardHorizontalAlignment === 'left' ||
                  draft.dashboardHorizontalAlignment === 'right'
                    ? 'w-[78%]'
                    : 'w-full'
                }
              >
                <DashboardLayouts
                  previewMode
                  layoutId={draft.dashboardLayout}
                  dashboardOrder={draft.dashboardOrder}
                  iconDisplayMode={draft.iconDisplayMode}
                  iconPack={draft.iconPack}
                  frameShape={draft.frameShape}
                  iconSize={draft.iconScale}
                  frameScale={draft.frameScale}
                  tileSpacing={draft.tileSpacing}
                  glassOpacity={draft.glassOpacity}
                  glassBlur={draft.glassBlur}
                  language={settings.language}
                  isRtl={isRtl}
                  t={t}
                  onNavigate={() => {}}
                />
              </div>
            </div>
          </div>

          {/* Active Mix-and-Match Recipe Bar */}
          <div className="p-2.5 rounded-2xl bg-white/[0.04] border border-white/10 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-1.5 text-[11px] shrink-0">
            <div className="truncate">
              <span className="text-zinc-400">{isRtl ? 'العرض: ' : 'Mode: '}</span>
              <strong className="text-gold">
                {draft.iconDisplayMode === 'icons-only'
                  ? isRtl
                    ? 'أيقونات فقط'
                    : 'Icons Only'
                  : isRtl
                  ? 'مع إطارات'
                  : 'With Frames'}
              </strong>
            </div>
            <div className="truncate">
              <span className="text-zinc-400">{isRtl ? 'الأيقونات: ' : 'Pack: '}</span>
              <strong className="text-white">
                {ICON_PACKS.find((p) => p.id === draft.iconPack)?.[isRtl ? 'nameAr' : 'nameEn']}
              </strong>
            </div>
            <div className="truncate">
              <span className="text-zinc-400">{isRtl ? 'الإطار: ' : 'Frame: '}</span>
              <strong className="text-white">
                {draft.iconDisplayMode === 'icons-only'
                  ? isRtl
                    ? 'موقوف'
                    : 'Off'
                  : FRAME_SHAPES.find((f) => f.id === draft.frameShape)?.[
                      isRtl ? 'nameAr' : 'nameEn'
                    ]}
              </strong>
            </div>
            <div className="flex items-center gap-1.5 truncate">
              <span
                className="w-3 h-3 rounded-full border border-white/30 shrink-0"
                style={{ backgroundColor: activePalette.primary }}
              />
              <strong className="font-mono text-gold truncate">{activePalette.primary}</strong>
            </div>
          </div>
        </section>

        {/* CONTROLS WORKSPACE */}
        <section className="lg:col-span-7 flex flex-col min-h-0 overflow-hidden">
          {/* Studio Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-2 mb-2 border-b border-white/10 shrink-0">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  data-tv-focusable="true"
                  tabIndex={0}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 whitespace-nowrap ${
                    isActive
                      ? 'bg-gold/20 border-gold text-gold shadow-[0_0_12px_var(--theme-glow)]'
                      : 'bg-white/[0.04] border-white/10 text-zinc-300 hover:border-gold/40 hover:text-white'
                  }`}
                >
                  <Icon size={14} />
                  <span>{isRtl ? tab.labelAr : tab.labelEn}</span>
                </button>
              );
            })}
          </div>

          {/* Scrollable Active Tab Content */}
          <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar pr-0.5 pb-3 space-y-4">
            {/* =============================================================== */}
            {/* TAB 1: OPTION 1 — DISPLAY MODE (Icons Only vs With Frames)     */}
            {/* =============================================================== */}
            {activeTab === 'display' && (
              <div className="space-y-3">
                <div>
                  <h3 className="text-sm font-black text-white">
                    {isRtl ? 'الخيار الأول: طريقة عرض الأيقونات' : 'Option 1: Icon Display Mode'}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {isRtl
                      ? 'اختر عرض الأيقونات وحدها بحرية تامة دون أي إطار أو خلفية، أو عرضها داخل إطارات مستقلة.'
                      : 'Show pure icons cleanly with zero borders/backgrounds, or enable customizable frames.'}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(
                    [
                      {
                        mode: 'icons-only' as IconDisplayMode,
                        titleAr: 'أيقونات فقط (بدون إطار)',
                        titleEn: 'Icons Only (No Frame)',
                        descAr:
                          'عرض الأيقونات مباشرة فوق الخلفية بدون أي إطار أو صندوق أو حدود.',
                        descEn:
                          'Pure borderless SVG icons floating directly over your wallpaper.',
                      },
                      {
                        mode: 'with-frames' as IconDisplayMode,
                        titleAr: 'أيقونات مع إطارات',
                        titleEn: 'Icons With Frames',
                        descAr:
                          'تشغيل الإطارات الهندسية والزجاجية والمعدنية حول كل قسم مع حرية التخصيص.',
                        descEn:
                          'Enable sculptural frames (circle, hex, glass, metallic, geometric).',
                      },
                    ] as const
                  ).map((opt) => {
                    const active = draft.iconDisplayMode === opt.mode;
                    return (
                      <button
                        key={opt.mode}
                        type="button"
                        data-tv-focusable="true"
                        tabIndex={0}
                        onClick={() => updateDraft('iconDisplayMode', opt.mode)}
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
                            iconPack={draft.iconPack || 'pack-3d'}
                            frameShape={draft.frameShape || 'rounded-square'}
                            sizeOverridePx={32}
                            frameSizeOverridePx={54}
                          />
                          <DashboardSectionIcon
                            kind="movies"
                            displayMode={opt.mode}
                            iconPack={draft.iconPack || 'pack-3d'}
                            frameShape={draft.frameShape || 'rounded-square'}
                            sizeOverridePx={32}
                            frameSizeOverridePx={54}
                          />
                          <DashboardSectionIcon
                            kind="series"
                            displayMode={opt.mode}
                            iconPack={draft.iconPack || 'pack-3d'}
                            frameShape={draft.frameShape || 'rounded-square'}
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
            )}

            {/* =============================================================== */}
            {/* TAB 2: OPTION 2 — 40 DISTINCT ICON PACKS                        */}
            {/* =============================================================== */}
            {activeTab === 'icons' && (
              <div className="space-y-3">
                <div>
                  <h3 className="text-sm font-black text-white">
                    {isRtl ? `الخيار الثاني: شكل الأيقونات (${ICON_PACKS.length} شكلاً مختلفاً)` : `Option 2: Icon Artwork (${ICON_PACKS.length} Distinct Styles)`}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {isRtl
                      ? '40 حزمة أيقونات برسومات هندسية ومجسمة وزجاجية ومعدنية ونيون مختلفة كلياً لكل قسم.'
                      : '40 genuinely distinct vector icon styles across Live, Movies, Series, Playlist & Settings.'}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {ICON_PACKS.map((pack) => {
                    const active = draft.iconPack === pack.id;
                    return (
                      <button
                        key={pack.id}
                        type="button"
                        data-tv-focusable="true"
                        tabIndex={0}
                        onClick={() => updateDraft('iconPack', pack.id as IconPackId)}
                        className={`p-3.5 rounded-2xl border transition-all flex flex-col gap-2.5 cursor-pointer ${
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
                          {(['live', 'movies', 'series', 'add', 'settings'] as IconKind[]).map(
                            (k) => (
                              <PackIconSvg
                                key={k}
                                kind={k}
                                pack={pack.id}
                                sizePx={28}
                              />
                            )
                          )}
                        </div>
                        <p className="text-[11px] text-zinc-300 leading-snug">
                          {isRtl ? pack.descriptionAr : pack.descriptionEn}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* =============================================================== */}
            {/* TAB 3: OPTION 3 — 40 INDEPENDENT FRAME SHAPES                   */}
            {/* =============================================================== */}
            {activeTab === 'frames' && (
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-black text-white">
                      {isRtl
                        ? `الخيار الثالث: شكل الإطارات (${FRAME_SHAPES.length} شكلاً مستقلاً)`
                        : `Option 3: Independent Frame Shapes (${FRAME_SHAPES.length})`}
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      {isRtl
                        ? 'ادمج أي شكل إطار من الـ 40 شكلاً مع أي حزمة أيقونات بكل حرية.'
                        : 'Combine any of the 40 distinct frame silhouettes freely with any icon pack.'}
                    </p>
                  </div>
                  {draft.iconDisplayMode === 'icons-only' && (
                    <button
                      type="button"
                      data-tv-focusable="true"
                      tabIndex={0}
                      onClick={() => updateDraft('iconDisplayMode', 'with-frames')}
                      className="px-3 py-1.5 rounded-xl bg-gold text-black text-xs font-black cursor-pointer whitespace-nowrap"
                    >
                      {isRtl ? 'تفعيل عرض الإطارات الآن' : 'Enable Frames Now'}
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {FRAME_SHAPES.map((shape) => {
                    const active = draft.frameShape === shape.id;
                    return (
                      <button
                        key={shape.id}
                        type="button"
                        data-tv-focusable="true"
                        tabIndex={0}
                        onClick={() => {
                          setJustApplied(false);
                          setDraft((prev) => ({
                            ...prev,
                            frameShape: shape.id as FrameShapeId,
                            iconDisplayMode: 'with-frames',
                          }));
                        }}
                        className={`p-3 rounded-2xl border transition-all flex flex-col items-center gap-2 text-center cursor-pointer ${
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
                            iconPack={draft.iconPack || 'pack-3d'}
                            frameShape={shape.id}
                            sizeOverridePx={28}
                            frameSizeOverridePx={58}
                            glassOpacity={draft.glassOpacity}
                            glassBlur={draft.glassBlur}
                          />
                        </div>
                        <p className="text-[10px] text-zinc-400 line-clamp-2 leading-tight">
                          {isRtl ? shape.descriptionAr : shape.descriptionEn}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* =============================================================== */}
            {/* TAB 4: OPTION 4 — 40 DISTINCT INTERFACE LAYOUTS                 */}
            {/* =============================================================== */}
            {activeTab === 'layouts' && (
              <div className="space-y-3">
                <div>
                  <h3 className="text-sm font-black text-white">
                    {isRtl
                      ? `الخيار الرابع: تصميم وتوزيع الواجهة (${DASHBOARD_LAYOUTS.length} تصميماً)`
                      : `Option 4: Interface Spatial Layout (${DASHBOARD_LAYOUTS.length})`}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {isRtl
                      ? '40 تصميماً مختلفاً كلياً لتوزيع الأقسام الخمسة على الشاشة دون مشغل فيديو.'
                      : '40 distinct spatial arrangements of the 5 core sections (Live, Movies, Series, Playlist, Settings).'}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {DASHBOARD_LAYOUTS.map((layout) => {
                    const active =
                      normalizeDashboardLayoutId(draft.dashboardLayout) === layout.id;
                    return (
                      <button
                        key={layout.id}
                        type="button"
                        data-tv-focusable="true"
                        tabIndex={0}
                        onClick={() => updateDraft('dashboardLayout', layout.id)}
                        className={`p-3 rounded-2xl border transition-all flex flex-col gap-2 cursor-pointer ${
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
                    );
                  })}
                </div>
              </div>
            )}

            {/* =============================================================== */}
            {/* TAB 5: SIZES, SPACING, SCREEN ALIGNMENT & ORDERING              */}
            {/* =============================================================== */}
            {activeTab === 'sizing' && (
              <div className="space-y-4">
                {/* Icon Size */}
                <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gold">
                      {isRtl ? 'حجم الأيقونات' : 'Icon Size'}
                    </span>
                    <span className="text-[11px] font-mono text-zinc-300 uppercase">
                      {draft.iconScale || 'md'}
                    </span>
                  </div>
                  <div className="grid grid-cols-7 gap-1.5">
                    {(['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'] as const).map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        data-tv-focusable="true"
                        tabIndex={0}
                        onClick={() => updateDraft('iconScale', sz)}
                        className={`py-2 rounded-xl border text-xs font-mono font-bold uppercase cursor-pointer transition-colors ${
                          (draft.iconScale || 'md') === sz
                            ? 'bg-gold text-black border-gold'
                            : 'bg-white/[0.04] border-white/10 text-zinc-200 hover:border-gold/50'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Frame Size */}
                <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gold">
                      {isRtl ? 'حجم الإطارات (مستقل)' : 'Frame Size (Independent)'}
                    </span>
                    <span className="text-[11px] font-mono text-zinc-300 uppercase">
                      {draft.frameScale || 'md'}
                    </span>
                  </div>
                  <div className="grid grid-cols-7 gap-1.5">
                    {(['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'] as const).map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        data-tv-focusable="true"
                        tabIndex={0}
                        onClick={() => updateDraft('frameScale', sz)}
                        className={`py-2 rounded-xl border text-xs font-mono font-bold uppercase cursor-pointer transition-colors ${
                          (draft.frameScale || 'md') === sz
                            ? 'bg-gold text-black border-gold'
                            : 'bg-white/[0.04] border-white/10 text-zinc-200 hover:border-gold/50'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Section Spacing */}
                <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gold">
                      {isRtl ? 'المسافة بين الأقسام' : 'Section Spacing'}
                    </span>
                    <span className="text-[11px] font-mono text-zinc-300 uppercase">
                      {draft.tileSpacing || 'md'}
                    </span>
                  </div>
                  <div className="grid grid-cols-5 gap-1.5">
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
                        onClick={() => updateDraft('tileSpacing', sp.id)}
                        className={`py-2 px-1 rounded-xl border text-[11px] font-bold cursor-pointer transition-colors whitespace-nowrap ${
                          (draft.tileSpacing || 'md') === sp.id
                            ? 'bg-gold text-black border-gold'
                            : 'bg-white/[0.04] border-white/10 text-zinc-200 hover:border-gold/50'
                        }`}
                      >
                        {isRtl ? sp.ar : sp.en}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Screen Alignment (9-Zone Grid) */}
                <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2">
                  <span className="text-xs font-bold text-gold block">
                    {isRtl ? 'محاذاة الأقسام على الشاشة' : 'Screen Alignment Position'}
                  </span>
                  <div dir="ltr" className="grid grid-cols-3 gap-1.5">
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
                      const active =
                        (draft.dashboardAlignment || 'center') === cell.v &&
                        (draft.dashboardHorizontalAlignment || 'center') === cell.h;
                      return (
                        <button
                          key={`${cell.v}-${cell.h}`}
                          type="button"
                          data-tv-focusable="true"
                          tabIndex={0}
                          onClick={() => {
                            setJustApplied(false);
                            setDraft((prev) => ({
                              ...prev,
                              dashboardAlignment: cell.v,
                              dashboardHorizontalAlignment: cell.h,
                            }));
                          }}
                          className={`py-1.5 px-2 rounded-xl border text-[11px] font-bold cursor-pointer transition-colors ${
                            active
                              ? 'bg-gold/25 border-gold text-gold'
                              : 'bg-white/[0.04] border-white/10 text-zinc-300 hover:border-gold/45'
                          }`}
                        >
                          {isRtl ? cell.ar : cell.en}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Section Order (Live, Movies, Series, Playlist, Settings) */}
                <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2">
                  <span className="text-xs font-bold text-gold block">
                    {isRtl ? 'ترتيب الأقسام الخمسة' : 'Reorder 5 Sections'}
                  </span>
                  <div className="space-y-1.5">
                    {(draft.dashboardOrder || DEFAULT_ORDER).map((kind, idx) => {
                      const nameMap: Record<string, string> = {
                        live: t('live'),
                        movies: t('movies'),
                        series: t('series'),
                        add: t('playlist'),
                        settings: t('settings'),
                      };
                      return (
                        <div
                          key={kind}
                          className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-black/35 border border-white/10"
                        >
                          <span className="text-xs font-bold text-white">
                            {idx + 1}. {nameMap[kind] || kind}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              data-tv-focusable="true"
                              tabIndex={0}
                              disabled={idx === 0}
                              onClick={() => moveOrderItem(idx, -1)}
                              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-gold hover:text-black disabled:opacity-30 text-xs font-black cursor-pointer"
                            >
                              ↑
                            </button>
                            <button
                              type="button"
                              data-tv-focusable="true"
                              tabIndex={0}
                              disabled={idx === (draft.dashboardOrder || DEFAULT_ORDER).length - 1}
                              onClick={() => moveOrderItem(idx, 1)}
                              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-gold hover:text-black disabled:opacity-30 text-xs font-black cursor-pointer"
                            >
                              ↓
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* =============================================================== */}
            {/* TAB 6: TRUE METALLIC GOLD (#D4AF37) + MANUAL HEX + PRESETS      */}
            {/* =============================================================== */}
            {activeTab === 'colors' && (
              <div className="space-y-3.5">
                {/* Featured True 24K Metallic Gold Card */}
                <button
                  type="button"
                  data-tv-focusable="true"
                  tabIndex={0}
                  onClick={() => {
                    setJustApplied(false);
                    setHexInput('#D4AF37');
                    setDraft((prev) => ({
                      ...prev,
                      royalThemeColor: 'pure-metallic-gold',
                      customThemeColor: '#D4AF37',
                    }));
                  }}
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
                    <div className="min-w-0">
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

                {/* Manual Color Picker + HEX Input */}
                <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/15 space-y-2.5">
                  <span className="text-xs font-bold text-white block">
                    {isRtl
                      ? 'اختيار اللون يدوياً أو إدخال كود HEX'
                      : 'Manual Color Picker & HEX Code'}
                  </span>
                  <div dir="ltr" className="flex flex-wrap items-center gap-2.5">
                    <label className="relative flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/45 border border-white/15 cursor-pointer">
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
                          updateDraft('customThemeColor', next);
                        }}
                        className="w-8 h-8 rounded-lg border-0 bg-transparent cursor-pointer"
                      />
                      <span className="text-xs font-bold text-zinc-200 whitespace-nowrap">
                        {isRtl ? 'منتقي' : 'Pick'}
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
                          updateDraft('customThemeColor', norm);
                        }
                      }}
                      className="flex-1 min-w-[120px] px-3 py-2 rounded-xl bg-black/50 border border-white/20 text-sm font-mono font-bold text-gold uppercase"
                    />

                    <button
                      type="button"
                      data-tv-focusable="true"
                      tabIndex={0}
                      disabled={!isValidHexColor(hexInput)}
                      onClick={() => {
                        const norm = normalizeHexColor(hexInput);
                        if (norm) {
                          setHexInput(norm);
                          updateDraft('customThemeColor', norm);
                        }
                      }}
                      className="px-3.5 py-2 rounded-xl bg-gold text-black font-black text-xs disabled:opacity-40 cursor-pointer whitespace-nowrap"
                    >
                      {isRtl ? 'معاينة HEX' : 'Use HEX'}
                    </button>
                  </div>
                </div>

                {/* Preset Swatches */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {ROYAL_THEMES.map((theme) => {
                    const isSelected =
                      !draft.customThemeColor && draft.royalThemeColor === theme.id;
                    return (
                      <button
                        key={theme.id}
                        type="button"
                        data-tv-focusable="true"
                        tabIndex={0}
                        onClick={() => {
                          setJustApplied(false);
                          setHexInput(theme.primary);
                          setDraft((prev) => ({
                            ...prev,
                            royalThemeColor: theme.id,
                            customThemeColor: null,
                          }));
                        }}
                        className={`p-2.5 rounded-xl border flex flex-col gap-1.5 cursor-pointer transition-colors ${
                          isSelected
                            ? 'border-gold bg-white/15'
                            : 'border-white/10 bg-white/[0.04] hover:border-white/30'
                        } ${isRtl ? 'text-right' : 'text-left'}`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span
                            className="w-4 h-4 rounded-full border border-white/25"
                            style={{ backgroundColor: theme.primary }}
                          />
                          <span className="text-[10px] font-mono text-zinc-400">
                            {theme.primary}
                          </span>
                        </div>
                        <span className="text-[11px] font-medium text-white truncate w-full">
                          {isRtl ? theme.nameAr : theme.nameEn}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* =============================================================== */}
            {/* TAB 7: TRANSPARENCY & GLASS BLUR                                */}
            {/* =============================================================== */}
            {activeTab === 'glass' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-black text-white">
                    {isRtl
                      ? 'شفافية الخلفيات والتأثير الزجاجي'
                      : 'Background Opacity & Glass Effect'}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {isRtl
                      ? 'يتحكم في شفافية البطاقات والإطارات الزجاجية والمعدنية ودرجة الضبابية.'
                      : 'Controls card & frame translucency plus frosted glass blur intensity.'}
                  </p>
                </div>

                {/* Glass Opacity Control */}
                <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/15 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gold flex items-center gap-1.5">
                      <Sliders size={14} />
                      <span>{isRtl ? 'شفافية الإطارات والخلفيات' : 'Surface Opacity'}</span>
                    </span>
                    <span className="text-xs font-mono font-black text-white">
                      {draft.glassOpacity ?? 16}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      data-tv-focusable="true"
                      tabIndex={0}
                      onClick={() =>
                        updateDraft('glassOpacity', Math.max(0, (draft.glassOpacity ?? 16) - 6))
                      }
                      className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-gold hover:text-black text-sm font-black cursor-pointer"
                    >
                      −
                    </button>
                    <input
                      type="range"
                      min={0}
                      max={85}
                      step={2}
                      value={draft.glassOpacity ?? 16}
                      onChange={(e) => updateDraft('glassOpacity', Number(e.target.value))}
                      className="flex-1 accent-[var(--theme-primary)] cursor-pointer"
                    />
                    <button
                      type="button"
                      data-tv-focusable="true"
                      tabIndex={0}
                      onClick={() =>
                        updateDraft('glassOpacity', Math.min(85, (draft.glassOpacity ?? 16) + 6))
                      }
                      className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-gold hover:text-black text-sm font-black cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                  <div className="grid grid-cols-5 gap-1.5">
                    {[4, 16, 30, 50, 75].map((v) => (
                      <button
                        key={v}
                        type="button"
                        data-tv-focusable="true"
                        tabIndex={0}
                        onClick={() => updateDraft('glassOpacity', v)}
                        className={`py-1.5 rounded-xl border text-[11px] font-mono font-bold cursor-pointer ${
                          (draft.glassOpacity ?? 16) === v
                            ? 'bg-gold text-black border-gold'
                            : 'bg-white/[0.04] border-white/10 text-zinc-200 hover:border-gold/50'
                        }`}
                      >
                        {v}%
                      </button>
                    ))}
                  </div>
                </div>

                {/* Glass Blur Control */}
                <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/15 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gold flex items-center gap-1.5">
                      <Layers size={14} />
                      <span>{isRtl ? 'التأثير الزجاجي الضبابي (Blur)' : 'Frosted Glass Blur'}</span>
                    </span>
                    <span className="text-xs font-mono font-black text-white">
                      {draft.glassBlur ?? 10}px
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      data-tv-focusable="true"
                      tabIndex={0}
                      onClick={() =>
                        updateDraft('glassBlur', Math.max(0, (draft.glassBlur ?? 10) - 2))
                      }
                      className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-gold hover:text-black text-sm font-black cursor-pointer"
                    >
                      −
                    </button>
                    <input
                      type="range"
                      min={0}
                      max={24}
                      step={2}
                      value={draft.glassBlur ?? 10}
                      onChange={(e) => updateDraft('glassBlur', Number(e.target.value))}
                      className="flex-1 accent-[var(--theme-primary)] cursor-pointer"
                    />
                    <button
                      type="button"
                      data-tv-focusable="true"
                      tabIndex={0}
                      onClick={() =>
                        updateDraft('glassBlur', Math.min(24, (draft.glassBlur ?? 10) + 2))
                      }
                      className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-gold hover:text-black text-sm font-black cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                  <div className="grid grid-cols-5 gap-1.5">
                    {[0, 6, 10, 16, 24].map((v) => (
                      <button
                        key={v}
                        type="button"
                        data-tv-focusable="true"
                        tabIndex={0}
                        onClick={() => updateDraft('glassBlur', v)}
                        className={`py-1.5 rounded-xl border text-[11px] font-mono font-bold cursor-pointer ${
                          (draft.glassBlur ?? 10) === v
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
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
