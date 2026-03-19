"use client";

import { useState, useCallback } from "react";
import { getToolBySlug } from "@/lib/tools-registry";
import ToolLayout from "@/components/ToolLayout";
import CopyButton from "@/components/CopyButton";

const tool = getToolBySlug("json-formatter")!;

const SAMPLE = `{"name":"John","age":30,"address":{"city":"New York","zip":"10001"},"hobbies":["reading","coding","gaming"]}`;

export default function JsonFormatterPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [indent, setIndent] = useState(2);

  const format = useCallback(
    (raw: string, spaces: number) => {
      if (!raw.trim()) {
        setOutput("");
        setError("");
        return;
      }
      try {
        const parsed = JSON.parse(raw);
        setOutput(JSON.stringify(parsed, null, spaces));
        setError("");
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Invalid JSON";
        setError(msg);
        setOutput("");
      }
    },
    []
  );

  const handleInput = (val: string) => {
    setInput(val);
    format(val, indent);
  };

  const minify = () => {
    if (!input.trim()) return;
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed));
      setError("");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Invalid JSON");
    }
  };

  const loadSample = () => {
    setInput(SAMPLE);
    format(SAMPLE, indent);
  };

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-4">
        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
            Indent:
            <select
              value={indent}
              onChange={(e) => {
                const v = Number(e.target.value);
                setIndent(v);
                if (input.trim()) format(input, v);
              }}
              className="px-2 py-1 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm"
            >
              <option value={2}>2 spaces</option>
              <option value={4}>4 spaces</option>
              <option value={1}>Tab</option>
            </select>
          </label>
          <button
            onClick={minify}
            className="px-3 py-1.5 text-sm font-medium rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            Minify
          </button>
          <button
            onClick={loadSample}
            className="px-3 py-1.5 text-sm font-medium rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            Load Sample
          </button>
          <button
            onClick={() => { setInput(""); setOutput(""); setError(""); }}
            className="px-3 py-1.5 text-sm font-medium rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            Clear
          </button>
        </div>

        {/* Editor panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Input */}
          <div>
            <label className="block text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300">
              Input JSON
            </label>
            <textarea
              value={input}
              onChange={(e) => handleInput(e.target.value)}
              placeholder="Paste your JSON here..."
              className="w-full h-80 p-4 font-mono text-sm rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              spellCheck={false}
            />
          </div>

          {/* Output */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Output
              </label>
              {output && <CopyButton text={output} />}
            </div>
            <textarea
              value={output}
              readOnly
              placeholder="Formatted JSON will appear here..."
              className="w-full h-80 p-4 font-mono text-sm rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900/50 text-neutral-900 dark:text-white placeholder:text-neutral-400 resize-none"
              spellCheck={false}
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-400 text-sm font-mono">
            <span className="font-semibold">Error:</span> {error}
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
