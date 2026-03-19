# DevToolBox

> Free, fast, privacy-first developer tools — all in one place.

**Live:** https://devtoolbox-gules.vercel.app

## Tools (15)

### Data Format
| Tool | Description |
|------|-------------|
| JSON Formatter | Format, validate, and minify JSON |
| JSON <-> CSV | Convert between JSON and CSV |
| XML Formatter | Format, validate, and minify XML |
| YAML <-> JSON | Convert between YAML and JSON |
| Base64 | Encode/decode text and files |

### Text & Code
| Tool | Description |
|------|-------------|
| Regex Tester | Test regex with live highlighting |
| Diff Checker | Compare texts with line-by-line diff |
| Markdown Preview | Live GFM-compatible preview |
| Lorem Ipsum | Generate placeholder text |
| Word Counter | Count words, characters, reading time |

### Generators
| Tool | Description |
|------|-------------|
| UUID Generator | Generate v4 UUIDs (batch up to 100) |
| Password Generator | Secure passwords with strength meter |
| QR Code Generator | Generate and download PNG/SVG |
| Color Picker | Visual picker with HEX/RGB/HSL |
| CSS Gradient | Visual gradient editor with presets |

## Key Features

- 100% client-side — your data never leaves the browser
- Dark/light theme toggle
- Mobile responsive design
- Instant processing — no Submit buttons needed
- One-click copy for all outputs
- SEO optimized (meta tags, JSON-LD, sitemap.xml)
- Google Analytics 4 ready (via `NEXT_PUBLIC_GA_ID`)

## Tech Stack

- **Framework:** Next.js 14 (App Router, Static Export)
- **Styling:** Tailwind CSS + @tailwindcss/typography
- **Language:** TypeScript
- **Libraries:** js-yaml, marked, diff, qrcode, CodeMirror 6
- **Deployment:** Vercel (free tier)

## Run Locally

```bash
npm install
npm run dev
# Open http://localhost:3000
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_GA_ID` | Google Analytics 4 Measurement ID | No |

## Project Structure

```
devtoolbox/
  app/
    page.tsx                    # Homepage with search + categories
    tools/
      json-formatter/page.tsx   # Each tool has its own route
      base64/page.tsx
      ...
    layout.tsx                  # Shared layout (nav, footer, analytics)
    sitemap.ts                  # Auto-generated sitemap
    robots.ts                   # robots.txt
  components/
    ToolLayout.tsx              # Reusable tool page wrapper
    ToolCard.tsx                # Homepage tool card
    CopyButton.tsx              # Shared copy-to-clipboard button
    Analytics.tsx               # GA4 integration (respects DNT)
    AdBanner.tsx                # Ad placement (placeholder)
  lib/
    tools-registry.ts           # Tool metadata for SEO + navigation
    seo.ts                      # SEO helpers (meta, JSON-LD)
  docs/
    launch.md                   # Social launch materials
```

## License

MIT
