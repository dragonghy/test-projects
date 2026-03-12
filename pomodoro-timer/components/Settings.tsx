"use client";

import { useState } from "react";

interface SettingsProps {
  workMinutes: number;
  breakMinutes: number;
  onWorkChange: (minutes: number) => void;
  onBreakChange: (minutes: number) => void;
}

export default function Settings({
  workMinutes,
  breakMinutes,
  onWorkChange,
  onBreakChange,
}: SettingsProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-700"
        aria-label="Settings"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
        Settings
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-64 rounded-2xl bg-white p-5 shadow-xl ring-1 ring-gray-100 z-10">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400">
            Timer Duration
          </h3>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-600">
                Work: {workMinutes} min
              </label>
              <input
                type="range"
                min={15}
                max={60}
                value={workMinutes}
                onChange={(e) => onWorkChange(parseInt(e.target.value, 10))}
                className="h-2 w-full cursor-pointer appearance-none rounded-full bg-red-100 accent-red-500"
              />
              <div className="mt-1 flex justify-between text-xs text-gray-400">
                <span>15</span>
                <span>60</span>
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-600">
                Break: {breakMinutes} min
              </label>
              <input
                type="range"
                min={1}
                max={15}
                value={breakMinutes}
                onChange={(e) => onBreakChange(parseInt(e.target.value, 10))}
                className="h-2 w-full cursor-pointer appearance-none rounded-full bg-emerald-100 accent-emerald-500"
              />
              <div className="mt-1 flex justify-between text-xs text-gray-400">
                <span>1</span>
                <span>15</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
