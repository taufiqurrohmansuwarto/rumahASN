// create zoom middleware
import axios from "axios";

const zoomMiddleware = async (req, res, next) => {
  try {
    const accountId = process.env.ZOOM_ACCOUNT_ID;
    const clientId = process.env.ZOOM_CLIENT_ID;
    const clientSecret = process.env.ZOOM_CLIENT_SECRET;

    const result = await axios.post(
      `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${accountId}`,
      null,
      {
        headers: {
          Authorization: `Basic ${Buffer.from(
            `${clientId}:${clientSecret}`
          ).toString("base64")}`,
        },
      }
    );

    const { access_token } = result.data;
    const zoomApi = axios.create({
      baseURL: "https://api.zoom.us/v2",
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    req.zoomFetcher = zoomApi;
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};

export default zoomMiddleware;
