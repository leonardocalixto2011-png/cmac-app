// Google Merchant Center product feed, English. Scheduled fetch: https://cmacbeauty.ca/feeds/google.xml
import { buildGoogleFeed } from "@/lib/feed";

export const revalidate = 3600;

export function GET() {
  return buildGoogleFeed("en");
}
