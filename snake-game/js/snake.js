// Snake entity module
// Manages snake position, movement, growth, and self-collision detection

export const Direction = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
};

export class Snake {
  constructor(gridWidth, gridHeight) {
    this.gridWidth = gridWidth;
    this.gridHeight = gridHeight;
    this.reset();
  }

  reset() {
    // Start in the center, moving right, length 3
    const centerX = Math.floor(this.gridWidth / 2);
    const centerY = Math.floor(this.gridHeight / 2);
    this.segments = [
      { x: centerX, y: centerY },
      { x: centerX - 1, y: centerY },
      { x: centerX - 2, y: centerY },
    ];
    this.direction = Direction.RIGHT;
    this._growing = false;
  }

  get head() {
    return this.segments[0];
  }

  move() {
    const newHead = {
      x: this.head.x + this.direction.x,
      y: this.head.y + this.direction.y,
    };
    this.segments.unshift(newHead);

    if (this._growing) {
      this._growing = false;
    } else {
      this.segments.pop();
    }
  }

  grow() {
    this._growing = true;
  }

  checkWallCollision() {
    return (
      this.head.x < 0 ||
      this.head.x >= this.gridWidth ||
      this.head.y < 0 ||
      this.head.y >= this.gridHeight
    );
  }

  checkSelfCollision() {
    for (let i = 1; i < this.segments.length; i++) {
      if (this.segments[i].x === this.head.x && this.segments[i].y === this.head.y) {
        return true;
      }
    }
    return false;
  }

  occupies(x, y) {
    return this.segments.some(seg => seg.x === x && seg.y === y);
  }

  setDirection(newDirection) {
    // Prevent 180-degree reversal
    if (this.direction.x + newDirection.x === 0 && this.direction.y + newDirection.y === 0) {
      return;
    }
    this.direction = newDirection;
  }
}
