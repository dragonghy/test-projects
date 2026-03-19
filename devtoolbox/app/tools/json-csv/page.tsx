"use client";

import { useState } from "react";
import { getToolBySlug } from "@/lib/tools-registry";
import ToolLayout from "@/components/ToolLayout";
import CopyButton from "@/components/CopyButton";

const tool = getToolBySlug("json-csv")!;

function csvToJson(csv: string, delimiter: string): object[] {
  const lines = csv.trim().split("\n");
  if (lines.length < 2) throw new Error("CSV must have at least a header row and one data row");
  const headers = parseCsvLine(lines[0], delimiter);
  return lines.slice(1).filter(l => l.trim()).map((line) => {
    const values = parseCsvLine(line, delimiter);
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => { obj[h] = values[i] ?? ""; });
    return obj;
  });
}

function parseCsvLine(line: string, delimiter: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') { current += '"'; i++; }
      else if (ch === '"') { inQuotes = false; }
      else { current += ch; }
    } else {
      if (ch === '"') { inQuotes = true; }
      else if (ch === delimiter) { result.push(current); current = ""; }
      else { current += ch; }
    }
  }
  result.push(current);
  return result;
}

function jsonToCsv(jsonStr: string, delimiter: string): string {
  const data = JSON.parse(jsonStr);
  if (!Array.isArray(data) || data.length === 0) throw new Error("JSON must be a non-empty array of objects");
  const headers = Object.keys(data[0]);
  const escapeField = (val: unknown) => {
    const str = String(val ?? "");
    if (str.includes(delimiter) || str.includes('"') || str.includes("\n")) {
      return '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
  };
  const rows = [headers.map(escapeField).join(delimiter)];
  for (const row of data) {
    rows.push(headers.map((h) => escapeField((row as Record<string, unknown>)[h])).join(delimiter));
  }
  return rows.join("\n");
}

export default function JsonCsvPage() {
  const [mode, setMode] = useState<"csvToJson" | "jsonToCsv">("csvToJson");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [delimiter, setDelimiter] = useState(",");

  const convert = (val?: string, m?: string, d?: string) => {
    const text = val ?? input;
    const currentMode = m ?? mode;
    const delim = d ?? delimiter;
    if (!text.trim()) { setOutput(""); setError(""); return; }
    try {
      if (currentMode === "csvToJson") {
        setOutput(JSON.stringify(csvToJson(text, delim), null, 2));
      } else {
        setOutput(jsonToCsv(text, delim));
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
          <button onClick={() => { setMode("csvToJson"); convert(input, "csvToJson"); }}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${mode === "csvToJson" ? "bg-blue-600 text-white" : "border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800"}`}>
            CSV → JSON
          </button>
          <button onClick={() => { setMode("jsonToCsv"); convert(input, "jsonToCsv"); }}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${mode === "jsonToCsv" ? "bg-blue-600 text-white" : "border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800"}`}>
            JSON → CSV
          </button>
          <label className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
            Delimiter:
            <select value={delimiter} onChange={(e) => { setDelimiter(e.target.value); convert(input, mode, e.target.value); }}
              className="px-2 py-1 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm">
              <option value=",">Comma (,)</option>
              <option value=";">Semicolon (;)</option>
              <option value={"\t"}>Tab</option>
            </select>
          </label>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300">
              {mode === "csvToJson" ? "CSV Input" : "JSON Input"}
            </label>
            <textarea value={input} onChange={(e) => { setInput(e.target.value); convert(e.target.value); }}
              placeholder={mode === "csvToJson" ? "name,age,city\nJohn,30,NYC\nJane,25,LA" : '[{"name":"John","age":30},{"name":"Jane","age":25}]'}
              className="w-full h-72 p-4 font-mono text-sm rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" spellCheck={false} />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                {mode === "csvToJson" ? "JSON Output" : "CSV Output"}
              </label>
              {output && <CopyButton text={output} />}
            </div>
            <textarea value={output} readOnly placeholder="Result..."
              className="w-full h-72 p-4 font-mono text-sm rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900/50 text-neutral-900 dark:text-white placeholder:text-neutral-400 resize-none" spellCheck={false} />
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-400 text-sm">{error}</div>
        )}
      </div>
    </ToolLayout>
  );
}
