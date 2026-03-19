"use client";

import { useState, useMemo } from "react";
import { getToolBySlug } from "@/lib/tools-registry";
import ToolLayout from "@/components/ToolLayout";
import CopyButton from "@/components/CopyButton";

const tool = getToolBySlug("lorem-ipsum")!;

const WORDS = "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt in culpa qui officia deserunt mollit anim id est laborum".split(" ");

function getRandomWords(count: number): string {
  const result: string[] = [];
  for (let i = 0; i < count; i++) {
    result.push(WORDS[Math.floor(Math.random() * WORDS.length)]);
  }
  result[0] = result[0].charAt(0).toUpperCase() + result[0].slice(1);
  return result.join(" ");
}

function generateSentence(): string {
  const wordCount = 8 + Math.floor(Math.random() * 12);
  return getRandomWords(wordCount) + ".";
}

function generateParagraph(): string {
  const sentenceCount = 3 + Math.floor(Math.random() * 4);
  return Array.from({ length: sentenceCount }, generateSentence).join(" ");
}

export default function LoremIpsumPage() {
  const [mode, setMode] = useState<"paragraphs" | "sentences" | "words">("paragraphs");
  const [count, setCount] = useState(3);
  const [startWithLorem, setStartWithLorem] = useState(true);
  const [seed, setSeed] = useState(0); // force regeneration

  const output = useMemo(() => {
    void seed; // use seed to trigger recalculation
    let result = "";
    if (mode === "paragraphs") {
      result = Array.from({ length: count }, generateParagraph).join("\n\n");
    } else if (mode === "sentences") {
      result = Array.from({ length: count }, generateSentence).join(" ");
    } else {
      result = getRandomWords(count) + ".";
    }
    if (startWithLorem) {
      result = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. " + result.slice(result.indexOf(" ", 10) + 1);
    }
    return result;
  }, [mode, count, startWithLorem, seed]);

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        {/* Controls */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            {(["paragraphs", "sentences", "words"] as const).map((m) => (
              <button key={m} onClick={() => setMode(m)}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg capitalize transition-colors ${
                  mode === m ? "bg-blue-600 text-white" : "border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                }`}>
                {m}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-2 text-sm">
            <span className="text-neutral-600 dark:text-neutral-400">Count:</span>
            <input type="number" min={1} max={mode === "words" ? 500 : 50} value={count}
              onChange={(e) => setCount(Math.max(1, Number(e.target.value)))}
              className="w-20 px-2 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm" />
          </label>

          <label className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400 cursor-pointer">
            <input type="checkbox" checked={startWithLorem} onChange={(e) => setStartWithLorem(e.target.checked)} className="rounded" />
            Start with &quot;Lorem ipsum...&quot;
          </label>

          <button onClick={() => setSeed((s) => s + 1)}
            className="px-4 py-1.5 text-sm font-medium rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors">
            Regenerate
          </button>

          <CopyButton text={output} />
        </div>

        {/* Output */}
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 p-6">
          <div className="prose dark:prose-invert prose-sm max-w-none">
            {output.split("\n\n").map((p, i) => (
              <p key={i} className="text-neutral-700 dark:text-neutral-300 leading-relaxed">{p}</p>
            ))}
          </div>
        </div>

        <p className="text-xs text-neutral-400">
          {output.split(/\s+/).filter(Boolean).length} words · {output.length} characters
        </p>
      </div>
    </ToolLayout>
  );
}
