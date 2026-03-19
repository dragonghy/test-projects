interface AdBannerProps {
  slot: "sidebar" | "below-tool";
  className?: string;
}

export default function AdBanner({ slot, className = "" }: AdBannerProps) {
  // Placeholder for future Google AdSense integration
  // Will be replaced with actual ad code once AdSense is approved
  if (process.env.NODE_ENV === "production") return null;

  return (
    <div
      className={`border border-dashed border-neutral-300 dark:border-neutral-700 rounded-xl flex items-center justify-center text-xs text-neutral-400 ${
        slot === "sidebar" ? "h-64 w-full" : "h-20 w-full"
      } ${className}`}
    >
      Ad Placeholder ({slot})
    </div>
  );
}
