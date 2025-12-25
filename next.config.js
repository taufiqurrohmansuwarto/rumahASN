/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === "production";

function getBasePath() {
  var basePath = "";

  if (isProd && process.env.BASE_PATH) {
    if (process.env.BASE_PATH.startsWith("/")) {
      basePath = process.env.BASE_PATH;
    } else {
      basePath = "/" + process.env.BASE_PATH;
    }
  }

  return basePath;
}

const hashOnlyIdent = (context, _, exportName) =>
  loaderUtils
    .getHashDigest(
      Buffer.from(
        `filePath:${path
          .relative(context.rootContext, context.resourcePath)
          .replace(/\\+/g, "/")}#className:${exportName}`
      ),
      "md4",
      "base64",
      6
    )
    .replace(/^(-?\d|--)/, "_$1");

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  i18n: {
    locales: ["en"],
    defaultLocale: "en",
  },
  experimental: {
    forceSwcTransforms: true,
    scrollRestoration: true,
    esmExternals: "loose",
  },
  images: {
    // Enable optimization dengan safety features
    domains: [
      "siasn.bkd.jatimprov.go.id",
      "master.bkd.jatimprov.go.id",
      "ui-avatars.com", // Fallback avatar service
    ],
    formats: ["image/avif", "image/webp"], // AVIF lebih kecil dari WebP
    // Cache optimizations
    minimumCacheTTL: 86400, // 24 jam cache (default: 60 detik)
    // Size optimizations
    deviceSizes: [640, 750, 828, 1080, 1200, 1920], // Responsive sizes
    imageSizes: [16, 32, 48, 64, 96, 128, 256], // Avatar & icon sizes
    // Loader configuration
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Remote patterns untuk lebih spesifik (Next.js 13+)
    remotePatterns: [
      {
        protocol: "https",
        hostname: "siasn.bkd.jatimprov.go.id",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "siasn.bkd.jatimprov.go.id",
        port: "9000",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "master.bkd.jatimprov.go.id",
        pathname: "/**",
      },
    ],
  },
  poweredByHeader: false,
  basePath: "/helpdesk",
  publicRuntimeConfig: {
    basePath: getBasePath(),
  },
};

module.exports = nextConfig;
