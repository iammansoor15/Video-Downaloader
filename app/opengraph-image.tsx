import { ImageResponse } from "next/og";
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TITLE,
  SOCIAL_IMAGE_ALT,
} from "@/lib/seo";

export const alt = SOCIAL_IMAGE_ALT;
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

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
          background:
            "linear-gradient(135deg, #09090b 0%, #18181b 48%, #172554 100%)",
          color: "#ffffff",
          padding: 64,
          fontFamily: "Arial, Helvetica, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 28,
            fontWeight: 700,
          }}
        >
          <span>{SITE_NAME}</span>
          <span
            style={{
              color: "#bfdbfe",
              fontSize: 24,
              fontWeight: 600,
            }}
          >
            MP4 + MP3 + M4A + OPUS
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              display: "flex",
              gap: 14,
              color: "#dbeafe",
              fontSize: 28,
              fontWeight: 700,
            }}
          >
            <span>YouTube</span>
            <span>Instagram</span>
            <span>Twitter/X</span>
            <span>TikTok</span>
          </div>
          <div
            style={{
              maxWidth: 980,
              fontSize: 76,
              lineHeight: 0.98,
              fontWeight: 900,
            }}
          >
            {SITE_TITLE}
          </div>
          <div
            style={{
              maxWidth: 920,
              color: "#d4d4d8",
              fontSize: 30,
              lineHeight: 1.35,
            }}
          >
            {SITE_DESCRIPTION}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            color: "#a5b4fc",
            fontSize: 28,
            fontWeight: 700,
          }}
        >
          <span>Quality up to 8K when available</span>
          <span>mansoor.website</span>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
