import type { DownloaderLandingContent } from "@/lib/landing";
import { SITE_NAME, SITE_URL } from "@/lib/seo";

function absoluteUrl(path: string) {
  return new URL(path, SITE_URL).toString();
}

export function LandingStructuredData({
  page,
}: {
  page: DownloaderLandingContent;
}) {
  const pageUrl = absoluteUrl(page.path);
  const breadcrumbItems =
    page.path === "/"
      ? [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: SITE_URL,
          },
        ]
      : [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: SITE_URL,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: page.navLabel,
            item: pageUrl,
          },
        ];
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: page.metadataTitle,
      headline: page.h1,
      url: pageUrl,
      description: page.metadataDescription,
      isPartOf: {
        "@type": "WebSite",
        name: SITE_NAME,
        url: SITE_URL,
      },
      about: page.keywords.map((keyword) => ({
        "@type": "Thing",
        name: keyword,
      })),
      inLanguage: "en",
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: page.faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: breadcrumbItems,
    },
  ];

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
      }}
    />
  );
}
