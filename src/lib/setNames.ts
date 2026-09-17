import { Language } from './types';

// Western/German display names for Asian (JA, KO, ZH) and special sets
const ASIAN_SET_NAMES: Record<string, string> = {
  // 30th Anniversary Series
  '30th': '30th Celebration (30 Jahre Jubiläum)',
  '30th-c': '30th Classic Collection (30 Jahre Klassik)',
  'M6a': '30th Celebration (30周年記念)',
  'm6a': '30th Celebration (30周年記念)',

  // Mega (M) Series
  'M6': 'Storm Emeralda (M6)',
  'M5': 'Abyss Eye (M5)',
  'M4': 'Ninja Spinner (M4)',
  'M3': 'Munikis Zero (M3)',
  'M2a': 'MEGA Dream ex (M2a)',
  'M2': 'Inferno X (M2)',
  'M1L': 'Mega Brave (M1L)',
  'M1S': 'Mega Symphonia (M1S)',
  'MC': 'Start Deck 100 Battle Collection',
  'M-P': 'Mega Promokarten (M-P)',

  // Scarlet & Violet (SV) Series
  'SV11B': 'Black Bolt (SV11B)',
  'SV11W': 'White Flare (SV11W)',
  'SV10': 'Glory of Team Rocket (SV10)',
  'SV9a': 'Hot Air Arena (SV9a)',
  'SV9': 'Battle Partners (SV9)',
  'SV8a': 'Terastal Festival (Prismatische Entwicklungen)',
  'SV8': 'Supercharged Breaker (Stürmische Funken)',
  'SV7a': 'Paradise Dragona (Paradies-Drachen)',
  'SV7': 'Stellar Miracle (Stellarkrone)',
  'SV6a': 'Night Wanderer (Nebel der Sagen)',
  'SV6': 'Mask of Change (Maskerade im Zwielicht)',
  'SV5a': 'Crimson Haze (Maskerade im Zwielicht)',
  'SV5K': 'Wild Force (Gewalten der Zeit)',
  'SV5M': 'Cyber Judge (Gewalten der Zeit)',
  'SV4a': 'Shiny Treasure ex (Paldeas Schicksale)',
  'SV4K': 'Ancient Roar (Paradoxrift)',
  'SV4M': 'Future Flash (Paradoxrift)',
  'SV3a': 'Raging Surf (Obsidian Flammen)',
  'SV3': 'Ruler of the Black Flame (Obsidian Flammen)',
  'SV2a': 'Pokémon Card 151 (151)',
  'SV2D': 'Clay Burst (Entwicklungen in Paldea)',
  'SV2P': 'Snow Hazard (Entwicklungen in Paldea)',
  'SV1a': 'Triplet Beat (Entwicklungen in Paldea)',
  'SV1V': 'Violet ex (Karmesin & Purpur)',
  'SV1S': 'Scarlet ex (Karmesin & Purpur)',
  'SV-P': 'SV Promokarten',
  'SVD': 'ex Starter Decks',

  // Sword & Shield (S / SWSH) Series
  's12a': 'VSTAR Universe (Zenit der Könige)',
  's12': 'Paradigm Trigger (Silberne Sturmwinde)',
  's11a': 'Incandescent Arcana (Silberne Sturmwinde)',
  's11': 'Lost Abyss (Verlorener Ursprung)',
  's10b': 'Pokémon GO',
  's10a': 'Dark Phantasma (Astralglanz)',
  's10P': 'Space Juggler (Astralglanz)',
  's10D': 'Time Gazer (Astralglanz)',
  's9a': 'Battle Region (Astralglanz)',
  's9': 'Star Birth (Strahlende Sterne)',
  's8b': 'VMAX Climax (Strahlende Sterne)',
  's8': 'Fusion Arts (Fusionsangriff)',
  's8a': '25th Anniversary Collection (Celebrations)',
  's7r': 'Blue Sky Stream (Drachenwandel)',
  's7d': 'Towering Perfection (Drachenwandel)',
  's6a': 'Eevee Heroes (Drachenwandel)',
  's6H': 'Silver Lance (Schaurige Herrschaft)',
  's6K': 'Jet-Black Spirit (Schaurige Herrschaft)',
  's5a': 'Matchless Fighters (Schaurige Herrschaft)',
  's5R': 'Single Strike Master (Kampfstile)',
  's5I': 'Rapid Strike Master (Kampfstile)',
  's4a': 'Shiny Star V (Glänzendes Schicksal)',
  's3a': 'Legendary Heartbeat (Farbenschock)',
  's3': 'Infinity Zone (Flammende Finsternis)',
  's2a': 'Explosive Walker (Flammende Finsternis)',
  's2': 'Rebellion Crash (Clash der Rebellen)',
  's1a': 'VMAX Rising (Schwert & Schild)',
  's1W': 'Sword (Schwert & Schild)',
  's1H': 'Shield (Schwert & Schild)',

  // Sun & Moon (SM) Series
  'sm12a': 'Tag All Stars (Bund der Gleichgesinnten)',
  'sm12': 'Alter Genesis (Kosmische Finsternis)',
  'sm11b': 'Dream League (Kosmische Finsternis)',
  'sm11a': 'Remix Bout (Bund der Gleichgesinnten)',
  'sm11': 'Miracle Twin (Bund der Gleichgesinnten)',
  'sm10b': 'Sky Legend (Kräfte im Einklang)',
  'sm10a': 'GG End (Kräfte im Einklang)',
  'sm10': 'Double Blaze (Kräfte im Einklang)',
  'sm9b': 'Full Metal Wall (Teams Sind Trumpf)',
  'sm9a': 'Night Unison (Teams Sind Trumpf)',
  'sm9': 'Tag Bolt (Teams Sind Trumpf)',
  'sm8b': 'GX Ultra Shiny (Verborgenes Schicksal)',
  'sm8a': 'Dark Order (Echo des Donners)',
  'sm8': 'Super-Burst Impact (Echo des Donners)',
  'sm7b': 'Fairy Rise (Echo des Donners)',
  'sm7a': 'Thunderclap Spark (Sturm am Firmament)',
  'sm7': 'Charisma of the Wrecked Sky (Sturm am Firmament)',
  'sm6b': 'Champion Road (Sturm am Firmament)',
  'sm6a': 'Dragon Storm (Majestät Der Drachen)',
  'sm6': 'Forbidden Light (Grauen Der Lichtfinsternis)',
  'sm5p': 'Ultra Force (Grauen Der Lichtfinsternis)',
  'sm5+': 'Ultra Force (Grauen Der Lichtfinsternis)',
  'sm5M': 'Moonlit Draft (Ultra-Prisma)',
  'sm5S': 'Star Birth (Ultra-Prisma)',
  'sm4p': 'GX Battle Boost (Aufziehen der Sturmröte)',
  'sm4+': 'GX Battle Boost (Aufziehen der Sturmröte)',
  'sm4A': 'Awakening of Psychic Kings (Aufziehen der Sturmröte)',
  'sm3p': 'Shining Legends (Schimmernde Legenden)',
  'sm3+': 'Shining Legends (Schimmernde Legenden)',
  'sm3H': 'Did You See the Fighting Rainbow? (Nacht in Flammen)',
  'sm3N': 'Light-Consuming Darkness (Nacht in Flammen)',
  'sm2p': 'Beyond a New Challenge (Stunde der Wächter)',
  'sm2+': 'Beyond a New Challenge (Stunde der Wächter)',
  'sm2K': 'Islands Await You (Stunde der Wächter)',
  'sm2L': 'Alolan Moonlight (Stunde der Wächter)',
  'sm1p': 'Strength Expansion Pack Sun & Moon',
  'sm1+': 'Strength Expansion Pack Sun & Moon',
  'sm1S': 'Collection Sun (Sonne & Mond)',
  'sm1M': 'Collection Moon (Sonne & Mond)',

  // XY Series
  'cp6': '20th Anniversary (Evolution)',
  'cp5': 'Mythical & Legendary Dream Shine Collection',
  'cp4': 'Premium Champion Set',
  'cp3': 'PokéKyun Collection (Generationen)',
  'cp2': 'Legendary Shine Collection',
  'cp1': 'Magma vs Aqua: Double Crisis',
  'xy11': 'Cruel Traitor / Fever-Pitch Fighter (Dampfkessel)',
  'xy10': 'Awakening Psychic Kings (Schicksalsschmiede)',
  'xy9': 'Rage of the Broken Heavens (Turbofieber)',
  'xy8': 'Red Flash / Blue Shock (Turbostart)',
  'xy7': 'Bandit Ring (Ewiger Anfang)',
  'xy6': 'Emerald Break (Drachenleuchten)',
  'xy5': 'Gaia Volcano / Tidal Storm (Protoschock)',
  'xy4': 'Phantom Gate (Phantomkräfte)',
  'xy3': 'Rising Fist (Fliegende Fäuste)',
  'xy2': 'Wild Blaze (Flammenmeer)',
  'xy1': 'Collection X / Collection Y (XY Basis)',
};

