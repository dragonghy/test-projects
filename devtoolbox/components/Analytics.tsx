"use client";

import Script from "next/script";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export default function Analytics() {
  // Respect DNT
  if (typeof navigator !== "undefined" && navigator.doNotTrack === "1") return null;
  if (!GA_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="gtag-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}', {
            page_path: window.location.pathname,
          });
        `}
      </Script>
    </>
  );
}

// Track tool usage events
export function trackToolEvent(toolName: string, action: string) {
  if (typeof window === "undefined") return;
  if (navigator.doNotTrack === "1") return;
  const w = window as typeof window & { gtag?: (...args: unknown[]) => void };
  if (w.gtag) {
    w.gtag("event", action, {
      event_category: "tool_usage",
      event_label: toolName,
    });
  }
}
