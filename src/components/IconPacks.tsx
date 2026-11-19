// Original path: src/components/IconPacks.tsx
import React, { useId } from 'react';
import { IconDisplayMode, IconPackId, FrameShapeId, AppSettings } from '../types';
import { ICON_PACKS, normalizeIconPackId, normalizeFrameShapeId } from '../utils/themeManager';

export type SectionIconKind = 'live' | 'movies' | 'series' | 'add' | 'settings';

export const ICON_PX_MAP: Record<NonNullable<AppSettings['iconScale']>, number> = {
  xs: 26,
  sm: 32,
  md: 40,
  lg: 48,
  xl: 58,
  '2xl': 68,
  '3xl': 80,
};

export const FRAME_PX_MAP: Record<NonNullable<AppSettings['frameScale']>, number> = {
  xs: 48,
  sm: 58,
  md: 72,
  lg: 86,
  xl: 102,
  '2xl': 118,
  '3xl': 136,
};

const PACK_INDEX_MAP: Record<string, number> = Object.fromEntries(
  ICON_PACKS.map((p, i) => [p.id, i])
);

/**
 * 8 genuinely distinct vector silhouette families per section (Live, Movies, Series, Playlist, Settings)
 * combined with 40 bespoke finish treatments so all 40 Icon Packs look unmistakably unique!
 */
interface GlyphStyleTokens {
  fillPrimary: string;
  fillSecondary: string;
  fillAccent: string;
  fillGlass: string;
  fillDark: string;
  strokeMain: string;
  strokeAccent: string;
  strokeW: number;
  isNeon?: boolean;
  isMonoline?: boolean;
  isStencil?: boolean;
  isDuotone?: boolean;
  badgeOverlay?: 'none' | 'crest' | 'plasma' | 'pixel' | 'slab' | 'coin' | 'holo' | 'hud' | 'deco';
}

