(function () {
  'use strict';

  var AMBIGUOUS_CHARS = '0OlI1';

  var CHARSETS = {
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
  };

  var STRENGTH_LEVELS = [
    { label: 'Weak',        color: '#e74c3c', width: 20 },
    { label: 'Fair',        color: '#e67e22', width: 40 },
    { label: 'Good',        color: '#f1c40f', width: 60 },
    { label: 'Strong',      color: '#27ae60', width: 80 },
    { label: 'Very Strong', color: '#0e8a16', width: 100 }
  ];

  var history = [];

  var els = {
    password: document.getElementById('password'),
    copyBtn: document.getElementById('copyBtn'),
    generateBtn: document.getElementById('generateBtn'),
    lengthSlider: document.getElementById('lengthSlider'),
    lengthValue: document.getElementById('lengthValue'),
    strengthFill: document.getElementById('strengthFill'),
    strengthLabel: document.getElementById('strengthLabel'),
    entropyValue: document.getElementById('entropyValue'),
    uppercase: document.getElementById('uppercase'),
    lowercase: document.getElementById('lowercase'),
    numbers: document.getElementById('numbers'),
    symbols: document.getElementById('symbols'),
    excludeAmbiguous: document.getElementById('excludeAmbiguous'),
    historyList: document.getElementById('historyList')
  };

  function removeAmbiguous(str) {
    var result = '';
    for (var i = 0; i < str.length; i++) {
      if (AMBIGUOUS_CHARS.indexOf(str[i]) === -1) {
        result += str[i];
      }
    }
    return result;
  }

  function getCharset() {
    var charset = '';
    if (els.uppercase.checked) charset += CHARSETS.uppercase;
    if (els.lowercase.checked) charset += CHARSETS.lowercase;
    if (els.numbers.checked) charset += CHARSETS.numbers;
    if (els.symbols.checked) charset += CHARSETS.symbols;
    if (els.excludeAmbiguous.checked) {
      charset = removeAmbiguous(charset);
    }
    return charset;
  }

  function generatePassword() {
    var charset = getCharset();
    if (!charset) return '';
    var length = parseInt(els.lengthSlider.value, 10);
    var array = new Uint32Array(length);
    crypto.getRandomValues(array);
    var password = '';
    for (var i = 0; i < length; i++) {
      password += charset[array[i] % charset.length];
    }
    return password;
  }

  function calcEntropy(length, charsetSize) {
    if (charsetSize <= 1) return 0;
    return length * Math.log2(charsetSize);
  }

  function calcStrengthLevel(entropy) {
    if (entropy < 36) return 0;
    if (entropy < 60) return 1;
    if (entropy < 80) return 2;
    if (entropy < 100) return 3;
    return 4;
  }

  function updateStrength() {
    var charset = getCharset();
    var length = parseInt(els.lengthSlider.value, 10);
    var entropy = calcEntropy(length, charset.length);
    var level = calcStrengthLevel(entropy);
    var s = STRENGTH_LEVELS[level];
    els.strengthFill.style.width = s.width + '%';
    els.strengthFill.style.background = s.color;
    els.strengthLabel.textContent = s.label;
    els.strengthLabel.style.color = s.color;
    els.entropyValue.textContent = Math.round(entropy) + ' bits';
  }

  function addToHistory(pw) {
    if (!pw) return;
    history.unshift(pw);
    if (history.length > 10) history.pop();
    renderHistory();
  }

  function renderHistory() {
    els.historyList.innerHTML = '';
    for (var i = 0; i < history.length; i++) {
      var li = document.createElement('li');
      li.textContent = history[i];
      li.title = 'Click to copy';
      li.addEventListener('click', (function (pw) {
        return function () {
          navigator.clipboard.writeText(pw);
        };
      })(history[i]));
      els.historyList.appendChild(li);
    }
  }

  function updatePassword() {
    var oldPw = els.password.textContent;
    var pw = generatePassword();
    els.password.textContent = pw;
    updateStrength();
    if (oldPw && oldPw !== 'generating...') {
      addToHistory(oldPw);
    }
  }

  // Prevent unchecking the last active checkbox
  function enforceAtLeastOne(e) {
    var checkboxes = [els.uppercase, els.lowercase, els.numbers, els.symbols];
    var checked = checkboxes.filter(function (cb) { return cb.checked; });
    if (checked.length === 0) {
      e.target.checked = true;
    }
  }

  // Event listeners
  els.generateBtn.addEventListener('click', updatePassword);

  // AC-10: auto-generate on slider change
  els.lengthSlider.addEventListener('input', function () {
    els.lengthValue.textContent = els.lengthSlider.value;
    updatePassword();
  });

  // AC-10: auto-generate on checkbox change
  var allCheckboxes = [els.uppercase, els.lowercase, els.numbers, els.symbols, els.excludeAmbiguous];
  allCheckboxes.forEach(function (cb) {
    cb.addEventListener('change', function (e) {
      if (cb !== els.excludeAmbiguous) {
        enforceAtLeastOne(e);
      }
      updatePassword();
    });
  });

  els.copyBtn.addEventListener('click', function () {
    var pw = els.password.textContent;
    if (!pw) return;
    navigator.clipboard.writeText(pw).then(function () {
      els.copyBtn.textContent = 'Copied!';
      els.copyBtn.classList.add('copied');
      setTimeout(function () {
        els.copyBtn.textContent = 'Copy';
        els.copyBtn.classList.remove('copied');
      }, 1500);
    });
  });

  // Generate initial password on load
  updatePassword();
})();
