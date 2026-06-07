import { LOGO_MARK_DATA_URI } from "@/lib/brand";

/**
 * The Stream Save logo mark (violet/purple) for use anywhere in the app UI.
 * Size it with the `className` (e.g. `h-8 w-8`). Decorative by default — pair
 * it with the wordmark for the accessible name.
 */
export function Logo({ className }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={LOGO_MARK_DATA_URI} alt="" className={className} />
  );
}