function renderSectionSilhouette(
  kind: SectionIconKind,
  variant: number,
  t: GlyphStyleTokens
) {
  const fillBody = t.isMonoline ? 'none' : t.fillPrimary;
  const fillSub = t.isMonoline ? 'none' : t.fillSecondary;
  const strokeDash = t.isStencil ? '6 3.5' : undefined;
  const sw = t.strokeW;

  // =========================================================================
  // LIVE (Broadcast Spire / Satellite Dish / CRT TV / Radar / Bauhaus Wings / Meridian Globe / Tower Bars / Studio Aperture)
  // =========================================================================
  if (kind === 'live') {
    switch (variant % 8) {
      case 0: // Modern Flat TV with Dual Antenna & Live Play Icon
        return (
          <g>
            <path d="M16 6L24 14L32 6" fill="none" stroke={t.strokeAccent} strokeWidth={sw + 0.4} strokeLinecap="round" strokeLinejoin="round" />
            <rect x="5" y="14" width="38" height="23" rx="4" fill={fillBody} stroke={t.strokeMain} strokeWidth={sw} />
            <rect x="9" y="18" width="22" height="15" rx="2" fill={t.isMonoline ? 'none' : t.fillDark} stroke={t.strokeAccent} strokeWidth={1.2} />
            <circle cx="36" cy="21" r="1.6" fill={t.fillAccent} />
            <circle cx="36" cy="27" r="1.6" fill={t.fillAccent} />
            <polygon points="17,23 23,25.5 17,28" fill={t.fillAccent} />
            <path d="M15 37H33" stroke={t.strokeMain} strokeWidth={sw} strokeLinecap="round" />
          </g>
        );
      case 1: // Studio Broadcast Monitor with Screen & Status LED
        return (
          <g>
            <rect x="6" y="9" width="36" height="26" rx="4.5" fill={fillBody} stroke={t.strokeMain} strokeWidth={sw} />
            <rect x="10" y="13" width="28" height="17" rx="2.5" fill={t.isMonoline ? 'none' : t.fillDark} stroke={t.strokeAccent} strokeWidth={1.2} />
            <circle cx="24" cy="35" r="2" fill={t.fillAccent} />
            <path d="M19 20L22 22.5L25 19L28 22.5" fill="none" stroke={t.strokeAccent} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
            <path d="M18 41H30" stroke={t.strokeMain} strokeWidth={sw + 0.5} strokeLinecap="round" />
            <line x1="24" y1="37" x2="24" y2="41" stroke={t.strokeMain} strokeWidth={sw} />
          </g>
        );
      case 2: // Retro Console TV with Rabbit Ears Antenna
        return (
          <g>
            <path d="M17 5L24 13L31 5" fill="none" stroke={t.strokeAccent} strokeWidth={sw + 0.4} strokeLinecap="round" strokeLinejoin="round" />
            <rect x="6" y="13" width="36" height="25" rx="5" fill={fillBody} stroke={t.strokeMain} strokeWidth={sw} />
            <rect x="10" y="17" width="21" height="17" rx="2.5" fill={t.isMonoline ? 'none' : t.fillDark} stroke={t.strokeAccent} strokeWidth={1.2} />
            <circle cx="36" cy="21" r="2" fill={t.fillAccent} />
            <circle cx="36" cy="28" r="2" fill={t.fillAccent} />
            <path d="M16 23H24M16 27H21" stroke={t.strokeAccent} strokeWidth={1.5} strokeLinecap="round" />
            <path d="M15 38H33" stroke={t.strokeMain} strokeWidth={sw} strokeLinecap="round" />
          </g>
        );
      case 3: // Wide Screen LCD Smart TV Display with Live Waves
        return (
          <g>
            <rect x="4" y="11" width="40" height="26" rx="4" fill={fillSub} stroke={t.strokeMain} strokeWidth={sw} />
            <rect x="8" y="15" width="32" height="17" rx="2" fill={t.isMonoline ? 'none' : t.fillDark} stroke={t.strokeAccent} strokeWidth={1.3} />
            <path d="M18 20.5H30M20 24.5H28" stroke={t.strokeAccent} strokeWidth={1.6} strokeLinecap="round" />
            <path d="M17 7L24 11L31 7" fill="none" stroke={t.strokeAccent} strokeWidth={1.5} strokeLinecap="round" />
            <path d="M18 37H30" stroke={t.strokeMain} strokeWidth={sw} strokeLinecap="round" />
          </g>
        );
      case 4: // Frameless OLED TV Screen with Antenna & Signal
        return (
          <g>
            <path d="M15 5L24 12L33 5" fill="none" stroke={t.strokeAccent} strokeWidth={sw + 0.4} strokeLinecap="round" />
            <rect x="5" y="12" width="38" height="25" rx="3.5" fill={fillBody} stroke={t.strokeMain} strokeWidth={sw} />
            <rect x="9" y="16" width="30" height="16" rx="2" fill={fillSub} stroke={t.strokeAccent} strokeWidth={1.2} />
            <circle cx="24" cy="24" r="3.5" fill={fillBody} stroke={t.strokeAccent} strokeWidth={1.5} />
            <path d="M17 37H31" stroke={t.strokeMain} strokeWidth={sw} strokeLinecap="round" />
          </g>
        );
      case 5: // Satellite TV Screen & Receiver Stand
        return (
          <g>
            <path d="M13 7L21 14M35 7L27 14" fill="none" stroke={t.strokeAccent} strokeWidth={sw + 0.3} strokeLinecap="round" />
            <rect x="7" y="14" width="34" height="22" rx="4" fill={fillBody} stroke={t.strokeMain} strokeWidth={sw} />
            <rect x="11" y="18" width="22" height="13" rx="2" fill={t.isMonoline ? 'none' : t.fillDark} stroke={t.strokeAccent} strokeWidth={1.2} />
            <circle cx="36" cy="24" r="2" fill={t.fillAccent} />
            <path d="M16 36H32" stroke={t.strokeMain} strokeWidth={sw} strokeLinecap="round" />
          </g>
        );
      case 6: // Curved Smart TV Monitor with Live Stream Banner
        return (
          <g>
            <path d="M16 6L24 13L32 6" fill="none" stroke={t.strokeAccent} strokeWidth={sw + 0.4} strokeLinecap="round" />
            <path d="M5 15C5 13 10 12 24 12C38 12 43 13 43 15V33C43 35 38 36 24 36C10 36 5 35 5 33V15Z" fill={fillBody} stroke={t.strokeMain} strokeWidth={sw} />
            <rect x="9" y="17" width="30" height="15" rx="2" fill={fillSub} stroke={t.strokeAccent} strokeWidth={1.2} />
            <path d="M17 36H31" stroke={t.strokeMain} strokeWidth={sw} strokeLinecap="round" />
          </g>
        );
      case 7: // Classic Studio TV Screen with Top Antenna & Play Button
      default:
        return (
          <g>
            <path d="M16 6L24 13L32 6" fill="none" stroke={t.strokeAccent} strokeWidth={sw + 0.4} strokeLinecap="round" strokeLinejoin="round" />
            <rect x="5" y="13" width="38" height="24" rx="4" fill={fillBody} stroke={t.strokeMain} strokeWidth={sw} />
            <rect x="9" y="17" width="22" height="16" rx="2" fill={t.isMonoline ? 'none' : t.fillDark} stroke={t.strokeAccent} strokeWidth={1.2} />
            <circle cx="36" cy="20" r="1.8" fill={t.fillAccent} />
            <circle cx="36" cy="26" r="1.8" fill={t.fillAccent} />
            <path d="M14 25L17 21L20 27L23 21L26 25" fill="none" stroke={t.strokeAccent} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
            <path d="M16 37H32" stroke={t.strokeMain} strokeWidth={sw} strokeLinecap="round" />
          </g>
        );
    }
  }

  // =========================================================================
  // MOVIES (Cinema Camera / Clapperboard / Filmstrip / Megaphone / Aperture Gate / Ticket / Spool / Stage Curtain)
  // =========================================================================
  if (kind === 'movies') {
    switch (variant % 8) {
      case 0: // Classic Twin-Reel Cinema Camera
        return (
          <g>
            <rect x="6" y="17" width="26" height="20" rx="4" fill={fillBody} stroke={t.strokeMain} strokeWidth={sw} />
            <circle cx="13" cy="11" r="5.5" fill={fillSub} stroke={t.strokeAccent} strokeWidth={sw * 0.9} />
            <circle cx="25.5" cy="11" r="5.5" fill={fillSub} stroke={t.strokeAccent} strokeWidth={sw * 0.9} />
            <circle cx="13" cy="11" r="1.9" fill={t.fillDark} />
            <circle cx="25.5" cy="11" r="1.9" fill={t.fillDark} />
            <path d="M32 22L42 17V34L32 29V22Z" fill={fillSub} stroke={t.strokeMain} strokeWidth={sw} strokeLinejoin="round" />
            <polygon points="16,22.5 23.5,27 16,31.5" fill={t.isMonoline ? 'none' : t.fillDark} stroke={t.strokeAccent} strokeWidth={1.3} />
          </g>
        );
      case 1: // Hinged Director Clapperboard
        return (
          <g>
            <rect x="7" y="17" width="34" height="23" rx="4" fill={fillBody} stroke={t.strokeMain} strokeWidth={sw} />
            <path d="M7 17L38 9L40 14.5L9 22.5L7 17Z" fill={fillSub} stroke={t.strokeAccent} strokeWidth={sw * 0.9} strokeLinejoin="round" />
            <path d="M15 15L18 20M25 12.5L28 17.5M34 10L37 15" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.8" />
            <polygon points="20,23 30,28.5 20,34" fill={t.isMonoline ? 'none' : t.fillAccent} stroke={t.strokeAccent} strokeWidth={1.5} />
          </g>
        );
      case 2: // Perforated Filmstrip Frame
        return (
          <g>
            <rect x="6" y="10" width="36" height="28" rx="4" fill={fillSub} stroke={t.strokeMain} strokeWidth={sw} />
            <line x1="12.5" y1="10" x2="12.5" y2="38" stroke={t.strokeAccent} strokeWidth="1.6" />
            <line x1="35.5" y1="10" x2="35.5" y2="38" stroke={t.strokeAccent} strokeWidth="1.6" />
            <rect x="8" y="13.5" width="2.8" height="3.2" rx="0.6" fill={t.fillAccent} />
            <rect x="8" y="22.4" width="2.8" height="3.2" rx="0.6" fill={t.fillAccent} />
            <rect x="8" y="31.3" width="2.8" height="3.2" rx="0.6" fill={t.fillAccent} />
            <rect x="37.2" y="13.5" width="2.8" height="3.2" rx="0.6" fill={t.fillAccent} />
            <rect x="37.2" y="22.4" width="2.8" height="3.2" rx="0.6" fill={t.fillAccent} />
            <rect x="37.2" y="31.3" width="2.8" height="3.2" rx="0.6" fill={t.fillAccent} />
            <polygon points="20,18.5 30,24 20,29.5" fill={fillBody} stroke={t.strokeAccent} strokeWidth={1.3} />
          </g>
        );
      case 3: // Cinema Megaphone / Bullhorn
        return (
          <g>
            <path d="M10 21L33 11V35L10 25V21Z" fill={fillBody} stroke={t.strokeMain} strokeWidth={sw} strokeLinejoin="round" />
            <path d="M15 27L19 38H24L20 29" fill={fillSub} stroke={t.strokeMain} strokeWidth={sw} strokeLinejoin="round" />
            <ellipse cx="34.5" cy="23" rx="3" ry="12" fill={fillSub} stroke={t.strokeAccent} strokeWidth={sw * 0.85} />
            <path d="M41 18L44 16M41.5 23H45M41 28L44 30" stroke={t.strokeAccent} strokeWidth={sw} strokeLinecap="round" />
          </g>
        );
      case 4: // Architectural Chamfered Aperture Screen
        return (
          <g>
            <polygon points="7,10 41,10 41,33 34,39 7,39" fill={fillSub} stroke={t.strokeMain} strokeWidth={sw} strokeLinejoin="miter" />
            <polygon points="7,10 41,10 41,16.5 7,16.5" fill={fillBody} opacity="0.85" />
            <path d="M15 10L11 16.5M25 10L21 16.5M35 10L31 16.5" stroke={t.strokeAccent} strokeWidth="2.2" />
            <polygon points="20,21.5 31,27.5 20,33.5" fill={fillBody} stroke={t.strokeAccent} strokeWidth={1.4} />
          </g>
        );
      case 5: // VIP Premiere Cinema Ticket Stub
        return (
          <g>
            <path
              d="M7 14H41V20.5C39 20.5 37.5 22 37.5 24C37.5 26 39 27.5 41 27.5V34H7V27.5C9 27.5 10.5 26 10.5 24C10.5 22 9 20.5 7 20.5V14Z"
              fill={fillBody}
              stroke={t.strokeMain}
              strokeWidth={sw}
              strokeLinejoin="round"
            />
            <line x1="16" y1="15.5" x2="16" y2="32.5" stroke={t.strokeAccent} strokeWidth="1.5" strokeDasharray="2.5 2.5" />
            <polygon points="28,18.5 29.8,22.2 33.8,22.8 30.9,25.6 31.6,29.5 28,27.6 24.4,29.5 25.1,25.6 22.2,22.8 26.2,22.2" fill={t.isMonoline ? 'none' : t.fillAccent} stroke={t.strokeAccent} strokeWidth="1.2" />
          </g>
        );
      case 6: // Spinning Cinema Film Reel Spool
        return (
          <g>
            <circle cx="24" cy="23" r="15.5" fill={fillBody} stroke={t.strokeMain} strokeWidth={sw} />
            <circle cx="24" cy="14" r="3" fill={t.fillDark} stroke={t.strokeAccent} strokeWidth="1.2" />
            <circle cx="24" cy="32" r="3" fill={t.fillDark} stroke={t.strokeAccent} strokeWidth="1.2" />
            <circle cx="15" cy="23" r="3" fill={t.fillDark} stroke={t.strokeAccent} strokeWidth="1.2" />
            <circle cx="33" cy="23" r="3" fill={t.fillDark} stroke={t.strokeAccent} strokeWidth="1.2" />
            <circle cx="24" cy="23" r="2.8" fill={t.fillAccent} />
            <path d="M24 38.5H41" stroke={t.strokeMain} strokeWidth={sw + 0.5} strokeLinecap="round" />
          </g>
        );
      case 7: // Theater Curtain & Center Screen
      default:
        return (
          <g>
            <rect x="6" y="10" width="36" height="27" rx="3.5" fill={fillSub} stroke={t.strokeMain} strokeWidth={sw} />
            <path d="M6 10C12 14 14 23 11 37H6V10Z" fill={fillBody} opacity="0.9" />
            <path d="M42 10C36 14 34 23 37 37H42V10Z" fill={fillBody} opacity="0.9" />
            <polygon points="20.5,18 30,23.5 20.5,29" fill={t.isMonoline ? 'none' : t.fillAccent} stroke={t.strokeAccent} strokeWidth={1.5} />
          </g>
        );
    }
  }

  // =========================================================================
  // SERIES (3D Stack / Fan Deck / Multi-Tier / Isometric Parallelogram / Antenna Multi-Screen / Binder / Vertical Strip / Split Console)
  // =========================================================================
  if (kind === 'series') {
    switch (variant % 8) {
      case 0: // Triple Receding Screens + Pedestal
        return (
          <g>
            <rect x="14" y="7" width="27" height="19" rx="3.5" fill={fillSub} opacity="0.65" stroke={t.strokeAccent} strokeWidth={1.3} />
            <rect x="10" y="11" width="27" height="19" rx="3.5" fill={fillSub} stroke={t.strokeAccent} strokeWidth={1.5} />
            <rect x="6" y="15.5" width="28" height="21" rx="4" fill={fillBody} stroke={t.strokeMain} strokeWidth={sw} />
            <rect x="9" y="18.5" width="22" height="14" rx="2.2" fill={t.isMonoline ? 'none' : t.fillDark} />
            <polygon points="17.5,21.8 25,25.5 17.5,29.2" fill={t.isMonoline ? 'none' : t.fillAccent} stroke={t.strokeAccent} strokeWidth={1.3} />
            <path d="M15 40.5H25L26.5 36.5H13.5L15 40.5Z" fill={fillBody} />
          </g>
        );
      case 1: // Diagonal Fan Deck of Episode Cards
        return (
          <g>
            <rect x="13" y="9" width="23" height="29" rx="3.5" transform="rotate(9 24 24)" fill={fillSub} stroke={t.strokeAccent} strokeWidth={1.5} />
            <rect x="11" y="9" width="23" height="29" rx="3.5" transform="rotate(-7 24 24)" fill={fillSub} stroke={t.strokeAccent} strokeWidth={1.5} />
            <rect x="12" y="10" width="24" height="29" rx="4" fill={fillBody} stroke={t.strokeMain} strokeWidth={sw} />
            <polygon points="21,20 29,24.5 21,29" fill={t.isMonoline ? 'none' : t.fillDark} stroke={t.strokeAccent} strokeWidth={1.5} />
          </g>
        );
      case 2: // Episode Stack Ribbon Shelf
        return (
          <g>
            <path d="M12 9H36" stroke={t.strokeAccent} strokeWidth={sw + 0.5} strokeLinecap="round" />
            <path d="M9 13.5H39" stroke={t.strokeMain} strokeWidth={sw + 0.5} strokeLinecap="round" />
            <rect x="6" y="18" width="36" height="21" rx="3.8" fill={fillSub} stroke={t.strokeMain} strokeWidth={sw} />
            <rect x="9.5" y="21.5" width="29" height="14" rx="2" fill={fillBody} opacity="0.28" stroke={t.strokeAccent} strokeWidth="1" />
            <polygon points="21,24.5 29.5,28.5 21,32.5" fill={fillBody} stroke={t.strokeAccent} strokeWidth={1.3} />
          </g>
        );
      case 3: // Stepped Isometric Parallelogram Cascade
        return (
          <g>
            <polygon points="15,7 41,7 37,25 11,25" fill={fillSub} opacity="0.7" stroke={t.strokeAccent} strokeWidth={1.4} />
            <polygon points="11,13 37,13 33,32 7,32" fill={fillSub} stroke={t.strokeAccent} strokeWidth={1.8} />
            <polygon points="6,20 32,20 28,39 2,39" fill={fillBody} stroke={t.strokeMain} strokeWidth={sw} />
            <polygon points="15,25.5 23,29.5 15,33.5" fill={t.isMonoline ? 'none' : t.fillDark} stroke={t.strokeAccent} strokeWidth={1.3} />
          </g>
        );
      case 4: // Quad Chapter Tile Grid Monitor
        return (
          <g>
            <rect x="7" y="9" width="15" height="13" rx="3" fill={fillBody} stroke={t.strokeMain} strokeWidth={sw} />
            <rect x="26" y="9" width="15" height="13" rx="3" fill={fillSub} stroke={t.strokeAccent} strokeWidth={sw} />
            <rect x="7" y="26" width="15" height="13" rx="3" fill={fillSub} stroke={t.strokeAccent} strokeWidth={sw} />
            <rect x="26" y="26" width="15" height="13" rx="3" fill={fillBody} stroke={t.strokeMain} strokeWidth={sw} />
            <polygon points="12.5,12.5 18,15.5 12.5,18.5" fill={t.fillDark} />
          </g>
        );
      case 5: // Widescreen Binder & Season Bookmarks
        return (
          <g>
            <rect x="7" y="13" width="34" height="26" rx="4" fill={fillBody} stroke={t.strokeMain} strokeWidth={sw} />
            <path d="M12 13V8.5C12 7.7 12.7 7 13.5 7H22C22.8 7 23.5 7.7 23.5 8.5V13" fill={fillSub} stroke={t.strokeAccent} strokeWidth={sw * 0.85} />
            <path d="M25.5 13V9.5C25.5 8.7 26.2 8 27 8H34C34.8 8 35.5 8.7 35.5 9.5V13" fill={fillSub} stroke={t.strokeAccent} strokeWidth={sw * 0.85} />
            <line x1="13" y1="21" x2="35" y2="21" stroke={t.strokeAccent} strokeWidth="2.2" strokeLinecap="round" />
            <polygon points="21,25 29,29.5 21,34" fill={t.isMonoline ? 'none' : t.fillDark} stroke={t.strokeAccent} strokeWidth={1.3} />
          </g>
        );
      case 6: // Vertical Series Reel Window
        return (
          <g>
            <rect x="11" y="6" width="26" height="36" rx="4.5" fill={fillSub} stroke={t.strokeMain} strokeWidth={sw} />
            <line x1="11" y1="15" x2="37" y2="15" stroke={t.strokeAccent} strokeWidth="1.6" />
            <line x1="11" y1="33" x2="37" y2="33" stroke={t.strokeAccent} strokeWidth="1.6" />
            <rect x="14.5" y="18" width="19" height="12" rx="2" fill={fillBody} stroke={t.strokeAccent} strokeWidth="1.2" />
            <polygon points="22,21.5 28,24 22,26.5" fill={t.fillDark} />
          </g>
        );
      case 7: // Split Console Dual Screen
      default:
        return (
          <g>
            <rect x="6" y="11" width="22" height="26" rx="4" fill={fillBody} stroke={t.strokeMain} strokeWidth={sw} />
            <rect x="31" y="11" width="11" height="11" rx="2.5" fill={fillSub} stroke={t.strokeAccent} strokeWidth={sw * 0.85} />
            <rect x="31" y="26" width="11" height="11" rx="2.5" fill={fillSub} stroke={t.strokeAccent} strokeWidth={sw * 0.85} />
            <polygon points="14,19 22,24 14,29" fill={t.isMonoline ? 'none' : t.fillDark} stroke={t.strokeAccent} strokeWidth={1.4} />
          </g>
        );
    }
  }

  // =========================================================================
  // PLAYLIST (Queue Bars + Orb / Document Sheet / Folder Stack / Architectural Chamfer / Server Rack / Index Deck / Ribbon Page / Stair List)
  // =========================================================================
  if (kind === 'add') {
    switch (variant % 8) {
      case 0: // Rounded Queue Bars + Floating Action Orb
        return (
          <g>
            <rect x="6" y="10" width="28" height="6" rx="2.5" fill={fillBody} stroke={t.strokeMain} strokeWidth={t.isMonoline ? sw : 1} />
            <rect x="6" y="19.5" width="23" height="6" rx="2.5" fill={fillBody} stroke={t.strokeMain} strokeWidth={t.isMonoline ? sw : 1} />
            <rect x="6" y="29" width="19" height="6" rx="2.5" fill={fillSub} stroke={t.strokeAccent} strokeWidth={t.isMonoline ? sw : 1} />
            <circle cx="34.5" cy="31" r="8.2" fill={fillBody} stroke={t.strokeMain} strokeWidth={sw * 0.9} />
            <path d="M34.5 27V35M30.5 31H38.5" stroke={t.isMonoline ? t.strokeAccent : '#0A0D14'} strokeWidth="2.6" strokeLinecap="round" />
          </g>
        );
      case 1: // Frosted / Ruled Playlist Document Sheet + Orb
        return (
          <g>
            <rect x="7" y="8" width="27" height="30" rx="4.5" fill={fillSub} stroke={t.strokeMain} strokeWidth={sw} />
            <path d="M12 16H28M12 22.5H24M12 29H20" stroke={t.strokeAccent} strokeWidth="2.4" strokeLinecap="round" />
            <circle cx="34.5" cy="32" r="8" fill={fillBody} stroke={t.strokeMain} strokeWidth={sw * 0.85} />
            <path d="M34.5 28V36M30.5 32H38.5" stroke={t.isMonoline ? t.strokeAccent : '#0A0D14'} strokeWidth="2.3" strokeLinecap="round" />
          </g>
        );
      case 2: // Playlist Folder Archive + Tab
        return (
          <g>
            <path d="M6 12C6 10.3 7.3 9 9 9H18L21.5 13H39C40.7 13 42 14.3 42 16V35C42 36.7 40.7 38 39 38H9C7.3 38 6 36.7 6 35V12Z" fill={fillSub} stroke={t.strokeMain} strokeWidth={sw} strokeLinejoin="round" />
            <path d="M13 22H29M13 28H24" stroke={t.strokeAccent} strokeWidth="2.4" strokeLinecap="round" />
            <circle cx="33.5" cy="27" r="4.5" fill={fillBody} stroke={t.strokeAccent} strokeWidth="1.2" />
            <path d="M33.5 24.8V29.2M31.3 27H35.7" stroke="#090B10" strokeWidth="1.8" strokeLinecap="round" />
          </g>
        );
      case 3: // Chamfered Architectural Grid + Diamond Plus Node
        return (
          <g>
            <polygon points="6,10 34,10 31,15 6,15" fill={fillBody} stroke={t.strokeMain} strokeWidth={t.isMonoline ? sw : 0.8} />
            <polygon points="6,20 29,20 26,25 6,25" fill={fillSub} stroke={t.strokeAccent} strokeWidth={t.isMonoline ? sw : 0.8} />
            <polygon points="6,30 23,30 20,35 6,35" fill={fillBody} opacity="0.7" />
            <polygon points="34,21 43,30 34,39 25,30" fill={fillBody} stroke={t.strokeMain} strokeWidth={1.4} />
            <path d="M34 26V34M30 30H38" stroke="#090B10" strokeWidth="2.3" />
          </g>
        );
      case 4: // Channel Server Stream Stack
        return (
          <g>
            <rect x="7" y="8" width="34" height="9" rx="2.5" fill={fillBody} stroke={t.strokeMain} strokeWidth={sw * 0.85} />
            <rect x="7" y="19.5" width="34" height="9" rx="2.5" fill={fillSub} stroke={t.strokeAccent} strokeWidth={sw * 0.85} />
            <rect x="7" y="31" width="34" height="9" rx="2.5" fill={fillBody} stroke={t.strokeMain} strokeWidth={sw * 0.85} />
            <circle cx="12" cy="12.5" r="1.6" fill={t.fillAccent} />
            <circle cx="12" cy="24" r="1.6" fill={t.fillAccent} />
            <circle cx="12" cy="35.5" r="1.6" fill={t.fillAccent} />
            <path d="M31 12.5H36M31 24H36M31 35.5H36" stroke={t.strokeAccent} strokeWidth="1.8" strokeLinecap="round" />
          </g>
        );
      case 5: // Binder Index Queue Cards
        return (
          <g>
            <rect x="9" y="11" width="30" height="29" rx="4" fill={fillSub} stroke={t.strokeMain} strokeWidth={sw} />
            <path d="M16 7V13M24 7V13M32 7V13" stroke={t.strokeAccent} strokeWidth={sw + 0.5} strokeLinecap="round" />
            <path d="M15 21H33M15 27H29M15 33H24" stroke={t.strokeAccent} strokeWidth="2.4" strokeLinecap="round" />
          </g>
        );
      case 6: // Folded Corner M3U Note + Play Queue
        return (
          <g>
            <polygon points="9,7 31,7 39,15 39,40 9,40" fill={fillSub} stroke={t.strokeMain} strokeWidth={sw} strokeLinejoin="round" />
            <polyline points="31,7 31,15 39,15" fill={fillBody} stroke={t.strokeAccent} strokeWidth="1.5" />
            <path d="M15 21H33M15 27H27" stroke={t.strokeAccent} strokeWidth="2.2" strokeLinecap="round" />
            <polygon points="29,29 36,33 29,37" fill={fillBody} stroke={t.strokeAccent} strokeWidth="1.2" />
          </g>
        );
      case 7: // Stepped Play Queue Checklist
      default:
        return (
          <g>
            <circle cx="10" cy="13" r="2.8" fill={fillBody} stroke={t.strokeAccent} strokeWidth="1.2" />
            <circle cx="10" cy="24" r="2.8" fill={fillBody} stroke={t.strokeAccent} strokeWidth="1.2" />
            <circle cx="10" cy="35" r="2.8" fill={fillSub} stroke={t.strokeMain} strokeWidth="1.2" />
            <path d="M17 13H40M17 24H37M17 35H28" stroke={t.strokeMain} strokeWidth={sw + 0.7} strokeLinecap="round" />
            <circle cx="35.5" cy="34.5" r="6" fill={fillBody} stroke={t.strokeAccent} strokeWidth="1.4" />
            <path d="M35.5 31.8V37.2M32.8 34.5H38.2" stroke="#090B10" strokeWidth="1.8" strokeLinecap="round" />
          </g>
        );
    }
  }

  // =========================================================================
  // SETTINGS (Sculpted 8-Tooth Gear / Concentric Equalizer / Chronometer Dial / Octagonal Caliper / Mixer Faders / Wrench & Caliper / Vault Wheel / Gyroscope Hub)
  // =========================================================================
  switch (variant % 8) {
    case 0: // 8-Tooth Crown Gear
      return (
        <g>
          <path
            d="M21 6H27L28.2 10.2C29.4 10.6 30.5 11.2 31.5 12L35.4 10L39.6 14.2L37.6 18.1C38.4 19.1 39 20.2 39.4 21.4L43.5 22.6V28.6L39.4 29.8C39 31 38.4 32.1 37.6 33.1L39.6 37L35.4 41.2L31.5 39.2C30.5 40 29.4 40.6 28.2 41L27 45H21L19.8 41C18.6 40.6 17.5 40 16.5 39.2L12.6 41.2L8.4 37L10.4 33.1C9.6 32.1 9 31 8.6 29.8L4.5 28.6V22.6L8.6 21.4C9 20.2 9.6 19.1 10.4 18.1L8.4 14.2L12.6 10L16.5 12C17.5 11.2 18.6 10.6 19.8 10.2L21 6Z"
            fill={fillBody}
            stroke={t.strokeMain}
            strokeWidth={sw}
            strokeLinejoin="round"
          />
          <circle cx="24" cy="25.5" r="7.2" fill={t.isMonoline ? 'none' : t.fillDark} stroke={t.strokeAccent} strokeWidth={1.6} />
          <circle cx="24" cy="25.5" r="3" fill={t.fillAccent} />
        </g>
      );
    case 1: // Concentric Equalizer Control Ring
      return (
        <g>
          <circle cx="24" cy="24" r="17.5" fill={fillSub} stroke={t.strokeMain} strokeWidth={sw} />
          <circle cx="24" cy="24" r="11.5" fill="none" stroke={t.strokeAccent} strokeWidth="1.2" strokeDasharray="3.5 3.5" />
          <line x1="14.5" y1="19.5" x2="33.5" y2="19.5" stroke={t.strokeAccent} strokeWidth={sw} strokeLinecap="round" />
          <circle cx="20" cy="19.5" r="3" fill={fillBody} stroke="#FFFFFF" strokeWidth="1.3" />
          <line x1="14.5" y1="28.5" x2="33.5" y2="28.5" stroke={t.strokeAccent} strokeWidth={sw} strokeLinecap="round" />
          <circle cx="28.5" cy="28.5" r="3" fill={fillBody} stroke="#FFFFFF" strokeWidth="1.3" />
        </g>
      );
    case 2: // Chronometer Dial Gear with 8 Radial Spokes
      return (
        <g>
          <circle cx="24" cy="24" r="14" fill="none" stroke={t.strokeMain} strokeWidth={sw + 0.8} />
          <circle cx="24" cy="24" r="8" fill={fillSub} stroke={t.strokeAccent} strokeWidth="1.6" />
          <path
            d="M24 5.5V10M24 38V42.5M5.5 24H10M38 24H42.5M10.9 10.9L14.2 14.2M33.8 33.8L37.1 37.1M37.1 10.9L33.8 14.2M14.2 33.8L10.9 37.1"
            stroke={t.strokeMain}
            strokeWidth={sw + 0.8}
            strokeLinecap="round"
          />
          <circle cx="24" cy="24" r="3.4" fill={fillBody} />
        </g>
      );
    case 3: // Octagonal Industrial Caliper Chassis
      return (
        <g>
          <polygon points="16,5 32,5 43,16 43,32 32,43 16,43 5,32 5,16" fill={fillSub} stroke={t.strokeMain} strokeWidth={sw} />
          <polygon points="24,13 35,24 24,35 13,24" fill="none" stroke={t.strokeAccent} strokeWidth={sw * 0.9} />
          <rect x="20.5" y="20.5" width="7" height="7" fill={fillBody} stroke="#FFFFFF" strokeWidth="1" />
        </g>
      );
    case 4: // 3-Channel Vertical Studio Faders
      return (
        <g>
          <line x1="12" y1="8" x2="12" y2="40" stroke={t.strokeMain} strokeWidth={sw + 0.4} strokeLinecap="round" />
          <line x1="24" y1="8" x2="24" y2="40" stroke={t.strokeMain} strokeWidth={sw + 0.4} strokeLinecap="round" />
          <line x1="36" y1="8" x2="36" y2="40" stroke={t.strokeMain} strokeWidth={sw + 0.4} strokeLinecap="round" />
          <rect x="8.5" y="13" width="7" height="5.5" rx="1.8" fill={fillBody} stroke={t.strokeAccent} strokeWidth="1.4" />
          <rect x="20.5" y="28" width="7" height="5.5" rx="1.8" fill={fillBody} stroke={t.strokeAccent} strokeWidth="1.4" />
          <rect x="32.5" y="17" width="7" height="5.5" rx="1.8" fill={fillBody} stroke={t.strokeAccent} strokeWidth="1.4" />
        </g>
      );
    case 5: // Diagonal Wrench & Screwdriver Precision Tools
      return (
        <g>
          <path d="M13 35L28 20L32 13L38 11L35 17L39 20L32 23L17 38C15.5 39.5 13 39.5 11.5 38C10 36.5 10 34 11.5 32.5" fill={fillBody} stroke={t.strokeMain} strokeWidth={sw * 0.9} strokeLinejoin="round" />
          <path d="M12 10L17 15M15 20L35 37" fill="none" stroke={t.strokeAccent} strokeWidth={sw + 0.5} strokeLinecap="round" />
          <circle cx="14" cy="36" r="1.5" fill={t.fillDark} />
        </g>
      );
    case 6: // Hexagonal Control Vault Wheel
      return (
        <g>
          <polygon points="24,5 41,14.5 41,33.5 24,43 7,33.5 7,14.5" fill={fillSub} stroke={t.strokeMain} strokeWidth={sw} strokeLinejoin="round" />
          <circle cx="24" cy="24" r="7.5" fill={fillBody} stroke={t.strokeAccent} strokeWidth="1.6" />
          <path d="M24 10V16.5M24 31.5V38M12 17L17.5 20.5M30.5 27.5L36 31" stroke={t.strokeAccent} strokeWidth="2" strokeLinecap="round" />
        </g>
      );
    case 7: // Orbital Gyroscope Calibration Hub
    default:
      return (
        <g>
          <ellipse cx="24" cy="24" rx="18" ry="8" transform="rotate(-35 24 24)" fill="none" stroke={t.strokeMain} strokeWidth={sw} />
          <ellipse cx="24" cy="24" rx="18" ry="8" transform="rotate(35 24 24)" fill="none" stroke={t.strokeAccent} strokeWidth={sw} />
          <circle cx="24" cy="24" r="5" fill={fillBody} stroke="#FFFFFF" strokeWidth="1.4" />
        </g>
      );
  }
}

