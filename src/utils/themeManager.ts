// Original path: src/utils/themeManager.ts
export interface RoyalTheme {
  id: string;
  nameAr: string;
  nameEn: string;
  primary: string;
  secondary: string;
  accent: string;
  glow: string;
  gradient: string;
}

export interface Icon3DStyle {
  id: string;
  nameAr: string;
  nameEn: string;
  cardClass: string;
  iconClass: string;
  previewBg: string;
  descriptionAr: string;
  recommendedThemeId?: string;
  recommendedBackgroundId?: string;
  iconImage?: string; // For realistic photo icons
  glyphVariant?: 'cinema' | 'broadcast' | 'crystal' | 'neon' | 'retro';
  iconProps?: {
    strokeWidth?: number;
    fill?: string;
    size?: number;
  };
}

export interface AppBackground {
  id: string;
  nameAr: string;
  nameEn: string;
  type: 'static';
  descriptionAr: string;
  descriptionEn?: string;
  previewColor: string;
  previewGradient?: string;
  imageUrl: string;
  renderClass: string;
}

// 26 Royal Theme Colors (ألوان ملكية فاخرة ومميزة)
export const ROYAL_THEMES: RoyalTheme[] = [
  {
    id: 'pure-metallic-gold',
    nameAr: '✨ الذهب الخالص المسبوك عيار 24 (مميز)',
    nameEn: '24K Pure Cast Metallic Gold',
    primary: '#E5C158',
    secondary: '#B38B21',
    accent: '#FFF6D1',
    glow: 'rgba(229, 193, 88, 0.6)',
    gradient: 'from-[#F3D068] via-[#C5A059] to-[#8C6D27]'
  },
  {
    id: 'royal-bronze',
    nameAr: 'البرونز الملكي المعتق',
    nameEn: 'Antiqued Royal Bronze',
    primary: '#CD7F32',
    secondary: '#8B4513',
    accent: '#F4A460',
    glow: 'rgba(205, 127, 50, 0.45)',
    gradient: 'from-[#CD7F32] via-[#A0522D] to-[#5C2E0B]'
  },
  {
    id: 'imperial-jade',
    nameAr: 'اليشم السلطاني الأخضر العميق',
    nameEn: 'Imperial Deep Jade',
    primary: '#00A86B',
    secondary: '#006644',
    accent: '#80E6B8',
    glow: 'rgba(0, 168, 107, 0.45)',
    gradient: 'from-[#00A86B] via-[#008055] to-[#004D33]'
  },
  {
    id: 'cosmic-nebula',
    nameAr: 'السديم الكوني الملكي',
    nameEn: 'Royal Cosmic Nebula',
    primary: '#D8B4FE',
    secondary: '#9333EA',
    accent: '#F3E8FF',
    glow: 'rgba(216, 180, 254, 0.5)',
    gradient: 'from-[#E9D5FF] via-[#C084FC] to-[#7E22CE]'
  },
  {
    id: 'volcanic-amber',
    nameAr: 'العنبر البركاني الذهبي',
    nameEn: 'Volcanic Golden Amber',
    primary: '#FFB703',
    secondary: '#FB8500',
    accent: '#FFE6A7',
    glow: 'rgba(255, 183, 3, 0.5)',
    gradient: 'from-[#FFB703] via-[#FB8500] to-[#023047]'
  },
  {
    id: 'sapphire-midnight',
    nameAr: 'الياقوت الأزرق الليلكي',
    nameEn: 'Midnight Royal Sapphire',
    primary: '#38BDF8',
    secondary: '#1E3A8A',
    accent: '#E0F2FE',
    glow: 'rgba(56, 189, 248, 0.5)',
    gradient: 'from-[#38BDF8] via-[#1D4ED8] to-[#0F172A]'
  },
  {
    id: 'royal-gold',
    nameAr: 'الذهب الملكي الإمبراطوري',
    nameEn: 'Imperial Royal Gold',
    primary: '#D4AF37',
    secondary: '#996515',
    accent: '#FFF2A3',
    glow: 'rgba(212, 175, 55, 0.45)',
    gradient: 'from-[#D4AF37] via-[#AA771C] to-[#85580C]'
  },
  {
    id: 'emerald-palace',
    nameAr: 'الزمرد السلطاني الأخضر',
    nameEn: 'Sultanic Emerald',
    primary: '#10B981',
    secondary: '#047857',
    accent: '#6EE7B7',
    glow: 'rgba(16, 185, 129, 0.45)',
    gradient: 'from-[#10B981] via-[#059669] to-[#047857]'
  },
  {
    id: 'sapphire-crown',
    nameAr: 'الياقوت الأزرق الملكي',
    nameEn: 'Royal Sapphire Crown',
    primary: '#3B82F6',
    secondary: '#1D4ED8',
    accent: '#93C5FD',
    glow: 'rgba(59, 130, 246, 0.45)',
    gradient: 'from-[#3B82F6] via-[#2563EB] to-[#1E40AF]'
  },
  {
    id: 'ruby-crimson',
    nameAr: 'الياقوت القرمزي الفاخر',
    nameEn: 'Imperial Crimson Ruby',
    primary: '#E11D48',
    secondary: '#9F1239',
    accent: '#FDA4AF',
    glow: 'rgba(225, 29, 72, 0.45)',
    gradient: 'from-[#E11D48] via-[#BE123C] to-[#881337]'
  },
  {
    id: 'amethyst-majesty',
    nameAr: 'الجمشت البنفسجي الملوكي',
    nameEn: 'Majestic Amethyst',
    primary: '#8B5CF6',
    secondary: '#6D28D9',
    accent: '#C4B5FD',
    glow: 'rgba(139, 92, 246, 0.45)',
    gradient: 'from-[#8B5CF6] via-[#7C3AED] to-[#5B21B6]'
  },
  {
    id: 'rose-gold',
    nameAr: 'الذهب الوردي الأنيق',
    nameEn: 'Noble Rose Gold',
    primary: '#FB7185',
    secondary: '#BE185D',
    accent: '#FECDD3',
    glow: 'rgba(251, 113, 133, 0.45)',
    gradient: 'from-[#FB7185] via-[#E11D48] to-[#9F1239]'
  },
  {
    id: 'diamond-platinum',
    nameAr: 'البلاتين الماسي المتلألئ',
    nameEn: 'Luminous Diamond Platinum',
    primary: '#E2E8F0',
    secondary: '#94A3B8',
    accent: '#FFFFFF',
    glow: 'rgba(226, 232, 240, 0.45)',
    gradient: 'from-[#FFFFFF] via-[#CBD5E1] to-[#64748B]'
  },
  {
    id: 'midnight-cyan',
    nameAr: 'الفيروزي الليلي المشع',
    nameEn: 'Midnight Cyan Luster',
    primary: '#06B6D4',
    secondary: '#0E7490',
    accent: '#67E8F9',
    glow: 'rgba(6, 182, 212, 0.45)',
    gradient: 'from-[#06B6D4] via-[#0891B2] to-[#155E75]'
  },
  {
    id: 'obsidian-amber',
    nameAr: '15. الذهب الساطع الفاخر (Vibrant Gold)',
    nameEn: 'Vibrant Pure Gold',
    primary: '#FFD700',
    secondary: '#DAA520',
    accent: '#FFF8DC',
    glow: 'rgba(255, 215, 0, 0.5)',
    gradient: 'from-[#FFD700] via-[#DAA520] to-[#B8860B]'
  },
  {
    id: 'velvet-burgundy',
    nameAr: '16. الوردي النيوني الباهر (Neon Magenta)',
    nameEn: 'Neon Magenta Glow',
    primary: '#FF1493',
    secondary: '#C71585',
    accent: '#FFC0CB',
    glow: 'rgba(255, 20, 147, 0.5)',
    gradient: 'from-[#FF1493] via-[#C71585] to-[#8B008B]'
  },
  {
    id: 'topaz-flame',
    nameAr: '17. الأخضر الزمردي النيوني (Spring Neon)',
    nameEn: 'Spring Neon Green',
    primary: '#00FF7F',
    secondary: '#2E8B57',
    accent: '#98FB98',
    glow: 'rgba(0, 255, 127, 0.5)',
    gradient: 'from-[#00FF7F] via-[#2E8B57] to-[#006400]'
  },
  {
    id: 'neon-turquoise',
    nameAr: '18. السيان والسماوي المشع (Cyan Laser)',
    nameEn: 'Laser Cyan Glow',
    primary: '#00FFFF',
    secondary: '#008B8B',
    accent: '#E0FFFF',
    glow: 'rgba(0, 255, 255, 0.5)',
    gradient: 'from-[#00FFFF] via-[#008B8B] to-[#004040]'
  },
  {
    id: 'royal-indigo',
    nameAr: '19. البنفسجي الملكي الداكن (Dark Violet)',
    nameEn: 'Deep Royal Violet',
    primary: '#9400D3',
    secondary: '#4B0082',
    accent: '#D8BFD8',
    glow: 'rgba(148, 0, 211, 0.5)',
    gradient: 'from-[#9400D3] via-[#4B0082] to-[#2E0854]'
  },
  {
    id: 'copper-sun',
    nameAr: '20. شعلة الغروب البرتقالية (Sunset Blaze)',
    nameEn: 'Sunset Orange Red',
    primary: '#FF4500',
    secondary: '#B22222',
    accent: '#FFA07A',
    glow: 'rgba(255, 69, 0, 0.5)',
    gradient: 'from-[#FF4500] via-[#B22222] to-[#8B0000]'
  },
  {
    id: 'jade-dynasty',
    nameAr: 'اليشم الإمبراطوري العتيق',
    nameEn: 'Ancient Jade Dynasty',
    primary: '#059669',
    secondary: '#064E3B',
    accent: '#34D399',
    glow: 'rgba(5, 150, 105, 0.45)',
    gradient: 'from-[#059669] via-[#047857] to-[#064E3B]'
  },
  {
    id: 'pearl-lumina',
    nameAr: 'اللؤلؤ الأبيض الملكي',
    nameEn: 'Imperial Lumina Pearl',
    primary: '#F8FAFC',
    secondary: '#CBD5E1',
    accent: '#FFFFFF',
    glow: 'rgba(248, 250, 252, 0.45)',
    gradient: 'from-[#FFFFFF] via-[#E2E8F0] to-[#94A3B8]'
  },
  {
    id: 'electric-violet',
    nameAr: 'البنفسج الكهربائي المتوهج',
    nameEn: 'Electric Ultra Violet',
    primary: '#A855F7',
    secondary: '#7E22CE',
    accent: '#E9D5FF',
    glow: 'rgba(168, 85, 247, 0.45)',
    gradient: 'from-[#A855F7] via-[#9333EA] to-[#6B21A8]'
  },
  {
    id: 'champagne-glow',
    nameAr: 'بريق الشامبانيا المذهب',
    nameEn: 'Gilded Champagne Glow',
    primary: '#FDE047',
    secondary: '#CA8A04',
    accent: '#FEF08A',
    glow: 'rgba(253, 224, 71, 0.45)',
    gradient: 'from-[#FDE047] via-[#EAB308] to-[#A16207]'
  },
  {
    id: 'crimson-coral',
    nameAr: 'المرجان القرمزي النادر',
    nameEn: 'Rare Crimson Coral',
    primary: '#F43F5E',
    secondary: '#BE123C',
    accent: '#FECDD3',
    glow: 'rgba(244, 63, 94, 0.45)',
    gradient: 'from-[#F43F5E] via-[#E11D48] to-[#9F1239]'
  },
  {
    id: 'titanium-azure',
    nameAr: 'التيتانيوم السماوي الفاخر',
    nameEn: 'Titanium Celestial Azure',
    primary: '#38BDF8',
    secondary: '#0284C7',
    accent: '#BAE6FD',
    glow: 'rgba(56, 189, 248, 0.45)',
    gradient: 'from-[#38BDF8] via-[#0EA5E9] to-[#0369A1]'
  },
  {
    id: 'ruby-wine',
    nameAr: 'نبيذ الياقوت الملكي العميق',
    nameEn: 'Deep Royal Ruby Wine',
    primary: '#9F1239',
    secondary: '#4C0519',
    accent: '#FDA4AF',
    glow: 'rgba(159, 18, 57, 0.5)',
    gradient: 'from-[#BE123C] via-[#881337] to-[#4C0519]'
  },
  {
    id: 'platinum-sky',
    nameAr: 'السماء البلاتينية الصافية',
    nameEn: 'Clear Platinum Sky',
    primary: '#BAE6FD',
    secondary: '#0EA5E9',
    accent: '#F0F9FF',
    glow: 'rgba(186, 230, 253, 0.5)',
    gradient: 'from-[#E0F2FE] via-[#7DD3FC] to-[#0369A1]'
  },
  {
    id: 'sahara-gold',
    nameAr: 'ذهب الصحراء الدافئ',
    nameEn: 'Warm Sahara Sand Gold',
    primary: '#FCD34D',
    secondary: '#B45309',
    accent: '#FEF3C7',
    glow: 'rgba(252, 211, 77, 0.4)',
    gradient: 'from-[#FDE68A] via-[#F59E0B] to-[#78350F]'
  },
  {
    id: 'arctic-mint',
    nameAr: 'النعناع القطبي المنعش',
    nameEn: 'Refreshing Arctic Mint',
    primary: '#CCFBF1',
    secondary: '#0D9488',
    accent: '#F0FDFA',
    glow: 'rgba(204, 251, 241, 0.4)',
    gradient: 'from-[#F0FDFA] via-[#99F6E4] to-[#115E59]'
  },
  {
    id: 'forest-velvet',
    nameAr: 'المخمل الأخضر الغابوي',
    nameEn: 'Deep Forest Green Velvet',
    primary: '#065F46',
    secondary: '#022C22',
    accent: '#A7F3D0',
    glow: 'rgba(6, 95, 70, 0.5)',
    gradient: 'from-[#065F46] via-[#047857] to-[#022C22]'
  },
  {
    id: 'sunset-quartz',
    nameAr: 'كوارتز غروب الشمس الزهري',
    nameEn: 'Pink Sunset Quartz Glow',
    primary: '#F472B6',
    secondary: '#9D174D',
    accent: '#FCE7F3',
    glow: 'rgba(244, 114, 182, 0.45)',
    gradient: 'from-[#FBCFE8] via-[#F472B6] to-[#831843]'
  },
  {
    id: 'deep-pearl',
    nameAr: 'عرق اللؤلؤ الصدفي',
    nameEn: 'Iridescent Deep Pearl',
    primary: '#E2E8F0',
    secondary: '#64748B',
    accent: '#F8FAFC',
    glow: 'rgba(226, 232, 240, 0.4)',
    gradient: 'from-[#F8FAFC] via-[#CBD5E1] to-[#475569]'
  },
  {
    id: 'onyx-gold',
    nameAr: 'أونيكس أسود بلمسة ذهبية',
    nameEn: 'Onyx Black & Gold Spark',
    primary: '#D4AF37',
    secondary: '#000000',
    accent: '#FFFFFF',
    glow: 'rgba(212, 175, 55, 0.3)',
    gradient: 'from-[#1A1A1A] via-[#000000] to-[#85580C]'
  },
  {
    id: 'electric-blue',
    nameAr: 'الأزرق الكهربائي المتوهج',
    nameEn: 'Vibrant Electric Blue',
    primary: '#2563EB',
    secondary: '#1E3A8A',
    accent: '#DBEAFE',
    glow: 'rgba(37, 99, 235, 0.6)',
    gradient: 'from-[#3B82F6] via-[#2563EB] to-[#1E3A8A]'
  },
  {
    id: 'vintage-rose',
    nameAr: 'الورد الكلاسيكي المعتق',
    nameEn: 'Aged Vintage Rose',
    primary: '#FDA4AF',
    secondary: '#881337',
    accent: '#FFF1F2',
    glow: 'rgba(253, 164, 175, 0.4)',
    gradient: 'from-[#FFE4E6] via-[#FB7185] to-[#4C0519]'
  },
  {
    id: 'deep-space-purple',
    nameAr: 'الفضاء البنفسجي العميق',
    nameEn: 'Deep Space Purple',
    primary: '#4C1D95',
    secondary: '#2E1065',
    accent: '#DDD6FE',
    glow: 'rgba(76, 29, 149, 0.5)',
    gradient: 'from-[#4C1D95] via-[#5B21B6] to-[#1E1B4B]'
  },
  {
    id: 'ocean-mist',
    nameAr: 'ضباب المحيط الأزرق',
    nameEn: 'Ocean Mist Blue',
    primary: '#0891B2',
    secondary: '#0E7490',
    accent: '#A5F3FC',
    glow: 'rgba(8, 145, 178, 0.5)',
    gradient: 'from-[#0891B2] via-[#06B6D4] to-[#164E63]'
  },
  {
    id: 'sunset-glow',
    nameAr: 'توهج الغروب الدافئ',
    nameEn: 'Warm Sunset Glow',
    primary: '#EA580C',
    secondary: '#9A3412',
    accent: '#FED7AA',
    glow: 'rgba(234, 88, 12, 0.5)',
    gradient: 'from-[#EA580C] via-[#C2410C] to-[#7C2D12]'
  },
  {
    id: 'forest-shadow',
    nameAr: 'ظلال الغابة الخضراء',
    nameEn: 'Forest Shadow Green',
    primary: '#166534',
    secondary: '#064E3B',
    accent: '#BBF7D0',
    glow: 'rgba(22, 101, 52, 0.5)',
    gradient: 'from-[#166534] via-[#15803D] to-[#064E3B]'
  },
  {
    id: 'royal-plum',
    nameAr: 'البرقوق الملكي الفاخر',
    nameEn: 'Royal Plum Luxury',
    primary: '#701A75',
    secondary: '#4A044E',
    accent: '#F5D0FE',
    glow: 'rgba(112, 26, 117, 0.5)',
    gradient: 'from-[#701A75] via-[#86198F] to-[#4A044E]'
  },
  {
    id: 'copper-mist',
    nameAr: 'ضباب النحاس الأنيق',
    nameEn: 'Elegant Copper Mist',
    primary: '#B45309',
    secondary: '#78350F',
    accent: '#FDE68A',
    glow: 'rgba(180, 83, 9, 0.5)',
    gradient: 'from-[#B45309] via-[#D97706] to-[#78350F]'
  }
];

