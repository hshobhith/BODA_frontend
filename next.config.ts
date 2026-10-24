import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    // Store logos/banners and product media are uploaded by sellers and can
    // live on any host (backend-hosted storage today, a CDN later). There's
    // no fixed set of domains to allowlist yet, so accept any https host,
    // plus plain http for local backend dev (e.g. http://localhost:4000/...).
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
    // Next.js 16 breaking change (confirmed live while building the seller
    // dashboard's image uploader): the image optimizer now blocks any
    // upstream host that resolves to a private/loopback IP by default (SSRF
    // hardening), which 400s with `"url" parameter is not allowed` for every
    // image served by the local backend at http://localhost:4000 — that's
    // *every* freshly-uploaded seller image in local dev, since the upload
    // endpoint returns a same-host relative/absolute path. This app's
    // backend only ever runs on a private network (local dev today, an
    // internal network later), matching exactly the case Next's own docs
    // call out as the intended use of this flag.
    dangerouslyAllowLocalIP: true,
  },
};

export default nextConfig;
