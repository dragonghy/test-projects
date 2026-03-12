"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export type TimerMode = "work" | "break";
export type TimerStatus = "idle" | "running" | "paused" | "finished";

interface TimerConfig {
  workMinutes: number;
  breakMinutes: number;
}

interface TimerState {
  mode: TimerMode;
  status: TimerStatus;
  secondsLeft: number;
  totalSeconds: number;
  completedCount: number;
  config: TimerConfig;
}

interface TimerActions {
  start: () => void;
  pause: () => void;
  reset: () => void;
  switchMode: (mode: TimerMode) => void;
  setWorkMinutes: (minutes: number) => void;
  setBreakMinutes: (minutes: number) => void;
  dismissFinished: () => void;
}

const STORAGE_KEY = "pomodoro-completed-count";
const STORAGE_DATE_KEY = "pomodoro-completed-date";
const STORAGE_WORK_KEY = "pomodoro-work-minutes";
const STORAGE_BREAK_KEY = "pomodoro-break-minutes";

function getTodayString(): string {
  return new Date().toISOString().slice(0, 10);
}

function loadCompletedCount(): number {
  if (typeof window === "undefined") return 0;
  const savedDate = localStorage.getItem(STORAGE_DATE_KEY);
  if (savedDate !== getTodayString()) {
    localStorage.setItem(STORAGE_DATE_KEY, getTodayString());
    localStorage.setItem(STORAGE_KEY, "0");
    return 0;
  }
  return parseInt(localStorage.getItem(STORAGE_KEY) || "0", 10);
}

function loadConfig(): TimerConfig {
  if (typeof window === "undefined") return { workMinutes: 25, breakMinutes: 5 };
  return {
    workMinutes: parseInt(localStorage.getItem(STORAGE_WORK_KEY) || "25", 10),
    breakMinutes: parseInt(localStorage.getItem(STORAGE_BREAK_KEY) || "5", 10),
  };
}

export function useTimer(): TimerState & TimerActions {
  const [config, setConfig] = useState<TimerConfig>({ workMinutes: 25, breakMinutes: 5 });
  const [mode, setMode] = useState<TimerMode>("work");
  const [status, setStatus] = useState<TimerStatus>("idle");
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [completedCount, setCompletedCount] = useState(0);
  const [initialized, setInitialized] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const savedConfig = loadConfig();
    const savedCount = loadCompletedCount();
    setConfig(savedConfig);
    setCompletedCount(savedCount);
    setSecondsLeft(savedConfig.workMinutes * 60);
    setInitialized(true);
  }, []);

  const totalSeconds = mode === "work" ? config.workMinutes * 60 : config.breakMinutes * 60;

  // Tick effect
  useEffect(() => {
    if (status !== "running") {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          intervalRef.current = null;
          setStatus("finished");

          // If work session completed, increment count
          if (mode === "work") {
            setCompletedCount((c) => {
              const newCount = c + 1;
              localStorage.setItem(STORAGE_KEY, String(newCount));
              localStorage.setItem(STORAGE_DATE_KEY, getTodayString());
              return newCount;
            });
          }

          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [status, mode]);

  const start = useCallback(() => {
    if (status === "finished") return;
    setStatus("running");
  }, [status]);

  const pause = useCallback(() => {
    if (status === "running") {
      setStatus("paused");
    }
  }, [status]);

  const reset = useCallback(() => {
    setStatus("idle");
    setSecondsLeft(mode === "work" ? config.workMinutes * 60 : config.breakMinutes * 60);
  }, [mode, config]);

  const switchMode = useCallback(
    (newMode: TimerMode) => {
      setMode(newMode);
      setStatus("idle");
      setSecondsLeft(newMode === "work" ? config.workMinutes * 60 : config.breakMinutes * 60);
    },
    [config]
  );

  const setWorkMinutes = useCallback(
    (minutes: number) => {
      const clamped = Math.min(60, Math.max(15, minutes));
      const newConfig = { ...config, workMinutes: clamped };
      setConfig(newConfig);
      localStorage.setItem(STORAGE_WORK_KEY, String(clamped));
      if (mode === "work" && (status === "idle" || status === "finished")) {
        setSecondsLeft(clamped * 60);
        setStatus("idle");
      }
    },
    [config, mode, status]
  );

  const setBreakMinutes = useCallback(
    (minutes: number) => {
      const clamped = Math.min(15, Math.max(1, minutes));
      const newConfig = { ...config, breakMinutes: clamped };
      setConfig(newConfig);
      localStorage.setItem(STORAGE_BREAK_KEY, String(clamped));
      if (mode === "break" && (status === "idle" || status === "finished")) {
        setSecondsLeft(clamped * 60);
        setStatus("idle");
      }
    },
    [config, mode, status]
  );

  const dismissFinished = useCallback(() => {
    // Switch to break after work (or back to work after break)
    const nextMode = mode === "work" ? "break" : "work";
    switchMode(nextMode);
  }, [mode, switchMode]);

  // Don't render stale defaults before hydration
  if (!initialized) {
    return {
      mode: "work",
      status: "idle",
      secondsLeft: 25 * 60,
      totalSeconds: 25 * 60,
      completedCount: 0,
      config: { workMinutes: 25, breakMinutes: 5 },
      start,
      pause,
      reset,
      switchMode,
      setWorkMinutes,
      setBreakMinutes,
      dismissFinished,
    };
  }

  return {
    mode,
    status,
    secondsLeft,
    totalSeconds,
    completedCount,
    config,
    start,
    pause,
    reset,
    switchMode,
    setWorkMinutes,
    setBreakMinutes,
    dismissFinished,
  };
}
