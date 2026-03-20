"use client";

import { useState } from "react";
import { getToolBySlug } from "@/lib/tools-registry";
import ToolLayout from "@/components/ToolLayout";
import CopyButton from "@/components/CopyButton";

const tool = getToolBySlug("number-base")!;

interface BaseValues {
  decimal: string;
  hex: string;
  binary: string;
  octal: string;
}

function convert(value: string, fromBase: number): BaseValues | null {
  try {
    const num = BigInt(fromBase === 10 ? value : (fromBase === 16 ? "0x" + value : fromBase === 2 ? "0b" + value : "0o" + value));
    return {
      decimal: num.toString(10),
      hex: num.toString(16).toUpperCase(),
      binary: num.toString(2),
      octal: num.toString(8),
    };
  } catch {
    return null;
  }
}

const BASES = [
  { key: "decimal", label: "Decimal (Base 10)", base: 10, prefix: "", placeholder: "255" },
  { key: "hex", label: "Hexadecimal (Base 16)", base: 16, prefix: "0x", placeholder: "FF" },
  { key: "binary", label: "Binary (Base 2)", base: 2, prefix: "0b", placeholder: "11111111" },
  { key: "octal", label: "Octal (Base 8)", base: 8, prefix: "0o", placeholder: "377" },
] as const;

export default function NumberBasePage() {
  const [values, setValues] = useState<BaseValues>({ decimal: "", hex: "", binary: "", octal: "" });
  const [activeBase, setActiveBase] = useState<string>("");
  const [error, setError] = useState("");

  const handleChange = (key: string, value: string, base: number) => {
    setActiveBase(key);
    if (!value.trim()) {
      setValues({ decimal: "", hex: "", binary: "", octal: "" });
      setError("");
      return;
    }
    const result = convert(value.trim(), base);
    if (result) {
      setValues(result);
      setError("");
    } else {
      setValues({ ...values, [key]: value });
      setError(`Invalid ${key} value`);
    }
  };

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-4">
        {BASES.map(({ key, label, base, prefix, placeholder }) => (
          <div key={key} className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{label}</label>
              {values[key as keyof BaseValues] && <CopyButton text={values[key as keyof BaseValues]} />}
            </div>
            <div className="flex items-center gap-2">
              {prefix && <span className="text-sm font-mono text-neutral-400">{prefix}</span>}
              <input
                type="text"
                value={activeBase === key ? undefined : values[key as keyof BaseValues]}
                defaultValue={activeBase === key ? values[key as keyof BaseValues] : undefined}
                onChange={(e) => handleChange(key, e.target.value, base)}
                onFocus={() => setActiveBase(key)}
                placeholder={placeholder}
                className="flex-1 px-3 py-2 font-mono text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                spellCheck={false}
              />
            </div>
          </div>
        ))}

        {error && (
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-400 text-sm">{error}</div>
        )}
      </div>
    </ToolLayout>
  );
}
