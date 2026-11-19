import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Move } from 'lucide-react';
import { ScreenPosition } from '../types';

export const SCREEN_POSITION_CELLS: Array<{
  id: ScreenPosition;
  ar: string;
  en: string;
}> = [
  { id: 'top-left', ar: 'أعلى يسار', en: 'Top Left' },
  { id: 'top', ar: 'أعلى وسط', en: 'Top' },
  { id: 'top-right', ar: 'أعلى يمين', en: 'Top Right' },
  { id: 'left', ar: 'يسار', en: 'Left' },
  { id: 'center', ar: 'المنتصف', en: 'Center' },
  { id: 'right', ar: 'يمين', en: 'Right' },
  { id: 'bottom-left', ar: 'أسفل يسار', en: 'Bottom Left' },
  { id: 'bottom', ar: 'أسفل وسط', en: 'Bottom' },
  { id: 'bottom-right', ar: 'أسفل يمين', en: 'Bottom Right' },
];

export function setGlobalWindowPosition(pos: ScreenPosition) {
  try {
    document.documentElement.setAttribute('data-achour-window-pos', pos);
    window.dispatchEvent(new CustomEvent('achour-window-pos-change', { detail: pos }));
  } catch {}
}

export function getGlobalWindowPosition(): ScreenPosition {
  if (typeof document === 'undefined') return 'center';
  const attr = document.documentElement.getAttribute('data-achour-window-pos') as ScreenPosition | null;
  return attr || 'center';
}

interface WindowPositionButtonProps {
  isRtl?: boolean;
  tvModalTag?: string;
}

export const WindowPositionButton: React.FC<WindowPositionButtonProps> = ({ isRtl = false, tvModalTag }) => {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<ScreenPosition>(() => getGlobalWindowPosition());
  const [anchor, setAnchor] = useState<{ top: number; left: number } | null>(null);
  const btnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const sync = () => setPos(getGlobalWindowPosition());
    window.addEventListener('achour-window-pos-change', sync);
    return () => window.removeEventListener('achour-window-pos-change', sync);
  }, []);

  useEffect(() => {
    if (!open) return;
    const closeOnOutside = () => setOpen(false);
    const id = setTimeout(() => {
      window.addEventListener('click', closeOnOutside);
    }, 0);
    return () => {
      clearTimeout(id);
      window.removeEventListener('click', closeOnOutside);
    };
  }, [open]);

  const modalAttr = tvModalTag ? { 'data-tv-modal': tvModalTag } : {};

  const toggleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      const popW = 196;
      const popH = 156;
      const left = Math.max(8, Math.min(window.innerWidth - popW - 8, rect.right - popW));
      const top = rect.bottom + popH + 12 <= window.innerHeight
        ? rect.bottom + 8
        : Math.max(8, rect.top - popH - 8);
      setAnchor({ top, left });
    }
    setOpen((v) => !v);
  };

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        data-tv-focusable="true"
        tabIndex={0}
        {...modalAttr}
        onClick={toggleOpen}
        title={isRtl ? 'نقل موضع النافذة' : 'Move Window Position'}
        className={`p-1.5 rounded-full transition-colors cursor-pointer outline-none shrink-0 ${
          open ? 'bg-gold/25 text-gold' : 'text-zinc-400 hover:text-gold hover:bg-white/10'
        }`}
      >
        <Move size={16} />
      </button>

      {open && anchor && typeof document !== 'undefined' && createPortal(
        <div
          onClick={(e) => e.stopPropagation()}
          dir="ltr"
          style={{ position: 'fixed', top: anchor.top, left: anchor.left, width: 196 }}
          className="z-[99999] p-2.5 rounded-2xl bg-[#0b0e17] border border-gold/60 shadow-2xl"
        >
          <div className="text-[10px] font-bold text-gold text-center mb-2">
            {isRtl ? 'نقل النافذة إلى:' : 'Move Window To:'}
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {SCREEN_POSITION_CELLS.map((cell) => {
              const active = pos === cell.id;
              return (
                <button
                  key={cell.id}
                  type="button"
                  data-tv-focusable="true"
                  tabIndex={0}
                  {...modalAttr}
                  onClick={() => {
                    setGlobalWindowPosition(cell.id);
                    setPos(cell.id);
                    setOpen(false);
                  }}
                  title={isRtl ? cell.ar : cell.en}
                  className={`h-8 rounded-lg border flex items-center justify-center transition-colors cursor-pointer ${
                    active
                      ? 'bg-gold text-black border-gold'
                      : 'bg-white/[0.06] text-zinc-200 border-white/10 hover:border-gold/60 hover:text-gold'
                  }`}
                >
                  <span className={`w-2.5 h-2.5 rounded-sm ${active ? 'bg-black' : 'bg-gold/80'}`} />
                </button>
              );
            })}
          </div>
        </div>,
        document.body
      )}
    </>
  );
};
