/**
 * Gradient calculation and CSS generation
 */
const Gradient = {
  type: 'linear',
  angle: 90,
  radialPosition: 'center',
  stops: [
    { color: '#6366f1', position: 0 },
    { color: '#ec4899', position: 100 }
  ],

  getSnapshot() {
    return {
      type: this.type,
      angle: this.angle,
      radialPosition: this.radialPosition,
      stops: this.stops.map(s => ({ ...s }))
    };
  },

  applySnapshot(snap) {
    this.type = snap.type;
    this.angle = snap.angle;
    this.radialPosition = snap.radialPosition;
    this.stops = snap.stops.map(s => ({ ...s }));
  },

  _stopsCSS() {
    return this.stops
      .slice()
      .sort((a, b) => a.position - b.position)
      .map(s => `${s.color} ${s.position}%`)
      .join(', ');
  },

  generateCSS() {
    const stopsCSS = this._stopsCSS();
    if (this.type === 'linear') {
      return `background: linear-gradient(${this.angle}deg, ${stopsCSS});`;
    }
    return `background: radial-gradient(circle at ${this.radialPosition}, ${stopsCSS});`;
  },

  getPreviewStyle() {
    const stopsCSS = this._stopsCSS();
    if (this.type === 'linear') {
      return `linear-gradient(${this.angle}deg, ${stopsCSS})`;
    }
    return `radial-gradient(circle at ${this.radialPosition}, ${stopsCSS})`;
  },

  addStop(color, position) {
    this.stops.push({ color, position });
  },

  removeStop(index) {
    if (this.stops.length <= 2) return false;
    this.stops.splice(index, 1);
    return true;
  },

  updateStopColor(index, color) {
    if (index >= 0 && index < this.stops.length) {
      this.stops[index].color = color;
    }
  },

  updateStopPosition(index, position) {
    if (index >= 0 && index < this.stops.length) {
      this.stops[index].position = Math.max(0, Math.min(100, position));
    }
  }
};
