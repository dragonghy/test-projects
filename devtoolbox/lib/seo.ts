import type { Tool } from "./tools-registry";
import type { Metadata } from "next";

const SITE_NAME = "DevToolBox";
const SITE_URL = "https://devtoolbox-gules.vercel.app";

export function generateToolMetadata(tool: Tool): Metadata {
  return {
    title: tool.metaTitle,
    description: tool.metaDescription,
    keywords: tool.keywords.join(", "),
    alternates: {
      canonical: `${SITE_URL}/tools/${tool.slug}`,
    },
    openGraph: {
      title: tool.metaTitle,
      description: tool.metaDescription,
      url: `${SITE_URL}/tools/${tool.slug}`,
      siteName: SITE_NAME,
      type: "website",
    },
  };
}

export function generateToolJsonLd(tool: Tool) {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: tool.name,
    description: tool.metaDescription,
    url: `${SITE_URL}/tools/${tool.slug}`,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Any",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    isPartOf: {
      "@type": "WebSite",
      name: SITE_NAME,
      url: SITE_URL,
    },
  };
}

export function generateSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description:
      "Free online developer tools — JSON formatter, Base64 encoder, UUID generator, regex tester, and more. Fast, modern, no signup required.",
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}
