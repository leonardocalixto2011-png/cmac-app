import { describe, expect, it } from "vitest";
import { splitDescription } from "@/lib/description";

describe("splitDescription", () => {
  it("separates the opening text from one section per heading", () => {
    const { intro, sections } = splitDescription("<p>Hello</p><h3>How to use</h3><ol><li>One</li></ol><h3>Good to know</h3><ul><li>Two</li></ul><p>End</p>");
    expect(intro).toBe("<p>Hello</p>");
    expect(sections).toEqual([
      { title: "How to use", html: "<ol><li>One</li></ol>" },
      { title: "Good to know", html: "<ul><li>Two</li></ul><p>End</p>" },
    ]);
  });

  it("keeps a description with no heading whole", () => {
    expect(splitDescription("<p>Only text</p>")).toEqual({ intro: "<p>Only text</p>", sections: [] });
  });

  it("drops markup inside a heading from its title", () => {
    expect(splitDescription('<h3 class="x"><em>Care</em></h3><p>Wash</p>').sections[0].title).toBe("Care");
  });
});
