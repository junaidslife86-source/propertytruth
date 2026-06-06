import Link from "next/link";
import { APP_NAME } from "@/lib/constants";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-stone-200/60 bg-[#faf9f7]/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="text-sm font-semibold tracking-tight text-stone-900">
          {APP_NAME}
        </Link>
        <nav className="flex items-center gap-4 text-sm text-stone-600 sm:gap-6">
          <Link href="/onboarding" className="hover:text-stone-900">
            Profile
          </Link>
          <Link href="/shortlist" className="hover:text-stone-900">
            Shortlist
          </Link>
          <Link href="/compare" className="hover:text-stone-900">
            Compare
          </Link>
          <Link href="/inspection/new" className="hover:text-stone-900">
            Inspect
          </Link>
          <Link href="/strata/upload" className="hover:text-stone-900">
            Strata
          </Link>
        </nav>
      </div>
    </header>
  );
}
