export interface Tool {
  name: string;
  slug: string;
  description: string;
  longDescription: string;
  category: "data-format" | "text-code" | "generators" | "encoding-crypto";
  icon: string;
  keywords: string[];
  metaTitle: string;
  metaDescription: string;
  ready: boolean;
}

export const CATEGORIES = {
  "data-format": { label: "Data Format", icon: "📊" },
  "encoding-crypto": { label: "Encoding & Crypto", icon: "🔐" },
  "text-code": { label: "Text & Code", icon: "📝" },
  generators: { label: "Generators", icon: "⚡" },
} as const;

export const tools: Tool[] = [
  // ===== Data Format Tools =====
  {
    name: "JSON Formatter",
    slug: "json-formatter",
    description: "Format, validate, and minify JSON data instantly.",
    longDescription:
      "Paste your JSON to format it with proper indentation, validate its structure, or minify it for production. Supports large files with real-time error highlighting.",
    category: "data-format",
    icon: "{ }",
    keywords: ["json", "formatter", "validator", "beautify", "minify", "pretty print"],
    metaTitle: "JSON Formatter & Validator Online — Free | DevToolBox",
    metaDescription:
      "Format, validate, and minify JSON online for free. Instant formatting with syntax highlighting and error detection. No signup required.",
    ready: true,
  },
  {
    name: "JSON ↔ CSV",
    slug: "json-csv",
    description: "Convert between JSON and CSV formats.",
    longDescription:
      "Convert JSON arrays to CSV spreadsheets or CSV data back to JSON. Supports custom delimiters, header rows, and nested JSON flattening.",
    category: "data-format",
    icon: "⇄",
    keywords: ["json", "csv", "convert", "spreadsheet", "table", "export"],
    metaTitle: "JSON to CSV / CSV to JSON Converter Online — Free | DevToolBox",
    metaDescription:
      "Convert JSON to CSV or CSV to JSON online for free. Supports custom delimiters and nested data flattening.",
    ready: true,
  },
  {
    name: "XML Formatter",
    slug: "xml-formatter",
    description: "Format and validate XML documents.",
    longDescription:
      "Beautify XML with proper indentation, validate document structure, and minify for production. Handles large XML files with instant feedback.",
    category: "data-format",
    icon: "< >",
    keywords: ["xml", "formatter", "validator", "beautify", "minify"],
    metaTitle: "XML Formatter & Validator Online — Free | DevToolBox",
    metaDescription:
      "Format, validate, and minify XML online for free. Instant beautification with error detection.",
    ready: true,
  },
  {
    name: "YAML ↔ JSON",
    slug: "yaml-json",
    description: "Convert between YAML and JSON formats.",
    longDescription:
      "Convert YAML configuration to JSON or JSON to YAML. Perfect for working with config files, Kubernetes manifests, and API responses.",
    category: "data-format",
    icon: "📄",
    keywords: ["yaml", "json", "convert", "config", "kubernetes", "yml"],
    metaTitle: "YAML to JSON / JSON to YAML Converter Online — Free | DevToolBox",
    metaDescription:
      "Convert YAML to JSON or JSON to YAML online for free. Perfect for config files and API development.",
    ready: true,
  },
  {
    name: "Base64 Encode/Decode",
    slug: "base64",
    description: "Encode or decode Base64 strings and files.",
    longDescription:
      "Encode text or files to Base64, or decode Base64 strings back to their original form. Supports text and binary file encoding/decoding.",
    category: "encoding-crypto",
    icon: "🔣",
    keywords: ["base64", "encode", "decode", "binary", "text", "convert"],
    metaTitle: "Base64 Encode & Decode Online — Free | DevToolBox",
    metaDescription:
      "Encode or decode Base64 strings and files online for free. Supports text and binary data.",
    ready: true,
  },

  // ===== Text & Code Tools =====
  {
    name: "Regex Tester",
    slug: "regex-tester",
    description: "Test and debug regular expressions in real-time.",
    longDescription:
      "Write and test regex patterns with live match highlighting. Supports all JavaScript regex flags (g, i, m, s, u) with match group details and explanations.",
    category: "text-code",
    icon: ".*",
    keywords: ["regex", "regular expression", "tester", "match", "pattern", "debug"],
    metaTitle: "Regex Tester & Debugger Online — Free | DevToolBox",
    metaDescription:
      "Test regex patterns online with real-time match highlighting. Supports all flags with group details. Free, no signup.",
    ready: true,
  },
  {
    name: "Diff Checker",
    slug: "diff-checker",
    description: "Compare two texts and highlight differences.",
    longDescription:
      "Paste two texts to see a side-by-side or inline diff with highlighted additions, deletions, and changes. Perfect for code reviews and document comparison.",
    category: "text-code",
    icon: "±",
    keywords: ["diff", "compare", "text", "difference", "merge", "code review"],
    metaTitle: "Diff Checker — Compare Text Online Free | DevToolBox",
    metaDescription:
      "Compare two texts side-by-side and highlight differences online for free. Perfect for code reviews.",
    ready: true,
  },
  {
    name: "Markdown Preview",
    slug: "markdown-preview",
    description: "Write Markdown and preview rendered output live.",
    longDescription:
      "Type Markdown in the editor and see rendered HTML in real-time. Supports GitHub Flavored Markdown with tables, code blocks, and task lists.",
    category: "text-code",
    icon: "M↓",
    keywords: ["markdown", "preview", "editor", "github", "gfm", "render"],
    metaTitle: "Markdown Preview — Live Editor Online Free | DevToolBox",
    metaDescription:
      "Write Markdown and preview rendered output in real-time. Supports GitHub Flavored Markdown. Free online editor.",
    ready: true,
  },
  {
    name: "Lorem Ipsum Generator",
    slug: "lorem-ipsum",
    description: "Generate placeholder text for designs and mockups.",
    longDescription:
      "Generate Lorem Ipsum placeholder text by paragraphs, sentences, or words. Copy with one click for use in your designs, mockups, and prototypes.",
    category: "text-code",
    icon: "Aa",
    keywords: ["lorem ipsum", "placeholder", "text", "dummy", "filler", "generate"],
    metaTitle: "Lorem Ipsum Generator — Placeholder Text Online | DevToolBox",
    metaDescription:
      "Generate Lorem Ipsum placeholder text by paragraphs, sentences, or words. One-click copy, free online.",
    ready: true,
  },
  {
    name: "Word Counter",
    slug: "word-counter",
    description: "Count words, characters, sentences, and paragraphs.",
    longDescription:
      "Paste or type text to get instant word, character, sentence, and paragraph counts. Also shows reading time and speaking time estimates.",
    category: "text-code",
    icon: "🔢",
    keywords: ["word counter", "character count", "text", "statistics", "reading time"],
    metaTitle: "Word & Character Counter Online — Free | DevToolBox",
    metaDescription:
      "Count words, characters, sentences, and paragraphs online for free. Includes reading time estimate.",
    ready: true,
  },

  // ===== Generator Tools =====
  {
    name: "UUID Generator",
    slug: "uuid-generator",
    description: "Generate UUIDs/GUIDs in v1, v4, and v7 formats.",
    longDescription:
      "Generate universally unique identifiers in various formats. Supports UUID v4 (random), v1 (timestamp), and v7 (sortable). Batch generate up to 100 at once.",
    category: "generators",
    icon: "🆔",
    keywords: ["uuid", "guid", "generate", "unique", "identifier", "v4", "random"],
    metaTitle: "UUID Generator Online — v4, v1, v7 | Free | DevToolBox",
    metaDescription:
      "Generate UUIDs online for free. Supports v4 (random), v1 (timestamp), v7 (sortable). Batch generate up to 100.",
    ready: true,
  },
  {
    name: "Password Generator",
    slug: "password-generator",
    description: "Generate strong, secure random passwords.",
    longDescription:
      "Create cryptographically secure random passwords with customizable length (8-128 chars) and character types. Includes a visual strength meter.",
    category: "generators",
    icon: "🔐",
    keywords: ["password", "generate", "secure", "random", "strong", "crypto"],
    metaTitle: "Password Generator — Strong & Secure | Free | DevToolBox",
    metaDescription:
      "Generate strong, secure passwords online for free. Customizable length and characters with strength indicator.",
    ready: true,
  },
  {
    name: "QR Code Generator",
    slug: "qr-code",
    description: "Generate QR codes from text, URLs, or data.",
    longDescription:
      "Create QR codes from any text, URL, email, or phone number. Customize size and download as PNG or SVG for print and digital use.",
    category: "generators",
    icon: "📱",
    keywords: ["qr code", "generate", "barcode", "scan", "url", "download"],
    metaTitle: "QR Code Generator Online — Free PNG & SVG | DevToolBox",
    metaDescription:
      "Generate QR codes online for free. Supports text, URLs, email. Download as PNG or SVG.",
    ready: true,
  },
  {
    name: "Color Picker",
    slug: "color-picker",
    description: "Pick colors and convert between HEX, RGB, and HSL.",
    longDescription:
      "Visual color picker with instant HEX, RGB, HSL, and CMYK conversions. Includes a palette generator with complementary, analogous, and triadic color schemes.",
    category: "generators",
    icon: "🎨",
    keywords: ["color", "picker", "hex", "rgb", "hsl", "convert", "palette"],
    metaTitle: "Color Picker & Converter — HEX/RGB/HSL | Free | DevToolBox",
    metaDescription:
      "Pick colors and convert between HEX, RGB, HSL online for free. Includes palette generator with color schemes.",
    ready: true,
  },
  {
    name: "CSS Gradient Generator",
    slug: "css-gradient",
    description: "Create beautiful CSS gradients visually.",
    longDescription:
      "Build linear and radial CSS gradients with a visual editor. Pick colors, adjust stops, and copy the generated CSS code. Includes gradient presets.",
    category: "generators",
    icon: "🌈",
    keywords: ["css", "gradient", "generator", "linear", "radial", "color", "background"],
    metaTitle: "CSS Gradient Generator — Visual Editor | Free | DevToolBox",
    metaDescription:
      "Create beautiful CSS gradients with a visual editor online for free. Copy generated CSS code instantly.",
    ready: true,
  },

  // ===== Encoding & Crypto Tools =====
  {
    name: "Hash Generator",
    slug: "hash-generator",
    description: "Generate MD5, SHA-1, SHA-256, SHA-512 hashes instantly.",
    longDescription:
      "Calculate cryptographic hash values from any text input. Supports MD5, SHA-1, SHA-256, and SHA-512 algorithms using the Web Crypto API.",
    category: "encoding-crypto",
    icon: "#️⃣",
    keywords: ["hash", "md5", "sha256", "sha512", "sha1", "checksum", "crypto"],
    metaTitle: "Hash Generator — MD5, SHA-256, SHA-512 Online | Free | DevToolBox",
    metaDescription:
      "Generate MD5, SHA-1, SHA-256, SHA-512 hashes online for free. Instant calculation from text input.",
    ready: true,
  },
  {
    name: "URL Encode/Decode",
    slug: "url-encode",
    description: "Encode or decode URLs and query parameters.",
    longDescription:
      "Encode special characters in URLs or decode percent-encoded strings. Supports both encodeURIComponent (for values) and encodeURI (for full URLs) modes.",
    category: "encoding-crypto",
    icon: "🔗",
    keywords: ["url", "encode", "decode", "percent", "uri", "query string", "urlencode"],
    metaTitle: "URL Encode & Decode Online — Free | DevToolBox",
    metaDescription:
      "Encode or decode URLs online for free. Supports encodeURIComponent and encodeURI modes.",
    ready: true,
  },
  {
    name: "HTML Entity Encode/Decode",
    slug: "html-encode",
    description: "Encode or decode HTML entities.",
    longDescription:
      "Convert special characters to HTML entities or decode HTML entities back to characters. Includes a reference table of common HTML entities.",
    category: "encoding-crypto",
    icon: "&;",
    keywords: ["html", "entity", "encode", "decode", "escape", "amp", "lt", "gt"],
    metaTitle: "HTML Entity Encoder & Decoder Online — Free | DevToolBox",
    metaDescription:
      "Encode or decode HTML entities online for free. Includes common entity reference table.",
    ready: true,
  },
  {
    name: "JWT Decoder",
    slug: "jwt-decoder",
    description: "Decode and inspect JSON Web Tokens.",
    longDescription:
      "Paste a JWT token to decode and inspect its header, payload, and signature. Timestamps are converted to human-readable dates. Shows token expiration status.",
    category: "encoding-crypto",
    icon: "🎫",
    keywords: ["jwt", "json web token", "decode", "bearer", "auth", "token", "claim"],
    metaTitle: "JWT Decoder — Inspect JSON Web Tokens Online | Free | DevToolBox",
    metaDescription:
      "Decode and inspect JWT tokens online for free. View header, payload, expiration status.",
    ready: true,
  },
  {
    name: "Unix Timestamp Converter",
    slug: "timestamp-converter",
    description: "Convert between Unix timestamps and human dates.",
    longDescription:
      "Convert Unix timestamps to human-readable dates or dates to timestamps. Shows the current time as a live-updating timestamp. Supports seconds and milliseconds.",
    category: "encoding-crypto",
    icon: "⏱️",
    keywords: ["unix", "timestamp", "epoch", "date", "time", "converter", "seconds"],
    metaTitle: "Unix Timestamp Converter Online — Free | DevToolBox",
    metaDescription:
      "Convert Unix timestamps to dates and dates to timestamps online for free. Live current timestamp.",
    ready: true,
  },
];

export function getToolsByCategory() {
  const grouped: Record<string, Tool[]> = {};
  for (const tool of tools) {
    if (!grouped[tool.category]) grouped[tool.category] = [];
    grouped[tool.category].push(tool);
  }
  return grouped;
}

export function getToolBySlug(slug: string): Tool | undefined {
  return tools.find((t) => t.slug === slug);
}

export function getRelatedTools(slug: string, limit = 3): Tool[] {
  const current = getToolBySlug(slug);
  if (!current) return [];
  return tools
    .filter((t) => t.slug !== slug && t.category === current.category)
    .slice(0, limit);
}
