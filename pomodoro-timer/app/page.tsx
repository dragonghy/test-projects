"use client";

import { useTimer } from "@/hooks/useTimer";
import Timer from "@/components/Timer";
import Controls from "@/components/Controls";
import ModeSelector from "@/components/ModeSelector";
import Stats from "@/components/Stats";
import Settings from "@/components/Settings";

export default function Home() {
  const timer = useTimer();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-white px-4 font-[family-name:var(--font-geist-sans)]">
      <main className="flex w-full max-w-md flex-col items-center gap-8 py-12">
        {/* Header */}
        <div className="flex w-full items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-gray-800">
            Pomodoro
          </h1>
          <Settings
            workMinutes={timer.config.workMinutes}
            breakMinutes={timer.config.breakMinutes}
            onWorkChange={timer.setWorkMinutes}
            onBreakChange={timer.setBreakMinutes}
          />
        </div>

        {/* Mode Selector */}
        <ModeSelector mode={timer.mode} onSwitch={timer.switchMode} />

        {/* Timer Ring */}
        <Timer
          secondsLeft={timer.secondsLeft}
          totalSeconds={timer.totalSeconds}
          mode={timer.mode}
          status={timer.status}
        />

        {/* Controls */}
        <Controls
          status={timer.status}
          onStart={timer.start}
          onPause={timer.pause}
          onReset={timer.reset}
          onDismiss={timer.dismissFinished}
        />

        {/* Stats */}
        <Stats completedCount={timer.completedCount} />
      </main>

      {/* Footer */}
      <footer className="pb-6 text-center text-xs text-gray-300">
        Built with Next.js + Tailwind CSS
      </footer>
    </div>
  );
}
