"use client";

import { useState, useEffect } from "react";
import { getToolBySlug } from "@/lib/tools-registry";
import ToolLayout from "@/components/ToolLayout";
import CopyButton from "@/components/CopyButton";

const tool = getToolBySlug("timestamp-converter")!;

export default function TimestampConverterPage() {
  const [now, setNow] = useState(Math.floor(Date.now() / 1000));
  const [tsInput, setTsInput] = useState("");
  const [dateInput, setDateInput] = useState("");
  const [unit, setUnit] = useState<"seconds" | "milliseconds">("seconds");
  const [timezone, setTimezone] = useState<"local" | "utc">("local");
  const [tsResult, setTsResult] = useState("");
  const [dateResult, setDateResult] = useState("");
  const [tsError, setTsError] = useState("");
  const [dateError, setDateError] = useState("");

  // Live clock
  useEffect(() => {
    const interval = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatDate = (date: Date, tz: string) => {
    if (tz === "utc") return date.toUTCString();
    return date.toLocaleString("en-US", {
      year: "numeric", month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit", second: "2-digit",
      timeZoneName: "short",
    });
  };

  const convertTimestamp = (val: string) => {
    setTsInput(val);
    if (!val.trim()) { setTsResult(""); setTsError(""); return; }
    const num = Number(val);
    if (isNaN(num)) { setTsError("Invalid number"); setTsResult(""); return; }
    const ms = unit === "seconds" ? num * 1000 : num;
    const date = new Date(ms);
    if (isNaN(date.getTime())) { setTsError("Invalid timestamp"); setTsResult(""); return; }
    setTsResult(formatDate(date, timezone));
    setTsError("");
  };

  const convertDate = (val: string) => {
    setDateInput(val);
    if (!val.trim()) { setDateResult(""); setDateError(""); return; }
    const date = new Date(val);
    if (isNaN(date.getTime())) { setDateError("Invalid date"); setDateResult(""); return; }
    const ts = unit === "seconds" ? Math.floor(date.getTime() / 1000) : date.getTime();
    setDateResult(String(ts));
    setDateError("");
  };

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        {/* Current timestamp */}
        <div className="rounded-xl border border-blue-200 dark:border-blue-500/30 bg-blue-50 dark:bg-blue-500/5 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-1">Current Unix Timestamp</p>
              <p className="text-3xl font-bold font-mono text-blue-700 dark:text-blue-300">{now}</p>
              <p className="text-sm text-blue-500 dark:text-blue-400 mt-1">{formatDate(new Date(now * 1000), timezone)}</p>
            </div>
            <CopyButton text={String(now)} />
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-sm">
            <span className="text-neutral-600 dark:text-neutral-400">Unit:</span>
            <select value={unit} onChange={(e) => { setUnit(e.target.value as "seconds" | "milliseconds"); }}
              className="px-2 py-1 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm">
              <option value="seconds">Seconds</option>
              <option value="milliseconds">Milliseconds</option>
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <span className="text-neutral-600 dark:text-neutral-400">Timezone:</span>
            <select value={timezone} onChange={(e) => { setTimezone(e.target.value as "local" | "utc"); }}
              className="px-2 py-1 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm">
              <option value="local">Local</option>
              <option value="utc">UTC</option>
            </select>
          </label>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Timestamp → Date */}
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-5 space-y-3">
            <h3 className="font-semibold text-neutral-900 dark:text-white">Timestamp → Date</h3>
            <input type="text" value={tsInput} onChange={(e) => convertTimestamp(e.target.value)}
              placeholder={unit === "seconds" ? "1700000000" : "1700000000000"}
              className="w-full px-4 py-3 font-mono text-sm rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            {tsResult && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-50 dark:bg-neutral-900">
                <span className="text-sm text-neutral-700 dark:text-neutral-300">{tsResult}</span>
                <CopyButton text={tsResult} />
              </div>
            )}
            {tsError && <p className="text-sm text-red-600 dark:text-red-400">{tsError}</p>}
          </div>

          {/* Date → Timestamp */}
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-5 space-y-3">
            <h3 className="font-semibold text-neutral-900 dark:text-white">Date → Timestamp</h3>
            <input type="datetime-local" value={dateInput} onChange={(e) => convertDate(e.target.value)}
              className="w-full px-4 py-3 text-sm rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
            {dateResult && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-50 dark:bg-neutral-900">
                <span className="text-sm font-mono text-neutral-700 dark:text-neutral-300">{dateResult}</span>
                <CopyButton text={dateResult} />
              </div>
            )}
            {dateError && <p className="text-sm text-red-600 dark:text-red-400">{dateError}</p>}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
