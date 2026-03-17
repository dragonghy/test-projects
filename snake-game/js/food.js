// Food module
// Handles food positioning and respawning

export class Food {
  constructor(gridWidth, gridHeight) {
    this.gridWidth = gridWidth;
    this.gridHeight = gridHeight;
    this.position = { x: 0, y: 0 };
  }

  spawn(snake) {
    let x, y;
    do {
      x = Math.floor(Math.random() * this.gridWidth);
      y = Math.floor(Math.random() * this.gridHeight);
    } while (snake.occupies(x, y));
    this.position = { x, y };
  }
}
