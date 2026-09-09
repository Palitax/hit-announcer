import { Language, PokemonSetSummary, PokemonCardRaw, HitCard } from './types';
import { RARITY_WEIGHTS } from './constants';

const API_BASE = 'https://api.tcgdex.net/v2';
const setsCache = new Map<string, PokemonSetSummary[]>();
const hitsCache = new Map<string, { setInfo: SetDetailResponse | null; hits: HitCard[] }>();
const cardDetailsCache = new Map<string, any>();

export async function fetchSets(lang: Language): Promise<PokemonSetSummary[]> {
  const cacheKey = `sets-${lang}`;
  if (setsCache.has(cacheKey)) {
    return setsCache.get(cacheKey)!;
  }

  try {
    const res = await fetch(`${API_BASE}/${lang}/sets`);
    if (!res.ok) {
      throw new Error(`Failed to fetch sets for ${lang}: ${res.statusText}`);
    }
    const data: PokemonSetSummary[] = await res.json();
    
    // Sort sets in reverse chronological order (most modern / recent displays first)
    const sorted = [...data].reverse();
    setsCache.set(cacheKey, sorted);
    return sorted;
  } catch (err) {
    console.error(`Error fetching sets for ${lang}:`, err);
    return [];
  }
}

export interface SetDetailResponse {
  id: string;
  name: string;
  logo?: string;
  symbol?: string;
  cardCount: {
    official: number;
    total: number;
  };
  releaseDate?: string;
  cards: PokemonCardRaw[];
}

export async function fetchSetHits(lang: Language, setId: string): Promise<{ setInfo: SetDetailResponse | null; hits: HitCard[] }> {
  const cacheKey = `hits-${lang}-${setId}`;
  if (hitsCache.has(cacheKey)) {
    return hitsCache.get(cacheKey)!;
  }

  try {
    const res = await fetch(`${API_BASE}/${lang}/sets/${setId}`);
    if (!res.ok) {
      throw new Error(`Failed to fetch set detail for ${setId}: ${res.statusText}`);
    }
    const setData: SetDetailResponse = await res.json();
    const official = setData.cardCount?.official || 0;
    const total = setData.cardCount?.total || official;
    const secretTotal = Math.max(total - official, 1);

    const hits: HitCard[] = [];

    for (const card of setData.cards || []) {
      const parsedLocalId = parseInt(card.localId, 10);
      const isSecret = !isNaN(parsedLocalId) && official > 0 && parsedLocalId > official;
      const rarity = card.rarity || '';
      
      const weightEntry = RARITY_WEIGHTS[rarity];
      const hasHitKeyword = /\b(ex|VMAX|VSTAR|SAR|SIR|AR|UR|CHR|CSR)\b/i.test(card.name);

      if (isSecret || !!weightEntry || hasHitKeyword) {
        let hitTier: HitCard['hitTier'] = 'ultra';
        let hitTierLabel = rarity || 'Hit Card';
        let hitTierBadgeColor = 'from-blue-600 to-indigo-700 text-white';
        let score = 50;

        if (weightEntry) {
          hitTier = weightEntry.tier;
          hitTierLabel = weightEntry.label;
          hitTierBadgeColor = weightEntry.color;
          score = weightEntry.score;
        } else if (isSecret && official > 0) {
          // Precise mathematical classification based on Pokemon card set numbering structure
          const secretIndex = parsedLocalId - official;
          const ratio = secretIndex / secretTotal;

          if (ratio > 0.88) {
            hitTier = 'gold';
            hitTierLabel = lang === 'ja' ? 'UR (Gold)' : 'Hyper Rare (Gold)';
            hitTierBadgeColor = 'from-amber-400 to-yellow-500 text-amber-950';
            score = 100;
          } else if (ratio > 0.65) {
            hitTier = lang === 'ja' || lang === 'ko' || lang === 'zh-tw' ? 'sar' : 'sir';
            hitTierLabel = lang === 'ja' ? 'SAR (Special Art Rare)' : 'Special Illustration Rare';
            hitTierBadgeColor = 'from-fuchsia-500 via-purple-500 to-pink-500 text-white';
            score = 90;
          } else if (ratio > 0.32) {
            hitTier = 'ultra';
            hitTierLabel = lang === 'ja' ? 'SR (Super Rare)' : 'Ultra Rare (Full Art)';
            hitTierBadgeColor = 'from-blue-500 to-indigo-600 text-white';
            score = 65;
          } else {
            hitTier = lang === 'ja' || lang === 'ko' || lang === 'zh-tw' ? 'ar' : 'ir';
            hitTierLabel = lang === 'ja' ? 'AR (Art Rare)' : 'Illustration Rare';
            hitTierBadgeColor = 'from-emerald-400 to-teal-500 text-teal-950';
            score = 75;
          }
        }

        // Format high resolution image URL
        let highResImage = card.image;
        if (highResImage && !highResImage.endsWith('.webp') && !highResImage.endsWith('.png')) {
          highResImage = `${highResImage}/high.webp`;
        }

        hits.push({
          ...card,
          image: highResImage,
          hitTier,
          hitTierLabel,
          hitTierBadgeColor,
          isSecret,
          score,
        });
      }
    }

    // Default sorting: Biggest Hits First (highest score first)
    hits.sort((a, b) => b.score - a.score || parseInt(b.localId) - parseInt(a.localId));

    const result = { setInfo: setData, hits };
    hitsCache.set(cacheKey, result);
    return result;
  } catch (err) {
    console.error(`Error fetching set hits for ${setId} in ${lang}:`, err);
    return { setInfo: null, hits: [] };
  }
}

export async function fetchCardDetail(lang: Language, cardId: string) {
  const cacheKey = `card-${lang}-${cardId}`;
  if (cardDetailsCache.has(cacheKey)) {
    return cardDetailsCache.get(cacheKey);
  }
  try {
    const res = await fetch(`${API_BASE}/${lang}/cards/${cardId}`);
    if (!res.ok) return null;
    const data = await res.json();
    cardDetailsCache.set(cacheKey, data);
    return data;
  } catch {
    return null;
  }
}