/**
 * Renders any of the 40 distinct Icon Art Packs cleanly using unique useId() defs.
 */
export function PackIconSvg({
  kind,
  pack,
  sizePx = 42,
  className = '',
}: {
  kind: SectionIconKind;
  pack: IconPackId;
  sizePx?: number;
  className?: string;
}) {
  const rawId = useId().replace(/:/g, '');
  const gMain = `gMain_${rawId}`;
  const gSub = `gSub_${rawId}`;
  const gGlass = `gGl_${rawId}`;
  const gHolo = `gHo_${rawId}`;
  const fNeon = `fNe_${rawId}`;

  const normId = normalizeIconPackId(pack);
  const idx = PACK_INDEX_MAP[normId] ?? 0;
  const finishBucket = idx % 5; // 0:3D Volumetric, 1:Frosted Glass, 2:Luxury Metallic, 3:Electric Neon, 4:Bauhaus Geometric
  const variant = Math.floor(idx / 5); // 0..7 distinct geometric silhouettes per category

  // Pack-specific decorative accent so every single index 0..39 has its own signature detail
  const badgeOverlay: GlyphStyleTokens['badgeOverlay'] =
    idx === 27 ? 'crest'
    : idx === 28 ? 'plasma'
    : idx === 29 ? 'pixel'
    : idx === 30 ? 'slab'
    : idx === 32 ? 'coin'
    : idx === 33 ? 'holo'
    : idx === 38 ? 'hud'
    : idx === 39 ? 'deco'
    : 'none';

  const isMonoline = idx === 24;
  const isStencil = idx === 19 || idx === 23;
  const isDuotone = idx === 14 || idx === 34 || idx === 35;

  const tokens: GlyphStyleTokens = (() => {
    if (finishBucket === 0) {
      // 3D DIMENSIONAL / CLAY / ORIGAMI / LASER SLAB
      return {
        fillPrimary: idx === 30 ? '#111622' : `url(#${gMain})`,
        fillSecondary: `url(#${gSub})`,
        fillAccent: 'var(--theme-accent, #F5E6A8)',
        fillGlass: `url(#${gGlass})`,
        fillDark: '#0C0F18',
        strokeMain: idx === 30 ? 'var(--theme-primary, #D4AF37)' : 'var(--theme-accent, #F5E6A8)',
        strokeAccent: '#FFFFFF',
        strokeW: idx === 20 ? 2.4 : 1.7,
        badgeOverlay,
      };
    }
    if (finishBucket === 1) {
      // FROSTED CRYSTAL GLASS / PRISM / HEX GLASS
      return {
        fillPrimary: `url(#${gGlass})`,
        fillSecondary: 'rgba(255,255,255,0.14)',
        fillAccent: '#FFFFFF',
        fillGlass: `url(#${gGlass})`,
        fillDark: 'rgba(10,14,24,0.65)',
        strokeMain: idx === 26 ? 'var(--theme-primary, #D4AF37)' : 'rgba(255,255,255,0.88)',
        strokeAccent: 'var(--theme-accent, #F5E6A8)',
        strokeW: idx === 31 ? 2.2 : 1.8,
        badgeOverlay,
      };
    }
    if (finishBucket === 2) {
      // METALLIC BULLION / CHROME / STEEL / TITANIUM
      return {
        fillPrimary: idx === 12 ? '#12151E' : `url(#${gMain})`,
        fillSecondary: idx === 12 ? `url(#${gSub})` : `url(#${gSub})`,
        fillAccent: 'var(--theme-accent, #F5E6A8)',
        fillGlass: `url(#${gGlass})`,
        fillDark: '#120E04',
        strokeMain: idx === 37 ? '#CBD5E1' : 'var(--theme-accent, #F5E6A8)',
        strokeAccent: '#FFFFFF',
        strokeW: idx === 17 ? 2.5 : 1.9,
        badgeOverlay,
      };
    }
    if (finishBucket === 3) {
      // ELECTRIC NEON / ARCADE / LASER / CYBER GLITCH / HUD
      return {
        fillPrimary: 'rgba(255,255,255,0.06)',
        fillSecondary: 'rgba(0,0,0,0.45)',
        fillAccent: '#FFFFFF',
        fillGlass: `url(#${gGlass})`,
        fillDark: '#05070B',
        strokeMain: idx === 33 ? `url(#${gHolo})` : 'var(--theme-primary, #D4AF37)',
        strokeAccent: '#FFFFFF',
        strokeW: idx === 8 ? 3 : idx === 13 ? 1.4 : 2.1,
        isNeon: true,
        isStencil,
        badgeOverlay,
      };
    }
    // GEOMETRIC / SWISS / BLUEPRINT / MONOLINE / PIXEL / ART DECO
    return {
      fillPrimary: isDuotone ? 'var(--theme-primary, #D4AF37)' : 'var(--theme-primary, #D4AF37)',
      fillSecondary: isDuotone ? 'var(--theme-accent, #F5E6A8)' : 'var(--theme-secondary, #8C6A1D)',
      fillAccent: 'var(--theme-accent, #F5E6A8)',
      fillGlass: `url(#${gGlass})`,
      fillDark: '#090C14',
      strokeMain: isMonoline ? 'var(--theme-accent, #F5E6A8)' : 'var(--theme-primary, #D4AF37)',
      strokeAccent: 'var(--theme-accent, #F5E6A8)',
      strokeW: isMonoline ? 1.35 : idx === 9 ? 1.8 : 2.2,
      isMonoline,
      isStencil,
      isDuotone,
      badgeOverlay,
    };
  })();

  const filterCss = tokens.isNeon
    ? 'drop-shadow(0 0 8px var(--theme-glow, rgba(212,175,55,0.65)))'
    : idx === 35
    ? 'drop-shadow(0 8px 12px rgba(0,0,0,0.72))'
    : 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))';

  return (
    <svg
      viewBox="0 0 48 48"
      width={sizePx}
      height={sizePx}
      className={`shrink-0 select-none overflow-visible ${className}`}
      style={{ filter: filterCss }}
    >
      <defs>
        <linearGradient id={gMain} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--theme-accent, #F5E6A8)" />
          <stop offset="48%" stopColor="var(--theme-primary, #D4AF37)" />
          <stop offset="100%" stopColor="var(--theme-secondary, #8C6A1D)" />
        </linearGradient>
        <linearGradient id={gSub} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="var(--theme-secondary, #8C6A1D)" />
          <stop offset="55%" stopColor="var(--theme-primary, #D4AF37)" />
          <stop offset="100%" stopColor="var(--theme-accent, #F5E6A8)" />
        </linearGradient>
        <linearGradient id={gGlass} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.56" />
          <stop offset="45%" stopColor="var(--theme-primary, #D4AF37)" stopOpacity="0.32" />
          <stop offset="100%" stopColor="var(--theme-secondary, #8C6A1D)" stopOpacity="0.18" />
        </linearGradient>
        <linearGradient id={gHolo} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="var(--theme-accent, #F5E6A8)" />
          <stop offset="50%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="var(--theme-primary, #D4AF37)" />
        </linearGradient>
        <filter id={fNeon} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="1.4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Pack-specific Emblem Backplates & Framing Accents */}
      {badgeOverlay === 'crest' && (
        <path
          d="M8 5H40V25C40 36 31 43 24 46C17 43 8 36 8 25V5Z"
          fill="rgba(12,14,20,0.65)"
          stroke={`url(#${gMain})`}
          strokeWidth="1.6"
        />
      )}
      {badgeOverlay === 'coin' && (
        <circle
          cx="24"
          cy="24"
          r="21.5"
          fill="rgba(16,13,6,0.55)"
          stroke={`url(#${gMain})`}
          strokeWidth="2"
          strokeDasharray="3 1.5"
        />
      )}
      {badgeOverlay === 'slab' && (
        <rect
          x="3"
          y="3"
          width="42"
          height="42"
          rx="9"
          fill="#0D111A"
          stroke="var(--theme-primary, #D4AF37)"
          strokeWidth="1.5"
        />
      )}
      {badgeOverlay === 'plasma' && (
        <circle cx="24" cy="24" r="18" fill="var(--theme-primary, #D4AF37)" fillOpacity="0.18" />
      )}
      {badgeOverlay === 'pixel' && (
        <g opacity="0.75">
          <rect x="2" y="2" width="4" height="4" fill="var(--theme-accent, #F5E6A8)" />
          <rect x="42" y="2" width="4" height="4" fill="var(--theme-accent, #F5E6A8)" />
          <rect x="2" y="42" width="4" height="4" fill="var(--theme-accent, #F5E6A8)" />
          <rect x="42" y="42" width="4" height="4" fill="var(--theme-accent, #F5E6A8)" />
        </g>
      )}
      {badgeOverlay === 'hud' && (
        <g stroke="var(--theme-primary, #D4AF37)" strokeWidth="1.4" fill="none" opacity="0.85">
          <polyline points="3,11 3,3 11,3" />
          <polyline points="37,3 45,3 45,11" />
          <polyline points="3,37 3,45 11,45" />
          <polyline points="37,45 45,45 45,37" />
        </g>
      )}
      {badgeOverlay === 'deco' && (
        <g stroke={`url(#${gMain})`} strokeWidth="1.4" fill="none" opacity="0.9">
          <path d="M5 13V5H13M35 5H43V13M5 35V43H13M35 43H43V35" />
        </g>
      )}

      {/* Cyberpunk Glitch Ghost Offset layer for pack-19 */}
      {idx === 18 && (
        <g transform="translate(1.8, -1.2)" opacity="0.45">
          {renderSectionSilhouette(kind, variant, {
            ...tokens,
            strokeMain: '#FFFFFF',
            strokeAccent: 'var(--theme-accent, #F5E6A8)',
            fillPrimary: 'none',
            fillSecondary: 'none',
          })}
        </g>
      )}

      {/* Main Sculpted Vector Geometry */}
      <g filter={tokens.isNeon ? `url(#${fNeon})` : undefined}>
        {renderSectionSilhouette(kind, variant, tokens)}
      </g>

      {/* Pack-10 Blueprint Hairline Crosshair */}
      {idx === 9 && (
        <rect
          x="2"
          y="2"
          width="44"
          height="44"
          rx="6"
          fill="none"
          stroke="var(--theme-accent, #F5E6A8)"
          strokeOpacity="0.35"
          strokeWidth="1"
          strokeDasharray="3 3"
        />
      )}
    </svg>
  );
}

