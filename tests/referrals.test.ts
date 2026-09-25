import { describe, expect, it } from "vitest";
import { isReferralCode, referralLink } from "@/lib/referrals";
import { renderReferralBonus } from "@/lib/email-templates";

describe("referral codes", () => {
  it("accepts the AMIE-XXXX shape only", () => {
    expect(isReferralCode("AMIE-7KQ2")).toBe(true);
    expect(isReferralCode("amie-7kq2")).toBe(false); // resolveReferral upper-cases first
    expect(isReferralCode("AMIE-0OI1")).toBe(false); // ambiguous glyphs never issued
    expect(isReferralCode("WELCOME10")).toBe(false);
  });

  it("builds a shareable link on the site origin", () => {
    expect(referralLink("AMIE-7KQ2")).toMatch(/\/r\/AMIE-7KQ2$/);
  });
});

describe("referral bonus email", () => {
  it("says how many points, in the member's language, without a code to type", () => {
    const fr = renderReferralBonus({ locale: "fr", name: "Camille", points: 100, balance: 250 });
    expect(fr.subject).toContain("100 points");
    expect(fr.text).toContain("Camille");
    expect(fr.text).toContain("250 points");
    expect(fr.text).not.toMatch(/CODE:/);
    const en = renderReferralBonus({ locale: "en", name: null, points: 100, balance: 100 });
    expect(en.subject).toContain("100 points");
    expect(en.text).toContain("/account");
  });
});
