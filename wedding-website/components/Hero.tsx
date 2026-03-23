"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

function useCountdown(targetDate: Date) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const update = () => {
      const now = new Date().getTime();
      const diff = targetDate.getTime() - now;
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return timeLeft;
}

export default function Hero() {
  const t = useTranslations("hero");
  const weddingDate = new Date("2026-05-23T14:00:00");
  const { days, hours, minutes, seconds } = useCountdown(weddingDate);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background gradient (placeholder for real photo) */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, #f5f0e8 0%, #e8dcc8 30%, #d4c4a0 60%, #c9a96e 100%)",
        }}
      />
      <div className="absolute inset-0 bg-warm/30" />

      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-32 h-32 border border-gold/20 rounded-full" />
      <div className="absolute bottom-32 right-16 w-24 h-24 border border-gold/15 rounded-full" />
      <div className="absolute top-1/4 right-1/4 w-2 h-2 bg-gold/30 rounded-full" />

      <div className="relative z-10 text-center px-4">
        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-gold text-sm tracking-[0.3em] uppercase mb-8"
        >
          {t("subtitle")}
        </motion.p>

        {/* Names */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <h1 className="font-serif text-4xl sm:text-5xl md:text-7xl text-deep mb-2 tracking-wide">
            {t("groomNameEn")} {t("connectorEn")} {t("brideNameEn")}
          </h1>
          <p className="font-serif text-2xl sm:text-3xl md:text-4xl text-deep/70 mt-2">
            {t("groomName")} {t("connector")} {t("brideName")}
          </p>
        </motion.div>

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="w-24 h-px bg-gold mx-auto my-8"
        />

        {/* Date & Location */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          <p className="text-lg sm:text-xl text-deep/80 font-serif">
            {t("date")}
          </p>
          <p className="text-sm text-secondary mt-1 tracking-widest">
            {t("location")}
          </p>
        </motion.div>

        {/* Countdown */}
        {mounted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.3 }}
            className="mt-12 flex justify-center gap-4 sm:gap-8"
          >
            {[
              { value: days, label: t("countdown.days") },
              { value: hours, label: t("countdown.hours") },
              { value: minutes, label: t("countdown.minutes") },
              { value: seconds, label: t("countdown.seconds") },
            ].map((item) => (
              <div key={item.label} className="text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center border border-gold/30 rounded-lg bg-warm/50 backdrop-blur-sm">
                  <span className="font-serif text-2xl sm:text-3xl text-deep">
                    {String(item.value).padStart(2, "0")}
                  </span>
                </div>
                <span className="text-xs text-secondary mt-2 block tracking-wider">
                  {item.label}
                </span>
              </div>
            ))}
          </motion.div>
        )}

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 2 }}
          className="mt-16"
        >
          <a
            href="#story"
            className="inline-flex flex-col items-center text-secondary/60 hover:text-gold transition-colors"
          >
            <span className="text-xs tracking-widest mb-2">
              {t("scrollDown")}
            </span>
            <motion.svg
              animate={{ y: [0, 6, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </motion.svg>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
