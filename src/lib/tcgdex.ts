import { Language, PokemonSetSummary, PokemonCardRaw, HitCard } from './types';
import { RARITY_WEIGHTS } from './constants';
import { getLocalizedSetName, EMPTY_OR_UNRELEASED_SETS, isPocketSet } from './setNames';
import { translateToJapanese } from './pokemonNames';
import { JAPANESE_30TH_MAIN_IMAGES, JAPANESE_30TH_CLASSIC_IMAGES } from './japanese30thImages';
import {
  isJapaneseMegaSet,
  getJapaneseMegaCardImage,
  getJapaneseMegaCardRarity,
  getJapaneseMegaSetLogo,
} from './japaneseMegaImages';

const API_BASE = 'https://api.tcgdex.net/v2';
const setsCache = new Map<string, PokemonSetSummary[]>();
const hitsCache = new Map<string, { setInfo: SetDetailResponse | null; hits: HitCard[] }>();
const cardDetailsCache = new Map<string, any>();
const searchCache = new Map<string, SearchResultCard[]>();

const CLASSIC_COLLECTION_IMAGES: Record<string, string> = {
  '001': 'https://assets.tcgdex.net/en/pl/pl4/1/high.webp',
  '002': 'https://assets.tcgdex.net/en/pl/pl1/4/high.webp',
  '003': 'https://assets.tcgdex.net/en/pop/pop1/2/high.webp',
  '004': 'https://assets.tcgdex.net/en/xy/xy10/64/high.webp',
  '005': 'https://assets.tcgdex.net/en/gym/gym1/9/high.webp',
  '006': 'https://assets.tcgdex.net/en/neo/neo4/11/high.webp',
  '007': 'https://assets.tcgdex.net/en/sv/sv06.5/013/high.webp',
  '008': 'https://assets.tcgdex.net/en/sm/sm9/33/high.webp',
  '009': 'https://assets.tcgdex.net/en/xy/xy9/41/high.webp',
  '010': 'https://assets.tcgdex.net/en/dp/dp2/18/high.webp',
  '011': 'https://assets.tcgdex.net/en/pl/pl1/47/high.webp',
  '012': 'https://assets.tcgdex.net/en/pop/pop2/3/high.webp',
  '013': 'https://assets.tcgdex.net/en/sm/sm10/1/high.webp',
  '014': 'https://assets.tcgdex.net/en/swsh/fut2020/1/high.webp',
  '015': 'https://assets.tcgdex.net/en/gym/gym2/69/high.webp',
  '016': 'https://assets.tcgdex.net/en/pop/np/39/high.webp',
  '017': 'https://assets.tcgdex.net/en/sm/sm1/89/high.webp',
  '018': 'https://assets.tcgdex.net/en/base/base3/5/high.webp',
  '019': 'https://assets.tcgdex.net/en/hgss/hgss4/99/high.webp',
  '020': 'https://assets.tcgdex.net/en/hgss/hgss4/99/high.webp',
  '021': 'https://assets.tcgdex.net/en/bw/bw3/101/high.webp',
  '022': 'https://assets.tcgdex.net/en/swsh/cel25/4/high.webp',
  '023': 'https://assets.tcgdex.net/en/xy/xy11/79/high.webp',
  '024': 'https://assets.tcgdex.net/en/neo/neo4/106/high.webp',
  '025': 'https://assets.tcgdex.net/en/xy/xy9/76/high.webp',
  '026': 'https://assets.tcgdex.net/en/swsh/swsh8/114/high.webp',
  '027': 'https://assets.tcgdex.net/en/swsh/swsh9/123/high.webp',
  '028': 'https://assets.tcgdex.net/en/swsh/cel25/16/high.webp',
  '029': 'https://assets.tcgdex.net/en/pop/pop5/2/high.webp',
  '030': 'https://assets.tcgdex.net/en/sm/det1/8/high.webp',
};

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
    
    // Filter out:
    // 1. Mobile Pokémon TCG Pocket sets (A1, A2, tcgp, etc.)
    // 2. Unreleased/empty datamined sets (0 card artworks)
    // And localize set names
    const filtered = (Array.isArray(data) ? data : [])
      .filter((s) => {
        if (!s?.id) return false;
        if (isPocketSet(s.id, s.name, s.logo)) return false;
        const lowerId = s.id.toLowerCase();
        if (EMPTY_OR_UNRELEASED_SETS.has(lowerId)) return false;
        if (s.cardCount && s.cardCount.total === 0) return false;
        return true;
      })
      .map((s) => ({
        ...s,
        name: getLocalizedSetName(s.id, s.name, lang),
        logo: s.logo || getJapaneseMegaSetLogo(s.id) || undefined,
        symbol: s.symbol || getJapaneseMegaSetLogo(s.id) || undefined,
      }));

    // Ensure 30th Anniversary sets are included for Japanese and all Asian languages
    const has30th = filtered.some((s) => {
      const lower = (s?.id || '').toLowerCase();
      return lower === '30th' || lower === 'm6a';
    });

    const anniversarySets: PokemonSetSummary[] = [];
    if (!has30th) {
      anniversarySets.push(
        {
          id: '30th',
          name: getLocalizedSetName('30th', '30th Celebration', lang),
          logo: 'https://assets.tcgdex.net/en/me/30th/logo',
          symbol: 'https://assets.tcgdex.net/en/me/30th/symbol',
          cardCount: { official: 128, total: 158 },
        },
        {
          id: '30th-c',
          name: getLocalizedSetName('30th-c', '30th Classic Collection', lang),
          logo: 'https://assets.tcgdex.net/en/me/30th/logo',
          symbol: 'https://assets.tcgdex.net/en/me/30th/symbol',
          cardCount: { official: 30, total: 30 },
        }
      );
    }

    // Sort sets in reverse chronological order (most modern / recent displays first)
    const sorted = [...anniversarySets, ...filtered.reverse()];
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
    const normalizedSetId = setId.toLowerCase() === 'm6a' ? '30th' : setId;
    let res = await fetch(`${API_BASE}/${lang}/sets/${normalizedSetId}`);
    
    // Fallback to English dataset if localized set endpoint is 404 (e.g. 30th Anniversary for Japanese)
    if (!res.ok && (lang === 'ja' || lang === 'ko' || lang === 'zh-tw' || !res.ok)) {
      res = await fetch(`${API_BASE}/en/sets/${normalizedSetId}`);
    }

    if (!res.ok) {
      throw new Error(`Failed to fetch set detail for ${setId}: ${res.statusText}`);
    }
    const setData: SetDetailResponse = await res.json();
    setData.name = getLocalizedSetName(setData.id, setData.name, lang);
    const isMega = isJapaneseMegaSet(normalizedSetId);
    if (isMega) {
      setData.logo = setData.logo || getJapaneseMegaSetLogo(normalizedSetId) || undefined;
      setData.symbol = setData.symbol || getJapaneseMegaSetLogo(normalizedSetId) || undefined;
    }
    const official = setData.cardCount?.official || 0;
    const total = setData.cardCount?.total || official;
    const secretTotal = Math.max(total - official, 1);

    const hits: HitCard[] = [];
    const is30thMain = normalizedSetId.toLowerCase() === '30th';
    const is30thClassic = normalizedSetId.toLowerCase() === '30th-c';

    for (const card of setData.cards || []) {
      if (isMega) {
        const megaImg = getJapaneseMegaCardImage(normalizedSetId, card.localId);
        const megaRarity = getJapaneseMegaCardRarity(normalizedSetId, card.localId, card.name);
        if (megaImg) {
          card.image = megaImg;
        }
        if (megaRarity && (!card.rarity || card.rarity === '')) {
          card.rarity = megaRarity;
        }
      }
      const parsedLocalId = parseInt(card.localId, 10);
      const isSecret = !isNaN(parsedLocalId) && official > 0 && parsedLocalId > official;
      const rarity = card.rarity || '';
      
      const weightEntry = RARITY_WEIGHTS[rarity];
      const hasHitKeyword = /\b(V|ex|VMAX|VSTAR|SAR|SIR|AR|UR|CHR|CSR|GX|EX|LV\.X|Prime|Break|ACE SPEC|FUR)\b/i.test(card.name);

      // Card Name localization for Japanese mode
      const cardDisplayName = (lang === 'ja' && (is30thMain || is30thClassic))
        ? translateToJapanese(card.name)
        : card.name;

      // Special handling for 30th Anniversary sets
      if (is30thClassic) {
        const image = (lang === 'ja' && JAPANESE_30TH_CLASSIC_IMAGES[card.localId])
          ? JAPANESE_30TH_CLASSIC_IMAGES[card.localId]
          : (CLASSIC_COLLECTION_IMAGES[card.localId] || 'https://assets.tcgdex.net/en/base/base1/4/high.webp');
        hits.push({
          ...card,
          name: cardDisplayName,
          image,
          hitTier: 'gold',
          hitTierLabel: lang === 'ja' ? 'Classic (30周年)' : 'Classic Collection',
          hitTierBadgeColor: 'from-amber-500 via-yellow-400 to-amber-600 text-amber-950',
          isSecret: false,
          score: 92,
        });
        continue;
      }

      if (is30thMain) {
        // High-res image on CDN (with official Japanese scan priority in Japanese mode)
        const highResImage = (lang === 'ja' && JAPANESE_30TH_MAIN_IMAGES[card.localId])
          ? JAPANESE_30TH_MAIN_IMAGES[card.localId]
          : `https://assets.tcgdex.net/en/me/30th/${card.localId}/high.webp`;

        // 1. Pikachu Subset (Cards 025 to 054)
        if (!isNaN(parsedLocalId) && parsedLocalId >= 25 && parsedLocalId <= 54) {
          hits.push({
            ...card,
            name: cardDisplayName,
            image: highResImage,
            hitTier: 'ar',
            hitTierLabel: lang === 'ja' ? 'Pikachu Rare (30th)' : 'Pikachu Rare',
            hitTierBadgeColor: 'from-amber-400 to-yellow-400 text-amber-950',
            isSecret: false,
            score: 80,
          });
          continue;
        }

        // 2. Futuristic Rares (FUR): Mewtwo ex (157), Mew ex (158)
        if (parsedLocalId === 157 || parsedLocalId === 158 || /\b(Mew|Mewtwo)\s+ex\b/i.test(card.name)) {
          hits.push({
            ...card,
            name: cardDisplayName,
            image: highResImage,
            hitTier: 'gold',
            hitTierLabel: lang === 'ja' ? 'FUR (Futuristic Rare)' : 'Futuristic Rare (FUR)',
            hitTierBadgeColor: 'from-violet-500 via-fuchsia-500 to-amber-300 text-white',
            isSecret: true,
            score: 98,
          });
          continue;
        }

        // 3. Gold Ultra Rares (155, 156, etc.)
        if (parsedLocalId >= 155) {
          hits.push({
            ...card,
            name: cardDisplayName,
            image: highResImage,
            hitTier: 'gold',
            hitTierLabel: lang === 'ja' ? 'UR (Gold)' : 'Hyper Rare (Gold)',
            hitTierBadgeColor: 'from-amber-400 to-yellow-500 text-amber-950',
            isSecret: true,
            score: 95,
          });
          continue;
        }

        // 4. SARs / SIRs (145 to 154)
        if (parsedLocalId >= 145) {
          hits.push({
            ...card,
            name: cardDisplayName,
            image: highResImage,
            hitTier: lang === 'ja' ? 'sar' : 'sir',
            hitTierLabel: lang === 'ja' ? 'SAR (Special Art Rare)' : 'Special Illustration Rare',
            hitTierBadgeColor: 'from-fuchsia-500 via-purple-500 to-pink-500 text-white',
            isSecret: true,
            score: 90,
          });
          continue;
        }

        // 5. ARs / IRs (129 to 144)
        if (parsedLocalId >= 129) {
          hits.push({
            ...card,
            name: cardDisplayName,
            image: highResImage,
            hitTier: lang === 'ja' ? 'ar' : 'ir',
            hitTierLabel: lang === 'ja' ? 'AR (Art Rare)' : 'Illustration Rare',
            hitTierBadgeColor: 'from-emerald-400 to-teal-500 text-teal-950',
            isSecret: true,
            score: 75,
          });
          continue;
        }

        // 6. Regular ex / Double Rares in main set (001-128)
        if (/\bex\b/i.test(card.name)) {
          hits.push({
            ...card,
            name: cardDisplayName,
            image: highResImage,
            hitTier: 'ultra',
            hitTierLabel: lang === 'ja' ? 'Double Rare (ex)' : 'Double Rare (ex)',
            hitTierBadgeColor: 'from-sky-400 to-blue-500 text-sky-950',
            isSecret: false,
            score: 50,
          });
          continue;
        }
      }

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
    const is30thQuery = /^(30|30th|30周年|m6a|celebration|anniversary)$/i.test(trimmed);

    const [res, res30th] = await Promise.all([
      fetch(`${API_BASE}/${lang}/cards?name=${encodeURIComponent(trimmed)}`).catch(() => null),
      is30thQuery ? fetch(`${API_BASE}/en/sets/30th`).catch(() => null) : Promise.resolve(null),
    ]);

    let data: PokemonCardRaw[] = [];
    if (res && res.ok) {
      const parsed = await res.json();
      if (Array.isArray(parsed)) {
        data = parsed;
      }
    }

    // If query is related to 30th Anniversary, inject 30th Celebration highlights
    if (res30th && res30th.ok) {
      const set30thData = await res30th.json();
      if (Array.isArray(set30thData.cards)) {
        const top30thCards: PokemonCardRaw[] = set30thData.cards.filter((c: any) => {
          const num = parseInt(c.localId, 10);
          return num >= 25 && num <= 54 || num >= 145 || /\b(Mew|Mewtwo|Pikachu|ex)\b/i.test(c.name);
        });
        data = [...top30thCards, ...data];
      }
    }

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

    const results: SearchResultCard[] = data
      .filter((card) => {
        if (!card?.id) return false;
        // Exclude pocket card IDs (e.g. A1-001, A2-010, P-A-001, B1-005)
        if (/^(a\d|b\d|p-[ab])/i.test(card.id)) return false;
        // Exclude pocket image URLs
        if (card.image && card.image.includes('/tcgp/')) return false;
        return true;
      })
      .map((card) => {
        // Extract setId from card id (e.g. 'swsh10.5-049' -> 'swsh10.5', 'sv08-238' -> 'sv08', '30th-025' -> '30th')
        const lastDash = card.id.lastIndexOf('-');
        const rawSetId = lastDash !== -1 ? card.id.substring(0, lastDash) : card.id;
        const rawLower = rawSetId.toLowerCase();
        const rawNorm = rawLower.replace(/0(?=\d)/g, '');

        const foundSet = setMap.get(rawLower) || setMap.get(rawNorm);
        const matchedSetId = foundSet?.id || rawSetId;

        let highResImage = card.image;
        if (matchedSetId.toLowerCase() === '30th' && card.localId) {
          highResImage = (lang === 'ja' && JAPANESE_30TH_MAIN_IMAGES[card.localId])
            ? JAPANESE_30TH_MAIN_IMAGES[card.localId]
            : `https://assets.tcgdex.net/en/me/30th/${card.localId}/high.webp`;
        } else if (matchedSetId.toLowerCase() === '30th-c' && card.localId) {
          highResImage = (lang === 'ja' && JAPANESE_30TH_CLASSIC_IMAGES[card.localId])
            ? JAPANESE_30TH_CLASSIC_IMAGES[card.localId]
            : (CLASSIC_COLLECTION_IMAGES[card.localId] || `https://assets.tcgdex.net/en/me/30th/${card.localId}/high.webp`);
        } else if (isJapaneseMegaSet(matchedSetId) && card.localId) {
          highResImage = getJapaneseMegaCardImage(matchedSetId, card.localId) || highResImage;
        } else if (highResImage && !highResImage.endsWith('.webp') && !highResImage.endsWith('.png') && !highResImage.endsWith('.jpg')) {
          highResImage = `${highResImage}/high.webp`;
        }

        const displayName = (lang === 'ja' && (matchedSetId.toLowerCase() === '30th' || matchedSetId.toLowerCase() === '30th-c'))
          ? translateToJapanese(card.name)
          : card.name;

        return {
          id: card.id,
          localId: card.localId,
          name: displayName,
          image: highResImage,
          setId: matchedSetId,
          setName: getLocalizedSetName(matchedSetId, foundSet?.name || matchedSetId, lang),
          setLogo: foundSet?.logo || getJapaneseMegaSetLogo(matchedSetId) || undefined,
        };
      })
      .filter((card) => {
        if (isPocketSet(card.setId, card.setName, card.setLogo)) return false;
        if (EMPTY_OR_UNRELEASED_SETS.has(card.setId.toLowerCase())) return false;
        return true;
      });

    searchCache.set(cacheKey, results);
    return results;
  } catch (err) {
    console.error(`Error searching cards for "${trimmed}" in ${lang}:`, err);
    return [];
  }
}

