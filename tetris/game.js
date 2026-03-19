// ============================================================
// Tetris - M1 + M2 Implementation
// ============================================================

const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30;
const PREVIEW_BLOCK = 20;

// Tetromino definitions: each piece has 4 rotation states
const PIECES = {
  I: { color: '#00f0f0', shapes: [
    [[0,0],[1,0],[2,0],[3,0]],
    [[2,0],[2,1],[2,2],[2,3]],
    [[0,2],[1,2],[2,2],[3,2]],
    [[1,0],[1,1],[1,2],[1,3]]
  ]},
  O: { color: '#f0f000', shapes: [
    [[0,0],[1,0],[0,1],[1,1]],
    [[0,0],[1,0],[0,1],[1,1]],
    [[0,0],[1,0],[0,1],[1,1]],
    [[0,0],[1,0],[0,1],[1,1]]
  ]},
  T: { color: '#a000f0', shapes: [
    [[0,0],[1,0],[2,0],[1,1]],
    [[1,0],[1,1],[1,2],[0,1]],
    [[1,1],[0,2],[1,2],[2,2]],
    [[1,0],[1,1],[1,2],[2,1]]
  ]},
  S: { color: '#00f000', shapes: [
    [[1,0],[2,0],[0,1],[1,1]],
    [[0,0],[0,1],[1,1],[1,2]],
    [[1,1],[2,1],[0,2],[1,2]],
    [[1,0],[1,1],[2,1],[2,2]]
  ]},
  Z: { color: '#f00000', shapes: [
    [[0,0],[1,0],[1,1],[2,1]],
    [[2,0],[1,1],[2,1],[1,2]],
    [[0,1],[1,1],[1,2],[2,2]],
    [[1,0],[0,1],[1,1],[0,2]]
  ]},
  J: { color: '#0000f0', shapes: [
    [[0,0],[0,1],[1,1],[2,1]],
    [[1,0],[2,0],[1,1],[1,2]],
    [[0,1],[1,1],[2,1],[2,2]],
    [[1,0],[1,1],[0,2],[1,2]]
  ]},
  L: { color: '#f0a000', shapes: [
    [[2,0],[0,1],[1,1],[2,1]],
    [[1,0],[1,1],[1,2],[2,2]],
    [[0,1],[1,1],[2,1],[0,2]],
    [[0,0],[1,0],[1,1],[1,2]]
  ]}
};

const PIECE_NAMES = Object.keys(PIECES);

// Wall kick data (SRS)
const WALL_KICKS = [
  [[0,0],[-1,0],[-1,-1],[0,2],[-1,2]],
  [[0,0],[1,0],[1,1],[0,-2],[1,-2]],
  [[0,0],[1,0],[1,-1],[0,2],[1,2]],
  [[0,0],[-1,0],[-1,1],[0,-2],[-1,-2]]
];

const WALL_KICKS_I = [
  [[0,0],[-2,0],[1,0],[-2,1],[1,-2]],
  [[0,0],[-1,0],[2,0],[-1,-2],[2,1]],
  [[0,0],[2,0],[-1,0],[2,-1],[-1,2]],
  [[0,0],[1,0],[-2,0],[1,2],[-2,-1]]
];

// ============================================================
// Game State
// ============================================================

let canvas, ctx, holdCanvas, holdCtx, nextCanvas, nextCtx;
let board;
let currentPiece;
let nextPieceType;
let holdPieceType = null;
let holdUsed = false;
let bag = [];
let score, level, lines, highScore;
let dropInterval, dropTimer;
let gameRunning = false;
let gamePaused = false;
let animationId;
let clearingRows = [];
let clearAnimFrame = 0;
const CLEAR_ANIM_DURATION = 12;
let lastTime = 0;

// ============================================================
// Initialization
// ============================================================

function init() {
  canvas = document.getElementById('game-canvas');
  ctx = canvas.getContext('2d');
  canvas.width = COLS * BLOCK_SIZE;
  canvas.height = ROWS * BLOCK_SIZE;

  holdCanvas = document.getElementById('hold-canvas');
  holdCtx = holdCanvas.getContext('2d');

  nextCanvas = document.getElementById('next-canvas');
  nextCtx = nextCanvas.getContext('2d');

  highScore = parseInt(localStorage.getItem('tetris-highscore')) || 0;
  document.getElementById('highscore-value').textContent = highScore;

  document.getElementById('overlay-button').addEventListener('click', startGame);
  document.addEventListener('keydown', handleKey);
}

