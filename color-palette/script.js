// ===== State =====
let currentFormat = 'hex'; // 'hex' | 'rgb' | 'hsl'
let currentBaseHex = '#4A90D9';

// ===== Color Conversion Utilities =====

/**
 * Convert HEX color string to HSL object.
 * @param {string} hex - Color in "#RRGGBB" or "RRGGBB" format
 * @returns {{h: number, s: number, l: number}} HSL values (h: 0-360, s: 0-100, l: 0-100)
 */
function hexToHsl(hex) {
  hex = hex.replace(/^#/, '');
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}

/**
 * Convert HSL values to HEX color string.
 * @param {number} h - Hue (0-360)
 * @param {number} s - Saturation (0-100)
 * @param {number} l - Lightness (0-100)
 * @returns {string} Color in "#RRGGBB" format (lowercase)
 */
function hslToHex(h, s, l) {
  h = ((h % 360) + 360) % 360;
  s = Math.max(0, Math.min(100, s)) / 100;
  l = Math.max(0, Math.min(100, l)) / 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;

  let r, g, b;
  if (h < 60) { r = c; g = x; b = 0; }
  else if (h < 120) { r = x; g = c; b = 0; }
  else if (h < 180) { r = 0; g = c; b = x; }
  else if (h < 240) { r = 0; g = x; b = c; }
  else if (h < 300) { r = x; g = 0; b = c; }
  else { r = c; g = 0; b = x; }

  const toHex = (v) => {
    const val = Math.round((v + m) * 255).toString(16);
    return val.length === 1 ? '0' + val : val;
  };

  return '#' + toHex(r) + toHex(g) + toHex(b);
}

/**
 * Convert HEX to RGB object.
 */
function hexToRgb(hex) {
  hex = hex.replace(/^#/, '');
  return {
    r: parseInt(hex.substring(0, 2), 16),
    g: parseInt(hex.substring(2, 4), 16),
    b: parseInt(hex.substring(4, 6), 16)
  };
}

/**
 * Format a HEX color in the currently selected format.
 * @param {string} hex - Color in "#rrggbb" format
 * @returns {string} Formatted color string
 */
function formatColor(hex) {
  const upper = hex.toUpperCase();
  if (currentFormat === 'hex') {
    return upper;
  }
  if (currentFormat === 'rgb') {
    const rgb = hexToRgb(hex);
    return 'rgb(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ')';
  }
  if (currentFormat === 'hsl') {
    const hsl = hexToHsl(hex);
    return 'hsl(' + hsl.h + ', ' + hsl.s + '%, ' + hsl.l + '%)';
  }
  return upper;
}

/**
 * Determine if text on a given background should be light or dark.
 * @param {string} hex - Background color in HEX
 * @returns {string} "#ffffff" or "#000000"
 */
function getContrastTextColor(hex) {
  hex = hex.replace(/^#/, '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.55 ? '#000000' : '#ffffff';
}

// ===== WCAG Contrast Ratio =====

/**
 * Calculate relative luminance per WCAG 2.0.
 * @param {string} hex
 * @returns {number} Relative luminance (0-1)
 */
function relativeLuminance(hex) {
  hex = hex.replace(/^#/, '');
  const srgb = [
    parseInt(hex.substring(0, 2), 16) / 255,
    parseInt(hex.substring(2, 4), 16) / 255,
    parseInt(hex.substring(4, 6), 16) / 255
  ];
  const lin = srgb.map(c => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
}

/**
 * Calculate WCAG contrast ratio between two colors.
 * @param {string} hex1
 * @param {string} hex2
 * @returns {number} Contrast ratio (1-21)
 */
function contrastRatio(hex1, hex2) {
  const l1 = relativeLuminance(hex1);
  const l2 = relativeLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Get WCAG compliance level.
 * @param {number} ratio
 * @returns {{aa: boolean, aaa: boolean}}
 */
function wcagLevel(ratio) {
  return {
    aa: ratio >= 4.5,
    aaa: ratio >= 7
  };
}

// ===== Color Scheme Generators =====

function complementary(hsl) {
  return [
    hslToHex(hsl.h, hsl.s, hsl.l),
    hslToHex(hsl.h + 180, hsl.s, hsl.l)
  ];
}

function analogous(hsl) {
  return [
    hslToHex(hsl.h - 60, hsl.s, hsl.l),
    hslToHex(hsl.h - 30, hsl.s, hsl.l),
    hslToHex(hsl.h, hsl.s, hsl.l),
    hslToHex(hsl.h + 30, hsl.s, hsl.l),
    hslToHex(hsl.h + 60, hsl.s, hsl.l)
  ];
}

function triadic(hsl) {
  return [
    hslToHex(hsl.h, hsl.s, hsl.l),
    hslToHex(hsl.h + 120, hsl.s, hsl.l),
    hslToHex(hsl.h + 240, hsl.s, hsl.l)
  ];
}

function splitComplementary(hsl) {
  return [
    hslToHex(hsl.h, hsl.s, hsl.l),
    hslToHex(hsl.h + 150, hsl.s, hsl.l),
    hslToHex(hsl.h + 210, hsl.s, hsl.l)
  ];
}

function monochromatic(hsl) {
  return [
    hslToHex(hsl.h, Math.max(hsl.s - 20, 0), Math.min(hsl.l + 30, 95)),
    hslToHex(hsl.h, Math.max(hsl.s - 10, 0), Math.min(hsl.l + 15, 90)),
    hslToHex(hsl.h, hsl.s, hsl.l),
    hslToHex(hsl.h, Math.min(hsl.s + 10, 100), Math.max(hsl.l - 15, 10)),
    hslToHex(hsl.h, Math.min(hsl.s + 20, 100), Math.max(hsl.l - 30, 5))
  ];
}

// Scheme definitions
var SCHEMES = [
  {
    name: 'Complementary',
    nameZh: '互补色',
    desc: 'Hue rotated 180 degrees',
    generate: complementary,
    expectedCount: 2
  },
  {
    name: 'Analogous',
    nameZh: '类似色',
    desc: 'Adjacent hues',
    generate: analogous,
    expectedCount: 5
  },
  {
    name: 'Triadic',
    nameZh: '三等分色',
    desc: 'Three evenly spaced hues',
    generate: triadic,
    expectedCount: 3
  },
  {
    name: 'Split-Complementary',
    nameZh: '分裂互补色',
    desc: 'Complement split by 30 degrees',
    generate: splitComplementary,
    expectedCount: 3
  },
  {
    name: 'Monochromatic',
    nameZh: '单色',
    desc: 'Same hue, varied lightness',
    generate: monochromatic,
    expectedCount: 5
  }
];

// ===== DOM Elements =====
var colorPicker = document.getElementById('colorPicker');
var hexInput = document.getElementById('hexInput');
var baseColorPreview = document.getElementById('baseColorPreview');
var baseColorLabel = document.getElementById('baseColorLabel');
var schemesSection = document.getElementById('schemesSection');
var toast = document.getElementById('toast');
var formatToggle = document.getElementById('formatToggle');
var randomBtn = document.getElementById('randomBtn');
var themeToggle = document.getElementById('themeToggle');
var favoritesToggleBtn = document.getElementById('favoritesToggleBtn');
var favoritesPanel = document.getElementById('favoritesPanel');
var favoritesCloseBtn = document.getElementById('favoritesCloseBtn');
var favoritesList = document.getElementById('favoritesList');

var toastTimer = null;

// ===== Rendering =====

/**
 * Render all color schemes based on the given HEX color.
 */
function renderSchemes(hex) {
  var hsl = hexToHsl(hex);
  schemesSection.innerHTML = '';

  SCHEMES.forEach(function(scheme, schemeIdx) {
    var colors = scheme.generate(hsl);
    var card = document.createElement('div');
    card.className = 'scheme-card';
    card.dataset.schemeIndex = schemeIdx;

    // Header with title + actions
    var header = document.createElement('div');
    header.className = 'scheme-header';

    var titleArea = document.createElement('div');
    titleArea.className = 'scheme-title-area';
    titleArea.innerHTML =
      '<h3>' + scheme.name + ' <span style="color:var(--text-secondary);font-weight:400;">(' + scheme.nameZh + ')</span></h3>' +
      '<div class="scheme-desc">' + scheme.desc + ' &mdash; ' + colors.length + ' colors</div>';

    var actions = document.createElement('div');
    actions.className = 'scheme-actions';

    // Favorite button
    var favBtn = document.createElement('button');
    favBtn.className = 'btn btn-secondary';
    favBtn.textContent = 'Save';
    favBtn.title = 'Save this palette';
    favBtn.addEventListener('click', function() {
      saveFavorite(scheme.name, colors);
    });

    // Export dropdown
    var exportWrap = document.createElement('div');
    exportWrap.className = 'export-dropdown';

    var exportBtn = document.createElement('button');
    exportBtn.className = 'btn btn-secondary';
    exportBtn.textContent = 'Export';
    exportBtn.title = 'Export palette';
    exportBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      var menu = exportWrap.querySelector('.export-menu');
      closeAllExportMenus();
      menu.classList.toggle('show');
    });

    var exportMenu = document.createElement('div');
    exportMenu.className = 'export-menu';

    var cssBtn = document.createElement('button');
    cssBtn.className = 'export-menu-item';
    cssBtn.textContent = 'Copy as CSS Variables';
    cssBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      exportAsCSS(scheme.name, colors);
      closeAllExportMenus();
    });

    var jsonBtn = document.createElement('button');
    jsonBtn.className = 'export-menu-item';
    jsonBtn.textContent = 'Copy as JSON';
    jsonBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      exportAsJSON(scheme.name, colors);
      closeAllExportMenus();
    });

    exportMenu.appendChild(cssBtn);
    exportMenu.appendChild(jsonBtn);
    exportWrap.appendChild(exportBtn);
    exportWrap.appendChild(exportMenu);

    actions.appendChild(favBtn);
    actions.appendChild(exportWrap);

    header.appendChild(titleArea);
    header.appendChild(actions);

    // Color swatches
    var colorsDiv = document.createElement('div');
    colorsDiv.className = 'scheme-colors';

    colors.forEach(function(color) {
      var swatch = document.createElement('div');
      swatch.className = 'color-swatch';
      swatch.style.backgroundColor = color;
      swatch.dataset.color = color.toUpperCase();
      swatch.setAttribute('title', 'Click to copy ' + formatColor(color));

      var textColor = getContrastTextColor(color);
      var labelBg = textColor === '#ffffff' ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.45)';

      var label = document.createElement('span');
      label.className = 'swatch-label';
      label.textContent = formatColor(color);
      label.style.color = textColor;
      label.style.backgroundColor = labelBg;

      swatch.appendChild(label);
      swatch.addEventListener('click', function() {
        copyToClipboard(formatColor(color));
      });
      colorsDiv.appendChild(swatch);
    });

    // WCAG Contrast section
    var contrastDiv = document.createElement('div');
    contrastDiv.className = 'scheme-contrast';

    var contrastLabel = document.createElement('span');
    contrastLabel.className = 'contrast-label';
    contrastLabel.textContent = 'WCAG Contrast (vs white):';
    contrastDiv.appendChild(contrastLabel);

    colors.forEach(function(color) {
      var ratio = contrastRatio(color, '#ffffff');
      var level = wcagLevel(ratio);
      var badge = document.createElement('span');
      var ratioText = ratio.toFixed(1) + ':1';
      var levelText = level.aaa ? ' AAA' : (level.aa ? ' AA' : ' Fail');
      badge.className = 'contrast-badge ' + (level.aa ? 'contrast-pass' : 'contrast-fail');
      badge.textContent = ratioText + levelText;
      badge.title = color.toUpperCase() + ' vs #FFFFFF';
      contrastDiv.appendChild(badge);
    });

    card.appendChild(header);
    card.appendChild(colorsDiv);
    card.appendChild(contrastDiv);
    schemesSection.appendChild(card);
  });
}

