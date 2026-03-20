export interface BlogPost {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  excerpt: string;
  date: string;
  readingTime: string;
  toolSlug: string; // linked tool
  keywords: string[];
}

export const posts: BlogPost[] = [
  {
    slug: "json-formatting-guide",
    title: "JSON Formatting Guide: How to Pretty-Print, Minify & Validate JSON",
    metaTitle: "JSON Formatting Guide — Pretty-Print, Minify & Validate | DevToolBox",
    metaDescription: "Learn how to format, minify, and validate JSON data. Includes code examples, common errors, and best practices for working with JSON.",
    excerpt: "Master JSON formatting with this complete guide. Learn pretty-printing, minification, validation, and common pitfalls when working with JSON data.",
    date: "2026-03-19",
    readingTime: "5 min",
    toolSlug: "json-formatter",
    keywords: ["json", "format", "pretty print", "minify", "validate"],
  },
  {
    slug: "regex-cheat-sheet",
    title: "Regex Cheat Sheet: The Complete Guide to Regular Expressions",
    metaTitle: "Regex Cheat Sheet — Complete Regular Expression Guide | DevToolBox",
    metaDescription: "A comprehensive regex cheat sheet with syntax, examples, and common patterns. Master regular expressions for text matching and validation.",
    excerpt: "Your go-to reference for regular expressions. Covers syntax, quantifiers, groups, lookaheads, and real-world patterns for email, URL, and phone validation.",
    date: "2026-03-19",
    readingTime: "6 min",
    toolSlug: "regex-tester",
    keywords: ["regex", "regular expression", "cheat sheet", "pattern", "matching"],
  },
  {
    slug: "understanding-jwt-tokens",
    title: "Understanding JWT Tokens: How to Decode and Debug JWTs",
    metaTitle: "Understanding JWT Tokens — Decode & Debug Guide | DevToolBox",
    metaDescription: "Learn how JWT tokens work, their structure (header, payload, signature), and how to decode and debug them. Includes security best practices.",
    excerpt: "Understand the anatomy of JWT tokens — header, payload, and signature. Learn how to decode, debug, and securely use JWTs in your applications.",
    date: "2026-03-19",
    readingTime: "5 min",
    toolSlug: "jwt-decoder",
    keywords: ["jwt", "json web token", "decode", "authentication", "security"],
  },
  {
    slug: "unix-timestamps-explained",
    title: "Unix Timestamps Explained: Convert Between Epoch Time and Dates",
    metaTitle: "Unix Timestamps Explained — Epoch Time Conversion Guide | DevToolBox",
    metaDescription: "Understand Unix timestamps (epoch time), how they work, and how to convert between timestamps and human-readable dates in various programming languages.",
    excerpt: "Everything you need to know about Unix timestamps — what they are, why they matter, and how to convert between epoch time and dates in JavaScript, Python, and more.",
    date: "2026-03-19",
    readingTime: "4 min",
    toolSlug: "timestamp-converter",
    keywords: ["unix", "timestamp", "epoch", "date", "time", "convert"],
  },
  {
    slug: "base64-encoding-explained",
    title: "Base64 Encoding Explained: When and How to Use It",
    metaTitle: "Base64 Encoding Explained — Complete Guide | DevToolBox",
    metaDescription: "Learn what Base64 encoding is, when to use it, and how it works. Covers data URIs, email attachments, API payloads, and common misconceptions.",
    excerpt: "Demystify Base64 encoding — understand the algorithm, common use cases (data URIs, APIs, email), and why it's not encryption.",
    date: "2026-03-19",
    readingTime: "4 min",
    toolSlug: "base64",
    keywords: ["base64", "encoding", "data uri", "binary", "text"],
  },
  {
    slug: "cron-expression-syntax",
    title: "Cron Expression Syntax: A Beginner's Guide to Cron Jobs",
    metaTitle: "Cron Expression Syntax — Beginner's Guide to Cron Jobs | DevToolBox",
    metaDescription: "Learn cron expression syntax from scratch. Understand the 5-field format, special characters, and common scheduling patterns for automated tasks.",
    excerpt: "Master cron expression syntax with this beginner-friendly guide. Learn the 5-field format, wildcards, ranges, and common patterns for scheduling tasks.",
    date: "2026-03-19",
    readingTime: "5 min",
    toolSlug: "cron-expression",
    keywords: ["cron", "crontab", "schedule", "syntax", "linux", "automation"],
  },
  {
    slug: "sql-formatting-best-practices",
    title: "SQL Formatting Best Practices for Readable Queries",
    metaTitle: "SQL Formatting Best Practices — Write Readable Queries | DevToolBox",
    metaDescription: "Learn SQL formatting best practices to write clean, readable, and maintainable queries. Covers indentation, naming, and common style guides.",
    excerpt: "Write SQL that your team will thank you for. Learn formatting conventions, indentation styles, and best practices for readable, maintainable queries.",
    date: "2026-03-19",
    readingTime: "5 min",
    toolSlug: "sql-formatter",
    keywords: ["sql", "formatting", "best practices", "readable", "style guide"],
  },
  {
    slug: "http-status-codes-guide",
    title: "Complete Guide to HTTP Status Codes (with Examples)",
    metaTitle: "HTTP Status Codes Guide — All Codes Explained with Examples | DevToolBox",
    metaDescription: "A complete reference of HTTP status codes from 1xx to 5xx. Learn what each code means, when it's used, and how to handle them in your applications.",
    excerpt: "The definitive guide to HTTP status codes. Learn the meaning of every status code from 100 to 599, with real-world examples and handling best practices.",
    date: "2026-03-19",
    readingTime: "6 min",
    toolSlug: "http-status",
    keywords: ["http", "status code", "200", "404", "500", "api", "rest"],
  },
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return posts.find((p) => p.slug === slug);
}

export function getLatestPosts(count: number): BlogPost[] {
  return [...posts].sort((a, b) => b.date.localeCompare(a.date)).slice(0, count);
}