// 20 Distinct App Icon Styles (Cleaned & Unique)
// 30 Brand-New App Icon Styles (Including Borderless / Frame-Free Options)
export const ICON_3D_STYLES: Icon3DStyle[] = [
  {
    id: 'style-borderless-pure',
    nameAr: 'بدون إطار نقي (Borderless Pure)',
    nameEn: 'Pure Borderless Icon',
    cardClass: 'bg-transparent border-0 shadow-none rounded-none',
    iconClass: 'text-[var(--theme-primary)] drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]',
    previewBg: 'from-zinc-900 to-black',
    descriptionAr: 'أيقونة نقية بدون إطار أو حدود تظهر مباشرة فوق الخلفية بلون السمة',
    iconProps: { strokeWidth: 2 }
  },
  {
    id: 'style-borderless-neon',
    nameAr: 'بدون إطار توهج نيون (Borderless Neon)',
    nameEn: 'Borderless Neon Glow',
    cardClass: 'bg-transparent border-0 shadow-none',
    iconClass: 'text-[var(--theme-primary)] drop-shadow-[0_0_12px_var(--theme-glow)]',
    previewBg: 'from-zinc-900 to-black',
    descriptionAr: 'أيقونة بدون إطار مع توهج نيون مضيء يتبع لون التطبيق',
    iconProps: { strokeWidth: 2.2 }
  },
  {
    id: 'style-borderless-soft',
    nameAr: 'بدون إطار شفاف ناعم (Borderless Soft)',
    nameEn: 'Soft Borderless',
    cardClass: 'bg-white/[0.04] border-0 shadow-sm rounded-2xl',
    iconClass: 'text-[var(--theme-primary)]',
    previewBg: 'from-zinc-800 to-zinc-900',
    descriptionAr: 'خلفية شفافة ناعمة بدون حدود خارجية ظاهرة للأيقونة',
    iconProps: { strokeWidth: 1.8 }
  },
  {
    id: 'style-borderless-shadow',
    nameAr: 'بدون إطار مع ظل بارز (Borderless Shadow)',
    nameEn: 'Borderless Drop Shadow',
    cardClass: 'bg-transparent border-0 shadow-none',
    iconClass: 'text-[var(--theme-primary)] drop-shadow-[0_8px_16px_rgba(0,0,0,0.8)]',
    previewBg: 'from-zinc-900 to-black',
    descriptionAr: 'أيقونة بارزة بدون إطار مع ظل عميق يمنحها بروزاً ثلاثي الأبعاد',
    iconProps: { strokeWidth: 2.5 }
  },
  {
    id: 'style-borderless-gradient',
    nameAr: 'بدون إطار تدرج لوني (Borderless Gradient)',
    nameEn: 'Borderless Color Gradient',
    cardClass: 'bg-transparent border-0 shadow-none',
    iconClass: 'text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]',
    previewBg: 'from-fuchsia-600 to-indigo-600',
    descriptionAr: 'أيقونة ملونة بتدرج لوني ساحر دون أي حدود أو إطارات',
    iconProps: { strokeWidth: 2, fill: 'rgba(255,255,255,0.25)' }
  },
  {
    id: 'style-borderless-minimal',
    nameAr: 'بدون إطار مبسط (Borderless Minimal)',
    nameEn: 'Minimalist Borderless',
    cardClass: 'bg-transparent border-0 shadow-none',
    iconClass: 'text-white hover:text-[var(--theme-primary)] transition-colors',
    previewBg: 'from-zinc-900 to-black',
    descriptionAr: 'تصميم فائق البساطة بدون إطارات أو خلفيات ثقيلة',
    iconProps: { strokeWidth: 1.5 }
  },
  {
    id: 'style-borderless-vibrant',
    nameAr: 'بدون إطار حيوي (Borderless Vibrant)',
    nameEn: 'Vibrant Borderless',
    cardClass: 'bg-transparent border-0 shadow-none',
    iconClass: 'text-[var(--theme-primary)] drop-shadow-[0_0_8px_var(--theme-primary)]',
    previewBg: 'from-zinc-900 to-black',
    descriptionAr: 'أيقونة حيوية مشعة بدون إطار خارجي مقيد',
    iconProps: { strokeWidth: 2.2 }
  },
  {
    id: 'style-borderless-crystal',
    nameAr: 'بدون إطار كريستالي (Borderless Crystal)',
    nameEn: 'Crystal Borderless',
    cardClass: 'bg-transparent border-0 shadow-none',
    iconClass: 'text-[var(--theme-primary)] drop-shadow-[0_4px_12px_rgba(255,255,255,0.3)]',
    previewBg: 'from-emerald-950 to-black',
    descriptionAr: 'بريق كريستالي حر بدون حدود هندسية خارجية',
    iconProps: { strokeWidth: 1.8 }
  },
  {
    id: 'style-borderless-pearl',
    nameAr: 'بدون إطار لؤلؤي (Borderless Pearl)',
    nameEn: 'Pearl Borderless',
    cardClass: 'bg-transparent border-0 shadow-none',
    iconClass: 'text-slate-100 drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]',
    previewBg: 'from-slate-800 to-slate-950',
    descriptionAr: 'أيقونة لؤلؤية ناصعة بلا حدود أو قيود',
    iconProps: { strokeWidth: 2 }
  },
  {
    id: 'style-borderless-sunset',
    nameAr: 'بدون إطار شفق الغروب (Borderless Sunset)',
    nameEn: 'Sunset Borderless',
    cardClass: 'bg-transparent border-0 shadow-none',
    iconClass: 'text-amber-400 drop-shadow-[0_4px_10px_rgba(251,146,60,0.5)]',
    previewBg: 'from-amber-950 to-black',
    descriptionAr: 'أيقونة بوهيمية متوهجة بدون إطار تظهر بانسيابية',
    iconProps: { strokeWidth: 2 }
  },
  {
    id: 'style-royal-3d',
    nameAr: 'مجسم ملكي فاخر (Royal 3D)',
    nameEn: 'Royal 3D Luxury',
    cardClass: 'bg-gradient-to-br from-[var(--theme-primary)] via-[var(--theme-secondary)] to-black shadow-[0_10px_20px_rgba(0,0,0,0.4),inset_0_2px_4px_rgba(255,255,255,0.3)] border border-[var(--theme-primary)]/50 rounded-2xl',
    iconClass: 'drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] text-white',
    previewBg: 'from-gold to-zinc-900',
    descriptionAr: 'تصميم ملكي مجسم ببريق عالي وانعكاسات غنية تتبع اللون المختار',
    iconProps: { strokeWidth: 2.5, fill: 'rgba(255,255,255,0.2)' }
  },
  {
    id: 'style-chrome-3d',
    nameAr: 'كروم فضي مصقول (Chrome 3D)',
    nameEn: 'Silver 3D Chrome',
    cardClass: 'bg-gradient-to-br from-slate-200 via-slate-400 to-slate-700 shadow-[0_10px_20px_rgba(0,0,0,0.4),inset_0_2px_4px_rgba(255,255,255,0.8)] border border-slate-200/50 rounded-2xl',
    iconClass: 'drop-shadow-[0_4px_4px_rgba(0,0,0,0.3)] text-slate-900',
    previewBg: 'from-slate-200 to-slate-600',
    descriptionAr: 'كروم فضي مصقول بلمعان مرآتي وتأثير معدني بارز',
    iconProps: { strokeWidth: 2, fill: 'rgba(0,0,0,0.1)' }
  },
  {
    id: 'style-flat-minimalist',
    nameAr: 'بسيط مسطح أنيق (Flat Minimal)',
    nameEn: 'Flat Minimalist Box',
    cardClass: 'bg-zinc-900 border border-zinc-800 rounded-xl',
    iconClass: 'text-[var(--theme-primary)] transition-colors',
    previewBg: 'from-zinc-800 to-zinc-900',
    descriptionAr: 'تصميم عصري بسيط يبرز اللون المختار في الأيقونة',
    iconProps: { strokeWidth: 1.5 }
  },
  {
    id: 'style-neon-box',
    nameAr: 'توهج نيون محيط (Neon Glow Box)',
    nameEn: 'Neon Glow Box',
    cardClass: 'bg-black border-2 border-[var(--theme-primary)] shadow-[0_0_20px_var(--theme-glow)] rounded-full',
    iconClass: 'text-[var(--theme-primary)] drop-shadow-[0_0_8px_var(--theme-glow)]',
    previewBg: 'from-zinc-900 to-black',
    descriptionAr: 'توهج ضوئي نيون مكثف داخل إطار دائري يتبع اللون الذي تختاره',
    iconProps: { strokeWidth: 2 }
  },
  {
    id: 'style-glassmorphism',
    nameAr: 'زجاجي شفاف فاخر (Glassmorphism)',
    nameEn: 'Glassmorphism Card',
    cardClass: 'bg-white/10 border border-white/20 shadow-sm rounded-3xl',
    iconClass: 'text-[var(--theme-primary)]',
    previewBg: 'from-indigo-500/20 to-purple-500/20',
    descriptionAr: 'تأثير الزجاج الشفاف مع خلفية ضبابية ولمسات من اللون المختار',
    iconProps: { strokeWidth: 1.2, fill: 'rgba(255,255,255,0.1)' }
  },
  {
    id: 'style-cartoon-clay',
    nameAr: 'كرتون ثلاثي الأبعاد بارز (Cartoon Clay)',
    nameEn: 'Cartoon 3D Clay',
    cardClass: 'bg-[var(--theme-primary)] shadow-[0_8px_0_var(--theme-secondary)] border-4 border-white rounded-[2rem]',
    iconClass: 'text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]',
    previewBg: 'from-orange-400 to-orange-600',
    descriptionAr: 'نمط كرتوني مرح بألوان زاهية بارزة تتبع اختيارك',
    iconProps: { strokeWidth: 3, size: 32 }
  },
  {
    id: 'style-brushed-metal',
    nameAr: 'معدن خشن مصقول (Brushed Metal)',
    nameEn: 'Brushed Metallic',
    cardClass: 'bg-zinc-800 border-2 border-zinc-600 shadow-inner rounded-lg',
    iconClass: 'text-[var(--theme-primary)] drop-shadow-[1px_1px_1px_rgba(255,255,255,0.5)]',
    previewBg: 'from-zinc-700 to-zinc-900',
    descriptionAr: 'نسيج معدني خشن بلمسة من اللون المختار',
    iconProps: { strokeWidth: 2.5 }
  },
  {
    id: 'style-colorful-gradient',
    nameAr: 'تدرج لوني ديناميكي (Colorful Gradient)',
    nameEn: 'Colorful Gradient Box',
    cardClass: 'bg-gradient-to-tr from-[var(--theme-primary)] via-[var(--theme-secondary)] to-black shadow-lg rounded-2xl rotate-3 hover:rotate-0 transition-transform',
    iconClass: 'text-white',
    previewBg: 'from-fuchsia-500 to-indigo-500',
    descriptionAr: 'انفجار من الألوان المتدرجة والحيوية بتصميم ديناميكي',
    iconProps: { strokeWidth: 2, fill: 'rgba(255,255,255,0.3)' }
  },
  {
    id: 'style-dashed-outline',
    nameAr: 'إطار منقط فني (Dashed Outline)',
    nameEn: 'Dashed Outline Minimal',
    cardClass: 'bg-transparent border-2 border-dashed border-[var(--theme-primary)]/40 rounded-xl',
    iconClass: 'text-[var(--theme-primary)]',
    previewBg: 'from-transparent to-transparent',
    descriptionAr: 'تركيز كامل على الخطوط المقطعة بأسلوب فني يتبع اللون المختار',
    iconProps: { strokeWidth: 1 }
  },
  {
    id: 'style-rounded-pill',
    nameAr: 'كبسولة دائرية عصرية (Rounded Pill)',
    nameEn: 'Rounded Pill Modern',
    cardClass: 'bg-white shadow-[0_10px_25px_rgba(0,0,0,0.1)] rounded-[3rem]',
    iconClass: 'text-[var(--theme-primary)]',
    previewBg: 'from-slate-100 to-slate-200',
    descriptionAr: 'حواف دائرية للغاية مع تصميم نظيف وأيقونة ملونة',
    iconProps: { strokeWidth: 2, size: 28 }
  },
  {
    id: 'style-cyberpunk-glitch',
    nameAr: 'سايبربانك متمرد (Cyberpunk Glitch)',
    nameEn: 'Cyberpunk Glitch',
    cardClass: 'bg-black border-l-4 border-[var(--theme-primary)] shadow-[5px_5px_0_var(--theme-secondary),-5px_-5px_0_var(--theme-glow)] rounded-none skew-x-[-10deg]',
    iconClass: 'text-white drop-shadow-[2px_2px_0_var(--theme-primary)]',
    previewBg: 'from-zinc-900 to-black',
    descriptionAr: 'روح السايبربانك المتمردة مع ألوان تتبع اختيارك',
    iconProps: { strokeWidth: 2 }
  },
  {
    id: 'style-jewel-crystal',
    nameAr: 'جوهرة كريستالية هندسية (Jewel Crystal)',
    nameEn: 'Jewel Crystal Polygon',
    cardClass: 'bg-[var(--theme-primary)]/20 border-2 border-[var(--theme-primary)]/50 [clip-path:polygon(50%_0%,100%_25%,100%_75%,50%_100%,0%_75%,0%_25%)]',
    iconClass: 'text-[var(--theme-primary)]',
    previewBg: 'from-emerald-900 to-black',
    descriptionAr: 'أشكال هندسية كريستالية ببريق اللون المختار',
    iconProps: { strokeWidth: 1.5, fill: 'rgba(255,255,255,0.1)' }
  },
  {
    id: 'style-luxury-matte',
    nameAr: 'فخامة مطفأة (Luxury Matte)',
    nameEn: 'Luxury Matte Theme',
    cardClass: 'bg-white/[0.06] border border-[var(--theme-primary)]/45 shadow-lg rounded-tr-[3rem] rounded-bl-[3rem]',
    iconClass: 'text-[var(--theme-primary)] drop-shadow-[0_2px_4px_var(--theme-glow)]',
    previewBg: 'from-zinc-900 to-black',
    descriptionAr: 'مزيج النخبة بين الأسود المطفي واللون المختار بتصميم أرستقراطي',
    iconProps: { strokeWidth: 2, fill: 'currentColor' }
  },
  {
    id: 'style-futuristic-tech',
    nameAr: 'تقني مستقبلي (Futuristic Tech)',
    nameEn: 'Futuristic Tech HUD',
    cardClass: 'bg-[var(--theme-primary)]/10 border border-[var(--theme-primary)]/40 shadow-[inset_0_0_15px_var(--theme-glow)] rounded-lg relative overflow-hidden',
    iconClass: 'text-[var(--theme-primary)]',
    previewBg: 'from-sky-950 to-black',
    descriptionAr: 'واجهة تقنية مستقبلية تتبع اختيارك اللوني بدقة',
    iconProps: { strokeWidth: 1.5 }
  },
  {
    id: 'style-stitched-leather',
    nameAr: 'جلد طبيعي مطرز (Stitched Leather)',
    nameEn: 'Stitched Luxury Leather',
    cardClass: 'bg-[#3d2b1f] shadow-inner border-2 border-[#2a1d15] rounded-xl',
    iconClass: 'text-[var(--theme-primary)] drop-shadow-[0_1px_1px_rgba(255,255,255,0.1)]',
    previewBg: 'from-[#3d2b1f] to-[#1a120c]',
    descriptionAr: 'لمسة الجلد الطبيعي الفاخر مع اللون المختار',
    iconProps: { strokeWidth: 2, fill: 'rgba(255,255,255,0.1)' }
  },
  {
    id: 'style-polished-wood',
    nameAr: 'خشب عتيق مصقول (Polished Wood)',
    nameEn: 'Noble Polished Wood',
    cardClass: 'bg-gradient-to-br from-[#5d4037] to-[#2b1d19] shadow-xl border border-[#795548]/30 rounded-lg',
    iconClass: 'text-[var(--theme-primary)] drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]',
    previewBg: 'from-[#5d4037] to-[#2b1d19]',
    descriptionAr: 'دفء الخشب الكلاسيكي المصقول بلمسة لونية مختارة',
    iconProps: { strokeWidth: 1.5, fill: 'rgba(255,255,255,0.1)' }
  },
  {
    id: 'style-iridescent-hologram',
    nameAr: 'هولوجرام مشع (Iridescent Hologram)',
    nameEn: 'Iridescent Hologram',
    cardClass: 'bg-gradient-to-br from-[var(--theme-primary)] via-fuchsia-400 to-[var(--theme-secondary)] opacity-90 shadow-lg rounded-full',
    iconClass: 'text-white mix-blend-overlay',
    previewBg: 'from-cyan-200 to-fuchsia-200',
    descriptionAr: 'ألوان قوس قزح المتغيرة تتبع اللون المختار',
    iconProps: { strokeWidth: 2, fill: 'rgba(255,255,255,0.4)' }
  },
  {
    id: 'style-pixel-retro-8bit',
    nameAr: 'بكسل آرت كلاسيكي (8-Bit Retro)',
    nameEn: '8-Bit Pixel Retro',
    cardClass: 'bg-[var(--theme-primary)]/80 border-4 border-[#ffffff] shadow-[8px_8px_0_#000000] rounded-none',
    iconClass: 'text-white [image-rendering:pixelated]',
    previewBg: 'from-blue-900 to-black',
    descriptionAr: 'حنين الألعاب الكلاسيكية باللون المختار',
    iconProps: { strokeWidth: 3 }
  },
  {
    id: 'style-scifi-hud-display',
    nameAr: 'شاشة خيال علمي (Sci-Fi HUD)',
    nameEn: 'Futuristic HUD Interface',
    cardClass: 'bg-black/60 border-t-2 border-b-2 border-[var(--theme-primary)] shadow-[0_0_16px_var(--theme-glow)] rounded-none',
    iconClass: 'text-[var(--theme-primary)]',
    previewBg: 'from-black to-sky-950',
    descriptionAr: 'شاشات العرض المستقبلية بلونك المختار',
    iconProps: { strokeWidth: 1, size: 24 }
  },
  {
    id: 'style-carbon-fiber-tech',
    nameAr: 'ألياف الكربون التقنية (Carbon Fiber)',
    nameEn: 'High-Tech Carbon Fiber',
    cardClass: 'bg-zinc-900/75 border-2 border-[var(--theme-primary)]/40 shadow-lg rounded-lg [background-image:linear-gradient(45deg,#1a1a1a_25%,transparent_25%),linear-gradient(-45deg,#1a1a1a_25%,transparent_25%)] [background-size:4px_4px]',
    iconClass: 'text-[var(--theme-primary)] drop-shadow-[0_0_10px_var(--theme-glow)]',
    previewBg: 'from-zinc-800 to-black',
    descriptionAr: 'نسيج ألياف الكربون التقني مطعّم باللون المختار',
    iconProps: { strokeWidth: 2 }
  },
  {
    id: 'style-icon-cinema', nameAr: 'سينمائي كلاسيكي', nameEn: 'Cinema Signature',
    cardClass: 'bg-gradient-to-br from-amber-500/25 via-zinc-900 to-black border border-amber-300/50 rounded-2xl shadow-lg',
    iconClass: 'text-amber-200 drop-shadow-[0_0_8px_rgba(245,158,11,.55)]', previewBg: 'from-amber-700 to-zinc-950',
    descriptionAr: 'أيقونات سينمائية بتفاصيل شريط الفيلم وشاشة العرض', glyphVariant: 'cinema', iconProps: { strokeWidth: 2.1 }
  },
  {
    id: 'style-icon-broadcast', nameAr: 'بث مباشر احترافي', nameEn: 'Broadcast Pro',
    cardClass: 'bg-gradient-to-br from-cyan-500/25 to-slate-950 border border-cyan-300/45 rounded-xl shadow-[0_0_16px_rgba(6,182,212,.2)]',
    iconClass: 'text-cyan-200 drop-shadow-[0_0_8px_rgba(34,211,238,.55)]', previewBg: 'from-cyan-700 to-slate-950',
    descriptionAr: 'أيقونات بث وهوائيات بإحساس تقني واضح', glyphVariant: 'broadcast', iconProps: { strokeWidth: 2 }
  },
  {
    id: 'style-icon-crystal', nameAr: 'كريستال هندسي', nameEn: 'Crystal Geometry',
    cardClass: 'bg-gradient-to-br from-violet-300/25 via-indigo-950 to-black border border-violet-200/45 rounded-2xl shadow-lg',
    iconClass: 'text-violet-100 drop-shadow-[0_0_10px_rgba(196,181,253,.5)]', previewBg: 'from-violet-700 to-indigo-950',
    descriptionAr: 'أيقونات هندسية متعددة الأوجه بلمعة كريستالية', glyphVariant: 'crystal', iconProps: { strokeWidth: 1.8, fill: 'rgba(196,181,253,.16)' }
  },
  {
    id: 'style-icon-neon', nameAr: 'نيون مستقبلي', nameEn: 'Neon Future',
    cardClass: 'bg-black border-2 border-fuchsia-400/70 rounded-full shadow-[0_0_18px_rgba(217,70,239,.3)]',
    iconClass: 'text-fuchsia-200 drop-shadow-[0_0_10px_rgba(232,121,249,.85)]', previewBg: 'from-fuchsia-700 to-black',
    descriptionAr: 'أيقونات بخطوط مضيئة ولمسات مستقبلية', glyphVariant: 'neon', iconProps: { strokeWidth: 2.3 }
  },
  {
    id: 'style-icon-retro', nameAr: 'ريترو بيكسل', nameEn: 'Retro Pixel',
    cardClass: 'bg-gradient-to-br from-emerald-900 to-zinc-950 border-2 border-emerald-400/50 rounded-lg shadow-[4px_4px_0_rgba(16,185,129,.25)]',
    iconClass: 'text-emerald-200', previewBg: 'from-emerald-700 to-zinc-950',
    descriptionAr: 'أيقونات مستوحاة من أجهزة الألعاب والشاشات الكلاسيكية', glyphVariant: 'retro', iconProps: { strokeWidth: 2.5 }
  }
];

