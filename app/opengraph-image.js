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
          marginTop: 28,
          fontSize: 28,
          color: "rgba(236,231,219,0.75)",
          letterSpacing: "0.02em",
        }}
      >
        paste anything. arrange it your way. cache it.
      </div>

      <div
        style={{
          display: "flex",
          gap: 14,
          marginTop: 44,
        }}
      >
        <div style={{ width: 22, height: 22, backgroundColor: LAVENDER }} />
        <div style={{ width: 22, height: 22, backgroundColor: BUTTER }} />
        <div style={{ width: 22, height: 22, backgroundColor: PINK }} />
      </div>
    </div>,
    { ...size },
  );
}
