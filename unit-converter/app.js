// Unit Converter - Core Conversion Engine + Enhanced UX (M1 + M2)
// All conversion factors relative to a base unit per category

const UNITS = {
  length: {
    name: 'Length',
    baseUnit: 'meter',
    units: {
      meter:          { label: 'Meter (m)',            factor: 1 },
      kilometer:      { label: 'Kilometer (km)',       factor: 1000 },
      centimeter:     { label: 'Centimeter (cm)',      factor: 0.01 },
      millimeter:     { label: 'Millimeter (mm)',      factor: 0.001 },
      micrometer:     { label: 'Micrometer (\u00B5m)',      factor: 1e-6 },
      nanometer:      { label: 'Nanometer (nm)',       factor: 1e-9 },
      mile:           { label: 'Mile (mi)',            factor: 1609.344 },
      yard:           { label: 'Yard (yd)',            factor: 0.9144 },
      foot:           { label: 'Foot (ft)',            factor: 0.3048 },
      inch:           { label: 'Inch (in)',            factor: 0.0254 },
      nautical_mile:  { label: 'Nautical Mile (nmi)',  factor: 1852 },
    },
    defaults: ['meter', 'foot'],
  },

  weight: {
    name: 'Weight',
    baseUnit: 'kilogram',
    units: {
      kilogram:    { label: 'Kilogram (kg)',    factor: 1 },
      gram:        { label: 'Gram (g)',         factor: 0.001 },
      milligram:   { label: 'Milligram (mg)',   factor: 1e-6 },
      microgram:   { label: 'Microgram (\u00B5g)',   factor: 1e-9 },
      metric_ton:  { label: 'Metric Ton (t)',   factor: 1000 },
      pound:       { label: 'Pound (lb)',       factor: 0.45359237 },
      ounce:       { label: 'Ounce (oz)',       factor: 0.028349523125 },
      stone:       { label: 'Stone (st)',       factor: 6.35029318 },
    },
    defaults: ['kilogram', 'pound'],
  },

  temperature: {
    name: 'Temperature',
    baseUnit: null,
    units: {
      celsius:    { label: 'Celsius (\u00B0C)' },
      fahrenheit: { label: 'Fahrenheit (\u00B0F)' },
      kelvin:     { label: 'Kelvin (K)' },
    },
    defaults: ['celsius', 'fahrenheit'],
  },

  area: {
    name: 'Area',
    baseUnit: 'square_meter',
    units: {
      square_meter:      { label: 'Square Meter (m\u00B2)',      factor: 1 },
      square_kilometer:  { label: 'Square Kilometer (km\u00B2)', factor: 1e6 },
      square_centimeter: { label: 'Square Centimeter (cm\u00B2)',factor: 1e-4 },
      square_millimeter: { label: 'Square Millimeter (mm\u00B2)',factor: 1e-6 },
      hectare:           { label: 'Hectare (ha)',            factor: 10000 },
      acre:              { label: 'Acre (ac)',               factor: 4046.8564224 },
      square_mile:       { label: 'Square Mile (mi\u00B2)',      factor: 2589988.110336 },
      square_yard:       { label: 'Square Yard (yd\u00B2)',      factor: 0.83612736 },
      square_foot:       { label: 'Square Foot (ft\u00B2)',      factor: 0.09290304 },
      square_inch:       { label: 'Square Inch (in\u00B2)',      factor: 0.00064516 },
    },
    defaults: ['square_meter', 'square_foot'],
  },

  volume: {
    name: 'Volume',
    baseUnit: 'liter',
    units: {
      cubic_meter:  { label: 'Cubic Meter (m\u00B3)',     factor: 1000 },
      liter:        { label: 'Liter (L)',            factor: 1 },
      milliliter:   { label: 'Milliliter (mL)',      factor: 0.001 },
      gallon_us:    { label: 'Gallon (US)',          factor: 3.785411784 },
      quart_us:     { label: 'Quart (US)',           factor: 0.946352946 },
      pint_us:      { label: 'Pint (US)',            factor: 0.473176473 },
      cup_us:       { label: 'Cup (US)',             factor: 0.2365882365 },
      fluid_oz_us:  { label: 'Fluid Ounce (US)',    factor: 0.029573529563 },
      tablespoon:   { label: 'Tablespoon (tbsp)',    factor: 0.014786764782 },
      teaspoon:     { label: 'Teaspoon (tsp)',       factor: 0.004928921594 },
    },
    defaults: ['liter', 'gallon_us'],
  },

  speed: {
    name: 'Speed',
    baseUnit: 'meter_per_second',
    units: {
      meter_per_second:    { label: 'Meter/second (m/s)',    factor: 1 },
      kilometer_per_hour:  { label: 'Kilometer/hour (km/h)',factor: 0.277777778 },
      mile_per_hour:       { label: 'Mile/hour (mph)',       factor: 0.44704 },
      knot:                { label: 'Knot (kn)',             factor: 0.514444444 },
      foot_per_second:     { label: 'Foot/second (ft/s)',    factor: 0.3048 },
    },
    defaults: ['kilometer_per_hour', 'mile_per_hour'],
  },

  time: {
    name: 'Time',
    baseUnit: 'second',
    units: {
      second:      { label: 'Second (s)',        factor: 1 },
      millisecond: { label: 'Millisecond (ms)',  factor: 0.001 },
      microsecond: { label: 'Microsecond (\u00B5s)', factor: 1e-6 },
      minute:      { label: 'Minute (min)',      factor: 60 },
      hour:        { label: 'Hour (h)',          factor: 3600 },
      day:         { label: 'Day (d)',           factor: 86400 },
      week:        { label: 'Week (wk)',         factor: 604800 },
      month:       { label: 'Month (30d)',       factor: 2592000 },
      year:        { label: 'Year (365d)',       factor: 31536000 },
    },
    defaults: ['minute', 'second'],
  },

  data: {
    name: 'Data Storage',
    baseUnit: 'byte',
    units: {
      bit:       { label: 'Bit (b)',            factor: 0.125 },
      byte:      { label: 'Byte (B)',           factor: 1 },
      kilobyte:  { label: 'Kilobyte (KB)',      factor: 1000 },
      megabyte:  { label: 'Megabyte (MB)',      factor: 1e6 },
      gigabyte:  { label: 'Gigabyte (GB)',      factor: 1e9 },
      terabyte:  { label: 'Terabyte (TB)',      factor: 1e12 },
      petabyte:  { label: 'Petabyte (PB)',      factor: 1e15 },
      kibibyte:  { label: 'Kibibyte (KiB)',     factor: 1024 },
      mebibyte:  { label: 'Mebibyte (MiB)',     factor: 1048576 },
      gibibyte:  { label: 'Gibibyte (GiB)',     factor: 1073741824 },
      tebibyte:  { label: 'Tebibyte (TiB)',     factor: 1099511627776 },
    },
    defaults: ['megabyte', 'gigabyte'],
  },
};

