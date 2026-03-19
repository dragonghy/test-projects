"use client";

import { useState, useCallback, useEffect } from "react";
import { getToolBySlug } from "@/lib/tools-registry";
import ToolLayout from "@/components/ToolLayout";
import CopyButton from "@/components/CopyButton";

const tool = getToolBySlug("password-generator")!;

const CHARSETS = {
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  numbers: "0123456789",
  symbols: "!@#$%^&*()_+-=[]{}|;:',.<>?/~`",
};

function generatePassword(length: number, opts: Record<string, boolean>): string {
  let chars = "";
  if (opts.uppercase) chars += CHARSETS.uppercase;
  if (opts.lowercase) chars += CHARSETS.lowercase;
  if (opts.numbers) chars += CHARSETS.numbers;
  if (opts.symbols) chars += CHARSETS.symbols;
  if (!chars) chars = CHARSETS.lowercase;

  const arr = new Uint32Array(length);
  crypto.getRandomValues(arr);
  return Array.from(arr, (v) => chars[v % chars.length]).join("");
}

function getStrength(pw: string): { label: string; color: string; percent: number } {
  let score = 0;
  if (pw.length >= 12) score++;
  if (pw.length >= 20) score++;
  if (/[a-z]/.test(pw)) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^a-zA-Z0-9]/.test(pw)) score++;

  if (score <= 2) return { label: "Weak", color: "bg-red-500", percent: 25 };
  if (score <= 3) return { label: "Fair", color: "bg-yellow-500", percent: 50 };
  if (score <= 4) return { label: "Good", color: "bg-blue-500", percent: 75 };
  return { label: "Strong", color: "bg-green-500", percent: 100 };
}

export default function PasswordGeneratorPage() {
  const [length, setLength] = useState(16);
  const [opts, setOpts] = useState({ uppercase: true, lowercase: true, numbers: true, symbols: true });
  const [count, setCount] = useState(1);
  const [passwords, setPasswords] = useState<string[]>([]);

  const gen = useCallback(() => {
    setPasswords(Array.from({ length: count }, () => generatePassword(length, opts)));
  }, [length, opts, count]);

  useEffect(() => { gen(); }, [gen]);

  const allText = passwords.join("\n");

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        {/* Controls */}
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-5 space-y-4">
          {/* Length slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Length: {length}
              </label>
            </div>
            <input
              type="range"
              min={8}
              max={128}
              value={length}
              onChange={(e) => setLength(Number(e.target.value))}
              className="w-full accent-blue-600"
            />
            <div className="flex justify-between text-xs text-neutral-400">
              <span>8</span><span>128</span>
            </div>
          </div>

          {/* Character types */}
          <div className="flex flex-wrap gap-4">
            {(Object.keys(CHARSETS) as Array<keyof typeof CHARSETS>).map((key) => (
              <label key={key} className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={opts[key]}
                  onChange={(e) => setOpts({ ...opts, [key]: e.target.checked })}
                  className="rounded"
                />
                <span className="text-neutral-700 dark:text-neutral-300 capitalize">{key}</span>
              </label>
            ))}
          </div>

          {/* Count */}
          <div className="flex items-center gap-3">
            <label className="text-sm text-neutral-600 dark:text-neutral-400">Count:</label>
            <input
              type="number"
              min={1}
              max={20}
              value={count}
              onChange={(e) => setCount(Math.min(20, Math.max(1, Number(e.target.value))))}
              className="w-20 px-2 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm"
            />
            <button
              onClick={gen}
              className="px-5 py-2 text-sm font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
            >
              Generate
            </button>
            <CopyButton text={allText} label="Copy All" />
          </div>
        </div>

        {/* Output */}
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 divide-y divide-neutral-200 dark:divide-neutral-800">
          {passwords.map((pw, i) => {
            const strength = getStrength(pw);
            return (
              <div key={i} className="px-4 py-3 space-y-2">
                <div className="flex items-center justify-between group">
                  <code className="text-sm font-mono text-neutral-900 dark:text-white break-all select-all">
                    {pw}
                  </code>
                  <CopyButton text={pw} label="" className="flex-shrink-0 ml-3 opacity-0 group-hover:opacity-100 !px-2 !py-1" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${strength.color} transition-all`}
                      style={{ width: `${strength.percent}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 w-14 text-right">
                    {strength.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </ToolLayout>
  );
}
