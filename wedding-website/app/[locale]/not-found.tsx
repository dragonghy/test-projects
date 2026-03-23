import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="font-serif text-6xl text-gold mb-4">404</h1>
        <p className="text-secondary mb-8">Page not found</p>
        <Link
          href="/"
          className="inline-block px-8 py-3 border border-gold text-gold rounded-full text-sm tracking-wider hover:bg-gold hover:text-white transition-all duration-300"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
