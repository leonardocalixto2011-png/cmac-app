import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "CMAC Beauty — LED red light mask, $59.99, shipped across Canada";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * The card every link to the site shows on Facebook, Messenger and LinkedIn.
 *
 * It used to be an English sentence on a gradient, with no product. The first
 * boosted post proved that wrong twice over: the post was written in French,
 * and 54% of the people who saw it were 55 or older — an audience that was
 * shown an English slogan and no object. Facebook's own tip on the same screen
 * was "posts with links perform better if they include a photo".
 *
 * So the card is now the product and its price, with almost no prose. A photo
 * and a number read the same in French and in English, which is the only way
 * one static image can serve a bilingual market honestly.
 */
// f_jpg, not f_jpeg — Cloudinary answers 400 on the latter, and a failed fetch
// here renders an empty half-card rather than an error.
const MASK = "https://res.cloudinary.com/dmlolrov/image/upload/c_fill,w_620,h_700/f_jpg/q_auto/v1790013183/cmac/products/led-red-light-mask/final-0";

const CREAM = "#F5F1EA";
const INK = "#1F2422";
const TERRA = "#C97B63";
const SAGE = "#4A5D4E";
const PEACH = "#E4A48E";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: `linear-gradient(135deg, ${CREAM} 0%, #EDE6DA 60%, ${PEACH} 100%)`,
          fontFamily: "Georgia, 'Times New Roman', serif",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: -110,
            bottom: -150,
            width: 420,
            height: 420,
            borderRadius: 999,
            border: `2px dashed rgba(74,93,78,0.35)`,
            display: "flex",
          }}
        />

        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", width: 640, padding: "0 0 0 80px" }}>
          <div
            style={{
              display: "flex",
              fontSize: 23,
              letterSpacing: 7,
              textTransform: "uppercase",
              color: TERRA,
              fontFamily: "sans-serif",
              fontWeight: 600,
            }}
          >
            CMAC BEAUTY · MONTRÉAL
          </div>

          <div style={{ display: "flex", marginTop: 26, fontSize: 112, lineHeight: 1, color: INK }}>59,99 $</div>

          <div style={{ display: "flex", marginTop: 14, fontSize: 34, color: "#3B423F", fontFamily: "sans-serif" }}>
            Masque DEL · LED mask
          </div>

          <div style={{ display: "flex", marginTop: 30, width: 110, height: 4, background: TERRA }} />

          {/* No sentence here on purpose: anything longer than a word picks a
              language, and this one card is served to both. */}
          <div style={{ display: "flex", marginTop: 30, fontSize: 24, color: SAGE, fontFamily: "sans-serif" }}>
            Canada
          </div>

          <div style={{ display: "flex", marginTop: 26, fontSize: 23, letterSpacing: 5, color: INK, fontFamily: "sans-serif", fontWeight: 600 }}>
            CMACBEAUTY.CA
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={MASK} alt="" width={400} height={452} style={{ objectFit: "cover", borderRadius: 24 }} />
        </div>
      </div>
    ),
    size,
  );
}
