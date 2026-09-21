// Google Merchant Center product feed, French (Québec). Scheduled fetch: https://cmacbeauty.ca/feeds/google-fr.xml
import { buildGoogleFeed } from "@/lib/feed";

export const revalidate = 3600;

export function GET() {
  return buildGoogleFeed("fr");
}