// ============================================================
// Core conversion logic (unchanged from M1)
// ============================================================

function convertTemperature(value, from, to) {
  if (from === to) return value;
  let celsius;
  switch (from) {
    case 'celsius':    celsius = value; break;
    case 'fahrenheit': celsius = (value - 32) * 5 / 9; break;
    case 'kelvin':     celsius = value - 273.15; break;
  }
  switch (to) {
    case 'celsius':    return celsius;
    case 'fahrenheit': return celsius * 9 / 5 + 32;
    case 'kelvin':     return celsius + 273.15;
  }
}

function convert(category, value, fromUnit, toUnit) {
  if (category === 'temperature') {
    return convertTemperature(value, fromUnit, toUnit);
  }
  const catData = UNITS[category];
  const fromFactor = catData.units[fromUnit].factor;
  const toFactor = catData.units[toUnit].factor;
  const baseValue = value * fromFactor;
  return baseValue / toFactor;
}

function formatResult(value) {
  if (value === 0) return '0';
  if (!isFinite(value)) return 'Invalid';
  const abs = Math.abs(value);
  if (abs >= 1e15 || (abs < 1e-10 && abs > 0)) {
    return value.toExponential(6);
  }
  if (abs >= 1000) return parseFloat(value.toPrecision(10)).toString();
  if (abs >= 1) return parseFloat(value.toPrecision(8)).toString();
  if (abs >= 0.01) return parseFloat(value.toPrecision(6)).toString();
  return parseFloat(value.toPrecision(6)).toString();
}

