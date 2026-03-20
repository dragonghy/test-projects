"use client";

import { useState, useMemo } from "react";
import { getToolBySlug } from "@/lib/tools-registry";
import ToolLayout from "@/components/ToolLayout";
import CopyButton from "@/components/CopyButton";

const tool = getToolBySlug("slug-generator")!;

function generateSlug(input: string, separator: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // Remove non-alphanumeric
    .replace(/[\s_]+/g, separator) // Replace spaces/underscores
    .replace(new RegExp(`[${separator}]+`, "g"), separator) // Collapse separators
    .replace(new RegExp(`^${separator}|${separator}$`, "g"), ""); // Trim separators
}

export default function SlugGeneratorPage() {
  const [input, setInput] = useState("");
  const [separator, setSeparator] = useState("-");
  const [maxLength, setMaxLength] = useState(0); // 0 = unlimited

  const slug = useMemo(() => {
    let s = generateSlug(input, separator);
    if (maxLength > 0 && s.length > maxLength) {
      s = s.substring(0, maxLength).replace(new RegExp(`${separator}$`), "");
    }
    return s;
  }, [input, separator, maxLength]);

  const urlPreview = slug ? `https://example.com/blog/${slug}` : "";

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300">Input Text</label>
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
            placeholder="My Blog Post Title! (2024 Edition)"
            className="w-full px-4 py-3 text-sm rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500" autoFocus />
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-sm">
            <span className="text-neutral-600 dark:text-neutral-400">Separator:</span>
            <select value={separator} onChange={(e) => setSeparator(e.target.value)}
              className="px-2 py-1 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm">
              <option value="-">Hyphen (-)</option>
              <option value="_">Underscore (_)</option>
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <span className="text-neutral-600 dark:text-neutral-400">Max length:</span>
            <input type="number" min={0} max={200} value={maxLength} onChange={(e) => setMaxLength(Number(e.target.value))}
              placeholder="0 = unlimited"
              className="w-24 px-2 py-1 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm" />
            <span className="text-xs text-neutral-400">0 = unlimited</span>
          </label>
        </div>

        {slug && (
          <>
            <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-5">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Generated Slug</label>
                <CopyButton text={slug} />
              </div>
              <code className="block text-lg font-mono text-blue-600 dark:text-blue-400 select-all">{slug}</code>
              <p className="text-xs text-neutral-400 mt-2">{slug.length} characters</p>
            </div>

            <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">URL Preview</label>
                <CopyButton text={urlPreview} label="Copy URL" />
              </div>
              <code className="text-sm font-mono text-neutral-600 dark:text-neutral-400 break-all">
                https://example.com/blog/<span className="text-blue-600 dark:text-blue-400">{slug}</span>
              </code>
            </div>
          </>
        )}
      </div>
    </ToolLayout>
  );
}
