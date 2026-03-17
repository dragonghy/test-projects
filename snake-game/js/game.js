// Main game controller
// Manages game loop, state, scoring, speed progression, and difficulty

import { Snake } from './snake.js';
import { Food } from './food.js';
import { InputHandler } from './input.js';
import { Renderer } from './renderer.js';

const GRID_WIDTH = 20;
const GRID_HEIGHT = 20;
const SPEED_INCREMENT = 1;
const SPEED_INCREASE_INTERVAL = 5;

const DIFFICULTY = {
  easy: { baseTick: 5, label: 'Easy' },
  medium: { baseTick: 8, label: 'Medium' },
  hard: { baseTick: 12, label: 'Hard' },
};

const State = {
  START: 'start',
  PLAYING: 'playing',
  PAUSED: 'paused',
  GAME_OVER: 'game_over',
};

export { State, DIFFICULTY, GRID_WIDTH, GRID_HEIGHT, SPEED_INCREMENT, SPEED_INCREASE_INTERVAL };

class Game {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.cellSize = this._calcCellSize();
    this.renderer = new Renderer(this.canvas, this.cellSize, GRID_WIDTH, GRID_HEIGHT);
    this.snake = new Snake(GRID_WIDTH, GRID_HEIGHT);
    this.food = new Food(GRID_WIDTH, GRID_HEIGHT);
    this.input = new InputHandler();

    this.score = 0;
    this.highScore = this._loadHighScore();
    this.state = State.START;
    this.difficulty = 'medium';
    this.tickAccumulator = 0;
    this.lastTime = 0;
    this._animTimestamp = 0;

    this.input.attachTouchTarget(this.canvas);

    this.input.setCallbacks({
      onStart: () => {
        if (this.state === State.START) {
          this._startGame();
        }
      },
      onRestart: () => {
        if (this.state === State.GAME_OVER) {
          this._startGame();
        }
      },
      onPause: () => {
        if (this.state === State.PLAYING) {
          this.state = State.PAUSED;
          this.tickAccumulator = 0;
          this._render();
          this.renderer.drawPauseScreen();
        } else if (this.state === State.PAUSED) {
          this.state = State.PLAYING;
          this.lastTime = 0; // reset delta to avoid jump
        }
      },
      onDifficulty: (level) => {
        if (this.state === State.START) {
          this.difficulty = level;
          this.renderer.drawStartScreen(this.highScore, this.difficulty);
        }
      },
    });

    this._updateScoreDisplay();
    this.renderer.drawStartScreen(this.highScore, this.difficulty);

    // Responsive resize
    this._onResize = this._onResize.bind(this);
    window.addEventListener('resize', this._onResize);

    requestAnimationFrame((t) => this._loop(t));
  }

  get baseTick() {
    return DIFFICULTY[this.difficulty].baseTick;
  }

  get tickRate() {
    const speedLevel = Math.floor(this.score / SPEED_INCREASE_INTERVAL);
    return this.baseTick + speedLevel * SPEED_INCREMENT;
  }

  _calcCellSize() {
    const maxWidth = Math.min(window.innerWidth - 32, 400);
    return Math.max(10, Math.floor(maxWidth / GRID_WIDTH));
  }

  _onResize() {
    const newSize = this._calcCellSize();
    if (newSize !== this.cellSize) {
      this.cellSize = newSize;
      this.renderer.resize(newSize);
      this._redrawCurrentState();
    }
  }

  _redrawCurrentState() {
    switch (this.state) {
      case State.START:
        this.renderer.drawStartScreen(this.highScore, this.difficulty);
        break;
      case State.PLAYING:
        this._render();
        break;
      case State.PAUSED:
        this._render();
        this.renderer.drawPauseScreen();
        break;
      case State.GAME_OVER:
        this._render();
        this.renderer.drawGameOver(this.score, this.highScore);
        break;
    }
  }

  _startGame() {
    this.snake.reset();
    this.food.spawn(this.snake);
    this.score = 0;
    this.state = State.PLAYING;
    this.tickAccumulator = 0;
    this.lastTime = 0;
    this.input.clearQueue();
    this._updateScoreDisplay();
  }

  _loop(timestamp) {
    this._animTimestamp = timestamp;

    if (this.state === State.PLAYING) {
      if (this.lastTime === 0) {
        this.lastTime = timestamp;
      }
      const delta = (timestamp - this.lastTime) / 1000;
      this.lastTime = timestamp;

      this.tickAccumulator += delta * this.tickRate;

      while (this.tickAccumulator >= 1) {
        this._tick();
        this.tickAccumulator -= 1;
        if (this.state !== State.PLAYING) break;
      }

      if (this.state === State.PLAYING) {
        this._render();
      }
    }

    requestAnimationFrame((t) => this._loop(t));
  }

  _tick() {
    const newDir = this.input.consumeDirection(this.snake.direction);
    if (newDir) {
      this.snake.setDirection(newDir);
    }

    this.snake.move();

    if (this.snake.checkWallCollision() || this.snake.checkSelfCollision()) {
      this._gameOver();
      return;
    }

    if (this.snake.head.x === this.food.position.x && this.snake.head.y === this.food.position.y) {
      this.snake.grow();
      this.score += 1;
      this.food.spawn(this.snake);
      this._updateScoreDisplay();
    }
  }

  _gameOver() {
    this.state = State.GAME_OVER;
    if (this.score > this.highScore) {
      this.highScore = this.score;
      this._saveHighScore();
    }
    this._updateScoreDisplay();
    this._render();
    this.renderer.drawGameOver(this.score, this.highScore);
  }

  _render() {
    this.renderer.clear();
    this.renderer.drawGrid();
    this.renderer.drawSnake(this.snake.segments);
    this.renderer.drawFood(this.food.position, this._animTimestamp);
  }

  _updateScoreDisplay() {
    const scoreEl = document.getElementById('score');
    const highScoreEl = document.getElementById('high-score');
    if (scoreEl) scoreEl.textContent = this.score;
    if (highScoreEl) highScoreEl.textContent = this.highScore;
  }

  _loadHighScore() {
    try {
      return parseInt(localStorage.getItem('snakeHighScore')) || 0;
    } catch {
      return 0;
    }
  }

  _saveHighScore() {
    try {
      localStorage.setItem('snakeHighScore', this.highScore.toString());
    } catch {
      // localStorage unavailable
    }
  }
}

new Game();
