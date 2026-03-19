// 2048 Game Logic - M2: animations, touch, undo, best score, dark theme
(function () {
  'use strict';

  var SIZE = 4;
  var grid = [];
  var score = 0;
  var bestScore = 0;
  var won = false;
  var wonAcknowledged = false;
  var gameOver = false;
  var previousState = null;
  var canUndo = false;
  var animating = false;
  var pendingMove = null;

  // DOM refs
  var tileContainer = document.getElementById('tile-container');
  var scoreDisplay = document.getElementById('score');
  var bestScoreDisplay = document.getElementById('best-score');
  var newGameBtn = document.getElementById('new-game-btn');
  var undoBtn = document.getElementById('undo-btn');
  var overlay = document.getElementById('overlay');
  var overlayTitle = document.getElementById('overlay-title');
  var overlayScore = document.getElementById('overlay-score');
  var overlayBtn = document.getElementById('overlay-btn');

  // --- Helpers ---
  function emptyGrid() {
    var g = [];
    for (var r = 0; r < SIZE; r++) {
      g[r] = [];
      for (var c = 0; c < SIZE; c++) g[r][c] = 0;
    }
    return g;
  }

  function copyGrid(g) {
    return g.map(function (row) { return row.slice(); });
  }

  function emptyCells() {
    var cells = [];
    for (var r = 0; r < SIZE; r++)
      for (var c = 0; c < SIZE; c++)
        if (grid[r][c] === 0) cells.push({ r: r, c: c });
    return cells;
  }

  function addRandomTile(isNew) {
    var cells = emptyCells();
    if (cells.length === 0) return null;
    var cell = cells[Math.floor(Math.random() * cells.length)];
    var val = Math.random() < 0.9 ? 2 : 4;
    grid[cell.r][cell.c] = val;
    return { r: cell.r, c: cell.c, val: val, isNew: isNew !== false };
  }

  // --- Tile positioning ---
  function getCellGap() {
    return parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--cell-gap'));
  }

  function getCellSize() {
    // Calculate from the actual tile container width
    var containerWidth = tileContainer.offsetWidth;
    var gap = getCellGap();
    return (containerWidth - gap * 3) / 4;
  }

  function tilePos(row, col) {
    var cellSize = getCellSize();
    var gap = getCellGap();
    return {
      left: col * (cellSize + gap),
      top: row * (cellSize + gap)
    };
  }

  // --- Rendering ---
  function createTileEl(row, col, val, cssClass) {
    var el = document.createElement('div');
    el.className = 'tile tile-' + val + (cssClass ? ' ' + cssClass : '');
    el.textContent = val;
    var pos = tilePos(row, col);
    el.style.left = pos.left + 'px';
    el.style.top = pos.top + 'px';
    el.style.width = getCellSize() + 'px';
    el.style.height = getCellSize() + 'px';
    tileContainer.appendChild(el);
    return el;
  }

  function renderFull() {
    tileContainer.innerHTML = '';
    for (var r = 0; r < SIZE; r++) {
      for (var c = 0; c < SIZE; c++) {
        if (grid[r][c] !== 0) {
          createTileEl(r, c, grid[r][c]);
        }
      }
    }
    updateScores();
    updateUndoBtn();
  }

  function updateScores() {
    scoreDisplay.textContent = score;
    if (score > bestScore) {
      bestScore = score;
      saveBestScore();
    }
    bestScoreDisplay.textContent = bestScore;
  }

  function updateUndoBtn() {
    undoBtn.disabled = !canUndo;
  }

  // --- localStorage ---
  function loadBestScore() {
    try {
      var saved = localStorage.getItem('2048-best');
      bestScore = saved ? parseInt(saved, 10) || 0 : 0;
    } catch (e) {
      bestScore = 0;
    }
  }

  function saveBestScore() {
    try {
      localStorage.setItem('2048-best', bestScore);
    } catch (e) { /* ignore */ }
  }

  // --- Core move logic ---
  function slideRow(row) {
    var arr = row.filter(function (v) { return v !== 0; });
    var merged = [];
    var mergedFlags = [];
    var moveScore = 0;
    for (var i = 0; i < arr.length; i++) {
      if (i + 1 < arr.length && arr[i] === arr[i + 1]) {
        var nv = arr[i] * 2;
        merged.push(nv);
        mergedFlags.push(true);
        moveScore += nv;
        i++;
      } else {
        merged.push(arr[i]);
        mergedFlags.push(false);
      }
    }
    while (merged.length < SIZE) {
      merged.push(0);
      mergedFlags.push(false);
    }
    return { result: merged, mergedFlags: mergedFlags, score: moveScore };
  }

  function rotateGrid(g) {
    var ng = emptyGrid();
    for (var r = 0; r < SIZE; r++)
      for (var c = 0; c < SIZE; c++)
        ng[c][SIZE - 1 - r] = g[r][c];
    return ng;
  }

  function gridsEqual(a, b) {
    for (var r = 0; r < SIZE; r++)
      for (var c = 0; c < SIZE; c++)
        if (a[r][c] !== b[r][c]) return false;
    return true;
  }

  // Transform (r, c) after n clockwise rotations
  function rotatePos(r, c, n) {
    for (var i = 0; i < n; i++) {
      var tmp = r;
      r = c;
      c = SIZE - 1 - tmp;
    }
    return { r: r, c: c };
  }

  // Inverse rotation: given position in rotated space, get original position
  function unrotatePos(r, c, n) {
    return rotatePos(r, c, (4 - n) % 4);
  }

  function move(direction) {
    if (gameOver) return false;

    var rotations = { left: 0, up: 3, right: 2, down: 1 };
    var n = rotations[direction];

    // Build rotated grid
    var g = emptyGrid();
    for (var r = 0; r < SIZE; r++)
      for (var c = 0; c < SIZE; c++) {
        var rp = rotatePos(r, c, n);
        g[rp.r][rp.c] = grid[r][c];
      }

    // Slide each row left
    var moveScore = 0;
    var newG = [];
    var mergedCells = []; // positions in original space that had merges
    var moveMap = []; // track where each tile moved from -> to in original space

    for (var row = 0; row < SIZE; row++) {
      var res = slideRow(g[row]);
      newG.push(res.result);
      moveScore += res.score;

      // Track merges in original coords
      for (var col = 0; col < SIZE; col++) {
        if (res.mergedFlags[col]) {
          var origPos = unrotatePos(row, col, n);
          mergedCells.push(origPos);
        }
      }
    }

    // Un-rotate the result
    var finalGrid = emptyGrid();
    for (var r2 = 0; r2 < SIZE; r2++)
      for (var c2 = 0; c2 < SIZE; c2++) {
        var op = unrotatePos(r2, c2, n);
        finalGrid[op.r][op.c] = newG[r2][c2];
      }

    if (gridsEqual(grid, finalGrid)) return false;

    // Save state for undo
    previousState = { grid: copyGrid(grid), score: score, won: won, wonAcknowledged: wonAcknowledged, gameOver: false };
    canUndo = true;

    // Apply
    grid = finalGrid;
    score += moveScore;

    // Animate: first move existing tiles, then add new tile
    animateMove(mergedCells, function () {
      var newTile = addRandomTile(true);
      renderFull();

      // Re-add new tile animation
      if (newTile) {
        var tiles = tileContainer.children;
        for (var i = 0; i < tiles.length; i++) {
          var t = tiles[i];
          var pos = tilePos(newTile.r, newTile.c);
          if (Math.abs(parseFloat(t.style.left) - pos.left) < 1 &&
              Math.abs(parseFloat(t.style.top) - pos.top) < 1 &&
              t.textContent == newTile.val) {
            t.classList.add('tile-new');
            break;
          }
        }
      }

      // Add merge animations
      for (var m = 0; m < mergedCells.length; m++) {
        var mc = mergedCells[m];
        var mpos = tilePos(mc.r, mc.c);
        var tiles2 = tileContainer.children;
        for (var j = 0; j < tiles2.length; j++) {
          var t2 = tiles2[j];
          if (Math.abs(parseFloat(t2.style.left) - mpos.left) < 1 &&
              Math.abs(parseFloat(t2.style.top) - mpos.top) < 1 &&
              !t2.classList.contains('tile-new')) {
            t2.classList.add('tile-merged');
            break;
          }
        }
      }

      // Check win
      if (!wonAcknowledged) {
        for (var wr = 0; wr < SIZE; wr++)
          for (var wc = 0; wc < SIZE; wc++)
            if (grid[wr][wc] === 2048) {
              won = true;
              showOverlay('You Win!', true);
              return;
            }
      }

      // Check game over
      if (isGameOver()) {
        gameOver = true;
        showOverlay('Game Over', false);
      }

      animating = false;
      if (pendingMove) {
        var pm = pendingMove;
        pendingMove = null;
        move(pm);
      }
    });

    return true;
  }

  function animateMove(mergedCells, callback) {
    animating = true;
    // Just render the new state - tiles will transition via CSS
    renderFull();
    // Wait for transition to complete
    setTimeout(callback, 130);
  }

  function isGameOver() {
    for (var r = 0; r < SIZE; r++)
      for (var c = 0; c < SIZE; c++) {
        if (grid[r][c] === 0) return false;
        if (c + 1 < SIZE && grid[r][c] === grid[r][c + 1]) return false;
        if (r + 1 < SIZE && grid[r][c] === grid[r + 1][c]) return false;
      }
    return true;
  }

  // --- Undo ---
  function undo() {
    if (!canUndo || !previousState) return;
    grid = previousState.grid;
    score = previousState.score;
    won = previousState.won;
    wonAcknowledged = previousState.wonAcknowledged;
    gameOver = previousState.gameOver;
    canUndo = false;
    previousState = null;
    hideOverlay();
    renderFull();
  }

  // --- Overlay ---
  function showOverlay(title, isWin) {
    overlayTitle.textContent = title;
    overlayScore.textContent = 'Score: ' + score;
    overlayBtn.textContent = isWin ? 'Keep Going' : 'Try Again';
    overlay.classList.add('active');
  }

  function hideOverlay() {
    overlay.classList.remove('active');
  }

  // --- Init ---
  function newGame() {
    grid = emptyGrid();
    score = 0;
    won = false;
    wonAcknowledged = false;
    gameOver = false;
    previousState = null;
    canUndo = false;
    animating = false;
    pendingMove = null;
    hideOverlay();
    addRandomTile(false);
    addRandomTile(false);
    renderFull();
  }

  // --- Input handling ---
  function handleDirection(dir) {
    if (animating) {
      pendingMove = dir;
      return;
    }
    move(dir);
  }

  // Keyboard
  document.addEventListener('keydown', function (e) {
    var map = {
      ArrowLeft: 'left', ArrowRight: 'right',
      ArrowUp: 'up', ArrowDown: 'down'
    };
    var dir = map[e.key];
    if (dir) {
      e.preventDefault();
      handleDirection(dir);
    }
  });

  // Touch swipe
  var touchStartX = 0, touchStartY = 0;
  var MIN_SWIPE = 30;

  document.addEventListener('touchstart', function (e) {
    if (e.touches.length === 1) {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }
  }, { passive: true });

  document.addEventListener('touchend', function (e) {
    if (e.changedTouches.length === 0) return;
    var dx = e.changedTouches[0].clientX - touchStartX;
    var dy = e.changedTouches[0].clientY - touchStartY;
    var absDx = Math.abs(dx);
    var absDy = Math.abs(dy);

    if (Math.max(absDx, absDy) < MIN_SWIPE) return;

    if (absDx > absDy) {
      handleDirection(dx > 0 ? 'right' : 'left');
    } else {
      handleDirection(dy > 0 ? 'down' : 'up');
    }
  }, { passive: true });

  // Buttons
  newGameBtn.addEventListener('click', newGame);
  undoBtn.addEventListener('click', undo);

  overlayBtn.addEventListener('click', function () {
    if (won && !wonAcknowledged) {
      wonAcknowledged = true;
      hideOverlay();
    } else {
      newGame();
    }
  });

  // Handle resize
  window.addEventListener('resize', function () {
    renderFull();
  });

  // Start
  loadBestScore();
  newGame();
})();
