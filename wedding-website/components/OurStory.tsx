"use client";

import { useTranslations } from "next-intl";
import AnimateOnScroll from "./AnimateOnScroll";

export default function OurStory() {
  const t = useTranslations("story");

  const nodes = [0, 1, 2, 3].map((i) => ({
    date: t(`nodes.${i}.date`),
    title: t(`nodes.${i}.title`),
    description: t(`nodes.${i}.description`),
  }));

  return (
    <section id="story" className="py-24 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <AnimateOnScroll className="text-center mb-16">
          <h2 className="font-serif text-3xl sm:text-4xl text-deep section-title-underline">
            {t("sectionTitle")}
          </h2>
          <p className="text-secondary mt-6 text-sm tracking-wide">
            {t("sectionSubtitle")}
          </p>
        </AnimateOnScroll>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-1/2 transform -translate-x-px top-0 bottom-0 w-0.5 bg-gold/20 hidden md:block" />
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gold/20 md:hidden" />

          {nodes.map((node, i) => (
            <AnimateOnScroll
              key={i}
              delay={i * 0.15}
              direction={i % 2 === 0 ? "left" : "right"}
              className={`relative mb-12 md:mb-16 ${
                i % 2 === 0
                  ? "md:pr-[calc(50%+2rem)] md:text-right"
                  : "md:pl-[calc(50%+2rem)] md:text-left"
              } pl-14 md:pl-0`}
            >
              {/* Dot on timeline */}
              <div
                className={`absolute top-1 w-3 h-3 bg-gold rounded-full border-2 border-warm z-10
                  md:left-1/2 md:-translate-x-1/2
                  left-[18px]`}
              />

              {/* Content */}
              <span className="text-gold text-xs tracking-widest uppercase font-medium">
                {node.date}
              </span>
              <h3 className="font-serif text-xl text-deep mt-2 mb-2">
                {node.title}
              </h3>
              <p className="text-secondary text-sm leading-relaxed max-w-md inline-block">
                {node.description}
              </p>
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
