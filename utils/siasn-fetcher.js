import axios from "axios";
const qs = require("query-string");

const clientId = process.env.CLIENT_ID;
const nip = process.env.SSO_NIP;
const password = process.env.SSO_PASSWORD;

const clientIdWso2 = process.env.CLIENT_ID_WSO2;
const clientSecretWso2 = process.env.CLIENT_SECRET_WSO2;

export const ssoFetcher = async () => {
  try {
    const data = {
      client_id: clientId,
      username: nip,
      password: password,
      grant_type: "password",
    };

    const url =
      "https://sso-siasn.bkn.go.id/auth/realms/public-siasn/protocol/openid-connect/token";

    const quryString = qs.stringify(data);

    const result = await axios.post(url, quryString, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: quryString,
      url,
    });

    const token = result?.data?.access_token;

    return token;
  } catch (error) {
    console.log(error);
  }
};

export const wso2Fetcher = async () => {
  try {
    const clientId = clientIdWso2;
    const clientSecret = clientSecretWso2;

    const data = {
      grant_type: "client_credentials",
    };

    const url = "https://apimws.bkn.go.id/oauth2/token";

    const auth = {
      username: clientId,
      password: clientSecret,
    };

    const queryString = qs.stringify(data);

    const result = await axios.post(url, queryString, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      auth,
      data: queryString,
      url,
    });

    const token = result?.data?.access_token;
    return token;
  } catch (error) {
    console.log(error);
  }
};