function getFormula(category, fromUnit, toUnit) {
  if (category === 'temperature') {
    const formulas = {
      'celsius-fahrenheit':    '\u00B0F = \u00B0C \u00D7 9/5 + 32',
      'fahrenheit-celsius':    '\u00B0C = (\u00B0F - 32) \u00D7 5/9',
      'celsius-kelvin':        'K = \u00B0C + 273.15',
      'kelvin-celsius':        '\u00B0C = K - 273.15',
      'fahrenheit-kelvin':     'K = (\u00B0F - 32) \u00D7 5/9 + 273.15',
      'kelvin-fahrenheit':     '\u00B0F = (K - 273.15) \u00D7 9/5 + 32',
    };
    const key = `${fromUnit}-${toUnit}`;
    if (fromUnit === toUnit) return 'Same unit';
    return formulas[key] || '';
  }
  const catData = UNITS[category];
  const fromLabel = catData.units[fromUnit].label.split(' (')[0];
  const toLabel = catData.units[toUnit].label.split(' (')[0];
  const converted = convert(category, 1, fromUnit, toUnit);
  return `1 ${fromLabel} = ${formatResult(converted)} ${toLabel}`;
}

// ============================================================
// DOM elements
// ============================================================

const fromSelect = document.getElementById('from-unit');
const toSelect = document.getElementById('to-unit');
const inputValue = document.getElementById('input-value');
const resultDiv = document.getElementById('result');
const formulaDiv = document.getElementById('formula');
const swapBtn = document.getElementById('swap-btn');
const categoryBtns = document.querySelectorAll('.category-btn');
const unitSearch = document.getElementById('unit-search');
const favBtn = document.getElementById('fav-btn');
const favToggle = document.getElementById('fav-toggle');
const favList = document.getElementById('fav-list');
const favEmpty = document.getElementById('fav-empty');
const historyToggle = document.getElementById('history-toggle');
const historyList = document.getElementById('history-list');
const historyEmpty = document.getElementById('history-empty');
const clearHistoryBtn = document.getElementById('clear-history');

let currentCategory = 'length';

// ============================================================
// F8: Unit Search/Filter
// ============================================================

function populateUnits(category, filter) {
  const catData = UNITS[category];
  const unitKeys = Object.keys(catData.units);
  const query = (filter || '').toLowerCase();

  const prevFrom = fromSelect.value;
  const prevTo = toSelect.value;

  fromSelect.innerHTML = '';
  toSelect.innerHTML = '';

  const filtered = unitKeys.filter(key => {
    if (!query) return true;
    return catData.units[key].label.toLowerCase().includes(query) || key.toLowerCase().includes(query);
  });

  filtered.forEach(key => {
    const unit = catData.units[key];
    fromSelect.appendChild(new Option(unit.label, key));
    toSelect.appendChild(new Option(unit.label, key));
  });

  // Try to preserve previous selections; fall back to defaults
  if (filtered.includes(prevFrom)) {
    fromSelect.value = prevFrom;
  } else if (filtered.includes(catData.defaults[0])) {
    fromSelect.value = catData.defaults[0];
  }

  if (filtered.includes(prevTo)) {
    toSelect.value = prevTo;
  } else if (filtered.includes(catData.defaults[1])) {
    toSelect.value = catData.defaults[1];
  }
}

// ============================================================
// Core UI update
// ============================================================

function updateConversion() {
  const value = parseFloat(inputValue.value);

  if (inputValue.value === '' || isNaN(value)) {
    resultDiv.textContent = '0';
  } else {
    const result = convert(currentCategory, value, fromSelect.value, toSelect.value);
    resultDiv.textContent = formatResult(result);

    // F10: auto-save to history
    addHistory(currentCategory, value, fromSelect.value, toSelect.value, formatResult(result));
  }

  formulaDiv.textContent = getFormula(currentCategory, fromSelect.value, toSelect.value);
  updateFavBtnState();
}

// ============================================================
// Category tab handling with keyboard navigation (F11)
// ============================================================

const categoryBtnArray = Array.from(categoryBtns);

