// === State ===
let currentPage = 'home';
let questions = []; // questions in create mode
let quizData = null; // loaded quiz for playing
let currentQuestionIndex = 0;
let userAnswers = []; // { selected: number, correct: boolean, timeout: boolean }
let shuffledQuestions = []; // shuffled version for playing (F13)

const DRAFT_KEY = 'quiz-builder-draft';
const HISTORY_KEY = 'quiz-builder-history';
const THEME_KEY = 'quiz-builder-theme';

// Timer state (F10)
let timerInterval = null;
let timerRemaining = 0;
let timerTotal = 0;
let isAnswering = true; // flag to prevent double-answer

// Keyboard hint shown flag (F15)
let keyboardHintShown = false;

// === Built-in Sample Quiz ===
const sampleQuiz = {
  title: "Web 前端基础知识",
  questions: [
    {
      question: "HTML 的全称是什么？",
      options: [
        "Hyper Text Markup Language",
        "High Tech Modern Language",
        "Hyper Transfer Markup Language",
        "Home Tool Markup Language"
      ],
      correctIndex: 0
    },
    {
      question: "CSS 中，哪个属性用于改变文字颜色？",
      options: [
        "font-color",
        "text-color",
        "color",
        "foreground"
      ],
      correctIndex: 2
    },
    {
      question: "JavaScript 中，哪个方法用于向数组末尾添加元素？",
      options: [
        "append()",
        "push()",
        "add()",
        "insert()"
      ],
      correctIndex: 1
    },
    {
      question: "哪个 HTML 标签用于创建超链接？",
      options: [
        "<link>",
        "<a>",
        "<href>",
        "<url>"
      ],
      correctIndex: 1
    },
    {
      question: "CSS Flexbox 中，哪个属性用于设置主轴方向？",
      options: [
        "align-items",
        "justify-content",
        "flex-direction",
        "flex-wrap"
      ],
      correctIndex: 2
    }
  ]
};

// === Navigation ===
function navigateTo(page) {
  // Clear timer when leaving quiz page
  if (currentPage === 'quiz') {
    stopTimer();
  }

  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const target = document.getElementById('page-' + page);
  if (target) {
    target.classList.add('active');
    currentPage = page;
  }

  if (page === 'create') {
    loadDraft();
    renderQuestions();
  }
  if (page === 'import') {
    document.getElementById('import-error').textContent = '';
  }
  if (page === 'history') {
    renderHistory();
  }
}

// === Create Mode ===
function addQuestion() {
  questions.push({
    question: '',
    options: ['', ''],
    correctIndex: -1
  });
  renderQuestions();
  saveDraft();
}

function deleteQuestion(index) {
  questions.splice(index, 1);
  renderQuestions();
  saveDraft();
}

function addOption(qIndex) {
  if (questions[qIndex].options.length < 4) {
    questions[qIndex].options.push('');
    renderQuestions();
    saveDraft();
  }
}

function deleteOption(qIndex, oIndex) {
  if (questions[qIndex].options.length > 2) {
    if (questions[qIndex].correctIndex === oIndex) {
      questions[qIndex].correctIndex = -1;
    } else if (questions[qIndex].correctIndex > oIndex) {
      questions[qIndex].correctIndex--;
    }
    questions[qIndex].options.splice(oIndex, 1);
    renderQuestions();
    saveDraft();
  }
}

function setCorrectAnswer(qIndex, oIndex) {
  questions[qIndex].correctIndex = oIndex;
  saveDraft();
}

function updateQuestionText(qIndex, value) {
  questions[qIndex].question = value;
  saveDraft();
}

function updateOptionText(qIndex, oIndex, value) {
  questions[qIndex].options[oIndex] = value;
  saveDraft();
}

