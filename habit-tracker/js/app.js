/**
 * app.js - Main application logic for Habit Tracker
 */

// eslint-disable-next-line no-unused-vars
var App = {
  init() {
    this.todayStr = new Date().toISOString().split('T')[0];
    this.currentView = 'list'; // 'list', 'detail', or 'stats'
    this.currentHabitId = null;
    this.pendingImportData = null;

    // Views
    this.listView = document.getElementById('list-view');
    this.detailView = document.getElementById('detail-view');
    this.statsView = document.getElementById('stats-view');

    // Nav
    this.navTabs = document.getElementById('nav-tabs');

    // List view elements
    this.habitList = document.getElementById('habit-list');
    this.emptyState = document.getElementById('empty-state');
    this.addBtn = document.getElementById('add-habit-btn');
    this.todayDate = document.getElementById('today-date');

    // Detail view elements
    this.backBtn = document.getElementById('back-btn');
    this.detailName = document.getElementById('detail-habit-name');
    this.detailColor = document.getElementById('detail-habit-color');
    this.heatmapContainer = document.getElementById('heatmap-container');
    this.statCurrent = document.getElementById('stat-current-streak');
    this.statLongest = document.getElementById('stat-longest-streak');
    this.statRate = document.getElementById('stat-completion-rate');
    this.statTotal = document.getElementById('stat-total-checkins');

    // Stats view elements
    this.aggTotalHabits = document.getElementById('agg-total-habits');
    this.aggOverallRate = document.getElementById('agg-overall-rate');
    this.aggBestStreak = document.getElementById('agg-best-streak');
    this.perHabitStats = document.getElementById('per-habit-stats');
    this.statsEmpty = document.getElementById('stats-empty');

    // Export/Import
    this.exportBtn = document.getElementById('export-btn');
    this.importBtn = document.getElementById('import-btn');
    this.importFile = document.getElementById('import-file');
    this.importConfirm = document.getElementById('import-confirm');
    this.confirmImportBtn = document.getElementById('confirm-import-btn');
    this.cancelImportBtn = document.getElementById('cancel-import-btn');

    // Modal elements
    this.modal = document.getElementById('habit-modal');
    this.modalTitle = document.getElementById('modal-title');
    this.habitForm = document.getElementById('habit-form');
    this.habitNameInput = document.getElementById('habit-name');
    this.habitColorInput = document.getElementById('habit-color');
    this.cancelBtn = document.getElementById('cancel-btn');
    this.deleteConfirm = document.getElementById('delete-confirm');
    this.deleteConfirmName = document.getElementById('delete-habit-name');
    this.confirmDeleteBtn = document.getElementById('confirm-delete-btn');
    this.cancelDeleteBtn = document.getElementById('cancel-delete-btn');

    this.editingHabitId = null;
    this.deletingHabitId = null;

    this._bindEvents();
    this._renderDate();
    this.render();
  },

  _bindEvents() {
    // Nav tabs
    this.navTabs.addEventListener('click', (e) => {
      const tab = e.target.closest('.nav-tab');
      if (!tab) return;
      const view = tab.dataset.view;
      if (view === 'list') this.showListView();
      else if (view === 'stats') this.showStatsView();
    });

    // List view
    this.addBtn.addEventListener('click', () => this.openModal());
    this.backBtn.addEventListener('click', () => this.showListView());

    // Modals
    this.cancelBtn.addEventListener('click', () => this.closeModal());
    this.habitForm.addEventListener('submit', (e) => this.handleSubmit(e));
    this.confirmDeleteBtn.addEventListener('click', () => this.confirmDelete());
    this.cancelDeleteBtn.addEventListener('click', () => this.closeDeleteConfirm());

    // Export/Import
    this.exportBtn.addEventListener('click', () => this.handleExport());
    this.importBtn.addEventListener('click', () => this.importFile.click());
    this.importFile.addEventListener('change', (e) => this.handleImportFile(e));
    this.confirmImportBtn.addEventListener('click', () => this.confirmImport());
    this.cancelImportBtn.addEventListener('click', () => this.closeImportConfirm());

    // Close modals on backdrop click
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) this.closeModal();
    });
    this.deleteConfirm.addEventListener('click', (e) => {
      if (e.target === this.deleteConfirm) this.closeDeleteConfirm();
    });
    this.importConfirm.addEventListener('click', (e) => {
      if (e.target === this.importConfirm) this.closeImportConfirm();
    });

    // Keyboard: Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (!this.modal.hidden) {
          this.closeModal();
        } else if (!this.deleteConfirm.hidden) {
          this.closeDeleteConfirm();
        } else if (!this.importConfirm.hidden) {
          this.closeImportConfirm();
        } else if (this.currentView === 'detail') {
          this.showListView();
        }
      }
    });
  },

  _renderDate() {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    this.todayDate.textContent = new Date().toLocaleDateString('en-US', options);
  },

  _updateNav(activeView) {
    this.navTabs.querySelectorAll('.nav-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.view === activeView);
    });
  },

  // --- View Navigation ---

  _hideAllViews() {
    this.listView.hidden = true;
    this.detailView.hidden = true;
    this.statsView.hidden = true;
  },

  showListView() {
    this.currentView = 'list';
    this.currentHabitId = null;
    this._hideAllViews();
    this.listView.hidden = false;
    this._updateNav('list');
    this.render();
  },

  showDetailView(habitId) {
    const habit = Store.getHabitById(habitId);
    if (!habit) return;

    this.currentView = 'detail';
    this.currentHabitId = habitId;
    this._hideAllViews();
    this.detailView.hidden = false;
    this._updateNav('list'); // detail is a sub-view of habits

    this.renderDetail(habit);
  },

  showStatsView() {
    this.currentView = 'stats';
    this._hideAllViews();
    this.statsView.hidden = false;
    this._updateNav('stats');
    this.renderStats();
  },

  // --- List View Rendering ---

  render() {
    const habits = Store.getHabits();
    this.habitList.innerHTML = '';

    if (habits.length === 0) {
      this.emptyState.hidden = false;
      return;
    }

    this.emptyState.hidden = true;

    habits.forEach(habit => {
      const isChecked = Store.isCheckedIn(habit.id, this.todayStr);
      const card = this._createHabitCard(habit, isChecked);
      this.habitList.appendChild(card);
    });
  },

  _createHabitCard(habit, isChecked) {
    const card = document.createElement('div');
    card.className = `habit-card${isChecked ? ' checked' : ''}`;
    card.dataset.habitId = habit.id;
    card.style.setProperty('--habit-color', habit.color);

    const escapedName = this._escapeHtml(habit.name);
    const escapedAttr = this._escapeAttr(habit.name);

    card.innerHTML = `
      <button class="checkin-btn${isChecked ? ' done' : ''}"
              aria-label="${isChecked ? 'Uncheck' : 'Check in'} ${escapedAttr}"
              title="${isChecked ? 'Uncheck' : 'Check in'}">
        <span class="check-icon">${isChecked ? '&#10003;' : ''}</span>
      </button>
      <div class="habit-info clickable">
        <span class="habit-name">${escapedName}</span>
        <span class="habit-color-dot" style="background:${habit.color}"></span>
      </div>
      <div class="habit-actions">
        <button class="edit-btn" aria-label="Edit ${escapedAttr}" title="Edit">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M11.013 1.427a1.75 1.75 0 012.474 0l1.086 1.086a1.75 1.75 0 010 2.474l-8.61 8.61c-.21.21-.47.364-.756.445l-3.251.93a.75.75 0 01-.927-.928l.929-3.25a1.75 1.75 0 01.445-.758l8.61-8.61zm1.414 1.06a.25.25 0 00-.354 0L3.463 11.098a.25.25 0 00-.064.108l-.631 2.208 2.208-.63a.25.25 0 00.108-.064l8.61-8.61a.25.25 0 000-.354l-1.086-1.086z"/>
          </svg>
        </button>
        <button class="delete-btn" aria-label="Delete ${escapedAttr}" title="Delete">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M6.5 1.75a.25.25 0 01.25-.25h2.5a.25.25 0 01.25.25V3h-3V1.75zm4.5 0V3h2.25a.75.75 0 010 1.5H2.75a.75.75 0 010-1.5H5V1.75C5 .784 5.784 0 6.75 0h2.5C10.216 0 11 .784 11 1.75zM4.496 6.675a.75.75 0 10-1.492.15l.66 6.6A1.75 1.75 0 005.405 15h5.19a1.75 1.75 0 001.741-1.575l.66-6.6a.75.75 0 00-1.492-.15l-.66 6.6a.25.25 0 01-.249.225h-5.19a.25.25 0 01-.249-.225l-.66-6.6z"/>
          </svg>
        </button>
      </div>
    `;

    card.querySelector('.checkin-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      Store.toggleCheckin(habit.id, this.todayStr);
      this.render();
    });

    card.querySelector('.habit-info').addEventListener('click', () => {
      this.showDetailView(habit.id);
    });

    card.querySelector('.edit-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      this.openModal(habit);
    });

    card.querySelector('.delete-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      this.openDeleteConfirm(habit);
    });

    return card;
  },

  // --- Detail View Rendering ---

  renderDetail(habit) {
    this.detailName.textContent = habit.name;
    this.detailColor.style.backgroundColor = habit.color;

    const checkins = Store.getCheckins(habit.id);
    const streaks = Store.getStreaks(habit.id);
    const rate = Store.getCompletionRate(habit.id);

    this.statCurrent.textContent = streaks.current;
    this.statLongest.textContent = streaks.longest;
    this.statRate.textContent = rate + '%';
    this.statTotal.textContent = checkins.length;

    Heatmap.render(this.heatmapContainer, checkins, habit.color);
  },

  // --- Stats View Rendering ---

  renderStats() {
    const overall = Store.getOverallStats();
    this.aggTotalHabits.textContent = overall.totalHabits;
    this.aggOverallRate.textContent = overall.overallRate + '%';
    this.aggBestStreak.textContent = overall.bestStreak;

    const allStats = Store.getAllHabitStats();
    this.perHabitStats.innerHTML = '';

    if (allStats.length === 0) {
      this.statsEmpty.hidden = false;
      return;
    }

    this.statsEmpty.hidden = true;

    allStats.forEach(({ habit, checkins, rate, streaks }) => {
      const row = document.createElement('div');
      row.className = 'habit-stat-row';
      row.innerHTML = `
        <div class="habit-stat-header">
          <span class="habit-color-dot" style="background:${habit.color}"></span>
          <span class="habit-stat-name">${this._escapeHtml(habit.name)}</span>
        </div>
        <div class="habit-stat-values">
          <div class="habit-stat-item">
            <span class="habit-stat-num">${rate}%</span>
            <span class="habit-stat-desc">Rate</span>
          </div>
          <div class="habit-stat-item">
            <span class="habit-stat-num">${checkins}</span>
            <span class="habit-stat-desc">Days</span>
          </div>
          <div class="habit-stat-item">
            <span class="habit-stat-num">${streaks.current}</span>
            <span class="habit-stat-desc">Current</span>
          </div>
          <div class="habit-stat-item">
            <span class="habit-stat-num">${streaks.longest}</span>
            <span class="habit-stat-desc">Best</span>
          </div>
        </div>
      `;
      this.perHabitStats.appendChild(row);
    });
  },

  // --- Export/Import ---

  handleExport() {
    const json = Store.exportData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'habit-tracker-data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  handleImportFile(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      this.pendingImportData = ev.target.result;
      this.importConfirm.hidden = false;
    };
    reader.readAsText(file);
    // Reset so same file can be selected again
    this.importFile.value = '';
  },

  confirmImport() {
    if (!this.pendingImportData) return;

    try {
      Store.importData(this.pendingImportData);
      this.pendingImportData = null;
      this.closeImportConfirm();
      // Refresh current view
      if (this.currentView === 'stats') {
        this.renderStats();
      } else {
        this.showListView();
      }
    } catch (err) {
      this.closeImportConfirm();
      this.pendingImportData = null;
      alert('Import failed: ' + err.message);
    }
  },

  closeImportConfirm() {
    this.importConfirm.hidden = true;
    this.pendingImportData = null;
  },

  // --- Modals ---

  openModal(habit) {
    if (habit) {
      this.editingHabitId = habit.id;
      this.modalTitle.textContent = 'Edit Habit';
      this.habitNameInput.value = habit.name;
      this.habitColorInput.value = habit.color;
    } else {
      this.editingHabitId = null;
      this.modalTitle.textContent = 'Add Habit';
      this.habitNameInput.value = '';
      this.habitColorInput.value = '#4CAF50';
    }
    this.modal.hidden = false;
    this.habitNameInput.focus();
  },

  closeModal() {
    this.modal.hidden = true;
    this.editingHabitId = null;
    this.habitForm.reset();
  },

  handleSubmit(e) {
    e.preventDefault();
    const name = this.habitNameInput.value.trim();
    const color = this.habitColorInput.value;

    if (!name) return;

    if (this.editingHabitId) {
      Store.updateHabit(this.editingHabitId, { name, color });
    } else {
      Store.addHabit(name, color);
    }

    this.closeModal();
    this.render();
  },

  openDeleteConfirm(habit) {
    this.deletingHabitId = habit.id;
    this.deleteConfirmName.textContent = habit.name;
    this.deleteConfirm.hidden = false;
  },

  closeDeleteConfirm() {
    this.deleteConfirm.hidden = true;
    this.deletingHabitId = null;
  },

  confirmDelete() {
    if (this.deletingHabitId) {
      Store.deleteHabit(this.deletingHabitId);
      this.closeDeleteConfirm();
      if (this.currentView === 'detail') {
        this.showListView();
      } else {
        this.render();
      }
    }
  },

  _escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },

  _escapeAttr(str) {
    return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());
