/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static brand/og assets are served from /public unchanged.
  // Long-cache them like the old static site did.
  async headers() {
    return [
      {
        source: "/:dir(brand|og)/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
};

export default nextConfig;
