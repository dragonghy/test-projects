"use client";

import { useState, useMemo } from "react";
import { getToolBySlug } from "@/lib/tools-registry";
import ToolLayout from "@/components/ToolLayout";
import CopyButton from "@/components/CopyButton";

const tool = getToolBySlug("jwt-decoder")!;

interface DecodedJwt {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  signature: string;
}

function decodeJwt(token: string): DecodedJwt {
  const parts = token.trim().split(".");
  if (parts.length !== 3) throw new Error("Invalid JWT: must have 3 parts (header.payload.signature)");

  const base64Decode = (str: string) => {
    const padded = str.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(padded));
  };

  return {
    header: base64Decode(parts[0]),
    payload: base64Decode(parts[1]),
    signature: parts[2],
  };
}

const TIMESTAMP_FIELDS = ["iat", "exp", "nbf", "auth_time"];

function formatTimestamp(ts: number): string {
  return new Date(ts * 1000).toLocaleString("en-US", {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit", timeZoneName: "short",
  });
}

const SAMPLE_JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE5MTYyMzkwMjJ9.4S2S5F0yAHKPOwQ3GDRqHl9JnZ_yXZh_Nv0-GwBGx_g";

export default function JwtDecoderPage() {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");

  const decoded = useMemo<DecodedJwt | null>(() => {
    if (!input.trim()) { setError(""); return null; }
    try {
      const result = decodeJwt(input);
      setError("");
      return result;
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Invalid JWT");
      return null;
    }
  }, [input]);

  const isExpired = decoded?.payload.exp
    ? (decoded.payload.exp as number) * 1000 < Date.now()
    : null;

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">JWT Token</label>
            <button onClick={() => setInput(SAMPLE_JWT)}
              className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400">Load Sample</button>
          </div>
          <textarea value={input} onChange={(e) => setInput(e.target.value)}
            placeholder="Paste your JWT token here (eyJhbGci...)..."
            className="w-full h-28 p-4 font-mono text-sm rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" spellCheck={false} />
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-400 text-sm">{error}</div>
        )}

        {decoded && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Header */}
            <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-red-600 dark:text-red-400">HEADER</h3>
                <CopyButton text={JSON.stringify(decoded.header, null, 2)} />
              </div>
              <pre className="text-sm font-mono text-neutral-700 dark:text-neutral-300 bg-neutral-50 dark:bg-neutral-900 p-3 rounded-lg overflow-x-auto">
                {JSON.stringify(decoded.header, null, 2)}
              </pre>
            </div>

            {/* Payload */}
            <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-purple-600 dark:text-purple-400">PAYLOAD</h3>
                  {isExpired !== null && (
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      isExpired
                        ? "bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400"
                        : "bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400"
                    }`}>
                      {isExpired ? "Expired" : "Valid"}
                    </span>
                  )}
                </div>
                <CopyButton text={JSON.stringify(decoded.payload, null, 2)} />
              </div>
              <div className="space-y-1.5">
                {Object.entries(decoded.payload).map(([key, value]) => (
                  <div key={key} className="flex items-start gap-2 text-sm font-mono">
                    <span className="text-blue-600 dark:text-blue-400 flex-shrink-0">{key}:</span>
                    <span className="text-neutral-700 dark:text-neutral-300 break-all">
                      {JSON.stringify(value)}
                      {TIMESTAMP_FIELDS.includes(key) && typeof value === "number" && (
                        <span className="text-neutral-400 ml-2 font-sans text-xs">
                          ({formatTimestamp(value)})
                        </span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Signature */}
            <div className="lg:col-span-2 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
              <h3 className="text-sm font-semibold text-cyan-600 dark:text-cyan-400 mb-2">SIGNATURE</h3>
              <code className="text-sm font-mono text-neutral-500 dark:text-neutral-400 break-all">{decoded.signature}</code>
              <p className="mt-2 text-xs text-neutral-400">
                Signature verification is not performed client-side (no secret key available).
              </p>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
