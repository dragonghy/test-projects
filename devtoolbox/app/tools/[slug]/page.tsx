import { tools, getToolBySlug } from "@/lib/tools-registry";
import { generateToolMetadata } from "@/lib/seo";
import ToolLayout from "@/components/ToolLayout";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

interface Props {
  params: { slug: string };
}

// Only generate static pages for tools that don't have dedicated route folders
const IMPLEMENTED_SLUGS = new Set([
  "json-formatter", "base64", "uuid-generator", "color-picker",
  "password-generator", "regex-tester", "word-counter",
]);

export async function generateStaticParams() {
  return tools
    .filter((t) => !IMPLEMENTED_SLUGS.has(t.slug))
    .map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const tool = getToolBySlug(params.slug);
  if (!tool) return {};
  return generateToolMetadata(tool);
}

export default function ToolPage({ params }: Props) {
  const tool = getToolBySlug(params.slug);
  if (!tool) notFound();

  return (
    <ToolLayout tool={tool}>
      <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 p-8 sm:p-12 text-center">
        <div className="text-5xl mb-4">{tool.icon}</div>
        <h2 className="text-xl font-semibold mb-2 text-neutral-900 dark:text-white">
          Coming Soon
        </h2>
        <p className="text-neutral-500 dark:text-neutral-400 max-w-md mx-auto">
          {tool.name} is under development and will be available shortly.
          Check back soon!
        </p>
      </div>
    </ToolLayout>
  );
}
