"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { useState, useEffect } from "react";

const sections = [
  { key: "story", href: "#story" },
  { key: "info", href: "#info" },
  { key: "schedule", href: "#schedule" },
  { key: "gallery", href: "#gallery" },
  { key: "guestbook", href: "#guestbook" },
];

export default function Navbar({ locale }: { locale: string }) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const otherLocale = locale === "zh" ? "en" : "zh";
  const isHomePage = pathname === "/";

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-warm/95 backdrop-blur-md shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="font-serif text-lg tracking-wider text-deep">
            H & P
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {isHomePage &&
              sections.map((s) => (
                <a
                  key={s.key}
                  href={s.href}
                  className="text-sm text-secondary hover:text-gold transition-colors"
                >
                  {t(s.key)}
                </a>
              ))}
            <Link
              href="/rsvp"
              className="text-sm text-secondary hover:text-gold transition-colors"
            >
              {t("rsvp")}
            </Link>

            {/* Language Switcher */}
            <Link
              href={pathname}
              locale={otherLocale}
              className="ml-2 px-3 py-1 border border-gold/40 rounded-full text-xs text-gold hover:bg-gold hover:text-white transition-all"
            >
              {otherLocale === "en" ? "EN" : "中文"}
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-deep"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-warm/95 backdrop-blur-md border-t border-gold/10">
          <div className="px-4 py-4 space-y-3">
            {isHomePage &&
              sections.map((s) => (
                <a
                  key={s.key}
                  href={s.href}
                  onClick={() => setMobileOpen(false)}
                  className="block text-sm text-secondary hover:text-gold transition-colors"
                >
                  {t(s.key)}
                </a>
              ))}
            <Link
              href="/rsvp"
              onClick={() => setMobileOpen(false)}
              className="block text-sm text-secondary hover:text-gold transition-colors"
            >
              {t("rsvp")}
            </Link>
            <Link
              href={pathname}
              locale={otherLocale}
              className="inline-block px-3 py-1 border border-gold/40 rounded-full text-xs text-gold"
            >
              {otherLocale === "en" ? "EN" : "中文"}
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
