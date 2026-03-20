# Chess Clock

**Live Demo**: https://chess-clock-iota.vercel.app

**Deploy Status**: Deployed to Vercel

## Features

### Core Clock (M1)
- Two large timer displays, stacked vertically
- Player 2 rotated 180° for face-to-face tablet use
- Click timer area or press Space to switch turns
- 9 preset time controls: Bullet (1+0, 2+1), Blitz (3+0, 3+2, 5+0, 5+3), Rapid (10+0, 15+10, 30+0)
- MM:SS countdown display
- Flag fall detection (time reaches 0:00)
- Move counter per player
- Pause and Reset buttons

### Enhanced Features (M2)
- **Fischer Increment**: Seconds added after each move (e.g., 3+2 = 3 min + 2s/move)
- **Custom Time Control**: Set minutes and increment per player
- **Sound Effects**: Web Audio API — 880Hz tick in last 10s, 220Hz buzzer on flag fall
- **Landscape Mode**: Side-by-side layout with vertical controls
- **Tenths Display**: SS.s format when under 10 seconds
- **Dark Theme**: High-contrast deep blue background
- **Responsive Design**: Phone, tablet, and desktop optimized

## Architecture
- Single HTML file (16KB), all CSS and JS inline
- 50ms precision timing via performance.now()
- Web Audio API for sound generation (no audio files needed)
- Static deployment on Vercel
