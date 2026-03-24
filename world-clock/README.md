# World Clock Dashboard

**Live Demo**: https://world-clock-seven-roan.vercel.app

**Deploy Status**: Deployed to Vercel

## Features

### Core Dashboard (M1)
- Multiple timezone clocks displayed as cards in a grid
- Canvas analog clock face with hour/minute/second hands, ticking in real-time
- Digital time (HH:MM:SS) + date + UTC offset per card
- 4 default clocks: New York, London, Tokyo, Sydney
- Add clock from 36 major cities with search/filter
- Remove individual clocks
- localStorage persistence of clock list

### Enhanced Features (M2)
- **12h/24h Toggle**: Switch time format with AM/PM display, persisted
- **Local Timezone Highlight**: Accent border + glow + "(Local)" label
- **Time Difference**: Shows "+Xh from local" per card (supports half-hour offsets)
- **Reorder**: ▲/▼ buttons to rearrange clocks, order persisted
- **Dark/Light Theme**: Toggle with CSS variables, Canvas clock face adapts
- **Responsive Grid**: 4 columns (desktop) → 3 → 2 → 1 (mobile)

## Tech Stack
- HTML5 Canvas + CSS3 + Vanilla JavaScript
- Intl.DateTimeFormat for timezone handling
- No frameworks, no dependencies
- Static deployment on Vercel
