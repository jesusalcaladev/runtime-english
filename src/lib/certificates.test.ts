import { afterEach, describe, expect, it, vi } from "vitest";
import { verifyCertificate } from "./certificates";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("certificates", () => {
  it("returns missing_id for empty input", async () => {
    const res = await verifyCertificate("  ");
    expect(res.ok).toBe(false);
    expect(res.error).toBe("missing_id");
  });

  it("verifies via endpoint when configured", async () => {
    vi.stubEnv("PUBLIC_CERTIFICATE_VERIFY_URL", "https://example.test/verify");
    globalThis.fetch = vi.fn(async (url: any) => {
      const u = new URL(String(url));
      if (u.searchParams.get("id") !== "ABC123") {
        return new Response(JSON.stringify({ ok: false, error: "not_found" }), { status: 404 });
      }
      return new Response(
        JSON.stringify({
          ok: true,
          certificate: {
            id: "abc123",
            name: "Test User",
            issued_at: "2026-01-01T00:00:00.000Z",
            program: "RuntimeEnglish",
            level: "A1 — B2",
            status: "valid",
            user_id: null,
          },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    }) as any;

    const res = await verifyCertificate("abc123");
    expect(res.ok).toBe(true);
    expect(res.certificate?.id).toBe("ABC123");
    expect(res.certificate?.name).toBe("Test User");
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
  });
});
