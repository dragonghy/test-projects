"use client";

import { useState, useMemo } from "react";
import { getToolBySlug } from "@/lib/tools-registry";
import ToolLayout from "@/components/ToolLayout";
import CopyButton from "@/components/CopyButton";

const tool = getToolBySlug("css-gradient")!;

interface ColorStop {
  color: string;
  position: number;
}

const PRESETS = [
  { name: "Sunset", stops: [{ color: "#ff6b6b", position: 0 }, { color: "#feca57", position: 100 }], angle: 135 },
  { name: "Ocean", stops: [{ color: "#667eea", position: 0 }, { color: "#764ba2", position: 100 }], angle: 135 },
  { name: "Forest", stops: [{ color: "#11998e", position: 0 }, { color: "#38ef7d", position: 100 }], angle: 135 },
  { name: "Night", stops: [{ color: "#0f0c29", position: 0 }, { color: "#302b63", position: 50 }, { color: "#24243e", position: 100 }], angle: 135 },
  { name: "Fire", stops: [{ color: "#f12711", position: 0 }, { color: "#f5af19", position: 100 }], angle: 90 },
  { name: "Ice", stops: [{ color: "#e0eafc", position: 0 }, { color: "#cfdef3", position: 100 }], angle: 135 },
];

export default function CssGradientPage() {
  const [type, setType] = useState<"linear" | "radial">("linear");
  const [angle, setAngle] = useState(135);
  const [stops, setStops] = useState<ColorStop[]>([
    { color: "#667eea", position: 0 },
    { color: "#764ba2", position: 100 },
  ]);

  const cssCode = useMemo(() => {
    const stopsStr = stops.map((s) => `${s.color} ${s.position}%`).join(", ");
    if (type === "linear") return `background: linear-gradient(${angle}deg, ${stopsStr});`;
    return `background: radial-gradient(circle, ${stopsStr});`;
  }, [type, angle, stops]);

  const gradientStyle = useMemo(() => {
    const stopsStr = stops.map((s) => `${s.color} ${s.position}%`).join(", ");
    if (type === "linear") return `linear-gradient(${angle}deg, ${stopsStr})`;
    return `radial-gradient(circle, ${stopsStr})`;
  }, [type, angle, stops]);

  const updateStop = (index: number, field: keyof ColorStop, value: string | number) => {
    setStops((prev) => prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)));
  };

  const addStop = () => {
    setStops((prev) => [...prev, { color: "#ffffff", position: 50 }]);
  };

  const removeStop = (index: number) => {
    if (stops.length <= 2) return;
    setStops((prev) => prev.filter((_, i) => i !== index));
  };

  const applyPreset = (preset: typeof PRESETS[0]) => {
    setStops(preset.stops);
    setAngle(preset.angle);
    setType("linear");
  };

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        {/* Preview */}
        <div className="rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800 h-48"
          style={{ background: gradientStyle }} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Controls */}
          <div className="space-y-4">
            {/* Type & Angle */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <button onClick={() => setType("linear")}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${type === "linear" ? "bg-blue-600 text-white" : "border border-neutral-300 dark:border-neutral-700"}`}>
                  Linear
                </button>
                <button onClick={() => setType("radial")}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${type === "radial" ? "bg-blue-600 text-white" : "border border-neutral-300 dark:border-neutral-700"}`}>
                  Radial
                </button>
              </div>
              {type === "linear" && (
                <label className="flex items-center gap-2 text-sm">
                  <span className="text-neutral-600 dark:text-neutral-400">Angle:</span>
                  <input type="number" min={0} max={360} value={angle} onChange={(e) => setAngle(Number(e.target.value))}
                    className="w-20 px-2 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm" />
                  <span className="text-neutral-400">°</span>
                </label>
              )}
            </div>

            {/* Color stops */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Color Stops</span>
                <button onClick={addStop} className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400">+ Add Stop</button>
              </div>
              {stops.map((stop, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input type="color" value={stop.color} onChange={(e) => updateStop(i, "color", e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer border border-neutral-300 dark:border-neutral-700" />
                  <input type="text" value={stop.color} onChange={(e) => updateStop(i, "color", e.target.value)}
                    className="w-24 px-2 py-1.5 font-mono text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900" />
                  <input type="range" min={0} max={100} value={stop.position} onChange={(e) => updateStop(i, "position", Number(e.target.value))}
                    className="flex-1 accent-blue-600" />
                  <span className="text-xs text-neutral-500 w-8">{stop.position}%</span>
                  {stops.length > 2 && (
                    <button onClick={() => removeStop(i)} className="text-neutral-400 hover:text-red-500 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Presets */}
            <div>
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 block">Presets</span>
              <div className="flex flex-wrap gap-2">
                {PRESETS.map((p) => (
                  <button key={p.name} onClick={() => applyPreset(p)}
                    className="w-10 h-10 rounded-lg border border-neutral-300 dark:border-neutral-700 overflow-hidden"
                    title={p.name}
                    style={{ background: `linear-gradient(${p.angle}deg, ${p.stops.map(s => `${s.color} ${s.position}%`).join(", ")})` }} />
                ))}
              </div>
            </div>
          </div>

          {/* CSS Output */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">CSS Code</span>
              <CopyButton text={cssCode} />
            </div>
            <pre className="p-4 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 font-mono text-sm text-neutral-900 dark:text-white overflow-x-auto">
              {cssCode}
            </pre>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
