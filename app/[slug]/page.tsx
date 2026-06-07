import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DownloaderLandingPage } from "../components/DownloaderLandingPage";
import {
  dynamicLandingPages,
  getLandingPageBySlug,
} from "@/lib/landing";
import { createLandingMetadata } from "@/lib/page-metadata";

type Props = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return dynamicLandingPages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = getLandingPageBySlug(slug);

  if (!page) {
    return {};
  }

  return createLandingMetadata(page);
}

export default async function LandingPage({ params }: Props) {
  const { slug } = await params;
  const page = getLandingPageBySlug(slug);

  if (!page) {
    notFound();
  }

  return <DownloaderLandingPage page={page} />;
}
