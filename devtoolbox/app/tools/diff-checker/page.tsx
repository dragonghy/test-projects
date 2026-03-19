"use client";

import { useState, useMemo } from "react";
import { diffLines, type Change } from "diff";
import { getToolBySlug } from "@/lib/tools-registry";
import ToolLayout from "@/components/ToolLayout";

const tool = getToolBySlug("diff-checker")!;

export default function DiffCheckerPage() {
  const [left, setLeft] = useState("");
  const [right, setRight] = useState("");

  const changes = useMemo<Change[]>(() => {
    if (!left && !right) return [];
    return diffLines(left, right);
  }, [left, right]);

  const stats = useMemo(() => {
    let added = 0, removed = 0, unchanged = 0;
    for (const c of changes) {
      const lines = c.value.split("\n").filter(Boolean).length;
      if (c.added) added += lines;
      else if (c.removed) removed += lines;
      else unchanged += lines;
    }
    return { added, removed, unchanged };
  }, [changes]);

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-4">
        {/* Inputs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300">Original Text</label>
            <textarea value={left} onChange={(e) => setLeft(e.target.value)}
              placeholder="Paste original text..."
              className="w-full h-48 p-4 font-mono text-sm rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" spellCheck={false} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300">Modified Text</label>
            <textarea value={right} onChange={(e) => setRight(e.target.value)}
              placeholder="Paste modified text..."
              className="w-full h-48 p-4 font-mono text-sm rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" spellCheck={false} />
          </div>
        </div>

        {/* Stats */}
        {(left || right) && (
          <div className="flex items-center gap-4 text-sm">
            <span className="text-green-600 dark:text-green-400">+ {stats.added} added</span>
            <span className="text-red-600 dark:text-red-400">- {stats.removed} removed</span>
            <span className="text-neutral-500">{stats.unchanged} unchanged</span>
          </div>
        )}

        {/* Diff output */}
        {changes.length > 0 && (
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
            <div className="overflow-x-auto">
              <pre className="p-0 m-0 text-sm font-mono">
                {changes.map((change, i) => {
                  const lines = change.value.split("\n");
                  // Remove trailing empty line from split
                  if (lines[lines.length - 1] === "") lines.pop();
                  return lines.map((line, j) => (
                    <div
                      key={`${i}-${j}`}
                      className={`px-4 py-0.5 ${
                        change.added
                          ? "bg-green-50 dark:bg-green-500/10 text-green-800 dark:text-green-300"
                          : change.removed
                          ? "bg-red-50 dark:bg-red-500/10 text-red-800 dark:text-red-300"
                          : "text-neutral-700 dark:text-neutral-300"
                      }`}
                    >
                      <span className="inline-block w-5 text-neutral-400 select-none">
                        {change.added ? "+" : change.removed ? "-" : " "}
                      </span>
                      {line || " "}
                    </div>
                  ));
                })}
              </pre>
            </div>
          </div>
        )}

        {left && right && changes.length === 1 && !changes[0].added && !changes[0].removed && (
          <p className="text-sm text-green-600 dark:text-green-400 text-center py-4">
            No differences found. The texts are identical.
          </p>
        )}
      </div>
    </ToolLayout>
  );
}
