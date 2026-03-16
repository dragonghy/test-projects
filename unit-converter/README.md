# Unit Converter - PRD

**Live Demo**: https://unit-converter-six-sage.vercel.app

**Deploy Status**: ✅ Deployed to Vercel

## 1. Product Overview

### Problem
Users frequently need to convert between different measurement units (e.g., miles to kilometers, Fahrenheit to Celsius). Existing tools are often cluttered with ads, slow to load, or require navigating multiple pages. We need a fast, clean, single-page web app that provides instant unit conversions.

### Solution
A lightweight, pure frontend Unit Converter web application deployed on Vercel. No backend required — all conversion logic runs client-side. The app should feel instant and delightful to use.

### Target Users
- Students, engineers, travelers, cooks, developers — anyone who needs quick unit conversions.

---

## 2. User Interaction Design

### Core Flow
1. User opens the app → sees a clean interface with category tabs/buttons
2. User selects a **category** (e.g., Length)
3. Two dropdowns appear: **source unit** and **target unit**, pre-filled with common defaults
4. User types a number in the **input field**
5. The **result updates in real-time** as the user types (no "Convert" button needed)
6. User can click a **swap button** (↔) to reverse source and target units

### Secondary Features
- **Search units**: A search/filter box to quickly find a unit within a category
- **Favorites**: Users can star/bookmark frequently used conversion pairs; favorites persist in localStorage
- **History**: Recent conversions are saved (localStorage) and displayed in a collapsible panel

### Layout (Single Page)
```
┌─────────────────────────────────────┐
│  Unit Converter              [★][⏱] │  ← Header with favorites & history toggles
├─────────────────────────────────────┤
│  [Length] [Weight] [Temp] [Area]    │  ← Category selector (tabs or pills)
│  [Volume] [Speed] [Time] [Data]    │
├─────────────────────────────────────┤
│  🔍 Search units...                │  ← Unit search/filter (optional)
├─────────────────────────────────────┤
│  ┌───────────┐      ┌───────────┐  │
│  │ From: [v] │  ↔   │ To:   [v] │  │  ← Unit selectors with swap
│  └───────────┘      └───────────┘  │
├─────────────────────────────────────┤
│  Input:  [ 100          ]           │  ← Number input
│  Result: 328.084 feet               │  ← Real-time result
│  Formula: 1 meter = 3.28084 feet    │  ← Conversion formula reference
├─────────────────────────────────────┤
│  ⭐ Favorites  (collapsible)        │
│  📋 History    (collapsible)        │
└─────────────────────────────────────┘
```

---

## 3. Architecture Overview

### Tech Stack
- **HTML5 + CSS3 + Vanilla JavaScript** (no frameworks)
- Single `index.html` file with embedded or linked CSS/JS (developer decides file organization)
- **Vercel** for static deployment

### Data Architecture
- All conversion factors stored as JS constants/objects
- localStorage for favorites and history persistence
- No server calls, no API dependencies

### Key Technical Considerations
- Temperature conversions require formulas (not simple multiplication) — must handle Fahrenheit ↔ Celsius ↔ Kelvin correctly
- Floating point precision: display results rounded sensibly (avoid showing 15 decimal places)
- Responsive design: must work well on mobile and desktop
- Accessible: proper ARIA labels, keyboard navigation support

---

## 4. Supported Categories & Units

### 4.1 Length
meter, kilometer, centimeter, millimeter, micrometer, nanometer, mile, yard, foot, inch, nautical mile

### 4.2 Weight / Mass
kilogram, gram, milligram, microgram, metric ton, pound, ounce, stone

### 4.3 Temperature
Celsius, Fahrenheit, Kelvin

### 4.4 Area
square meter, square kilometer, square centimeter, square millimeter, hectare, acre, square mile, square yard, square foot, square inch

### 4.5 Volume
cubic meter, liter, milliliter, gallon (US), quart (US), pint (US), cup (US), fluid ounce (US), tablespoon, teaspoon

### 4.6 Speed
meter/second, kilometer/hour, mile/hour, knot, foot/second

### 4.7 Time
second, millisecond, microsecond, minute, hour, day, week, month (30 days), year (365 days)

