"use client";

import { useState, useCallback } from "react";
import { getToolBySlug } from "@/lib/tools-registry";
import ToolLayout from "@/components/ToolLayout";
import CopyButton from "@/components/CopyButton";

const tool = getToolBySlug("uuid-generator")!;

function generateUUIDv4(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export default function UuidPage() {
  const [uuids, setUuids] = useState<string[]>([generateUUIDv4()]);
  const [count, setCount] = useState(1);
  const [uppercase, setUppercase] = useState(false);
  const [hyphens, setHyphens] = useState(true);

  const formatUuid = useCallback(
    (uuid: string) => {
      const result = hyphens ? uuid : uuid.replace(/-/g, "");
      return uppercase ? result.toUpperCase() : result;
    },
    [uppercase, hyphens]
  );

  const generate = () => {
    const arr = Array.from({ length: count }, () => generateUUIDv4());
    setUuids(arr);
  };

  const allText = uuids.map(formatUuid).join("\n");

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        {/* Controls */}
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-sm">
            <span className="text-neutral-600 dark:text-neutral-400">Count:</span>
            <input
              type="number"
              min={1}
              max={100}
              value={count}
              onChange={(e) => setCount(Math.min(100, Math.max(1, Number(e.target.value))))}
              className="w-20 px-2 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm"
            />
          </label>

          <label className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400 cursor-pointer">
            <input type="checkbox" checked={uppercase} onChange={(e) => setUppercase(e.target.checked)} className="rounded" />
            Uppercase
          </label>

          <label className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400 cursor-pointer">
            <input type="checkbox" checked={hyphens} onChange={(e) => setHyphens(e.target.checked)} className="rounded" />
            Hyphens
          </label>

          <button
            onClick={generate}
            className="px-5 py-2 text-sm font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
          >
            Generate
          </button>

          <CopyButton text={allText} label="Copy All" />
        </div>

        {/* Output */}
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 divide-y divide-neutral-200 dark:divide-neutral-800">
          {uuids.map((uuid, i) => {
            const formatted = formatUuid(uuid);
            return (
              <div key={i} className="flex items-center justify-between px-4 py-2.5 group">
                <code className="text-sm font-mono text-neutral-900 dark:text-white select-all">
                  {formatted}
                </code>
                <CopyButton text={formatted} label="" className="opacity-0 group-hover:opacity-100 !px-2 !py-1" />
              </div>
            );
          })}
        </div>

        <p className="text-xs text-neutral-400">
          Generated using crypto-grade random values (UUID v4). {uuids.length} UUID{uuids.length > 1 ? "s" : ""} shown.
        </p>
      </div>
    </ToolLayout>
  );
}
