# Password Generator

**Live Demo**: https://password-gen-ashen-eight.vercel.app

**Deploy Status**: Deployed to Vercel

## Features

### Core Generator (M1)
- Cryptographically secure randomness via Web Crypto API (crypto.getRandomValues)
- Password length slider (8-128 characters, default 16)
- 4 character type toggles: uppercase, lowercase, numbers, symbols
- At least one type must remain enabled
- Large monospace password display
- One-click copy to clipboard with "Copied!" feedback
- 5-level strength meter (Weak/Fair/Good/Strong/Very Strong) with color gradient
- Generate button for new password

### Enhanced Features (M2)
- **Auto-Generate**: New password on any slider/toggle change
- **Password History**: Last 10 passwords (session-only JS variable, NOT localStorage for security)
- **Exclude Ambiguous**: Toggle to remove confusable chars (0/O, l/1/I)
- **Entropy Display**: Shows bits of entropy for current password configuration
- **Dark Theme**: Deep blue background (#1a1a2e) with high contrast
- **Responsive Design**: 375px to 1280px, no overflow

## Tech Stack
- HTML5 + CSS3 + Vanilla JavaScript
- Web Crypto API for secure randomness
- No frameworks, no dependencies
- Static deployment on Vercel