// Known empty / unreleased datamined sets to filter out from browsing
export const EMPTY_OR_UNRELEASED_SETS = new Set([
  'b2a',
  'b1a',
  'b2',
  'a4a',
  'p-a',
]);

/**
 * Checks whether a set or card belongs to the mobile game Pokémon TCG Pocket (tcgp).
 * Returns true if it is a Pocket set/card, so it can be excluded in favor of official physical TCG sets.
 */
export function isPocketSet(setId?: string, setName?: string, setLogo?: string): boolean {
  if (!setId && !setName && !setLogo) return false;
  const id = (setId || '').toLowerCase().trim();
  const name = (setName || '').toLowerCase().trim();
  const logo = (setLogo || '').toLowerCase().trim();

  // TCGdex series URL path for pocket
  if (logo.includes('/tcgp/')) return true;

  // Pocket set ID format (A1, A1a, A2, A2a, A2b, A3, A3a, A3b, A4, A4a, B1, B1a, B2, B2a, P-A, P-B)
  if (/^(a\d[a-z]?|b\d[a-z]?|p-[ab])$/i.test(id)) return true;

  // Pocket set names in English and German
  if (
    name.includes('pocket') ||
    name.includes('genetic apex') ||
    name.includes('unschlagbare gene') ||
    name.includes('mythical island') ||
    name.includes('fabelhafte insel') ||
    name.includes('space-time smackdown') ||
    name.includes('raum-zeit-kollision') ||
    name.includes('triumphant light') ||
    name.includes('triumphierendes licht') ||
    name.includes('shining revelry') ||
    name.includes('strahlendes fest') ||
    name.includes('celestial guardians') ||
    name.includes('extradimensional crisis') ||
    name.includes('eevee grove') ||
    name.includes('wisdom of sea and sky') ||
    name.includes('secluded springs') ||
    name.includes('mega rising') ||
    name.includes('crimson blaze') ||
    name.includes('fantastical parade') ||
    name.includes('paldean wonders')
  ) {
    return true;
  }

  return false;
}

