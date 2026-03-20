"use client";

import { useState } from "react";
import { getToolBySlug } from "@/lib/tools-registry";
import ToolLayout from "@/components/ToolLayout";
import CopyButton from "@/components/CopyButton";

const tool = getToolBySlug("json-to-typescript")!;

const SAMPLE = `{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "active": true,
  "scores": [95, 87, 92],
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "zip": "10001"
  },
  "tags": ["admin", "user"]
}`;

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function jsonToTs(
  obj: unknown,
  name: string,
  useInterface: boolean,
  indent: number = 0
): string {
  const interfaces: string[] = [];

  function getType(value: unknown, key: string, depth: number): string {
    if (value === null) return "null";
    if (Array.isArray(value)) {
      if (value.length === 0) return "unknown[]";
      const itemType = getType(value[0], key, depth);
      return `${itemType}[]`;
    }
    if (typeof value === "object") {
      const subName = capitalize(key);
      interfaces.push(generateInterface(value as Record<string, unknown>, subName, depth));
      return subName;
    }
    return typeof value;
  }

  function generateInterface(obj: Record<string, unknown>, typeName: string, depth: number): string {
    const p = "  ".repeat(depth);
    const keyword = useInterface ? "interface" : "type";
    const eq = useInterface ? "" : " =";
    const lines = [`${p}export ${keyword} ${typeName}${eq} {`];
    for (const [key, value] of Object.entries(obj)) {
      const safeKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : `"${key}"`;
      lines.push(`${p}  ${safeKey}: ${getType(value, key, depth)};`);
    }
    lines.push(`${p}}${useInterface ? "" : ";"}`);
    return lines.join("\n");
  }

  if (typeof obj !== "object" || obj === null) {
    return `export type ${name} = ${typeof obj};`;
  }

  if (Array.isArray(obj)) {
    if (obj.length > 0 && typeof obj[0] === "object") {
      const result = generateInterface(obj[0] as Record<string, unknown>, name, indent);
      return [...interfaces, result].join("\n\n");
    }
    return `export type ${name} = ${typeof obj[0]}[];`;
  }

  const result = generateInterface(obj as Record<string, unknown>, name, indent);
  return [...interfaces, result].join("\n\n");
}

export default function JsonToTypescriptPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [rootName, setRootName] = useState("Root");
  const [useInterface, setUseInterface] = useState(true);

  const convert = (val?: string, iface?: boolean, name?: string) => {
    const text = val ?? input;
    const ui = iface ?? useInterface;
    const rn = name ?? rootName;
    if (!text.trim()) { setOutput(""); setError(""); return; }
    try {
      const parsed = JSON.parse(text);
      setOutput(jsonToTs(parsed, rn, ui));
      setError("");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Invalid JSON");
      setOutput("");
    }
  };

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm">
            <span className="text-neutral-600 dark:text-neutral-400">Root name:</span>
            <input type="text" value={rootName} onChange={(e) => { setRootName(e.target.value); convert(input, useInterface, e.target.value); }}
              className="w-28 px-2 py-1 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm" />
          </label>
          <label className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400 cursor-pointer">
            <input type="radio" name="style" checked={useInterface} onChange={() => { setUseInterface(true); convert(input, true); }} />
            interface
          </label>
          <label className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400 cursor-pointer">
            <input type="radio" name="style" checked={!useInterface} onChange={() => { setUseInterface(false); convert(input, false); }} />
            type
          </label>
          <button onClick={() => { setInput(SAMPLE); convert(SAMPLE); }} className="px-3 py-1.5 text-sm font-medium rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">Load Sample</button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300">JSON Input</label>
            <textarea value={input} onChange={(e) => { setInput(e.target.value); convert(e.target.value); }}
              placeholder='{"name": "John", "age": 30}'
              className="w-full h-80 p-4 font-mono text-sm rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" spellCheck={false} />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">TypeScript Output</label>
              {output && <CopyButton text={output} />}
            </div>
            <textarea value={output} readOnly placeholder="TypeScript interfaces..."
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
