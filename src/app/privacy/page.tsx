import { MASTER_DISCLAIMER, NO_TRAINING_STATEMENT, PRODUCT_POSITIONING } from "@/lib/compliance/copy";
import { APP_NAME } from "@/lib/constants";

export const metadata = {
  title: "Privacy",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <h1 className="font-[family-name:var(--font-manrope)] text-3xl font-bold">
        Privacy Policy
      </h1>
      <p className="mt-4 text-sm text-on-surface-variant">
        Last updated: June 2026 · {APP_NAME}
      </p>

      <div className="prose prose-sm mt-8 max-w-none space-y-6 text-on-surface-variant">
        <section>
          <h2 className="font-[family-name:var(--font-manrope)] text-lg font-semibold text-foreground">
            What we collect
          </h2>
          <p>
            When you search addresses, upload strata documents, or use inspection
            tools, we may process property addresses, uploaded PDFs, extracted text,
            and usage metadata needed to run the service.
          </p>
        </section>

        <section>
          <h2 className="font-[family-name:var(--font-manrope)] text-lg font-semibold text-foreground">
            Strata documents
          </h2>
          <p>
            Strata bundles may contain personal information about other owners or
            residents. You should only upload documents you have permission or a
            lawful reason to use for your due diligence. {NO_TRAINING_STATEMENT}
          </p>
        </section>

        <section>
          <h2 className="font-[family-name:var(--font-manrope)] text-lg font-semibold text-foreground">
            Cross-border processing
          </h2>
          <p>
            We use cloud providers (including Google Firebase, Document AI, and
            Gemini) that may process data outside Australia. See subprocessors in
            your deployment environment before production use.
          </p>
        </section>

        <section>
          <h2 className="font-[family-name:var(--font-manrope)] text-lg font-semibold text-foreground">
            Your choices
          </h2>
          <p>
            You may request deletion of uploaded documents and extracted analysis.
            Contact support through your deployment administrator. Retention
            controls will be expanded in future releases.
          </p>
        </section>

        <p className="text-xs">{PRODUCT_POSITIONING} {MASTER_DISCLAIMER}</p>
      </div>
    </div>
  );
}