function startGame() {
  board = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
  score = 0;
  level = 1;
  lines = 0;
  bag = [];
  clearingRows = [];
  clearAnimFrame = 0;
  holdPieceType = null;
  holdUsed = false;
  gamePaused = false;
  updateScore();
  dropInterval = getDropInterval(level);
  dropTimer = 0;

  drawPreview(holdCtx, holdCanvas, null);
  nextPieceType = getNextFromBag();

  document.getElementById('overlay').classList.add('hidden');
  gameRunning = true;

  spawnPiece();
  lastTime = performance.now();
  if (animationId) cancelAnimationFrame(animationId);
  animationId = requestAnimationFrame(gameLoop);
}

// ============================================================
// Bag Randomizer (7-bag)
// ============================================================

function getNextFromBag() {
  if (bag.length === 0) {
    bag = [...PIECE_NAMES];
    for (let i = bag.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [bag[i], bag[j]] = [bag[j], bag[i]];
    }
  }
  return bag.pop();
}

// ============================================================
// Piece Spawning & Movement
// ============================================================

function spawnPiece() {
  const type = nextPieceType;
  nextPieceType = getNextFromBag();
  drawPreview(nextCtx, nextCanvas, nextPieceType);

  currentPiece = { type, rotation: 0, x: 3, y: 0 };
  if (type === 'I') {
    currentPiece.x = 3;
    currentPiece.y = -1;
  }

  holdUsed = false;

  if (!isValidPosition(currentPiece)) {
    gameOver();
  }
}

function getBlocks(piece) {
  return PIECES[piece.type].shapes[piece.rotation];
}

function isValidPosition(piece) {
  const blocks = getBlocks(piece);
  for (const [bx, by] of blocks) {
    const nx = piece.x + bx;
    const ny = piece.y + by;
    if (nx < 0 || nx >= COLS || ny >= ROWS) return false;
    if (ny >= 0 && board[ny][nx] !== null) return false;
  }
  return true;
}

function movePiece(dx, dy) {
  const test = { ...currentPiece, x: currentPiece.x + dx, y: currentPiece.y + dy };
  if (isValidPosition(test)) {
    currentPiece.x = test.x;
    currentPiece.y = test.y;
    return true;
  }
  return false;
}

function rotatePiece() {
  const oldRotation = currentPiece.rotation;
  const newRotation = (oldRotation + 1) % 4;
  const test = { ...currentPiece, rotation: newRotation };
  const kicks = currentPiece.type === 'I' ? WALL_KICKS_I[oldRotation] : WALL_KICKS[oldRotation];

  for (const [kx, ky] of kicks) {
    test.x = currentPiece.x + kx;
    test.y = currentPiece.y - ky;
    if (isValidPosition(test)) {
      currentPiece.rotation = newRotation;
      currentPiece.x = test.x;
      currentPiece.y = test.y;
      return;
    }
  }
}

function hardDrop() {
  let dropped = 0;
  while (movePiece(0, 1)) {
    dropped++;
  }
  lockPiece();
}

function getGhostY() {
  let ghostY = currentPiece.y;
  const test = { ...currentPiece };
  while (true) {
    test.y = ghostY + 1;
    if (isValidPosition(test)) {
      ghostY++;
    } else {
      break;
    }
  }
  return ghostY;
}

// ============================================================
// Hold Piece
// ============================================================

function holdPiece() {
  if (holdUsed) return;
  holdUsed = true;

  const currentType = currentPiece.type;
  if (holdPieceType === null) {
    holdPieceType = currentType;
    drawPreview(holdCtx, holdCanvas, holdPieceType);
    spawnPiece();
  } else {
    const swapType = holdPieceType;
    holdPieceType = currentType;
    drawPreview(holdCtx, holdCanvas, holdPieceType);

    currentPiece = { type: swapType, rotation: 0, x: 3, y: 0 };
    if (swapType === 'I') {
      currentPiece.x = 3;
      currentPiece.y = -1;
    }

    if (!isValidPosition(currentPiece)) {
      gameOver();
    }
  }
}

