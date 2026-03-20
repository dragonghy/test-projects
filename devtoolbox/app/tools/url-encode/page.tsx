"use client";

import { useState } from "react";
import { getToolBySlug } from "@/lib/tools-registry";
import ToolLayout from "@/components/ToolLayout";
import CopyButton from "@/components/CopyButton";

const tool = getToolBySlug("url-encode")!;

export default function UrlEncodePage() {
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [encodeMode, setEncodeMode] = useState<"component" | "uri">("component");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const convert = (val?: string, m?: string, em?: string) => {
    const text = val ?? input;
    const currentMode = m ?? mode;
    const currentEncMode = em ?? encodeMode;
    if (!text) { setOutput(""); setError(""); return; }
    try {
      if (currentMode === "encode") {
        setOutput(currentEncMode === "component" ? encodeURIComponent(text) : encodeURI(text));
      } else {
        setOutput(currentEncMode === "component" ? decodeURIComponent(text) : decodeURI(text));
      }
      setError("");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Conversion failed");
      setOutput("");
    }
  };

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={() => { setMode("encode"); convert(input, "encode"); }}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${mode === "encode" ? "bg-blue-600 text-white" : "border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800"}`}>
            Encode
          </button>
          <button onClick={() => { setMode("decode"); convert(input, "decode"); }}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${mode === "decode" ? "bg-blue-600 text-white" : "border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800"}`}>
            Decode
          </button>
          <span className="text-neutral-300 dark:text-neutral-700">|</span>
          <label className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
            Mode:
            <select value={encodeMode} onChange={(e) => { const v = e.target.value as "component" | "uri"; setEncodeMode(v); convert(input, mode, v); }}
              className="px-2 py-1 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm">
              <option value="component">encodeURIComponent (values)</option>
              <option value="uri">encodeURI (full URL)</option>
            </select>
          </label>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300">Input</label>
            <textarea value={input} onChange={(e) => { setInput(e.target.value); convert(e.target.value); }}
              placeholder={mode === "encode" ? "Hello World! 你好 @#$%" : "Hello%20World%21%20%E4%BD%A0%E5%A5%BD"}
              className="w-full h-48 p-4 font-mono text-sm rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" spellCheck={false} />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Output</label>
              {output && <CopyButton text={output} />}
            </div>
            <textarea value={output} readOnly placeholder="Result..."
              className="w-full h-48 p-4 font-mono text-sm rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900/50 text-neutral-900 dark:text-white placeholder:text-neutral-400 resize-none" spellCheck={false} />
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-400 text-sm">{error}</div>
        )}
      </div>
    </ToolLayout>
  );
}
