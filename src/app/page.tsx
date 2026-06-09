"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  FolderOpen,
  GitCompareArrows,
  ClipboardCheck,
  FileText,
  Bookmark,
  ListChecks,
  Map,
} from "lucide-react";
import { AddressSearch } from "@/components/address-search";
import { HeroMapBackground } from "@/components/hero-map-background";
import { MASTER_DISCLAIMER, PRODUCT_POSITIONING } from "@/lib/compliance/copy";
import { Button } from "@/components/ui/button";

const COCKPIT_FEATURES = [
  {
    href: "/",
    icon: FolderOpen,
    title: "Start a property file",
    desc: "Turn an address into a pre-offer passport — what’s known, missing, and what to ask.",
    color: "bg-[#131b2e] text-white",
  },
  {
    href: "/strata/upload",
    icon: FileText,
    title: "Upload strata report",
    desc: "Extract red flags and conveyancer-ready questions from your PDF.",
    color: "bg-violet-100 text-violet-900",
  },
  {
    href: "/compare",
    icon: GitCompareArrows,
    title: "Compare properties",
    desc: "Compare unknowns, readiness, and missing checks — not listing features.",
    color: "bg-secondary-container text-on-secondary-container",
  },
  {
    href: "/inspection/new",
    icon: ClipboardCheck,
    title: "Inspection copilot",
    desc: "Mobile checklist for open home day with photos and notes.",
    color: "bg-emerald-100 text-emerald-900",
  },
  {
    href: "/shortlist",
    icon: Bookmark,
    title: "Shortlist",
    desc: "Track properties you are seriously considering.",
    color: "bg-sky-100 text-sky-900",
  },
  {
    href: "/properties",
    icon: ListChecks,
    title: "My properties",
    desc: "Your saved property passports and due diligence progress.",
    color: "bg-orange-100 text-orange-900",
  },
];

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-outline-variant/30">
        <HeroMapBackground />
        <div className="relative mx-auto max-w-4xl px-5 pb-20 pt-16 text-center sm:pt-24">
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-3 font-label-caps text-on-surface-variant"
          >
            Evidence over opinion
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="font-[family-name:var(--font-manrope)] text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl"
          >
            Before you fall in love with a property, check what could cost you later
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mx-auto mt-4 max-w-2xl text-lg text-on-surface-variant"
          >
            PropertyTruth helps Australian buyers turn listings, strata reports,
            inspections, and public records into a clear pre-offer checklist — what&apos;s
            known, what&apos;s missing, and what to ask your professionals.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mx-auto mt-8 max-w-xl text-left"
          >
            <AddressSearch size="large" />
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
              <Button variant="outline" size="lg" asChild>
                <Link href="/strata/upload">Upload a strata report</Link>
              </Button>
            </div>
            <p className="mt-4 text-center text-xs text-on-surface-variant">
              Built for buyers. Not agents. Not advice. Just clearer questions before
              you commit.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16">
        <h2 className="mb-2 text-center font-[family-name:var(--font-manrope)] text-2xl font-bold">
          Your pre-offer cockpit
        </h2>
        <p className="mx-auto mb-10 max-w-lg text-center text-sm text-on-surface-variant">
          One property file for checks, documents, questions, and offer readiness —
          not six disconnected tools.
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {COCKPIT_FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
            >
              <Link
                href={f.href}
                className="group flex h-full flex-col rounded-xl border border-outline-variant/30 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <div
                  className={`mb-4 inline-flex w-fit rounded-xl p-3 ${f.color}`}
                >
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="font-[family-name:var(--font-manrope)] font-semibold">
                  {f.title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-on-surface-variant">
                  {f.desc}
                </p>
                <span className="mt-4 text-sm font-medium text-secondary group-hover:underline">
                  Open →
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <section
        id="how-it-works"
        className="border-y border-outline-variant/30 bg-white/60 py-16"
      >
        <div className="mx-auto max-w-3xl px-5 text-center">
          <Map className="mx-auto mb-4 h-8 w-8 text-evidence-missing" />
          <h2 className="font-[family-name:var(--font-manrope)] text-2xl font-bold">
            Known / unknown / verify
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-on-surface-variant">
            {PRODUCT_POSITIONING} {MASTER_DISCLAIMER} Grey is not green — we never
            label a property &ldquo;safe to buy&rdquo; or &ldquo;recommended.&rdquo;
          </p>
        </div>
      </section>
    </>
  );
}