function switchCategory(btn) {
  categoryBtns.forEach(b => {
    b.classList.remove('active');
    b.setAttribute('aria-selected', 'false');
    b.setAttribute('tabindex', '-1');
  });
  btn.classList.add('active');
  btn.setAttribute('aria-selected', 'true');
  btn.setAttribute('tabindex', '0');

  currentCategory = btn.dataset.category;
  unitSearch.value = '';
  populateUnits(currentCategory);
  updateConversion();
}

categoryBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    switchCategory(btn);
    btn.focus();
  });

  // Arrow key navigation for tabs (F11)
  btn.addEventListener('keydown', (e) => {
    const idx = categoryBtnArray.indexOf(btn);
    let nextIdx = -1;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      nextIdx = (idx + 1) % categoryBtnArray.length;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      nextIdx = (idx - 1 + categoryBtnArray.length) % categoryBtnArray.length;
    } else if (e.key === 'Home') {
      nextIdx = 0;
    } else if (e.key === 'End') {
      nextIdx = categoryBtnArray.length - 1;
    }
    if (nextIdx >= 0) {
      e.preventDefault();
      switchCategory(categoryBtnArray[nextIdx]);
      categoryBtnArray[nextIdx].focus();
    }
  });
});

// ============================================================
// Event listeners
// ============================================================

inputValue.addEventListener('input', updateConversion);
fromSelect.addEventListener('change', updateConversion);
toSelect.addEventListener('change', updateConversion);

unitSearch.addEventListener('input', () => {
  populateUnits(currentCategory, unitSearch.value);
  updateConversion();
});

swapBtn.addEventListener('click', () => {
  const temp = fromSelect.value;
  fromSelect.value = toSelect.value;
  toSelect.value = temp;
  updateConversion();
});

// ============================================================
// F9: Favorites
// ============================================================

const FAVORITES_KEY = 'unitConverter_favorites';

function loadFavorites() {
  try {
    return JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];
  } catch { return []; }
}

function saveFavorites(favs) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs));
}

function getFavKey() {
  return `${currentCategory}|${fromSelect.value}|${toSelect.value}`;
}

function isFavorited() {
  const key = getFavKey();
  return loadFavorites().some(f => f.key === key);
}

function updateFavBtnState() {
  if (isFavorited()) {
    favBtn.innerHTML = '&#9733;';
    favBtn.classList.add('is-fav');
    favBtn.setAttribute('aria-label', 'Remove from favorites');
  } else {
    favBtn.innerHTML = '&#9734;';
    favBtn.classList.remove('is-fav');
    favBtn.setAttribute('aria-label', 'Add to favorites');
  }
}

function toggleFavorite() {
  const favs = loadFavorites();
  const key = getFavKey();
  const idx = favs.findIndex(f => f.key === key);

  if (idx >= 0) {
    favs.splice(idx, 1);
  } else {
    const catData = UNITS[currentCategory];
    favs.push({
      key,
      category: currentCategory,
      categoryName: catData.name,
      from: fromSelect.value,
      fromLabel: catData.units[fromSelect.value].label,
      to: toSelect.value,
      toLabel: catData.units[toSelect.value].label,
    });
  }

  saveFavorites(favs);
  updateFavBtnState();
  renderFavorites();
}

function renderFavorites() {
  const favs = loadFavorites();

  // Remove existing items (keep the empty message element)
  favList.querySelectorAll('.fav-item').forEach(el => el.remove());

  if (favs.length === 0) {
    favEmpty.style.display = '';
    return;
  }

  favEmpty.style.display = 'none';

  favs.forEach((fav, i) => {
    const item = document.createElement('div');
    item.className = 'fav-item';
    item.setAttribute('role', 'listitem');
    item.setAttribute('tabindex', '0');
    item.setAttribute('aria-label', `${fav.categoryName}: ${fav.fromLabel} to ${fav.toLabel}. Press Enter to load.`);

    item.innerHTML =
      `<span class="fav-item-category">${fav.categoryName}</span>` +
      `<span class="fav-item-text">${fav.fromLabel} &rarr; ${fav.toLabel}</span>` +
      `<button class="fav-item-remove" aria-label="Remove favorite: ${fav.fromLabel} to ${fav.toLabel}" data-idx="${i}">&times;</button>`;

    // Click to load favorite
    item.addEventListener('click', (e) => {
      if (e.target.classList.contains('fav-item-remove')) return;
      loadFavorite(fav);
    });

    // Keyboard: Enter to load
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.target.classList.contains('fav-item-remove')) {
        loadFavorite(fav);
      }
    });

    // Remove button
    item.querySelector('.fav-item-remove').addEventListener('click', (e) => {
      e.stopPropagation();
      const favs2 = loadFavorites();
      const removeIdx = favs2.findIndex(f => f.key === fav.key);
      if (removeIdx >= 0) favs2.splice(removeIdx, 1);
      saveFavorites(favs2);
      renderFavorites();
      updateFavBtnState();
    });

    favList.appendChild(item);
  });
}

