// Category configuration
const CATEGORIES = [
  { name: '餐饮', color: '#FF6384', icon: '🍽️' },
  { name: '交通', color: '#36A2EB', icon: '🚗' },
  { name: '购物', color: '#FFCE56', icon: '🛒' },
  { name: '娱乐', color: '#4BC0C0', icon: '🎮' },
  { name: '住房', color: '#9966FF', icon: '🏠' },
  { name: '医疗', color: '#FF9F40', icon: '🏥' },
  { name: '教育', color: '#C9CBCF', icon: '📚' },
  { name: '其他', color: '#7C8A96', icon: '📌' },
];

const STORAGE_KEY = 'expenses';
const BUDGET_KEY = 'budget';
const THEME_KEY = 'theme';

// ── ExpenseManager ──
const ExpenseManager = {
  _expenses: [],

  load() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      this._expenses = data ? JSON.parse(data) : [];
    } catch {
      this._expenses = [];
    }
  },

  save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this._expenses));
  },

  getAll() {
    return this._expenses;
  },

  getByMonth(year, month) {
    return this._expenses.filter(e => {
      const [y, m] = e.date.split('-').map(Number);
      return y === year && (m - 1) === month;
    });
  },

  add(expense) {
    expense.id = this._generateId();
    this._expenses.push(expense);
    this.save();
    return expense;
  },

  update(id, data) {
    const idx = this._expenses.findIndex(e => e.id === id);
    if (idx === -1) return null;
    this._expenses[idx] = { ...this._expenses[idx], ...data };
    this.save();
    return this._expenses[idx];
  },

  remove(id) {
    this._expenses = this._expenses.filter(e => e.id !== id);
    this.save();
  },

  getById(id) {
    return this._expenses.find(e => e.id === id) || null;
  },

  addBatch(expenses) {
    expenses.forEach(e => {
      e.id = this._generateId();
      this._expenses.push(e);
    });
    this.save();
  },

  _generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }
};

// ── BudgetManager ──
const BudgetManager = {
  _budget: null,

  load() {
    try {
      const data = localStorage.getItem(BUDGET_KEY);
      this._budget = data ? JSON.parse(data) : null;
    } catch {
      this._budget = null;
    }
  },

  save() {
    if (this._budget) {
      localStorage.setItem(BUDGET_KEY, JSON.stringify(this._budget));
    } else {
      localStorage.removeItem(BUDGET_KEY);
    }
  },

  get() {
    return this._budget;
  },

  set(monthly) {
    this._budget = { monthly };
    this.save();
  },

  clear() {
    this._budget = null;
    this.save();
  }
};

// ── ThemeManager ──
const ThemeManager = {
  _theme: 'light',

  load() {
    this._theme = localStorage.getItem(THEME_KEY) || 'light';
    this.apply();
  },

  apply() {
    document.documentElement.setAttribute('data-theme', this._theme);
  },

  toggle() {
    this._theme = this._theme === 'light' ? 'dark' : 'light';
    localStorage.setItem(THEME_KEY, this._theme);
    this.apply();
    return this._theme;
  },

  get() {
    return this._theme;
  }
};

// ── App State ──
const state = {
  currentYear: new Date().getFullYear(),
  currentMonth: new Date().getMonth(),
  editingId: null,
  deletingId: null,
  searchQuery: '',
  importData: null,
};

