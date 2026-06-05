"use client";

import { motion } from "framer-motion";
import { Building2, Layers, Map, Shield, Train } from "lucide-react";
import { AddressSearch } from "@/components/address-search";
import { HeroMapBackground } from "@/components/hero-map-background";
import { DevelopmentCard } from "@/components/development-card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { APP_TAGLINE } from "@/lib/constants";
import type { Development } from "@/lib/schemas";

const EXAMPLE_DEVELOPMENTS: Development[] = [
  {
    id: "ex-1",
    council: "City of Sydney",
    application_number: "DA-2024-00142",
    address: "120 George Street, Sydney",
    development_type: "Mixed-use",
    lodged_date: "2024-03-15",
    status: "Under assessment",
    storeys: 12,
    description: "Mixed-use tower with retail podium",
    distance_meters: 180,
  },
  {
    id: "ex-2",
    council: "City of Sydney",
    application_number: "DA-2024-00089",
    address: "45 Pitt Street, Sydney",
    development_type: "Residential",
    lodged_date: "2024-01-22",
    status: "Approved",
    storeys: 8,
    description: "Boutique residential apartments",
    distance_meters: 320,
  },
];

const CHECKS = [
  { icon: Building2, title: "Development applications", desc: "Nearby DAs and modification applications" },
  { icon: Layers, title: "Zoning context", desc: "Overlays that shape what can be built" },
  { icon: Train, title: "Infrastructure", desc: "Transport and public realm projects" },
  { icon: Map, title: "Future change signals", desc: "Density, scale, and neighbourhood shifts" },
];

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-stone-200/60">
        <HeroMapBackground />
        <div className="relative mx-auto max-w-3xl px-4 pb-24 pt-20 text-center sm:pt-28">
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 text-sm font-medium text-stone-500"
          >
            Buyer-side property intelligence for Sydney
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-4xl font-semibold tracking-tight text-stone-900 sm:text-5xl sm:leading-tight"
          >
            {APP_TAGLINE}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-stone-600"
          >
            Understand nearby development applications, infrastructure projects, and zoning context — so you can buy with clarity, not surprise.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mx-auto mt-10 max-w-xl text-left"
          >
            <AddressSearch size="large" />
          </motion.div>
        </div>
      </section>

      <section id="how-it-works" className="mx-auto max-w-6xl px-4 py-20">
        <h2 className="mb-2 text-center text-2xl font-semibold tracking-tight text-stone-900">
          What we check
        </h2>
        <p className="mx-auto mb-12 max-w-lg text-center text-sm text-stone-500">
          We surface planning records and infrastructure data around your address — not valuations or predictions.
        </p>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {CHECKS.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="rounded-2xl border border-stone-200/80 bg-white/80 p-6 shadow-sm"
            >
              <item.icon className="mb-4 h-5 w-5 text-stone-500" />
              <h3 className="font-medium text-stone-900">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-500">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="border-y border-stone-200/60 bg-white/50 py-20">
        <div className="mx-auto max-w-2xl px-4">
          <h2 className="mb-8 text-center text-2xl font-semibold tracking-tight text-stone-900">
            Example nearby developments
          </h2>
          <div className="space-y-4">
            {EXAMPLE_DEVELOPMENTS.map((d) => (
              <DevelopmentCard key={d.id} development={d} />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-20 text-center">
        <Shield className="mx-auto mb-4 h-8 w-8 text-stone-400" />
        <h2 className="text-2xl font-semibold tracking-tight text-stone-900">
          Built to help you avoid future regret
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-stone-600">
          Sydney Development Radar summarises public planning data in plain language. We don&apos;t scrape listing sites, predict prices, or replace professional advice. Our goal is emotional clarity — so you feel informed before you commit.
        </p>
      </section>

      <section id="faq" className="mx-auto max-w-2xl px-4 pb-24">
        <h2 className="mb-8 text-center text-2xl font-semibold tracking-tight text-stone-900">
          FAQ
        </h2>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="1">
            <AccordionTrigger>Is this legal or financial advice?</AccordionTrigger>
            <AccordionContent>
              No. We summarise publicly available planning records. Always confirm details with your solicitor or buyer&apos;s agent.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="2">
            <AccordionTrigger>Where does the data come from?</AccordionTrigger>
            <AccordionContent>
              Council and NSW open datasets, ingested via our ETL pipeline into PostGIS. Coverage improves as more sources are connected.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="3">
            <AccordionTrigger>Does this predict property prices?</AccordionTrigger>
            <AccordionContent>
              Never. We focus on what might change around a property — not investment returns or valuations.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="4">
            <AccordionTrigger>Can I use it without an account?</AccordionTrigger>
            <AccordionContent>
              Yes. Scan any Sydney address instantly. Sign in to save reports and revisit them later.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>
    </>
  );
}
