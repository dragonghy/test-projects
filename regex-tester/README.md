# Regex Tester

**Live Demo**: https://regex-tester-zeta.vercel.app

**Deploy Status**: Deployed to Vercel

## Features

### Core Engine (M1)
- Real-time regex matching with instant highlighting (mark tags)
- Regex flags toggle: g, i, m, s, u with visual active state
- Match results: full text, capture groups, indices, match count
- Error handling: friendly messages for invalid regex, auto-recovery on fix
- Transparent textarea overlay technique for in-place highlighting

### Enhanced Features (M2)
- **Quick Patterns**: 6 preset buttons (Email, URL, Phone, Date, IPv4, Hex Color)
- **Cheat Sheet**: Slide-out panel with 5 categories (character classes, quantifiers, anchors, groups, flags)
- **Replace Mode**: Toggle find & replace with $1/$2 capture group references and live preview
- **Match History**: Auto-save to localStorage (1.5s debounce), restore, delete, clear all
- **Dark Theme**: Default dark UI with WCAG AA contrast
- **Responsive Design**: Mobile (375px) to desktop (1920px) adaptive layout

## Tech Stack
- HTML5 + CSS3 + Vanilla JavaScript
- No frameworks, no dependencies
- Static deployment on Vercel
