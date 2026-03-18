/**
 * Main application - initialization and preview updates
 */
const App = {
  init() {
    UI.init();
    ColorStops.init();
    this.updatePreview();
    UI.updateUndoRedoButtons();
    UI.syncWheel();
  },

  updatePreview() {
    const preview = document.getElementById('gradient-preview');
    preview.style.background = Gradient.getPreviewStyle();

    const output = document.getElementById('css-output');
    output.textContent = Gradient.generateCSS();
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());
