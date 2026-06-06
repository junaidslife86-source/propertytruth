import Link from "next/link";
import { MASTER_DISCLAIMER, PRODUCT_POSITIONING } from "@/lib/compliance/copy";

export function SiteFooter() {
  return (
    <footer className="border-t border-outline-variant/40 bg-white/80">
      <div className="mx-auto max-w-6xl px-5 py-8">
        <p className="max-w-3xl text-sm leading-relaxed text-on-surface-variant">
          {PRODUCT_POSITIONING} {MASTER_DISCLAIMER}
        </p>
        <nav className="mt-4 flex flex-wrap gap-4 text-sm text-on-surface-variant">
          <Link href="/privacy" className="hover:text-foreground">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-foreground">
            Terms
          </Link>
        </nav>
      </div>
    </footer>
  );
}
