"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Search,
  GitCompareArrows,
  ClipboardCheck,
  FileText,
  Bookmark,
  Shield,
  Map,
} from "lucide-react";
import { AddressSearch } from "@/components/address-search";
import { HeroMapBackground } from "@/components/hero-map-background";
import { APP_TAGLINE } from "@/lib/constants";

const COCKPIT_FEATURES = [
  {
    href: "/",
    icon: Search,
    title: "Risk Snapshot",
    desc: "Scan any Sydney address for buyer confidence score and risk signals.",
    color: "bg-stone-900 text-white",
  },
  {
    href: "/compare",
    icon: GitCompareArrows,
    title: "Compare Board",
    desc: "Compare up to 4 properties side by side.",
    color: "bg-amber-100 text-amber-900",
  },
  {
    href: "/inspection/new",
    icon: ClipboardCheck,
    title: "Inspection Copilot",
    desc: "Mobile checklist for open home day with photos and notes.",
    color: "bg-emerald-100 text-emerald-900",
  },
  {
    href: "/strata/upload",
    icon: FileText,
    title: "Strata AI",
    desc: "Upload strata PDFs for AI red-flag analysis.",
    color: "bg-violet-100 text-violet-900",
  },
  {
    href: "/shortlist",
    icon: Bookmark,
    title: "Shortlist",
    desc: "Track properties you're seriously considering.",
    color: "bg-sky-100 text-sky-900",
  },
  {
    href: "/#how-it-works",
    icon: Shield,
    title: "Due Diligence",
    desc: "Verify, offer readiness and ownership cost on each report.",
    color: "bg-orange-100 text-orange-900",
  },
];

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-stone-200/60">
        <HeroMapBackground />
        <div className="relative mx-auto max-w-4xl px-4 pb-20 pt-16 text-center sm:pt-24">
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-3 text-sm font-medium text-stone-500"
          >
            Buyer-side property decision cockpit
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-4xl font-semibold tracking-tight text-stone-900 sm:text-5xl"
          >
            {APP_TAGLINE}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mx-auto mt-4 max-w-xl text-base text-stone-600"
          >
            Domain helps you find properties. PropertyTruth helps you decide
            whether to pursue them — with confidence scores, risk maps, inspections
            and due diligence.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mx-auto mt-8 max-w-xl text-left"
          >
            <AddressSearch size="large" />
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="mb-2 text-center text-2xl font-semibold text-stone-900">
          Your buyer cockpit
        </h2>
        <p className="mx-auto mb-10 max-w-lg text-center text-sm text-stone-500">
          Everything you need from first scan to offer — visual, calm, source-backed.
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
                className="group flex h-full flex-col rounded-2xl border border-stone-200/80 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <div
                  className={`mb-4 inline-flex w-fit rounded-xl p-3 ${f.color}`}
                >
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-stone-900">{f.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-stone-500">
                  {f.desc}
                </p>
                <span className="mt-4 text-sm font-medium text-stone-700 group-hover:underline">
                  Open →
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="border-y border-stone-200/60 bg-white/60 py-16">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <Map className="mx-auto mb-4 h-8 w-8 text-stone-400" />
          <h2 className="text-2xl font-semibold text-stone-900">
            Evidence-backed, not alarmist
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-stone-600">
            We ingest NSW planning, flood, bushfire and strata data into PostGIS
            and summarise in plain English. No price predictions. No &ldquo;safe&rdquo;
            or &ldquo;unsafe&rdquo; labels — only what available public data shows and
            what still needs professional review.
          </p>
        </div>
      </section>
    </>
  );
}
