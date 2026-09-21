import { describe, expect, it } from "vitest";
import { RESET_TOKEN_TTL_MS, createResetToken, parseResetToken, randomToken, rewardCode, verifyResetToken } from "@/lib/tokens";
import { markdownToHtml } from "@/lib/markdown";

const SECRET = "test-secret";
const HASH = "$2b$12$abcdefghijklmnopqrstuvabcdefghijklmnopqrstuvwxyz0123";
const NOW = Date.UTC(2026, 8, 21, 12, 0, 0);

describe("password reset tokens", () => {
  it("verifies within the hour", () => {
    const token = createResetToken("user_1", HASH, SECRET, NOW);
    expect(verifyResetToken(token, HASH, SECRET, NOW)).toBe("ok");
    expect(verifyResetToken(token, HASH, SECRET, NOW + RESET_TOKEN_TTL_MS - 1)).toBe("ok");
  });
  it("expires after 1 hour", () => {
    const token = createResetToken("user_1", HASH, SECRET, NOW);
    expect(RESET_TOKEN_TTL_MS).toBe(60 * 60 * 1000);
    expect(verifyResetToken(token, HASH, SECRET, NOW + RESET_TOKEN_TTL_MS + 1)).toBe("expired");
  });
  it("stops working once the password has changed (single use)", () => {
    const token = createResetToken("user_1", HASH, SECRET, NOW);
    expect(verifyResetToken(token, HASH + "x", SECRET, NOW)).toBe("bad_signature");
  });
  it("rejects a token signed with another secret", () => {
    const token = createResetToken("user_1", HASH, "other", NOW);
    expect(verifyResetToken(token, HASH, SECRET, NOW)).toBe("bad_signature");
  });
  it("rejects a tampered user id or expiry", () => {
    const token = createResetToken("user_1", HASH, SECRET, NOW);
    const sig = token.split(".")[1];
    const forged = `${Buffer.from(`user_2.${NOW + RESET_TOKEN_TTL_MS}`).toString("base64url")}.${sig}`;
    expect(verifyResetToken(forged, HASH, SECRET, NOW)).toBe("bad_signature");
    const extended = `${Buffer.from(`user_1.${NOW + 10 * RESET_TOKEN_TTL_MS}`).toString("base64url")}.${sig}`;
    expect(verifyResetToken(extended, HASH, SECRET, NOW)).toBe("bad_signature");
  });
  it("rejects malformed input", () => {
    expect(verifyResetToken("", HASH, SECRET, NOW)).toBe("malformed");
    expect(verifyResetToken("abc", HASH, SECRET, NOW)).toBe("malformed");
    expect(parseResetToken("!!!.x")).toBeNull();
  });
  it("round-trips the user id (cuid-style ids contain no dots)", () => {
    const token = createResetToken("cm1abcxyz", HASH, SECRET, NOW);
    expect(parseResetToken(token)).toEqual({ userId: "cm1abcxyz", expiresAt: NOW + RESET_TOKEN_TTL_MS });
  });
});

describe("random tokens and codes", () => {
  it("are URL-safe and unique", () => {
    const a = randomToken();
    expect(a).toMatch(/^[A-Za-z0-9_-]{32}$/);
    expect(randomToken()).not.toBe(a);
  });
  it("formats reward codes as PREFIX-XXXX-XXXX without ambiguous characters", () => {
    for (let i = 0; i < 50; i++) expect(rewardCode("GLOW")).toMatch(/^GLOW-[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}$/);
  });
});

describe("campaign markdown", () => {
  it("escapes HTML and only links http(s)/mailto", () => {
    const html = markdownToHtml('<script>x</script> [ok](https://cmacbeauty.ca) [bad](javascript:alert(1)) **b**');
    expect(html).not.toContain("<script>");
    expect(html).toContain('href="https://cmacbeauty.ca"');
    expect(html).not.toContain('href="javascript');
    expect(html).toContain("<strong>b</strong>");
  });
  it("renders headings and lists", () => {
    const html = markdownToHtml("# Title\n\n- one\n- two");
    expect(html).toMatch(/<h2[^>]*>Title<\/h2>/);
    expect(html).toMatch(/<li[^>]*>one<\/li>/);
  });
});