// Every selectable icon style maps to a real glyph family, not only a frame/color treatment.
const ICON_STYLE_GLYPH_MAP: Record<string, NonNullable<Icon3DStyle['glyphVariant']>> = {
  'style-borderless-pure': 'cinema',
  'style-borderless-neon': 'neon',
  'style-borderless-soft': 'crystal',
  'style-borderless-shadow': 'broadcast',
  'style-borderless-gradient': 'retro',
  'style-borderless-minimal': 'cinema',
  'style-borderless-vibrant': 'neon',
  'style-borderless-crystal': 'crystal',
  'style-borderless-pearl': 'crystal',
  'style-borderless-sunset': 'cinema',
  'style-royal-3d': 'crystal',
  'style-chrome-3d': 'broadcast',
  'style-flat-minimalist': 'retro',
  'style-neon-box': 'neon',
  'style-glassmorphism': 'crystal',
  'style-cartoon-clay': 'retro',
  'style-brushed-metal': 'broadcast',
  'style-colorful-gradient': 'cinema',
  'style-dashed-outline': 'broadcast',
  'style-rounded-pill': 'crystal',
  'style-cyberpunk-glitch': 'neon',
  'style-jewel-crystal': 'crystal',
  'style-luxury-matte': 'cinema',
  'style-futuristic-tech': 'broadcast',
  'style-stitched-leather': 'retro',
  'style-polished-wood': 'cinema',
  'style-iridescent-hologram': 'crystal',
  'style-pixel-retro-8bit': 'retro',
  'style-scifi-hud-display': 'broadcast',
  'style-carbon-fiber-tech': 'neon'
};

