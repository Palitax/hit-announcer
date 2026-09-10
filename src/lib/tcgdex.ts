import { Language, PokemonSetSummary, PokemonCardRaw, HitCard } from './types';
import { RARITY_WEIGHTS } from './constants';
import { getLocalizedSetName, EMPTY_OR_UNRELEASED_SETS } from './setNames';

const API_BASE = 'https://api.tcgdex.net/v2';
const setsCache = new Map<string, PokemonSetSummary[]>();
const hitsCache = new Map<string, { setInfo: SetDetailResponse | null; hits: HitCard[] }>();
const cardDetailsCache = new Map<string, any>();
const searchCache = new Map<string, SearchResultCard[]>();

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
    
    // Filter out unreleased/empty datamined sets (0 card artworks) and localize set names
    const filtered = (Array.isArray(data) ? data : [])
      .filter((s) => {
        if (!s?.id) return false;
        const lowerId = s.id.toLowerCase();
        if (EMPTY_OR_UNRELEASED_SETS.has(lowerId)) return false;
        if (s.cardCount && s.cardCount.total === 0) return false;
        return true;
      })
      .map((s) => ({
        ...s,
        name: getLocalizedSetName(s.id, s.name, lang),
      }));

    // Sort sets in reverse chronological order (most modern / recent displays first)
    const sorted = [...filtered].reverse();
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
    setData.name = getLocalizedSetName(setData.id, setData.name, lang);
    const official = setData.cardCount?.official || 0;
    const total = setData.cardCount?.total || official;
    const secretTotal = Math.max(total - official, 1);

    const hits: HitCard[] = [];

    for (const card of setData.cards || []) {
      const parsedLocalId = parseInt(card.localId, 10);
      const isSecret = !isNaN(parsedLocalId) && official > 0 && parsedLocalId > official;
      const rarity = card.rarity || '';
      
      const weightEntry = RARITY_WEIGHTS[rarity];
      const hasHitKeyword = /\b(V|ex|VMAX|VSTAR|SAR|SIR|AR|UR|CHR|CSR|GX|EX|LV\.X|Prime|Break|ACE SPEC)\b/i.test(card.name);

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
        if (!highResImage && (lang === 'ko' || lang === 'zh-tw')) {
          highResImage = `https://assets.tcgdex.net/ja/SV/${setId}/${card.localId}/high.webp`;
        } else if (highResImage && !highResImage.endsWith('.webp') && !highResImage.endsWith('.png')) {
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

    // Fallback: If no hits were matched via rules (e.g. vintage sets with sparse rarity metadata), include all cards so the display is never blank
    if (hits.length === 0 && (setData.cards || []).length > 0) {
      for (const card of setData.cards) {
        let highResImage = card.image;
        if (highResImage && !highResImage.endsWith('.webp') && !highResImage.endsWith('.png')) {
          highResImage = `${highResImage}/high.webp`;
        }
        hits.push({
          ...card,
          image: highResImage,
          hitTier: 'ultra',
          hitTierLabel: card.rarity || 'Rare',
          hitTierBadgeColor: 'from-blue-600 to-indigo-700 text-white',
          isSecret: false,
          score: 50,
        });
      }
    }

    // Default sorting: Biggest Hits First (highest score first)
    hits.sort((a, b) => (b.score || 0) - (a.score || 0) || (parseInt(b.localId, 10) || 0) - (parseInt(a.localId, 10) || 0));

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

export interface SearchResultCard {
  id: string;
  localId: string;
  name: string;
  image?: string;
  setId: string;
  setName: string;
  setLogo?: string;
}

export async function searchCardsByName(
  lang: Language,
  query: string,
  sets: PokemonSetSummary[]
): Promise<SearchResultCard[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const cacheKey = `search-${lang}-${trimmed.toLowerCase()}`;
  if (searchCache.has(cacheKey)) {
    return searchCache.get(cacheKey)!;
  }

  try {
    const res = await fetch(`${API_BASE}/${lang}/cards?name=${encodeURIComponent(trimmed)}`);
    if (!res.ok) return [];
    const data: PokemonCardRaw[] = await res.json();

    const setMap = new Map<string, PokemonSetSummary>();
    (sets || []).forEach((s) => {
      if (!s?.id) return;
      const lower = s.id.toLowerCase();
      setMap.set(lower, s);
      const norm = lower.replace(/0(?=\d)/g, '');
      if (norm !== lower && !setMap.has(norm)) {
        setMap.set(norm, s);
      }
    });

    const results: SearchResultCard[] = data.map((card) => {
      // Extract setId from card id (e.g. 'swsh10.5-049' -> 'swsh10.5', 'sv08-238' -> 'sv08')
      const lastDash = card.id.lastIndexOf('-');
      const rawSetId = lastDash !== -1 ? card.id.substring(0, lastDash) : card.id;
      const rawLower = rawSetId.toLowerCase();
      const rawNorm = rawLower.replace(/0(?=\d)/g, '');

      const foundSet = setMap.get(rawLower) || setMap.get(rawNorm);
      const matchedSetId = foundSet?.id || rawSetId;

      let highResImage = card.image;
      if (highResImage && !highResImage.endsWith('.webp') && !highResImage.endsWith('.png')) {
        highResImage = `${highResImage}/high.webp`;
      }

      return {
        id: card.id,
        localId: card.localId,
        name: card.name,
        image: highResImage,
        setId: matchedSetId,
        setName: getLocalizedSetName(matchedSetId, foundSet?.name || matchedSetId, lang),
        setLogo: foundSet?.logo,
      };
    });

    searchCache.set(cacheKey, results);
    return results;
  } catch (err) {
    console.error(`Error searching cards for "${trimmed}" in ${lang}:`, err);
    return [];
  }
}

