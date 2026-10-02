import { ImageResponse } from "next/og";
import { articleBySlug, JOURNAL_SLUGS } from "@/content/journal";

export const runtime = "nodejs";
export const contentType = "image/png";
export const alt = "CMAC Beauty — buying guide";

/**
 * 2:3 on purpose. The guides are gift guides, and the place gift guides get
 * saved and re-shared is Pinterest, which ranks tall images and buries wide
 * ones. Before this file the guide pages emitted no og:image at all, so saving
 * one produced nothing worth looking at.
 */
export const size = { width: 1000, height: 1500 };

export function generateStaticParams() {
  return JOURNAL_SLUGS.map((slug) => ({ slug }));
}

const CREAM = "#F5F1EA";
const INK = "#1F2422";
const TERRA = "#C97B63";
const SAGE = "#4A5D4E";
const PEACH = "#E4A48E";

/** Long titles have to shrink or they overflow the card. */
const titleSize = (n: number) => (n > 72 ? 68 : n > 52 ? 80 : n > 34 ? 94 : 108);

export default async function JournalOgImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  // The slug is shared by both locales; the English copy is the canonical one.
  const a = articleBySlug("en", slug);
  const title = a?.title ?? "CMAC Beauty";
  const answer = a?.answer ?? "";
  // First sentence only — the whole answer never fits and reads badly cropped.
  const line = answer.split(/(?<=\.)\s/)[0]?.slice(0, 150) ?? "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: `linear-gradient(160deg, ${CREAM} 0%, #EDE6DA 58%, ${PEACH} 100%)`,
          fontFamily: "Georgia, 'Times New Roman', serif",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: -150,
            top: -180,
            width: 560,
            height: 560,
            borderRadius: 999,
            background: `linear-gradient(135deg, ${PEACH}, #D9B370)`,
            opacity: 0.55,
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: -120,
            bottom: 180,
            width: 360,
            height: 360,
            borderRadius: 999,
            border: `2px dashed rgba(74,93,78,0.40)`,
            display: "flex",
          }}
        />

        <div style={{ display: "flex", flexDirection: "column", flex: 1, padding: 90, justifyContent: "center" }}>
          <div
            style={{
              display: "flex",
              fontSize: 26,
              letterSpacing: 8,
              textTransform: "uppercase",
              color: TERRA,
              fontFamily: "sans-serif",
              fontWeight: 600,
            }}
          >
            BUYING GUIDE
          </div>

          <div style={{ display: "flex", marginTop: 34, fontSize: titleSize(title.length), lineHeight: 1.04, color: INK }}>{title}</div>

          <div style={{ display: "flex", marginTop: 40, width: 120, height: 4, background: TERRA }} />

          {line ? (
            <div style={{ display: "flex", marginTop: 40, fontSize: 32, lineHeight: 1.42, color: "#3B423F", fontFamily: "sans-serif" }}>{line}</div>
          ) : null}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 90px 80px 90px",
          }}
        >
          <div style={{ display: "flex", fontSize: 30, letterSpacing: 6, color: INK, fontFamily: "sans-serif", fontWeight: 600 }}>CMACBEAUTY.CA</div>
          <div style={{ display: "flex", fontSize: 24, color: SAGE, fontFamily: "sans-serif" }}>Montréal · Canada</div>
        </div>
      </div>
    ),
    size,
  );
}
