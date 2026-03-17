(function () {
    'use strict';

    const DIFFICULTIES = {
        beginner:     { rows: 9,  cols: 9,  mines: 10 },
        intermediate: { rows: 16, cols: 16, mines: 40 },
        expert:       { rows: 16, cols: 30, mines: 99 },
    };

    let difficulty = 'beginner';
    let rows, cols, totalMines;
    let board;        // 2D array of cell data
    let gameOver;
    let gameWon;
    let revealedCount;
    let flagCount;
    let timerInterval;
    let seconds;
    let firstClick;

    const boardEl = document.getElementById('board');
    const faceBtn = document.getElementById('face-btn');
    const mineCounterEl = document.querySelector('.mine-counter');
    const timerEl = document.querySelector('.timer');
    const diffBtns = document.querySelectorAll('.diff-btn');

    // --- Initialisation ---

    function init() {
        const cfg = DIFFICULTIES[difficulty];
        rows = cfg.rows;
        cols = cfg.cols;
        totalMines = cfg.mines;

        gameOver = false;
        gameWon = false;
        revealedCount = 0;
        flagCount = 0;
        firstClick = true;

        clearInterval(timerInterval);
        seconds = 0;
        timerEl.textContent = '000';
        updateMineCounter();
        faceBtn.textContent = '\u{1F600}';

        buildBoard();
        render();
    }

    function buildBoard() {
        board = [];
        for (let r = 0; r < rows; r++) {
            board[r] = [];
            for (let c = 0; c < cols; c++) {
                board[r][c] = {
                    mine: false,
                    revealed: false,
                    flagged: false,
                    adjacentMines: 0,
                };
            }
        }
    }

    function placeMines(safeRow, safeCol) {
        let placed = 0;
        while (placed < totalMines) {
            const r = Math.floor(Math.random() * rows);
            const c = Math.floor(Math.random() * cols);
            if (board[r][c].mine) continue;
            if (Math.abs(r - safeRow) <= 1 && Math.abs(c - safeCol) <= 1) continue;
            board[r][c].mine = true;
            placed++;
        }
        calcNumbers();
    }

    function calcNumbers() {
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (board[r][c].mine) continue;
                let count = 0;
                forEachNeighbor(r, c, (nr, nc) => {
                    if (board[nr][nc].mine) count++;
                });
                board[r][c].adjacentMines = count;
            }
        }
    }

    function forEachNeighbor(r, c, fn) {
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;
                const nr = r + dr;
                const nc = c + dc;
                if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
                    fn(nr, nc);
                }
            }
        }
    }

    // --- Rendering ---

    function getCellSize() {
        if (window.innerWidth <= 480) return 30;
        if (window.innerWidth <= 768) return 32;
        return 28;
    }

    function render() {
        boardEl.innerHTML = '';
        const cellSize = getCellSize();
        boardEl.style.gridTemplateColumns = `repeat(${cols}, ${cellSize}px)`;
        boardEl.style.gridTemplateRows = `repeat(${rows}, ${cellSize}px)`;

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const cell = board[r][c];
                const el = document.createElement('div');
                el.className = 'cell';
                el.dataset.row = r;
                el.dataset.col = c;

                if (cell.revealed) {
                    el.classList.add('revealed');
                    if (cell.mine) {
                        el.textContent = '\u{1F4A3}';
                        if (cell.hit) {
                            el.classList.add('mine-hit');
                        } else {
                            el.classList.add('mine-revealed');
                        }
                    } else if (cell.adjacentMines > 0) {
                        const span = document.createElement('span');
                        span.className = `num-${cell.adjacentMines}`;
                        span.textContent = cell.adjacentMines;
                        el.appendChild(span);
                    }
                } else if (cell.flagged) {
                    el.classList.add('flagged');
                    el.textContent = '\u{1F6A9}';
                }

                el.addEventListener('click', () => handleLeftClick(r, c));
                el.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    handleRightClick(r, c);
                });

                // Mobile long-press to flag
                let longPressTimer = null;
                let longPressed = false;

                el.addEventListener('touchstart', (e) => {
                    longPressed = false;
                    longPressTimer = setTimeout(() => {
                        longPressed = true;
                        handleRightClick(r, c);
                    }, 400);
                }, { passive: true });

                el.addEventListener('touchend', (e) => {
                    if (longPressTimer) {
                        clearTimeout(longPressTimer);
                        longPressTimer = null;
                    }
                    if (longPressed) {
                        e.preventDefault();
                    }
                });

                el.addEventListener('touchmove', () => {
                    if (longPressTimer) {
                        clearTimeout(longPressTimer);
                        longPressTimer = null;
                    }
                }, { passive: true });

                boardEl.appendChild(el);
            }
        }
    }

    function updateMineCounter() {
        const remaining = totalMines - flagCount;
        const str = String(Math.abs(remaining)).padStart(3, '0');
        mineCounterEl.textContent = remaining < 0 ? '-' + str.slice(1) : str;
    }

    // --- Game Logic ---

    function handleLeftClick(r, c) {
        if (gameOver || gameWon) return;
        const cell = board[r][c];
        if (cell.revealed || cell.flagged) return;

        if (firstClick) {
            firstClick = false;
            placeMines(r, c);
            startTimer();
        }

        if (cell.mine) {
            cell.hit = true;
            revealAllMines();
            endGame(false);
            return;
        }

        reveal(r, c);
        checkWin();
        render();
    }

    function handleRightClick(r, c) {
        if (gameOver || gameWon) return;
        const cell = board[r][c];
        if (cell.revealed) return;

        cell.flagged = !cell.flagged;
        flagCount += cell.flagged ? 1 : -1;
        updateMineCounter();
        render();
    }

    function reveal(r, c) {
        const cell = board[r][c];
        if (cell.revealed || cell.flagged || cell.mine) return;

        cell.revealed = true;
        revealedCount++;

        if (cell.adjacentMines === 0) {
            forEachNeighbor(r, c, (nr, nc) => {
                reveal(nr, nc);
            });
        }
    }

    function revealAllMines() {
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (board[r][c].mine) {
                    board[r][c].revealed = true;
                }
            }
        }
    }

    function checkWin() {
        const totalSafe = rows * cols - totalMines;
        if (revealedCount === totalSafe) {
            endGame(true);
        }
    }

    function endGame(won) {
        if (won) {
            gameWon = true;
            faceBtn.textContent = '\u{1F60E}';
        } else {
            gameOver = true;
            faceBtn.textContent = '\u{1F635}';
        }
        clearInterval(timerInterval);
        render();
        showOverlay(won);
    }

    function showOverlay(won) {
        const existing = document.querySelector('.game-over-overlay');
        if (existing) existing.remove();

        const overlay = document.createElement('div');
        overlay.className = 'game-over-overlay';

        const msg = document.createElement('div');
        msg.className = 'game-over-msg';
        msg.innerHTML = won
            ? '<div>You Win! \u{1F389}</div>'
            : '<div>Game Over \u{1F4A5}</div>';

        const btn = document.createElement('button');
        btn.textContent = 'Play Again';
        btn.addEventListener('click', () => {
            overlay.remove();
            init();
        });
        msg.appendChild(btn);
        overlay.appendChild(msg);
        document.body.appendChild(overlay);
    }

    // --- Timer ---

    function startTimer() {
        clearInterval(timerInterval);
        seconds = 0;
        timerInterval = setInterval(() => {
            seconds++;
            if (seconds > 999) seconds = 999;
            timerEl.textContent = String(seconds).padStart(3, '0');
        }, 1000);
    }

    // --- Event Handlers ---

    diffBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
            diffBtns.forEach((b) => b.classList.remove('active'));
            btn.classList.add('active');
            difficulty = btn.dataset.difficulty;
            const existing = document.querySelector('.game-over-overlay');
            if (existing) existing.remove();
            init();
        });
    });

    faceBtn.addEventListener('click', () => {
        const existing = document.querySelector('.game-over-overlay');
        if (existing) existing.remove();
        init();
    });

    boardEl.addEventListener('contextmenu', (e) => e.preventDefault());

    // Re-render on resize for responsive cell sizing
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => render(), 150);
    });

    // --- Start ---
    init();
})();
