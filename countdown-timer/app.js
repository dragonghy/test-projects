(function () {
  'use strict';

  var STORAGE_KEY = 'countdown_events';

  // DOM elements
  var addBtn = document.getElementById('add-btn');
  var modalOverlay = document.getElementById('modal-overlay');
  var modalTitle = document.getElementById('modal-title');
  var cancelBtn = document.getElementById('cancel-btn');
  var submitBtn = document.getElementById('submit-btn');
  var form = document.getElementById('countdown-form');
  var nameInput = document.getElementById('event-name');
  var dateInput = document.getElementById('event-date');
  var editIdInput = document.getElementById('edit-id');
  var cardGrid = document.getElementById('card-grid');
  var emptyState = document.getElementById('empty-state');
  var confettiCanvas = document.getElementById('confetti-canvas');
  var confettiCtx = confettiCanvas.getContext('2d');

  var events = loadEvents();
  var celebratedIds = {};

  // --- Preset definitions ---
  var PRESETS = {
    newyear: function () {
      var y = new Date().getFullYear() + 1;
      return { name: y + ' New Year', target: y + '-01-01T00:00', emoji: '🎉', color: '#e94560' };
    },
    valentines: function () {
      var y = new Date().getFullYear();
      var d = new Date(y, 1, 14);
      if (d < new Date()) d = new Date(y + 1, 1, 14);
      return { name: "Valentine's Day", target: formatDateLocal(d), emoji: '❤️', color: '#e94560' };
    },
    halloween: function () {
      var y = new Date().getFullYear();
      var d = new Date(y, 9, 31);
      if (d < new Date()) d = new Date(y + 1, 9, 31);
      return { name: 'Halloween', target: formatDateLocal(d), emoji: '🎃', color: '#c84b31' };
    },
    christmas: function () {
      var y = new Date().getFullYear();
      var d = new Date(y, 11, 25);
      if (d < new Date()) d = new Date(y + 1, 11, 25);
      return { name: 'Christmas', target: formatDateLocal(d), emoji: '🎄', color: '#1a936f' };
    },
    spring: function () {
      // Approximate Spring Festival (Chinese New Year) - late Jan/early Feb
      var y = new Date().getFullYear() + 1;
      return { name: y + ' Spring Festival', target: y + '-01-29T00:00', emoji: '🎉', color: '#e94560' };
    }
  };

  // --- URL sharing: check for shared event on load ---
  function checkSharedEvent() {
    var params = new URLSearchParams(window.location.search);
    var name = params.get('name');
    var target = params.get('target');
    if (name && target) {
      var emoji = params.get('emoji') || '';
      var color = params.get('color') || '';
      // Check if this shared event already exists
      var exists = events.some(function (e) {
        return e.name === name && e.target === target;
      });
      if (!exists) {
        var evt = {
          id: generateId(),
          name: name,
          target: target,
          emoji: emoji,
          color: color
        };
        events.push(evt);
        saveEvents();
      }
      // Clean URL without reload
      window.history.replaceState({}, '', window.location.pathname);
    }
  }

  // --- Storage ---
  function loadEvents() {
    try {
      var data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  function saveEvents() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  }

  // --- Sort events by target date (soonest first) ---
  function sortEvents() {
    events.sort(function (a, b) {
      return new Date(a.target).getTime() - new Date(b.target).getTime();
    });
  }

  // --- Render ---
  function render() {
    sortEvents();
    cardGrid.innerHTML = '';

    if (events.length === 0) {
      emptyState.classList.remove('hidden');
    } else {
      emptyState.classList.add('hidden');
    }

    events.forEach(function (evt) {
      var card = createCard(evt);
      cardGrid.appendChild(card);
    });

    updateAllCountdowns();
  }

  function createCard(evt) {
    var card = document.createElement('div');
    card.className = 'card';
    card.dataset.id = evt.id;

    if (evt.color) {
      card.classList.add('has-color');
      card.style.setProperty('--card-color', evt.color);
    }

    var targetDate = new Date(evt.target);
    var dateStr = targetDate.toLocaleString('zh-CN', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit'
    });

    var emojiHtml = evt.emoji ? '<span class="card-emoji">' + evt.emoji + '</span>' : '';

    card.innerHTML =
      '<div class="card-actions">' +
        '<button class="btn-card-action btn-share" data-id="' + evt.id + '" title="Share">&#x1f517;</button>' +
        '<button class="btn-card-action btn-edit" data-id="' + evt.id + '" title="Edit">&#9998;</button>' +
        '<button class="btn-card-action btn-delete" data-id="' + evt.id + '" title="Delete">&times;</button>' +
      '</div>' +
      '<div class="card-header">' +
        emojiHtml +
        '<div class="event-name">' + escapeHtml(evt.name) + '</div>' +
      '</div>' +
      '<div class="event-date">' + dateStr + '</div>' +
      '<div class="expired-badge hidden"></div>' +
      '<div class="countdown-display">' +
        '<div class="time-unit"><span class="time-value" data-unit="days">--</span><span class="time-label">Days</span></div>' +
        '<div class="time-unit"><span class="time-value" data-unit="hours">--</span><span class="time-label">Hours</span></div>' +
        '<div class="time-unit"><span class="time-value" data-unit="minutes">--</span><span class="time-label">Min</span></div>' +
        '<div class="time-unit"><span class="time-value" data-unit="seconds">--</span><span class="time-label">Sec</span></div>' +
      '</div>';

    card.querySelector('.btn-delete').addEventListener('click', function () {
      deleteEvent(evt.id);
    });

    card.querySelector('.btn-edit').addEventListener('click', function () {
      openEditModal(evt.id);
    });

    card.querySelector('.btn-share').addEventListener('click', function () {
      shareEvent(evt.id);
    });

    return card;
  }

  function updateAllCountdowns() {
    var cards = cardGrid.querySelectorAll('.card');
    cards.forEach(function (card) {
      var id = card.dataset.id;
      var evt = events.find(function (e) { return e.id === id; });
      if (!evt) return;

      var now = Date.now();
      var target = new Date(evt.target).getTime();
      var diff = target - now;
      var isExpired = diff <= 0;

      var badge = card.querySelector('.expired-badge');

      if (isExpired) {
        // Trigger celebration exactly once when transitioning to expired
        if (!celebratedIds[id] && diff > -3000) {
          celebratedIds[id] = true;
          triggerCelebration(card);
        }

        card.classList.add('expired');
        badge.classList.remove('hidden');
        badge.textContent = 'Expired';
        diff = Math.abs(diff);
      } else {
        card.classList.remove('expired');
        badge.classList.add('hidden');
      }

      var totalSeconds = Math.floor(diff / 1000);
      var days = Math.floor(totalSeconds / 86400);
      var hours = Math.floor((totalSeconds % 86400) / 3600);
      var minutes = Math.floor((totalSeconds % 3600) / 60);
      var seconds = totalSeconds % 60;

      card.querySelector('[data-unit="days"]').textContent = days;
      card.querySelector('[data-unit="hours"]').textContent = pad(hours);
      card.querySelector('[data-unit="minutes"]').textContent = pad(minutes);
      card.querySelector('[data-unit="seconds"]').textContent = pad(seconds);
    });
  }

  // --- Actions ---
  function addEvent(name, target, emoji, color) {
    var evt = {
      id: generateId(),
      name: name,
      target: target,
      emoji: emoji || '',
      color: color || ''
    };
    events.push(evt);
    saveEvents();
    render();
  }

  function updateEvent(id, name, target, emoji, color) {
    var evt = events.find(function (e) { return e.id === id; });
    if (evt) {
      evt.name = name;
      evt.target = target;
      evt.emoji = emoji || '';
      evt.color = color || '';
      saveEvents();
      render();
    }
  }

  function deleteEvent(id) {
    events = events.filter(function (e) { return e.id !== id; });
    saveEvents();
    render();
  }

  function shareEvent(id) {
    var evt = events.find(function (e) { return e.id === id; });
    if (!evt) return;
    var params = new URLSearchParams();
    params.set('name', evt.name);
    params.set('target', evt.target);
    if (evt.emoji) params.set('emoji', evt.emoji);
    if (evt.color) params.set('color', evt.color);
    var url = window.location.origin + window.location.pathname + '?' + params.toString();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
    }
    alert('Share URL copied!\n' + url);
  }

  // --- Modal ---
  var selectedEmoji = '';
  var selectedColor = '';

  function resetPickers() {
    selectedEmoji = '';
    selectedColor = '';
    document.querySelectorAll('.emoji-option').forEach(function (btn) {
      btn.classList.toggle('selected', btn.dataset.emoji === '');
    });
    document.querySelectorAll('.color-option').forEach(function (btn) {
      btn.classList.toggle('selected', btn.dataset.color === '');
    });
  }

  function openModal() {
    form.reset();
    editIdInput.value = '';
    modalTitle.textContent = 'New Countdown';
    submitBtn.textContent = 'Create';
    resetPickers();
    modalOverlay.classList.remove('hidden');
    nameInput.focus();
  }

  function openEditModal(id) {
    var evt = events.find(function (e) { return e.id === id; });
    if (!evt) return;

    editIdInput.value = id;
    nameInput.value = evt.name;
    dateInput.value = evt.target;
    modalTitle.textContent = 'Edit Countdown';
    submitBtn.textContent = 'Save';

    // Set emoji
    selectedEmoji = evt.emoji || '';
    document.querySelectorAll('.emoji-option').forEach(function (btn) {
      btn.classList.toggle('selected', btn.dataset.emoji === selectedEmoji);
    });

    // Set color
    selectedColor = evt.color || '';
    document.querySelectorAll('.color-option').forEach(function (btn) {
      btn.classList.toggle('selected', btn.dataset.color === selectedColor);
    });

    modalOverlay.classList.remove('hidden');
    nameInput.focus();
  }

  function closeModal() {
    modalOverlay.classList.add('hidden');
  }

  // --- Emoji & Color picker handlers ---
  document.getElementById('emoji-picker').addEventListener('click', function (e) {
    var btn = e.target.closest('.emoji-option');
    if (!btn) return;
    selectedEmoji = btn.dataset.emoji;
    document.querySelectorAll('.emoji-option').forEach(function (b) {
      b.classList.toggle('selected', b === btn);
    });
  });

  document.getElementById('color-picker').addEventListener('click', function (e) {
    var btn = e.target.closest('.color-option');
    if (!btn) return;
    selectedColor = btn.dataset.color;
    document.querySelectorAll('.color-option').forEach(function (b) {
      b.classList.toggle('selected', b === btn);
    });
  });

  // --- Preset buttons ---
  document.getElementById('presets').addEventListener('click', function (e) {
    var btn = e.target.closest('.btn-preset');
    if (!btn) return;
    var key = btn.dataset.preset;
    var presetFn = PRESETS[key];
    if (!presetFn) return;
    var p = presetFn();
    addEvent(p.name, p.target, p.emoji || '', p.color || '');
  });

  // --- Event Listeners ---
  addBtn.addEventListener('click', openModal);
  cancelBtn.addEventListener('click', closeModal);

  modalOverlay.addEventListener('click', function (e) {
    if (e.target === modalOverlay) closeModal();
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = nameInput.value.trim();
    var date = dateInput.value;
    if (!name || !date) return;

    var editId = editIdInput.value;
    if (editId) {
      updateEvent(editId, name, date, selectedEmoji, selectedColor);
    } else {
      addEvent(name, date, selectedEmoji, selectedColor);
    }
    closeModal();
  });

  // --- Confetti ---
  function triggerCelebration(card) {
    card.classList.add('celebrating');
    setTimeout(function () {
      card.classList.remove('celebrating');
    }, 3000);

    launchConfetti();
  }

  function launchConfetti() {
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;

    var particles = [];
    var colors = ['#e94560', '#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#ff922b', '#cc5de8'];

    for (var i = 0; i < 150; i++) {
      particles.push({
        x: Math.random() * confettiCanvas.width,
        y: Math.random() * confettiCanvas.height - confettiCanvas.height,
        w: Math.random() * 8 + 4,
        h: Math.random() * 6 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 4,
        vy: Math.random() * 3 + 2,
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 10,
        opacity: 1
      });
    }

    var startTime = Date.now();
    var duration = 3000;

    function animate() {
      var elapsed = Date.now() - startTime;
      if (elapsed > duration) {
        confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
        return;
      }

      confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

      var fadeStart = duration * 0.6;
      particles.forEach(function (p) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.05;
        p.rotation += p.rotSpeed;

        if (elapsed > fadeStart) {
          p.opacity = 1 - (elapsed - fadeStart) / (duration - fadeStart);
        }

        confettiCtx.save();
        confettiCtx.translate(p.x, p.y);
        confettiCtx.rotate(p.rotation * Math.PI / 180);
        confettiCtx.globalAlpha = Math.max(0, p.opacity);
        confettiCtx.fillStyle = p.color;
        confettiCtx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        confettiCtx.restore();
      });

      requestAnimationFrame(animate);
    }

    animate();
  }

  // --- Helpers ---
  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  }

  function pad(n) {
    return n < 10 ? '0' + n : String(n);
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function formatDateLocal(d) {
    var y = d.getFullYear();
    var m = pad(d.getMonth() + 1);
    var day = pad(d.getDate());
    return y + '-' + m + '-' + day + 'T00:00';
  }

  // --- Init ---
  checkSharedEvent();
  render();
  setInterval(updateAllCountdowns, 1000);
})();