export const getIconGlyphVariant = (style: Icon3DStyle): NonNullable<Icon3DStyle['glyphVariant']> =>
  style.glyphVariant || ICON_STYLE_GLYPH_MAP[style.id] || 'cinema';

// 40 Unique Natural & Scenic Static Photography Wallpapers
export const APP_BACKGROUNDS: AppBackground[] = [
  {
    id: 'bg-raouche-rocks-beirut',
    nameAr: 'صخرة الروشة في بيروت، لبنان',
    nameEn: 'Raouche Rocks, Beirut, Lebanon',
    type: 'static',
    descriptionAr: 'المشهد الساحلي الشهير لصخرة الروشة في بيروت عند الغروب على البحر المتوسط',
    descriptionEn: 'Iconic Raouche sea arches in Beirut, Lebanon at golden twilight',
    previewColor: '#0284c7',
    previewGradient: 'linear-gradient(135deg, #f59e0b 0%, #0c4a6e 100%)',
    imageUrl: '/backgrounds/nature/bg_01_raouche_rocks_beirut.jpg',
    renderClass: 'bg-raouche-rocks-beirut'
  },
  {
    id: 'bg-ny-manhattan-twilight',
    nameAr: 'أفق مانهاتن ونيويورك عند الشفق',
    nameEn: 'New York Manhattan Twilight Skyline',
    type: 'static',
    descriptionAr: 'أبراج مانهاتن المضيئة ومبنى إمباير ستيت فوق نهر هدسون',
    descriptionEn: 'Manhattan skyscrapers and Empire State Building glowing over Hudson River',
    previewColor: '#1d4ed8',
    previewGradient: 'linear-gradient(135deg, #3b82f6 0%, #0f172a 100%)',
    imageUrl: '/backgrounds/nature/bg_02_ny_manhattan_twilight.jpg',
    renderClass: 'bg-ny-manhattan-twilight'
  },
  {
    id: 'bg-ny-brooklyn-bridge',
    nameAr: 'جسر بروكلين وأضواء نيويورك',
    nameEn: 'Brooklyn Bridge & East River Lights',
    type: 'static',
    descriptionAr: 'جسر بروكلين العريق المضاء ليلاً أمام ناطحات سحاب مانهاتن',
    descriptionEn: 'Illuminated Brooklyn Bridge and Lower Manhattan skyline at dusk',
    previewColor: '#0369a1',
    previewGradient: 'linear-gradient(135deg, #38bdf8 0%, #1e293b 100%)',
    imageUrl: '/backgrounds/nature/bg_03_ny_brooklyn_bridge.jpg',
    renderClass: 'bg-ny-brooklyn-bridge'
  },
  {
    id: 'bg-ny-central-park',
    nameAr: 'سنترال بارك وأبراج نيويورك',
    nameEn: 'New York Central Park Dusk',
    type: 'static',
    descriptionAr: 'أشجار سنترال بارك الدافئة أمام أفق ناطحات سحاب نيويورك',
    descriptionEn: 'Autumn foliage of Central Park framed by Manhattan towers at sunset',
    previewColor: '#b45309',
    previewGradient: 'linear-gradient(135deg, #f59e0b 0%, #1e293b 100%)',
    imageUrl: '/backgrounds/nature/bg_04_ny_central_park.jpg',
    renderClass: 'bg-ny-central-park'
  },
  {
    id: 'bg-ny-midtown-avenue',
    nameAr: 'شوارع نيويورك وأضواء الليل',
    nameEn: 'New York Midtown Rainy Night',
    type: 'static',
    descriptionAr: 'شارع نيويورك المضاء ليلاً تحت المطر الخفيف وأضواء الأبراج',
    descriptionEn: 'Warm glowing street lights and Midtown towers in evening rain',
    previewColor: '#334155',
    previewGradient: 'linear-gradient(135deg, #f59e0b 0%, #0f172a 100%)',
    imageUrl: '/backgrounds/nature/bg_05_ny_midtown_avenue.jpg',
    renderClass: 'bg-ny-midtown-avenue'
  },
  {
    id: 'bg-tropical-palm-beach',
    nameAr: 'شاطئ النخيل الاستوائي عند الغروب',
    nameEn: 'Tropical Palm Beach Sunset',
    type: 'static',
    descriptionAr: 'أمواج هادئة وظلال أشجار النخيل على رمال الشاطئ عند الغروب',
    descriptionEn: 'Tranquil ocean waves along a palm-lined beach under dusk clouds',
    previewColor: '#ea580c',
    previewGradient: 'linear-gradient(135deg, #fb923c 0%, #0f172a 100%)',
    imageUrl: '/backgrounds/nature/bg_06_tropical_palm_beach.jpg',
    renderClass: 'bg-tropical-palm-beach'
  },
  {
    id: 'bg-maldives-lagoon-dusk',
    nameAr: 'بحيرة المالديف والجسر الخشبي',
    nameEn: 'Maldives Turquoise Lagoon Dusk',
    type: 'static',
    descriptionAr: 'مياه المالديف الفيروزية الهادئة والجسر الخشبي المضاء مساءً',
    descriptionEn: 'Calm Maldives turquoise bay and glowing wooden pier at twilight',
    previewColor: '#0891b2',
    previewGradient: 'linear-gradient(135deg, #22d3ee 0%, #0f172a 100%)',
    imageUrl: '/backgrounds/nature/bg_07_maldives_lagoon_dusk.jpg',
    renderClass: 'bg-maldives-lagoon-dusk'
  },
  {
    id: 'bg-mediterranean-cove',
    nameAr: 'خليج البحر المتوسط والمنحدرات الصخرية',
    nameEn: 'Mediterranean Coastal Cove',
    type: 'static',
    descriptionAr: 'زرقة البحر المتوسط العميقة ومنحدراته الصخرية تحت أضواء الساحل',
    descriptionEn: 'Sapphire Mediterranean sea beside rugged cliffs at blue hour',
    previewColor: '#0284c7',
    previewGradient: 'linear-gradient(135deg, #38bdf8 0%, #0c4a6e 100%)',
    imageUrl: '/backgrounds/nature/bg_08_mediterranean_cove.jpg',
    renderClass: 'bg-mediterranean-cove'
  },
  {
    id: 'bg-coral-bay-twilight',
    nameAr: 'خليج الشعاب المرجانية والمياه الفيروزية',
    nameEn: 'Tropical Coral Lagoon Bay',
    type: 'static',
    descriptionAr: 'خليج فيروزي صافي تحيط به الجبال الخضراء تحت سماء الغروب',
    descriptionEn: 'Aerial view of a calm turquoise coral bay surrounded by green hills',
    previewColor: '#0d9488',
    previewGradient: 'linear-gradient(135deg, #2dd4bf 0%, #064e3b 100%)',
    imageUrl: '/backgrounds/nature/bg_09_coral_bay_twilight.jpg',
    renderClass: 'bg-coral-bay-twilight'
  },
  {
    id: 'bg-ocean-waves-volcanic',
    nameAr: 'أمواج المحيط والشاطئ البازلتي',
    nameEn: 'Ocean Waves & Basalt Shore',
    type: 'static',
    descriptionAr: 'أمواج البحر الهادئة تتكسر على الصخور الداكنة عند المغيب',
    descriptionEn: 'Gentle twilight waves rolling over dark coastal stone shore',
    previewColor: '#0f766e',
    previewGradient: 'linear-gradient(135deg, #14b8a6 0%, #0f172a 100%)',
    imageUrl: '/backgrounds/nature/bg_10_ocean_waves_volcanic.jpg',
    renderClass: 'bg-ocean-waves-volcanic'
  },
  {
    id: 'bg-niagara-falls-dusk',
    nameAr: 'شلالات نياجارا عند الغسق',
    nameEn: 'Niagara Falls Twilight Mist',
    type: 'static',
    descriptionAr: 'بانوراما شلالات نياجارا المهيبة وسط الضباب وألوان الشفق الزرقاء',
    descriptionEn: 'Panoramic Niagara waterfalls surging beneath blue hour clouds',
    previewColor: '#0284c7',
    previewGradient: 'linear-gradient(135deg, #38bdf8 0%, #082f49 100%)',
    imageUrl: '/backgrounds/nature/bg_11_niagara_falls_dusk.jpg',
    renderClass: 'bg-niagara-falls-dusk'
  },
  {
    id: 'bg-emerald-forest-waterfall',
    nameAr: 'شلال الغابة الزمردية والطحالب',
    nameEn: 'Emerald Forest Waterfall',
    type: 'static',
    descriptionAr: 'شلال ماء صافٍ ينساب بين الصخور المكسوة بالطحالب وسط الغابة',
    descriptionEn: 'Shaded woodland waterfall cascading over moss-covered rocks',
    previewColor: '#15803d',
    previewGradient: 'linear-gradient(135deg, #22c55e 0%, #052e16 100%)',
    imageUrl: '/backgrounds/nature/bg_12_emerald_forest_waterfall.jpg',
    renderClass: 'bg-emerald-forest-waterfall'
  },
  {
    id: 'bg-plitvice-lakes-falls',
    nameAr: 'بحيرات وشلالات بليتفيتش الفيروزية',
    nameEn: 'Plitvice Lakes & Waterfalls',
    type: 'static',
    descriptionAr: 'شلالات متعددة وبحيرات زمردية نقية وسط الغابات الكثيفة',
    descriptionEn: 'Cascading turquoise forest lakes linked by woodland waterfalls',
    previewColor: '#059669',
    previewGradient: 'linear-gradient(135deg, #34d399 0%, #064e3b 100%)',
    imageUrl: '/backgrounds/nature/bg_13_plitvice_lakes_falls.jpg',
    renderClass: 'bg-plitvice-lakes-falls'
  },
  {
    id: 'bg-stone-bridge-waterfall',
    nameAr: 'شلال الجسر الحجري وسط الغابة',
    nameEn: 'Stone Bridge Forest Waterfall',
    type: 'static',
    descriptionAr: 'جسر حجري عتيق يعلو شلالاً جبلياً محاطاً بأشجار الصنوبر الضبابية',
    descriptionEn: 'Historic mossy stone bridge spanning a misty forest waterfall',
    previewColor: '#166534',
    previewGradient: 'linear-gradient(135deg, #4ade80 0%, #14532d 100%)',
    imageUrl: '/backgrounds/nature/bg_14_stone_bridge_waterfall.jpg',
    renderClass: 'bg-stone-bridge-waterfall'
  },
  {
    id: 'bg-amazon-rainforest-river',
    nameAr: 'نهر الأمازون والغابات المطيرة',
    nameEn: 'Amazon Rainforest River',
    type: 'static',
    descriptionAr: 'تعرجات نهر الأمازون وسط غاباته المطيرة الخضراء تحت ضباب الغروب',
    descriptionEn: 'Winding rainforest river curving through dense emerald jungle canopy',
    previewColor: '#15803d',
    previewGradient: 'linear-gradient(135deg, #4ade80 0%, #052e16 100%)',
    imageUrl: '/backgrounds/nature/bg_15_amazon_rainforest_river.jpg',
    renderClass: 'bg-amazon-rainforest-river'
  },
  {
    id: 'bg-autumn-river-foliage',
    nameAr: 'نهر الخريف وأشجار القيقب الذهبية',
    nameEn: 'Autumn River & Maple Trees',
    type: 'static',
    descriptionAr: 'مجرى نهر هادئ يعكس ألوان أوراق الخريف الدافئة على ضفتيه',
    descriptionEn: 'Calm woodland stream reflecting warm amber and crimson autumn leaves',
    previewColor: '#c2410c',
    previewGradient: 'linear-gradient(135deg, #fb923c 0%, #431407 100%)',
    imageUrl: '/backgrounds/nature/bg_16_autumn_river_foliage.jpg',
    renderClass: 'bg-autumn-river-foliage'
  },
  {
    id: 'bg-aurora-lake-reflection',
    nameAr: 'الشفق القطبي وبحيرة الجبال',
    nameEn: 'Northern Lights Lake Reflection',
    type: 'static',
    descriptionAr: 'أضواء الشفق القطبي الخضراء تنعكس على بحيرة جبلية هادئة ليلاً',
    descriptionEn: 'Emerald aurora borealis glowing across a starry arctic mountain lake',
    previewColor: '#10b981',
    previewGradient: 'linear-gradient(135deg, #34d399 0%, #022c22 100%)',
    imageUrl: '/backgrounds/nature/bg_17_aurora_lake_reflection.jpg',
    renderClass: 'bg-aurora-lake-reflection'
  },
  {
    id: 'bg-moraine-lake-twilight',
    nameAr: 'بحيرة موراين وجبال روكي',
    nameEn: 'Moraine Lake Rocky Mountains',
    type: 'static',
    descriptionAr: 'بحيرة جليدية فيروزية تعكس القمم الجبلية الثلجية عند الغسق',
    descriptionEn: 'Deep turquoise glacial lake mirroring snow-capped Banff peaks',
    previewColor: '#0891b2',
    previewGradient: 'linear-gradient(135deg, #22d3ee 0%, #0f172a 100%)',
    imageUrl: '/backgrounds/nature/bg_18_moraine_lake_twilight.jpg',
    renderClass: 'bg-moraine-lake-twilight'
  },
  {
    id: 'bg-swiss-alps-matterhorn',
    nameAr: 'قمة ماترهورن بجبال الألب السويسرية',
    nameEn: 'Swiss Alps Matterhorn Twilight',
    type: 'static',
    descriptionAr: 'قمة ماترهورن المغطاة بالثلوج تحت سماء الشفق النيلية وأضواء الوادي',
    descriptionEn: 'Snowy Matterhorn peak under deep indigo sky and glowing alpine village',
    previewColor: '#1d4ed8',
    previewGradient: 'linear-gradient(135deg, #60a5fa 0%, #0f172a 100%)',
    imageUrl: '/backgrounds/nature/bg_19_swiss_alps_matterhorn.jpg',
    renderClass: 'bg-swiss-alps-matterhorn'
  },
  {
    id: 'bg-yosemite-misty-valley',
    nameAr: 'وادي يوسيميتي والضباب الصباحي',
    nameEn: 'Yosemite Misty Pine Valley',
    type: 'static',
    descriptionAr: 'جروف الجرانيت الشاهقة والضباب الهادئ بين أشجار الصنوبر والنهر',
    descriptionEn: 'El Capitan granite cliffs and drifting morning mist over pine valley',
    previewColor: '#166534',
    previewGradient: 'linear-gradient(135deg, #4ade80 0%, #0f172a 100%)',
    imageUrl: '/backgrounds/nature/bg_20_yosemite_misty_valley.jpg',
    renderClass: 'bg-yosemite-misty-valley'
  },
  {
    id: 'bg-dolomites-alpine-dusk',
    nameAr: 'جبال الدولوميت والمروج الإيطالية',
    nameEn: 'Italian Dolomites Evening Valley',
    type: 'static',
    descriptionAr: 'قمم الدولوميت الصخرية الشاهقة فوق المروج الخضراء وكوخ جبلي هادئ',
    descriptionEn: 'Jagged limestone peaks of the Dolomites over lush alpine meadows',
    previewColor: '#15803d',
    previewGradient: 'linear-gradient(135deg, #22c55e 0%, #1e293b 100%)',
    imageUrl: '/backgrounds/nature/bg_21_dolomites_alpine_dusk.jpg',
    renderClass: 'bg-dolomites-alpine-dusk'
  },
  {
    id: 'bg-mount-fuji-bluehour',
    nameAr: 'جبل فوجي وبحيرة كاواجوتشي',
    nameEn: 'Mount Fuji & Lake Reflection',
    type: 'static',
    descriptionAr: 'انعكاس قمة جبل فوجي البيضاء على صفحة البحيرة الساكنة وقت الغسق',
    descriptionEn: 'Snow-capped Mount Fuji reflecting calmly on Lake Kawaguchi at dusk',
    previewColor: '#2563eb',
    previewGradient: 'linear-gradient(135deg, #60a5fa 0%, #0f172a 100%)',
    imageUrl: '/backgrounds/nature/bg_22_mount_fuji_bluehour.jpg',
    renderClass: 'bg-mount-fuji-bluehour'
  },
  {
    id: 'bg-norway-fjord-mist',
    nameAr: 'مضيق جيرانجير فيورد النرويجي',
    nameEn: 'Norway Geirangerfjord Cliffs',
    type: 'static',
    descriptionAr: 'مضيق بحري عميق تحيط به جبال خضراء وشلالات تنحدر نحو المياه',
    descriptionEn: 'Steep emerald fjord walls with silver waterfalls in Norway',
    previewColor: '#0f766e',
    previewGradient: 'linear-gradient(135deg, #2dd4bf 0%, #0f172a 100%)',
    imageUrl: '/backgrounds/nature/bg_23_norway_fjord_mist.jpg',
    renderClass: 'bg-norway-fjord-mist'
  },
  {
    id: 'bg-winter-pine-forest',
    nameAr: 'غابة الصنوبر الثلجية والنهر المتجمد',
    nameEn: 'Snowy Alpine Pine Forest',
    type: 'static',
    descriptionAr: 'أشجار الصنوبر المغطاة بالثلوج على ضفاف نهر جبلي هادئ',
    descriptionEn: 'Tranquil snow-blanketed pine woodland and winter mountain stream',
    previewColor: '#1e40af',
    previewGradient: 'linear-gradient(135deg, #93c5fd 0%, #0f172a 100%)',
    imageUrl: '/backgrounds/nature/bg_24_winter_pine_forest.jpg',
    renderClass: 'bg-winter-pine-forest'
  },
  {
    id: 'bg-coastal-sunset-horizon',
    nameAr: 'غروب الشمس الذهبي على الساحل',
    nameEn: 'Golden Coastal Ocean Sunset',
    type: 'static',
    descriptionAr: 'سماء الغروب المتوهجة بألوان العنبر والبنفسجي فوق أمواج البحر',
    descriptionEn: 'Dramatic coastal sunset clouds glowing over dark ocean waves',
    previewColor: '#ea580c',
    previewGradient: 'linear-gradient(135deg, #fb923c 0%, #3b0764 100%)',
    imageUrl: '/backgrounds/nature/bg_25_coastal_sunset_horizon.jpg',
    renderClass: 'bg-coastal-sunset-horizon'
  },
  {
    id: 'bg-grand-canyon-dusk',
    nameAr: 'أخدود جراند كانيون ونهر كولورادو',
    nameEn: 'Grand Canyon Dusk Vista',
    type: 'static',
    descriptionAr: 'صخور الأخدود العظيم الحمراء وانحناءة النهر تحت سحب الغروب',
    descriptionEn: 'Grand Canyon cliffs and winding Colorado River bend at dusk',
    previewColor: '#b45309',
    previewGradient: 'linear-gradient(135deg, #f59e0b 0%, #431407 100%)',
    imageUrl: '/backgrounds/nature/bg_26_grand_canyon_dusk.jpg',
    renderClass: 'bg-grand-canyon-dusk'
  },
  {
    id: 'bg-sahara-desert-dunes',
    nameAr: 'كثبان الصحراء الذهبية عند المغيب',
    nameEn: 'Sahara Desert Twilight Dunes',
    type: 'static',
    descriptionAr: 'تموجات الرمال الذهبية الصحراوية بظلالها العميقة وقت الشفق',
    descriptionEn: 'Sweeping Sahara sand dunes with warm bronze ridges and evening shadows',
    previewColor: '#d97706',
    previewGradient: 'linear-gradient(135deg, #fbbf24 0%, #451a03 100%)',
    imageUrl: '/backgrounds/nature/bg_27_sahara_desert_dunes.jpg',
    renderClass: 'bg-sahara-desert-dunes'
  },
  {
    id: 'bg-santorini-twilight-sea',
    nameAr: 'جزيرة سانتوريني وبحر إيجة مساءً',
    nameEn: 'Santorini Aegean Sea Twilight',
    type: 'static',
    descriptionAr: 'القبب الزرقاء والأضواء الدافئة المطلة على بحر إيجة عند الشفق',
    descriptionEn: 'Cliffside Santorini domes glowing softly over the deep twilight sea',
    previewColor: '#1d4ed8',
    previewGradient: 'linear-gradient(135deg, #60a5fa 0%, #172554 100%)',
    imageUrl: '/backgrounds/nature/bg_28_santorini_twilight_sea.jpg',
    renderClass: 'bg-santorini-twilight-sea'
  },
  {
    id: 'bg-lavender-hills-dusk',
    nameAr: 'تلال الخزامى البنفسجية عند الغروب',
    nameEn: 'Lavender Fields Sunset Hills',
    type: 'static',
    descriptionAr: 'حقول الخزامى الممتدة عبر التلال الهادئة تحت سماء الغروب',
    descriptionEn: 'Rolling purple lavender fields beneath dramatic twilight clouds',
    previewColor: '#7c3aed',
    previewGradient: 'linear-gradient(135deg, #a78bfa 0%, #2e1065 100%)',
    imageUrl: '/backgrounds/nature/bg_29_lavender_hills_dusk.jpg',
    renderClass: 'bg-lavender-hills-dusk'
  },
  {
    id: 'bg-sakura-garden-twilight',
    nameAr: 'حديقة الساكورا اليابانية والفوانيس',
    nameEn: 'Japanese Sakura Blossom Pond',
    type: 'static',
    descriptionAr: 'أزهار الكرز اليابانية فوق البركة الهادئة والفوانيس المضيئة',
    descriptionEn: 'Cherry blossom sakura branches overhanging a serene twilight pond',
    previewColor: '#db2777',
    previewGradient: 'linear-gradient(135deg, #f472b6 0%, #1e1b4b 100%)',
    imageUrl: '/backgrounds/nature/bg_30_sakura_garden_twilight.jpg',
    renderClass: 'bg-sakura-garden-twilight'
  },
  {
    id: 'bg-paris-eiffel-night',
    nameAr: 'برج إيفل وأضواء باريس ليلاً',
    nameEn: 'Paris Eiffel Tower Night',
    type: 'static',
    descriptionAr: 'برج إيفل المتلألئ ليلاً فوق نهر السين وأضواء مدينة باريس',
    descriptionEn: 'Illuminated Eiffel Tower and Seine River reflections in Paris at night',
    previewColor: '#1e40af',
    previewGradient: 'linear-gradient(135deg, #f59e0b 0%, #0f172a 100%)',
    imageUrl: '/backgrounds/nature/bg_31_paris_eiffel_night.jpg',
    renderClass: 'bg-paris-eiffel-night'
  },
  {
    id: 'bg-tokyo-night-skyline',
    nameAr: 'بانوراما طوكيو وأضواء المدينة ليلاً',
    nameEn: 'Tokyo Night Skyline Panorama',
    type: 'static',
    descriptionAr: 'أضواء طوكيو الساحرة وبرج طوكيو وسط ناطحات السحاب الليلية',
    descriptionEn: 'Tokyo Tower and glowing urban skyline under a deep midnight sky',
    previewColor: '#4338ca',
    previewGradient: 'linear-gradient(135deg, #f97316 0%, #0f172a 100%)',
    imageUrl: '/backgrounds/nature/bg_32_tokyo_night_skyline.jpg',
    renderClass: 'bg-tokyo-night-skyline'
  },
  {
    id: 'bg-london-tower-bridge',
    nameAr: 'جسر البرج ونهر التايمز في لندن',
    nameEn: 'London Tower Bridge Night',
    type: 'static',
    descriptionAr: 'جسر البرج المضاء بالذهب وانعكاساته على مياه نهر التايمز',
    descriptionEn: 'Golden illuminated Tower Bridge reflecting on the River Thames',
    previewColor: '#0369a1',
    previewGradient: 'linear-gradient(135deg, #f59e0b 0%, #0f172a 100%)',
    imageUrl: '/backgrounds/nature/bg_33_london_tower_bridge.jpg',
    renderClass: 'bg-london-tower-bridge'
  },
  {
    id: 'bg-istanbul-bosphorus-night',
    nameAr: 'جسر البوسفور وإسطنبول ليلاً',
    nameEn: 'Istanbul Bosphorus Nightlights',
    type: 'static',
    descriptionAr: 'أضواء جسر البوسفور وواجهة أورتاكوي التاريخية على صفحة الماء',
    descriptionEn: 'Istanbul Bosphorus Bridge and Ortakoy waterfront glowing at night',
    previewColor: '#b45309',
    previewGradient: 'linear-gradient(135deg, #fbbf24 0%, #0f172a 100%)',
    imageUrl: '/backgrounds/nature/bg_34_istanbul_bosphorus_night.jpg',
    renderClass: 'bg-istanbul-bosphorus-night'
  },
  {
    id: 'bg-venice-canal-twilight',
    nameAr: 'القناة الكبرى في البندقية ليلاً',
    nameEn: 'Venice Grand Canal Twilight',
    type: 'static',
    descriptionAr: 'قوارب الجندول والمباني الإيطالية المضيئة على ضفاف قناة البندقية',
    descriptionEn: 'Historic Venetian canal and glowing lantern reflections at dusk',
    previewColor: '#1d4ed8',
    previewGradient: 'linear-gradient(135deg, #f59e0b 0%, #0f172a 100%)',
    imageUrl: '/backgrounds/nature/bg_35_venice_canal_twilight.jpg',
    renderClass: 'bg-venice-canal-twilight'
  },
  {
    id: 'bg-dubai-marina-night',
    nameAr: 'أبراج دبي مارينا ليلاً',
    nameEn: 'Dubai Marina Night Reflections',
    type: 'static',
    descriptionAr: 'ناطحات سحاب دبي مارينا المضيئة وانعكاساتها على المياه الهادئة',
    descriptionEn: 'Illuminated Dubai Marina skyscrapers reflected on calm dark water',
    previewColor: '#0284c7',
    previewGradient: 'linear-gradient(135deg, #38bdf8 0%, #020617 100%)',
    imageUrl: '/backgrounds/nature/bg_36_dubai_marina_night.jpg',
    renderClass: 'bg-dubai-marina-night'
  },
  {
    id: 'bg-stone-fireplace-hearth',
    nameAr: 'مدفأة حجرية دافئة ونيران الحطب',
    nameEn: 'Cozy Stone Fireplace Hearth',
    type: 'static',
    descriptionAr: 'موقد نار حجري دافئ مع ألسنة اللهب الهادئة والأخشاب المتوهجة',
    descriptionEn: 'Warm rustic stone fireplace hearth with glowing wood fire',
    previewColor: '#c2410c',
    previewGradient: 'linear-gradient(135deg, #f97316 0%, #270e05 100%)',
    imageUrl: '/backgrounds/nature/bg_37_stone_fireplace_hearth.jpg',
    renderClass: 'bg-stone-fireplace-hearth'
  },
  {
    id: 'bg-campfire-pine-lake',
    nameAr: 'موقد نار دافئ على ضفاف البحيرة',
    nameEn: 'Lakeside Campfire & Misty Pines',
    type: 'static',
    descriptionAr: 'نار مخيم دافئة بجانب بحيرة جبلية هادئة وغابات الصنوبر الضبابية',
    descriptionEn: 'Warm glowing campfire beside a tranquil misty pine mountain lake',
    previewColor: '#ea580c',
    previewGradient: 'linear-gradient(135deg, #fb923c 0%, #0f172a 100%)',
    imageUrl: '/backgrounds/nature/bg_38_campfire_pine_lake.jpg',
    renderClass: 'bg-campfire-pine-lake'
  },
  {
    id: 'bg-alpine-cabin-snow',
    nameAr: 'كوخ خشبي دافئ وسط الثلوج',
    nameEn: 'Cozy Alpine Cabin in Snow',
    type: 'static',
    descriptionAr: 'كوخ خشبي تنبعث منه الأنوار الدافئة وسط غابة شتوية مغطاة بالثلج',
    descriptionEn: 'Warm glowing timber cabin nestled in a snowy mountain forest',
    previewColor: '#1d4ed8',
    previewGradient: 'linear-gradient(135deg, #fbbf24 0%, #0f172a 100%)',
    imageUrl: '/backgrounds/nature/bg_39_alpine_cabin_snow.jpg',
    renderClass: 'bg-alpine-cabin-snow'
  },
  {
    id: 'bg-raindrops-night-window',
    nameAr: 'قطرات المطر على النافذة وأضواء المساء',
    nameEn: 'Raindrops on Night Window',
    type: 'static',
    descriptionAr: 'قطرات المطر الصافية على زجاج النافذة أمام أضواء المدينة الدافئة ليلاً',
    descriptionEn: 'Glistening rain beads on window glass overlooking warm night lights',
    previewColor: '#334155',
    previewGradient: 'linear-gradient(135deg, #f59e0b 0%, #090d16 100%)',
    imageUrl: '/backgrounds/nature/bg_40_raindrops_night_window.jpg',
    renderClass: 'bg-raindrops-night-window'
  }
];

