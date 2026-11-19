// Original path: src/components/PositionEditModal.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { X, ChevronUp, ChevronDown, Star, Check, Trash2 } from 'lucide-react';
import { useI18n } from '../utils/i18n';
import { Language } from '../types';
import { WindowPositionButton } from './WindowPositionBar';

interface PositionEditModalProps {
  type: 'category' | 'channel';
  id: string;
  name: string;
  currentIndex: number;
  maxPosition?: number;
  onSave: (newPosition: number) => void;
  onClose: () => void;
  onToggleFavorite?: () => void;
  isFavorite?: boolean;
  language: Language;
}

export default function PositionEditModal({
  type,
  id,
  name,
  currentIndex,
  maxPosition,
  onSave,
  onClose,
  onToggleFavorite,
  isFavorite,
  language
}: PositionEditModalProps) {
  const { isRtl } = useI18n(language);
  const [position, setPosition] = useState<string>('');

  useEffect(() => {
    setPosition('');
  }, [id, currentIndex]);

  const clampPos = useCallback((val: number) => {
    const minClamped = Math.max(1, val);
    return maxPosition && maxPosition > 0 ? Math.min(maxPosition, minClamped) : minClamped;
  }, [maxPosition]);

  // Up arrow button moves item UP in the list (toward #1 -> lower number)
  const handleMoveUp = () => {
    const currentNum = parseInt(position, 10) || (currentIndex + 1);
    onSave(clampPos(currentNum - 1));
  };

  // Down arrow button moves item DOWN in the list (toward #N -> higher number)
  const handleMoveDown = () => {
    const currentNum = parseInt(position, 10) || (currentIndex + 1);
    onSave(clampPos(currentNum + 1));
  };

  const handleSave = useCallback(() => {
    const targetPos = parseInt(position, 10);
    if (!isNaN(targetPos) && targetPos > 0) {
      onSave(clampPos(targetPos));
    } else {
      onSave(currentIndex + 1);
    }
  }, [position, currentIndex, clampPos, onSave]);

  // Handle remote numeric keys when input is NOT focused (prevents double-digit bug when input IS focused)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName?.toUpperCase();
      const isInputFocused = activeTag === 'INPUT' || activeTag === 'TEXTAREA';

      if (e.key === 'Escape' || e.keyCode === 27) {
        e.preventDefault();
        e.stopPropagation();
        onClose();
        return;
      }

      if (isInputFocused) {
        if (e.key === 'Enter' || e.keyCode === 13 || e.key === 'Select' || e.keyCode === 23) {
          e.preventDefault();
          e.stopPropagation();
          handleSave();
        }
        return;
      }

      const isTopRowDigit = (e.key >= '0' && e.key <= '9') || (e.keyCode >= 48 && e.keyCode <= 57);
      const isNumpadDigit = e.keyCode >= 96 && e.keyCode <= 105;

      if (isTopRowDigit || isNumpadDigit) {
        e.preventDefault();
        e.stopPropagation();
        const digit = (e.key >= '0' && e.key <= '9')
          ? e.key
          : String(isNumpadDigit ? e.keyCode - 96 : e.keyCode - 48);
        setPosition(prev => (prev + digit).slice(0, 5));
      } else if (e.key === 'Backspace' || e.keyCode === 8 || e.key === 'Delete' || e.keyCode === 46) {
        e.preventDefault();
        e.stopPropagation();
        setPosition(prev => prev.slice(0, -1));
      }
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [onClose, handleSave]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 achour-modal-backdrop select-none"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        style={{ transform: 'scale(var(--achour-zoom-scale, 0.95))', transformOrigin: 'center center' }}
        className={`w-full max-w-xs achour-glass-modal border-gold/50 rounded-2xl p-3.5 flex flex-col space-y-2.5 max-h-[88vh] overflow-y-auto no-scrollbar ${isRtl ? 'font-cairo text-right' : 'text-left'}`}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-1.5 border-b border-white/10 shrink-0">
          <h3 className="text-xs font-black text-white uppercase tracking-wider truncate max-w-[200px]">
            {type === 'category' ? (isRtl ? 'ترتيب المجموعات' : 'Category Order') : (isRtl ? 'ترتيب القنوات' : 'Channel Order')}: {name}
          </h3>
          <div className="flex items-center gap-1 shrink-0">
            <WindowPositionButton isRtl={isRtl} tvModalTag="reorder" />
            <button 
              onClick={onClose} 
              data-tv-modal="reorder"
              data-tv-focusable="true"
              tabIndex={0}
              className="p-1 text-zinc-400 hover:text-white rounded-full hover:bg-white/10 outline-none"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Current Position Tag */}
        <div className="text-center py-1 bg-white/[0.05] rounded-xl border border-white/10">
          <span className="text-[10px] font-bold text-gold uppercase tracking-widest block">
            {isRtl ? 'الترتيب الحالي' : 'Current Position'}
          </span>
          <div className="text-xl font-black text-white mt-0.5 font-mono">
            #{currentIndex + 1}{maxPosition ? ` / ${maxPosition}` : ''}
          </div>
        </div>

        {/* Position Input with Up/Down Controls */}
        <div className="flex items-center gap-2 bg-white/[0.05] p-2.5 rounded-xl border border-white/10">
          <button 
            onClick={handleMoveDown}
            data-tv-modal="reorder"
            data-tv-move-down="true"
            data-tv-focusable="true"
            tabIndex={0}
            className="p-2.5 bg-white/10 hover:bg-gold hover:text-black rounded-lg text-gold transition-colors outline-none cursor-pointer"
            title={isRtl ? 'للأسفل (رقم أكبر)' : 'Move Down'}
          >
            <ChevronDown size={20} />
          </button>

          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={5}
            value={position}
            onChange={(e) => setPosition(e.target.value.replace(/[^0-9]/g, '').slice(0, 5))}
            data-tv-modal="reorder"
            data-tv-focusable="true"
            tabIndex={0}
            className="flex-1 min-w-0 bg-white/[0.06] border border-gold/40 rounded-lg py-1.5 px-2 text-center text-lg text-white font-bold font-mono outline-none focus:border-gold"
            placeholder=""
          />

          <button 
            onClick={handleMoveUp}
            data-tv-modal="reorder"
            data-tv-move-up="true"
            data-tv-focusable="true"
            tabIndex={0}
            className="p-2.5 bg-white/10 hover:bg-gold hover:text-black rounded-lg text-gold transition-colors outline-none cursor-pointer"
            title={isRtl ? 'للأعلى (رقم أصغر)' : 'Move Up'}
          >
            <ChevronUp size={20} />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={() => setPosition('')}
            data-tv-modal="reorder"
            data-tv-focusable="true"
            tabIndex={0}
            className="py-2 px-3 bg-red-950/40 hover:bg-red-600 text-red-300 hover:text-white rounded-xl flex items-center justify-center gap-1.5 font-bold text-xs transition-colors border border-red-500/30 outline-none cursor-pointer"
          >
            <Trash2 size={14} />
            <span>{isRtl ? 'مسح' : 'Clear'}</span>
          </button>
          <button
            onClick={handleSave}
            data-tv-modal="reorder"
            data-tv-focusable="true"
            tabIndex={0}
            className="py-2 px-3 bg-gold hover:bg-gold/80 text-black rounded-xl flex items-center justify-center gap-1.5 font-bold text-xs transition-colors outline-none cursor-pointer shadow-md"
          >
            <Check size={14} />
            <span>{isRtl ? 'تطبيق الترتيب' : 'Save'}</span>
          </button>
        </div>

        {/* Favorite Toggle for Channels */}
        {type === 'channel' && onToggleFavorite && (
          <button
            onClick={onToggleFavorite}
            data-tv-modal="reorder"
            data-tv-focusable="true"
            tabIndex={0}
            className={`w-full py-2 px-3 rounded-xl flex items-center justify-center gap-2 font-bold text-xs uppercase transition-colors outline-none cursor-pointer ${
              isFavorite
                ? 'bg-gold/20 text-gold border border-gold'
                : 'bg-white/5 text-zinc-300 hover:text-white border border-white/10'
            }`}
          >
            <Star size={15} className={isFavorite ? 'fill-gold text-gold' : ''} />
            <span>{isFavorite ? (isRtl ? 'إلغاء المفضلة' : 'Remove Favorite') : (isRtl ? 'إضافة للمفضلة' : 'Add Favorite')}</span>
          </button>
        )}
      </motion.div>
    </motion.div>
  );
}
