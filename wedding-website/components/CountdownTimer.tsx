"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";

const WEDDING_DATE = new Date("2026-05-23T14:00:00+02:00");

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calculateTimeLeft(): TimeLeft {
  const difference = WEDDING_DATE.getTime() - new Date().getTime();
  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }
  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / (1000 * 60)) % 60),
    seconds: Math.floor((difference / 1000) % 60),
  };
}

export default function CountdownTimer() {
  const t = useTranslations("hero.countdown");
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!timeLeft) {
    return (
      <div className="flex gap-4 sm:gap-8 justify-center">
        {["days", "hours", "minutes", "seconds"].map((unit) => (
          <div key={unit} className="text-center">
            <div className="text-3xl sm:text-5xl font-serif text-gold tabular-nums w-16 sm:w-20">
              --
            </div>
            <div className="text-xs sm:text-sm text-secondary mt-1 uppercase tracking-widest">
              {t(unit)}
            </div>
          </div>
        ))}
      </div>
    );
  }

  const units = [
    { key: "days", value: timeLeft.days },
    { key: "hours", value: timeLeft.hours },
    { key: "minutes", value: timeLeft.minutes },
    { key: "seconds", value: timeLeft.seconds },
  ];

  return (
    <div className="flex gap-4 sm:gap-8 justify-center">
      {units.map((unit, i) => (
        <div key={unit.key} className="text-center">
          <div className="relative">
            <div className="text-3xl sm:text-5xl font-serif text-gold tabular-nums w-16 sm:w-20">
              {String(unit.value).padStart(2, "0")}
            </div>
            {i < units.length - 1 && (
              <span className="absolute -right-2 sm:-right-4 top-1/2 -translate-y-1/2 text-gold-light text-2xl sm:text-3xl font-light hidden sm:block">
                :
              </span>
            )}
          </div>
          <div className="text-xs sm:text-sm text-secondary mt-1 uppercase tracking-widest">
            {t(unit.key)}
          </div>
        </div>
      ))}
    </div>
  );
}
