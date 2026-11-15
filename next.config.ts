import type { NextConfig } from "next";
import { ADMIN_PATH } from "./src/lib/admin-routes";

const nextConfig: NextConfig = {
  // Next sets PORT to the actual listening port before loading server config.
  // Each dev server needs its own output; another compiler can delete chunks.
  distDir: process.env.NODE_ENV === "development" ? `.next-dev/${process.env.PORT || "3000"}` : ".next",
  poweredByHeader: false,
  async headers() {
    return [
      { source: "/:path*", headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ...(process.env.NODE_ENV === "production" ? [{ key: "Strict-Transport-Security", value: "max-age=31536000" }] : []),
      ] },
      { source: `${ADMIN_PATH}/:path*`, headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
      { source: "/api/admin/:path*", headers: [{ key: "Cache-Control", value: "no-store, private" }, { key: "X-Robots-Tag", value: "noindex, nofollow" }] },
    ];
  },
  images: {
    qualities: [75, 90],
  },
};

export default nextConfig;
