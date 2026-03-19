"use client";

import { useState } from "react";
import { tools, CATEGORIES, getToolsByCategory } from "@/lib/tools-registry";
import ToolCard from "@/components/ToolCard";
import SearchBar from "@/components/SearchBar";

export default function Home() {
  const [query, setQuery] = useState("");

  const filtered = query
    ? tools.filter(
        (t) =>
          t.name.toLowerCase().includes(query.toLowerCase()) ||
          t.description.toLowerCase().includes(query.toLowerCase()) ||
          t.keywords.some((k) => k.toLowerCase().includes(query.toLowerCase()))
      )
    : null;

  const grouped = getToolsByCategory();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      {/* Hero */}
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold mb-3">
          Free Online{" "}
          <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
            Developer Tools
          </span>
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 max-w-xl mx-auto mb-8">
          Fast, modern, privacy-friendly tools that run entirely in your browser. No signup, no data
          collection.
        </p>
        <SearchBar onSearch={setQuery} />
      </div>

      {/* Search results */}
      {filtered !== null ? (
        <div>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
            {filtered.length} tool{filtered.length !== 1 ? "s" : ""} found
          </p>
          {filtered.length === 0 ? (
            <p className="text-center text-neutral-500 dark:text-neutral-400 py-12">
              No tools match your search. Try a different keyword.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((tool) => (
                <ToolCard key={tool.slug} tool={tool} />
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Categorized view */
        <div className="space-y-10">
          {(Object.keys(CATEGORIES) as Array<keyof typeof CATEGORIES>).map((cat) => (
            <section key={cat}>
              <h2 className="flex items-center gap-2 text-xl font-semibold mb-4">
                <span>{CATEGORIES[cat].icon}</span>
                {CATEGORIES[cat].label}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {(grouped[cat] ?? []).map((tool) => (
                  <ToolCard key={tool.slug} tool={tool} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