// ── DOM Elements ──
const $ = (sel) => document.querySelector(sel);
const form = $('#expense-form');
const amountInput = $('#amount');
const categorySelect = $('#category');
const dateInput = $('#date');
const noteInput = $('#note');
const expenseIdInput = $('#expense-id');
const formTitle = $('#form-title');
const submitBtn = $('#submit-btn');
const cancelBtn = $('#cancel-btn');
const amountError = $('#amount-error');
const expenseList = $('#expense-list');
const totalExpense = $('#total-expense');
const totalCount = $('#total-count');
const dailyAvg = $('#daily-avg');
const currentMonthDisplay = $('#current-month');
const prevMonthBtn = $('#prev-month');
const nextMonthBtn = $('#next-month');
const deleteModal = $('#delete-modal');
const confirmDeleteBtn = $('#confirm-delete');
const cancelDeleteBtn = $('#cancel-delete');
const themeToggle = $('#theme-toggle');
const searchInput = $('#search-input');
const exportCsvBtn = $('#export-csv-btn');
const importCsvInput = $('#import-csv-input');
const importModal = $('#import-modal');
const importPreview = $('#import-preview');
const importCount = $('#import-count');
const importConfirmBtn = $('#import-confirm-btn');
const importCancelBtn = $('#import-cancel-btn');
const budgetSetBtn = $('#budget-set-btn');
const budgetBarWrap = $('#budget-bar-wrap');
const budgetBarFill = $('#budget-bar-fill');
const budgetText = $('#budget-text');
const budgetModal = $('#budget-modal');
const budgetInput = $('#budget-input');
const budgetSaveBtn = $('#budget-save-btn');
const budgetCancelBtn = $('#budget-cancel-btn');
const pieCanvas = $('#pie-chart');
const pieTooltip = $('#pie-tooltip');
const barCanvas = $('#bar-chart');

// ── Initialize ──
function init() {
  ExpenseManager.load();
  BudgetManager.load();
  ThemeManager.load();
  populateCategories();
  setDefaultDate();
  updateThemeIcon();
  render();
  bindEvents();
}

function populateCategories() {
  CATEGORIES.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat.name;
    option.textContent = `${cat.icon} ${cat.name}`;
    categorySelect.appendChild(option);
  });
}

function setDefaultDate() {
  dateInput.value = new Date().toISOString().split('T')[0];
}

function updateThemeIcon() {
  themeToggle.textContent = ThemeManager.get() === 'light' ? '🌙' : '☀️';
}

function bindEvents() {
  form.addEventListener('submit', handleSubmit);
  cancelBtn.addEventListener('click', resetForm);
  prevMonthBtn.addEventListener('click', () => changeMonth(-1));
  nextMonthBtn.addEventListener('click', () => changeMonth(1));
  confirmDeleteBtn.addEventListener('click', handleConfirmDelete);
  cancelDeleteBtn.addEventListener('click', hideDeleteModal);
  deleteModal.addEventListener('click', (e) => {
    if (e.target === deleteModal) hideDeleteModal();
  });
  themeToggle.addEventListener('click', () => {
    ThemeManager.toggle();
    updateThemeIcon();
    render();
  });
  searchInput.addEventListener('input', () => {
    state.searchQuery = searchInput.value.trim();
    renderListOnly();
  });
  exportCsvBtn.addEventListener('click', handleExportCsv);
  importCsvInput.addEventListener('change', handleImportFile);
  importConfirmBtn.addEventListener('click', handleImportConfirm);
  importCancelBtn.addEventListener('click', hideImportModal);
  importModal.addEventListener('click', (e) => {
    if (e.target === importModal) hideImportModal();
  });
  budgetSetBtn.addEventListener('click', showBudgetModal);
  budgetSaveBtn.addEventListener('click', handleBudgetSave);
  budgetCancelBtn.addEventListener('click', hideBudgetModal);
  budgetModal.addEventListener('click', (e) => {
    if (e.target === budgetModal) hideBudgetModal();
  });
  // Pie chart hover
  pieCanvas.addEventListener('mousemove', handlePieHover);
  pieCanvas.addEventListener('mouseleave', () => { pieTooltip.style.display = 'none'; });
}

