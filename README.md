# ⚡ Hit Announcer 3000

A high-performance, responsive, and minimalist web application designed to showcase the top **hits** (Secret Rares, Special Illustration Rares, Alternate Arts, Ultra Rares, and Gold cards) of any Pokémon booster display across 5 languages:
- 🇬🇧 **English (EN)**
- 🇩🇪 **German (DE)**
- 🇯🇵 **Japanese (JA)**
- 🇨🇳 **Chinese (ZH)**
- 🇰🇷 **Korean (KO)**

---

## ✨ Features

- **Holographic 3D Foil & Animated Idle Sheen**:
  - Replicates the physical trading card holo sheen with an interactive, continuous diagonal light beam sweep across the card art even when idle.
  - Interactive 3D perspective tilt tracking mouse on desktop or finger drag / mobile gyroscope on mobile devices.
  - Multi-layer chromatic diffraction and prismatic rainbow foil reflections.
- **Booster Display Carousel**:
  - Horizontal swipeable shelf to quickly browse and switch between hundreds of booster displays.
  - Filter by language and instant search by set name.
- **Fullscreen Stage View / Hit Announcer**:
  - Cinematic single-card presentation mode designed for pack openings, tablet tabletop displays, and streams.
  - Quick navigation arrows (`←` / `→`) to advance through hits.
  - Keyboard shortcut support and touch swipe gestures.
  - Celebratory holographic confetti burst on card tap.
- **Hit Rarity Filters & Sorting**:
  - Filter by rarity: *All Hits*, *SAR / SIR*, *AR / IR*, *Gold UR*, *Ultra Rare*.
  - Sort by *Biggest Hits First* (rarity weighted), *Card Number*, or *Name*.
  - Clean, distraction-free view with **no price clutter**.
- **Multilingual TCGdex API Integration**:
  - Live data and high-res WebP card assets from official releases worldwide.

---

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Production build
npm run build
npm run start
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

---

## 🛠️ Built With

- [Next.js 15](https://nextjs.org/) (App Router, Turbopack)
- [React 19](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)
- [Canvas Confetti](https://www.npmjs.com/package/canvas-confetti)
- [TCGdex API](https://tcgdex.dev/)
