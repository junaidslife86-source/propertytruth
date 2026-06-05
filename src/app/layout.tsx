import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Toaster } from "sonner";
import { SiteHeader } from "@/components/site-header";
import { QueryProvider } from "@/providers/query-provider";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: APP_NAME,
    template: `%s · ${APP_NAME}`,
  },
  description: APP_TAGLINE,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-AU" className={`${geistSans.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">
        <QueryProvider>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <Toaster position="bottom-center" richColors />
        </QueryProvider>
      </body>
    </html>
  );
}
