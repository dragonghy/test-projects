# Snake Game

**Live Demo**: https://snake-game-self-sigma.vercel.app

**Deploy Status**: Deployed to Vercel

## Features

### Core Game (M1)
- Classic snake gameplay on HTML5 Canvas
- Arrow Keys / WASD controls with 180-degree reversal prevention
- Food spawning, eating mechanics, score tracking
- Wall and self-collision detection
- Game Over overlay with score display
- Speed progression (faster every 5 points)
- High score persistence via localStorage
- 60fps smooth rendering with requestAnimationFrame

### Enhanced Features (M2)
- **Pause/Resume**: Space or P key with "PAUSED" overlay
- **Mobile Touch**: Swipe gesture controls + tap to start/restart
- **Responsive Layout**: Scales from 320px to desktop
- **Visual Polish**: Distinct snake head with eyes, food pulse glow animation
- **Difficulty Selection**: Easy/Medium/Hard (keys 1/2/3) with different speeds

## Tech Stack
- HTML5 Canvas + CSS3 + Vanilla JavaScript (ES6 Modules)
- No frameworks, no dependencies
- Static deployment on Vercel
