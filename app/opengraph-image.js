import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt =
  "cache — a moodboard tool that pastes, drags, and styles like you actually think.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const GRAPHITE = "#1c1b19";
const BONE = "#fbfcf5";
const LAVENDER = "#c9bce0";
const BUTTER = "#f5e6a8";
const PINK = "#f0bfd0";
const INK = "#0d0d0c";

// the exact patch mark from CacheBoard.jsx (same rect, same "2 3" stitch
// dashes, same corner tacks, same ⌘v), embedded as a data-URI <img> rather
// than inline <svg> — ImageResponse (satori under the hood) renders <img>
// reliably; raw inline <svg> support is inconsistent, so this is the safe
// way to drop the real mark into a generated OG image.
const patchMarkSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 44" width="64" height="44">
  <rect x="1" y="1" width="62" height="42" rx="3" fill="#ffffff" stroke="${INK}" stroke-width="1"/>
  <rect x="7" y="7" width="50" height="30" rx="2" fill="none" stroke="${INK}" stroke-width="1.4" stroke-dasharray="2 3" stroke-linecap="round"/>
  <path d="M1,4 L7,4 M4,1 L4,7" stroke="${INK}" stroke-width="1.3"/>
  <path d="M57,4 L63,4 M60,1 L60,7" stroke="${INK}" stroke-width="1.3"/>
  <path d="M1,40 L7,40 M4,37 L4,43" stroke="${INK}" stroke-width="1.3"/>
  <path d="M57,40 L63,40 M60,37 L60,43" stroke="${INK}" stroke-width="1.3"/>
  <text x="32" y="26" text-anchor="middle" font-family="DejaVu Sans" font-weight="bold" font-size="9" fill="${INK}">&#8984;<tspan font-family="DejaVu Sans Mono">v</tspan></text>
</svg>
`.trim();

const patchMarkDataUri = `data:image/svg+xml;base64,${btoa(patchMarkSvg)}`;

export default function Image() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: GRAPHITE,
        backgroundImage:
          "linear-gradient(rgba(236,231,219,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(236,231,219,0.06) 1px, transparent 1px)",
        backgroundSize: "48px 48px, 48px 48px",
        position: "relative",
      }}
    >
      {/* corner bracket marks, echoing the app's selection-bracket motif */}
      <div
        style={{
          position: "absolute",
          top: 48,
          left: 48,
          width: 40,
          height: 40,
          borderTop: `3px solid ${LAVENDER}`,
          borderLeft: `3px solid ${LAVENDER}`,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 48,
          right: 48,
          width: 40,
          height: 40,
          borderBottom: `3px solid ${LAVENDER}`,
          borderRight: `3px solid ${LAVENDER}`,
        }}
      />

      {/* logo + wordmark, side by side */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: 44,
        }}
      >
        <img
          src={patchMarkDataUri}
          width={220}
          height={151}
          style={{ display: "flex" }}
        />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 120,
              fontWeight: 700,
              letterSpacing: "0.06em",
              color: BONE,
            }}
          >
            CACHE
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 20,
              fontSize: 28,
              color: "rgba(236,231,219,0.75)",
              letterSpacing: "0.02em",
            }}
          >
            paste anything. arrange it your way. cache it.
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 14, marginTop: 44 }}>
        <div style={{ width: 22, height: 22, backgroundColor: LAVENDER }} />
        <div style={{ width: 22, height: 22, backgroundColor: BUTTER }} />
        <div style={{ width: 22, height: 22, backgroundColor: PINK }} />
      </div>
    </div>,
    { ...size },
  );
}