/**
 * Update the base color preview bar.
 */
function updatePreview(hex) {
  baseColorPreview.style.backgroundColor = hex;
  baseColorLabel.textContent = formatColor(hex);
  var textColor = getContrastTextColor(hex);
  baseColorLabel.style.color = textColor;
  baseColorLabel.style.backgroundColor =
    textColor === '#ffffff' ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.4)';
}

// ===== Export Functions =====

/**
 * Export scheme as CSS custom properties.
 */
function exportAsCSS(schemeName, colors) {
  var prefix = schemeName.toLowerCase().replace(/[^a-z]+/g, '-');
  var lines = colors.map(function(c, i) {
    return '  --' + prefix + '-' + (i + 1) + ': ' + c.toUpperCase() + ';';
  });
  var css = ':root {\n' + lines.join('\n') + '\n}';
  copyToClipboard(css);
}

/**
 * Export scheme as JSON.
 */
function exportAsJSON(schemeName, colors) {
  var obj = {
    scheme: schemeName,
    colors: colors.map(function(c) { return c.toUpperCase(); })
  };
  var json = JSON.stringify(obj, null, 2);
  copyToClipboard(json);
}

function closeAllExportMenus() {
  document.querySelectorAll('.export-menu.show').forEach(function(m) {
    m.classList.remove('show');
  });
}

