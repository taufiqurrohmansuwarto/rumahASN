const { default: axios } = require("axios");
const fs = require("fs");
const path = require("path");
const ssoToken = require("../sso_token.json");
const a = require("../utils/siasn-fetcher");
const https = require("https");

const baseUrl = "https://apimws.bkn.go.id:8243/apisiasn/1.0";
const CURRENT_DIRECTORY = process.cwd();

const siasnWsAxios = axios.create({
  baseURL: baseUrl,
  httpsAgent: new https.Agent({
    secureProtocol: "TLS_method",
  }),
});

const getoken = async () => {
  const wso2 = await a.wso2Fetcher();

  const sso = ssoToken?.token;

  const result = {
    sso_token: sso,
    wso_token: wso2,
  };

  return result;
};

const requestHandler = async (request) => {
  try {
    // cek kalau ada file token.json
    const filePath = path.join(CURRENT_DIRECTORY, "token.json");

    const ifExists = fs.existsSync(filePath);

    if (ifExists) {
      const token = JSON.parse(fs.readFileSync(filePath, "utf8"));
      const sso_token = token?.sso_token;
      const wso_token = token?.wso_token;

      request.headers.Authorization = `Bearer ${wso_token}`;
      request.headers.Auth = `bearer ${sso_token}`;

      return request;
    } else {
      const token = await getoken();
      const sso_token = token?.sso_token;
      const wso_token = token?.wso_token;

      request.headers.Authorization = `Bearer ${wso_token}`;
      request.headers.Auth = `bearer ${sso_token}`;

      console.log("token.json created, di request handler");
      fs.writeFileSync(filePath, JSON.stringify(token));

      return request;
    }
  } catch (error) {
    console.log({ error: error?.response });
  }
};

const responseHandler = async (response) => {
  return response;
};

const errorHandler = async (error) => {
  const filePath = path.join(CURRENT_DIRECTORY, "token.json");

  // cek kalau ada file token.json
  const ifExists = fs.existsSync(filePath);

  const invalidJwt =
    error?.response?.data?.message === "invalid or expired jwt";

  const runtimeError = error?.response?.data?.message === "Runtime Error";

  const tokenError = error?.response?.data?.data === "Token SSO mismatch";

  const invalidCredentials =
    error?.response?.data?.message === "Invalid Credentials";

  const notValid =
    invalidJwt || invalidCredentials || tokenError || runtimeError;

  if (ifExists && notValid) {
    // hapus file token.json
    fs.unlinkSync(filePath);
    console.log("token.json deleted");
    return Promise.reject(error?.response?.data);
  } else {
    return Promise.reject(error?.response?.data);
  }
};

siasnWsAxios.interceptors.request.use(
  (request) => {
    return requestHandler(request);
  },
  (error) => {
    return errorHandler(error);
  }
);

siasnWsAxios.interceptors.response.use(
  (response) => responseHandler(response),
  (error) => errorHandler(error)
);

const siasnMiddleware = async (req, res, next) => {
  try {
    req.siasnRequest = siasnWsAxios;
    next();
  } catch (error) {
    res.status(500).json({ message: "error" });
  }
};

module.exports = {
  siasnMiddleware,
  siasnWsAxios,
};
