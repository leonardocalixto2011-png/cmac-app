import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/brand";

const DISALLOW = ["/admin", "/cart", "/shop/thanks", "/api/", "/account", "/newsletter/", "/review/"];

/**
 * Assistants (ChatGPT, Claude, Perplexity, Gemini, Copilot) answer shopping
 * questions from what their crawlers can read. They are allowed here
 * explicitly, including the "extended" agents that gate AI use of the content,
 * so CMAC can be quoted with real prices and real policies. Private areas stay
 * closed for every agent.
 */
const AI_AGENTS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-User",
  "Claude-SearchBot",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "Bingbot",
  "Amazonbot",
  "meta-externalagent",
  "DuckAssistBot",
  "cohere-ai",
];

export default function robots(): MetadataRoute.Robots {
  const base = siteUrl();
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: DISALLOW },
      ...AI_AGENTS.map((userAgent) => ({ userAgent, allow: "/", disallow: DISALLOW })),
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
