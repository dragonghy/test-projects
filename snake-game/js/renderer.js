// Renderer module
// Handles all Canvas drawing operations

export class Renderer {
  constructor(canvas, cellSize, gridWidth, gridHeight) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.cellSize = cellSize;
    this.gridWidth = gridWidth;
    this.gridHeight = gridHeight;

    canvas.width = cellSize * gridWidth;
    canvas.height = cellSize * gridHeight;
  }

  resize(cellSize) {
    this.cellSize = cellSize;
    this.canvas.width = cellSize * this.gridWidth;
    this.canvas.height = cellSize * this.gridHeight;
  }

  clear() {
    this.ctx.fillStyle = '#1a1a2e';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  drawGrid() {
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    this.ctx.lineWidth = 0.5;
    for (let x = 0; x <= this.gridWidth; x++) {
      this.ctx.beginPath();
      this.ctx.moveTo(x * this.cellSize, 0);
      this.ctx.lineTo(x * this.cellSize, this.canvas.height);
      this.ctx.stroke();
    }
    for (let y = 0; y <= this.gridHeight; y++) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y * this.cellSize);
      this.ctx.lineTo(this.canvas.width, y * this.cellSize);
      this.ctx.stroke();
    }
  }

  drawSnake(segments) {
    const cs = this.cellSize;
    segments.forEach((seg, i) => {
      const x = seg.x * cs;
      const y = seg.y * cs;
      const size = cs - 1;

      if (i === 0) {
        // Head - rounded rectangle with eyes
        this.ctx.fillStyle = '#00ff88';
        this._roundRect(x + 0.5, y + 0.5, size, size, cs * 0.3);

        // Eyes
        const eyeSize = Math.max(2, cs * 0.15);
        this.ctx.fillStyle = '#1a1a2e';
        const dir = this._getHeadDirection(segments);
        if (dir === 'right' || dir === 'left') {
          const eyeX = dir === 'right' ? x + size * 0.7 : x + size * 0.3;
          this.ctx.beginPath();
          this.ctx.arc(eyeX, y + size * 0.3, eyeSize, 0, Math.PI * 2);
          this.ctx.fill();
          this.ctx.beginPath();
          this.ctx.arc(eyeX, y + size * 0.7, eyeSize, 0, Math.PI * 2);
          this.ctx.fill();
        } else {
          const eyeY = dir === 'down' ? y + size * 0.7 : y + size * 0.3;
          this.ctx.beginPath();
          this.ctx.arc(x + size * 0.3, eyeY, eyeSize, 0, Math.PI * 2);
          this.ctx.fill();
          this.ctx.beginPath();
          this.ctx.arc(x + size * 0.7, eyeY, eyeSize, 0, Math.PI * 2);
          this.ctx.fill();
        }
      } else {
        // Body - gradient from green to darker green with rounded corners
        const ratio = i / segments.length;
        const g = Math.floor(255 - ratio * 100);
        this.ctx.fillStyle = `rgb(0, ${g}, 68)`;
        this._roundRect(x + 0.5, y + 0.5, size, size, cs * 0.15);
      }
    });
  }

  _getHeadDirection(segments) {
    if (segments.length < 2) return 'right';
    const head = segments[0];
    const neck = segments[1];
    const dx = head.x - neck.x;
    const dy = head.y - neck.y;
    if (dx > 0) return 'right';
    if (dx < 0) return 'left';
    if (dy > 0) return 'down';
    return 'up';
  }

  _roundRect(x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    this.ctx.beginPath();
    this.ctx.moveTo(x + r, y);
    this.ctx.arcTo(x + w, y, x + w, y + h, r);
    this.ctx.arcTo(x + w, y + h, x, y + h, r);
    this.ctx.arcTo(x, y + h, x, y, r);
    this.ctx.arcTo(x, y, x + w, y, r);
    this.ctx.closePath();
    this.ctx.fill();
  }

  drawFood(position, timestamp) {
    const cs = this.cellSize;
    const x = position.x * cs + cs / 2;
    const y = position.y * cs + cs / 2;
    const baseRadius = (cs - 2) / 2;

    // Pulsing glow effect
    const pulse = Math.sin((timestamp || 0) / 300) * 0.2 + 0.8;
    const glowRadius = baseRadius + 3 * pulse;

    // Outer glow
    this.ctx.fillStyle = `rgba(255, 71, 87, ${0.2 * pulse})`;
    this.ctx.beginPath();
    this.ctx.arc(x, y, glowRadius + 3, 0, Math.PI * 2);
    this.ctx.fill();

    // Main food circle
    this.ctx.fillStyle = '#ff4757';
    this.ctx.beginPath();
    this.ctx.arc(x, y, baseRadius * pulse, 0, Math.PI * 2);
    this.ctx.fill();

    // Shine highlight
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    this.ctx.beginPath();
    this.ctx.arc(x - baseRadius * 0.25, y - baseRadius * 0.25, baseRadius * 0.3, 0, Math.PI * 2);
    this.ctx.fill();
  }

  drawStartScreen(highScore, selectedDifficulty) {
    this.clear();
    this.drawGrid();

    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;

    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.fillStyle = '#00ff88';
    this.ctx.font = 'bold 36px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('SNAKE GAME', cx, cy - 70);

    // Difficulty selection
    const difficulties = ['Easy', 'Medium', 'Hard'];
    const colors = { easy: '#4ecdc4', medium: '#ffd700', hard: '#ff4757' };
    const sel = selectedDifficulty || 'medium';

    this.ctx.font = '14px monospace';
    this.ctx.fillStyle = '#aaa';
    this.ctx.fillText('Select Difficulty (1/2/3):', cx, cy - 30);

    const spacing = 90;
    const startX = cx - spacing;
    difficulties.forEach((d, i) => {
      const key = d.toLowerCase();
      const bx = startX + i * spacing;
      const by = cy - 10;

      if (key === sel) {
        this.ctx.fillStyle = colors[key];
        this.ctx.font = 'bold 16px monospace';
        this.ctx.fillText(`[${d}]`, bx, by);
      } else {
        this.ctx.fillStyle = '#666';
        this.ctx.font = '14px monospace';
        this.ctx.fillText(d, bx, by);
      }
    });

    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '16px monospace';
    this.ctx.fillText('Arrow Keys / WASD to move', cx, cy + 25);
    this.ctx.fillText('Press Enter to Start', cx, cy + 50);

    this.ctx.fillStyle = '#888';
    this.ctx.font = '12px monospace';
    this.ctx.fillText('Space / P to Pause', cx, cy + 75);

    if (highScore > 0) {
      this.ctx.fillStyle = '#ffd700';
      this.ctx.font = '14px monospace';
      this.ctx.fillText(`High Score: ${highScore}`, cx, cy + 105);
    }
  }

  drawPauseScreen() {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;

    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 32px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('PAUSED', cx, cy - 10);

    this.ctx.fillStyle = '#cccccc';
    this.ctx.font = '14px monospace';
    this.ctx.fillText('Press Space to Resume', cx, cy + 30);
  }

  drawGameOver(score, highScore) {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;

    this.ctx.fillStyle = '#ff4757';
    this.ctx.font = 'bold 32px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('GAME OVER', cx, cy - 30);

    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '20px monospace';
    this.ctx.fillText(`Score: ${score}`, cx, cy + 10);

    this.ctx.fillStyle = '#ffd700';
    this.ctx.font = '16px monospace';
    this.ctx.fillText(`High Score: ${highScore}`, cx, cy + 40);

    this.ctx.fillStyle = '#cccccc';
    this.ctx.font = '14px monospace';
    this.ctx.fillText('Press Enter to Restart', cx, cy + 75);
  }
}
