// ============================================================
// Typing Speed Test - app.js (Milestone 2)
// ============================================================

(function () {
  'use strict';

  // ==========================================================
  // TEXT LIBRARIES (5+ paragraphs each type)
  // ==========================================================

  const TEXT_LIBRARIES = {
    english: [
      "The quick brown fox jumps over the lazy dog near the riverbank while the sun sets behind the distant mountains casting long shadows across the valley below.",
      "Programming is the art of telling another human being what one wants the computer to do. Good code is its own best documentation and speaks volumes about its author.",
      "In the middle of difficulty lies opportunity. The only way to do great work is to love what you do. Stay hungry and stay foolish throughout your entire journey.",
      "Technology is best when it brings people together. The advance of technology is based on making it fit in so that you do not even notice it in your daily life.",
      "A journey of a thousand miles begins with a single step. Every expert was once a beginner and every professional was once an amateur starting from scratch.",
      "The best error message is the one that never shows up. Write code as if the person who will maintain it is a violent psychopath who knows where you live.",
      "Success is not final and failure is not fatal. It is the courage to continue that counts. Keep pushing forward regardless of the obstacles in your path ahead.",
      "Simplicity is the ultimate sophistication. Making the simple complicated is commonplace but making the complicated simple and awesomely simple now that is creativity at work.",
      "The only limit to our realization of tomorrow will be our doubts of today. Let us move forward with strong and active faith in ourselves and our abilities.",
      "Code is like humor. When you have to explain it then it is not that good. The best code speaks for itself clearly and leaves no room for confusion or doubt.",
      "Life is what happens when you are busy making other plans. The future belongs to those who believe in the beauty of their dreams and work hard to achieve them.",
      "Do not judge each day by the harvest you reap but by the seeds that you plant. Small daily improvements over time lead to stunning and remarkable results overall."
    ],
    code: [
      "function factorial(n) { if (n <= 1) return 1; return n * factorial(n - 1); } const result = factorial(10); console.log(result);",
      "const users = data.filter(u => u.active).map(u => u.name); for (let i = 0; i < users.length; i++) { console.log(users[i]); }",
      "class Stack { constructor() { this.items = []; } push(val) { this.items.push(val); } pop() { return this.items.pop(); } peek() { return this.items[this.items.length - 1]; } }",
      "async function fetchData(url) { try { const res = await fetch(url); if (!res.ok) throw new Error(res.status); return await res.json(); } catch (err) { console.error(err); } }",
      "const debounce = (fn, ms) => { let timer; return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), ms); }; };",
      "if (arr.length === 0) { return null; } let max = arr[0]; for (let i = 1; i < arr.length; i++) { if (arr[i] > max) { max = arr[i]; } } return max;",
      "const obj = { name: 'Alice', age: 30, greet() { return `Hello, ${this.name}!`; } }; const { name, age } = obj; console.log(name, age);"
    ],
    quotes: [
      "The only thing we have to fear is fear itself. Nameless unreasoning unjustified terror which paralyzes needed efforts to convert retreat into advance.",
      "In three words I can sum up everything I have learned about life: it goes on. Nothing in the world can take the place of persistence and determination.",
      "To be yourself in a world that is constantly trying to make you something else is the greatest accomplishment one can ever hope to achieve in this lifetime.",
      "It is during our darkest moments that we must focus to see the light. The best and most beautiful things in the world cannot be seen or even touched.",
      "Two roads diverged in a wood and I took the one less traveled by and that has made all the difference in the journey of my entire remarkable life.",
      "The greatest glory in living lies not in never falling but in rising every time we fall. Life is really simple but we insist on making it complicated.",
      "You must be the change you wish to see in the world. An eye for an eye only ends up making the whole world blind. Live as if you were to die tomorrow."
    ]
  };

  // ==========================================================
  // DOM ELEMENTS
  // ==========================================================

  const textDisplay = document.getElementById('textDisplay');
  const hiddenInput = document.getElementById('hiddenInput');
  const wpmEl = document.getElementById('wpm');
  const accuracyEl = document.getElementById('accuracy');
  const timerEl = document.getElementById('timer');
  const btnRestart = document.getElementById('btnRestart');
  const btnRestartResult = document.getElementById('btnRestartResult');
  const resultPanel = document.getElementById('resultPanel');
  const resultWpm = document.getElementById('resultWpm');
  const resultAccuracy = document.getElementById('resultAccuracy');
  const resultChars = document.getElementById('resultChars');
  const typingArea = document.getElementById('typingArea');
  const wpmChart = document.getElementById('wpmChart');
  const errorBars = document.getElementById('errorBars');
  const errorStats = document.getElementById('errorStats');
  const historyBody = document.getElementById('historyBody');
  const historyTable = document.getElementById('historyTable');
  const historyEmpty = document.getElementById('historyEmpty');
  const btnClearHistory = document.getElementById('btnClearHistory');
  const timeGroup = document.getElementById('timeGroup');
  const textTypeGroup = document.getElementById('textTypeGroup');
  const btnSound = document.getElementById('btnSound');
  const soundTypeSelect = document.getElementById('soundType');

  // ==========================================================
  // STATE
  // ==========================================================

  let currentText = '';
  let charIndex = 0;
  let correctChars = 0;
  let incorrectChars = 0;
  let totalTyped = 0;
  let selectedDuration = 60;
  let timeLeft = 60;
  let timerInterval = null;
  let wpmInterval = null;
  let isStarted = false;
  let isFinished = false;
  let startTime = null;
  let prevInputLength = 0;

  // Text type
  let currentTextType = 'english';

  // Sound
  let soundEnabled = false;
  let soundType = 'mechanical';
  let audioCtx = null;

  // WPM history for chart (one data point per second)
  let wpmHistory = [];

  // Error tracking: { char: count }
  let errorMap = {};

  // ==========================================================
  // TEXT FUNCTIONS
  // ==========================================================

  function getRandomText() {
    var lib = TEXT_LIBRARIES[currentTextType];
    var idx = Math.floor(Math.random() * lib.length);
    return lib[idx];
  }

  function renderText() {
    textDisplay.innerHTML = '';
    for (var i = 0; i < currentText.length; i++) {
      var span = document.createElement('span');
      span.classList.add('char');
      if (i === 0) {
        span.classList.add('current');
      } else {
        span.classList.add('pending');
      }
      span.textContent = currentText[i];
      textDisplay.appendChild(span);
    }
  }

  // ==========================================================
  // STATS
  // ==========================================================

  function calcWpm() {
    if (!startTime) return 0;
    var elapsed = (Date.now() - startTime) / 1000;
    var minutes = elapsed / 60;
    if (minutes <= 0) return 0;
    return Math.round((correctChars / 5) / minutes);
  }

  function calcAccuracy() {
    if (totalTyped === 0) return 100;
    return Math.round((correctChars / totalTyped) * 100);
  }

  function updateStats() {
    wpmEl.textContent = calcWpm();
    accuracyEl.textContent = calcAccuracy() + '%';
  }

  // ==========================================================
  // TIMER
  // ==========================================================

  function startTimer() {
    isStarted = true;
    startTime = Date.now();

    // Countdown every second
    timerInterval = setInterval(function () {
      timeLeft--;
      timerEl.textContent = timeLeft + 's';

      // Record WPM data point for chart
      wpmHistory.push(calcWpm());

      if (timeLeft <= 0) {
        endTest();
      }
    }, 1000);

    // Update WPM display every second
    wpmInterval = setInterval(function () {
      updateStats();
    }, 1000);
  }

  // ==========================================================
  // SOUND (Web Audio API)
  // ==========================================================

  function getAudioContext() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtx;
  }

  function playSound(isCorrect) {
    if (!soundEnabled) return;
    try {
      var ctx = getAudioContext();
      var oscillator = ctx.createOscillator();
      var gainNode = ctx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      if (soundType === 'mechanical') {
        // Mechanical keyboard: short click sound
        oscillator.type = 'square';
        if (isCorrect) {
          oscillator.frequency.setValueAtTime(800, ctx.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.05);
        } else {
          oscillator.frequency.setValueAtTime(200, ctx.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.08);
        }
        gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.06);
      } else {
        // Typewriter: sharper metallic strike
        oscillator.type = 'sawtooth';
        if (isCorrect) {
          oscillator.frequency.setValueAtTime(1200, ctx.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.04);
        } else {
          oscillator.frequency.setValueAtTime(150, ctx.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.1);
        }
        gainNode.gain.setValueAtTime(0.06, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.05);
      }
    } catch (e) {
      // Silently ignore audio errors
    }
  }

  // ==========================================================
  // WPM CHART (Canvas)
  // ==========================================================

  function drawWpmChart() {
    var canvas = wpmChart;
    var ctx = canvas.getContext('2d');

    // Set actual pixel dimensions for sharp rendering
    var dpr = window.devicePixelRatio || 1;
    var rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    var w = rect.width;
    var h = rect.height;
    var pad = { top: 20, right: 20, bottom: 30, left: 45 };
    var chartW = w - pad.left - pad.right;
    var chartH = h - pad.top - pad.bottom;

    // Clear
    ctx.clearRect(0, 0, w, h);

    if (wpmHistory.length === 0) return;

    var maxWpm = Math.max.apply(null, wpmHistory);
    if (maxWpm === 0) maxWpm = 10;
    maxWpm = Math.ceil(maxWpm / 10) * 10; // Round up to nearest 10

    // Grid lines
    ctx.strokeStyle = '#2a2a4a';
    ctx.lineWidth = 0.5;
    var gridLines = 4;
    for (var g = 0; g <= gridLines; g++) {
      var gy = pad.top + (chartH * g / gridLines);
      ctx.beginPath();
      ctx.moveTo(pad.left, gy);
      ctx.lineTo(pad.left + chartW, gy);
      ctx.stroke();

      // Y-axis labels
      var yVal = Math.round(maxWpm * (1 - g / gridLines));
      ctx.fillStyle = '#666';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(yVal, pad.left - 8, gy + 4);
    }

    // X-axis labels
    ctx.fillStyle = '#666';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    var xStep = Math.max(1, Math.floor(wpmHistory.length / 6));
    for (var x = 0; x < wpmHistory.length; x += xStep) {
      var xx = pad.left + (x / (wpmHistory.length - 1 || 1)) * chartW;
      ctx.fillText((x + 1) + 's', xx, h - 8);
    }
    // Always label last point
    if (wpmHistory.length > 1) {
      var lastX = pad.left + chartW;
      ctx.fillText(wpmHistory.length + 's', lastX, h - 8);
    }

    // Draw line
    ctx.strokeStyle = '#e94560';
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    for (var i = 0; i < wpmHistory.length; i++) {
      var px = pad.left + (i / (wpmHistory.length - 1 || 1)) * chartW;
      var py = pad.top + chartH - (wpmHistory[i] / maxWpm) * chartH;
      if (i === 0) {
        ctx.moveTo(px, py);
      } else {
        ctx.lineTo(px, py);
      }
    }
    ctx.stroke();

    // Fill area under line
    ctx.lineTo(pad.left + chartW, pad.top + chartH);
    ctx.lineTo(pad.left, pad.top + chartH);
    ctx.closePath();
    ctx.fillStyle = 'rgba(233, 69, 96, 0.1)';
    ctx.fill();

    // Draw dots
    ctx.fillStyle = '#e94560';
    for (var j = 0; j < wpmHistory.length; j++) {
      var dx = pad.left + (j / (wpmHistory.length - 1 || 1)) * chartW;
      var dy = pad.top + chartH - (wpmHistory[j] / maxWpm) * chartH;
      ctx.beginPath();
      ctx.arc(dx, dy, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ==========================================================
  // ERROR STATS
  // ==========================================================

  function renderErrorStats() {
    errorBars.innerHTML = '';

    // Get top 5 error characters
    var entries = Object.keys(errorMap).map(function (key) {
      return { char: key, count: errorMap[key] };
    });
    entries.sort(function (a, b) { return b.count - a.count; });
    entries = entries.slice(0, 5);

    if (entries.length === 0) {
      errorBars.innerHTML = '<p class="error-stats-empty">No errors - perfect typing!</p>';
      return;
    }

    var maxCount = entries[0].count;

    entries.forEach(function (entry) {
      var item = document.createElement('div');
      item.classList.add('error-bar-item');

      var countEl = document.createElement('span');
      countEl.classList.add('error-bar-count');
      countEl.textContent = entry.count;

      var bar = document.createElement('div');
      bar.classList.add('error-bar');
      var barHeight = Math.max(8, (entry.count / maxCount) * 80);
      bar.style.height = barHeight + 'px';

      var charEl = document.createElement('span');
      charEl.classList.add('error-bar-char');
      // Display space as visible label
      charEl.textContent = entry.char === ' ' ? '␣' : entry.char;

      item.appendChild(countEl);
      item.appendChild(bar);
      item.appendChild(charEl);
      errorBars.appendChild(item);
    });
  }

  // ==========================================================
  // HISTORY (localStorage)
  // ==========================================================

  var HISTORY_KEY = 'typing_test_history';

  function loadHistory() {
    try {
      var data = localStorage.getItem(HISTORY_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  function saveHistory(record) {
    var history = loadHistory();
    history.unshift(record);
    // Keep only last 10
    if (history.length > 10) {
      history = history.slice(0, 10);
    }
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }

  function clearHistory() {
    localStorage.removeItem(HISTORY_KEY);
    renderHistory();
  }

  function renderHistory() {
    var history = loadHistory();
    historyBody.innerHTML = '';

    if (history.length === 0) {
      historyTable.classList.add('hidden');
      historyEmpty.classList.remove('hidden');
      return;
    }

    historyTable.classList.remove('hidden');
    historyEmpty.classList.add('hidden');

    history.forEach(function (record, idx) {
      var tr = document.createElement('tr');
      tr.innerHTML =
        '<td>' + (idx + 1) + '</td>' +
        '<td>' + record.wpm + '</td>' +
        '<td>' + record.accuracy + '%</td>' +
        '<td>' + record.duration + 's</td>' +
        '<td>' + record.date + '</td>';
      historyBody.appendChild(tr);
    });
  }

  // ==========================================================
  // END TEST
  // ==========================================================

  function endTest() {
    isFinished = true;
    clearInterval(timerInterval);
    clearInterval(wpmInterval);

    // Final stats
    updateStats();

    // Disable input
    hiddenInput.disabled = true;
    typingArea.classList.add('ended');

    // Re-enable controls
    enableControls();

    // Show result panel
    var finalWpm = calcWpm();
    var finalAcc = calcAccuracy();

    resultWpm.textContent = finalWpm;
    resultAccuracy.textContent = finalAcc + '%';
    resultChars.textContent = totalTyped;
    resultPanel.classList.remove('hidden');

    // Draw WPM chart
    drawWpmChart();

    // Render error stats
    renderErrorStats();

    // Save to history
    var now = new Date();
    var dateStr = now.getFullYear() + '-' +
      String(now.getMonth() + 1).padStart(2, '0') + '-' +
      String(now.getDate()).padStart(2, '0') + ' ' +
      String(now.getHours()).padStart(2, '0') + ':' +
      String(now.getMinutes()).padStart(2, '0');

    saveHistory({
      wpm: finalWpm,
      accuracy: finalAcc,
      duration: selectedDuration,
      date: dateStr
    });

    renderHistory();
  }

  // ==========================================================
  // CONTROLS STATE (enable/disable during test)
  // ==========================================================

  function disableControls() {
    var timeBtns = timeGroup.querySelectorAll('.btn-option');
    timeBtns.forEach(function (btn) { btn.disabled = true; });

    var typeBtns = textTypeGroup.querySelectorAll('.btn-option');
    typeBtns.forEach(function (btn) { btn.disabled = true; });
  }

  function enableControls() {
    var timeBtns = timeGroup.querySelectorAll('.btn-option');
    timeBtns.forEach(function (btn) { btn.disabled = false; });

    var typeBtns = textTypeGroup.querySelectorAll('.btn-option');
    typeBtns.forEach(function (btn) { btn.disabled = false; });
  }

  // ==========================================================
  // RESET
  // ==========================================================

  function resetTest() {
    // Clear intervals
    clearInterval(timerInterval);
    clearInterval(wpmInterval);

    // Reset state
    charIndex = 0;
    correctChars = 0;
    incorrectChars = 0;
    totalTyped = 0;
    timeLeft = selectedDuration;
    isStarted = false;
    isFinished = false;
    startTime = null;
    prevInputLength = 0;
    wpmHistory = [];
    errorMap = {};

    // Reset UI
    wpmEl.textContent = '0';
    accuracyEl.textContent = '100%';
    timerEl.textContent = selectedDuration + 's';
    resultPanel.classList.add('hidden');
    typingArea.classList.remove('ended');

    // Enable controls
    enableControls();

    // Enable input
    hiddenInput.disabled = false;
    hiddenInput.value = '';

    // New text
    currentText = getRandomText();
    renderText();

    // Focus
    hiddenInput.focus();
  }

  // ==========================================================
  // INPUT HANDLING
  // ==========================================================

  function handleInput() {
    if (isFinished) return;

    var inputVal = hiddenInput.value;

    // Ignore backspace / deletion events
    if (inputVal.length <= prevInputLength) {
      prevInputLength = inputVal.length;
      return;
    }

    // Process only newly typed characters
    var newChars = inputVal.slice(prevInputLength);
    prevInputLength = inputVal.length;

    // Prevent accumulation
    if (inputVal.length > 50) {
      hiddenInput.value = inputVal.slice(-10);
      prevInputLength = hiddenInput.value.length;
    }

    var chars = textDisplay.querySelectorAll('.char');

    for (var c = 0; c < newChars.length; c++) {
      if (charIndex >= currentText.length || isFinished) break;

      // Start timer on first keypress & disable controls
      if (!isStarted) {
        startTimer();
        disableControls();
      }

      var typedChar = newChars[c];
      totalTyped++;

      var expectedChar = currentText[charIndex];
      var currentSpan = chars[charIndex];

      currentSpan.classList.remove('current');

      var isCorrect = (typedChar === expectedChar);
      if (isCorrect) {
        currentSpan.classList.remove('pending');
        currentSpan.classList.add('correct');
        correctChars++;
      } else {
        currentSpan.classList.remove('pending');
        currentSpan.classList.add('incorrect');
        incorrectChars++;

        // Track error character
        var errChar = expectedChar.toLowerCase();
        errorMap[errChar] = (errorMap[errChar] || 0) + 1;
      }

      // Play sound
      playSound(isCorrect);

      charIndex++;

      // Highlight next character
      if (charIndex < currentText.length) {
        chars[charIndex].classList.remove('pending');
        chars[charIndex].classList.add('current');
      } else {
        endTest();
        break;
      }
    }

    updateStats();
  }

  // ==========================================================
  // EVENT LISTENERS
  // ==========================================================

  hiddenInput.addEventListener('input', handleInput);

  typingArea.addEventListener('click', function () {
    if (!isFinished) hiddenInput.focus();
  });

  hiddenInput.addEventListener('focus', function () {
    typingArea.classList.add('focused');
  });

  hiddenInput.addEventListener('blur', function () {
    typingArea.classList.remove('focused');
  });

  btnRestart.addEventListener('click', resetTest);
  btnRestartResult.addEventListener('click', resetTest);

  document.addEventListener('click', function (e) {
    // Don't steal focus when clicking controls
    if (e.target.closest('.controls-bar') || e.target.closest('.history-section')) return;
    if (!isFinished) hiddenInput.focus();
  });

  hiddenInput.addEventListener('keydown', function (e) {
    if (e.key === 'Tab' || e.key === 'Backspace') {
      e.preventDefault();
    }
  });

  // --- Time Selection ---
  timeGroup.addEventListener('click', function (e) {
    var btn = e.target.closest('.btn-option');
    if (!btn || btn.disabled) return;

    timeGroup.querySelectorAll('.btn-option').forEach(function (b) {
      b.classList.remove('active');
    });
    btn.classList.add('active');

    selectedDuration = parseInt(btn.getAttribute('data-time'), 10);
    resetTest();
  });

  // --- Text Type Selection ---
  textTypeGroup.addEventListener('click', function (e) {
    var btn = e.target.closest('.btn-option');
    if (!btn || btn.disabled) return;

    textTypeGroup.querySelectorAll('.btn-option').forEach(function (b) {
      b.classList.remove('active');
    });
    btn.classList.add('active');

    currentTextType = btn.getAttribute('data-type');
    resetTest();
  });

  // --- Sound Toggle ---
  btnSound.addEventListener('click', function () {
    soundEnabled = !soundEnabled;
    if (soundEnabled) {
      btnSound.classList.add('active');
      btnSound.innerHTML = '&#128266;';
      soundTypeSelect.disabled = false;
      // Initialize audio context on user interaction
      getAudioContext();
    } else {
      btnSound.classList.remove('active');
      btnSound.innerHTML = '&#128264;';
      soundTypeSelect.disabled = true;
    }
  });

  soundTypeSelect.addEventListener('change', function () {
    soundType = soundTypeSelect.value;
  });

  // --- Clear History ---
  btnClearHistory.addEventListener('click', clearHistory);

  // ==========================================================
  // INITIALIZE
  // ==========================================================

  currentText = getRandomText();
  renderText();
  renderHistory();
  hiddenInput.focus();

})();
