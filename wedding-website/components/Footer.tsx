"use client";

import { useTranslations } from "next-intl";

export default function Footer() {
  const t = useTranslations("footer");

  return (
    <footer className="bg-deep text-warm/80 py-12">
      <div className="max-w-4xl mx-auto text-center px-4">
        <p className="font-serif text-2xl text-gold mb-4">H & P</p>
        <p className="text-sm mb-6">{t("message")}</p>
        <div className="w-16 h-px bg-gold/30 mx-auto mb-6" />
        <p className="text-xs text-warm/50">{t("copyright")}</p>
      </div>
    </footer>
  );
}