export interface DashboardLayoutOption {
  id: string;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn?: string;
  previewBg: string;
}

export const DASHBOARD_LAYOUTS: DashboardLayoutOption[] = [
  {
    id: 'layout-frameless-icons',
    nameAr: '1. أيقونات فقط دون إطارات',
    nameEn: '1. Icons Only (No Frames)',
    descriptionAr: 'عرض أيقونات التطبيق فقط مباشرة فوق خلفية الشاشة دون أي إطارات أو بطاقات',
    descriptionEn: 'Clean icons directly over your background with no frames or cards',
    previewBg: 'from-transparent via-transparent to-black/35'
  },
  {
    id: 'layout-pure-icons',
    nameAr: '2. واجهة الأيقونات الزجاجية الحرة',
    nameEn: '2. Pure App Icons Showcase',
    descriptionAr: 'أيقونات التطبيق بإطار خفيف شفاف يتفاعل مباشرة مع شكل الأيقونة ولون الثيم',
    descriptionEn: 'Clean translucent app icons driven by your Icon Style and Theme Color',
    previewBg: 'from-[var(--theme-primary)]/20 via-transparent to-black/50'
  },
  {
    id: 'layout-glass-hero-dock',
    nameAr: '3. المنصة الزجاجية والشريط السفلي',
    nameEn: '3. Glass Hero & Bottom Dock',
    descriptionAr: 'إطار رئيسي شفاف في الأعلى وشريط سفلي سريع للأقسام الأخرى',
    descriptionEn: 'Translucent focal frame above a 4-tile quick glass dock',
    previewBg: 'from-[var(--theme-primary)]/20 via-transparent to-black/50'
  },
  {
    id: 'layout-vertical-rail',
    nameAr: '4. القائمة الجانبية الزجاجية (اليسار)',
    nameEn: '4. Left Glass Navigation Rail',
    descriptionAr: 'عمود تنقل زجاجي جانبي مع ثلاث منصات عرض رئيسية شفافة',
    descriptionEn: 'Vertical glass navigation rail paired with main media showcase cards',
    previewBg: 'from-[var(--theme-primary)]/20 via-transparent to-black/50'
  },
  {
    id: 'layout-cinema-marquee',
    nameAr: '5. أعمدة البوسترات الطولية',
    nameEn: '5. Vertical Cinema Marquee',
    descriptionAr: 'خمس بطاقات زجاجية طولية بمقاس بوستر سينمائي متناسق',
    descriptionEn: 'Five tall transparent glass poster columns side by side',
    previewBg: 'from-[var(--theme-primary)]/20 via-transparent to-black/50'
  },
  {
    id: 'layout-asymmetric-bento',
    nameAr: '6. شبكة البنتو الزجاجية المتداخلة',
    nameEn: '6. Asymmetric Glass Bento',
    descriptionAr: 'توزيع بنتو غير متماثل بإطارات شفافة تبرز الأقسام بزوايا ناعمة',
    descriptionEn: 'Multi-span asymmetric transparent bento grid with clear hierarchy',
    previewBg: 'from-[var(--theme-primary)]/20 via-transparent to-black/50'
  },
  {
    id: 'layout-dual-cinema-split',
    nameAr: '7. الشاشة المقسومة الزجاجية',
    nameEn: '7. Dual Glass Cinema Split',
    descriptionAr: 'نصف عريض شفاف يقابله مربع رباعي للأقسام الأخرى',
    descriptionEn: 'Widescreen primary frame paired with a 2x2 transparent quad',
    previewBg: 'from-[var(--theme-primary)]/20 via-transparent to-black/50'
  },
  {
    id: 'layout-floating-console-bar',
    nameAr: '8. شريط الكونسول الزجاجي المعلق',
    nameEn: '8. Floating Glass Console Bar',
    descriptionAr: 'شريط زجاجي أفقي معلق يتوسطه إطار بارز شفاف مع بقية الأقسام',
    descriptionEn: 'Elevated center-focused horizontal transparent glass console bar',
    previewBg: 'from-[var(--theme-primary)]/20 via-transparent to-black/50'
  },
  {
    id: 'layout-pyramid-tier',
    nameAr: '9. الهرم الزجاجي المزدوج',
    nameEn: '9. Tiered Glass Pyramid',
    descriptionAr: 'صف علوي مزدوج بإطارات شفافة يرتكز على صف سفلي ثلاثي',
    descriptionEn: 'Two wide top glass hero frames over a three-frame bottom tier',
    previewBg: 'from-[var(--theme-primary)]/20 via-transparent to-black/50'
  },
  {
    id: 'layout-right-command-panel',
    nameAr: '10. الأشرطة الأفقية وبرج الأدوات',
    nameEn: '10. Horizontal Strips & Utility Tower',
    descriptionAr: 'ثلاثة أشرطة سينمائية عريضة شفافة بجانب عمود أدوات زجاجي مدمج',
    descriptionEn: 'Stacked wide translucent banners flanked by a compact utility tower',
    previewBg: 'from-[var(--theme-primary)]/20 via-transparent to-black/50'
  },
  {
    id: 'layout-chamfer-prism-grid',
    nameAr: '11. الألواح الزجاجية المقطوعة الحواف',
    nameEn: '11. Chamfered Glass Prism Grid',
    descriptionAr: 'بطاقات هندسية مقصوصة الزوايا بإطار زجاجي شفاف مستقبلي',
    descriptionEn: 'Architectural bevel-cut translucent prism frames in staggered rows',
    previewBg: 'from-[var(--theme-primary)]/20 via-transparent to-black/50'
  },
  {
    id: 'layout-editorial-showcase',
    nameAr: '12. الواجهة التحريرية الأنيقة',
    nameEn: '12. Editorial Glass Stage',
    descriptionAr: 'أشرطة طباعية زجاجية نظيفة بخطوط فاصلة دقيقة ومساحات مفتوحة للخلفية',
    descriptionEn: 'Minimal editorial rows separated by crisp hairline glass dividers',
    previewBg: 'from-[var(--theme-primary)]/15 via-transparent to-black/50'
  },
  {
    id: 'layout-orbital-medallions',
    nameAr: '13. المدار الزجاجي الدائري',
    nameEn: '13. Orbital Glass Medallions',
    descriptionAr: 'أقراص زجاجية دائرية عائمة شفافة بتدرج ناعم ولون متغير حسب الثيم',
    descriptionEn: 'Floating circular transparent glass medallions',
    previewBg: 'from-[var(--theme-primary)]/20 via-transparent to-black/50'
  },
  {
    id: 'layout-leanback-lanes',
    nameAr: '14. مسارات التلفاز الذكي',
    nameEn: '14. Smart TV Leanback Lanes',
    descriptionAr: 'مساران أفقيان منفصلان بإطارات شفافة بتجربة تحكم ريموت سلسة',
    descriptionEn: 'Two distinct horizontal transparent TV rows',
    previewBg: 'from-[var(--theme-primary)]/20 via-transparent to-black/50'
  },
  {
    id: 'layout-quadrant-hub',
    nameAr: '15. الأرباع المحيطة بالمركز',
    nameEn: '15. Four Quadrants & Center Hub',
    descriptionAr: 'أربعة أجنحة زجاجية شفافة تحيط بزر مركزي بارز',
    descriptionEn: 'Four balanced corner transparent frames surrounding a central hub',
    previewBg: 'from-[var(--theme-primary)]/20 via-transparent to-black/50'
  },
  {
    id: 'layout-arch-gallery',
    nameAr: '16. معرض الأقواس الزجاجية',
    nameEn: '16. Arched Glass Gallery',
    descriptionAr: 'بطاقات زجاجية شفافة مقوسة الأعلى تمنح مظهراً معمارياً فوق الخلفية',
    descriptionEn: 'Five sculptural arch-topped transparent glass frames',
    previewBg: 'from-[var(--theme-primary)]/20 via-transparent to-black/50'
  },
  {
    id: 'layout-compact-glass-stack',
    nameAr: '17. القائمة الزجاجية العمودية',
    nameEn: '17. Compact Vertical Glass Stack',
    descriptionAr: 'عمود زجاجي شفاف مدمج في الوسط لتنقل سريع بأزرار الأعلى والأسفل',
    descriptionEn: 'Slim centered transparent glass menu stack for rapid D-pad navigation',
    previewBg: 'from-[var(--theme-primary)]/15 via-transparent to-black/50'
  },
  {
    id: 'layout-widescreen-ribbon',
    nameAr: '18. الشريط البانورامي العريض',
    nameEn: '18. Anamorphic Widescreen Ribbon',
    descriptionAr: 'صف علوي بثلاث بطاقات عريضة شفافة فوق شريط أدوات نحيف',
    descriptionEn: 'Three 16:9 widescreen transparent frames atop a slim bottom strip',
    previewBg: 'from-[var(--theme-primary)]/20 via-transparent to-black/50'
  },
  {
    id: 'layout-stepped-skyline',
    nameAr: '19. الأعمدة الزجاجية المتدرجة',
    nameEn: '19. Stepped Glass Skyline',
    descriptionAr: 'خمس ركائز زجاجية شفافة بارتفاعات متدرجة تتصاعد نحو المنتصف',
    descriptionEn: 'Five stepped vertical transparent glass pillars rising toward center',
    previewBg: 'from-[var(--theme-primary)]/20 via-transparent to-black/50'
  },
  {
    id: 'layout-split-header-deck',
    nameAr: '20. بطاقات السطح المقسوم',
    nameEn: '20. Split-Header Glass Deck',
    descriptionAr: 'بطاقات زجاجية شفافة برأس لوني علوي شفاف وشريط تحكم سفلي',
    descriptionEn: 'Transparent glass media frames with tinted header bands',
    previewBg: 'from-[var(--theme-primary)]/20 via-transparent to-black/50'
  },
  {
    id: 'layout-zen-horizon',
    nameAr: '21. الأفق الزجاجي المفتوح',
    nameEn: '21. Zen Open Glass Horizon',
    descriptionAr: 'شريط أفقي شفاف مفتوح الحواف يترك أكبر مساحة ممكنة للخلفية الطبيعية',
    descriptionEn: 'Ultra-clean translucent horizontal ribbon leaving wallpaper visible',
    previewBg: 'from-[var(--theme-primary)]/15 via-transparent to-black/50'
  },
  {
    id: 'layout-obsidian-hex-hive',
    nameAr: '22. خلية السداسيات الشفافة',
    nameEn: '22. Transparent Hex Hive Frames',
    descriptionAr: 'إطارات سداسية شفافة كخلية النحل تظهر الخلفية من خلالها بوضوح',
    descriptionEn: 'Transparent honeycomb frames with custom geometric emblems',
    previewBg: 'from-[var(--theme-primary)]/25 via-transparent to-black/50'
  },
  {
    id: 'layout-solid-theater-marquee',
    nameAr: '23. إطارات المسرح السينمائي الشفاف',
    nameEn: '23. Glass Theater Marquee',
    descriptionAr: 'منصة مسرحية شفافة بإطارات رفيعة وأدراج جانبية متصلة بالخلفية',
    descriptionEn: 'Transparent cinema stage frames paired with a 3-drawer glass console',
    previewBg: 'from-[var(--theme-primary)]/25 via-transparent to-black/50'
  },
  {
    id: 'layout-carbon-brushed-chassis',
    nameAr: '24. الإطار المعدني المفرغ الشفاف',
    nameEn: '24. Brushed Metallic Glass Chassis',
    descriptionAr: 'هيكل زجاجي شفاف بحواف معدنية مصقولة تظهر الخلفية عبره بالكامل',
    descriptionEn: 'Transparent glass deck with bevelled metallic edge frames',
    previewBg: 'from-[var(--theme-secondary)]/25 via-transparent to-black/50'
  },
  {
    id: 'layout-duotone-color-blocks',
    nameAr: '25. الإطارات اللونية المزدوجة الشفافة',
    nameEn: '25. Duotone Tinted Glass Frames',
    descriptionAr: 'إطارات زجاجية شفافة بحواف مزدوجة اللون تتبع ثيم التطبيق المختار',
    descriptionEn: 'Transparent duotone-bordered glass frames reactive to theme palette',
    previewBg: 'from-[var(--theme-primary)]/25 via-transparent to-black/50'
  },
  {
    id: 'layout-isometric-diamond-deck',
    nameAr: '26. إطارات المعين الماسي الشفافة',
    nameEn: '26. Isometric Diamond Glass Crest',
    descriptionAr: 'إطارات زجاجية شفافة متدرجة الارتفاع تتوجها شارات ماسية مضيئة',
    descriptionEn: 'Transparent stepped glass frames crowned with diamond badges',
    previewBg: 'from-[var(--theme-primary)]/25 via-transparent to-black/50'
  },
  {
    id: 'layout-matte-card-fan',
    nameAr: '27. إطارات الاستوديو الدرعية الشفافة',
    nameEn: '27. Studio Collector Glass Deck',
    descriptionAr: 'إطارات زجاجية شفافة بحواف استوديو رفيعة وشارات درعية',
    descriptionEn: 'Transparent collector glass frames with delicate foil borders',
    previewBg: 'from-[var(--theme-primary)]/20 via-transparent to-black/50'
  },
  {
    id: 'layout-royal-monolith-dock',
    nameAr: '28. الأجنحة والركيزة المركزية الشفافة',
    nameEn: '28. Transparent Monolith Wing Frames',
    descriptionAr: 'ركائز عمودية شفافة تحيط بالمنصة الوسطى دون حجب الخلفية',
    descriptionEn: 'Transparent vertical wing pillars framing a dominant central monolith',
    previewBg: 'from-[var(--theme-primary)]/25 via-transparent to-black/50'
  },
  {
    id: 'layout-split-panel-arcade',
    nameAr: '29. وحدة التحكم العلوية والألواح الشفافة',
    nameEn: '29. Top Console & Transparent Pads',
    descriptionAr: 'شريط علوي شفاف يعلو ثلاث منصات ترفيه زجاجية شفافة بالكامل',
    descriptionEn: 'Transparent top utility strip above three translucent glass pads',
    previewBg: 'from-[var(--theme-primary)]/20 via-transparent to-black/50'
  },
  {
    id: 'layout-horizon-panorama-cards',
    nameAr: '30. الأجنحة الثلاثية البانورامية الشفافة',
    nameEn: '30. Triple-Column Transparent Panorama',
    descriptionAr: 'توزيع متناظر بثلاثة أعمدة شفافة تظهر خلفية التطبيق بوضوح',
    descriptionEn: 'Three-column symmetrical transparent frames letting wallpaper shine',
    previewBg: 'from-[var(--theme-primary)]/25 via-transparent to-black/50'
  },
  {
    id: 'layout-luxury-satin-frame',
    nameAr: '31. إطارات الساتان المزدوجة الشفافة',
    nameEn: '31. Satin Double-Bezel Transparent Frames',
    descriptionAr: 'إطارات زجاجية شفافة بحدود معدنية مزدوجة فاخرة دون خلفية معتمة',
    descriptionEn: 'Transparent glass frames with double metallic filigree borders',
    previewBg: 'from-[var(--theme-primary)]/25 via-transparent to-black/50'
  }
];

