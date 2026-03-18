(function () {
  'use strict';

  // --- DOM refs ---
  var regexInput = document.getElementById('regex-input');
  var testString = document.getElementById('test-string');
  var highlightLayer = document.getElementById('highlight-layer');
  var errorMessage = document.getElementById('error-message');
  var matchCount = document.getElementById('match-count');
  var matchList = document.getElementById('match-list');
  var flagsContainer = document.getElementById('flags');

  var replaceToggle = document.getElementById('replace-toggle');
  var replaceInputRow = document.getElementById('replace-input-row');
  var replaceInput = document.getElementById('replace-input');
  var replacePreviewSection = document.getElementById('replace-preview-section');
  var replacePreview = document.getElementById('replace-preview');

  var cheatsheetToggle = document.getElementById('cheatsheet-toggle');
  var cheatsheetPanel = document.getElementById('cheatsheet-panel');
  var cheatsheetClose = document.getElementById('cheatsheet-close');

  var historyToggle = document.getElementById('history-toggle');
  var historyPanel = document.getElementById('history-panel');
  var historyClose = document.getElementById('history-close');
  var historyClear = document.getElementById('history-clear');
  var historyList = document.getElementById('history-list');

  var quickPatterns = document.getElementById('quick-patterns');

  // --- Flags ---

  function getFlags() {
    var btns = flagsContainer.querySelectorAll('.flag-btn.active');
    return Array.from(btns).map(function (b) { return b.dataset.flag; }).join('');
  }

  function setFlags(flagStr) {
    var btns = flagsContainer.querySelectorAll('.flag-btn');
    btns.forEach(function (btn) {
      if (flagStr.indexOf(btn.dataset.flag) !== -1) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  flagsContainer.addEventListener('click', function (e) {
    var btn = e.target.closest('.flag-btn');
    if (!btn) return;
    btn.classList.toggle('active');
    runMatch();
  });

  // --- Quick patterns ---

  quickPatterns.addEventListener('click', function (e) {
    var btn = e.target.closest('.pattern-btn');
    if (!btn) return;
    regexInput.value = btn.dataset.pattern;
    regexInput.focus();
    runMatch();
  });

  // --- Replace mode ---

  replaceToggle.addEventListener('change', function () {
    var on = replaceToggle.checked;
    replaceInputRow.hidden = !on;
    replacePreviewSection.hidden = !on;
    if (!on) {
      replacePreview.textContent = '';
    }
    runMatch();
  });

  replaceInput.addEventListener('input', function () {
    updateReplacePreview();
  });

  // --- Panels ---

  cheatsheetToggle.addEventListener('click', function () {
    var show = cheatsheetPanel.hidden;
    cheatsheetPanel.hidden = !show;
    historyPanel.hidden = true;
    cheatsheetToggle.classList.toggle('active', show);
    historyToggle.classList.remove('active');
  });

  cheatsheetClose.addEventListener('click', function () {
    cheatsheetPanel.hidden = true;
    cheatsheetToggle.classList.remove('active');
  });

  historyToggle.addEventListener('click', function () {
    var show = historyPanel.hidden;
    historyPanel.hidden = !show;
    cheatsheetPanel.hidden = true;
    historyToggle.classList.toggle('active', show);
    cheatsheetToggle.classList.remove('active');
    if (show) renderHistory();
  });

  historyClose.addEventListener('click', function () {
    historyPanel.hidden = true;
    historyToggle.classList.remove('active');
  });

  // --- Scroll sync ---

  testString.addEventListener('scroll', function () {
    highlightLayer.scrollTop = testString.scrollTop;
    highlightLayer.scrollLeft = testString.scrollLeft;
  });

  // --- History (localStorage) ---

  var HISTORY_KEY = 'regex_tester_history';
  var MAX_HISTORY = 20;

  function loadHistory() {
    try {
      return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  function saveHistory(list) {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
    } catch (e) { /* quota exceeded, ignore */ }
  }

  function addToHistory(pattern, flags) {
    if (!pattern) return;
    var list = loadHistory();
    // Remove duplicate
    list = list.filter(function (item) {
      return !(item.pattern === pattern && item.flags === flags);
    });
    list.unshift({ pattern: pattern, flags: flags, time: Date.now() });
    if (list.length > MAX_HISTORY) list = list.slice(0, MAX_HISTORY);
    saveHistory(list);
  }

  function renderHistory() {
    var list = loadHistory();
    if (list.length === 0) {
      historyList.innerHTML = '<p class="history-empty">No history yet</p>';
      return;
    }
    var html = '';
    list.forEach(function (item, idx) {
      html += '<div class="history-item" data-idx="' + idx + '">';
      html += '<span class="history-item-pattern">' + escapeHtml(item.pattern) + '</span>';
      html += '<span class="history-item-flags">' + escapeHtml(item.flags) + '</span>';
      html += '<button class="history-item-delete" data-idx="' + idx + '" title="Delete">&times;</button>';
      html += '</div>';
    });
    historyList.innerHTML = html;
  }

  historyList.addEventListener('click', function (e) {
    // Delete button
    var delBtn = e.target.closest('.history-item-delete');
    if (delBtn) {
      e.stopPropagation();
      var idx = parseInt(delBtn.dataset.idx, 10);
      var list = loadHistory();
      list.splice(idx, 1);
      saveHistory(list);
      renderHistory();
      return;
    }
    // Click on item to restore
    var item = e.target.closest('.history-item');
    if (item) {
      var i = parseInt(item.dataset.idx, 10);
      var list = loadHistory();
      if (list[i]) {
        regexInput.value = list[i].pattern;
        setFlags(list[i].flags);
        runMatch();
      }
    }
  });

  historyClear.addEventListener('click', function () {
    saveHistory([]);
    renderHistory();
  });

  // --- Debounced history save ---
  var historySaveTimer = null;

  function scheduleHistorySave() {
    clearTimeout(historySaveTimer);
    historySaveTimer = setTimeout(function () {
      var pattern = regexInput.value;
      var flags = getFlags();
      if (pattern) addToHistory(pattern, flags);
    }, 1500);
  }

  // --- Core matching ---

  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function friendlyError(msg) {
    return msg
      .replace(/^Invalid regular expression: /, '')
      .replace(/\/.*?\/: /, '');
  }

  var lastValidRegex = null;
  var lastMatches = [];

  function runMatch() {
    var pattern = regexInput.value;
    var text = testString.value;

    // Clear error
    errorMessage.hidden = true;
    errorMessage.textContent = '';

    if (!pattern) {
      highlightLayer.innerHTML = escapeHtml(text);
      matchCount.textContent = 'No matches';
      matchCount.classList.remove('has-matches');
      matchList.innerHTML = '';
      lastValidRegex = null;
      lastMatches = [];
      updateReplacePreview();
      return;
    }

    // Try to create regex
    var regex;
    try {
      regex = new RegExp(pattern, getFlags());
    } catch (e) {
      errorMessage.textContent = friendlyError(e.message);
      errorMessage.hidden = false;
      highlightLayer.innerHTML = escapeHtml(text);
      matchCount.textContent = 'Invalid pattern';
      matchCount.classList.remove('has-matches');
      matchList.innerHTML = '';
      lastValidRegex = null;
      lastMatches = [];
      updateReplacePreview();
      return;
    }

    lastValidRegex = { pattern: pattern, flags: getFlags() };

    if (!text) {
      highlightLayer.innerHTML = '';
      matchCount.textContent = 'No matches';
      matchCount.classList.remove('has-matches');
      matchList.innerHTML = '';
      lastMatches = [];
      updateReplacePreview();
      scheduleHistorySave();
      return;
    }

    // Collect all matches
    var matches = [];
    var isGlobal = regex.global;

    if (isGlobal) {
      var m;
      while ((m = regex.exec(text)) !== null) {
        matches.push(m);
        if (m.index === regex.lastIndex) {
          regex.lastIndex++;
        }
      }
    } else {
      var m = regex.exec(text);
      if (m) matches.push(m);
    }

    lastMatches = matches;

    // Build highlight
    if (matches.length === 0) {
      highlightLayer.innerHTML = escapeHtml(text);
      matchCount.textContent = 'No matches';
      matchCount.classList.remove('has-matches');
      matchList.innerHTML = '';
      updateReplacePreview();
      scheduleHistorySave();
      return;
    }

    var html = '';
    var lastIdx = 0;
    for (var mi = 0; mi < matches.length; mi++) {
      var mat = matches[mi];
      var start = mat.index;
      var end = start + mat[0].length;
      html += escapeHtml(text.slice(lastIdx, start));
      html += '<mark>' + escapeHtml(text.slice(start, end)) + '</mark>';
      lastIdx = end;
    }
    html += escapeHtml(text.slice(lastIdx));
    highlightLayer.innerHTML = html;

    // Match count
    var count = matches.length;
    matchCount.textContent = count + (count === 1 ? ' match found' : ' matches found');
    matchCount.classList.add('has-matches');

    // Match details
    var detailsHtml = '';
    matches.forEach(function (mat, idx) {
      var start = mat.index;
      var end = start + mat[0].length;

      detailsHtml += '<div class="match-item">';
      detailsHtml += '<div class="match-item-header">';
      detailsHtml += '<span class="match-label">Match ' + (idx + 1) + '</span>';
      detailsHtml += '<span class="match-index">Index ' + start + '-' + end + '</span>';
      detailsHtml += '</div>';
      detailsHtml += '<div class="match-text">' + escapeHtml(mat[0]) + '</div>';

      if (mat.length > 1) {
        detailsHtml += '<div class="group-list">';
        for (var g = 1; g < mat.length; g++) {
          var val = mat[g];
          detailsHtml += '<div class="group-item">';
          detailsHtml += '<span class="group-label">Group ' + g + ':</span>';
          detailsHtml += '<span class="group-value">' + (val !== undefined ? escapeHtml(val) : 'undefined') + '</span>';
          detailsHtml += '</div>';
        }
        detailsHtml += '</div>';
      }

      detailsHtml += '</div>';
    });
    matchList.innerHTML = detailsHtml;

    updateReplacePreview();
    scheduleHistorySave();
  }

  // --- Replace preview ---

  function updateReplacePreview() {
    if (!replaceToggle.checked) return;
    if (!lastValidRegex) {
      replacePreview.textContent = testString.value;
      return;
    }
    var text = testString.value;
    if (!text) {
      replacePreview.textContent = '';
      return;
    }
    try {
      var regex = new RegExp(lastValidRegex.pattern, lastValidRegex.flags);
      var result = text.replace(regex, replaceInput.value);
      replacePreview.textContent = result;
    } catch (e) {
      replacePreview.textContent = text;
    }
  }

  // --- Event listeners ---

  regexInput.addEventListener('input', runMatch);
  testString.addEventListener('input', runMatch);

  // Initial run
  runMatch();
})();
