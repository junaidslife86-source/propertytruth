import type { LinkedStrataDocument } from "@/lib/firebase/strata-cases";
import type { PassportArea, PassportAreaStatus } from "@/lib/passport/build";

export function buildStrataPassportArea(
  linked: LinkedStrataDocument[],
  isApartment: boolean,
): PassportArea {
  if (linked.length === 0) {
    if (!isApartment) {
      return {
        id: "strata",
        label: "Strata reviewed",
        status: "not_applicable",
        statusLabel: "Not applicable",
      };
    }
    return {
      id: "strata",
      label: "Strata reviewed",
      status: "not_started",
      statusLabel: "Not started",
      detail: "Upload your strata report to link findings here.",
    };
  }

  const primary = linked[0]!;
  const complete = primary.processingStatus === "complete";

  let status: PassportAreaStatus = "in_progress";
  let statusLabel = "Processing…";

  if (complete) {
    if (primary.highSeverityCount > 0) {
      status = "needs_review";
      statusLabel = `${primary.highSeverityCount} red flag${primary.highSeverityCount === 1 ? "" : "s"} — review`;
    } else if (primary.findingCount > 0) {
      status = "needs_review";
      statusLabel = `${primary.findingCount} finding${primary.findingCount === 1 ? "" : "s"} to review`;
    } else {
      status = "complete";
      statusLabel = "Reviewed — no high flags";
    }
  } else if (primary.processingStatus === "failed") {
    status = "needs_review";
    statusLabel = "Processing failed";
  }

  const detail =
    primary.summary?.headline ??
    (complete
      ? `${primary.findingCount} findings from ${primary.filename}`
      : `Analysing ${primary.filename}`);

  return {
    id: "strata",
    label: "Strata reviewed",
    status,
    statusLabel,
    detail,
    href: `/strata/${primary.id}`,
  };
}
