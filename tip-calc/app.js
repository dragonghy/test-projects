(function () {
  const billInput = document.getElementById('bill-amount');
  const customTipInput = document.getElementById('custom-tip');
  const splitInput = document.getElementById('split-count');
  const tipButtons = document.querySelectorAll('.tip-btn');
  const splitMinus = document.getElementById('split-minus');
  const splitPlus = document.getElementById('split-plus');
  const resetBtn = document.getElementById('reset-btn');
  const currencySelect = document.getElementById('currency-select');
  const roundButtons = document.querySelectorAll('.round-btn');

  const tipAmountEl = document.getElementById('tip-amount');
  const totalAmountEl = document.getElementById('total-amount');
  const tipPerPersonEl = document.getElementById('tip-per-person');
  const totalPerPersonEl = document.getElementById('total-per-person');

  const historySection = document.getElementById('history-section');
  const historyList = document.getElementById('history-list');

  let selectedTipPercent = null;
  let roundMode = 'none'; // 'none', 'up', 'down'
  var history = [];

  var currencies = {
    USD: { symbol: '$', decimals: 2 },
    EUR: { symbol: '\u20AC', decimals: 2 },
    GBP: { symbol: '\u00A3', decimals: 2 },
    JPY: { symbol: '\u00A5', decimals: 0 },
    CNY: { symbol: '\u00A5', decimals: 2 }
  };

  function getCurrency() {
    return currencies[currencySelect.value] || currencies.USD;
  }

  function getBill() {
    var val = parseFloat(billInput.value);
    return val > 0 ? val : 0;
  }

  function getTipPercent() {
    if (selectedTipPercent !== null) return selectedTipPercent;
    var val = parseFloat(customTipInput.value);
    if (!isNaN(val) && val >= 0 && val <= 100) return val;
    return 0;
  }

  function getSplit() {
    var val = parseInt(splitInput.value, 10);
    if (val >= 1 && val <= 20) return val;
    return 1;
  }

  function formatMoney(amount) {
    var cur = getCurrency();
    return cur.symbol + amount.toFixed(cur.decimals);
  }

  function applyRounding(amount) {
    var cur = getCurrency();
    if (roundMode === 'up') {
      var factor = Math.pow(10, cur.decimals);
      return Math.ceil(amount * factor) / factor;
    }
    if (roundMode === 'down') {
      var factor = Math.pow(10, cur.decimals);
      return Math.floor(amount * factor) / factor;
    }
    return amount;
  }

  function calculate() {
    var bill = getBill();
    var tipPercent = getTipPercent();
    var split = getSplit();

    var tipAmount = bill * (tipPercent / 100);
    var totalAmount = bill + tipAmount;
    var tipPerPerson = split > 0 ? tipAmount / split : 0;
    var totalPerPerson = split > 0 ? totalAmount / split : 0;

    // Apply rounding to per-person amounts
    tipPerPerson = applyRounding(tipPerPerson);
    totalPerPerson = applyRounding(totalPerPerson);

    tipAmountEl.textContent = formatMoney(tipAmount);
    totalAmountEl.textContent = formatMoney(totalAmount);
    tipPerPersonEl.textContent = formatMoney(tipPerPerson);
    totalPerPersonEl.textContent = formatMoney(totalPerPerson);

    // Add to history if valid calculation
    if (bill > 0 && tipPercent > 0) {
      addHistory(bill, tipPercent, split, totalPerPerson);
    }
  }

  function addHistory(bill, tipPercent, split, totalPerPerson) {
    var cur = getCurrency();
    var entry = {
      bill: cur.symbol + bill.toFixed(cur.decimals),
      tipPercent: tipPercent + '%',
      split: split,
      perPerson: formatMoney(totalPerPerson)
    };

    // Avoid duplicate consecutive entries
    if (history.length > 0) {
      var last = history[0];
      if (last.bill === entry.bill && last.tipPercent === entry.tipPercent &&
          last.split === entry.split && last.perPerson === entry.perPerson) {
        return;
      }
    }

    history.unshift(entry);
    if (history.length > 5) history.pop();
    renderHistory();
  }

  function renderHistory() {
    if (history.length === 0) {
      historySection.style.display = 'none';
      return;
    }
    historySection.style.display = 'block';
    historyList.innerHTML = '';
    history.forEach(function (entry) {
      var li = document.createElement('li');
      li.innerHTML = '<span class="hist-detail">' + entry.bill + ' &middot; ' +
        entry.tipPercent + ' &middot; ' + entry.split + 'p</span>' +
        '<span class="hist-result">' + entry.perPerson + '/ea</span>';
      historyList.appendChild(li);
    });
  }

  // Tip preset buttons
  tipButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      tipButtons.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      selectedTipPercent = parseFloat(btn.dataset.tip);
      customTipInput.value = '';
      calculate();
    });
  });

  // Custom tip input
  customTipInput.addEventListener('input', function () {
    tipButtons.forEach(function (b) { b.classList.remove('active'); });
    selectedTipPercent = null;
    calculate();
  });

  // Bill input
  billInput.addEventListener('input', calculate);

  // Currency change
  currencySelect.addEventListener('change', function () {
    calculate();
  });

  // Round toggle buttons
  roundButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var mode = btn.dataset.round;
      if (roundMode === mode) {
        // Toggle off - back to none
        roundMode = 'none';
        roundButtons.forEach(function (b) { b.classList.remove('active'); });
      } else {
        roundMode = mode;
        roundButtons.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
      }
      calculate();
    });
  });

  // Split controls
  splitInput.addEventListener('input', function () {
    var val = parseInt(splitInput.value, 10);
    if (isNaN(val) || val < 1) val = 1;
    if (val > 20) val = 20;
    splitInput.value = val;
    calculate();
  });

  splitMinus.addEventListener('click', function () {
    var val = parseInt(splitInput.value, 10) || 1;
    if (val > 1) {
      splitInput.value = val - 1;
      calculate();
    }
  });

  splitPlus.addEventListener('click', function () {
    var val = parseInt(splitInput.value, 10) || 1;
    if (val < 20) {
      splitInput.value = val + 1;
      calculate();
    }
  });

  // Reset
  resetBtn.addEventListener('click', function () {
    billInput.value = '';
    customTipInput.value = '';
    splitInput.value = 1;
    selectedTipPercent = null;
    roundMode = 'none';
    currencySelect.value = 'USD';
    tipButtons.forEach(function (b) { b.classList.remove('active'); });
    roundButtons.forEach(function (b) { b.classList.remove('active'); });
    history = [];
    renderHistory();
    calculate();
  });

  // Prevent negative values on number inputs
  billInput.addEventListener('keydown', function (e) {
    if (e.key === '-' || e.key === 'e') e.preventDefault();
  });
  customTipInput.addEventListener('keydown', function (e) {
    if (e.key === '-' || e.key === 'e') e.preventDefault();
  });

  // Initial calculation
  calculate();
})();
