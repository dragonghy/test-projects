"use client";

import { useState, useCallback } from "react";
import { getToolBySlug } from "@/lib/tools-registry";
import ToolLayout from "@/components/ToolLayout";
import CopyButton from "@/components/CopyButton";

const tool = getToolBySlug("color-picker")!;

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, Math.round(l * 100)];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h /= 360; s /= 100; l /= 100;
  if (s === 0) { const v = Math.round(l * 255); return [v, v, v]; }
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1; if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return [Math.round(hue2rgb(p, q, h + 1/3) * 255), Math.round(hue2rgb(p, q, h) * 255), Math.round(hue2rgb(p, q, h - 1/3) * 255)];
}

export default function ColorPickerPage() {
  const [hex, setHex] = useState("#3b82f6");
  const [r, g, b] = hexToRgb(hex);
  const [h, s, l] = rgbToHsl(r, g, b);

  const rgbStr = `rgb(${r}, ${g}, ${b})`;
  const hslStr = `hsl(${h}, ${s}%, ${l}%)`;

  const updateFromHex = (val: string) => {
    if (/^#[0-9a-fA-F]{6}$/.test(val)) setHex(val.toLowerCase());
  };

  const updateFromRgb = useCallback((nr: number, ng: number, nb: number) => {
    setHex(rgbToHex(Math.min(255, Math.max(0, nr)), Math.min(255, Math.max(0, ng)), Math.min(255, Math.max(0, nb))));
  }, []);

  const updateFromHsl = useCallback((nh: number, ns: number, nl: number) => {
    const [nr, ng, nb] = hslToRgb(nh, ns, nl);
    setHex(rgbToHex(nr, ng, nb));
  }, []);

  return (
    <ToolLayout tool={tool}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Picker + Preview */}
        <div className="space-y-4">
          {/* Color preview */}
          <div className="rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800">
            <div className="h-40" style={{ backgroundColor: hex }} />
          </div>

          {/* Native picker */}
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={hex}
              onChange={(e) => setHex(e.target.value)}
              className="w-14 h-14 rounded-lg cursor-pointer border border-neutral-300 dark:border-neutral-700"
            />
            <span className="text-sm text-neutral-500 dark:text-neutral-400">
              Click to pick a color visually
            </span>
          </div>
        </div>

        {/* Right: Values */}
        <div className="space-y-4">
          {/* HEX */}
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">HEX</span>
              <CopyButton text={hex} />
            </div>
            <input
              type="text"
              value={hex}
              onChange={(e) => updateFromHex(e.target.value)}
              className="w-full px-3 py-2 font-mono text-lg rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
              maxLength={7}
            />
          </div>

          {/* RGB */}
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">RGB</span>
              <CopyButton text={rgbStr} />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "R", value: r, max: 255 },
                { label: "G", value: g, max: 255 },
                { label: "B", value: b, max: 255 },
              ].map(({ label, value, max }) => (
                <div key={label}>
                  <label className="text-xs text-neutral-500 dark:text-neutral-400">{label}</label>
                  <input
                    type="number"
                    min={0}
                    max={max}
                    value={value}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      updateFromRgb(
                        label === "R" ? v : r,
                        label === "G" ? v : g,
                        label === "B" ? v : b
                      );
                    }}
                    className="w-full px-2 py-1.5 font-mono text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* HSL */}
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">HSL</span>
              <CopyButton text={hslStr} />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "H", value: h, max: 360 },
                { label: "S", value: s, max: 100 },
                { label: "L", value: l, max: 100 },
              ].map(({ label, value, max }) => (
                <div key={label}>
                  <label className="text-xs text-neutral-500 dark:text-neutral-400">
                    {label}{label !== "H" ? "%" : "°"}
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={max}
                    value={value}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      updateFromHsl(
                        label === "H" ? v : h,
                        label === "S" ? v : s,
                        label === "L" ? v : l
                      );
                    }}
                    className="w-full px-2 py-1.5 font-mono text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