### 4.8 Data Storage
bit, byte, kilobyte (KB), megabyte (MB), gigabyte (GB), terabyte (TB), petabyte (PB), kibibyte (KiB), mebibyte (MiB), gibibyte (GiB), tebibyte (TiB)

---

## 5. Feature List & Priority

| # | Feature | Priority | Milestone |
|---|---------|----------|-----------|
| F1 | Category selection (8 categories) | P0 | M1 |
| F2 | Unit dropdowns (source & target) per category | P0 | M1 |
| F3 | Numeric input with real-time conversion result | P0 | M1 |
| F4 | Swap source/target button | P0 | M1 |
| F5 | Correct conversion logic for all unit categories | P0 | M1 |
| F6 | Conversion formula display | P1 | M1 |
| F7 | Responsive design (mobile + desktop) | P0 | M1 |
| F8 | Unit search/filter within category | P1 | M2 |
| F9 | Favorites (star conversion pairs, persist in localStorage) | P1 | M2 |
| F10 | Conversion history (localStorage, collapsible panel) | P1 | M2 |
| F11 | Keyboard navigation & accessibility (ARIA) | P1 | M2 |
| F12 | Vercel deployment | P0 | M3 |

---

## 6. Acceptance Criteria

### F1: Category Selection
- [ ] All 8 categories are visible and selectable
- [ ] Selected category is visually highlighted
- [ ] Switching category updates the unit dropdowns immediately

### F2: Unit Dropdowns
- [ ] Each category shows its correct set of units in both dropdowns
- [ ] Default selections are sensible (e.g., Length defaults to meter → foot)

### F3: Real-time Conversion
- [ ] Typing a number instantly shows the converted result (no submit button)
- [ ] Empty or invalid input shows a clear state (e.g., "0" or placeholder)
- [ ] Results display with appropriate decimal precision (no floating point noise)

### F4: Swap Button
- [ ] Clicking swap reverses source and target units
- [ ] If there's an input value, the result recalculates immediately after swap

### F5: Conversion Accuracy
- [ ] All unit conversions produce correct results (verified against known references)
- [ ] Temperature conversions use correct formulas (not just multiplication)
- [ ] Edge cases: 0 input, very large numbers, negative numbers (temperature)

### F6: Formula Display
- [ ] Shows the base conversion formula (e.g., "1 meter = 3.28084 feet")

### F7: Responsive Design
- [ ] Usable on screens from 320px to 1920px wide
- [ ] Touch-friendly on mobile (adequate tap targets)

### F8: Unit Search
- [ ] Typing in search box filters the available units in both dropdowns
- [ ] Search is case-insensitive

### F9: Favorites
- [ ] Users can star a conversion pair (category + from + to)
- [ ] Starred items appear in a favorites section
- [ ] Clicking a favorite loads that conversion immediately
- [ ] Favorites persist across page reloads (localStorage)

### F10: History
- [ ] Each conversion is auto-saved to history (most recent first)
- [ ] History shows: value, from-unit, to-unit, result
- [ ] History persists across page reloads (localStorage)
- [ ] User can clear history

### F11: Accessibility
- [ ] All interactive elements are keyboard-navigable
- [ ] Screen reader friendly (proper ARIA labels)

### F12: Deployment
- [ ] App is deployed on Vercel and accessible via public URL
- [ ] Page loads fast (< 1s on broadband)

---

## 7. Product Milestones

### M1: Core Conversion Engine (MVP)
**Goal**: A working unit converter with all 8 categories, real-time conversion, swap, and responsive layout.
- Features: F1, F2, F3, F4, F5, F6, F7
- **Acceptance**: User can select any category, pick units, type a value, and see correct real-time results. Works on mobile and desktop.

### M2: Enhanced UX
**Goal**: Add search, favorites, and history for power users.
- Features: F8, F9, F10, F11
- **Acceptance**: User can search units, bookmark frequent conversions, and see their conversion history.

### M3: Deployment
**Goal**: Ship it live on Vercel.
- Features: F12
- **Acceptance**: App is accessible via a public Vercel URL, loads fast, fully functional.

---

## 8. Out of Scope
- Backend / server-side logic
- User accounts / authentication
- Currency conversion (requires live exchange rates API)
- Offline PWA support (nice-to-have for future)
- Dark mode (nice-to-have for future)