// Apply CSS variables to document for dynamic coloring
export function applyRoyalTheme(themeId: string) {
  const theme = ROYAL_THEMES.find(t => t.id === themeId) || ROYAL_THEMES[0];
  const hex = theme.primary.replace('#', '');
  const r = parseInt(hex.slice(0, 2), 16) || 212;
  const g = parseInt(hex.slice(2, 4), 16) || 175;
  const b = parseInt(hex.slice(4, 6), 16) || 55;
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  const onPrimary = luminance > 0.52 ? '#090b10' : '#ffffff';

  const root = document.documentElement;
  root.style.setProperty('--color-gold', theme.primary);
  root.style.setProperty('--color-gold-dark', theme.secondary);
  root.style.setProperty('--theme-primary', theme.primary);
  root.style.setProperty('--theme-secondary', theme.secondary);
  root.style.setProperty('--theme-accent', theme.accent);
  root.style.setProperty('--theme-glow', theme.glow);
  root.style.setProperty('--theme-on-primary', onPrimary);

  // High-priority dynamic style injection to guarantee immediate color update across all components
  let styleEl = document.getElementById('royal-theme-runtime') as HTMLStyleElement | null;
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = 'royal-theme-runtime';
    document.head.appendChild(styleEl);
  }

  styleEl.innerHTML = `
    :root, html, body, #root {
      --color-gold: ${theme.primary} !important;
      --color-gold-dark: ${theme.secondary} !important;
      --theme-primary: ${theme.primary} !important;
      --theme-secondary: ${theme.secondary} !important;
      --theme-accent: ${theme.accent} !important;
      --theme-glow: ${theme.glow} !important;
      --theme-on-primary: ${onPrimary} !important;
    }
    .text-gold, .text-amber-400, .text-amber-300, .text-yellow-400, .text-yellow-300 {
      color: ${theme.primary} !important;
    }
    .text-gold\\/90, .text-amber-400\\/90, .text-amber-300\\/90 {
      color: rgba(${r},${g},${b},0.9) !important;
    }
    .text-gold\\/85, .text-amber-400\\/85, .text-amber-300\\/85 {
      color: rgba(${r},${g},${b},0.85) !important;
    }
    .text-gold\\/80, .text-amber-400\\/80, .text-amber-300\\/80 {
      color: rgba(${r},${g},${b},0.8) !important;
    }
    .text-gold\\/75, .text-gold\\/70, .text-amber-400\\/70 {
      color: rgba(${r},${g},${b},0.72) !important;
    }
    .text-gold\\/60, .text-gold\\/50 {
      color: rgba(${r},${g},${b},0.6) !important;
    }
    .bg-gold, .bg-amber-500, .bg-amber-600, .bg-yellow-500 {
      background-color: ${theme.primary} !important;
    }
    .border-gold, .border-amber-500, .border-yellow-500 {
      border-color: ${theme.primary} !important;
    }
    .border-gold\\/85 {
      border-color: ${theme.primary}D9 !important;
    }
    .border-gold\\/75 {
      border-color: ${theme.primary}BF !important;
    }
    .border-gold\\/60, .border-amber-500\\/60, .border-yellow-500\\/60 {
      border-color: ${theme.primary}99 !important;
    }
    .border-gold\\/50, .border-amber-500\\/50, .border-yellow-500\\/50 {
      border-color: ${theme.primary}80 !important;
    }
    .border-gold\\/45 {
      border-color: ${theme.primary}73 !important;
    }
    .border-gold\\/40, .border-amber-500\\/40, .border-yellow-500\\/40 {
      border-color: ${theme.primary}66 !important;
    }
    .border-gold\\/35 {
      border-color: ${theme.primary}59 !important;
    }
    .border-gold\\/30, .border-amber-500\\/30, .border-yellow-500\\/30 {
      border-color: ${theme.primary}4D !important;
    }
    .border-gold\\/20, .border-amber-500\\/20, .border-yellow-500\\/20 {
      border-color: ${theme.primary}33 !important;
    }
    .bg-gold\\/5, .bg-amber-500\\/5 {
      background-color: ${theme.primary}0D !important;
    }
    .bg-gold\\/10, .bg-amber-500\\/10 {
      background-color: ${theme.primary}1A !important;
    }
    .bg-gold\\/15, .bg-amber-500\\/15 {
      background-color: ${theme.primary}26 !important;
    }
    .bg-gold\\/20, .bg-amber-500\\/20 {
      background-color: ${theme.primary}33 !important;
    }
    .bg-gold\\/25, .bg-amber-500\\/25 {
      background-color: ${theme.primary}40 !important;
    }
    .bg-gold\\/30, .bg-amber-500\\/30 {
      background-color: ${theme.primary}4D !important;
    }
    .bg-gold\\/35 {
      background-color: ${theme.primary}59 !important;
    }
    .bg-gold\\/40 {
      background-color: ${theme.primary}66 !important;
    }
    .bg-gold\\/45 {
      background-color: ${theme.primary}73 !important;
    }
    .bg-gold\\/55 {
      background-color: ${theme.primary}8C !important;
    }
    .bg-gold\\/70 {
      background-color: ${theme.primary}B3 !important;
    }
    .bg-gold\\/75 {
      background-color: ${theme.primary}BF !important;
    }
    .bg-gold\\/85 {
      background-color: ${theme.primary}D9 !important;
    }
    .hover\\:bg-gold\\/70:hover {
      background-color: ${theme.primary}B3 !important;
    }
    .hover\\:bg-gold\\/75:hover {
      background-color: ${theme.primary}BF !important;
    }
    .fill-gold, .fill-amber-500, .fill-yellow-500 {
      fill: ${theme.primary} !important;
    }
    .from-gold {
      --tw-gradient-from: ${theme.primary} !important;
      --tw-gradient-to: ${theme.primary}00 !important;
      --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to) !important;
    }
    .via-gold {
      --tw-gradient-to: ${theme.primary}00 !important;
      --tw-gradient-stops: var(--tw-gradient-from), ${theme.primary} !important, var(--tw-gradient-to) !important;
    }
    .to-gold {
      --tw-gradient-to: ${theme.primary} !important;
    }
    .from-gold-dark {
      --tw-gradient-from: ${theme.secondary} !important;
      --tw-gradient-to: ${theme.secondary}00 !important;
      --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to) !important;
    }
    .via-gold-dark {
      --tw-gradient-to: ${theme.secondary}00 !important;
      --tw-gradient-stops: var(--tw-gradient-from), ${theme.secondary} !important, var(--tw-gradient-to) !important;
    }
    .to-gold-dark {
      --tw-gradient-to: ${theme.secondary} !important;
    }
    .shadow-gold\\/10, .shadow-amber-500\\/10 {
      box-shadow: 0 0 15px ${theme.primary}1A !important;
    }
    .shadow-gold\\/20, .shadow-amber-500\\/20 {
      box-shadow: 0 0 20px ${theme.primary}33 !important;
    }
    .shadow-gold\\/40, .shadow-amber-500\\/40 {
      box-shadow: 0 0 30px ${theme.primary}66 !important;
    }
    .ring-gold, .ring-amber-500, .focus\\:ring-gold:focus, .focus\\:ring-amber-500:focus {
      --tw-ring-color: ${theme.primary} !important;
    }
    .ring-gold\\/70, .ring-amber-500\\/70, .focus\\:ring-gold\\/70:focus {
      --tw-ring-color: ${theme.primary}B3 !important;
    }
    .ring-gold\\/50, .focus\\:ring-gold\\/50:focus {
      --tw-ring-color: ${theme.primary}80 !important;
    }
    .focus\\:border-gold:focus, .focus\\:border-amber-500:focus {
      border-color: ${theme.primary} !important;
    }
    .focus\\:bg-gold\\/10:focus, .focus\\:bg-amber-500\\/10:focus {
      background-color: ${theme.primary}1A !important;
    }
    .hover\\:bg-gold:hover, .hover\\:bg-amber-500:hover {
      background-color: ${theme.primary} !important;
    }
    .hover\\:bg-gold\\/10:hover {
      background-color: ${theme.primary}1A !important;
    }
    .hover\\:bg-gold\\/15:hover {
      background-color: ${theme.primary}26 !important;
    }
    .hover\\:bg-gold\\/20:hover {
      background-color: ${theme.primary}33 !important;
    }
    .hover\\:bg-gold\\/30:hover {
      background-color: ${theme.primary}4D !important;
    }
    .hover\\:text-gold:hover, .hover\\:text-amber-400:hover,
    .group:hover .group-hover\\:text-gold {
      color: ${theme.primary} !important;
    }
    .group:hover .group-hover\\:bg-gold {
      background-color: ${theme.primary} !important;
    }
    .hover\\:border-gold:hover, .hover\\:border-amber-500:hover {
      border-color: ${theme.primary} !important;
    }
    .hover\\:border-gold\\/60:hover {
      border-color: ${theme.primary}99 !important;
    }
    .hover\\:border-gold\\/50:hover, .hover\\:border-amber-500\\/50:hover {
      border-color: ${theme.primary}80 !important;
    }
    .hover\\:border-gold\\/40:hover, .hover\\:border-amber-500\\/40:hover {
      border-color: ${theme.primary}66 !important;
    }
    
    /* Keep native outline color synced without injecting duplicate :focus-visible box-shadow rings */
    :focus {
      outline: none !important;
      outline-color: ${theme.primary} !important;
    }
  `;
}



