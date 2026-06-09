import Link from "next/link";
import { Scale } from "lucide-react";
import { APP_NAME } from "@/lib/constants";
import { UserMenu } from "@/components/auth/user-menu";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-outline-variant/30 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link
          href="/"
          className="flex items-center gap-2 font-[family-name:var(--font-manrope)] text-base font-bold text-foreground"
        >
          <Scale className="h-5 w-5 text-secondary" aria-hidden />
          {APP_NAME}
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-on-surface-variant md:flex">
          <Link href="/" className="font-label-caps hover:text-foreground">
            Search
          </Link>
          <Link href="/properties" className="font-label-caps hover:text-foreground">
            Properties
          </Link>
          <Link href="/shortlist" className="font-label-caps hover:text-foreground">
            Shortlist
          </Link>
          <Link href="/compare" className="font-label-caps hover:text-foreground">
            Compare
          </Link>
          <Link href="/strata/upload" className="font-label-caps hover:text-foreground">
            Strata scan
          </Link>
          <UserMenu />
        </nav>

        <div className="flex items-center gap-3 md:hidden">
          <Link href="/strata/upload" className="text-sm text-on-surface-variant">
            Strata
          </Link>
          <Link href="/shortlist" className="text-sm text-on-surface-variant">
            List
          </Link>
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
