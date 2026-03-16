(function () {
  'use strict';

  // === Constants ===
  var NUM_LAYERS = 3;
  var MAX_HISTORY = 30;
  var GRID_SIZE = 20;
  var MIN_ZOOM = 0.25;
  var MAX_ZOOM = 4;
  var ZOOM_STEP = 0.1;

  // === DOM Elements ===
  var canvasArea = document.getElementById('canvasArea');
  var canvasContainer = document.getElementById('canvasContainer');
  var gridCanvas = document.getElementById('gridCanvas');
  var gridCtx = gridCanvas.getContext('2d');
  var toolbar = document.getElementById('toolbar');
  var colorPalette = document.getElementById('colorPalette');
  var colorPicker = document.getElementById('colorPicker');
  var brushSizeInput = document.getElementById('brushSize');
  var sizeValue = document.getElementById('sizeValue');
  var sizePreview = document.getElementById('sizePreview');
  var undoBtn = document.getElementById('undoBtn');
  var redoBtn = document.getElementById('redoBtn');
  var clearBtn = document.getElementById('clearBtn');
  var exportBtn = document.getElementById('exportBtn');
  var gridBtn = document.getElementById('gridBtn');
  var fitBtn = document.getElementById('fitBtn');
  var zoomValueEl = document.getElementById('zoomValue');
  var clearModal = document.getElementById('clearModal');
  var clearConfirm = document.getElementById('clearConfirm');
  var clearCancel = document.getElementById('clearCancel');
  var textModal = document.getElementById('textModal');
  var textInput = document.getElementById('textInput');
  var textSizeInput = document.getElementById('textSize');
  var textConfirm = document.getElementById('textConfirm');
  var textCancel = document.getElementById('textCancel');
  var layerPanel = document.getElementById('layerPanel');

  // === Layer System ===
  var layers = [];
  var layerVisible = [];
  var activeLayer = 0;
  var canvasWidth = 0;
  var canvasHeight = 0;

  function createLayers() {
    var area = canvasArea;
    var padding = 20;
    canvasWidth = area.clientWidth - padding * 2;
    canvasHeight = area.clientHeight - padding * 2;

    canvasContainer.style.width = canvasWidth + 'px';
    canvasContainer.style.height = canvasHeight + 'px';

    for (var i = 0; i < NUM_LAYERS; i++) {
      var c = document.createElement('canvas');
      c.width = canvasWidth;
      c.height = canvasHeight;
      c.className = 'layer-canvas';
      c.dataset.layer = i;
      // Insert before gridCanvas
      canvasContainer.insertBefore(c, gridCanvas);
      var lctx = c.getContext('2d');
      // First layer gets white background
      if (i === 0) {
        lctx.fillStyle = '#ffffff';
        lctx.fillRect(0, 0, canvasWidth, canvasHeight);
      }
      layers.push({ canvas: c, ctx: lctx });
      layerVisible.push(true);
    }

    gridCanvas.width = canvasWidth;
    gridCanvas.height = canvasHeight;

    // Only top layer should receive pointer events
    updateLayerPointerEvents();
  }

  function updateLayerPointerEvents() {
    layers.forEach(function (l, i) {
      l.canvas.style.pointerEvents = (i === activeLayer) ? 'auto' : 'none';
    });
  }

  function getActiveCtx() {
    return layers[activeLayer].ctx;
  }

  function getActiveCanvas() {
    return layers[activeLayer].canvas;
  }

  // === State ===
  var currentTool = 'brush';
  var currentColor = '#000000';
  var brushSize = 5;
  var isDrawing = false;
  var lastX = 0;
  var lastY = 0;
  var shapeStartX = 0;
  var shapeStartY = 0;
  var showGrid = false;
  var zoom = 1;

  // History for undo/redo (stores all layers)
  var history = [];
  var historyIndex = -1;

  // Temporary canvas for shape preview
  var tempCanvas, tempCtx;

  // Text tool position
  var textPosX = 0;
  var textPosY = 0;

  // === Canvas Setup ===
  function resizeCanvas() {
    var area = canvasArea;
    var padding = 20;
    var w = area.clientWidth - padding * 2;
    var h = area.clientHeight - padding * 2;

    // Save current content of all layers
    var savedData = [];
    layers.forEach(function (l) {
      if (l.canvas.width > 0 && l.canvas.height > 0) {
        savedData.push(l.ctx.getImageData(0, 0, l.canvas.width, l.canvas.height));
      } else {
        savedData.push(null);
      }
    });

    canvasWidth = w;
    canvasHeight = h;
    canvasContainer.style.width = w + 'px';
    canvasContainer.style.height = h + 'px';

    layers.forEach(function (l, i) {
      l.canvas.width = w;
      l.canvas.height = h;
      if (i === 0) {
        l.ctx.fillStyle = '#ffffff';
        l.ctx.fillRect(0, 0, w, h);
      }
      if (savedData[i]) {
        l.ctx.putImageData(savedData[i], 0, 0);
      }
    });

    gridCanvas.width = w;
    gridCanvas.height = h;
    if (showGrid) drawGrid();

    if (tempCanvas) {
      tempCanvas.width = w;
      tempCanvas.height = h;
    }
  }

  function initCanvas() {
    createLayers();

    tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvasWidth;
    tempCanvas.height = canvasHeight;
    tempCtx = tempCanvas.getContext('2d');

    saveHistory();
  }

  // === History (multi-layer) ===
  function saveHistory() {
    history = history.slice(0, historyIndex + 1);
    var state = layers.map(function (l) {
      return l.canvas.toDataURL();
    });
    history.push(state);
    if (history.length > MAX_HISTORY) {
      history.shift();
    }
    historyIndex = history.length - 1;
  }

  function undo() {
    if (historyIndex > 0) {
      historyIndex--;
      restoreState(history[historyIndex]);
    }
  }

  function redo() {
    if (historyIndex < history.length - 1) {
      historyIndex++;
      restoreState(history[historyIndex]);
    }
  }

  function restoreState(stateArray) {
    var loaded = 0;
    stateArray.forEach(function (dataUrl, i) {
      var img = new Image();
      img.onload = function () {
        layers[i].ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        layers[i].ctx.drawImage(img, 0, 0);
        loaded++;
      };
      img.src = dataUrl;
    });
  }

  // === Drawing ===
  function getCanvasPos(e) {
    var canvas = getActiveCanvas();
    var rect = canvas.getBoundingClientRect();
    var clientX, clientY;
    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if (e.changedTouches && e.changedTouches.length > 0) {
      clientX = e.changedTouches[0].clientX;
      clientY = e.changedTouches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    return {
      x: (clientX - rect.left) / zoom,
      y: (clientY - rect.top) / zoom
    };
  }

  function startDrawing(e) {
    e.preventDefault();
    var pos = getCanvasPos(e);

    if (currentTool === 'eyedropper') {
      pickColor(pos.x, pos.y);
      return;
    }

    if (currentTool === 'fill') {
      floodFill(Math.round(pos.x), Math.round(pos.y));
      return;
    }

    if (currentTool === 'text') {
      textPosX = pos.x;
      textPosY = pos.y;
      showTextModal();
      return;
    }

    isDrawing = true;
    lastX = pos.x;
    lastY = pos.y;

    var ctx = getActiveCtx();

    if (currentTool === 'line' || currentTool === 'rect' || currentTool === 'circle') {
      shapeStartX = pos.x;
      shapeStartY = pos.y;
      tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
      tempCtx.drawImage(getActiveCanvas(), 0, 0);
    } else if (currentTool === 'brush' || currentTool === 'eraser') {
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, brushSize / 2, 0, Math.PI * 2);
      ctx.fillStyle = currentTool === 'eraser' ? '#ffffff' : currentColor;
      ctx.fill();
    }
  }

  function draw(e) {
    if (!isDrawing) return;
    e.preventDefault();
    var pos = getCanvasPos(e);
    var ctx = getActiveCtx();

    if (currentTool === 'brush') {
      drawBrush(ctx, pos.x, pos.y);
    } else if (currentTool === 'eraser') {
      drawEraser(ctx, pos.x, pos.y);
    } else if (currentTool === 'line' || currentTool === 'rect' || currentTool === 'circle') {
      previewShape(pos.x, pos.y);
    }

    lastX = pos.x;
    lastY = pos.y;
  }

  function stopDrawing(e) {
    if (!isDrawing) return;
    e.preventDefault();

    if (currentTool === 'line' || currentTool === 'rect' || currentTool === 'circle') {
      var pos = getCanvasPos(e);
      finalizeShape(pos.x, pos.y);
    }

    isDrawing = false;
    saveHistory();
  }

  function drawBrush(ctx, x, y) {
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  }

  function drawEraser(ctx, x, y) {
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  }

  // === Shape Drawing ===
  function previewShape(x, y) {
    var ctx = getActiveCtx();
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.drawImage(tempCanvas, 0, 0);
    drawShapeOnCtx(ctx, shapeStartX, shapeStartY, x, y);
  }

  function finalizeShape(x, y) {
    var ctx = getActiveCtx();
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.drawImage(tempCanvas, 0, 0);
    drawShapeOnCtx(ctx, shapeStartX, shapeStartY, x, y);
  }

  function drawShapeOnCtx(context, x1, y1, x2, y2) {
    context.beginPath();
    context.strokeStyle = currentColor;
    context.lineWidth = brushSize;
    context.lineCap = 'round';
    context.lineJoin = 'round';

    if (currentTool === 'line') {
      context.moveTo(x1, y1);
      context.lineTo(x2, y2);
      context.stroke();
    } else if (currentTool === 'rect') {
      context.strokeRect(x1, y1, x2 - x1, y2 - y1);
    } else if (currentTool === 'circle') {
      var rx = Math.abs(x2 - x1) / 2;
      var ry = Math.abs(y2 - y1) / 2;
      var cx = x1 + (x2 - x1) / 2;
      var cy = y1 + (y2 - y1) / 2;
      context.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      context.stroke();
    }
  }

  // === Flood Fill ===
  function floodFill(startX, startY) {
    var ctx = getActiveCtx();
    var imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
    var data = imageData.data;
    var w = canvasWidth;
    var h = canvasHeight;

    if (startX < 0 || startX >= w || startY < 0 || startY >= h) return;

    var startIdx = (startY * w + startX) * 4;
    var startR = data[startIdx];
    var startG = data[startIdx + 1];
    var startB = data[startIdx + 2];
    var startA = data[startIdx + 3];

    // Parse fill color
    var fillColor = hexToRgb(currentColor);
    if (fillColor.r === startR && fillColor.g === startG && fillColor.b === startB && startA === 255) {
      return; // Same color, no fill needed
    }

    var tolerance = 10;
    var stack = [[startX, startY]];
    var visited = new Uint8Array(w * h);

    function matchColor(idx) {
      return Math.abs(data[idx] - startR) <= tolerance &&
             Math.abs(data[idx + 1] - startG) <= tolerance &&
             Math.abs(data[idx + 2] - startB) <= tolerance &&
             Math.abs(data[idx + 3] - startA) <= tolerance;
    }

    while (stack.length > 0) {
      var point = stack.pop();
      var px = point[0];
      var py = point[1];

      if (px < 0 || px >= w || py < 0 || py >= h) continue;
      var vi = py * w + px;
      if (visited[vi]) continue;
      var idx = vi * 4;
      if (!matchColor(idx)) continue;

      visited[vi] = 1;
      data[idx] = fillColor.r;
      data[idx + 1] = fillColor.g;
      data[idx + 2] = fillColor.b;
      data[idx + 3] = 255;

      stack.push([px + 1, py]);
      stack.push([px - 1, py]);
      stack.push([px, py + 1]);
      stack.push([px, py - 1]);
    }

    ctx.putImageData(imageData, 0, 0);
    saveHistory();
  }

  function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  }

  // === Eyedropper ===
  function pickColor(x, y) {
    // Compose all visible layers to read color
    var compCanvas = document.createElement('canvas');
    compCanvas.width = canvasWidth;
    compCanvas.height = canvasHeight;
    var compCtx = compCanvas.getContext('2d');
    compCtx.fillStyle = '#ffffff';
    compCtx.fillRect(0, 0, canvasWidth, canvasHeight);
    layers.forEach(function (l, i) {
      if (layerVisible[i]) {
        compCtx.drawImage(l.canvas, 0, 0);
      }
    });

    var px = Math.round(x);
    var py = Math.round(y);
    if (px < 0 || px >= canvasWidth || py < 0 || py >= canvasHeight) return;

    var pixel = compCtx.getImageData(px, py, 1, 1).data;
    var hex = '#' +
      ('0' + pixel[0].toString(16)).slice(-2).toUpperCase() +
      ('0' + pixel[1].toString(16)).slice(-2).toUpperCase() +
      ('0' + pixel[2].toString(16)).slice(-2).toUpperCase();
    setColor(hex);
  }

  // === Text Tool ===
  function showTextModal() {
    textInput.value = '';
    textModal.hidden = false;
    textInput.focus();
  }

  function hideTextModal() {
    textModal.hidden = true;
  }

  function addText() {
    var text = textInput.value.trim();
    if (!text) { hideTextModal(); return; }
    var fontSize = parseInt(textSizeInput.value, 10) || 24;

    var ctx = getActiveCtx();
    ctx.font = fontSize + 'px sans-serif';
    ctx.fillStyle = currentColor;
    ctx.textBaseline = 'top';
    ctx.fillText(text, textPosX, textPosY);

    saveHistory();
    hideTextModal();
  }

  // === Tool Selection ===
  function setTool(tool) {
    currentTool = tool;
    document.querySelectorAll('.tool-btn').forEach(function (btn) {
      btn.classList.toggle('active', btn.dataset.tool === tool);
    });
    // Update cursor for all layer canvases
    var cursor = tool === 'eyedropper' ? 'crosshair' : 'crosshair';
    if (tool === 'text') cursor = 'text';
    if (tool === 'fill') cursor = 'cell';
    layers.forEach(function (l) {
      l.canvas.style.cursor = cursor;
    });
  }

  // === Color Selection ===
  function setColor(color) {
    currentColor = color;
    colorPicker.value = color;
    document.querySelectorAll('.color-swatch').forEach(function (swatch) {
      swatch.classList.toggle('active', swatch.dataset.color === color);
    });
  }

  // === Size Update ===
  function updateSize(size) {
    brushSize = parseInt(size, 10);
    sizeValue.textContent = brushSize;
    sizePreview.style.width = brushSize + 'px';
    sizePreview.style.height = brushSize + 'px';
  }

  // === Layer Management ===
  function setActiveLayer(index) {
    if (index < 0 || index >= NUM_LAYERS) return;
    activeLayer = index;
    updateLayerPointerEvents();
    // Update UI
    document.querySelectorAll('.layer-item').forEach(function (el) {
      el.classList.toggle('active', parseInt(el.dataset.layer) === index);
    });
  }

  function toggleLayerVisibility(index) {
    if (index < 0 || index >= NUM_LAYERS) return;
    layerVisible[index] = !layerVisible[index];
    layers[index].canvas.style.display = layerVisible[index] ? '' : 'none';
    // Update UI
    var layerItem = document.querySelector('.layer-item[data-layer="' + index + '"]');
    if (layerItem) {
      layerItem.classList.toggle('hidden-layer', !layerVisible[index]);
    }
  }

  // === Grid ===
  function toggleGrid() {
    showGrid = !showGrid;
    gridBtn.classList.toggle('active', showGrid);
    if (showGrid) {
      drawGrid();
    } else {
      gridCtx.clearRect(0, 0, gridCanvas.width, gridCanvas.height);
    }
  }

  function drawGrid() {
    gridCtx.clearRect(0, 0, gridCanvas.width, gridCanvas.height);
    gridCtx.strokeStyle = 'rgba(128, 128, 128, 0.3)';
    gridCtx.lineWidth = 0.5;

    for (var x = 0; x <= canvasWidth; x += GRID_SIZE) {
      gridCtx.beginPath();
      gridCtx.moveTo(x, 0);
      gridCtx.lineTo(x, canvasHeight);
      gridCtx.stroke();
    }
    for (var y = 0; y <= canvasHeight; y += GRID_SIZE) {
      gridCtx.beginPath();
      gridCtx.moveTo(0, y);
      gridCtx.lineTo(canvasWidth, y);
      gridCtx.stroke();
    }
  }

  // === Zoom ===
  function setZoom(newZoom) {
    zoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newZoom));
    canvasContainer.style.transform = 'scale(' + zoom + ')';
    zoomValueEl.textContent = Math.round(zoom * 100);
  }

  function fitToWindow() {
    setZoom(1);
  }

  // === Clear Canvas ===
  function showClearModal() {
    clearModal.hidden = false;
  }

  function hideClearModal() {
    clearModal.hidden = true;
  }

  function clearCanvas() {
    layers.forEach(function (l, i) {
      l.ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      if (i === 0) {
        l.ctx.fillStyle = '#ffffff';
        l.ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      }
    });
    saveHistory();
    hideClearModal();
  }

  // === Export ===
  function exportPNG() {
    var exportCanvas = document.createElement('canvas');
    exportCanvas.width = canvasWidth;
    exportCanvas.height = canvasHeight;
    var exportCtx = exportCanvas.getContext('2d');

    // Compose visible layers
    exportCtx.fillStyle = '#ffffff';
    exportCtx.fillRect(0, 0, canvasWidth, canvasHeight);
    layers.forEach(function (l, i) {
      if (layerVisible[i]) {
        exportCtx.drawImage(l.canvas, 0, 0);
      }
    });

    var link = document.createElement('a');
    link.download = 'drawing.png';
    link.href = exportCanvas.toDataURL('image/png');
    link.click();
  }

  // === Event Listeners ===

  // Tool buttons (delegation on toolbar)
  toolbar.addEventListener('click', function (e) {
    var btn = e.target.closest('.tool-btn');
    if (btn && btn.dataset.tool) {
      setTool(btn.dataset.tool);
    }
  });

  // Color palette
  colorPalette.addEventListener('click', function (e) {
    var swatch = e.target.closest('.color-swatch');
    if (swatch && swatch.dataset.color) {
      setColor(swatch.dataset.color);
    }
  });

  // Custom color picker
  colorPicker.addEventListener('input', function () {
    setColor(colorPicker.value.toUpperCase());
    document.querySelectorAll('.color-swatch').forEach(function (s) {
      s.classList.remove('active');
    });
  });

  // Brush size
  brushSizeInput.addEventListener('input', function () {
    updateSize(brushSizeInput.value);
  });

  // Layer panel
  layerPanel.addEventListener('click', function (e) {
    var visBtn = e.target.closest('.layer-visibility');
    if (visBtn) {
      e.stopPropagation();
      toggleLayerVisibility(parseInt(visBtn.dataset.layer));
      return;
    }
    var layerItem = e.target.closest('.layer-item');
    if (layerItem) {
      setActiveLayer(parseInt(layerItem.dataset.layer));
    }
  });

  // Bind drawing events to each layer canvas
  function bindCanvasEvents(canvas) {
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseleave', function (e) {
      if (isDrawing) stopDrawing(e);
    });
    canvas.addEventListener('touchstart', startDrawing, { passive: false });
    canvas.addEventListener('touchmove', draw, { passive: false });
    canvas.addEventListener('touchend', stopDrawing, { passive: false });
    canvas.addEventListener('touchcancel', function (e) {
      if (isDrawing) stopDrawing(e);
    });
  }

  // Undo/Redo buttons
  undoBtn.addEventListener('click', undo);
  redoBtn.addEventListener('click', redo);

  // Grid toggle
  gridBtn.addEventListener('click', toggleGrid);

  // Fit to window
  fitBtn.addEventListener('click', fitToWindow);

  // Clear canvas
  clearBtn.addEventListener('click', showClearModal);
  clearConfirm.addEventListener('click', clearCanvas);
  clearCancel.addEventListener('click', hideClearModal);
  clearModal.addEventListener('click', function (e) {
    if (e.target === clearModal) hideClearModal();
  });

  // Text modal
  textConfirm.addEventListener('click', addText);
  textCancel.addEventListener('click', hideTextModal);
  textModal.addEventListener('click', function (e) {
    if (e.target === textModal) hideTextModal();
  });
  textInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      addText();
    }
  });

  // Export
  exportBtn.addEventListener('click', exportPNG);

  // Zoom with mouse wheel on canvas area
  canvasArea.addEventListener('wheel', function (e) {
    e.preventDefault();
    var delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
    setZoom(zoom + delta);
  }, { passive: false });

  // Keyboard shortcuts
  document.addEventListener('keydown', function (e) {
    // Don't trigger shortcuts when typing in input fields
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    // Undo: Ctrl+Z
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      undo();
      return;
    }
    // Redo: Ctrl+Y or Ctrl+Shift+Z
    if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
      e.preventDefault();
      redo();
      return;
    }

    if (e.ctrlKey || e.metaKey || e.altKey) return;

    switch (e.key.toLowerCase()) {
      case 'b': setTool('brush'); break;
      case 'e': setTool('eraser'); break;
      case 'f': setTool('fill'); break;
      case 't': setTool('text'); break;
      case 'i': setTool('eyedropper'); break;
      case 'l': setTool('line'); break;
      case 'r': setTool('rect'); break;
      case 'c': setTool('circle'); break;
      case 'g': toggleGrid(); break;
      case '1': setActiveLayer(0); break;
      case '2': setActiveLayer(1); break;
      case '3': setActiveLayer(2); break;
    }
  });

  // Window resize
  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resizeCanvas, 150);
  });

  // === Init ===
  initCanvas();
  updateSize(brushSizeInput.value);

  // Bind events to all layer canvases
  layers.forEach(function (l) {
    bindCanvasEvents(l.canvas);
  });
})();
