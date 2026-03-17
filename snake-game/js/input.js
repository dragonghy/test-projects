// Input handler module
// Manages keyboard input, touch gestures, and direction queuing

import { Direction } from './snake.js';

const SWIPE_THRESHOLD = 30; // minimum px for a swipe

export class InputHandler {
  constructor() {
    this._directionQueue = [];
    this._onStart = null;
    this._onRestart = null;
    this._onPause = null;
    this._onDifficulty = null;
    this._touchStartX = 0;
    this._touchStartY = 0;

    this._handleKeyDown = this._handleKeyDown.bind(this);
    document.addEventListener('keydown', this._handleKeyDown);

    // Touch controls
    this._handleTouchStart = this._handleTouchStart.bind(this);
    this._handleTouchEnd = this._handleTouchEnd.bind(this);
  }

  attachTouchTarget(element) {
    element.addEventListener('touchstart', this._handleTouchStart, { passive: false });
    element.addEventListener('touchend', this._handleTouchEnd, { passive: false });
  }

  setCallbacks({ onStart, onRestart, onPause, onDifficulty }) {
    this._onStart = onStart || null;
    this._onRestart = onRestart || null;
    this._onPause = onPause || null;
    this._onDifficulty = onDifficulty || null;
  }

  _handleKeyDown(e) {
    switch (e.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        e.preventDefault();
        this._directionQueue.push(Direction.UP);
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        e.preventDefault();
        this._directionQueue.push(Direction.DOWN);
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        e.preventDefault();
        this._directionQueue.push(Direction.LEFT);
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        e.preventDefault();
        this._directionQueue.push(Direction.RIGHT);
        break;
      case 'Enter':
        if (this._onStart) this._onStart();
        if (this._onRestart) this._onRestart();
        break;
      case ' ':
      case 'p':
      case 'P':
        e.preventDefault();
        if (this._onPause) this._onPause();
        break;
      case '1':
        if (this._onDifficulty) this._onDifficulty('easy');
        break;
      case '2':
        if (this._onDifficulty) this._onDifficulty('medium');
        break;
      case '3':
        if (this._onDifficulty) this._onDifficulty('hard');
        break;
    }
  }

  _handleTouchStart(e) {
    const touch = e.touches[0];
    this._touchStartX = touch.clientX;
    this._touchStartY = touch.clientY;
    e.preventDefault();
  }

  _handleTouchEnd(e) {
    if (!e.changedTouches.length) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - this._touchStartX;
    const dy = touch.clientY - this._touchStartY;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    // Need minimum threshold to count as a swipe
    if (Math.max(absDx, absDy) < SWIPE_THRESHOLD) {
      // Tap - treat as start/restart/pause
      if (this._onStart) this._onStart();
      if (this._onRestart) this._onRestart();
      return;
    }

    if (absDx > absDy) {
      this._directionQueue.push(dx > 0 ? Direction.RIGHT : Direction.LEFT);
    } else {
      this._directionQueue.push(dy > 0 ? Direction.DOWN : Direction.UP);
    }
    e.preventDefault();
  }

  consumeDirection(currentDirection) {
    while (this._directionQueue.length > 0) {
      const dir = this._directionQueue.shift();
      // Skip if it's a 180-degree reversal
      if (dir.x + currentDirection.x !== 0 || dir.y + currentDirection.y !== 0) {
        return dir;
      }
    }
    return null;
  }

  clearQueue() {
    this._directionQueue = [];
  }
}