// ── Form handling ──
function handleSubmit(e) {
  e.preventDefault();

  const amount = parseFloat(amountInput.value);
  if (!amount || amount <= 0) {
    amountError.textContent = '请输入有效的正数金额';
    return;
  }
  amountError.textContent = '';

  const data = {
    amount: Math.round(amount * 100) / 100,
    category: categorySelect.value,
    date: dateInput.value,
    note: noteInput.value.trim(),
  };

  if (state.editingId) {
    ExpenseManager.update(state.editingId, data);
  } else {
    ExpenseManager.add(data);
  }

  resetForm();
  render();
}

function resetForm() {
  state.editingId = null;
  expenseIdInput.value = '';
  form.reset();
  setDefaultDate();
  formTitle.textContent = '添加支出';
  submitBtn.textContent = '保存';
  cancelBtn.style.display = 'none';
  amountError.textContent = '';
}

function startEdit(id) {
  const expense = ExpenseManager.getById(id);
  if (!expense) return;

  state.editingId = id;
  expenseIdInput.value = id;
  amountInput.value = expense.amount;
  categorySelect.value = expense.category;
  dateInput.value = expense.date;
  noteInput.value = expense.note || '';
  formTitle.textContent = '编辑支出';
  submitBtn.textContent = '更新';
  cancelBtn.style.display = 'inline-flex';
  amountError.textContent = '';

  form.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ── Delete handling ──
function showDeleteModal(id) {
  state.deletingId = id;
  deleteModal.style.display = 'flex';
}

function hideDeleteModal() {
  state.deletingId = null;
  deleteModal.style.display = 'none';
}

function handleConfirmDelete() {
  if (state.deletingId) {
    if (state.editingId === state.deletingId) {
      resetForm();
    }
    ExpenseManager.remove(state.deletingId);
    hideDeleteModal();
    render();
  }
}

// ── Month navigation ──
function changeMonth(delta) {
  state.currentMonth += delta;
  if (state.currentMonth > 11) {
    state.currentMonth = 0;
    state.currentYear++;
  } else if (state.currentMonth < 0) {
    state.currentMonth = 11;
    state.currentYear--;
  }
  render();
}

// ── Budget ──
function showBudgetModal() {
  const budget = BudgetManager.get();
  budgetInput.value = budget ? budget.monthly : '';
  budgetModal.style.display = 'flex';
  budgetInput.focus();
}

function hideBudgetModal() {
  budgetModal.style.display = 'none';
}

function handleBudgetSave() {
  const val = parseFloat(budgetInput.value);
  if (val > 0) {
    BudgetManager.set(val);
  } else {
    BudgetManager.clear();
  }
  hideBudgetModal();
  render();
}

// ── CSV Export ──
function handleExportCsv() {
  const expenses = ExpenseManager.getByMonth(state.currentYear, state.currentMonth);
  if (expenses.length === 0) return;

  const sorted = [...expenses].sort((a, b) => a.date.localeCompare(b.date));
  const header = '日期,分类,金额,备注';
  const rows = sorted.map(e => {
    const note = e.note.includes(',') ? `"${e.note}"` : e.note;
    return `${e.date},${e.category},${e.amount},${note}`;
  });
  const csv = '\uFEFF' + [header, ...rows].join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `expenses-${state.currentYear}-${String(state.currentMonth + 1).padStart(2, '0')}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── CSV Import ──
function handleImportFile(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (ev) => {
    const text = ev.target.result;
    const parsed = parseCsv(text);
    if (parsed.length === 0) {
      alert('CSV 文件为空或格式不正确');
      importCsvInput.value = '';
      return;
    }
    state.importData = parsed;
    showImportPreview(parsed);
  };
  reader.readAsText(file, 'utf-8');
  importCsvInput.value = '';
}

function parseCsv(text) {
  const lines = text.trim().split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length < 2) return [];

  const results = [];
  for (let i = 1; i < lines.length; i++) {
    const parts = splitCsvLine(lines[i]);
    if (parts.length < 3) continue;
    const date = parts[0].trim();
    const category = parts[1].trim();
    const amount = parseFloat(parts[2]);
    const note = (parts[3] || '').trim().replace(/^"|"$/g, '');
    if (!date || !category || !amount || amount <= 0) continue;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) continue;
    results.push({ date, category, amount: Math.round(amount * 100) / 100, note });
  }
  return results;
}

function splitCsvLine(line) {
  const parts = [];
  let current = '';
  let inQuotes = false;
  for (const ch of line) {
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      parts.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  parts.push(current);
  return parts;
}

function showImportPreview(data) {
  let html = '<table><tr><th>日期</th><th>分类</th><th>金额</th><th>备注</th></tr>';
  data.forEach(d => {
    html += `<tr><td>${escapeHtml(d.date)}</td><td>${escapeHtml(d.category)}</td><td>¥${d.amount.toFixed(2)}</td><td>${escapeHtml(d.note)}</td></tr>`;
  });
  html += '</table>';
  importPreview.innerHTML = html;
  importCount.textContent = `共 ${data.length} 条记录`;
  importModal.style.display = 'flex';
}

function hideImportModal() {
  importModal.style.display = 'none';
  state.importData = null;
}

function handleImportConfirm() {
  if (state.importData && state.importData.length > 0) {
    ExpenseManager.addBatch(state.importData);
    hideImportModal();
    render();
  }
}

// ── Rendering ──
function render() {
  renderMonthDisplay();
  const expenses = ExpenseManager.getByMonth(state.currentYear, state.currentMonth);
  renderDashboard(expenses);
  renderBudget(expenses);
  renderListOnly();
  renderPieChart(expenses);
  renderBarChart();
}

function renderListOnly() {
  const expenses = ExpenseManager.getByMonth(state.currentYear, state.currentMonth);
  renderList(expenses);
}

function renderMonthDisplay() {
  currentMonthDisplay.textContent = `${state.currentYear}年${state.currentMonth + 1}月`;
}

function renderDashboard(expenses) {
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  const count = expenses.length;
  const daysInMonth = new Date(state.currentYear, state.currentMonth + 1, 0).getDate();
  const avg = count > 0 ? total / daysInMonth : 0;

  totalExpense.textContent = `¥${total.toFixed(2)}`;
  totalCount.textContent = count;
  dailyAvg.textContent = `¥${avg.toFixed(2)}`;
}

function renderBudget(expenses) {
  const budget = BudgetManager.get();
  if (!budget) {
    budgetBarWrap.style.display = 'none';
    budgetSetBtn.textContent = '设置';
    return;
  }

  budgetSetBtn.textContent = '修改';
  budgetBarWrap.style.display = 'block';
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  const pct = Math.min((total / budget.monthly) * 100, 100);
  const isOver = total > budget.monthly;

  budgetBarFill.style.width = `${pct}%`;
  budgetBarFill.className = 'budget-bar-fill' + (isOver ? ' over-budget' : '');
  budgetText.textContent = `¥${total.toFixed(0)} / ¥${budget.monthly.toFixed(0)}${isOver ? ' (超出预算!)' : ` (${pct.toFixed(0)}%)`}`;
}

function renderList(expenses) {
  let filtered = expenses;
  if (state.searchQuery) {
    const q = state.searchQuery.toLowerCase();
    filtered = expenses.filter(e => (e.note || '').toLowerCase().includes(q));
  }

  if (filtered.length === 0) {
    const msg = state.searchQuery ? '没有匹配的记录' : '还没有支出记录，开始记账吧';
    expenseList.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">${state.searchQuery ? '🔍' : '📝'}</div>
        <p>${msg}</p>
      </div>`;
    return;
  }

  const sorted = [...filtered].sort((a, b) => {
    const dateCmp = b.date.localeCompare(a.date);
    if (dateCmp !== 0) return dateCmp;
    return b.id.localeCompare(a.id);
  });

  expenseList.innerHTML = sorted.map(expense => {
    const cat = CATEGORIES.find(c => c.name === expense.category) || CATEGORIES[7];
    return `
      <div class="expense-item" data-id="${expense.id}">
        <span class="category-tag" style="background:${cat.color}">${cat.icon} ${cat.name}</span>
        <div class="expense-info">
          <div class="expense-amount">¥${expense.amount.toFixed(2)}</div>
          ${expense.note ? `<div class="expense-note">${escapeHtml(expense.note)}</div>` : ''}
        </div>
        <span class="expense-date">${formatDate(expense.date)}</span>
        <div class="expense-actions">
          <button class="btn-delete" data-delete="${expense.id}" title="删除">✕</button>
        </div>
      </div>`;
  }).join('');

  expenseList.querySelectorAll('.expense-item').forEach(item => {
    item.addEventListener('click', (e) => {
      if (e.target.closest('.btn-delete')) return;
      startEdit(item.dataset.id);
    });
  });

  expenseList.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      showDeleteModal(btn.dataset.delete);
    });
  });
}

