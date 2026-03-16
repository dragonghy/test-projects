/**
 * Music Visualizer - app.js
 * Pure vanilla JS: Web Audio API + Canvas API
 * Milestone 1 + Milestone 2 features
 */

(function () {
  'use strict';

  // ============================================
  // DOM Elements
  // ============================================
  const canvas = document.getElementById('visualizer');
  const ctx = canvas.getContext('2d');
  const uploadOverlay = document.getElementById('upload-overlay');
  const controlsEl = document.getElementById('controls');
  const fileInput = document.getElementById('file-input');
  const fileInput2 = document.getElementById('file-input-2');
  const playBtn = document.getElementById('play-btn');
  const iconPlay = playBtn.querySelector('.icon-play');
  const iconPause = playBtn.querySelector('.icon-pause');
  const progressFill = document.getElementById('progress-fill');
  const currentTimeEl = document.getElementById('current-time');
  const durationEl = document.getElementById('duration');
  const volumeSlider = document.getElementById('volume-slider');
  const volumeIcon = document.getElementById('volume-icon');
  const fileNameEl = document.getElementById('file-name');
  const fullscreenBtn = document.getElementById('fullscreen-btn');
  const sensitivitySlider = document.getElementById('sensitivity-slider');
  const screenshotBtn = document.getElementById('screenshot-btn');
  const demoBtn = document.getElementById('demo-btn');

  // Mode buttons
  const modeBtns = {
    bars: document.getElementById('mode-bars'),
    wave: document.getElementById('mode-wave'),
    circular: document.getElementById('mode-circular'),
    particles: document.getElementById('mode-particles')
  };

  // Theme buttons
  const themeBtns = {
    neon: document.getElementById('theme-neon'),
    rainbow: document.getElementById('theme-rainbow'),
    ocean: document.getElementById('theme-ocean')
  };

  // ============================================
  // State
  // ============================================
  let audioContext = null;
  let analyser = null;
  let sourceNode = null;
  let gainNode = null;
  let audioElement = null;
  let isPlaying = false;
  let isDemoPlaying = false;
  let demoOscillators = [];
  let demoGainNode = null;
  let animationId = null;
  let currentMode = 'bars'; // 'bars' | 'wave' | 'circular' | 'particles'
  let currentTheme = 'neon'; // 'neon' | 'rainbow' | 'ocean'
  let sensitivityGain = 1.0; // 0.3 to 2.5
  let frequencyData = null;
  let timeDomainData = null;

  // Particle system
  let particles = [];
  const MAX_PARTICLES = 200;

  // ============================================
  // Color Theme Definitions
  // ============================================
  const THEMES = {
    neon: {
      // Magenta/Purple/Cyan neon
      getBarColor: function (i, count, intensity) {
        const hue = (i / count) * 120 + 270; // purple -> cyan range
        const sat = 85 + intensity * 15;
        const lit = 45 + intensity * 25;
        return { hue, sat, lit };
      },
      waveColors: [
        'rgba(255, 0, 229, 0.9)',   // magenta
        'rgba(139, 92, 246, 0.9)',   // purple
        'rgba(0, 240, 255, 0.9)'     // cyan
      ],
      glowColor: '0, 240, 255',
      particleHueBase: 280,
      particleHueRange: 120
    },
    rainbow: {
      // Full HSL spectrum
      getBarColor: function (i, count, intensity) {
        const hue = (i / count) * 360;
        const sat = 80 + intensity * 20;
        const lit = 45 + intensity * 25;
        return { hue, sat, lit };
      },
      waveColors: [
        'rgba(255, 0, 0, 0.9)',
        'rgba(255, 255, 0, 0.9)',
        'rgba(0, 255, 0, 0.9)',
        'rgba(0, 255, 255, 0.9)',
        'rgba(0, 0, 255, 0.9)',
        'rgba(255, 0, 255, 0.9)'
      ],
      glowColor: '255, 255, 0',
      particleHueBase: 0,
      particleHueRange: 360
    },
    ocean: {
      // Blue/Cyan/Green
      getBarColor: function (i, count, intensity) {
        const hue = (i / count) * 80 + 170; // blue-green range
        const sat = 70 + intensity * 25;
        const lit = 40 + intensity * 30;
        return { hue, sat, lit };
      },
      waveColors: [
        'rgba(0, 80, 180, 0.9)',
        'rgba(0, 180, 220, 0.9)',
        'rgba(0, 220, 160, 0.9)'
      ],
      glowColor: '0, 180, 220',
      particleHueBase: 170,
      particleHueRange: 80
    }
  };

  // ============================================
  // Audio Setup
  // ============================================
  function initAudioContext() {
    if (audioContext) return;
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 512;
    analyser.smoothingTimeConstant = 0.82;

    gainNode = audioContext.createGain();
    gainNode.connect(analyser);
    analyser.connect(audioContext.destination);

    const bufferLength = analyser.frequencyBinCount;
    frequencyData = new Uint8Array(bufferLength);
    timeDomainData = new Uint8Array(bufferLength);
  }

  function loadAudioFile(file) {
    stopDemo(); // Stop demo if playing
    initAudioContext();

    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }

    // Clean up previous source
    if (sourceNode) {
      sourceNode.disconnect();
      sourceNode = null;
    }
    if (audioElement) {
      audioElement.pause();
      audioElement.src = '';
      audioElement.load();
    }

    // Create audio element
    audioElement = new Audio();
    audioElement.crossOrigin = 'anonymous';
    audioElement.src = URL.createObjectURL(file);

    // Create media element source
    sourceNode = audioContext.createMediaElementSource(audioElement);
    sourceNode.connect(gainNode);

    // Set volume
    const vol = volumeSlider.value / 100;
    gainNode.gain.value = vol;

    // Update UI
    fileNameEl.textContent = file.name;
    uploadOverlay.classList.add('hidden');
    controlsEl.classList.remove('hidden');

    // Events
    audioElement.addEventListener('loadedmetadata', () => {
      durationEl.textContent = formatTime(audioElement.duration);
    });

    audioElement.addEventListener('timeupdate', updateProgress);

    audioElement.addEventListener('ended', () => {
      isPlaying = false;
      updatePlayButton();
    });

    // Auto-play
    audioElement.play().then(() => {
      isPlaying = true;
      updatePlayButton();
      startVisualization();
    }).catch(() => {
      isPlaying = false;
      updatePlayButton();
      startVisualization();
    });
  }

  // ============================================
  // Demo Audio (OscillatorNode synthesis)
  // ============================================
  function playDemo() {
    stopDemo();
    initAudioContext();

    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }

    // Clean up file audio if playing
    if (audioElement) {
      audioElement.pause();
      if (sourceNode) {
        sourceNode.disconnect();
        sourceNode = null;
      }
    }

    isDemoPlaying = true;
    isPlaying = true;

    // Create a gain node for demo
    demoGainNode = audioContext.createGain();
    demoGainNode.gain.value = volumeSlider.value / 100;
    demoGainNode.connect(gainNode);

    // Create a repeating beat pattern using oscillators
    const now = audioContext.currentTime;
    const bpm = 128;
    const beatDuration = 60 / bpm;
    const totalBeats = 64;
    const totalDuration = totalBeats * beatDuration;

    // Bass drum pattern (kick)
    for (let beat = 0; beat < totalBeats; beat++) {
      const time = now + beat * beatDuration;
      // Kick on every beat
      if (beat % 4 === 0) {
        createKick(time);
      }
      // Hi-hat on every other beat
      if (beat % 2 === 1) {
        createHiHat(time);
      }
      // Synth melody
      if (beat % 8 < 6) {
        const notes = [261.63, 329.63, 392.00, 523.25, 392.00, 329.63]; // C4, E4, G4, C5, G4, E4
        const noteIndex = beat % 6;
        createSynthNote(time, notes[noteIndex], beatDuration * 0.8);
      }
    }

    // Update UI
    fileNameEl.textContent = 'Demo Beat (128 BPM)';
    durationEl.textContent = formatTime(totalDuration);
    currentTimeEl.textContent = '0:00';
    uploadOverlay.classList.add('hidden');
    controlsEl.classList.remove('hidden');
    updatePlayButton();
    startVisualization();

    // Track demo time for progress bar
    const demoStartTime = audioContext.currentTime;
    const demoInterval = setInterval(() => {
      if (!isDemoPlaying) {
        clearInterval(demoInterval);
        return;
      }
      const elapsed = audioContext.currentTime - demoStartTime;
      const pct = Math.min((elapsed / totalDuration) * 100, 100);
      progressFill.style.width = pct + '%';
      currentTimeEl.textContent = formatTime(elapsed);

      if (elapsed >= totalDuration) {
        stopDemo();
        clearInterval(demoInterval);
      }
    }, 100);
  }

  function createKick(time) {
    const osc = audioContext.createOscillator();
    const oscGain = audioContext.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, time);
    osc.frequency.exponentialRampToValueAtTime(30, time + 0.12);
    oscGain.gain.setValueAtTime(0.7, time);
    oscGain.gain.exponentialRampToValueAtTime(0.001, time + 0.3);
    osc.connect(oscGain);
    oscGain.connect(demoGainNode);
    osc.start(time);
    osc.stop(time + 0.3);
    demoOscillators.push(osc);
  }

  function createHiHat(time) {
    // Use high-frequency noise-like oscillator
    const osc = audioContext.createOscillator();
    const oscGain = audioContext.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(6000 + Math.random() * 4000, time);
    oscGain.gain.setValueAtTime(0.08, time);
    oscGain.gain.exponentialRampToValueAtTime(0.001, time + 0.06);
    osc.connect(oscGain);
    oscGain.connect(demoGainNode);
    osc.start(time);
    osc.stop(time + 0.06);
    demoOscillators.push(osc);
  }

  function createSynthNote(time, freq, duration) {
    const osc = audioContext.createOscillator();
    const oscGain = audioContext.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, time);
    oscGain.gain.setValueAtTime(0, time);
    oscGain.gain.linearRampToValueAtTime(0.12, time + 0.02);
    oscGain.gain.linearRampToValueAtTime(0.06, time + duration * 0.5);
    oscGain.gain.exponentialRampToValueAtTime(0.001, time + duration);
    osc.connect(oscGain);
    oscGain.connect(demoGainNode);
    osc.start(time);
    osc.stop(time + duration);
    demoOscillators.push(osc);
  }

  function stopDemo() {
    isDemoPlaying = false;
    demoOscillators.forEach(osc => {
      try { osc.stop(); } catch (e) { /* already stopped */ }
    });
    demoOscillators = [];
    if (demoGainNode) {
      try { demoGainNode.disconnect(); } catch (e) {}
      demoGainNode = null;
    }
  }

  // ============================================
  // Playback Controls
  // ============================================
  function togglePlay() {
    if (isDemoPlaying) {
      stopDemo();
      isPlaying = false;
      updatePlayButton();
      return;
    }

    if (!audioElement) return;

    if (audioContext && audioContext.state === 'suspended') {
      audioContext.resume();
    }

    if (isPlaying) {
      audioElement.pause();
      isPlaying = false;
    } else {
      audioElement.play();
      isPlaying = true;
    }
    updatePlayButton();
  }

  function updatePlayButton() {
    if (isPlaying) {
      iconPlay.classList.add('hidden');
      iconPause.classList.remove('hidden');
    } else {
      iconPlay.classList.remove('hidden');
      iconPause.classList.add('hidden');
    }
  }

  function updateProgress() {
    if (!audioElement || !audioElement.duration) return;
    const pct = (audioElement.currentTime / audioElement.duration) * 100;
    progressFill.style.width = pct + '%';
    currentTimeEl.textContent = formatTime(audioElement.currentTime);
  }

  function seekTo(e) {
    if (isDemoPlaying) return; // Can't seek demo
    if (!audioElement || !audioElement.duration) return;
    const bar = e.currentTarget;
    const rect = bar.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, x / rect.width));
    audioElement.currentTime = pct * audioElement.duration;
  }

  function setVolume(val) {
    if (!gainNode) return;
    const v = val / 100;
    gainNode.gain.value = v;
    if (demoGainNode) {
      demoGainNode.gain.value = v;
    }
    if (v === 0) {
      volumeIcon.innerHTML = '&#128263;';
    } else if (v < 0.5) {
      volumeIcon.innerHTML = '&#128264;';
    } else {
      volumeIcon.innerHTML = '&#128266;';
    }
  }

  function toggleMute() {
    if (volumeSlider.value > 0) {
      volumeSlider.dataset.prevVolume = volumeSlider.value;
      volumeSlider.value = 0;
    } else {
      volumeSlider.value = volumeSlider.dataset.prevVolume || 80;
    }
    setVolume(volumeSlider.value);
  }

  function formatTime(sec) {
    if (isNaN(sec) || !isFinite(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return m + ':' + (s < 10 ? '0' : '') + s;
  }

  // ============================================
  // Sensitivity
  // ============================================
  function setSensitivity(val) {
    // Map 0-100 to 0.3-2.5 gain multiplier
    sensitivityGain = 0.3 + (val / 100) * 2.2;
  }

  // ============================================
  // Screenshot
  // ============================================
  function takeScreenshot() {
    const link = document.createElement('a');
    link.download = 'music-viz-screenshot.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  // ============================================
  // Canvas Resize
  // ============================================
  function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  // ============================================
  // Visualization - Main Render Loop
  // ============================================
  function startVisualization() {
    if (animationId) return;
    render();
  }

  function render() {
    animationId = requestAnimationFrame(render);

    const w = window.innerWidth;
    const h = window.innerHeight;

    // Clear with trail effect
    ctx.fillStyle = 'rgba(10, 10, 15, 0.25)';
    ctx.fillRect(0, 0, w, h);

    if (!analyser) return;

    analyser.getByteFrequencyData(frequencyData);
    analyser.getByteTimeDomainData(timeDomainData);

    switch (currentMode) {
      case 'bars':
        drawBars(w, h);
        break;
      case 'wave':
        drawWaveform(w, h);
        break;
      case 'circular':
        drawCircular(w, h);
        break;
      case 'particles':
        updateAndDrawParticles(w, h);
        break;
    }
  }

  // ============================================
  // Helper: get themed color for bar/element
  // ============================================
  function getThemedColor(i, count, intensity) {
    return THEMES[currentTheme].getBarColor(i, count, intensity);
  }

  function getThemedGlowColor() {
    return THEMES[currentTheme].glowColor;
  }

  // ============================================
  // Visualization: Frequency Bars
  // ============================================
  function drawBars(w, h) {
    const bufferLength = frequencyData.length;
    const barCount = w < 640 ? Math.min(bufferLength, 64) : Math.min(bufferLength, 128);
    const step = Math.floor(bufferLength / barCount);
    const gap = 2;
    const barWidth = (w - gap * (barCount - 1)) / barCount;
    const maxBarHeight = h * 0.85;

    for (let i = 0; i < barCount; i++) {
      const dataIndex = i * step;
      const value = frequencyData[dataIndex];
      const normalised = Math.min(1, (value / 255) * sensitivityGain);
      const barHeight = normalised * maxBarHeight;

      const x = i * (barWidth + gap);
      const y = h - barHeight;

      const c = getThemedColor(i, barCount, normalised);
      ctx.fillStyle = `hsl(${c.hue}, ${c.sat}%, ${c.lit}%)`;

      const radius = Math.min(barWidth / 2, 4);
      drawRoundedRect(x, y, barWidth, barHeight, radius);

      // Glow effect for loud bars
      if (normalised > 0.7) {
        ctx.shadowColor = `hsl(${c.hue}, 100%, 60%)`;
        ctx.shadowBlur = 12 + normalised * 10;
        ctx.fillStyle = `hsl(${c.hue}, ${c.sat}%, ${Math.min(c.lit + 10, 95)}%)`;
        drawRoundedRect(x, y, barWidth, barHeight, radius);
        ctx.shadowBlur = 0;
      }
    }
  }

  function drawRoundedRect(x, y, w, h, r) {
    if (h < 1) return;
    r = Math.min(r, h / 2, w / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x, y + h);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fill();
  }

  // ============================================
  // Visualization: Waveform
  // ============================================
  function drawWaveform(w, h) {
    const bufferLength = timeDomainData.length;
    const sliceWidth = w / bufferLength;
    const centerY = h / 2;
    const theme = THEMES[currentTheme];

    // Glow layers
    const layers = [
      { lineWidth: 6, alpha: 0.15 },
      { lineWidth: 3, alpha: 0.4 },
      { lineWidth: 1.5, alpha: 1, isGradient: true }
    ];

    layers.forEach((layer) => {
      ctx.beginPath();
      ctx.lineWidth = layer.lineWidth;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';

      if (layer.isGradient) {
        const grad = ctx.createLinearGradient(0, 0, w, 0);
        const colors = theme.waveColors;
        colors.forEach((color, idx) => {
          grad.addColorStop(idx / (colors.length - 1), color);
        });
        ctx.strokeStyle = grad;
      } else {
        ctx.strokeStyle = `rgba(${theme.glowColor}, ${layer.alpha})`;
      }

      let x = 0;
      for (let i = 0; i < bufferLength; i++) {
        const v = timeDomainData[i] / 128.0;
        const displacement = (v - 1) * sensitivityGain;
        const y = centerY + displacement * (h * 0.4);

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
        x += sliceWidth;
      }
      ctx.stroke();
    });

    // Subtle center line
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    ctx.moveTo(0, centerY);
    ctx.lineTo(w, centerY);
    ctx.stroke();
  }

  // ============================================
  // Visualization: Circular Spectrum
  // ============================================
  function drawCircular(w, h) {
    const bufferLength = frequencyData.length;
    const cx = w / 2;
    const cy = h / 2;
    const baseRadius = Math.min(w, h) * 0.18;
    const maxBarLen = Math.min(w, h) * 0.32;
    const barCount = Math.min(bufferLength, 180);
    const step = Math.floor(bufferLength / barCount);
    const theme = THEMES[currentTheme];

    // Draw base circle glow
    ctx.beginPath();
    ctx.arc(cx, cy, baseRadius, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(${theme.glowColor}, 0.15)`;
    ctx.lineWidth = 2;
    ctx.stroke();

    for (let i = 0; i < barCount; i++) {
      const dataIndex = i * step;
      const value = frequencyData[dataIndex];
      const normalised = Math.min(1, (value / 255) * sensitivityGain);
      const barLen = normalised * maxBarLen;

      const angle = (i / barCount) * Math.PI * 2 - Math.PI / 2;
      const x1 = cx + Math.cos(angle) * baseRadius;
      const y1 = cy + Math.sin(angle) * baseRadius;
      const x2 = cx + Math.cos(angle) * (baseRadius + barLen);
      const y2 = cy + Math.sin(angle) * (baseRadius + barLen);

      const c = getThemedColor(i, barCount, normalised);

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = `hsl(${c.hue}, ${c.sat}%, ${c.lit}%)`;
      ctx.lineWidth = Math.max(1.5, (Math.PI * 2 * baseRadius / barCount) * 0.7);

      // Glow for loud
      if (normalised > 0.6) {
        ctx.shadowColor = `hsl(${c.hue}, 100%, 60%)`;
        ctx.shadowBlur = 8 + normalised * 8;
      }

      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // Inner mirror (smaller, reversed)
    for (let i = 0; i < barCount; i++) {
      const dataIndex = i * step;
      const value = frequencyData[dataIndex];
      const normalised = Math.min(1, (value / 255) * sensitivityGain);
      const barLen = normalised * maxBarLen * 0.3;

      const angle = (i / barCount) * Math.PI * 2 - Math.PI / 2;
      const x1 = cx + Math.cos(angle) * baseRadius;
      const y1 = cy + Math.sin(angle) * baseRadius;
      const x2 = cx + Math.cos(angle) * (baseRadius - barLen);
      const y2 = cy + Math.sin(angle) * (baseRadius - barLen);

      const c = getThemedColor(i, barCount, normalised);

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = `hsla(${c.hue}, ${c.sat}%, ${c.lit}%, 0.5)`;
      ctx.lineWidth = Math.max(1, (Math.PI * 2 * baseRadius / barCount) * 0.5);
      ctx.stroke();
    }
  }

  // ============================================
  // Visualization: Particles
  // ============================================
  function spawnParticle(w, h) {
    const theme = THEMES[currentTheme];
    // Get average energy from frequency data
    let energy = 0;
    for (let i = 0; i < frequencyData.length; i++) {
      energy += frequencyData[i];
    }
    energy = energy / frequencyData.length / 255;
    energy = Math.min(1, energy * sensitivityGain);

    const cx = w / 2;
    const cy = h / 2;
    const angle = Math.random() * Math.PI * 2;
    const speed = 1 + energy * 5 + Math.random() * 2;

    return {
      x: cx + (Math.random() - 0.5) * 40,
      y: cy + (Math.random() - 0.5) * 40,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: 1.5 + energy * 4 + Math.random() * 2,
      life: 1.0,
      decay: 0.005 + Math.random() * 0.015,
      hue: theme.particleHueBase + Math.random() * theme.particleHueRange,
      energy: energy
    };
  }

  function updateAndDrawParticles(w, h) {
    // Get energy level
    let energy = 0;
    for (let i = 0; i < frequencyData.length; i++) {
      energy += frequencyData[i];
    }
    energy = energy / frequencyData.length / 255;
    energy = Math.min(1, energy * sensitivityGain);

    // Spawn new particles based on energy
    const spawnCount = Math.floor(energy * 8) + 1;
    for (let i = 0; i < spawnCount && particles.length < MAX_PARTICLES; i++) {
      particles.push(spawnParticle(w, h));
    }

    // Update and draw
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.decay;
      p.vx *= 0.995;
      p.vy *= 0.995;

      if (p.life <= 0 || p.x < -10 || p.x > w + 10 || p.y < -10 || p.y > h + 10) {
        particles.splice(i, 1);
        continue;
      }

      const alpha = p.life * 0.8;
      const size = p.size * (0.5 + p.life * 0.5);

      // Glow
      ctx.beginPath();
      ctx.arc(p.x, p.y, size * 2.5, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${p.hue}, 90%, 60%, ${alpha * 0.15})`;
      ctx.fill();

      // Core
      ctx.beginPath();
      ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${p.hue}, 90%, ${55 + p.energy * 25}%, ${alpha})`;
      ctx.fill();
    }

    // Draw connections between nearby particles
    const maxDist = 80;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < maxDist) {
          const alpha = (1 - dist / maxDist) * 0.15 * Math.min(particles[i].life, particles[j].life);
          const theme = THEMES[currentTheme];
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(${theme.glowColor}, ${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  // ============================================
  // Mode Switching
  // ============================================
  function setMode(mode) {
    currentMode = mode;
    Object.keys(modeBtns).forEach(key => {
      modeBtns[key].classList.toggle('active', key === mode);
    });
    // Clear particles when switching away from particles mode
    if (mode !== 'particles') {
      particles = [];
    }
    // Clear canvas for smooth transition
    const w = window.innerWidth;
    const h = window.innerHeight;
    ctx.fillStyle = 'rgba(10, 10, 15, 1)';
    ctx.fillRect(0, 0, w, h);
  }

  // ============================================
  // Theme Switching
  // ============================================
  function setTheme(theme) {
    currentTheme = theme;
    Object.keys(themeBtns).forEach(key => {
      themeBtns[key].classList.toggle('active', key === theme);
    });
  }

  // ============================================
  // Fullscreen
  // ============================================
  function toggleFullscreen() {
    const el = document.getElementById('app');
    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
      if (el.requestFullscreen) {
        el.requestFullscreen();
      } else if (el.webkitRequestFullscreen) {
        el.webkitRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
    }
  }

  // ============================================
  // Drag & Drop
  // ============================================
  function setupDragAndDrop() {
    const overlay = uploadOverlay;
    const body = document.body;

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(evt => {
      body.addEventListener(evt, (e) => {
        e.preventDefault();
        e.stopPropagation();
      });
    });

    body.addEventListener('dragenter', () => {
      overlay.classList.add('drag-over');
    });

    body.addEventListener('dragleave', (e) => {
      if (!e.relatedTarget || e.relatedTarget === document.documentElement) {
        overlay.classList.remove('drag-over');
      }
    });

    body.addEventListener('drop', (e) => {
      overlay.classList.remove('drag-over');
      const files = e.dataTransfer.files;
      if (files.length > 0 && files[0].type.startsWith('audio/')) {
        loadAudioFile(files[0]);
      }
    });
  }

  // ============================================
  // Event Listeners
  // ============================================
  function setupEventListeners() {
    // File input
    fileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        loadAudioFile(e.target.files[0]);
      }
    });

    fileInput2.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        loadAudioFile(e.target.files[0]);
      }
    });

    // Demo button
    demoBtn.addEventListener('click', playDemo);

    // Play/Pause
    playBtn.addEventListener('click', togglePlay);

    // Progress bar seek
    const progressBar = document.querySelector('.progress-bar');
    progressBar.addEventListener('click', seekTo);

    let isDraggingProgress = false;
    progressBar.addEventListener('mousedown', (e) => {
      isDraggingProgress = true;
      seekTo(e);
    });

    document.addEventListener('mousemove', (e) => {
      if (isDraggingProgress) {
        const rect = progressBar.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const pct = Math.max(0, Math.min(1, x / rect.width));
        if (audioElement && audioElement.duration) {
          audioElement.currentTime = pct * audioElement.duration;
        }
      }
    });

    document.addEventListener('mouseup', () => {
      isDraggingProgress = false;
    });

    // Touch support for progress bar
    progressBar.addEventListener('touchstart', (e) => {
      isDraggingProgress = true;
      const touch = e.touches[0];
      const rect = progressBar.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const pct = Math.max(0, Math.min(1, x / rect.width));
      if (audioElement && audioElement.duration) {
        audioElement.currentTime = pct * audioElement.duration;
      }
    }, { passive: true });

    document.addEventListener('touchmove', (e) => {
      if (isDraggingProgress) {
        const touch = e.touches[0];
        const rect = progressBar.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const pct = Math.max(0, Math.min(1, x / rect.width));
        if (audioElement && audioElement.duration) {
          audioElement.currentTime = pct * audioElement.duration;
        }
      }
    }, { passive: true });

    document.addEventListener('touchend', () => {
      isDraggingProgress = false;
    });

    // Volume
    volumeSlider.addEventListener('input', (e) => {
      setVolume(e.target.value);
    });

    volumeIcon.addEventListener('click', toggleMute);

    // Sensitivity
    sensitivitySlider.addEventListener('input', (e) => {
      setSensitivity(e.target.value);
    });

    // Mode switch
    modeBtns.bars.addEventListener('click', () => setMode('bars'));
    modeBtns.wave.addEventListener('click', () => setMode('wave'));
    modeBtns.circular.addEventListener('click', () => setMode('circular'));
    modeBtns.particles.addEventListener('click', () => setMode('particles'));

    // Theme switch
    themeBtns.neon.addEventListener('click', () => setTheme('neon'));
    themeBtns.rainbow.addEventListener('click', () => setTheme('rainbow'));
    themeBtns.ocean.addEventListener('click', () => setTheme('ocean'));

    // Screenshot
    screenshotBtn.addEventListener('click', takeScreenshot);

    // Fullscreen
    fullscreenBtn.addEventListener('click', toggleFullscreen);

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'KeyF') {
        toggleFullscreen();
      } else if (e.code === 'KeyM') {
        toggleMute();
      } else if (e.code === 'KeyS') {
        takeScreenshot();
      } else if (e.code === 'Digit1') {
        setMode('bars');
      } else if (e.code === 'Digit2') {
        setMode('wave');
      } else if (e.code === 'Digit3') {
        setMode('circular');
      } else if (e.code === 'Digit4') {
        setMode('particles');
      }
    });

    // Window resize
    window.addEventListener('resize', resizeCanvas);
  }

  // ============================================
  // Init
  // ============================================
  function init() {
    resizeCanvas();
    setupEventListeners();
    setupDragAndDrop();
    setSensitivity(sensitivitySlider.value);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
