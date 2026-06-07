import Link from "next/link";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/seo";
import { Logo } from "./Logo";

export function SiteHeader() {
  return (
    <header className="border-b border-white/10 bg-white/[0.02] backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-4xl items-center justify-between px-4 py-3.5">
        <Link
          href="/"
          aria-label={`${SITE_NAME} home`}
          className="group flex items-center gap-2.5"
        >
          <Logo className="h-9 w-9 drop-shadow-[0_0_12px_rgba(139,92,246,0.35)] transition group-hover:drop-shadow-[0_0_16px_rgba(139,92,246,0.55)]" />
          <span className="text-lg font-semibold tracking-tight">
            <span className="text-white">Stream</span>
            <span className="text-violet-400">Save</span>
          </span>
        </Link>
        <span className="hidden text-xs font-medium uppercase tracking-wider text-white/40 sm:block">
          {SITE_TAGLINE}
        </span>
      </div>
    </header>
  );
}
