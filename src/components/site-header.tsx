import Link from "next/link";
import { APP_NAME } from "@/lib/constants";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-stone-200/60 bg-[#faf9f7]/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="text-sm font-semibold tracking-tight text-stone-900">
          {APP_NAME}
        </Link>
        <nav className="flex items-center gap-6 text-sm text-stone-600">
          <Link href="/#how-it-works" className="hover:text-stone-900">
            How it works
          </Link>
          <Link href="/#faq" className="hover:text-stone-900">
            FAQ
          </Link>
        </nav>
      </div>
    </header>
  );
}
