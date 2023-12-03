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

  console.log("file token.json ada?", ifExists);

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

  if (ifExists && invalidJwt) {
    // hapus file token.json
    fs.unlinkSync(filePath);
    console.log("token.json deleted");
    return Promise.reject(error?.response?.data);
  } else {
    return Promise.reject(error?.response?.data);
  }
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
    res.status(500).json({ message: "error" });
  }
};

module.exports = {
  siasnMiddleware,
};