/**
 * Returns localized set name.
 * If language is ja, ko, zh-tw, or de, returns German / Western translated name so user can read it.
 * If language is en, returns English name.
 */
export function getLocalizedSetName(
  setId: string,
  rawName: string,
  lang: Language
): string {
  if (!setId) return rawName || '';

  // Direct Asian/Western dictionary mapping
  if (ASIAN_SET_NAMES[setId]) {
    return ASIAN_SET_NAMES[setId];
  }

  // Case-insensitive check
  const matchedKey = Object.keys(ASIAN_SET_NAMES).find(
    (k) => k.toLowerCase() === setId.toLowerCase()
  );
  if (matchedKey) {
    return ASIAN_SET_NAMES[matchedKey];
  }

  return rawName || setId;
}

// Keywords & Aliases to make search intuitive across German, English, Japanese, and set codes
export const SET_SEARCH_ALIASES: Record<string, string[]> = {
  '30th': ['30', '30th', '30 jahre', '30周年', '30th anniversary', 'm6a', 'celebration', 'jubiläum', 'pikachu', 'mew', 'futuristic'],
  '30th-c': ['30', '30th', '30 jahre', '30周年', '30th classic', 'classic', 'klassik', 'sammlung', 'charizard', 'glurak'],
  'm6a': ['30', '30th', '30 jahre', '30周年', '30th anniversary', 'm6a', 'celebration'],
  'sv2a': ['151', 'pokemon 151', 'sv2a', 'kanto', 'mew', 'glurak', 'charizard'],
  's8a': ['25', '25th', '25 jahre', '25th anniversary', 'celebrations', 's8a'],
  'cp6': ['20', '20th', '20 jahre', '20th anniversary', 'evolution', 'cp6'],
  's12a': ['vstar universe', 'zenit der könige', 'crown zenith', 's12a'],
  'sv8a': ['terastal festival', 'prismatic evolutions', 'prismatische entwicklungen', 'eevee', 'eeveelutions', 'sv8a'],
  's6a': ['eevee heroes', 'drachenwandel', 'evolving skies', 's6a'],
  'sv8': ['supercharged breaker', 'stürmische funken', 'surging sparks', 'sv8', 'pikachu'],
  'sv7': ['stellar miracle', 'stellarkrone', 'stellar crown', 'sv7', 'terapagos'],
  'sv6': ['mask of change', 'maskerade im zwielicht', 'twilight masquerade', 'sv6', 'ogerpon'],
};

/**
 * Checks if a set matches a search query by ID, localized name, or alias keywords.
 */
export function matchSetByQuery(setId: string, setName: string, query: string): boolean {
  if (!query) return true;
  const q = query.trim().toLowerCase();
  if (!q) return true;

  const idLower = (setId || '').toLowerCase();
  const nameLower = (setName || '').toLowerCase();

  if (idLower.includes(q) || nameLower.includes(q)) return true;

  // Direct 30 check
  if ((q === '30' || q === '30th') && (idLower === '30th' || idLower === '30th-c' || idLower === 'm6a')) {
    return true;
  }

  // Check aliases
  const aliases = SET_SEARCH_ALIASES[idLower];
  if (aliases) {
    if (aliases.some((a) => a.toLowerCase().includes(q) || q.includes(a.toLowerCase()))) {
      return true;
    }
  }

  return false;
}

