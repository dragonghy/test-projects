"use client";

import { useState, useMemo } from "react";
import { marked } from "marked";
import { getToolBySlug } from "@/lib/tools-registry";
import ToolLayout from "@/components/ToolLayout";
import CopyButton from "@/components/CopyButton";

const tool = getToolBySlug("markdown-preview")!;

marked.setOptions({ gfm: true, breaks: true });

const SAMPLE = `# Hello, Markdown!

This is a **bold** and *italic* text with a [link](https://example.com).

## Features

- GitHub Flavored Markdown
- Tables support
- Code blocks
- Task lists

### Code Block

\`\`\`javascript
function hello() {
  console.log("Hello, World!");
}
\`\`\`

### Table

| Feature | Status |
|---------|--------|
| GFM     | ✅     |
| Tables  | ✅     |
| Tasks   | ✅     |

### Task List

- [x] Write markdown
- [x] Preview it
- [ ] Ship it
`;

export default function MarkdownPreviewPage() {
  const [input, setInput] = useState("");

  const html = useMemo(() => {
    if (!input.trim()) return "";
    try { return marked(input) as string; }
    catch { return "<p>Error rendering markdown</p>"; }
  }, [input]);

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button onClick={() => setInput(SAMPLE)}
            className="px-3 py-1.5 text-sm font-medium rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
            Load Sample
          </button>
          <button onClick={() => setInput("")}
            className="px-3 py-1.5 text-sm font-medium rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
            Clear
          </button>
          {html && <CopyButton text={html} label="Copy HTML" />}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Editor */}
          <div>
            <label className="block text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300">Markdown</label>
            <textarea value={input} onChange={(e) => setInput(e.target.value)}
              placeholder="Type your Markdown here..."
              className="w-full h-[500px] p-4 font-mono text-sm rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" spellCheck={false} />
          </div>

          {/* Preview */}
          <div>
            <label className="block text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300">Preview</label>
            <div
              className="w-full h-[500px] overflow-y-auto p-6 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 prose dark:prose-invert prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: html || '<p class="text-neutral-400">Preview will appear here...</p>' }}
            />
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
