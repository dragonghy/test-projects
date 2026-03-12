"use client";

import { TimerStatus } from "@/hooks/useTimer";

interface ControlsProps {
  status: TimerStatus;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onDismiss: () => void;
}

export default function Controls({ status, onStart, onPause, onReset, onDismiss }: ControlsProps) {
  if (status === "finished") {
    return (
      <div className="flex gap-4">
        <button
          onClick={onDismiss}
          className="rounded-full bg-amber-500 px-8 py-3 text-lg font-semibold text-white shadow-lg transition-all hover:bg-amber-600 hover:shadow-xl active:scale-95"
        >
          Next
        </button>
        <button
          onClick={onReset}
          className="rounded-full border-2 border-gray-300 px-8 py-3 text-lg font-semibold text-gray-600 transition-all hover:border-gray-400 hover:text-gray-700 active:scale-95"
        >
          Reset
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-4">
      {status === "running" ? (
        <button
          onClick={onPause}
          className="rounded-full bg-gray-600 px-8 py-3 text-lg font-semibold text-white shadow-lg transition-all hover:bg-gray-700 hover:shadow-xl active:scale-95"
        >
          Pause
        </button>
      ) : (
        <button
          onClick={onStart}
          className="rounded-full bg-blue-600 px-8 py-3 text-lg font-semibold text-white shadow-lg transition-all hover:bg-blue-700 hover:shadow-xl active:scale-95"
        >
          {status === "paused" ? "Resume" : "Start"}
        </button>
      )}
      <button
        onClick={onReset}
        disabled={status === "idle"}
        className="rounded-full border-2 border-gray-300 px-8 py-3 text-lg font-semibold text-gray-600 transition-all hover:border-gray-400 hover:text-gray-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Reset
      </button>
    </div>
  );
}