/**
 * UI Translations based on language.
 * JA, KO, ZH-TW and DE all use German UI, while EN uses English.
 */
export function getUiText(lang: Language) {
  const isEnglish = lang === 'en';

  return {
    stageView: isEnglish ? 'Stage View' : 'Bühnenansicht',
    searchPokemon: isEnglish ? 'Search Pokémon or Displays...' : 'Pokémon oder Displays suchen...',
    search: isEnglish ? 'Search' : 'Suchen',
    allHits: isEnglish ? 'All Hits' : 'Alle Hits',
    sirSar: 'SAR / SIR',
    irAr: 'AR / IR',
    goldUr: 'Gold UR',
    ultraRare: isEnglish ? 'Ultra Rare' : 'Ultra Rare',
    sortByHits: isEnglish ? 'Biggest Hits First' : 'Größte Hits zuerst',
    sortByNumberAsc: isEnglish ? 'Card # (Low to High)' : 'Kartennr. (Aufsteigend)',
    sortByNumberDesc: isEnglish ? 'Card # (High to Low)' : 'Kartennr. (Absteigend)',
    sortByName: isEnglish ? 'Name (A-Z)' : 'Name (A-Z)',
    hitsShowing: isEnglish ? 'Hits Showing' : 'Hits angezeigt',
    totalDisplay: isEnglish ? 'Total Display' : 'Karten im Display',
    boosterDisplays: isEnglish ? 'Booster Displays' : 'Booster Displays',
    searchSets: isEnglish ? 'Search sets...' : 'Displays durchsuchen...',
    active: isEnglish ? 'Active' : 'Aktiv',
    cards: isEnglish ? 'cards' : 'Karten',
    selectedDisplay: isEnglish ? 'Selected Display' : 'Ausgewähltes Display',
    displayHits: isEnglish ? 'Display Hits' : 'Display Hits',
    matchingDisplays: isEnglish ? 'Matching Displays' : 'Gefundene Displays',
    matchingCards: isEnglish ? 'Matching Cards' : 'Gefundene Karten',
    openDisplay: isEnglish ? 'Open Display' : 'Display öffnen',
    hitOf: (curr: number, total: number) =>
      isEnglish ? `Hit ${curr} of ${total}` : `Hit ${curr} von ${total}`,
    cardNum: (num: string) => (isEnglish ? `Card #${num}` : `Karte #${num}`),
    tapHint: isEnglish
      ? 'Tap any card to enter 3D Fullscreen Hit Stage'
      : 'Tippe auf eine Karte für die 3D-Bühnenansicht',
    swipeDownCloseHint: isEnglish
      ? 'Swipe down or press ESC to close'
      : 'Nach unten wischen zum Schließen',
    jumpToDisplay: isEnglish ? 'Jump to Display' : 'Zum Display',
    cardsFound: (count: number) =>
      isEnglish ? `${count} cards found` : `${count} Karten gefunden`,
    clickToJump: isEnglish
      ? 'Click any card to jump directly to its display'
      : 'Klicke auf eine Karte, um direkt zum Display zu springen',
    noHitsFound: isEnglish
      ? 'No hits found for this category'
      : 'Keine Hits für diese Kategorie gefunden',
    tryAllHits: isEnglish
      ? 'Try selecting "All Hits" or another display from the carousel above.'
      : 'Wähle "Alle Hits" oder ein anderes Display aus dem Karussell oben.',
    showMoreHits: isEnglish ? 'Show More Hits' : 'Mehr Hits anzeigen',
    remaining: isEnglish ? 'remaining' : 'übrig',
    celebrate: isEnglish ? 'Click card to celebrate' : 'Auf Karte klicken zum Feiern',
    languageLabel: isEnglish ? 'Language:' : 'Sprache:',
    noCardsFound: (q: string) =>
      isEnglish ? `No cards found matching "${q}"` : `Keine Karten gefunden für "${q}"`,
    searchHelperText: isEnglish
      ? 'Type any Pokémon name or display name to find cards and booster displays'
      : 'Tippe einen Pokémon-Namen oder Display-Namen ein, um Displays und Karten zu finden',
    searchHintLanguage: (langName: string) =>
      isEnglish
        ? `Try searching for the ${langName} name or switch language above`
        : `Suche nach dem Namen auf ${langName} oder wechsle oben die Sprache`,
    keyboardHint: isEnglish
      ? 'Use ← → keys or swipe horizontally'
      : 'Pfeiltasten ← → oder horizontal wischen',
  };
}
