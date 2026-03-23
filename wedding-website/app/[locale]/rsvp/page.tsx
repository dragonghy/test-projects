"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { motion } from "framer-motion";

export default function RSVPPage() {
  const t = useTranslations("rsvp");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    attendance: true,
    guestCount: 1,
    dietary: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setSubmitted(true);
      }
    } catch {
      // silently fail
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 pt-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h2 className="font-serif text-3xl text-deep mb-4">{t("success.title")}</h2>
          <p className="text-secondary mb-8">{t("success.message")}</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-8 py-3 border border-gold text-gold rounded-full text-sm tracking-wider hover:bg-gold hover:text-white transition-all duration-300"
          >
            {t("success.back")}
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-lg mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="font-serif text-3xl sm:text-4xl text-deep section-title-underline">
            {t("pageTitle")}
          </h1>
          <p className="text-secondary mt-6 text-sm tracking-wide">
            {t("pageSubtitle")}
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onSubmit={handleSubmit}
          className="bg-[#FAF7F0] rounded-2xl p-8 border border-gold/10 shadow-sm"
        >
          {/* Name */}
          <div className="mb-6">
            <label className="block text-sm text-deep mb-2 font-medium">
              {t("form.name")}
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder={t("form.namePlaceholder")}
              required
              className="w-full px-4 py-3 bg-warm border border-gold/20 rounded-lg text-sm text-deep placeholder:text-secondary/40 focus:outline-none focus:border-gold/50 transition-colors"
            />
          </div>

          {/* Attendance */}
          <div className="mb-6">
            <label className="block text-sm text-deep mb-3 font-medium">
              {t("form.attendance")}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setForm({ ...form, attendance: true })}
                className={`py-3 rounded-lg text-sm border transition-all duration-200 ${
                  form.attendance
                    ? "bg-gold text-white border-gold"
                    : "bg-warm text-secondary border-gold/20 hover:border-gold/40"
                }`}
              >
                {t("form.attendanceYes")}
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, attendance: false })}
                className={`py-3 rounded-lg text-sm border transition-all duration-200 ${
                  !form.attendance
                    ? "bg-gold text-white border-gold"
                    : "bg-warm text-secondary border-gold/20 hover:border-gold/40"
                }`}
              >
                {t("form.attendanceNo")}
              </button>
            </div>
          </div>

          {/* Guest Count */}
          {form.attendance && (
            <div className="mb-6">
              <label className="block text-sm text-deep mb-2 font-medium">
                {t("form.guestCount")}
              </label>
              <select
                value={form.guestCount}
                onChange={(e) =>
                  setForm({ ...form, guestCount: Number(e.target.value) })
                }
                className="w-full px-4 py-3 bg-warm border border-gold/20 rounded-lg text-sm text-deep focus:outline-none focus:border-gold/50 transition-colors"
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Dietary */}
          {form.attendance && (
            <div className="mb-6">
              <label className="block text-sm text-deep mb-2 font-medium">
                {t("form.dietary")}
              </label>
              <input
                type="text"
                value={form.dietary}
                onChange={(e) => setForm({ ...form, dietary: e.target.value })}
                placeholder={t("form.dietaryPlaceholder")}
                className="w-full px-4 py-3 bg-warm border border-gold/20 rounded-lg text-sm text-deep placeholder:text-secondary/40 focus:outline-none focus:border-gold/50 transition-colors"
              />
            </div>
          )}

          {/* Message */}
          <div className="mb-8">
            <label className="block text-sm text-deep mb-2 font-medium">
              {t("form.message")}
            </label>
            <textarea
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder={t("form.messagePlaceholder")}
              rows={4}
              className="w-full px-4 py-3 bg-warm border border-gold/20 rounded-lg text-sm text-deep placeholder:text-secondary/40 focus:outline-none focus:border-gold/50 transition-colors resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 bg-gold text-white rounded-lg text-sm tracking-wider hover:bg-gold-dark transition-colors disabled:opacity-50"
          >
            {submitting ? t("form.submitting") : t("form.submit")}
          </button>
        </motion.form>
      </div>
    </div>
  );
}