// ============================================================
// Lock & Line Clearing
// ============================================================

function lockPiece() {
  const blocks = getBlocks(currentPiece);
  const color = PIECES[currentPiece.type].color;
  for (const [bx, by] of blocks) {
    const nx = currentPiece.x + bx;
    const ny = currentPiece.y + by;
    if (ny >= 0 && ny < ROWS && nx >= 0 && nx < COLS) {
      board[ny][nx] = color;
    }
  }
  checkLines();
}

function checkLines() {
  clearingRows = [];
  for (let r = ROWS - 1; r >= 0; r--) {
    if (board[r].every(cell => cell !== null)) {
      clearingRows.push(r);
    }
  }

  if (clearingRows.length > 0) {
    clearAnimFrame = CLEAR_ANIM_DURATION;
  } else {
    spawnPiece();
  }
}

function finishClearLines() {
  const count = clearingRows.length;

  clearingRows.sort((a, b) => a - b);
  for (let i = clearingRows.length - 1; i >= 0; i--) {
    board.splice(clearingRows[i], 1);
  }
  for (let i = 0; i < count; i++) {
    board.unshift(Array(COLS).fill(null));
  }

  const scoreTable = [0, 100, 300, 500, 800];
  score += (scoreTable[count] || 0) * level;
  lines += count;
  level = Math.floor(lines / 10) + 1;
  dropInterval = getDropInterval(level);
  updateScore();

  clearingRows = [];
  clearAnimFrame = 0;
  spawnPiece();
}

// ============================================================
// Game Over
// ============================================================

function gameOver() {
  gameRunning = false;
  if (animationId) cancelAnimationFrame(animationId);

  if (score > highScore) {
    highScore = score;
    localStorage.setItem('tetris-highscore', highScore);
    document.getElementById('highscore-value').textContent = highScore;
  }

  const overlay = document.getElementById('overlay');
  document.getElementById('overlay-title').textContent = 'GAME OVER';
  document.getElementById('overlay-message').textContent =
    `Score: ${score}\nHigh Score: ${highScore}`;
  document.getElementById('overlay-button').textContent = 'RESTART';
  overlay.classList.remove('hidden');
}

// ============================================================
// Pause
// ============================================================

function togglePause() {
  if (!gameRunning) return;

  gamePaused = !gamePaused;
  const overlay = document.getElementById('overlay');

  if (gamePaused) {
    if (animationId) cancelAnimationFrame(animationId);
    document.getElementById('overlay-title').textContent = 'PAUSED';
    document.getElementById('overlay-message').textContent = 'Press P to resume';
    document.getElementById('overlay-button').textContent = 'RESUME';
    overlay.classList.remove('hidden');
  } else {
    overlay.classList.add('hidden');
    lastTime = performance.now();
    animationId = requestAnimationFrame(gameLoop);
  }
}

// ============================================================
// Timing & Speed
// ============================================================

function getDropInterval(lvl) {
  return Math.max(50, 1000 - (lvl - 1) * 80);
}

// ============================================================
// Input
// ============================================================

function handleKey(e) {
  // Pause toggle works even when paused
  if (e.key === 'p' || e.key === 'P') {
    if (gameRunning) {
      togglePause();
      e.preventDefault();
    }
    return;
  }

  // Resume game if overlay button click via keyboard
  if (gamePaused && e.key === 'Enter') {
    togglePause();
    e.preventDefault();
    return;
  }

  if (!gameRunning || gamePaused) return;
  if (clearingRows.length > 0) return;

  switch (e.key) {
    case 'ArrowLeft':
      movePiece(-1, 0);
      e.preventDefault();
      break;
    case 'ArrowRight':
      movePiece(1, 0);
      e.preventDefault();
      break;
    case 'ArrowDown':
      if (movePiece(0, 1)) {
        dropTimer = 0;
      }
      e.preventDefault();
      break;
    case 'ArrowUp':
      rotatePiece();
      e.preventDefault();
      break;
    case ' ':
      hardDrop();
      e.preventDefault();
      break;
    case 'c':
    case 'C':
      holdPiece();
      e.preventDefault();
      break;
  }
}

// ============================================================
// Rendering
// ============================================================

