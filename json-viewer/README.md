# JSON Viewer & Editor

**Live Demo**: https://json-viewer-brown-pi.vercel.app

**Deploy Status**: Deployed to Vercel

## Features

### Core Viewer (M1)
- Split-pane: raw JSON textarea (monospace) + interactive tree view
- Real-time parsing with 300ms debounce
- Expand/collapse tree nodes with toggle arrows
- Color-coded types: string (green), number (blue), boolean (orange), null (gray)
- Format (pretty-print) and Minify buttons
- Error display with line number for invalid JSON
- Sample JSON button (loads example data)

### Enhanced Features (M2)
- **Search/Filter**: Keyword search highlights matching keys/values in yellow
- **Copy JSON Path**: Click any node to copy its path (e.g., `$.users[0].name`) with animation
- **Node Statistics**: Real-time counts of Objects, Arrays, and Keys
- **Expand All / Collapse All**: One-click tree manipulation
- **Dark Theme**: Catppuccin Mocha color scheme
- **Responsive Design**: Desktop side-by-side / mobile (<768px) stacked

## Architecture
- Single HTML file with inline CSS and JS
- Zero dependencies, no build step
- Static deployment on Vercel
