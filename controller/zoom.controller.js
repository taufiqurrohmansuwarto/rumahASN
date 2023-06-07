const crypto = require("crypto");
const KJUR = require("jsrsasign");

const sdkKey = process.env.ZOOM_MEETING_SDK_KEY;
const sdkSecret = process.env.ZOOM_MEETING_SDK_SECRET;

const generateSignature = (meetingNumber, role) => {
  const iat = Math.round(new Date().getTime() / 1000) - 30;
  const exp = iat + 60 * 60 * 2;

  const oHeader = { alg: "HS256", typ: "JWT" };

  const oPayload = {
    sdkKey,
    mn: meetingNumber,
    role: role,
    iat: iat,
    exp: exp,
    appKey: sdkKey,
    tokenExp: iat + 60 * 60 * 2,
  };

  const sHeader = JSON.stringify(oHeader);
  const sPayload = JSON.stringify(oPayload);
  const signature = KJUR.jws.JWS.sign("HS256", sHeader, sPayload, sdkSecret);

  return signature;
};

module.exports.zoomIndex = async (req, res) => {
  try {
    const zoomFetcher = req.zoomFetcher;
    const result = await zoomFetcher.get("/users/me/meetings?type=live");

    res.json({ code: 200, message: "OK", result: result?.data });
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};

module.exports.listMeetings = async (req, res) => {
  try {
    const zoomFetcher = req.zoomFetcher;
    const result = await zoomFetcher.get("/users/me/meetings?type=upcoming");
    res.json(result?.data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};

module.exports.createMeeting = async (req, res) => {
  try {
  } catch (error) {}
};

module.exports.detailMeeting = async (req, res) => {
  try {
  } catch (error) {}
};

module.exports.joinMeeting = async (req, res) => {
  try {
  } catch (error) {}
};

module.exports.getSignature = async (req, res) => {
  try {
    const zoomFetcher = req.zoomFetcher;
    const meetingNumber = req?.query?.meetingNumber;
    const role = req?.query?.role;
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};
