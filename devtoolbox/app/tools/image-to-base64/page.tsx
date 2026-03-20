"use client";

import { useState, useRef } from "react";
import { getToolBySlug } from "@/lib/tools-registry";
import ToolLayout from "@/components/ToolLayout";
import CopyButton from "@/components/CopyButton";

const tool = getToolBySlug("image-to-base64")!;

function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / 1048576).toFixed(1) + " MB";
}

export default function ImageToBase64Page() {
  const [dataUri, setDataUri] = useState("");
  const [preview, setPreview] = useState("");
  const [fileInfo, setFileInfo] = useState<{ name: string; size: number; type: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    setFileInfo({ name: file.name, size: file.size, type: file.type });
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setDataUri(result);
      setPreview(result);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const rawBase64 = dataUri.split(",")[1] || "";

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        {/* Drop zone */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-xl p-12 text-center cursor-pointer hover:border-blue-400 dark:hover:border-blue-600 transition-colors"
        >
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} />
          <div className="text-4xl mb-3">🖼️</div>
          <p className="text-neutral-600 dark:text-neutral-400">Drop an image here or click to upload</p>
          <p className="text-sm text-neutral-400 mt-1">Supports PNG, JPG, GIF, SVG, WebP</p>
        </div>

        {fileInfo && (
          <div className="flex items-center gap-4 text-sm text-neutral-600 dark:text-neutral-400">
            <span><strong>File:</strong> {fileInfo.name}</span>
            <span><strong>Size:</strong> {formatBytes(fileInfo.size)}</span>
            <span><strong>Type:</strong> {fileInfo.type}</span>
            <span><strong>Base64 length:</strong> {rawBase64.length.toLocaleString()} chars</span>
          </div>
        )}

        {preview && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Preview */}
            <div>
              <label className="block text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300">Preview</label>
              <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 bg-[url('data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2220%22 height=%2220%22><rect width=%2210%22 height=%2210%22 fill=%22%23f0f0f0%22/><rect x=%2210%22 y=%2210%22 width=%2210%22 height=%2210%22 fill=%22%23f0f0f0%22/></svg>')] dark:bg-neutral-900">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview} alt="Preview" className="max-w-full max-h-64 mx-auto" />
              </div>
            </div>

            {/* Output */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Data URI</label>
                <CopyButton text={dataUri} label="Copy Data URI" />
              </div>
              <textarea value={dataUri} readOnly
                className="w-full h-40 p-4 font-mono text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900/50 text-neutral-900 dark:text-white resize-none" />

              <div className="flex items-center justify-between mt-3 mb-2">
                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Raw Base64</label>
                <CopyButton text={rawBase64} label="Copy Base64" />
              </div>
              <textarea value={rawBase64} readOnly
                className="w-full h-40 p-4 font-mono text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900/50 text-neutral-900 dark:text-white resize-none" />
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