function drawBlock(context, x, y, color, size) {
  size = size || BLOCK_SIZE;
  context.fillStyle = color;
  context.fillRect(x * size + 1, y * size + 1, size - 2, size - 2);

  // Highlight
  context.fillStyle = 'rgba(255,255,255,0.15)';
  context.fillRect(x * size + 1, y * size + 1, size - 2, 4);
  context.fillRect(x * size + 1, y * size + 1, 4, size - 2);
}

function drawGhostBlock(x, y) {
  ctx.strokeStyle = PIECES[currentPiece.type].color;
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.3;
  ctx.strokeRect(x * BLOCK_SIZE + 2, y * BLOCK_SIZE + 2, BLOCK_SIZE - 4, BLOCK_SIZE - 4);
  ctx.fillStyle = PIECES[currentPiece.type].color;
  ctx.fillRect(x * BLOCK_SIZE + 2, y * BLOCK_SIZE + 2, BLOCK_SIZE - 4, BLOCK_SIZE - 4);
  ctx.globalAlpha = 1.0;
  ctx.lineWidth = 1;
}

function drawBoard() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw grid
  ctx.strokeStyle = '#1a1a3e';
  ctx.lineWidth = 0.5;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      ctx.strokeRect(c * BLOCK_SIZE, r * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    }
  }

  // Draw locked blocks
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (board[r][c]) {
        if (clearingRows.includes(r)) {
          const flash = Math.floor(clearAnimFrame / 3) % 2 === 0;
          drawBlock(ctx, c, r, flash ? '#ffffff' : board[r][c]);
        } else {
          drawBlock(ctx, c, r, board[r][c]);
        }
      }
    }
  }

  // Draw ghost piece and current piece
  if (currentPiece && clearingRows.length === 0) {
    const blocks = getBlocks(currentPiece);
    const color = PIECES[currentPiece.type].color;

    // Ghost piece
    const ghostY = getGhostY();
    if (ghostY !== currentPiece.y) {
      for (const [bx, by] of blocks) {
        const nx = currentPiece.x + bx;
        const ny = ghostY + by;
        if (ny >= 0) {
          drawGhostBlock(nx, ny);
        }
      }
    }

    // Current piece
    for (const [bx, by] of blocks) {
      const nx = currentPiece.x + bx;
      const ny = currentPiece.y + by;
      if (ny >= 0) {
        drawBlock(ctx, nx, ny, color);
      }
    }
  }
}

function drawPreview(previewCtx, previewCanvas, pieceType) {
  previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
  if (!pieceType) return;

  const blocks = PIECES[pieceType].shapes[0];
  const color = PIECES[pieceType].color;

  // Calculate bounding box for centering
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const [bx, by] of blocks) {
    minX = Math.min(minX, bx);
    maxX = Math.max(maxX, bx);
    minY = Math.min(minY, by);
    maxY = Math.max(maxY, by);
  }
  const pw = maxX - minX + 1;
  const ph = maxY - minY + 1;
  const offsetX = (previewCanvas.width / PREVIEW_BLOCK - pw) / 2 - minX;
  const offsetY = (previewCanvas.height / PREVIEW_BLOCK - ph) / 2 - minY;

  for (const [bx, by] of blocks) {
    drawBlock(previewCtx, bx + offsetX, by + offsetY, color, PREVIEW_BLOCK);
  }
}

function updateScore() {
  document.getElementById('score-value').textContent = score;
  document.getElementById('level-value').textContent = level;
  document.getElementById('lines-value').textContent = lines;
  document.getElementById('highscore-value').textContent = highScore;
}

// ============================================================
// Game Loop
// ============================================================

function gameLoop(timestamp) {
  if (!gameRunning || gamePaused) return;

  const dt = timestamp - lastTime;
  lastTime = timestamp;

  if (clearingRows.length > 0) {
    clearAnimFrame--;
    if (clearAnimFrame <= 0) {
      finishClearLines();
    }
    drawBoard();
    animationId = requestAnimationFrame(gameLoop);
    return;
  }

  dropTimer += dt;
  if (dropTimer >= dropInterval) {
    dropTimer = 0;
    if (!movePiece(0, 1)) {
      lockPiece();
    }
  }

  drawBoard();
  animationId = requestAnimationFrame(gameLoop);
}

// ============================================================
// Start
// ============================================================

window.addEventListener('load', init);