/**
 * Renders Option 1 (Icons Only vs With Frames), Option 2 (Any of 40 Icon Packs),
 * and Option 3 (Any of 40 Independent Frame Shapes) combinably with Glass Opacity & Blur!
 */
export function DashboardSectionIcon({
  kind,
  displayMode,
  iconPack,
  frameShape,
  iconScale = 'md',
  frameScale = 'md',
  glassOpacity = 16,
  glassBlur = 10,
  sizeOverridePx,
  frameSizeOverridePx,
  isHero = false,
}: {
  kind: SectionIconKind;
  displayMode: IconDisplayMode;
  iconPack: IconPackId;
  frameShape: FrameShapeId;
  iconScale?: AppSettings['iconScale'];
  frameScale?: AppSettings['frameScale'];
  glassOpacity?: number;
  glassBlur?: number;
  sizeOverridePx?: number;
  frameSizeOverridePx?: number;
  isHero?: boolean;
}) {
  const baseIconPx = sizeOverridePx ?? (ICON_PX_MAP[iconScale || 'md'] || 40);
  const iconPx = isHero ? Math.round(baseIconPx * 1.18) : baseIconPx;
  const resolvedPack = normalizeIconPackId(iconPack);

  // OPTION 1: ICONS ONLY — Zero frames, zero borders, zero background containers
  if (displayMode === 'icons-only') {
    return (
      <div className="flex items-center justify-center bg-transparent border-0 shadow-none transition-transform duration-150 group-hover:scale-110">
        <PackIconSvg kind={kind} pack={resolvedPack} sizePx={iconPx} />
      </div>
    );
  }

  // OPTION 1 + 3: ICONS WITH INDEPENDENT FRAME SHAPE (40 distinct shapes)
  const resolvedShape = normalizeFrameShapeId(frameShape);
  const baseFramePx = frameSizeOverridePx ?? (FRAME_PX_MAP[frameScale || 'md'] || 72);
  const framePx = Math.max(iconPx + 14, isHero ? Math.round(baseFramePx * 1.14) : baseFramePx);
  const alpha = Math.max(0.02, Math.min(0.85, (glassOpacity ?? 16) / 100));
  const blurPx = Math.max(0, Math.min(24, glassBlur ?? 10));
  const innerIconPx = Math.min(iconPx, Math.round(framePx * 0.6));

  const interiorGlassStyle: React.CSSProperties = {
    backgroundColor: `rgba(14, 18, 28, ${Math.min(0.88, alpha + 0.08)})`,
    backdropFilter: blurPx > 0 ? `blur(${blurPx}px)` : undefined,
    WebkitBackdropFilter: blurPx > 0 ? `blur(${blurPx}px)` : undefined,
  };

  const renderSvgFrame = (
    children: React.ReactNode,
    scaleInner = 0.6
  ) => (
    <div
      className="relative flex items-center justify-center shrink-0 transition-transform duration-150 group-hover:scale-105"
      style={{ width: framePx, height: framePx }}
    >
      <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
        <defs>
          <linearGradient id="achourFrameMetal" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--theme-secondary, #8C6A1D)" />
            <stop offset="35%" stopColor="var(--theme-primary, #D4AF37)" />
            <stop offset="60%" stopColor="var(--theme-accent, #F5E6A8)" />
            <stop offset="100%" stopColor="var(--theme-secondary, #8C6A1D)" />
          </linearGradient>
        </defs>
        {children}
      </svg>
      <div className="relative z-10 flex items-center justify-center">
        <PackIconSvg
          kind={kind}
          pack={resolvedPack}
          sizePx={Math.min(iconPx, Math.round(framePx * scaleInner))}
        />
      </div>
    </div>
  );

  // SVG Geometric Frames (All crisp and responsive)
  switch (resolvedShape) {
    case 'hexagon':
      return renderSvgFrame(
        <>
          <polygon
            points="50,3 93,26 93,74 50,97 7,74 7,26"
            fill={`rgba(14, 18, 28, ${alpha})`}
            stroke="var(--theme-primary, #D4AF37)"
            strokeWidth="3.2"
          />
          <polygon
            points="50,9 87,29 87,71 50,91 13,71 13,29"
            fill="none"
            stroke="var(--theme-accent, #F5E6A8)"
            strokeOpacity="0.35"
            strokeWidth="1.2"
          />
        </>
      );

    case 'geometric':
      return renderSvgFrame(
        <>
          <polygon
            points="24,4 76,4 96,24 96,76 76,96 24,96 4,76 4,24"
            fill={`rgba(14, 18, 28, ${alpha})`}
            stroke="var(--theme-primary, #D4AF37)"
            strokeWidth="3.2"
          />
          <polyline points="14,32 14,14 32,14" fill="none" stroke="var(--theme-accent, #F5E6A8)" strokeWidth="2.2" />
          <polyline points="86,68 86,86 68,86" fill="none" stroke="var(--theme-accent, #F5E6A8)" strokeWidth="2.2" />
        </>
      );

    case 'frame-07': // Double Orbital Ring
      return renderSvgFrame(
        <>
          <circle cx="50" cy="50" r="46" fill={`rgba(12,16,26,${alpha})`} stroke="var(--theme-primary, #D4AF37)" strokeWidth="2.8" />
          <circle cx="50" cy="50" r="39" fill="none" stroke="var(--theme-accent, #F5E6A8)" strokeOpacity="0.65" strokeWidth="1.4" />
        </>,
        0.56
      );

    case 'frame-08': // Wide Flat Hexagon
      return renderSvgFrame(
        <polygon
          points="26,7 74,7 96,50 74,93 26,93 4,50"
          fill={`rgba(14,18,28,${alpha})`}
          stroke="var(--theme-primary, #D4AF37)"
          strokeWidth="3.2"
        />
      );

    case 'frame-09': // Diamond Rhombus
      return renderSvgFrame(
        <>
          <polygon points="50,3 97,50 50,97 3,50" fill={`rgba(14,18,28,${alpha})`} stroke="var(--theme-primary, #D4AF37)" strokeWidth="3.2" />
          <polygon points="50,11 89,50 50,89 11,50" fill="none" stroke="var(--theme-accent, #F5E6A8)" strokeOpacity="0.4" strokeWidth="1.2" />
        </>,
        0.52
      );

    case 'frame-10': // Heraldic Shield
      return renderSvgFrame(
        <>
          <path
            d="M12 8 H88 V47 C88 73 67 88 50 95 C33 88 12 73 12 47 Z"
            fill={`rgba(14,18,28,${alpha})`}
            stroke="var(--theme-primary, #D4AF37)"
            strokeWidth="3.2"
            strokeLinejoin="round"
          />
          <path
            d="M18 14 H82 V47 C82 69 64 81 50 88 C36 81 18 69 18 47 Z"
            fill="none"
            stroke="var(--theme-accent, #F5E6A8)"
            strokeOpacity="0.32"
            strokeWidth="1.2"
          />
        </>,
        0.55
      );

    case 'frame-11': // Cathedral Arch
      return renderSvgFrame(
        <path
          d="M12 93 V46 A38 38 0 0 1 88 46 V93 Z"
          fill={`rgba(14,18,28,${alpha})`}
          stroke="var(--theme-primary, #D4AF37)"
          strokeWidth="3.2"
          strokeLinejoin="round"
        />,
        0.56
      );

    case 'frame-12': // Crown Pentagon
      return renderSvgFrame(
        <polygon
          points="50,4 95,37 78,94 22,94 5,37"
          fill={`rgba(14,18,28,${alpha})`}
          stroke="var(--theme-primary, #D4AF37)"
          strokeWidth="3.2"
          strokeLinejoin="round"
        />,
        0.56
      );

    case 'frame-16': // Starburst 12-Point Seal
      return renderSvgFrame(
        <>
          <polygon
            points="50,3 61,13 76,9 80,24 94,30 89,45 97,57 86,69 87,84 72,87 63,97 50,91 37,97 28,87 13,84 14,69 3,57 11,45 6,30 20,24 24,9 39,13"
            fill={`rgba(14,18,28,${alpha})`}
            stroke="var(--theme-primary, #D4AF37)"
            strokeWidth="2.8"
            strokeLinejoin="round"
          />
          <circle cx="50" cy="50" r="34" fill="none" stroke="var(--theme-accent, #F5E6A8)" strokeOpacity="0.35" strokeWidth="1.2" />
        </>,
        0.52
      );

    case 'frame-17': // Stepped Art Deco Cross Corner
      return renderSvgFrame(
        <polygon
          points="16,4 84,4 84,16 96,16 96,84 84,84 84,96 16,96 16,84 4,84 4,16 16,16"
          fill={`rgba(14,18,28,${alpha})`}
          stroke="var(--theme-primary, #D4AF37)"
          strokeWidth="3"
        />,
        0.56
      );

    case 'frame-18': // Cinema Ticket Stub
      return renderSvgFrame(
        <path
          d="M8 10 H92 V38 A12 12 0 0 0 92 62 V90 H8 V62 A12 12 0 0 0 8 38 Z"
          fill={`rgba(14,18,28,${alpha})`}
          stroke="var(--theme-primary, #D4AF37)"
          strokeWidth="3.2"
          strokeLinejoin="round"
        />,
        0.56
      );

    case 'frame-19': // Telemetry Radar Ring
      return renderSvgFrame(
        <>
          <circle cx="50" cy="50" r="46" fill="none" stroke="var(--theme-primary, #D4AF37)" strokeWidth="3.2" strokeDasharray="18 8" />
          <circle cx="50" cy="50" r="38" fill={`rgba(14,18,28,${alpha})`} stroke="var(--theme-accent, #F5E6A8)" strokeOpacity="0.55" strokeWidth="1.5" />
        </>,
        0.56
      );

    case 'frame-21': // Side Caliper Bracket Arcs
      return renderSvgFrame(
        <>
          <rect x="14" y="10" width="72" height="80" rx="18" fill={`rgba(14,18,28,${alpha})`} />
          <path d="M24 10 C8 16 4 32 4 50 C4 68 8 84 24 90" fill="none" stroke="var(--theme-primary, #D4AF37)" strokeWidth="4" strokeLinecap="round" />
          <path d="M76 10 C92 16 96 32 96 50 C96 68 92 84 76 90" fill="none" stroke="var(--theme-primary, #D4AF37)" strokeWidth="4" strokeLinecap="round" />
        </>,
        0.58
      );

    case 'frame-25': // Blueprint Twin Line Square
      return renderSvgFrame(
        <>
          <rect x="6" y="6" width="88" height="88" rx="10" fill={`rgba(14,18,28,${alpha})`} stroke="var(--theme-primary, #D4AF37)" strokeWidth="2.2" />
          <rect x="13" y="13" width="74" height="74" rx="6" fill="none" stroke="var(--theme-accent, #F5E6A8)" strokeWidth="1.4" strokeDasharray="6 4" />
        </>,
        0.56
      );

    case 'frame-26': // Viewfinder L-Corners Only
      return renderSvgFrame(
        <>
          <rect x="8" y="8" width="84" height="84" rx="12" fill={`rgba(14,18,28,${Math.max(0.04, alpha * 0.6)})`} />
          <polyline points="6,28 6,6 28,6" fill="none" stroke="var(--theme-primary, #D4AF37)" strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round" />
          <polyline points="72,6 94,6 94,28" fill="none" stroke="var(--theme-primary, #D4AF37)" strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round" />
          <polyline points="6,72 6,94 28,94" fill="none" stroke="var(--theme-primary, #D4AF37)" strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round" />
          <polyline points="72,94 94,94 94,72" fill="none" stroke="var(--theme-primary, #D4AF37)" strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round" />
        </>
      );

    case 'frame-27': // Frosted Glass Hexagon
      return (
        <div
          className="relative flex items-center justify-center shrink-0 transition-transform duration-150 group-hover:scale-105"
          style={{ width: framePx, height: framePx }}
        >
          <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full pointer-events-none">
            <polygon
              points="50,3 93,26 93,74 50,97 7,74 7,26"
              fill={`rgba(255,255,255,${Math.min(0.32, alpha + 0.08)})`}
              stroke="rgba(255,255,255,0.55)"
              strokeWidth="2.8"
            />
            <line x1="18" y1="30" x2="48" y2="12" stroke="#FFFFFF" strokeOpacity="0.6" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
          <div className="relative z-10 flex items-center justify-center">
            <PackIconSvg kind={kind} pack={resolvedPack} sizePx={innerIconPx} />
          </div>
        </div>
      );

    case 'frame-29': // Metallic Coin Circle
      return renderSvgFrame(
        <>
          <circle cx="50" cy="50" r="46" fill={`rgba(14,18,28,${Math.max(0.55, alpha)})`} stroke="url(#achourFrameMetal)" strokeWidth="6" />
          <circle cx="50" cy="50" r="39" fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="1.2" strokeDasharray="3 2" />
        </>,
        0.58
      );

    case 'frame-30': // Metallic Hex Crest
      return renderSvgFrame(
        <>
          <polygon points="50,3 93,26 93,74 50,97 7,74 7,26" fill={`rgba(12,15,24,${Math.max(0.55, alpha)})`} stroke="url(#achourFrameMetal)" strokeWidth="5.2" />
          <polygon points="50,11 86,30 86,70 50,89 14,70 14,30" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="1.2" />
        </>,
        0.58
      );

    case 'frame-31': // Metallic Armor Shield
      return renderSvgFrame(
        <>
          <path
            d="M11 8 H89 V47 C89 74 68 89 50 96 C32 89 11 74 11 47 Z"
            fill={`rgba(12,14,22,${Math.max(0.55, alpha)})`}
            stroke="url(#achourFrameMetal)"
            strokeWidth="5"
            strokeLinejoin="round"
          />
        </>,
        0.55
      );

    case 'frame-34': // Crown Notched Slate
      return renderSvgFrame(
        <polygon
          points="20,5 80,5 95,22 95,93 5,93 5,22"
          fill={`rgba(14,18,28,${alpha})`}
          stroke="var(--theme-primary, #D4AF37)"
          strokeWidth="3.2"
          strokeLinejoin="round"
        />,
        0.58
      );

    case 'frame-37': // 10-Sided Decagon Jewel Cut
      return renderSvgFrame(
        <>
          <polygon
            points="50,4 78,13 95,36 95,64 78,87 50,96 22,87 5,64 5,36 22,13"
            fill={`rgba(14,18,28,${alpha})`}
            stroke="var(--theme-primary, #D4AF37)"
            strokeWidth="3.2"
          />
          <polygon
            points="50,12 74,20 87,39 87,61 74,80 50,88 26,80 13,61 13,39 26,20"
            fill="none"
            stroke="var(--theme-accent, #F5E6A8)"
            strokeOpacity="0.4"
            strokeWidth="1.2"
          />
        </>,
        0.56
      );

    case 'frame-39': // Aerodynamic Trapezoid Cut Badge
      return renderSvgFrame(
        <polygon
          points="18,8 82,8 96,90 4,90"
          fill={`rgba(14,18,28,${alpha})`}
          stroke="var(--theme-primary, #D4AF37)"
          strokeWidth="3.2"
          strokeLinejoin="round"
        />,
        0.54
      );
  }

  // CSS / Box Architectural Frames
  if (resolvedShape === 'metallic') {
    return (
      <div
        className="relative flex items-center justify-center shrink-0 rounded-2xl p-[2.5px] transition-transform duration-150 group-hover:scale-105 shadow-[0_10px_24px_rgba(0,0,0,0.45)]"
        style={{
          width: framePx,
          height: framePx,
          background: 'var(--theme-metallic-grad, linear-gradient(135deg, #8C6A1D 0%, #D4AF37 35%, #F5E6A8 58%, #B8860B 84%, #8C6A1D 100%))',
        }}
      >
        <div
          className="w-full h-full rounded-[13.5px] flex items-center justify-center border border-white/15"
          style={{
            background: `linear-gradient(160deg, rgba(24,26,34,${Math.max(0.45, alpha)}) 0%, rgba(10,12,18,${Math.max(0.6, alpha + 0.12)}) 100%)`,
          }}
        >
          <PackIconSvg kind={kind} pack={resolvedPack} sizePx={innerIconPx} />
        </div>
      </div>
    );
  }

  if (resolvedShape === 'glass' || resolvedShape === 'frame-28') {
    const isSphere = resolvedShape === 'frame-28';
    return (
      <div
        className={`relative flex items-center justify-center shrink-0 border border-white/30 transition-transform duration-150 group-hover:scale-105 shadow-[0_10px_28px_rgba(0,0,0,0.28),inset_0_1px_1px_rgba(255,255,255,0.45)] overflow-hidden ${
          isSphere ? 'rounded-full' : 'rounded-[26%]'
        }`}
        style={{
          width: framePx,
          height: framePx,
          background: `linear-gradient(145deg, rgba(255,255,255,${Math.min(0.32, alpha * 0.8 + 0.08)}) 0%, rgba(255,255,255,${Math.max(0.02, alpha * 0.3)}) 100%)`,
          backdropFilter: blurPx > 0 ? `blur(${blurPx}px)` : undefined,
          WebkitBackdropFilter: blurPx > 0 ? `blur(${blurPx}px)` : undefined,
        }}
      >
        <div className="pointer-events-none absolute -top-1/2 -left-1/2 w-[140%] h-[90%] rotate-[-25deg] bg-gradient-to-b from-white/25 to-transparent" />
        <div className="relative z-10 flex items-center justify-center">
          <PackIconSvg kind={kind} pack={resolvedPack} sizePx={innerIconPx} />
        </div>
      </div>
    );
  }

  if (resolvedShape === 'circle') {
    return (
      <div
        className="relative flex items-center justify-center shrink-0 rounded-full border-2 transition-transform duration-150 group-hover:scale-105 shadow-[0_8px_22px_rgba(0,0,0,0.35)]"
        style={{
          width: framePx,
          height: framePx,
          borderColor: 'var(--theme-primary, #D4AF37)',
          boxShadow: 'inset 0 0 0 2px rgba(255,255,255,0.12), 0 8px 22px rgba(0,0,0,0.35)',
          ...interiorGlassStyle,
        }}
      >
        <PackIconSvg kind={kind} pack={resolvedPack} sizePx={innerIconPx} />
      </div>
    );
  }

  if (resolvedShape === 'frame-13') {
    // Stadium Pill Capsule
    return (
      <div
        className="relative flex items-center justify-center shrink-0 rounded-full border-2 transition-transform duration-150 group-hover:scale-105"
        style={{
          width: Math.round(framePx * 1.18),
          height: Math.round(framePx * 0.88),
          borderColor: 'var(--theme-primary, #D4AF37)',
          ...interiorGlassStyle,
        }}
      >
        <PackIconSvg kind={kind} pack={resolvedPack} sizePx={Math.min(innerIconPx, Math.round(framePx * 0.56))} />
      </div>
    );
  }

  if (resolvedShape === 'frame-14' || resolvedShape === 'frame-15') {
    // Diagonal Leaf Left / Blade Right
    return (
      <div
        className="relative flex items-center justify-center shrink-0 border-2 transition-transform duration-150 group-hover:scale-105 shadow-[0_8px_22px_rgba(0,0,0,0.35)]"
        style={{
          width: framePx,
          height: framePx,
          borderRadius: resolvedShape === 'frame-14' ? '44% 10% 44% 10%' : '10% 44% 10% 44%',
          borderColor: 'var(--theme-primary, #D4AF37)',
          ...interiorGlassStyle,
        }}
      >
        <PackIconSvg kind={kind} pack={resolvedPack} sizePx={innerIconPx} />
      </div>
    );
  }

  if (resolvedShape === 'frame-20') {
    // Top-Bottom Rail Brackets
    return (
      <div
        className="relative flex items-center justify-center shrink-0 border-y-[3px] border-x-0 rounded-xl transition-transform duration-150 group-hover:scale-105"
        style={{
          width: framePx,
          height: framePx,
          borderColor: 'var(--theme-primary, #D4AF37)',
          ...interiorGlassStyle,
        }}
      >
        <PackIconSvg kind={kind} pack={resolvedPack} sizePx={innerIconPx} />
      </div>
    );
  }

  if (resolvedShape === 'frame-22' || resolvedShape === 'frame-38') {
    // Electric Neon Ring / Soft Neon Squircle
    const isCircle = resolvedShape === 'frame-22';
    return (
      <div
        className={`relative flex items-center justify-center shrink-0 border-2 transition-transform duration-150 group-hover:scale-105 ${
          isCircle ? 'rounded-full' : 'rounded-[28%]'
        }`}
        style={{
          width: framePx,
          height: framePx,
          borderColor: 'var(--theme-primary, #D4AF37)',
          boxShadow: '0 0 20px var(--theme-glow, rgba(212,175,55,0.6)), inset 0 0 12px var(--theme-glow, rgba(212,175,55,0.35))',
          backgroundColor: `rgba(8, 10, 16, ${Math.max(0.45, alpha)})`,
        }}
      >
        <PackIconSvg kind={kind} pack={resolvedPack} sizePx={innerIconPx} />
      </div>
    );
  }

  if (resolvedShape === 'frame-23') {
    // Cyberpunk Skew Parallelogram
    return (
      <div
        className="relative flex items-center justify-center shrink-0 rounded-xl border-2 -skew-x-12 transition-transform duration-150 group-hover:scale-105"
        style={{
          width: framePx,
          height: framePx,
          borderColor: 'var(--theme-primary, #D4AF37)',
          boxShadow: '4px 4px 0 var(--theme-secondary, #8C6A1D)',
          ...interiorGlassStyle,
        }}
      >
        <div className="skew-x-12 flex items-center justify-center">
          <PackIconSvg kind={kind} pack={resolvedPack} sizePx={innerIconPx} />
        </div>
      </div>
    );
  }

  if (resolvedShape === 'frame-24') {
    // Tactile 3D Keycap Cushion
    return (
      <div
        className="relative flex items-center justify-center shrink-0 rounded-[26%] border-2 border-b-[6px] transition-transform duration-150 group-hover:scale-105"
        style={{
          width: framePx,
          height: framePx,
          borderColor: 'var(--theme-primary, #D4AF37)',
          borderBottomColor: 'var(--theme-secondary, #8C6A1D)',
          ...interiorGlassStyle,
        }}
      >
        <PackIconSvg kind={kind} pack={resolvedPack} sizePx={innerIconPx} />
      </div>
    );
  }

  if (resolvedShape === 'frame-32') {
    // Carbon Tech Weave Grid
    return (
      <div
        className="relative flex items-center justify-center shrink-0 rounded-2xl border-2 transition-transform duration-150 group-hover:scale-105"
        style={{
          width: framePx,
          height: framePx,
          borderColor: 'var(--theme-primary, #D4AF37)',
          backgroundColor: '#12141C',
          backgroundImage:
            'linear-gradient(45deg, rgba(255,255,255,0.05) 25%, transparent 25%), linear-gradient(-45deg, rgba(255,255,255,0.05) 25%, transparent 25%)',
          backgroundSize: '6px 6px',
        }}
      >
        <PackIconSvg kind={kind} pack={resolvedPack} sizePx={innerIconPx} />
      </div>
    );
  }

  if (resolvedShape === 'frame-33') {
    // Obsidian Deep Inset Well
    return (
      <div
        className="relative flex items-center justify-center shrink-0 rounded-2xl border transition-transform duration-150 group-hover:scale-105"
        style={{
          width: framePx,
          height: framePx,
          backgroundColor: 'rgba(6, 8, 12, 0.88)',
          borderColor: 'rgba(255,255,255,0.14)',
          boxShadow: 'inset 0 8px 18px rgba(0,0,0,0.85), inset 0 -1px 0 var(--theme-primary, #D4AF37)',
        }}
      >
        <PackIconSvg kind={kind} pack={resolvedPack} sizePx={innerIconPx} />
      </div>
    );
  }

  if (resolvedShape === 'frame-35') {
    // Stacked Triple Deck Cards
    return (
      <div
        className="relative flex items-center justify-center shrink-0 transition-transform duration-150 group-hover:scale-105"
        style={{ width: framePx, height: framePx }}
      >
        <div
          className="absolute inset-0 rounded-[22%] border border-white/15 bg-black/50 translate-x-1.5 -translate-y-1.5 rotate-6"
        />
        <div
          className="absolute inset-0 rounded-[22%] border border-white/20 bg-black/60 -translate-x-1 translate-y-1 -rotate-3"
        />
        <div
          className="relative w-full h-full rounded-[22%] border-2 flex items-center justify-center"
          style={{ borderColor: 'var(--theme-primary, #D4AF37)', ...interiorGlassStyle }}
        >
          <PackIconSvg kind={kind} pack={resolvedPack} sizePx={innerIconPx} />
        </div>
      </div>
    );
  }

  if (resolvedShape === 'frame-36') {
    // Radiant Aura Halo
    return (
      <div
        className="relative flex items-center justify-center shrink-0 rounded-full p-[3px] transition-transform duration-150 group-hover:scale-105"
        style={{
          width: framePx,
          height: framePx,
          background: 'conic-gradient(from 0deg, var(--theme-primary, #D4AF37), var(--theme-accent, #F5E6A8), var(--theme-secondary, #8C6A1D), var(--theme-primary, #D4AF37))',
          boxShadow: '0 0 18px var(--theme-glow, rgba(212,175,55,0.5))',
        }}
      >
        <div
          className="w-full h-full rounded-full flex items-center justify-center"
          style={interiorGlassStyle}
        >
          <PackIconSvg kind={kind} pack={resolvedPack} sizePx={innerIconPx} />
        </div>
      </div>
    );
  }

  if (resolvedShape === 'frame-40') {
    // Pearl Satin Dual Bevel
    return (
      <div
        className="relative flex items-center justify-center shrink-0 rounded-[26%] border-2 transition-transform duration-150 group-hover:scale-105"
        style={{
          width: framePx,
          height: framePx,
          borderColor: 'var(--theme-accent, #F5E6A8)',
          boxShadow: 'inset 0 0 0 3px var(--theme-primary, #D4AF37), 0 8px 22px rgba(0,0,0,0.45)',
          ...interiorGlassStyle,
        }}
      >
        <PackIconSvg kind={kind} pack={resolvedPack} sizePx={innerIconPx} />
      </div>
    );
  }

  // Default: rounded-square
  return (
    <div
      className="relative flex items-center justify-center shrink-0 rounded-[24%] border-2 transition-transform duration-150 group-hover:scale-105 shadow-[0_8px_22px_rgba(0,0,0,0.35)]"
      style={{
        width: framePx,
        height: framePx,
        borderColor: 'var(--theme-primary, #D4AF37)',
        ...interiorGlassStyle,
      }}
    >
      <PackIconSvg kind={kind} pack={resolvedPack} sizePx={innerIconPx} />
    </div>
  );
}
