/** @type {import('next').NextConfig} */
const withAntdLess = require("next-plugin-antd-less");
const cron = require("node-cron");
const AppBsreSeal = require("./models/app_bsre_seal.model");
const { refreshSealActivationTotp } = require("./utils/esign-utils");
const withTM = require("next-transpile-modules")(["lodash-es"]);

const isProd = process.env.NODE_ENV === "production";

// cron every 5 seconds with scheduler
cron.schedule("*/10 * * * *", async () => {
  // check id_subscriber and totp_activation_code
  const result = await AppBsreSeal.query().first();

  if (!result) {
    return;
  } else {
    const id_subscriber = result?.id_subscriber;
    const totp_activation_code = result?.totp_activation_code;

    const response = await refreshSealActivationTotp({
      idSubscriber: id_subscriber,
      totp: totp_activation_code,
    });

    if (response?.success && response?.data?.totp) {
      const currentData = response?.data;
      await AppBsreSeal.query().patchAndFetchById(result.id, {
        totp_activation_code: currentData?.totp,
      });
      console.log("Refresh seal activation totp success");
    } else {
      console.log("Refresh seal activation totp failed");
    }
  }
});

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

module.exports = withTM({
  i18n: {
    locales: ["en"],
    defaultLocale: "en",
  },
  experimental: {
    scrollRestoration: true,
    // esmExternals: "loose",
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
  // modifyVars: { "@primary-color": "#52c41a" }, // optional
  // lessVarsFilePath: "./src/styles/variables.less", // optional
  // lessVarsFilePathAppendToEndOfContent: false, // optional
  cssLoaderOptions: {
    // ...
    mode: "local",
    localIdentName:
      process.env.NODE_ENV === "development"
        ? "[local]--[hash:base64:4]"
        : "[hash:base64:8]", // invalid! for Unify getLocalIdent (Next.js / CRA), Cannot set it, but you can rewritten getLocalIdentFn
    exportLocalsConvention: "camelCase",
    exportOnlyLocals: false,
    // ...
    getLocalIdent: (context, localIdentName, localName, options) => {
      return "whatever_random_class_name";
    },
  },

  // for Next.js ONLY
  nextjs: {
    localIdentNameFollowDev: true, // default false, for easy to debug on PROD mode
  },

  // Other Config Here...

  webpack(config, { buildId, dev, isServer, defaultLoaders, webpack }) {
    const rules = config.module.rules
      .find((rule) => typeof rule.oneOf === "object")
      .oneOf.filter((rule) => Array.isArray(rule.use));

    if (!isServer) {
      config.optimization = {
        sideEffects: false,
      };
    }

    if (isProd)
      rules.forEach((rule) => {
        rule.use.forEach((moduleLoader) => {
          if (
            moduleLoader.loader?.includes("css-loader") &&
            !moduleLoader.loader?.includes("postcss-loader")
          )
            moduleLoader.options.modules.getLocalIdent = hashOnlyIdent;

          // earlier below statements were sufficient:
          // delete moduleLoader.options.modules.getLocalIdent;
          // moduleLoader.options.modules.localIdentName = '[hash:base64:6]';
        });
      });

    return config;
  },
});
