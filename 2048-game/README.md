# 2048 Puzzle Game

**Live Demo**: https://2048-game-seven-self.vercel.app

**Deploy Status**: Deployed to Vercel

## Features

### Core Game (M1)
- 4x4 grid with numbered tiles (powers of 2)
- Arrow keys to slide tiles in any direction
- Tiles merge when same values collide ([2,2,2,2] → [4,4])
- Score tracking (sum of merged values)
- Win condition: create a 2048 tile with "Keep Going" option
- Game Over detection when no valid moves remain
- New Game button to reset
- 11 distinct tile colors by value (2→light to 2048→gold)

### Enhanced Features (M2)
- **Smooth Animations**: CSS transitions for tile sliding (0.12s), appear fade-in, merge pop bounce
- **Touch Swipe**: Mobile swipe controls with 30px threshold, touch-action:none
- **Undo**: One-level undo with state snapshot, auto-disabled after use
- **Best Score**: localStorage persistence, survives refresh, not reset by New Game
- **Responsive Design**: 520px/380px breakpoints, no overflow down to 320px
- **Dark Theme**: Deep blue background (#1a1a2e), gold title, high-contrast tiles

## Tech Stack
- HTML5 + CSS3 + Vanilla JavaScript
- CSS Custom Properties for theming
- No frameworks, no dependencies
- Static deployment on Vercel
