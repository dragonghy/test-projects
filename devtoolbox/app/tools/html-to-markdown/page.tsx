"use client";

import { useState } from "react";
import { getToolBySlug } from "@/lib/tools-registry";
import ToolLayout from "@/components/ToolLayout";
import CopyButton from "@/components/CopyButton";

const tool = getToolBySlug("html-to-markdown")!;

const SAMPLE = `<h1>Hello World</h1>
<p>This is a <strong>bold</strong> and <em>italic</em> paragraph with a <a href="https://example.com">link</a>.</p>
<h2>Features</h2>
<ul>
  <li>Item one</li>
  <li>Item two</li>
  <li>Item three</li>
</ul>
<h3>Code Example</h3>
<pre><code>console.log("Hello!");</code></pre>
<blockquote>This is a quote</blockquote>
<p>Image: <img src="https://example.com/img.png" alt="Example" /></p>`;

function htmlToMarkdown(html: string): string {
  let md = html;

  // Headings
  for (let i = 6; i >= 1; i--) {
    const re = new RegExp(`<h${i}[^>]*>(.*?)</h${i}>`, "gis");
    md = md.replace(re, (_, content) => "\n" + "#".repeat(i) + " " + content.trim() + "\n");
  }

  // Bold
  md = md.replace(/<(strong|b)>(.*?)<\/\1>/gi, "**$2**");
  // Italic
  md = md.replace(/<(em|i)>(.*?)<\/\1>/gi, "*$2*");
  // Inline code
  md = md.replace(/<code>(.*?)<\/code>/gi, "`$1`");
  // Links
  md = md.replace(/<a[^>]+href="([^"]*)"[^>]*>(.*?)<\/a>/gi, "[$2]($1)");
  // Images
  md = md.replace(/<img[^>]+src="([^"]*)"[^>]*alt="([^"]*)"[^>]*\/?>/gi, "![$2]($1)");
  md = md.replace(/<img[^>]+alt="([^"]*)"[^>]*src="([^"]*)"[^>]*\/?>/gi, "![$1]($2)");
  md = md.replace(/<img[^>]+src="([^"]*)"[^>]*\/?>/gi, "![]($1)");

  // Pre/code blocks
  md = md.replace(/<pre><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi, "\n```\n$1\n```\n");
  md = md.replace(/<pre[^>]*>([\s\S]*?)<\/pre>/gi, "\n```\n$1\n```\n");

  // Blockquote
  md = md.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (_, content) => {
    return content.trim().split("\n").map((line: string) => "> " + line.trim()).join("\n") + "\n";
  });

  // Unordered lists
  md = md.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (_, content) => {
    return "\n" + content.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, "- $1\n").trim() + "\n";
  });

  // Ordered lists
  md = md.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (_, content) => {
    let counter = 0;
    return "\n" + content.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_li: string, text: string) => {
      counter++;
      return counter + ". " + text.trim() + "\n";
    }).trim() + "\n";
  });

  // Paragraphs
  md = md.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, "\n$1\n");
  // Line breaks
  md = md.replace(/<br\s*\/?>/gi, "  \n");
  // Horizontal rules
  md = md.replace(/<hr\s*\/?>/gi, "\n---\n");

  // Strip remaining HTML tags
  md = md.replace(/<[^>]+>/g, "");
  // Decode common entities
  md = md.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, " ");

  // Clean up whitespace
  md = md.replace(/\n{3,}/g, "\n\n").trim();
  return md;
}

export default function HtmlToMarkdownPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  const convert = (val: string) => {
    setInput(val);
    if (!val.trim()) { setOutput(""); return; }
    setOutput(htmlToMarkdown(val));
  };

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button onClick={() => convert(SAMPLE)}
            className="px-3 py-1.5 text-sm font-medium rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">Load Sample</button>
          <button onClick={() => { setInput(""); setOutput(""); }}
            className="px-3 py-1.5 text-sm font-medium rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">Clear</button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300">HTML Input</label>
            <textarea value={input} onChange={(e) => convert(e.target.value)}
              placeholder="Paste your HTML here..."
              className="w-full h-80 p-4 font-mono text-sm rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" spellCheck={false} />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Markdown Output</label>
              {output && <CopyButton text={output} />}
            </div>
            <textarea value={output} readOnly placeholder="Markdown will appear here..."
              className="w-full h-80 p-4 font-mono text-sm rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900/50 text-neutral-900 dark:text-white placeholder:text-neutral-400 resize-none" spellCheck={false} />
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
