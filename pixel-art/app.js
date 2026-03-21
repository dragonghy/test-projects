(() => {
  'use strict';

  // --- Constants ---
  const EXPORT_SIZE = 512;
  const PALETTE_COLORS = [
    '#000000', '#ffffff', '#ff0000', '#00ff00',
    '#0000ff', '#ffff00', '#ff00ff', '#00ffff',
    '#ff8800', '#8800ff', '#0088ff', '#88ff00',
    '#ff0088', '#888888', '#444444', '#cccccc'
  ];

  // --- State ---
  let gridSize = 16;
  let currentColor = '#000000';
  let currentTool = 'pen';
  let showGrid = true;
  let mirrorMode = false;
  let isDrawing = false;
  let onionSkin = false;

  // Animation frames: array of 2D pixel arrays
  let frames = [createEmptyGrid(gridSize)];
  let currentFrameIndex = 0;
  let isPlaying = false;
  let playInterval = null;
  let fps = 4;

  // History for undo/redo
  const undoStack = [];
  const redoStack = [];
  const MAX_HISTORY = 100;

  function createEmptyGrid(size) {
    return Array.from({ length: size }, () => Array(size).fill(null));
  }

  function cloneGrid(grid) {
    return grid.map(row => [...row]);
  }

  // Current pixels shortcut
  function pixels() {
    return frames[currentFrameIndex];
  }

  // --- DOM refs ---
  const canvas = document.getElementById('pixel-canvas');
  const ctx = canvas.getContext('2d');
  const currentColorEl = document.getElementById('current-color');
  const paletteEl = document.getElementById('palette');
  const colorPicker = document.getElementById('color-picker');
  const btnClear = document.getElementById('btn-clear');
  const btnExport = document.getElementById('btn-export');
  const btnUndo = document.getElementById('btn-undo');
  const btnRedo = document.getElementById('btn-redo');
  const btnGrid = document.getElementById('btn-grid');
  const btnMirror = document.getElementById('btn-mirror');
  const toolBtns = document.querySelectorAll('.tool-btn');
  const canvasWrap = document.getElementById('canvas-wrap');
  const gridSizeSelect = document.getElementById('grid-size-select');
  const btnAddFrame = document.getElementById('btn-add-frame');
  const btnDelFrame = document.getElementById('btn-del-frame');
  const btnPlay = document.getElementById('btn-play');
  const btnOnion = document.getElementById('btn-onion');
  const fpsInput = document.getElementById('fps-input');
  const frameListEl = document.getElementById('frame-list');

  // --- Canvas sizing ---
  let cellSize = 1;

  function resizeCanvas() {
    const wrapRect = canvasWrap.getBoundingClientRect();
    const maxDim = Math.min(wrapRect.width, wrapRect.height) - 32;
    cellSize = Math.floor(maxDim / gridSize);
    if (cellSize < 4) cellSize = 4;
    const totalSize = cellSize * gridSize;
    canvas.width = totalSize;
    canvas.height = totalSize;
    render();
  }

  // --- Rendering ---
  function render() {
    const p = pixels();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw checkerboard background for transparency
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        const px = x * cellSize;
        const py = y * cellSize;
        ctx.fillStyle = ((x + y) % 2 === 0) ? '#2a2a3e' : '#222236';
        ctx.fillRect(px, py, cellSize, cellSize);
      }
    }

    // Onion skin: draw previous frame at reduced opacity
    if (onionSkin && currentFrameIndex > 0 && !isPlaying) {
      const prevFrame = frames[currentFrameIndex - 1];
      ctx.globalAlpha = 0.3;
      for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
          if (prevFrame[y] && prevFrame[y][x]) {
            ctx.fillStyle = prevFrame[y][x];
            ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
          }
        }
      }
      ctx.globalAlpha = 1.0;
    }

    // Draw current frame pixels
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        if (p[y][x]) {
          ctx.fillStyle = p[y][x];
          ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
        }
      }
    }

    // Grid lines
    if (showGrid) {
      ctx.strokeStyle = 'rgba(255,255,255,0.12)';
      ctx.lineWidth = 1;
      for (let i = 0; i <= gridSize; i++) {
        const pos = i * cellSize + 0.5;
        ctx.beginPath();
        ctx.moveTo(pos, 0);
        ctx.lineTo(pos, canvas.height);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, pos);
        ctx.lineTo(canvas.width, pos);
        ctx.stroke();
      }
    }

    // Mirror mode center line indicator
    if (mirrorMode) {
      ctx.strokeStyle = 'rgba(233, 69, 96, 0.5)';
      ctx.lineWidth = 2;
      const centerX = (gridSize / 2) * cellSize;
      ctx.beginPath();
      ctx.moveTo(centerX, 0);
      ctx.lineTo(centerX, canvas.height);
      ctx.stroke();
    }
  }

  // --- History ---
  function saveState() {
    // Save all frames state for undo
    undoStack.push({
      frames: frames.map(f => cloneGrid(f)),
      currentFrameIndex
    });
    if (undoStack.length > MAX_HISTORY) undoStack.shift();
    redoStack.length = 0;
  }

  function restoreState(state) {
    frames = state.frames.map(f => cloneGrid(f));
    currentFrameIndex = Math.min(state.currentFrameIndex, frames.length - 1);
    gridSize = frames[0].length;
    gridSizeSelect.value = gridSize;
    renderFrameList();
    resizeCanvas();
  }

  function undo() {
    if (undoStack.length === 0) return;
    redoStack.push({
      frames: frames.map(f => cloneGrid(f)),
      currentFrameIndex
    });
    restoreState(undoStack.pop());
  }

  function redo() {
    if (redoStack.length === 0) return;
    undoStack.push({
      frames: frames.map(f => cloneGrid(f)),
      currentFrameIndex
    });
    restoreState(redoStack.pop());
  }

  // --- Tools ---
  function getCellFromEvent(e) {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / cellSize);
    const y = Math.floor((e.clientY - rect.top) / cellSize);
    if (x < 0 || x >= gridSize || y < 0 || y >= gridSize) return null;
    return { x, y };
  }

  function setPixel(x, y, color) {
    pixels()[y][x] = color;
  }

  function floodFill(startX, startY, fillColor) {
    const p = pixels();
    const targetColor = p[startY][startX];
    if (targetColor === fillColor) return;
    const stack = [{ x: startX, y: startY }];
    while (stack.length > 0) {
      const { x, y } = stack.pop();
      if (x < 0 || x >= gridSize || y < 0 || y >= gridSize) continue;
      if (p[y][x] !== targetColor) continue;
      p[y][x] = fillColor;
      stack.push({ x: x + 1, y }, { x: x - 1, y }, { x, y: y + 1 }, { x, y: y - 1 });
    }
  }

  function applyTool(cell) {
    if (!cell) return;
    const { x, y } = cell;
    switch (currentTool) {
      case 'pen':
        setPixel(x, y, currentColor);
        if (mirrorMode) {
          const mx = gridSize - 1 - x;
          setPixel(mx, y, currentColor);
        }
        break;
      case 'eraser':
        setPixel(x, y, null);
        if (mirrorMode) {
          const mx = gridSize - 1 - x;
          setPixel(mx, y, null);
        }
        break;
      case 'fill':
        floodFill(x, y, currentColor);
        if (mirrorMode) {
          const mx = gridSize - 1 - x;
          floodFill(mx, y, currentColor);
        }
        break;
      case 'eyedropper':
        if (pixels()[y][x]) {
          setColor(pixels()[y][x]);
        }
        break;
    }
    render();
  }

  // Tracking for drag operations
  let dragStateSaved = false;

  function onCanvasDown(e) {
    if (isPlaying) return;
    e.preventDefault();
    const cell = getCellFromEvent(e);
    if (!cell) return;

    if (currentTool === 'fill' || currentTool === 'eyedropper') {
      saveState();
      applyTool(cell);
      return;
    }

    isDrawing = true;
    dragStateSaved = false;
    saveState();
    dragStateSaved = true;
    applyTool(cell);
  }

  function onCanvasMove(e) {
    if (!isDrawing) return;
    const cell = getCellFromEvent(e);
    applyTool(cell);
  }

  function onCanvasUp() {
    isDrawing = false;
  }

  // --- Color ---
  function setColor(color) {
    currentColor = color;
    currentColorEl.style.background = color;
    colorPicker.value = color;
    document.querySelectorAll('.palette-color').forEach(el => {
      el.classList.toggle('active', el.dataset.color === color);
    });
  }

  // --- Init palette ---
  function initPalette() {
    PALETTE_COLORS.forEach(color => {
      const el = document.createElement('div');
      el.className = 'palette-color';
      el.style.background = color;
      el.dataset.color = color;
      if (color === currentColor) el.classList.add('active');
      el.addEventListener('click', () => setColor(color));
      paletteEl.appendChild(el);
    });
  }

  // --- Tool selection ---
  function selectTool(tool) {
    currentTool = tool;
    toolBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.tool === tool));
  }

  // --- Grid size change ---
  function changeGridSize(newSize) {
    if (newSize === gridSize) return;
    if (!confirm('Changing grid size will clear the canvas and all frames. Continue?')) {
      gridSizeSelect.value = gridSize;
      return;
    }
    saveState();
    gridSize = newSize;
    frames = [createEmptyGrid(gridSize)];
    currentFrameIndex = 0;
    renderFrameList();
    resizeCanvas();
  }

  // --- Mirror mode ---
  function toggleMirror() {
    mirrorMode = !mirrorMode;
    btnMirror.classList.toggle('active', mirrorMode);
    render();
  }

  // --- Animation frames ---
  function addFrame() {
    saveState();
    const newFrame = createEmptyGrid(gridSize);
    frames.splice(currentFrameIndex + 1, 0, newFrame);
    currentFrameIndex++;
    renderFrameList();
    render();
  }

  function deleteFrame() {
    if (frames.length <= 1) return;
    saveState();
    frames.splice(currentFrameIndex, 1);
    if (currentFrameIndex >= frames.length) {
      currentFrameIndex = frames.length - 1;
    }
    renderFrameList();
    render();
  }

  function switchFrame(index) {
    if (index < 0 || index >= frames.length) return;
    currentFrameIndex = index;
    renderFrameList();
    render();
  }

  function renderFrameList() {
    frameListEl.innerHTML = '';
    frames.forEach((frame, i) => {
      const thumb = document.createElement('div');
      thumb.className = 'frame-thumb' + (i === currentFrameIndex ? ' active' : '');
      thumb.title = 'Frame ' + (i + 1);

      // Draw mini thumbnail
      const miniCanvas = document.createElement('canvas');
      const thumbSize = 48;
      miniCanvas.width = thumbSize;
      miniCanvas.height = thumbSize;
      const mctx = miniCanvas.getContext('2d');
      const miniCell = thumbSize / gridSize;

      // Background
      mctx.fillStyle = '#222236';
      mctx.fillRect(0, 0, thumbSize, thumbSize);

      for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
          if (frame[y][x]) {
            mctx.fillStyle = frame[y][x];
            mctx.fillRect(x * miniCell, y * miniCell, miniCell, miniCell);
          }
        }
      }

      thumb.appendChild(miniCanvas);
      const label = document.createElement('span');
      label.textContent = i + 1;
      thumb.appendChild(label);

      thumb.addEventListener('click', () => {
        if (!isPlaying) switchFrame(i);
      });
      frameListEl.appendChild(thumb);
    });
  }

  // --- Animation playback ---
  function togglePlay() {
    if (isPlaying) {
      stopPlayback();
    } else {
      startPlayback();
    }
  }

  function startPlayback() {
    if (frames.length <= 1) return;
    isPlaying = true;
    btnPlay.textContent = '\u23F8 Pause';
    btnPlay.classList.add('active');
    playInterval = setInterval(() => {
      currentFrameIndex = (currentFrameIndex + 1) % frames.length;
      renderFrameList();
      render();
    }, 1000 / fps);
  }

  function stopPlayback() {
    isPlaying = false;
    btnPlay.textContent = '\u25B6 Play';
    btnPlay.classList.remove('active');
    if (playInterval) {
      clearInterval(playInterval);
      playInterval = null;
    }
    render();
  }

  // --- Export ---
  function exportPNG() {
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = EXPORT_SIZE;
    exportCanvas.height = EXPORT_SIZE;
    const ectx = exportCanvas.getContext('2d');
    const exportCell = EXPORT_SIZE / gridSize;
    const p = pixels();

    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        if (p[y][x]) {
          ectx.fillStyle = p[y][x];
          ectx.fillRect(x * exportCell, y * exportCell, exportCell, exportCell);
        }
      }
    }

    const link = document.createElement('a');
    link.download = 'pixel-art.png';
    link.href = exportCanvas.toDataURL('image/png');
    link.click();
  }

  // --- Clear ---
  function clearCanvas() {
    saveState();
    const p = pixels();
    for (let y = 0; y < gridSize; y++)
      for (let x = 0; x < gridSize; x++)
        p[y][x] = null;
    renderFrameList();
    render();
  }

  // --- Event listeners ---
  canvas.addEventListener('mousedown', onCanvasDown);
  canvas.addEventListener('mousemove', onCanvasMove);
  window.addEventListener('mouseup', onCanvasUp);

  // Touch support
  canvas.addEventListener('touchstart', e => {
    e.preventDefault();
    const touch = e.touches[0];
    onCanvasDown(touch);
  }, { passive: false });

  canvas.addEventListener('touchmove', e => {
    e.preventDefault();
    const touch = e.touches[0];
    onCanvasMove(touch);
  }, { passive: false });

  canvas.addEventListener('touchend', onCanvasUp);

  toolBtns.forEach(btn => {
    btn.addEventListener('click', () => selectTool(btn.dataset.tool));
  });

  colorPicker.addEventListener('input', e => setColor(e.target.value));
  btnClear.addEventListener('click', clearCanvas);
  btnExport.addEventListener('click', exportPNG);
  btnUndo.addEventListener('click', undo);
  btnRedo.addEventListener('click', redo);
  btnGrid.addEventListener('click', () => {
    showGrid = !showGrid;
    btnGrid.classList.toggle('active', showGrid);
    render();
  });

  btnMirror.addEventListener('click', toggleMirror);

  gridSizeSelect.addEventListener('change', e => {
    changeGridSize(parseInt(e.target.value, 10));
  });

  btnAddFrame.addEventListener('click', addFrame);
  btnDelFrame.addEventListener('click', deleteFrame);
  btnPlay.addEventListener('click', togglePlay);

  btnOnion.addEventListener('click', () => {
    onionSkin = !onionSkin;
    btnOnion.classList.toggle('active', onionSkin);
    render();
  });

  fpsInput.addEventListener('change', e => {
    fps = Math.max(1, Math.min(24, parseInt(e.target.value, 10) || 4));
    fpsInput.value = fps;
    if (isPlaying) {
      stopPlayback();
      startPlayback();
    }
  });

  // Keyboard shortcuts
  window.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === 'z') {
      e.preventDefault();
      undo();
      return;
    }
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z') {
      e.preventDefault();
      redo();
      return;
    }
    switch (e.key.toLowerCase()) {
      case 'p': selectTool('pen'); break;
      case 'e': selectTool('eraser'); break;
      case 'f': selectTool('fill'); break;
      case 'i': selectTool('eyedropper'); break;
    }
  });

  // Resize handling
  window.addEventListener('resize', resizeCanvas);

  // --- Init ---
  initPalette();
  setColor(currentColor);
  renderFrameList();
  resizeCanvas();
})();
