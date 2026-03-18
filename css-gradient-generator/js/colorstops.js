/**
 * Color stop UI management
 */
const ColorStops = {
  container: null,

  init() {
    this.container = document.getElementById('color-stops');
    document.getElementById('add-stop-btn').addEventListener('click', () => this.addStop());
    this.render();
  },

  render() {
    this.container.innerHTML = '';
    Gradient.stops.forEach((stop, index) => {
      const row = document.createElement('div');
      row.className = 'stop-row';

      const colorInput = document.createElement('input');
      colorInput.type = 'color';
      colorInput.className = 'stop-color';
      colorInput.value = stop.color;
      let colorSaved = false;
      colorInput.addEventListener('mousedown', () => { if (!colorSaved) { History.saveState(); colorSaved = true; } });
      colorInput.addEventListener('input', (e) => {
        Gradient.updateStopColor(index, e.target.value);
        App.updatePreview();
      });
      colorInput.addEventListener('change', () => { colorSaved = false; });

      const posInput = document.createElement('input');
      posInput.type = 'range';
      posInput.className = 'stop-position';
      posInput.min = 0;
      posInput.max = 100;
      posInput.value = stop.position;
      posInput.addEventListener('mousedown', () => History.saveState());
      posInput.addEventListener('touchstart', () => History.saveState(), { passive: true });
      posInput.addEventListener('input', (e) => {
        Gradient.updateStopPosition(index, parseInt(e.target.value));
        posValue.textContent = Gradient.stops[index].position + '%';
        App.updatePreview();
      });

      const posValue = document.createElement('span');
      posValue.className = 'stop-pos-value';
      posValue.textContent = stop.position + '%';

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'stop-delete';
      deleteBtn.textContent = '\u00d7';
      deleteBtn.disabled = Gradient.stops.length <= 2;
      deleteBtn.addEventListener('click', () => {
        History.saveState();
        if (Gradient.removeStop(index)) {
          this.render();
          App.updatePreview();
        }
      });

      row.appendChild(colorInput);
      row.appendChild(posInput);
      row.appendChild(posValue);
      row.appendChild(deleteBtn);
      this.container.appendChild(row);
    });
  },

  addStop() {
    History.saveState();
    const randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    const positions = Gradient.stops.map(s => s.position).sort((a, b) => a - b);
    let newPos = 50;
    if (positions.length >= 2) {
      let maxGap = 0, gapStart = 0;
      for (let i = 0; i < positions.length - 1; i++) {
        const gap = positions[i + 1] - positions[i];
        if (gap > maxGap) {
          maxGap = gap;
          gapStart = positions[i];
        }
      }
      newPos = Math.round(gapStart + maxGap / 2);
    }
    Gradient.addStop(randomColor, newPos);
    this.render();
    App.updatePreview();
  }
};
