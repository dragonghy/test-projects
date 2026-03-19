export default function Footer() {
  return (
    <footer className="border-t border-neutral-200 dark:border-neutral-800 py-8 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center text-sm text-neutral-500 dark:text-neutral-400 space-y-2">
        <div className="flex items-center justify-center gap-4">
          <a href="#" className="hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors">
            About
          </a>
          <span>·</span>
          <a href="#" className="hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors">
            Privacy
          </a>
          <span>·</span>
          <a href="#" className="hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors">
            Contact
          </a>
        </div>
        <p>&copy; {new Date().getFullYear()} DevToolBox. Free developer tools, forever.</p>
      </div>
    </footer>
  );
}
