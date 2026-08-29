import { ImageResponse } from "next/og";

// LinkedIn will not render a link preview without an og:image, and it was the one
// tag this page did not have. Generated rather than checked in as a PNG so the
// text stays in sync with the page's own title.
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt =
  "Four concurrency bugs on Haystack's async path — Alex Castillo González";

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
            Haystack · deepset · 4 merged
          </div>
          <div
            style={{
              fontSize: 76,
              lineHeight: 1.1,
              color: "#1c1917",
              marginTop: 36,
            }}
          >
            Four concurrency bugs on Haystack&apos;s async path
          </div>
          <div
            style={{
              fontSize: 34,
              lineHeight: 1.35,
              color: "#57534e",
              marginTop: 32,
            }}
          >
            An async test that never runs two things at the same time is a
            synchronous test with extra syntax.
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
