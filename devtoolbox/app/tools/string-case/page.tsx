"use client";

import { useState, useMemo } from "react";
import { getToolBySlug } from "@/lib/tools-registry";
import ToolLayout from "@/components/ToolLayout";
import CopyButton from "@/components/CopyButton";

const tool = getToolBySlug("string-case")!;

function tokenize(input: string): string[] {
  // Split by common delimiters: spaces, underscores, hyphens, camelCase boundaries
  return input
    .replace(/([a-z])([A-Z])/g, "$1 $2") // camelCase → camel Case
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2") // XMLParser → XML Parser
    .split(/[\s_\-./]+/)
    .filter(Boolean)
    .map((w) => w.toLowerCase());
}

const CASES = [
  {
    name: "camelCase",
    convert: (words: string[]) => words.map((w, i) => (i === 0 ? w : w.charAt(0).toUpperCase() + w.slice(1))).join(""),
  },
  {
    name: "PascalCase",
    convert: (words: string[]) => words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(""),
  },
  {
    name: "snake_case",
    convert: (words: string[]) => words.join("_"),
  },
  {
    name: "UPPER_SNAKE_CASE",
    convert: (words: string[]) => words.map((w) => w.toUpperCase()).join("_"),
  },
  {
    name: "kebab-case",
    convert: (words: string[]) => words.join("-"),
  },
  {
    name: "lowercase",
    convert: (words: string[]) => words.join(" "),
  },
  {
    name: "Title Case",
    convert: (words: string[]) => words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
  },
  {
    name: "Sentence case",
    convert: (words: string[]) => {
      if (words.length === 0) return "";
      return [words[0].charAt(0).toUpperCase() + words[0].slice(1), ...words.slice(1)].join(" ");
    },
  },
];

export default function StringCasePage() {
  const [input, setInput] = useState("");

  const words = useMemo(() => tokenize(input), [input]);

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300">Input Text</label>
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
            placeholder="myVariableName, my_variable_name, my-variable-name..."
            className="w-full px-4 py-3 text-sm rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500" spellCheck={false} />
        </div>

        {input.trim() && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {CASES.map((c) => {
              const result = c.convert(words);
              return (
                <div key={c.name} className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 group">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">{c.name}</span>
                    <CopyButton text={result} label="" className="opacity-0 group-hover:opacity-100 !px-2 !py-1" />
                  </div>
                  <code className="text-sm font-mono text-neutral-900 dark:text-white break-all select-all">
                    {result}
                  </code>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
