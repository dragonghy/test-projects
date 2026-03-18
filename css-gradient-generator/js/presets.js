/**
 * Preset gradient data (10+ presets)
 */
const Presets = {
  data: [
    {
      name: 'Sunset',
      type: 'linear',
      angle: 135,
      stops: [
        { color: '#f97316', position: 0 },
        { color: '#ec4899', position: 50 },
        { color: '#8b5cf6', position: 100 }
      ]
    },
    {
      name: 'Ocean',
      type: 'linear',
      angle: 180,
      stops: [
        { color: '#0ea5e9', position: 0 },
        { color: '#6366f1', position: 100 }
      ]
    },
    {
      name: 'Forest',
      type: 'linear',
      angle: 160,
      stops: [
        { color: '#22c55e', position: 0 },
        { color: '#065f46', position: 100 }
      ]
    },
    {
      name: 'Fire',
      type: 'linear',
      angle: 45,
      stops: [
        { color: '#ef4444', position: 0 },
        { color: '#f59e0b', position: 50 },
        { color: '#fbbf24', position: 100 }
      ]
    },
    {
      name: 'Aurora',
      type: 'linear',
      angle: 135,
      stops: [
        { color: '#06b6d4', position: 0 },
        { color: '#8b5cf6', position: 50 },
        { color: '#ec4899', position: 100 }
      ]
    },
    {
      name: 'Midnight',
      type: 'linear',
      angle: 180,
      stops: [
        { color: '#0f172a', position: 0 },
        { color: '#1e3a5f', position: 50 },
        { color: '#312e81', position: 100 }
      ]
    },
    {
      name: 'Peach',
      type: 'linear',
      angle: 90,
      stops: [
        { color: '#fda4af', position: 0 },
        { color: '#fdba74', position: 100 }
      ]
    },
    {
      name: 'Neon',
      type: 'linear',
      angle: 90,
      stops: [
        { color: '#22d3ee', position: 0 },
        { color: '#a855f7', position: 50 },
        { color: '#ec4899', position: 100 }
      ]
    },
    {
      name: 'Moss',
      type: 'radial',
      radialPosition: 'center',
      stops: [
        { color: '#86efac', position: 0 },
        { color: '#065f46', position: 100 }
      ]
    },
    {
      name: 'Cosmic',
      type: 'radial',
      radialPosition: 'center',
      stops: [
        { color: '#c084fc', position: 0 },
        { color: '#1e1b4b', position: 100 }
      ]
    },
    {
      name: 'Warm',
      type: 'linear',
      angle: 45,
      stops: [
        { color: '#fbbf24', position: 0 },
        { color: '#f97316', position: 50 },
        { color: '#ef4444', position: 100 }
      ]
    },
    {
      name: 'Ice',
      type: 'linear',
      angle: 135,
      stops: [
        { color: '#e0f2fe', position: 0 },
        { color: '#7dd3fc', position: 50 },
        { color: '#0284c7', position: 100 }
      ]
    }
  ],

  getPreviewStyle(preset) {
    const stopsCSS = preset.stops
      .slice()
      .sort((a, b) => a.position - b.position)
      .map(s => `${s.color} ${s.position}%`)
      .join(', ');

    if (preset.type === 'linear') {
      return `linear-gradient(${preset.angle}deg, ${stopsCSS})`;
    }
    return `radial-gradient(circle at ${preset.radialPosition || 'center'}, ${stopsCSS})`;
  },

  apply(index) {
    const preset = this.data[index];
    if (!preset) return;

    Gradient.type = preset.type;
    Gradient.stops = preset.stops.map(s => ({ ...s }));

    if (preset.type === 'linear') {
      Gradient.angle = preset.angle;
    } else {
      Gradient.radialPosition = preset.radialPosition || 'center';
    }
  }
};
