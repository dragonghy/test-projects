# Event Countdown Timer

**Live Demo**: https://countdown-timer-psi-five.vercel.app

**Deploy Status**: Deployed to Vercel

## Features

### Core Countdown (M1)
- Create named countdowns with target date/time
- Real-time ticking: days, hours, minutes, seconds update every second
- Card grid display with multiple concurrent countdowns
- Delete individual countdowns
- localStorage persistence (survives page reload)
- Past events show "Expired" badge with elapsed time
- Form validation and XSS protection

### Enhanced Features (M2)
- **Edit Countdown**: Modify name and target date of existing events
- **Auto-Sort**: Cards automatically sorted by soonest first
- **Celebration Animation**: Canvas confetti + card pulse when countdown reaches zero
- **Share via URL**: Generate shareable link with event encoded in query params, auto-import with dedup
- **5 Preset Buttons**: Quick-add for New Year, Christmas, Halloween, Valentine's, and more
- **Color & Emoji**: Choose from 10 emojis and 7 colors per countdown
- **Dark Theme**: Polished dark UI
- **Responsive Grid**: 3 columns (desktop) → 2 (tablet) → 1 (mobile)

## Tech Stack
- HTML5 + CSS3 + Vanilla JavaScript
- Canvas API for confetti animation
- No frameworks, no dependencies
- Static deployment on Vercel
