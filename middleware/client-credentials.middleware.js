const { default: axios } = require("axios");
const ClientOAuth2 = require("client-oauth2");

const clientId = process.env.CLIENT_ID_CC;
const clientSecret = process.env.CLIENT_SECRET_CC;

module.exports = async (req, res, next) => {
  try {
    const masterOAuth = new ClientOAuth2({
      clientId,
      clientSecret,
      scopes: ["pemprov"],
      accessTokenUri: "https://siasn.bkd.jatimprov.go.id/oidc-master/token",
    });

    const token = await masterOAuth.credentials.getToken();

    req.clientCredentialsFetcher = axios.create({
      baseURL: process.env.APIGATEWAY_URL,
      headers: {
        Authorization: `Bearer ${token.accessToken}`,
      },
    });

    next();
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Something went wrong, please try again later." });
  }
};
