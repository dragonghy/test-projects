import { tools } from "@/lib/tools-registry";
import type { MetadataRoute } from "next";

const BASE_URL = "https://devtoolbox-gules.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const toolPages = tools.map((tool) => ({
    url: `${BASE_URL}/tools/${tool.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    ...toolPages,
  ];
}
