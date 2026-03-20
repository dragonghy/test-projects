"use client";

import { useState, useRef, useEffect } from "react";
import { getToolBySlug } from "@/lib/tools-registry";
import ToolLayout from "@/components/ToolLayout";

const tool = getToolBySlug("placeholder-image")!;

export default function PlaceholderImagePage() {
  const [width, setWidth] = useState(300);
  const [height, setHeight] = useState(200);
  const [bgColor, setBgColor] = useState("#e2e8f0");
  const [textColor, setTextColor] = useState("#64748b");
  const [text, setText] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const displayText = text || `${width}×${height}`;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);

    // Text
    const fontSize = Math.max(12, Math.min(width / 8, height / 4, 48));
    ctx.fillStyle = textColor;
    ctx.font = `${fontSize}px system-ui, -apple-system, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(displayText, width / 2, height / 2);
  }, [width, height, bgColor, textColor, displayText]);

  const download = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = `placeholder-${width}x${height}.png`;
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  const PRESETS = [
    { w: 150, h: 150, label: "150×150" },
    { w: 300, h: 200, label: "300×200" },
    { w: 600, h: 400, label: "600×400" },
    { w: 1200, h: 630, label: "OG Image" },
    { w: 1920, h: 1080, label: "1080p" },
    { w: 800, h: 600, label: "800×600" },
  ];

  return (
    <ToolLayout tool={tool}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Controls */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1 text-neutral-700 dark:text-neutral-300">Width (px)</label>
              <input type="number" min={1} max={4096} value={width} onChange={(e) => setWidth(Math.max(1, Number(e.target.value)))}
                className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-neutral-700 dark:text-neutral-300">Height (px)</label>
              <input type="number" min={1} max={4096} value={height} onChange={(e) => setHeight(Math.max(1, Number(e.target.value)))}
                className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1 text-neutral-700 dark:text-neutral-300">Background</label>
              <div className="flex items-center gap-2">
                <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-10 h-10 rounded-lg cursor-pointer border border-neutral-300 dark:border-neutral-700" />
                <input type="text" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="flex-1 px-2 py-1.5 font-mono text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-neutral-700 dark:text-neutral-300">Text Color</label>
              <div className="flex items-center gap-2">
                <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="w-10 h-10 rounded-lg cursor-pointer border border-neutral-300 dark:border-neutral-700" />
                <input type="text" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="flex-1 px-2 py-1.5 font-mono text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-neutral-700 dark:text-neutral-300">Custom Text (optional)</label>
            <input type="text" value={text} onChange={(e) => setText(e.target.value)} placeholder={`Default: ${width}×${height}`}
              className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm placeholder:text-neutral-400" />
          </div>

          {/* Presets */}
          <div>
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 block">Quick Sizes</span>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <button key={p.label} onClick={() => { setWidth(p.w); setHeight(p.h); }}
                  className="px-3 py-1 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <button onClick={download}
            className="w-full px-4 py-2.5 text-sm font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors">
            Download PNG
          </button>
        </div>

        {/* Preview */}
        <div className="flex items-center justify-center">
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 overflow-auto max-w-full">
            <canvas ref={canvasRef} className="block mx-auto" style={{ maxWidth: "100%", height: "auto" }} />
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
