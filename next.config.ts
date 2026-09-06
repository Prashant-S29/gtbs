import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  agentRules: false,
  experimental: {
    cpus: 1,
    preloadEntriesOnStart: false,
    webpackMemoryOptimizations: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "plus.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "**.ufs.sh",
      },
      {
        protocol: "https",
        hostname: "utfs.io",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/shop",
        destination: "/allproducts",
        permanent: true,
      },
      {
        source: "/product",
        destination: "/allproducts",
        permanent: true,
      },
      {
        source: "/checkout",
        destination: "/cart",
        permanent: true,
      },
      {
        source: "/wishlist",
        destination: "/allproducts",
        permanent: true,
      },
      {
        source: "/login",
        destination: "/allproducts",
        permanent: true,
      },
      {
        source: "/register",
        destination: "/allproducts",
        permanent: true,
      },
      {
        source: "/profile",
        destination: "/allproducts",
        permanent: true,
      },
    ];
  },
  async headers() {
    const isPreviewDeployment = process.env.VERCEL_ENV === "preview";
    const baselineSecurityHeaders = [
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "SAMEORIGIN" },
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=()",
      },
      {
        key: "Strict-Transport-Security",
        value: "max-age=31536000; includeSubDomains",
      },
      ...(isPreviewDeployment
        ? [
            {
              key: "X-Robots-Tag",
              value: "noindex, nofollow, noarchive, nosnippet, noimageindex",
            },
          ]
        : []),
    ];
    const adminSecurityHeaders = [
      { key: "Cache-Control", value: "no-store" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Referrer-Policy", value: "no-referrer" },
      {
        key: "Content-Security-Policy",
        value: [
          "default-src 'self'",
          "base-uri 'none'",
          "connect-src 'self'",
          "font-src 'self'",
          "form-action 'self'",
          "frame-ancestors 'none'",
          "img-src 'self' data: blob: https://*.ufs.sh https://utfs.io",
          "object-src 'none'",
          `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""}`,
          "style-src 'self' 'unsafe-inline'",
        ].join("; "),
      },
    ];

    return [
      { source: "/:path*", headers: baselineSecurityHeaders },
      { source: "/admin/:path*", headers: adminSecurityHeaders },
      { source: "/api/admin/:path*", headers: adminSecurityHeaders },
    ];
  },
};

export default nextConfig;
