"use client";

import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AnimateOnScroll from "./AnimateOnScroll";

interface GuestbookEntry {
  id: string;
  name: string;
  message: string;
  createdAt: string;
}

export default function Guestbook() {
  const t = useTranslations("guestbook");
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/guestbook")
      .then((r) => r.json())
      .then((data) => setEntries(data))
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/guestbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), message: message.trim() }),
      });
      if (res.ok) {
        const entry = await res.json();
        setEntries((prev) => [entry, ...prev]);
        setName("");
        setMessage("");
      }
    } catch {
      // silently fail
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="guestbook" className="py-24 px-4">
      <div className="max-w-4xl mx-auto">
        <AnimateOnScroll className="text-center mb-16">
          <h2 className="font-serif text-3xl sm:text-4xl text-deep section-title-underline">
            {t("sectionTitle")}
          </h2>
          <p className="text-secondary mt-6 text-sm tracking-wide">
            {t("sectionSubtitle")}
          </p>
        </AnimateOnScroll>

        {/* Form */}
        <AnimateOnScroll>
          <form
            onSubmit={handleSubmit}
            className="max-w-lg mx-auto mb-16 bg-[#FAF7F0] rounded-2xl p-8 border border-gold/10"
          >
            <div className="mb-5">
              <label className="block text-sm text-deep mb-2 font-medium">
                {t("form.name")}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("form.namePlaceholder")}
                required
                className="w-full px-4 py-3 bg-warm border border-gold/20 rounded-lg text-sm text-deep placeholder:text-secondary/40 focus:outline-none focus:border-gold/50 transition-colors"
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm text-deep mb-2 font-medium">
                {t("form.message")}
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t("form.messagePlaceholder")}
                required
                rows={4}
                className="w-full px-4 py-3 bg-warm border border-gold/20 rounded-lg text-sm text-deep placeholder:text-secondary/40 focus:outline-none focus:border-gold/50 transition-colors resize-none"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-gold text-white rounded-lg text-sm tracking-wider hover:bg-gold-dark transition-colors disabled:opacity-50"
            >
              {submitting ? t("form.submitting") : t("form.submit")}
            </button>
          </form>
        </AnimateOnScroll>

        {/* Entries */}
        <div className="grid sm:grid-cols-2 gap-4">
          <AnimatePresence>
            {entries.length === 0 && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-secondary text-sm col-span-full py-8"
              >
                {t("emptyState")}
              </motion.p>
            )}
            {entries.map((entry, i) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-[#FAF7F0] rounded-xl p-6 border border-gold/10"
              >
                <p className="text-deep text-sm leading-relaxed mb-4 italic">
                  &ldquo;{entry.message}&rdquo;
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-gold text-sm font-medium">
                    {entry.name}
                  </span>
                  <span className="text-secondary/50 text-xs">
                    {new Date(entry.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
