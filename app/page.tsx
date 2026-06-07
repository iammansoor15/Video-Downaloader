import type { Metadata } from "next";
import { DownloaderLandingPage } from "./components/DownloaderLandingPage";
import { landingPages } from "@/lib/landing";
import { createLandingMetadata } from "@/lib/page-metadata";

const page = landingPages.home;

export const metadata: Metadata = createLandingMetadata(page);

export default function Home() {
  return <DownloaderLandingPage page={page} />;
}
