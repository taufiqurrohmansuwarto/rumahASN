const { ssoFetcher, wso2Fetcher } = require("@/utils/siasn-fetcher");
const { default: axios } = require("axios");
const fs = require("fs");
const path = require("path");

const baseUrl = "https://apimws.bkn.go.id:8243/apisiasn/1.0";
const CURRENT_DIRECTORY = process.cwd();

const siasnWsAxios = axios.create({
  baseURL: baseUrl,
});

const getoken = async () => {
  const sso = await ssoFetcher();
  const wso2 = await wso2Fetcher();

  const result = {
    sso_token: sso,
    wso_token: wso2,
  };

  return result;
};

const requestHandler = async (request) => {
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

    return request;
  }
};

const responseHandler = async (response) => {
  const filePath = path.join(CURRENT_DIRECTORY, "token.json");

  const authorizationHeaders = response.config.headers;
  const sso_token = authorizationHeaders?.Auth?.split(" ")[1];
  const wso_token = authorizationHeaders?.Authorization?.split(" ")[1];

  const token = {
    sso_token,
    wso_token,
  };

  fs.writeFileSync(filePath, JSON.stringify(token));

  return response;
};

const errorHandler = async (error) => {
  const filePath = path.join(CURRENT_DIRECTORY, "token.json");

  // hapus file token.json
  fs.unlinkSync(filePath);

  return Promise.reject(error?.response?.data);
};

siasnWsAxios.interceptors.request.use(
  (request) => requestHandler(request),
  (error) => errorHandler(error)
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
    console.log(error);
    res.status(500).json({ message: "error" });
  }
};

module.exports = {
  siasnMiddleware,
};
