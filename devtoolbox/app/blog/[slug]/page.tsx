import { posts, getPostBySlug } from "@/lib/blog-registry";
import { articleContent } from "@/lib/blog/content";
import { marked } from "marked";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = getPostBySlug(params.slug);
  if (!post) return {};
  return {
    title: post.metaTitle,
    description: post.metaDescription,
    keywords: post.keywords.join(", "),
    openGraph: {
      title: post.metaTitle,
      description: post.metaDescription,
      type: "article",
      publishedTime: post.date,
    },
  };
}

function generateJsonLd(post: NonNullable<ReturnType<typeof getPostBySlug>>) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.metaDescription,
    datePublished: post.date,
    url: `https://devtoolbox-gules.vercel.app/blog/${post.slug}`,
    author: { "@type": "Organization", name: "DevToolBox" },
    publisher: { "@type": "Organization", name: "DevToolBox" },
  };
}

// Extract headings for TOC
function extractToc(markdown: string): { id: string; text: string; level: number }[] {
  const headings: { id: string; text: string; level: number }[] = [];
  const lines = markdown.split("\n");
  for (const line of lines) {
    const match = line.match(/^(#{2,3})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const text = match[2];
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      headings.push({ id, text, level });
    }
  }
  return headings;
}

export default function BlogPostPage({ params }: Props) {
  const post = getPostBySlug(params.slug);
  if (!post) notFound();

  const content = articleContent[post.slug] || "";
  const toc = extractToc(content);

  // Configure marked with heading IDs
  const renderer = new marked.Renderer();
  renderer.heading = function ({ text, depth }: { tokens: unknown[]; text: string; depth: number }) {
    const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    return `<h${depth} id="${id}" class="scroll-mt-20">${text}</h${depth}>`;
  };
  const html = marked(content, { renderer, gfm: true }) as string;
  const jsonLd = generateJsonLd(post);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        {/* Breadcrumb */}
        <nav className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">
          <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/blog" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Blog</Link>
          <span className="mx-2">/</span>
          <span className="text-neutral-900 dark:text-white">{post.title}</span>
        </nav>

        {/* Header */}
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white mb-3">
          {post.title}
        </h1>
        <div className="flex items-center gap-3 text-sm text-neutral-500 dark:text-neutral-400 mb-8">
          <span>{post.date}</span>
          <span>·</span>
          <span>{post.readingTime} read</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_200px] gap-8">
          {/* Article */}
          <article
            className="prose dark:prose-invert prose-sm max-w-none prose-headings:font-semibold prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-code:before:content-none prose-code:after:content-none prose-code:bg-neutral-100 dark:prose-code:bg-neutral-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-pre:bg-neutral-900 dark:prose-pre:bg-neutral-950 prose-pre:border prose-pre:border-neutral-800"
            dangerouslySetInnerHTML={{ __html: html }}
          />

          {/* TOC sidebar */}
          {toc.length > 0 && (
            <aside className="hidden lg:block">
              <div className="sticky top-20">
                <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3">On this page</h3>
                <nav className="space-y-1.5">
                  {toc.map((h) => (
                    <a key={h.id} href={`#${h.id}`}
                      className={`block text-xs text-neutral-500 dark:text-neutral-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors ${h.level === 3 ? "pl-3" : ""}`}>
                      {h.text}
                    </a>
                  ))}
                </nav>
              </div>
            </aside>
          )}
        </div>

        {/* CTA */}
        <div className="mt-12 p-6 rounded-xl border border-blue-200 dark:border-blue-500/30 bg-blue-50 dark:bg-blue-500/5 text-center">
          <p className="text-neutral-700 dark:text-neutral-300 mb-3">
            Ready to try it yourself?
          </p>
          <Link href={`/tools/${post.toolSlug}`}
            className="inline-block px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
            Open {posts.find(p => p.slug === params.slug)?.title.split(":")[0] || "Tool"} →
          </Link>
        </div>
      </div>
    </>
  );
}
