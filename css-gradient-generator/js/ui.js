/**
 * UI interactions: copy, type switch, angle/position controls,
 * fullscreen, undo/redo, direction wheel, preset gallery
 */
const UI = {
  init() {
    this.initTypeSwitch();
    this.initAngleControl();
    this.initRadialControl();
    this.initCopyButton();
    this.initFullscreen();
    this.initUndoRedo();
    this.initDirectionWheel();
    this.initPresetGallery();
  },

  /* ── Type Switch ── */
  initTypeSwitch() {
    const btns = document.querySelectorAll('.type-btn');
    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        History.saveState();
        btns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        Gradient.type = btn.dataset.type;
        this.toggleControls();
        App.updatePreview();
      });
    });
  },

  syncTypeButtons() {
    document.querySelectorAll('.type-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.type === Gradient.type);
    });
    this.toggleControls();
  },

  toggleControls() {
    const linearCtrl = document.getElementById('linear-controls');
    const radialCtrl = document.getElementById('radial-controls');
    if (Gradient.type === 'linear') {
      linearCtrl.style.display = 'block';
      radialCtrl.style.display = 'none';
    } else {
      linearCtrl.style.display = 'none';
      radialCtrl.style.display = 'block';
    }
  },

  /* ── Angle Control ── */
  initAngleControl() {
    const angleInput = document.getElementById('angle-input');
    const angleValue = document.getElementById('angle-value');
    angleInput.addEventListener('mousedown', () => History.saveState());
    angleInput.addEventListener('touchstart', () => History.saveState(), { passive: true });
    angleInput.addEventListener('input', (e) => {
      Gradient.angle = parseInt(e.target.value);
      angleValue.textContent = Gradient.angle + '°';
      this.syncWheel();
      App.updatePreview();
    });
  },

  syncAngleInput() {
    document.getElementById('angle-input').value = Gradient.angle;
    document.getElementById('angle-value').textContent = Gradient.angle + '°';
  },

  /* ── Radial Control ── */
  initRadialControl() {
    const select = document.getElementById('radial-position');
    select.addEventListener('change', (e) => {
      History.saveState();
      Gradient.radialPosition = e.target.value;
      App.updatePreview();
    });
  },

  syncRadialSelect() {
    document.getElementById('radial-position').value = Gradient.radialPosition;
  },

  /* ── Copy Button ── */
  initCopyButton() {
    const btn = document.getElementById('copy-btn');
    btn.addEventListener('click', async () => {
      const code = document.getElementById('css-output').textContent;
      try {
        await navigator.clipboard.writeText(code);
      } catch {
        const ta = document.createElement('textarea');
        ta.value = code;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      btn.textContent = 'Copied!';
      btn.classList.add('copied');
      setTimeout(() => {
        btn.textContent = 'Copy';
        btn.classList.remove('copied');
      }, 2000);
    });
  },

  /* ── Fullscreen Preview ── */
  initFullscreen() {
    const overlay = document.getElementById('fullscreen-overlay');
    document.getElementById('fullscreen-btn').addEventListener('click', () => {
      overlay.style.background = Gradient.getPreviewStyle();
      overlay.classList.add('active');
    });
    document.getElementById('fullscreen-close').addEventListener('click', () => {
      overlay.classList.remove('active');
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.classList.contains('active')) {
        overlay.classList.remove('active');
      }
    });
  },

  /* ── Undo / Redo ── */
  initUndoRedo() {
    document.getElementById('undo-btn').addEventListener('click', () => History.undo());
    document.getElementById('redo-btn').addEventListener('click', () => History.redo());
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        History.undo();
      }
      if ((e.ctrlKey || e.metaKey) && ((e.key === 'z' && e.shiftKey) || e.key === 'y')) {
        e.preventDefault();
        History.redo();
      }
    });
  },

  updateUndoRedoButtons() {
    document.getElementById('undo-btn').disabled = History.undoStack.length === 0;
    document.getElementById('redo-btn').disabled = History.redoStack.length === 0;
  },

  /* ── Direction Wheel ── */
  initDirectionWheel() {
    const wheel = document.getElementById('direction-wheel');
    const pointer = document.getElementById('wheel-pointer');
    if (!wheel) return;

    let dragging = false;

    const updateAngleFromEvent = (e) => {
      const rect = wheel.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const angle = Math.round(Math.atan2(clientX - cx, -(clientY - cy)) * 180 / Math.PI + 360) % 360;
      Gradient.angle = angle;
      this.syncAngleInput();
      this.syncWheel();
      App.updatePreview();
    };

    wheel.addEventListener('mousedown', (e) => {
      History.saveState();
      dragging = true;
      updateAngleFromEvent(e);
    });
    wheel.addEventListener('touchstart', (e) => {
      History.saveState();
      dragging = true;
      updateAngleFromEvent(e);
    }, { passive: true });

    document.addEventListener('mousemove', (e) => { if (dragging) updateAngleFromEvent(e); });
    document.addEventListener('touchmove', (e) => { if (dragging) updateAngleFromEvent(e); }, { passive: true });
    document.addEventListener('mouseup', () => { dragging = false; });
    document.addEventListener('touchend', () => { dragging = false; });
  },

  syncWheel() {
    const pointer = document.getElementById('wheel-pointer');
    if (pointer) {
      pointer.style.transform = `rotate(${Gradient.angle}deg)`;
    }
  },

  /* ── Preset Gallery ── */
  initPresetGallery() {
    const grid = document.getElementById('preset-grid');
    if (!grid) return;
    Presets.data.forEach((preset, i) => {
      const item = document.createElement('button');
      item.className = 'preset-item';
      item.title = preset.name;
      item.style.background = Presets.getPreviewStyle(preset);

      const label = document.createElement('span');
      label.className = 'preset-label';
      label.textContent = preset.name;
      item.appendChild(label);

      item.addEventListener('click', () => {
        History.saveState();
        Presets.apply(i);
        this.syncTypeButtons();
        this.syncAngleInput();
        this.syncRadialSelect();
        this.syncWheel();
        ColorStops.render();
        App.updatePreview();
      });
      grid.appendChild(item);
    });
  }
};

/* ── History (Undo/Redo) ── */
const History = {
  undoStack: [],
  redoStack: [],
  maxSize: 50,

  saveState() {
    this.undoStack.push(Gradient.getSnapshot());
    if (this.undoStack.length > this.maxSize) this.undoStack.shift();
    this.redoStack = [];
    UI.updateUndoRedoButtons();
  },

  undo() {
    if (this.undoStack.length === 0) return;
    this.redoStack.push(Gradient.getSnapshot());
    Gradient.applySnapshot(this.undoStack.pop());
    this._syncAll();
  },

  redo() {
    if (this.redoStack.length === 0) return;
    this.undoStack.push(Gradient.getSnapshot());
    Gradient.applySnapshot(this.redoStack.pop());
    this._syncAll();
  },

  _syncAll() {
    UI.syncTypeButtons();
    UI.syncAngleInput();
    UI.syncRadialSelect();
    UI.syncWheel();
    UI.updateUndoRedoButtons();
    ColorStops.render();
    App.updatePreview();
  }
};
