"use client";

import { TimerMode } from "@/hooks/useTimer";

interface ModeSelectorProps {
  mode: TimerMode;
  onSwitch: (mode: TimerMode) => void;
}

export default function ModeSelector({ mode, onSwitch }: ModeSelectorProps) {
  return (
    <div className="flex rounded-full bg-gray-100 p-1">
      <button
        onClick={() => onSwitch("work")}
        className={`rounded-full px-6 py-2 text-sm font-semibold transition-all ${
          mode === "work"
            ? "bg-red-500 text-white shadow-md"
            : "text-gray-500 hover:text-gray-700"
        }`}
      >
        Work
      </button>
      <button
        onClick={() => onSwitch("break")}
        className={`rounded-full px-6 py-2 text-sm font-semibold transition-all ${
          mode === "break"
            ? "bg-emerald-500 text-white shadow-md"
            : "text-gray-500 hover:text-gray-700"
        }`}
      >
        Break
      </button>
    </div>
  );
}
