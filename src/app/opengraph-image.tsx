import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "CMAC Beauty — at-home beauty devices, curated in Montréal";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Dynamic OG image (no photo yet — typographic card on the brand gradient). */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "linear-gradient(135deg, #F5F1EA 0%, #EDE6DA 55%, #E4A48E 100%)",
          fontFamily: "Georgia, 'Times New Roman', serif",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: -120,
            top: -160,
            width: 520,
            height: 520,
            borderRadius: 999,
            background: "linear-gradient(135deg, #E4A48E, #D9B370)",
            opacity: 0.6,
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: 90,
            bottom: 70,
            width: 300,
            height: 300,
            borderRadius: 999,
            border: "2px dashed rgba(74,93,78,0.45)",
            display: "flex",
          }}
        />
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", width: 760, padding: 84 }}>
          <div style={{ display: "flex", fontSize: 22, letterSpacing: 7, textTransform: "uppercase", color: "#C97B63", fontFamily: "sans-serif", fontWeight: 600 }}>
            CMAC BEAUTY · MONTRÉAL
          </div>
          <div style={{ display: "flex", marginTop: 24, fontSize: 84, lineHeight: 1.02, color: "#1F2422" }}>Skin that looks rested.</div>
          <div style={{ display: "flex", marginTop: 30, fontSize: 27, color: "#3B423F", fontFamily: "sans-serif" }}>
            LED · microcurrent · EMS · ice roller — the 10-minute evening ritual, shipped across Canada.
          </div>
          <div style={{ display: "flex", marginTop: 34, fontSize: 22, color: "#4A5D4E", fontFamily: "sans-serif", fontWeight: 600 }}>cmacbeauty.ca</div>
        </div>
      </div>
    ),
    size,
  );
}
