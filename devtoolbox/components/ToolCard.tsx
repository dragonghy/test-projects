import Link from "next/link";
import type { Tool } from "@/lib/tools-registry";

export default function ToolCard({ tool }: { tool: Tool }) {
  return (
    <Link
      href={`/tools/${tool.slug}`}
      className="group block rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-200"
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-sm font-mono font-bold text-blue-600 dark:text-blue-400">
          {tool.icon}
        </div>
        <div className="min-w-0">
          <h3 className="font-semibold text-neutral-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {tool.name}
          </h3>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400 line-clamp-2">
            {tool.description}
          </p>
          {!tool.ready && (
            <span className="mt-2 inline-block text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded-full">
              Coming Soon
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
