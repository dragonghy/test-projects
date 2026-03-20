import Link from "next/link";
import { posts } from "@/lib/blog-registry";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog — Developer Guides & Tutorials",
  description:
    "Developer guides, tutorials, and cheat sheets. Learn JSON formatting, regex, JWT tokens, SQL, cron expressions, and more.",
};

export default function BlogPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-3xl font-bold mb-2">Blog</h1>
      <p className="text-neutral-500 dark:text-neutral-400 mb-8">
        Developer guides, tutorials, and cheat sheets
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group rounded-xl border border-neutral-200 dark:border-neutral-800 p-5 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-lg hover:shadow-blue-500/5 transition-all"
          >
            <h2 className="font-semibold text-neutral-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-2 line-clamp-2">
              {post.title}
            </h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-3 line-clamp-2">
              {post.excerpt}
            </p>
            <div className="flex items-center gap-3 text-xs text-neutral-400">
              <span>{post.date}</span>
              <span>·</span>
              <span>{post.readingTime} read</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
