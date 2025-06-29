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
    domains: ["siasn.bkd.jatimprov.go.id", "master.bkd.jatimprov.go.id"],
    formats: ["image/webp"],
  },
  poweredByHeader: false,
  basePath: "/helpdesk",
  publicRuntimeConfig: {
    basePath: getBasePath(),
  },
};

module.exports = nextConfig;
