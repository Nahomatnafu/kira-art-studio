import type { NextConfig } from "next";
const config: NextConfig = {
  distDir: process.env.KIRA_TEST_STORE === "1" ? ".next-test" : ".next",
  poweredByHeader: false,
  async headers() {
    return [
      {source:"/api/:path*",headers:[{key:"Cache-Control",value:"no-store"},{key:"X-Robots-Tag",value:"noindex, nofollow"}]},
      {source:"/admin/:path*",headers:[{key:"Cache-Control",value:"no-store"},{key:"X-Robots-Tag",value:"noindex, nofollow"}]},
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};
export default config;
