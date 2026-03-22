# DevToolBox Launch Materials

## Show HN Post

**Title:** Show HN: DevToolBox – 30 free, fast, privacy-first developer tools in one place

**Body:**

Hey HN,

I built DevToolBox (https://devtoolbox-gules.vercel.app) — a collection of 30 free online developer tools that run entirely in your browser. Plus 8 tutorial articles for SEO long-tail traffic.

**30 tools across 5 categories:**

- **Data Format:** JSON Formatter, CSV↔JSON, XML Formatter, YAML↔JSON
- **Encoding & Crypto:** Base64, Hash Generator (MD5/SHA), URL Encode, HTML Entity, JWT Decoder, Unix Timestamp, Image→Base64
- **Text & Code:** Regex Tester, Diff Checker, Markdown Preview, Lorem Ipsum, Word Counter, HTML→Markdown, HTTP Status Codes
- **Code Tools:** SQL Formatter, JSON→TypeScript, Cron Expression Builder, Number Base Converter, String Case Converter, Slug Generator
- **Generators:** UUID, Password, QR Code, Color Picker, CSS Gradient, Placeholder Image

**What makes it different:**
- 100% client-side — no data ever leaves your browser
- Modern, clean UI inspired by Raycast/Linear, with dark/light themes
- Instant results — no "Submit" buttons, everything processes as you type
- No signup, no ads, no tracking beyond basic GA4
- 8 tutorial blog posts with SEO content (JSON guide, regex cheat sheet, JWT explainer, etc.)

**Tech stack:** Next.js 14, Tailwind CSS, TypeScript. Deployed on Vercel free tier. Total cost: $0.

I built this because existing tools (CodeBeautify, SmallDev.tools) are either slow, cluttered with ads, or have outdated UI. Feedback welcome — what tools would you like to see next?

---

## Reddit r/webdev Post

**Title:** I built 30 free online developer tools — no signup, runs in your browser, dark mode

**Body:**

Just launched **DevToolBox** — a modern, privacy-first collection of 30 developer tools.

🔗 https://devtoolbox-gules.vercel.app

**What's included (30 tools):**

📊 **Data Format** — JSON Formatter, CSV↔JSON, XML Formatter, YAML↔JSON

🔐 **Encoding & Crypto** — Base64, Hash Generator (MD5/SHA-256/SHA-512), URL Encode/Decode, HTML Entity Encode, JWT Decoder, Unix Timestamp Converter, Image→Base64

📝 **Text & Code** — Regex Tester, Diff Checker, Markdown Preview, Lorem Ipsum, Word Counter, HTML→Markdown, HTTP Status Code Reference

💻 **Code Tools** — SQL Formatter (6 dialects), JSON→TypeScript, Cron Expression Builder, Number Base Converter, String Case Converter, Slug Generator

⚡ **Generators** — UUID (v4, batch), Password Generator, QR Code (PNG/SVG), Color Picker (HEX/RGB/HSL), CSS Gradient, Placeholder Image

**Key features:**
- 100% client-side — your data never leaves the browser
- Dark/light theme toggle
- Mobile responsive
- Instant processing — no Submit buttons needed
- One-click copy for all outputs
- 8 tutorial blog posts (JSON guide, regex cheat sheet, JWT explainer, etc.)
- SEO optimized with JSON-LD, sitemap (40 URLs), per-page meta tags

Built with Next.js 14 + Tailwind CSS + TypeScript. Deployed on Vercel free tier.

What tools would you like to see added? Open to suggestions!

---

## Google Search Console Setup

### Steps to submit sitemap:
1. Go to https://search.google.com/search-console
2. Add property: `https://devtoolbox-gules.vercel.app`
3. Verify via HTML tag (add meta tag to layout) or DNS
4. Go to Sitemaps section
5. Submit: `https://devtoolbox-gules.vercel.app/sitemap.xml`
6. Monitor indexing in Coverage report

### Expected indexable pages: 40
- 1 homepage
- 30 tool pages
- 1 blog listing
- 8 blog articles

### robots.txt confirms:
- All pages allowed
- Sitemap URL specified