// ===== Favorites (localStorage) =====

var FAVORITES_KEY = 'colorPalette_favorites';

function loadFavorites() {
  try {
    var data = localStorage.getItem(FAVORITES_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

function saveFavoritesToStorage(favs) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs));
}

function saveFavorite(schemeName, colors) {
  var favs = loadFavorites();
  var entry = {
    id: Date.now(),
    scheme: schemeName,
    baseColor: currentBaseHex.toUpperCase(),
    colors: colors.map(function(c) { return c.toUpperCase(); }),
    savedAt: new Date().toISOString()
  };
  favs.unshift(entry);
  saveFavoritesToStorage(favs);
  showToast('Palette saved!');
  renderFavorites();
}

function deleteFavorite(id) {
  var favs = loadFavorites().filter(function(f) { return f.id !== id; });
  saveFavoritesToStorage(favs);
  renderFavorites();
  showToast('Palette removed');
}

function renderFavorites() {
  var favs = loadFavorites();
  favoritesList.innerHTML = '';

  if (favs.length === 0) {
    favoritesList.innerHTML = '<p class="empty-msg">No saved palettes yet.</p>';
    return;
  }

  favs.forEach(function(fav) {
    var item = document.createElement('div');
    item.className = 'fav-item';

    var header = document.createElement('div');
    header.className = 'fav-item-header';

    var info = document.createElement('span');
    info.textContent = fav.scheme + ' (' + fav.baseColor + ')';

    var delBtn = document.createElement('button');
    delBtn.className = 'btn btn-danger';
    delBtn.textContent = 'Delete';
    delBtn.style.fontSize = '0.7rem';
    delBtn.style.padding = '0.2rem 0.5rem';
    delBtn.addEventListener('click', function() {
      deleteFavorite(fav.id);
    });

    header.appendChild(info);
    header.appendChild(delBtn);

    var colorsRow = document.createElement('div');
    colorsRow.className = 'fav-item-colors';

    fav.colors.forEach(function(c) {
      var swatch = document.createElement('div');
      swatch.className = 'fav-color-swatch';
      swatch.style.backgroundColor = c;
      swatch.title = c;
      swatch.addEventListener('click', function() {
        copyToClipboard(c);
      });
      colorsRow.appendChild(swatch);
    });

    item.appendChild(header);
    item.appendChild(colorsRow);
    favoritesList.appendChild(item);
  });
}

