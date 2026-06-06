import type {
  Inspection,
  InspectionItem,
  InspectionSummary,
} from "@/lib/inspection/schemas";
import { CHECKLIST_BY_TYPE } from "@/lib/inspection/checklists";

function allItems(inspection: Inspection): InspectionItem[] {
  return inspection.rooms.flatMap((r) => r.items);
}

export function calculateReadinessScore(items: InspectionItem[]): number {
  if (!items.length) return 0;

  const total = items.length;
  let score = 100;

  for (const item of items) {
    switch (item.severity) {
      case "major":
        score -= 18;
        break;
      case "minor":
        score -= 7;
        break;
      case "not_checked":
        score -= 4;
        break;
      case "ok":
        break;
    }
  }

  const checked = items.filter((i) => i.severity !== "not_checked").length;
  const completionRatio = checked / total;
  score = Math.round(score * (0.55 + completionRatio * 0.45));

  return Math.max(0, Math.min(100, score));
}

export function generateInspectionSummary(
  inspection: Inspection,
): InspectionSummary {
  const items = allItems(inspection);
  const defs = CHECKLIST_BY_TYPE[inspection.propertyType];

  const topConcerns = items
    .filter((i) => i.severity === "major" || i.severity === "minor")
    .sort((a, b) => {
      const rank = { major: 0, minor: 1, ok: 2, not_checked: 3 };
      return rank[a.severity] - rank[b.severity];
    })
    .slice(0, 5)
    .map((i) => {
      const room = inspection.rooms.find((r) =>
        r.items.some((item) => item.id === i.id),
      );
      const prefix = room
        ? `${room.roomType.replace("_", " ")}: `
        : "";
      const note = i.notes.trim() ? ` — ${i.notes.trim()}` : "";
      return `${prefix}${i.label} (${i.severity === "major" ? "major concern" : "minor concern"})${note}`;
    });

  const missedChecks = items
    .filter((i) => i.severity === "not_checked")
    .map((i) => i.label);

  const followUpQuestions: string[] = [];

  for (const item of items) {
    if (item.severity !== "ok") {
      const defKey = item.key.split("-").slice(1).join("-");
      const def = defs.find((d) => d.key === defKey);
      if (def?.followUpQuestion && !followUpQuestions.includes(def.followUpQuestion)) {
        followUpQuestions.push(def.followUpQuestion);
      }
    }
  }

  if (missedChecks.length > 0) {
    followUpQuestions.push(
      `I could not check ${missedChecks.length} item(s) during the inspection — can you provide documentation or arrange access to review them?`,
    );
  }

  if (inspection.propertyType === "apartment") {
    followUpQuestions.push(
      "Can you share the most recent strata minutes, financials, and any special levy notices?",
    );
  }

  followUpQuestions.push(
    "Are there any known defects, works orders, or insurance claims affecting the property?",
  );

  const checkedCount = items.filter((i) => i.severity !== "not_checked").length;

  return {
    readinessScore: calculateReadinessScore(items),
    topConcerns,
    missedChecks,
    followUpQuestions: followUpQuestions.slice(0, 6),
    checkedCount,
    totalCount: items.length,
  };
}

export function getInspectionProgress(inspection: Inspection): number {
  const items = allItems(inspection);
  if (!items.length) return 0;
  const checked = items.filter((i) => i.severity !== "not_checked").length;
  return Math.round((checked / items.length) * 100);
}
