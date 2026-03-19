import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 text-center">
      <div className="text-6xl mb-4">🔧</div>
      <h1 className="text-3xl font-bold mb-3 text-neutral-900 dark:text-white">
        404 — Tool Not Found
      </h1>
      <p className="text-neutral-500 dark:text-neutral-400 mb-8 max-w-md mx-auto">
        The page you&apos;re looking for doesn&apos;t exist. Maybe the tool you need is on our homepage?
      </p>
      <Link
        href="/"
        className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
      >
        Browse All Tools
      </Link>
    </div>
  );
}
