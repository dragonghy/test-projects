"use client";

import { useState } from "react";
import { getToolBySlug } from "@/lib/tools-registry";
import ToolLayout from "@/components/ToolLayout";
import CopyButton from "@/components/CopyButton";

const tool = getToolBySlug("xml-formatter")!;

function formatXml(xml: string, indent: number): string {
  // Validate first
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, "text/xml");
  const error = doc.querySelector("parsererror");
  if (error) throw new Error(error.textContent || "Invalid XML");

  // Format
  let formatted = "";
  let level = 0;
  const pad = (n: number) => " ".repeat(n * indent);

  // Normalize and split
  const normalized = xml.replace(/>\s*</g, "><").trim();
  const tokens = normalized.match(/<[^>]+>|[^<]+/g) || [];

  for (const token of tokens) {
    if (token.startsWith("</")) {
      level--;
      formatted += pad(level) + token + "\n";
    } else if (token.startsWith("<?")) {
      formatted += pad(level) + token + "\n";
    } else if (token.startsWith("<") && token.endsWith("/>")) {
      formatted += pad(level) + token + "\n";
    } else if (token.startsWith("<")) {
      formatted += pad(level) + token + "\n";
      level++;
    } else {
      // Text content — trim and inline with previous tag
      const trimmed = token.trim();
      if (trimmed) {
        // Remove the last newline and append text inline
        formatted = formatted.replace(/\n$/, "") + trimmed + "\n";
        // Don't increase level for text
      }
    }
  }
  return formatted.trim();
}

function minifyXml(xml: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, "text/xml");
  const error = doc.querySelector("parsererror");
  if (error) throw new Error(error.textContent || "Invalid XML");
  return xml.replace(/>\s+</g, "><").replace(/\s+/g, " ").trim();
}

const SAMPLE = `<?xml version="1.0" encoding="UTF-8"?><bookstore><book category="fiction"><title lang="en">Harry Potter</title><author>J.K. Rowling</author><year>2005</year><price>29.99</price></book><book category="web"><title lang="en">Learning XML</title><author>Erik T. Ray</author><year>2003</year><price>39.95</price></book></bookstore>`;

export default function XmlFormatterPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [indent, setIndent] = useState(2);

  const format = (val?: string, spaces?: number) => {
    const text = val ?? input;
    const ind = spaces ?? indent;
    if (!text.trim()) { setOutput(""); setError(""); return; }
    try { setOutput(formatXml(text, ind)); setError(""); }
    catch (e: unknown) { setError(e instanceof Error ? e.message : "Invalid XML"); setOutput(""); }
  };

  const minify = () => {
    if (!input.trim()) return;
    try { setOutput(minifyXml(input)); setError(""); }
    catch (e: unknown) { setError(e instanceof Error ? e.message : "Invalid XML"); }
  };

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
            Indent:
            <select value={indent} onChange={(e) => { const v = Number(e.target.value); setIndent(v); format(input, v); }}
              className="px-2 py-1 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm">
              <option value={2}>2 spaces</option>
              <option value={4}>4 spaces</option>
            </select>
          </label>
          <button onClick={minify} className="px-3 py-1.5 text-sm font-medium rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">Minify</button>
          <button onClick={() => { setInput(SAMPLE); format(SAMPLE); }} className="px-3 py-1.5 text-sm font-medium rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">Load Sample</button>
          <button onClick={() => { setInput(""); setOutput(""); setError(""); }} className="px-3 py-1.5 text-sm font-medium rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">Clear</button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300">Input XML</label>
            <textarea value={input} onChange={(e) => { setInput(e.target.value); format(e.target.value); }}
              placeholder="Paste your XML here..."
              className="w-full h-80 p-4 font-mono text-sm rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" spellCheck={false} />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Output</label>
              {output && <CopyButton text={output} />}
            </div>
            <textarea value={output} readOnly placeholder="Formatted XML..."
              className="w-full h-80 p-4 font-mono text-sm rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900/50 text-neutral-900 dark:text-white placeholder:text-neutral-400 resize-none" spellCheck={false} />
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-400 text-sm font-mono">{error}</div>
        )}
      </div>
    </ToolLayout>
  );
}
