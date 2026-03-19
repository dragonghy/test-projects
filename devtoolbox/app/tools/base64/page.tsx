"use client";

import { useState, useCallback } from "react";
import { getToolBySlug } from "@/lib/tools-registry";
import ToolLayout from "@/components/ToolLayout";
import CopyButton from "@/components/CopyButton";

const tool = getToolBySlug("base64")!;

function isBase64(str: string): boolean {
  if (!str.trim()) return false;
  try {
    return btoa(atob(str)) === str.replace(/\s/g, "");
  } catch {
    return false;
  }
}

export default function Base64Page() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");

  const process = useCallback((val: string, m: "encode" | "decode") => {
    if (!val.trim()) { setOutput(""); setError(""); return; }
    try {
      if (m === "encode") {
        setOutput(btoa(unescape(encodeURIComponent(val))));
      } else {
        setOutput(decodeURIComponent(escape(atob(val.replace(/\s/g, "")))));
      }
      setError("");
    } catch {
      setError(m === "decode" ? "Invalid Base64 string" : "Encoding failed");
      setOutput("");
    }
  }, []);

  const handleInput = (val: string) => {
    setInput(val);
    setFileName("");
    // Auto-detect
    if (isBase64(val) && val.length > 8) {
      setMode("decode");
      process(val, "decode");
    } else {
      process(val, mode);
    }
  };

  const handleModeChange = (m: "encode" | "decode") => {
    setMode(m);
    process(input, m);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // data URL to raw base64
      const base64 = result.split(",")[1] || result;
      setInput(`[File: ${file.name}]`);
      setOutput(base64);
      setMode("encode");
      setError("");
    };
    reader.readAsDataURL(file);
  };

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-4">
        {/* Mode toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleModeChange("encode")}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              mode === "encode"
                ? "bg-blue-600 text-white"
                : "border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            }`}
          >
            Encode
          </button>
          <button
            onClick={() => handleModeChange("decode")}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              mode === "decode"
                ? "bg-blue-600 text-white"
                : "border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            }`}
          >
            Decode
          </button>
          <span className="text-xs text-neutral-400 ml-2">Auto-detects Base64 input</span>
        </div>

        {/* File upload */}
        <div className="flex items-center gap-3">
          <label className="px-4 py-2 text-sm font-medium rounded-lg border border-dashed border-neutral-400 dark:border-neutral-600 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
            Upload File
            <input type="file" className="hidden" onChange={handleFile} />
          </label>
          {fileName && (
            <span className="text-sm text-neutral-500 dark:text-neutral-400">{fileName}</span>
          )}
        </div>

        {/* Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300">
              {mode === "encode" ? "Text / Data" : "Base64 String"}
            </label>
            <textarea
              value={input}
              onChange={(e) => handleInput(e.target.value)}
              placeholder={mode === "encode" ? "Enter text to encode..." : "Paste Base64 string to decode..."}
              className="w-full h-64 p-4 font-mono text-sm rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              spellCheck={false}
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                {mode === "encode" ? "Base64 Output" : "Decoded Text"}
              </label>
              {output && <CopyButton text={output} />}
            </div>
            <textarea
              value={output}
              readOnly
              placeholder="Result will appear here..."
              className="w-full h-64 p-4 font-mono text-sm rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900/50 text-neutral-900 dark:text-white placeholder:text-neutral-400 resize-none"
              spellCheck={false}
            />
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-400 text-sm">
            {error}
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
