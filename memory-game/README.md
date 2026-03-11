# Memory Card Game - Web Application

## Project Overview

A memory card matching game built with pure HTML + CSS + JavaScript. Players flip cards to find matching pairs, with smooth 3D flip animations and responsive design for both mobile and desktop.

**Project Ticket**: #235
**Project ID**: 25

## Milestones

### Milestone 1: Basic Game (基础游戏) `[COMPLETED ✅]`

Core gameplay mechanics with a 4x4 card grid.

**Scope**:
- 4x4 card grid layout (8 pairs)
- Click to flip cards; matched pairs stay face-up, unmatched pairs flip back
- 3D flip animation (CSS transform)
- Move counter (increments each time 2 cards are flipped)
- Game completion detection (all pairs matched) with victory message
- Restart button to shuffle and reset
- Responsive design (mobile + desktop)
- Clean code structure with comments

**Acceptance Criteria**:
1. Page loads with 16 face-down cards in a 4x4 grid
2. Clicking a card triggers a smooth 3D flip animation revealing the card face
3. Only 2 cards can be flipped at a time; clicking a 3rd card is ignored while checking match
4. Matched pair: both cards stay face-up with a visual "matched" indicator
5. Unmatched pair: both cards flip back after ~1 second delay
6. Move counter displays and increments correctly (1 move = 1 pair flip)
7. When all 8 pairs are matched, a victory modal/message appears showing total moves
8. Restart button shuffles cards and resets move counter
9. Cards are randomly shuffled each game
10. Layout is responsive: looks good on 375px mobile and 1440px desktop
11. All code in `projects/memory-game/` directory

**Tech Stack**: Pure HTML + CSS + JavaScript, no frameworks

---

### Milestone 2: Enhanced Experience (增强体验) `[COMPLETED ✅]`

Polish and additional features for a complete game experience.

**Scope**:
- Multiple difficulty levels: Easy (3x4=6 pairs), Medium (4x4=8 pairs), Hard (6x6=18 pairs)
- Timer (elapsed time display, starts on first card flip)
- Best score records per difficulty (localStorage persistence)
- Card theme switching (emoji / animals / numbers)
- Beautiful UI design (gradient background, card shadows, hover effects, animations)

**Acceptance Criteria**:
1. Difficulty selector allows choosing Easy/Medium/Hard before or during game
2. Grid adjusts correctly for each difficulty (3x4, 4x4, 6x6)
3. Timer starts on first flip, pauses on game completion, displays MM:SS format
4. Victory screen shows time and moves; if new best, highlights it
5. Best scores saved in localStorage and survive page refresh
6. At least 3 card themes available; switching resets the current game
7. UI has gradient background, card shadows, smooth hover effects
8. All animations are smooth (no jank on mobile)
9. Responsive across all difficulty levels

---

## Technical Requirements

- Pure frontend: HTML + CSS + JavaScript (no frameworks/libraries)
- All code in `projects/memory-game/` directory
- Responsive design (mobile-first)
- Clean, commented code
- Deployable to Vercel as static site

## Project Status: COMPLETED

All milestones have been delivered and verified through comprehensive E2E testing.

- Milestone 1 (Basic Game): Ticket #236 - Completed
- Milestone 2 (Enhanced Experience): Ticket #237 - Completed

## Deployment

- **Live Demo**: https://memory-game-rh2t0i1jf-huayangguos-projects.vercel.app
- Platform: Vercel static deployment
- Entry point: `index.html`
