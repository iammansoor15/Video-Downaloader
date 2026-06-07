import type { Metadata } from "next";
import type { DownloaderLandingContent } from "./landing";
import { SITE_NAME } from "./seo";

export function createLandingMetadata(
  page: DownloaderLandingContent,
): Metadata {
  return {
    title: page.metadataTitle,
    description: page.metadataDescription,
    keywords: page.keywords,
    alternates: {
      canonical: page.path,
    },
    openGraph: {
      title: page.metadataTitle,
      description: page.metadataDescription,
      url: page.path,
      siteName: SITE_NAME,
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: page.metadataTitle,
      description: page.metadataDescription,
    },
  };
}
