import { ImageResponse } from "next/og";
import { SITE_NAME } from "@/lib/site";

export const SOCIAL_IMAGE_SIZE = { width: 1200, height: 630 };
export const SOCIAL_IMAGE_CONTENT_TYPE = "image/png";

type SocialImageOptions = {
  title: string;
  description?: string;
  eyebrow?: string;
};

export function createSocialImage({
  title,
  description,
  eyebrow = "Software · Systems · Product craft",
}: SocialImageOptions): ImageResponse {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "stretch",
          background: "#eef4fa",
          color: "#12263f",
          display: "flex",
          fontFamily: "Arial, Helvetica, sans-serif",
          height: "100%",
          padding: "70px 78px",
          width: "100%",
        }}
      >
        <div
          style={{
            border: "2px solid rgba(18, 38, 63, 0.14)",
            borderRadius: 30,
            display: "flex",
            flex: 1,
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "58px 62px",
          }}
        >
          <div
            style={{
              color: "#e6538d",
              display: "flex",
              fontSize: 24,
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            {eyebrow}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div
              style={{
                display: "flex",
                fontSize: title.length > 48 ? 54 : 66,
                fontWeight: 800,
                letterSpacing: "-0.035em",
                lineHeight: 1.06,
              }}
            >
              {title}
            </div>
            {description ? (
              <div
                style={{
                  color: "rgba(18, 38, 63, 0.67)",
                  display: "flex",
                  fontSize: 27,
                  lineHeight: 1.35,
                  maxWidth: 940,
                }}
              >
                {description.length > 150
                  ? `${description.slice(0, 147)}…`
                  : description}
              </div>
            ) : null}
          </div>
          <div
            style={{
              alignItems: "center",
              display: "flex",
              fontSize: 28,
              fontWeight: 700,
              justifyContent: "space-between",
            }}
          >
            <span style={{ display: "flex" }}>{SITE_NAME}</span>
            <span style={{ color: "#397fc3", display: "flex", fontSize: 42 }}>B.</span>
          </div>
        </div>
      </div>
    ),
    SOCIAL_IMAGE_SIZE,
  );
}
