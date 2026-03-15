// Kanban Board - app.js
// Pure vanilla JS, no frameworks

(function () {
  'use strict';

  var STORAGE_KEY = 'kanban-board-data';

  // Default board state
  var DEFAULT_DATA = {
    todo: [],
    inprogress: [],
    done: []
  };

  // ---- Data Layer ----

  function loadData() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (parsed.todo && parsed.inprogress && parsed.done) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to load data from localStorage:', e);
    }
    return JSON.parse(JSON.stringify(DEFAULT_DATA));
  }

  function saveData(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Failed to save data to localStorage:', e);
    }
  }

  function generateId() {
    return Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 9);
  }

  // ---- State ----

  var boardData = loadData();
  var undoStack = [];
  var currentSearchTerm = '';
  var editingCardId = null;

  // ---- Undo System ----

  function pushUndo(action) {
    undoStack.push(action);
    // Keep stack reasonable
    if (undoStack.length > 50) {
      undoStack.shift();
    }
  }

  function performUndo() {
    if (undoStack.length === 0) return;

    var action = undoStack.pop();

    if (action.type === 'delete') {
      // Restore deleted card to its column at its original index
      if (!boardData[action.column]) {
        boardData[action.column] = [];
      }
      var idx = Math.min(action.index, boardData[action.column].length);
      boardData[action.column].splice(idx, 0, action.card);
      saveData(boardData);
      renderBoard();
    } else if (action.type === 'move') {
      // Move card back from target to source
      var cardIdx = boardData[action.toColumn].findIndex(function (c) { return c.id === action.cardId; });
      if (cardIdx !== -1) {
        var card = boardData[action.toColumn].splice(cardIdx, 1)[0];
        if (!boardData[action.fromColumn]) {
          boardData[action.fromColumn] = [];
        }
        var restoreIdx = Math.min(action.fromIndex, boardData[action.fromColumn].length);
        boardData[action.fromColumn].splice(restoreIdx, 0, card);
        saveData(boardData);
        renderBoard();
      }
    } else if (action.type === 'edit') {
      // Restore previous card values
      var found = findCard(action.cardId);
      if (found) {
        found.card.title = action.oldTitle;
        found.card.description = action.oldDescription;
        found.card.priority = action.oldPriority;
        saveData(boardData);
        renderBoard();
      }
    }
  }

  // ---- Helpers ----

  function findCard(cardId) {
    for (var col in boardData) {
      if (boardData.hasOwnProperty(col)) {
        for (var i = 0; i < boardData[col].length; i++) {
          if (boardData[col][i].id === cardId) {
            return { card: boardData[col][i], column: col, index: i };
          }
        }
      }
    }
    return null;
  }

  // ---- Rendering ----

  function createCardElement(card) {
    var el = document.createElement('div');
    el.className = 'card';
    if (card.priority) {
      el.classList.add('priority-' + card.priority);
    }
    el.draggable = true;
    el.dataset.id = card.id;

    // Priority badge
    if (card.priority) {
      var badgeEl = document.createElement('span');
      badgeEl.className = 'card-priority-badge badge-' + card.priority;
      var labels = { high: 'High', medium: 'Medium', low: 'Low' };
      badgeEl.textContent = labels[card.priority] || card.priority;
      el.appendChild(badgeEl);
    }

    var titleEl = document.createElement('div');
    titleEl.className = 'card-title';
    titleEl.textContent = card.title;

    var deleteBtn = document.createElement('button');
    deleteBtn.className = 'card-delete';
    deleteBtn.textContent = '\u00d7';
    deleteBtn.title = 'Delete card';
    deleteBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      deleteCard(card.id);
    });

    el.appendChild(titleEl);

    if (card.description) {
      var descEl = document.createElement('div');
      descEl.className = 'card-description';
      descEl.textContent = card.description;
      el.appendChild(descEl);
    }

    el.appendChild(deleteBtn);

    // Click to edit
    el.addEventListener('click', function (e) {
      if (e.target.classList.contains('card-delete')) return;
      openEditModal(card.id);
    });

    // Drag events
    el.addEventListener('dragstart', handleDragStart);
    el.addEventListener('dragend', handleDragEnd);

    // Apply search filter
    if (currentSearchTerm) {
      var term = currentSearchTerm.toLowerCase();
      var matchTitle = card.title.toLowerCase().indexOf(term) !== -1;
      var matchDesc = card.description && card.description.toLowerCase().indexOf(term) !== -1;
      if (!matchTitle && !matchDesc) {
        el.classList.add('filtered-out');
      }
    }

    return el;
  }

  function renderColumn(columnId) {
    var listEl = document.getElementById(columnId + '-list');
    if (!listEl) return;

    listEl.innerHTML = '';
    var cards = boardData[columnId] || [];
    cards.forEach(function (card) {
      listEl.appendChild(createCardElement(card));
    });

    updateCardCount(columnId);
  }

  function renderBoard() {
    renderColumn('todo');
    renderColumn('inprogress');
    renderColumn('done');
  }

  // ---- Card Count ----

  function updateCardCount(columnId) {
    var countEl = document.getElementById(columnId + '-count');
    if (countEl) {
      var count = (boardData[columnId] || []).length;
      countEl.textContent = '(' + count + ')';
    }
  }

  function updateAllCounts() {
    updateCardCount('todo');
    updateCardCount('inprogress');
    updateCardCount('done');
  }

  // ---- Card Operations ----

  function addCard(columnId, title, description, priority) {
    var card = {
      id: generateId(),
      title: title.trim(),
      description: (description || '').trim(),
      priority: priority || ''
    };

    if (!boardData[columnId]) {
      boardData[columnId] = [];
    }
    boardData[columnId].push(card);
    saveData(boardData);
    renderColumn(columnId);
  }

  function deleteCard(cardId) {
    for (var col in boardData) {
      if (boardData.hasOwnProperty(col)) {
        var idx = boardData[col].findIndex(function (c) { return c.id === cardId; });
        if (idx !== -1) {
          var card = boardData[col][idx];
          pushUndo({ type: 'delete', card: JSON.parse(JSON.stringify(card)), column: col, index: idx });
          boardData[col].splice(idx, 1);
          saveData(boardData);
          renderColumn(col);
          return;
        }
      }
    }
  }

  function moveCard(cardId, targetColumnId) {
    var card = null;
    var sourceCol = null;
    var sourceIdx = -1;

    for (var col in boardData) {
      if (boardData.hasOwnProperty(col)) {
        var idx = boardData[col].findIndex(function (c) { return c.id === cardId; });
        if (idx !== -1) {
          sourceIdx = idx;
          card = boardData[col].splice(idx, 1)[0];
          sourceCol = col;
          break;
        }
      }
    }

    if (card && targetColumnId !== sourceCol) {
      pushUndo({ type: 'move', cardId: cardId, fromColumn: sourceCol, toColumn: targetColumnId, fromIndex: sourceIdx });
      if (!boardData[targetColumnId]) {
        boardData[targetColumnId] = [];
      }
      boardData[targetColumnId].push(card);
      saveData(boardData);
      renderBoard();
    } else if (card && targetColumnId === sourceCol) {
      // Put it back
      boardData[sourceCol].splice(sourceIdx, 0, card);
    }
  }

  // ---- Edit Card Modal ----

  function openEditModal(cardId) {
    var found = findCard(cardId);
    if (!found) return;

    editingCardId = cardId;
    var card = found.card;

    document.getElementById('edit-title').value = card.title;
    document.getElementById('edit-description').value = card.description || '';
    document.getElementById('edit-priority').value = card.priority || '';
    document.getElementById('edit-modal').classList.remove('hidden');

    // Focus title
    setTimeout(function () {
      document.getElementById('edit-title').focus();
    }, 50);
  }

  function closeEditModal() {
    document.getElementById('edit-modal').classList.add('hidden');
    editingCardId = null;
  }

  function saveEditModal() {
    if (!editingCardId) return;

    var found = findCard(editingCardId);
    if (!found) {
      closeEditModal();
      return;
    }

    var newTitle = document.getElementById('edit-title').value.trim();
    if (!newTitle) {
      document.getElementById('edit-title').style.borderColor = '#e74c3c';
      document.getElementById('edit-title').focus();
      return;
    }

    var newDesc = document.getElementById('edit-description').value.trim();
    var newPriority = document.getElementById('edit-priority').value;
    var card = found.card;

    // Push undo for edit
    pushUndo({
      type: 'edit',
      cardId: editingCardId,
      oldTitle: card.title,
      oldDescription: card.description,
      oldPriority: card.priority
    });

    card.title = newTitle;
    card.description = newDesc;
    card.priority = newPriority;

    saveData(boardData);
    renderBoard();
    closeEditModal();
  }

  function setupEditModal() {
    document.getElementById('edit-modal-close').addEventListener('click', closeEditModal);
    document.getElementById('edit-cancel').addEventListener('click', closeEditModal);
    document.getElementById('edit-save').addEventListener('click', saveEditModal);

    // Close on overlay click
    document.getElementById('edit-modal').addEventListener('click', function (e) {
      if (e.target === this) {
        closeEditModal();
      }
    });

    // Close on Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !document.getElementById('edit-modal').classList.contains('hidden')) {
        closeEditModal();
      }
    });

    // Reset border color on input
    document.getElementById('edit-title').addEventListener('input', function () {
      this.style.borderColor = '';
    });
  }

  // ---- Search / Filter ----

  function applySearchFilter(term) {
    currentSearchTerm = term;
    renderBoard();
  }

  function setupSearch() {
    var searchInput = document.getElementById('search-input');
    if (!searchInput) return;

    searchInput.addEventListener('input', function () {
      applySearchFilter(this.value.trim());
    });
  }

  // ---- Export / Import ----

  function exportBoard() {
    var dataStr = JSON.stringify(boardData, null, 2);
    var blob = new Blob([dataStr], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'kanban-board-export.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function importBoard(file) {
    var reader = new FileReader();
    reader.onload = function (e) {
      try {
        var imported = JSON.parse(e.target.result);
        if (imported.todo && imported.inprogress && imported.done) {
          if (confirm('This will replace all current board data. Continue?')) {
            boardData = imported;
            saveData(boardData);
            undoStack = [];
            renderBoard();
          }
        } else {
          alert('Invalid Kanban Board file format. Expected todo, inprogress, and done arrays.');
        }
      } catch (err) {
        alert('Failed to parse JSON file: ' + err.message);
      }
    };
    reader.readAsText(file);
  }

  function setupExportImport() {
    var exportBtn = document.getElementById('export-btn');
    var importBtn = document.getElementById('import-btn');
    var importFile = document.getElementById('import-file');

    if (exportBtn) {
      exportBtn.addEventListener('click', exportBoard);
    }

    if (importBtn && importFile) {
      importBtn.addEventListener('click', function () {
        importFile.click();
      });

      importFile.addEventListener('change', function () {
        if (this.files && this.files[0]) {
          importBoard(this.files[0]);
          this.value = '';
        }
      });
    }
  }

  // ---- Drag & Drop ----

  var draggedCardId = null;

  function handleDragStart(e) {
    var cardEl = e.target.closest('.card');
    if (!cardEl) return;
    draggedCardId = cardEl.dataset.id;
    cardEl.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', draggedCardId);
  }

  function handleDragEnd(e) {
    var cardEl = e.target.closest('.card');
    if (cardEl) {
      cardEl.classList.remove('dragging');
    }
    draggedCardId = null;
    document.querySelectorAll('.column').forEach(function (col) {
      col.classList.remove('drag-over');
    });
  }

  function handleColumnDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    var column = e.target.closest('.column');
    if (column) {
      column.classList.add('drag-over');
    }
  }

  function handleColumnDragLeave(e) {
    var column = e.target.closest('.column');
    if (column) {
      var rect = column.getBoundingClientRect();
      if (e.clientX < rect.left || e.clientX > rect.right ||
          e.clientY < rect.top || e.clientY > rect.bottom) {
        column.classList.remove('drag-over');
      }
    }
  }

  function handleColumnDrop(e) {
    e.preventDefault();
    var column = e.target.closest('.column');
    if (column) {
      column.classList.remove('drag-over');
      var cardId = e.dataTransfer.getData('text/plain');
      var targetStatus = column.dataset.status;
      if (cardId && targetStatus) {
        moveCard(cardId, targetStatus);
      }
    }
  }

  // ---- Add Card Form ----

  function setupAddCardForms() {
    document.querySelectorAll('.add-card-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var columnEl = btn.closest('.column');
        var form = columnEl.querySelector('.add-card-form');
        form.classList.remove('hidden');
        btn.classList.add('hidden');
        form.querySelector('.card-title-input').focus();
      });
    });

    document.querySelectorAll('.add-card-form').forEach(function (form) {
      var column = form.closest('.column');
      var columnId = column.dataset.status;
      var addBtn = column.querySelector('.add-card-btn');
      var titleInput = form.querySelector('.card-title-input');
      var descInput = form.querySelector('.card-desc-input');
      var priorityInput = form.querySelector('.card-priority-input');
      var confirmBtn = form.querySelector('.btn-confirm');
      var cancelBtn = form.querySelector('.btn-cancel');

      function submitForm() {
        var title = titleInput.value.trim();
        if (!title) {
          titleInput.focus();
          titleInput.style.borderColor = '#e74c3c';
          return;
        }
        var priority = priorityInput ? priorityInput.value : '';
        addCard(columnId, title, descInput.value, priority);
        titleInput.value = '';
        descInput.value = '';
        if (priorityInput) priorityInput.value = 'medium';
        titleInput.style.borderColor = '';
        form.classList.add('hidden');
        addBtn.classList.remove('hidden');
      }

      function cancelForm() {
        titleInput.value = '';
        descInput.value = '';
        if (priorityInput) priorityInput.value = 'medium';
        titleInput.style.borderColor = '';
        form.classList.add('hidden');
        addBtn.classList.remove('hidden');
      }

      confirmBtn.addEventListener('click', submitForm);
      cancelBtn.addEventListener('click', cancelForm);

      titleInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          submitForm();
        }
        if (e.key === 'Escape') {
          cancelForm();
        }
      });

      titleInput.addEventListener('input', function () {
        titleInput.style.borderColor = '';
      });
    });
  }

  // ---- Setup Drag & Drop on Columns ----

  function setupDragDrop() {
    document.querySelectorAll('.column').forEach(function (col) {
      col.addEventListener('dragover', handleColumnDragOver);
      col.addEventListener('dragleave', handleColumnDragLeave);
      col.addEventListener('drop', handleColumnDrop);
    });
  }

  // ---- Keyboard Shortcuts ----

  function setupKeyboard() {
    document.addEventListener('keydown', function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        // Don't undo if typing in an input
        var tag = document.activeElement.tagName.toLowerCase();
        if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

        e.preventDefault();
        performUndo();
      }
    });
  }

  // ---- Init ----

  function init() {
    renderBoard();
    setupAddCardForms();
    setupDragDrop();
    setupEditModal();
    setupSearch();
    setupExportImport();
    setupKeyboard();
  }

  // Wait for DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
