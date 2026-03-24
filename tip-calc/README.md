# Tip Calculator

**Live Demo**: https://tip-calc-ebon.vercel.app

**Deploy Status**: Deployed to Vercel

## Features

### Core Calculator (M1)
- Bill amount input with decimal support
- 5 tip preset buttons (10%, 15%, 18%, 20%, 25%) + custom percentage input
- People count (1-20) with +/- buttons
- Real-time calculation on any input change
- 4 result displays: tip amount, total with tip, per-person tip, per-person total
- All amounts formatted to 2 decimal places
- Reset button clears all inputs

### Enhanced Features (M2)
- **Round Up/Down**: Toggle to round per-person amounts
- **Calculation History**: Last 5 calculations (session-only, not persisted)
- **Currency Selector**: USD ($), EUR (€), GBP (£), JPY (¥), CNY (¥) with correct symbols
- **Keyboard Navigation**: Full Tab support with focus-visible indicators
- **Dark Theme**: Polished dark UI
- **Mobile-First**: Touch targets ≥44px, responsive at 375px, tip buttons auto-wrap

## Tech Stack
- HTML5 + CSS3 + Vanilla JavaScript
- No frameworks, no dependencies
- Static deployment on Vercel