function loadFavorite(fav) {
  // Switch category
  const btn = document.querySelector(`.category-btn[data-category="${fav.category}"]`);
  if (btn) switchCategory(btn);

  // Set units
  unitSearch.value = '';
  populateUnits(fav.category);
  fromSelect.value = fav.from;
  toSelect.value = fav.to;
  updateConversion();
  inputValue.focus();
}

favBtn.addEventListener('click', toggleFavorite);

// Toggle favorites panel
favToggle.addEventListener('click', () => {
  const expanded = favToggle.getAttribute('aria-expanded') === 'true';
  favToggle.setAttribute('aria-expanded', !expanded);
  favList.hidden = expanded;
});

// ============================================================
// F10: Conversion History
// ============================================================

const HISTORY_KEY = 'unitConverter_history';
const HISTORY_MAX = 50;

let historyDebounce = null;
let lastHistoryKey = '';

function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
  } catch { return []; }
}

function saveHistory(hist) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(hist));
}

function addHistory(category, value, fromUnit, toUnit, resultStr) {
  // Debounce: don't save while user is still typing (same pair)
  const key = `${category}|${fromUnit}|${toUnit}|${value}`;
  if (key === lastHistoryKey) return;

  clearTimeout(historyDebounce);
  historyDebounce = setTimeout(() => {
    lastHistoryKey = key;

    const catData = UNITS[category];
    const entry = {
      category,
      categoryName: catData.name,
      value,
      from: fromUnit,
      fromLabel: catData.units[fromUnit].label.split(' (')[0],
      to: toUnit,
      toLabel: catData.units[toUnit].label.split(' (')[0],
      result: resultStr,
      time: Date.now(),
    };

    const hist = loadHistory();
    hist.unshift(entry);
    if (hist.length > HISTORY_MAX) hist.length = HISTORY_MAX;
    saveHistory(hist);
    renderHistory();
  }, 800);
}

function renderHistory() {
  const hist = loadHistory();

  historyList.querySelectorAll('.history-item').forEach(el => el.remove());

  if (hist.length === 0) {
    historyEmpty.style.display = '';
    return;
  }

  historyEmpty.style.display = 'none';

  hist.forEach(entry => {
    const item = document.createElement('div');
    item.className = 'history-item';
    item.setAttribute('role', 'listitem');

    item.innerHTML =
      `<span class="fav-item-category">${entry.categoryName}</span>` +
      `<span class="history-item-value">${entry.value} ${entry.fromLabel}</span>` +
      `<span class="history-item-arrow">&rarr;</span>` +
      `<span class="history-item-result">${entry.result} ${entry.toLabel}</span>`;

    historyList.appendChild(item);
  });
}

// Toggle history panel
historyToggle.addEventListener('click', (e) => {
  if (e.target === clearHistoryBtn || clearHistoryBtn.contains(e.target)) return;
  const expanded = historyToggle.getAttribute('aria-expanded') === 'true';
  historyToggle.setAttribute('aria-expanded', !expanded);
  historyList.hidden = expanded;
});

// Clear history
clearHistoryBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  localStorage.removeItem(HISTORY_KEY);
  lastHistoryKey = '';
  renderHistory();
});

// ============================================================
// Initialize
// ============================================================

populateUnits(currentCategory);
updateConversion();
renderFavorites();
renderHistory();

// Export for testing (if running in Node.js environment)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { UNITS, convert, convertTemperature, formatResult, getFormula };
}
