(function () {
  'use strict';

  // ── City / Timezone Data ──
  var CITIES = [
    { name: 'New York', timezone: 'America/New_York' },
    { name: 'London', timezone: 'Europe/London' },
    { name: 'Tokyo', timezone: 'Asia/Tokyo' },
    { name: 'Sydney', timezone: 'Australia/Sydney' },
    { name: 'Paris', timezone: 'Europe/Paris' },
    { name: 'Berlin', timezone: 'Europe/Berlin' },
    { name: 'Moscow', timezone: 'Europe/Moscow' },
    { name: 'Dubai', timezone: 'Asia/Dubai' },
    { name: 'Singapore', timezone: 'Asia/Singapore' },
    { name: 'Hong Kong', timezone: 'Asia/Hong_Kong' },
    { name: 'Shanghai', timezone: 'Asia/Shanghai' },
    { name: 'Mumbai', timezone: 'Asia/Kolkata' },
    { name: 'Bangkok', timezone: 'Asia/Bangkok' },
    { name: 'Seoul', timezone: 'Asia/Seoul' },
    { name: 'Los Angeles', timezone: 'America/Los_Angeles' },
    { name: 'Chicago', timezone: 'America/Chicago' },
    { name: 'Denver', timezone: 'America/Denver' },
    { name: 'Toronto', timezone: 'America/Toronto' },
    { name: 'Vancouver', timezone: 'America/Vancouver' },
    { name: 'Sao Paulo', timezone: 'America/Sao_Paulo' },
    { name: 'Buenos Aires', timezone: 'America/Argentina/Buenos_Aires' },
    { name: 'Mexico City', timezone: 'America/Mexico_City' },
    { name: 'Cairo', timezone: 'Africa/Cairo' },
    { name: 'Johannesburg', timezone: 'Africa/Johannesburg' },
    { name: 'Lagos', timezone: 'Africa/Lagos' },
    { name: 'Istanbul', timezone: 'Europe/Istanbul' },
    { name: 'Rome', timezone: 'Europe/Rome' },
    { name: 'Madrid', timezone: 'Europe/Madrid' },
    { name: 'Amsterdam', timezone: 'Europe/Amsterdam' },
    { name: 'Stockholm', timezone: 'Europe/Stockholm' },
    { name: 'Auckland', timezone: 'Pacific/Auckland' },
    { name: 'Honolulu', timezone: 'Pacific/Honolulu' },
    { name: 'Anchorage', timezone: 'America/Anchorage' },
    { name: 'Jakarta', timezone: 'Asia/Jakarta' },
    { name: 'Taipei', timezone: 'Asia/Taipei' },
    { name: 'Riyadh', timezone: 'Asia/Riyadh' }
  ];

  var DEFAULT_CITIES = ['New York', 'London', 'Tokyo', 'Sydney'];
  var STORAGE_KEY = 'world-clock-cities';
  var FORMAT_KEY = 'world-clock-format';
  var THEME_KEY = 'world-clock-theme';

  // ── State ──
  var activeCities = loadCities();
  var use24h = loadFormat();
  var localTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // ── DOM refs ──
  var grid = document.getElementById('clock-grid');
  var addBtn = document.getElementById('add-clock-btn');
  var formatToggle = document.getElementById('format-toggle');
  var themeToggle = document.getElementById('theme-toggle');
  var modalOverlay = document.getElementById('modal-overlay');
  var modalClose = document.getElementById('modal-close');
  var citySearch = document.getElementById('city-search');
  var cityList = document.getElementById('city-list');

  // ── Persistence ──
  function loadCities() {
    try {
      var saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        var parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) { /* ignore */ }
    return DEFAULT_CITIES.slice();
  }

  function saveCities() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(activeCities));
  }

  function loadFormat() {
    var saved = localStorage.getItem(FORMAT_KEY);
    return saved === '12h' ? false : true;
  }

  function saveFormat() {
    localStorage.setItem(FORMAT_KEY, use24h ? '24h' : '12h');
  }

  function loadTheme() {
    return localStorage.getItem(THEME_KEY) || 'dark';
  }

  function saveTheme(theme) {
    localStorage.setItem(THEME_KEY, theme);
  }

  // ── Theme ──
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    themeToggle.textContent = theme === 'dark' ? 'Light' : 'Dark';
    saveTheme(theme);
  }

  function toggleTheme() {
    var current = document.documentElement.getAttribute('data-theme');
    applyTheme(current === 'dark' ? 'light' : 'dark');
    updateClocks();
  }

  // ── Format Toggle ──
  function updateFormatButton() {
    formatToggle.textContent = use24h ? '24H' : '12H';
  }

  function toggleFormat() {
    use24h = !use24h;
    saveFormat();
    updateFormatButton();
    updateClocks();
  }

  // ── Timezone Helpers ──
  function getTimeInZone(timezone) {
    var now = new Date();
    var parts = {};
    var fmt = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: 'numeric', minute: 'numeric', second: 'numeric',
      hour12: false,
      year: 'numeric', month: 'short', day: 'numeric',
      weekday: 'short'
    });
    fmt.formatToParts(now).forEach(function (p) {
      parts[p.type] = p.value;
    });
    return {
      hours: parseInt(parts.hour, 10),
      minutes: parseInt(parts.minute, 10),
      seconds: parseInt(parts.second, 10),
      date: parts.weekday + ', ' + parts.month + ' ' + parts.day + ', ' + parts.year
    };
  }

  function getUTCOffset(timezone) {
    var now = new Date();
    var fmt = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      timeZoneName: 'shortOffset'
    });
    var result = fmt.formatToParts(now);
    for (var i = 0; i < result.length; i++) {
      if (result[i].type === 'timeZoneName') return result[i].value;
    }
    return '';
  }

  function getOffsetMinutes(timezone) {
    var now = new Date();
    var str = now.toLocaleString('en-US', { timeZone: timezone });
    var tzDate = new Date(str);
    var utcStr = now.toLocaleString('en-US', { timeZone: 'UTC' });
    var utcDate = new Date(utcStr);
    return Math.round((tzDate - utcDate) / 60000);
  }

  function getTimeDiffFromLocal(timezone) {
    var localOffset = getOffsetMinutes(localTimezone);
    var targetOffset = getOffsetMinutes(timezone);
    var diffMinutes = targetOffset - localOffset;
    var diffHours = diffMinutes / 60;
    if (diffMinutes === 0) return 'Same as local';
    var sign = diffHours > 0 ? '+' : '';
    if (diffHours === Math.floor(diffHours)) {
      return sign + diffHours + 'h from local';
    }
    return sign + diffHours.toFixed(1) + 'h from local';
  }

  function isLocalTimezone(timezone) {
    return timezone === localTimezone;
  }

  // ── Canvas Clock Drawing ──
  function getThemeColors() {
    var style = getComputedStyle(document.documentElement);
    return {
      face: style.getPropertyValue('--clock-face').trim(),
      border: style.getPropertyValue('--border').trim(),
      accent: style.getPropertyValue('--accent').trim(),
      hand: style.getPropertyValue('--hand-color').trim(),
      markerDim: style.getPropertyValue('--marker-dim').trim()
    };
  }

  function drawClock(canvas, time) {
    var size = canvas.width;
    var ctx = canvas.getContext('2d');
    var center = size / 2;
    var radius = center - 8;
    var colors = getThemeColors();

    ctx.clearRect(0, 0, size, size);

    // Face
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    ctx.fillStyle = colors.face;
    ctx.fill();
    ctx.strokeStyle = colors.border;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Hour markers
    for (var i = 0; i < 12; i++) {
      var angle = (i * Math.PI) / 6 - Math.PI / 2;
      var inner = i % 3 === 0 ? radius - 14 : radius - 10;
      var outer = radius - 4;
      ctx.beginPath();
      ctx.moveTo(center + inner * Math.cos(angle), center + inner * Math.sin(angle));
      ctx.lineTo(center + outer * Math.cos(angle), center + outer * Math.sin(angle));
      ctx.strokeStyle = i % 3 === 0 ? colors.accent : colors.markerDim;
      ctx.lineWidth = i % 3 === 0 ? 2.5 : 1.5;
      ctx.stroke();
    }

    // Hour hand
    var hAngle = ((time.hours % 12) + time.minutes / 60) * (Math.PI / 6) - Math.PI / 2;
    drawHand(ctx, center, hAngle, radius * 0.5, 4, colors.hand);

    // Minute hand
    var mAngle = (time.minutes + time.seconds / 60) * (Math.PI / 30) - Math.PI / 2;
    drawHand(ctx, center, mAngle, radius * 0.7, 2.5, colors.hand);

    // Second hand
    var sAngle = time.seconds * (Math.PI / 30) - Math.PI / 2;
    drawHand(ctx, center, sAngle, radius * 0.8, 1, colors.accent);

    // Center dot
    ctx.beginPath();
    ctx.arc(center, center, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = colors.accent;
    ctx.fill();
  }

  function drawHand(ctx, center, angle, length, width, color) {
    ctx.beginPath();
    ctx.moveTo(center, center);
    ctx.lineTo(center + length * Math.cos(angle), center + length * Math.sin(angle));
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.stroke();
  }

  // ── Rendering ──
  function findCity(name) {
    for (var i = 0; i < CITIES.length; i++) {
      if (CITIES[i].name === name) return CITIES[i];
    }
    return null;
  }

  function createCard(cityName, index) {
    var city = findCity(cityName);
    if (!city) return null;

    var card = document.createElement('div');
    card.className = 'clock-card';
    card.dataset.city = cityName;

    if (isLocalTimezone(city.timezone)) {
      card.classList.add('local-tz');
    }

    // Controls: move up, move down, remove
    var controls = document.createElement('div');
    controls.className = 'card-controls';

    var upBtn = document.createElement('button');
    upBtn.title = 'Move up';
    upBtn.textContent = '\u25B2';
    upBtn.addEventListener('click', function () { moveCity(cityName, -1); });

    var downBtn = document.createElement('button');
    downBtn.title = 'Move down';
    downBtn.textContent = '\u25BC';
    downBtn.addEventListener('click', function () { moveCity(cityName, 1); });

    var removeBtn = document.createElement('button');
    removeBtn.title = 'Remove';
    removeBtn.textContent = '\u00d7';
    removeBtn.addEventListener('click', function () { removeClock(cityName); });

    controls.appendChild(upBtn);
    controls.appendChild(downBtn);
    controls.appendChild(removeBtn);

    var nameEl = document.createElement('div');
    nameEl.className = 'city-name';
    nameEl.textContent = cityName;

    var canvas = document.createElement('canvas');
    canvas.width = 160;
    canvas.height = 160;

    var digitalEl = document.createElement('div');
    digitalEl.className = 'digital-time';

    var dateEl = document.createElement('div');
    dateEl.className = 'date-info';

    var offsetEl = document.createElement('div');
    offsetEl.className = 'utc-offset';

    var diffEl = document.createElement('div');
    diffEl.className = 'time-diff';

    card.appendChild(controls);
    card.appendChild(nameEl);
    card.appendChild(canvas);
    card.appendChild(digitalEl);
    card.appendChild(dateEl);
    card.appendChild(offsetEl);
    card.appendChild(diffEl);

    return card;
  }

  function renderGrid() {
    grid.innerHTML = '';
    activeCities.forEach(function (name, i) {
      var card = createCard(name, i);
      if (card) grid.appendChild(card);
    });
  }

  function formatDigitalTime(time) {
    var pad = function (n) { return n < 10 ? '0' + n : '' + n; };
    if (use24h) {
      return pad(time.hours) + ':' + pad(time.minutes) + ':' + pad(time.seconds);
    }
    var h = time.hours % 12;
    if (h === 0) h = 12;
    var ampm = time.hours < 12 ? ' AM' : ' PM';
    return pad(h) + ':' + pad(time.minutes) + ':' + pad(time.seconds) + ampm;
  }

  function updateClocks() {
    var cards = grid.querySelectorAll('.clock-card');
    cards.forEach(function (card) {
      var cityName = card.dataset.city;
      var city = findCity(cityName);
      if (!city) return;

      var time = getTimeInZone(city.timezone);
      var canvas = card.querySelector('canvas');
      drawClock(canvas, time);

      card.querySelector('.digital-time').textContent = formatDigitalTime(time);
      card.querySelector('.date-info').textContent = time.date;
      card.querySelector('.utc-offset').textContent = getUTCOffset(city.timezone);
      card.querySelector('.time-diff').textContent = getTimeDiffFromLocal(city.timezone);
    });
  }

  // ── Add / Remove / Move ──
  function addClock(cityName) {
    if (activeCities.indexOf(cityName) !== -1) return;
    activeCities.push(cityName);
    saveCities();
    var card = createCard(cityName, activeCities.length - 1);
    if (card) grid.appendChild(card);
    updateClocks();
  }

  function removeClock(cityName) {
    var idx = activeCities.indexOf(cityName);
    if (idx === -1) return;
    activeCities.splice(idx, 1);
    saveCities();
    var card = grid.querySelector('[data-city="' + cityName + '"]');
    if (card) card.remove();
  }

  function moveCity(cityName, direction) {
    var idx = activeCities.indexOf(cityName);
    if (idx === -1) return;
    var newIdx = idx + direction;
    if (newIdx < 0 || newIdx >= activeCities.length) return;
    activeCities.splice(idx, 1);
    activeCities.splice(newIdx, 0, cityName);
    saveCities();
    renderGrid();
    updateClocks();
  }

  // ── Modal ──
  function openModal() {
    modalOverlay.classList.remove('hidden');
    citySearch.value = '';
    renderCityList('');
    citySearch.focus();
  }

  function closeModal() {
    modalOverlay.classList.add('hidden');
  }

  function renderCityList(filter) {
    cityList.innerHTML = '';
    var lower = filter.toLowerCase();
    CITIES.forEach(function (city) {
      if (activeCities.indexOf(city.name) !== -1) return;
      if (lower && city.name.toLowerCase().indexOf(lower) === -1) return;

      var li = document.createElement('li');
      li.textContent = city.name;
      var span = document.createElement('span');
      span.className = 'tz-label';
      span.textContent = city.timezone;
      li.appendChild(span);

      li.addEventListener('click', function () {
        addClock(city.name);
        closeModal();
      });
      cityList.appendChild(li);
    });
  }

  // ── Event Listeners ──
  addBtn.addEventListener('click', openModal);
  modalClose.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', function (e) {
    if (e.target === modalOverlay) closeModal();
  });
  citySearch.addEventListener('input', function () {
    renderCityList(citySearch.value);
  });
  formatToggle.addEventListener('click', toggleFormat);
  themeToggle.addEventListener('click', toggleTheme);

  // ── Init ──
  applyTheme(loadTheme());
  updateFormatButton();
  renderGrid();
  updateClocks();
  setInterval(updateClocks, 1000);
})();
