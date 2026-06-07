import type { MetadataRoute } from "next";
import { allLandingPages } from "@/lib/landing";
import { SITE_URL } from "@/lib/seo";

const lastModified = new Date("2026-06-06T00:00:00.000Z");

export default function sitemap(): MetadataRoute.Sitemap {
  return allLandingPages.map((page) => ({
    url: new URL(page.path, SITE_URL).toString(),
    lastModified,
    changeFrequency: "weekly",
    priority: page.path === "/" ? 1 : 0.9,
  }));
}
