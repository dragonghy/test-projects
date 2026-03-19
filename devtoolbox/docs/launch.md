# DevToolBox Launch Materials

## Show HN Post

**Title:** Show HN: DevToolBox – 15 free, fast, privacy-first developer tools in one place

**Body:**

Hey HN,

I built DevToolBox (https://devtoolbox-gules.vercel.app) — a collection of 15 free online developer tools that run entirely in your browser.

**What's included:**
- Data Format: JSON Formatter, CSV↔JSON, XML Formatter, YAML↔JSON, Base64
- Text & Code: Regex Tester, Diff Checker, Markdown Preview, Lorem Ipsum, Word Counter
- Generators: UUID, Password, QR Code, Color Picker, CSS Gradient

**What makes it different:**
- 100% client-side — no data ever leaves your browser
- Modern, clean UI with dark/light themes
- Instant results — no "Submit" buttons, everything processes as you type
- No signup, no ads (yet), no tracking beyond basic analytics

**Tech stack:** Next.js 14, Tailwind CSS, TypeScript. Deployed on Vercel free tier.

I built this because existing tools (CodeBeautify, etc.) are either slow, cluttered with ads, or have outdated UI. I wanted something that feels like a Raycast/Linear-quality experience for everyday dev tools.

Feedback welcome! What tools would you like to see added next?

---

## Reddit r/webdev Post

**Title:** I built a free collection of 15 online developer tools — no signup, runs in your browser

**Body:**

Just launched **DevToolBox** — a modern, privacy-first developer tools collection.

🔗 https://devtoolbox-gules.vercel.app

**15 tools included:**
- JSON Formatter & Validator
- Base64 Encode/Decode
- UUID Generator (v4, batch up to 100)
- Regex Tester with live highlighting
- Diff Checker
- Markdown Preview (GFM)
- Password Generator with strength meter
- Color Picker (HEX/RGB/HSL)
- QR Code Generator (PNG/SVG download)
- CSS Gradient Generator
- CSV↔JSON, XML Formatter, YAML↔JSON
- Lorem Ipsum Generator
- Word & Character Counter

**Key features:**
- 100% client-side — your data never leaves the browser
- Dark/light theme
- Mobile responsive
- Instant processing — no Submit buttons
- One-click copy for all outputs

Built with Next.js 14 + Tailwind CSS + TypeScript. Open to suggestions for new tools!

---

## Google Search Console Setup

### Steps to submit sitemap:
1. Go to https://search.google.com/search-console
2. Add property: `https://devtoolbox-gules.vercel.app`
3. Verify via HTML tag (add meta tag to layout) or DNS
4. Go to Sitemaps section
5. Submit: `https://devtoolbox-gules.vercel.app/sitemap.xml`
6. Monitor indexing in Coverage report

### Expected indexable pages: 16
- 1 homepage
- 15 tool pages

### robots.txt confirms:
- All pages allowed
- Sitemap URL specified
