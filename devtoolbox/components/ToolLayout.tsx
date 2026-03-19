import Link from "next/link";
import type { Tool } from "@/lib/tools-registry";
import { getRelatedTools } from "@/lib/tools-registry";
import { generateToolJsonLd } from "@/lib/seo";
import type { ReactNode } from "react";

interface ToolLayoutProps {
  tool: Tool;
  children: ReactNode;
}

export default function ToolLayout({ tool, children }: ToolLayoutProps) {
  const related = getRelatedTools(tool.slug, 3);
  const jsonLd = generateToolJsonLd(tool);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">
          <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            Home
          </Link>
          <span className="mx-2">/</span>
          <span className="text-neutral-900 dark:text-white">{tool.name}</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl" aria-hidden>
              {tool.icon}
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white">
              {tool.name}
            </h1>
          </div>
          <p className="text-neutral-600 dark:text-neutral-400 max-w-2xl">
            {tool.longDescription}
          </p>
        </div>

        {/* Tool Area */}
        <div className="mb-12">{children}</div>

        {/* Related Tools */}
        {related.length > 0 && (
          <section className="border-t border-neutral-200 dark:border-neutral-800 pt-8">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
              Related Tools
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {related.map((t) => (
                <Link
                  key={t.slug}
                  href={`/tools/${t.slug}`}
                  className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{t.icon}</span>
                    <span className="font-medium text-neutral-900 dark:text-white">
                      {t.name}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    {t.description}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
