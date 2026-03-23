"use client";

import { useTranslations } from "next-intl";
import AnimateOnScroll from "./AnimateOnScroll";

function CalendarIcon() {
  return (
    <svg className="w-8 h-8 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function MapPinIcon() {
  return (
    <svg className="w-8 h-8 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function ShirtIcon() {
  return (
    <svg className="w-8 h-8 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3L5 7l2 1v10a2 2 0 002 2h6a2 2 0 002-2V8l2-1-4-4m-6 0h6m-6 0v2a3 3 0 006 0V3" />
    </svg>
  );
}

export default function WeddingInfo() {
  const t = useTranslations("weddingInfo");

  const cards = [
    {
      icon: <CalendarIcon />,
      title: t("cards.dateTime.title"),
      lines: [
        t("cards.dateTime.date"),
        t("cards.dateTime.ceremony"),
        t("cards.dateTime.reception"),
      ],
    },
    {
      icon: <MapPinIcon />,
      title: t("cards.location.title"),
      lines: [
        t("cards.location.venue"),
        t("cards.location.address"),
      ],
      extra: (
        <div className="mt-4 w-full h-32 bg-gradient-to-br from-gold/10 to-gold/5 rounded-lg flex items-center justify-center border border-gold/10">
          <span className="text-xs text-secondary">{t("cards.location.mapNote")}</span>
        </div>
      ),
    },
    {
      icon: <ShirtIcon />,
      title: t("cards.dressCode.title"),
      lines: [
        t("cards.dressCode.style"),
        t("cards.dressCode.colors"),
        t("cards.dressCode.note"),
      ],
    },
  ];

  return (
    <section id="info" className="py-24 px-4 bg-gradient-to-b from-warm to-[#f8f4ea]">
      <div className="max-w-5xl mx-auto">
        <AnimateOnScroll className="text-center mb-16">
          <h2 className="font-serif text-3xl sm:text-4xl text-deep section-title-underline">
            {t("sectionTitle")}
          </h2>
          <p className="text-secondary mt-6 text-sm tracking-wide">
            {t("sectionSubtitle")}
          </p>
        </AnimateOnScroll>

        <div className="grid md:grid-cols-3 gap-8">
          {cards.map((card, i) => (
            <AnimateOnScroll key={i} delay={i * 0.15}>
              <div className="bg-warm rounded-xl p-8 text-center shadow-sm border border-gold/10 hover:shadow-md hover:border-gold/25 transition-all duration-300 h-full">
                <div className="flex justify-center mb-4">{card.icon}</div>
                <h3 className="font-serif text-lg text-deep mb-4">
                  {card.title}
                </h3>
                {card.lines.map((line, j) => (
                  <p key={j} className="text-secondary text-sm mb-1">
                    {line}
                  </p>
                ))}
                {card.extra}
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
