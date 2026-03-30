import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

const apiOrigin = (() => {
  const apiUrl = process.env.NEXT_PUBLIC_BASE_API_URL;
  if (!apiUrl) return "";

  try {
    return new URL(apiUrl).origin;
  } catch {
    return "";
  }
})();

const connectSrc = ["'self'", "https:"];

if (apiOrigin) {
  connectSrc.push(apiOrigin);
}

if (isDev) {
  connectSrc.push("http:", "ws:", "wss:");
} else {
  connectSrc.push("wss:");
}

const cspDirectives = [
  "default-src 'self'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "form-action 'self'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data: https:",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline' https:",
  `connect-src ${connectSrc.join(" ")}`,
  "worker-src 'self' blob:",
  "frame-src 'none'",
]
  .join("; ")
  .replace(/\s{2,}/g, " ")
  .trim();

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: cspDirectives,
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
  {
    key: "Cross-Origin-Opener-Policy",
    value: "same-origin",
  },
  {
    key: "X-DNS-Prefetch-Control",
    value: "off",
  },
];

if (!isDev) {
  securityHeaders.push({
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains; preload",
  });
}

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
