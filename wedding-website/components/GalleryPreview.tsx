"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import AnimateOnScroll from "./AnimateOnScroll";

export default function GalleryPreview() {
  const t = useTranslations("gallery");
  const navT = useTranslations("nav");

  const photos = [0, 1, 2, 3, 4, 5].map((i) => ({
    label: t(`photos.${i}.label`),
    color: t(`photos.${i}.color`),
  }));

  return (
    <section id="gallery" className="py-24 px-4 bg-gradient-to-b from-warm to-[#f8f4ea]">
      <div className="max-w-6xl mx-auto">
        <AnimateOnScroll className="text-center mb-16">
          <h2 className="font-serif text-3xl sm:text-4xl text-deep section-title-underline">
            {t("sectionTitle")}
          </h2>
          <p className="text-secondary mt-6 text-sm tracking-wide">
            {t("sectionSubtitle")}
          </p>
        </AnimateOnScroll>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {photos.map((photo, i) => (
            <AnimateOnScroll key={i} delay={i * 0.08}>
              <div
                className="relative aspect-[4/3] rounded-xl overflow-hidden group cursor-pointer"
                style={{ backgroundColor: photo.color }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute inset-0 flex items-center justify-center opacity-20">
                  <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <p className="text-white text-sm font-medium">{photo.label}</p>
                </div>
              </div>
            </AnimateOnScroll>
          ))}
        </div>

        <AnimateOnScroll className="text-center mt-10">
          <Link
            href="/gallery"
            className="inline-flex items-center gap-2 px-8 py-3 border border-gold text-gold rounded-full text-sm tracking-wider hover:bg-gold hover:text-white transition-all duration-300"
          >
            {navT("gallery")}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </AnimateOnScroll>
      </div>
    </section>
  );
}