// ===== Clipboard =====

function copyToClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(function() {
      showToast('Copied ' + (text.length > 30 ? text.substring(0, 30) + '...' : text));
    }).catch(function() {
      fallbackCopy(text);
    });
  } else {
    fallbackCopy(text);
  }
}

function fallbackCopy(text) {
  var textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  try {
    document.execCommand('copy');
    showToast('Copied ' + (text.length > 30 ? text.substring(0, 30) + '...' : text));
  } catch (e) {
    showToast('Failed to copy');
  }
  document.body.removeChild(textarea);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(function() {
    toast.classList.remove('show');
  }, 1800);
}

// ===== Event Listeners =====

function normalizeHex(value) {
  value = value.replace(/[^0-9a-fA-F]/g, '');
  if (value.length === 3) {
    value = value[0] + value[0] + value[1] + value[1] + value[2] + value[2];
  }
  if (value.length === 6) {
    return value.toUpperCase();
  }
  return null;
}

function updateColor(hex) {
  currentBaseHex = hex;
  colorPicker.value = hex.toLowerCase();
  hexInput.value = hex.replace('#', '').toUpperCase();
  updatePreview(hex);
  renderSchemes(hex);
}

// Color picker changes
colorPicker.addEventListener('input', function () {
  updateColor(this.value);
});

