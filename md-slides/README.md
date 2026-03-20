# Markdown Slide Presenter

**Live Demo**: https://md-slides-wine.vercel.app

**Deploy Status**: Deployed to Vercel

## Features

### Core Presenter (M1)
- Split-pane editor: Markdown textarea on left, live slide preview on right
- Custom regex-based markdown parser (no dependencies)
- Supports: headings (h1-h6), bold, italic, lists, code blocks, inline code, links, images, blockquotes
- Slide splitting by `---` separator
- Arrow key navigation (left/right) with clickable dot indicators
- Slide counter ("3 / 10" format)
- Fullscreen presentation mode (F key or button, Escape to exit)
- Keyboard navigation works in fullscreen mode

### Enhanced Features (M2)
- **4 Themes**: Light, Dark, Solarized, Terminal — CSS custom properties driven
- **Font Size Control**: A+/A- buttons, range 10-32px
- **Export HTML**: Self-contained single-file export with navigation, works offline
- **Sample Slides**: 7 tutorial slides on first load
- **Auto-Save**: Editor content, theme, font size saved to localStorage
- **Responsive Design**: Desktop dual-column / mobile stacked at 768px breakpoint

## Architecture
- **Single HTML file** — all CSS and JS inline, zero external dependencies
- Self-built markdown parser using regex patterns
- CSS custom properties for theme switching
- Static deployment on Vercel
