"use client";

import { useState, useMemo } from "react";
import { getToolBySlug } from "@/lib/tools-registry";
import ToolLayout from "@/components/ToolLayout";
import CopyButton from "@/components/CopyButton";

const tool = getToolBySlug("cron-expression")!;

const DAYS_OF_WEEK = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

function describeCron(parts: string[]): string {
  const [minute, hour, dom, month, dow] = parts;
  const segments: string[] = [];

  if (minute === "*" && hour === "*") segments.push("Every minute");
  else if (minute !== "*" && hour === "*") segments.push(`At minute ${minute} of every hour`);
  else if (minute === "0" && hour !== "*") segments.push(`At ${hour}:00`);
  else if (minute !== "*" && hour !== "*") segments.push(`At ${hour}:${minute.padStart(2, "0")}`);
  else segments.push(`At minute ${minute}`);

  if (dom !== "*" && month !== "*") segments.push(`on day ${dom} of month ${month}`);
  else if (dom !== "*") segments.push(`on day ${dom} of the month`);
  else if (month !== "*") segments.push(`in month ${month}`);

  if (dow !== "*") {
    const dayNames = dow.split(",").map((d) => DAYS_OF_WEEK[Number(d)] || d).join(", ");
    segments.push(`on ${dayNames}`);
  }

  return segments.join(" ") || "Every minute";
}

function getNextExecutions(cronStr: string, count: number): Date[] {
  const parts = cronStr.split(" ");
  if (parts.length !== 5) return [];
  const [minPart, hourPart, domPart, monPart, dowPart] = parts;

  const parseField = (field: string, max: number): number[] => {
    if (field === "*") return Array.from({ length: max + 1 }, (_, i) => i);
    if (field.includes(",")) return field.split(",").map(Number);
    if (field.includes("/")) {
      const [, step] = field.split("/").map(Number);
      return Array.from({ length: Math.ceil((max + 1) / step) }, (_, i) => i * step);
    }
    return [Number(field)];
  };

  const minutes = parseField(minPart, 59);
  const hours = parseField(hourPart, 23);
  const doms = domPart === "*" ? null : parseField(domPart, 31);
  const months = monPart === "*" ? null : parseField(monPart, 12);
  const dows = dowPart === "*" ? null : parseField(dowPart, 6);

  const results: Date[] = [];
  const now = new Date();
  const cursor = new Date(now.getTime() + 60000); // start from next minute
  cursor.setSeconds(0, 0);

  for (let i = 0; i < 525600 && results.length < count; i++) { // max 1 year
    const m = cursor.getMinutes();
    const h = cursor.getHours();
    const d = cursor.getDate();
    const mon = cursor.getMonth() + 1;
    const dow = cursor.getDay();

    if (
      minutes.includes(m) &&
      hours.includes(h) &&
      (!doms || doms.includes(d)) &&
      (!months || months.includes(mon)) &&
      (!dows || dows.includes(dow))
    ) {
      results.push(new Date(cursor));
    }
    cursor.setMinutes(cursor.getMinutes() + 1);
  }
  return results;
}

export default function CronExpressionPage() {
  const [minute, setMinute] = useState("0");
  const [hour, setHour] = useState("*");
  const [dom, setDom] = useState("*");
  const [month, setMonth] = useState("*");
  const [dow, setDow] = useState("*");
  const [manualInput, setManualInput] = useState("");

  const parts = useMemo(() => manualInput ? manualInput.trim().split(/\s+/) : [minute, hour, dom, month, dow], [manualInput, minute, hour, dom, month, dow]);
  const cronStr = parts.join(" ");
  const isValid = parts.length === 5;

  const description = useMemo(() => (isValid ? describeCron(parts) : "Invalid expression"), [parts, isValid]);
  const nextRuns = useMemo(() => (isValid ? getNextExecutions(cronStr, 5) : []), [cronStr, isValid]);

  const handleManual = (val: string) => {
    setManualInput(val);
    const p = val.trim().split(/\s+/);
    if (p.length === 5) {
      setMinute(p[0]); setHour(p[1]); setDom(p[2]); setMonth(p[3]); setDow(p[4]);
    }
  };

  const fieldClass = "w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm font-mono text-center";

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        {/* Manual input */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Cron Expression</label>
            <CopyButton text={cronStr} />
          </div>
          <input type="text" value={manualInput || cronStr}
            onChange={(e) => handleManual(e.target.value)}
            placeholder="* * * * *"
            className="w-full px-4 py-3 font-mono text-lg rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white text-center focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        {/* Visual selector */}
        <div className="grid grid-cols-5 gap-3">
          {[
            { label: "Minute", value: minute, set: (v: string) => { setMinute(v); setManualInput(""); }, options: ["*", "0", "15", "30", "45"] },
            { label: "Hour", value: hour, set: (v: string) => { setHour(v); setManualInput(""); }, options: ["*", "0", "3", "6", "9", "12", "15", "18", "21"] },
            { label: "Day (Month)", value: dom, set: (v: string) => { setDom(v); setManualInput(""); }, options: ["*", "1", "15"] },
            { label: "Month", value: month, set: (v: string) => { setMonth(v); setManualInput(""); }, options: ["*", "1", "3", "6", "9", "12"] },
            { label: "Day (Week)", value: dow, set: (v: string) => { setDow(v); setManualInput(""); }, options: ["*", "0", "1", "2", "3", "4", "5", "6"] },
          ].map((field) => (
            <div key={field.label}>
              <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1 text-center">{field.label}</label>
              <select value={field.value} onChange={(e) => field.set(e.target.value)} className={fieldClass}>
                {field.options.map((o) => (
                  <option key={o} value={o}>
                    {o === "*" ? "Any (*)" : field.label === "Day (Week)" ? `${DAYS_OF_WEEK[Number(o)]} (${o})` : o}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>

        {/* Description */}
        <div className="rounded-xl border border-blue-200 dark:border-blue-500/30 bg-blue-50 dark:bg-blue-500/5 p-4">
          <p className="text-sm font-medium text-blue-700 dark:text-blue-300">{description}</p>
        </div>

        {/* Next executions */}
        {nextRuns.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">Next 5 Executions</h3>
            <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 divide-y divide-neutral-200 dark:divide-neutral-800">
              {nextRuns.map((date, i) => (
                <div key={i} className="px-4 py-2.5 text-sm font-mono text-neutral-700 dark:text-neutral-300">
                  {date.toLocaleString("en-US", { weekday: "short", year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