// ── Pie Chart ──
let pieSlices = [];

function renderPieChart(expenses) {
  const ctx = pieCanvas.getContext('2d');
  const w = pieCanvas.width;
  const h = pieCanvas.height;
  ctx.clearRect(0, 0, w, h);
  pieSlices = [];

  if (expenses.length === 0) {
    const container = $('#pie-chart-container');
    // Show empty via clearing canvas - the chart-empty is rendered inline
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-placeholder').trim() || '#adb5bd';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('当月无数据', w / 2, h / 2);
    return;
  }

  // Aggregate by category
  const catTotals = {};
  let grandTotal = 0;
  expenses.forEach(e => {
    catTotals[e.category] = (catTotals[e.category] || 0) + e.amount;
    grandTotal += e.amount;
  });

  const entries = Object.entries(catTotals).sort((a, b) => b[1] - a[1]);
  const cx = w / 2;
  const cy = h / 2;
  const radius = Math.min(cx, cy) - 30;
  let startAngle = -Math.PI / 2;

  entries.forEach(([catName, total]) => {
    const cat = CATEGORIES.find(c => c.name === catName) || CATEGORIES[7];
    const sliceAngle = (total / grandTotal) * 2 * Math.PI;
    const endAngle = startAngle + sliceAngle;

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = cat.color;
    ctx.fill();

    // Label
    const pct = ((total / grandTotal) * 100).toFixed(1);
    if (parseFloat(pct) >= 5) {
      const midAngle = startAngle + sliceAngle / 2;
      const labelR = radius * 0.65;
      const lx = cx + Math.cos(midAngle) * labelR;
      const ly = cy + Math.sin(midAngle) * labelR;
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${catName}`, lx, ly - 7);
      ctx.font = '11px sans-serif';
      ctx.fillText(`${pct}%`, lx, ly + 8);
    }

    pieSlices.push({
      startAngle, endAngle, cx, cy, radius,
      catName, total, pct: ((total / grandTotal) * 100).toFixed(1),
      color: cat.color, icon: cat.icon,
    });

    startAngle = endAngle;
  });
}

function handlePieHover(e) {
  const rect = pieCanvas.getBoundingClientRect();
  const scaleX = pieCanvas.width / rect.width;
  const scaleY = pieCanvas.height / rect.height;
  const mx = (e.clientX - rect.left) * scaleX;
  const my = (e.clientY - rect.top) * scaleY;

  for (const s of pieSlices) {
    const dx = mx - s.cx;
    const dy = my - s.cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > s.radius) continue;

    let angle = Math.atan2(dy, dx);
    if (angle < -Math.PI / 2) angle += 2 * Math.PI;

    if (angle >= s.startAngle && angle < s.endAngle) {
      pieTooltip.textContent = `${s.icon} ${s.catName}: ¥${s.total.toFixed(2)} (${s.pct}%)`;
      pieTooltip.style.display = 'block';
      pieTooltip.style.left = (e.clientX - rect.left + 12) + 'px';
      pieTooltip.style.top = (e.clientY - rect.top - 10) + 'px';
      return;
    }
  }
  pieTooltip.style.display = 'none';
}

// ── Bar Chart ──
function renderBarChart() {
  const ctx = barCanvas.getContext('2d');
  const w = barCanvas.width;
  const h = barCanvas.height;
  ctx.clearRect(0, 0, w, h);

  // Collect last 6 months data
  const months = [];
  let y = state.currentYear;
  let m = state.currentMonth;
  for (let i = 0; i < 6; i++) {
    const expenses = ExpenseManager.getByMonth(y, m);
    const total = expenses.reduce((s, e) => s + e.amount, 0);
    months.unshift({ year: y, month: m, total, label: `${m + 1}月` });
    m--;
    if (m < 0) { m = 11; y--; }
  }

  const hasData = months.some(m => m.total > 0);
  if (!hasData) {
    const textColor = getComputedStyle(document.documentElement).getPropertyValue('--text-placeholder').trim() || '#adb5bd';
    ctx.fillStyle = textColor;
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('暂无数据', w / 2, h / 2);
    return;
  }

  const maxVal = Math.max(...months.map(m => m.total), 1);
  const padding = { top: 20, right: 20, bottom: 35, left: 50 };
  const chartW = w - padding.left - padding.right;
  const chartH = h - padding.top - padding.bottom;
  const barW = chartW / 6 * 0.6;
  const gap = chartW / 6;

  const textColor = getComputedStyle(document.documentElement).getPropertyValue('--text-muted').trim() || '#868e96';
  const gridColor = getComputedStyle(document.documentElement).getPropertyValue('--border-color').trim() || '#dde1e6';

  // Grid lines
  ctx.strokeStyle = gridColor;
  ctx.lineWidth = 0.5;
  for (let i = 0; i <= 4; i++) {
    const gy = padding.top + (chartH / 4) * i;
    ctx.beginPath();
    ctx.moveTo(padding.left, gy);
    ctx.lineTo(w - padding.right, gy);
    ctx.stroke();
  }

  // Y-axis labels
  ctx.fillStyle = textColor;
  ctx.font = '10px sans-serif';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  for (let i = 0; i <= 4; i++) {
    const gy = padding.top + (chartH / 4) * i;
    const val = maxVal - (maxVal / 4) * i;
    ctx.fillText(formatAmount(val), padding.left - 6, gy);
  }

  // Bars
  months.forEach((m, i) => {
    const barH = m.total > 0 ? (m.total / maxVal) * chartH : 0;
    const x = padding.left + gap * i + (gap - barW) / 2;
    const y = padding.top + chartH - barH;

    // Highlight current month
    const isCurrent = i === 5;
    ctx.fillStyle = isCurrent ? '#4f6ef7' : '#a5b4fc';
    ctx.beginPath();
    ctx.roundRect(x, y, barW, barH, [4, 4, 0, 0]);
    ctx.fill();

    // Amount above bar
    if (m.total > 0) {
      ctx.fillStyle = textColor;
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`¥${formatAmount(m.total)}`, x + barW / 2, y - 6);
    }

    // Month label
    ctx.fillStyle = textColor;
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(m.label, x + barW / 2, padding.top + chartH + 18);
  });
}

function formatAmount(val) {
  if (val >= 10000) return (val / 10000).toFixed(1) + 'w';
  if (val >= 1000) return (val / 1000).toFixed(1) + 'k';
  return val.toFixed(0);
}

// ── Utilities ──
function formatDate(dateStr) {
  const [y, m, d] = dateStr.split('-');
  return `${parseInt(m)}月${parseInt(d)}日`;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ── Boot ──
document.addEventListener('DOMContentLoaded', init);
