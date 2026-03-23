# Morse Code Translator

**Live Demo**: https://morse-code-indol.vercel.app

**Deploy Status**: Deployed to Vercel

## Features

### Core Translator (M1)
- Bidirectional real-time translation: Text ↔ Morse Code
- Standard International Morse Code (A-Z, 0-9, punctuation)
- Audio playback via Web Audio API OscillatorNode with PARIS-standard timing
- Adjustable speed: 5, 10, 15, 20, 25 WPM (default 15)
- Play/Stop controls
- Copy buttons for both text and Morse output
- Clear buttons for both panels
- Reference chart: A-Z + 0-9 (36 entries) with dot/dash patterns

### Enhanced Features (M2)
- **Playback Animation**: Visual dot/dash sequence with blue (#00d4ff) highlight on current symbol
- **Swap Direction**: ⇄ button to switch input/output content
- **Character Counter**: Real-time count on both text areas
- **Dark Theme**: Deep dark UI (#0f0f1a) with glow effects
- **Responsive Design**: 768px breakpoint, swap button rotates 90° on mobile

## Tech Stack
- HTML5 + CSS3 + Vanilla JavaScript
- Web Audio API OscillatorNode for beep generation
- No frameworks, no dependencies
- Static deployment on Vercel
