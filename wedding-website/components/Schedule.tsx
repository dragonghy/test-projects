"use client";

import { useTranslations } from "next-intl";
import AnimateOnScroll from "./AnimateOnScroll";

const icons = [
  // Welcome
  <svg key="welcome" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
  </svg>,
  // Ceremony
  <svg key="ceremony" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>,
  // Reception
  <svg key="reception" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
  </svg>,
  // Farewell
  <svg key="farewell" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
  </svg>,
];

export default function Schedule() {
  const t = useTranslations("schedule");

  const events = [0, 1, 2, 3].map((i) => ({
    time: t(`events.${i}.time`),
    title: t(`events.${i}.title`),
    description: t(`events.${i}.description`),
  }));

  return (
    <section id="schedule" className="py-24 px-4">
      <div className="max-w-3xl mx-auto">
        <AnimateOnScroll className="text-center mb-16">
          <h2 className="font-serif text-3xl sm:text-4xl text-deep section-title-underline">
            {t("sectionTitle")}
          </h2>
          <p className="text-secondary mt-6 text-sm tracking-wide">
            {t("sectionSubtitle")}
          </p>
        </AnimateOnScroll>

        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gold/20" />

          {events.map((event, i) => (
            <AnimateOnScroll key={i} delay={i * 0.12} direction="up">
              <div className="relative pl-20 mb-12 last:mb-0">
                {/* Icon circle */}
                <div className="absolute left-4 top-0 w-9 h-9 bg-warm border-2 border-gold rounded-full flex items-center justify-center text-gold z-10">
                  {icons[i]}
                </div>

                {/* Time */}
                <span className="text-gold text-sm font-medium tracking-wider">
                  {event.time}
                </span>
                <h3 className="font-serif text-xl text-deep mt-1">
                  {event.title}
                </h3>
                <p className="text-secondary text-sm mt-1 leading-relaxed">
                  {event.description}
                </p>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
