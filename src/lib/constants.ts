import { LanguageInfo, Language } from './types';

export const LANGUAGES: LanguageInfo[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'zh-tw', name: 'Chinese', nativeName: '繁體中文', flag: '🇨🇳' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
];

export const RARITY_WEIGHTS: Record<string, { tier: 'gold' | 'sar' | 'sir' | 'ar' | 'ir' | 'ultra' | 'secret' | 'holo'; label: string; color: string; score: number }> = {
  // Golds / Hyper Rares
  'Hyper rare': { tier: 'gold', label: 'Hyper Rare (Gold)', color: 'from-amber-400 to-yellow-500 text-amber-950', score: 100 },
  'UR': { tier: 'gold', label: 'Ultra Rare (Gold)', color: 'from-amber-400 to-yellow-500 text-amber-950', score: 100 },
  'Secret Rare': { tier: 'gold', label: 'Secret Rare', color: 'from-amber-400 to-amber-600 text-amber-950', score: 95 },

  // Special Illustration Rares / SAR
  'Special illustration rare': { tier: 'sir', label: 'Special Illustration Rare', color: 'from-fuchsia-500 via-purple-500 to-pink-500 text-white', score: 90 },
  'SAR': { tier: 'sar', label: 'Special Art Rare (SAR)', color: 'from-fuchsia-500 via-purple-500 to-pink-500 text-white', score: 90 },
  'Rare Secret': { tier: 'sar', label: 'Rare Secret (Alt Art)', color: 'from-fuchsia-500 to-indigo-500 text-white', score: 88 },
  'Rare Rainbow': { tier: 'sar', label: 'Rainbow Rare', color: 'from-pink-400 via-teal-300 to-indigo-400 text-slate-900', score: 86 },

  // Illustration Rares / AR / Character Rares
  'Illustration rare': { tier: 'ir', label: 'Illustration Rare', color: 'from-emerald-400 to-teal-500 text-teal-950', score: 75 },
  'AR': { tier: 'ar', label: 'Art Rare (AR)', color: 'from-emerald-400 to-teal-500 text-teal-950', score: 75 },
  'Character Rare': { tier: 'ar', label: 'Character Rare (CHR)', color: 'from-teal-400 to-cyan-500 text-teal-950', score: 72 },
  'Character Secret Rare': { tier: 'sar', label: 'Character Secret Rare (CSR)', color: 'from-purple-400 to-pink-500 text-white', score: 85 },
  'Rare Shiny': { tier: 'ir', label: 'Shiny Rare', color: 'from-cyan-400 to-blue-500 text-cyan-950', score: 70 },

  // Ultra Rares / Full Arts
  'Ultra Rare': { tier: 'ultra', label: 'Ultra Rare (Full Art)', color: 'from-blue-500 to-indigo-600 text-white', score: 65 },
  'SR': { tier: 'ultra', label: 'Super Rare (SR)', color: 'from-blue-500 to-indigo-600 text-white', score: 65 },
  'Double rare': { tier: 'ultra', label: 'Double Rare (ex)', color: 'from-sky-400 to-blue-500 text-sky-950', score: 50 },
  'RR': { tier: 'ultra', label: 'Double Rare (RR)', color: 'from-sky-400 to-blue-500 text-sky-950', score: 50 },
  'Rare Holo V': { tier: 'ultra', label: 'Holo V', color: 'from-blue-400 to-cyan-500 text-white', score: 50 },
  'Rare Holo VMAX': { tier: 'ultra', label: 'Holo VMAX', color: 'from-indigo-500 to-purple-600 text-white', score: 60 },
  'Rare Holo VSTAR': { tier: 'ultra', label: 'Holo VSTAR', color: 'from-indigo-400 to-sky-500 text-white', score: 60 },
  'ACE SPEC Rare': { tier: 'ultra', label: 'ACE SPEC', color: 'from-rose-500 to-pink-600 text-white', score: 58 },

  // Holos
  'Rare Holo': { tier: 'holo', label: 'Holo Rare', color: 'from-slate-600 to-slate-700 text-white', score: 30 },
};
