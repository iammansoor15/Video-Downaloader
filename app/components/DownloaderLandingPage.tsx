import type { DownloaderLandingContent } from "@/lib/landing";
import { landingNavLinks } from "@/lib/landing";
import { SITE_URL } from "@/lib/seo";
import { DownloaderTool } from "./DownloaderTool";
import { LandingStructuredData } from "./LandingStructuredData";

const howToSteps = [
  {
    title: "Copy the link",
    text: "Copy the public video URL from the source platform.",
  },
  {
    title: "Paste the URL",
    text: "Paste the link into the downloader and fetch the available formats.",
  },
  {
    title: "Choose format",
    text: "Select MP4 video or audio-only output, then start the download.",
  },
];

export function DownloaderLandingPage({
  page,
}: {
  page: DownloaderLandingContent;
}) {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-10 px-4 py-12 sm:py-16">
      <LandingStructuredData page={page} />

      <section
        aria-labelledby="download-title"
        className="mx-auto flex w-full max-w-2xl flex-col gap-7"
      >
        <header className="text-center">
          <h1
            id="download-title"
            className="mx-auto max-w-2xl bg-gradient-to-b from-white to-white/60 bg-clip-text text-4xl font-bold leading-tight text-transparent"
          >
            {page.h1}
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-white/60">
            {page.intro}
          </p>
        </header>

        <DownloaderTool />
      </section>

      <section
        aria-labelledby="platforms-title"
        className="border-t border-white/10 pt-8"
      >
        <div className="max-w-2xl">
          <h2 id="platforms-title" className="text-2xl font-semibold text-white">
            {page.platformHeading}
          </h2>
          <p className="mt-3 text-sm leading-6 text-white/55">
            {page.platformIntro}
          </p>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {page.platformCards.map((platform) => (
            <article
              key={platform.title}
              className="rounded-lg border border-white/10 bg-white/[0.025] p-4"
            >
              <h3 className="font-semibold text-white">
                {platform.href ? (
                  <a
                    href={platform.href}
                    className="cursor-pointer hover:underline"
                  >
                    {platform.title}
                  </a>
                ) : (
                  platform.title
                )}
              </h3>
              <p className="mt-2 text-sm leading-6 text-white/55">
                {platform.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section
        aria-labelledby="howto-title"
        className="border-t border-white/10 pt-8"
      >
        <h2 id="howto-title" className="text-2xl font-semibold text-white">
          How to download in three steps
        </h2>
        <ol className="mt-4 grid gap-3 sm:grid-cols-3">
          {howToSteps.map((step, index) => (
            <li
              key={step.title}
              className="rounded-lg border border-white/10 bg-white/[0.025] px-4 py-3"
            >
              <span className="text-xs font-semibold text-white/40">
                Step {index + 1}
              </span>
              <h3 className="mt-1 font-semibold text-white">{step.title}</h3>
              <p className="mt-1 text-sm leading-6 text-white/55">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section
        aria-labelledby="quality-title"
        className="grid gap-6 border-t border-white/10 pt-8 md:grid-cols-[0.9fr_1.1fr]"
      >
        <div>
          <h2 id="quality-title" className="text-2xl font-semibold text-white">
            {page.qualityHeading}
          </h2>
          <p className="mt-3 text-sm leading-6 text-white/55">
            {page.qualityIntro}
          </p>
        </div>
        <ul className="grid gap-3">
          {page.qualityPoints.map((point) => (
            <li
              key={point}
              className="rounded-lg border border-white/10 bg-white/[0.025] px-4 py-3 text-sm leading-6 text-white/65"
            >
              {point}
            </li>
          ))}
        </ul>
      </section>

      {page.supportedSites && page.supportedSites.length > 0 && (
        <section
          aria-labelledby="supported-title"
          className="border-t border-white/10 pt-8"
        >
          <h2
            id="supported-title"
            className="text-2xl font-semibold text-white"
          >
            Supported sites
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/55">
            The downloader works with public links from these popular platforms
            and many more — over 1,800 sites in total when downloadable formats
            are available.
          </p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {page.supportedSites.map((site) => (
              <li
                key={site}
                className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-white/65"
              >
                {site}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="faq-title" className="border-t border-white/10 pt-8">
        <h2 id="faq-title" className="text-2xl font-semibold text-white">
          {page.navLabel} FAQ
        </h2>
        <div className="mt-4 grid gap-3">
          {page.faqs.map((faq) => (
            <details
              key={faq.question}
              className="rounded-lg border border-white/10 bg-white/[0.025] px-4 py-3"
            >
              <summary className="cursor-pointer list-none text-sm font-semibold text-white">
                {faq.question}
              </summary>
              <p className="mt-2 text-sm leading-6 text-white/55">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </section>

      <nav
        aria-label="Related downloaders"
        className="border-t border-white/10 pt-8"
      >
        <h2 className="text-2xl font-semibold text-white">
          Related downloaders
        </h2>
        <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm">
          {landingNavLinks
            .filter((link) => link.href !== page.path)
            .map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="cursor-pointer text-white/65 underline-offset-4 hover:text-white hover:underline"
                >
                  {link.label}
                </a>
              </li>
            ))}
        </ul>
      </nav>

      <footer className="mt-auto border-t border-white/10 pt-6 text-center text-xs leading-6 text-white/40">
        <p>
          For content you own or have the right to download. Respect each
          platform&apos;s terms and copyright.
        </p>
        <p>
          Copyright &copy; 2026{" "}
          <a
            href={SITE_URL}
            className="text-white/60 underline-offset-4 hover:text-white hover:underline"
          >
            mansoor.website
          </a>
          . All rights reserved.
        </p>
      </footer>
    </main>
  );
}
