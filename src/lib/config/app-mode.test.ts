import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { isDemoDataAllowed, isTestingMode } from "./app-mode";

describe("app-mode", () => {
  const env = { ...process.env };

  afterEach(() => {
    process.env = { ...env };
  });

  beforeEach(() => {
    delete process.env.APP_ENV;
    delete process.env.ALLOW_DEMO_DATA;
  });

  it("defaults to testing mode", () => {
    expect(isTestingMode()).toBe(true);
    expect(isDemoDataAllowed()).toBe(true);
  });

  it("disables demo in production without override", () => {
    process.env.APP_ENV = "production";
    expect(isTestingMode()).toBe(false);
    expect(isDemoDataAllowed()).toBe(false);
  });
});
