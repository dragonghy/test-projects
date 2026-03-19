"use client";

import { useState, useMemo } from "react";
import { getToolBySlug } from "@/lib/tools-registry";
import ToolLayout from "@/components/ToolLayout";

const tool = getToolBySlug("regex-tester")!;

interface MatchInfo {
  match: string;
  index: number;
  groups: string[];
}

const FLAGS = [
  { key: "g", label: "Global", desc: "Find all matches" },
  { key: "i", label: "Case-insensitive", desc: "Ignore case" },
  { key: "m", label: "Multiline", desc: "^ and $ match line boundaries" },
  { key: "s", label: "DotAll", desc: ". matches newlines" },
];

export default function RegexTesterPage() {
  const [pattern, setPattern] = useState("");
  const [flags, setFlags] = useState("g");
  const [testText, setTestText] = useState("");
  const [error, setError] = useState("");

  const toggleFlag = (flag: string) => {
    setFlags((f) => (f.includes(flag) ? f.replace(flag, "") : f + flag));
  };

  const matches = useMemo<MatchInfo[]>(() => {
    if (!pattern || !testText) { setError(""); return []; }
    try {
      const regex = new RegExp(pattern, flags);
      setError("");
      const results: MatchInfo[] = [];
      if (flags.includes("g")) {
        let m;
        while ((m = regex.exec(testText)) !== null) {
          results.push({
            match: m[0],
            index: m.index,
            groups: m.slice(1),
          });
          if (!m[0]) regex.lastIndex++; // prevent infinite loop on zero-width match
        }
      } else {
        const m = regex.exec(testText);
        if (m) {
          results.push({ match: m[0], index: m.index, groups: m.slice(1) });
        }
      }
      return results;
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Invalid regex");
      return [];
    }
  }, [pattern, flags, testText]);

  // Build highlighted text
  const highlightedHtml = useMemo(() => {
    if (!pattern || !testText || matches.length === 0) return null;
    try {
      const regex = new RegExp(pattern, flags.includes("g") ? flags : flags + "g");
      const parts: string[] = [];
      let lastIdx = 0;
      const text = testText;
      let m;
      while ((m = regex.exec(text)) !== null) {
        if (m.index > lastIdx) {
          parts.push(escapeHtml(text.slice(lastIdx, m.index)));
        }
        parts.push(`<mark class="bg-yellow-300 dark:bg-yellow-500/40 rounded px-0.5">${escapeHtml(m[0])}</mark>`);
        lastIdx = m.index + m[0].length;
        if (!m[0]) { regex.lastIndex++; lastIdx++; }
      }
      if (lastIdx < text.length) parts.push(escapeHtml(text.slice(lastIdx)));
      return parts.join("");
    } catch {
      return null;
    }
  }, [pattern, flags, testText, matches]);

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-4">
        {/* Pattern */}
        <div>
          <label className="block text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300">
            Regular Expression
          </label>
          <div className="flex items-center gap-1 font-mono text-lg">
            <span className="text-neutral-400">/</span>
            <input
              type="text"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              placeholder="Enter regex pattern..."
              className="flex-1 px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              spellCheck={false}
            />
            <span className="text-neutral-400">/{flags}</span>
          </div>
        </div>

        {/* Flags */}
        <div className="flex flex-wrap gap-2">
          {FLAGS.map((f) => (
            <button
              key={f.key}
              onClick={() => toggleFlag(f.key)}
              title={f.desc}
              className={`px-3 py-1 text-sm font-mono rounded-lg border transition-colors ${
                flags.includes(f.key)
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400"
                  : "border-neutral-300 dark:border-neutral-700 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              }`}
            >
              {f.key} <span className="text-xs font-sans ml-1 opacity-70">{f.label}</span>
            </button>
          ))}
        </div>

        {/* Test text */}
        <div>
          <label className="block text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300">
            Test String
          </label>
          <textarea
            value={testText}
            onChange={(e) => setTestText(e.target.value)}
            placeholder="Enter text to test against..."
            className="w-full h-40 p-4 font-mono text-sm rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            spellCheck={false}
          />
        </div>

        {/* Highlighted preview */}
        {highlightedHtml && (
          <div>
            <label className="block text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300">
              Match Highlighting
            </label>
            <div
              className="p-4 font-mono text-sm rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900/50 whitespace-pre-wrap break-all"
              dangerouslySetInnerHTML={{ __html: highlightedHtml }}
            />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-400 text-sm font-mono">
            {error}
          </div>
        )}

        {/* Matches table */}
        {matches.length > 0 && (
          <div>
            <label className="block text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300">
              Matches ({matches.length})
            </label>
            <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-neutral-100 dark:bg-neutral-800">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium text-neutral-600 dark:text-neutral-300">#</th>
                    <th className="px-4 py-2 text-left font-medium text-neutral-600 dark:text-neutral-300">Match</th>
                    <th className="px-4 py-2 text-left font-medium text-neutral-600 dark:text-neutral-300">Index</th>
                    <th className="px-4 py-2 text-left font-medium text-neutral-600 dark:text-neutral-300">Groups</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                  {matches.map((m, i) => (
                    <tr key={i}>
                      <td className="px-4 py-2 text-neutral-500">{i + 1}</td>
                      <td className="px-4 py-2 font-mono text-neutral-900 dark:text-white">&quot;{m.match}&quot;</td>
                      <td className="px-4 py-2 text-neutral-500">{m.index}</td>
                      <td className="px-4 py-2 font-mono text-neutral-500">
                        {m.groups.length > 0 ? m.groups.map((g, j) => <span key={j} className="mr-2">${j + 1}: &quot;{g}&quot;</span>) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {pattern && testText && matches.length === 0 && !error && (
          <p className="text-sm text-neutral-500 dark:text-neutral-400 text-center py-4">
            No matches found.
          </p>
        )}
      </div>
    </ToolLayout>
  );
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
