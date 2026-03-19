"use client";

import { useState } from "react";
import yaml from "js-yaml";
import { getToolBySlug } from "@/lib/tools-registry";
import ToolLayout from "@/components/ToolLayout";
import CopyButton from "@/components/CopyButton";

const tool = getToolBySlug("yaml-json")!;

export default function YamlJsonPage() {
  const [mode, setMode] = useState<"yamlToJson" | "jsonToYaml">("yamlToJson");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const convert = (val?: string, m?: string) => {
    const text = val ?? input;
    const currentMode = m ?? mode;
    if (!text.trim()) { setOutput(""); setError(""); return; }
    try {
      if (currentMode === "yamlToJson") {
        const parsed = yaml.load(text);
        setOutput(JSON.stringify(parsed, null, 2));
      } else {
        const parsed = JSON.parse(text);
        setOutput(yaml.dump(parsed, { indent: 2, lineWidth: -1 }));
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
        <div className="flex items-center gap-2">
          <button onClick={() => { setMode("yamlToJson"); convert(input, "yamlToJson"); }}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${mode === "yamlToJson" ? "bg-blue-600 text-white" : "border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800"}`}>
            YAML → JSON
          </button>
          <button onClick={() => { setMode("jsonToYaml"); convert(input, "jsonToYaml"); }}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${mode === "jsonToYaml" ? "bg-blue-600 text-white" : "border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800"}`}>
            JSON → YAML
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300">
              {mode === "yamlToJson" ? "YAML Input" : "JSON Input"}
            </label>
            <textarea value={input} onChange={(e) => { setInput(e.target.value); convert(e.target.value); }}
              placeholder={mode === "yamlToJson" ? "name: John\nage: 30\nhobbies:\n  - reading\n  - coding" : '{"name":"John","age":30,"hobbies":["reading","coding"]}'}
              className="w-full h-72 p-4 font-mono text-sm rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" spellCheck={false} />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                {mode === "yamlToJson" ? "JSON Output" : "YAML Output"}
              </label>
              {output && <CopyButton text={output} />}
            </div>
            <textarea value={output} readOnly placeholder="Result..."
              className="w-full h-72 p-4 font-mono text-sm rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900/50 text-neutral-900 dark:text-white placeholder:text-neutral-400 resize-none" spellCheck={false} />
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-400 text-sm font-mono">{error}</div>
        )}
      </div>
    </ToolLayout>
  );
}
