"use client";

import { useState } from "react";
import { format as formatSQL } from "sql-formatter";
import { getToolBySlug } from "@/lib/tools-registry";
import ToolLayout from "@/components/ToolLayout";
import CopyButton from "@/components/CopyButton";

const tool = getToolBySlug("sql-formatter")!;

const SAMPLE = `SELECT users.id, users.name, orders.total FROM users INNER JOIN orders ON users.id = orders.user_id WHERE orders.total > 100 AND users.active = true ORDER BY orders.total DESC LIMIT 10;`;

const DIALECTS = [
  { value: "sql", label: "Standard SQL" },
  { value: "mysql", label: "MySQL" },
  { value: "postgresql", label: "PostgreSQL" },
  { value: "sqlite", label: "SQLite" },
  { value: "bigquery", label: "BigQuery" },
  { value: "transactsql", label: "SQL Server" },
] as const;

// SQL keyword highlighting
function highlightSQL(sql: string): string {
  const keywords = /\b(SELECT|FROM|WHERE|AND|OR|NOT|IN|ON|AS|JOIN|INNER|LEFT|RIGHT|OUTER|FULL|CROSS|ORDER|BY|GROUP|HAVING|LIMIT|OFFSET|INSERT|INTO|VALUES|UPDATE|SET|DELETE|CREATE|TABLE|ALTER|DROP|INDEX|VIEW|UNION|ALL|DISTINCT|CASE|WHEN|THEN|ELSE|END|NULL|IS|LIKE|BETWEEN|EXISTS|COUNT|SUM|AVG|MAX|MIN|ASC|DESC|PRIMARY|KEY|FOREIGN|REFERENCES|CONSTRAINT|DEFAULT|CHECK|UNIQUE|IF|ELSE|BEGIN|COMMIT|ROLLBACK|TRUE|FALSE)\b/gi;
  return sql
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(keywords, '<span class="text-blue-600 dark:text-blue-400 font-semibold">$1</span>')
    .replace(/'([^']*)'/g, '<span class="text-green-600 dark:text-green-400">\'$1\'</span>')
    .replace(/--.*$/gm, '<span class="text-neutral-400 italic">$&</span>');
}

export default function SqlFormatterPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [dialect, setDialect] = useState<string>("sql");
  const [indent, setIndent] = useState(2);

  const format = (val?: string, lang?: string, spaces?: number) => {
    const text = val ?? input;
    const d = lang ?? dialect;
    const ind = spaces ?? indent;
    if (!text.trim()) { setOutput(""); setError(""); return; }
    try {
      const result = formatSQL(text, {
        language: d as "sql",
        tabWidth: ind,
        keywordCase: "upper",
      });
      setOutput(result);
      setError("");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Formatting failed");
      setOutput("");
    }
  };

  const minify = () => {
    if (!input.trim()) return;
    setOutput(input.replace(/\s+/g, " ").trim());
    setError("");
  };

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
            Dialect:
            <select value={dialect} onChange={(e) => { setDialect(e.target.value); format(input, e.target.value); }}
              className="px-2 py-1 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm">
              {DIALECTS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
            Indent:
            <select value={indent} onChange={(e) => { const v = Number(e.target.value); setIndent(v); format(input, dialect, v); }}
              className="px-2 py-1 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm">
              <option value={2}>2 spaces</option>
              <option value={4}>4 spaces</option>
            </select>
          </label>
          <button onClick={minify} className="px-3 py-1.5 text-sm font-medium rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">Minify</button>
          <button onClick={() => { setInput(SAMPLE); format(SAMPLE); }} className="px-3 py-1.5 text-sm font-medium rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">Load Sample</button>
          <button onClick={() => { setInput(""); setOutput(""); setError(""); }} className="px-3 py-1.5 text-sm font-medium rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">Clear</button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300">Input SQL</label>
            <textarea value={input} onChange={(e) => { setInput(e.target.value); format(e.target.value); }}
              placeholder="Paste your SQL query here..."
              className="w-full h-80 p-4 font-mono text-sm rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" spellCheck={false} />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Formatted Output</label>
              {output && <CopyButton text={output} />}
            </div>
            <div className="w-full h-80 overflow-auto p-4 font-mono text-sm rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900/50">
              {output ? (
                <pre className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: highlightSQL(output) }} />
              ) : (
                <span className="text-neutral-400">Formatted SQL will appear here...</span>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-400 text-sm">{error}</div>
        )}
      </div>
    </ToolLayout>
  );
}
