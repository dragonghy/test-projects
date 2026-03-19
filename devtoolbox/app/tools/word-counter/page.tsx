"use client";

import { useState, useMemo } from "react";
import { getToolBySlug } from "@/lib/tools-registry";
import ToolLayout from "@/components/ToolLayout";

const tool = getToolBySlug("word-counter")!;

interface Stats {
  words: number;
  characters: number;
  charactersNoSpaces: number;
  sentences: number;
  paragraphs: number;
  lines: number;
  readingTime: string;
  speakingTime: string;
}

function computeStats(text: string): Stats {
  if (!text.trim()) {
    return { words: 0, characters: 0, charactersNoSpaces: 0, sentences: 0, paragraphs: 0, lines: 0, readingTime: "0 sec", speakingTime: "0 sec" };
  }

  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s/g, "").length;
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim()).length;
  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim()).length;
  const lines = text.split("\n").length;

  const readMins = words / 238; // average reading speed
  const speakMins = words / 150; // average speaking speed

  const formatTime = (mins: number) => {
    if (mins < 1) return `${Math.ceil(mins * 60)} sec`;
    if (mins < 60) return `${Math.round(mins)} min`;
    return `${Math.floor(mins / 60)}h ${Math.round(mins % 60)}m`;
  };

  return {
    words,
    characters,
    charactersNoSpaces,
    sentences,
    paragraphs,
    lines,
    readingTime: formatTime(readMins),
    speakingTime: formatTime(speakMins),
  };
}

export default function WordCounterPage() {
  const [text, setText] = useState("");
  const stats = useMemo(() => computeStats(text), [text]);

  const statCards = [
    { label: "Words", value: stats.words, accent: true },
    { label: "Characters", value: stats.characters, accent: true },
    { label: "Characters (no spaces)", value: stats.charactersNoSpaces, accent: false },
    { label: "Sentences", value: stats.sentences, accent: false },
    { label: "Paragraphs", value: stats.paragraphs, accent: false },
    { label: "Lines", value: stats.lines, accent: false },
  ];

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        {/* Stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {statCards.map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-3 text-center"
            >
              <div
                className={`text-2xl font-bold ${
                  s.accent ? "text-blue-600 dark:text-blue-400" : "text-neutral-900 dark:text-white"
                }`}
              >
                {s.value.toLocaleString()}
              </div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Reading/speaking time */}
        <div className="flex gap-6 text-sm text-neutral-600 dark:text-neutral-400">
          <span>
            📖 Reading time: <strong className="text-neutral-900 dark:text-white">{stats.readingTime}</strong>
          </span>
          <span>
            🎤 Speaking time: <strong className="text-neutral-900 dark:text-white">{stats.speakingTime}</strong>
          </span>
        </div>

        {/* Text input */}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Start typing or paste your text here..."
          className="w-full h-72 p-4 text-base rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          autoFocus
        />
      </div>
    </ToolLayout>
  );
}