function renderQuestions() {
  const container = document.getElementById('questions-container');
  container.innerHTML = '';

  questions.forEach((q, qIndex) => {
    const block = document.createElement('div');
    block.className = 'question-block';

    let optionsHTML = '';
    q.options.forEach((opt, oIndex) => {
      const checked = q.correctIndex === oIndex ? 'checked' : '';
      const deleteBtn = q.options.length > 2
        ? `<button class="btn-delete-option" onclick="deleteOption(${qIndex}, ${oIndex})" title="删除选项">\u00d7</button>`
        : '';
      optionsHTML += `
        <div class="option-row">
          <input type="radio" name="correct-${qIndex}" ${checked}
            onchange="setCorrectAnswer(${qIndex}, ${oIndex})">
          <input type="text" placeholder="选项 ${oIndex + 1}" value="${escapeHtml(opt)}"
            oninput="updateOptionText(${qIndex}, ${oIndex}, this.value)">
          ${deleteBtn}
        </div>
      `;
    });

    const addOptionBtn = q.options.length < 4
      ? `<button class="btn-add-option" onclick="addOption(${qIndex})">+ 添加选项</button>`
      : '';

    block.innerHTML = `
      <div class="question-block-header">
        <span>题目 ${qIndex + 1}</span>
        <button class="btn-delete-question" onclick="deleteQuestion(${qIndex})" title="删除题目">\u00d7</button>
      </div>
      <input type="text" class="question-input" placeholder="请输入题干" value="${escapeHtml(q.question)}"
        oninput="updateQuestionText(${qIndex}, this.value)">
      ${optionsHTML}
      ${addOptionBtn}
    `;

    container.appendChild(block);
  });

  updateQuestionCount();
}

function updateQuestionCount() {
  document.getElementById('question-count').textContent = `已添加 ${questions.length} 道题`;
}

