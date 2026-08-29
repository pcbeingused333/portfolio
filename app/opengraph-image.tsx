import { ImageResponse } from "next/og";

// Same reason as the write-up's: without an og:image LinkedIn renders no preview
// card at all, and the portfolio link is shared more often than any single page.
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Alex Castillo González — Applied AI Engineer (Python, LLM)";

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
          <div style={{ fontSize: 72, lineHeight: 1.1, color: "#1c1917" }}>
            Alex Castillo González
          </div>
          <div style={{ fontSize: 38, color: "#57534e", marginTop: 24 }}>
            Applied AI Engineer · Python / LLM
          </div>
          <div
            style={{
              fontSize: 32,
              lineHeight: 1.4,
              color: "#57534e",
              marginTop: 40,
            }}
          >
            RAG over regulated text with citations you can check, agents on AWS,
            and the evaluation layer that decides whether either survives real
            users.
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
          <div>5 merged fixes in Haystack · deepset</div>
          <div>Remote · UTC−4</div>
        </div>
      </div>
    ),
    size,
  );
}
