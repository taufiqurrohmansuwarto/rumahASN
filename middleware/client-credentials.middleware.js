const ClientOAuth2 = require("client-oauth2");

module.exports = async (req, res, next) => {
  try {
    const masterOAuth = new ClientOAuth2({
      clientId: process.env.MASTER_CLIENT_ID,
      clientSecret: process.env.MASTER_CLIENT_SECRET,
      accessTokenUri: process.env.MASTER_ACCESS_TOKEN_URI,
    });

    const token = await masterOAuth.credentials.getToken();
    req.token = token.accessToken;
    next();
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Something went wrong, please try again later." });
  }
};