// HEX input changes
hexInput.addEventListener('input', function () {
  var normalized = normalizeHex(this.value);
  if (normalized) {
    var hex = '#' + normalized;
    currentBaseHex = hex;
    colorPicker.value = hex.toLowerCase();
    updatePreview(hex);
    renderSchemes(hex);
  }
});

// Base color preview click to copy
baseColorPreview.addEventListener('click', function () {
  copyToClipboard(baseColorLabel.textContent);
});

// Format toggle buttons
formatToggle.addEventListener('click', function(e) {
  var btn = e.target.closest('.format-btn');
  if (!btn) return;
  var format = btn.dataset.format;
  if (format === currentFormat) return;

  currentFormat = format;
  formatToggle.querySelectorAll('.format-btn').forEach(function(b) {
    b.classList.remove('active');
  });
  btn.classList.add('active');

  // Re-render with new format
  updatePreview(currentBaseHex);
  renderSchemes(currentBaseHex);
});

// Random color button
randomBtn.addEventListener('click', function() {
  var randomHex = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
  updateColor(randomHex);
});

// Theme toggle
themeToggle.addEventListener('click', function() {
  var html = document.documentElement;
  var current = html.getAttribute('data-theme');
  var next = current === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  try {
    localStorage.setItem('colorPalette_theme', next);
  } catch (e) { /* ignore */ }
});

// Favorites panel toggle
favoritesToggleBtn.addEventListener('click', function() {
  var visible = favoritesPanel.style.display !== 'none';
  if (visible) {
    favoritesPanel.style.display = 'none';
  } else {
    favoritesPanel.style.display = '';
    renderFavorites();
  }
});

favoritesCloseBtn.addEventListener('click', function() {
  favoritesPanel.style.display = 'none';
});

// Close export menus on outside click
document.addEventListener('click', function() {
  closeAllExportMenus();
});

// ===== Initialization =====

function init() {
  // Restore theme
  try {
    var savedTheme = localStorage.getItem('colorPalette_theme');
    if (savedTheme === 'dark' || savedTheme === 'light') {
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  } catch (e) { /* ignore */ }

  var defaultColor = '#4A90D9';
  updateColor(defaultColor);
}

init();
