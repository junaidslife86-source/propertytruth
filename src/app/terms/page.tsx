import { MASTER_DISCLAIMER, PRODUCT_POSITIONING } from "@/lib/compliance/copy";
import { APP_NAME } from "@/lib/constants";

export const metadata = {
  title: "Terms",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <h1 className="font-[family-name:var(--font-manrope)] text-3xl font-bold">
        Terms of Use
      </h1>
      <p className="mt-4 text-sm text-on-surface-variant">
        Last updated: June 2026 · {APP_NAME}
      </p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-on-surface-variant">
        <p>
          {APP_NAME} is a buyer due-diligence workspace. {PRODUCT_POSITIONING}
        </p>
        <p>
          Outputs are based on available source material and may be incomplete.
          Absence of a finding does not mean absence of an issue. You must verify
          material items with qualified professionals before making property or
          credit decisions.
        </p>
        <p>
          We do not provide valuations, credit assistance, legal conclusions, or
          building/strata certifications. {MASTER_DISCLAIMER}
        </p>
        <p>
          To the extent permitted by law, {APP_NAME} is provided &ldquo;as
          is&rdquo; without warranties. This is a template for development — obtain
          legal review before public launch.
        </p>
      </div>
    </div>
  );
}
