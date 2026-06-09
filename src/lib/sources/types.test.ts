import { describe, expect, it } from "vitest";
import { dataSourceToLabel } from "./types";

describe("dataSourceToLabel", () => {
  it("maps demo scans", () => {
    expect(dataSourceToLabel("demo")).toBe("demo_sample");
  });

  it("maps database scans as seeded sample in testing", () => {
    expect(dataSourceToLabel("database", true)).toBe("seeded_sample");
    expect(dataSourceToLabel("database", false)).toBe("public_record");
  });
});
