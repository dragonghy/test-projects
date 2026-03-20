"use client";

import { useState } from "react";
import { getToolBySlug } from "@/lib/tools-registry";
import ToolLayout from "@/components/ToolLayout";
import CopyButton from "@/components/CopyButton";

const tool = getToolBySlug("html-encode")!;

const ENTITY_MAP: Record<string, string> = {
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  " ": "&nbsp;", "©": "&copy;", "®": "&reg;", "™": "&trade;",
  "€": "&euro;", "£": "&pound;", "¥": "&yen;", "¢": "&cent;",
  "—": "&mdash;", "–": "&ndash;", "…": "&hellip;",
  "←": "&larr;", "→": "&rarr;", "↑": "&uarr;", "↓": "&darr;",
};

const REFERENCE_ENTITIES = [
  { char: "&", entity: "&amp;", desc: "Ampersand" },
  { char: "<", entity: "&lt;", desc: "Less than" },
  { char: ">", entity: "&gt;", desc: "Greater than" },
  { char: '"', entity: "&quot;", desc: "Double quote" },
  { char: "'", entity: "&#39;", desc: "Single quote" },
  { char: " ", entity: "&nbsp;", desc: "Non-breaking space" },
  { char: "©", entity: "&copy;", desc: "Copyright" },
  { char: "®", entity: "&reg;", desc: "Registered" },
  { char: "™", entity: "&trade;", desc: "Trademark" },
  { char: "€", entity: "&euro;", desc: "Euro" },
  { char: "—", entity: "&mdash;", desc: "Em dash" },
  { char: "…", entity: "&hellip;", desc: "Ellipsis" },
];

function htmlEncode(str: string): string {
  return str.replace(/[&<>"']/g, (ch) => ENTITY_MAP[ch] || ch);
}

function htmlDecode(str: string): string {
  const doc = new DOMParser().parseFromString(str, "text/html");
  return doc.documentElement.textContent || "";
}

export default function HtmlEncodePage() {
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  const convert = (val?: string, m?: string) => {
    const text = val ?? input;
    const currentMode = m ?? mode;
    if (!text) { setOutput(""); return; }
    setOutput(currentMode === "encode" ? htmlEncode(text) : htmlDecode(text));
  };

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <button onClick={() => { setMode("encode"); convert(input, "encode"); }}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${mode === "encode" ? "bg-blue-600 text-white" : "border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800"}`}>
            Encode
          </button>
          <button onClick={() => { setMode("decode"); convert(input, "decode"); }}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${mode === "decode" ? "bg-blue-600 text-white" : "border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800"}`}>
            Decode
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300">Input</label>
            <textarea value={input} onChange={(e) => { setInput(e.target.value); convert(e.target.value); }}
              placeholder={mode === "encode" ? '<p>Hello "World" & Friends</p>' : "&lt;p&gt;Hello &quot;World&quot; &amp; Friends&lt;/p&gt;"}
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

        {/* Reference table */}
        <div>
          <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">Common HTML Entities</h3>
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-neutral-100 dark:bg-neutral-800">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-neutral-600 dark:text-neutral-300">Character</th>
                  <th className="px-4 py-2 text-left font-medium text-neutral-600 dark:text-neutral-300">Entity</th>
                  <th className="px-4 py-2 text-left font-medium text-neutral-600 dark:text-neutral-300">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {REFERENCE_ENTITIES.map((e) => (
                  <tr key={e.entity}>
                    <td className="px-4 py-2 font-mono text-neutral-900 dark:text-white">{e.char === " " ? "(space)" : e.char}</td>
                    <td className="px-4 py-2 font-mono text-blue-600 dark:text-blue-400">{e.entity}</td>
                    <td className="px-4 py-2 text-neutral-500 dark:text-neutral-400">{e.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
