# Pixel Art Editor

**Live Demo**: https://pixel-art-one-sable.vercel.app

**Deploy Status**: Deployed to Vercel

## Features

### Core Editor (M1)
- 16x16 grid-based canvas for pixel-perfect drawing
- Tools: Pen (click + drag), Eraser, Fill (flood fill with boundary detection), Eyedropper
- Color picker + 16-color preset palette
- Grid lines toggle
- Undo/Redo with Ctrl+Z / Ctrl+Shift+Z keyboard shortcuts
- Clear canvas (undoable)
- Export as 512x512 PNG
- Keyboard shortcuts: P (pen), E (eraser), F (fill), I (eyedropper)

### Enhanced Features (M2)
- **Grid Size Options**: 8x8, 16x16, 32x32, 64x64 with confirm dialog
- **Mirror Mode**: Left-right symmetry drawing with red center line indicator
- **Animation Frames**: Add/delete frames, navigate via thumbnails, independent pixel data per frame
- **Animation Playback**: Play/Pause with adjustable FPS (1-24), canvas locked during playback
- **Onion Skin**: 30% transparent overlay of previous frame for smooth animation
- **Touch Support**: touchstart/touchmove/touchend for mobile drawing

## Tech Stack
- HTML5 Canvas + CSS3 + Vanilla JavaScript
- No frameworks, no dependencies
- Static deployment on Vercel