// === Export ===
function exportQuiz() {
  const title = document.getElementById('quiz-title').value.trim();
  if (!title) {
    alert('请输入测验标题');
    return;
  }

  const validQuestions = [];
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    if (!q.question.trim()) {
      alert(`题目 ${i + 1} 的题干不能为空`);
      return;
    }
    const filledOptions = q.options.filter(o => o.trim());
    if (filledOptions.length < 2) {
      alert(`题目 ${i + 1} 至少需要 2 个非空选项`);
      return;
    }
    if (q.correctIndex < 0 || q.correctIndex >= q.options.length) {
      alert(`题目 ${i + 1} 请标记正确答案`);
      return;
    }
    if (!q.options[q.correctIndex].trim()) {
      alert(`题目 ${i + 1} 的正确答案选项不能为空`);
      return;
    }
    validQuestions.push({
      question: q.question.trim(),
      options: q.options.map(o => o.trim()),
      correctIndex: q.correctIndex
    });
  }

  if (validQuestions.length === 0) {
    alert('请至少添加 1 道题目');
    return;
  }

  const data = {
    title: title,
    questions: validQuestions
  };

  // Include timeLimit if set (F10)
  const timeLimit = parseInt(document.getElementById('quiz-time-limit').value, 10);
  if (timeLimit > 0) {
    data.timeLimit = timeLimit;
  }

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `quiz-${title}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// === Import ===
function importQuiz(event) {
  const file = event.target.files[0];
  if (!file) return;

  const errorEl = document.getElementById('import-error');
  errorEl.textContent = '';

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);
      const validated = validateQuizData(data);
      if (validated) {
        startQuiz(validated);
      } else {
        errorEl.textContent = 'JSON 格式不正确，请检查文件内容';
      }
    } catch (err) {
      errorEl.textContent = '无法解析文件，请确保是有效的 JSON 格式';
    }
  };
  reader.readAsText(file);
  event.target.value = '';
}

function validateQuizData(data) {
  if (!data || typeof data.title !== 'string' || !data.title.trim()) return null;
  if (!Array.isArray(data.questions) || data.questions.length === 0) return null;

  for (const q of data.questions) {
    if (!q.question || typeof q.question !== 'string') return null;
    if (!Array.isArray(q.options) || q.options.length < 2 || q.options.length > 4) return null;
    if (typeof q.correctIndex !== 'number' || q.correctIndex < 0 || q.correctIndex >= q.options.length) return null;
  }

  return data;
}

function loadSampleQuiz() {
  startQuiz(sampleQuiz);
}

// === Shuffle Options (F13) ===
function shuffleQuestions(data) {
  return data.questions.map(q => {
    // Create array of indices [0, 1, 2, ...]
    const indices = q.options.map((_, i) => i);
    // Fisher-Yates shuffle
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    // Build shuffled question
    const shuffledOptions = indices.map(i => q.options[i]);
    const newCorrectIndex = indices.indexOf(q.correctIndex);
    return {
      question: q.question,
      options: shuffledOptions,
      correctIndex: newCorrectIndex,
      originalOptions: q.options,
      originalCorrectIndex: q.correctIndex
    };
  });
}

// === Quiz Mode ===
function startQuiz(data) {
  quizData = data;
  currentQuestionIndex = 0;
  userAnswers = [];
  isAnswering = true;
  // Shuffle options for this session (F13)
  shuffledQuestions = shuffleQuestions(data);
  navigateTo('quiz');

  // Show keyboard hint on first quiz (F15)
  const hintEl = document.getElementById('keyboard-hint');
  if (!keyboardHintShown) {
    hintEl.style.display = 'block';
    keyboardHintShown = true;
  } else {
    hintEl.style.display = 'none';
  }

  renderQuizQuestion();
}

function renderQuizQuestion() {
  if (!quizData) return;

  isAnswering = true;
  const q = shuffledQuestions[currentQuestionIndex];
  const total = shuffledQuestions.length;

  document.getElementById('quiz-playing-title').textContent = quizData.title;
  document.getElementById('quiz-progress').textContent = `第 ${currentQuestionIndex + 1}/${total} 题`;
  document.getElementById('quiz-question-text').textContent = q.question;

  // Update progress bar (F11)
  const progressPercent = ((currentQuestionIndex) / total) * 100;
  document.getElementById('progress-bar').style.width = progressPercent + '%';

  // Hide timeout overlay
  document.getElementById('timeout-overlay').style.display = 'none';

  const optionsContainer = document.getElementById('quiz-options');
  optionsContainer.innerHTML = '';

  q.options.forEach((opt, index) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.textContent = opt;
    btn.onclick = () => selectAnswer(index);
    optionsContainer.appendChild(btn);
  });

  // Start timer if applicable (F10)
  startTimer();
}

function selectAnswer(selectedIndex) {
  if (!isAnswering) return;
  isAnswering = false;

  stopTimer();

  const q = shuffledQuestions[currentQuestionIndex];
  const isCorrect = selectedIndex === q.correctIndex;

  userAnswers.push({
    selected: selectedIndex,
    correct: isCorrect,
    timeout: false
  });

  // Show feedback
  const buttons = document.querySelectorAll('#quiz-options .option-btn');
  buttons.forEach((btn, i) => {
    btn.classList.add('disabled');
    if (i === q.correctIndex) {
      btn.classList.add('correct');
      btn.textContent = '\u2713 ' + btn.textContent;
    }
    if (i === selectedIndex && !isCorrect) {
      btn.classList.add('incorrect');
      btn.textContent = '\u2717 ' + btn.textContent;
    }
  });

  // Auto advance after 1 second
  setTimeout(() => advanceQuestion(), 1000);
}

function advanceQuestion() {
  currentQuestionIndex++;
  if (currentQuestionIndex < shuffledQuestions.length) {
    renderQuizQuestion();
  } else {
    // Update progress bar to 100%
    document.getElementById('progress-bar').style.width = '100%';
    showResults();
  }
}

// === Timer (F10) ===
function startTimer() {
  stopTimer();

  const timeLimit = quizData.timeLimit || 0;
  const timerContainer = document.getElementById('timer-container');

  if (timeLimit <= 0) {
    timerContainer.style.display = 'none';
    return;
  }

  timerContainer.style.display = 'block';
  timerTotal = timeLimit;
  timerRemaining = timeLimit;

  updateTimerDisplay();

  timerInterval = setInterval(() => {
    timerRemaining -= 0.1;
    if (timerRemaining <= 0) {
      timerRemaining = 0;
      updateTimerDisplay();
      onTimeout();
    } else {
      updateTimerDisplay();
    }
  }, 100);
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function updateTimerDisplay() {
  const bar = document.getElementById('timer-bar');
  const text = document.getElementById('timer-text');
  const percent = (timerRemaining / timerTotal) * 100;
  bar.style.width = Math.max(0, percent) + '%';
  text.textContent = Math.ceil(timerRemaining) + ' 秒';
}

function onTimeout() {
  if (!isAnswering) return;
  isAnswering = false;

  stopTimer();

  const q = shuffledQuestions[currentQuestionIndex];

  userAnswers.push({
    selected: -1,
    correct: false,
    timeout: true
  });

  // Show timeout overlay
  document.getElementById('timeout-overlay').style.display = 'block';

  // Show correct answer
  const buttons = document.querySelectorAll('#quiz-options .option-btn');
  buttons.forEach((btn, i) => {
    btn.classList.add('disabled');
    if (i === q.correctIndex) {
      btn.classList.add('correct');
      btn.textContent = '\u2713 ' + btn.textContent;
    }
  });

  setTimeout(() => advanceQuestion(), 1000);
}

// === Grade (F12) ===
function getGrade(percentage) {
  if (percentage >= 90) return { letter: 'A', emoji: '\uD83C\uDFC6' };
  if (percentage >= 80) return { letter: 'B', emoji: '\uD83C\uDF89' };
  if (percentage >= 70) return { letter: 'C', emoji: '\uD83D\uDC4D' };
  if (percentage >= 60) return { letter: 'D', emoji: '\uD83D\uDE05' };
  return { letter: 'F', emoji: '\uD83D\uDCAA' };
}

// === Results ===
function showResults() {
  stopTimer();

  const total = shuffledQuestions.length;
  const correctCount = userAnswers.filter(a => a.correct).length;
  const percentage = Math.round((correctCount / total) * 100);

  document.getElementById('result-score').textContent = correctCount;
  document.getElementById('result-total').textContent = ' / ' + total;
  document.getElementById('result-percentage').textContent = percentage + '%';

  // Grade display (F12)
  const grade = getGrade(percentage);
  document.getElementById('grade-display').innerHTML =
    `<span class="grade-emoji">${grade.emoji}</span><span class="grade-letter">${grade.letter} 级</span>`;

  // Render details
  const detailsContainer = document.getElementById('result-details');
  detailsContainer.innerHTML = '';

  shuffledQuestions.forEach((q, i) => {
    const answer = userAnswers[i];
    const item = document.createElement('div');

    if (answer.timeout) {
      item.className = 'result-item timeout';
    } else {
      item.className = 'result-item ' + (answer.correct ? 'correct' : 'incorrect');
    }

    const correctText = q.options[q.correctIndex];
    let answerHTML;

    if (answer.timeout) {
      answerHTML = `<span class="timeout-text">\u23F0 时间到</span> \u2192 正确答案：<span class="correct-text">${escapeHtml(correctText)}</span>`;
    } else if (answer.correct) {
      const userText = q.options[answer.selected];
      answerHTML = `<span class="correct-text">\u2713 ${escapeHtml(userText)}</span>`;
    } else {
      const userText = q.options[answer.selected];
      answerHTML = `<span class="incorrect-text">\u2717 ${escapeHtml(userText)}</span> \u2192 正确答案：<span class="correct-text">${escapeHtml(correctText)}</span>`;
    }

    item.innerHTML = `
      <div class="result-item-question">${i + 1}. ${escapeHtml(q.question)}</div>
      <div class="result-item-answer">${answerHTML}</div>
    `;
    detailsContainer.appendChild(item);
  });

  // Save to history (F14)
  saveHistory(quizData.title, correctCount, total, percentage, grade, shuffledQuestions, userAnswers);

  navigateTo('result');
}

function restartQuiz() {
  if (quizData) {
    startQuiz(quizData);
  }
}

// === History (F14) ===
function getHistory() {
  try {
    const saved = localStorage.getItem(HISTORY_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    return [];
  }
}

function saveHistory(title, score, total, percentage, grade, questionsData, answers) {
  const history = getHistory();
  const record = {
    quizTitle: title,
    score: score,
    total: total,
    percentage: percentage,
    grade: grade.letter,
    date: new Date().toISOString(),
    details: questionsData.map((q, i) => ({
      question: q.question,
      userAnswer: answers[i].selected,
      correctAnswer: q.correctIndex,
      isCorrect: answers[i].correct,
      timeout: answers[i].timeout || false,
      options: q.options
    }))
  };

  history.unshift(record);
  // Keep only last 10
  if (history.length > 10) {
    history.length = 10;
  }

  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch (e) {
    // Silently fail
  }
}

function renderHistory() {
  const history = getHistory();
  const container = document.getElementById('history-list');
  const emptyHint = document.getElementById('history-empty');

  container.innerHTML = '';

  if (history.length === 0) {
    emptyHint.style.display = 'block';
    return;
  }

  emptyHint.style.display = 'none';

  history.forEach((record, index) => {
    const item = document.createElement('div');
    item.className = 'history-item';
    item.onclick = () => showHistoryDetail(index);

    const dateStr = new Date(record.date).toLocaleString('zh-CN');
    const gradeInfo = getGrade(record.percentage);

    item.innerHTML = `
      <div class="history-item-info">
        <div class="history-item-title">${escapeHtml(record.quizTitle)}</div>
        <div class="history-item-date">${dateStr}</div>
      </div>
      <div class="history-item-score">
        ${record.score}/${record.total}
        <span class="grade-small">${gradeInfo.emoji} ${record.grade} 级</span>
      </div>
    `;
    container.appendChild(item);
  });
}

function showHistoryDetail(index) {
  const history = getHistory();
  const record = history[index];
  if (!record) return;

  document.getElementById('history-detail-title').textContent = record.quizTitle;

  const grade = getGrade(record.percentage);
  const summaryEl = document.getElementById('history-detail-summary');
  summaryEl.innerHTML = `
    <div class="grade-display">
      <span class="grade-emoji">${grade.emoji}</span>
      <span class="grade-letter">${record.grade} 级</span>
    </div>
    <div class="score-display">
      <span class="score-number">${record.score}</span>
      <span class="score-total"> / ${record.total}</span>
    </div>
    <p class="score-percentage">${record.percentage}%</p>
  `;

  const detailsEl = document.getElementById('history-detail-details');
  detailsEl.innerHTML = '';

  record.details.forEach((d, i) => {
    const item = document.createElement('div');
    if (d.timeout) {
      item.className = 'result-item timeout';
    } else {
      item.className = 'result-item ' + (d.isCorrect ? 'correct' : 'incorrect');
    }

    const correctText = d.options[d.correctAnswer];
    let answerHTML;
    if (d.timeout) {
      answerHTML = `<span class="timeout-text">\u23F0 时间到</span> \u2192 正确答案：<span class="correct-text">${escapeHtml(correctText)}</span>`;
    } else if (d.isCorrect) {
      answerHTML = `<span class="correct-text">\u2713 ${escapeHtml(d.options[d.userAnswer])}</span>`;
    } else {
      answerHTML = `<span class="incorrect-text">\u2717 ${escapeHtml(d.options[d.userAnswer])}</span> \u2192 正确答案：<span class="correct-text">${escapeHtml(correctText)}</span>`;
    }

    item.innerHTML = `
      <div class="result-item-question">${i + 1}. ${escapeHtml(d.question)}</div>
      <div class="result-item-answer">${answerHTML}</div>
    `;
    detailsEl.appendChild(item);
  });

  navigateTo('history-detail');
}

// === Draft (localStorage) ===
function saveDraft() {
  const title = document.getElementById('quiz-title').value;
  const timeLimit = document.getElementById('quiz-time-limit').value;
  const draft = {
    title: title,
    timeLimit: timeLimit,
    questions: questions
  };
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch (e) {
    // Silently fail if localStorage is full
  }
}

function loadDraft() {
  try {
    const saved = localStorage.getItem(DRAFT_KEY);
    if (saved) {
      const draft = JSON.parse(saved);
      document.getElementById('quiz-title').value = draft.title || '';
      document.getElementById('quiz-time-limit').value = draft.timeLimit || '0';
      questions = draft.questions || [];
    } else {
      document.getElementById('quiz-title').value = '';
      document.getElementById('quiz-time-limit').value = '0';
      questions = [];
    }
  } catch (e) {
    questions = [];
  }
}

function clearDraft() {
  if (confirm('确定要清空所有草稿内容吗？')) {
    localStorage.removeItem(DRAFT_KEY);
    document.getElementById('quiz-title').value = '';
    document.getElementById('quiz-time-limit').value = '0';
    questions = [];
    renderQuestions();
  }
}

// === Theme (F16) ===
function initTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved) {
    setTheme(saved);
  } else {
    // Follow system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(prefersDark ? 'dark' : 'light');
  }
}

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  document.getElementById('theme-icon').textContent = theme === 'dark' ? '\uD83C\uDF19' : '\u2600\uFE0F';
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  setTheme(next);
  try {
    localStorage.setItem(THEME_KEY, next);
  } catch (e) {}
}

// === Keyboard Shortcuts (F15) ===
function handleKeydown(e) {
  // Esc: return to home from any page
  if (e.key === 'Escape') {
    e.preventDefault();
    if (currentPage !== 'home') {
      stopTimer();
      navigateTo('home');
    }
    return;
  }

  // Quiz page: 1-4 to select options
  if (currentPage === 'quiz' && isAnswering) {
    const key = parseInt(e.key, 10);
    if (key >= 1 && key <= 4) {
      e.preventDefault();
      const buttons = document.querySelectorAll('#quiz-options .option-btn');
      if (key <= buttons.length) {
        selectAnswer(key - 1);
      }
    }
  }

  // Result page: Enter to restart
  if (currentPage === 'result' && e.key === 'Enter') {
    e.preventDefault();
    restartQuiz();
  }
}

// === Utility ===
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// === Init ===
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  document.addEventListener('keydown', handleKeydown);
  navigateTo('home');
});
