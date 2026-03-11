/* ===========================================
   Memory Card Game - Game Logic (Milestone 2)
   =========================================== */

(function () {
  'use strict';

  // =============================================
  // Constants & Configuration
  // =============================================

  const FLIP_BACK_DELAY = 1000; // 1 second delay for mismatched cards

  // Difficulty configurations
  const DIFFICULTIES = {
    easy:   { cols: 4, rows: 3, pairs: 6,  label: 'Easy' },
    medium: { cols: 4, rows: 4, pairs: 8,  label: 'Medium' },
    hard:   { cols: 6, rows: 6, pairs: 18, label: 'Hard' }
  };

  // Card themes - each must have at least 18 symbols (for Hard mode)
  const THEMES = {
    emoji: {
      label: 'Emoji',
      symbols: ['🎮', '🎲', '🎯', '🎨', '🎭', '🎪', '🎢', '🎡',
                '🎸', '🎺', '🎻', '🎹', '🏆', '🎖', '🎗', '🎀',
                '🎁', '🎈'],
      isNumber: false
    },
    animals: {
      label: 'Animals',
      symbols: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼',
                '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔',
                '🐧', '🐦'],
      isNumber: false
    },
    numbers: {
      label: 'Numbers',
      symbols: ['1', '2', '3', '4', '5', '6', '7', '8',
                '9', '10', '11', '12', '13', '14', '15', '16',
                '17', '18'],
      isNumber: true
    }
  };

  // localStorage key for best scores
  const STORAGE_KEY = 'memory-game-best-scores';

  // =============================================
  // DOM Elements
  // =============================================

  const cardGrid = document.getElementById('card-grid');
  const movesDisplay = document.getElementById('moves');
  const timerDisplay = document.getElementById('timer');
  const restartBtn = document.getElementById('restart-btn');
  const victoryModal = document.getElementById('victory-modal');
  const finalMovesDisplay = document.getElementById('final-moves');
  const finalTimeDisplay = document.getElementById('final-time');
  const bestScoreSection = document.getElementById('best-score-section');
  const bestMovesDisplay = document.getElementById('best-moves');
  const bestTimeDisplay = document.getElementById('best-time');
  const newBestBadge = document.getElementById('new-best-badge');
  const playAgainBtn = document.getElementById('play-again-btn');
  const difficultySelector = document.getElementById('difficulty-selector');
  const themeSelector = document.getElementById('theme-selector');

  // =============================================
  // Game State
  // =============================================

  let cards = [];              // Array of card data objects
  let flippedCards = [];       // Currently flipped cards (max 2)
  let matchedPairs = 0;        // Number of matched pairs
  let moves = 0;               // Move counter
  let isLocked = false;        // Lock board during match-checking
  let gameGeneration = 0;      // Tracks game resets to invalidate stale timeouts

  let currentDifficulty = 'medium';  // Current difficulty key
  let currentTheme = 'emoji';        // Current theme key

  // Timer state
  let timerInterval = null;    // setInterval reference
  let elapsedSeconds = 0;      // Seconds elapsed
  let timerStarted = false;    // Whether timer has been started this game

  // =============================================
  // Utility Functions
  // =============================================

  /** Fisher-Yates shuffle */
  function shuffle(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /** Format seconds as MM:SS */
  function formatTime(totalSeconds) {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0');
  }

  // =============================================
  // Timer
  // =============================================

  function startTimer() {
    if (timerStarted) return;
    timerStarted = true;
    timerInterval = setInterval(() => {
      elapsedSeconds++;
      timerDisplay.textContent = formatTime(elapsedSeconds);
    }, 1000);
  }

  function stopTimer() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }

  function resetTimer() {
    stopTimer();
    elapsedSeconds = 0;
    timerStarted = false;
    timerDisplay.textContent = '00:00';
  }

  // =============================================
  // Best Scores (localStorage)
  // =============================================

  /** Load all best scores from localStorage */
  function loadBestScores() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  /** Save best scores to localStorage */
  function saveBestScores(scores) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
    } catch (e) {
      // Silently fail if localStorage is unavailable
    }
  }

  /**
   * Check if current result is a new best for the current difficulty.
   * Returns { isNewBest, bestRecord }
   * Best is determined by fewer moves first, then shorter time.
   */
  function checkAndUpdateBest(currentMoves, currentTime) {
    const scores = loadBestScores();
    const key = currentDifficulty;
    const existing = scores[key];
    let isNewBest = false;

    if (!existing) {
      // No previous record - this is the first and best
      isNewBest = true;
    } else if (currentMoves < existing.moves) {
      // Fewer moves - new best
      isNewBest = true;
    } else if (currentMoves === existing.moves && currentTime < existing.time) {
      // Same moves but faster - new best
      isNewBest = true;
    }

    if (isNewBest) {
      scores[key] = { moves: currentMoves, time: currentTime };
      saveBestScores(scores);
    }

    return {
      isNewBest,
      bestRecord: scores[key] // Always the current best after potential update
    };
  }

  /** Get best record for current difficulty (or null) */
  function getBestRecord() {
    const scores = loadBestScores();
    return scores[currentDifficulty] || null;
  }

  // =============================================
  // Card Data & Rendering
  // =============================================

  /** Create card data based on current difficulty and theme */
  function createCardData() {
    const difficulty = DIFFICULTIES[currentDifficulty];
    const theme = THEMES[currentTheme];
    const pairCount = difficulty.pairs;

    // Take the first N symbols from the theme
    const selectedSymbols = theme.symbols.slice(0, pairCount);

    // Create pairs: each symbol appears twice
    const pairs = [...selectedSymbols, ...selectedSymbols];
    const shuffled = shuffle(pairs);

    return shuffled.map((symbol, index) => ({
      id: index,
      symbol: symbol,
      isFlipped: false,
      isMatched: false
    }));
  }

  /** Render card grid based on current difficulty */
  function renderCards() {
    const difficulty = DIFFICULTIES[currentDifficulty];
    const theme = THEMES[currentTheme];

    // Update grid columns
    cardGrid.style.gridTemplateColumns = 'repeat(' + difficulty.cols + ', 1fr)';

    // Toggle grid-hard class for responsive sizing
    cardGrid.classList.toggle('grid-hard', currentDifficulty === 'hard');

    cardGrid.innerHTML = '';
    cards.forEach((card) => {
      const cardEl = document.createElement('div');
      cardEl.classList.add('card');
      cardEl.dataset.id = card.id;

      // Add number-theme class for number styling
      const numberClass = theme.isNumber ? ' number-theme' : '';

      cardEl.innerHTML =
        '<div class="card-inner">' +
          '<div class="card-back"></div>' +
          '<div class="card-front' + numberClass + '">' + card.symbol + '</div>' +
        '</div>';

      // Attach click handler
      cardEl.addEventListener('click', function () {
        handleCardClick(card, cardEl);
      });
      cardGrid.appendChild(cardEl);
    });
  }

  // =============================================
  // Game Logic
  // =============================================

  /** Handle card click */
  function handleCardClick(card, cardEl) {
    // Ignore clicks when board is locked, card is already flipped/matched, or 2 cards are open
    if (isLocked || card.isFlipped || card.isMatched || flippedCards.length >= 2) {
      return;
    }

    // Start timer on first flip of the game
    if (!timerStarted) {
      startTimer();
    }

    // Flip the card
    card.isFlipped = true;
    cardEl.classList.add('flipped');
    flippedCards.push({ card: card, cardEl: cardEl });

    // If 2 cards are flipped, check for a match
    if (flippedCards.length === 2) {
      moves++;
      movesDisplay.textContent = moves;
      checkMatch();
    }
  }

  /** Check if flipped cards match */
  function checkMatch() {
    var first = flippedCards[0];
    var second = flippedCards[1];

    if (first.card.symbol === second.card.symbol) {
      handleMatch(first, second);
    } else {
      handleMismatch(first, second);
    }
  }

  /** Handle matched pair */
  function handleMatch(first, second) {
    first.card.isMatched = true;
    second.card.isMatched = true;
    first.cardEl.classList.add('matched');
    second.cardEl.classList.add('matched');
    flippedCards = [];
    matchedPairs++;

    // Check if game is complete
    var totalPairs = DIFFICULTIES[currentDifficulty].pairs;
    if (matchedPairs === totalPairs) {
      stopTimer();
      // Small delay before showing victory modal
      var gen = gameGeneration;
      setTimeout(function () {
        if (gen !== gameGeneration) return;
        showVictory();
      }, 500);
    }
  }

  /** Handle mismatched pair */
  function handleMismatch(first, second) {
    isLocked = true;
    var currentGen = gameGeneration;

    setTimeout(function () {
      if (currentGen !== gameGeneration) return;

      first.card.isFlipped = false;
      second.card.isFlipped = false;
      first.cardEl.classList.remove('flipped');
      second.cardEl.classList.remove('flipped');
      flippedCards = [];
      isLocked = false;
    }, FLIP_BACK_DELAY);
  }

  // =============================================
  // Victory
  // =============================================

  /** Show victory modal with scores */
  function showVictory() {
    // Display current results
    finalMovesDisplay.textContent = moves;
    finalTimeDisplay.textContent = formatTime(elapsedSeconds);

    // Check and update best score
    var result = checkAndUpdateBest(moves, elapsedSeconds);

    // Show best score section
    if (result.bestRecord) {
      bestScoreSection.classList.remove('hidden');
      bestMovesDisplay.textContent = result.bestRecord.moves;
      bestTimeDisplay.textContent = formatTime(result.bestRecord.time);
    } else {
      bestScoreSection.classList.add('hidden');
    }

    // Show/hide new best badge
    if (result.isNewBest) {
      newBestBadge.classList.remove('hidden');
    } else {
      newBestBadge.classList.add('hidden');
    }

    victoryModal.classList.remove('hidden');
  }

  /** Hide victory modal */
  function hideVictory() {
    victoryModal.classList.add('hidden');
    newBestBadge.classList.add('hidden');
    bestScoreSection.classList.add('hidden');
  }

  // =============================================
  // Game Control
  // =============================================

  /** Restart game (same difficulty and theme) */
  function restartGame() {
    gameGeneration++;

    // Reset state
    flippedCards = [];
    matchedPairs = 0;
    moves = 0;
    isLocked = false;
    movesDisplay.textContent = '0';
    resetTimer();
    hideVictory();

    // Create new shuffled cards and render
    cards = createCardData();
    renderCards();
  }

  /** Switch difficulty - updates UI and restarts game */
  function setDifficulty(difficulty) {
    if (difficulty === currentDifficulty) return;
    currentDifficulty = difficulty;
    updateSelectorUI(difficultySelector, difficulty);
    restartGame();
  }

  /** Switch theme - updates UI and restarts game */
  function setTheme(theme) {
    if (theme === currentTheme) return;
    currentTheme = theme;
    updateSelectorUI(themeSelector, theme);
    restartGame();
  }

  /** Update active state on a selector button group */
  function updateSelectorUI(container, activeValue) {
    var buttons = container.querySelectorAll('.btn-option');
    buttons.forEach(function (btn) {
      btn.classList.toggle('active', btn.dataset.value === activeValue);
    });
  }

  // =============================================
  // Event Listeners
  // =============================================

  restartBtn.addEventListener('click', restartGame);
  playAgainBtn.addEventListener('click', restartGame);

  // Difficulty selector - event delegation
  difficultySelector.addEventListener('click', function (e) {
    var btn = e.target.closest('.btn-option');
    if (btn && btn.dataset.value) {
      setDifficulty(btn.dataset.value);
    }
  });

  // Theme selector - event delegation
  themeSelector.addEventListener('click', function (e) {
    var btn = e.target.closest('.btn-option');
    if (btn && btn.dataset.value) {
      setTheme(btn.dataset.value);
    }
  });

  // =============================================
  // Initialize
  // =============================================

  restartGame();

})();
