"use client";

import { useState } from "react";
import { tools, CATEGORIES, getToolsByCategory } from "@/lib/tools-registry";
import ToolCard from "@/components/ToolCard";
import SearchBar from "@/components/SearchBar";
import { generateSiteJsonLd } from "@/lib/seo";
import { getLatestPosts } from "@/lib/blog-registry";
import Link from "next/link";

const jsonLd = generateSiteJsonLd();
const latestPosts = getLatestPosts(4);

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
    <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
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

      {/* Latest Articles */}
      {!filtered && latestPosts.length > 0 && (
        <section className="mt-16 pt-10 border-t border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Latest Articles</h2>
            <Link href="/blog" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {latestPosts.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`}
                className="group rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
                <h3 className="font-medium text-sm text-neutral-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 mb-2">
                  {post.title}
                </h3>
                <div className="text-xs text-neutral-400">
                  {post.readingTime} read
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
    </>
  );
}
