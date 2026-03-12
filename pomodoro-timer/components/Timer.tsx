"use client";

import { TimerMode, TimerStatus } from "@/hooks/useTimer";

interface TimerProps {
  secondsLeft: number;
  totalSeconds: number;
  mode: TimerMode;
  status: TimerStatus;
}

export default function Timer({ secondsLeft, totalSeconds, mode, status }: TimerProps) {
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timeDisplay = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  const progress = totalSeconds > 0 ? secondsLeft / totalSeconds : 0;

  // SVG circle props
  const size = 280;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress);

  const isFinished = status === "finished";

  // Color scheme based on mode
  const ringColor = mode === "work" ? "stroke-red-500" : "stroke-emerald-500";
  const trackColor = mode === "work" ? "stroke-red-100" : "stroke-emerald-100";
  const textColor = mode === "work" ? "text-red-600" : "text-emerald-600";

  return (
    <div className={`relative flex items-center justify-center ${isFinished ? "animate-pulse" : ""}`}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className={trackColor}
        />
        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          className={`${ringColor} transition-all duration-1000 ease-linear`}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span
          className={`text-6xl font-bold tabular-nums tracking-tight ${
            isFinished ? "text-amber-500" : textColor
          }`}
        >
          {timeDisplay}
        </span>
        <span className={`mt-2 text-sm font-medium uppercase tracking-widest ${
          isFinished ? "text-amber-500" : "text-gray-400"
        }`}>
          {isFinished ? "Time's up!" : mode === "work" ? "Focus" : "Break"}
        </span>
      </div>
    </div>
  );
}
