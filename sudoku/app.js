// Sudoku Game - Core Logic + M2 Enhanced Features

(function () {
  'use strict';

  // --- State ---
  let board = [];        // current board state (0 = empty)
  let solution = [];     // solved board
  let given = [];        // boolean[][] - true if cell is pre-filled
  let notes = [];        // Set[][] - pencil marks per cell
  let selectedRow = -1;
  let selectedCol = -1;
  let pencilMode = false;
  let undoStack = [];    // { row, col, prevValue, prevNotes, type }
  let timerSeconds = 0;
  let timerInterval = null;
  let gameOver = false;

  // --- Sudoku Generator ---

  function createEmptyGrid() {
    return Array.from({ length: 9 }, () => Array(9).fill(0));
  }

  function isValid(grid, row, col, num) {
    for (let i = 0; i < 9; i++) {
      if (grid[row][i] === num) return false;
      if (grid[i][col] === num) return false;
    }
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    for (let r = boxRow; r < boxRow + 3; r++) {
      for (let c = boxCol; c < boxCol + 3; c++) {
        if (grid[r][c] === num) return false;
      }
    }
    return true;
  }

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function fillGrid(grid) {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (grid[row][col] === 0) {
          const nums = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
          for (const num of nums) {
            if (isValid(grid, row, col, num)) {
              grid[row][col] = num;
              if (fillGrid(grid)) return true;
              grid[row][col] = 0;
            }
          }
          return false;
        }
      }
    }
    return true;
  }

  function countSolutions(grid, limit) {
    let count = 0;
    function solve() {
      if (count >= limit) return;
      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          if (grid[row][col] === 0) {
            for (let num = 1; num <= 9; num++) {
              if (isValid(grid, row, col, num)) {
                grid[row][col] = num;
                solve();
                grid[row][col] = 0;
                if (count >= limit) return;
              }
            }
            return;
          }
        }
      }
      count++;
    }
    solve();
    return count;
  }

  function generatePuzzle(difficulty) {
    const grid = createEmptyGrid();
    fillGrid(grid);
    const sol = grid.map(r => r.slice());

    let keepMin, keepMax;
    if (difficulty === 'easy') { keepMin = 36; keepMax = 45; }
    else if (difficulty === 'medium') { keepMin = 27; keepMax = 35; }
    else { keepMin = 17; keepMax = 26; }

    const target = keepMin + Math.floor(Math.random() * (keepMax - keepMin + 1));
    const positions = [];
    for (let r = 0; r < 9; r++)
      for (let c = 0; c < 9; c++)
        positions.push([r, c]);
    shuffle(positions);

    let removed = 0;
    const toRemove = 81 - target;
    for (const [r, c] of positions) {
      if (removed >= toRemove) break;
      const backup = grid[r][c];
      grid[r][c] = 0;
      if (countSolutions(grid.map(row => row.slice()), 2) === 1) {
        removed++;
      } else {
        grid[r][c] = backup;
      }
    }

    return { puzzle: grid, solution: sol };
  }

  // --- Board Rendering ---

  function createBoard() {
    const boardEl = document.getElementById('board');
    boardEl.innerHTML = '';
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.dataset.row = r;
        cell.dataset.col = c;

        if (c % 3 === 0 && c !== 0) cell.classList.add('box-left');
        if (r % 3 === 0 && r !== 0) cell.classList.add('box-top');

        cell.addEventListener('click', () => selectCell(r, c));
        boardEl.appendChild(cell);
      }
    }
  }

  function renderBoard() {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const cell = getCell(r, c);
        cell.classList.remove('given', 'user-input', 'selected', 'highlighted', 'same-number', 'error', 'check-wrong');

        if (board[r][c] !== 0) {
          cell.innerHTML = '';
          cell.textContent = board[r][c];
          if (given[r][c]) {
            cell.classList.add('given');
          } else {
            cell.classList.add('user-input');
          }
        } else {
          // Render pencil notes
          renderNotes(cell, r, c);
        }
      }
    }
    if (selectedRow >= 0 && selectedCol >= 0) {
      applyHighlights();
    }
  }

  function renderNotes(cell, r, c) {
    const noteSet = notes[r][c];
    if (noteSet.size === 0) {
      cell.innerHTML = '';
      cell.textContent = '';
      return;
    }
    let html = '<div class="notes-grid">';
    for (let n = 1; n <= 9; n++) {
      html += '<span class="note' + (noteSet.has(n) ? ' active' : '') + '">' +
        (noteSet.has(n) ? n : '') + '</span>';
    }
    html += '</div>';
    cell.innerHTML = html;
  }

  function getCell(r, c) {
    return document.querySelector('.cell[data-row="' + r + '"][data-col="' + c + '"]');
  }

  // --- Selection & Highlights ---

  function selectCell(row, col) {
    if (gameOver) return;
    selectedRow = row;
    selectedCol = col;
    renderBoard();
  }

  function clearSelection() {
    selectedRow = -1;
    selectedCol = -1;
    renderBoard();
  }

  function applyHighlights() {
    const r = selectedRow;
    const c = selectedCol;
    const selCell = getCell(r, c);
    if (selCell) selCell.classList.add('selected');

    const boxRow = Math.floor(r / 3) * 3;
    const boxCol = Math.floor(c / 3) * 3;
    for (let i = 0; i < 9; i++) {
      getCell(r, i).classList.add('highlighted');
      getCell(i, c).classList.add('highlighted');
    }
    for (let br = boxRow; br < boxRow + 3; br++) {
      for (let bc = boxCol; bc < boxCol + 3; bc++) {
        getCell(br, bc).classList.add('highlighted');
      }
    }

    const val = board[r][c];
    if (val !== 0) {
      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          if (board[row][col] === val) {
            getCell(row, col).classList.add('same-number');
          }
        }
      }
    }

    applyConflicts();
  }

  function applyConflicts() {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (board[r][c] === 0 || given[r][c]) continue;
        if (hasConflict(r, c)) {
          getCell(r, c).classList.add('error');
        }
      }
    }
  }

  function hasConflict(row, col) {
    const val = board[row][col];
    for (let c = 0; c < 9; c++) {
      if (c !== col && board[row][c] === val) return true;
    }
    for (let r = 0; r < 9; r++) {
      if (r !== row && board[r][col] === val) return true;
    }
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    for (let r = boxRow; r < boxRow + 3; r++) {
      for (let c = boxCol; c < boxCol + 3; c++) {
        if ((r !== row || c !== col) && board[r][c] === val) return true;
      }
    }
    return false;
  }

  // --- Input ---

  function placeNumber(row, col, num) {
    if (given[row][col] || gameOver) return;

    // Save undo state
    undoStack.push({
      row: row,
      col: col,
      prevValue: board[row][col],
      prevNotes: new Set(notes[row][col]),
      type: 'place'
    });

    board[row][col] = num;
    notes[row][col].clear();

    // Auto-remove this number from notes in same row/col/box
    clearRelatedNotes(row, col, num);

    renderBoard();
    checkWin();
  }

  function clearRelatedNotes(row, col, num) {
    for (let i = 0; i < 9; i++) {
      notes[row][i].delete(num);
      notes[i][col].delete(num);
    }
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    for (let r = boxRow; r < boxRow + 3; r++) {
      for (let c = boxCol; c < boxCol + 3; c++) {
        notes[r][c].delete(num);
      }
    }
  }

  function clearCell(row, col) {
    if (given[row][col] || gameOver) return;
    if (board[row][col] === 0 && notes[row][col].size === 0) return;

    undoStack.push({
      row: row,
      col: col,
      prevValue: board[row][col],
      prevNotes: new Set(notes[row][col]),
      type: 'clear'
    });

    board[row][col] = 0;
    notes[row][col].clear();
    renderBoard();
  }

  function toggleNote(row, col, num) {
    if (given[row][col] || gameOver) return;
    if (board[row][col] !== 0) return; // can't pencil on filled cell

    undoStack.push({
      row: row,
      col: col,
      prevValue: board[row][col],
      prevNotes: new Set(notes[row][col]),
      type: 'note'
    });

    if (notes[row][col].has(num)) {
      notes[row][col].delete(num);
    } else {
      notes[row][col].add(num);
    }
    renderBoard();
  }

  function handleKeyDown(e) {
    // Undo: Ctrl+Z / Cmd+Z
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
      e.preventDefault();
      undo();
      return;
    }

    // Arrow keys - navigate even without selection initially
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      e.preventDefault();
      handleArrowKey(e.key);
      return;
    }

    if (selectedRow < 0 || selectedCol < 0) return;

    if (e.key === 'Escape') {
      clearSelection();
      return;
    }

    if (given[selectedRow][selectedCol]) return;

    if (e.key >= '1' && e.key <= '9') {
      const num = parseInt(e.key);
      if (pencilMode) {
        toggleNote(selectedRow, selectedCol, num);
      } else {
        placeNumber(selectedRow, selectedCol, num);
      }
    } else if (e.key === 'Delete' || e.key === 'Backspace') {
      clearCell(selectedRow, selectedCol);
    }
  }

  // --- Arrow Key Navigation ---

  function handleArrowKey(key) {
    let r = selectedRow;
    let c = selectedCol;

    if (r < 0 || c < 0) {
      // No selection - start at 0,0
      selectCell(0, 0);
      return;
    }

    if (key === 'ArrowUp' && r > 0) r--;
    else if (key === 'ArrowDown' && r < 8) r++;
    else if (key === 'ArrowLeft' && c > 0) c--;
    else if (key === 'ArrowRight' && c < 8) c++;

    selectCell(r, c);
  }

  // --- Undo ---

  function undo() {
    if (undoStack.length === 0 || gameOver) return;
    const action = undoStack.pop();
    board[action.row][action.col] = action.prevValue;
    notes[action.row][action.col] = action.prevNotes;
    selectedRow = action.row;
    selectedCol = action.col;
    renderBoard();
  }

  // --- Pencil Mode ---

  function togglePencilMode() {
    pencilMode = !pencilMode;
    const btn = document.getElementById('pencil-btn');
    btn.classList.toggle('active', pencilMode);
  }

  // --- Timer ---

  function startTimer() {
    stopTimer();
    timerSeconds = 0;
    updateTimerDisplay();
    timerInterval = setInterval(function () {
      timerSeconds++;
      updateTimerDisplay();
    }, 1000);
  }

  function stopTimer() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }

  function updateTimerDisplay() {
    const mins = Math.floor(timerSeconds / 60);
    const secs = timerSeconds % 60;
    document.getElementById('timer').textContent =
      String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0');
  }

  // --- Check Solution ---

  function checkSolution() {
    if (gameOver) return;
    let hasErrors = false;

    // Clear previous check highlights
    document.querySelectorAll('.cell.check-wrong').forEach(function (c) {
      c.classList.remove('check-wrong');
    });

    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (!given[r][c] && board[r][c] !== 0 && board[r][c] !== solution[r][c]) {
          getCell(r, c).classList.add('check-wrong');
          hasErrors = true;
        }
      }
    }

    const feedback = document.getElementById('feedback');
    if (hasErrors) {
      feedback.textContent = 'Some cells are incorrect!';
      feedback.className = 'feedback error-feedback';
    } else {
      feedback.textContent = 'Looking good so far!';
      feedback.className = 'feedback success-feedback';
    }
    feedback.classList.add('show');
    setTimeout(function () {
      feedback.classList.remove('show');
    }, 2500);
  }

  // --- Auto-Solve ---

  function solvePuzzle() {
    if (gameOver) return;
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (!given[r][c]) {
          board[r][c] = solution[r][c];
          notes[r][c].clear();
        }
      }
    }
    gameOver = true;
    stopTimer();
    renderBoard();
    clearSelection();
  }

  // --- Number pad ---

  function setupNumberPad() {
    var pad = document.getElementById('number-pad');
    for (var n = 1; n <= 9; n++) {
      (function (num) {
        var btn = document.createElement('button');
        btn.className = 'num-btn';
        btn.textContent = num;
        btn.addEventListener('click', function () {
          if (selectedRow < 0 || selectedCol < 0) return;
          if (given[selectedRow][selectedCol] || gameOver) return;
          if (pencilMode) {
            toggleNote(selectedRow, selectedCol, num);
          } else {
            placeNumber(selectedRow, selectedCol, num);
          }
        });
        pad.appendChild(btn);
      })(n);
    }
  }

  // --- Win Check ---

  function checkWin() {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (board[r][c] === 0) return;
      }
    }
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (hasConflict(r, c)) return;
      }
    }
    gameOver = true;
    stopTimer();
    showWinModal();
  }

  function showWinModal() {
    var modal = document.getElementById('win-modal');
    document.getElementById('win-time').textContent =
      'Time: ' + document.getElementById('timer').textContent;
    modal.classList.add('show');
  }

  function hideWinModal() {
    document.getElementById('win-modal').classList.remove('show');
  }

  // --- New Game ---

  function showDifficultyModal() {
    document.getElementById('difficulty-modal').classList.add('show');
  }

  function hideDifficultyModal() {
    document.getElementById('difficulty-modal').classList.remove('show');
  }

  function startNewGame(difficulty) {
    hideDifficultyModal();
    hideWinModal();
    var result = generatePuzzle(difficulty);
    board = result.puzzle.map(function (r) { return r.slice(); });
    solution = result.solution;
    given = result.puzzle.map(function (r) { return r.map(function (v) { return v !== 0; }); });
    notes = Array.from({ length: 9 }, function () {
      return Array.from({ length: 9 }, function () { return new Set(); });
    });
    selectedRow = -1;
    selectedCol = -1;
    undoStack = [];
    pencilMode = false;
    gameOver = false;
    var pencilBtn = document.getElementById('pencil-btn');
    if (pencilBtn) pencilBtn.classList.remove('active');
    renderBoard();
    startTimer();
  }

  // --- Init ---

  function init() {
    createBoard();
    setupNumberPad();

    document.addEventListener('keydown', handleKeyDown);

    // Click outside board to deselect
    document.addEventListener('click', function (e) {
      if (!e.target.closest('#board') &&
          !e.target.closest('.num-btn') &&
          !e.target.closest('.action-btn') &&
          !e.target.closest('#pencil-btn')) {
        clearSelection();
      }
    });

    // New Game button
    document.getElementById('new-game-btn').addEventListener('click', showDifficultyModal);

    // Difficulty buttons
    document.querySelectorAll('.diff-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        startNewGame(this.dataset.difficulty);
      });
    });

    // Win modal
    document.getElementById('win-close-btn').addEventListener('click', hideWinModal);
    document.getElementById('win-newgame-btn').addEventListener('click', function () {
      hideWinModal();
      showDifficultyModal();
    });

    // Difficulty modal overlay close
    document.getElementById('difficulty-modal').addEventListener('click', function (e) {
      if (e.target === this) hideDifficultyModal();
    });

    // M2 buttons
    document.getElementById('pencil-btn').addEventListener('click', togglePencilMode);
    document.getElementById('check-btn').addEventListener('click', checkSolution);
    document.getElementById('solve-btn').addEventListener('click', solvePuzzle);
    document.getElementById('undo-btn').addEventListener('click', undo);

    // Start with easy game
    startNewGame('easy');
  }

  document.addEventListener('DOMContentLoaded', init);
})();
