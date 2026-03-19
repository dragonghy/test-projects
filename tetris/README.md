# Tetris

**Live Demo**: https://tetris-taupe-five.vercel.app

**Deploy Status**: Deployed to Vercel

## Features

### Core Game (M1)
- 10x20 game board on HTML5 Canvas
- 7 standard tetrominoes (I, O, T, S, Z, J, L) with distinct colors
- Arrow keys: left/right move, down soft drop, up rotate
- SRS Wall Kick rotation system
- 7-bag randomizer for fair piece distribution
- Line clearing with flash animation feedback
- Scoring: 100/300/500/800 × level for 1-4 lines
- Level progression every 10 lines cleared
- Game Over detection and restart

### Enhanced Features (M2)
- **Ghost Piece**: Semi-transparent shadow showing landing position
- **Hold Piece**: Press C to store/swap current piece (once per drop)
- **Hard Drop**: Space for instant drop to ghost position
- **Pause**: P key with "PAUSED" overlay, blocks all input
- **Next Piece Preview**: Right panel shows upcoming piece
- **High Score**: localStorage persistence, updated on game over
- **Responsive Design**: 768px/480px breakpoints with scaling
- **Dark Theme**: Unified dark UI (#1a1a2e background)

## Tech Stack
- HTML5 Canvas + CSS3 + Vanilla JavaScript
- No frameworks, no dependencies
- Static deployment on Vercel
