import { ImageResponse } from "next/og";
import { LOGO_MARK_DATA_URI } from "@/lib/brand";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// iOS ignores transparency, so the mark sits on an opaque violet panel.
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #1e1b4b 0%, #0a0a0b 100%)",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={LOGO_MARK_DATA_URI} width={130} height={130} alt="" />
      </div>
    ),
    { ...size },
  );
}
