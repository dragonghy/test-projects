# Minesweeper

**Live Demo**: https://minesweeper-pink-ten.vercel.app

**Deploy Status**: Deployed to Vercel

## Features

### Core Game (M1)
- Classic minesweeper grid with left-click reveal, right-click flag
- 3 difficulty levels: Beginner (9x9, 10 mines), Intermediate (16x16, 40 mines), Expert (30x16, 99 mines)
- Recursive flood fill for empty cells
- Win detection (all safe cells revealed) and lose detection (mine clicked)
- Game Over shows all mine positions

### Enhanced UX (M2)
- First-click safety (first click never hits a mine)
- Timer and remaining mine counter
- Emoji face button: 😀 playing, 😎 win, 😵 lose
- Number colors 1-8 (blue, green, red, dark blue, dark red, cyan, black, gray)
- 3D raised/sunken cell effects
- Responsive design (desktop + mobile)
- Mobile long-press to flag (400ms threshold)
- Touch-action handling to prevent double-tap zoom

## Tech Stack
- HTML5 + CSS3 + Vanilla JavaScript
- No frameworks, no dependencies
- Static deployment on Vercel
