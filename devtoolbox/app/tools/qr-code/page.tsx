"use client";

import { useState, useEffect, useRef } from "react";
import QRCode from "qrcode";
import { getToolBySlug } from "@/lib/tools-registry";
import ToolLayout from "@/components/ToolLayout";

const tool = getToolBySlug("qr-code")!;

export default function QrCodePage() {
  const [text, setText] = useState("https://devtoolbox-gules.vercel.app");
  const [size, setSize] = useState(256);
  const [errorLevel, setErrorLevel] = useState<"L" | "M" | "Q" | "H">("M");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [svgData, setSvgData] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!text.trim()) {
      setError("");
      setSvgData("");
      return;
    }
    const opts = { width: size, errorCorrectionLevel: errorLevel, margin: 2 };
    // Canvas
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, text, opts).catch((e: Error) => setError(e.message));
    }
    // SVG
    QRCode.toString(text, { ...opts, type: "svg" })
      .then((svg) => { setSvgData(svg); setError(""); })
      .catch((e: Error) => setError(e.message));
  }, [text, size, errorLevel]);

  const downloadPng = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = "qrcode.png";
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  const downloadSvg = () => {
    if (!svgData) return;
    const blob = new Blob([svgData], { type: "image/svg+xml" });
    const link = document.createElement("a");
    link.download = "qrcode.svg";
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <ToolLayout tool={tool}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Controls */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300">Text or URL</label>
            <textarea value={text} onChange={(e) => setText(e.target.value)}
              placeholder="Enter text or URL..."
              className="w-full h-32 p-4 text-sm rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300">Size</label>
              <select value={size} onChange={(e) => setSize(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm">
                <option value={128}>128x128</option>
                <option value={256}>256x256</option>
                <option value={512}>512x512</option>
                <option value={1024}>1024x1024</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300">Error Correction</label>
              <select value={errorLevel} onChange={(e) => setErrorLevel(e.target.value as "L" | "M" | "Q" | "H")}
                className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm">
                <option value="L">Low (7%)</option>
                <option value="M">Medium (15%)</option>
                <option value="Q">Quartile (25%)</option>
                <option value="H">High (30%)</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={downloadPng}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors">
              Download PNG
            </button>
            <button onClick={downloadSvg}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
              Download SVG
            </button>
          </div>
        </div>

        {/* Preview */}
        <div className="flex flex-col items-center justify-center">
          <div className="p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 inline-block">
            <canvas ref={canvasRef} className="block mx-auto" style={{ maxWidth: "100%", height: "auto" }} />
          </div>
          {error && (
            <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
        </div>
      </div>
    </ToolLayout>
  );
}
