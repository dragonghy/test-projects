"use client";

interface StatsProps {
  completedCount: number;
}

export default function Stats({ completedCount }: StatsProps) {
  return (
    <div className="flex items-center gap-2 rounded-full bg-gray-50 px-5 py-2">
      <span className="text-2xl" role="img" aria-label="tomato">
        🍅
      </span>
      <span className="text-lg font-bold text-gray-700">{completedCount}</span>
      <span className="text-sm text-gray-400">today</span>
    </div>
  );
}
