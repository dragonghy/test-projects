/**
 * heatmap.js - GitHub-style heatmap calendar renderer
 *
 * Renders a 365-day heatmap using CSS Grid.
 * Weeks are columns (left=oldest, right=newest), days are rows (Mon-Sun).
 */

// eslint-disable-next-line no-unused-vars
var Heatmap = {
  /**
   * Render a heatmap into the given container element.
   * @param {HTMLElement} container - Target element to render into
   * @param {string[]} checkins - Array of ISO date strings (YYYY-MM-DD)
   * @param {string} color - Hex color for checked-in days
   */
  render(container, checkins, color) {
    container.innerHTML = '';

    const checkinSet = new Set(checkins);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Calculate 365 days back
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 364);

    // Adjust start to the nearest Sunday (start of week)
    const startDow = startDate.getDay(); // 0=Sun
    startDate.setDate(startDate.getDate() - startDow);

    // Month labels
    const monthRow = document.createElement('div');
    monthRow.className = 'heatmap-months';

    // Day labels (Mon, Wed, Fri)
    const dayLabels = document.createElement('div');
    dayLabels.className = 'heatmap-day-labels';
    ['', 'Mon', '', 'Wed', '', 'Fri', ''].forEach(label => {
      const el = document.createElement('span');
      el.textContent = label;
      dayLabels.appendChild(el);
    });

    // Grid of cells
    const grid = document.createElement('div');
    grid.className = 'heatmap-grid';

    const current = new Date(startDate);
    let lastMonth = -1;
    let weekCount = 0;

    while (current <= today) {
      // Track month labels
      if (current.getDay() === 0) {
        weekCount++;
        if (current.getMonth() !== lastMonth) {
          const monthLabel = document.createElement('span');
          monthLabel.className = 'heatmap-month-label';
          monthLabel.textContent = current.toLocaleDateString('en-US', { month: 'short' });
          monthLabel.style.gridColumnStart = weekCount;
          monthRow.appendChild(monthLabel);
          lastMonth = current.getMonth();
        }
      }

      const dateStr = current.toISOString().split('T')[0];
      const cell = document.createElement('div');
      cell.className = 'heatmap-cell';

      const isFuture = current > today;
      const isChecked = checkinSet.has(dateStr);

      if (isFuture) {
        cell.classList.add('future');
      } else if (isChecked) {
        cell.classList.add('checked');
        cell.style.backgroundColor = color;
      }

      cell.title = `${dateStr}${isChecked ? ' - Done' : ''}`;
      grid.appendChild(cell);

      current.setDate(current.getDate() + 1);
    }

    container.appendChild(monthRow);
    const wrapper = document.createElement('div');
    wrapper.className = 'heatmap-wrapper';
    wrapper.appendChild(dayLabels);
    wrapper.appendChild(grid);
    container.appendChild(wrapper);
  }
};
