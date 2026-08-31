import { ImageResponse } from "next/og";

// Same reason as the other article: LinkedIn will not render a link preview without an
// og:image. Generated rather than checked in as a PNG so the text stays in sync.
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt =
  "The pipeline you load is not the pipeline you saved — Alex Castillo González";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#fafaf9",
          padding: "80px",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 26,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "#78716c",
            }}
          >
            Haystack · 254 components audited · 8 settings lost
          </div>
          <div
            style={{
              fontSize: 76,
              lineHeight: 1.1,
              color: "#1c1917",
              marginTop: 36,
            }}
          >
            The pipeline you load is not the pipeline you saved
          </div>
          <div
            style={{
              fontSize: 34,
              lineHeight: 1.35,
              color: "#57534e",
              marginTop: 32,
            }}
          >
            If __init__ takes a parameter that to_dict never writes down,
            nothing raises. The value just reverts.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 26,
            color: "#78716c",
            borderTop: "2px solid #e7e5e4",
            paddingTop: 28,
          }}
        >
          <div>Alex Castillo González</div>
          <div>Applied AI Engineer · Python / LLM</div>
        </div>
      </div>
    ),
    size,
  );
}
