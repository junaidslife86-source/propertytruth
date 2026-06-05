import { ETL_CONFIG } from "../config";
import { log } from "./logger";

export async function withRetry<T>(
  fn: () => Promise<T>,
  label: string,
  maxRetries = ETL_CONFIG.maxRetries,
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      log("warn", `${label} failed`, { attempt, error: String(err) });
      if (attempt < maxRetries) {
        await new Promise((r) =>
          setTimeout(r, ETL_CONFIG.retryDelayMs * attempt),
        );
      }
    }
  }
  throw lastError;
}
